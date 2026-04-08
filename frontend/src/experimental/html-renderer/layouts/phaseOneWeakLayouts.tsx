import React from 'react';

import type {
  CoverModel,
  DetailZoomModel,
  EduDataBoardModel,
  EndingModel,
  ImageFullModel,
  LayoutId,
  OptionalImage,
  PollInteractiveModel,
  ProcessStepsModel,
  SafetyNoticeModel,
  ThemeConfig,
  TimelineModel,
  TitleBulletsModel,
  TitleContentModel,
  TwoColumnModel,
} from '../types/schema';
import {
  ImageFullLayout,
  ProcessStepsLayout,
  renderProcessStepsLayoutHTML,
  renderImageFullLayoutHTML,
  TitleBulletsLayout,
  renderTitleBulletsLayoutHTML,
  TitleContentLayout,
  renderTitleContentLayoutHTML,
  TwoColumnLayout,
  renderTwoColumnLayoutHTML,
} from './common';
import { EduDataBoardLayout, renderEduDataBoardLayoutHTML } from './edu-dark';
import { PollInteractiveLayout, renderPollInteractiveLayoutHTML } from './interactive';
import {
  DetailZoomLayout,
  renderDetailZoomLayoutHTML,
  SafetyNoticeLayout,
  renderSafetyNoticeLayoutHTML,
} from './practical';
import { TimelineLayout, renderTimelineLayoutHTML } from './visual';
import {
  getBaseSlideStyle,
  getCardStyle,
  getTitleStyle,
  toCSS,
  toInlineStyle,
} from '../utils/styleHelper';

type PhaseOneWeakLayoutId =
  | 'cover_tech'
  | 'toc_tech'
  | 'ending_tech'
  | 'arch_blocks'
  | 'param_dashboard'
  | 'protocol_analysis'
  | 'system_comparison'
  | 'tech_principle'
  | 'cover_interactive'
  | 'agenda_path'
  | 'quiz_interaction'
  | 'role_play_scenario'
  | 'feedback_poll'
  | 'group_collab'
  | 'case_discussion'
  | 'ending_interactive'
  | 'cover_practical'
  | 'checklist_verification'
  | 'common_faults'
  | 'detail_specs'
  | 'safety_protocol'
  | 'equipment_orientation'
  | 'ending_practical'
  | 'cover_field'
  | 'timeline_evolution'
  | 'field_observation'
  | 'infographic_flow'
  | 'specimen_detail'
  | 'case_before_after'
  | 'site_survey'
  | 'ending_field'
  | 'flow_logic_sequence'
  | 'requirement_specs'
  | 'mind_map_structure'
  | 'task_instruction';

const PHASE_ONE_WEAK_LAYOUT_IDS = new Set<PhaseOneWeakLayoutId>([
  'cover_tech',
  'toc_tech',
  'ending_tech',
  'arch_blocks',
  'param_dashboard',
  'protocol_analysis',
  'system_comparison',
  'tech_principle',
  'cover_interactive',
  'agenda_path',
  'quiz_interaction',
  'role_play_scenario',
  'feedback_poll',
  'group_collab',
  'case_discussion',
  'ending_interactive',
  'cover_practical',
  'checklist_verification',
  'common_faults',
  'detail_specs',
  'safety_protocol',
  'equipment_orientation',
  'ending_practical',
  'cover_field',
  'timeline_evolution',
  'field_observation',
  'infographic_flow',
  'specimen_detail',
  'case_before_after',
  'site_survey',
  'ending_field',
  'flow_logic_sequence',
  'requirement_specs',
  'mind_map_structure',
  'task_instruction',
]);

const text = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const asArray = <T,>(value: T | T[] | undefined | null): T[] => {
  if (Array.isArray(value)) {
    return value;
  }
  return value == null ? [] : [value];
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => text(item)).filter(Boolean);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  return [];
};

const compact = <T,>(values: Array<T | null | undefined | false | ''>): T[] =>
  values.filter(Boolean) as T[];

const buildOptionalImage = (
  src: unknown,
  alt: unknown,
  position: 'left' | 'right' = 'right',
  width = '42%'
): OptionalImage | undefined => {
  const normalizedSrc = text(src);
  if (!normalizedSrc) {
    return undefined;
  }
  return {
    src: normalizedSrc,
    alt: text(alt) || undefined,
    position,
    width,
  };
};

const normalizeBullet = (item: unknown): TitleBulletsModel['bullets'][number] | null => {
  if (typeof item === 'string') {
    const trimmed = item.trim();
    return trimmed ? { text: trimmed } : null;
  }

  if (!item || typeof item !== 'object') {
    return null;
  }

  const record = item as Record<string, unknown>;
  const bulletText =
    text(record.text)
    || text(record.title)
    || text(record.name)
    || text(record.label);
  const bulletDescription =
    text(record.description)
    || text(record.definition)
    || text(record.summary)
    || text(record.detail);

  if (!bulletText && !bulletDescription) {
    return null;
  }

  return {
    icon: text(record.icon) || undefined,
    text: bulletText || bulletDescription,
    description: bulletDescription || undefined,
    example: text(record.example) || undefined,
    note: text(record.note) || undefined,
  };
};

const toBulletList = (value: unknown): TitleBulletsModel['bullets'] =>
  asArray(value).map(normalizeBullet).filter(Boolean) as TitleBulletsModel['bullets'];

const toStepList = (value: unknown): ProcessStepsModel['steps'] =>
  asArray(value)
    .map((item, index) => {
      if (typeof item === 'string') {
        const label = item.trim();
        return label ? { number: index + 1, label } : null;
      }

      if (!item || typeof item !== 'object') {
        return null;
      }

      const record = item as Record<string, unknown>;
      const label =
        text(record.label)
        || text(record.title)
        || text(record.name)
        || text(record.text);

      if (!label) {
        return null;
      }

      const numericOrder = Number(record.number);
      return {
        number: Number.isFinite(numericOrder) && numericOrder > 0 ? numericOrder : index + 1,
        label,
        description:
          text(record.description)
          || text(record.summary)
          || text(record.content)
          || undefined,
        icon: text(record.icon) || undefined,
      };
    })
    .filter(Boolean) as ProcessStepsModel['steps'];

type RoleNavItem = {
  index: number;
  text: string;
  description?: string;
};

type TechTocModel = {
  title: string;
  subtitle?: string;
  items: RoleNavItem[];
  summary?: string;
  background_image?: string;
};

type AgendaPathModel = {
  title: string;
  subtitle?: string;
  items: RoleNavItem[];
  instruction?: string;
  background_image?: string;
};

const toRoleNavItems = (value: unknown): RoleNavItem[] =>
  asArray(value)
    .map((item, index) => {
      if (typeof item === 'string') {
        const label = item.trim();
        return label ? { index: index + 1, text: label } : null;
      }

      if (!item || typeof item !== 'object') {
        return null;
      }

      const record = item as Record<string, unknown>;
      const label =
        text(record.text)
        || text(record.title)
        || text(record.name)
        || text(record.label);
      if (!label) {
        return null;
      }

      const numericIndex = Number(record.index);
      return {
        index: Number.isFinite(numericIndex) && numericIndex > 0 ? numericIndex : index + 1,
        text: label,
        description:
          text(record.description)
          || text(record.subtitle)
          || text(record.summary)
          || undefined,
      };
    })
    .filter(Boolean) as RoleNavItem[];

const toTechTocModel = (source: Record<string, unknown>): TechTocModel => {
  const items = toRoleNavItems(source.items).length > 0
    ? toRoleNavItems(source.items)
    : toRoleNavItems(source.points);

  return {
    title: text(source.title) || 'Tech outline',
    subtitle: text(source.subtitle) || text(source.summary) || 'Architecture / Protocol / Delivery',
    items,
    summary: text(source.summary) || text(source.highlight) || undefined,
    background_image: text(source.background_image) || undefined,
  };
};

const toAgendaPathModel = (source: Record<string, unknown>): AgendaPathModel => {
  const items = toRoleNavItems(source.items).length > 0
    ? toRoleNavItems(source.items)
    : toRoleNavItems(source.steps).length > 0
      ? toRoleNavItems(source.steps)
      : toRoleNavItems(source.points);

  return {
    title: text(source.title) || 'Learning path',
    subtitle: text(source.subtitle) || 'Warm-up -> discussion -> transfer',
    items,
    instruction:
      text(source.instruction)
      || text(source.summary)
      || text(source.keyTakeaway)
      || undefined,
    background_image: text(source.background_image) || undefined,
  };
};

const toDirectCoverModel = (
  source: Record<string, unknown>,
  fallbackTitle: string
): CoverModel => ({
  title: text(source.title) || fallbackTitle,
  subtitle: text(source.subtitle) || undefined,
  author: text(source.author) || undefined,
  department: text(source.department) || undefined,
  date: text(source.date) || undefined,
  background_image: text(source.background_image) || undefined,
});

const toReflectionBlocks = (
  value: unknown,
  fallbackTitle = 'Focus'
): EndingModel['reflection_blocks'] =>
  asArray(value)
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((block, index) => ({
      title: text(block.title) || `${fallbackTitle} ${index + 1}`,
      items: toStringArray(block.items),
    }));

const toEndingTechModel = (source: Record<string, unknown>): EndingModel => ({
  title: text(source.title) || 'Tech debrief',
  subtitle: text(source.subtitle) || undefined,
  contact: text(source.contact) || undefined,
  reflection_blocks: toReflectionBlocks(source.reflection_blocks),
  closing:
    text(source.closing)
    || text(source.summary)
    || text(source.highlight)
    || undefined,
  background_image: text(source.background_image) || undefined,
});

const toDirectEndingModel = (
  source: Record<string, unknown>,
  fallbackTitle: string
): EndingModel => ({
  title: text(source.title) || fallbackTitle,
  subtitle: text(source.subtitle) || undefined,
  contact: text(source.contact) || undefined,
  reflection_blocks: toReflectionBlocks(source.reflection_blocks),
  closing:
    text(source.closing)
    || text(source.summary)
    || text(source.highlight)
    || undefined,
  background_image: text(source.background_image) || undefined,
});

const toTimelineEvolutionModel = (source: Record<string, unknown>): TimelineModel => {
  const explicitEvents = asArray(source.events)
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((event, index) => ({
      year: text(event.year) || text(event.index) || String(index + 1).padStart(2, '0'),
      title: text(event.title) || text(event.text) || `Stage ${index + 1}`,
      description: text(event.description) || text(event.summary) || '',
      icon: text(event.icon) || undefined,
    }))
    .filter((event) => Boolean(event.title));

  const items = toRoleNavItems(source.items).length > 0
    ? toRoleNavItems(source.items)
    : toRoleNavItems(source.points);

  const events = explicitEvents.length > 0
    ? explicitEvents
    : items.map((item) => ({
      year: String(item.index).padStart(2, '0'),
      title: item.text,
      description: item.description || 'Narrative milestone',
      icon: undefined,
    }));

  return {
    title: text(source.title) || 'Evolution timeline',
    events,
    orientation: events.length > 4 ? 'vertical' : 'horizontal',
    background_image: text(source.background_image) || undefined,
  };
};

