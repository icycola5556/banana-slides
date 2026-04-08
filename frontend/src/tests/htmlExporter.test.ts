import { describe, expect, it, vi } from 'vitest';

import {
  inlineModelImageSources,
  inlinePagePayloadModels,
} from '@/experimental/html-renderer/utils/htmlExporter';

describe('htmlExporter image inlining', () => {
  it('inlines nested image sources while preserving variant fields', async () => {
    const resolver = vi.fn(async (url: string) => `data:image/mock;base64,${url}`);
    const model = {
      title: '封面',
      variant: 'b',
      layout_variant: 'b',
      hero_image: '/files/project/pages/hero.webp',
      image: {
        src: '/files/project/pages/content.webp',
        alt: '配图',
      },
      diagram_url: '/files/project/pages/diagram.webp',
      notes: '这不是图片字段',
    };

    const result = await inlineModelImageSources(model, resolver);

    expect(result.variant).toBe('b');
    expect(result.layout_variant).toBe('b');
    expect(result.hero_image).toBe('data:image/mock;base64,/files/project/pages/hero.webp');
    expect((result.image as { src: string }).src).toBe('data:image/mock;base64,/files/project/pages/content.webp');
    expect(result.diagram_url).toBe('data:image/mock;base64,/files/project/pages/diagram.webp');
    expect(result.notes).toBe('这不是图片字段');
  });

  it('reuses the same inlined source across page payloads', async () => {
    const resolver = vi.fn(async (url: string) => `data:image/mock;base64,${url}`);
    const pages = [
      {
        page_id: 'p1',
        layout_id: 'edu_cover',
        model: {
          hero_image: '/files/project/pages/shared.webp',
        },
      },
      {
        page_id: 'p2',
        layout_id: 'title_content',
        model: {
          image: {
            src: '/files/project/pages/shared.webp',
          },
        },
      },
    ];

    const result = await inlinePagePayloadModels(pages, resolver);

    expect(result[0].model.hero_image).toBe('data:image/mock;base64,/files/project/pages/shared.webp');
    expect((result[1].model.image as { src: string }).src).toBe('data:image/mock;base64,/files/project/pages/shared.webp');
    expect(resolver).toHaveBeenCalledTimes(1);
  });
});
