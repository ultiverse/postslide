import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BlockCard } from '@/components/blocks/BlockCard';

interface SortableBlockCardProps {
  id: string;
  children: React.ReactNode;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  headerContent?: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
  styleControls?: React.ReactNode;
}

export function SortableBlockCard({
  id,
  children,
  onMoveUp,
  onMoveDown,
  onRemove,
  canMoveUp,
  canMoveDown,
  headerContent,
  onClick,
  isSelected,
  styleControls,
}: SortableBlockCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <BlockCard
        dragHandleProps={{ ...attributes, ...listeners }}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemove={onRemove}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        headerContent={headerContent}
        onClick={onClick}
        isSelected={isSelected}
        styleControls={styleControls}
      >
        {children}
      </BlockCard>
    </div>
  );
}
