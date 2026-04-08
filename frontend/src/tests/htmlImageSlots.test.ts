import { describe, expect, it } from 'vitest';

import {
  collectHtmlImageSlotDescriptors,
  isUserManagedImageSource,
  normalizeImageSource,
  sanitizeHtmlModelImageSources,
  sanitizeThemeImageSlotSources,
} from '@/utils/htmlImageSlots';
import { businessProTheme, minimalCleanTheme, warmEduTheme } from '@/experimental/html-renderer/themes';

describe('htmlImageSlots utils', () => {
  it('treats example.com sources as missing images', () => {
    expect(normalizeImageSource('https://example.com/images/demo.jpg')).toBe('');
    expect(normalizeImageSource('https://cdn.example.org/mock.png')).toBe('');
    expect(normalizeImageSource('data:image/png;base64,abc123')).toBe('data:image/png;base64,abc123');
  });

  it('sanitizes nested placeholder image urls inside HTML models', () => {
    const sanitized = sanitizeHtmlModelImageSources({
      image_src: 'https://example.com/main.png',
      image: { src: 'https://example.com/inline.png' },
      items: [
        { image_src: 'https://example.com/item-1.png', title: '案例一' },
        { image_src: 'https://assets.example.cn/item-2.png', title: '案例二' },
      ],
    });

    expect((sanitized as any).image_src).toBe('');
    expect((sanitized as any).image.src).toBe('');
    expect((sanitized as any).items[0].image_src).toBe('');
    expect((sanitized as any).items[1].image_src).toBe('https://assets.example.cn/item-2.png');
  });

  it('treats only persisted or session-managed images as valid content images across themes', () => {
    expect(isUserManagedImageSource('/files/project/pages/demo.webp')).toBe(true);
    expect(isUserManagedImageSource('https://localhost:5001/files/project/pages/demo.webp')).toBe(true);
    expect(isUserManagedImageSource('https://assets.example.cn/demo.webp')).toBe(false);

    const sanitized = sanitizeThemeImageSlotSources(
      {
        image_src: 'https://assets.example.cn/demo.webp',
        image: { src: '/files/project/pages/kept.webp' },
        background_image: 'https://assets.example.cn/background.webp',
      },
      businessProTheme,
    );

    expect((sanitized as any).image_src).toBe('');
    expect((sanitized as any).image.src).toBe('/files/project/pages/kept.webp');
    expect((sanitized as any).background_image).toBe('https://assets.example.cn/background.webp');
  });

  it('clears template-prefilled hero images but preserves user-managed hero images', () => {
    const sanitized = sanitizeThemeImageSlotSources(
      {
        hero_image: 'https://assets.example.cn/cover-hero.webp',
        background_image: 'https://assets.example.cn/background.webp',
      },
      minimalCleanTheme,
    );

    expect((sanitized as any).hero_image).toBe('');
    expect((sanitized as any).background_image).toBe('https://assets.example.cn/background.webp');

    const sanitizedManaged = sanitizeThemeImageSlotSources(
      {
        hero_image: '/files/project/pages/cover-hero.webp',
      },
      warmEduTheme,
    );

    expect((sanitizedManaged as any).hero_image).toBe('/files/project/pages/cover-hero.webp');
  });

  it('collects missing slots for portfolio and detail zoom layouts', () => {
    const inferTwoColumnPartType = () => 'text' as const;

    const portfolioSlots = collectHtmlImageSlotDescriptors(
      'portfolio',
      {
        items: [
          { image_src: '', title: '案例一' },
          { image_src: 'https://example.com/item.png', title: '案例二' },
          { image_src: 'https://cdn.valid.com/item.png', title: '案例三' },
        ],
      },
      { inferTwoColumnPartType }
    );

    const detailSlots = collectHtmlImageSlotDescriptors(
      'detail_zoom',
      { image_src: '' },
      { inferTwoColumnPartType }
    );

    expect(portfolioSlots.map((slot) => slot.slotPath)).toEqual([
      'items.0.image_src',
      'items.1.image_src',
      'items.2.image_src',
    ]);
    expect(portfolioSlots.filter((slot) => !slot.src).map((slot) => slot.slotPath)).toEqual([
      'items.0.image_src',
      'items.1.image_src',
      'items.2.image_src',
    ]);
    expect(detailSlots).toEqual([
      { slotPath: 'image_src', slotRole: 'main', src: '' },
    ]);
  });

  it('recognizes blueprint annotation image slots after theme remapping', () => {
    const inferTwoColumnPartType = () => 'text' as const;

    const slots = collectHtmlImageSlotDescriptors(
      'title_content',
      {
        title: '蓝图讲解',
        content: ['第一点'],
      },
      {
        inferTwoColumnPartType,
        theme: minimalCleanTheme,
      }
    );

    expect(slots).toEqual([
      { slotPath: 'image.src', slotRole: 'main', src: '' },
    ]);
  });

  it('counts only visible blueprint gallery cells after theme remapping', () => {
    const inferTwoColumnPartType = () => 'text' as const;

    const slots = collectHtmlImageSlotDescriptors(
      'blueprint_gallery',
      {
        items: [
          { image_src: '', title: '观测一' },
          { image_src: '', title: '观测二' },
          { image_src: '', title: '观测三' },
          { image_src: '', title: '观测四' },
        ],
      },
      {
        inferTwoColumnPartType,
        theme: minimalCleanTheme,
      }
    );

    expect(slots.map((slot) => slot.slotPath)).toEqual([
      'items.0.image_src',
      'items.1.image_src',
      'items.2.image_src',
    ]);
  });

  it('does not count generic cover backgrounds as content image slots', () => {
    const inferTwoColumnPartType = () => 'text' as const;

    const slots = collectHtmlImageSlotDescriptors(
      'cover',
      {
        title: '封面',
        background_image: '',
      },
      {
        inferTwoColumnPartType,
      }
    );

    expect(slots).toEqual([]);
  });

  it('treats warm_edu generic comparison pages as main content slots after theme remapping', () => {
    const inferTwoColumnPartType = () => 'text' as const;

    const slots = collectHtmlImageSlotDescriptors(
      'vocational_comparison',
      {
        title: '第一章：3D空间认知与基础逻辑',
        content: [
          '建立右手坐标系规范，明确 X/Y/Z 轴映射关系。',
          '掌握栅格系统对齐逻辑与吸附规则。',
        ],
        highlight: '坐标系定义是建模的绝对基准。',
        image: {
          src: '',
          alt: '三维坐标系与栅格系统的示意图',
          position: 'right',
          width: '40%',
        },
      },
      {
        inferTwoColumnPartType,
        theme: warmEduTheme,
        optionalImageEnabled: true,
      }
    );

    expect(slots).toEqual([
      { slotPath: 'image.src', slotRole: 'main', src: '' },
    ]);

    const slotsDisabled = collectHtmlImageSlotDescriptors(
      'vocational_comparison',
      {
        title: '第一章：3D空间认知与基础逻辑',
        image: {
          src: '',
          alt: '三维坐标系与栅格系统的示意图',
        },
      },
      {
        inferTwoColumnPartType,
        theme: warmEduTheme,
        optionalImageEnabled: false,
      }
    );

    expect(slotsDisabled).toEqual([
      { slotPath: 'image.src', slotRole: 'main', src: '' },
    ]);
  });

  it('does not invent shared image slots for generic two_column layouts', () => {
    const inferTwoColumnPartType = () => 'text' as const;

    const slots = collectHtmlImageSlotDescriptors(
      'two_column',
      {
        title: '左右对比说明',
        left: { header: '左侧方案', content: ['A'] },
        right: { header: '右侧方案', content: ['B'] },
      },
      {
        inferTwoColumnPartType,
        optionalImageEnabled: true,
      }
    );

    expect(slots).toEqual([]);
  });

  it('counts direct vocational_bullets image slots when the page renders a practice visual panel', () => {
    const inferTwoColumnPartType = () => 'text' as const;

    const slots = collectHtmlImageSlotDescriptors(
      'vocational_bullets',
      {
        title: '控制核心：阀类的职能分类',
        image: {
          src: '',
          alt: '训练配图槽位',
          position: 'right',
          width: '40%',
        },
      },
      {
        inferTwoColumnPartType,
        optionalImageEnabled: false,
      }
    );

    expect(slots).toEqual([
      { slotPath: 'image.src', slotRole: 'main', src: '' },
    ]);
  });

  it('treats content image slots with template artwork as empty by default for all themes', () => {
    const inferTwoColumnPartType = () => 'text' as const;

    const slots = collectHtmlImageSlotDescriptors(
      'detail_zoom',
      {
        image_src: 'https://assets.example.cn/demo.webp',
      },
      {
        inferTwoColumnPartType,
        theme: businessProTheme,
      }
    );

    expect(slots).toEqual([
      { slotPath: 'image_src', slotRole: 'main', src: '' },
    ]);

    const minimalSlots = collectHtmlImageSlotDescriptors(
      'title_content',
      {
        title: '蓝图讲解',
        image: {
          src: 'https://assets.example.cn/demo.webp',
          alt: '模板预填图',
        },
      },
      {
        inferTwoColumnPartType,
        theme: minimalCleanTheme,
        optionalImageEnabled: true,
      }
    );

    expect(minimalSlots).toEqual([
      { slotPath: 'image.src', slotRole: 'main', src: '' },
    ]);
  });
});
