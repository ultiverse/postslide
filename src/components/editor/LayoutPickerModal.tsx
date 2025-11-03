import { createPortal } from 'react-dom';
import { Sparkles, LayoutGrid, X } from 'lucide-react';
import { getLayoutDescription } from '@/lib/layouts/utils';
import type { LayoutDefinition, LayoutKind } from '@/types/domain';

interface LayoutPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  layouts: LayoutDefinition[];
  currentLayoutId: string;
  suggestedLayoutId?: string;
  onSelectLayout: (layoutId: string) => void;
}

// Visual representation of each layout kind using simple shapes
function LayoutPreview({ kind }: { kind: LayoutKind }) {
  const baseClasses = "fill-neutral-300";
  const accentClasses = "fill-brand-400";

  switch (kind) {
    case 'title':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="15" y="35" width="70" height="8" rx="2" className={accentClasses} />
          <rect x="25" y="50" width="50" height="5" rx="2" className={baseClasses} />
        </svg>
      );
    case 'list':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="15" y="15" width="70" height="6" rx="2" className={accentClasses} />
          <rect x="15" y="30" width="70" height="4" rx="2" className={baseClasses} />
          <circle cx="18" cy="43" r="2" className={accentClasses} />
          <rect x="24" y="41" width="60" height="4" rx="2" className={baseClasses} />
          <circle cx="18" cy="53" r="2" className={accentClasses} />
          <rect x="24" y="51" width="60" height="4" rx="2" className={baseClasses} />
          <circle cx="18" cy="63" r="2" className={accentClasses} />
          <rect x="24" y="61" width="60" height="4" rx="2" className={baseClasses} />
        </svg>
      );
    case 'two-col':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="15" y="15" width="70" height="5" rx="2" className={accentClasses} />
          <rect x="15" y="28" width="32" height="50" rx="3" className={baseClasses} />
          <rect x="53" y="28" width="32" height="50" rx="3" className={baseClasses} />
        </svg>
      );
    case 'stat':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <text x="50" y="55" textAnchor="middle" className="fill-brand-500 font-bold text-[32px]">99</text>
          <rect x="30" y="62" width="40" height="4" rx="2" className={baseClasses} />
          <rect x="35" y="72" width="30" height="3" rx="2" className={baseClasses} />
        </svg>
      );
    case 'quote':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <text x="30" y="40" className="fill-brand-400 font-serif text-[24px]">"</text>
          <rect x="35" y="42" width="35" height="4" rx="2" className={baseClasses} />
          <rect x="35" y="50" width="30" height="4" rx="2" className={baseClasses} />
          <rect x="40" y="65" width="25" height="3" rx="2" className={baseClasses} />
        </svg>
      );
    case 'cover':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="0" y="0" width="100" height="100" rx="4" className="fill-gradient-to-br from-brand-200 to-accent-200" />
          <rect x="20" y="35" width="60" height="10" rx="2" className="fill-white" />
          <rect x="30" y="52" width="40" height="5" rx="2" className="fill-white/70" />
        </svg>
      );
    case 'image-focus':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="15" y="15" width="70" height="45" rx="3" className={accentClasses} />
          <circle cx="35" cy="35" r="6" className="fill-white/50" />
          <polygon points="25,55 45,40 60,50 70,45 70,60 25,60" className="fill-white/30" />
          <rect x="25" y="68" width="50" height="4" rx="2" className={baseClasses} />
          <rect x="30" y="76" width="40" height="3" rx="2" className={baseClasses} />
        </svg>
      );
    case 'comparison':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="15" y="15" width="70" height="5" rx="2" className={accentClasses} />
          <rect x="15" y="26" width="32" height="4" rx="2" className="fill-brand-500" />
          <circle cx="18" cy="36" r="1.5" className={baseClasses} />
          <rect x="22" y="34.5" width="20" height="3" rx="1.5" className={baseClasses} />
          <circle cx="18" cy="43" r="1.5" className={baseClasses} />
          <rect x="22" y="41.5" width="20" height="3" rx="1.5" className={baseClasses} />
          <line x1="50" y1="26" x2="50" y2="75" stroke="currentColor" strokeWidth="1" className="stroke-neutral-300" />
          <rect x="53" y="26" width="32" height="4" rx="2" className="fill-brand-500" />
          <circle cx="56" cy="36" r="1.5" className={baseClasses} />
          <rect x="60" y="34.5" width="20" height="3" rx="1.5" className={baseClasses} />
          <circle cx="56" cy="43" r="1.5" className={baseClasses} />
          <rect x="60" y="41.5" width="20" height="3" rx="1.5" className={baseClasses} />
        </svg>
      );
    case 'timeline':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="15" y="15" width="70" height="5" rx="2" className={accentClasses} />
          <line x1="15" y1="45" x2="85" y2="45" stroke="currentColor" strokeWidth="2" className="stroke-neutral-300" />
          <circle cx="25" cy="45" r="4" className="fill-brand-500" />
          <circle cx="45" cy="45" r="4" className="fill-brand-500" />
          <circle cx="65" cy="45" r="4" className="fill-brand-500" />
          <circle cx="85" cy="45" r="4" className="fill-brand-500" />
          <rect x="18" y="55" width="14" height="3" rx="1.5" className={baseClasses} />
          <rect x="38" y="55" width="14" height="3" rx="1.5" className={baseClasses} />
          <rect x="58" y="55" width="14" height="3" rx="1.5" className={baseClasses} />
          <rect x="78" y="55" width="14" height="3" rx="1.5" className={baseClasses} />
        </svg>
      );
    case 'section-break':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="35" y="30" width="30" height="3" rx="1.5" className={baseClasses} />
          <rect x="30" y="42" width="40" height="2" rx="1" className={accentClasses} />
          <rect x="25" y="52" width="50" height="8" rx="2" className="fill-brand-500" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect x="15" y="15" width="70" height="70" rx="4" className={baseClasses} />
        </svg>
      );
  }
}

