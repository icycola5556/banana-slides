import type { LayoutId } from '@/types';
import type { ThemeConfig } from '@/experimental/html-renderer/types/schema';
import { resolveThemeLayout } from '@/experimental/html-renderer/layouts';

export type HtmlImageSlotRole = 'main' | 'left' | 'right' | 'background';

export interface HtmlImageSlotDescriptor {
  slotPath: string;
  slotRole: HtmlImageSlotRole;
  src: string;
}

interface CollectHtmlImageSlotDescriptorsOptions {
  optionalImageEnabled?: boolean;
  inferTwoColumnPartType: (
    part: Record<string, unknown> | undefined
  ) => 'text' | 'image' | 'bullets';
  theme?: ThemeConfig | null;
  variantId?: string;
}

const PLACEHOLDER_IMAGE_SOURCE_RE = /^https?:\/\/(?:[\w-]+\.)*example\.(?:com|org|net)(?:[/?#:]|$)/i;
const USER_MANAGED_IMAGE_SOURCE_RE = /^(?:data:image\/|blob:|\/files\/|https?:\/\/[^/]+\/files\/)/i;

const IMAGE_URL_FIELD_NAMES = new Set(['background_image', 'hero_image', 'image_src']);

export const isPlaceholderImageSource = (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  const text = value.trim();
  if (!text) return false;
  return PLACEHOLDER_IMAGE_SOURCE_RE.test(text);
};

export const normalizeImageSource = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  const text = value.trim();
  if (!text || isPlaceholderImageSource(text)) {
    return '';
  }
  return text;
};

export const isUserManagedImageSource = (value: unknown): boolean => {
  const normalized = normalizeImageSource(value);
  if (!normalized) {
    return false;
  }
  return USER_MANAGED_IMAGE_SOURCE_RE.test(normalized);
};

export const normalizeSlotImageSourceForTheme = (
  value: unknown,
  slotPath: string,
  theme?: ThemeConfig | null
): string => {
  const normalized = normalizeImageSource(value);
  if (!normalized) {
    return '';
  }

  void theme;

  // First preview should show empty content slots across every theme.
  // Only user-managed sources (uploaded/generated and persisted by us)
  // are allowed to occupy image slots by default.
  if (
    slotPath !== 'background_image'
    && !isUserManagedImageSource(normalized)
  ) {
    return '';
  }

  return normalized;
};

export const sanitizeHtmlModelImageSources = <T>(model: T): T => {
  const visit = (value: unknown, key?: string, parentKey?: string): unknown => {
    if (Array.isArray(value)) {
      return value.map((item) => visit(item));
    }

    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const cloned: Record<string, unknown> = {};
      Object.entries(record).forEach(([childKey, childValue]) => {
        cloned[childKey] = visit(childValue, childKey, key);
      });
      return cloned;
    }

    const shouldNormalize =
      IMAGE_URL_FIELD_NAMES.has(key || '')
      || (key === 'src' && parentKey === 'image');

    if (!shouldNormalize) {
      return value;
    }

    return normalizeImageSource(value);
  };

  return visit(model) as T;
};

export const sanitizeThemeImageSlotSources = <T>(model: T, theme?: ThemeConfig | null): T => {
  const visit = (value: unknown, key?: string, parentKey?: string): unknown => {
    if (Array.isArray(value)) {
      return value.map((item) => visit(item));
    }

    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const cloned: Record<string, unknown> = {};
      Object.entries(record).forEach(([childKey, childValue]) => {
        cloned[childKey] = visit(childValue, childKey, key);
      });
      return cloned;
    }

    const slotPath =
      key === 'image_src'
        ? 'image_src'
        : key === 'hero_image'
          ? 'hero_image'
        : key === 'src' && parentKey === 'image'
          ? 'image.src'
          : null;

    if (slotPath) {
      return normalizeSlotImageSourceForTheme(value, slotPath, theme);
    }

    const shouldNormalize =
      IMAGE_URL_FIELD_NAMES.has(key || '')
      || (key === 'src' && parentKey === 'image');

    if (!shouldNormalize) {
      return value;
    }

    return normalizeImageSource(value);
  };

  return visit(model) as T;
};

