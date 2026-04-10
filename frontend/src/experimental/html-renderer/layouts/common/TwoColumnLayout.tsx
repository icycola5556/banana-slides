/**
 * 左右双栏布局组件 - 支持动态字体调整和预览/导出一致性
 */

import React, { useMemo } from 'react';
import { TwoColumnModel, ColumnContent, ThemeConfig } from '../../types/schema';
import { ImageSlotFrame } from '../../components/ImageSlotFrame';
import {
  toInlineStyle,
  getBaseSlideStyle,
  getTitleStyle,
  getImagePlaceholderStyle,
} from '../../utils/styleHelper';
import {
  calculateAdaptiveTitleSize,
  calculateAdaptiveFontSize,
  getStandardDimensions,
  getAvailableContentHeight,
  getAvailableContentWidth,
  estimateTotalLength,
} from '../../utils/layoutAdapter';

interface TwoColumnLayoutProps {
  model: TwoColumnModel;
  theme: ThemeConfig;
  onImageUpload?: (slotPath: string) => void; // 图片上传回调
}

type ResolvedColumnType = 'text' | 'image' | 'bullets';

function resolveColumnType(content: ColumnContent): ResolvedColumnType {
  if (content.type) return content.type;
  if (content.bullets && content.bullets.length > 0) return 'bullets';
  if (content.image_src) return 'image';
  return 'text';
}

function normalizeContentLines(content: ColumnContent['content']): string[] {
  const raw = Array.isArray(content) ? content : [content || ''];
  return raw
    .map((item) => String(item || '').trim())
    .filter(Boolean);
}

/**
 * 估算两栏内容的总文字量
 */
function estimateColumnContent(left: ColumnContent, right: ColumnContent): number {
  let totalLength = 0;

  // 左栏文字
  const leftContent = normalizeContentLines(left.content);
  totalLength += estimateTotalLength(leftContent);

  if (left.bullets && left.bullets.length > 0) {
    const bulletTexts = left.bullets.map(b => `${b.text || ''} ${b.description || ''}`);
    totalLength += estimateTotalLength(bulletTexts);
  }

  // 右栏文字
  const rightContent = normalizeContentLines(right.content);
  totalLength += estimateTotalLength(rightContent);

  if (right.bullets && right.bullets.length > 0) {
    const bulletTexts = right.bullets.map(b => `${b.text || ''} ${b.description || ''}`);
    totalLength += estimateTotalLength(bulletTexts);
  }

  return totalLength;
}

/**
 * 共享的布局计算逻辑 - React和HTML导出共用
 */
function calculateLayoutStyles(
  model: TwoColumnModel,
  theme: ThemeConfig
) {
  const { title, left, right } = model;
  const dims = getStandardDimensions(theme);

  // 计算标题字体大小
  const titleSize = calculateAdaptiveTitleSize(title?.length || 0);

  // 计算内容区域尺寸 - 两栏布局，可用宽度减半
  const availableHeight = getAvailableContentHeight(dims) - 40;
  const availableWidth = getAvailableContentWidth(dims) * 0.45; // 每栏约45%宽度

  // 计算正文字体大小 - 基于两栏总文字量
  const totalTextLength = estimateColumnContent(left, right);
  const contentFontSize = calculateAdaptiveFontSize(totalTextLength, availableHeight, availableWidth);

  // 栏目标题字体大小
  const headerFontSize = Math.max(16, Math.min(24, contentFontSize + 2));

  return {
    titleSize,
    contentFontSize,
    headerFontSize,
    dims,
    availableHeight,
    availableWidth,
  };
}