// Format layout name for display
function formatLayoutName(kind: string): string {
  return kind
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function LayoutPickerModal({
  isOpen,
  onClose,
  layouts,
  currentLayoutId,
  suggestedLayoutId,
  onSelectLayout,
}: LayoutPickerModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-brand-500" />
            <h3 className="text-lg font-semibold text-neutral-900">Choose Layout</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Layout Grid */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {layouts.map((layout) => {
              const isSelected = layout.id === currentLayoutId;
              const isSuggested = suggestedLayoutId === layout.id && !isSelected;

              return (
                <button
                  key={layout.id}
                  onClick={() => onSelectLayout(layout.id)}
                  className={`
                    relative group rounded-lg border-2 p-4 transition-all
                    ${isSelected
                      ? 'border-brand-500 bg-brand-50 shadow-md'
                      : isSuggested
                      ? 'border-accent-400 bg-accent-50/50 hover:border-accent-500 hover:bg-accent-100/50'
                      : 'border-neutral-200 bg-white hover:border-brand-300 hover:bg-brand-50/50'
                    }
                  `}
                >
                  {/* Suggested Badge */}
                  {isSuggested && (
                    <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 bg-accent-500 text-white text-xs font-medium rounded-full shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      Suggested
                    </div>
                  )}

                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 bg-brand-500 text-white text-xs font-medium rounded-full shadow-sm">
                      Current
                    </div>
                  )}

                  {/* Layout Preview */}
                  <div className="aspect-square bg-neutral-50 rounded-md mb-3 overflow-hidden border border-neutral-200">
                    <LayoutPreview kind={layout.kind} />
                  </div>

                  {/* Layout Name */}
                  <div className="text-center">
                    <h4 className={`text-sm font-semibold ${isSelected ? 'text-brand-700' : 'text-neutral-900'}`}>
                      {formatLayoutName(layout.kind)}
                    </h4>
                    <p className="text-xs text-neutral-500 mt-1">
                      {getLayoutDescription(layout).split('—')[0].trim()}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
