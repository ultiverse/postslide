import { AddBlockDropdown } from './AddBlockDropdown';
import type { SlideBlock } from '@/types/domain';

interface InspectorHeaderProps {
  hasSlide: boolean;
  onAddBlock: (kind: SlideBlock['kind']) => void;
}

export function InspectorHeader({ hasSlide, onAddBlock }: InspectorHeaderProps) {
  return (
    <div className="relative border-b border-brand-200/50 bg-gradient-to-r from-accent-500 to-brand-500 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Inspector</h2>
        {hasSlide && (
          <AddBlockDropdown
            onAddBlock={onAddBlock}
            position="bottom"
            align="right"
            variant="icon"
          />
        )}
      </div>
    </div>
  );
}
