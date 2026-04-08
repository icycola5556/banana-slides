import React from 'react';

import { ImageSlotFrame } from '../../components/ImageSlotFrame';
import type { OptionalImage, ThemeConfig, TitleBulletsModel } from '../../types/schema';
import { toInlineStyle } from '../../utils/styleHelper';

type BulletItem = {
  icon?: string;
  text: string;
  description?: string;
  example?: string;
  note?: string;
  dataPoint?: {
    value: string;
    unit: string;
    source?: string;
  };
};

type VocationalBulletsModel = TitleBulletsModel & {
  layoutId?: string;
  image?: OptionalImage;
  image_src?: string;
  image_alt?: string;
};

const LABELS: Record<string, string> = {
  group_collab: 'TEAM GRID // 协作任务',
  quiz_interaction: 'QUIZ GRID // 互动测验',
  requirement_specs: 'SPEC GRID // 规格要求',
  protocol_analysis: 'PROTOCOL GRID // 协议分析',
  checklist_verification: 'CHECKLIST GRID // 核查点检',
  org_structure_flow: 'STRUCTURE GRID // 组织结构',
  vocational_bullets: 'PRACTICE MATRIX // 职教要点',
};

const readText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const asList = (value: unknown): any[] => {
  if (Array.isArray(value)) {
    return value;
  }

  return value == null ? [] : [value];
};

const toBulletItem = (raw: unknown): BulletItem | null => {
  if (typeof raw === 'string') {
    const text = raw.trim();
    return text ? { text } : null;
  }

  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const item = raw as Record<string, unknown>;
  const bulletText =
    readText(item.text)
    || readText(item.title)
    || readText(item.label)
    || readText(item.name)
    || readText(item.value);
  const description =
    readText(item.description)
    || readText(item.note)
    || readText(item.summary)
    || asList(item.points).map(readText).filter(Boolean).join(' // ')
    || asList(item.content).map(readText).filter(Boolean).join(' // ');

  if (!bulletText && !description) {
    return null;
  }

  return {
    text: bulletText || description,
    description: description || undefined,
    example: readText(item.example) || undefined,
    note: readText(item.note) || undefined,
    dataPoint: item.dataPoint && typeof item.dataPoint === 'object'
      ? {
          value: readText((item.dataPoint as Record<string, unknown>).value),
          unit: readText((item.dataPoint as Record<string, unknown>).unit),
          source: readText((item.dataPoint as Record<string, unknown>).source) || undefined,
        }
      : undefined,
  };
};

const resolveBullets = (model: Record<string, unknown>): BulletItem[] => {
  const directBullets = asList(model.bullets)
    .map(toBulletItem)
    .filter(Boolean) as BulletItem[];

  if (directBullets.length > 0) {
    return directBullets;
  }

  return [
    ...asList(model.content),
    ...asList(model.points),
    ...asList(model.items),
  ]
    .map(toBulletItem)
    .filter(Boolean) as BulletItem[];
};

const resolveKeyTakeaway = (model: Record<string, unknown>): string | undefined => {
  const value = readText(model.keyTakeaway) || readText(model.highlight);
  return value || undefined;
};

const resolveLabel = (layoutId?: string): string =>
  LABELS[layoutId || ''] || 'PRACTICE MATRIX // 职教要点';

const resolveVisual = (model: VocationalBulletsModel): OptionalImage | null => {
  if (model.image && typeof model.image === 'object') {
    return {
      ...model.image,
      src: readText(model.image.src),
      alt: readText(model.image.alt),
      position: model.image.position || 'right',
      width: model.image.width || '40%',
    };
  }

  const src = readText(model.image_src);
  const alt = readText(model.image_alt);
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
  const overlay = 'linear-gradient(180deg, rgba(6, 10, 16, 0.95), rgba(6, 10, 16, 0.98))';
  if (backgroundImage && backgroundImage.trim()) {
    return `${overlay}, url(${backgroundImage})`;
  }

  return `
    radial-gradient(circle at 14% 22%, rgba(245, 158, 11, 0.10), transparent 20%),
    radial-gradient(circle at 82% 18%, rgba(34, 211, 238, 0.10), transparent 24%),
    linear-gradient(180deg, rgba(6, 10, 16, 0.98), rgba(6, 10, 16, 1))
  `;
};

