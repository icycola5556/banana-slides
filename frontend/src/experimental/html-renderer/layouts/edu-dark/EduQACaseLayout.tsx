import React from 'react';
import { EduQACaseModel, ThemeConfig } from '../../types/schema';

interface EduQACaseLayoutProps {
  model: EduQACaseModel;
  theme: ThemeConfig;
}

type EduQACaseItem = NonNullable<EduQACaseModel['items']>[number];
type NormalizedEduQACaseModel = Omit<EduQACaseModel, 'items' | 'variant'> & {
  items: EduQACaseItem[];
  variant: 'a' | 'b';
};

const ITEM_COLOR_SCALE = ['#06b6d3', '#10b981', '#3b82f6', '#f59e0b'] as const;

const hasText = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const normalizeVariant = (rawVariant: unknown, itemCount: number): 'a' | 'b' => {
  const value = hasText(rawVariant) ? rawVariant.trim().toLowerCase() : '';
  if (value === 'b' || value === 'c') return 'b';
  if (value === 'a') return 'a';
  if (value === 'd') return itemCount > 3 ? 'b' : 'a';
  return itemCount > 3 ? 'b' : 'a';
};

const sanitizeItems = (items: EduQACaseModel['items']): EduQACaseItem[] => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item, index) => {
      const content = hasText(item?.content) ? item.content.trim() : '';
      if (!content) return null;
      const label = hasText(item?.label) ? item.label.trim() : `要点${index + 1}`;
      const normalized: EduQACaseItem = {
        label,
        content,
        color: hasText(item?.color) ? item.color.trim() : ITEM_COLOR_SCALE[index % ITEM_COLOR_SCALE.length],
      };
      if (hasText(item?.label_en)) normalized.label_en = item.label_en.trim();
      if (hasText(item?.icon)) normalized.icon = item.icon.trim();
      return normalized;
    })
    .filter((item): item is EduQACaseItem => item !== null);
};

const buildItemsFromStructuredFields = (input: Partial<EduQACaseModel>): EduQACaseItem[] => {
  const items: EduQACaseItem[] = [];

  if (hasText(input.question)) {
    items.push({
      label: 'Q',
      label_en: 'Question',
      content: input.question.trim(),
      color: ITEM_COLOR_SCALE[0],
    });
  }

  if (hasText(input.answer)) {
    items.push({
      label: 'A',
      label_en: 'Answer',
      content: input.answer.trim(),
      color: ITEM_COLOR_SCALE[1],
    });
  }

  if (Array.isArray(input.analysis)) {
    input.analysis.forEach((entry, index) => {
      const title = hasText(entry?.title) ? entry.title.trim() : `分析${index + 1}`;
      const content = hasText(entry?.content) ? entry.content.trim() : '';
      if (!content) return;
      items.push({
        label: title,
        content,
        color: ITEM_COLOR_SCALE[items.length % ITEM_COLOR_SCALE.length],
      });
    });
  }

  if (hasText(input.conclusion)) {
    items.push({
      label: '结论',
      label_en: 'Conclusion',
      content: input.conclusion.trim(),
      color: ITEM_COLOR_SCALE[3],
    });
  }

  if (items.length <= 4) return items;

  const firstThree = items.slice(0, 3);
  const overflowText = items
    .slice(3)
    .map((item) => `${item.label}：${item.content}`)
    .join('；');
  firstThree.push({
    label: '延伸',
    label_en: 'More',
    content: overflowText,
    color: ITEM_COLOR_SCALE[3],
  });
  return firstThree;
};

function normalizeModel(input: Partial<EduQACaseModel>): NormalizedEduQACaseModel {
  const explicitItems = sanitizeItems(input.items);
  const derivedItems = explicitItems.length > 0 ? explicitItems : buildItemsFromStructuredFields(input);
  const items = derivedItems.length > 0
    ? derivedItems
    : [
      { label: 'Q', label_en: 'Question', content: '这是一个示例问题？', color: '#06b6d3' },
      { label: 'A', label_en: 'Answer', content: '这是一个示例回答，用于展示布局效果。', color: '#10b981' },
    ];

  return {
    title: input.title || '问答与案例分析',
    subtitle: input.subtitle,
    variant: normalizeVariant(input.variant || input.layout_variant, items.length),
    layout_variant: hasText(input.layout_variant) ? input.layout_variant : undefined,
    items,
    question: hasText(input.question) ? input.question : undefined,
    answer: hasText(input.answer) ? input.answer : undefined,
    analysis: Array.isArray(input.analysis) ? input.analysis : undefined,
    conclusion: hasText(input.conclusion) ? input.conclusion : undefined,
    background_image: input.background_image,
  };
}

