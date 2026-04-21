from services.prompts import (
    LAYOUT_ID_ALIASES,
    LAYOUT_SCHEMES,
    LAYOUT_SCHEMAS,
    SCHEME_ROLE_LAYOUTS,
    resolve_layout_id,
)
from services.prompts.layouts import LAYOUT_SCHEME_MANIFEST, is_toc_layout
from services.prompts.schemas import (
    LAYOUT_ID_ALIASES as schema_layout_id_aliases,
    LAYOUT_SCHEMES as schema_layout_schemes,
    LAYOUT_SCHEMAS as schema_layout_schemas,
    SCHEME_ROLE_LAYOUTS as schema_scheme_role_layouts,
)


WEAK_TEMPLATE_SCHEME_IDS = ("tech_blue", "interactive", "visual", "practical")

REMAINING_WEAK_TEMPLATE_ALIASES = {
    "warmup_inquiry": "warmup_question",
    "gallery_professional": "portfolio",
    "portfolio_industry": "portfolio",
    "sop_vertical_steps": "vertical_timeline",
    "technical_tip": "quote",
}


def test_phase_one_direct_layouts_stay_canonical():
    for scheme_id in WEAK_TEMPLATE_SCHEME_IDS:
        for layout_id in LAYOUT_SCHEME_MANIFEST[scheme_id]["canonical_layout_ids"]:
            if layout_id in REMAINING_WEAK_TEMPLATE_ALIASES:
                assert LAYOUT_ID_ALIASES[layout_id] == REMAINING_WEAK_TEMPLATE_ALIASES[layout_id]
                assert resolve_layout_id(layout_id) == REMAINING_WEAK_TEMPLATE_ALIASES[layout_id]
                continue
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
    for scheme_id in WEAK_TEMPLATE_SCHEME_IDS:
        assert SCHEME_ROLE_LAYOUTS[scheme_id] == LAYOUT_SCHEME_MANIFEST[scheme_id]["role_layouts"]


def test_layout_schemes_follow_manifest_canonical_order():
    for scheme_id, manifest_entry in LAYOUT_SCHEME_MANIFEST.items():
        assert list(LAYOUT_SCHEMES[scheme_id]["layouts"].keys()) == manifest_entry["canonical_layout_ids"]
        assert SCHEME_ROLE_LAYOUTS[scheme_id] == manifest_entry["role_layouts"]


def test_prompt_schema_facade_re_exports_canonical_layout_tables():
    assert schema_layout_id_aliases is LAYOUT_ID_ALIASES
    assert schema_layout_schemes is LAYOUT_SCHEMES
    assert schema_layout_schemas is LAYOUT_SCHEMAS
    assert schema_scheme_role_layouts is SCHEME_ROLE_LAYOUTS


def test_direct_role_layouts_keep_toc_semantics_without_alias_fallback():
    assert is_toc_layout("toc_tech", "tech_blue") is True
    assert is_toc_layout("agenda_path", "interactive") is True
    assert is_toc_layout("timeline_evolution", "visual") is True
