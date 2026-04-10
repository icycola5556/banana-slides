/**
 * 标题+正文布局组件 - 支持动态字体调整和预览/导出一致性
 * 支持有图/无图两种渲染模式
 */

import React, { useMemo } from 'react';
import { TitleContentModel, ThemeConfig } from '../../types/schema';
import { ImageSlotFrame } from '../../components/ImageSlotFrame';
import {
  toInlineStyle,
  getBaseSlideStyle,
  getTitleStyle,
  getBodyStyle,
} from '../../utils/styleHelper';
import {
  calculateAdaptiveTitleSize,
  calculateAdaptiveFontSize,
  getStandardDimensions,
  getAvailableContentHeight,
  getAvailableContentWidth,
  estimateTotalLength,
  parseStyle,
} from '../../utils/layoutAdapter';

interface TitleContentLayoutProps {
  model: TitleContentModel;
  theme: ThemeConfig;
  onImageUpload?: () => void;
}

/**
 * 共享的布局计算逻辑 - React和HTML导出共用
 */
function calculateLayoutStyles(
  model: TitleContentModel,
  theme: ThemeConfig,
  hasImage: boolean
) {
  const { title, content, highlight, image } = model;
  const dims = getStandardDimensions(theme);
  const contentArray = Array.isArray(content) ? content : [content];

  // 计算标题字体大小
  const titleSize = calculateAdaptiveTitleSize(title?.length || 0);

  // 计算内容区域尺寸
  const availableHeight = getAvailableContentHeight(dims) - 40; // 减去标题区域
  const availableWidth = getAvailableContentWidth(dims);

  // 计算正文字体大小
  const totalTextLength = estimateTotalLength(contentArray) +
    (highlight ? estimateTotalLength([highlight]) : 0);

  const contentFontSize = hasImage
    ? calculateAdaptiveFontSize(totalTextLength, availableHeight, availableWidth * 0.55)
    : calculateAdaptiveFontSize(totalTextLength, availableHeight, availableWidth);

  // 图片配置
  const imagePosition = image?.position || 'right';
  const imageWidth = image?.width || '45%';

  return {
    titleSize,
    contentFontSize,
    imagePosition,
    imageWidth,
    contentArray,
    dims,
    availableHeight,
    availableWidth,
  };
}

