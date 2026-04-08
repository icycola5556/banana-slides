"""Compatibility re-exports for legacy schema imports.

Keep schema metadata anchored to ``services.prompts.layouts`` so weak-template
layout ids do not diverge between prompt generation and renderer resolution.
"""

from .layouts import (
    LAYOUT_ID_ALIASES,
    LAYOUT_SCHEMAS,
    LAYOUT_SCHEMES,
    SCHEME_ROLE_LAYOUTS,
    get_layout_scheme,
    get_layout_types_description,
    get_scheme_style_prompt,
    resolve_layout_id,
)

__all__ = [
    "LAYOUT_ID_ALIASES",
    "LAYOUT_SCHEMAS",
    "LAYOUT_SCHEMES",
    "SCHEME_ROLE_LAYOUTS",
    "get_layout_scheme",
    "get_layout_types_description",
    "get_scheme_style_prompt",
    "resolve_layout_id",
]
