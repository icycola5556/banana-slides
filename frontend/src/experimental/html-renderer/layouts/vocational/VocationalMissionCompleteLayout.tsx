import React from 'react';

import type { EndingModel, ThemeConfig } from '../../types/schema';
import { toInlineStyle } from '../../utils/styleHelper';

type ReflectionBlock = {
  title: string;
  items: string[];
};

type SummaryColumn = {
  title: string;
  points: string[];
};

type VocationalMissionModel = EndingModel & {
  columns?: Array<{
    title?: string;
    points?: string[];
  }>;
  content?: string;
  layoutId?: string;
};

const readText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const toStringArray = (value: unknown): string[] => {
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

const resolveColumns = (model: VocationalMissionModel): SummaryColumn[] =>
  Array.isArray((model as any).columns)
    ? (model as any).columns
        .map((column: any) => ({
          title: readText(column?.title),
          points: toStringArray(column?.points),
        }))
        .filter((column: SummaryColumn) => column.title || column.points.length > 0)
    : [];

const resolveReflectionBlocks = (model: VocationalMissionModel): ReflectionBlock[] =>
  Array.isArray(model.reflection_blocks)
    ? model.reflection_blocks
        .map((block) => ({
          title: readText(block?.title),
          items: toStringArray(block?.items),
        }))
        .filter((block) => block.title || block.items.length > 0)
    : [];

const buildBackgroundImage = (backgroundImage?: string): string => {
  const overlay = 'linear-gradient(180deg, rgba(6, 11, 16, 0.95), rgba(6, 11, 16, 0.98))';
  if (backgroundImage && backgroundImage.trim()) {
    return `${overlay}, url(${backgroundImage})`;
  }

  return `
    radial-gradient(circle at 18% 20%, rgba(34, 197, 94, 0.12), transparent 28%),
    radial-gradient(circle at 82% 18%, rgba(14, 165, 233, 0.08), transparent 24%),
    linear-gradient(180deg, rgba(6, 11, 16, 0.98), rgba(6, 11, 16, 1))
  `;
};

const getLeadText = (model: VocationalMissionModel, columns: SummaryColumn[], reflectionBlocks: ReflectionBlock[]): string => {
  if (columns.length > 0) {
    return readText(model.closing) || readText(model.content) || '围绕关键流程、决策节点和质量标准，完成本模块闭环复盘。';
  }

  if (reflectionBlocks.length > 0) {
    return readText(model.closing) || readText(model.content) || '请围绕质量规范、操作纪律与交付标准完成课后复盘。';
  }

  return readText(model.content) || readText(model.closing) || 'All safety protocols verified and executed.';
};

const renderPointList = (items: string[]) => (
  <div style={{ display: 'grid', gap: 10 }}>
    {items.map((item, index) => (
      <div
        key={`${item}-${index}`}
        style={{
          display: 'grid',
          gridTemplateColumns: '26px 1fr',
          gap: 10,
          alignItems: 'flex-start',
          color: '#D8E1EC',
          fontSize: 15,
          lineHeight: 1.65,
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.14)',
            color: '#4ADE80',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 900,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </div>
        <div>{item}</div>
      </div>
    ))}
  </div>
);

export const VocationalMissionCompleteLayout: React.FC<{
  model: VocationalMissionModel;
  theme: ThemeConfig;
}> = ({ model, theme }) => {
  const columns = resolveColumns(model);
  const reflectionBlocks = resolveReflectionBlocks(model);
  const leadText = getLeadText(model, columns, reflectionBlocks);
  const isSummaryBoard = columns.length > 0;
  const isReflectionBoard = !isSummaryBoard && reflectionBlocks.length > 0;
  const subtitle = readText(model.subtitle) || (isSummaryBoard ? 'OPERATION REVIEW' : 'MISSION COMPLETE');

  const slideStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    padding: '42px 44px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#060B10',
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
            linear-gradient(rgba(34,197,94,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,197,94,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '44px 44px',
          opacity: 0.18,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          right: -80,
          top: -140,
          width: 420,
          height: 420,
          borderRadius: '50%',
          border: '36px solid rgba(34, 197, 94, 0.08)',
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
            border: '1px solid rgba(74, 222, 128, 0.22)',
            color: '#4ADE80',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.18em',
            background: 'rgba(8, 14, 20, 0.76)',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
          {isSummaryBoard ? 'MISSION REVIEW // 复盘总览' : isReflectionBoard ? 'SUBMISSION CHECK // 结课反思' : 'MISSION COMPLETE // 收尾确认'}
        </div>

        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-start', gap: 24, alignItems: 'flex-start' }}>
          <div style={{ maxWidth: '100%' }}>
            <div style={{ color: '#86EFAC', fontSize: 13, letterSpacing: '0.22em', fontWeight: 800 }}>{subtitle}</div>
            <h1
              style={{
                margin: '10px 0 0',
                fontSize: isSummaryBoard ? 34 : 40,
                lineHeight: 1.14,
                fontWeight: 900,
                letterSpacing: '-0.03em',
                color: '#F8FAFC',
              }}
            >
              {model.title || 'MISSION COMPLETE'}
            </h1>
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          marginTop: 24,
          padding: '22px 24px',
          borderRadius: 24,
          background: 'rgba(10, 16, 24, 0.86)',
          border: '1px solid rgba(74, 222, 128, 0.18)',
          boxShadow: '0 24px 50px rgba(0, 0, 0, 0.28)',
          color: '#E2E8F0',
          fontSize: 18,
          lineHeight: 1.72,
          fontWeight: 600,
        }}
      >
        {leadText}
      </div>

      <div style={{ position: 'relative', zIndex: 1, marginTop: 22, flex: 1, minHeight: 0 }}>
        {isSummaryBoard ? (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(columns.length, 3)}, minmax(0, 1fr))`, gap: 18, minHeight: 0 }}>
            {columns.map((column, index) => (
              <div
                key={`${column.title}-${index}`}
                style={{
                  borderRadius: 24,
                  background: index === 0 ? 'rgba(10, 24, 18, 0.92)' : 'rgba(8, 14, 22, 0.92)',
                  border: '1px solid rgba(51, 65, 85, 0.82)',
                  boxShadow: '0 24px 50px rgba(0, 0, 0, 0.22)',
                  padding: '22px 20px',
                  display: 'grid',
                  gridTemplateRows: 'auto 1fr',
                  gap: 16,
                  minHeight: 0,
                }}
              >
                <div>
                  <div style={{ color: '#4ADE80', fontSize: 12, letterSpacing: '0.16em', fontWeight: 800 }}>
                    MODULE {String(index + 1).padStart(2, '0')}
                  </div>
                  <div style={{ marginTop: 8, color: '#F8FAFC', fontSize: 22, lineHeight: 1.35, fontWeight: 800 }}>
                    {column.title}
                  </div>
                </div>
                <div style={{ minHeight: 0, overflow: 'hidden' }}>
                  {renderPointList(column.points.length > 0 ? column.points : ['当前模块内容待补充。'])}
                </div>
              </div>
            ))}
          </div>
        ) : isReflectionBoard ? (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(reflectionBlocks.length, 2)}, minmax(0, 1fr))`, gap: 18, minHeight: 0 }}>
            {reflectionBlocks.map((block, index) => (
              <div
                key={`${block.title}-${index}`}
                style={{
                  borderRadius: 24,
                  background: 'rgba(8, 14, 22, 0.92)',
                  border: '1px solid rgba(51, 65, 85, 0.82)',
                  boxShadow: '0 24px 50px rgba(0, 0, 0, 0.22)',
                  padding: '22px 20px',
                  display: 'grid',
                  gridTemplateRows: 'auto 1fr',
                  gap: 16,
                  minHeight: 0,
                }}
              >
                <div>
                  <div style={{ color: '#FBBF24', fontSize: 12, letterSpacing: '0.16em', fontWeight: 800 }}>
                    REVIEW {String(index + 1).padStart(2, '0')}
                  </div>
                  <div style={{ marginTop: 8, color: '#F8FAFC', fontSize: 22, lineHeight: 1.35, fontWeight: 800 }}>
                    {block.title}
                  </div>
                </div>
                <div style={{ minHeight: 0, overflow: 'hidden' }}>
                  {renderPointList(block.items.length > 0 ? block.items : ['当前反思项待补充。'])}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              maxWidth: 760,
              borderRadius: 28,
              background: 'rgba(10, 16, 24, 0.90)',
              border: '1px solid rgba(51, 65, 85, 0.82)',
              boxShadow: '0 24px 50px rgba(0, 0, 0, 0.30)',
              padding: '28px 30px',
            }}
          >
            <div style={{ color: '#E2E8F0', fontSize: 24, lineHeight: 1.72, fontWeight: 700 }}>{leadText}</div>
          </div>
        )}
      </div>

    </section>
  );
};

