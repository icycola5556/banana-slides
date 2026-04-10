/**
 * 布局适配工具 - 提供动态字体大小调整和布局一致性支持
 * 供React组件和HTML导出函数共享使用
 */

import { ThemeConfig } from '../types/schema';

/**
 * 字体大小配置
 */
export interface FontSizeConfig {
  min: number;      // 最小字体大小(px)
  max: number;      // 最大字体大小(px)
  normal: number;   // 正常字体大小(px)
}

/**
 * 默认字体大小配置
 */
export const DEFAULT_FONT_SIZES: FontSizeConfig = {
  min: 14,
  max: 48,
  normal: 24,
};

/**
 * 计算基于内容长度的适配字体大小
 * @param textLength 文本长度（字符数）
 * @param containerHeight 容器高度(px)
 * @param containerWidth 容器宽度(px)
 * @param config 字体大小配置
 * @returns 适配的字体大小(px)
 */
export function calculateAdaptiveFontSize(
  textLength: number,
  containerHeight: number = 500,
  containerWidth: number = 800,
  config: Partial<FontSizeConfig> = {}
): number {
  const { min = 14, max = 48, normal = 24 } = config;

  // 估算：中文字符每字占用的像素面积（考虑行高）
  const charArea = normal * normal * 1.8; // 1.8是行高系数

  // 容器可用面积
  const containerArea = containerHeight * containerWidth * 0.85; // 0.85是边距系数

  // 根据内容量计算需要的字体大小
  const requiredArea = textLength * charArea;

  if (requiredArea <= containerArea) {
    return normal; // 内容较少，使用正常字体
  }

  // 内容较多，按比例缩小字体
  const scaleFactor = Math.sqrt(containerArea / requiredArea);
  const adjustedSize = Math.max(min, Math.min(max, normal * scaleFactor));

  // 取整并返回
  return Math.round(adjustedSize);
}

/**
 * 计算标题的适配字体大小
 * @param titleLength 标题长度
 * @param maxWidth 最大宽度
 * @returns 适配的字体大小(px)
 */
export function calculateAdaptiveTitleSize(
  titleLength: number,
  maxWidth: number = 1000
): number {
  // 标题基础大小
  const baseSize = 44;

  // 根据长度调整
  if (titleLength <= 10) return baseSize;
  if (titleLength <= 20) return Math.max(36, baseSize - 4);
  if (titleLength <= 30) return Math.max(32, baseSize - 8);
  if (titleLength <= 40) return Math.max(28, baseSize - 12);
  return Math.max(24, baseSize - 16);
}

/**
 * 布局尺寸配置
 */
export interface LayoutDimensions {
  slideWidth: number;
  slideHeight: number;
  headerHeight: number;
  footerHeight: number;
  padding: number;
}

/**
 * 获取标准幻灯片尺寸
 */
export function getStandardDimensions(theme?: ThemeConfig): LayoutDimensions {
  return {
    slideWidth: theme?.sizes?.slideWidth || 1280,
    slideHeight: theme?.sizes?.slideHeight || 720,
    headerHeight: 120,  // 标题区域高度
    footerHeight: 40,   // 底部边距
    padding: 44,        // 左右边距
  };
}

/**
 * 计算内容区域可用高度
 */
export function getAvailableContentHeight(dimensions: LayoutDimensions): number {
  return dimensions.slideHeight - dimensions.headerHeight - dimensions.footerHeight - dimensions.padding * 2;
}

/**
 * 计算内容区域可用宽度
 */
export function getAvailableContentWidth(dimensions: LayoutDimensions): number {
  return dimensions.slideWidth - dimensions.padding * 2;
}

/**
 * 将样式对象转换为内联样式字符串
 */
export function toInlineStyle(styles: Record<string, string | number | undefined>): string {
  return Object.entries(styles)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${kebabKey}:${value}`;
    })
    .join(';');
}

/**
 * 解析样式字符串为React CSSProperties
 */
export function parseStyle(styleString: string): React.CSSProperties {
  const styles: Record<string, string> = {};
  styleString.split(';').forEach((rule) => {
    const [key, value] = rule.split(':').map((s) => s.trim());
    if (key && value) {
      const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      styles[camelKey] = value;
    }
  });
  return styles as React.CSSProperties;
}

/**
 * 文本长度估算（考虑中英文混合）
 * @param text 文本内容
 * @returns 等效字符数
 */
export function estimateTextLength(text: string): number {
  if (!text) return 0;

  let length = 0;
  for (const char of text) {
    // 中文字符计为1.5，英文计为0.5（平均单词长度）
    if (/[\u4e00-\u9fa5]/.test(char)) {
      length += 1.5;
    } else {
      length += 0.5;
    }
  }
  return Math.ceil(length);
}

/**
 * 多段文本总长度估算
 */
export function estimateTotalLength(texts: string[]): number {
  return texts.reduce((total, text) => total + estimateTextLength(text), 0);
}
