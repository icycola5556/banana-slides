import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SlideRenderer } from '@/experimental/html-renderer/components/SlideRenderer';
import { normalizeLayoutId, renderLayoutHTML } from '@/experimental/html-renderer/layouts';
import { getThemeByScheme } from '@/experimental/html-renderer/themes';

const DATA_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

const cases: Array<{
  schemeId: 'tech_blue' | 'interactive' | 'practical' | 'visual';
  layoutId:
    | 'cover_tech'
    | 'toc_tech'
    | 'ending_tech'
    | 'arch_blocks'
    | 'param_dashboard'
    | 'flow_logic_sequence'
    | 'protocol_analysis'
    | 'requirement_specs'
    | 'cover_interactive'
    | 'agenda_path'
    | 'quiz_interaction'
    | 'role_play_scenario'
    | 'feedback_poll'
    | 'group_collab'
    | 'case_discussion'
    | 'ending_interactive'
    | 'cover_practical'
    | 'mind_map_structure'
    | 'checklist_verification'
    | 'task_instruction'
    | 'common_faults'
    | 'detail_specs'
    | 'ending_practical'
    | 'system_comparison'
    | 'tech_principle'
    | 'safety_protocol'
    | 'equipment_orientation'
    | 'cover_field'
    | 'timeline_evolution'
    | 'field_observation'
    | 'infographic_flow'
    | 'specimen_detail'
    | 'case_before_after'
    | 'site_survey'
    | 'ending_field';
  expected: string;
  model: Record<string, unknown>;
}> = [
  {
    schemeId: 'tech_blue',
    layoutId: 'cover_tech',
    expected: 'Tech release',
    model: {
      title: 'Tech release',
      subtitle: 'From preview state to export state',
      author: 'Platform engineering',
      department: 'Systems',
      date: '2026 Q2',
    },
  },
  {
    schemeId: 'tech_blue',
    layoutId: 'toc_tech',
    expected: 'Acquisition layer',
    model: {
      title: 'Tech outline',
      subtitle: 'Architecture / Protocol / Delivery',
      items: [
        { index: 1, text: 'Acquisition layer', description: 'Collect source inputs and normalize them' },
        { index: 2, text: 'Render core', description: 'Build preview and export from one canonical page state' },
      ],
      summary: 'Every node in the chain should be observable.',
    },
  },
  {
    schemeId: 'tech_blue',
    layoutId: 'arch_blocks',
    expected: 'System architecture',
    model: {
      title: 'System architecture',
      blocks: [{ title: 'Ingress', description: 'Collect task input' }],
    },
  },
  {
    schemeId: 'tech_blue',
    layoutId: 'param_dashboard',
    expected: 'Run metrics',
    model: {
      title: 'Run metrics',
      metrics: [{ value: '98%', label: 'Success rate' }],
      bars: [{ label: 'HTML render', baseline: 60, current: 87 }],
    },
  },
  {
    schemeId: 'tech_blue',
    layoutId: 'flow_logic_sequence',
    expected: 'Request lifecycle',
    model: {
      title: 'Request lifecycle',
      subtitle: 'Request -> Orchestration -> Delivery',
      steps: [
        { number: 1, label: 'Parse input', description: 'Resolve task and constraints' },
        { number: 2, label: 'Render output', description: 'Build HTML from structured content' },
      ],
    },
  },
  {
    schemeId: 'tech_blue',
    layoutId: 'protocol_analysis',
    expected: 'event',
    model: {
      title: 'Protocol fields',
      fields: [{ text: 'event', description: 'Event type' }],
    },
  },
  {
    schemeId: 'tech_blue',
    layoutId: 'requirement_specs',
    expected: 'Recoverable state',
    model: {
      title: 'Launch requirements',
      requirements: [
        { text: 'Recoverable state', description: 'Refresh must preserve preview status' },
      ],
    },
  },
  {
    schemeId: 'interactive',
    layoutId: 'cover_interactive',
    expected: 'Interactive workshop',
    model: {
      title: 'Interactive workshop',
      subtitle: 'Turn learners into active editors',
      author: 'Teaching lab',
      department: 'Learning design',
      date: 'Open session',
    },
  },
  {
    schemeId: 'interactive',
    layoutId: 'quiz_interaction',
    expected: 'Quick check',
    model: {
      title: 'Quick check',
      subtitle: 'Which page improves persuasion the most?',
      bullets: [
        { text: 'A. Animation consistency', description: 'Looks better, but does not fix the message' },
        { text: 'B. Clear story arc', description: 'Tells the audience why they should keep listening' },
      ],
      keyTakeaway: 'Interactive quizzes should reinforce the answer, not just reveal it.',
    },
  },
  {
    schemeId: 'interactive',
    layoutId: 'role_play_scenario',
    expected: 'Role play',
    model: {
      title: 'Role play',
      content: [
        'You have five minutes to pitch a teaching innovation to the dean.',
        'Rebuild your slide order using only the six pages that matter.',
      ],
      highlight: 'Students only internalize structure when they migrate it into a real task.',
    },
  },
  {
    schemeId: 'interactive',
    layoutId: 'feedback_poll',
    expected: 'What needs the most attention?',
    model: {
      question: 'What needs the most attention?',
      instruction: 'Vote within 30 seconds.',
      options: [{ text: 'Narrative flow' }, { text: 'Visual hierarchy' }],
    },
  },
  {
    schemeId: 'interactive',
    layoutId: 'group_collab',
    expected: 'Collaboration task',
    model: {
      title: 'Collaboration task',
      tasks: [{ text: 'Content lead', description: 'Own the story arc' }],
    },
  },
  {
    schemeId: 'interactive',
    layoutId: 'case_discussion',
    expected: 'Case discussion',
    model: {
      title: 'Case discussion',
      scenario: ['Users remember the visuals but not the core point.'],
      discussion_points: [{ text: 'Find the narrative break' }],
    },
  },
  {
    schemeId: 'interactive',
    layoutId: 'mind_map_structure',
    expected: 'Mind map recap',
    model: {
      title: 'Mind map recap',
      image_src: DATA_IMAGE,
      caption: 'Cluster viewpoints into one visual summary',
    },
  },
  {
    schemeId: 'interactive',
    layoutId: 'ending_interactive',
    expected: 'Workshop close',
    model: {
      title: 'Workshop close',
      subtitle: 'Leave with one structure you can reuse tomorrow',
      reflection_blocks: [
        { title: 'What landed', items: ['The class worked with the same narrative spine.'] },
        { title: 'Next move', items: ['Run one transfer task with a real audience.'] },
      ],
      closing: 'An interactive template should end with a next action, not a polite fade-out.',
    },
  },
  {
    schemeId: 'practical',
    layoutId: 'cover_practical',
    expected: 'Practical drill',
    model: {
      title: 'Practical drill',
      subtitle: 'Safe handoff before execution',
      author: 'Workshop lead',
      department: 'Operations lab',
      date: 'Shift A',
    },
  },
  {
    schemeId: 'practical',
    layoutId: 'checklist_verification',
    expected: 'Preflight checklist',
    model: {
      title: 'Preflight checklist',
      checklist: [{ text: 'Environment check', description: 'Verify versions and output paths' }],
    },
  },
  {
    schemeId: 'practical',
    layoutId: 'task_instruction',
    expected: 'Complete the workshop task',
    model: {
      title: 'Complete the workshop task',
      instructions: [
        'Finish one 8-slide draft in 20 minutes.',
        'Submit a preview link and one self-review note.',
      ],
      highlight: 'Instruction pages should be executable, not decorative.',
    },
  },
  {
    schemeId: 'practical',
    layoutId: 'common_faults',
    expected: 'Common faults',
    model: {
      title: 'Common faults',
      left: {
        type: 'bullets',
        header: 'Symptoms',
        bullets: [{ text: 'Preview card is blank', description: 'The first-page asset was never written back' }],
      },
      right: {
        type: 'bullets',
        header: 'Fix actions',
        bullets: [{ text: 'Backfill the first preview asset', description: 'Use the first HTML as the history preview source' }],
      },
    },
  },
  {
    schemeId: 'practical',
    layoutId: 'detail_specs',
    expected: 'Acceptance spec',
    model: {
      title: 'Acceptance spec',
      content: [
        'Output pages must remain traceable and sequentially named.',
        'Failure states must preserve the last successful asset for recovery.',
      ],
      highlight: 'Trust comes from explicit standards.',
    },
  },
  {
    schemeId: 'practical',
    layoutId: 'ending_practical',
    expected: 'Delivery close',
    model: {
      title: 'Delivery close',
      subtitle: 'Ship the output and the recovery notes together',
      reflection_blocks: [
        { title: 'Required delivery', items: ['Final HTML export', 'Preview evidence'] },
        { title: 'Next drill', items: ['Repeat the flow with one tighter SOP.'] },
      ],
      closing: 'A practical template fails if the handoff criteria stay vague.',
    },
  },
  {
    schemeId: 'visual',
    layoutId: 'cover_field',
    expected: 'Field archive',
    model: {
      title: 'Field archive',
      subtitle: 'Visual evidence before commentary',
      author: 'Visual team',
      department: 'Archive studio',
      date: 'Collection 2026',
      background_image: DATA_IMAGE,
    },
  },
  {
    schemeId: 'tech_blue',
    layoutId: 'system_comparison',
    expected: 'HTML pipeline',
    model: {
      title: 'System comparison',
      left: {
        header: 'HTML pipeline',
        bullets: [{ text: 'Faster export setup', description: 'Reuses the preview asset path' }],
      },
      right: {
        header: 'Canvas pipeline',
        bullets: [{ text: 'Heavier raster step', description: 'Needs another conversion pass' }],
      },
    },
  },
  {
    schemeId: 'tech_blue',
    layoutId: 'tech_principle',
    expected: 'Core principle',
    model: {
      title: 'Core principle',
      principles: [
        'Bind preview, export, and variant selection to the same canonical page model.',
        'Make image slots explicit so exporters never guess which asset matters.',
      ],
      highlight: 'A tech template should teach mechanism, not just decorate it.',
    },
  },
  {
    schemeId: 'tech_blue',
    layoutId: 'ending_tech',
    expected: 'System integrity',
    model: {
      title: 'Tech debrief',
      subtitle: 'Close with the mechanism, not just the mood.',
      reflection_blocks: [
        { title: 'System integrity', items: ['Keep preview, export, and state transitions aligned.'] },
        { title: 'Operational trust', items: ['Make every asset path explicit instead of inferred.'] },
      ],
      closing: 'The template only earns trust when the final output matches the selected state.',
    },
  },
  {
    schemeId: 'interactive',
    layoutId: 'agenda_path',
    expected: 'Warm-up prompt',
    model: {
      title: 'Learning path',
      subtitle: 'Warm-up -> discussion -> transfer',
      items: [
        { index: 1, text: 'Warm-up prompt', description: 'Break inertia with a real question' },
        { index: 2, text: 'Case discussion', description: 'Turn the question into peer reasoning' },
      ],
      instruction: 'Keep the learner moving, not just listening.',
    },
  },
  {
    schemeId: 'practical',
    layoutId: 'safety_protocol',
    expected: 'Safety rules',
    model: {
      title: 'Safety rules',
      warnings: [{ level: 'danger', text: 'Do not overwrite source files' }],
    },
  },
  {
    schemeId: 'practical',
    layoutId: 'equipment_orientation',
    expected: 'Equipment overview',
    model: {
      title: 'Equipment overview',
      equipment_image: DATA_IMAGE,
      components: [{ text: 'Control zone', description: 'Start and pause actions' }],
    },
  },
  {
    schemeId: 'visual',
    layoutId: 'ending_field',
    expected: 'Field close',
    model: {
      title: 'Field close',
      subtitle: 'Leave one frame in memory',
      reflection_blocks: [
        { title: 'Series strength', items: ['Lead with image evidence.'] },
        { title: 'Best use cases', items: ['Brand story', 'Visual archive'] },
      ],
      closing: 'Visual decks should leave an afterimage, not just a summary sentence.',
    },
  },
  {
    schemeId: 'visual',
    layoutId: 'field_observation',
    expected: 'Field observation',
    model: {
      title: 'Field observation',
      image_src: DATA_IMAGE,
      caption: 'Site overview',
    },
  },
  {
    schemeId: 'visual',
    layoutId: 'timeline_evolution',
    expected: 'Legacy workflow',
    model: {
      title: 'Evolution timeline',
      items: [
        { index: 1, text: 'Legacy workflow', description: 'Static screenshot previews and detached export state' },
        { index: 2, text: 'Canonical preview state', description: 'Preview and export now share one page model' },
      ],
    },
  },
  {
    schemeId: 'visual',
    layoutId: 'infographic_flow',
    expected: 'Infographic notes',
    model: {
      title: 'Infographic notes',
      flow: [
        { text: 'Observe', description: 'Capture the visual evidence first' },
        { text: 'Label', description: 'Name the change before explaining it' },
      ],
      keyTakeaway: 'The narrative should follow the image evidence.',
    },
  },
  {
    schemeId: 'visual',
    layoutId: 'specimen_detail',
    expected: 'Specimen close-up',
    model: {
      title: 'Specimen close-up',
      image_src: DATA_IMAGE,
      annotations: [
        { x: 24, y: 32, label: 'A', description: 'Edge fracture' },
        { x: 68, y: 46, label: 'B', description: 'Surface wear pattern' },
      ],
    },
  },
  {
    schemeId: 'visual',
    layoutId: 'case_before_after',
    expected: 'Before and after',
    model: {
      title: 'Before and after',
      before: { title: 'Before', points: [{ text: 'Fragmented messaging' }] },
      after: { title: 'After', points: [{ text: 'Clearer story arc' }] },
    },
  },
  {
    schemeId: 'visual',
    layoutId: 'site_survey',
    expected: 'Site survey',
    model: {
      title: 'Site survey',
      overview_image: DATA_IMAGE,
      observations: [{ text: 'Congestion at the entrance' }],
    },
  },
];

describe('phase-one weak template layouts', () => {
  it('keeps direct layout ids out of alias fallback', () => {
    for (const item of cases) {
      expect(normalizeLayoutId(item.layoutId as any)).toBe(item.layoutId);
    }
  });

  it('renders direct weak layouts in HTML export without unknown fallback', () => {
    for (const item of cases) {
      const html = renderLayoutHTML(item.layoutId as any, item.model as any, getThemeByScheme(item.schemeId));
      expect(html).toContain(item.expected);
      expect(html).not.toContain('未知布局类型');
    }
  });

  it('renders direct weak layouts in SlideRenderer without unknown fallback', () => {
    for (const item of cases) {
      const view = render(
        React.createElement(SlideRenderer, {
          page: {
            page_id: `${item.schemeId}-${item.layoutId}`,
            order_index: 1,
            layout_id: item.layoutId,
            model: item.model,
          } as any,
          theme: getThemeByScheme(item.schemeId),
        }),
      );

      expect(view.getAllByText(item.expected).length).toBeGreaterThan(0);
      expect(view.queryByText(/未知布局类型/)).toBeNull();
      view.unmount();
    }
  });
});
