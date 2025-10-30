import { ButtonHTMLAttributes, forwardRef } from 'react';
import { type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { iconButtonVariants } from './icon-button-variants';

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: React.ComponentType<{ className?: string }>;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, icon: Icon, checked, onCheckedChange, onClick, ...props }, ref) => {
    const isToggle = checked !== undefined && onCheckedChange !== undefined;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isToggle && onCheckedChange) {
        onCheckedChange(!checked);
      }
      onClick?.(e);
    };

    return (
      <button
        className={cn(
          iconButtonVariants({ variant, size, className }),
          isToggle && checked && 'bg-brand-500 text-white hover:bg-brand-600'
        )}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        <Icon className="h-4 w-4" />
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export { IconButton };
