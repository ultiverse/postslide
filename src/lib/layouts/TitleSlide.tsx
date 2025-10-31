import type { LayoutProps } from './types'
import type { TextBlock } from '@/types/domain'
import type { TextStyle } from '@/lib/types/design'
import { useMemo } from 'react'
import { contentRect } from '@/lib/layout/grid'
import { createMeasurer } from '@/lib/layout/measure'
import { BackgroundBlockRenderer, DecorativeBlockRenderer } from '@/components/canvas/BlockRenderer'
import { isTextBlock } from '@/lib/constants/blocks'

// Layout constants
const DEFAULT_FONT = 'Inter, system-ui, sans-serif'
const DEFAULT_WIDTH = 1080
const DEFAULT_HEIGHT = 1080
const DEFAULT_SAFE_INSET = 64
const DEFAULT_BASELINE = 8
const DEFAULT_TEXT_COLOR = '#1a1a1a'
const DEFAULT_TEXT_MUTED = '#666666'
const DEFAULT_BACKGROUND = '#ffffff'
const TITLE_SUBTITLE_GAP = 24

/**
 * TitleSlide Layout Primitive
 *
 * A centered title slide with optional subtitle and decorative elements.
 * Designed for cover slides and section breaks.
 *
 * Expected slots:
 * - title (text, h1): Main title
 * - subtitle (text, h2): Optional subtitle
 */
export function TitleSlide({
  slots,
  slide,
  brand,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  safeInset = DEFAULT_SAFE_INSET,
}: LayoutProps) {
  const measure = useMemo(() => createMeasurer(), [])

  const theme = useMemo(() => ({
    primary: brand.primary,
    text: DEFAULT_TEXT_COLOR,
    textMuted: DEFAULT_TEXT_MUTED,
    background: DEFAULT_BACKGROUND,
  }), [brand.primary])

  const spec = { width, height, safeInset, baseline: DEFAULT_BASELINE }
  const cr = contentRect(spec)

  // Separate blocks
  const backgroundBlocks = slide.blocks.filter(b => b.kind === 'background')
  const decorativeBlocks = slide.blocks.filter(b => b.kind === 'decorative')
  const textBlocks = slide.blocks.filter(isTextBlock) as TextBlock[]

  // Find title and subtitle from slots
  const titleSlot = slots.find(s => s.id === 'title')
  const subtitleSlot = slots.find(s => s.id === 'subtitle')

  // Map blocks to slots (simple approach: find by block kind)
  const titleBlock = textBlocks.find(b => b.kind === 'title')
  const subtitleBlock = textBlocks.find(b => b.kind === 'subtitle')

  // Define text styles based on slot styles
  const titleStyle: TextStyle = {
    fontFamily: brand.fontHead || brand.fontBody || DEFAULT_FONT,
    fontWeight: 700,
    fontSize: titleSlot?.style === 'h1' ? 72 : 64,
    lineHeight: titleSlot?.style === 'h1' ? 80 : 72,
    color: theme.text,
  }

  const subtitleStyle: TextStyle = {
    fontFamily: brand.fontHead || brand.fontBody || DEFAULT_FONT,
    fontWeight: 600,
    fontSize: subtitleSlot?.style === 'h2' ? 48 : 40,
    lineHeight: subtitleSlot?.style === 'h2' ? 56 : 48,
    color: theme.textMuted,
  }

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
      maxWidth: cr.w,
    })
  }, [subtitleBlock, subtitleStyle, cr.w, measure])

  // Calculate vertical centering
  const titleHeight = titleLayout?.totalHeight || 0
  const subtitleHeight = subtitleLayout?.totalHeight || 0
  const totalContentHeight = titleHeight + (subtitleHeight > 0 ? TITLE_SUBTITLE_GAP + subtitleHeight : 0)

  const startY = cr.y + (cr.h - totalContentHeight) / 2

  const artboardStyle: React.CSSProperties = {
    width: spec.width,
    height: spec.height,
    position: 'relative',
    background: theme.background,
  }

  return (
    <div style={artboardStyle}>
      {/* Background layer */}
      {backgroundBlocks.map((block) => (
        <BackgroundBlockRenderer
          key={block.id}
          block={block}
          width={spec.width}
          height={spec.height}
        />
      ))}

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
          }}
        >
          <div
            style={{
              fontFamily: titleStyle.fontFamily,
              fontWeight: titleStyle.fontWeight,
              fontSize: titleStyle.fontSize,
              lineHeight: `${titleStyle.lineHeight}px`,
              color: titleStyle.color,
              textAlign: 'center',
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
            left: cr.x,
            top: startY + titleHeight + TITLE_SUBTITLE_GAP,
            width: cr.w,
            height: subtitleHeight,
            overflow: 'hidden',
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
