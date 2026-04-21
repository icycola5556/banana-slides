import { describe, expect, it } from 'vitest';

import { getPreviewLayoutIds } from '@/data/layoutSchemeManifest';
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
  const getLayoutIds = (
    schemeId:
      | 'edu_dark'
      | 'tech_blue'
      | 'academic'
      | 'interactive'
      | 'visual'
      | 'practical'
      | 'modern'
      | 'minimal_clean'
      | 'warm_edu'
      | 'business_pro'
  ) =>
    layoutSchemePreviews[schemeId].pages.map((preview) => preview.page.layout_id);

  it.each([
    'edu_dark',
    'tech_blue',
    'academic',
    'interactive',
    'visual',
    'practical',
    'modern',
    'minimal_clean',
    'warm_edu',
    'business_pro',
  ] as const)('keeps %s homepage previews aligned with manifest ordering', (schemeId) => {
    expect(getLayoutIds(schemeId)).toEqual(getPreviewLayoutIds(schemeId));
  });

  it('keeps weak template previews off generic fallback ids', () => {
    for (const schemeId of ['tech_blue', 'interactive', 'visual', 'practical'] as const) {
      const layoutIds = getLayoutIds(schemeId);
      expect(layoutIds.every((layoutId) => !GENERIC_LAYOUT_IDS.has(layoutId))).toBe(true);
    }
  });
});
