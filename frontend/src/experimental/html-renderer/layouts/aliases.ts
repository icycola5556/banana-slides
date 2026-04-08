import type { LayoutId, LayoutModel, ThemeConfig } from '../types/schema';

export const LAYOUT_ID_ALIASES: Record<string, string> = {
  // academic
  cover_academic: 'cover',
  toc_academic: 'toc',
  quiz: 'title_content',
  key_concepts: 'title_bullets',
  key_takeaways: 'title_bullets',
  // interactive
  cover_interactive: 'cover',
  agenda_path: 'toc',
  story_narrative: 'vocational_content',
  group_collab: 'vocational_bullets',
  mind_map_structure: 'image_full',
  quiz_interaction: 'vocational_bullets',
  case_discussion: 'vocational_content',
  feedback_poll: 'vocational_content',
  discussion_card: 'vocational_content',
  reflection_quiz: 'title_bullets',
  role_play_scenario: 'vocational_content',
  warmup_inquiry: 'warmup_question',
  ending_interactive: 'ending',
  // visual
  cover_field: 'cover',
  timeline_evolution: 'timeline',
  field_observation: 'image_full',
  gallery_professional: 'portfolio',
  case_before_after: 'vocational_comparison',
  infographic_flow: 'vocational_bullets',
  site_survey: 'image_full',
  specimen_detail: 'detail_zoom',
  portfolio_industry: 'portfolio',
  ending_field: 'ending',
  // practical
  cover_practical: 'cover',
  checklist_verification: 'vocational_bullets',
  equipment_orientation: 'vocational_comparison',
  sop_vertical_steps: 'vertical_timeline',
  common_faults: 'vocational_comparison',
  technical_tip: 'quote',
  task_instruction: 'vocational_content',
  safety_protocol: 'safety_notice',
  detail_specs: 'vocational_content',
  ending_practical: 'ending',
  // vocational top-tier aesthetic
  vocational_intro_cover: 'vocational_intro_cover',
  vocational_mission_toc: 'vocational_mission_toc',
  vocational_target_lock: 'vocational_target_lock',
  vocational_safety_check: 'vocational_safety_check',
  vocational_equipment_grid: 'vocational_equipment_grid',
  vocational_fault_diagnostic: 'vocational_fault_diagnostic',
  vocational_practice_sandbox: 'vocational_practice_sandbox',
  vocational_mission_complete: 'vocational_mission_complete',
  vocational_sop_banner: 'vocational_sop_banner',
  vocational_warning_split: 'vocational_warning_split',
  vocational_blueprint_zoom: 'vocational_blueprint_zoom',
  vocational_piv_hud: 'vocational_piv_hud',
  // tech_blue
  cover_tech: 'cover',
  arch_blocks: 'vocational_content',
  flow_logic_sequence: 'process_steps',
  param_dashboard: 'edu_data_board',
  protocol_analysis: 'vocational_bullets',
  requirement_specs: 'vocational_bullets',
  system_comparison: 'vocational_comparison',
  tech_principle: 'vocational_content',
  toc_tech: 'toc',
  ending_tech: 'ending',
  // modern (management)
  cover_modern: 'cover',
  business_canvas: 'grid_matrix',
  comparison_matrix: 'vocational_comparison',
  legal_regulation: 'vocational_content',
  org_structure_flow: 'vocational_bullets',
  process_sop_standard: 'process_steps',
  stat_report: 'edu_data_board',
  strategic_pillars: 'tri_column',
  toc_modern: 'toc',
  ending_modern: 'ending',
};

export const normalizeLayoutId = (layoutId: LayoutId): LayoutId => {
  return (LAYOUT_ID_ALIASES[layoutId] || layoutId) as LayoutId;
};

export interface ResolvedThemeLayout {
  layoutId: LayoutId;
  model: Record<string, any>;
}

type LooseModel = Record<string, any>;

const asArray = <T>(value: T | T[] | undefined | null): T[] => {
  if (Array.isArray(value)) {
    return value;
  }

  const indexedItems = asIndexedArray<T>(value);
  if (indexedItems.length > 0) {
    return indexedItems;
  }

  return value == null ? [] : [value];
};