export function renderVocationalMissionCompleteLayoutHTML(model: VocationalMissionModel, theme: ThemeConfig): string {
  const columns = resolveColumns(model);
  const reflectionBlocks = resolveReflectionBlocks(model);
  const leadText = getLeadText(model, columns, reflectionBlocks);
  const isSummaryBoard = columns.length > 0;
  const isReflectionBoard = !isSummaryBoard && reflectionBlocks.length > 0;
  const subtitle = readText(model.subtitle) || (isSummaryBoard ? 'OPERATION REVIEW' : 'MISSION COMPLETE');

  const renderPointsHTML = (items: string[]) =>
    items
      .map(
        (item, index) => `
          <div style="display:grid;grid-template-columns:26px 1fr;gap:10px;align-items:flex-start;color:#D8E1EC;font-size:15px;line-height:1.65;">
            <div style="width:26px;height:26px;border-radius:50%;background:rgba(34, 197, 94, 0.14);color:#4ADE80;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;">
              ${String(index + 1).padStart(2, '0')}
            </div>
            <div>${escapeHtml(item)}</div>
          </div>
        `,
      )
      .join('');

  const cardsHTML = isSummaryBoard
    ? columns
        .map(
          (column, index) => `
            <div style="border-radius:24px;background:${index === 0 ? 'rgba(10, 24, 18, 0.92)' : 'rgba(8, 14, 22, 0.92)'};border:1px solid rgba(51, 65, 85, 0.82);box-shadow:0 24px 50px rgba(0, 0, 0, 0.22);padding:22px 20px;display:grid;grid-template-rows:auto 1fr;gap:16px;min-height:0;">
              <div>
                <div style="color:#4ADE80;font-size:12px;letter-spacing:0.16em;font-weight:800;">MODULE ${String(index + 1).padStart(2, '0')}</div>
                <div style="margin-top:8px;color:#F8FAFC;font-size:22px;line-height:1.35;font-weight:800;">${escapeHtml(column.title)}</div>
              </div>
              <div style="display:grid;gap:10px;">${renderPointsHTML(column.points.length > 0 ? column.points : ['当前模块内容待补充。'])}</div>
            </div>
          `,
        )
        .join('')
    : reflectionBlocks
        .map(
          (block, index) => `
            <div style="border-radius:24px;background:rgba(8, 14, 22, 0.92);border:1px solid rgba(51, 65, 85, 0.82);box-shadow:0 24px 50px rgba(0, 0, 0, 0.22);padding:22px 20px;display:grid;grid-template-rows:auto 1fr;gap:16px;min-height:0;">
              <div>
                <div style="color:#FBBF24;font-size:12px;letter-spacing:0.16em;font-weight:800;">REVIEW ${String(index + 1).padStart(2, '0')}</div>
                <div style="margin-top:8px;color:#F8FAFC;font-size:22px;line-height:1.35;font-weight:800;">${escapeHtml(block.title)}</div>
              </div>
              <div style="display:grid;gap:10px;">${renderPointsHTML(block.items.length > 0 ? block.items : ['当前反思项待补充。'])}</div>
            </div>
          `,
        )
        .join('');

  return `
    <section style="${toInlineStyle({
      width: `${theme.sizes.slideWidth}px`,
      height: `${theme.sizes.slideHeight}px`,
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      padding: '42px 44px',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#060B10',
      backgroundImage: buildBackgroundImage(model.background_image),
      backgroundSize: model.background_image ? 'cover' : 'auto',
      backgroundPosition: 'center',
      color: '#F8FAFC',
      fontFamily: theme.fonts.body,
    })}">
      <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(34,197,94,0.08) 1px, transparent 1px),linear-gradient(90deg, rgba(34,197,94,0.08) 1px, transparent 1px);background-size:44px 44px;opacity:0.18;pointer-events:none;"></div>
      <div style="position:absolute;right:-80px;top:-140px;width:420px;height:420px;border-radius:50%;border:36px solid rgba(34, 197, 94, 0.08);pointer-events:none;"></div>

      <div style="position:relative;z-index:1;">
        <div style="display:inline-flex;align-items:center;gap:10px;padding:8px 14px;border-radius:999px;border:1px solid rgba(74, 222, 128, 0.22);color:#4ADE80;font-size:12px;font-weight:800;letter-spacing:0.18em;background:rgba(8, 14, 20, 0.76);">
          <span style="width:8px;height:8px;border-radius:50%;background:#22C55E;display:inline-block;"></span>
          ${isSummaryBoard ? 'MISSION REVIEW // 复盘总览' : isReflectionBoard ? 'SUBMISSION CHECK // 结课反思' : 'MISSION COMPLETE // 收尾确认'}
        </div>
        <div style="margin-top:18px;display:flex;justify-content:flex-start;gap:24px;align-items:flex-start;">
          <div style="max-width:100%;">
            <div style="color:#86EFAC;font-size:13px;letter-spacing:0.22em;font-weight:800;">${escapeHtml(subtitle)}</div>
            <h1 style="margin:10px 0 0;font-size:${isSummaryBoard ? 34 : 40}px;line-height:1.14;font-weight:900;letter-spacing:-0.03em;color:#F8FAFC;">${escapeHtml(model.title || 'MISSION COMPLETE')}</h1>
          </div>
        </div>
      </div>

      <div style="position:relative;z-index:1;margin-top:24px;padding:22px 24px;border-radius:24px;background:rgba(10, 16, 24, 0.86);border:1px solid rgba(74, 222, 128, 0.18);box-shadow:0 24px 50px rgba(0, 0, 0, 0.28);color:#E2E8F0;font-size:18px;line-height:1.72;font-weight:600;">
        ${escapeHtml(leadText)}
      </div>

      <div style="position:relative;z-index:1;margin-top:22px;flex:1;min-height:0;">
        ${
          isSummaryBoard || isReflectionBoard
            ? `<div style="display:grid;grid-template-columns:repeat(${Math.min(isSummaryBoard ? columns.length : reflectionBlocks.length, isSummaryBoard ? 3 : 2)}, minmax(0, 1fr));gap:18px;min-height:0;">${cardsHTML}</div>`
            : `<div style="max-width:760px;border-radius:28px;background:rgba(10, 16, 24, 0.90);border:1px solid rgba(51, 65, 85, 0.82);box-shadow:0 24px 50px rgba(0, 0, 0, 0.30);padding:28px 30px;"><div style="color:#E2E8F0;font-size:24px;line-height:1.72;font-weight:700;">${escapeHtml(leadText)}</div></div>`
        }
      </div>

    </section>
  `;
}
