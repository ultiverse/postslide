import { forwardRef, ButtonHTMLAttributes } from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { toggleVariants, toggleThumbVariants } from './toggle-variants';

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

export { Toggle };