const asIndexedArray = <T = any>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (value && typeof value === 'object') {
    const items = Object.entries(value as Record<string, T>)
      .filter(([key]) => /^\d+$/.test(key))
      .sort((left, right) => Number(left[0]) - Number(right[0]))
      .map(([, item]) => item);

    if (items.length > 0) {
      return items;
    }
  }

  return [];
};

const ARRAY_LIKE_KEYS = new Set([
  'analysis',
  'annotations',
  'bars',
  'bullets',
  'categories',
  'columns',
  'content',
  'events',
  'features',
  'formulas',
  'hints',
  'items',
  'log_entries',
  'metrics',
  'nodes',
  'objectives',
  'options',
  'points',
  'reflection_blocks',
  'stages',
  'steps',
  'tags',
  'values',
]);

const normalizeArrayLikeCollections = (value: unknown, key?: string): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeArrayLikeCollections(item));
  }

  if (value && typeof value === 'object') {
    if (key && ARRAY_LIKE_KEYS.has(key)) {
      const indexedItems = asIndexedArray(value);
      if (indexedItems.length > 0) {
        return indexedItems.map((item) => normalizeArrayLikeCollections(item));
      }
    }

    const record: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([childKey, childValue]) => {
      record[childKey] = normalizeArrayLikeCollections(childValue, childKey);
    });
    return record;
  }

  return value;
};

const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const compact = <T>(values: Array<T | null | undefined | false | ''>): T[] =>
  values.filter(Boolean) as T[];

const objectivesToBullets = (objectives: any[] = []) =>
  objectives
    .map((objective) => {
      const bulletText = text(objective?.text);
      if (!bulletText) {
        return null;
      }

      const description = compact([
        text(objective?.level),
        objective?.hours ? `${objective.hours}h` : undefined,
      ]).join(' // ');

      return {
        text: bulletText,
        description: description || undefined,
      };
    })
    .filter(Boolean);

const endingLines = (source: LooseModel): string[] =>
  compact([
    text(source.content),
    text(source.closing),
    ...asArray(source.reflection_blocks).map((block: any) => {
      const blockTitle = text(block?.title);
      const items = asArray(block?.items)
        .map((item) => text(item))
        .filter(Boolean);
      const body = items.join('；');

      if (blockTitle && body) {
        return `${blockTitle}: ${body}`;
      }

      return blockTitle || body;
    }),
  ]);

const summaryLines = (source: LooseModel): string[] =>
  compact([
    text(source.content),
    text(source.closing),
    ...asArray(source.columns).map((column: any) => {
      const titleText = text(column?.title);
      const points = asArray(column?.points)
        .map((point) => text(point))
        .filter(Boolean);
      const body = points.join('；');

      if (titleText && body) {
        return `${titleText}: ${body}`;
      }

      return titleText || body;
    }),
  ]);

const COMPARISON_INTENT_PATTERN = /(vs\.?|对比|对决|比较|优劣|before|after|allow|stop|方案\s*[ab]|方案a|方案b|option\s*[ab])/i;

const hasStructuredComparison = (source: LooseModel): boolean =>
  Boolean(
    source.left && typeof source.left === 'object'
    || source.right && typeof source.right === 'object'
  );

const timelineEventsToSteps = (events: any[] = []) =>
  events.map((event, index) => ({
    number: index + 1,
    label: text(event?.title) || text(event?.year) || `STEP ${index + 1}`,
    description: text(event?.description) || undefined,
  }));

const detailAnnotationsToContent = (annotations: any[] = []) =>
  annotations
    .map((annotation) =>
      compact([text(annotation?.label), text(annotation?.description)]).join(' // ')
    )
    .filter(Boolean);

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => text(item)).filter(Boolean);
  }

  if (value && typeof value === 'object') {
    return asIndexedArray(value).map((item) => text(item)).filter(Boolean);
  }

  const single = text(value);
  return single ? [single] : [];
};

