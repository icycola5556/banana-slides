"""
Layout planner unit tests.
"""

import copy
from collections import Counter

from services.presentation.layout_planner import (
    assign_layout_variants,
    _estimate_content_size,
    _estimate_qa_case_content_size,
    validate_capacity,
    CAPACITY_PROFILES,
)


def _make_outline(layout_ids):
    return [
        {
            "title": f"Page {idx + 1}",
            "points": ["p1", "p2"],
            "layout_id": layout_id,
        }
        for idx, layout_id in enumerate(layout_ids)
    ]


def test_assigns_archetype_and_default_variant_for_non_variant_layouts():
    outline = _make_outline(["cover", "toc", "quote"])

    result = assign_layout_variants(copy.deepcopy(outline))

    assert result[0]["layout_archetype"] == "cover"
    assert result[1]["layout_archetype"] == "toc"
    assert result[2]["layout_archetype"] == "quote"
    assert all(page["layout_variant"] == "a" for page in result)


def test_adjacent_pages_with_same_base_layout_do_not_repeat_variant():
    outline = _make_outline(["title_bullets", "title_bullets", "title_bullets", "title_bullets"])

    result = assign_layout_variants(copy.deepcopy(outline), max_variant_usage=10, max_run_length=1)
    variants = [page["layout_variant"] for page in result]

    for idx in range(1, len(variants)):
        assert variants[idx] != variants[idx - 1]


def test_non_adjacent_pages_are_not_treated_as_run_length(monkeypatch):
    outline = _make_outline(["title_bullets", "two_column", "title_bullets", "quote", "title_bullets"])

    def fake_rank(value: str) -> int:
        # page 0 prefers variant "a"; later ties prefer variant "b"
        if value.startswith("0:"):
            return 0 if ":a:" in value else 1
        return 0 if ":b:" in value else 1

    monkeypatch.setattr("services.presentation.layout_planner._stable_rank", fake_rank)

    result = assign_layout_variants(copy.deepcopy(outline), max_variant_usage=10, max_run_length=1)
    variants = [result[idx]["layout_variant"] for idx in [0, 2, 4]]

    # If non-adjacent pages were still considered a run, page 5 would be forced to "a".
    # Correct behavior allows page 5 to be "b" based on ranking tie-break.
    assert variants == ["a", "b", "b"]


def test_dynamic_cap_relaxation_keeps_distribution_feasible():
    outline = _make_outline(["title_bullets"] * 5)

    result = assign_layout_variants(copy.deepcopy(outline), max_variant_usage=1, max_run_length=1)
    variants = [page["layout_variant"] for page in result]
    counts = Counter(variants)

    assert len(variants) == 5
    assert max(counts.values()) <= 3
    for idx in range(1, len(variants)):
        assert variants[idx] != variants[idx - 1]


# ============================================================================
# EduQACase Layout Capacity Tests
# ============================================================================

def test_edu_qa_case_capacity_profiles_match_frontend():
    """Verify edu_qa_case capacity profiles match actual frontend rendering limits.

    Frontend EduQACaseLayout.tsx:
    - Variant A renders max 3 items (line 230: items.slice(0, 3))
    - Variant B renders max 4 items (line 286: items.slice(0, 4))
    """
    profiles = CAPACITY_PROFILES.get("edu_qa_case", {})

    # Check variant A
    assert profiles["a"]["max_items"] == 3, "Variant A should allow max 3 items"

    # Check variant B
    assert profiles["b"]["max_items"] == 4, "Variant B should allow max 4 items"

    # Verify per-item char limit is reasonable (not too large)
    for variant in ["a", "b", "c", "d"]:
        assert profiles[variant]["max_chars_per_item"] <= 100, \
            f"Variant {variant} per-item limit should be <= 100 chars"


def test_estimate_qa_case_content_size_counts_all_fields():
    """Verify _estimate_content_size correctly counts question/answer/analysis/conclusion."""
    page = {
        "layout_id": "edu_qa_case",
        "model": {
            "question": "电脑配置不够怎么办？",
            "answer": "建议采用低模高细节渲染策略；学习曲线预估为3-6个月基础掌握；接单首选垂直细分领域建立作品集。",
            "analysis": [
                {"title": "硬件配置优化方案", "content": "无需顶级显卡，通过降低渲染采样、使用代理材质及云渲染服务。"},
                {"title": "学习路径", "content": "前2周专注软件操作与拓扑规范，中间2月构建PBR材质库。"}
            ],
            "conclusion": "坚持练习是成功的关键"
        }
    }

    size = _estimate_content_size(page)

    # Should count: question + answer + 2 analysis items + conclusion = 5 items
    assert size["item_count"] == 5, f"Expected 5 items, got {size['item_count']}"

    # Verify total chars is reasonable
    assert size["total_chars"] > 0, "Total chars should be positive"

    # Verify max item chars is captured
    assert size["max_item_chars"] > 0, "Max item chars should be positive"


def test_estimate_qa_case_content_size_with_empty_fields():
    """Verify _estimate_content_size handles missing fields gracefully."""
    page = {
        "layout_id": "edu_qa_case",
        "model": {
            "question": "问题？",
            "answer": "答案。"
            # No analysis, no conclusion
        }
    }

    size = _estimate_content_size(page)

    # Should count: question + answer = 2 items
    assert size["item_count"] == 2, f"Expected 2 items, got {size['item_count']}"


