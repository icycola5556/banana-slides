import { describe, expect, it } from 'vitest';

import { resolveThemeLayout } from '@/experimental/html-renderer/layouts';
import { businessProTheme, minimalCleanTheme, warmEduTheme } from '@/experimental/html-renderer/themes';

describe('resolveThemeLayout', () => {
  it('maps minimal_clean title_content pages into blueprint annotation slides', () => {
    const resolved = resolveThemeLayout(
      'title_content',
      {
        title: '什么是3D？空间坐标的数学语言',
        content: ['第一段', '第二段'],
        highlight: '关键强调',
      } as any,
      minimalCleanTheme
    );

    expect(resolved.layoutId).toBe('blueprint_annotation');
    expect(resolved.model.content).toEqual(['第一段', '第二段', '关键强调']);
  });

  it('adapts warm_edu learning objectives into vocational target cards', () => {
    const resolved = resolveThemeLayout(
      'learning_objectives',
      {
        title: '本节目标',
        course_code: 'EV-HV-07',
        objectives: [
          { text: '完成高压断电', level: '应用', hours: 2 },
          { text: '完成绝缘检测', level: '分析' },
        ],
      } as any,
      warmEduTheme
    );

    expect(resolved.layoutId).toBe('vocational_target_lock');
    expect(resolved.model.subtitle).toBe('EV-HV-07');
    expect(resolved.model.bullets).toEqual([
      { text: '完成高压断电', description: '应用 // 2h' },
      { text: '完成绝缘检测', description: '分析' },
    ]);
  });

  it('adapts business_pro timeline events into vault timeline steps', () => {
    const resolved = resolveThemeLayout(
      'timeline',
      {
        title: '行业演进',
        events: [
          { year: '2024', title: '起步', description: '建立能力' },
          { year: '2025', title: '扩张', description: '规模化部署' },
        ],
      } as any,
      businessProTheme
    );

    expect(resolved.layoutId).toBe('vault_timeline');
    expect(resolved.model.steps).toEqual([
      { number: 1, label: '起步', description: '建立能力' },
      { number: 2, label: '扩张', description: '规模化部署' },
    ]);
  });

  it('adapts business_pro comparison tables into vault compare matrices', () => {
    const resolved = resolveThemeLayout(
      'comparison_table',
      {
        title: '方案对比',
        subtitle: '核心能力',
        items: [
          { name: '方案A', features: ['低成本', '高风险'] },
          { name: '方案B', features: ['高可靠', '中成本'] },
        ],
      } as any,
      businessProTheme
    );

    expect(resolved.layoutId).toBe('vault_compare');
    expect(resolved.model.categories).toEqual([
      { name: 'POINT 01' },
      { name: 'POINT 02' },
    ]);
    expect(resolved.model.options).toEqual([
      { name: '方案A', values: ['低成本', '高风险'] },
      { name: '方案B', values: ['高可靠', '中成本'] },
    ]);
  });
  it('keeps image data when minimal_clean title_content becomes blueprint annotation', () => {
    const resolved = resolveThemeLayout(
      'title_content',
      {
        title: 'Blueprint image retention',
        content: ['A'],
        image: {
          src: 'data:image/png;base64,abc123',
        },
      } as any,
      minimalCleanTheme
    );

    expect(resolved.layoutId).toBe('blueprint_annotation');
    expect((resolved.model as any).image).toEqual({
      src: 'data:image/png;base64,abc123',
    });
  });

  it('recovers portfolio content from indexed objects and fallback bullets', () => {
    const resolved = resolveThemeLayout(
      'portfolio',
      {
        title: '作品展示',
        subtitle: '从草图构想到完整建模',
        items: {
          0: {
            image_src: 'data:image/png;base64,abc123',
          },
        },
        bullets: [
          { text: '头盔结构拆解', description: '展示外壳、护目镜与机械连接关系' },
          { text: '材质与灯效复盘', description: '对比金属反光、磨损与发光层次' },
        ],
      } as any,
      minimalCleanTheme
    );

    expect(resolved.layoutId).toBe('blueprint_gallery');
    expect((resolved.model as any).items).toEqual([
      {
        image_src: 'data:image/png;base64,abc123',
        title: '头盔结构拆解',
        description: '展示外壳、护目镜与机械连接关系',
        tags: undefined,
      },
      {
        image_src: '',
        title: '材质与灯效复盘',
        description: '对比金属反光、磨损与发光层次',
        tags: undefined,
      },
    ]);
  });
});
