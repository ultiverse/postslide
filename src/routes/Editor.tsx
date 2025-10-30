import { useEffect, useState } from 'react';
import { useProject } from '@/state/project.store';
import { useAutosave } from '@/hooks/useAutosave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { SortableSlideCard } from '@/components/slides/SortableSlideCard';
import Canvas from '@/components/canvas';
import { IconButton, Toggle } from '@/components/ui';
import { SortableBlockCard } from '@/components/blocks/SortableBlockCard';
import type { SlideBlock } from '@/types/domain';
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
import { Plus, Copy, Trash2, X } from 'lucide-react';

const MIN_WIDTH = 1024;

export default function Editor() {
    useAutosave();
    useKeyboardShortcuts();

    const project = useProject((s) => s.project);
    const selectedSlideId = useProject((s) => s.selectedSlideId);
    const setSelectedSlide = useProject((s) => s.setSelectedSlide);
    const updateProjectTitle = useProject((s) => s.updateProjectTitle);
    const addSlide = useProject((s) => s.addSlide);
    const duplicateSlide = useProject((s) => s.duplicateSlide);
    const removeSlide = useProject((s) => s.removeSlide);
    const moveSlideUp = useProject((s) => s.moveSlideUp);
    const moveSlideDown = useProject((s) => s.moveSlideDown);
    const reorderSlides = useProject((s) => s.reorderSlides);
    const addBlock = useProject((s) => s.addBlock);
    const updateBlock = useProject((s) => s.updateBlock);
    const updateBullets = useProject((s) => s.updateBullets);
    const removeBlock = useProject((s) => s.removeBlock);
    const moveBlockUp = useProject((s) => s.moveBlockUp);
    const moveBlockDown = useProject((s) => s.moveBlockDown);
    const convertBlockKind = useProject((s) => s.convertBlockKind);
    const reorderBlocks = useProject((s) => s.reorderBlocks);
    const showGrid = useProject((s) => s.showGrid);

    const selectedSlide = project.slides.find((s) => s.id === selectedSlideId);

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

    const handleBlockDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!selectedSlide || !over || active.id === over.id) return;

        const oldIndex = selectedSlide.blocks.findIndex((b) => b.id === active.id);
        const newIndex = selectedSlide.blocks.findIndex((b) => b.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;

        const newBlocks = arrayMove(selectedSlide.blocks, oldIndex, newIndex);
        reorderBlocks(selectedSlide.id, newBlocks);
    };

    // SSR-safe initial width
    const [w, setW] = useState<number>(() =>
        typeof window !== 'undefined' ? window.innerWidth : MIN_WIDTH,
    );
    useEffect(() => {
        const onResize = () => setW(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    if (w < MIN_WIDTH) {
        return (
            <div className="h-dvh grid place-items-center p-6 text-center">
                <div>
                    <h2 className="mb-2 text-xl font-semibold">Desktop required</h2>
                    <p>
                        Please use a screen at least {MIN_WIDTH}px wide to edit. You can still
                        preview on mobile.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid h-dvh grid-cols-[280px_minmax(0,1fr)_320px] bg-gradient-to-br from-brand-50 via-white to-accent-400/5">
            {/* Left Sidebar - Slides List */}
            <aside className="flex flex-col border-r border-brand-200/50 bg-white/80 shadow-sm backdrop-blur-sm">
                <div className="border-b border-brand-200/50 bg-gradient-to-r from-brand-500 to-accent-500 p-4">
                    <h2 className="text-lg font-bold text-white">Slides</h2>
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
                        onClick={addSlide}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-500 to-accent-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:from-brand-600 hover:to-accent-600 hover:shadow-md active:from-brand-700 active:to-accent-700"
                    >
                        <Plus className="h-4 w-4" />
                        Add Slide
                    </button>
                </div>
            </aside>

            {/* Center Canvas */}
            <main className="relative flex items-center justify-center">
                <Canvas />

                {/* Grid Toggle */}
                <div className="absolute right-4 top-4 rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-md">
                    <Toggle
                        label="Show Grid"
                        checked={showGrid}
                        onCheckedChange={useProject.getState().toggleGrid}
                    />
                </div>
            </main>

            {/* Right Sidebar - Inspector */}
            <aside className="flex flex-col overflow-y-auto border-l border-brand-200/50 bg-white/80 shadow-sm backdrop-blur-sm">
                <div className="border-b border-brand-200/50 bg-gradient-to-r from-accent-500 to-brand-500 p-4">
                    <h2 className="text-lg font-bold text-white">Inspector</h2>
                </div>

                <div className="space-y-6 p-4">
                    {/* Project Section */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-neutral-800">Project Title</label>
                        <input
                            type="text"
                            value={project.title}
                            onChange={(e) => updateProjectTitle(e.target.value)}
                            className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
                            placeholder="Enter project title"
                        />
                    </div>

                    {/* Slide Controls */}
                    {selectedSlide && (
                        <div className="-mx-4 space-y-2 border-y border-brand-200/30 bg-gradient-to-r from-brand-50/50 to-accent-50/30 px-4 py-3">
                            <button
                                onClick={() => duplicateSlide(selectedSlide.id)}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-brand-300 bg-white px-4 py-2 text-sm font-medium text-brand-700 shadow-sm transition-all hover:bg-brand-50 hover:shadow active:bg-brand-100"
                            >
                                <Copy className="h-4 w-4" />
                                Duplicate
                            </button>
                            <button
                                onClick={() => removeSlide(selectedSlide.id)}
                                disabled={project.slides.length === 1}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-error bg-white px-4 py-2 text-sm font-medium text-error shadow-sm transition-all hover:bg-error/10 hover:shadow active:bg-error/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Slide
                            </button>
                        </div>
                    )}

                    {/* Blocks Section */}
                    {selectedSlide && (
                        <>
                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-neutral-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white px-2 font-medium text-neutral-600">
                                        Content Blocks
                                    </span>
                                </div>
                            </div>

                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleBlockDragEnd}
                            >
                                <SortableContext
                                    items={selectedSlide.blocks.map((b) => b.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-3">
                                        {selectedSlide.blocks.map((block, idx) => (
                                            <SortableBlockCard
                                                id={block.id}
                                                key={block.id}
                                                onMoveUp={() => moveBlockUp(selectedSlide.id, block.id)}
                                                onMoveDown={() => moveBlockDown(selectedSlide.id, block.id)}
                                                onRemove={() => removeBlock(selectedSlide.id, block.id)}
                                                canMoveUp={idx > 0}
                                                canMoveDown={idx < selectedSlide.blocks.length - 1}
                                            >
                                                <div className="space-y-2.5">
                                                    <select
                                                        value={block.kind}
                                                        onChange={(e) =>
                                                            convertBlockKind(
                                                                selectedSlide.id,
                                                                block.id,
                                                                e.target.value as SlideBlock['kind'],
                                                            )
                                                        }
                                                        className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                                    >
                                                        <option value="title">Title</option>
                                                        <option value="subtitle">Subtitle</option>
                                                        <option value="body">Body</option>
                                                        <option value="bullets">Bullets</option>
                                                    </select>

                                                    {block.kind === 'bullets' ? (
                                                        <div className="space-y-1">
                                                            {block.bullets.map((bullet, bulletIdx) => (
                                                                <div key={bulletIdx} className="flex gap-1">
                                                                    <input
                                                                        type="text"
                                                                        value={bullet}
                                                                        onChange={(e) => {
                                                                            const newBullets = [...block.bullets];
                                                                            newBullets[bulletIdx] = e.target.value;
                                                                            updateBullets(selectedSlide.id, block.id, newBullets);
                                                                        }}
                                                                        className="flex-1 rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                                                        placeholder="Bullet point"
                                                                    />
                                                                    <IconButton
                                                                        icon={X}
                                                                        onClick={() => {
                                                                            const newBullets = block.bullets.filter(
                                                                                (_, i) => i !== bulletIdx,
                                                                            );
                                                                            updateBullets(selectedSlide.id, block.id, newBullets);
                                                                        }}
                                                                        variant="ghost"
                                                                        size="xs"
                                                                        title="Remove bullet"
                                                                        className="text-error hover:bg-error/10"
                                                                    />
                                                                </div>
                                                            ))}

                                                            <button
                                                                onClick={() =>
                                                                    updateBullets(selectedSlide.id, block.id, [
                                                                        ...block.bullets,
                                                                        '',
                                                                    ])
                                                                }
                                                                className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 active:bg-neutral-100"
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                                Add Bullet
                                                            </button>
                                                        </div>
                                                    ) : 'text' in block ? (
                                                        <textarea
                                                            value={block.text}
                                                            onChange={(e) =>
                                                                updateBlock(selectedSlide.id, block.id, e.target.value)
                                                            }
                                                            rows={block.kind === 'body' ? 4 : 2}
                                                            className="w-full resize-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                                            placeholder={`Enter ${block.kind}...`}
                                                        />
                                                    ) : null}
                                                </div>
                                            </SortableBlockCard>
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>

                            {/* Add Block */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-neutral-800">
                                    Add Block
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => addBlock(selectedSlide.id, 'title')}
                                        className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 active:bg-neutral-100"
                                    >
                                        <Plus className="h-3 w-3" />
                                        Title
                                    </button>
                                    <button
                                        onClick={() => addBlock(selectedSlide.id, 'subtitle')}
                                        className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 active:bg-neutral-100"
                                    >
                                        <Plus className="h-3 w-3" />
                                        Subtitle
                                    </button>
                                    <button
                                        onClick={() => addBlock(selectedSlide.id, 'body')}
                                        className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 active:bg-neutral-100"
                                    >
                                        <Plus className="h-3 w-3" />
                                        Body
                                    </button>
                                    <button
                                        onClick={() => addBlock(selectedSlide.id, 'bullets')}
                                        className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 active:bg-neutral-100"
                                    >
                                        <Plus className="h-3 w-3" />
                                        Bullets
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </aside>
        </div>
    );
}
