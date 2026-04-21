import pytest
import httpx

import api.routes.external_knowledge_base as external_kb_module
from services.external_knowledge_base_service import (
    ExternalKnowledgeBaseClient,
    ExternalKnowledgeBaseConfig,
    normalize_external_kb_results,
)

from conftest import assert_success_response


def test_status_reports_disabled_when_external_kb_is_not_configured(client, monkeypatch):
    monkeypatch.setattr(external_kb_module.settings, "external_kb_api_base", "")
    monkeypatch.setattr(external_kb_module.settings, "external_kb_api_key", "")
    monkeypatch.setattr(external_kb_module.settings, "external_kb_search_path", "/api/v1/retrieval")
    monkeypatch.setattr(external_kb_module.settings, "external_kb_timeout", 30.0)
    monkeypatch.setattr(external_kb_module.settings, "external_kb_dataset_ids", "")
    monkeypatch.setattr(external_kb_module.settings, "external_kb_document_ids", "")
    monkeypatch.setattr(external_kb_module.settings, "external_kb_similarity_threshold", 0.2)
    monkeypatch.setattr(external_kb_module.settings, "external_kb_vector_similarity_weight", 0.3)
    monkeypatch.setattr(external_kb_module.settings, "external_kb_ragflow_top_k", 1024)

    response = client.get("/api/external-knowledge-base/status")

    payload = assert_success_response(response)
    assert payload["data"]["enabled"] is False
    assert payload["data"]["api_base_configured"] is False
    assert payload["data"]["api_key_configured"] is False
    assert payload["data"]["search_path"] == "/api/v1/retrieval"
    assert payload["data"]["default_dataset_count"] == 0


def test_search_returns_400_when_external_kb_is_not_configured(client, monkeypatch):
    monkeypatch.setattr(external_kb_module.settings, "external_kb_api_base", "")
    monkeypatch.setattr(external_kb_module.settings, "external_kb_api_key", "")

    response = client.post(
        "/api/external-knowledge-base/search",
        json={"query": "course safety", "top_k": 3},
    )

    assert response.status_code == 400
    assert "EXTERNAL_KB_API_BASE" in response.get_json()["detail"]


def test_search_route_delegates_to_external_client(client, monkeypatch):
    captured = {}

    class FakeExternalKnowledgeBaseClient:
        def __init__(self, config):
            captured["config"] = config

        async def search(self, **kwargs):
            captured.update(kwargs)
            return [
                {
                    "id": "chunk-1",
                    "title": "Safety Manual",
                    "content": "Wear protective equipment before operating the device.",
                    "source": "manual.pdf",
                    "score": 0.91,
                    "metadata": {"page": 2},
                }
            ]

    monkeypatch.setattr(external_kb_module.settings, "external_kb_api_base", "https://kb.example.test")
    monkeypatch.setattr(external_kb_module.settings, "external_kb_api_key", "secret")
    monkeypatch.setattr(external_kb_module.settings, "external_kb_search_path", "/api/v1/retrieval")
    monkeypatch.setattr(external_kb_module.settings, "external_kb_timeout", 12.0)
    monkeypatch.setattr(external_kb_module.settings, "external_kb_dataset_ids", "ds-default")
    monkeypatch.setattr(external_kb_module.settings, "external_kb_document_ids", "")
    monkeypatch.setattr(external_kb_module.settings, "external_kb_similarity_threshold", 0.25)
    monkeypatch.setattr(external_kb_module.settings, "external_kb_vector_similarity_weight", 0.4)
    monkeypatch.setattr(external_kb_module.settings, "external_kb_ragflow_top_k", 800)
    monkeypatch.setattr(
        external_kb_module,
        "ExternalKnowledgeBaseClient",
        FakeExternalKnowledgeBaseClient,
    )

    response = client.post(
        "/api/external-knowledge-base/search",
        json={
            "query": " course safety ",
            "top_k": 2,
            "dataset_ids": ["ds-request"],
            "metadata_condition": {
                "logic": "and",
                "conditions": [{"name": "department", "comparison_operator": "=", "value": "training"}],
            },
            "highlight": True,
        },
    )

    payload = assert_success_response(response)
    assert payload["data"]["query"] == "course safety"
    assert payload["data"]["top_k"] == 2
    assert payload["data"]["count"] == 1
    assert payload["data"]["results"][0]["id"] == "chunk-1"
    assert captured["config"].api_base == "https://kb.example.test"
    assert captured["config"].api_key == "secret"
    assert captured["config"].search_path == "/api/v1/retrieval"
    assert captured["config"].timeout == 12.0
    assert captured["config"].dataset_ids == ("ds-default",)
    assert captured["config"].similarity_threshold == 0.25
    assert captured["config"].vector_similarity_weight == 0.4
    assert captured["config"].ragflow_top_k == 800
    assert captured["query"] == " course safety "
    assert captured["top_k"] == 2
    assert captured["dataset_ids"] == ["ds-request"]
    assert captured["metadata_condition"]["conditions"][0]["name"] == "department"
    assert captured["highlight"] is True


