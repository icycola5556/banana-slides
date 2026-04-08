import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { SlideRenderer } from '@/experimental/html-renderer/components/SlideRenderer';
import { renderLayoutHTML } from '@/experimental/html-renderer/layouts';
import { businessProTheme, warmEduTheme } from '@/experimental/html-renderer/themes';

describe('template theme smoke tests', () => {
  it('renders warm_edu toc slides when items arrive as indexed objects', () => {
    const page = {
      page_id: 'warm-toc-indexed',
      order_index: 1,
      layout_id: 'toc' as const,
      model: {
        title: 'Task Map',
        items: {
          0: { text: 'Phase One' },
          1: { text: 'Phase Two' },
        },
      },
    };

    const { getByText, queryByText } = render(
      React.createElement(SlideRenderer, { page: page as any, theme: warmEduTheme, onImageUpload: () => {} }),
    );

    expect(getByText('Phase One')).toBeTruthy();
    expect(queryByText(/Unknown layout/)).toBeNull();
  });

  it('renders warm_edu title_bullets slides when bullets arrive as indexed objects', () => {
    const page = {
      page_id: 'warm-bullets-indexed',
      order_index: 2,
      layout_id: 'title_bullets' as const,
      model: {
        title: 'Safety Review',
        bullets: {
          0: { text: 'Cut power before inspection' },
          1: { text: 'Wear insulated protection' },
        },
        keyTakeaway: 'Strict sequence control reduces preventable mistakes.',
      },
    };

    const { getByText, queryByText } = render(
      React.createElement(SlideRenderer, { page: page as any, theme: warmEduTheme, onImageUpload: () => {} }),
    );

    expect(getByText('Cut power before inspection')).toBeTruthy();
    expect(getByText('Strict sequence control reduces preventable mistakes.')).toBeTruthy();
    expect(queryByText(/Failure to comply/i)).toBeNull();
    expect(queryByText(/Unknown layout/)).toBeNull();
  });

  it('renders warm_edu vocational bullet slides when content arrives without bullets', () => {
    const page = {
      page_id: 'warm-vocational-bullets-content',
      order_index: 3,
      layout_id: 'vocational_bullets' as const,
      model: {
        title: 'Fault Isolation',
        content: [
          'Check the power path and wiring state first.',
          'Verify control parameters and safety interlocks next.',
        ],
        highlight: 'Stop the machine before handling abnormal states.',
      },
    };

    const { getByText, queryByText } = render(
      React.createElement(SlideRenderer, {
        page: page as any,
        theme: warmEduTheme,
        onImageUpload: () => {},
      }),
    );

    expect(getByText('Check the power path and wiring state first.')).toBeTruthy();
    expect(getByText('Stop the machine before handling abnormal states.')).toBeTruthy();
    expect(queryByText(/render error/i)).toBeNull();
  });

  it('renders business_pro comparison tables when items and features arrive as indexed objects', () => {
    const html = renderLayoutHTML(
      'comparison_table' as any,
      {
        title: 'Option Matrix',
        items: {
          0: {
            name: 'Plan A',
            features: {
              0: 'Stable',
              1: 'Higher cost',
            },
          },
          1: {
            name: 'Plan B',
            features: {
              0: 'Flexible',
              1: 'Mid cost',
            },
          },
        },
      } as any,
      businessProTheme,
    );

    expect(html).toContain('Plan A');
    expect(html).toContain('Stable');
    expect(html).not.toContain('export failed');
  });

  it('renders business_pro process_steps slides when steps arrive as indexed objects', () => {
    const page = {
      page_id: 'vault-steps-indexed',
      order_index: 4,
      layout_id: 'process_steps' as const,
      model: {
        title: 'Execution Chain',
        steps: {
          0: { number: 1, label: 'Receive instruction' },
          1: { number: 2, label: 'Validate execution' },
        },
      },
    };

    const { getByText, queryByText } = render(
      React.createElement(SlideRenderer, { page: page as any, theme: businessProTheme }),
    );

    expect(getByText('Receive instruction')).toBeTruthy();
    expect(queryByText(/Unknown layout/)).toBeNull();
  });

  it('renders vocational bullet html without export fallback when bullets are derived from content', () => {
    const html = renderLayoutHTML(
      'vocational_bullets' as any,
      {
        title: 'Safety Flow',
        content: [
          'Recheck the work order and protective gear before operation.',
          'Stop the device immediately when parameters exceed the limit.',
        ],
        highlight: 'Non-compliant operation directly raises accident risk.',
      } as any,
      warmEduTheme,
    );

    expect(html).toContain('Recheck the work order and protective gear before operation.');
    expect(html).toContain('Non-compliant operation directly raises accident risk.');
    expect(html).not.toContain('export failed');
  });

  it('maps warm_edu quiz pages into a themed content layout instead of unknown layout fallback', () => {
    const page = {
      page_id: 'warm-quiz-fallback',
      order_index: 5,
      layout_id: 'quiz' as any,
      model: {
        title: 'Mesh Quality Validation',
        content: [
          'Check boolean output for self-intersections and broken normals.',
          'Rebuild invalid faces before sending assets into rendering.',
        ],
        highlight: 'Topology validation is mandatory after every destructive edit.',
        image: {
          src: '',
          alt: 'Boolean repair workflow reference',
          position: 'right',
          width: '40%',
        },
      },
    };

    const { getByText, queryByText } = render(
      React.createElement(SlideRenderer, { page: page as any, theme: warmEduTheme }),
    );

    expect(getByText('Mesh Quality Validation')).toBeTruthy();
    expect(getByText('Topology validation is mandatory after every destructive edit.')).toBeTruthy();
    expect(queryByText(/unknown layout/i)).toBeNull();
  });

  it('renders warm_edu vocational comparison pages even when backend sends generic content', () => {
    const page = {
      page_id: 'warm-comparison-generic',
      order_index: 6,
      layout_id: 'vocational_comparison' as const,
      model: {
        title: 'Method Duel: Box Modeling vs. Subdivision Surface',
        content: [
          'Box modeling keeps edge flow predictable for hard-surface assets.',
          'Subdivision surface improves organic transitions but needs careful control.',
          'Blend both strategies around structural and transition zones.',
        ],
        highlight: 'Do not overuse automatic smoothing without topology review.',
        image: {
          src: '',
          alt: 'Method comparison board',
          position: 'right',
          width: '40%',
        },
      },
    };

    const { getByText, queryByText } = render(
      React.createElement(SlideRenderer, { page: page as any, theme: warmEduTheme }),
    );

    expect(getByText('Box Modeling')).toBeTruthy();
    expect(getByText('Subdivision Surface')).toBeTruthy();
    expect(getByText('Blend both strategies around structural and transition zones.')).toBeTruthy();
    expect(getByText('方案对比配图')).toBeTruthy();
    expect(queryByText(/render error/i)).toBeNull();
  });

  it('routes warm_edu generic chapter summaries away from forced comparison shells', () => {
    const page = {
      page_id: 'warm-comparison-summary-fallback',
      order_index: 6,
      layout_id: 'vocational_comparison' as const,
      model: {
        title: 'Chapter One: Spatial Logic and Modeling Basics',
        content: [
          'Build a clear XYZ coordinate mental model before moving into practical modeling tasks.',
          'Use grid and snapping rules to keep spatial judgment stable across different viewports.',
          'Treat coordinate definitions as the absolute baseline for downstream topology work.',
        ],
        highlight: 'Coordinate rules are the foundation of reliable modeling decisions.',
        image: {
          src: '',
          alt: 'Coordinate system support diagram',
          position: 'right',
          width: '40%',
        },
      },
    };

    const { getByText, queryByText } = render(
      React.createElement(SlideRenderer, { page: page as any, theme: warmEduTheme }),
    );

    expect(getByText('Coordinate rules are the foundation of reliable modeling decisions.')).toBeTruthy();
    expect(queryByText(/OPTION A/i)).toBeNull();
    expect(queryByText(/render error/i)).toBeNull();
  });

  it('keeps warm_edu content pages text-first when only an image slot exists', () => {
    const page = {
      page_id: 'warm-content-slot-ready',
      order_index: 7,
      layout_id: 'title_content' as const,
      model: {
        title: 'Scenario Drill: Broken Mesh and Inverted Normals',
        content: [
          'Diagnose abnormal black faces by validating topology before touching lighting parameters.',
          'Run the SOP checklist in sequence so the repair path stays stable and teachable.',
        ],
        highlight: 'The workflow stays text-first until a real visual asset is uploaded.',
        image: {
          src: '',
          alt: 'Topology repair reference board',
          position: 'right',
          width: '40%',
        },
      },
    };

    const { getByText, queryByText } = render(
      React.createElement(SlideRenderer, { page: page as any, theme: warmEduTheme }),
    );

    expect(getByText('The workflow stays text-first until a real visual asset is uploaded.')).toBeTruthy();
    expect(queryByText(/render error/i)).toBeNull();
  });

  it('renders warm_edu image_full slides with localized slot guidance', () => {
    const page = {
      page_id: 'warm-image-full-slot',
      order_index: 8,
      layout_id: 'image_full' as const,
      model: {
        title: 'Toolchain Focus',
        image_src: '',
        image_alt: 'Tool interface close-up',
        caption: 'Keep the zoom page ready for structure or workflow visuals.',
      },
    };

    const { getByText, queryByText } = render(
      React.createElement(SlideRenderer, {
        page: page as any,
        theme: warmEduTheme,
        onImageUpload: () => {},
      }),
    );

    expect(getByText('\u5b9e\u8bad\u7ec6\u8282\u56fe')).toBeTruthy();
    expect(
      getByText('\u652f\u6301\u6279\u91cf\u751f\u6210\u6216\u624b\u52a8\u4e0a\u4f20\u5c40\u90e8\u7ed3\u6784\u56fe\u3002'),
    ).toBeTruthy();
    expect(queryByText(/render error/i)).toBeNull();
  });

  it('renders warm_edu summary boards from structured columns without flattening all text into one block', () => {
    const page = {
      page_id: 'warm-summary-columns',
      order_index: 7,
      layout_id: 'edu_summary' as const,
      model: {
        title: 'Workflow Review',
        columns: [
          {
            title: 'Core Flow',
            points: [
              'Validate topology after boolean operations.',
              'Lock UV rules before texture export.',
            ],
          },
          {
            title: 'Decision Strategy',
            points: [
              'Choose low-risk modeling paths for structural zones.',
            ],
          },
          {
            title: 'Efficiency Gain',
            points: [
              'Automate repeated checks before final render.',
            ],
          },
        ],
        closing: 'Standardized review keeps rendering quality predictable.',
      },
    };

    const { getByText, queryByText } = render(
      React.createElement(SlideRenderer, { page: page as any, theme: warmEduTheme }),
    );

    expect(getByText('Core Flow')).toBeTruthy();
    expect(getByText('Decision Strategy')).toBeTruthy();
    expect(getByText('Efficiency Gain')).toBeTruthy();
    expect(queryByText(/render error/i)).toBeNull();
  });

  it('renders warm_edu ending pages from reflection blocks and contact metadata', () => {
    const page = {
      page_id: 'warm-ending-reflection',
      order_index: 8,
      layout_id: 'ending' as const,
      model: {
        title: 'Next Action',
        subtitle: 'Final review and submission',
        contact: 'portal.example.com/deadline',
        reflection_blocks: [
          {
            title: 'Quality Check',
            items: [
              'Confirm normals are unified.',
              'Confirm every seam follows the plan.',
            ],
          },
          {
            title: 'Efficiency Check',
            items: [
              'Reuse automation for repetitive validation.',
            ],
          },
        ],
        closing: 'Submit only assets that pass the final checklist.',
      },
    };

    const { getByText, queryByText } = render(
      React.createElement(SlideRenderer, { page: page as any, theme: warmEduTheme }),
    );

    expect(getByText('Quality Check')).toBeTruthy();
    expect(getByText('Efficiency Check')).toBeTruthy();
    expect(queryByText(/render error/i)).toBeNull();
  });
});
