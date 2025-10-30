import * as React from 'react';
import { GripVertical, ChevronUp, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton } from '@/components/ui/Button/IconButton';

interface BlockCardProps {
  children: React.ReactNode;
  className?: string;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  dragHandleProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  headerContent?: React.ReactNode;
}

const BlockCard = React.forwardRef<HTMLDivElement, BlockCardProps>(
  (
    {
      children,
      className,
      onMoveUp,
      onMoveDown,
      onRemove,
      canMoveUp = true,
      canMoveDown = true,
      dragHandleProps,
      headerContent,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-gradient-to-br from-white to-brand-50/30 border border-brand-200/50 rounded-lg shadow-sm hover:shadow-md hover:border-brand-300/70 transition-all',
          className
        )}
        {...props}
      >
        {/* Header with drag handle and controls */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-brand-200/30 bg-white/50">
          {/* Drag handle */}
          <button
            type="button"
            {...dragHandleProps}
            className={cn(
              "cursor-grab active:cursor-grabbing touch-none select-none p-1 rounded",
              "text-neutral-400 hover:text-neutral-600 transition-colors",
              dragHandleProps?.className // keep anything provided
            )}
            title="Drag to reorder"
            aria-label="Drag block"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Header content (e.g., select dropdown) */}
          {headerContent && <div className="flex-1 min-w-0">{headerContent}</div>}

          {/* Spacer (only if no header content) */}
          {!headerContent && <div className="flex-1" />}

          {/* Control buttons */}
          <div className="flex items-center gap-1">
            {onMoveUp && (
              <IconButton
                icon={ChevronUp}
                onClick={onMoveUp}
                disabled={!canMoveUp}
                variant="ghost"
                size="xs"
                title="Move up"
              />
            )}
            {onMoveDown && (
              <IconButton
                icon={ChevronDown}
                onClick={onMoveDown}
                disabled={!canMoveDown}
                variant="ghost"
                size="xs"
                title="Move down"
              />
            )}
            {onRemove && (
              <IconButton
                icon={X}
                onClick={onRemove}
                variant="destructive"
                size="xs"
                title="Remove"
              />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3">{children}</div>
      </div>
    );
  }
);

BlockCard.displayName = 'BlockCard';

export { BlockCard };
