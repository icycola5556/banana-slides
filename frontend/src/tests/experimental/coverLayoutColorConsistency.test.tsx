/**
 * CoverLayout 颜色一致性测试
 * 验证 React 组件预览和 HTML 导出时颜色逻辑一致
 * Bug修复: https://github.com/.../issues/...
 * 问题: 预览时有背景图显示黑色文字，但导出HTML时强制白色文字
 */

import { describe, expect, it } from 'vitest';
import { renderCoverLayoutHTML as renderRootCoverLayoutHTML } from '@/experimental/html-renderer/layouts/CoverLayout';
import { renderCoverLayoutHTML as renderCommonCoverLayoutHTML } from '@/experimental/html-renderer/layouts/common/CoverLayout';
import { warmEduTheme } from '@/experimental/html-renderer/themes';
import type { CoverModel, ThemeConfig } from '@/experimental/html-renderer/types/schema';

describe('CoverLayout color consistency between preview and export', () => {
  const mockTheme: ThemeConfig = warmEduTheme;

  // 测试数据：有背景图的封面
  const modelWithBackground: CoverModel = {
    title: '形象设计的作用：重塑视觉价值与职业竞争力',
    subtitle: '从外表修饰到内在投射的系统性重构。',
    author: '专业形象设计研究院',
    department: '职业发展中心',
    date: '2023-10',
    background_image: '/files/test/background.jpg',
  };

  // 测试数据：无背景图的封面
  const modelWithoutBackground: CoverModel = {
    title: '测试标题',
    subtitle: '测试副标题',
    author: '测试作者',
    background_image: undefined,
  };

  describe('layouts/CoverLayout.tsx', () => {
    it('should use dark text colors when background_image is present (root CoverLayout)', () => {
      const html = renderRootCoverLayoutHTML(modelWithBackground, mockTheme);

      // 标题应该是深色 (#111111)
      expect(html).toContain('color:#111111');
      
      // 副标题应该是深色 (#333333)
      expect(html).toContain('color:#333333');
      
      // 作者信息应该是深色 (#333333)
      // 注意：由于可能有多个 #333333，我们检查总数
      const darkColorMatches = html.match(/color:#333333/g);
      expect(darkColorMatches?.length).toBeGreaterThanOrEqual(2); // 副标题 + 作者
      
      // 不应该包含白色标题文字
      expect(html).not.toContain("color:#ffffff");
      expect(html).not.toContain("color:rgba(255,255,255");
    });

    it('should use white text colors when background_image is absent (root CoverLayout)', () => {
      const html = renderRootCoverLayoutHTML(modelWithoutBackground, mockTheme);

      // 标题应该是白色 (#ffffff)
      expect(html).toContain('color:#ffffff');
      
      // 副标题应该是半透明白色 (rgba(255,255,255,0.9))
      expect(html).toContain('color:rgba(255,255,255,0.9)');
      
      // 作者信息应该是半透明白色 (rgba(255,255,255,0.8))
      expect(html).toContain('color:rgba(255,255,255,0.8)');
      
      // 不应该包含深色文字
      expect(html).not.toContain('color:#111111');
      expect(html).not.toContain('color:#333333');
    });

    it('should apply correct text shadow based on background presence (root CoverLayout)', () => {
      // 有背景图时：使用浅色阴影
      const htmlWithBg = renderRootCoverLayoutHTML(modelWithBackground, mockTheme);
      expect(htmlWithBg).toContain('text-shadow:0 1px 3px rgba(255,255,255,0.8)');
      expect(htmlWithBg).not.toContain('text-shadow:0 2px 4px rgba(0,0,0,0.2)');

      // 无背景图时：使用深色阴影
      const htmlWithoutBg = renderRootCoverLayoutHTML(modelWithoutBackground, mockTheme);
      expect(htmlWithoutBg).toContain('text-shadow:0 2px 4px rgba(0,0,0,0.2)');
      expect(htmlWithoutBg).not.toContain('text-shadow:0 1px 3px rgba(255,255,255,0.8)');
    });
  });

  describe('layouts/common/CoverLayout.tsx', () => {
    it('should use dark text colors when background_image is present (common CoverLayout)', () => {
      const html = renderCommonCoverLayoutHTML(modelWithBackground, mockTheme);

      // 标题应该是深色 (#111111)
      expect(html).toContain('color:#111111');
      
      // 副标题应该是深色 (#333333)
      expect(html).toContain('color:#333333');
      
      // 作者信息应该是深色 (#333333)
      const darkColorMatches = html.match(/color:#333333/g);
      expect(darkColorMatches?.length).toBeGreaterThanOrEqual(2); // 副标题 + 作者
      
      // 不应该包含白色标题文字
      expect(html).not.toContain("color:#ffffff");
      expect(html).not.toContain("color:rgba(255,255,255");
    });

    it('should use white text colors when background_image is absent (common CoverLayout)', () => {
      const html = renderCommonCoverLayoutHTML(modelWithoutBackground, mockTheme);

      // 标题应该是白色 (#ffffff)
      expect(html).toContain('color:#ffffff');
      
      // 副标题应该是半透明白色
      expect(html).toContain('color:rgba(255,255,255,0.9)');
      
      // 作者信息应该是半透明白色
      expect(html).toContain('color:rgba(255,255,255,0.8)');
      
      // 不应该包含深色文字
      expect(html).not.toContain('color:#111111');
      expect(html).not.toContain('color:#333333');
    });

    it('should apply correct text shadow based on background presence (common CoverLayout)', () => {
      // 有背景图时：使用浅色阴影
      const htmlWithBg = renderCommonCoverLayoutHTML(modelWithBackground, mockTheme);
      expect(htmlWithBg).toContain('text-shadow:0 1px 3px rgba(255,255,255,0.8)');
      expect(htmlWithBg).not.toContain('text-shadow:0 2px 4px rgba(0,0,0,0.2)');

      // 无背景图时：使用深色阴影
      const htmlWithoutBg = renderCommonCoverLayoutHTML(modelWithoutBackground, mockTheme);
      expect(htmlWithoutBg).toContain('text-shadow:0 2px 4px rgba(0,0,0,0.2)');
      expect(htmlWithoutBg).not.toContain('text-shadow:0 1px 3px rgba(255,255,255,0.8)');
    });

    it('should handle variant B layout correctly with background image', () => {
      const modelVariantB: CoverModel = {
        ...modelWithBackground,
        variant: 'b',
        layout_variant: 'b',
      };

      const html = renderCommonCoverLayoutHTML(modelVariantB, mockTheme);

      // 验证基本颜色逻辑仍然正确
      expect(html).toContain('color:#111111');
      expect(html).toContain('color:#333333');
      
      // 验证 Variant B 的特定样式（左下角定位）
      expect(html).toContain('bottom:60px');
      expect(html).toContain('left:60px');
      expect(html).toContain('text-align:left');
    });
  });

  describe('Color consistency comparison', () => {
    it('should produce consistent colors between root and common CoverLayout implementations', () => {
      const htmlRoot = renderRootCoverLayoutHTML(modelWithBackground, mockTheme);
      const htmlCommon = renderCommonCoverLayoutHTML(modelWithBackground, mockTheme);

      // 两者都应该包含深色文字
      expect(htmlRoot).toContain('color:#111111');
      expect(htmlCommon).toContain('color:#111111');
      
      expect(htmlRoot).toContain('color:#333333');
      expect(htmlCommon).toContain('color:#333333');

      // 验证无背景图的情况
      const htmlRootNoBg = renderRootCoverLayoutHTML(modelWithoutBackground, mockTheme);
      const htmlCommonNoBg = renderCommonCoverLayoutHTML(modelWithoutBackground, mockTheme);

      expect(htmlRootNoBg).toContain('color:#ffffff');
      expect(htmlCommonNoBg).toContain('color:#ffffff');
    });
  });
});
