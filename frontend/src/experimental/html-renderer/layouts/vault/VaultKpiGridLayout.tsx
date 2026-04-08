import React from 'react';

interface Props { model: any; theme: any; }

export const VaultKpiGridLayout: React.FC<Props> = ({ model }) => {
  const variant = String(model?.variant || model?.layout_variant || 'a').toLowerCase();
  const { title = 'CORE INTELLIGENCE', subtitle = '', bullets = [] } = model;
  const kpis = bullets.slice(0, 6);
  const colors = ['#00D4FF', '#39FF14', '#FF6B35', '#00D4FF', '#39FF14', '#FF6B35'];

  if (variant === 'b') {
    return (
      <div style={{ width: '100%', height: '100%', background: '#00050F', color: '#E8F4F8', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', padding: '56px 64px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.02) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '4px', color: '#00D4FF', marginBottom: '8px' }}>INDEX // ORDERED DOSSIER</div>
            <h1 style={{ margin: 0, fontSize: '40px', fontWeight: 900, color: '#FFFFFF' }}>{title}</h1>
          </div>
          <div style={{ fontSize: '12px', letterSpacing: '2px', color: '#406070' }}>{subtitle || 'LINEAR REVIEW'}</div>
        </div>
        <div style={{ position: 'relative', flex: 1, display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {kpis.slice(0, 4).map((b: any, idx: number) => {
              const text = typeof b === 'string' ? b : b.text || '';
              const desc = typeof b === 'string' ? '' : b.description || '';
              const color = colors[idx % colors.length];
              return (
                <div key={idx} style={{ border: `1px solid ${color}33`, background: 'rgba(0,15,30,0.78)', padding: '22px 24px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: `2px solid ${color}`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 900, flexShrink: 0 }}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.3 }}>{text}</div>
                    {desc ? <div style={{ marginTop: '8px', fontSize: '14px', lineHeight: 1.55, color: '#8FB3C4' }}>{desc}</div> : null}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ border: '1px solid rgba(0,212,255,0.18)', background: 'rgba(0,15,30,0.82)', padding: '24px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '3px', color: '#00D4FF', marginBottom: '12px' }}>FOCUS ENTRY</div>
              <div style={{ fontSize: '28px', lineHeight: 1.35, color: '#FFFFFF', fontWeight: 800 }}>
                {kpis[0] ? (typeof kpis[0] === 'string' ? kpis[0] : kpis[0].text || '') : 'NO DATA'}
              </div>
            </div>
            <div style={{ flex: 1, border: '1px solid rgba(57,255,20,0.16)', background: 'rgba(0,15,30,0.76)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '11px', letterSpacing: '3px', color: '#39FF14', marginBottom: '16px' }}>ORDER MAP</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {kpis.map((b: any, idx: number) => {
                  const text = typeof b === 'string' ? b : b.text || '';
                  return (
                    <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '28px', color: colors[idx % colors.length], fontWeight: 800 }}>{String(idx + 1).padStart(2, '0')}</div>
                      <div style={{ color: '#9FC6D8', fontSize: '13px', lineHeight: 1.4 }}>{text}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 'auto', paddingTop: '18px', fontSize: '12px', color: '#406070', letterSpacing: '2px' }}>{kpis.length} ITEMS TRACKED</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', background: '#00050F', color: '#E8F4F8', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', padding: '56px 64px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,212,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.02) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', marginBottom: '32px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '4px', color: '#00D4FF', marginBottom: '8px' }}>◈ {subtitle || 'INTEL METRICS'}</div>
        <h1 style={{ margin: 0, fontSize: '40px', fontWeight: 900, color: '#FFFFFF' }}>{title}</h1>
      </div>
      <div style={{ position: 'relative', flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {kpis.map((b: any, idx: number) => {
          const raw = typeof b === 'string' ? b : b.text || '';
          const [valueStr, ...labelParts] = raw.split(' ');
          const label = labelParts.join(' ') || raw;
          const value = labelParts.length > 0 ? valueStr : '—';
          const color = colors[idx % colors.length];
          return (
            <div key={idx} style={{ border: `1px solid rgba(${idx%3===0?'0,212,255':idx%3===1?'57,255,20':'255,107,53'},0.25)`, background: 'rgba(0,15,30,0.8)', padding: '28px', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: color }} />
              <div style={{ fontSize: '11px', color: '#4A6B7A', letterSpacing: '2px', marginBottom: '12px' }}>M-{String(idx+1).padStart(2,'0')}</div>
              <div style={{ fontSize: '52px', fontWeight: 900, color: color, lineHeight: 1, letterSpacing: '-2px' }}>{value}</div>
              <div style={{ fontSize: '16px', color: '#A0C0D0', fontWeight: 500, marginTop: '12px', lineHeight: 1.3 }}>{label}</div>
              <div style={{ marginTop: '16px', width: '100%', height: '2px', background: '#0A1A24' }}>
                <div style={{ height: '100%', width: `${60 + idx * 6}%`, background: color, opacity: 0.5 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export function renderVaultKpiGridLayoutHTML(model: any, _theme: any): string {
  const variant = String(model?.variant || model?.layout_variant || 'a').toLowerCase();
  const { title = 'CORE INTELLIGENCE', subtitle = '', bullets = [] } = model;
  const kpis = (bullets as any[]).slice(0, 6);
  const colors = ['#00D4FF','#39FF14','#FF6B35','#00D4FF','#39FF14','#FF6B35'];

  if (variant === 'b') {
    const orderedRows = kpis.slice(0, 4).map((b: any, idx: number) => {
      const text = typeof b === 'string' ? b : b.text || '';
      const desc = typeof b === 'string' ? '' : b.description || '';
      const color = colors[idx % colors.length];
      return `<div style="border:1px solid ${color}33;background:rgba(0,15,30,0.78);padding:22px 24px;display:flex;gap:20px;align-items:flex-start;">
        <div style="width:56px;height:56px;border-radius:50%;border:2px solid ${color};color:${color};display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:900;flex-shrink:0;">${String(idx + 1).padStart(2, '0')}</div>
        <div style="flex:1;">
          <div style="font-size:24px;font-weight:800;color:#FFFFFF;line-height:1.3;">${text}</div>
          ${desc ? `<div style="margin-top:8px;font-size:14px;line-height:1.55;color:#8FB3C4;">${desc}</div>` : ''}
        </div>
      </div>`;
    }).join('');

    const orderMap = kpis.map((b: any, idx: number) => {
      const text = typeof b === 'string' ? b : b.text || '';
      return `<div style="display:flex;gap:12px;align-items:center;">
        <div style="width:28px;color:${colors[idx % colors.length]};font-weight:800;">${String(idx + 1).padStart(2, '0')}</div>
        <div style="color:#9FC6D8;font-size:13px;line-height:1.4;">${text}</div>
      </div>`;
    }).join('');

    const focusText = kpis[0] ? (typeof kpis[0] === 'string' ? kpis[0] : kpis[0].text || '') : 'NO DATA';

    return `
<section style="width:1280px;height:720px;background:#00050F;color:#E8F4F8;font-family:monospace;display:flex;flex-direction:column;padding:56px 64px;box-sizing:border-box;position:relative;overflow:hidden;">
  <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(0,212,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.02) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;"></div>
  <div style="position:relative;margin-bottom:28px;display:flex;justify-content:space-between;align-items:flex-end;">
    <div>
      <div style="font-size:11px;letter-spacing:4px;color:#00D4FF;margin-bottom:8px;">INDEX // ORDERED DOSSIER</div>
      <h1 style="margin:0;font-size:40px;font-weight:900;color:#FFFFFF;">${title}</h1>
    </div>
    <div style="font-size:12px;letter-spacing:2px;color:#406070;">${subtitle || 'LINEAR REVIEW'}</div>
  </div>
  <div style="position:relative;flex:1;display:grid;grid-template-columns:1.6fr 1fr;gap:18px;">
    <div style="display:flex;flex-direction:column;gap:14px;">${orderedRows}</div>
    <div style="display:flex;flex-direction:column;gap:18px;">
      <div style="border:1px solid rgba(0,212,255,0.18);background:rgba(0,15,30,0.82);padding:24px;">
        <div style="font-size:11px;letter-spacing:3px;color:#00D4FF;margin-bottom:12px;">FOCUS ENTRY</div>
        <div style="font-size:28px;line-height:1.35;color:#FFFFFF;font-weight:800;">${focusText}</div>
      </div>
      <div style="flex:1;border:1px solid rgba(57,255,20,0.16);background:rgba(0,15,30,0.76);padding:24px;display:flex;flex-direction:column;">
        <div style="font-size:11px;letter-spacing:3px;color:#39FF14;margin-bottom:16px;">ORDER MAP</div>
        <div style="display:flex;flex-direction:column;gap:12px;">${orderMap}</div>
        <div style="margin-top:auto;padding-top:18px;font-size:12px;color:#406070;letter-spacing:2px;">${kpis.length} ITEMS TRACKED</div>
      </div>
    </div>
  </div>
</section>`;
  }

  const cellsHTML = kpis.map((b: any, idx: number) => {
    const raw = typeof b === 'string' ? b : b.text || '';
    const parts = raw.split(' ');
    const value = parts.length > 1 ? parts[0] : '—';
    const label = parts.length > 1 ? parts.slice(1).join(' ') : raw;
    const color = colors[idx % colors.length];
    return `
    <div style="border:1px solid rgba(0,212,255,0.25);background:rgba(0,15,30,0.8);padding:28px;position:relative;display:flex;flex-direction:column;justify-content:space-between;">
      <div style="position:absolute;top:0;left:0;width:100%;height:2px;background:${color};"></div>
      <div style="font-size:11px;color:#4A6B7A;letter-spacing:2px;margin-bottom:12px;">M-${String(idx+1).padStart(2,'0')}</div>
      <div style="font-size:52px;font-weight:900;color:${color};line-height:1;letter-spacing:-2px;">${value}</div>
      <div style="font-size:16px;color:#A0C0D0;font-weight:500;margin-top:12px;line-height:1.3;">${label}</div>
      <div style="margin-top:16px;width:100%;height:2px;background:#0A1A24;"><div style="height:100%;width:${60+idx*6}%;background:${color};opacity:0.5;"></div></div>
    </div>`;
  }).join('');
  return `
<section style="width:1280px;height:720px;background:#00050F;color:#E8F4F8;font-family:monospace;display:flex;flex-direction:column;padding:56px 64px;box-sizing:border-box;position:relative;overflow:hidden;">
  <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(0,212,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.02) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;"></div>
  <div style="position:relative;margin-bottom:32px;">
    <div style="font-size:11px;letter-spacing:4px;color:#00D4FF;margin-bottom:8px;">◈ ${subtitle || 'INTEL METRICS'}</div>
    <h1 style="margin:0;font-size:40px;font-weight:900;color:#FFFFFF;">${title}</h1>
  </div>
  <div style="position:relative;flex:1;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
    ${cellsHTML}
  </div>
</section>`;
}