// 关键词高亮辅助函数
const highlightText = (text: string, color: string = '#06b6d3') => {
  const keywords = ['非对称', '空间感', '灵动', '数字化', '极致', '核心', '行动', '背景'];
  let result: (string | JSX.Element)[] = [text];
  keywords.forEach(word => {
    const newResult: (string | JSX.Element)[] = [];
    result.forEach(part => {
      if (typeof part === 'string') {
        const subParts = part.split(word);
        subParts.forEach((subPart, i) => {
          newResult.push(subPart);
          if (i < subParts.length - 1) {
            newResult.push(<strong key={word + i} style={{ color, fontWeight: 700 }}>{word}</strong>);
          }
        });
      } else {
        newResult.push(part);
      }
    });
    result = newResult;
  });
  return result;
};

const SHADOW_SOFT = '0 16px 40px rgba(0, 0, 0, 0.45)';
const getItemLabelEn = (item: EduQACaseItem): string | undefined =>
  (item as unknown as { label_en?: string }).label_en;

export const EduQACaseLayout: React.FC<EduQACaseLayoutProps> = ({ model, theme }) => {
  const data = normalizeModel(model);
  const isVariantB = data.variant === 'b';

  const slideStyle: React.CSSProperties = {
    width: 1280,
    height: 720,
    padding: '44px 72px', // 压缩外边距
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: theme.fonts.body,
    background: data.background_image
      ? `radial-gradient(circle at 10% 10%, rgba(6,182,212,0.1) 0%, transparent 60%), radial-gradient(circle at 90% 90%, rgba(59,130,246,0.1) 0%, transparent 60%), linear-gradient(rgba(8,14,32,0.85), rgba(8,14,32,0.88)), url(${data.background_image}) center/cover no-repeat`
      : 'radial-gradient(circle at 15% 15%, rgba(6,182,212,0.12) 0%, transparent 50%), radial-gradient(circle at 85% 85%, rgba(59,130,246,0.15) 0%, transparent 50%), linear-gradient(135deg, #0b1120 0%, #051937 100%)',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <section style={slideStyle}>
      {/* 星尘 */}
      <div style={{ position: 'absolute', top: '25%', left: '40%', width: 3, height: 3, borderRadius: '50%', background: '#06b6d3', filter: 'blur(1.5px)', opacity: 0.5 }} />
      <div style={{ position: 'absolute', top: '75%', left: '85%', width: 2, height: 2, borderRadius: '50%', background: '#3b82f6', filter: 'blur(1px)', opacity: 0.4 }} />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        borderBottom: '1px solid rgba(6,182,212,0.2)',
        paddingBottom: 20,
        marginBottom: 32, // 压缩标题下方间距
        flexShrink: 0,
        zIndex: 2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: 10, 
            height: 10, 
            borderRadius: '50%', 
            marginRight: 18, 
            background: '#06b6d3',
            boxShadow: '0 0 15px #06b6d3'
          }} />
          <h2 style={{ margin: 0, color: '#ffffff', fontSize: 44, fontWeight: 700, fontFamily: theme.fonts.title }}>{data.title}</h2>
        </div>
        {data.subtitle && (
          <div style={{ color: '#93c5fd', fontSize: 18, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.7 }}>
            {data.subtitle}
          </div>
        )}
      </div>

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', zIndex: 2, minHeight: 0 }}>
        {isVariantB ? (
          <EduCaseBoard items={data.items} theme={theme} />
        ) : (
          <EduQACards items={data.items} theme={theme} />
        )}
      </div>
    </section>
  );
};

