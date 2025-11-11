import type { TextBlock } from '@/types/domain';

interface TextEditorProps {
  slideId: string;
  block: Extract<TextBlock, { text: string }>;
  onUpdate: (slideId: string, blockId: string, text: string) => void;
}

export function TextEditor({ slideId, block, onUpdate }: TextEditorProps) {
  const rows = block.kind === 'body' ? 4 : 2;

  return (
    <textarea
      value={block.text}
      onChange={(e) => onUpdate(slideId, block.id, e.target.value)}
      rows={rows}
      className="w-full resize-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      placeholder={`Enter ${block.kind}...`}
    />
  );
}
