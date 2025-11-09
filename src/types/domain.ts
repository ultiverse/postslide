import type { ReactElement } from 'react';

// Block-level style overrides
export type BlockStyle = {
  color?: string            // Text color override
  fontFamily?: string       // Font family override ('inherit' or font name)
  textAlign?: 'left' | 'center' | 'right'  // Text alignment
  uppercase?: boolean       // Text transformation
}

// Text-based blocks with editable content
export type TextBlock =
  | { id: string; kind: 'title' | 'subtitle' | 'body'; text: string; style?: BlockStyle }
  | { id: string; kind: 'bullets'; bullets: string[]; style?: BlockStyle }

// Visual blocks
export type ImageBlock = {
  id: string
  kind: 'image'
  src: string // URL or data URI
  alt?: string
  fit?: 'cover' | 'contain' | 'fill' // How image fills its frame
  width?: number // Width in pixels (defaults to content width)
  height?: number // Height in pixels (defaults to auto or 300px)
}

export type BackgroundBlock = {
  id: string
  kind: 'background'
  style: 'solid' | 'gradient' | 'image'
  color?: string // For solid backgrounds
  gradient?: { from: string; to: string; direction?: 'to-r' | 'to-br' | 'to-b' | 'to-bl' } // For gradients
  image?: string // URL for background image
  opacity?: number // 0-1
}

// Decorative blocks (non-editable visual elements)
export type DecorativeBlock = {
  id: string
  kind: 'decorative'
  variant: 'arrow' | 'divider' | 'accent' | 'shape' | 'icon'
  props?: Record<string, unknown> // Flexible props for different decorative types
}

export type SlideBlock = TextBlock | ImageBlock | BackgroundBlock | DecorativeBlock

export type Slide = {
  id: string
  templateId?: string
  layoutId?: string // Optional: specific layout from template schema
  themeVariant?: string // Optional: theme variant override (e.g., 'light', 'dark')
  blocks: SlideBlock[]
}

export type Project = {
  id: string
  title: string
  slides: Slide[]
  brand?: { primary: string }
}

// Extended brand configuration with customization options
export type Brand = {
  primary: string      // Primary brand color
}

export type CoverStyle = 'title-heavy' | 'image-forward' | 'stat'

// --- Schema-based Template System (New) ---

export type LayoutKind = 'title' | 'two-col' | 'list' | 'stat' | 'quote' | 'cover' | 'image-focus' | 'comparison' | 'timeline' | 'section-break'

export type SlotType = 'text' | 'image' | 'bullets' | 'number'

export type SlotStyle = 'h1' | 'h2' | 'body' | 'caption'

export type LayoutSlot = {
  id: string
  type: SlotType
  style?: SlotStyle
  props?: Record<string, unknown>
}

export type LayoutDefinition = {
  id: string // e.g., "title-slide", "content", "stat"
  kind: LayoutKind
  slots: LayoutSlot[]
}

// --- Position-Aware Decorators ---

export type DecoratorAnchor =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export type DecoratorPosition = {
  // Anchor-based positioning (recommended)
  anchor?: DecoratorAnchor
  offsetX?: number  // Offset from anchor in pixels
  offsetY?: number  // Offset from anchor in pixels

  // Or absolute positioning
  x?: number
  y?: number
}

export type DecoratorType = 'arrow' | 'divider' | 'shape' | 'pageNumber' | 'progressBar' | 'custom'

export type DecoratorDefinition = {
  type: DecoratorType
  position: DecoratorPosition
  props?: Record<string, unknown>
  component?: React.ReactNode  // For custom decorators
}

export type TemplateDecorators = {
  first?: DecoratorDefinition[]   // Only on first slide
  middle?: DecoratorDefinition[]  // Only on middle slides
  last?: DecoratorDefinition[]    // Only on last slide
  all?: DecoratorDefinition[]     // On every slide
}

export type ProgressBarConfig = {
  enabled: boolean
  position: 'top' | 'bottom' | 'left' | 'right'
  height: number  // or width if vertical
  startColor: string  // Color for beginning
  endColor: string    // Color for end
  style: 'gradient' | 'segmented' | 'blocks'
  segmentGap?: number  // For segmented/blocks style
}

export type TemplateSchema = {
  id: string
  name: string
  description?: string
  layouts: LayoutDefinition[]
  theme?: {
    id: string          // Theme identifier
    variants?: string[] // Optional theme variant IDs (e.g., ['light', 'dark'])
  }
  decorators?: TemplateDecorators  // Position-aware decorators
  progressBar?: ProgressBarConfig  // Optional progress bar
}

// --- Template Type (Updated) ---

export type Template = {
  id: string
  name: string
  description?: string
  schema?: TemplateSchema // Optional: new schema-based definition
  theme?: import('../lib/types/design').ThemeDefinition // Optional: theme definition
  themeVariants?: Record<string, import('../lib/types/design').ThemeDefinition> // Optional: theme variants
  layout: (slide: Slide, brand: Brand, slideIndex?: number, totalSlides?: number) => ReactElement // Position-aware for decorators
  preview?: () => ReactElement // Optional: custom preview for gallery
  defaults: Partial<Slide>
  coverStyle?: CoverStyle
}
