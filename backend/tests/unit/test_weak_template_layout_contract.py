from services.prompts import (
    LAYOUT_ID_ALIASES,
    LAYOUT_SCHEMAS,
    SCHEME_ROLE_LAYOUTS,
    resolve_layout_id,
)
from services.prompts.layouts import is_toc_layout
from services.prompts.schemas import (
    LAYOUT_ID_ALIASES as schema_layout_id_aliases,
    LAYOUT_SCHEMAS as schema_layout_schemas,
    SCHEME_ROLE_LAYOUTS as schema_scheme_role_layouts,
)


PHASE_ONE_DIRECT_LAYOUT_IDS = [
    "cover_tech",
    "toc_tech",
    "ending_tech",
    "arch_blocks",
    "param_dashboard",
    "flow_logic_sequence",
    "protocol_analysis",
    "requirement_specs",
    "cover_interactive",
    "agenda_path",
    "quiz_interaction",
    "role_play_scenario",
    "feedback_poll",
    "group_collab",
    "case_discussion",
    "ending_interactive",
    "cover_practical",
    "mind_map_structure",
    "checklist_verification",
    "task_instruction",
    "common_faults",
    "detail_specs",
    "ending_practical",
    "system_comparison",
    "tech_principle",
    "safety_protocol",
    "equipment_orientation",
    "cover_field",
    "timeline_evolution",
    "field_observation",
    "infographic_flow",
    "specimen_detail",
    "case_before_after",
    "site_survey",
    "ending_field",
]

REMAINING_WEAK_TEMPLATE_ALIASES = {
    "warmup_inquiry": "warmup_question",
    "gallery_professional": "portfolio",
    "portfolio_industry": "portfolio",
    "sop_vertical_steps": "vertical_timeline",
    "technical_tip": "quote",
}

WEAK_TEMPLATE_ROLE_LAYOUTS = {
    "tech_blue": {"cover": "cover_tech", "toc": "toc_tech", "ending": "ending_tech"},
    "interactive": {"cover": "cover_interactive", "toc": "agenda_path", "ending": "ending_interactive"},
    "visual": {"cover": "cover_field", "toc": "timeline_evolution", "ending": "ending_field"},
    "practical": {"cover": "cover_practical", "toc": "checklist_verification", "ending": "ending_practical"},
}


def test_phase_one_direct_layouts_stay_canonical():
    for layout_id in PHASE_ONE_DIRECT_LAYOUT_IDS:
        assert layout_id in LAYOUT_SCHEMAS
        assert layout_id not in LAYOUT_ID_ALIASES
        assert resolve_layout_id(layout_id) == layout_id


def test_removed_ghost_layout_ids_do_not_leak_back_into_prompt_aliases():
    assert "discussion_card" not in LAYOUT_ID_ALIASES
    assert "reflection_quiz" not in LAYOUT_ID_ALIASES


def test_remaining_weak_template_aliases_match_canonical_backend_mapping():
    for layout_id, expected_base in REMAINING_WEAK_TEMPLATE_ALIASES.items():
        assert LAYOUT_ID_ALIASES[layout_id] == expected_base


def test_weak_template_role_layouts_match_canonical_scheme_contract():
    for scheme_id, expected in WEAK_TEMPLATE_ROLE_LAYOUTS.items():
        assert SCHEME_ROLE_LAYOUTS[scheme_id] == expected


def test_prompt_schema_facade_re_exports_canonical_layout_tables():
    assert schema_layout_id_aliases is LAYOUT_ID_ALIASES
    assert schema_layout_schemas is LAYOUT_SCHEMAS
    assert schema_scheme_role_layouts is SCHEME_ROLE_LAYOUTS


def test_direct_role_layouts_keep_toc_semantics_without_alias_fallback():
    assert is_toc_layout("toc_tech", "tech_blue") is True
    assert is_toc_layout("agenda_path", "interactive") is True
    assert is_toc_layout("timeline_evolution", "visual") is True