const portfolioSeedItems = (source: LooseModel): Array<{ title: string; description?: string }> =>
  compact([
    ...asIndexedArray(source.bullets).map((bullet: any) => {
      const title = text(typeof bullet === 'string' ? bullet : bullet?.text);
      const description = text(typeof bullet === 'string' ? '' : bullet?.description);
      if (!title && !description) {
        return null;
      }
      return { title: title || description, description: description || undefined };
    }),
    ...asArray(source.content).map((item) => {
      const title = text(item);
      return title ? { title } : null;
    }),
    ...toStringArray(source.points).map((point) => ({ title: point })),
    ...asIndexedArray(source.columns).map((column: any) => {
      const title = text(column?.title);
      const description = compact(toStringArray(column?.points)).join('；');
      if (!title && !description) {
        return null;
      }
      return {
        title: title || description,
        description: description || undefined,
      };
    }),
    ...(['left', 'right'] as const).map((side) => {
      const part = source[side];
      if (!part || typeof part !== 'object') {
        return null;
      }

      const title = text((part as any).header);
      const description = compact([
        ...toStringArray((part as any).content),
        ...toStringArray((part as any).bullets),
      ]).join('；');

      if (!title && !description) {
        return null;
      }

      return {
        title: title || description,
        description: description || undefined,
      };
    }),
  ]);

const ensurePortfolioItems = (source: LooseModel) => {
  const rawItems = asIndexedArray<any>(source.items);
  const fallbackItems = portfolioSeedItems(source);
  const desiredLength = Math.max(rawItems.length, fallbackItems.length, text(source.subtitle) ? 1 : 0);

  if (desiredLength === 0) {
    return [];
  }

  return Array.from({ length: desiredLength })
    .map((_, index) => {
      const rawItem = rawItems[index] && typeof rawItems[index] === 'object' ? rawItems[index] : {};
      const fallback = fallbackItems[index];
      const title = text((rawItem as any).title) || fallback?.title || (index === 0 ? text(source.subtitle) : '') || `案例 ${index + 1}`;
      const description =
        text((rawItem as any).description)
        || fallback?.description
        || undefined;
      const image_src = text((rawItem as any).image_src) || '';
      const tags = toStringArray((rawItem as any).tags);

      if (!title && !description && !image_src) {
        return null;
      }

      return {
        image_src,
        title,
        description,
        tags: tags.length > 0 ? tags : undefined,
      };
    })
    .filter(Boolean);
};

const imageFullToVocationalZoom = (source: LooseModel): LooseModel => ({
  title: text(source.title) || text(source.image_alt) || 'MODULE OVERVIEW',
  image_src: source.image_src,
  annotations: [
    {
      x: 58,
      y: 48,
      label: 'OVERVIEW',
      description:
        text(source.caption) ||
        text(source.image_alt) ||
        text(source.title) ||
        'Key structural focus',
    },
  ],
  background_image: source.background_image,
});

const comparisonTableToVaultCompare = (source: LooseModel): LooseModel => {
  const items = asArray(source.items);
  const maxFeatureCount = Math.max(0, ...items.map((item: any) => asArray(item?.features).length));
  const rowCount = maxFeatureCount || items.length || 1;

  return {
    title: source.title,
    subtitle: text(source.subtitle) || text(source.conclusion) || undefined,
    categories: Array.from({ length: rowCount }, (_, index) => ({
      name: `POINT ${String(index + 1).padStart(2, '0')}`,
    })),
    options: items.map((item: any) => ({
      name: text(item?.name) || 'OPTION',
      values: Array.from({ length: rowCount }, (_, index) => {
        const feature = asArray(item?.features)[index];
        return text(feature) || text(item?.description) || '-';
      }),
    })),
    background_image: source.background_image,
  };
};

const triCompareToVaultCompare = (source: LooseModel): LooseModel => {
  const columns = asArray(source.columns);
  const maxPointCount = Math.max(0, ...columns.map((column: any) => asArray(column?.points).length));
  const rowCount = maxPointCount || columns.length || 1;

  return {
    title: source.title,
    subtitle: text(source.badge) || text(source.subtitle) || undefined,
    categories: Array.from({ length: rowCount }, (_, index) => ({
      name: `POINT ${String(index + 1).padStart(2, '0')}`,
    })),
    options: columns.map((column: any) => ({
      name: text(column?.title) || 'COLUMN',
      values: Array.from({ length: rowCount }, (_, index) => text(asArray(column?.points)[index]) || '-'),
    })),
    background_image: source.background_image,
  };
};

