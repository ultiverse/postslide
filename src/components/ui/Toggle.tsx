import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const toggleVariants = cva(
  'relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-5 w-9',
        md: 'h-6 w-12',
        lg: 'h-7 w-14',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const toggleThumbVariants = cva(
  'pointer-events-none inline-block transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface ToggleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'>,
    VariantProps<typeof toggleVariants> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
  checkedColor?: string;
  uncheckedColor?: string;
}

const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      className,
      size,
      checked = false,
      onCheckedChange,
      label,
      checkedColor = '#4a67ff',
      uncheckedColor = '#d1d5db',
      disabled,
      ...props
    },
    ref
  ) => {
    const handleClick = () => {
      if (!disabled) {
        onCheckedChange?.(!checked);
      }
    };

    const translateX = {
      sm: checked ? 'translateX(1rem)' : 'translateX(0)',
      md: checked ? 'translateX(1.5rem)' : 'translateX(0)',
      lg: checked ? 'translateX(1.75rem)' : 'translateX(0)',
    }[size || 'md'];

    const toggle = (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={cn(toggleVariants({ size, className }))}
        style={{ backgroundColor: checked ? checkedColor : uncheckedColor }}
        onClick={handleClick}
        disabled={disabled}
        ref={ref}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(toggleThumbVariants({ size }))}
          style={{ transform: translateX }}
        />
      </button>
    );

    if (label) {
      return (
        <label className="flex select-none items-center gap-3 cursor-pointer">
          <span className="text-sm font-medium text-neutral-700">{label}</span>
          {toggle}
        </label>
      );
    }

    return toggle;
  }
);

Toggle.displayName = 'Toggle';

export { Toggle, toggleVariants };
