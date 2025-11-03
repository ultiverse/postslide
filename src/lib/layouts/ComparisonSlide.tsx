import type { LayoutProps } from './types'
import type { TextBlock } from '@/types/domain'
import type { TextStyle } from '@/lib/types/design'
import { useMemo } from 'react'
import { contentRect } from '@/lib/layout/grid'
import { createMeasurer } from '@/lib/layout/measure'
import { layoutBullets } from '@/lib/layout/bullets'
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
const COLUMN_GAP = 64
const HEADER_GAP = 40
const BULLET_INDENT = 36
const BULLET_GAP = 8

/**
 * ComparisonSlide Layout Primitive
 *
 * Side-by-side comparison layout with labeled columns.
 * Perfect for pros/cons, before/after, or feature comparisons.
 *
 * Expected slots:
 * - title (text, h1): Optional main title
 * - left-label (text, h2): Left column header
 * - left-content (text, bullets): Left column content
 * - right-label (text, h2): Right column header
 * - right-content (text, bullets): Right column content
 */
export function ComparisonSlide({
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

  // Find blocks - title, then split subtitles and bodies into left/right
  const titleBlock = textBlocks.find(b => b.kind === 'title')
  const subtitleBlocks = textBlocks.filter(b => b.kind === 'subtitle')
  const bodyBlocks = textBlocks.filter(b => b.kind === 'body' || b.kind === 'bullets')

  // Simple split: first subtitle and body go to left, second set goes to right
  const leftLabel = subtitleBlocks[0]
  const rightLabel = subtitleBlocks[1]
  const leftContent = bodyBlocks[0]
  const rightContent = bodyBlocks[1]

  // Define text styles
  const titleStyle: TextStyle = {
    fontFamily: brand.fontHead || brand.fontBody || DEFAULT_FONT,
    fontWeight: 700,
    fontSize: 56,
    lineHeight: 64,
    color: theme.text,
  }

  const labelStyle: TextStyle = {
    fontFamily: brand.fontHead || brand.fontBody || DEFAULT_FONT,
    fontWeight: 600,
    fontSize: 32,
    lineHeight: 40,
    color: theme.primary,
  }

  const contentStyle: TextStyle = {
    fontFamily: brand.fontBody || DEFAULT_FONT,
    fontWeight: 400,
    fontSize: 24,
    lineHeight: 36,
    color: theme.text,
  }

  // Measure title
  const titleLayout = useMemo(() => {
    if (!titleBlock || titleBlock.kind === 'bullets') return null
    return measure({
      text: titleBlock.text,
      style: titleStyle,
      maxWidth: cr.w,
    })
  }, [titleBlock, titleStyle, cr.w, measure])

  const titleHeight = titleLayout?.totalHeight || 0
  const contentStartY = cr.y + (titleHeight > 0 ? titleHeight + HEADER_GAP : 0)
  const contentHeight = cr.h - (titleHeight > 0 ? titleHeight + HEADER_GAP : 0)

  // Column dimensions
  const columnWidth = (cr.w - COLUMN_GAP) / 2

  // Measure left label
  const leftLabelLayout = useMemo(() => {
    if (!leftLabel || leftLabel.kind === 'bullets') return null
    return measure({
      text: leftLabel.text,
      style: labelStyle,
      maxWidth: columnWidth,
    })
  }, [leftLabel, labelStyle, columnWidth, measure])

  // Measure right label
  const rightLabelLayout = useMemo(() => {
    if (!rightLabel || rightLabel.kind === 'bullets') return null
    return measure({
      text: rightLabel.text,
      style: labelStyle,
      maxWidth: columnWidth,
    })
  }, [rightLabel, labelStyle, columnWidth, measure])

  const labelHeight = Math.max(
    leftLabelLayout?.totalHeight || 0,
    rightLabelLayout?.totalHeight || 0
  )

  const contentBodyStartY = contentStartY + (labelHeight > 0 ? labelHeight + 24 : 0)
  const contentBodyHeight = contentHeight - (labelHeight > 0 ? labelHeight + 24 : 0)

  // Measure left content
  const leftContentLayout = useMemo(() => {
    if (!leftContent) return null
    if (leftContent.kind === 'bullets') {
      return layoutBullets({
        items: leftContent.bullets,
        style: contentStyle,
        frameWidth: columnWidth,
        bullet: {
          marker: '•',
          gap: BULLET_GAP,
          indent: BULLET_INDENT,
          markerSizeRatio: 1,
        },
      })
    }
    return measure({
      text: leftContent.text,
      style: contentStyle,
      maxWidth: columnWidth,
    })
  }, [leftContent, contentStyle, columnWidth, measure])

  // Measure right content
  const rightContentLayout = useMemo(() => {
    if (!rightContent) return null
    if (rightContent.kind === 'bullets') {
      return layoutBullets({
        items: rightContent.bullets,
        style: contentStyle,
        frameWidth: columnWidth,
        bullet: {
          marker: '•',
          gap: BULLET_GAP,
          indent: BULLET_INDENT,
          markerSizeRatio: 1,
        },
      })
    }
    return measure({
      text: rightContent.text,
      style: contentStyle,
      maxWidth: columnWidth,
    })
  }, [rightContent, contentStyle, columnWidth, measure])

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
            top: cr.y,
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
              <div key={idx} style={{ height: titleStyle.lineHeight, overflow: 'hidden' }}>
                {ln.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Left Label */}
      {leftLabel && leftLabelLayout && (
        <div
          className="absolute"
          style={{
            left: cr.x,
            top: contentStartY,
            width: columnWidth,
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
            }}
          >
            {leftLabelLayout.lines.map((ln: { text: string }, idx: number) => (
              <div key={idx} style={{ height: labelStyle.lineHeight, overflow: 'hidden' }}>
                {ln.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Right Label */}
      {rightLabel && rightLabelLayout && (
        <div
          className="absolute"
          style={{
            left: cr.x + columnWidth + COLUMN_GAP,
            top: contentStartY,
            width: columnWidth,
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
            }}
          >
            {rightLabelLayout.lines.map((ln: { text: string }, idx: number) => (
              <div key={idx} style={{ height: labelStyle.lineHeight, overflow: 'hidden' }}>
                {ln.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Left Content */}
      {leftContent && leftContentLayout && (
        <div
          className="absolute"
          style={{
            left: cr.x,
            top: contentBodyStartY,
            width: columnWidth,
            height: contentBodyHeight,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              fontFamily: contentStyle.fontFamily,
              fontWeight: contentStyle.fontWeight,
              fontSize: contentStyle.fontSize,
              lineHeight: `${contentStyle.lineHeight}px`,
              color: contentStyle.color,
            }}
          >
            {leftContentLayout.lines.map((ln: any, idx: number) => (
              <div
                key={idx}
                style={{
                  height: contentStyle.lineHeight,
                  paddingLeft: ln.xOffset || 0,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {ln.marker && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      width: ln.xOffset,
                      textAlign: 'center',
                    }}
                  >
                    {ln.marker}
                  </span>
                )}
                {ln.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Right Content */}
      {rightContent && rightContentLayout && (
        <div
          className="absolute"
          style={{
            left: cr.x + columnWidth + COLUMN_GAP,
            top: contentBodyStartY,
            width: columnWidth,
            height: contentBodyHeight,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              fontFamily: contentStyle.fontFamily,
              fontWeight: contentStyle.fontWeight,
              fontSize: contentStyle.fontSize,
              lineHeight: `${contentStyle.lineHeight}px`,
              color: contentStyle.color,
            }}
          >
            {rightContentLayout.lines.map((ln: any, idx: number) => (
              <div
                key={idx}
                style={{
                  height: contentStyle.lineHeight,
                  paddingLeft: ln.xOffset || 0,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {ln.marker && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      width: ln.xOffset,
                      textAlign: 'center',
                    }}
                  >
                    {ln.marker}
                  </span>
                )}
                {ln.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decorative layer - vertical divider */}
      <div
        className="absolute"
        style={{
          left: cr.x + columnWidth + COLUMN_GAP / 2 - 1,
          top: contentStartY,
          width: 2,
          height: contentHeight,
          background: theme.textMuted,
          opacity: 0.2,
        }}
      />

      {/* Other decorative blocks */}
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
