import { useEffect, useState } from 'react';
import { useProject } from '@/state/project.store';
import { useAutosave } from '@/hooks/useAutosave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { SortableSlideCard } from '@/components/SortableSlideCard';
import Canvas from '@/components/Canvas/Canvas';
import type { SlideBlock } from '@/types/domain';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

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

    const selectedSlide = project.slides.find((s) => s.id === selectedSlideId);

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = project.slides.findIndex((s) => s.id === active.id);
            const newIndex = project.slides.findIndex((s) => s.id === over.id);
            const newSlides = arrayMove(project.slides, oldIndex, newIndex);
            reorderSlides(newSlides);
        }
    };

    const [w, setW] = useState<number>(window.innerWidth);
    useEffect(() => {
        const onResize = () => setW(window.innerWidth);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    if (w < MIN_WIDTH) {
        return (
            <div className="h-dvh grid place-items-center p-6 text-center">
                <div>
                    <h2 className="text-xl font-semibold mb-2">Desktop required</h2>
                    <p>Please use a screen at least {MIN_WIDTH}px wide to edit. You can still preview on mobile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-[280px_minmax(0,1fr)_320px] h-dvh bg-neutral-50">
            {/* Left Sidebar - Slides List */}
            <aside className="bg-white border-r border-neutral-200 flex flex-col">
                <div className="p-4 border-b border-neutral-200">
                    <h2 className="text-lg font-bold text-neutral-900">Slides</h2>
                </div>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={project.slides.map((s) => s.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
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
                <div className="p-3 border-t border-neutral-200">
                    <button
                        onClick={addSlide}
                        className="w-full px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 active:bg-brand-700 transition-colors cursor-pointer"
                    >
                        <span className="text-lg">+</span> Add Slide
                    </button>
                </div>
            </aside>

            {/* Center Canvas */}
            <main className="flex items-center justify-center bg-neutral-50 relative">
                <Canvas />
                {/* Grid Toggle */}
                <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md border border-neutral-200 px-4 py-3">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                        <span className="text-sm font-medium text-neutral-700">Show Grid</span>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={useProject(s => s.showGrid)}
                            onClick={() => useProject.getState().toggleGrid()}
                            className="relative inline-flex h-6 w-12 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                            style={{
                                backgroundColor: useProject(s => s.showGrid) ? '#4a67ff' : '#d1d5db'
                            }}
                        >
                            <span
                                aria-hidden="true"
                                className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
                                style={{
                                    transform: useProject(s => s.showGrid) ? 'translateX(1.5rem)' : 'translateX(0)'
                                }}
                            />
                        </button>
                    </label>
                </div>
            </main>

            {/* Right Sidebar - Inspector */}
            <aside className="bg-white border-l border-neutral-200 flex flex-col overflow-y-auto">
                <div className="p-4 border-b border-neutral-200">
                    <h2 className="text-lg font-bold text-neutral-900">Inspector</h2>
                </div>

                <div className="p-4 space-y-6">
                    {/* Project Section */}
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-neutral-800">
                            Project Title
                        </label>
                        <input
                            type="text"
                            value={project.title}
                            onChange={(e) => updateProjectTitle(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
                            placeholder="Enter project title"
                        />
                    </div>

                    {/* Slide Controls */}
                    {selectedSlide && (
                        <div className="bg-neutral-100 -mx-4 px-4 py-3 space-y-2">
                            <button
                                onClick={() => duplicateSlide(selectedSlide.id)}
                                className="w-full px-4 py-2 text-sm font-medium text-neutral-800 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer"
                            >
                                📋 Duplicate
                            </button>
                            <button
                                onClick={() => removeSlide(selectedSlide.id)}
                                disabled={project.slides.length === 1}
                                className="w-full px-4 py-2 text-sm font-medium text-error bg-white border border-error rounded-lg hover:bg-error/10 active:bg-error/20 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                🗑️ Delete Slide
                            </button>
                        </div>
                    )}

                    {/* Blocks Section */}
                    {selectedSlide && (
                        <>
                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-neutral-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-neutral-600 font-medium">Content Blocks</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {selectedSlide.blocks.map((block, idx) => (
                                    <div key={block.id} className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 space-y-2.5 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={block.kind}
                                                onChange={(e) => convertBlockKind(selectedSlide.id, block.id, e.target.value as SlideBlock['kind'])}
                                                className="flex-1 px-2 py-1 text-xs bg-white border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
                                            >
                                                <option value="title">Title</option>
                                                <option value="subtitle">Subtitle</option>
                                                <option value="body">Body</option>
                                                <option value="bullets">Bullets</option>
                                            </select>
                                            <button
                                                onClick={() => removeBlock(selectedSlide.id, block.id)}
                                                className="px-2 py-1 text-xs font-medium text-error bg-white border border-error rounded-md hover:bg-error/10 active:bg-error/20 transition-colors cursor-pointer"
                                            >
                                                ✕
                                            </button>
                                        </div>

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
                                                            className="flex-1 px-2 py-1 text-xs bg-white border border-neutral-300 rounded-md focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
                                                            placeholder="Bullet point"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const newBullets = block.bullets.filter((_, i) => i !== bulletIdx);
                                                                updateBullets(selectedSlide.id, block.id, newBullets);
                                                            }}
                                                            className="px-2 py-1 text-xs text-error hover:bg-error/10 rounded-md transition-colors cursor-pointer"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => updateBullets(selectedSlide.id, block.id, [...block.bullets, ''])}
                                                    className="w-full px-2 py-1 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer"
                                                >
                                                    + Add Bullet
                                                </button>
                                            </div>
                                        ) : 'text' in block ? (
                                            <textarea
                                                value={block.text}
                                                onChange={(e) => updateBlock(selectedSlide.id, block.id, e.target.value)}
                                                rows={block.kind === 'body' ? 4 : 2}
                                                className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded-md resize-none focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
                                                placeholder={`Enter ${block.kind}...`}
                                            />
                                        ) : null}

                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => moveBlockUp(selectedSlide.id, block.id)}
                                                disabled={idx === 0}
                                                className="flex-1 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                ↑
                                            </button>
                                            <button
                                                onClick={() => moveBlockDown(selectedSlide.id, block.id)}
                                                disabled={idx === selectedSlide.blocks.length - 1}
                                                className="flex-1 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                ↓
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-neutral-800">Add Block</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => addBlock(selectedSlide.id, 'title')}
                                            className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer"
                                        >
                                            + Title
                                        </button>
                                        <button
                                            onClick={() => addBlock(selectedSlide.id, 'subtitle')}
                                            className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer"
                                        >
                                            + Subtitle
                                        </button>
                                        <button
                                            onClick={() => addBlock(selectedSlide.id, 'body')}
                                            className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer"
                                        >
                                            + Body
                                        </button>
                                        <button
                                            onClick={() => addBlock(selectedSlide.id, 'bullets')}
                                            className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer"
                                        >
                                            + Bullets
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </aside>
        </div>
    );
}
