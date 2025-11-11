/* eslint-disable react-refresh/only-export-components */
import type { Template, Slide, Brand } from '@/types/domain';
import { renderSlideFromSchema } from '@/lib/layouts';
import { DEFAULT_LIGHT_THEME, DEFAULT_DARK_THEME } from '@/lib/theme';
import { createMinimalProSchema, minimalProSchema } from './schema';
import { PreviewBlock } from './PreviewBlock';

// Export types
export * from './types';

// Export components
export { MinimalProLayout } from './MinimalProLayout';
export { TextBlock } from './TextBlock';
export { BulletBlock } from './BulletBlock';
export { PreviewBlock } from './PreviewBlock';

// Export schema
export { createMinimalProSchema, minimalProSchema } from './schema';

/**
 * Minimal Pro Template
 *
 * A clean, professional template emphasizing readability with generous spacing.
 * Features strong contrast, consistent typography, and position-aware decorators.
 */
export const minimalPro: Template = {
  id: 'minimal-pro',
  name: 'Minimal Pro',
  description: 'Clean, professional layout with vertical block stacking and generous spacing',
  schema: minimalProSchema,
  theme: DEFAULT_LIGHT_THEME,
  themeVariants: {
    light: DEFAULT_LIGHT_THEME,
    dark: DEFAULT_DARK_THEME,
  },
  layout: (slide: Slide, brand: Brand, slideIndex?: number, totalSlides?: number, onBlockClick?: (blockId: string) => void) => {
    // Create schema with brand-aware colors
    const brandedSchema = createMinimalProSchema(brand);

    // Use schema-driven renderer
    return renderSlideFromSchema(brandedSchema, slide, brand, minimalPro, slideIndex, totalSlides, onBlockClick);
  },
  preview: () => <PreviewBlock />,
  defaults: {
    // Note: IDs will be generated when blocks are actually created
    blocks: [
      { id: 'temp-1', kind: 'title', text: 'Your Title Here' },
      { id: 'temp-2', kind: 'body', text: 'Start writing your content...' },
    ],
  },
  coverStyle: 'title-heavy',
};
