import type { LayoutProps } from './types'
import type { TextBlock } from '@/types/domain'
import type { TextStyle } from '@/lib/types/design'
import { useMemo } from 'react'
import { contentRect } from '@/lib/layout/grid'
import { createMeasurer } from '@/lib/layout/measure'
import { BackgroundBlockRenderer, DecorativeBlockRenderer, ImageBlockRenderer } from '@/components/canvas/BlockRenderer'
import { isTextBlock } from '@/lib/constants/blocks'
import { useLayoutTheme } from '@/lib/theme/useLayoutTheme'

// Layout constants
const DEFAULT_FONT = 'Inter, system-ui, sans-serif'
const DEFAULT_WIDTH = 1080
const DEFAULT_HEIGHT = 1080

/**
 * CoverSlide Layout Primitive
 *
 * Full-bleed cover slide with prominent title and subtitle.
 * Designed for presentation opening slides and section breaks.
 * Features bold typography with optional background image/color.
 *
 * Expected slots:
 * - title (text, h1): Main title
 * - subtitle (text, h2): Optional subtitle or tagline
 * - background (image): Optional full-bleed background image
 */
export function CoverSlide({
  slide,
  brand,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  safeInset,
  theme: providedTheme,
}: LayoutProps) {
  const measure = useMemo(() => createMeasurer(), [])
  const { spacing, typography, colors } = useLayoutTheme(brand, providedTheme)

  const spec = {
    width,
    height,
    safeInset: safeInset ?? spacing.safeInset,
    baseline: spacing.baseline
  }
  const cr = contentRect(spec)

  // Separate blocks
  const backgroundBlocks = slide.blocks.filter(b => b.kind === 'background')
  const imageBlocks = slide.blocks.filter(b => b.kind === 'image')
  const decorativeBlocks = slide.blocks.filter(b => b.kind === 'decorative')
  const textBlocks = slide.blocks.filter(isTextBlock) as TextBlock[]

  // Map blocks to cover components
  const titleBlock = textBlocks.find(b => b.kind === 'title')
  const subtitleBlock = textBlocks.find(b => b.kind === 'subtitle')

  // Text styles for cover slide - memoized to avoid changing object identities
  const titleStyle: TextStyle = useMemo(() => ({
    ...typography.display,
    fontFamily: brand.fontHead || brand.fontBody || DEFAULT_FONT, // Apply after typography to override
    color: colors.text,
  }), [brand.fontHead, brand.fontBody, typography.display, colors.text]);

  const subtitleStyle: TextStyle = useMemo(() => ({
    ...typography.h2,
    fontFamily: brand.fontBody || DEFAULT_FONT, // Apply after typography to override
    color: colors.textMuted,
  }), [brand.fontBody, typography.h2, colors.textMuted]);

  // Measure text blocks
  const titleLayout = useMemo(() => {
    if (!titleBlock || titleBlock.kind === 'bullets') return null
    return measure({
      text: titleBlock.text,
      style: titleStyle,
      maxWidth: cr.w,
    })
  }, [titleBlock, titleStyle, cr.w, measure])

  const subtitleLayout = useMemo(() => {
    if (!subtitleBlock || subtitleBlock.kind === 'bullets') return null
    return measure({
      text: subtitleBlock.text,
      style: subtitleStyle,
      maxWidth: cr.w * 0.9,
    })
  }, [subtitleBlock, subtitleStyle, cr.w, measure])

  // Calculate vertical centering
  const titleHeight = titleLayout?.totalHeight || 0
  const subtitleHeight = subtitleLayout?.totalHeight || 0
  const totalContentHeight = titleHeight + (subtitleHeight > 0 ? spacing.verticalGap + subtitleHeight : 0)

  const startY = cr.y + (cr.h - totalContentHeight) / 2

  const artboardStyle: React.CSSProperties = {
    width: spec.width,
    height: spec.height,
    position: 'relative',
    background: colors.background,
  }

  // Check if there's a background image
  const hasBackgroundImage = imageBlocks.length > 0 || backgroundBlocks.some(b => b.style === 'image')

  return (
    <div style={artboardStyle}>
      {/* Background layer - full bleed images */}
      {imageBlocks.map((block) => (
        <ImageBlockRenderer
          key={block.id}
          block={block}
          x={0}
          y={0}
          width={spec.width}
          height={spec.height}
        />
      ))}

      {/* Background blocks (gradients, solid colors) */}
      {backgroundBlocks.map((block) => (
        <BackgroundBlockRenderer
          key={block.id}
          block={block}
          width={spec.width}
          height={spec.height}
        />
      ))}

      {/* Overlay for better text readability if there's a background image */}
      {hasBackgroundImage && (
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))',
          }}
        />
      )}

      {/* Title */}
      {titleBlock && titleLayout && (
        <div
          className="absolute"
          style={{
            left: cr.x,
            top: startY,
            width: cr.w,
            height: titleHeight,
            overflow: 'hidden',
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontFamily: titleStyle.fontFamily,
              fontWeight: titleStyle.fontWeight,
              fontSize: titleStyle.fontSize,
              lineHeight: `${titleStyle.lineHeight}px`,
              letterSpacing: titleStyle.letterSpacing,
              color: titleStyle.color,
              textAlign: 'center',
              textShadow: hasBackgroundImage ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            {titleLayout.lines.map((ln: { text: string }, idx: number) => (
              <div
                key={idx}
                style={{
                  height: titleStyle.lineHeight,
                  overflow: 'hidden',
                }}
              >
                {ln.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtitle */}
      {subtitleBlock && subtitleLayout && (
        <div
          className="absolute"
          style={{
            left: cr.x + cr.w * 0.05, // Slightly narrower
            top: startY + titleHeight + spacing.verticalGap,
            width: cr.w * 0.9,
            height: subtitleHeight,
            overflow: 'hidden',
            zIndex: 10,
          }}
        >
          <div
            style={{
              fontFamily: subtitleStyle.fontFamily,
              fontWeight: subtitleStyle.fontWeight,
              fontSize: subtitleStyle.fontSize,
              lineHeight: `${subtitleStyle.lineHeight}px`,
              color: subtitleStyle.color,
              textAlign: 'center',
              textShadow: hasBackgroundImage ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            {subtitleLayout.lines.map((ln: { text: string }, idx: number) => (
              <div
                key={idx}
                style={{
                  height: subtitleStyle.lineHeight,
                  overflow: 'hidden',
                }}
              >
                {ln.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decorative layer */}
      {decorativeBlocks.map((block) => {
        const x = block.props?.x as number ?? spec.width / 2 - 24
        const y = block.props?.y as number ?? spec.height - 100
        return (
          <DecorativeBlockRenderer
            key={block.id}
            block={block}
            x={x}
            y={y}
          />
        )
      })}
    </div>
  )
}
