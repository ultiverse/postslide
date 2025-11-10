import type { DecorativeBlock } from '@/types/domain';

interface DecorativeBlockEditorProps {
  slideId: string;
  block: DecorativeBlock;
  onUpdate: (slideId: string, blockId: string, updates: Partial<DecorativeBlock>) => void;
}

const VARIANT_DESCRIPTIONS: Record<DecorativeBlock['variant'], string> = {
  arrow: 'Directional arrow indicator',
  divider: 'Horizontal line separator',
  accent: 'Visual accent element',
  shape: 'Geometric shape',
  icon: 'Icon element',
};

export function DecorativeBlockEditor({ slideId, block, onUpdate }: DecorativeBlockEditorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-neutral-700">
        Decorative Type
      </label>
      <select
        value={block.variant}
        onChange={(e) =>
          onUpdate(slideId, block.id, { variant: e.target.value as DecorativeBlock['variant'] })
        }
        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-colors focus:border-brand-500 focus:outline-none"
      >
        <option value="arrow">Arrow</option>
        <option value="divider">Divider</option>
        <option value="accent">Accent</option>
        <option value="shape">Shape</option>
        <option value="icon">Icon</option>
      </select>
      <p className="text-xs text-neutral-500">
        {VARIANT_DESCRIPTIONS[block.variant]}
      </p>
    </div>
  );
}
