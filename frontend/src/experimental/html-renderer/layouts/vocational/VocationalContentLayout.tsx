import React from 'react';

import { ImageSlotFrame } from '../../components/ImageSlotFrame';
import type { OptionalImage, ThemeConfig, TitleContentModel } from '../../types/schema';
import { toInlineStyle } from '../../utils/styleHelper';

type VocationalContentModel = TitleContentModel & {
  layoutId?: string;
  image_src?: string;
  image_alt?: string;
};

const SECTION_LABELS: Record<string, string> = {
  legal_regulation: 'REGULATION // 规范依据',
  task_instruction: 'TASK ORDER // 实训指令',
  tech_principle: 'CORE METHOD // 原理拆解',
  case_discussion: 'CASE REVIEW // 案例研判',
  feedback_poll: 'TEAM FEEDBACK // 互动讨论',
  arch_blocks: 'SYSTEM BLOCKS // 模块结构',
  detail_specs: 'DETAIL SPECS // 关键参数',
  quiz: 'SKILL CHECK // 实操预判',
  vocational_content: 'MISSION BRIEF // 专业实务',
};

const readText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const toParagraphs = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => readText(item)).filter(Boolean);
  }

  const single = readText(value);
  return single ? [single] : [];
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const resolveSectionLabel = (layoutId?: string): string =>
  SECTION_LABELS[layoutId || ''] || 'MISSION BRIEF // 专业实务';

const resolveVisual = (model: VocationalContentModel): OptionalImage | null => {
  if (model.image && typeof model.image === 'object') {
    return {
      ...model.image,
      src: readText(model.image.src),
      alt: readText(model.image.alt),
      position: model.image.position || 'right',
      width: model.image.width || '40%',
    };
  }

  const src = readText((model as any).image_src);
  const alt = readText((model as any).image_alt);

  if (!src && !alt) {
    return null;
  }

  return {
    src,
    alt,
    position: 'right',
    width: '40%',
  };
};

const buildBackgroundImage = (backgroundImage?: string): string => {
  const overlay = 'linear-gradient(180deg, rgba(6, 10, 16, 0.94), rgba(6, 10, 16, 0.98))';
  if (backgroundImage && backgroundImage.trim()) {
    return `${overlay}, url(${backgroundImage})`;
  }

  return `
    radial-gradient(circle at 18% 22%, rgba(17, 211, 171, 0.12), transparent 26%),
    radial-gradient(circle at 82% 14%, rgba(245, 158, 11, 0.10), transparent 24%),
    linear-gradient(180deg, rgba(6, 10, 16, 0.98), rgba(6, 10, 16, 1))
  `;
};

const renderEmptyImageBoxHTML = (alt: string): string => `
  <div style="height:100%;min-height:240px;border-radius:24px;border:1px dashed rgba(56,189,248,0.35);background:linear-gradient(180deg, rgba(9,16,24,0.96), rgba(12,20,30,0.96));display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;color:#94A3B8;">
    <div>
      <div style="font-size:13px;letter-spacing:2px;color:#22D3EE;font-weight:700;margin-bottom:12px;">IMAGE SLOT</div>
      <div style="font-size:15px;font-weight:700;color:#E2E8F0;margin-bottom:8px;">当前页面可上传或批量生成配图</div>
      <div style="font-size:12px;line-height:1.7;color:#94A3B8;max-width:280px;">${escapeHtml(alt || '建议放置现场照片、结构特写或流程辅助图。')}</div>
    </div>
  </div>
`;

