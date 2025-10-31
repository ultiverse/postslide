/**
 * Layout System - Public API
 *
 * Centralized exports for the schema-driven layout system.
 * Import from here for all layout-related functionality.
 */

// Schema renderer
export { renderSlideFromSchema } from './index'

// Layout primitives
export { TitleSlide, ListSlide, TwoColSlide } from './index'

// Types
export type { LayoutProps, Theme } from './types'

// Utilities
export {
  getTemplateById,
  getTemplateSchema,
  getLayout,
  getDefaultLayout,
  getTemplateLayouts,
  matchSlideToLayout,
  getSuggestedBlocksForLayout,
  isSlideCompatibleWithLayout,
  getLayoutDescription,
} from './utils'
