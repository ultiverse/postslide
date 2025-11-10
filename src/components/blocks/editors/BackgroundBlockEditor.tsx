import type { BackgroundBlock } from '@/types/domain';

interface BackgroundBlockEditorProps {
  slideId: string;
  block: BackgroundBlock;
  onUpdate: (slideId: string, blockId: string, updates: Partial<BackgroundBlock>) => void;
}

export function BackgroundBlockEditor({ slideId, block, onUpdate }: BackgroundBlockEditorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-neutral-700">
        Background Style
      </label>
      <select
        value={block.style}
        onChange={(e) =>
          onUpdate(slideId, block.id, { style: e.target.value as 'solid' | 'gradient' | 'image' })
        }
        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-colors focus:border-brand-500 focus:outline-none"
      >
        <option value="solid">Solid Color</option>
        <option value="gradient">Gradient</option>
        <option value="image">Image</option>
      </select>

      {block.style === 'solid' && (
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Color
          </label>
          <input
            type="color"
            value={block.color || '#ffffff'}
            onChange={(e) =>
              onUpdate(slideId, block.id, { color: e.target.value })
            }
            className="w-full h-10 rounded-md border border-neutral-300 cursor-pointer"
          />
        </div>
      )}

      {block.style === 'gradient' && block.gradient && (
        <>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              From Color
            </label>
            <input
              type="color"
              value={block.gradient.from}
              onChange={(e) =>
                onUpdate(slideId, block.id, {
                  gradient: { ...block.gradient!, from: e.target.value }
                })
              }
              className="w-full h-10 rounded-md border border-neutral-300 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              To Color
            </label>
            <input
              type="color"
              value={block.gradient.to}
              onChange={(e) =>
                onUpdate(slideId, block.id, {
                  gradient: { ...block.gradient!, to: e.target.value }
                })
              }
              className="w-full h-10 rounded-md border border-neutral-300 cursor-pointer"
            />
          </div>
        </>
      )}

      {block.style === 'image' && (
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Image URL
          </label>
          <input
            type="text"
            value={block.image || ''}
            onChange={(e) =>
              onUpdate(slideId, block.id, { image: e.target.value })
            }
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            placeholder="https://example.com/bg.jpg"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-neutral-700 mb-1">
          Opacity
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={block.opacity ?? 1}
          onChange={(e) =>
            onUpdate(slideId, block.id, { opacity: parseFloat(e.target.value) })
          }
          className="w-full"
        />
        <span className="text-xs text-neutral-500">{Math.round((block.opacity ?? 1) * 100)}%</span>
      </div>
    </div>
  );
}
