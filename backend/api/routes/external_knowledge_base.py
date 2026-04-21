"""External knowledge-base integration routes."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from config_fastapi import settings
from deps import CurrentUser, require_current_user
from schemas.common import SuccessResponse
from services.external_knowledge_base_service import (
    ExternalKnowledgeBaseClient,
    ExternalKnowledgeBaseConfig,
    ExternalKnowledgeBaseError,
)

router = APIRouter(prefix="/api/external-knowledge-base", tags=["external-knowledge-base"])


class ExternalKnowledgeBaseSearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    top_k: int = Field(default=5, ge=1, le=50)
    dataset_ids: list[str] | None = None
    document_ids: list[str] | None = None
    similarity_threshold: float | None = Field(default=None, ge=0.0, le=1.0)
    vector_similarity_weight: float | None = Field(default=None, ge=0.0, le=1.0)
    keyword: bool | None = None
    highlight: bool | None = None
    cross_languages: list[str] | None = None
    metadata_condition: dict[str, Any] | None = None
    use_kg: bool | None = None
    toc_enhance: bool | None = None
    retrieval_top_k: int | None = Field(default=None, ge=1, le=4096)


def _build_external_kb_config() -> ExternalKnowledgeBaseConfig:
    return ExternalKnowledgeBaseConfig(
        api_base=settings.external_kb_api_base,
        api_key=settings.external_kb_api_key,
        search_path=settings.external_kb_search_path,
        timeout=settings.external_kb_timeout,
        dataset_ids=tuple(
            item.strip()
            for item in settings.external_kb_dataset_ids.split(",")
            if item.strip()
        ),
        document_ids=tuple(
            item.strip()
            for item in settings.external_kb_document_ids.split(",")
            if item.strip()
        ),
        similarity_threshold=settings.external_kb_similarity_threshold,
        vector_similarity_weight=settings.external_kb_vector_similarity_weight,
        ragflow_top_k=settings.external_kb_ragflow_top_k,
    )


@router.get("/status", response_model=SuccessResponse)
async def external_knowledge_base_status(
    current_user: CurrentUser = Depends(require_current_user),
):
    return SuccessResponse(
        data={
            "enabled": bool(settings.external_kb_api_base.strip()),
            "api_base_configured": bool(settings.external_kb_api_base.strip()),
            "api_key_configured": bool(settings.external_kb_api_key.strip()),
            "search_path": settings.external_kb_search_path,
            "timeout": settings.external_kb_timeout,
            "default_dataset_count": len(
                [item for item in settings.external_kb_dataset_ids.split(",") if item.strip()]
            ),
            "default_document_count": len(
                [item for item in settings.external_kb_document_ids.split(",") if item.strip()]
            ),
            "similarity_threshold": settings.external_kb_similarity_threshold,
            "vector_similarity_weight": settings.external_kb_vector_similarity_weight,
            "ragflow_top_k": settings.external_kb_ragflow_top_k,
        }
    )


@router.post("/search", response_model=SuccessResponse)
async def search_external_knowledge_base(
    body: ExternalKnowledgeBaseSearchRequest,
    current_user: CurrentUser = Depends(require_current_user),
):
    client = ExternalKnowledgeBaseClient(_build_external_kb_config())
    try:
        results = await client.search(
            query=body.query,
            top_k=body.top_k,
            dataset_ids=body.dataset_ids,
            document_ids=body.document_ids,
            similarity_threshold=body.similarity_threshold,
            vector_similarity_weight=body.vector_similarity_weight,
            keyword=body.keyword,
            highlight=body.highlight,
            cross_languages=body.cross_languages,
            metadata_condition=body.metadata_condition,
            use_kg=body.use_kg,
            toc_enhance=body.toc_enhance,
            retrieval_top_k=body.retrieval_top_k,
        )
    except ExternalKnowledgeBaseError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc

    return SuccessResponse(
        data={
            "query": body.query.strip(),
            "top_k": body.top_k,
            "count": len(results),
            "results": results,
        }
    )
