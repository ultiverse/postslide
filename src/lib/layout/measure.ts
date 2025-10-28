import type { TextStyle } from '@/lib/types/design';

export interface MeasureInput {
  text: string;
  style: TextStyle;
  maxWidth: number; // content box width in px
}

export interface Line {
  text: string;
  width: number;
  ascent: number;
  descent: number;
}

export interface MeasureOutput {
  lines: Line[];
  lineHeight: number;
  totalHeight: number;
}

/**
 * Creates a memoized text measurer using an offscreen canvas.
 * Improvement: Reuses single canvas instance for performance.
 */
export function createMeasurer(): (input: MeasureInput) => MeasureOutput {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

  return ({ text, style, maxWidth }) => {
    // Set font with proper formatting
    ctx.font = `${style.fontWeight} ${style.fontSize}px ${style.fontFamily}`;

    // Handle empty text
    if (!text || text.trim() === '') {
      return {
        lines: [],
        lineHeight: style.lineHeight,
        totalHeight: 0,
      };
    }

    // Tokenize text while preserving whitespace
    const words = tokenize(text);
    const lines: Line[] = [];
    let current = '';

    for (const word of words) {
      const candidate = current ? current + word : word;
      const width = ctx.measureText(candidate).width;

      // If line exceeds maxWidth and we have content, wrap
      if (width > maxWidth && current) {
        lines.push(makeLine(ctx, current));
        current = word.trimStart();
      } else {
        current = candidate;
      }
    }

    // Add remaining text
    if (current) {
      lines.push(makeLine(ctx, current));
    }

    const lineHeight = style.lineHeight;
    const totalHeight = lines.length * lineHeight;

    return { lines, lineHeight, totalHeight };
  };
}

/**
 * Tokenizes text by whitespace while preserving delimiters.
 * Improvement: Better handling of multiple spaces and edge cases.
 */
function tokenize(text: string): string[] {
  // Split on whitespace boundaries but keep the whitespace
  return text.split(/(\s+)/g).filter(t => t.length > 0);
}

/**
 * Creates a measured line with typography metrics.
 */
function makeLine(ctx: CanvasRenderingContext2D, text: string): Line {
  const metrics = ctx.measureText(text);
  const ascent = metrics.actualBoundingBoxAscent ?? 0;
  const descent = metrics.actualBoundingBoxDescent ?? 0;

  return {
    text,
    width: metrics.width,
    ascent,
    descent,
  };
}
