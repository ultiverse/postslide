import type { ReactElement } from 'react'
import type { Slide, Brand, TemplateSchema, LayoutKind } from '@/types/domain'
import type { LayoutProps } from './types'
import { TitleSlide } from './TitleSlide'
import { ListSlide } from './ListSlide'
import { TwoColSlide } from './TwoColSlide'

/**
 * Schema-driven layout renderer
 *
 * Renders a slide using a template schema definition.
 * This allows templates to be defined declaratively rather than imperatively.
 */
export function renderSlideFromSchema(
  schema: TemplateSchema,
  slide: Slide,
  brand: Brand
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

  // Common props for all layouts
  const layoutProps: LayoutProps = {
    slots: layout.slots,
    slide,
    brand,
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
      // TODO: Implement StatSlide
      return <ListSlide {...props} />
    case 'quote':
      // TODO: Implement QuoteSlide
      return <ListSlide {...props} />
    case 'cover':
      // TODO: Implement CoverSlide (or use TitleSlide)
      return <TitleSlide {...props} />
    default:
      // Fallback to list layout
      return <ListSlide {...props} />
  }
}

// Export layout primitives for direct use
export { TitleSlide } from './TitleSlide'
export { ListSlide } from './ListSlide'
export { TwoColSlide } from './TwoColSlide'
export type { LayoutProps } from './types'
