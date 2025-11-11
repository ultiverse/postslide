import { useState } from 'react';
import { Plus, Type, List, Image as ImageIcon, Palette, Sparkles } from 'lucide-react';
import { Dropdown, DropdownMenu, DropdownItem, DropdownSection } from '@/components/ui/Dropdown';
import { IconButton } from '@/components/ui';
import type { SlideBlock } from '@/types/domain';

interface AddBlockDropdownProps {
  onAddBlock: (kind: SlideBlock['kind']) => void;
  position?: 'top' | 'bottom';
  align?: 'left' | 'right';
  variant?: 'icon' | 'button';
}

export function AddBlockDropdown({
  onAddBlock,
  position = 'bottom',
  align = 'right',
  variant = 'icon'
}: AddBlockDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAddBlock = (kind: SlideBlock['kind']) => {
    onAddBlock(kind);
    setIsOpen(false);
  };

  const trigger = variant === 'icon' ? (
    <IconButton
      icon={Plus}
      variant="ghost"
      size="sm"
      onClick={() => setIsOpen(!isOpen)}
      className="text-white hover:bg-white/20"
      title="Add Block"
    />
  ) : (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 active:bg-neutral-100"
    >
      <Plus className="h-4 w-4" />
      Add Block
    </button>
  );

  return (
    <Dropdown
      trigger={trigger}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      position={position}
      align={align}
    >
      <DropdownMenu>
        <DropdownSection label="Text">
          <DropdownItem icon={Type} label="Title" onClick={() => handleAddBlock('title')} />
          <DropdownItem icon={Type} label="Subtitle" onClick={() => handleAddBlock('subtitle')} />
          <DropdownItem icon={Type} label="Body" onClick={() => handleAddBlock('body')} />
          <DropdownItem icon={List} label="Bullets" onClick={() => handleAddBlock('bullets')} />
        </DropdownSection>

        <DropdownSection label="Visual" divider>
          <DropdownItem icon={ImageIcon} label="Image" onClick={() => handleAddBlock('image')} />
          <DropdownItem icon={Palette} label="Background" onClick={() => handleAddBlock('background')} />
          <DropdownItem icon={Sparkles} label="Decorative" onClick={() => handleAddBlock('decorative')} />
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}
