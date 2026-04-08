import React from 'react';
import { AlertOctagon, AlertTriangle, CheckSquare } from 'lucide-react';

import type { ThemeConfig, TitleBulletsModel } from '../../types/schema';

interface Props {
  model: TitleBulletsModel & { layoutId?: string };
  theme: ThemeConfig;
}

type SafetyBullet = {
  text?: string;
  description?: string;
  note?: string;
  example?: string;
  dataPoint?: {
    value?: string;
    unit?: string;
    source?: string;
  };
};

const readText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const normalizeBullets = (bullets: TitleBulletsModel['bullets'] | undefined): SafetyBullet[] =>
  Array.isArray(bullets)
    ? bullets.map((bullet) => (typeof bullet === 'string' ? { text: bullet } : bullet || {}))
    : [];

const resolveSidebarBrief = (
  model: TitleBulletsModel & { layoutId?: string },
  bullets: SafetyBullet[],
) => {
  const firstBullet = bullets[0] || {};
  const keyTakeaway = readText(model.keyTakeaway);
  const firstDescription = readText(firstBullet.description);
  const firstNote = readText(firstBullet.note);
  const firstExample = readText(firstBullet.example);
  const firstDataPoint = firstBullet.dataPoint
    ? [
        readText(firstBullet.dataPoint.value),
        readText(firstBullet.dataPoint.unit),
        readText(firstBullet.dataPoint.source),
      ]
        .filter(Boolean)
        .join(' / ')
    : '';

  const body =
    keyTakeaway
    || firstDescription
    || firstNote
    || firstExample
    || readText(model.subtitle)
    || '请围绕本页核心概念完成要点理解与结构核查。';

  const support =
    (keyTakeaway ? firstDescription || firstNote || firstExample : firstNote || firstExample || firstDataPoint)
    || firstDataPoint
    || '';

  const status = keyTakeaway
    ? 'STATUS: KEY TAKEAWAY LOCKED'
    : firstDescription || firstNote || firstExample
      ? 'STATUS: CONTEXT READY'
      : 'STATUS: CHECKLIST READY';

  return {
    body,
    support,
    status,
  };
};

const resolveDanger = (text: string): boolean => /绂亅涓ョ|涓嶅緱|闃叉|鍒囧嬁|绂佹/.test(text);

