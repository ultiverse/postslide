import type { LayoutProps } from './types'
import type { TextBlock } from '@/types/domain'
import type { TextStyle } from '@/lib/types/design'
import { useMemo } from 'react'
import { contentRect, isOverflow } from '@/lib/layout/grid'
import { createMeasurer } from '@/lib/layout/measure'
import { layoutBullets } from '@/lib/layout/bullets'
import { BackgroundBlockRenderer, DecorativeBlockRenderer, ImageBlockRenderer } from '@/components/canvas/BlockRenderer'
import { isTextBlock } from '@/lib/constants/blocks'
import { useLayoutTheme } from '@/lib/theme/useLayoutTheme'

// Layout constants
const DEFAULT_FONT = 'Inter, system-ui, sans-serif'
const DEFAULT_WIDTH = 1080
const DEFAULT_HEIGHT = 1080

/**
 * TwoColSlide Layout Primitive
 *
 * Two-column layout for content comparison or text + image layouts.
 * Content is split into left and right columns with configurable gap.
 *
 * Expected slots:
 * - title (text, h1): Optional title spanning both columns
 * - left-* (text/image): Content for left column
 * - right-* (text/image): Content for right column
 */
export function TwoColSlide({
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

  // Separate blocks into layers
  const backgroundBlocks = slide.blocks.filter(b => b.kind === 'background')
  const contentBlocks = slide.blocks.filter(b => isTextBlock(b) || b.kind === 'image')
  const decorativeBlocks = slide.blocks.filter(b => b.kind === 'decorative')

  // Find title block (if any) - will span both columns
  const titleBlock = contentBlocks.find(b => b.kind === 'title') as TextBlock | undefined

  // Split remaining content into two columns (simple approach: first half left, second half right)
  const nonTitleBlocks = contentBlocks.filter(b => b.kind !== 'title')
  const midpoint = Math.ceil(nonTitleBlocks.length / 2)
  const leftBlocks = nonTitleBlocks.slice(0, midpoint)
  const rightBlocks = nonTitleBlocks.slice(midpoint)

  // Define text styles based on block kind
  const getStyleForBlock = (block: TextBlock): TextStyle => {
    const baseFont = brand.fontBody || DEFAULT_FONT
    const headFont = brand.fontHead || baseFont

    switch (block.kind) {
      case 'title':
        return {
          fontFamily: headFont,
          ...typography.h1,
          color: colors.text,
        }
      case 'subtitle':
        return {
          fontFamily: headFont,
          ...typography.h2,
          color: colors.textMuted,
        }
      case 'body':
        return {
          fontFamily: baseFont,
          ...typography.body,
          color: colors.text,
        }
      case 'bullets':
        return {
          fontFamily: baseFont,
          ...typography.body,
          color: colors.text,
        }
    }
  }

  // Render title block (if exists)
  const titleRendered = useMemo(() => {
    if (!titleBlock || titleBlock.kind === 'bullets') return null

    const style = getStyleForBlock(titleBlock)
    const layout = measure({
      text: titleBlock.text,
      style,
      maxWidth: cr.w,
    })

    const frameH = Math.min(layout.totalHeight, cr.h / 3) // Max 1/3 of height

    return {
      block: titleBlock,
      style,
      layout,
      frame: { x: cr.x, y: cr.y, w: cr.w, h: frameH },
      overflow: isOverflow(layout.totalHeight, frameH),
      type: 'text' as const,
    }
  }, [titleBlock, measure, cr, colors, typography, brand])

  const titleHeight = titleRendered ? titleRendered.frame.h + spacing.blockGap : 0
  const columnStartY = cr.y + titleHeight
  const columnHeight = cr.h - titleHeight

  // Column dimensions
  const columnWidth = (cr.w - spacing.columnGap) / 2

  // Render left column
  const leftRendered = useMemo(() => {
    if (!leftBlocks.length) return []

    let currentY = columnStartY

    return leftBlocks.map((block) => {
      const frameX = cr.x
      const frameW = columnWidth
      const maxH = columnHeight - (currentY - columnStartY)

      if (block.kind === 'image') {
        const imgHeight = block.height || spacing.imageHeight
        const imgWidth = block.width || frameW
        const frameH = Math.min(imgHeight, maxH)

        const result = {
          block,
          frame: { x: frameX, y: currentY, w: imgWidth, h: frameH },
          type: 'image' as const,
        }

        currentY += frameH + spacing.blockGap
        return result
      } else {
        const textBlock = block as TextBlock
        const style = getStyleForBlock(textBlock)

        let layout
        let frameH

        if (textBlock.kind === 'bullets') {
          layout = layoutBullets({
            items: textBlock.bullets,
            style,
            frameWidth: frameW,
            bullet: {
              marker: '•',
              gap: spacing.bulletGap,
              indent: spacing.bulletIndent,
              markerSizeRatio: 1,
            },
          })
          frameH = Math.min(layout.totalHeight, maxH)
        } else {
          layout = measure({
            text: textBlock.text,
            style,
            maxWidth: frameW,
          })
          frameH = Math.min(layout.totalHeight, maxH)
        }

        const result = {
          block: textBlock,
          style,
          layout,
          frame: { x: frameX, y: currentY, w: frameW, h: frameH },
          overflow: isOverflow(layout.totalHeight, frameH),
          type: 'text' as const,
        }

        currentY += frameH + spacing.blockGap
        return result
      }
    })
  }, [leftBlocks, measure, cr, columnWidth, columnStartY, columnHeight, spacing, colors, typography, brand])

  // Render right column
  const rightRendered = useMemo(() => {
    if (!rightBlocks.length) return []

    let currentY = columnStartY

    return rightBlocks.map((block) => {
      const frameX = cr.x + columnWidth + spacing.columnGap
      const frameW = columnWidth
      const maxH = columnHeight - (currentY - columnStartY)

      if (block.kind === 'image') {
        const imgHeight = block.height || spacing.imageHeight
        const imgWidth = block.width || frameW
        const frameH = Math.min(imgHeight, maxH)

        const result = {
          block,
          frame: { x: frameX, y: currentY, w: imgWidth, h: frameH },
          type: 'image' as const,
        }

        currentY += frameH + spacing.blockGap
        return result
      } else {
        const textBlock = block as TextBlock
        const style = getStyleForBlock(textBlock)

        let layout
        let frameH

        if (textBlock.kind === 'bullets') {
          layout = layoutBullets({
            items: textBlock.bullets,
            style,
            frameWidth: frameW,
            bullet: {
              marker: '•',
              gap: spacing.bulletGap,
              indent: spacing.bulletIndent,
              markerSizeRatio: 1,
            },
          })
          frameH = Math.min(layout.totalHeight, maxH)
        } else {
          layout = measure({
            text: textBlock.text,
            style,
            maxWidth: frameW,
          })
          frameH = Math.min(layout.totalHeight, maxH)
        }

        const result = {
          block: textBlock,
          style,
          layout,
          frame: { x: frameX, y: currentY, w: frameW, h: frameH },
          overflow: isOverflow(layout.totalHeight, frameH),
          type: 'text' as const,
        }

        currentY += frameH + spacing.blockGap
        return result
      }
    })
  }, [rightBlocks, measure, cr, columnWidth, columnStartY, columnHeight, spacing, colors, typography, brand])

  const artboardStyle: React.CSSProperties = {
    width: spec.width,
    height: spec.height,
    position: 'relative',
    background: colors.background,
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

      {/* Title (if exists) */}
      {titleRendered && <TextBlock renderBlock={titleRendered} />}

      {/* Left column */}
      {leftRendered.map((rb) => {
        if (rb.type === 'image') {
          return (
            <ImageBlockRenderer
              key={rb.block.id}
              block={rb.block}
              x={rb.frame.x}
              y={rb.frame.y}
              width={rb.frame.w}
              height={rb.frame.h}
            />
          )
        } else if (rb.block.kind === 'bullets') {
          return <BulletBlock key={rb.block.id} renderBlock={rb} />
        }
        return <TextBlock key={rb.block.id} renderBlock={rb} />
      })}

      {/* Right column */}
      {rightRendered.map((rb) => {
        if (rb.type === 'image') {
          return (
            <ImageBlockRenderer
              key={rb.block.id}
              block={rb.block}
              x={rb.frame.x}
              y={rb.frame.y}
              width={rb.frame.w}
              height={rb.frame.h}
            />
          )
        } else if (rb.block.kind === 'bullets') {
          return <BulletBlock key={rb.block.id} renderBlock={rb} />
        }
        return <TextBlock key={rb.block.id} renderBlock={rb} />
      })}

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

// Text block component
function TextBlock({ renderBlock }: { renderBlock: any }) {
  const { style, layout, frame, overflow } = renderBlock

  return (
    <div
      className="absolute"
      style={{
        left: frame.x,
        top: frame.y,
        width: frame.w,
        height: frame.h,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          fontSize: style.fontSize,
          lineHeight: `${style.lineHeight}px`,
          letterSpacing: style.letterSpacing ?? 0,
          color: style.color,
        }}
      >
        {layout.lines.map((ln: any, idx: number) => (
          <div
            key={idx}
            style={{
              height: style.lineHeight,
              overflow: 'hidden',
            }}
          >
            {ln.text}
          </div>
        ))}
      </div>
      {overflow && <OverflowBadge />}
    </div>
  )
}

// Bullet block component
function BulletBlock({ renderBlock }: { renderBlock: any }) {
  const { style, layout, frame, overflow } = renderBlock

  return (
    <div
      className="absolute"
      style={{
        left: frame.x,
        top: frame.y,
        width: frame.w,
        height: frame.h,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          fontSize: style.fontSize,
          lineHeight: `${style.lineHeight}px`,
          letterSpacing: style.letterSpacing ?? 0,
          color: style.color,
        }}
      >
        {layout.lines.map((ln: any, idx: number) => (
          <div
            key={idx}
            style={{
              height: style.lineHeight,
              paddingLeft: ln.xOffset,
              position: 'relative',
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
      {overflow && <OverflowBadge />}
    </div>
  )
}

function OverflowBadge() {
  return (
    <div className="absolute right-2 bottom-2 px-2 py-1 rounded-md bg-amber-500 text-white text-xs font-semibold shadow-lg flex items-center gap-1">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>Overflow</span>
    </div>
  )
}
