import { useRef } from 'react';
import { Plus } from 'lucide-react';
import { BulletInput } from '@/components/blocks/inputs';
import type { TextBlock } from '@/types/domain';

interface BulletsEditorProps {
  slideId: string;
  block: Extract<TextBlock, { kind: 'bullets' }>;
  onUpdate: (slideId: string, blockId: string, bullets: string[]) => void;
}

export function BulletsEditor({ slideId, block, onUpdate }: BulletsEditorProps) {
  const justAddedBulletRef = useRef<boolean>(false);

  const handleBulletChange = (bulletIdx: number, value: string) => {
    const newBullets = [...block.bullets];
    newBullets[bulletIdx] = value;
    onUpdate(slideId, block.id, newBullets);
  };

  const handleBulletRemove = (bulletIdx: number) => {
    const newBullets = block.bullets.filter((_, i) => i !== bulletIdx);
    onUpdate(slideId, block.id, newBullets);
  };

  const handleAddBullet = () => {
    justAddedBulletRef.current = true;
    onUpdate(slideId, block.id, [...block.bullets, '']);
    // Reset the flag after the component has rendered
    setTimeout(() => {
      justAddedBulletRef.current = false;
    }, 100);
  };

  return (
    <div className="space-y-1">
      {block.bullets.map((bullet, bulletIdx) => {
        const isLastBullet = bulletIdx === block.bullets.length - 1;
        const isEmptyBullet = bullet === '';
        const shouldAutoFocus = isLastBullet && isEmptyBullet && justAddedBulletRef.current;

        return (
          <BulletInput
            key={bulletIdx}
            value={bullet}
            onChange={(value) => handleBulletChange(bulletIdx, value)}
            onRemove={() => handleBulletRemove(bulletIdx)}
            autoFocus={shouldAutoFocus}
          />
        );
      })}

      <button
        onClick={handleAddBullet}
        className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 active:bg-neutral-100"
      >
        <Plus className="h-3 w-3" />
        Add Bullet
      </button>
    </div>
  );
}
