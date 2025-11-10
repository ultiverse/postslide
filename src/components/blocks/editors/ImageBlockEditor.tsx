import type { ImageBlock } from '@/types/domain';

interface ImageBlockEditorProps {
  slideId: string;
  block: ImageBlock;
  onUpdate: (slideId: string, blockId: string, updates: Partial<ImageBlock>) => void;
}

export function ImageBlockEditor({ slideId, block, onUpdate }: ImageBlockEditorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-neutral-700">
        Image URL
      </label>
      <input
        type="text"
        value={block.src}
        onChange={(e) => onUpdate(slideId, block.id, { src: e.target.value })}
        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        placeholder="https://example.com/image.jpg"
      />

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Width (px)
          </label>
          <input
            type="number"
            value={block.width || ''}
            onChange={(e) =>
              onUpdate(slideId, block.id, {
                width: e.target.value ? parseInt(e.target.value) : undefined
              })
            }
            className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm transition-colors focus:border-brand-500 focus:outline-none"
            placeholder="Auto"
            min="50"
            max="952"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">
            Height (px)
          </label>
          <input
            type="number"
            value={block.height || ''}
            onChange={(e) =>
              onUpdate(slideId, block.id, {
                height: e.target.value ? parseInt(e.target.value) : undefined
              })
            }
            className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm transition-colors focus:border-brand-500 focus:outline-none"
            placeholder="300"
            min="50"
            max="952"
          />
        </div>
      </div>

      <label className="block text-xs font-medium text-neutral-700">
        Object Fit
      </label>
      <select
        value={block.fit || 'cover'}
        onChange={(e) =>
          onUpdate(slideId, block.id, { fit: e.target.value as 'cover' | 'contain' | 'fill' })
        }
        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-colors focus:border-brand-500 focus:outline-none"
      >
        <option value="cover">Cover</option>
        <option value="contain">Contain</option>
        <option value="fill">Fill</option>
      </select>
      <p className="text-xs text-neutral-500">
        Images flow with text blocks. Leave width empty for full width.
      </p>
    </div>
  );
}
