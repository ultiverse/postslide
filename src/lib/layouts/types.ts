import type { Slide, LayoutSlot, Brand } from '@/types/domain'

export interface LayoutProps {
  slots: LayoutSlot[]
  slide: Slide
  brand: Brand
  width?: number // Artboard width (default 1080)
  height?: number // Artboard height (default 1080)
  safeInset?: number // Safe area inset (default 64)
}

export interface Theme {
  primary: string // Brand color
  text: string // Main text color
  textMuted: string // Secondary text color
  background: string // Background color
}
