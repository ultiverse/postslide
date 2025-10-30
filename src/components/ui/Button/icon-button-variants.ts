import { cva } from 'class-variance-authority';

export const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700',
        outline: 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100',
        ghost: 'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200',
        destructive: 'border border-error bg-white text-error hover:bg-error/10 active:bg-error/20',
      },
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'sm',
    },
  }
);
