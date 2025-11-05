import type { DecorativeBlock } from '@/types/domain'
import { formatPageNumber } from './utils'

export interface PageNumberDecoratorProps {
  block: DecorativeBlock
  x: number
  y: number
}

/**
 * PageNumberDecorator - Displays page numbers like "1 of 10" or "Page 1"
 */
export function PageNumberDecorator({ block, x, y }: PageNumberDecoratorProps) {
  const props = block.props || {}
  const slideIndex = props.slideIndex as number ?? 0
  const totalSlides = props.totalSlides as number ?? 1
  const format = props.format as string ?? 'current/total'
  const fontSize = props.fontSize as number ?? 18
  const color = props.color as string ?? '#666666'
  const fontFamily = props.fontFamily as string ?? 'Inter, system-ui, sans-serif'
  const fontWeight = props.fontWeight as number ?? 400

  const text = formatPageNumber(slideIndex, totalSlides, format)

  return (
    <text
      x={x}
      y={y}
      fontSize={fontSize}
      fontFamily={fontFamily}
      fontWeight={fontWeight}
      fill={color}
      textAnchor="middle"
      dominantBaseline="middle"
    >
      {text}
    </text>
  )
}