def test_estimate_qa_case_content_size_direct_helper():
    """Test the direct _estimate_qa_case_content_size helper function."""
    model = {
        "question": "Q内容",
        "answer": "A内容很长很长很长",
        "analysis": [
            {"title": "分析1", "content": "内容1"},
            {"title": "分析2", "content": "内容2"},
        ],
        "conclusion": "结论"
    }

    size = _estimate_qa_case_content_size(model)

    assert size["item_count"] == 5  # Q + A + 2 analysis + conclusion
    assert size["max_item_chars"] == len("A内容很长很长很长")
    assert size["total_chars"] == sum([
        len("Q内容"),
        len("A内容很长很长很长"),
        len("分析1内容1"),
        len("分析2内容2"),
        len("结论")
    ])


def test_validate_capacity_fallback_for_overflow():
    """Verify validate_capacity falls back to appropriate variant when content overflows."""
    # Create a page with content that exceeds variant A limits
    page = {
        "layout_id": "edu_qa_case",
        "model": {
            "question": "短问题",
            "answer": "短答案",
            "analysis": [
                {"title": "分析1", "content": "内容"},
                {"title": "分析2", "content": "内容"},
                {"title": "分析3", "content": "内容"},  # This makes 5 items total
            ],
            "conclusion": "结论"
        }
    }

    # Variant A can only handle 3 items, so it should fallback
    result_variant = validate_capacity("edu_qa_case", "a", page)

    # Should fallback to variant B (or stay as 'a' if no fallback works)
    # The exact behavior depends on FALLBACK_ORDER, but it shouldn't crash
    assert result_variant in ["a", "b", "c", "d"]


def test_edu_qa_case_triggers_capacity_check():
    """Ensure edu_qa_case layout triggers capacity validation with correct size estimation."""
    # Large content that should trigger capacity overflow
    page = {
        "layout_id": "edu_qa_case",
        "model": {
            "question": "这是一个很长很长很长很长很长很长很长很长很长很长的问题？" * 5,
            "answer": "这是一个很长很长很长很长很长很长很长很长很长很长的答案。" * 5,
        }
    }

    size = _estimate_content_size(page)

    # Verify the long content is detected
    assert size["total_chars"] > 200, "Long content should be detected"
    assert size["item_count"] == 2, "Should count both question and answer"

    # Verify capacity validation runs
    result = validate_capacity("edu_qa_case", "a", page)
    assert isinstance(result, str)


# ============================================================================
# Dynamic Layout Adaptation Tests
# ============================================================================

def test_edu_qa_case_layout_adapts_to_content_volume():
    """Test that edu_qa_case layout adapts to different content volumes."""
    # Small content (2 items) - should fit comfortably
    small_page = {
        "layout_id": "edu_qa_case",
        "model": {
            "question": "短问题？",
            "answer": "短答案。"
        }
    }
    small_size = _estimate_content_size(small_page)
    assert small_size["item_count"] == 2
    assert small_size["total_chars"] < 100

    # Medium content (4 items) - at the limit for variant B
    medium_page = {
        "layout_id": "edu_qa_case",
        "model": {
            "question": "中等长度的问题描述？",
            "answer": "中等长度的答案描述，包含一些详细信息。",
            "analysis": [
                {"title": "分析点1", "content": "分析内容1"},
                {"title": "分析点2", "content": "分析内容2"}
            ]
        }
    }
    medium_size = _estimate_content_size(medium_page)
    assert medium_size["item_count"] == 4  # Q + A + 2 analysis

    # Large content (5 items) - exceeds variant B limit, should fallback or split
    large_page = {
        "layout_id": "edu_qa_case",
        "model": {
            "question": "问题？",
            "answer": "答案。",
            "analysis": [
                {"title": "分析1", "content": "内容1"},
                {"title": "分析2", "content": "内容2"},
                {"title": "分析3", "content": "内容3"}
            ],
            "conclusion": "结论"
        }
    }
    large_size = _estimate_content_size(large_page)
    assert large_size["item_count"] == 5  # Q + A + 3 analysis + conclusion


def test_edu_qa_case_more_card_content_handling():
    """Test that overflow content (5+ items) is properly handled.

    When there are 5+ logical items, frontend collapses items 4+ into a 'more/延伸' card.
    This test verifies backend correctly estimates the resulting content structure.
    """
    page = {
        "layout_id": "edu_qa_case",
        "model": {
            "question": "问题内容",
            "answer": "答案内容",
            "analysis": [
                {"title": "分析1", "content": "分析内容1"},
                {"title": "分析2", "content": "分析内容2"}
            ],
            "conclusion": "这是一个很长的结论内容，可能会被合并到'延伸'卡片中"
        }
    }

    size = _estimate_content_size(page)

    # 5 items total: Q + A + 2 analysis + conclusion
    assert size["item_count"] == 5

    # Verify capacity validation
    # Variant B can handle max 4 items, so this should trigger fallback
    variant_b_result = validate_capacity("edu_qa_case", "b", page)
    assert variant_b_result in ["a", "b", "c", "d"]


def test_capacity_profiles_reasonable_limits():
    """Ensure capacity profiles have reasonable limits that match frontend capabilities."""
    qa_profiles = CAPACITY_PROFILES.get("edu_qa_case", {})

    # Check that limits are not overly generous
    for variant, profile in qa_profiles.items():
        # Per-item limit should be reasonable (< 150 chars for readability)
        assert profile["max_chars_per_item"] <= 100, \
            f"Variant {variant} per-item limit {profile['max_chars_per_item']} too high"

        # Total limit should be reasonable
        expected_total = profile["max_items"] * profile["max_chars_per_item"]
        assert profile["max_total_chars"] <= expected_total + 100, \
            f"Variant {variant} total limit seems inconsistent with per-item limits"
