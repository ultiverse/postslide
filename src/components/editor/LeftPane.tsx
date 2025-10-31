import { useState } from 'react';
import { useProject } from '@/state/project.store';
import { SortableSlideCard } from '@/components/slides/SortableSlideCard';
import { IconButton } from '@/components/ui';
import { Plus, Pencil, Check } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export function LeftPane() {
    const project = useProject((s) => s.project);
    const selectedSlideId = useProject((s) => s.selectedSlideId);
    const setSelectedSlide = useProject((s) => s.setSelectedSlide);
    const updateProjectTitle = useProject((s) => s.updateProjectTitle);
    const addSlide = useProject((s) => s.addSlide);
    const moveSlideUp = useProject((s) => s.moveSlideUp);
    const moveSlideDown = useProject((s) => s.moveSlideDown);
    const reorderSlides = useProject((s) => s.reorderSlides);

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(project.title);

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = project.slides.findIndex((s) => s.id === active.id);
        const newIndex = project.slides.findIndex((s) => s.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;

        const newSlides = arrayMove(project.slides, oldIndex, newIndex);
        reorderSlides(newSlides);
    };

    const handleEditClick = () => {
        setEditedTitle(project.title);
        setIsEditingTitle(true);
    };

    const handleSaveTitle = () => {
        if (editedTitle.trim()) {
            updateProjectTitle(editedTitle.trim());
        }
        setIsEditingTitle(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSaveTitle();
        } else if (e.key === 'Escape') {
            setEditedTitle(project.title);
            setIsEditingTitle(false);
        }
    };

    return (
        <aside className="flex flex-col border-r border-brand-200/50 bg-white/80 shadow-sm backdrop-blur-sm">
            {/* Project Title Header */}
            <div className="border-b border-brand-200/50 bg-gradient-to-r from-brand-500 to-accent-500 p-4">
                {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleSaveTitle}
                            autoFocus
                            className="flex-1 min-w-0 rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 text-lg font-bold text-white placeholder-white/60 transition-colors focus:border-white focus:bg-white/30 focus:outline-none"
                            placeholder="Enter project title"
                        />
                        <IconButton
                            icon={Check}
                            variant="ghost"
                            size="sm"
                            onClick={handleSaveTitle}
                            className="flex-shrink-0 text-white hover:bg-white/20"
                            title="Save"
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-2">
                        <h2 className="text-lg font-bold text-white truncate">{project.title || 'Untitled Project'}</h2>
                        <IconButton
                            icon={Pencil}
                            variant="ghost"
                            size="sm"
                            onClick={handleEditClick}
                            className="text-white hover:bg-white/20"
                            title="Edit Project Title"
                        />
                    </div>
                )}
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                    items={project.slides.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="flex-1 space-y-2 overflow-y-auto p-3">
                        {project.slides.map((s, idx) => (
                            <SortableSlideCard
                                key={s.id}
                                slide={s}
                                index={idx}
                                isSelected={s.id === selectedSlideId}
                                onSelect={() => setSelectedSlide(s.id)}
                                onMoveUp={() => moveSlideUp(s.id)}
                                onMoveDown={() => moveSlideDown(s.id)}
                                totalSlides={project.slides.length}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <div className="border-t border-brand-200/50 bg-gradient-to-r from-brand-50/50 to-accent-50/30 p-3">
                <button
                    onClick={() => addSlide()}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-accent-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-brand-600 hover:to-accent-600 hover:shadow-md active:from-brand-700 active:to-accent-700"
                >
                    <Plus className="h-4 w-4" />
                    Add Slide
                </button>
            </div>
        </aside>
    );
}