// 变体 A: 极致灵动问答 (压缩版)
const EduQACards: React.FC<{ items: EduQACaseItem[]; theme: ThemeConfig }> = ({ items, theme }) => {
  return (
    <div style={{ position: 'relative', maxWidth: 1040, margin: '0 auto', width: '100%' }}>
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', strokeDasharray: '4 6', stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}>
        <path d="M 250 120 Q 520 250 790 380" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}> {/* 压缩间距 */}
        {items.slice(0, 3).map((item, idx) => {
          const isQuestion = item.label.toUpperCase() === 'Q' || item.label.includes('问');
          return (
            <div key={idx} style={{
              alignSelf: isQuestion ? 'flex-start' : 'flex-end',
              marginLeft: isQuestion ? -40 : 0,
              marginRight: isQuestion ? 0 : -40,
              maxWidth: isQuestion ? '70%' : '80%',
              position: 'relative',
              zIndex: 5,
            }}>
              <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1.2, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', zIndex: 11 }} />
              <div style={{
                position: 'absolute',
                top: -20,
                [isQuestion ? 'left' : 'right']: -20,
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${item.color || (isQuestion ? '#06b6d3' : '#10b981')}, #051937)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 20,
                fontWeight: 900,
                zIndex: 12,
                boxShadow: `0 4px 12px rgba(0,0,0,0.5), 0 0 10px ${item.color || (isQuestion ? '#06b6d3' : '#10b981')}66`,
                border: '1px solid rgba(255,255,255,0.3)',
              }}>
                {item.label[0]}
              </div>
              <div style={{
                background: isQuestion ? 'rgba(30, 41, 59, 0.5)' : 'rgba(6, 182, 211, 0.12)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${isQuestion ? 'rgba(255,255,255,0.1)' : 'rgba(6,182,211,0.25)'}`,
                boxShadow: SHADOW_SOFT,
                borderRadius: 24,
                padding: '24px 32px',
                color: isQuestion ? '#cbd5e1' : '#ffffff',
                fontSize: 24, // 压缩字号
                lineHeight: 1.5,
              }}>
                {highlightText(item.content, item.color || (isQuestion ? '#06b6d3' : '#10b981'))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 变体 B: 非对称极致看板 (绝对定位布局 - 与HTML导出保持一致)
const EduCaseBoard: React.FC<{ items: EduQACaseItem[]; theme: ThemeConfig }> = ({ items, theme }) => {
  const layoutItems = items.slice(0, 4);
  // Check if the 4th card is a true "more/延伸" overflow card
  const lastItem = layoutItems[layoutItems.length - 1];
  const hasMoreCard = lastItem && (lastItem.label === '延伸' || lastItem.label_en === 'More');

  if (hasMoreCard) {
    // 3-row layout with "more" card at bottom
    const featured = layoutItems[0];
    const answer = layoutItems[1];
    const check = layoutItems[2];
    const more = layoutItems[3];

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Featured (Q) - Left Column */}
        <div style={{
          position: 'absolute',
          left: 0, top: 0, width: '54%', height: '64%',
          background: 'rgba(15, 23, 42, 0.45)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 20,
          padding: '28px 24px',
          display: 'flex', flexDirection: 'column', gap: 10,
          boxShadow: SHADOW_SOFT,
        }}>
          <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1.2, background: `linear-gradient(90deg, transparent, ${featured.color || '#3b82f6'}66, transparent)` }} />
          <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 3, opacity: 0.7 }}>
            {(featured as any).label_en ? (featured as any).label_en.toUpperCase() : featured.label.toUpperCase()}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: featured.color || '#3b82f6', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 18, background: featured.color || '#3b82f6', borderRadius: 2 }} />
            {featured.label}
          </div>
          <div style={{ fontSize: 18, color: '#d1d5db', lineHeight: 1.45, flex: 1, overflow: 'hidden' }}>
            {highlightText(featured.content, featured.color || '#3b82f6')}
          </div>
        </div>

        {/* Answer - Top Right */}
        <div style={{
          position: 'absolute',
          right: 0, top: 0, width: '43%', height: '31%',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 20,
          padding: '20px 24px',
          display: 'flex', flexDirection: 'column', gap: 8,
          boxShadow: SHADOW_SOFT,
        }}>
          <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 3, opacity: 0.7 }}>
            {(answer as any).label_en ? (answer as any).label_en.toUpperCase() : answer.label.toUpperCase()}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: answer.color || '#3b82f6' }}>{answer.label}</div>
          <div style={{ fontSize: 16, color: '#d1d5db', lineHeight: 1.45, flex: 1, overflow: 'hidden' }}>
            {highlightText(answer.content, answer.color || '#3b82f6')}
          </div>
        </div>

        {/* Check - Bottom Right */}
        <div style={{
          position: 'absolute',
          right: 0, top: '33%', width: '43%', height: '31%',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 20,
          padding: '20px 24px',
          display: 'flex', flexDirection: 'column', gap: 8,
          boxShadow: SHADOW_SOFT,
        }}>
          <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 3, opacity: 0.7 }}>
            {(check as any).label_en ? (check as any).label_en.toUpperCase() : check.label.toUpperCase()}
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: check.color || '#3b82f6' }}>{check.label}</div>
          <div style={{ fontSize: 16, color: '#d1d5db', lineHeight: 1.45, flex: 1, overflow: 'hidden' }}>
            {highlightText(check.content, check.color || '#3b82f6')}
          </div>
        </div>

        {/* More - Bottom Full Width */}
        <div style={{
          position: 'absolute',
          left: 0, bottom: 0, width: '100%', height: '32%',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          padding: '16px 24px',
          display: 'flex', flexDirection: 'column', gap: 6,
          boxShadow: SHADOW_SOFT,
        }}>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 3, opacity: 0.7 }}>
            {(more as any).label_en ? (more as any).label_en.toUpperCase() : more.label.toUpperCase()}
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: more.color || '#3b82f6' }}>{more.label}</div>
          <div style={{
            fontSize: 15, color: '#d1d5db', lineHeight: 1.45, flex: 1, overflow: 'hidden',
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          }}>
            {highlightText(more.content, more.color || '#3b82f6')}
          </div>
        </div>
      </div>
    );
  }

  // Standard 2x2 grid using absolute positioning
  const positions = [
    { left: '0', top: '0', width: '54%', height: '48%' },    // Featured
    { right: '0', top: '0', width: '43%', height: '48%' },  // Answer
    { right: '0', bottom: '0', width: '43%', height: '48%' }, // Check
    { left: '0', bottom: '0', width: '54%', height: '48%' }   // 4th item
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {layoutItems.map((item, idx) => {
        const isFeatured = idx === 0;
        const pos = positions[idx];
        const color = item.color || '#3b82f6';
        const padding = isFeatured ? '28px 24px' : '20px 24px';
        const titleSize = isFeatured ? 24 : 20;
        const contentSize = isFeatured ? 18 : 16;

        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              ...pos,
              background: isFeatured ? 'rgba(15, 23, 42, 0.45)' : 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20,
              padding,
              display: 'flex', flexDirection: 'column', gap: isFeatured ? 10 : 8,
              boxShadow: SHADOW_SOFT,
            }}
          >
            <div style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: 3, opacity: 0.7 }}>
              {(item as any).label_en ? (item as any).label_en.toUpperCase() : item.label.toUpperCase()}
            </div>
            <div style={{ fontSize: titleSize, fontWeight: 800, color, display: isFeatured ? 'flex' : undefined, alignItems: 'center', gap: 8 }}>
              {isFeatured && <div style={{ width: 4, height: 18, background: color, borderRadius: 2 }} />}
              {item.label}
            </div>
            <div style={{ fontSize: contentSize, color: '#d1d5db', lineHeight: 1.45, flex: 1, overflow: 'hidden' }}>
              {highlightText(item.content, color)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// HTML Renderer - 使用可靠的 Flexbox + 绝对定位布局
export function renderEduQACaseLayoutHTML(model: EduQACaseModel, theme: ThemeConfig): string {
  const data = normalizeModel(model);
  const isVariantB = data.variant === 'b';

  const background = `radial-gradient(circle at 15% 15%, rgba(6,182,212,0.12) 0%, transparent 50%), radial-gradient(circle at 85% 85%, rgba(59,130,246,0.15) 0%, transparent 50%), linear-gradient(135deg, #0b1120 0%, #051937 100%)`;

  let contentHTML = '';
  if (isVariantB) {
    const items = data.items.slice(0, 4);
    // Check if the 4th card is a true "more/延伸" overflow card
    const lastItem = items[items.length - 1];
    const hasMoreCard = lastItem && (lastItem.label === '延伸' || lastItem.label_en === 'More');

    if (hasMoreCard) {
      // 3-row layout: Q+A+check in 2x2 grid, "more" card at bottom full width
      const featured = items[0];
      const answer = items[1];
      const check = items[2];
      const more = items[3];

      contentHTML = `
      <div style="position:relative;width:100%;height:100%;">
        <!-- Featured (Q) - Left Column -->
        <div style="position:absolute;left:0;top:0;width:54%;height:64%;background:rgba(15, 23, 42, 0.45);border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:28px 24px;display:flex;flex-direction:column;gap:10px;box-shadow:0 16px 40px rgba(0,0,0,0.45);">
          <div style="position:absolute;top:0;left:15%;right:15%;height:1.2px;background:linear-gradient(90deg,transparent,${featured.color || '#3b82f6'}66,transparent);"></div>
          <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:3px;opacity:0.7;">${featured.label.toUpperCase()}</div>
          <div style="font-size:24px;font-weight:800;color:${featured.color || '#3b82f6'};display:flex;align-items:center;gap:8px;">
            <div style="width:4px;height:18px;background:${featured.color || '#3b82f6'};border-radius:2px;"></div>
            ${featured.label}
          </div>
          <div style="font-size:18px;color:#d1d5db;line-height:1.45;flex:1;overflow:hidden;">${featured.content}</div>
        </div>

        <!-- Answer - Top Right -->
        <div style="position:absolute;right:0;top:0;width:43%;height:31%;background:rgba(15, 23, 42, 0.65);border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:20px 24px;display:flex;flex-direction:column;gap:8px;box-shadow:0 16px 40px rgba(0,0,0,0.45);">
          <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:3px;opacity:0.7;">${answer.label.toUpperCase()}</div>
          <div style="font-size:20px;font-weight:800;color:${answer.color || '#3b82f6'};">${answer.label}</div>
          <div style="font-size:16px;color:#d1d5db;line-height:1.45;flex:1;overflow:hidden;">${answer.content}</div>
        </div>

        <!-- Check - Bottom Right -->
        <div style="position:absolute;right:0;top:33%;width:43%;height:31%;background:rgba(15, 23, 42, 0.65);border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:20px 24px;display:flex;flex-direction:column;gap:8px;box-shadow:0 16px 40px rgba(0,0,0,0.45);">
          <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:3px;opacity:0.7;">${check.label.toUpperCase()}</div>
          <div style="font-size:20px;font-weight:800;color:${check.color || '#3b82f6'};">${check.label}</div>
          <div style="font-size:16px;color:#d1d5db;line-height:1.45;flex:1;overflow:hidden;">${check.content}</div>
        </div>

        <!-- More - Bottom Full Width -->
        <div style="position:absolute;left:0;bottom:0;width:100%;height:32%;background:rgba(15, 23, 42, 0.65);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:16px 24px;display:flex;flex-direction:column;gap:6px;box-shadow:0 16px 40px rgba(0,0,0,0.45);">
          <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:3px;opacity:0.7;">${more.label.toUpperCase()}</div>
          <div style="font-size:17px;font-weight:800;color:${more.color || '#3b82f6'};">${more.label}</div>
          <div style="font-size:15px;color:#d1d5db;line-height:1.45;flex:1;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;">${more.content}</div>
        </div>
      </div>`;
    } else {
      // Standard 2x2 grid using absolute positioning for reliability
      const positions = [
        { left: '0', top: '0', width: '54%', height: '48%' },    // Featured
        { right: '0', top: '0', width: '43%', height: '48%' },  // Answer
        { right: '0', bottom: '0', width: '43%', height: '48%' }, // Check
        { left: '0', bottom: '0', width: '54%', height: '48%' }  // 4th item
      ];

      contentHTML = `<div style="position:relative;width:100%;height:100%;">` +
        items.map((item, idx) => {
          const isFeatured = idx === 0;
          const pos = positions[idx];
          const color = item.color || '#3b82f6';
          const padding = isFeatured ? '28px 24px' : '20px 24px';
          const titleSize = isFeatured ? '24px' : '20px';
          const contentSize = isFeatured ? '18px' : '16px';

          return `
          <div style="position:absolute;${Object.entries(pos).map(([k,v]) => `${k}:${v};`).join('')}background:${isFeatured ? 'rgba(15, 23, 42, 0.45)' : 'rgba(15, 23, 42, 0.65)'};border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:${padding};display:flex;flex-direction:column;gap:${isFeatured ? '10px' : '8px'};box-shadow:0 16px 40px rgba(0,0,0,0.45);">
            <div style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:3px;opacity:0.7;">${item.label.toUpperCase()}</div>
            <div style="font-size:${titleSize};font-weight:800;color:${color};${isFeatured ? 'display:flex;align-items:center;gap:8px;' : ''}">
              ${isFeatured ? `<div style="width:4px;height:18px;background:${color};border-radius:2px;"></div>` : ''}
              ${item.label}
            </div>
            <div style="font-size:${contentSize};color:#d1d5db;line-height:1.45;flex:1;overflow:hidden;">${item.content}</div>
          </div>`;
        }).join('') +
      `</div>`;
    }
  } else {
    // Variant A - Q&A Cards layout
    contentHTML = `<div style="position:relative;max-width:1040px;margin:0 auto;width:100%;height:100%;">
      <div style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;">
        <svg width="1040" height="400" viewBox="0 0 1040 400" fill="none"><path d="M 250 120 Q 520 250 790 380" stroke="white" stroke-opacity="0.08" stroke-width="1" stroke-dasharray="4 6" /></svg>
      </div>
      <div style="display:flex;flex-direction:column;gap:32px;z-index:5;position:relative;height:100%;justify-content:center;">
      ${data.items.slice(0, 3).map((item, idx) => {
        const isQuestion = item.label.toUpperCase() === 'Q' || item.label.includes('问');
        const color = item.color || (isQuestion ? '#06b6d3' : '#10b981');
        return `
          <div style="align-self:${isQuestion ? 'flex-start' : 'flex-end'};margin-left:${isQuestion ? '-20px' : '0'};margin-right:${isQuestion ? '0' : '-20px'};max-width:${isQuestion ? '70%' : '80%'};position:relative;">
            <div style="position:absolute;top:0;left:10%;right:10%;height:1.2px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);z-index:11;"></div>
            <div style="position:absolute;top:-16px;${isQuestion ? 'left' : 'right'}:-16px;width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg, ${color}, #051937);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:900;z-index:12;box-shadow:0 4px 12px rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.3);">${item.label[0]}</div>
            <div style="background:${isQuestion ? 'rgba(30, 41, 59, 0.5)' : 'rgba(6, 182, 211, 0.12)'};backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid ${isQuestion ? 'rgba(255,255,255,0.1)' : 'rgba(6, 182, 211, 0.25)'};box-shadow:0 16px 40px rgba(0,0,0,0.45);border-radius:20px;padding:20px 28px;color:${isQuestion ? '#cbd5e1' : '#ffffff'};font-size:20px;line-height:1.5;overflow:hidden;">${item.content}</div>
          </div>`;
      }).join('')}
      </div>
    </div>`;
  }

  return `
<section style="width:1280px;height:720px;padding:44px 72px;box-sizing:border-box;position:relative;overflow:hidden;font-family:sans-serif;background:${background};display:flex;flex-direction:column;">
  <div style="position:absolute;top:25%;left:40%;width:3px;height:3px;border-radius:50%;background:#06b6d3;filter:blur(1.5px);opacity:0.5;"></div>
  
  <div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid rgba(6,182,212,0.2);padding-bottom:20px;margin-bottom:32px;flex-shrink:0;">
    <div style="display:flex;align-items:center;">
      <div style="width:10px;height:10px;border-radius:50%;margin-right:18px;background:#06b6d3;box-shadow:0 0 15px #06b6d3;"></div>
      <h2 style="margin:0;color:#ffffff;font-size:44px;font-weight:700;">${data.title}</h2>
    </div>
    ${data.subtitle ? `<div style="color:#93c5fd;font-size:18px;letter-spacing:3px;text-transform:uppercase;opacity:0.7;">${data.subtitle}</div>` : ''}
  </div>
  <div style="flex-grow:1;display:flex;flex-direction:column;justify-content:flex-start;min-height:0;">
    ${contentHTML}
  </div>
</section>`;
}

export default EduQACaseLayout;
