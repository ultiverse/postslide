import type {
  DecoratorDefinition,
  DecoratorPosition,
  DecorativeBlock,
  Template,
  ProgressBarConfig,
} from '@/types/domain'

/**
 * Determine slide position in the deck
 */
export function getSlidePosition(
  slideIndex: number,
  totalSlides: number
): 'first' | 'middle' | 'last' {
  if (totalSlides === 1) return 'first'
  if (slideIndex === 0) return 'first'
  if (slideIndex === totalSlides - 1) return 'last'
  return 'middle'
}

/**
 * Calculate absolute position from anchor-based position
 */
export function calculatePosition(
  position: DecoratorPosition,
  slideWidth: number = 1080,
  slideHeight: number = 1080
): { x: number; y: number } {
  // If absolute coordinates provided, use them
  if (position.x !== undefined && position.y !== undefined) {
    return { x: position.x, y: position.y }
  }

  // Otherwise use anchor-based positioning
  const anchor = position.anchor || 'center'
  const offsetX = position.offsetX || 0
  const offsetY = position.offsetY || 0

  const anchorPositions: Record<string, { x: number; y: number }> = {
    'top-left': { x: 0, y: 0 },
    'top-center': { x: slideWidth / 2, y: 0 },
    'top-right': { x: slideWidth, y: 0 },
    'center': { x: slideWidth / 2, y: slideHeight / 2 },
    'bottom-left': { x: 0, y: slideHeight },
    'bottom-center': { x: slideWidth / 2, y: slideHeight },
    'bottom-right': { x: slideWidth, y: slideHeight },
  }

  const base = anchorPositions[anchor] || anchorPositions['center']

  return {
    x: base.x + offsetX,
    y: base.y + offsetY,
  }
}

/**
 * Resolve which decorators should appear on a slide based on position
 */
export function resolveDecorators(
  slideIndex: number,
  totalSlides: number,
  template?: Template
): DecoratorDefinition[] {
  if (!template?.schema?.decorators) {
    return []
  }

  const position = getSlidePosition(slideIndex, totalSlides)
  const decorators = template.schema.decorators

  return [
    ...(decorators.all || []),
    ...(decorators[position] || []),
  ]
}

/**
 * Convert DecoratorDefinition to DecorativeBlock
 */
export function decoratorToBlock(
  decorator: DecoratorDefinition,
  slideIndex: number,
  totalSlides: number,
  slideWidth: number = 1080,
  slideHeight: number = 1080
): DecorativeBlock {
  const position = calculatePosition(decorator.position, slideWidth, slideHeight)

  // Generate unique ID for the decorator
  const id = `decorator-${decorator.type}-${position.x}-${position.y}`

  // Map decorator type to decorative block variant
  let variant: DecorativeBlock['variant']
  switch (decorator.type) {
    case 'arrow':
      variant = 'arrow'
      break
    case 'divider':
      variant = 'divider'
      break
    case 'shape':
      variant = 'shape'
      break
    case 'pageNumber':
    case 'progressBar':
    case 'custom':
      variant = 'icon'  // Use icon variant for special types
      break
    default:
      variant = 'accent'
  }

  return {
    id,
    kind: 'decorative',
    variant,
    props: {
      ...decorator.props,
      x: position.x,
      y: position.y,
      decoratorType: decorator.type,
      slideIndex,
      totalSlides,
      component: decorator.component,
    },
  }
}

/**
 * Calculate progress bar progression
 */
export function calculateProgress(
  slideIndex: number,
  totalSlides: number
): {
  progress: number      // 0 to 1
  startPercent: number  // 0 to 100
  endPercent: number    // 0 to 100
} {
  if (totalSlides <= 1) {
    return { progress: 1, startPercent: 100, endPercent: 0 }
  }

  const progress = slideIndex / (totalSlides - 1)

  return {
    progress,
    startPercent: Math.round(progress * 100),
    endPercent: Math.round((1 - progress) * 100),
  }
}

/**
 * Generate progress bar decorator
 */
export function createProgressBarDecorator(
  config: ProgressBarConfig,
  slideIndex: number,
  totalSlides: number,
  slideWidth: number = 1080,
  slideHeight: number = 1080
): DecoratorDefinition {
  let position: DecoratorPosition

  switch (config.position) {
    case 'top':
      position = { x: 0, y: 0 }
      break
    case 'bottom':
      position = { x: 0, y: slideHeight - config.height }
      break
    case 'left':
      position = { x: 0, y: 0 }
      break
    case 'right':
      position = { x: slideWidth - config.height, y: 0 }
      break
  }

  return {
    type: 'progressBar',
    position,
    props: {
      ...config,
      width: config.position === 'top' || config.position === 'bottom' ? slideWidth : config.height,
      height: config.position === 'top' || config.position === 'bottom' ? config.height : slideHeight,
      slideIndex,
      totalSlides,
    },
  }
}

/**
 * Format page number based on format string
 */
export function formatPageNumber(
  current: number,
  total: number,
  format: string = 'current/total'
): string {
  const currentDisplay = current + 1  // 0-indexed to 1-indexed

  switch (format) {
    case 'current/total':
      return `${currentDisplay}/${total}`
    case 'current of total':
      return `${currentDisplay} of ${total}`
    case 'page current':
      return `Page ${currentDisplay}`
    case 'current':
      return `${currentDisplay}`
    default:
      // Allow custom format strings with {current} and {total} placeholders
      return format
        .replace('{current}', String(currentDisplay))
        .replace('{total}', String(total))
  }
}
