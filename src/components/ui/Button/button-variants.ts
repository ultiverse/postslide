import { cva } from "class-variance-authority"

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 active:from-brand-700 active:to-brand-800 shadow-sm",
        outline: "border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100",
        ghost: "text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200",
        destructive: "bg-error text-white hover:bg-error/90 active:bg-error/80 shadow-sm",
        accent: "bg-gradient-to-r from-accent-500 to-accent-600 text-white hover:from-accent-600 hover:to-accent-600 active:from-accent-600 active:to-accent-600 shadow-sm",
        link: "text-brand-600 underline-offset-4 hover:underline hover:text-brand-700",
      },
      size: {
        xs: "h-7 px-2.5 text-xs",
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)
