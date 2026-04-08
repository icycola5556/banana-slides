import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image as ImageIcon, Ruler } from 'lucide-react';

import type { ThemeConfig } from '../types/schema';

interface ImageSlotFrameProps {
  src?: string | null;
  alt?: string;
  theme: ThemeConfig;
  slotLabel?: string;
  slotHint?: string;
  onClick?: () => void;
  frameStyle?: React.CSSProperties;
  imageStyle?: React.CSSProperties;
  placeholderStyle?: React.CSSProperties;
}

export const ImageSlotFrame: React.FC<ImageSlotFrameProps> = ({
  src,
  alt,
  theme,
  slotLabel = '图片插槽',
  slotHint = '图片生成后会填充到这里',
  onClick,
  frameStyle,
  imageStyle,
  placeholderStyle,
}) => {
  const [loadFailed, setLoadFailed] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const frameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLoadFailed(false);
  }, [src]);

  useEffect(() => {
    const element = frameRef.current;
    if (!element) return;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setSize({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    };

    updateSize();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => updateSize());
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const showPlaceholder = !src || loadFailed;
  const sizeText = size.width > 0 && size.height > 0
    ? `${size.width} × ${size.height}px`
    : '尺寸加载中';

  const mergedFrameStyle = useMemo<React.CSSProperties>(() => ({
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...frameStyle,
  }), [frameStyle]);

  if (!showPlaceholder) {
    return (
      <div
        ref={frameRef}
        style={{
          ...mergedFrameStyle,
          cursor: onClick ? 'pointer' : 'default',
        }}
        onClick={onClick}
        title={onClick ? '点击替换图片' : slotHint}
        data-testid="image-slot-frame"
      >
        <img
          src={src || ''}
          alt={alt || ''}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
            ...imageStyle,
          }}
          onError={() => setLoadFailed(true)}
        />

        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            borderRadius: 999,
            background: 'rgba(15, 23, 42, 0.72)',
            color: '#ffffff',
            fontSize: 12,
            fontWeight: 700,
            boxShadow: '0 6px 16px rgba(15, 23, 42, 0.16)',
          }}
        >
          <ImageIcon size={14} />
          <span>{slotLabel}</span>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 10px',
            borderRadius: 999,
            background: 'rgba(15, 23, 42, 0.72)',
            color: '#E2E8F0',
            fontSize: 11,
            fontWeight: 600,
            boxShadow: '0 6px 16px rgba(15, 23, 42, 0.16)',
          }}
        >
          <Ruler size={12} />
          <span>{sizeText}</span>
        </div>

        {onClick ? (
          <div
            style={{
              position: 'absolute',
              insetInline: 0,
              bottom: 0,
              padding: '18px 16px 14px',
              background: 'linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.78) 100%)',
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                background: `${theme.colors.accent}22`,
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 700,
                border: `1px solid ${theme.colors.accent}55`,
              }}
            >
              点击替换图片
            </span>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      ref={frameRef}
      style={{
        ...mergedFrameStyle,
        background: `linear-gradient(135deg, ${theme.colors.backgroundAlt}, rgba(255,255,255,0.88))`,
        border: `2px dashed ${theme.colors.secondary}`,
        boxShadow: `inset 0 0 0 1px ${theme.colors.secondary}22`,
        cursor: onClick ? 'pointer' : 'default',
        ...placeholderStyle,
      }}
      onClick={onClick}
      title={onClick ? '点击上传图片' : slotHint}
      data-testid="image-slot-frame"
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.92)',
          color: theme.colors.primary,
          fontSize: 12,
          fontWeight: 700,
          boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)',
        }}
      >
        <ImageIcon size={14} />
        <span>{slotLabel}</span>
      </div>

      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.92)',
          color: theme.colors.textLight,
          fontSize: 11,
          fontWeight: 600,
          boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)',
        }}
      >
        <Ruler size={12} />
        <span>{sizeText}</span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          padding: '0 24px',
          textAlign: 'center',
          color: theme.colors.textLight,
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: `${theme.colors.secondary}16`,
            color: theme.colors.secondary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ImageIcon size={26} />
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: theme.colors.text }}>
          {loadFailed ? '图片加载失败，当前展示插槽位置' : '当前为图片插槽占位'}
        </div>
        <div style={{ fontSize: 12, lineHeight: 1.6, maxWidth: 320 }}>
          {slotHint}
        </div>
      </div>

      {onClick ? (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 14px',
            borderRadius: 999,
            background: `${theme.colors.accent}18`,
            color: theme.colors.accent,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          点击上传图片
        </div>
      ) : null}
    </div>
  );
};

export default ImageSlotFrame;
