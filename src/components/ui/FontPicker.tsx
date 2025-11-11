import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { AVAILABLE_FONTS } from '@/lib/fonts/google-fonts';

const SYSTEM_FONTS = [
  { name: 'system-ui', label: 'System UI', category: 'system' },
  { name: 'sans-serif', label: 'Sans Serif', category: 'system' },
  { name: 'serif', label: 'Serif', category: 'system' },
  { name: 'monospace', label: 'Monospace', category: 'system' },
] as const;

interface FontPickerProps {
  value: string;
  onChange: (font: string | undefined) => void;
  inheritedFont?: string;
  showInherit?: boolean;
}

export function FontPicker({
  value,
  onChange,
  inheritedFont = 'Inter',
  showInherit = true
}: FontPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate dropdown position when opened
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4, // 4px gap below button
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (fontName: string) => {
    onChange(fontName || undefined);
    setIsOpen(false);
  };

  // Get display name for current value
  const getDisplayName = () => {
    if (!value) return `Inherit (${inheritedFont})`;

    const brandFont = AVAILABLE_FONTS.find(f => f.name === value);
    if (brandFont) return brandFont.name;

    const systemFont = SYSTEM_FONTS.find(f => f.name === value);
    if (systemFont) return systemFont.label;

    return value;
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded border border-brand-300 bg-white px-3 py-2 text-sm text-brand-900 transition-colors hover:border-brand-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
      >
        <span className="truncate">{getDisplayName()}</span>
        <ChevronDown className={`h-4 w-4 text-brand-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu - Rendered via Portal */}
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="fixed max-h-80 overflow-y-auto rounded-lg border border-neutral-200 bg-white shadow-lg z-50"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`,
          }}
        >
          <div className="py-1">
            {/* Inherit Option */}
            {showInherit && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect('');
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-brand-50 transition-colors flex items-center justify-between"
                >
                  <span className="text-sm text-brand-900">
                    Inherit ({inheritedFont})
                  </span>
                  {!value && (
                    <Check className="h-4 w-4 text-brand-600 flex-shrink-0 ml-2" />
                  )}
                </button>
                <div className="border-t border-neutral-100 my-1" />
              </>
            )}

            {/* Brand Fonts Section */}
            <div className="px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50/50">
              Brand Fonts
            </div>
            {AVAILABLE_FONTS.map((font) => (
              <button
                key={font.name}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(font.name);
                }}
                className="w-full px-4 py-2 text-left hover:bg-brand-50 transition-colors flex items-center justify-between"
              >
                <span
                  className="text-sm text-brand-900"
                  style={{ fontFamily: font.name }}
                >
                  {font.name}
                </span>
                {value === font.name && (
                  <Check className="h-4 w-4 text-brand-600 flex-shrink-0 ml-2" />
                )}
              </button>
            ))}

            {/* System Fonts Section */}
            <div className="border-t border-neutral-100 my-1" />
            <div className="px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-50">
              System Fonts
            </div>
            {SYSTEM_FONTS.map((font) => (
              <button
                key={font.name}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(font.name);
                }}
                className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors flex items-center justify-between"
              >
                <span
                  className="text-sm text-neutral-900"
                  style={{ fontFamily: font.name }}
                >
                  {font.label}
                </span>
                {value === font.name && (
                  <Check className="h-4 w-4 text-neutral-600 flex-shrink-0 ml-2" />
                )}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