const toArchBlocksModel = (source: Record<string, unknown>): TitleContentModel => {
  const blocks = asArray(source.blocks).filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'));
  const blockLines = blocks
    .map((block) => {
      const blockTitle = text(block.title) || text(block.label) || text(block.name);
      const blockDescription = text(block.description) || text(block.summary) || text(block.content);
      if (blockTitle && blockDescription) {
        return `${blockTitle}: ${blockDescription}`;
      }
      return blockTitle || blockDescription;
    })
    .filter(Boolean);

  return {
    title: text(source.title) || '技术架构',
    content: blockLines.length > 0 ? blockLines : toStringArray(source.content),
    highlight: text(source.highlight) || text(source.subtitle) || undefined,
    image: buildOptionalImage((source.image as Record<string, unknown> | undefined)?.src, (source.image as Record<string, unknown> | undefined)?.alt),
    background_image: text(source.background_image) || undefined,
  };
};

const toParamDashboardModel = (source: Record<string, unknown>): EduDataBoardModel => ({
  title: text(source.title) || '性能看板',
  subtitle: text(source.subtitle) || undefined,
  metrics: Array.isArray(source.metrics) ? (source.metrics as EduDataBoardModel['metrics']) : [],
  bars: Array.isArray(source.bars) ? (source.bars as EduDataBoardModel['bars']) : [],
  bullets: toBulletList(source.bullets),
  insight: text(source.insight) || undefined,
  background_image: text(source.background_image) || undefined,
});

const toFlowLogicSequenceModel = (source: Record<string, unknown>): ProcessStepsModel => {
  const steps = toStepList(source.steps);
  return {
    title: text(source.title) || 'Flow Logic Sequence',
    subtitle: text(source.subtitle) || undefined,
    steps: steps.length > 0 ? steps : toStepList(source.sequence).length > 0 ? toStepList(source.sequence) : toStepList(source.stages),
    image: buildOptionalImage(
      (source.image as Record<string, unknown> | undefined)?.src ?? source.image_src,
      (source.image as Record<string, unknown> | undefined)?.alt ?? source.image_alt
    ),
    background_image: text(source.background_image) || undefined,
  };
};

const toProtocolAnalysisModel = (source: Record<string, unknown>): TitleBulletsModel => {
  const fields = toBulletList(source.fields);
  return {
    title: text(source.title) || '协议拆解',
    subtitle: text(source.subtitle) || undefined,
    bullets: fields.length > 0 ? fields : toBulletList(source.bullets),
    keyTakeaway: text(source.keyTakeaway) || text(source.summary) || undefined,
    image: buildOptionalImage((source.image as Record<string, unknown> | undefined)?.src, (source.image as Record<string, unknown> | undefined)?.alt),
    background_image: text(source.background_image) || undefined,
  };
};

const toSystemComparisonModel = (source: Record<string, unknown>): TwoColumnModel => ({
  title: text(source.title) || 'System comparison',
  left: {
    type: text(((source.left as Record<string, unknown> | undefined) || {}).image_src) ? 'image' : text(((source.left as Record<string, unknown> | undefined) || {}).type) === 'text' ? 'text' : 'bullets',
    header: text(((source.left as Record<string, unknown> | undefined) || {}).header) || 'Option A',
    content: toStringArray(((source.left as Record<string, unknown> | undefined) || {}).content),
    bullets: toBulletList(((source.left as Record<string, unknown> | undefined) || {}).bullets),
    image_src: text(((source.left as Record<string, unknown> | undefined) || {}).image_src) || undefined,
    image_alt: text(((source.left as Record<string, unknown> | undefined) || {}).image_alt) || undefined,
  },
  right: {
    type: text(((source.right as Record<string, unknown> | undefined) || {}).image_src) ? 'image' : text(((source.right as Record<string, unknown> | undefined) || {}).type) === 'text' ? 'text' : 'bullets',
    header: text(((source.right as Record<string, unknown> | undefined) || {}).header) || 'Option B',
    content: toStringArray(((source.right as Record<string, unknown> | undefined) || {}).content),
    bullets: toBulletList(((source.right as Record<string, unknown> | undefined) || {}).bullets),
    image_src: text(((source.right as Record<string, unknown> | undefined) || {}).image_src) || undefined,
    image_alt: text(((source.right as Record<string, unknown> | undefined) || {}).image_alt) || undefined,
  },
  background_image: text(source.background_image) || undefined,
});

const toTechPrincipleModel = (source: Record<string, unknown>): TitleContentModel => ({
  title: text(source.title) || 'Tech principle',
  content:
    toStringArray(source.principles).length > 0
      ? toStringArray(source.principles)
      : toStringArray(source.content),
  highlight:
    text(source.highlight)
    || text(source.keyTakeaway)
    || text(source.summary)
    || undefined,
  image: buildOptionalImage(
    (source.image as Record<string, unknown> | undefined)?.src ?? source.image_src,
    (source.image as Record<string, unknown> | undefined)?.alt ?? source.image_alt
  ),
  background_image: text(source.background_image) || undefined,
});

const toRequirementSpecsModel = (source: Record<string, unknown>): TitleBulletsModel => {
  const requirements = toBulletList(source.requirements);
  const specs = toBulletList(source.specs);
  return {
    title: text(source.title) || 'Requirement Specs',
    subtitle: text(source.subtitle) || undefined,
    bullets:
      requirements.length > 0
        ? requirements
        : specs.length > 0
          ? specs
          : toBulletList(source.bullets),
    keyTakeaway:
      text(source.keyTakeaway)
      || text(source.highlight)
      || text(source.summary)
      || undefined,
    image: buildOptionalImage(
      (source.image as Record<string, unknown> | undefined)?.src ?? source.image_src,
      (source.image as Record<string, unknown> | undefined)?.alt ?? source.image_alt
    ),
    background_image: text(source.background_image) || undefined,
  };
};

const toQuizInteractionModel = (source: Record<string, unknown>): TitleBulletsModel => ({
  title: text(source.title) || 'Quiz Interaction',
  subtitle: text(source.subtitle) || undefined,
  bullets:
    toBulletList(source.questions).length > 0
      ? toBulletList(source.questions)
      : toBulletList(source.options).length > 0
        ? toBulletList(source.options)
        : toBulletList(source.bullets),
  keyTakeaway:
    text(source.keyTakeaway)
    || text(source.answer)
    || text(source.highlight)
    || undefined,
  image: buildOptionalImage(
    (source.image as Record<string, unknown> | undefined)?.src ?? source.image_src,
    (source.image as Record<string, unknown> | undefined)?.alt ?? source.image_alt
  ),
  background_image: text(source.background_image) || undefined,
});

const toFeedbackPollModel = (source: Record<string, unknown>): PollInteractiveModel => {
  const options = asArray(source.options)
    .map((item) => {
      if (typeof item === 'string') {
        return { text: item };
      }
      if (!item || typeof item !== 'object') {
        return null;
      }
      const record = item as Record<string, unknown>;
      const optionText = text(record.text) || text(record.label) || text(record.title);
      if (!optionText) {
        return null;
      }
      return {
        text: optionText,
        emoji: text(record.emoji) || undefined,
      };
    })
    .filter(Boolean) as PollInteractiveModel['options'];

  return {
    question: text(source.question) || text(source.title) || '请快速反馈当前判断',
    options,
    instruction: text(source.instruction) || text(source.subtitle) || undefined,
    background_image: text(source.background_image) || undefined,
  };
};

const toGroupCollabModel = (source: Record<string, unknown>): TitleBulletsModel => {
  const tasks = toBulletList(source.tasks);
  return {
    title: text(source.title) || '协作任务',
    subtitle: text(source.subtitle) || undefined,
    bullets: tasks.length > 0 ? tasks : toBulletList(source.bullets),
    keyTakeaway: text(source.keyTakeaway) || text(source.summary) || undefined,
    background_image: text(source.background_image) || undefined,
  };
};

const toCaseDiscussionModel = (source: Record<string, unknown>): TwoColumnModel => {
  const prompts = toBulletList(source.discussion_points);
  const outputs = toBulletList(source.expected_outputs);
  const rightBullets = [...prompts, ...outputs];
  const left = ((source.left as Record<string, unknown> | undefined) || {}) as Record<string, unknown>;
  const right = ((source.right as Record<string, unknown> | undefined) || {}) as Record<string, unknown>;

  return {
    title: text(source.title) || '案例研讨',
    left: {
      type: text(left.image_src) || text(source.case_image) ? 'image' : text(left.type) === 'bullets' ? 'bullets' : 'text',
      header: text(left.header) || text(source.scenario_title) || '案例背景',
      content: toStringArray(left.content).length > 0 ? toStringArray(left.content) : toStringArray(source.scenario),
      bullets: toBulletList(left.bullets),
      image_src: text(left.image_src) || text(source.case_image) || undefined,
      image_alt: text(left.image_alt) || text(source.case_image_alt) || undefined,
    },
    right: {
      type: text(right.type) === 'text' ? 'text' : 'bullets',
      header: text(right.header) || text(source.prompt_title) || '讨论引导',
      content: toStringArray(right.content).length > 0 ? toStringArray(right.content) : toStringArray(source.prompt),
      bullets: toBulletList(right.bullets).length > 0 ? toBulletList(right.bullets) : rightBullets,
    },
    background_image: text(source.background_image) || undefined,
  };
};

const toRolePlayScenarioModel = (source: Record<string, unknown>): TitleContentModel => ({
  title: text(source.title) || 'Role Play Scenario',
  content:
    toStringArray(source.scenario).length > 0
      ? toStringArray(source.scenario)
      : toStringArray(source.content),
  highlight:
    text(source.highlight)
    || text(source.role)
    || text(source.summary)
    || undefined,
  image: buildOptionalImage(
    (source.image as Record<string, unknown> | undefined)?.src ?? source.image_src,
    (source.image as Record<string, unknown> | undefined)?.alt ?? source.image_alt
  ),
  background_image: text(source.background_image) || undefined,
});

const toInfographicFlowModel = (source: Record<string, unknown>): TitleBulletsModel => ({
  title: text(source.title) || 'Infographic flow',
  subtitle: text(source.subtitle) || undefined,
  bullets:
    toBulletList(source.flow).length > 0
      ? toBulletList(source.flow)
      : toBulletList(source.bullets),
  keyTakeaway:
    text(source.keyTakeaway)
    || text(source.highlight)
    || text(source.summary)
    || undefined,
  image: buildOptionalImage(
    (source.image as Record<string, unknown> | undefined)?.src ?? source.image_src,
    (source.image as Record<string, unknown> | undefined)?.alt ?? source.image_alt
  ),
  background_image: text(source.background_image) || undefined,
});

const toMindMapStructureModel = (source: Record<string, unknown>): ImageFullModel => ({
  title: text(source.title) || 'Mind Map Structure',
  image_src:
    text(source.image_src)
    || text(source.mind_map_image)
    || text((source.image as Record<string, unknown> | undefined)?.src),
  image_alt:
    text(source.image_alt)
    || text(source.title)
    || text((source.image as Record<string, unknown> | undefined)?.alt)
    || undefined,
  caption:
    text(source.caption)
    || text(source.summary)
    || text(source.description)
    || text(source.highlight)
    || undefined,
  background_image: text(source.background_image) || undefined,
});

