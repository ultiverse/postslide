import type { TextStyle } from '@/lib/types/design';
import { createMeasurer } from './measure';

export interface BulletLayoutInput {
  items: string[];
  style: TextStyle;
  frameWidth: number;
  bullet: {
    marker: string;
    gap: number;
    indent: number;
    markerSizeRatio?: number;
  };
}

export interface BulletLine {
  text: string;
  xOffset: number; // indent x for wrapped lines
  isFirstLine: boolean; // true if this is the first line of a bullet item
  marker?: string; // marker to render (only on first line)
}

export interface BulletLayoutOutput {
  lines: BulletLine[];
  totalHeight: number;
}

/**
 * Layouts bulleted lists with hanging indents.
 * Improvement: Better handling of marker placement and multi-line wrapping.
 */
export function layoutBullets(input: BulletLayoutInput): BulletLayoutOutput {
  const measure = createMeasurer();
  const lines: BulletLine[] = [];
  let total = 0;
  const lh = input.style.lineHeight;

  // Calculate available width for text (after marker + gap)
  const textWidth = input.frameWidth - input.bullet.indent;

  for (const item of input.items) {
    if (!item || item.trim() === '') {
      // Empty bullet - just add spacing
      lines.push({
        text: '',
        xOffset: input.bullet.indent,
        isFirstLine: true,
        marker: input.bullet.marker,
      });
      total += lh;
      continue;
    }

    // Measure the item text with available width
    const wrapped = measure({
      text: item,
      style: input.style,
      maxWidth: textWidth,
    });

    // Add each line with appropriate indentation
    wrapped.lines.forEach((ln, idx) => {
      lines.push({
        text: ln.text,
        xOffset: input.bullet.indent, // All lines use same indent for hanging
        isFirstLine: idx === 0,
        marker: idx === 0 ? input.bullet.marker : undefined,
      });
    });

    total += wrapped.lines.length * lh;
  }

  return { lines, totalHeight: total };
}
