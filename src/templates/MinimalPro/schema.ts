import type { TemplateSchema, Brand } from '@/types/domain';

/**
 * Minimal Pro Template Schema (Factory Function)
 *
 * Defines layouts, decorators, and visual configuration for the Minimal Pro template.
 * Takes brand configuration to apply brand primary color to decorators and progress bar.
 */
export function createMinimalProSchema(brand?: Brand): TemplateSchema {
  const primaryColor = brand?.primary || '#3b82f6';

  return {
    id: 'minimal-pro',
    name: 'Minimal Pro',
    description: 'Clean, professional layout with vertical block stacking and generous spacing',
    theme: {
      id: 'light',
      variants: ['light', 'dark'],
    },
    decorators: {
      // Navigation arrow on first slide (bottom-right, follows outer gutter)
      first: [
        {
          type: 'arrow',
          position: { anchor: 'bottom-right', offsetX: -80, offsetY: -80 },
          props: {
            direction: 'right',
            size: 120,
            color: primaryColor,
          },
        },
      ],
      // Navigation arrows on middle slides (both sides, follow outer gutter)
      middle: [
        {
          type: 'arrow',
          position: { anchor: 'bottom-left', offsetX: 80, offsetY: -80 },
          props: {
            direction: 'left',
            size: 120,
            color: primaryColor,
          },
        },
        {
          type: 'arrow',
          position: { anchor: 'bottom-right', offsetX: -80, offsetY: -80 },
          props: {
            direction: 'right',
            size: 120,
            color: primaryColor,
          },
        },
      ],
      // Back arrow on last slide (bottom-left, follows outer gutter)
      last: [
        {
          type: 'arrow',
          position: { anchor: 'bottom-left', offsetX: 80, offsetY: -80 },
          props: {
            direction: 'left',
            size: 120,
            color: primaryColor,
          },
        },
      ],
    },
    progressBar: {
      enabled: true,
      position: 'bottom',
      height: 4,
      startColor: primaryColor,
      endColor: '#8b5cf6',
      style: 'gradient',
    },
  layouts: [
    {
      id: 'list',
      kind: 'list',
      slots: [
        { id: 'title', type: 'text', style: 'h1' },
        { id: 'body', type: 'text', style: 'body' },
        { id: 'bullets', type: 'bullets', style: 'body' },
      ],
    },
    {
      id: 'title',
      kind: 'title',
      slots: [
        { id: 'title', type: 'text', style: 'h1' },
        { id: 'subtitle', type: 'text', style: 'h2' },
      ],
    },
    {
      id: 'two-col',
      kind: 'two-col',
      slots: [
        { id: 'title', type: 'text', style: 'h1' },
        { id: 'left-content', type: 'text', style: 'body' },
        { id: 'right-content', type: 'text', style: 'body' },
      ],
    },
    {
      id: 'stat',
      kind: 'stat',
      slots: [
        { id: 'number', type: 'text', style: 'h1' },
        { id: 'label', type: 'text', style: 'caption' },
        { id: 'context', type: 'text', style: 'body' },
      ],
    },
    {
      id: 'quote',
      kind: 'quote',
      slots: [
        { id: 'quote', type: 'text', style: 'h2' },
        { id: 'attribution', type: 'text', style: 'caption' },
      ],
    },
    {
      id: 'cover',
      kind: 'cover',
      slots: [
        { id: 'title', type: 'text', style: 'h1' },
        { id: 'subtitle', type: 'text', style: 'h2' },
        { id: 'background', type: 'image' },
      ],
    },
    {
      id: 'image-focus',
      kind: 'image-focus',
      slots: [
        { id: 'image', type: 'image' },
        { id: 'title', type: 'text', style: 'h2' },
        { id: 'caption', type: 'text', style: 'body' },
      ],
    },
    {
      id: 'comparison',
      kind: 'comparison',
      slots: [
        { id: 'title', type: 'text', style: 'h1' },
        { id: 'left-label', type: 'text', style: 'h2' },
        { id: 'left-content', type: 'bullets', style: 'body' },
        { id: 'right-label', type: 'text', style: 'h2' },
        { id: 'right-content', type: 'bullets', style: 'body' },
      ],
    },
    {
      id: 'timeline',
      kind: 'timeline',
      slots: [
        { id: 'title', type: 'text', style: 'h1' },
        { id: 'item-1', type: 'text', style: 'body' },
        { id: 'item-2', type: 'text', style: 'body' },
        { id: 'item-3', type: 'text', style: 'body' },
        { id: 'item-4', type: 'text', style: 'body' },
      ],
    },
    {
      id: 'section-break',
      kind: 'section-break',
      slots: [
        { id: 'title', type: 'text', style: 'h1' },
        { id: 'subtitle', type: 'text', style: 'h2' },
      ],
    },
  ],
  };
}

// Backward compatibility export
export const minimalProSchema = createMinimalProSchema();