export const resolveThemeLayout = (
  layoutId: LayoutId,
  model: LayoutModel,
  theme?: ThemeConfig | null
): ResolvedThemeLayout => {
  const normalizedLayoutId = normalizeLayoutId(layoutId);
  const source = normalizeArrayLikeCollections({
    ...(model as LooseModel),
  }) as LooseModel;

  if (normalizedLayoutId === 'portfolio') {
    source.items = ensurePortfolioItems(source);
  }

  if (!theme?.id) {
    return { layoutId: normalizedLayoutId, model: source };
  }

  if (theme.id === 'minimal_clean') {
    switch (normalizedLayoutId) {
      case 'cover':
        return { layoutId: 'blueprint_cover', model: source };
      case 'toc':
        return { layoutId: 'blueprint_toc', model: source };
      case 'quote':
        return { layoutId: 'blueprint_quote', model: source };
      case 'section_title':
        return { layoutId: 'blueprint_section_title', model: source };
      case 'ending':
        return {
          layoutId: 'blueprint_closing',
          model: {
            ...source,
            subtitle: text(source.subtitle) || text(source.closing) || endingLines(source)[0] || undefined,
          },
        };
      case 'two_column':
        return { layoutId: 'blueprint_dual_panel', model: source };
      case 'timeline':
        return { layoutId: 'blueprint_timeline', model: source };
      case 'portfolio':
        return { layoutId: 'blueprint_gallery', model: source };
      case 'learning_objectives':
        return {
          layoutId: 'blueprint_spec_card',
          model: {
            title: source.title,
            subtitle: text(source.course_code) || undefined,
            bullets: objectivesToBullets(asArray(source.objectives)),
            background_image: source.background_image,
          },
        };
      case 'title_bullets':
        return { layoutId: 'blueprint_bento_grid', model: source };
      case 'edu_tri_compare':
        return { layoutId: 'blueprint_tri_compare', model: source };
      case 'title_content':
        return {
          layoutId: 'blueprint_annotation',
          model: {
            title: source.title,
            content: compact([
              ...asArray(source.content).map((item) => text(item)),
              text(source.highlight),
            ]),
            image: source.image,
            image_src: source.image_src,
            annotations: source.annotations,
            background_image: source.background_image,
          },
        };
      case 'detail_zoom':
        return {
          layoutId: 'blueprint_annotation',
          model: {
            title: source.title,
            content: detailAnnotationsToContent(asArray(source.annotations)),
            image: source.image,
            image_src: source.image_src,
            annotations: source.annotations,
            background_image: source.background_image,
          },
        };
      default:
        return { layoutId: normalizedLayoutId, model: source };
    }
  }

  if (theme.id === 'warm_edu') {
    switch (normalizedLayoutId) {
      case 'cover':
        return { layoutId: 'vocational_intro_cover', model: source };
      case 'toc':
        return { layoutId: 'vocational_mission_toc', model: source };
      case 'learning_objectives':
        return {
          layoutId: 'vocational_target_lock',
          model: {
            title: source.title,
            subtitle: text(source.course_code) || undefined,
            bullets: objectivesToBullets(asArray(source.objectives)),
            background_image: source.background_image,
          },
        };
      case 'warmup_question':
        return {
          layoutId: 'vocational_fault_diagnostic',
          model: {
            title: source.question,
            subtitle: source.thinkTime ? `THINK TIME // ${source.thinkTime}S` : undefined,
            content: compact([
              text(source.instruction),
              ...asArray(source.hints).map((hint) => text(hint)),
            ]),
            background_image: source.background_image,
          },
        };
      case 'image_full':
        return { layoutId: 'vocational_blueprint_zoom', model: imageFullToVocationalZoom(source) };
      case 'title_content':
        return { layoutId: 'vocational_content', model: source };
      case 'title_bullets':
        return { layoutId: 'vocational_safety_check', model: source };
      case 'process_steps':
        return { layoutId: 'vocational_sop_banner', model: source };
      case 'vertical_timeline':
        return {
          layoutId: 'vocational_sop_banner',
          model: {
            title: source.title,
            subtitle: text(source.subtitle) || undefined,
            steps: timelineEventsToSteps(asArray(source.events)),
            background_image: source.background_image,
          },
        };
      case 'two_column':
        return { layoutId: 'vocational_warning_split', model: source };
      case 'vocational_comparison':
        return (
          hasStructuredComparison(source)
          || COMPARISON_INTENT_PATTERN.test(text(source.title))
          || COMPARISON_INTENT_PATTERN.test(text(source.subtitle))
        )
          ? { layoutId: 'vocational_comparison', model: source }
          : { layoutId: 'vocational_content', model: source };
      case 'detail_zoom':
        return { layoutId: 'vocational_blueprint_zoom', model: source };
      case 'edu_data_board':
        return { layoutId: 'vocational_piv_hud', model: source };
      case 'edu_summary':
        return {
          layoutId: 'vocational_mission_complete',
          model: {
            title: source.title || 'MISSION COMPLETE',
            subtitle: text(source.subtitle) || 'OPERATION CONCLUDED',
            content: summaryLines(source).join(' '),
            columns: asArray(source.columns),
            closing: text(source.closing) || undefined,
            variant: source.variant,
            layout_variant: source.layout_variant,
            background_image: source.background_image,
          },
        };
      case 'ending':
        return {
          layoutId: 'vocational_mission_complete',
          model: {
            title: source.title || 'MISSION COMPLETE',
            subtitle: text(source.subtitle) || 'OPERATION CONCLUDED',
            content: endingLines(source).join(' '),
            reflection_blocks: asArray(source.reflection_blocks),
            contact: text(source.contact) || undefined,
            closing: text(source.closing) || undefined,
            variant: source.variant,
            layout_variant: source.layout_variant,
            background_image: source.background_image,
          },
        };
      default:
        return { layoutId: normalizedLayoutId, model: source };
    }
  }

  if (theme.id === 'business_pro') {
    switch (normalizedLayoutId) {
      case 'cover':
        return { layoutId: 'vault_cover', model: source };
      case 'toc':
        return { layoutId: 'vault_index', model: source };
      case 'ending':
        return {
          layoutId: 'vault_debrief',
          model: {
            title: source.title,
            subtitle: text(source.subtitle) || undefined,
            content: endingLines(source).join(' '),
            keyTakeaway: text(source.closing) || undefined,
            background_image: source.background_image,
          },
        };
      case 'edu_summary':
        return {
          layoutId: 'vault_debrief',
          model: {
            title: source.title,
            subtitle: text(source.subtitle) || undefined,
            content: summaryLines(source).join(' '),
            keyTakeaway: text(source.closing) || undefined,
            background_image: source.background_image,
          },
        };
      case 'two_column':
        return { layoutId: 'vault_split_brief', model: source };
      case 'process_steps':
        return { layoutId: 'vault_flow_circuit', model: source };
      case 'timeline':
        return {
          layoutId: 'vault_timeline',
          model: {
            title: source.title,
            subtitle: text(source.subtitle) || undefined,
            steps: source.steps || timelineEventsToSteps(asArray(source.events)),
            background_image: source.background_image,
          },
        };
      case 'title_bullets':
        return { layoutId: 'vault_kpi_grid', model: source };
      case 'title_content':
        return {
          layoutId: 'vault_deep_analysis',
          model: {
            title: source.title,
            subtitle: text(source.subtitle) || undefined,
            content: compact(asArray(source.content).map((item) => text(item))).join('\n\n'),
            bullets: text(source.highlight)
              ? [{ text: 'HIGHLIGHT', description: text(source.highlight) }]
              : [],
            sidebar_title: 'ANALYSIS //',
            background_image: source.background_image,
          },
        };
      case 'edu_data_board':
        return { layoutId: 'vault_dashboard', model: source };
      case 'comparison_table':
        return { layoutId: 'vault_compare', model: comparisonTableToVaultCompare(source) };
      case 'edu_tri_compare':
        return { layoutId: 'vault_compare', model: triCompareToVaultCompare(source) };
      default:
        return { layoutId: normalizedLayoutId, model: source };
    }
  }

  return { layoutId: normalizedLayoutId, model: source };
};