export const VocationalContentLayout: React.FC<{
  model: VocationalContentModel;
  theme: ThemeConfig;
  onImageUpload?: () => void;
}> = ({ model, theme, onImageUpload }) => {
  const paragraphs = toParagraphs(model.content);
  const highlight = readText(model.highlight);
  const visual = resolveVisual(model);
  const showVisualPanel = Boolean(visual);
  const hasActualImage = Boolean(visual?.src);
  const sectionLabel = resolveSectionLabel(model.layoutId);

  const slideStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    padding: '44px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#060A10',
    backgroundImage: buildBackgroundImage(model.background_image),
    backgroundSize: model.background_image ? 'cover' : 'auto',
    backgroundPosition: 'center',
    color: '#F8FAFC',
    fontFamily: theme.fonts.body,
  };

  return (
    <section style={slideStyle}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(34,211,238,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
          opacity: 0.35,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 72,
          width: 220,
          height: 220,
          borderRadius: '50%',
          border: '1px solid rgba(34,211,238,0.16)',
          transform: 'translateY(-45%)',
          opacity: 0.9,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 14px',
            borderRadius: 999,
            border: '1px solid rgba(34,211,238,0.26)',
            color: '#5EEAD4',
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: '0.24em',
            background: 'rgba(8, 15, 24, 0.78)',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22D3EE' }} />
          {sectionLabel}
        </div>

        <div
          style={{
            marginTop: 22,
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            gap: 24,
          }}
        >
          <div style={{ maxWidth: showVisualPanel ? (hasActualImage ? '64%' : '72%') : '100%' }}>
            <h2
              style={{
                margin: 0,
                fontSize: hasActualImage ? 42 : 38,
                lineHeight: 1.12,
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: '#F8FAFC',
              }}
            >
              {model.title}
            </h2>
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          marginTop: 28,
          flex: 1,
          display: 'grid',
          gridTemplateColumns: showVisualPanel ? (hasActualImage ? '1.18fr 0.82fr' : '1.38fr 0.62fr') : '1fr',
          gap: 24,
          minHeight: 0,
        }}
      >
        <div
          style={{
            minHeight: 0,
            borderRadius: 28,
            background: 'rgba(8, 13, 20, 0.92)',
            border: '1px solid rgba(34,211,238,0.16)',
            boxShadow: '0 28px 60px rgba(0, 0, 0, 0.32)',
            padding: '28px 28px 24px',
            display: 'grid',
            gridTemplateRows: '1fr auto',
            gap: 20,
          }}
        >
          <div style={{ minHeight: 0, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gap: 16 }}>
              {(paragraphs.length > 0 ? paragraphs : ['当前页面内容待补充。']).map((paragraph, index) => (
                <div
                  key={`${paragraph}-${index}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '52px 1fr',
                    gap: 16,
                    alignItems: 'flex-start',
                    padding: '18px 18px 16px',
                    borderRadius: 22,
                    background: index === 0 ? 'rgba(15, 23, 42, 0.78)' : 'rgba(9, 16, 24, 0.92)',
                    border: `1px solid ${index === 0 ? 'rgba(250, 204, 21, 0.22)' : 'rgba(51, 65, 85, 0.72)'}`,
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: index === 0 ? 'rgba(250, 204, 21, 0.16)' : 'rgba(34, 211, 238, 0.12)',
                      color: index === 0 ? '#FACC15' : '#67E8F9',
                      fontSize: 18,
                      fontWeight: 900,
                      letterSpacing: '0.08em',
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div
                    style={{
                      color: '#D8E1EC',
                      fontSize: hasActualImage ? 21 : 19,
                      lineHeight: 1.72,
                      fontWeight: 500,
                    }}
                  >
                    {paragraph}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {highlight ? (
            <div
              style={{
                borderRadius: 22,
                border: '1px solid rgba(245, 158, 11, 0.28)',
                background: 'linear-gradient(90deg, rgba(120, 53, 15, 0.52), rgba(69, 26, 3, 0.30))',
                padding: '18px 22px',
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: '0.18em', color: '#FDBA74', fontWeight: 800 }}>
                EXECUTION NOTE
              </div>
              <div style={{ marginTop: 8, color: '#FEF3C7', fontSize: 19, lineHeight: 1.6, fontWeight: 700 }}>
                {highlight}
              </div>
            </div>
          ) : null}
        </div>

        {showVisualPanel ? (
          <div
            style={{
              minHeight: 0,
              borderRadius: 28,
              background: 'rgba(8, 13, 20, 0.92)',
              border: '1px solid rgba(51, 65, 85, 0.86)',
              boxShadow: '0 28px 60px rgba(0, 0, 0, 0.32)',
              padding: hasActualImage ? 20 : 18,
              display: 'grid',
              gridTemplateRows: '1fr',
              gap: hasActualImage ? 16 : 14,
            }}
          >
            <ImageSlotFrame
              src={visual?.src}
              alt={visual?.alt || ''}
              theme={theme}
              slotLabel="实训配图槽位"
              slotHint={visual?.alt || '建议放置流程示意、局部结构或实操现场配图。'}
              onClick={onImageUpload}
              frameStyle={{ width: '100%', minHeight: hasActualImage ? '340px' : '240px', height: '100%' }}
              imageStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
              placeholderStyle={{
                background: 'linear-gradient(180deg, rgba(9,16,24,0.96), rgba(12,20,30,0.96))',
                border: '1px dashed rgba(56,189,248,0.35)',
                boxShadow: 'inset 0 0 0 1px rgba(34,211,238,0.08)',
              }}
            />
          </div>
        ) : null}
      </div>

    </section>
  );
};

export function renderVocationalContentLayoutHTML(model: VocationalContentModel, theme: ThemeConfig): string {
  const paragraphs = toParagraphs(model.content);
  const highlight = readText(model.highlight);
  const visual = resolveVisual(model);
  const sectionLabel = resolveSectionLabel(model.layoutId);
  const showVisualPanel = Boolean(visual);
  const hasActualImage = Boolean(visual?.src);

  const paragraphsHTML = (paragraphs.length > 0 ? paragraphs : ['当前页面内容待补充。'])
    .map(
      (paragraph, index) => `
        <div style="display:grid;grid-template-columns:52px 1fr;gap:16px;align-items:flex-start;padding:18px 18px 16px;border-radius:22px;background:${index === 0 ? 'rgba(15, 23, 42, 0.78)' : 'rgba(9, 16, 24, 0.92)'};border:1px solid ${index === 0 ? 'rgba(250, 204, 21, 0.22)' : 'rgba(51, 65, 85, 0.72)'};">
          <div style="width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:${index === 0 ? 'rgba(250, 204, 21, 0.16)' : 'rgba(34, 211, 238, 0.12)'};color:${index === 0 ? '#FACC15' : '#67E8F9'};font-size:18px;font-weight:900;letter-spacing:0.08em;">
            ${String(index + 1).padStart(2, '0')}
          </div>
          <div style="color:#D8E1EC;font-size:${hasActualImage ? '21px' : '19px'};line-height:1.72;font-weight:500;">${escapeHtml(paragraph)}</div>
        </div>
      `,
    )
    .join('');

  const visualHTML = showVisualPanel
    ? `
      <div style="min-height:0;border-radius:28px;background:rgba(8, 13, 20, 0.92);border:1px solid rgba(51, 65, 85, 0.86);box-shadow:0 28px 60px rgba(0, 0, 0, 0.32);padding:${hasActualImage ? '20px' : '18px'};display:grid;grid-template-rows:1fr;gap:${hasActualImage ? '16px' : '14px'};">
        ${
          visual?.src
            ? `<div style="height:100%;min-height:${hasActualImage ? '340px' : '240px'};border-radius:24px;overflow:hidden;border:1px solid rgba(56,189,248,0.18);"><img src="${escapeHtml(visual.src)}" alt="${escapeHtml(visual.alt || '')}" style="width:100%;height:100%;object-fit:cover;" /></div>`
            : renderEmptyImageBoxHTML(visual?.alt || '')
        }
      </div>
    `
    : '';

  return `
    <section style="${toInlineStyle({
      width: `${theme.sizes.slideWidth}px`,
      height: `${theme.sizes.slideHeight}px`,
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      padding: '44px',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#060A10',
      backgroundImage: buildBackgroundImage(model.background_image),
      backgroundSize: model.background_image ? 'cover' : 'auto',
      backgroundPosition: 'center',
      color: '#F8FAFC',
      fontFamily: theme.fonts.body,
    })}">
      <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(34,211,238,0.08) 1px, transparent 1px),linear-gradient(90deg, rgba(34,211,238,0.08) 1px, transparent 1px);background-size:36px 36px;opacity:0.35;pointer-events:none;"></div>
      <div style="position:absolute;top:0;right:72px;width:220px;height:220px;border-radius:50%;border:1px solid rgba(34,211,238,0.16);transform:translateY(-45%);opacity:0.9;pointer-events:none;"></div>

      <div style="position:relative;z-index:1;">
        <div style="display:inline-flex;align-items:center;gap:10px;padding:8px 14px;border-radius:999px;border:1px solid rgba(34,211,238,0.26);color:#5EEAD4;font-size:13px;font-weight:800;letter-spacing:0.24em;background:rgba(8, 15, 24, 0.78);">
          <span style="width:8px;height:8px;border-radius:50%;background:#22D3EE;display:inline-block;"></span>
          ${escapeHtml(sectionLabel)}
        </div>

        <div style="margin-top:22px;display:flex;justify-content:flex-start;align-items:flex-start;gap:24px;">
          <div style="max-width:${showVisualPanel ? (hasActualImage ? '64%' : '72%') : '100%'};">
            <h2 style="margin:0;font-size:${hasActualImage ? '42px' : '38px'};line-height:1.12;font-weight:900;letter-spacing:-0.03em;color:#F8FAFC;">${escapeHtml(model.title || '')}</h2>
          </div>
        </div>
      </div>

      <div style="position:relative;z-index:1;margin-top:28px;flex:1;display:grid;grid-template-columns:${showVisualPanel ? (hasActualImage ? '1.18fr 0.82fr' : '1.38fr 0.62fr') : '1fr'};gap:24px;min-height:0;">
        <div style="min-height:0;border-radius:28px;background:rgba(8, 13, 20, 0.92);border:1px solid rgba(34,211,238,0.16);box-shadow:0 28px 60px rgba(0, 0, 0, 0.32);padding:28px 28px 24px;display:grid;grid-template-rows:1fr auto;gap:20px;">
          <div style="min-height:0;overflow:hidden;">
            <div style="display:grid;gap:16px;">${paragraphsHTML}</div>
          </div>
          ${
            highlight
              ? `<div style="border-radius:22px;border:1px solid rgba(245, 158, 11, 0.28);background:linear-gradient(90deg, rgba(120, 53, 15, 0.52), rgba(69, 26, 3, 0.30));padding:18px 22px;">
                  <div style="font-size:11px;letter-spacing:0.18em;color:#FDBA74;font-weight:800;">EXECUTION NOTE</div>
                  <div style="margin-top:8px;color:#FEF3C7;font-size:19px;line-height:1.6;font-weight:700;">${escapeHtml(highlight)}</div>
                </div>`
              : ''
          }
        </div>
        ${visualHTML}
      </div>

    </section>
  `;
}
