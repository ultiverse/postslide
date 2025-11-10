import type { SlideBlock } from '@/types/domain';

interface BlockKindSelectorProps {
  value: SlideBlock['kind'];
  onChange: (kind: SlideBlock['kind']) => void;
  disabled?: boolean;
}

export function BlockKindSelector({ value, onChange, disabled = false }: BlockKindSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SlideBlock['kind'])}
      className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      disabled={disabled}
    >
      <optgroup label="Text">
        <option value="title">Title</option>
        <option value="subtitle">Subtitle</option>
        <option value="body">Body</option>
        <option value="bullets">Bullets</option>
      </optgroup>
      <optgroup label="Visual">
        <option value="image">Image</option>
        <option value="background">Background</option>
        <option value="decorative">Decorative</option>
      </optgroup>
    </select>
  );
}
