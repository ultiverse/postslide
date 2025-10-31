import type { SlideBlock, TextBlock, ImageBlock, BackgroundBlock, DecorativeBlock } from '@/types/domain';

/**
 * Block Default Values
 *
 * Centralized defaults for creating new blocks.
 * Each block type has sensible defaults that can be customized after creation.
 */

export const DEFAULT_TEXT_BLOCKS = {
  title: (): TextBlock => ({
    id: crypto.randomUUID(),
    kind: 'title',
    text: '',
  }),
  subtitle: (): TextBlock => ({
    id: crypto.randomUUID(),
    kind: 'subtitle',
    text: '',
  }),
  body: (): TextBlock => ({
    id: crypto.randomUUID(),
    kind: 'body',
    text: '',
  }),
  bullets: (): TextBlock => ({
    id: crypto.randomUUID(),
    kind: 'bullets',
    bullets: [''],
  }),
} as const;

export const DEFAULT_IMAGE_BLOCK = (): ImageBlock => ({
  id: crypto.randomUUID(),
  kind: 'image',
  src: '',
  alt: '',
  fit: 'cover',
  // position: undefined - can be set by template or user
});

export const DEFAULT_BACKGROUND_BLOCKS = {
  solid: (): BackgroundBlock => ({
    id: crypto.randomUUID(),
    kind: 'background',
    style: 'solid',
    color: '#ffffff',
    opacity: 1,
  }),
  gradient: (): BackgroundBlock => ({
    id: crypto.randomUUID(),
    kind: 'background',
    style: 'gradient',
    gradient: {
      from: '#4a67ff',
      to: '#7c3aed',
      direction: 'to-br',
    },
    opacity: 1,
  }),
  image: (): BackgroundBlock => ({
    id: crypto.randomUUID(),
    kind: 'background',
    style: 'image',
    image: '',
    opacity: 0.3,
  }),
} as const;

export const DEFAULT_DECORATIVE_BLOCKS = {
  arrow: (): DecorativeBlock => ({
    id: crypto.randomUUID(),
    kind: 'decorative',
    variant: 'arrow',
    props: {
      direction: 'right',
      size: 48,
      color: '#000000',
    },
  }),
  divider: (): DecorativeBlock => ({
    id: crypto.randomUUID(),
    kind: 'decorative',
    variant: 'divider',
    props: {
      thickness: 2,
      color: '#e5e7eb',
      style: 'solid',
    },
  }),
  accent: (): DecorativeBlock => ({
    id: crypto.randomUUID(),
    kind: 'decorative',
    variant: 'accent',
    props: {
      type: 'bar', // bar, circle, underline
      color: '#4a67ff',
    },
  }),
  shape: (): DecorativeBlock => ({
    id: crypto.randomUUID(),
    kind: 'decorative',
    variant: 'shape',
    props: {
      shape: 'circle', // circle, square, triangle
      size: 100,
      fill: '#4a67ff',
      stroke: 'none',
    },
  }),
  icon: (): DecorativeBlock => ({
    id: crypto.randomUUID(),
    kind: 'decorative',
    variant: 'icon',
    props: {
      name: 'star', // Icon name/identifier
      size: 64,
      color: '#4a67ff',
    },
  }),
} as const;

/**
 * Create a new block with default values
 */
export function createBlock(kind: SlideBlock['kind'], variant?: string): SlideBlock {
  switch (kind) {
    case 'title':
    case 'subtitle':
    case 'body':
      return DEFAULT_TEXT_BLOCKS[kind]();
    case 'bullets':
      return DEFAULT_TEXT_BLOCKS.bullets();
    case 'image':
      return DEFAULT_IMAGE_BLOCK();
    case 'background':
      return variant && variant in DEFAULT_BACKGROUND_BLOCKS
        ? DEFAULT_BACKGROUND_BLOCKS[variant as keyof typeof DEFAULT_BACKGROUND_BLOCKS]()
        : DEFAULT_BACKGROUND_BLOCKS.solid();
    case 'decorative':
      return variant && variant in DEFAULT_DECORATIVE_BLOCKS
        ? DEFAULT_DECORATIVE_BLOCKS[variant as keyof typeof DEFAULT_DECORATIVE_BLOCKS]()
        : DEFAULT_DECORATIVE_BLOCKS.divider();
    default:
      throw new Error(`Unknown block kind: ${kind}`);
  }
}

/**
 * Check if a block is editable (has user-editable content)
 */
export function isEditableBlock(block: SlideBlock): block is TextBlock {
  return (
    block.kind === 'title' ||
    block.kind === 'subtitle' ||
    block.kind === 'body' ||
    block.kind === 'bullets'
  );
}

/**
 * Check if a block is a text block
 */
export function isTextBlock(block: SlideBlock): block is TextBlock {
  return isEditableBlock(block);
}

/**
 * Check if a block is a visual block (image, background, decorative)
 */
export function isVisualBlock(block: SlideBlock): boolean {
  return block.kind === 'image' || block.kind === 'background' || block.kind === 'decorative';
}
