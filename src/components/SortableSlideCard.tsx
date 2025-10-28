import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { SlideBlock } from '@/types/domain';

interface SortableSlideCardProps {
    slide: { id: string; blocks: SlideBlock[] };
    index: number;
    isSelected: boolean;
    onSelect: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    totalSlides: number;
}

export function SortableSlideCard({
    slide,
    index,
    isSelected,
    onSelect,
    onMoveUp,
    onMoveDown,
    totalSlides,
}: SortableSlideCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: slide.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const slideTitle = slide.blocks[0] && 'text' in slide.blocks[0] ? slide.blocks[0].text : 'Untitled slide';

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`card transition-all border ${
                isSelected
                    ? 'bg-brand-500 text-white shadow-md border-brand-600'
                    : 'bg-neutral-100 hover:bg-neutral-200 border-neutral-200'
            }`}
        >
            <div className="card-body p-2.5">
                <div className="flex items-center gap-2">
                    <div
                        {...attributes}
                        {...listeners}
                        className={`cursor-grab active:cursor-grabbing p-1 rounded transition-colors ${
                            isSelected ? 'hover:bg-brand-600' : 'hover:bg-neutral-300'
                        }`}
                        title="Drag to reorder"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M3 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm5-8a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm5-8a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                        </svg>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onMoveUp();
                            }}
                            disabled={index === 0}
                            className="btn btn-ghost btn-xs h-4 min-h-0 px-1 cursor-pointer disabled:cursor-not-allowed"
                            title="Move up"
                        >
                            ▲
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onMoveDown();
                            }}
                            disabled={index === totalSlides - 1}
                            className="btn btn-ghost btn-xs h-4 min-h-0 px-1 cursor-pointer disabled:cursor-not-allowed"
                            title="Move down"
                        >
                            ▼
                        </button>
                    </div>
                    <span className="badge badge-sm badge-ghost">{index + 1}</span>
                    <div
                        className="flex-1 cursor-pointer"
                        onClick={onSelect}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onSelect();
                            }
                        }}
                    >
                        <p className="text-sm line-clamp-2">
                            {slideTitle}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
