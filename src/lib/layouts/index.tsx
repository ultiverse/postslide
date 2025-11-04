import type { ReactElement } from 'react'
import type { Slide, Brand, TemplateSchema, LayoutKind, Template } from '@/types/domain'
import type { Theme } from '@/lib/types/design'
import type { LayoutProps } from './types'
import { TitleSlide } from './TitleSlide'
import { ListSlide } from './ListSlide'
import { TwoColSlide } from './TwoColSlide'
import { StatSlide } from './StatSlide'
import { QuoteSlide } from './QuoteSlide'
import { CoverSlide } from './CoverSlide'
import { ImageFocusSlide } from './ImageFocusSlide'
import { ComparisonSlide } from './ComparisonSlide'
import { TimelineSlide } from './TimelineSlide'
import { SectionBreakSlide } from './SectionBreakSlide'
import { getLayoutTheme, themeDefinitionToTheme } from '@/lib/theme'

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
 */
export function renderSlideFromSchema(
  schema: TemplateSchema,
  slide: Slide,
  brand: Brand,
  template?: Template
): ReactElement {
  // Try to use the layoutId stored on the slide, otherwise use first layout
  let layout = slide.layoutId
    ? schema.layouts.find(l => l.id === slide.layoutId)
    : null

  // Fallback to first layout if specific layout not found
  if (!layout) {
    layout = schema.layouts[0]
  }

  if (!layout) {
    throw new Error(`Template schema "${schema.id}" has no layouts defined`)
  }

  // Resolve theme based on slide's themeVariant and template theme
  let theme: Theme | undefined
  if (template) {
    // Check if slide has a theme variant override
    if (slide.themeVariant && template.themeVariants?.[slide.themeVariant]) {
      const baseTheme = template.themeVariants[slide.themeVariant]
      // Adjust theme for specific layout kinds
      const layoutTheme = getLayoutTheme(baseTheme, layout.kind)
      theme = themeDefinitionToTheme(layoutTheme)
    } else if (template.theme) {
      // Use default template theme
      const baseTheme = template.theme
      const layoutTheme = getLayoutTheme(baseTheme, layout.kind)
      theme = themeDefinitionToTheme(layoutTheme)
    }
  }

  // Common props for all layouts
  const layoutProps: LayoutProps = {
    slots: layout.slots,
    slide,
    brand,
    theme,
  }

  // Render based on layout kind
  return renderLayout(layout.kind, layoutProps)
}

/**
 * Renders a specific layout kind with given props
 */
function renderLayout(kind: LayoutKind, props: LayoutProps): ReactElement {
  switch (kind) {
    case 'title':
      return <TitleSlide {...props} />
    case 'list':
      return <ListSlide {...props} />
    case 'two-col':
      return <TwoColSlide {...props} />
    case 'stat':
      return <StatSlide {...props} />
    case 'quote':
      return <QuoteSlide {...props} />
    case 'cover':
      return <CoverSlide {...props} />
    case 'image-focus':
      return <ImageFocusSlide {...props} />
    case 'comparison':
      return <ComparisonSlide {...props} />
    case 'timeline':
      return <TimelineSlide {...props} />
    case 'section-break':
      return <SectionBreakSlide {...props} />
    default:
      // Fallback to list layout
      return <ListSlide {...props} />
  }
}

// Export layout primitives for direct use
export { TitleSlide } from './TitleSlide'
export { ListSlide } from './ListSlide'
export { TwoColSlide } from './TwoColSlide'
export { StatSlide } from './StatSlide'
export { QuoteSlide } from './QuoteSlide'
export { CoverSlide } from './CoverSlide'
export { ImageFocusSlide } from './ImageFocusSlide'
export { ComparisonSlide } from './ComparisonSlide'
export { TimelineSlide } from './TimelineSlide'
export { SectionBreakSlide } from './SectionBreakSlide'
export type { LayoutProps } from './types'
