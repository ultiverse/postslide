import { useRef, useEffect } from 'react';
import { IconButton } from '@/components/ui';
import { X } from 'lucide-react';

interface BulletInputProps {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  autoFocus?: boolean;
  placeholder?: string;
}

export function BulletInput({
  value,
  onChange,
  onRemove,
  autoFocus = false,
  placeholder = 'Bullet point'
}: BulletInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [autoFocus]);

  return (
    <div className="flex gap-1">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        placeholder={placeholder}
      />
      <IconButton
        icon={X}
        onClick={onRemove}
        variant="ghost"
        size="xs"
        title="Remove bullet"
        className="text-error hover:bg-error/10"
      />
    </div>
  );
}