export const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({ model, theme, onImageUpload }) => {
  const { title, left, right, background_image } = model;

  // 使用共享的布局计算
  const layout = useMemo(() => calculateLayoutStyles(model, theme), [model, theme]);
  const { titleSize, contentFontSize, headerFontSize } = layout;

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
  const titleStyle = toInlineStyle({
    ...getTitleStyle(theme),
    fontSize: `${titleSize}px`,
    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
  });

  const columnsContainerStyle = toInlineStyle({
    marginTop: '40px',
    display: 'flex',
    gap: '40px',
    flex: '1',
  });

  const columnStyle = toInlineStyle({
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
  });

  return (
    <section style={slideStyle}>
      <h2 style={parseStyle(titleStyle)}>{title}</h2>
      <div style={parseStyle(columnsContainerStyle)}>
        <div style={parseStyle(columnStyle)}>
          <ColumnRenderer
            content={left}
            theme={theme}
            onImageUpload={onImageUpload ? () => onImageUpload('left.image_src') : undefined}
            fontSize={contentFontSize}
            headerFontSize={headerFontSize}
          />
        </div>
        <div style={parseStyle(columnStyle)}>
          <ColumnRenderer
            content={right}
            theme={theme}
            onImageUpload={onImageUpload ? () => onImageUpload('right.image_src') : undefined}
            fontSize={contentFontSize}
            headerFontSize={headerFontSize}
          />
        </div>
      </div>
    </section>
  );
}