export const collectHtmlImageSlotDescriptors = (
  layoutId: LayoutId,
  model: Record<string, any>,
  options: CollectHtmlImageSlotDescriptorsOptions
): HtmlImageSlotDescriptor[] => {
  const descriptors: HtmlImageSlotDescriptor[] = [];
  const variantId = String(options.variantId || model?.layout_variant || model?.variant || 'a').trim().toLowerCase();
  const resolved = options.theme
    ? resolveThemeLayout(layoutId, model as any, options.theme)
    : { layoutId, model };
  const resolvedLayoutId = resolved.layoutId;
  const resolvedModel = (resolved.model || {}) as Record<string, any>;
  const slotLayoutId =
    layoutId === 'vocational_comparison'
      && resolvedLayoutId !== layoutId
      && (resolvedLayoutId === 'vocational_content' || resolvedLayoutId === 'vocational_bullets')
      ? resolvedLayoutId
      : layoutId;

  const push = (
    slotPath: string,
    src: unknown,
    slotRole: HtmlImageSlotRole = 'main'
  ) => {
    descriptors.push({
      slotPath,
      slotRole,
      src: normalizeSlotImageSourceForTheme(src, slotPath, options.theme),
    });
  };

  const hasExplicitImageField = Boolean(
    (model?.image && typeof model.image === 'object')
    || Object.prototype.hasOwnProperty.call(model || {}, 'image_src')
    || Object.prototype.hasOwnProperty.call(model || {}, 'image_alt')
  );

  switch (resolvedLayoutId) {
    case 'blueprint_annotation': {
      const usesDetailImageSlot =
        layoutId === 'detail_zoom'
        || layoutId === 'image_full';
      const slotPath = usesDetailImageSlot ? 'image_src' : 'image.src';
      const slotSrc = usesDetailImageSlot
        ? model?.image_src ?? resolvedModel?.image_src
        : model?.image?.src ?? resolvedModel?.image?.src;
      push(slotPath, slotSrc, 'main');
      return descriptors;
    }
    case 'blueprint_gallery': {
      const items = Array.isArray(model?.items)
        ? model.items.slice(0, 3)
        : Array.isArray(resolvedModel?.items)
          ? resolvedModel.items.slice(0, 3)
          : [];
      items.forEach((item: Record<string, unknown>, index: number) => {
        push(`items.${index}.image_src`, item?.image_src, 'main');
      });
      return descriptors;
    }
    default:
      break;
  }

  switch (slotLayoutId) {
    case 'edu_cover':
      if (variantId !== 'b') {
        push('hero_image', model?.hero_image, 'main');
      }
      break;
    case 'image_full':
    case 'detail_zoom':
    case 'vocational_blueprint_zoom':
      push('image_src', model?.image_src, 'main');
      break;
    case 'two_column': {
      const left = model?.left as Record<string, unknown> | undefined;
      const right = model?.right as Record<string, unknown> | undefined;
      if (options.inferTwoColumnPartType(left) === 'image') {
        push('left.image_src', left?.image_src, 'left');
      }
      if (options.inferTwoColumnPartType(right) === 'image') {
        push('right.image_src', right?.image_src, 'right');
      }
      break;
    }
    case 'vocational_comparison': {
      const left = model?.left as Record<string, unknown> | undefined;
      const right = model?.right as Record<string, unknown> | undefined;
      if (options.inferTwoColumnPartType(left) === 'image') {
        push('left.image_src', left?.image_src, 'left');
      }
      if (options.inferTwoColumnPartType(right) === 'image') {
        push('right.image_src', right?.image_src, 'right');
      }

      const hasSharedVisualField = Boolean(
        (model?.image && typeof model.image === 'object')
        || Object.prototype.hasOwnProperty.call(model || {}, 'image_src')
        || Object.prototype.hasOwnProperty.call(model || {}, 'image_alt')
      );

      if (options.optionalImageEnabled || hasSharedVisualField) {
        const imageSrc = model?.image?.src ?? model?.image_src;
        push('image.src', imageSrc, 'main');
      }
      break;
    }
    case 'title_content':
    case 'vocational_content':
    case 'title_bullets':
    case 'vocational_bullets':
    case 'process_steps':
      // 当 optionalImageEnabled 为 true 时添加插槽（包括空的占位符）
      // 因为即使 src 为空，也可能需要通过批量生成功能填充
      if (options.optionalImageEnabled || hasExplicitImageField) {
        const imageSrc = model?.image?.src ?? model?.image_src;
        push('image.src', imageSrc, 'main');
      }
      break;
    case 'portfolio': {
      const items = Array.isArray(model?.items) ? model.items : [];
      items.forEach((item: Record<string, unknown>, index: number) => {
        push(`items.${index}.image_src`, item?.image_src, 'main');
      });
      break;
    }
    default:
      break;
  }

  return descriptors;
};
