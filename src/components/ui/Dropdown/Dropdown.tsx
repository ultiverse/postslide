import { useRef, useEffect } from 'react';

interface DropdownProps {
  trigger: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  align?: 'left' | 'right';
}

export function Dropdown({
  trigger,
  isOpen,
  onOpenChange,
  children,
  position = 'bottom',
  align = 'right'
}: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onOpenChange]);

  const positionClasses = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2'
  };

  const alignClasses = {
    left: 'left-0',
    right: 'right-0'
  };

  return (
    <div ref={dropdownRef} className="relative">
      {trigger}
      {isOpen && (
        <div className={`absolute ${positionClasses[position]} ${alignClasses[align]} w-48 rounded-lg border border-neutral-200 bg-white shadow-lg z-20`}>
          {children}
        </div>
      )}
    </div>
  );
}
