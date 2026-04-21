"""Client for a RAGFlow-backed external knowledge-base search service."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import httpx


@dataclass(frozen=True)
class ExternalKnowledgeBaseConfig:
    api_base: str
    api_key: str = ""
    search_path: str = "/api/v1/retrieval"
    timeout: float = 30.0
    dataset_ids: tuple[str, ...] = ()
    document_ids: tuple[str, ...] = ()
    similarity_threshold: float = 0.2
    vector_similarity_weight: float = 0.3
    ragflow_top_k: int = 1024


class ExternalKnowledgeBaseError(Exception):
    def __init__(self, message: str, *, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code


class ExternalKnowledgeBaseNotConfigured(ExternalKnowledgeBaseError):
    def __init__(self):
        super().__init__(
            "External knowledge base is not configured. Set EXTERNAL_KB_API_BASE.",
            status_code=400,
        )


def _join_url(api_base: str, path: str) -> str:
    base = str(api_base or "").strip()
    if not base:
        raise ExternalKnowledgeBaseNotConfigured()

    raw_path = str(path or "/api/v1/retrieval").strip() or "/api/v1/retrieval"
    if raw_path.startswith("http://") or raw_path.startswith("https://"):
        return raw_path
    return f"{base.rstrip('/')}/{raw_path.lstrip('/')}"


def _coerce_str(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    return str(value).strip()


def _coerce_float(value: Any) -> float | None:
    if value is None or value == "":
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _first_present(item: dict[str, Any], keys: tuple[str, ...]) -> Any:
    for key in keys:
        value = item.get(key)
        if value not in (None, ""):
            return value
    return None


def _clean_ids(values: list[str] | tuple[str, ...] | None) -> list[str]:
    if not values:
        return []
    return [item for item in (_coerce_str(value) for value in values) if item]


def _extract_result_items(payload: Any) -> list[Any]:
    if isinstance(payload, list):
        return payload
    if not isinstance(payload, dict):
        raise ExternalKnowledgeBaseError("External knowledge base returned an unsupported response shape.")

    direct_keys = ("results", "documents", "chunks", "items")
    for key in direct_keys:
        value = payload.get(key)
        if isinstance(value, list):
            return value

    data = payload.get("data")
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        for key in direct_keys:
            value = data.get(key)
            if isinstance(value, list):
                return value

    raise ExternalKnowledgeBaseError("External knowledge base response did not include a result list.")


def _ragflow_doc_name_by_id(payload: Any) -> dict[str, str]:
    if not isinstance(payload, dict):
        return {}
    data = payload.get("data")
    if not isinstance(data, dict):
        return {}
    doc_aggs = data.get("doc_aggs")
    if isinstance(doc_aggs, dict):
        return {
            _coerce_str(value.get("doc_id")): _coerce_str(value.get("doc_name"))
            for value in doc_aggs.values()
            if isinstance(value, dict) and value.get("doc_id")
        }
    if isinstance(doc_aggs, list):
        return {
            _coerce_str(value.get("doc_id")): _coerce_str(value.get("doc_name"))
            for value in doc_aggs
            if isinstance(value, dict) and value.get("doc_id")
        }
    return {}


def normalize_external_kb_results(payload: Any) -> list[dict[str, Any]]:
    """Normalize RAGFlow retrieval results into one contract."""
    if isinstance(payload, dict) and payload.get("code") not in (None, 0):
        raise ExternalKnowledgeBaseError(
            _coerce_str(payload.get("message")) or "RAGFlow retrieval failed.",
            status_code=502,
        )

    items = _extract_result_items(payload)
    doc_name_by_id = _ragflow_doc_name_by_id(payload)
    normalized: list[dict[str, Any]] = []

    for index, raw_item in enumerate(items):
        if not isinstance(raw_item, dict):
            continue

        content = _coerce_str(
            _first_present(raw_item, ("content", "text", "markdown", "page_content", "chunk"))
        )
        if not content:
            continue

        metadata = raw_item.get("metadata")
        if not isinstance(metadata, dict):
            metadata = {}

        raw_id = _first_present(raw_item, ("id", "chunk_id", "document_id", "doc_id"))
        document_id = _coerce_str(_first_present(raw_item, ("document_id", "doc_id")))
        document_name = (
            _coerce_str(_first_present(raw_item, ("document_name", "document_keyword", "filename", "file_name")))
            or doc_name_by_id.get(document_id, "")
        )
        title = _coerce_str(_first_present(raw_item, ("title", "name"))) or document_name
        source = _coerce_str(_first_present(raw_item, ("source", "url", "file_path"))) or document_name or document_id
        score = _coerce_float(_first_present(raw_item, ("score", "similarity", "relevance")))

        ragflow_metadata = {
            key: raw_item[key]
            for key in (
                "document_id",
                "document_keyword",
                "kb_id",
                "dataset_id",
                "image_id",
                "positions",
                "important_keywords",
                "tag_kwd",
                "highlight",
                "term_similarity",
                "vector_similarity",
            )
            if key in raw_item
        }
        metadata = {**ragflow_metadata, **metadata}

        normalized.append(
            {
                "id": _coerce_str(raw_id) or f"result-{index + 1}",
                "title": title,
                "content": content,
                "source": source,
                "score": score,
                "metadata": metadata,
            }
        )

    return normalized


class ExternalKnowledgeBaseClient:
    def __init__(
        self,
        config: ExternalKnowledgeBaseConfig,
        *,
        transport: httpx.AsyncBaseTransport | None = None,
    ):
        self.config = config
        self._transport = transport

    async def search(
        self,
        *,
        query: str,
        top_k: int,
        dataset_ids: list[str] | None = None,
        document_ids: list[str] | None = None,
        similarity_threshold: float | None = None,
        vector_similarity_weight: float | None = None,
        keyword: bool | None = None,
        highlight: bool | None = None,
        cross_languages: list[str] | None = None,
        metadata_condition: dict[str, Any] | None = None,
        use_kg: bool | None = None,
        toc_enhance: bool | None = None,
        retrieval_top_k: int | None = None,
    ) -> list[dict[str, Any]]:
        clean_query = str(query or "").strip()
        if not clean_query:
            raise ExternalKnowledgeBaseError("query is required", status_code=400)

        url = _join_url(self.config.api_base, self.config.search_path)
        resolved_dataset_ids = _clean_ids(dataset_ids) or _clean_ids(self.config.dataset_ids)
        resolved_document_ids = _clean_ids(document_ids) or _clean_ids(self.config.document_ids)
        if not resolved_dataset_ids and not resolved_document_ids:
            raise ExternalKnowledgeBaseError(
                "RAGFlow retrieval requires dataset_ids or document_ids. "
                "Pass them in the request or set EXTERNAL_KB_DATASET_IDS / EXTERNAL_KB_DOCUMENT_IDS.",
                status_code=400,
            )

        headers = {"Accept": "application/json"}
        if self.config.api_key:
            headers["Authorization"] = f"Bearer {self.config.api_key}"

        payload: dict[str, Any] = {
            "question": clean_query,
            "page": 1,
            "page_size": top_k,
            "top_k": max(int(retrieval_top_k or self.config.ragflow_top_k or 1024), int(top_k)),
            "similarity_threshold": (
                self.config.similarity_threshold if similarity_threshold is None else similarity_threshold
            ),
            "vector_similarity_weight": (
                self.config.vector_similarity_weight
                if vector_similarity_weight is None
                else vector_similarity_weight
            ),
        }
        if resolved_dataset_ids:
            payload["dataset_ids"] = resolved_dataset_ids
        if resolved_document_ids:
            payload["document_ids"] = resolved_document_ids
        optional_values = {
            "keyword": keyword,
            "highlight": highlight,
            "cross_languages": cross_languages,
            "metadata_condition": metadata_condition,
            "use_kg": use_kg,
            "toc_enhance": toc_enhance,
        }
        payload.update({key: value for key, value in optional_values.items() if value is not None})

        try:
            async with httpx.AsyncClient(
                timeout=self.config.timeout,
                transport=self._transport,
            ) as client:
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
        except httpx.TimeoutException as exc:
            raise ExternalKnowledgeBaseError("External knowledge base request timed out.", status_code=504) from exc
        except httpx.HTTPStatusError as exc:
            raise ExternalKnowledgeBaseError(
                f"External knowledge base returned HTTP {exc.response.status_code}.",
                status_code=502,
            ) from exc
        except httpx.HTTPError as exc:
            raise ExternalKnowledgeBaseError("External knowledge base request failed.", status_code=502) from exc
        except ValueError as exc:
            raise ExternalKnowledgeBaseError("External knowledge base returned invalid JSON.", status_code=502) from exc

        return normalize_external_kb_results(data)