const renderEmptyImageBoxHTML = (alt: string): string => `
  <div style="height:100%;min-height:280px;border-radius:22px;border:1px dashed rgba(56,189,248,0.35);background:linear-gradient(180deg, rgba(9,16,24,0.96), rgba(12,20,30,0.96));display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;color:#94A3B8;">
    <div>
      <div style="font-size:12px;letter-spacing:0.18em;color:#67E8F9;font-weight:800;margin-bottom:10px;">VISUAL SLOT</div>
      <div style="font-size:15px;font-weight:700;color:#E2E8F0;margin-bottom:8px;">当前训练页可继续上传或批量生成配图</div>
      <div style="font-size:12px;line-height:1.7;color:#94A3B8;max-width:280px;">${escapeHtml(alt || '建议放置界面截图、操作视图或快捷键示意图。')}</div>
    </div>
  </div>
`;

export const VocationalBulletsLayout: React.FC<{
  model: VocationalBulletsModel;
  theme: ThemeConfig;
  onImageUpload?: () => void;
}> = ({ model, theme, onImageUpload }) => {
  const variant = String((model as any)?.variant || (model as any)?.layout_variant || 'a').toLowerCase();
  const title = model.title;
  const subtitle = readText(model.subtitle);
  const layoutId = model.layoutId || '';
  const bulletItems = resolveBullets(model as unknown as Record<string, unknown>);
  const keyTakeaway = resolveKeyTakeaway(model as unknown as Record<string, unknown>);
  const visual = resolveVisual(model);
  const showVisualPanel = Boolean(visual);
  const label = resolveLabel(layoutId);
  const isOrderedVariant = variant === 'b';

  const slideStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    padding: '40px 42px',
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
            linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '34px 34px',
          opacity: 0.22,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 20,
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 14px',
              borderRadius: 999,
              border: '1px solid rgba(245, 158, 11, 0.22)',
              color: '#FBBF24',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.18em',
              background: 'rgba(10, 14, 21, 0.76)',
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
            {label}
          </div>
          <h2
            style={{
              margin: '18px 0 0',
              fontSize: 38,
              lineHeight: 1.16,
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: '#F8FAFC',
            }}
          >
            {title}
          </h2>
          {subtitle ? (
            <p style={{ margin: '12px 0 0', color: '#94A3B8', fontSize: 16, lineHeight: 1.6 }}>
              {subtitle}
            </p>
          ) : null}
        </div>


      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          marginTop: 24,
          flex: 1,
          display: 'grid',
          gridTemplateColumns: showVisualPanel ? '1.1fr 0.9fr' : '1fr',
          gap: 20,
          minHeight: 0,
        }}
      >
        <div
          style={{
            minHeight: 0,
            borderRadius: 28,
            background: 'rgba(8, 13, 20, 0.92)',
            border: '1px solid rgba(51, 65, 85, 0.82)',
            boxShadow: '0 24px 50px rgba(0, 0, 0, 0.28)',
            padding: '22px 22px 18px',
            display: 'grid',
            gridTemplateRows: '1fr auto',
            gap: 18,
          }}
        >
          <div
            style={{
              minHeight: 0,
              display: 'grid',
              gridTemplateColumns: bulletItems.length > 3 && !isOrderedVariant ? 'repeat(2, minmax(0, 1fr))' : '1fr',
              gap: 16,
              overflow: 'hidden',
            }}
          >
            {bulletItems.map((bullet, index) => {
              const detail = bullet.description || bullet.note || bullet.example || '';
              const dataPoint = bullet.dataPoint?.value && bullet.dataPoint?.unit
                ? `${bullet.dataPoint.value} ${bullet.dataPoint.unit}`.trim()
                : '';

              return (
                <div
                  key={`${bullet.text}-${index}`}
                  style={{
                    borderRadius: 22,
                    background: index === 0 ? 'rgba(15, 23, 42, 0.80)' : 'rgba(10, 18, 28, 0.92)',
                    border: `1px solid ${index === 0 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(51, 65, 85, 0.70)'}`,
                    padding: '18px 18px 16px',
                    display: 'grid',
                    gridTemplateColumns: '38px 1fr',
                    gap: 14,
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: isOrderedVariant ? 'rgba(239, 68, 68, 0.16)' : 'rgba(245, 158, 11, 0.16)',
                      color: isOrderedVariant ? '#F87171' : '#FBBF24',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <div style={{ color: '#F8FAFC', fontSize: 22, lineHeight: 1.35, fontWeight: 800 }}>
                      {bullet.text}
                    </div>
                    {detail ? (
                      <div style={{ marginTop: 8, color: '#A8B4C3', fontSize: 15, lineHeight: 1.7 }}>
                        {detail}
                      </div>
                    ) : null}
                    {dataPoint ? (
                      <div
                        style={{
                          marginTop: 12,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 10px',
                          borderRadius: 999,
                          background: 'rgba(34, 211, 238, 0.12)',
                          color: '#67E8F9',
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                        }}
                      >
                        {dataPoint}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {keyTakeaway ? (
            <div
              style={{
                borderRadius: 20,
                border: '1px solid rgba(245, 158, 11, 0.24)',
                background: 'linear-gradient(90deg, rgba(120, 53, 15, 0.28), rgba(15, 23, 42, 0.78))',
                padding: '16px 18px',
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: '0.16em', color: '#FDBA74', fontWeight: 800 }}>
                EXECUTION RULE
              </div>
              <div style={{ marginTop: 8, color: '#FEF3C7', fontSize: 17, lineHeight: 1.65, fontWeight: 700 }}>
                {keyTakeaway}
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
              border: '1px solid rgba(51, 65, 85, 0.82)',
              boxShadow: '0 24px 50px rgba(0, 0, 0, 0.28)',
              padding: '18px 18px 16px',
              display: 'grid',
              gridTemplateRows: 'auto 1fr auto',
              gap: 14,
            }}
          >
            <ImageSlotFrame
              src={visual?.src}
              alt={visual?.alt || ''}
              theme={theme}
              slotLabel="训练配图槽位"
              slotHint={visual?.alt || '建议放置界面截图、操作视图或快捷键示意图。'}
              onClick={onImageUpload}
              frameStyle={{ width: '100%', minHeight: '280px', height: '100%' }}
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

export function renderVocationalBulletsLayoutHTML(model: VocationalBulletsModel, theme: ThemeConfig): string {
  const variant = String((model as any)?.variant || (model as any)?.layout_variant || 'a').toLowerCase();
  const title = model.title;
  const subtitle = readText(model.subtitle);
  const layoutId = model.layoutId || '';
  const bulletItems = resolveBullets(model as unknown as Record<string, unknown>);
  const keyTakeaway = resolveKeyTakeaway(model as unknown as Record<string, unknown>);
  const visual = resolveVisual(model);
  const showVisualPanel = Boolean(visual);
  const label = resolveLabel(layoutId);
  const isOrderedVariant = variant === 'b';

  const bulletsHTML = bulletItems
    .map((bullet, index) => {
      const detail = bullet.description || bullet.note || bullet.example || '';
      const dataPoint = bullet.dataPoint?.value && bullet.dataPoint?.unit
        ? `${bullet.dataPoint.value} ${bullet.dataPoint.unit}`.trim()
        : '';

      return `
        <div style="border-radius:22px;background:${index === 0 ? 'rgba(15, 23, 42, 0.80)' : 'rgba(10, 18, 28, 0.92)'};border:1px solid ${index === 0 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(51, 65, 85, 0.70)'};padding:18px 18px 16px;display:grid;grid-template-columns:38px 1fr;gap:14px;align-items:flex-start;">
          <div style="width:38px;height:38px;border-radius:50%;background:${isOrderedVariant ? 'rgba(239, 68, 68, 0.16)' : 'rgba(245, 158, 11, 0.16)'};color:${isOrderedVariant ? '#F87171' : '#FBBF24'};display:flex;align-items:center;justify-content:center;font-weight:900;">
            ${String(index + 1).padStart(2, '0')}
          </div>
          <div>
            <div style="color:#F8FAFC;font-size:22px;line-height:1.35;font-weight:800;">${escapeHtml(bullet.text)}</div>
            ${detail ? `<div style="margin-top:8px;color:#A8B4C3;font-size:15px;line-height:1.7;">${escapeHtml(detail)}</div>` : ''}
            ${dataPoint ? `<div style="margin-top:12px;display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;background:rgba(34, 211, 238, 0.12);color:#67E8F9;font-size:12px;font-weight:700;letter-spacing:0.08em;">${escapeHtml(dataPoint)}</div>` : ''}
          </div>
        </div>
      `;
    })
    .join('');

  const visualHTML = showVisualPanel
    ? `
      <div style="min-height:0;border-radius:28px;background:rgba(8, 13, 20, 0.92);border:1px solid rgba(51, 65, 85, 0.82);box-shadow:0 24px 50px rgba(0, 0, 0, 0.28);padding:18px 18px 16px;display:grid;grid-template-rows:1fr;gap:14px;">
        ${
          visual?.src
            ? `<div style="height:100%;min-height:280px;border-radius:22px;overflow:hidden;border:1px solid rgba(56,189,248,0.18);"><img src="${escapeHtml(visual.src)}" alt="${escapeHtml(visual.alt || '')}" style="width:100%;height:100%;object-fit:cover;" /></div>`
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
  padding: '40px 42px',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#060A10',
  backgroundImage: buildBackgroundImage(model.background_image),
  backgroundSize: model.background_image ? 'cover' : 'auto',
  backgroundPosition: 'center',
  color: '#F8FAFC',
  fontFamily: theme.fonts.body,
})}">
  <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);background-size:34px 34px;opacity:0.22;pointer-events:none;"></div>

  <div style="position:relative;z-index:1;display:flex;justify-content:space-between;align-items:flex-start;gap:20px;">
    <div>
      <div style="display:inline-flex;align-items:center;gap:10px;padding:8px 14px;border-radius:999px;border:1px solid rgba(245, 158, 11, 0.22);color:#FBBF24;font-size:12px;font-weight:800;letter-spacing:0.18em;background:rgba(10, 14, 21, 0.76);">
        <span style="width:8px;height:8px;border-radius:50%;background:#F59E0B;display:inline-block;"></span>
        ${escapeHtml(label)}
      </div>
      <h2 style="margin:18px 0 0;font-size:38px;line-height:1.16;font-weight:900;letter-spacing:-0.03em;color:#F8FAFC;">${escapeHtml(title || '')}</h2>
      ${subtitle ? `<p style="margin:12px 0 0;color:#94A3B8;font-size:16px;line-height:1.6;">${escapeHtml(subtitle)}</p>` : ''}
    </div>


  </div>

  <div style="position:relative;z-index:1;margin-top:24px;flex:1;display:grid;grid-template-columns:${showVisualPanel ? '1.1fr 0.9fr' : '1fr'};gap:20px;min-height:0;">
    <div style="min-height:0;border-radius:28px;background:rgba(8, 13, 20, 0.92);border:1px solid rgba(51, 65, 85, 0.82);box-shadow:0 24px 50px rgba(0, 0, 0, 0.28);padding:22px 22px 18px;display:grid;grid-template-rows:1fr auto;gap:18px;">
      <div style="min-height:0;display:grid;grid-template-columns:${bulletItems.length > 3 && !isOrderedVariant ? 'repeat(2, minmax(0, 1fr))' : '1fr'};gap:16px;overflow:hidden;">
        ${bulletsHTML}
      </div>
      ${
        keyTakeaway
          ? `<div style="border-radius:20px;border:1px solid rgba(245, 158, 11, 0.24);background:linear-gradient(90deg, rgba(120, 53, 15, 0.28), rgba(15, 23, 42, 0.78));padding:16px 18px;">
              <div style="font-size:11px;letter-spacing:0.16em;color:#FDBA74;font-weight:800;">EXECUTION RULE</div>
              <div style="margin-top:8px;color:#FEF3C7;font-size:17px;line-height:1.65;font-weight:700;">${escapeHtml(keyTakeaway)}</div>
            </div>`
          : ''
      }
    </div>
    ${visualHTML}
  </div>
</section>`;
}