const toChecklistVerificationModel = (source: Record<string, unknown>): TitleBulletsModel => ({
  title: text(source.title) || '核查清单',
  subtitle: text(source.subtitle) || undefined,
  bullets: toBulletList(source.checklist).length > 0 ? toBulletList(source.checklist) : toBulletList(source.bullets),
  keyTakeaway: text(source.keyTakeaway) || text(source.summary) || undefined,
  background_image: text(source.background_image) || undefined,
});

const toTaskInstructionModel = (source: Record<string, unknown>): TitleContentModel => ({
  title: text(source.title) || 'Task Instruction',
  content:
    toStringArray(source.instructions).length > 0
      ? toStringArray(source.instructions)
      : toStringArray(source.content),
  highlight:
    text(source.highlight)
    || text(source.keyTakeaway)
    || text(source.summary)
    || undefined,
  image: buildOptionalImage(
    (source.image as Record<string, unknown> | undefined)?.src ?? source.image_src,
    (source.image as Record<string, unknown> | undefined)?.alt ?? source.image_alt
  ),
  background_image: text(source.background_image) || undefined,
});

const toCommonFaultsModel = (source: Record<string, unknown>): TwoColumnModel => ({
  title: text(source.title) || 'Common faults',
  left: {
    type: text(((source.left as Record<string, unknown> | undefined) || {}).image_src) ? 'image' : text(((source.left as Record<string, unknown> | undefined) || {}).type) === 'text' ? 'text' : 'bullets',
    header: text(((source.left as Record<string, unknown> | undefined) || {}).header) || 'Symptoms',
    content: toStringArray(((source.left as Record<string, unknown> | undefined) || {}).content),
    bullets: toBulletList(((source.left as Record<string, unknown> | undefined) || {}).bullets),
    image_src: text(((source.left as Record<string, unknown> | undefined) || {}).image_src) || undefined,
    image_alt: text(((source.left as Record<string, unknown> | undefined) || {}).image_alt) || undefined,
  },
  right: {
    type: text(((source.right as Record<string, unknown> | undefined) || {}).image_src) ? 'image' : text(((source.right as Record<string, unknown> | undefined) || {}).type) === 'text' ? 'text' : 'bullets',
    header: text(((source.right as Record<string, unknown> | undefined) || {}).header) || 'Fix actions',
    content: toStringArray(((source.right as Record<string, unknown> | undefined) || {}).content),
    bullets: toBulletList(((source.right as Record<string, unknown> | undefined) || {}).bullets),
    image_src: text(((source.right as Record<string, unknown> | undefined) || {}).image_src) || undefined,
    image_alt: text(((source.right as Record<string, unknown> | undefined) || {}).image_alt) || undefined,
  },
  background_image: text(source.background_image) || undefined,
});

const toDetailSpecsModel = (source: Record<string, unknown>): TitleContentModel => ({
  title: text(source.title) || 'Detail specs',
  content:
    toStringArray(source.specs).length > 0
      ? toStringArray(source.specs)
      : toStringArray(source.content),
  highlight:
    text(source.highlight)
    || text(source.keyTakeaway)
    || text(source.summary)
    || undefined,
  image: buildOptionalImage(
    (source.image as Record<string, unknown> | undefined)?.src ?? source.image_src,
    (source.image as Record<string, unknown> | undefined)?.alt ?? source.image_alt
  ),
  background_image: text(source.background_image) || undefined,
});

const toSafetyProtocolModel = (source: Record<string, unknown>): SafetyNoticeModel => ({
  title: text(source.title) || '安全禁令',
  warnings: Array.isArray(source.warnings) ? (source.warnings as SafetyNoticeModel['warnings']) : [],
  summary: text(source.summary) || undefined,
  background_image: text(source.background_image) || undefined,
});

const toEquipmentOrientationModel = (source: Record<string, unknown>): TwoColumnModel => ({
  title: text(source.title) || '设备认知',
  left: {
    type: text(((source.left as Record<string, unknown> | undefined) || {}).image_src) || text(source.equipment_image) ? 'image' : 'text',
    header: text(((source.left as Record<string, unknown> | undefined) || {}).header) || text(source.equipment_name) || text(source.left_title) || '设备示意',
    content: toStringArray(((source.left as Record<string, unknown> | undefined) || {}).content).length > 0
      ? toStringArray(((source.left as Record<string, unknown> | undefined) || {}).content)
      : toStringArray(source.equipment_summary),
    image_src: text(((source.left as Record<string, unknown> | undefined) || {}).image_src) || text(source.equipment_image) || undefined,
    image_alt: text(((source.left as Record<string, unknown> | undefined) || {}).image_alt) || text(source.equipment_name) || undefined,
  },
  right: {
    type: 'bullets',
    header: text(((source.right as Record<string, unknown> | undefined) || {}).header) || text(source.components_title) || '关键部件',
    bullets: toBulletList(((source.right as Record<string, unknown> | undefined) || {}).bullets).length > 0
      ? toBulletList(((source.right as Record<string, unknown> | undefined) || {}).bullets)
      : toBulletList(source.components).length > 0
        ? toBulletList(source.components)
        : toBulletList(source.bullets),
  },
  background_image: text(source.background_image) || undefined,
});

const toFieldObservationModel = (source: Record<string, unknown>): ImageFullModel => ({
  title: text(source.title) || '现场观测',
  image_src: text(source.image_src),
  image_alt: text(source.image_alt) || undefined,
  caption: text(source.caption) || undefined,
  background_image: text(source.background_image) || undefined,
});

const toSpecimenDetailModel = (source: Record<string, unknown>): DetailZoomModel => ({
  title: text(source.title) || 'Specimen detail',
  image_src: text(source.image_src),
  annotations: asArray(source.annotations)
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item, index) => ({
      x: Number(item.x) || 0,
      y: Number(item.y) || 0,
      label: text(item.label) || String.fromCharCode(65 + index),
      description: text(item.description) || text(item.content) || '',
    })),
  background_image: text(source.background_image) || undefined,
});

const toCaseBeforeAfterModel = (source: Record<string, unknown>): TwoColumnModel => {
  const before = ((source.before as Record<string, unknown> | undefined) || (source.left as Record<string, unknown> | undefined) || {}) as Record<string, unknown>;
  const after = ((source.after as Record<string, unknown> | undefined) || (source.right as Record<string, unknown> | undefined) || {}) as Record<string, unknown>;

  const toColumn = (
    title: string,
    value: Record<string, unknown>
  ): TwoColumnModel['left'] => {
    const hasImage = Boolean(text(value.image_src));
    const bullets = toBulletList(value.points);
    return {
      type: hasImage ? 'image' : bullets.length > 0 ? 'bullets' : 'text',
      header: text(value.title) || title,
      content: toStringArray(value.summary),
      bullets,
      image_src: text(value.image_src) || undefined,
      image_alt: text(value.image_alt) || undefined,
    };
  };

  return {
    title: text(source.title) || '前后对比',
    left: toColumn('改造前', before),
    right: toColumn('改造后', after),
    background_image: text(source.background_image) || undefined,
  };
};

const toSiteSurveyModel = (source: Record<string, unknown>): TwoColumnModel => ({
  title: text(source.title) || '踏勘报告',
  left: {
    type: text(((source.left as Record<string, unknown> | undefined) || {}).image_src) || text(source.overview_image) ? 'image' : 'text',
    header: text(((source.left as Record<string, unknown> | undefined) || {}).header) || text(source.left_title) || '现场总览',
    image_src: text(((source.left as Record<string, unknown> | undefined) || {}).image_src) || text(source.overview_image) || undefined,
    image_alt: text(((source.left as Record<string, unknown> | undefined) || {}).image_alt) || text(source.overview_alt) || undefined,
    content: toStringArray(((source.left as Record<string, unknown> | undefined) || {}).content).length > 0
      ? toStringArray(((source.left as Record<string, unknown> | undefined) || {}).content)
      : toStringArray(source.overview_summary),
  },
  right: {
    type: 'bullets',
    header: text(((source.right as Record<string, unknown> | undefined) || {}).header) || text(source.right_title) || '观察结论',
    bullets: toBulletList(((source.right as Record<string, unknown> | undefined) || {}).bullets).length > 0
      ? toBulletList(((source.right as Record<string, unknown> | undefined) || {}).bullets)
      : toBulletList(source.observations).length > 0
        ? toBulletList(source.observations)
        : toBulletList(source.bullets),
    content: toStringArray(((source.right as Record<string, unknown> | undefined) || {}).content).length > 0
      ? toStringArray(((source.right as Record<string, unknown> | undefined) || {}).content)
      : toStringArray(source.caption),
  },
  background_image: text(source.background_image) || undefined,
});

const techGradient = (backgroundImage?: string) =>
  backgroundImage
    ? `linear-gradient(rgba(6, 14, 35, 0.88), rgba(6, 14, 35, 0.92)), url(${backgroundImage}) center/cover no-repeat, linear-gradient(135deg, #071224 0%, #0b2342 45%, #123d67 100%)`
    : 'linear-gradient(135deg, #071224 0%, #0b2342 45%, #123d67 100%)';

const interactiveGradient = (backgroundImage?: string) =>
  backgroundImage
    ? `linear-gradient(rgba(12, 18, 34, 0.8), rgba(18, 28, 52, 0.86)), url(${backgroundImage}) center/cover no-repeat, linear-gradient(135deg, #172554 0%, #1d4ed8 50%, #38bdf8 100%)`
    : 'linear-gradient(135deg, #172554 0%, #1d4ed8 50%, #38bdf8 100%)';

const practicalGradient = (backgroundImage?: string) =>
  backgroundImage
    ? `linear-gradient(rgba(19, 24, 27, 0.82), rgba(12, 16, 18, 0.9)), url(${backgroundImage}) center/cover no-repeat, linear-gradient(135deg, #111827 0%, #1f2937 46%, #0f766e 100%)`
    : 'linear-gradient(135deg, #111827 0%, #1f2937 46%, #0f766e 100%)';

const visualGradient = (backgroundImage?: string) =>
  backgroundImage
    ? `linear-gradient(rgba(8, 12, 18, 0.34), rgba(8, 12, 18, 0.78)), url(${backgroundImage}) center/cover no-repeat, linear-gradient(135deg, #0f172a 0%, #1f2937 44%, #111827 100%)`
    : 'linear-gradient(135deg, #0f172a 0%, #1f2937 44%, #111827 100%)';

type DirectPanelCoverKind = 'cover_tech' | 'cover_interactive' | 'cover_practical';

