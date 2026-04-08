import { describe, expect, it } from 'vitest';

import { renderLayoutHTML } from '@/experimental/html-renderer/layouts';
import { minimalCleanTheme } from '@/experimental/html-renderer/themes';

describe('renderLayoutHTML background injection', () => {
  it('injects background images for blueprint layouts during HTML export', () => {
    const html = renderLayoutHTML(
      'portfolio',
      {
        title: '作品展示',
        items: [
          { title: '案例一', description: '说明', image_src: '' },
        ],
        background_image: 'data:image/png;base64,abc123',
      } as any,
      minimalCleanTheme
    );

    expect(html).toContain('background-image:linear-gradient');
    expect(html).toContain('data:image/png;base64,abc123');
  });
});
