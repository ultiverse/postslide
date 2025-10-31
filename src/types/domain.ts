import type { ReactElement } from 'react';

// Text-based blocks with editable content
export type TextBlock =
  | { id: string; kind: 'title' | 'subtitle' | 'body'; text: string }
  | { id: string; kind: 'bullets'; bullets: string[] }

// Visual blocks
export type ImageBlock = {
  id: string
  kind: 'image'
  src: string // URL or data URI
  alt?: string
  fit?: 'cover' | 'contain' | 'fill' // How image fills its frame
  position?: { x: number; y: number; width: number; height: number } // Optional positioning
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

export type Slide = { id: string; templateId?: string; blocks: SlideBlock[] }

export type Project = {
  id: string
  title: string
  slides: Slide[]
  brand?: { primary: string; fontHead: string; fontBody: string }
}

export type Brand = { primary: string; fontHead: string; fontBody: string }

export type CoverStyle = 'title-heavy' | 'image-forward' | 'stat'

export type Template = {
  id: string
  name: string
  description?: string
  layout: (slide: Slide, brand: Brand) => ReactElement
  defaults: Partial<Slide>
  coverStyle?: CoverStyle
}