const PANEL_COVER_TONES: Record<DirectPanelCoverKind, {
  kicker: string;
  background: (backgroundImage?: string) => string;
  panelBackground: string;
  panelBorder: string;
  accent: string;
  titleColor: string;
  subtitleColor: string;
  metaBackground: string;
  metaBorder: string;
  metaColor: string;
  asideLabel: string;
  asideText: string;
}> = {
  cover_tech: {
    kicker: 'SYSTEM RELEASE //',
    background: techGradient,
    panelBackground: 'rgba(8, 19, 43, 0.72)',
    panelBorder: '1px solid rgba(56, 189, 248, 0.28)',
    accent: '#38bdf8',
    titleColor: '#f8fafc',
    subtitleColor: 'rgba(191, 219, 254, 0.9)',
    metaBackground: 'rgba(14, 165, 233, 0.12)',
    metaBorder: '1px solid rgba(103, 232, 249, 0.26)',
    metaColor: '#e0f2fe',
    asideLabel: 'Blueprint note',
    asideText: 'A tech cover should establish system intent before the details start talking.',
  },
  cover_interactive: {
    kicker: 'WORKSHOP OPEN //',
    background: interactiveGradient,
    panelBackground: 'rgba(15, 23, 42, 0.28)',
    panelBorder: '1px solid rgba(255, 255, 255, 0.18)',
    accent: '#facc15',
    titleColor: '#ffffff',
    subtitleColor: 'rgba(219, 234, 254, 0.92)',
    metaBackground: 'rgba(255, 255, 255, 0.14)',
    metaBorder: '1px solid rgba(255, 255, 255, 0.22)',
    metaColor: '#eff6ff',
    asideLabel: 'Teaching cue',
    asideText: 'An interactive cover should promise movement, not just a prettier lecture shell.',
  },
  cover_practical: {
    kicker: 'WORKSTATION READY //',
    background: practicalGradient,
    panelBackground: 'rgba(15, 23, 42, 0.58)',
    panelBorder: '1px solid rgba(45, 212, 191, 0.24)',
    accent: '#2dd4bf',
    titleColor: '#f9fafb',
    subtitleColor: 'rgba(209, 250, 229, 0.86)',
    metaBackground: 'rgba(20, 184, 166, 0.12)',
    metaBorder: '1px solid rgba(45, 212, 191, 0.22)',
    metaColor: '#ccfbf1',
    asideLabel: 'Execution rule',
    asideText: 'A practical cover should feel like a controlled task handoff, not a marketing opener.',
  },
};

const getCoverMeta = (model: CoverModel): string[] =>
  compact([model.author, model.department, model.date]);

const getEndingBlocks = (
  model: EndingModel,
  fallbackBlocks: Array<{ title: string; items: string[] }>
): Array<{ title: string; items: string[] }> => {
  const blocks = (model.reflection_blocks || [])
    .map((block) => ({
      title: block.title,
      items: Array.isArray(block.items) && block.items.length > 0 ? block.items : ['Keep the action visible.'],
    }))
    .slice(0, 3);

  return blocks.length > 0 ? blocks : fallbackBlocks;
};

const renderPanelCoverLayoutHTML = (
  kind: DirectPanelCoverKind,
  model: CoverModel,
  theme: ThemeConfig
): string => {
  const tone = PANEL_COVER_TONES[kind];
  const meta = getCoverMeta(model);
  const metaHtml = meta
    .map((item) => `<span style="${toInlineStyle({ padding: '10px 14px', borderRadius: '999px', background: tone.metaBackground, border: tone.metaBorder, color: tone.metaColor, fontSize: '14px', fontWeight: '600' })}">${item}</span>`)
    .join('');

  return `<section style="${toInlineStyle({ ...getBaseSlideStyle(theme), background: tone.background(model.background_image), color: tone.titleColor, padding: '48px 56px' })}">
    <div style="${toInlineStyle({ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '28px', height: '100%' })}">
      <div style="${toInlineStyle({ borderRadius: '26px', background: tone.panelBackground, border: tone.panelBorder, boxShadow: '0 24px 60px rgba(2, 8, 23, 0.28)', padding: '38px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' })}">
        <div style="${toInlineStyle({ color: tone.accent, fontSize: '14px', fontWeight: '700', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '18px' })}">${tone.kicker}</div>
        <h1 style="${toInlineStyle({ ...getTitleStyle(theme), color: tone.titleColor, fontSize: '54px', lineHeight: '1.08', margin: '0 0 16px 0' })}">${model.title}</h1>
        ${model.subtitle ? `<div style="${toInlineStyle({ color: tone.subtitleColor, fontSize: '22px', lineHeight: '1.5', maxWidth: '760px' })}">${model.subtitle}</div>` : ''}
        <div style="${toInlineStyle({ width: '96px', height: '6px', borderRadius: '999px', background: tone.accent, margin: '26px 0 24px 0' })}"></div>
        ${metaHtml ? `<div style="${toInlineStyle({ display: 'flex', flexWrap: 'wrap', gap: '12px' })}">${metaHtml}</div>` : ''}
      </div>
      <aside style="${toInlineStyle({ borderRadius: '26px', padding: '30px 28px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' })}">
        <div>
          <div style="${toInlineStyle({ color: tone.accent, fontSize: '13px', fontWeight: '700', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '14px' })}">${tone.asideLabel}</div>
          <div style="${toInlineStyle({ color: tone.titleColor, fontSize: '28px', lineHeight: '1.35', fontWeight: '700', marginBottom: '14px' })}">${model.title}</div>
          <div style="${toInlineStyle({ color: tone.subtitleColor, fontSize: '17px', lineHeight: '1.65' })}">${tone.asideText}</div>
        </div>
        <div style="${toInlineStyle({ display: 'grid', gap: '10px' })}">
          ${meta.slice(0, 3).map((item, index) => `<div style="${toInlineStyle({ borderRadius: '16px', padding: '14px 16px', background: 'rgba(15, 23, 42, 0.28)', border: '1px solid rgba(255,255,255,0.08)' })}"><div style="${toInlineStyle({ color: tone.accent, fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '6px' })}">TRACK ${index + 1}</div><div style="${toInlineStyle({ color: tone.titleColor, fontSize: '18px', lineHeight: '1.4', fontWeight: '600' })}">${item}</div></div>`).join('')}
        </div>
      </aside>
    </div>
  </section>`;
};

