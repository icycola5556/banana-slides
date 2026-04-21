import layoutSchemeManifestJson from '@/data/layoutSchemeManifest.json';

export interface LayoutSchemeManifestEntry {
  canonical_layout_ids: string[];
  preview_layout_ids?: string[];
  role_layouts: {
    cover: string;
    toc: string;
    ending: string;
  };
}

export type LayoutSchemeManifest = Record<string, LayoutSchemeManifestEntry>;

export const layoutSchemeManifest = layoutSchemeManifestJson as LayoutSchemeManifest;

export const getCanonicalLayoutIds = (schemeId: string): string[] =>
  layoutSchemeManifest[schemeId]?.canonical_layout_ids ?? [];

export const getPreviewLayoutIds = (schemeId: string): string[] => {
  const manifestEntry = layoutSchemeManifest[schemeId];
  return manifestEntry?.preview_layout_ids ?? manifestEntry?.canonical_layout_ids ?? [];
};

export const getRoleLayoutIds = (
  schemeId: string
): LayoutSchemeManifestEntry['role_layouts'] | undefined =>
  layoutSchemeManifest[schemeId]?.role_layouts;