def test_normalize_external_kb_results_supports_ragflow_retrieval_shape():
    payload = {
        "code": 0,
        "data": {
            "chunks": [
                {
                    "id": "chunk-1",
                    "document_id": "doc-1",
                    "document_keyword": "Operating Guide.pdf",
                    "content": "Step one: inspect the device.",
                    "kb_id": "dataset-1",
                    "similarity": "0.88",
                    "vector_similarity": 0.7,
                    "term_similarity": 0.3,
                },
                {"id": "empty", "content": ""},
            ],
            "doc_aggs": [{"doc_id": "doc-1", "doc_name": "Operating Guide.pdf", "count": 1}],
            "total": 1,
        }
    }

    results = normalize_external_kb_results(payload)

    assert results == [
        {
            "id": "chunk-1",
            "title": "Operating Guide.pdf",
            "content": "Step one: inspect the device.",
            "source": "Operating Guide.pdf",
            "score": 0.88,
            "metadata": {
                "document_id": "doc-1",
                "document_keyword": "Operating Guide.pdf",
                "kb_id": "dataset-1",
                "term_similarity": 0.3,
                "vector_similarity": 0.7,
            },
        }
    ]


@pytest.mark.asyncio
async def test_external_kb_client_posts_expected_payload_and_auth_header():
    seen = {}

    def handler(request: httpx.Request) -> httpx.Response:
        seen["url"] = str(request.url)
        seen["auth"] = request.headers.get("authorization")
        seen["payload"] = request.read()
        return httpx.Response(
            200,
            json={
                "code": 0,
                "data": {
                    "chunks": [
                        {
                            "id": "r1",
                            "document_keyword": "Doc",
                            "content": "Useful retrieved content.",
                        }
                    ],
                    "doc_aggs": [],
                    "total": 1,
                },
            },
        )

    client = ExternalKnowledgeBaseClient(
        ExternalKnowledgeBaseConfig(
            api_base="https://kb.example.test/base",
            api_key="kb-token",
            search_path="/api/v1/retrieval",
            timeout=10.0,
            dataset_ids=("ds-1",),
            similarity_threshold=0.21,
            vector_similarity_weight=0.35,
            ragflow_top_k=1024,
        ),
        transport=httpx.MockTransport(handler),
    )

    results = await client.search(
        query="machine safety",
        top_k=4,
        metadata_condition={
            "logic": "and",
            "conditions": [{"name": "lang", "comparison_operator": "=", "value": "en"}],
        },
        keyword=True,
    )

    assert seen["url"] == "https://kb.example.test/base/api/v1/retrieval"
    assert seen["auth"] == "Bearer kb-token"
    assert b'"question":"machine safety"' in seen["payload"]
    assert b'"dataset_ids":["ds-1"]' in seen["payload"]
    assert b'"page_size":4' in seen["payload"]
    assert b'"top_k":1024' in seen["payload"]
    assert b'"similarity_threshold":0.21' in seen["payload"]
    assert b'"vector_similarity_weight":0.35' in seen["payload"]
    assert b'"metadata_condition"' in seen["payload"]
    assert b'"keyword":true' in seen["payload"]
    assert results[0]["content"] == "Useful retrieved content."
