import type { LayoutProps } from './types'
import type { TextBlock, ImageBlock } from '@/types/domain'
import type { TextStyle } from '@/lib/types/design'
import { useMemo } from 'react'
import { contentRect } from '@/lib/layout/grid'
import { createMeasurer } from '@/lib/layout/measure'
import { BackgroundBlockRenderer, DecorativeBlockRenderer } from '@/components/canvas/BlockRenderer'
import { isTextBlock } from '@/lib/constants/blocks'
import { useLayoutTheme } from '@/lib/theme/useLayoutTheme'

// Layout constants
const DEFAULT_FONT = 'Inter, system-ui, sans-serif'
const DEFAULT_WIDTH = 1080
const DEFAULT_HEIGHT = 1080
const IMAGE_MAX_HEIGHT_RATIO = 0.65 // Image takes up to 65% of content height

/**
 * ImageFocusSlide Layout Primitive
 *
 * A layout that prominently displays an image with an optional caption.
 * Great for showcasing visuals, screenshots, photos, or diagrams.
 *
 * Expected slots:
 * - image (image): Main image
 * - title (text, h2): Optional title/caption
 * - caption (text, body): Optional descriptive caption
 */
export function ImageFocusSlide({
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
  const decorativeBlocks = slide.blocks.filter(b => b.kind === 'decorative')
  const imageBlocks = slide.blocks.filter(b => b.kind === 'image') as ImageBlock[]
  const textBlocks = slide.blocks.filter(isTextBlock) as TextBlock[]

  // Find blocks
  const imageBlock = imageBlocks[0]
  const titleBlock = textBlocks.find(b => b.kind === 'title' || b.kind === 'subtitle')
  const captionBlock = textBlocks.find(b => b.kind === 'body')

  // Define text styles
  const titleStyle: TextStyle = {
    fontFamily: brand.fontHead || brand.fontBody || DEFAULT_FONT,
    ...typography.h2,
    color: colors.text,
  }

  const captionStyle: TextStyle = {
    fontFamily: brand.fontBody || DEFAULT_FONT,
    ...typography.caption,
    color: colors.textMuted,
  }

  // Calculate image dimensions
  const maxImageHeight = cr.h * IMAGE_MAX_HEIGHT_RATIO
  let imageWidth = cr.w
  let imageHeight = maxImageHeight

  // Adjust for image aspect ratio if available
  if (imageBlock?.width && imageBlock?.height) {
    const aspectRatio = imageBlock.width / imageBlock.height
    imageHeight = Math.min(maxImageHeight, cr.w / aspectRatio)
    imageWidth = imageHeight * aspectRatio
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

  const captionLayout = useMemo(() => {
    if (!captionBlock || captionBlock.kind === 'bullets') return null
    return measure({
      text: captionBlock.text,
      style: captionStyle,
      maxWidth: cr.w,
    })
  }, [captionBlock, captionStyle, cr.w, measure])

  // Calculate layout positions
  const titleHeight = titleLayout?.totalHeight || 0
  const captionHeight = captionLayout?.totalHeight || 0
  const textHeight = titleHeight + (captionHeight > 0 ? 16 + captionHeight : 0)

  // Center everything vertically
  const totalHeight = imageHeight + (textHeight > 0 ? spacing.blockGap + textHeight : 0)
  const startY = cr.y + (cr.h - totalHeight) / 2

  const imageY = startY
  const textStartY = startY + imageHeight + spacing.blockGap

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

      {/* Image */}
      {imageBlock && imageBlock.src && (
        <div
          className="absolute"
          style={{
            left: cr.x + (cr.w - imageWidth) / 2,
            top: imageY,
            width: imageWidth,
            height: imageHeight,
            overflow: 'hidden',
            borderRadius: 8,
          }}
        >
          <img
            src={imageBlock.src}
            alt={imageBlock.alt || ''}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}

      {/* Title */}
      {titleBlock && titleLayout && (
        <div
          className="absolute"
          style={{
            left: cr.x,
            top: textStartY,
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

      {/* Caption */}
      {captionBlock && captionLayout && (
        <div
          className="absolute"
          style={{
            left: cr.x,
            top: textStartY + titleHeight + (titleHeight > 0 ? 16 : 0),
            width: cr.w,
            height: captionHeight,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              fontFamily: captionStyle.fontFamily,
              fontWeight: captionStyle.fontWeight,
              fontSize: captionStyle.fontSize,
              lineHeight: `${captionStyle.lineHeight}px`,
              color: captionStyle.color,
              textAlign: 'center',
            }}
          >
            {captionLayout.lines.map((ln: { text: string }, idx: number) => (
              <div
                key={idx}
                style={{
                  height: captionStyle.lineHeight,
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