const renderPanelCoverLayoutNode = (
  kind: DirectPanelCoverKind,
  model: CoverModel,
  theme: ThemeConfig
): React.ReactNode => {
  const tone = PANEL_COVER_TONES[kind];
  const meta = getCoverMeta(model);

  return (
    <section style={toCSS({ ...getBaseSlideStyle(theme), background: tone.background(model.background_image), color: tone.titleColor, padding: '48px 56px' })}>
      <div style={toCSS({ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '28px', height: '100%' })}>
        <div style={toCSS({ borderRadius: '26px', background: tone.panelBackground, border: tone.panelBorder, boxShadow: '0 24px 60px rgba(2, 8, 23, 0.28)', padding: '38px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' })}>
          <div style={toCSS({ color: tone.accent, fontSize: '14px', fontWeight: '700', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '18px' })}>{tone.kicker}</div>
          <h1 style={toCSS({ ...getTitleStyle(theme), color: tone.titleColor, fontSize: '54px', lineHeight: '1.08', margin: '0 0 16px 0' })}>{model.title}</h1>
          {model.subtitle ? <div style={toCSS({ color: tone.subtitleColor, fontSize: '22px', lineHeight: '1.5', maxWidth: '760px' })}>{model.subtitle}</div> : null}
          <div style={toCSS({ width: '96px', height: '6px', borderRadius: '999px', background: tone.accent, margin: '26px 0 24px 0' })} />
          {meta.length > 0 ? (
            <div style={toCSS({ display: 'flex', flexWrap: 'wrap', gap: '12px' })}>
              {meta.map((item) => (
                <span key={item} style={toCSS({ padding: '10px 14px', borderRadius: '999px', background: tone.metaBackground, border: tone.metaBorder, color: tone.metaColor, fontSize: '14px', fontWeight: '600' })}>{item}</span>
              ))}
            </div>
          ) : null}
        </div>
        <aside style={toCSS({ borderRadius: '26px', padding: '30px 28px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' })}>
          <div>
            <div style={toCSS({ color: tone.accent, fontSize: '13px', fontWeight: '700', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '14px' })}>{tone.asideLabel}</div>
            <div style={toCSS({ color: tone.titleColor, fontSize: '28px', lineHeight: '1.35', fontWeight: '700', marginBottom: '14px' })}>{model.title}</div>
            <div style={toCSS({ color: tone.subtitleColor, fontSize: '17px', lineHeight: '1.65' })}>{tone.asideText}</div>
          </div>
          <div style={toCSS({ display: 'grid', gap: '10px' })}>
            {meta.slice(0, 3).map((item, index) => (
              <div key={`${item}-${index}`} style={toCSS({ borderRadius: '16px', padding: '14px 16px', background: 'rgba(15, 23, 42, 0.28)', border: '1px solid rgba(255,255,255,0.08)' })}>
                <div style={toCSS({ color: tone.accent, fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '6px' })}>{`TRACK ${index + 1}`}</div>
                <div style={toCSS({ color: tone.titleColor, fontSize: '18px', lineHeight: '1.4', fontWeight: '600' })}>{item}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
};

const renderFieldCoverLayoutHTML = (model: CoverModel, theme: ThemeConfig): string => {
  const meta = getCoverMeta(model);

  return `<section style="${toInlineStyle({ ...getBaseSlideStyle(theme), background: visualGradient(model.background_image), color: '#f9fafb', padding: '44px 48px' })}">
    <div style="${toInlineStyle({ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' })}">
      <div style="${toInlineStyle({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' })}">
        <div style="${toInlineStyle({ color: 'rgba(255,255,255,0.84)', fontSize: '14px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: '700' })}">FIELD DOSSIER //</div>
        ${model.date ? `<div style="${toInlineStyle({ padding: '10px 14px', borderRadius: '999px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', color: '#f9fafb', fontSize: '14px', fontWeight: '600' })}">${model.date}</div>` : ''}
      </div>
      <div style="${toInlineStyle({ maxWidth: '860px' })}">
        <h1 style="${toInlineStyle({ ...getTitleStyle(theme), color: '#f9fafb', fontSize: '58px', lineHeight: '1.06', margin: '0 0 14px 0', textShadow: '0 12px 30px rgba(0,0,0,0.3)' })}">${model.title}</h1>
        ${model.subtitle ? `<div style="${toInlineStyle({ color: 'rgba(243, 244, 246, 0.9)', fontSize: '22px', lineHeight: '1.6', maxWidth: '760px' })}">${model.subtitle}</div>` : ''}
      </div>
      <div style="${toInlineStyle({ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '22px', alignItems: 'end' })}">
        <div style="${toInlineStyle({ borderRadius: '24px', background: 'rgba(8, 12, 18, 0.62)', border: '1px solid rgba(255,255,255,0.12)', padding: '24px 26px' })}">
          <div style="${toInlineStyle({ color: '#fde68a', fontSize: '13px', fontWeight: '700', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '10px' })}">Observation setup</div>
          <div style="${toInlineStyle({ color: '#f9fafb', fontSize: '26px', lineHeight: '1.45', fontWeight: '600' })}">A visual template must earn attention with evidence and atmosphere at the same time.</div>
        </div>
        <div style="${toInlineStyle({ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '10px' })}">
          ${meta.map((item) => `<span style="${toInlineStyle({ padding: '10px 14px', borderRadius: '999px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', color: '#f9fafb', fontSize: '14px', fontWeight: '600' })}">${item}</span>`).join('')}
        </div>
      </div>
    </div>
  </section>`;
};

const renderFieldCoverLayoutNode = (model: CoverModel, theme: ThemeConfig): React.ReactNode => {
  const meta = getCoverMeta(model);

  return (
    <section style={toCSS({ ...getBaseSlideStyle(theme), background: visualGradient(model.background_image), color: '#f9fafb', padding: '44px 48px' })}>
      <div style={toCSS({ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' })}>
        <div style={toCSS({ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' })}>
          <div style={toCSS({ color: 'rgba(255,255,255,0.84)', fontSize: '14px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: '700' })}>FIELD DOSSIER //</div>
          {model.date ? <div style={toCSS({ padding: '10px 14px', borderRadius: '999px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', color: '#f9fafb', fontSize: '14px', fontWeight: '600' })}>{model.date}</div> : null}
        </div>
        <div style={toCSS({ maxWidth: '860px' })}>
          <h1 style={toCSS({ ...getTitleStyle(theme), color: '#f9fafb', fontSize: '58px', lineHeight: '1.06', margin: '0 0 14px 0', textShadow: '0 12px 30px rgba(0,0,0,0.3)' })}>{model.title}</h1>
          {model.subtitle ? <div style={toCSS({ color: 'rgba(243, 244, 246, 0.9)', fontSize: '22px', lineHeight: '1.6', maxWidth: '760px' })}>{model.subtitle}</div> : null}
        </div>
        <div style={toCSS({ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '22px', alignItems: 'end' })}>
          <div style={toCSS({ borderRadius: '24px', background: 'rgba(8, 12, 18, 0.62)', border: '1px solid rgba(255,255,255,0.12)', padding: '24px 26px' })}>
            <div style={toCSS({ color: '#fde68a', fontSize: '13px', fontWeight: '700', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '10px' })}>Observation setup</div>
            <div style={toCSS({ color: '#f9fafb', fontSize: '26px', lineHeight: '1.45', fontWeight: '600' })}>A visual template must earn attention with evidence and atmosphere at the same time.</div>
          </div>
          <div style={toCSS({ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '10px' })}>
            {meta.map((item) => (
              <span key={item} style={toCSS({ padding: '10px 14px', borderRadius: '999px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', color: '#f9fafb', fontSize: '14px', fontWeight: '600' })}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const renderInteractiveEndingLayoutHTML = (model: EndingModel, theme: ThemeConfig): string => {
  const blocks = getEndingBlocks(model, [
    { title: 'What landed', items: ['The audience participated instead of waiting passively.'] },
    { title: 'What to reuse', items: ['Keep one prompt, one discussion pivot, one transfer task.'] },
    { title: 'Next move', items: ['Run the same workshop with the learner owning the narrative.'] },
  ]);
  const blockHtml = blocks.map((block) => `<article style="${toInlineStyle({ borderRadius: '18px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', padding: '18px 20px' })}"><div style="${toInlineStyle({ color: '#fde68a', fontSize: '16px', fontWeight: '700', marginBottom: '10px' })}">${block.title}</div><ul style="${toInlineStyle({ margin: '0', paddingLeft: '20px', color: '#eff6ff', fontSize: '15px', lineHeight: '1.55' })}">${block.items.map((item) => `<li>${item}</li>`).join('')}</ul></article>`).join('');

  return `<section style="${toInlineStyle({ ...getBaseSlideStyle(theme), background: interactiveGradient(model.background_image), color: '#eff6ff', padding: '52px 56px' })}">
    <div style="${toInlineStyle({ display: 'grid', gridTemplateColumns: '0.95fr 1.25fr', gap: '26px', height: '100%' })}">
      <div style="${toInlineStyle({ borderRadius: '24px', background: 'rgba(15, 23, 42, 0.22)', border: '1px solid rgba(255,255,255,0.18)', padding: '32px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' })}">
        <div style="${toInlineStyle({ color: '#fde68a', fontSize: '14px', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: '700', marginBottom: '14px' })}">WORKSHOP CLOSE //</div>
        <h2 style="${toInlineStyle({ ...getTitleStyle(theme), color: '#ffffff', fontSize: '46px', lineHeight: '1.12', marginBottom: '16px' })}">${model.title}</h2>
        ${model.subtitle ? `<div style="${toInlineStyle({ color: 'rgba(219, 234, 254, 0.9)', fontSize: '21px', lineHeight: '1.55', marginBottom: '18px' })}">${model.subtitle}</div>` : ''}
        <div style="${toInlineStyle({ color: '#f8fafc', fontSize: '24px', lineHeight: '1.6', fontWeight: '600' })}">${model.closing || 'Interactive endings should point to the next action, not only thank the room.'}</div>
        ${model.contact ? `<div style="${toInlineStyle({ marginTop: '24px', color: '#dbeafe', fontSize: '16px' })}">${model.contact}</div>` : ''}
      </div>
      <div style="${toInlineStyle({ display: 'grid', gap: '14px', alignContent: 'center' })}">${blockHtml}</div>
    </div>
  </section>`;
};

const renderInteractiveEndingLayoutNode = (model: EndingModel, theme: ThemeConfig): React.ReactNode => {
  const blocks = getEndingBlocks(model, [
    { title: 'What landed', items: ['The audience participated instead of waiting passively.'] },
    { title: 'What to reuse', items: ['Keep one prompt, one discussion pivot, one transfer task.'] },
    { title: 'Next move', items: ['Run the same workshop with the learner owning the narrative.'] },
  ]);

  return (
    <section style={toCSS({ ...getBaseSlideStyle(theme), background: interactiveGradient(model.background_image), color: '#eff6ff', padding: '52px 56px' })}>
      <div style={toCSS({ display: 'grid', gridTemplateColumns: '0.95fr 1.25fr', gap: '26px', height: '100%' })}>
        <div style={toCSS({ borderRadius: '24px', background: 'rgba(15, 23, 42, 0.22)', border: '1px solid rgba(255,255,255,0.18)', padding: '32px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' })}>
          <div style={toCSS({ color: '#fde68a', fontSize: '14px', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: '700', marginBottom: '14px' })}>WORKSHOP CLOSE //</div>
          <h2 style={toCSS({ ...getTitleStyle(theme), color: '#ffffff', fontSize: '46px', lineHeight: '1.12', marginBottom: '16px' })}>{model.title}</h2>
          {model.subtitle ? <div style={toCSS({ color: 'rgba(219, 234, 254, 0.9)', fontSize: '21px', lineHeight: '1.55', marginBottom: '18px' })}>{model.subtitle}</div> : null}
          <div style={toCSS({ color: '#f8fafc', fontSize: '24px', lineHeight: '1.6', fontWeight: '600' })}>{model.closing || 'Interactive endings should point to the next action, not only thank the room.'}</div>
          {model.contact ? <div style={toCSS({ marginTop: '24px', color: '#dbeafe', fontSize: '16px' })}>{model.contact}</div> : null}
        </div>
        <div style={toCSS({ display: 'grid', gap: '14px', alignContent: 'center' })}>
          {blocks.map((block) => (
            <article key={block.title} style={toCSS({ borderRadius: '18px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', padding: '18px 20px' })}>
              <div style={toCSS({ color: '#fde68a', fontSize: '16px', fontWeight: '700', marginBottom: '10px' })}>{block.title}</div>
              <ul style={toCSS({ margin: '0', paddingLeft: '20px', color: '#eff6ff', fontSize: '15px', lineHeight: '1.55' })}>
                {block.items.map((item, index) => <li key={`${block.title}-${index}`}>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

const renderFieldEndingLayoutHTML = (model: EndingModel, theme: ThemeConfig): string => {
  const blocks = getEndingBlocks(model, [
    { title: 'Series strength', items: ['Lead with image evidence before the explanatory copy arrives.'] },
    { title: 'Best use cases', items: ['Brand story, space archive, visual case deck.'] },
  ]);
  const tags = blocks.flatMap((block) => [block.title, ...block.items]).slice(0, 6);

  return `<section style="${toInlineStyle({ ...getBaseSlideStyle(theme), background: visualGradient(model.background_image), color: '#f9fafb', padding: '44px 48px' })}">
    <div style="${toInlineStyle({ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' })}">
      <div style="${toInlineStyle({ color: 'rgba(255,255,255,0.82)', fontSize: '14px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: '700' })}">FIELD CLOSE //</div>
      <div style="${toInlineStyle({ maxWidth: '820px' })}">
        <h2 style="${toInlineStyle({ ...getTitleStyle(theme), color: '#f9fafb', fontSize: '56px', lineHeight: '1.08', marginBottom: '18px' })}">${model.title}</h2>
        ${model.subtitle ? `<div style="${toInlineStyle({ color: 'rgba(243, 244, 246, 0.9)', fontSize: '22px', lineHeight: '1.58', marginBottom: '20px' })}">${model.subtitle}</div>` : ''}
        <div style="${toInlineStyle({ color: '#fef3c7', fontSize: '26px', lineHeight: '1.58', fontWeight: '600' })}">${model.closing || 'A visual ending should leave one image-memory behind, not another paragraph to survive.'}</div>
      </div>
      <div style="${toInlineStyle({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', alignItems: 'end' })}">
        <div style="${toInlineStyle({ display: 'flex', flexWrap: 'wrap', gap: '10px' })}">
          ${tags.map((tag) => `<span style="${toInlineStyle({ padding: '10px 14px', borderRadius: '999px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', color: '#f9fafb', fontSize: '14px', fontWeight: '600' })}">${tag}</span>`).join('')}
        </div>
        <div style="${toInlineStyle({ borderRadius: '22px', background: 'rgba(8, 12, 18, 0.62)', border: '1px solid rgba(255,255,255,0.12)', padding: '24px 26px', justifySelf: 'stretch' })}">
          <div style="${toInlineStyle({ color: '#fde68a', fontSize: '13px', fontWeight: '700', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '10px' })}">Exit frame</div>
          <div style="${toInlineStyle({ color: '#f9fafb', fontSize: '20px', lineHeight: '1.55', fontWeight: '600' })}">${model.contact || 'Keep the last page atmospheric enough that the audience remembers the frame, not just the sentence.'}</div>
        </div>
      </div>
    </div>
  </section>`;
};

const renderFieldEndingLayoutNode = (model: EndingModel, theme: ThemeConfig): React.ReactNode => {
  const blocks = getEndingBlocks(model, [
    { title: 'Series strength', items: ['Lead with image evidence before the explanatory copy arrives.'] },
    { title: 'Best use cases', items: ['Brand story, space archive, visual case deck.'] },
  ]);
  const tags = blocks.flatMap((block) => [block.title, ...block.items]).slice(0, 6);

  return (
    <section style={toCSS({ ...getBaseSlideStyle(theme), background: visualGradient(model.background_image), color: '#f9fafb', padding: '44px 48px' })}>
      <div style={toCSS({ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' })}>
        <div style={toCSS({ color: 'rgba(255,255,255,0.82)', fontSize: '14px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: '700' })}>FIELD CLOSE //</div>
        <div style={toCSS({ maxWidth: '820px' })}>
          <h2 style={toCSS({ ...getTitleStyle(theme), color: '#f9fafb', fontSize: '56px', lineHeight: '1.08', marginBottom: '18px' })}>{model.title}</h2>
          {model.subtitle ? <div style={toCSS({ color: 'rgba(243, 244, 246, 0.9)', fontSize: '22px', lineHeight: '1.58', marginBottom: '20px' })}>{model.subtitle}</div> : null}
          <div style={toCSS({ color: '#fef3c7', fontSize: '26px', lineHeight: '1.58', fontWeight: '600' })}>{model.closing || 'A visual ending should leave one image-memory behind, not another paragraph to survive.'}</div>
        </div>
        <div style={toCSS({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', alignItems: 'end' })}>
          <div style={toCSS({ display: 'flex', flexWrap: 'wrap', gap: '10px' })}>
            {tags.map((tag) => (
              <span key={tag} style={toCSS({ padding: '10px 14px', borderRadius: '999px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)', color: '#f9fafb', fontSize: '14px', fontWeight: '600' })}>{tag}</span>
            ))}
          </div>
          <div style={toCSS({ borderRadius: '22px', background: 'rgba(8, 12, 18, 0.62)', border: '1px solid rgba(255,255,255,0.12)', padding: '24px 26px', justifySelf: 'stretch' })}>
            <div style={toCSS({ color: '#fde68a', fontSize: '13px', fontWeight: '700', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '10px' })}>Exit frame</div>
            <div style={toCSS({ color: '#f9fafb', fontSize: '20px', lineHeight: '1.55', fontWeight: '600' })}>{model.contact || 'Keep the last page atmospheric enough that the audience remembers the frame, not just the sentence.'}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

const renderPracticalEndingLayoutHTML = (model: EndingModel, theme: ThemeConfig): string => {
  const blocks = getEndingBlocks(model, [
    { title: 'Required delivery', items: ['Final output package', 'Preview evidence', 'Failure notes if any'] },
    { title: 'Next drill', items: ['Repeat the task with one personal SOP improvement.'] },
  ]);
  const blockHtml = blocks.map((block) => `<article style="${toInlineStyle({ borderRadius: '18px', background: 'rgba(15, 23, 42, 0.54)', border: '1px solid rgba(45, 212, 191, 0.18)', padding: '18px 20px' })}"><div style="${toInlineStyle({ color: '#2dd4bf', fontSize: '16px', fontWeight: '700', marginBottom: '10px' })}">${block.title}</div><ul style="${toInlineStyle({ margin: '0', paddingLeft: '20px', color: '#ecfeff', fontSize: '15px', lineHeight: '1.55' })}">${block.items.map((item) => `<li>${item}</li>`).join('')}</ul></article>`).join('');

  return `<section style="${toInlineStyle({ ...getBaseSlideStyle(theme), background: practicalGradient(model.background_image), color: '#ecfeff', padding: '50px 54px' })}">
    <div style="${toInlineStyle({ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '24px', height: '100%' })}">
      <div style="${toInlineStyle({ borderRadius: '24px', background: 'rgba(8, 15, 18, 0.62)', border: '1px solid rgba(45, 212, 191, 0.18)', padding: '32px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' })}">
        <div style="${toInlineStyle({ color: '#2dd4bf', fontSize: '14px', fontWeight: '700', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '14px' })}">DELIVERY CLOSE //</div>
        <h2 style="${toInlineStyle({ ...getTitleStyle(theme), color: '#f9fafb', fontSize: '46px', lineHeight: '1.12', marginBottom: '16px' })}">${model.title}</h2>
        ${model.subtitle ? `<div style="${toInlineStyle({ color: 'rgba(204, 251, 241, 0.9)', fontSize: '21px', lineHeight: '1.55', marginBottom: '18px' })}">${model.subtitle}</div>` : ''}
        <div style="${toInlineStyle({ color: '#f9fafb', fontSize: '24px', lineHeight: '1.58', fontWeight: '600' })}">${model.closing || 'A practical ending must make the handoff criteria explicit or the workflow is still fragile.'}</div>
        ${model.contact ? `<div style="${toInlineStyle({ marginTop: '24px', color: '#ccfbf1', fontSize: '16px' })}">${model.contact}</div>` : ''}
      </div>
      <div style="${toInlineStyle({ display: 'grid', gap: '14px', alignContent: 'center' })}">${blockHtml}</div>
    </div>
  </section>`;
};

const renderPracticalEndingLayoutNode = (model: EndingModel, theme: ThemeConfig): React.ReactNode => {
  const blocks = getEndingBlocks(model, [
    { title: 'Required delivery', items: ['Final output package', 'Preview evidence', 'Failure notes if any'] },
    { title: 'Next drill', items: ['Repeat the task with one personal SOP improvement.'] },
  ]);

  return (
    <section style={toCSS({ ...getBaseSlideStyle(theme), background: practicalGradient(model.background_image), color: '#ecfeff', padding: '50px 54px' })}>
      <div style={toCSS({ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '24px', height: '100%' })}>
        <div style={toCSS({ borderRadius: '24px', background: 'rgba(8, 15, 18, 0.62)', border: '1px solid rgba(45, 212, 191, 0.18)', padding: '32px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center' })}>
          <div style={toCSS({ color: '#2dd4bf', fontSize: '14px', fontWeight: '700', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '14px' })}>DELIVERY CLOSE //</div>
          <h2 style={toCSS({ ...getTitleStyle(theme), color: '#f9fafb', fontSize: '46px', lineHeight: '1.12', marginBottom: '16px' })}>{model.title}</h2>
          {model.subtitle ? <div style={toCSS({ color: 'rgba(204, 251, 241, 0.9)', fontSize: '21px', lineHeight: '1.55', marginBottom: '18px' })}>{model.subtitle}</div> : null}
          <div style={toCSS({ color: '#f9fafb', fontSize: '24px', lineHeight: '1.58', fontWeight: '600' })}>{model.closing || 'A practical ending must make the handoff criteria explicit or the workflow is still fragile.'}</div>
          {model.contact ? <div style={toCSS({ marginTop: '24px', color: '#ccfbf1', fontSize: '16px' })}>{model.contact}</div> : null}
        </div>
        <div style={toCSS({ display: 'grid', gap: '14px', alignContent: 'center' })}>
          {blocks.map((block) => (
            <article key={block.title} style={toCSS({ borderRadius: '18px', background: 'rgba(15, 23, 42, 0.54)', border: '1px solid rgba(45, 212, 191, 0.18)', padding: '18px 20px' })}>
              <div style={toCSS({ color: '#2dd4bf', fontSize: '16px', fontWeight: '700', marginBottom: '10px' })}>{block.title}</div>
              <ul style={toCSS({ margin: '0', paddingLeft: '20px', color: '#ecfeff', fontSize: '15px', lineHeight: '1.55' })}>
                {block.items.map((item, index) => <li key={`${block.title}-${index}`}>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

const renderTechTocLayoutHTML = (model: TechTocModel, theme: ThemeConfig): string => {
  const itemsHtml = model.items
    .map((item) => {
      const cardStyle = toInlineStyle({
        ...getCardStyle(theme),
        backgroundColor: 'rgba(8, 19, 43, 0.74)',
        borderRadius: '18px',
        border: '1px solid rgba(56, 189, 248, 0.28)',
        boxShadow: '0 18px 36px rgba(2, 8, 23, 0.28)',
        padding: '20px 22px',
        minHeight: '120px',
      });
      return `<article style="${cardStyle}">
        <div style="${toInlineStyle({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(56, 189, 248, 0.16)', border: '1px solid rgba(56, 189, 248, 0.45)', color: '#67e8f9', fontSize: '16px', fontWeight: '700', marginBottom: '14px' })}">${String(item.index).padStart(2, '0')}</div>
        <div style="${toInlineStyle({ color: '#f8fafc', fontSize: '22px', fontWeight: '700', lineHeight: '1.35', marginBottom: item.description ? '10px' : '0' })}">${item.text}</div>
        ${item.description ? `<div style="${toInlineStyle({ color: 'rgba(191, 219, 254, 0.82)', fontSize: '15px', lineHeight: '1.5' })}">${item.description}</div>` : ''}
      </article>`;
    })
    .join('');

  return `<section style="${toInlineStyle({ ...getBaseSlideStyle(theme), background: techGradient(model.background_image), color: '#e2e8f0', padding: '56px 64px' })}">
    <div style="${toInlineStyle({ color: '#38bdf8', fontSize: '15px', fontWeight: '700', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '16px' })}">SYSTEM MAP //</div>
    <h2 style="${toInlineStyle({ ...getTitleStyle(theme), color: '#f8fafc', fontSize: '46px', marginBottom: '12px' })}">${model.title}</h2>
    ${model.subtitle ? `<div style="${toInlineStyle({ color: 'rgba(226, 232, 240, 0.78)', fontSize: '20px', lineHeight: '1.5', marginBottom: '30px', maxWidth: '820px' })}">${model.subtitle}</div>` : ''}
    <div style="${toInlineStyle({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginTop: '22px' })}">${itemsHtml}</div>
    ${model.summary ? `<div style="${toInlineStyle({ marginTop: '24px', color: '#7dd3fc', fontSize: '16px', letterSpacing: '0.08em' })}">${model.summary}</div>` : ''}
  </section>`;
};

const renderTechTocLayoutNode = (model: TechTocModel, theme: ThemeConfig): React.ReactNode => (
  <section style={toCSS({ ...getBaseSlideStyle(theme), background: techGradient(model.background_image), color: '#e2e8f0', padding: '56px 64px' })}>
    <div style={toCSS({ color: '#38bdf8', fontSize: '15px', fontWeight: '700', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '16px' })}>SYSTEM MAP //</div>
    <h2 style={toCSS({ ...getTitleStyle(theme), color: '#f8fafc', fontSize: '46px', marginBottom: '12px' })}>{model.title}</h2>
    {model.subtitle ? <div style={toCSS({ color: 'rgba(226, 232, 240, 0.78)', fontSize: '20px', lineHeight: '1.5', marginBottom: '30px', maxWidth: '820px' })}>{model.subtitle}</div> : null}
    <div style={toCSS({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginTop: '22px' })}>
      {model.items.map((item) => (
        <article key={`${item.index}-${item.text}`} style={toCSS({ ...getCardStyle(theme), backgroundColor: 'rgba(8, 19, 43, 0.74)', borderRadius: '18px', border: '1px solid rgba(56, 189, 248, 0.28)', boxShadow: '0 18px 36px rgba(2, 8, 23, 0.28)', padding: '20px 22px', minHeight: '120px' })}>
          <div style={toCSS({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(56, 189, 248, 0.16)', border: '1px solid rgba(56, 189, 248, 0.45)', color: '#67e8f9', fontSize: '16px', fontWeight: '700', marginBottom: '14px' })}>{String(item.index).padStart(2, '0')}</div>
          <div style={toCSS({ color: '#f8fafc', fontSize: '22px', fontWeight: '700', lineHeight: '1.35', marginBottom: item.description ? '10px' : '0' })}>{item.text}</div>
          {item.description ? <div style={toCSS({ color: 'rgba(191, 219, 254, 0.82)', fontSize: '15px', lineHeight: '1.5' })}>{item.description}</div> : null}
        </article>
      ))}
    </div>
    {model.summary ? <div style={toCSS({ marginTop: '24px', color: '#7dd3fc', fontSize: '16px', letterSpacing: '0.08em' })}>{model.summary}</div> : null}
  </section>
);

const renderAgendaPathLayoutHTML = (model: AgendaPathModel, theme: ThemeConfig): string => {
  const pathHtml = model.items.map((item, index) => {
    const connector = index < model.items.length - 1
      ? `<div style="${toInlineStyle({ width: '4px', height: '36px', backgroundColor: 'rgba(191, 219, 254, 0.32)', margin: '6px 0 6px 23px' })}"></div>`
      : '';
    return `<div>
      <div style="display:flex; gap:18px; align-items:flex-start;">
        <div style="${toInlineStyle({ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#facc15', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', flexShrink: '0' })}">${String(item.index).padStart(2, '0')}</div>
        <div style="${toInlineStyle({ backgroundColor: 'rgba(15, 23, 42, 0.34)', border: '1px solid rgba(255, 255, 255, 0.16)', borderRadius: '18px', padding: '18px 22px', boxShadow: '0 18px 30px rgba(15, 23, 42, 0.18)' })}">
          <div style="${toInlineStyle({ fontSize: '22px', fontWeight: '700', color: '#f8fafc', marginBottom: item.description ? '8px' : '0' })}">${item.text}</div>
          ${item.description ? `<div style="${toInlineStyle({ fontSize: '15px', lineHeight: '1.5', color: 'rgba(219, 234, 254, 0.86)' })}">${item.description}</div>` : ''}
        </div>
      </div>
      ${connector}
    </div>`;
  }).join('');

  return `<section style="${toInlineStyle({ ...getBaseSlideStyle(theme), background: interactiveGradient(model.background_image), color: '#eff6ff', padding: '56px 60px' })}">
    <div style="${toInlineStyle({ color: '#fde68a', fontSize: '15px', fontWeight: '700', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '16px' })}">LEARNING PATH //</div>
    <h2 style="${toInlineStyle({ ...getTitleStyle(theme), color: '#ffffff', fontSize: '44px', marginBottom: '10px' })}">${model.title}</h2>
    ${model.subtitle ? `<div style="${toInlineStyle({ color: 'rgba(219, 234, 254, 0.86)', fontSize: '20px', lineHeight: '1.5', marginBottom: '26px', maxWidth: '760px' })}">${model.subtitle}</div>` : ''}
    <div style="${toInlineStyle({ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: '28px', alignItems: 'start' })}">
      <div>${pathHtml}</div>
      <aside style="${toInlineStyle({ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.18)' })}">
        <div style="${toInlineStyle({ color: '#facc15', fontSize: '14px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' })}">Interaction cue</div>
        <div style="${toInlineStyle({ color: '#f8fafc', fontSize: '20px', lineHeight: '1.55', fontWeight: '600' })}">${model.instruction || 'Move from warm-up into discussion, then transfer the insight into an action task.'}</div>
      </aside>
    </div>
  </section>`;
};

const renderAgendaPathLayoutNode = (model: AgendaPathModel, theme: ThemeConfig): React.ReactNode => (
  <section style={toCSS({ ...getBaseSlideStyle(theme), background: interactiveGradient(model.background_image), color: '#eff6ff', padding: '56px 60px' })}>
    <div style={toCSS({ color: '#fde68a', fontSize: '15px', fontWeight: '700', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '16px' })}>LEARNING PATH //</div>
    <h2 style={toCSS({ ...getTitleStyle(theme), color: '#ffffff', fontSize: '44px', marginBottom: '10px' })}>{model.title}</h2>
    {model.subtitle ? <div style={toCSS({ color: 'rgba(219, 234, 254, 0.86)', fontSize: '20px', lineHeight: '1.5', marginBottom: '26px', maxWidth: '760px' })}>{model.subtitle}</div> : null}
    <div style={toCSS({ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr', gap: '28px', alignItems: 'start' })}>
      <div>
        {model.items.map((item, index) => (
          <div key={`${item.index}-${item.text}`}>
            <div style={toCSS({ display: 'flex', gap: '18px', alignItems: 'flex-start' })}>
              <div style={toCSS({ width: '46px', height: '46px', borderRadius: '50%', backgroundColor: '#facc15', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '800', flexShrink: '0' })}>{String(item.index).padStart(2, '0')}</div>
              <div style={toCSS({ backgroundColor: 'rgba(15, 23, 42, 0.34)', border: '1px solid rgba(255, 255, 255, 0.16)', borderRadius: '18px', padding: '18px 22px', boxShadow: '0 18px 30px rgba(15, 23, 42, 0.18)' })}>
                <div style={toCSS({ fontSize: '22px', fontWeight: '700', color: '#f8fafc', marginBottom: item.description ? '8px' : '0' })}>{item.text}</div>
                {item.description ? <div style={toCSS({ fontSize: '15px', lineHeight: '1.5', color: 'rgba(219, 234, 254, 0.86)' })}>{item.description}</div> : null}
              </div>
            </div>
            {index < model.items.length - 1 ? <div style={toCSS({ width: '4px', height: '36px', backgroundColor: 'rgba(191, 219, 254, 0.32)', margin: '6px 0 6px 23px' })} /> : null}
          </div>
        ))}
      </div>
      <aside style={toCSS({ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.18)' })}>
        <div style={toCSS({ color: '#facc15', fontSize: '14px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' })}>Interaction cue</div>
        <div style={toCSS({ color: '#f8fafc', fontSize: '20px', lineHeight: '1.55', fontWeight: '600' })}>{model.instruction || 'Move from warm-up into discussion, then transfer the insight into an action task.'}</div>
      </aside>
    </div>
  </section>
);

const renderTechEndingLayoutHTML = (model: EndingModel, theme: ThemeConfig): string => {
  const blocks = (model.reflection_blocks || []).slice(0, 3);
  const fallbackBlocks = blocks.length > 0 ? blocks : [
    { title: 'System integrity', items: ['Keep preview, export, and state transitions aligned.'] },
    { title: 'Operational trust', items: ['Make every asset path explicit instead of inferred.'] },
    { title: 'Next iteration', items: ['Promote validated layouts before expanding the template family.'] },
  ];

  const blocksHtml = fallbackBlocks.map((block) => `<article style="${toInlineStyle({ borderRadius: '18px', border: '1px solid rgba(56, 189, 248, 0.2)', backgroundColor: 'rgba(15, 23, 42, 0.55)', padding: '18px 20px' })}"><div style="${toInlineStyle({ color: '#67e8f9', fontSize: '18px', fontWeight: '700', marginBottom: '10px' })}">${block.title}</div><ul style="${toInlineStyle({ margin: '0', paddingLeft: '20px', color: 'rgba(226, 232, 240, 0.88)', fontSize: '15px', lineHeight: '1.55' })}">${block.items.map((item) => `<li>${item}</li>`).join('')}</ul></article>`).join('');

  return `<section style="${toInlineStyle({ ...getBaseSlideStyle(theme), background: techGradient(model.background_image), color: '#e2e8f0', padding: '52px 58px' })}"><div style="${toInlineStyle({ display: 'grid', gridTemplateColumns: '0.95fr 1.25fr', gap: '28px', height: '100%' })}"><div style="${toInlineStyle({ borderRadius: '24px', padding: '34px 30px', backgroundColor: 'rgba(8, 19, 43, 0.7)', border: '1px solid rgba(56, 189, 248, 0.26)', display: 'flex', flexDirection: 'column', justifyContent: 'center' })}"><div style="${toInlineStyle({ color: '#38bdf8', fontSize: '15px', fontWeight: '700', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '16px' })}">TECH DEBRIEF //</div><h2 style="${toInlineStyle({ ...getTitleStyle(theme), color: '#f8fafc', fontSize: '44px', marginBottom: '18px' })}">${model.title}</h2>${model.subtitle ? `<div style="${toInlineStyle({ color: 'rgba(191, 219, 254, 0.86)', fontSize: '20px', lineHeight: '1.5', marginBottom: '18px' })}">${model.subtitle}</div>` : ''}<div style="${toInlineStyle({ color: '#f8fafc', fontSize: '24px', lineHeight: '1.55', fontWeight: '600' })}">${model.closing || 'Close with the mechanism, not just the mood.'}</div>${model.contact ? `<div style="${toInlineStyle({ marginTop: '28px', color: '#7dd3fc', fontSize: '16px' })}">${model.contact}</div>` : ''}</div><div style="${toInlineStyle({ display: 'grid', gap: '16px', alignContent: 'center' })}">${blocksHtml}</div></div></section>`;
};

const renderTechEndingLayoutNode = (model: EndingModel, theme: ThemeConfig): React.ReactNode => {
  const blocks = (model.reflection_blocks || []).slice(0, 3);
  const fallbackBlocks = blocks.length > 0 ? blocks : [
    { title: 'System integrity', items: ['Keep preview, export, and state transitions aligned.'] },
    { title: 'Operational trust', items: ['Make every asset path explicit instead of inferred.'] },
    { title: 'Next iteration', items: ['Promote validated layouts before expanding the template family.'] },
  ];

  return (
    <section style={toCSS({ ...getBaseSlideStyle(theme), background: techGradient(model.background_image), color: '#e2e8f0', padding: '52px 58px' })}>
      <div style={toCSS({ display: 'grid', gridTemplateColumns: '0.95fr 1.25fr', gap: '28px', height: '100%' })}>
        <div style={toCSS({ borderRadius: '24px', padding: '34px 30px', backgroundColor: 'rgba(8, 19, 43, 0.7)', border: '1px solid rgba(56, 189, 248, 0.26)', display: 'flex', flexDirection: 'column', justifyContent: 'center' })}>
          <div style={toCSS({ color: '#38bdf8', fontSize: '15px', fontWeight: '700', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '16px' })}>TECH DEBRIEF //</div>
          <h2 style={toCSS({ ...getTitleStyle(theme), color: '#f8fafc', fontSize: '44px', marginBottom: '18px' })}>{model.title}</h2>
          {model.subtitle ? <div style={toCSS({ color: 'rgba(191, 219, 254, 0.86)', fontSize: '20px', lineHeight: '1.5', marginBottom: '18px' })}>{model.subtitle}</div> : null}
          <div style={toCSS({ color: '#f8fafc', fontSize: '24px', lineHeight: '1.55', fontWeight: '600' })}>{model.closing || 'Close with the mechanism, not just the mood.'}</div>
          {model.contact ? <div style={toCSS({ marginTop: '28px', color: '#7dd3fc', fontSize: '16px' })}>{model.contact}</div> : null}
        </div>
        <div style={toCSS({ display: 'grid', gap: '16px', alignContent: 'center' })}>
          {fallbackBlocks.map((block) => (
            <article key={block.title} style={toCSS({ borderRadius: '18px', border: '1px solid rgba(56, 189, 248, 0.2)', backgroundColor: 'rgba(15, 23, 42, 0.55)', padding: '18px 20px' })}>
              <div style={toCSS({ color: '#67e8f9', fontSize: '18px', fontWeight: '700', marginBottom: '10px' })}>{block.title}</div>
              <ul style={toCSS({ margin: '0', paddingLeft: '20px', color: 'rgba(226, 232, 240, 0.88)', fontSize: '15px', lineHeight: '1.55' })}>
                {block.items.map((item, index) => <li key={`${block.title}-${index}`}>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

const buildPhaseOneWeakRendererConfig = (
  layoutId: PhaseOneWeakLayoutId,
  source: Record<string, unknown>
):
  | { kind: 'cover_tech'; model: CoverModel }
  | { kind: 'toc_tech'; model: TechTocModel }
  | { kind: 'ending_tech'; model: EndingModel }
  | { kind: 'title_content'; model: TitleContentModel }
  | { kind: 'title_bullets'; model: TitleBulletsModel }
  | { kind: 'two_column'; model: TwoColumnModel }
  | { kind: 'process_steps'; model: ProcessStepsModel }
  | { kind: 'cover_interactive'; model: CoverModel }
  | { kind: 'agenda_path'; model: AgendaPathModel }
  | { kind: 'poll_interactive'; model: PollInteractiveModel }
  | { kind: 'ending_interactive'; model: EndingModel }
  | { kind: 'cover_practical'; model: CoverModel }
  | { kind: 'safety_notice'; model: SafetyNoticeModel }
  | { kind: 'ending_practical'; model: EndingModel }
  | { kind: 'cover_field'; model: CoverModel }
  | { kind: 'image_full'; model: ImageFullModel }
  | { kind: 'detail_zoom'; model: DetailZoomModel }
  | { kind: 'timeline_evolution'; model: TimelineModel }
  | { kind: 'ending_field'; model: EndingModel }
  | { kind: 'edu_data_board'; model: EduDataBoardModel } => {
  switch (layoutId) {
    case 'cover_tech':
      return { kind: 'cover_tech', model: toDirectCoverModel(source, 'Tech release') };
    case 'toc_tech':
      return { kind: 'toc_tech', model: toTechTocModel(source) };
    case 'ending_tech':
      return { kind: 'ending_tech', model: toEndingTechModel(source) };
    case 'arch_blocks':
      return { kind: 'title_content', model: toArchBlocksModel(source) };
    case 'param_dashboard':
      return { kind: 'edu_data_board', model: toParamDashboardModel(source) };
    case 'flow_logic_sequence':
      return { kind: 'process_steps', model: toFlowLogicSequenceModel(source) };
    case 'protocol_analysis':
      return { kind: 'title_bullets', model: toProtocolAnalysisModel(source) };
    case 'system_comparison':
      return { kind: 'two_column', model: toSystemComparisonModel(source) };
    case 'tech_principle':
      return { kind: 'title_content', model: toTechPrincipleModel(source) };
    case 'cover_interactive':
      return { kind: 'cover_interactive', model: toDirectCoverModel(source, 'Interactive workshop') };
    case 'agenda_path':
      return { kind: 'agenda_path', model: toAgendaPathModel(source) };
    case 'requirement_specs':
      return { kind: 'title_bullets', model: toRequirementSpecsModel(source) };
    case 'quiz_interaction':
      return { kind: 'title_bullets', model: toQuizInteractionModel(source) };
    case 'role_play_scenario':
      return { kind: 'title_content', model: toRolePlayScenarioModel(source) };
    case 'feedback_poll':
      return { kind: 'poll_interactive', model: toFeedbackPollModel(source) };
    case 'group_collab':
      return { kind: 'title_bullets', model: toGroupCollabModel(source) };
    case 'case_discussion':
      return { kind: 'two_column', model: toCaseDiscussionModel(source) };
    case 'ending_interactive':
      return { kind: 'ending_interactive', model: toDirectEndingModel(source, 'Workshop close') };
    case 'mind_map_structure':
      return { kind: 'image_full', model: toMindMapStructureModel(source) };
    case 'cover_practical':
      return { kind: 'cover_practical', model: toDirectCoverModel(source, 'Practical drill') };
    case 'checklist_verification':
      return { kind: 'title_bullets', model: toChecklistVerificationModel(source) };
    case 'task_instruction':
      return { kind: 'title_content', model: toTaskInstructionModel(source) };
    case 'common_faults':
      return { kind: 'two_column', model: toCommonFaultsModel(source) };
    case 'detail_specs':
      return { kind: 'title_content', model: toDetailSpecsModel(source) };
    case 'safety_protocol':
      return { kind: 'safety_notice', model: toSafetyProtocolModel(source) };
    case 'equipment_orientation':
      return { kind: 'two_column', model: toEquipmentOrientationModel(source) };
    case 'ending_practical':
      return { kind: 'ending_practical', model: toDirectEndingModel(source, 'Delivery close') };
    case 'cover_field':
      return { kind: 'cover_field', model: toDirectCoverModel(source, 'Field archive') };
    case 'timeline_evolution':
      return { kind: 'timeline_evolution', model: toTimelineEvolutionModel(source) };
    case 'field_observation':
      return { kind: 'image_full', model: toFieldObservationModel(source) };
    case 'infographic_flow':
      return { kind: 'title_bullets', model: toInfographicFlowModel(source) };
    case 'specimen_detail':
      return { kind: 'detail_zoom', model: toSpecimenDetailModel(source) };
    case 'case_before_after':
      return { kind: 'two_column', model: toCaseBeforeAfterModel(source) };
    case 'site_survey':
      return { kind: 'two_column', model: toSiteSurveyModel(source) };
    case 'ending_field':
      return { kind: 'ending_field', model: toDirectEndingModel(source, 'Field close') };
  }
};

export const isPhaseOneWeakLayoutId = (layoutId: string | null | undefined): layoutId is PhaseOneWeakLayoutId =>
  Boolean(layoutId && PHASE_ONE_WEAK_LAYOUT_IDS.has(layoutId as PhaseOneWeakLayoutId));

export const renderPhaseOneWeakLayoutHTML = (
  layoutId: LayoutId,
  model: Record<string, unknown>,
  theme: ThemeConfig
): string | null => {
  if (!isPhaseOneWeakLayoutId(layoutId)) {
    return null;
  }

  const config = buildPhaseOneWeakRendererConfig(layoutId, model);
  switch (config.kind) {
    case 'cover_tech':
      return renderPanelCoverLayoutHTML('cover_tech', config.model, theme);
    case 'toc_tech':
      return renderTechTocLayoutHTML(config.model, theme);
    case 'ending_tech':
      return renderTechEndingLayoutHTML(config.model, theme);
    case 'title_content':
      return renderTitleContentLayoutHTML(config.model, theme);
    case 'title_bullets':
      return renderTitleBulletsLayoutHTML(config.model, theme);
    case 'two_column':
      return renderTwoColumnLayoutHTML(config.model, theme);
    case 'process_steps':
      return renderProcessStepsLayoutHTML(config.model, theme);
    case 'cover_interactive':
      return renderPanelCoverLayoutHTML('cover_interactive', config.model, theme);
    case 'agenda_path':
      return renderAgendaPathLayoutHTML(config.model, theme);
    case 'poll_interactive':
      return renderPollInteractiveLayoutHTML(config.model, theme);
    case 'ending_interactive':
      return renderInteractiveEndingLayoutHTML(config.model, theme);
    case 'cover_practical':
      return renderPanelCoverLayoutHTML('cover_practical', config.model, theme);
    case 'safety_notice':
      return renderSafetyNoticeLayoutHTML(config.model, theme);
    case 'ending_practical':
      return renderPracticalEndingLayoutHTML(config.model, theme);
    case 'cover_field':
      return renderFieldCoverLayoutHTML(config.model, theme);
    case 'image_full':
      return renderImageFullLayoutHTML(config.model, theme);
    case 'detail_zoom':
      return renderDetailZoomLayoutHTML(config.model, theme);
    case 'timeline_evolution':
      return renderTimelineLayoutHTML(config.model, theme);
    case 'ending_field':
      return renderFieldEndingLayoutHTML(config.model, theme);
    case 'edu_data_board':
      return renderEduDataBoardLayoutHTML(config.model, theme);
  }
};

export const renderPhaseOneWeakLayoutNode = (
  layoutId: LayoutId,
  model: Record<string, unknown>,
  theme: ThemeConfig,
  onImageUpload?: (slotPath: string) => void
): React.ReactNode | null => {
  if (!isPhaseOneWeakLayoutId(layoutId)) {
    return null;
  }

  const config = buildPhaseOneWeakRendererConfig(layoutId, model);
  switch (config.kind) {
    case 'cover_tech':
      return renderPanelCoverLayoutNode('cover_tech', config.model, theme);
    case 'toc_tech':
      return renderTechTocLayoutNode(config.model, theme);
    case 'ending_tech':
      return renderTechEndingLayoutNode(config.model, theme);
    case 'title_content':
      return (
        <TitleContentLayout
          model={config.model}
          theme={theme}
          onImageUpload={onImageUpload ? () => onImageUpload('image.src') : undefined}
        />
      );
    case 'title_bullets':
      return (
        <TitleBulletsLayout
          model={config.model}
          theme={theme}
          onImageUpload={onImageUpload ? () => onImageUpload('image.src') : undefined}
        />
      );
    case 'two_column':
      return <TwoColumnLayout model={config.model} theme={theme} onImageUpload={onImageUpload} />;
    case 'process_steps':
      return (
        <ProcessStepsLayout
          model={config.model}
          theme={theme}
          onImageUpload={onImageUpload ? () => onImageUpload('image.src') : undefined}
        />
      );
    case 'cover_interactive':
      return renderPanelCoverLayoutNode('cover_interactive', config.model, theme);
    case 'agenda_path':
      return renderAgendaPathLayoutNode(config.model, theme);
    case 'poll_interactive':
      return <PollInteractiveLayout model={config.model} theme={theme} />;
    case 'ending_interactive':
      return renderInteractiveEndingLayoutNode(config.model, theme);
    case 'cover_practical':
      return renderPanelCoverLayoutNode('cover_practical', config.model, theme);
    case 'safety_notice':
      return <SafetyNoticeLayout model={config.model} theme={theme} />;
    case 'ending_practical':
      return renderPracticalEndingLayoutNode(config.model, theme);
    case 'cover_field':
      return renderFieldCoverLayoutNode(config.model, theme);
    case 'image_full':
      return (
        <ImageFullLayout
          model={config.model}
          theme={theme}
          onImageUpload={onImageUpload ? () => onImageUpload('image_src') : undefined}
        />
      );
    case 'detail_zoom':
      return (
        <DetailZoomLayout
          model={config.model}
          theme={theme}
          onImageUpload={onImageUpload ? () => onImageUpload('image_src') : undefined}
        />
      );
    case 'timeline_evolution':
      return <TimelineLayout model={config.model} theme={theme} />;
    case 'ending_field':
      return renderFieldEndingLayoutNode(config.model, theme);
    case 'edu_data_board':
      return <EduDataBoardLayout model={config.model} theme={theme} />;
  }
};
