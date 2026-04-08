from types import SimpleNamespace

from services.image_prompt_optimizer import (
    _build_content_rule_prompt,
    _get_template_profile,
    _normalize_layout_id,
    _normalize_slot_context,
    _quality_gate_prompt,
)


def _project_stub() -> SimpleNamespace:
    return SimpleNamespace(
        idea_prompt="生成一份液压传动原理的PPT",
        extra_requirements="聚焦液压系统力放大机制",
        template_style="重工终端型",
        scheme_id="business_pro",
    )


def test_detail_zoom_layout_is_not_downgraded_to_title_content():
    assert _normalize_layout_id("detail_zoom") == "detail_zoom"
    assert _normalize_layout_id("specimen_detail") == "detail_zoom"
    assert _normalize_layout_id("annotation_panel") == "detail_zoom"


def test_detail_zoom_context_keeps_annotation_targets():
    context = _normalize_slot_context(
        {
            "slot_path": "image_src",
            "context": {
                "layout_id": "detail_zoom",
                "scheme_id": "business_pro",
                "page_title": "力放大效应工程实例分析",
                "page_facts": ["小活塞 A1", "大活塞 A2", "行程损失关系"],
                "annotation_targets": [
                    {"label": "小活塞 (A1)", "description": "输入端：施加 F1=100N，面积 10cm²"},
                    {"label": "大活塞 (A2)", "description": "输出端：面积 100cm²，输出力 F2=1000N"},
                ],
            },
        },
        _project_stub(),
    )

    assert context["layout_id"] == "detail_zoom"
    assert context["scheme_id"] == "business_pro"
    assert context["annotation_targets"][0]["label"] == "小活塞 (A1)"
    assert context["annotation_targets"][1]["description"] == "输出端：面积 100cm²，输出力 F2=1000N"


def test_detail_zoom_prompt_mentions_targets_and_engineering_view():
    context = _normalize_slot_context(
        {
            "slot_path": "image_src",
            "prompt": "生成概念解释图",
            "context": {
                "layout_id": "detail_zoom",
                "scheme_id": "business_pro",
                "page_title": "力放大效应工程实例分析",
                "page_facts": ["小活塞 A1", "大活塞 A2", "行程损失关系"],
                "visual_goal": "主图必须能承载标注点",
                "annotation_targets": [
                    {"label": "小活塞 (A1)", "description": "输入端，施加较小力"},
                    {"label": "大活塞 (A2)", "description": "输出端，得到更大输出力"},
                    {"label": "行程损失关系", "description": "位移比 S1/S2 = A2/A1"},
                ],
            },
        },
        _project_stub(),
    )

    prompt = _build_content_rule_prompt("生成概念解释图", context, "detail-zoom-slot")

    assert "小活塞" in prompt
    assert "大活塞" in prompt
    assert "行程损失关系" in prompt
    assert "剖面" in prompt or "透明" in prompt or "特写" in prompt
    assert "终端" in prompt or "工业" in prompt


def test_business_pro_profile_is_used_for_business_pro_theme():
    profile = _get_template_profile("business_pro")

    assert "终端" in profile["content_style"]
    assert "HUD" in profile["content_style"]


def test_image_full_mechanical_prompt_excludes_medical_diagnostic_imagery():
    context = _normalize_slot_context(
        {
            "slot_path": "image_src",
            "prompt": "生成内容解释图",
            "context": {
                "layout_id": "image_full",
                "scheme_id": "business_pro",
                "page_title": "气穴与空蚀：物理损伤机制",
                "page_facts": [
                    "诊断核心：吸入阻力过大导致局部压力低于饱和蒸汽压",
                    "产生真空气泡",
                    "气泡溃灭冲击波造成金属表面微区疲劳剥落",
                ],
            },
        },
        _project_stub(),
    )

    prompt = _build_content_rule_prompt("生成内容解释图", context, "image-full-mechanism")

    assert "医疗" in prompt
    assert "超声探头" in prompt
    assert "金属表面" in prompt
    assert "气泡溃灭" in prompt


def test_quality_gate_rejects_medical_mismatch_for_mechanical_topics():
    context = _normalize_slot_context(
        {
            "slot_path": "image_src",
            "prompt": "生成内容解释图",
            "context": {
                "layout_id": "image_full",
                "scheme_id": "business_pro",
                "page_title": "气穴与空蚀：物理损伤机制",
                "page_facts": ["液压系统空蚀", "金属表面疲劳剥落"],
            },
        },
        _project_stub(),
    )

    fallback = "工程机制图 prompt"
    candidate = "工业空蚀诊断页面，但画面中出现医疗超声探头与人体组织。"

    assert _quality_gate_prompt(candidate, fallback, context) == fallback
