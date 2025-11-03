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
const QUOTE_ATTRIBUTION_GAP = 24

/**
 * QuoteSlide Layout Primitive
 *
 * Centered layout for displaying quotes, testimonials, or key messages.
 * Features a large quote with attribution/source.
 *
 * Expected slots:
 * - quote (text, h2): Main quote text
 * - attribution (text, caption): Author, source, or context
 */
export function QuoteSlide({
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

  // Map blocks to quote components
  // Use first title as the quote
  // Use subtitle as attribution
  const quoteBlock = textBlocks.find(b => b.kind === 'title')
  const attributionBlock = textBlocks.find(b => b.kind === 'subtitle')

  // Text styles for quote components
  const quoteStyle: TextStyle = {
    fontFamily: brand.fontHead || brand.fontBody || DEFAULT_FONT,
    fontWeight: 600,
    fontSize: 48,
    lineHeight: 64,
    color: theme.text,
    letterSpacing: -0.02, // Tighter letter spacing for quotes
  }

  const attributionStyle: TextStyle = {
    fontFamily: brand.fontBody || DEFAULT_FONT,
    fontWeight: 500,
    fontSize: 24,
    lineHeight: 32,
    color: theme.textMuted,
  }

  // Measure text blocks
  const quoteLayout = useMemo(() => {
    if (!quoteBlock || quoteBlock.kind === 'bullets') return null
    return measure({
      text: quoteBlock.text,
      style: quoteStyle,
      maxWidth: cr.w * 0.85, // Narrower for better readability
    })
  }, [quoteBlock, quoteStyle, cr.w, measure])

  const attributionLayout = useMemo(() => {
    if (!attributionBlock || attributionBlock.kind === 'bullets') return null
    return measure({
      text: attributionBlock.text,
      style: attributionStyle,
      maxWidth: cr.w * 0.85,
    })
  }, [attributionBlock, attributionStyle, cr.w, measure])

  // Calculate vertical centering
  const quoteHeight = quoteLayout?.totalHeight || 0
  const attributionHeight = attributionLayout?.totalHeight || 0

  const totalContentHeight =
    quoteHeight +
    (attributionHeight > 0 ? QUOTE_ATTRIBUTION_GAP + attributionHeight : 0)

  const startY = cr.y + (cr.h - totalContentHeight) / 2
  const centerX = cr.x + (cr.w - cr.w * 0.85) / 2 // Center the narrower text

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

      {/* Opening Quote Mark */}
      <div
        className="absolute"
        style={{
          left: centerX - 32,
          top: startY - 40,
          fontSize: 120,
          lineHeight: 1,
          fontFamily: 'Georgia, serif',
          color: theme.primary,
          opacity: 0.3,
        }}
      >
        "
      </div>

      {/* Quote Text */}
      {quoteBlock && quoteLayout && (
        <div
          className="absolute"
          style={{
            left: centerX,
            top: startY,
            width: cr.w * 0.85,
            height: quoteHeight,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              fontFamily: quoteStyle.fontFamily,
              fontWeight: quoteStyle.fontWeight,
              fontSize: quoteStyle.fontSize,
              lineHeight: `${quoteStyle.lineHeight}px`,
              letterSpacing: quoteStyle.letterSpacing,
              color: quoteStyle.color,
              textAlign: 'center',
              fontStyle: 'italic',
            }}
          >
            {quoteLayout.lines.map((ln: { text: string }, idx: number) => (
              <div
                key={idx}
                style={{
                  height: quoteStyle.lineHeight,
                  overflow: 'hidden',
                }}
              >
                {ln.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Closing Quote Mark */}
      <div
        className="absolute"
        style={{
          right: cr.x + (cr.w - cr.w * 0.85) / 2 - 32,
          top: startY + quoteHeight - 20,
          fontSize: 120,
          lineHeight: 1,
          fontFamily: 'Georgia, serif',
          color: theme.primary,
          opacity: 0.3,
        }}
      >
        "
      </div>

      {/* Attribution */}
      {attributionBlock && attributionLayout && (
        <div
          className="absolute"
          style={{
            left: centerX,
            top: startY + quoteHeight + QUOTE_ATTRIBUTION_GAP,
            width: cr.w * 0.85,
            height: attributionHeight,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              fontFamily: attributionStyle.fontFamily,
              fontWeight: attributionStyle.fontWeight,
              fontSize: attributionStyle.fontSize,
              lineHeight: `${attributionStyle.lineHeight}px`,
              color: attributionStyle.color,
              textAlign: 'center',
            }}
          >
            {attributionLayout.lines.map((ln: { text: string }, idx: number) => (
              <div
                key={idx}
                style={{
                  height: attributionStyle.lineHeight,
                  overflow: 'hidden',
                }}
              >
                {idx === 0 ? `— ${ln.text}` : ln.text}
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
