import type { ArtboardSpec } from '@/lib/types/design';

export function contentRect(spec: ArtboardSpec) {
  const s = spec.safeInset;
  return { x: s, y: s, w: spec.width - 2 * s, h: spec.height - 2 * s };
}

export function isOverflow(contentHeight: number, frameHeight: number) {
  return contentHeight > frameHeight;
}
