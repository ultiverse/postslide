import type { TextBlock } from '@/types/domain';
import type { TextStyle } from '@/lib/types/design';

/**
 * Frame represents the position and dimensions of a rendered block
 */
export type Frame = {
  x: number;
  y: number;
  w: number;
  h: number;
};

/**
 * TextLayout represents the measured layout of text content
 */
export type TextLayout = {
  lines: Array<{ text: string; xOffset?: number; marker?: string }>;
  totalHeight: number;
};

/**
 * RenderedTextBlock represents a text block with its calculated layout and position
 */
export type RenderedTextBlock = {
  type: 'text';
  block: TextBlock;
  style: TextStyle;
  layout: TextLayout;
  frame: Frame;
  overflow: boolean;
};

/**
 * RenderedImageBlock represents an image block with its calculated position
 */
export type RenderedImageBlock = {
  type: 'image';
  block: { kind: 'image'; id: string; src: string; width?: number; height?: number };
  frame: Frame;
};

/**
 * RenderedBlock is a union of all possible rendered block types
 */
export type RenderedBlock = RenderedTextBlock | RenderedImageBlock;
