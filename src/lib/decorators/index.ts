// Decorator utilities
export {
  getSlidePosition,
  calculatePosition,
  resolveDecorators,
  decoratorToBlock,
  calculateProgress,
  createProgressBarDecorator,
  formatPageNumber,
} from './utils'

// Decorator components
export { PageNumberDecorator } from './PageNumberDecorator'
export { ProgressBarDecorator } from './ProgressBarDecorator'

// Re-export types
export type {
  DecoratorDefinition,
  DecoratorPosition,
  DecoratorAnchor,
  DecoratorType,
  TemplateDecorators,
  ProgressBarConfig,
} from '@/types/domain'
