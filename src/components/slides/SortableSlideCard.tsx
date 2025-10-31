import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import type { SlideBlock } from '@/types/domain';
import { isTextBlock } from '@/lib/constants/blocks';

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

    // Find the first text block (title, subtitle, or body) for the slide title
    const firstTextBlock = slide.blocks.find(block => isTextBlock(block) && 'text' in block);
    const blockText = firstTextBlock && 'text' in firstTextBlock ? firstTextBlock.text : '';
    const slideTitle = blockText.trim() === '' ? 'Untitled slide' : blockText;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`rounded-lg transition-all border cursor-pointer ${
                isSelected
                    ? 'bg-brand-50 border-brand-500 shadow-sm ring-1 ring-brand-500'
                    : 'bg-white hover:bg-neutral-50 border-neutral-200 hover:border-neutral-300'
            }`}
            onClick={onSelect}
        >
            <div className="p-2.5">
                <div className="flex items-center gap-2">
                    <div
                        {...attributes}
                        {...listeners}
                        className={`cursor-grab active:cursor-grabbing p-1 rounded transition-colors ${
                            isSelected ? 'hover:bg-brand-100 text-brand-700' : 'hover:bg-neutral-100 text-neutral-600'
                        }`}
                        title="Drag to reorder"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onMoveUp();
                            }}
                            disabled={index === 0}
                            className={`h-4 px-0.5 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                                isSelected ? 'hover:bg-brand-100 text-brand-700' : 'hover:bg-neutral-100 text-neutral-600'
                            }`}
                            title="Move up"
                        >
                            <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onMoveDown();
                            }}
                            disabled={index === totalSlides - 1}
                            className={`h-4 px-0.5 rounded transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                                isSelected ? 'hover:bg-brand-100 text-brand-700' : 'hover:bg-neutral-100 text-neutral-600'
                            }`}
                            title="Move down"
                        >
                            <ChevronDown className="h-3 w-3" />
                        </button>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        isSelected ? 'bg-brand-500 text-white' : 'bg-neutral-200 text-neutral-700'
                    }`}>{index + 1}</span>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm line-clamp-2 ${
                            isSelected ? 'text-brand-900 font-medium' : 'text-neutral-700'
                        } ${slideTitle === 'Untitled slide' ? 'text-neutral-400 italic' : ''}`}>
                            {slideTitle}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
