import type { DecorativeBlock } from '@/types/domain'
import { calculateProgress } from './utils'

export interface ProgressBarDecoratorProps {
  block: DecorativeBlock
  x: number
  y: number
}

/**
 * ProgressBarDecorator - Displays a progress bar that fills based on slide position
 *
 * Supports three styles:
 * - gradient: Smooth gradient from startColor to endColor
 * - segmented: Individual segments for each slide
 * - blocks: Discrete blocks showing filled/unfilled progress
 */
export function ProgressBarDecorator({ block, x, y }: ProgressBarDecoratorProps) {
  const props = block.props || {}
  const slideIndex = props.slideIndex as number ?? 0
  const totalSlides = props.totalSlides as number ?? 1
  const width = props.width as number ?? 1080
  const height = props.height as number ?? 4
  const startColor = props.startColor as string ?? '#3b82f6'
  const endColor = props.endColor as string ?? '#8b5cf6'
  const style = props.style as string ?? 'gradient'
  const segmentGap = props.segmentGap as number ?? 2

  const { progress } = calculateProgress(slideIndex, totalSlides)

  if (style === 'gradient') {
    return <GradientProgressBar
      x={x}
      y={y}
      width={width}
      height={height}
      startColor={startColor}
      endColor={endColor}
      progress={progress}
    />
  } else if (style === 'segmented') {
    return <SegmentedProgressBar
      x={x}
      y={y}
      width={width}
      height={height}
      startColor={startColor}
      endColor={endColor}
      slideIndex={slideIndex}
      totalSlides={totalSlides}
      gap={segmentGap}
    />
  } else if (style === 'blocks') {
    return <BlockProgressBar
      x={x}
      y={y}
      width={width}
      height={height}
      startColor={startColor}
      endColor={endColor}
      slideIndex={slideIndex}
      totalSlides={totalSlides}
      gap={segmentGap}
    />
  }

  return null
}

/**
 * Gradient style - smooth color transition
 */
function GradientProgressBar({
  x,
  y,
  width,
  height,
  startColor,
  endColor,
  progress,
}: {
  x: number
  y: number
  width: number
  height: number
  startColor: string
  endColor: string
  progress: number
}) {
  const gradientId = `progress-gradient-${Math.random().toString(36).substr(2, 9)}`

  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={startColor} />
          <stop offset={`${progress * 100}%`} stopColor={startColor} />
          <stop offset={`${progress * 100}%`} stopColor={endColor} />
          <stop offset="100%" stopColor={endColor} />
        </linearGradient>
      </defs>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={`url(#${gradientId})`}
      />
    </g>
  )
}

/**
 * Segmented style - individual segments per slide
 */
function SegmentedProgressBar({
  x,
  y,
  width,
  height,
  startColor,
  endColor,
  slideIndex,
  totalSlides,
  gap,
}: {
  x: number
  y: number
  width: number
  height: number
  startColor: string
  endColor: string
  slideIndex: number
  totalSlides: number
  gap: number
}) {
  const segmentWidth = (width - (gap * (totalSlides - 1))) / totalSlides

  return (
    <g>
      {Array.from({ length: totalSlides }).map((_, i) => (
        <rect
          key={i}
          x={x + i * (segmentWidth + gap)}
          y={y}
          width={segmentWidth}
          height={height}
          fill={i <= slideIndex ? startColor : endColor}
          opacity={i <= slideIndex ? 1 : 0.3}
        />
      ))}
    </g>
  )
}

/**
 * Blocks style - discrete filled/unfilled blocks
 */
function BlockProgressBar({
  x,
  y,
  width,
  height,
  startColor,
  endColor,
  slideIndex,
  totalSlides,
  gap,
}: {
  x: number
  y: number
  width: number
  height: number
  startColor: string
  endColor: string
  slideIndex: number
  totalSlides: number
  gap: number
}) {
  const blockWidth = (width - (gap * (totalSlides - 1))) / totalSlides
  const blockHeight = height

  return (
    <g>
      {Array.from({ length: totalSlides }).map((_, i) => {
        const isFilled = i <= slideIndex
        return (
          <rect
            key={i}
            x={x + i * (blockWidth + gap)}
            y={y}
            width={blockWidth}
            height={blockHeight}
            fill={isFilled ? startColor : endColor}
            opacity={isFilled ? 1 : 0.3}
            rx={2}  // Rounded corners for blocks
          />
        )
      })}
    </g>
  )
}
