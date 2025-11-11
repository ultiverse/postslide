/* eslint-disable react-refresh/only-export-components */
import type { ReactElement } from 'react';
import type { Slide, Brand, TemplateSchema, LayoutKind, Template, DecorativeBlock } from '@/types/domain';
import type { Theme } from '@/lib/types/design';
import type { LayoutProps } from './types';
import { TitleSlide } from './TitleSlide';
import { ListSlide } from './ListSlide';
import { TwoColSlide } from './TwoColSlide';
import { StatSlide } from './StatSlide';
import { QuoteSlide } from './QuoteSlide';
import { CoverSlide } from './CoverSlide';
import { ImageFocusSlide } from './ImageFocusSlide';
import { ComparisonSlide } from './ComparisonSlide';
import { TimelineSlide } from './TimelineSlide';
import { SectionBreakSlide } from './SectionBreakSlide';
// Unused imports removed - keeping for potential future use
// import { getLayoutTheme, themeDefinitionToTheme } from '@/lib/theme';
import { resolveDecorators, decoratorToBlock, createProgressBarDecorator } from '@/lib/decorators';

/**
 * Schema-driven layout renderer
 *
 * Renders a slide using a template schema definition.
 * This allows templates to be defined declaratively rather than imperatively.
 *
 * @param schema Template schema definition
 * @param slide Slide to render
 * @param brand Brand configuration
 * @param template Optional template for theme support
 * @param slideIndex Optional index of current slide (0-based)
 * @param totalSlides Optional total number of slides
 * @param onBlockClick Optional callback when a block is clicked
 */
export function renderSlideFromSchema(
  schema: TemplateSchema,
  slide: Slide,
  brand: Brand,
  template?: Template,
  slideIndex?: number,
  totalSlides?: number,
  onBlockClick?: (blockId: string) => void
): ReactElement {
  // Try to use the layoutId stored on the slide, otherwise use first layout
  let layout = slide.layoutId
    ? schema.layouts.find(l => l.id === slide.layoutId)
    : null;

  // Fallback to first layout if specific layout not found
  if (!layout) {
    layout = schema.layouts[0];
  }

  if (!layout) {
    throw new Error(`Template schema "${schema.id}" has no layouts defined`);
  }

  // DON'T pass a theme - let useLayoutTheme create it from the brand
  // This ensures brand colors are always applied
  // The template theme is mainly for typography and spacing, which are handled by defaults
  const theme: Theme | undefined = undefined;

  // Inject position-aware decorators if position info is available
  let enhancedSlide = slide;
  if (slideIndex !== undefined && totalSlides !== undefined && schema) {
    // Create a temporary template object with the branded schema
    // This ensures decorators use the current brand colors
    const brandedTemplate = template ? { ...template, schema } : undefined;

    // Resolve decorators based on slide position using branded schema
    const decoratorDefs = resolveDecorators(slideIndex, totalSlides, brandedTemplate);
    const decoratorBlocks: DecorativeBlock[] = decoratorDefs.map(def =>
      decoratorToBlock(def, slideIndex, totalSlides, 1080, 1080)
    );

    // Add progress bar if configured
    if (schema.progressBar?.enabled) {
      const progressBarDef = createProgressBarDecorator(
        schema.progressBar,
        slideIndex,
        totalSlides,
        1080,
        1080
      );
      decoratorBlocks.push(decoratorToBlock(progressBarDef, slideIndex, totalSlides, 1080, 1080));
    }

    // Merge with existing blocks
    enhancedSlide = {
      ...slide,
      blocks: [...slide.blocks, ...decoratorBlocks]
    };
  }

  // Common props for all layouts
  const layoutProps: LayoutProps = {
    slots: layout.slots,
    slide: enhancedSlide,
    brand,
    theme,
    onBlockClick,
  };

  // Render based on layout kind
  // Pass a key to force re-mount when brand changes
  const layoutKey = `layout-${slide.id}-${brand.primary}`;
  return renderLayout(layout.kind, layoutProps, layoutKey);
}

/**
 * Renders a specific layout kind with given props
 */
function renderLayout(kind: LayoutKind, props: LayoutProps, key: string): ReactElement {
  switch (kind) {
    case 'title':
      return <TitleSlide key={key} {...props} />;
    case 'list':
      return <ListSlide key={key} {...props} />;
    case 'two-col':
      return <TwoColSlide key={key} {...props} />;
    case 'stat':
      return <StatSlide key={key} {...props} />;
    case 'quote':
      return <QuoteSlide key={key} {...props} />;
    case 'cover':
      return <CoverSlide key={key} {...props} />;
    case 'image-focus':
      return <ImageFocusSlide key={key} {...props} />;
    case 'comparison':
      return <ComparisonSlide key={key} {...props} />;
    case 'timeline':
      return <TimelineSlide key={key} {...props} />;
    case 'section-break':
      return <SectionBreakSlide key={key} {...props} />;
    default:
      // Fallback to list layout
      return <ListSlide key={key} {...props} />;
  }
}

// Export layout primitives for direct use
export { TitleSlide } from './TitleSlide';
export { ListSlide } from './ListSlide';
export { TwoColSlide } from './TwoColSlide';
export { StatSlide } from './StatSlide';
export { QuoteSlide } from './QuoteSlide';
export { CoverSlide } from './CoverSlide';
export { ImageFocusSlide } from './ImageFocusSlide';
export { ComparisonSlide } from './ComparisonSlide';
export { TimelineSlide } from './TimelineSlide';
export { SectionBreakSlide } from './SectionBreakSlide';
export type { LayoutProps } from './types';
