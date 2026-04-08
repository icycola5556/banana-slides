import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SlideRenderer } from '@/experimental/html-renderer/components/SlideRenderer';
import {
  eduDarkTheme,
  minimalCleanTheme,
  practicalTheme,
  visualTheme,
} from '@/experimental/html-renderer/themes';

const DATA_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

describe('SlideRenderer image upload routing', () => {
  it('keeps detail_zoom images replaceable in practical layouts', () => {
    const handleUpload = vi.fn();

    render(
      <SlideRenderer
        page={{
          page_id: 'detail-1',
          order_index: 0,
          layout_id: 'detail_zoom',
          model: {
            title: '结构细节',
            image_src: DATA_IMAGE,
            annotations: [],
          } as any,
        }}
        theme={practicalTheme}
        onImageUpload={handleUpload}
      />
    );

    fireEvent.click(screen.getByTestId('image-slot-frame'));

    expect(handleUpload).toHaveBeenCalledWith('image_src');
  });

  it('routes portfolio item replacement to the clicked item slot', () => {
    const handleUpload = vi.fn();

    render(
      <SlideRenderer
        page={{
          page_id: 'portfolio-1',
          order_index: 0,
          layout_id: 'portfolio',
          model: {
            title: '案例作品',
            items: [
              { title: '案例一', description: '说明', image_src: DATA_IMAGE },
              { title: '案例二', description: '说明', image_src: '' },
            ],
          } as any,
        }}
        theme={visualTheme}
        onImageUpload={handleUpload}
      />
    );

    fireEvent.click(screen.getAllByTestId('image-slot-frame')[1]);

    expect(handleUpload).toHaveBeenCalledWith('items.1.image_src');
  });

  it('keeps edu cover hero images replaceable after generation', () => {
    const handleUpload = vi.fn();

    render(
      <SlideRenderer
        page={{
          page_id: 'cover-1',
          order_index: 0,
          layout_id: 'edu_cover',
          model: {
            title: '课程封面',
            subtitle: '主题',
            hero_image: DATA_IMAGE,
            variant: 'a',
          } as any,
        }}
        theme={eduDarkTheme}
        onImageUpload={handleUpload}
      />
    );

    fireEvent.click(screen.getByTestId('image-slot-frame'));

    expect(handleUpload).toHaveBeenCalledWith('hero_image');
  });

  it('routes blueprint gallery replacement through visible item slots only', () => {
    const handleUpload = vi.fn();

    render(
      <SlideRenderer
        page={{
          page_id: 'blueprint-1',
          order_index: 0,
          layout_id: 'portfolio',
          model: {
            title: '观测矩阵',
            items: [
              { title: '图一', description: '说明', image_src: DATA_IMAGE },
              { title: '图二', description: '说明', image_src: '' },
              { title: '图三', description: '说明', image_src: '' },
              { title: '图四', description: '说明', image_src: '' },
            ],
          } as any,
        }}
        theme={minimalCleanTheme}
        onImageUpload={handleUpload}
      />
    );

    const frames = screen.getAllByTestId('image-slot-frame');

    expect(frames).toHaveLength(3);

    fireEvent.click(frames[2]);

    expect(handleUpload).toHaveBeenCalledWith('items.2.image_src');
  });

  it('keeps blueprint annotation visuals replaceable after generation', () => {
    const handleUpload = vi.fn();

    render(
      <SlideRenderer
        page={{
          page_id: 'annotation-1',
          order_index: 0,
          layout_id: 'title_content',
          model: {
            title: '细节标注',
            content: ['第一条说明', '第二条说明'],
            image: { src: DATA_IMAGE },
          } as any,
        }}
        theme={minimalCleanTheme}
        onImageUpload={handleUpload}
      />
    );

    fireEvent.click(screen.getByTestId('image-slot-frame'));

    expect(handleUpload).toHaveBeenCalledWith('image.src');
  });
});