export const TitleContentLayout: React.FC<TitleContentLayoutProps> = ({ model, theme, onImageUpload }) => {
  const { title, content, highlight, image, background_image } = model;
  const hasImage = image && (image.src || image.src === '');

  // 使用共享的布局计算
  const layout = useMemo(() => calculateLayoutStyles(model, theme, !!hasImage), [model, theme, hasImage]);

  const { titleSize, contentFontSize, imagePosition, imageWidth, contentArray } = layout;

  const slideStyle: React.CSSProperties = {
    ...getBaseSlideStyle(theme),
    ...(background_image
      ? {
        backgroundImage: `url(${background_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
      : {}),
  };

  const titleStyle: React.CSSProperties = {
    ...getTitleStyle(theme),
    fontSize: titleSize,
    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
  };

  const paragraphStyle: React.CSSProperties = {
    ...getBodyStyle(theme),
    fontSize: contentFontSize,
    lineHeight: '1.6',
    marginTop: '16px',
  };

  const highlightStyle: React.CSSProperties = {
    marginTop: '24px',
    padding: '16px 20px',
    backgroundColor: theme.colors.backgroundAlt,
    borderLeft: `4px solid ${theme.colors.accent}`,
    borderRadius: '0 8px 8px 0',
    fontSize: contentFontSize,
    color: theme.colors.text,
    fontStyle: 'italic',
  };

  // 有图模式：左右分栏
  if (hasImage) {
    return (
      <section style={slideStyle}>
        <h2 style={titleStyle}>{title}</h2>
        <div style={{
          display: 'flex',
          flexDirection: imagePosition === 'left' ? 'row-reverse' : 'row',
          gap: '30px',
          marginTop: '40px',
          flex: '1',
          alignItems: 'stretch',
          height: 'calc(100% - 140px)',
          minHeight: '360px',
        }}>
          <div style={{ flex: '1' }}>
            {contentArray.map((paragraph, index) => (
              <p key={index} style={paragraphStyle}>
                {paragraph}
              </p>
            ))}
            {highlight && (
              <div style={highlightStyle}>{highlight}</div>
            )}
          </div>
          <div style={{ width: imageWidth, flexShrink: 0, display: 'flex', alignItems: 'stretch' }}>
            <ImageSlotFrame
              src={image.src}
              alt={image.alt || ''}
              theme={theme}
              slotLabel="配图插槽"
              slotHint="建议使用与正文并列的辅助配图，默认按 contain 完整显示。"
              onClick={onImageUpload}
              frameStyle={{
                width: '100%',
                height: '100%',
                minHeight: '320px',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              imageStyle={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'center',
              }}
            />
          </div>
        </div>
      </section>
    );
  }

  // 无图模式：全宽布局
  return (
    <section style={slideStyle}>
      <h2 style={titleStyle}>{title}</h2>
      <div style={{ marginTop: '40px', flex: '1' }}>
        {contentArray.map((paragraph, index) => (
          <p key={index} style={paragraphStyle}>
            {paragraph}
          </p>
        ))}
        {highlight && (
          <div style={highlightStyle}>{highlight}</div>
        )}
      </div>
    </section>
  );
};

/**
 * HTML导出渲染函数 - 使用与React组件相同的布局计算
 */
export function renderTitleContentLayoutHTML(model: TitleContentModel, theme: ThemeConfig): string {
  const { title, content, highlight, image, background_image } = model;
  const hasImage = image && (image.src !== undefined);

  // 使用共享的布局计算
  const layout = calculateLayoutStyles(model, theme, !!hasImage);
  const { titleSize, contentFontSize, imagePosition, imageWidth, contentArray, dims } = layout;

  const slideStyle = toInlineStyle({
    width: `${dims.slideWidth}px`,
    height: `${dims.slideHeight}px`,
    position: 'relative',
    overflow: 'hidden',
    fontFamily: theme.fonts.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    ...(background_image
      ? {
        backgroundImage: `url(${background_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
      : {}),
    boxSizing: 'border-box',
    padding: `${dims.padding}px`,
  });

  const titleStyle = toInlineStyle({
    fontSize: `${titleSize}px`,
    fontWeight: 'bold',
    color: theme.colors.primary,
    margin: '0',
    lineHeight: '1.3',
    fontFamily: theme.fonts.title,
  });

  const paragraphStyle = toInlineStyle({
    fontSize: `${contentFontSize}px`,
    color: theme.colors.text,
    lineHeight: '1.6',
    margin: '0',
    marginTop: '16px',
  });

  const highlightStyle = toInlineStyle({
    marginTop: '24px',
    padding: '16px 20px',
    backgroundColor: theme.colors.backgroundAlt,
    borderLeft: `4px solid ${theme.colors.accent}`,
    borderRadius: '0 8px 8px 0',
    fontSize: `${contentFontSize}px`,
    color: theme.colors.text,
    fontStyle: 'italic',
  });

  const paragraphsHTML = contentArray
    .map((p) => `      <p style="${paragraphStyle}">${p}</p>`)
    .join('\n');

  const highlightHTML = highlight
    ? `      <div style="${highlightStyle}">${highlight}</div>`
    : '';

  // 有图模式
  if (hasImage) {
    const flexDirection = imagePosition === 'left' ? 'row-reverse' : 'row';

    let imageHTML = '';
    if (image.src) {
      const imageStyle = toInlineStyle({
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        objectPosition: 'center',
      });
      imageHTML = `<img src="${image.src}" alt="${image.alt || ''}" style="${imageStyle}" />`;
    } else {
      const placeholderStyle = toInlineStyle({
        width: '100%',
        height: '100%',
        minHeight: '320px',
        backgroundColor: theme.colors.backgroundAlt,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.colors.textLight,
        fontSize: '14px',
        border: `2px dashed ${theme.colors.secondary}`,
      });
      imageHTML = `<div style="${placeholderStyle}"><span>点击上传图片</span></div>`;
    }

    return `<section style="${slideStyle}">
  <h2 style="${titleStyle}">${title}</h2>
  <div style="display:flex;flex-direction:${flexDirection};gap:30px;margin-top:40px;flex:1;align-items:stretch;height:calc(100% - 140px);min-height:360px;">
    <div style="flex:1">
${paragraphsHTML}
${highlightHTML}
    </div>
    <div style="width:${imageWidth};flex-shrink:0;display:flex;align-items:stretch;">
      ${imageHTML}
    </div>
  </div>
</section>`;
  }

  // 无图模式
  return `<section style="${slideStyle}">
  <h2 style="${titleStyle}">${title}</h2>
  <div style="margin-top:40px;flex:1">
${paragraphsHTML}
${highlightHTML}
  </div>
</section>`;
}

export default TitleContentLayout;
