import { describe, expect, it } from 'vitest';

import { layoutSchemePreviews } from '@/data/layoutSchemePreviews';

const GENERIC_LAYOUT_IDS = new Set([
  'cover',
  'toc',
  'title_content',
  'title_bullets',
  'two_column',
  'image_full',
  'portfolio',
  'timeline',
  'vertical_timeline',
  'quote',
  'process_steps',
  'ending',
  'warmup_question',
  'poll_interactive',
  'safety_notice',
  'detail_zoom',
]);

describe('weak template preview seeds', () => {
  const getLayoutIds = (schemeId: 'tech_blue' | 'interactive' | 'visual' | 'practical') =>
    layoutSchemePreviews[schemeId].pages.map((preview) => preview.page.layout_id);

  it('uses canonical tech_blue layout ids in homepage previews', () => {
    expect(getLayoutIds('tech_blue')).toEqual([
      'cover_tech',
      'toc_tech',
      'arch_blocks',
      'flow_logic_sequence',
      'param_dashboard',
      'protocol_analysis',
      'requirement_specs',
      'system_comparison',
      'tech_principle',
      'ending_tech',
    ]);
  });

  it('uses canonical interactive layout ids in homepage previews', () => {
    expect(getLayoutIds('interactive')).toEqual([
      'cover_interactive',
      'agenda_path',
      'warmup_inquiry',
      'feedback_poll',
      'case_discussion',
      'group_collab',
      'mind_map_structure',
      'quiz_interaction',
      'role_play_scenario',
      'ending_interactive',
    ]);
  });

  it('uses canonical visual layout ids in homepage previews', () => {
    expect(getLayoutIds('visual')).toEqual([
      'cover_field',
      'timeline_evolution',
      'field_observation',
      'gallery_professional',
      'case_before_after',
      'infographic_flow',
      'site_survey',
      'specimen_detail',
      'portfolio_industry',
      'ending_field',
    ]);
  });

  it('uses canonical practical layout ids in homepage previews', () => {
    expect(getLayoutIds('practical')).toEqual([
      'cover_practical',
      'checklist_verification',
      'safety_protocol',
      'equipment_orientation',
      'sop_vertical_steps',
      'task_instruction',
      'common_faults',
      'technical_tip',
      'detail_specs',
      'ending_practical',
    ]);
  });

  it('keeps weak template previews off generic fallback ids', () => {
    for (const schemeId of ['tech_blue', 'interactive', 'visual', 'practical'] as const) {
      const layoutIds = getLayoutIds(schemeId);
      expect(layoutIds.every((layoutId) => !GENERIC_LAYOUT_IDS.has(layoutId))).toBe(true);
    }
  });
});
