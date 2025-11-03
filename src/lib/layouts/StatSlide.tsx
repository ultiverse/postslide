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
const VERTICAL_GAP = 16

/**
 * StatSlide Layout Primitive
 *
 * Centered layout for highlighting key metrics and statistics.
 * Features a large number with label and optional context.
 *
 * Expected slots:
 * - number (text, h1): Large statistic or number
 * - label (text, caption): Description of the stat
 * - context (text, body): Optional additional context
 */
export function StatSlide({
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

  // Map blocks to stat components
  // For stat slide, we use the first title block as the number
  // First subtitle becomes the label
  // First body block becomes context
  const numberBlock = textBlocks.find(b => b.kind === 'title')
  const labelBlock = textBlocks.find(b => b.kind === 'subtitle')
  const contextBlock = textBlocks.find(b => b.kind === 'body') // First body block

  // Text styles for stat components
  const numberStyle: TextStyle = {
    fontFamily: brand.fontHead || brand.fontBody || DEFAULT_FONT,
    fontWeight: 700,
    fontSize: 144, // Extra large for the stat
    lineHeight: 160,
    color: theme.primary, // Use brand color for emphasis
  }

  const labelStyle: TextStyle = {
    fontFamily: brand.fontBody || DEFAULT_FONT,
    fontWeight: 600,
    fontSize: 32,
    lineHeight: 40,
    color: theme.textMuted,
  }

  const contextStyle: TextStyle = {
    fontFamily: brand.fontBody || DEFAULT_FONT,
    fontWeight: 400,
    fontSize: 24,
    lineHeight: 32,
    color: theme.text,
  }

  // Measure text blocks
  const numberLayout = useMemo(() => {
    if (!numberBlock || numberBlock.kind === 'bullets') return null
    return measure({
      text: numberBlock.text,
      style: numberStyle,
      maxWidth: cr.w,
    })
  }, [numberBlock, numberStyle, cr.w, measure])

  const labelLayout = useMemo(() => {
    if (!labelBlock || labelBlock.kind === 'bullets') return null
    return measure({
      text: labelBlock.text,
      style: labelStyle,
      maxWidth: cr.w,
    })
  }, [labelBlock, labelStyle, cr.w, measure])

  const contextLayout = useMemo(() => {
    if (!contextBlock || contextBlock.kind === 'bullets') return null
    return measure({
      text: contextBlock.text,
      style: contextStyle,
      maxWidth: cr.w * 0.8, // Narrower for better readability
    })
  }, [contextBlock, contextStyle, cr.w, measure])

  // Calculate vertical centering
  const numberHeight = numberLayout?.totalHeight || 0
  const labelHeight = labelLayout?.totalHeight || 0
  const contextHeight = contextLayout?.totalHeight || 0

  const totalContentHeight =
    numberHeight +
    (labelHeight > 0 ? VERTICAL_GAP + labelHeight : 0) +
    (contextHeight > 0 ? VERTICAL_GAP * 2 + contextHeight : 0)

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

      {/* Number/Stat */}
      {numberBlock && numberLayout && (
        <div
          className="absolute"
          style={{
            left: cr.x,
            top: startY,
            width: cr.w,
            height: numberHeight,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              fontFamily: numberStyle.fontFamily,
              fontWeight: numberStyle.fontWeight,
              fontSize: numberStyle.fontSize,
              lineHeight: `${numberStyle.lineHeight}px`,
              color: numberStyle.color,
              textAlign: 'center',
            }}
          >
            {numberLayout.lines.map((ln: { text: string }, idx: number) => (
              <div
                key={idx}
                style={{
                  height: numberStyle.lineHeight,
                  overflow: 'hidden',
                }}
              >
                {ln.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Label */}
      {labelBlock && labelLayout && (
        <div
          className="absolute"
          style={{
            left: cr.x,
            top: startY + numberHeight + VERTICAL_GAP,
            width: cr.w,
            height: labelHeight,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              fontFamily: labelStyle.fontFamily,
              fontWeight: labelStyle.fontWeight,
              fontSize: labelStyle.fontSize,
              lineHeight: `${labelStyle.lineHeight}px`,
              color: labelStyle.color,
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {labelLayout.lines.map((ln: { text: string }, idx: number) => (
              <div
                key={idx}
                style={{
                  height: labelStyle.lineHeight,
                  overflow: 'hidden',
                }}
              >
                {ln.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Context */}
      {contextBlock && contextLayout && (
        <div
          className="absolute"
          style={{
            left: cr.x + cr.w * 0.1, // Center narrower text
            top: startY + numberHeight + labelHeight + VERTICAL_GAP * 2,
            width: cr.w * 0.8,
            height: contextHeight,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              fontFamily: contextStyle.fontFamily,
              fontWeight: contextStyle.fontWeight,
              fontSize: contextStyle.fontSize,
              lineHeight: `${contextStyle.lineHeight}px`,
              color: contextStyle.color,
              textAlign: 'center',
            }}
          >
            {contextLayout.lines.map((ln: { text: string }, idx: number) => (
              <div
                key={idx}
                style={{
                  height: contextStyle.lineHeight,
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
