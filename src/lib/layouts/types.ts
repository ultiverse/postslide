import type { Slide, LayoutSlot, Brand } from '@/types/domain'
import type { Theme } from '@/lib/types/design'

export interface LayoutProps {
  slots: LayoutSlot[]
  slide: Slide
  brand: Brand
  width?: number // Artboard width (default 1080)
  height?: number // Artboard height (default 1080)
  safeInset?: number // Safe area inset (default 64)
  theme?: Theme // Optional theme override
}
