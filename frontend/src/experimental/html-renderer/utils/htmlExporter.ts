/**
 * HTML导出工具
 * 生成符合HTML转PPT规范的完整HTML文档
 */

import { PPTDocument, ThemeConfig } from '../types/schema';

type ImageSourceResolver = (url: string) => Promise<string>;

const INLINEABLE_IMAGE_FIELDS = new Set([
  'background_image',
  'diagram_url',
  'hero_image',
  'image',
  'image_src',
]);

const shouldInlineImageSource = (key?: string, parentKey?: string): boolean => {
  if (!key) {
    return false;
  }

  return INLINEABLE_IMAGE_FIELDS.has(key) || (key === 'src' && parentKey === 'image');
};

/**
 * 生成完整的HTML文档
 * 符合HTML转PPT的结构要求
 */
export function generateHTMLDocument(
  slidesHTML: string[],
  theme: ThemeConfig,
  document?: PPTDocument
): string {
  const { slideWidth, slideHeight } = theme.sizes;

  const title = document?.ppt_meta?.title || 'PPT Preview';

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="ppt-size" content="width=${slideWidth},height=${slideHeight}">
  <title>${escapeHtml(title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,700;1,400&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
  <script>
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
        displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
      },
      startup: {
        typeset: true
      }
    };
  </script>
  <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</head>
<body style="margin:0; padding:0; background-color:#f0f0f0;">
${slidesHTML.join('\n\n')}
</body>
</html>`;
}

/**
 * HTML转义
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * 下载HTML文件
 */
export function downloadHTML(html: string, filename: string = 'presentation.html'): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 复制HTML到剪贴板
 */
export async function copyHTMLToClipboard(html: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(html);
    return true;
  } catch (err) {
    console.error('复制失败:', err);
    return false;
  }
}

/**
 * 将图片URL转换为Base64
 * 用于确保HTML文件自包含
 */
export async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('图片转Base64失败:', err);
    return url; // 失败时返回原URL
  }
}

/**
 * 将File对象转换为Base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert image-like fields inside a layout model to self-contained data URLs.
 */
export async function inlineModelImageSources<T>(
  model: T,
  resolveImageSource: ImageSourceResolver = imageUrlToBase64
): Promise<T> {
  const cache = new Map<string, Promise<string>>();

  const inlineSource = (value: string): Promise<string> => {
    const normalized = value.trim();
    if (!normalized || normalized.startsWith('data:image/')) {
      return Promise.resolve(normalized);
    }

    if (!cache.has(normalized)) {
      cache.set(
        normalized,
        resolveImageSource(normalized).catch(() => normalized)
      );
    }

    return cache.get(normalized)!;
  };

  const visit = async (value: unknown, key?: string, parentKey?: string): Promise<unknown> => {
    if (Array.isArray(value)) {
      return Promise.all(value.map((item) => visit(item)));
    }

    if (value && typeof value === 'object') {
      const entries = await Promise.all(
        Object.entries(value as Record<string, unknown>).map(async ([childKey, childValue]) => (
          [childKey, await visit(childValue, childKey, key)] as const
        ))
      );
      return Object.fromEntries(entries);
    }

    if (typeof value === 'string' && shouldInlineImageSource(key, parentKey)) {
      return inlineSource(value);
    }

    return value;
  };

  return visit(model) as Promise<T>;
}

/**
 * Inline image sources for every page payload before exporting standalone HTML.
 */
export async function inlinePagePayloadModels<T extends { model: unknown }>(
  pages: T[],
  resolveImageSource: ImageSourceResolver = imageUrlToBase64
): Promise<T[]> {
  const cache = new Map<string, Promise<string>>();
  const cachedResolver: ImageSourceResolver = async (url: string) => {
    if (!cache.has(url)) {
      cache.set(url, resolveImageSource(url).catch(() => url));
    }
    return cache.get(url)!;
  };

  return Promise.all(
    pages.map(async (page) => ({
      ...page,
      model: await inlineModelImageSources(page.model, cachedResolver),
    }))
  );
}
