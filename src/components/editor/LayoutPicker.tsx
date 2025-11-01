import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, LayoutGrid, AlertTriangle } from 'lucide-react';
import { useProject } from '@/state/project.store';
import { getTemplateLayouts, getLayoutDescription, matchSlideToLayout } from '@/lib/layouts/utils';
import type { Slide } from '@/types/domain';

interface LayoutPickerProps {
  slide: Slide;
}

export function LayoutPicker({ slide }: LayoutPickerProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [pendingLayoutId, setPendingLayoutId] = useState<string | null>(null);
  const applyLayoutWithBlocks = useProject(s => s.applyLayoutWithBlocks);
  const autoMatchLayoutForSlide = useProject(s => s.autoMatchLayoutForSlide);

  const templateId = slide.templateId || 'minimal-pro';
  const layouts = getTemplateLayouts(templateId);

  // Get suggested layout based on current content
  const suggestedLayout = matchSlideToLayout(slide, templateId);
  const currentLayoutId = slide.layoutId || layouts[0]?.id;

  // Check if changing layout might be destructive
  const isLayoutChangeDestructive = (newLayoutId: string): boolean => {
    const newLayout = layouts.find(l => l.id === newLayoutId);
    const currentLayout = layouts.find(l => l.id === currentLayoutId);

    // If no layouts found, not destructive
    if (!newLayout || !currentLayout) return false;

    // If switching between very different layout types, warn user
    const layoutKindPairs = [
      ['title', 'cover'],    // Similar layouts
      ['list', 'two-col'],   // Similar layouts
    ];

    const areSimilar = layoutKindPairs.some(pair =>
      (pair.includes(newLayout.kind) && pair.includes(currentLayout.kind))
    );

    // Warn if layouts are different and not similar
    return newLayout.kind !== currentLayout.kind && !areSimilar && slide.blocks.length > 1;
  };

  const handleLayoutChange = (newLayoutId: string) => {
    if (newLayoutId === currentLayoutId) return;

    // Check if change might be destructive
    if (isLayoutChangeDestructive(newLayoutId)) {
      setPendingLayoutId(newLayoutId);
      setShowWarning(true);
    } else {
      // Apply immediately if not destructive and add necessary blocks
      applyLayoutWithBlocks(slide.id, templateId, newLayoutId);
    }
  };

  const confirmLayoutChange = () => {
    if (pendingLayoutId) {
      // Apply layout and add necessary blocks
      applyLayoutWithBlocks(slide.id, templateId, pendingLayoutId);
    }
    setShowWarning(false);
    setPendingLayoutId(null);
  };

  const cancelLayoutChange = () => {
    setShowWarning(false);
    setPendingLayoutId(null);
  };

  const handleAutoMatch = () => {
    autoMatchLayoutForSlide(slide.id, templateId);
  };

  if (layouts.length === 0) {
    // Template doesn't have schema-based layouts
    return null;
  }

  return (
    <div className="border-b border-brand-200/50 bg-white/50 backdrop-blur-sm">
      <div className="p-4 space-y-3">
        {/* Layout Selector */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-medium text-neutral-700">
            <LayoutGrid className="w-3.5 h-3.5" />
            Slide Layout
          </label>

          <select
            value={currentLayoutId}
            onChange={(e) => handleLayoutChange(e.target.value)}
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 hover:border-brand-400"
          >
            {layouts.map((layout) => (
              <option key={layout.id} value={layout.id}>
                {layout.kind.charAt(0).toUpperCase() + layout.kind.slice(1)} Layout
              </option>
            ))}
          </select>

          <p className="text-xs text-neutral-500">
            {(() => {
              const currentLayout = layouts.find(l => l.id === currentLayoutId);
              return currentLayout ? getLayoutDescription(currentLayout) : '';
            })()}
          </p>
        </div>

        {/* Auto-Match Button (only show if suggestion is different) */}
        {suggestedLayout && suggestedLayout.id !== currentLayoutId && (
          <button
            onClick={handleAutoMatch}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-md transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Use Suggested: {suggestedLayout.kind.charAt(0).toUpperCase() + suggestedLayout.kind.slice(1)}
          </button>
        )}
      </div>

      {/* Warning Modal - Rendered via Portal */}
      {showWarning && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 bg-amber-50 border-b border-amber-200">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900">Change Slide Layout?</h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <p className="text-sm text-neutral-700">
                Changing the layout will rearrange your existing blocks and may add new blocks required by the layout.
              </p>
              <p className="text-sm text-neutral-600">
                Your existing content will be preserved. Missing blocks will be added with placeholder text.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-4 bg-neutral-50 border-t border-neutral-200">
              <button
                onClick={cancelLayoutChange}
                className="flex-1 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLayoutChange}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-md hover:bg-brand-600 transition-colors"
              >
                Change Layout
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
