import React from 'react';

import { ImageSlotFrame } from '../../components/ImageSlotFrame';
import type { ColumnContent, OptionalImage, ThemeConfig, TwoColumnModel } from '../../types/schema';
import { toInlineStyle } from '../../utils/styleHelper';

type VocationalComparisonModel = TwoColumnModel & {
  layoutId?: string;
  content?: string | string[];
  highlight?: string;
  image?: OptionalImage;
  image_src?: string;
  image_alt?: string;
};

type ResolvedColumn = {
  header: string;
  lines: string[];
  bullets?: Array<{ text: string; description?: string }>;
  imageSrc?: string;
  imageAlt?: string;
  slotPath?: string;
  tone: 'left' | 'right';
};

const LABELS: Record<string, string> = {
  comparison_matrix: 'COMPARISON MATRIX // 方案对标',
  common_faults: 'FAULT SPLIT // 常见误区',
  case_before_after: 'BEFORE / AFTER // 案例对照',
  equipment_orientation: 'DEVICE ORIENTATION // 结构认知',
  vocational_comparison: 'TACTICAL COMPARISON // 策略对抗',
};

const readText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const toLines = (value: unknown): string[] => {
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

const resolveLabel = (layoutId?: string): string =>
  LABELS[layoutId || ''] || 'TACTICAL COMPARISON // 策略对抗';

const resolveVisual = (model: VocationalComparisonModel): OptionalImage | null => {
  if (model.image && typeof model.image === 'object') {
    const src = readText(model.image.src);
    const alt = readText(model.image.alt);
    const hasExplicitSlotConfig = Object.prototype.hasOwnProperty.call(model.image, 'src')
      || Object.prototype.hasOwnProperty.call(model.image, 'alt');
    if (!src && !alt && !hasExplicitSlotConfig) {
      return null;
    }
    return {
      ...model.image,
      src,
      alt,
      width: model.image.width || '100%',
    };
  }

  const src = readText(model.image_src);
  const alt = readText(model.image_alt);
  const hasExplicitSlotConfig = Object.prototype.hasOwnProperty.call(model, 'image_src')
    || Object.prototype.hasOwnProperty.call(model, 'image_alt');
  if (!src && !alt && !hasExplicitSlotConfig) {
    return null;
  }

  return {
    src,
    alt,
    width: '100%',
  };
};

const normalizeBullets = (bullets: ColumnContent['bullets']) =>
  Array.isArray(bullets)
    ? bullets
        .map((bullet) => ({
          text: readText(bullet?.text),
          description: readText(bullet?.description) || undefined,
        }))
        .filter((bullet) => bullet.text)
    : [];

const isMeaningfulColumn = (column: ColumnContent | undefined): column is ColumnContent => {
  if (!column || typeof column !== 'object') {
    return false;
  }

  return Boolean(
    readText(column.header)
      || toLines(column.content).length
      || normalizeBullets(column.bullets).length
      || readText(column.image_src)
      || readText(column.image_alt),
  );
};

const parseVsHeaders = (title: string): [string | undefined, string | undefined] => {
  const withColon = title.match(/[:：]\s*(.+?)\s+vs\.?\s+(.+)/i);
  if (withColon) {
    return [readText(withColon[1]), readText(withColon[2])];
  }

  const direct = title.match(/(.+?)\s+vs\.?\s+(.+)/i);
  if (direct) {
    return [readText(direct[1]), readText(direct[2])];
  }

  return [undefined, undefined];
};

const resolveColumn = (
  column: ColumnContent,
  fallbackHeader: string,
  tone: 'left' | 'right',
  slotPath: string,
): ResolvedColumn => {
  const bullets = normalizeBullets(column.bullets);
  return {
    header: readText(column.header) || fallbackHeader,
    lines: toLines(column.content),
    bullets: bullets.length > 0 ? bullets : undefined,
    imageSrc: readText(column.image_src) || undefined,
    imageAlt: readText(column.image_alt) || undefined,
    slotPath,
    tone,
  };
};

const resolveColumns = (model: VocationalComparisonModel): ResolvedColumn[] => {
  const title = readText(model.title);
  const [leftHeaderFromTitle, rightHeaderFromTitle] = parseVsHeaders(title);

  if (isMeaningfulColumn(model.left) || isMeaningfulColumn(model.right)) {
    return [
      resolveColumn(model.left || {}, leftHeaderFromTitle || '方案 A', 'left', 'left.image_src'),
      resolveColumn(model.right || {}, rightHeaderFromTitle || '方案 B', 'right', 'right.image_src'),
    ];
  }

  const genericLines = toLines(model.content);
  const fallbackRight = readText(model.highlight) || '请结合工况、成本与风险做最终判断。';

  return [
    {
      header: leftHeaderFromTitle || '方案 A',
      lines: genericLines.length > 0 ? [genericLines[0]] : ['请补充左侧方案说明。'],
      tone: 'left',
    },
    {
      header: rightHeaderFromTitle || '方案 B',
      lines: genericLines.length > 1 ? [genericLines[1]] : [fallbackRight],
      tone: 'right',
    },
  ];
};

const resolveSharedNotes = (model: VocationalComparisonModel): string[] => {
  const genericLines = toLines(model.content);
  const extraLines = genericLines.slice(2);
  const highlight = readText(model.highlight);

  return [...extraLines, ...(highlight ? [highlight] : [])].filter(Boolean);
};

const buildBackgroundImage = (backgroundImage?: string): string => {
  const overlay = 'linear-gradient(180deg, rgba(6, 10, 16, 0.94), rgba(6, 10, 16, 0.98))';
  if (backgroundImage && backgroundImage.trim()) {
    return `${overlay}, url(${backgroundImage})`;
  }

  return `
    radial-gradient(circle at 16% 18%, rgba(34, 197, 94, 0.08), transparent 20%),
    radial-gradient(circle at 84% 16%, rgba(239, 68, 68, 0.10), transparent 22%),
    linear-gradient(180deg, rgba(7, 10, 16, 0.98), rgba(7, 10, 16, 1))
  `;
};

const renderEmptyImageBoxHTML = (alt: string): string => `
  <div style="height:230px;border-radius:20px;border:1px dashed rgba(56,189,248,0.35);background:linear-gradient(180deg, rgba(9,16,24,0.96), rgba(12,20,30,0.96));display:flex;align-items:center;justify-content:center;padding:24px;text-align:center;color:#94A3B8;">
    <div>
      <div style="font-size:12px;letter-spacing:0.18em;color:#67E8F9;font-weight:800;margin-bottom:10px;">VISUAL SLOT</div>
      <div style="font-size:15px;font-weight:700;color:#E2E8F0;margin-bottom:8px;">当前对比页可继续上传或批量生成示意图</div>
      <div style="font-size:12px;line-height:1.7;color:#94A3B8;max-width:300px;">${escapeHtml(alt || '建议放置左右方案对比图、故障前后截图或结构差异图。')}</div>
    </div>
  </div>
`;

const renderInlineSharedVisual = (
  sharedVisual: OptionalImage,
  theme: ThemeConfig,
  onImageUpload?: (slotPath: string) => void,
) => (
  <div
    style={{
      marginTop: 14,
      borderRadius: 18,
      border: '1px solid rgba(56,189,248,0.24)',
      background: 'rgba(8, 13, 20, 0.72)',
      padding: '14px',
      display: 'grid',
      gap: 12,
    }}
  >
    <div style={{ fontSize: 11, letterSpacing: '0.16em', color: '#94A3B8', fontWeight: 800 }}>
      VISUAL EVIDENCE
    </div>
    <ImageSlotFrame
      src={sharedVisual.src}
      alt={sharedVisual.alt || ''}
      theme={theme}
      slotLabel="方案对比配图"
      slotHint={sharedVisual.alt || '建议放置方案示意、前后对比或结构差异配图。'}
      onClick={onImageUpload ? () => onImageUpload('image.src') : undefined}
      frameStyle={{ width: '100%', minHeight: sharedVisual.src ? '220px' : '190px', height: '100%' }}
      imageStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
      placeholderStyle={{
        background: 'linear-gradient(180deg, rgba(9,16,24,0.96), rgba(12,20,30,0.96))',
        border: '1px dashed rgba(56,189,248,0.35)',
        boxShadow: 'inset 0 0 0 1px rgba(34,211,238,0.08)',
      }}
    />
  </div>
);

const renderInlineSharedVisualHTML = (sharedVisual: OptionalImage): string => `
  <div style="margin-top:14px;border-radius:18px;border:1px solid rgba(56,189,248,0.24);background:rgba(8, 13, 20, 0.72);padding:14px;display:grid;gap:12px;">
    <div style="font-size:11px;letter-spacing:0.16em;color:#94A3B8;font-weight:800;">VISUAL EVIDENCE</div>
    ${
      sharedVisual.src
        ? `<div style="width:100%;min-height:220px;border-radius:18px;overflow:hidden;border:1px solid rgba(56,189,248,0.18);"><img src="${escapeHtml(sharedVisual.src)}" alt="${escapeHtml(sharedVisual.alt || '')}" style="width:100%;height:100%;object-fit:cover;" /></div>`
        : renderEmptyImageBoxHTML(sharedVisual.alt || '')
    }
  </div>
`;

const renderColumnBody = (
  column: ResolvedColumn,
  theme: ThemeConfig,
  onImageUpload?: (slotPath: string) => void,
  sharedVisual?: OptionalImage | null,
) => {
  const accent = column.tone === 'left' ? '#34D399' : '#F97316';
  const softAccent = column.tone === 'left' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(249, 115, 22, 0.14)';
  const hasOwnVisual = Boolean(column.imageSrc || column.imageAlt);

  let content: React.ReactNode;
  if (hasOwnVisual) {
    content = (
      <ImageSlotFrame
        src={column.imageSrc}
        alt={column.imageAlt || ''}
        theme={theme}
        slotLabel={`${column.header} 配图`}
        slotHint={column.imageAlt || '建议放置方案示意、现场截图或结构差异图。'}
        onClick={column.slotPath ? () => onImageUpload?.(column.slotPath as string) : undefined}
        frameStyle={{ width: '100%', minHeight: '260px', height: '100%' }}
        imageStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
        placeholderStyle={{
          background: 'linear-gradient(180deg, rgba(9,16,24,0.96), rgba(12,20,30,0.96))',
          border: `1px dashed ${accent}66`,
          boxShadow: `inset 0 0 0 1px ${accent}20`,
        }}
      />
    );
  } else if (column.bullets && column.bullets.length > 0) {
    content = (
      <div style={{ display: 'grid', gap: 12 }}>
        {column.bullets.map((bullet, index) => (
          <div
            key={`${bullet.text}-${index}`}
            style={{
              display: 'grid',
              gridTemplateColumns: '34px 1fr',
              gap: 12,
              alignItems: 'flex-start',
              padding: '14px 14px 12px',
              borderRadius: 16,
              background: 'rgba(15, 23, 42, 0.72)',
              border: '1px solid rgba(51, 65, 85, 0.68)',
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: softAccent,
                color: accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
              }}
            >
              {String(index + 1).padStart(2, '0')}
            </div>
            <div>
              <div style={{ color: '#F8FAFC', fontSize: 16, lineHeight: 1.6, fontWeight: 700 }}>{bullet.text}</div>
              {bullet.description ? (
                <div style={{ marginTop: 4, color: '#A8B4C3', fontSize: 13, lineHeight: 1.6 }}>
                  {bullet.description}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    );
  } else {
    content = (
      <div style={{ display: 'grid', gap: 12 }}>
        {(column.lines.length > 0 ? column.lines : ['当前栏位内容待补充。']).map((line, index) => (
          <div
            key={`${line}-${index}`}
            style={{
              padding: '16px 16px 14px',
              borderRadius: 16,
              background: index === 0 ? 'rgba(15, 23, 42, 0.78)' : 'rgba(10, 18, 28, 0.92)',
              border: `1px solid ${index === 0 ? `${accent}45` : 'rgba(51, 65, 85, 0.68)'}`,
              color: '#D8E1EC',
              fontSize: 17,
              lineHeight: 1.7,
            }}
          >
            {line}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {content}
      {sharedVisual && !hasOwnVisual ? renderInlineSharedVisual(sharedVisual, theme, onImageUpload) : null}
    </div>
  );
};

export const VocationalComparisonLayout: React.FC<{
  model: VocationalComparisonModel;
  theme: ThemeConfig;
  onImageUpload?: (slotPath: string) => void;
}> = ({ model, theme, onImageUpload }) => {
  const columns = resolveColumns(model);
  const sharedNotes = resolveSharedNotes(model);
  const visual = resolveVisual(model);
  const hasActualVisual = Boolean(visual?.src);
  const layoutLabel = resolveLabel(model.layoutId);
  const hasColumnVisuals = columns.some((column) => Boolean(column.imageSrc || column.imageAlt));
  const shouldInlineSharedVisual = Boolean(visual) && !hasColumnVisuals;

  const slideStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    padding: '42px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#070A10',
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
          backgroundSize: '40px 40px',
          opacity: 0.25,
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
            border: '1px solid rgba(250, 204, 21, 0.22)',
            color: '#FBBF24',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.18em',
            background: 'rgba(10, 14, 21, 0.76)',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F97316' }} />
          {layoutLabel}
        </div>

        <div
          style={{
            marginTop: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 20,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 38,
              lineHeight: 1.16,
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: '#F8FAFC',
              maxWidth: '78%',
            }}
          >
            {model.title}
          </h2>


        </div>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          marginTop: 26,
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns:
            visual && !shouldInlineSharedVisual ? (hasActualVisual ? '1.26fr 0.74fr' : '1.34fr 0.66fr') : '1fr',
          gap: 18,
        }}
      >
        <div
          style={{
            minHeight: 0,
            display: 'grid',
            gridTemplateRows: sharedNotes.length > 0 ? 'auto auto' : '1fr',
            gap: 18,
          }}
        >
          <div
            style={{
              minHeight: 0,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 18,
            }}
          >
            {columns.map((column) => {
              const accent = column.tone === 'left' ? '#34D399' : '#F97316';
              const panelBackground = column.tone === 'left'
                ? 'linear-gradient(180deg, rgba(6, 14, 22, 0.98), rgba(6, 14, 22, 0.96))'
                : 'linear-gradient(180deg, rgba(24, 8, 8, 0.96), rgba(20, 8, 10, 0.96))';

              return (
                <div
                  key={column.header}
                  style={{
                    minHeight: 0,
                    borderRadius: 26,
                    background: panelBackground,
                    border: `1px solid ${accent}45`,
                    boxShadow: '0 24px 50px rgba(0, 0, 0, 0.30)',
                    padding: '24px 24px 22px',
                    display: 'grid',
                    gridTemplateRows: 'auto 1fr',
                    gap: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: accent,
                        boxShadow: `0 0 20px ${accent}66`,
                      }}
                    />
                    <div style={{ color: accent, fontSize: 12, letterSpacing: '0.16em', fontWeight: 800 }}>
                      {column.tone === 'left' ? 'OPTION A' : 'OPTION B'}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: 16, minHeight: 0 }}>
                    <div>
                      <div style={{ color: '#F8FAFC', fontSize: 27, lineHeight: 1.24, fontWeight: 900 }}>
                        {column.header}
                      </div>
                    </div>
                    <div style={{ minHeight: 0, overflow: 'hidden' }}>
                      {renderColumnBody(
                        column,
                        theme,
                        onImageUpload,
                        shouldInlineSharedVisual && column.tone === 'right' ? visual : null,
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {sharedNotes.length > 0 ? (
            <div
              style={{
                borderRadius: 22,
                background: 'linear-gradient(90deg, rgba(120, 53, 15, 0.28), rgba(15, 23, 42, 0.78))',
                border: '1px solid rgba(245, 158, 11, 0.28)',
                padding: '18px 20px',
              }}
            >
              <div style={{ fontSize: 11, letterSpacing: '0.18em', color: '#FDBA74', fontWeight: 800 }}>
                EXECUTION TAKEAWAY
              </div>
              <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                {sharedNotes.map((note, index) => (
                  <div key={`${note}-${index}`} style={{ color: '#F8FAFC', fontSize: 17, lineHeight: 1.68, fontWeight: 600 }}>
                    {note}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {visual && !shouldInlineSharedVisual ? (
          <div
            style={{
              minHeight: 0,
              borderRadius: 24,
              background: 'rgba(8, 13, 20, 0.92)',
              border: '1px solid rgba(51, 65, 85, 0.82)',
              padding: hasActualVisual ? '18px 18px 16px' : '16px 16px 14px',
              boxShadow: '0 24px 50px rgba(0, 0, 0, 0.28)',
              display: 'grid',
              gridTemplateRows: 'auto 1fr auto',
              gap: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.16em', color: '#94A3B8', fontWeight: 800 }}>
                VISUAL EVIDENCE
              </div>
              <div style={{ marginTop: 6, color: '#E2E8F0', fontSize: 15, lineHeight: 1.6 }}>
                建议放置对比示意、关键步骤截图或结构差异辅助图，让结论和证据在同一视觉区完成闭环。
              </div>
            </div>

            <ImageSlotFrame
              src={visual.src}
              alt={visual.alt || ''}
              theme={theme}
              slotLabel="方案对比配图"
              slotHint={visual.alt || '建议放置方案示意、前后对比或结构差异配图。'}
              onClick={onImageUpload ? () => onImageUpload('image.src') : undefined}
              frameStyle={{ width: '100%', minHeight: hasActualVisual ? '260px' : '220px', height: '100%' }}
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

export function renderVocationalComparisonLayoutHTML(model: VocationalComparisonModel, theme: ThemeConfig): string {
  const columns = resolveColumns(model);
  const sharedNotes = resolveSharedNotes(model);
  const visual = resolveVisual(model);
  const hasActualVisual = Boolean(visual?.src);
  const layoutLabel = resolveLabel(model.layoutId);
  const hasColumnVisuals = columns.some((column) => Boolean(column.imageSrc || column.imageAlt));
  const shouldInlineSharedVisual = Boolean(visual) && !hasColumnVisuals;

  const renderColumnHTML = (column: ResolvedColumn): string => {
    const accent = column.tone === 'left' ? '#34D399' : '#F97316';
    const softAccent = column.tone === 'left' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(249, 115, 22, 0.14)';
    const hasOwnVisual = Boolean(column.imageSrc || column.imageAlt);

    let body = '';
    if (hasOwnVisual) {
      body = column.imageSrc
        ? `<div style="width:100%;height:260px;border-radius:20px;overflow:hidden;border:1px solid ${accent}33;"><img src="${escapeHtml(column.imageSrc)}" alt="${escapeHtml(column.imageAlt || '')}" style="width:100%;height:100%;object-fit:cover;" /></div>`
        : renderEmptyImageBoxHTML(column.imageAlt || '');
    } else if (column.bullets && column.bullets.length > 0) {
      body = column.bullets
        .map(
          (bullet, index) => `
            <div style="display:grid;grid-template-columns:34px 1fr;gap:12px;align-items:flex-start;padding:14px 14px 12px;border-radius:16px;background:rgba(15, 23, 42, 0.72);border:1px solid rgba(51, 65, 85, 0.68);">
              <div style="width:34px;height:34px;border-radius:50%;background:${softAccent};color:${accent};display:flex;align-items:center;justify-content:center;font-weight:900;">${String(index + 1).padStart(2, '0')}</div>
              <div>
                <div style="color:#F8FAFC;font-size:16px;line-height:1.6;font-weight:700;">${escapeHtml(bullet.text)}</div>
                ${bullet.description ? `<div style="margin-top:4px;color:#A8B4C3;font-size:13px;line-height:1.6;">${escapeHtml(bullet.description)}</div>` : ''}
              </div>
            </div>
          `,
        )
        .join('');
    } else {
      body = (column.lines.length > 0 ? column.lines : ['当前栏位内容待补充。'])
        .map(
          (line, index) => `
            <div style="padding:16px 16px 14px;border-radius:16px;background:${index === 0 ? 'rgba(15, 23, 42, 0.78)' : 'rgba(10, 18, 28, 0.92)'};border:1px solid ${index === 0 ? `${accent}45` : 'rgba(51, 65, 85, 0.68)'};color:#D8E1EC;font-size:17px;line-height:1.7;">
              ${escapeHtml(line)}
            </div>
          `,
        )
        .join('');
    }

    const inlineVisualHtml =
      shouldInlineSharedVisual && column.tone === 'right' && visual && !hasOwnVisual
        ? renderInlineSharedVisualHTML(visual)
        : '';

    return `
      <div style="min-height:0;border-radius:26px;background:${column.tone === 'left' ? 'linear-gradient(180deg, rgba(6, 14, 22, 0.98), rgba(6, 14, 22, 0.96))' : 'linear-gradient(180deg, rgba(24, 8, 8, 0.96), rgba(20, 8, 10, 0.96))'};border:1px solid ${accent}45;box-shadow:0 24px 50px rgba(0, 0, 0, 0.30);padding:24px 24px 22px;display:grid;grid-template-rows:auto 1fr;gap:16px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:12px;height:12px;border-radius:50%;background:${accent};box-shadow:0 0 20px ${accent}66;"></div>
          <div style="color:${accent};font-size:12px;letter-spacing:0.16em;font-weight:800;">${column.tone === 'left' ? 'OPTION A' : 'OPTION B'}</div>
        </div>
        <div style="display:grid;grid-template-rows:auto 1fr;gap:16px;min-height:0;">
          <div style="color:#F8FAFC;font-size:27px;line-height:1.24;font-weight:900;">${escapeHtml(column.header)}</div>
          <div style="display:grid;gap:12px;">${body}${inlineVisualHtml}</div>
        </div>
      </div>
    `;
  };

  const sharedNotesHtml =
    sharedNotes.length > 0
      ? `
        <div style="border-radius:22px;background:linear-gradient(90deg, rgba(120, 53, 15, 0.28), rgba(15, 23, 42, 0.78));border:1px solid rgba(245, 158, 11, 0.28);padding:18px 20px;">
          <div style="font-size:11px;letter-spacing:0.18em;color:#FDBA74;font-weight:800;">EXECUTION TAKEAWAY</div>
          <div style="margin-top:10px;display:grid;gap:10px;">
            ${sharedNotes.map((note) => `<div style="color:#F8FAFC;font-size:17px;line-height:1.68;font-weight:600;">${escapeHtml(note)}</div>`).join('')}
          </div>
        </div>
      `
      : '';

  const sideVisualHtml =
    visual && !shouldInlineSharedVisual
      ? `
        <div style="min-height:0;border-radius:24px;background:rgba(8, 13, 20, 0.92);border:1px solid rgba(51, 65, 85, 0.82);padding:${hasActualVisual ? '18px 18px 16px' : '16px 16px 14px'};box-shadow:0 24px 50px rgba(0, 0, 0, 0.28);display:grid;grid-template-rows:1fr;gap:14px;">
          ${
            visual.src
              ? `<div style="width:100%;min-height:${hasActualVisual ? '260px' : '220px'};border-radius:18px;overflow:hidden;border:1px solid rgba(56,189,248,0.18);"><img src="${escapeHtml(visual.src)}" alt="${escapeHtml(visual.alt || '')}" style="width:100%;height:100%;object-fit:cover;" /></div>`
              : renderEmptyImageBoxHTML(visual.alt || '')
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
      padding: '42px',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#070A10',
      backgroundImage: buildBackgroundImage(model.background_image),
      backgroundSize: model.background_image ? 'cover' : 'auto',
      backgroundPosition: 'center',
      color: '#F8FAFC',
      fontFamily: theme.fonts.body,
    })}">
      <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);background-size:40px 40px;opacity:0.25;pointer-events:none;"></div>

      <div style="position:relative;z-index:1;">
        <div style="display:inline-flex;align-items:center;gap:10px;padding:8px 14px;border-radius:999px;border:1px solid rgba(250, 204, 21, 0.22);color:#FBBF24;font-size:12px;font-weight:800;letter-spacing:0.18em;background:rgba(10, 14, 21, 0.76);">
          <span style="width:8px;height:8px;border-radius:50%;background:#F97316;display:inline-block;"></span>
          ${escapeHtml(layoutLabel)}
        </div>
        <div style="margin-top:20px;display:flex;justify-content:space-between;align-items:flex-end;gap:20px;">
          <h2 style="margin:0;font-size:38px;line-height:1.16;font-weight:900;letter-spacing:-0.03em;color:#F8FAFC;max-width:78%;">${escapeHtml(model.title || '')}</h2>

        </div>
      </div>

      <div style="position:relative;z-index:1;margin-top:26px;flex:1;min-height:0;display:grid;grid-template-columns:${visual && !shouldInlineSharedVisual ? (hasActualVisual ? '1.26fr 0.74fr' : '1.34fr 0.66fr') : '1fr'};gap:18px;">
        <div style="min-height:0;display:grid;grid-template-rows:${sharedNotes.length > 0 ? 'auto auto' : '1fr'};gap:18px;">
          <div style="min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:18px;">
            ${columns.map((column) => renderColumnHTML(column)).join('')}
          </div>
          ${sharedNotesHtml}
        </div>
        ${sideVisualHtml}
      </div>
    </section>
  `;
}