const ColumnRenderer: React.FC<{
  content: ColumnContent;
  theme: ThemeConfig;
  onImageUpload?: () => void;
  fontSize?: number;
  headerFontSize?: number;
}> = ({
  content,
  theme,
  onImageUpload,
  fontSize,
  headerFontSize,
}) => {
    const resolvedType = resolveColumnType(content);
    const contentArray = normalizeContentLines(content.content);

    const headerStyle = toInlineStyle({
      fontSize: `${headerFontSize || 24}px`,
      fontWeight: '600',
      color: theme.colors.secondary,
      margin: '0',
      marginBottom: '16px',
    });

    const textStyle = toInlineStyle({
      fontSize: `${fontSize || 18}px`,
      color: theme.colors.text,
      lineHeight: '1.8',
      margin: '0',
    });

    const imageFrameStyle = toInlineStyle({
      width: '100%',
      height: '100%',
      minHeight: '320px',
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });

    const imageStyle = toInlineStyle({
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      objectPosition: 'center',
    });

    const bulletItemStyle = toInlineStyle({
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      marginTop: '12px',
    });

    const bulletTextWrapStyle = toInlineStyle({
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    });

    const bulletTitleStyle = toInlineStyle({
      fontSize: `${fontSize || 18}px`,
      color: theme.colors.text,
      lineHeight: '1.8',
      margin: '0',
    });

    const bulletDescriptionStyle = toInlineStyle({
      fontSize: `${Math.max(12, (fontSize || 18) - 4)}px`,
      color: theme.colors.textLight,
      lineHeight: '1.6',
      margin: '0',
    });

    const bulletIconStyle = toInlineStyle({
      width: fontSize ? `${Math.max(20, fontSize - 2)}px` : '24px',
      height: fontSize ? `${Math.max(20, fontSize - 2)}px` : '24px',
      borderRadius: '50%',
      backgroundColor: theme.colors.accent,
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: fontSize ? `${Math.max(10, fontSize - 6)}px` : '12px',
      flexShrink: '0',
      marginTop: '2px',
    });

    if (resolvedType === 'image') {
      return (
        <>
          {content.header && <h3 style={parseStyle(headerStyle)}>{content.header}</h3>}
          <ImageSlotFrame
            src={content.image_src}
            alt={content.image_alt || ''}
            theme={theme}
            slotLabel={content.header ? `${content.header} 插槽` : '栏位图片插槽'}
            slotHint="建议使用与该栏内容匹配的说明图，当前栏位会按 contain 显示。"
            onClick={onImageUpload}
            frameStyle={parseStyle(imageFrameStyle)}
            imageStyle={parseStyle(imageStyle)}
            placeholderStyle={{ minHeight: '320px' }}
          />
        </>
      );
    }

    if (resolvedType === 'bullets') {
      // 优先使用 bullets 数组
      if (content.bullets && content.bullets.length > 0) {
        return (
          <>
            {content.header && <h3 style={parseStyle(headerStyle)}>{content.header}</h3>}
            {contentArray.map((text, index) => (
              <p key={`intro-${index}`} style={{ ...parseStyle(textStyle), marginTop: index > 0 ? '10px' : '0' }}>
                {text}
              </p>
            ))}
            <div>
              {content.bullets.map((bullet, index) => (
                <div key={index} style={parseStyle(bulletItemStyle)}>
                  <div style={parseStyle(bulletIconStyle)}>
                    {bullet.icon ? (
                      <i className={bullet.icon.startsWith('fa') ? bullet.icon : `fa ${bullet.icon}`} />
                    ) : (
                      <i className="fa fa-check" />
                    )}
                  </div>
                  <div style={parseStyle(bulletTextWrapStyle)}>
                    <p style={parseStyle(bulletTitleStyle)}>{bullet.text}</p>
                    {bullet.description && (
                      <p style={parseStyle(bulletDescriptionStyle)}>{bullet.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        );
      }

      // Fallback: 如果使用了 content 数组 but type=bullets，解析其中可能的 HTML 标签
      return (
        <>
          {content.header && <h3 style={parseStyle(headerStyle)}>{content.header}</h3>}
          <div>
            {contentArray.map((text, index) => {
              // 尝试解析 <i class="..."></i> 标签提取图标
              const iconMatch = text.match(/<i[^>]*class=["']([^"']+)["'][^>]*><\/i>\s*/);
              const cleanText = text.replace(/<i[^>]*><\/i>\s*/, '').trim();
              const iconClass = iconMatch ? iconMatch[1] : 'fa fa-check';

              return (
                <div key={index} style={parseStyle(bulletItemStyle)}>
                  <div style={parseStyle(bulletIconStyle)}>
                    <i className={iconClass} />
                  </div>
                  <span style={parseStyle(textStyle)}>{cleanText}</span>
                </div>
              );
            })}
          </div>
        </>
      );
    }

    // 默认文本类型
    return (
      <>
        {content.header && <h3 style={parseStyle(headerStyle)}>{content.header}</h3>}
        {contentArray.map((text, index) => (
          <p key={index} style={{ ...parseStyle(textStyle), marginTop: index > 0 ? '16px' : '0' }}>
            {text}
          </p>
        ))}
      </>
    );
  };

export function renderTwoColumnLayoutHTML(model: TwoColumnModel, theme: ThemeConfig): string {
  const { title, left, right, background_image } = model;

  // 使用共享的布局计算
  const layout = calculateLayoutStyles(model, theme);
  const { titleSize, contentFontSize, headerFontSize } = layout;

  const slideStyle = toInlineStyle({
    width: `${theme.sizes.slideWidth}px`,
    height: `${theme.sizes.slideHeight}px`,
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
    padding: theme.spacing.padding,
  });

  const titleStyle = toInlineStyle({
    fontSize: `${titleSize}px`,
    fontWeight: 'bold',
    color: theme.colors.primary,
    margin: '0',
    lineHeight: '1.3',
    fontFamily: theme.fonts.title,
  });

  const columnsContainerStyle = toInlineStyle({
    marginTop: '40px',
    display: 'flex',
    gap: '40px',
  });

  const columnStyle = toInlineStyle({
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
  });

  function renderColumnHTML(content: ColumnContent): string {
    const resolvedType = resolveColumnType(content);
    const contentArray = normalizeContentLines(content.content);

    const headerStyle = toInlineStyle({
      fontSize: `${headerFontSize}px`,
      fontWeight: '600',
      color: theme.colors.secondary,
      margin: '0',
      marginBottom: '16px',
    });

    const textStyle = toInlineStyle({
      fontSize: `${contentFontSize}px`,
      color: theme.colors.text,
      lineHeight: '1.8',
      margin: '0',
    });

    const imageFrameStyle = toInlineStyle({
      width: '100%',
      height: '100%',
      minHeight: '320px',
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });

    const imageStyle = toInlineStyle({
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      objectPosition: 'center',
    });

    const bulletItemStyle = toInlineStyle({
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      marginTop: '12px',
    });

    const bulletTextWrapStyle = toInlineStyle({
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    });

    const bulletTitleStyle = toInlineStyle({
      fontSize: `${contentFontSize}px`,
      color: theme.colors.text,
      lineHeight: '1.8',
      margin: '0',
    });

    const bulletDescriptionStyle = toInlineStyle({
      fontSize: `${Math.max(12, contentFontSize - 4)}px`,
      color: theme.colors.textLight,
      lineHeight: '1.6',
      margin: '0',
    });

    const bulletIconStyle = toInlineStyle({
      width: `${Math.max(20, contentFontSize - 2)}px`,
      height: `${Math.max(20, contentFontSize - 2)}px`,
      borderRadius: '50%',
      backgroundColor: theme.colors.accent,
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${Math.max(10, contentFontSize - 6)}px`,
      flexShrink: '0',
      marginTop: '2px',
    });

    let html = '';
    if (content.header) {
      html += `<h3 style="${headerStyle}">${content.header}</h3>`;
    }

    if (resolvedType === 'image') {
      if (content.image_src) {
        html += `<div style="${imageFrameStyle}"><img src="${content.image_src}" alt="${content.image_alt || ''}" style="${imageStyle}" /></div>`;
      } else {
        const placeholderStyle = toInlineStyle({
          ...getImagePlaceholderStyle('100%', '100%'),
          minHeight: '320px',
        });
        html += `<div style="${placeholderStyle}">[图片占位]</div>`;
      }
    } else if (resolvedType === 'bullets') {
      if (content.bullets && content.bullets.length > 0) {
        contentArray.forEach((text, index) => {
          const marginStyle = index > 0 ? 'margin-top:10px;' : '';
          html += `<p style="${textStyle}${marginStyle}">${text}</p>`;
        });
        html += '<div>';
        content.bullets.forEach((bullet) => {
          const iconClass = bullet.icon
            ? bullet.icon.startsWith('fa') ? bullet.icon : `fa ${bullet.icon}`
            : 'fa fa-check';
          html += `<div style="${bulletItemStyle}">
            <div style="${bulletIconStyle}"><i class="${iconClass}"></i></div>
            <div style="${bulletTextWrapStyle}">
              <p style="${bulletTitleStyle}">${bullet.text}</p>
              ${bullet.description ? `<p style="${bulletDescriptionStyle}">${bullet.description}</p>` : ''}
            </div>
          </div>`;
        });
        html += '</div>';
      } else {
        contentArray.forEach((text, index) => {
          const iconMatch = text.match(/<i[^>]*class=["']([^"']+)["'][^>]*><\/i>\s*/);
          const cleanText = text.replace(/<i[^>]*><\/i>\s*/, '').trim();
          const iconClass = iconMatch ? iconMatch[1] : 'fa fa-check';
          const marginStyle = index > 0 ? 'margin-top:10px;' : '';

          html += `<div style="${bulletItemStyle}${marginStyle}">
            <div style="${bulletIconStyle}"><i class="${iconClass}"></i></div>
            <div style="${bulletTextWrapStyle}">
              <p style="${bulletTitleStyle}">${cleanText}</p>
            </div>
          </div>`;
        });
      }
    } else {
      contentArray.forEach((text, index) => {
        const marginStyle = index > 0 ? 'margin-top:16px;' : '';
        html += `<p style="${textStyle}${marginStyle}">${text}</p>`;
      });
    }

    return html;
  }

  return `<section style="${slideStyle}">
  <h2 style="${titleStyle}">${title}</h2>
  <div style="${columnsContainerStyle}">
    <div style="${columnStyle}">
      ${renderColumnHTML(left)}
    </div>
    <div style="${columnStyle}">
      ${renderColumnHTML(right)}
    </div>
  </div>
</section>`;
}

function parseStyle(styleString: string): React.CSSProperties {
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

export default TwoColumnLayout;