export const VocationalSafetyCheckLayout: React.FC<Props> = ({ model }) => {
  const variant = String((model as any)?.variant || (model as any)?.layout_variant || 'a').toLowerCase();
  const title = model.title || 'SAFETY CHECKLIST / 安防核查';
  const subtitle = readText(model.subtitle);
  const bullets = normalizeBullets(model.bullets);
  const sidebar = resolveSidebarBrief(model, bullets);

  if (variant === 'b') {
    return (
      <div className="w-full h-full bg-[#1c1917] p-8 font-sans overflow-hidden">
        <div
          className="w-full h-full bg-[#111318] relative flex flex-col"
          style={{
            border: '12px solid #FF3333',
            borderImage: 'repeating-linear-gradient(45deg, #FF3333, #FF3333 30px, #111318 30px, #111318 60px) 12',
            boxShadow: 'inset 0 0 40px rgba(255, 51, 51, 0.15)',
          }}
        >
          <div className="bg-red-950/50 border-b-2 border-red-500/30 w-full px-12 py-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <AlertTriangle size={56} className="text-red-500 animate-pulse" />
              <div>
                <h1 className="text-5xl font-black text-white tracking-tight uppercase mb-2">
                  {title}
                </h1>
                {subtitle ? (
                  <h2 className="text-xl font-bold text-red-400">
                    {subtitle}
                  </h2>
                ) : null}
              </div>
            </div>
            <div className="bg-yellow-400 text-black font-black text-2xl px-6 py-2 -rotate-2 shadow-lg">
              ORDERED
            </div>
          </div>

          <div className="flex-1 grid grid-cols-[1.2fr_1fr] gap-8 px-14 py-10 overflow-hidden">
            <div className="flex flex-col gap-4">
              {bullets.slice(0, 4).map((bullet, idx) => (
                <div key={`${bullet.text || idx}`} className="bg-slate-950/70 border border-red-500/20 px-6 py-5 flex gap-5 items-start">
                  <div className="w-14 h-14 rounded-full border-2 border-yellow-400 text-yellow-300 flex items-center justify-center text-2xl font-black flex-shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-2xl font-bold leading-snug tracking-wide text-slate-100">
                      {bullet.text || ''}
                    </p>
                    {bullet.description ? <p className="mt-2 mb-0 text-base text-slate-400 leading-relaxed">{bullet.description}</p> : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-8 flex flex-col">
              <p className="font-mono text-sm tracking-[0.3em] text-red-400 mb-6">AUDIT INDEX</p>
              <div className="flex flex-col gap-4">
                {bullets.slice(0, 6).map((bullet, idx) => (
                  <div key={`${bullet.text || idx}-audit`} className="flex items-center gap-4 border-b border-slate-800/80 pb-3 last:border-b-0 last:pb-0">
                    <div className="text-red-500 font-mono text-sm w-10 flex-shrink-0">{String(idx + 1).padStart(2, '0')}</div>
                    <div className="text-slate-300 text-sm leading-relaxed">{bullet.text || ''}</div>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-8">
                <p className="font-mono text-slate-500 text-sm mb-1">TOTAL CHECKS: {bullets.length}</p>
                <p className="font-mono text-yellow-300 text-sm font-bold">MODE: NUMBERED REVIEW</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#1c1917] p-8 font-sans overflow-hidden">
      <div
        className="w-full h-full bg-[#111318] relative flex flex-col"
        style={{
          border: '12px solid #FF3333',
          borderImage: 'repeating-linear-gradient(45deg, #FF3333, #FF3333 30px, #111318 30px, #111318 60px) 12',
          boxShadow: 'inset 0 0 40px rgba(255, 51, 51, 0.15)',
        }}
      >
        <div className="bg-red-950/50 border-b-2 border-red-500/30 w-full px-12 py-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <AlertTriangle size={56} className="text-red-500 animate-pulse" />
            <div>
              <h1 className="text-5xl font-black text-white tracking-tight uppercase mb-2">
                {title}
              </h1>
              {subtitle ? (
                <h2 className="text-xl font-bold text-red-400">
                  {subtitle}
                </h2>
              ) : null}
            </div>
          </div>
          <div className="bg-red-500 text-white font-black text-2xl px-6 py-2 rotate-3 shadow-lg">
            MANDATORY
          </div>
        </div>

        <div className="flex-1 flex px-16 py-10 gap-16">
          <div className="w-1/4 flex flex-col border-r border-slate-800/60 pr-12 pt-4">
            <AlertOctagon size={48} className="text-slate-600 mb-6" />
            <p className="text-slate-400 text-lg font-medium leading-relaxed mb-8">
              {sidebar.body}
            </p>
            {sidebar.support ? (
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {sidebar.support}
              </p>
            ) : null}
            <div className="mt-auto pt-6 border-t border-slate-800">
              <p className="font-mono text-slate-500 text-sm">TOTAL CHECKS: {bullets.length}</p>
            </div>
          </div>

          <div className="w-3/4 flex flex-col justify-center gap-6">
            {bullets.map((bullet, idx) => {
              const bulletText = bullet.text || '';
              const isDanger = resolveDanger(bulletText);

              return (
                <div
                  key={`${bulletText}-${idx}`}
                  className={`flex items-start gap-6 p-6 border-l-8 bg-slate-900/40 backdrop-blur-sm ${isDanger ? 'border-red-500' : 'border-yellow-500'}`}
                >
                  <div className={`mt-1 ${isDanger ? 'text-red-500' : 'text-yellow-500'}`}>
                    {isDanger ? <AlertOctagon size={32} /> : <CheckSquare size={32} />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-2xl font-bold leading-snug tracking-wide ${isDanger ? 'text-red-100' : 'text-slate-200'}`}>
                      {bulletText}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export function renderVocationalSafetyCheckLayoutHTML(model: any, theme: any): string {
  const variant = String(model?.variant || model?.layout_variant || 'a').toLowerCase();
  const title = model?.title || 'SAFETY CHECKLIST / 安防核查';
  const subtitle = readText(model?.subtitle);
  const bullets = normalizeBullets(model?.bullets);
  const sidebar = resolveSidebarBrief(model, bullets);

  if (variant === 'b') {
    const orderedRows = bullets.slice(0, 4).map((bullet, idx) => {
      const text = bullet.text || '';
      const desc = bullet.description || '';
      return `<div style="background:rgba(2,6,23,0.7);border:1px solid rgba(239,68,68,0.2);padding:20px 24px;display:flex;gap:20px;align-items:flex-start;">
        <div style="width:56px;height:56px;border-radius:9999px;border:2px solid #FACC15;color:#FDE047;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;flex-shrink:0;">${String(idx + 1).padStart(2, '0')}</div>
        <div style="flex:1;min-width:0;">
          <p style="margin:0;font-size:24px;font-weight:700;line-height:1.35;color:#E2E8F0;">${escapeHtml(text)}</p>
          ${desc ? `<p style="margin:8px 0 0 0;font-size:16px;color:#94A3B8;line-height:1.6;">${escapeHtml(desc)}</p>` : ''}
        </div>
      </div>`;
    }).join('');

    const indexRows = bullets.slice(0, 6).map((bullet, idx, list) => {
      const text = bullet.text || '';
      return `<div style="display:flex;align-items:center;gap:16px;border-bottom:1px solid rgba(30,41,59,0.8);padding-bottom:12px;margin-bottom:${idx === list.length - 1 ? 0 : 12}px;">
        <div style="color:#EF4444;font-family:monospace;font-size:12px;width:40px;flex-shrink:0;">${String(idx + 1).padStart(2, '0')}</div>
        <div style="color:#CBD5E1;font-size:14px;line-height:1.6;">${escapeHtml(text)}</div>
      </div>`;
    }).join('');

    return `
<section style="width:1280px;height:720px;box-sizing:border-box;background:#1c1917;padding:32px;font-family:'PingFang SC','Microsoft YaHei',sans-serif;overflow:hidden;">
  <div style="width:100%;height:100%;box-sizing:border-box;background:#111318;position:relative;display:flex;flex-direction:column;border:12px solid #FF3333;box-shadow:inset 0 0 40px rgba(255,51,51,0.15);">
    <div style="background:rgba(69,10,10,0.5);border-bottom:2px solid rgba(239,68,68,0.4);padding:32px 48px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:24px;">
        <div style="font-size:52px;color:#EF4444;">⚠</div>
        <div>
          <h1 style="margin:0 0 8px 0;font-size:44px;font-weight:900;color:#FFFFFF;letter-spacing:-0.5px;text-transform:uppercase;">${escapeHtml(title)}</h1>
          ${subtitle ? `<h2 style="margin:0;font-size:20px;font-weight:700;color:#FCA5A5;">${escapeHtml(subtitle)}</h2>` : ''}
        </div>
      </div>
      <div style="background:#FACC15;color:#111827;font-size:22px;font-weight:900;padding:8px 24px;transform:rotate(-2deg);box-shadow:0 4px 12px rgba(0,0,0,0.5);">ORDERED</div>
    </div>

    <div style="flex:1;display:grid;grid-template-columns:1.2fr 1fr;gap:32px;padding:40px 48px;overflow:hidden;">
      <div style="display:flex;flex-direction:column;gap:16px;">${orderedRows}</div>
      <div style="background:rgba(2,6,23,0.6);border:1px solid #1E293B;padding:32px;display:flex;flex-direction:column;">
        <p style="margin:0 0 24px 0;font-family:monospace;font-size:12px;letter-spacing:0.3em;color:#F87171;">AUDIT INDEX</p>
        <div style="display:flex;flex-direction:column;">${indexRows}</div>
        <div style="margin-top:auto;padding-top:24px;">
          <p style="margin:0 0 4px 0;font-family:monospace;font-size:12px;color:#475569;">TOTAL CHECKS: ${bullets.length}</p>
          <p style="margin:0;font-family:monospace;font-size:12px;color:#FDE047;font-weight:700;">MODE: NUMBERED REVIEW</p>
        </div>
      </div>
    </div>
  </div>
</section>`;
  }

  const rowsHTML = bullets.map((bullet, idx) => {
    const text = bullet.text || '';
    const isDanger = resolveDanger(text);
    const accentColor = isDanger ? '#EF4444' : '#EAB308';
    const textColor = isDanger ? '#FEE2E2' : '#E2E8F0';
    const icon = isDanger ? '⛔' : '☑';
    return `
    <div style="display:flex;align-items:flex-start;gap:24px;padding:20px 24px;border-left:8px solid ${accentColor};background:rgba(15,23,42,0.4);">
      <div style="font-size:28px;color:${accentColor};flex-shrink:0;margin-top:2px;">${icon}</div>
      <p style="margin:0;font-size:22px;font-weight:700;line-height:1.4;color:${textColor};letter-spacing:0.3px;">${escapeHtml(text)}</p>
    </div>`;
  }).join('\n');

  return `
<section style="width:1280px;height:720px;box-sizing:border-box;background:#1c1917;padding:32px;font-family:'PingFang SC','Microsoft YaHei',sans-serif;overflow:hidden;">
  <div style="width:100%;height:100%;box-sizing:border-box;background:#111318;position:relative;display:flex;flex-direction:column;border:12px solid #FF3333;box-shadow:inset 0 0 40px rgba(255,51,51,0.15);">
    <div style="background:rgba(69,10,10,0.5);border-bottom:2px solid rgba(239,68,68,0.4);padding:32px 48px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:24px;">
        <div style="font-size:52px;color:#EF4444;">⚠</div>
        <div>
          <h1 style="margin:0 0 8px 0;font-size:44px;font-weight:900;color:#FFFFFF;letter-spacing:-0.5px;text-transform:uppercase;">${escapeHtml(title)}</h1>
          ${subtitle ? `<h2 style="margin:0;font-size:20px;font-weight:700;color:#FCA5A5;">${escapeHtml(subtitle)}</h2>` : ''}
        </div>
      </div>
      <div style="background:#EF4444;color:#FFFFFF;font-size:22px;font-weight:900;padding:8px 24px;transform:rotate(3deg);box-shadow:0 4px 12px rgba(0,0,0,0.5);">MANDATORY</div>
    </div>

    <div style="flex:1;display:flex;padding:40px 48px;gap:48px;overflow:hidden;">
      <div style="width:220px;display:flex;flex-direction:column;border-right:1px solid rgba(51,65,85,0.6);padding-right:40px;">
        <div style="font-size:40px;color:#334155;margin-bottom:20px;">⛔</div>
        <p style="margin:0 0 28px 0;font-size:15px;color:#94A3B8;line-height:1.6;">
          ${escapeHtml(sidebar.body)}
        </p>
        ${sidebar.support ? `<p style="margin:0 0 24px 0;font-size:13px;color:#64748B;line-height:1.7;">${escapeHtml(sidebar.support)}</p>` : ''}
        <div style="margin-top:auto;padding-top:20px;border-top:1px solid #1E293B;">
          <p style="margin:0 0 4px 0;font-family:monospace;font-size:12px;color:#475569;">TOTAL CHECKS: ${bullets.length}</p>
        </div>
      </div>

      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:16px;overflow:hidden;">
        ${rowsHTML}
      </div>
    </div>
  </div>
</section>`;
}
