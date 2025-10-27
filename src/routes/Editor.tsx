import { useEffect, useState } from 'react';
import { useProject } from '@/state/project.store';
import { useAutosave } from '@/hooks/useAutosave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { SortableSlideCard } from '@/components/SortableSlideCard';
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
        <div className="grid grid-cols-[280px_minmax(0,1fr)_320px] h-dvh bg-base-200">
            {/* Left Sidebar - Slides List */}
            <aside className="bg-base-100 border-r border-base-300 flex flex-col">
                <div className="p-4 border-b border-base-300">
                    <h2 className="text-lg font-bold">Slides</h2>
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
                <div className="p-3 border-t border-base-300">
                    <button
                        onClick={addSlide}
                        className="btn btn-outline btn-primary btn-sm w-full"
                    >
                        <span className="text-lg">+</span> Add Slide
                    </button>
                </div>
            </aside>

            {/* Center Canvas */}
            <main className="flex items-center justify-center p-8 bg-base-200">
                <div className="card w-[540px] h-[540px] bg-base-100 shadow-xl">
                    <div className="card-body items-center justify-center text-center">
                        <h2 className="card-title text-2xl">{project.title}</h2>
                        {selectedSlide && selectedSlide.blocks.length > 0 && (
                            <div className="prose prose-sm max-w-none">
                                {selectedSlide.blocks.map((block) => (
                                    <div key={block.id}>
                                        {block.kind === 'title' && 'text' in block && (
                                            <h1 className="text-3xl font-bold mb-4">{block.text}</h1>
                                        )}
                                        {block.kind === 'subtitle' && 'text' in block && (
                                            <h2 className="text-xl text-base-content/70 mb-4">{block.text}</h2>
                                        )}
                                        {block.kind === 'body' && 'text' in block && (
                                            <p className="mb-4">{block.text}</p>
                                        )}
                                        {block.kind === 'bullets' && (
                                            <ul className="list-disc list-inside mb-4 text-left">
                                                {block.bullets.map((bullet, i) => (
                                                    <li key={i}>{bullet}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Right Sidebar - Inspector */}
            <aside className="bg-base-100 border-l border-base-300 flex flex-col overflow-y-auto">
                <div className="p-4 border-b border-base-300">
                    <h2 className="text-lg font-bold">Inspector</h2>
                </div>

                <div className="p-4 space-y-6">
                    {/* Project Section */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Project Title</span>
                        </label>
                        <input
                            type="text"
                            value={project.title}
                            onChange={(e) => updateProjectTitle(e.target.value)}
                            className="input input-bordered input-sm"
                            placeholder="Enter project title"
                        />
                    </div>

                    {/* Slide Controls */}
                    {selectedSlide && (
                        <>
                            <div className="divider">Slide Actions</div>
                            <div className="space-y-2">
                                <button
                                    onClick={() => duplicateSlide(selectedSlide.id)}
                                    className="btn btn-outline btn-sm w-full"
                                >
                                    📋 Duplicate
                                </button>
                                <button
                                    onClick={() => removeSlide(selectedSlide.id)}
                                    disabled={project.slides.length === 1}
                                    className="btn btn-error btn-outline btn-sm w-full"
                                >
                                    🗑️ Delete Slide
                                </button>
                            </div>
                        </>
                    )}

                    {/* Blocks Section */}
                    {selectedSlide && (
                        <>
                            <div className="divider">Content Blocks</div>
                            <div className="space-y-3">
                                {selectedSlide.blocks.map((block, idx) => (
                                    <div key={block.id} className="card card-compact bg-base-200">
                                        <div className="card-body space-y-2">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={block.kind}
                                                    onChange={(e) => convertBlockKind(selectedSlide.id, block.id, e.target.value as SlideBlock['kind'])}
                                                    className="select select-bordered select-xs flex-1"
                                                >
                                                    <option value="title">Title</option>
                                                    <option value="subtitle">Subtitle</option>
                                                    <option value="body">Body</option>
                                                    <option value="bullets">Bullets</option>
                                                </select>
                                                <button
                                                    onClick={() => removeBlock(selectedSlide.id, block.id)}
                                                    className="btn btn-error btn-outline btn-xs"
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
                                                                className="input input-bordered input-xs flex-1"
                                                                placeholder="Bullet point"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newBullets = block.bullets.filter((_, i) => i !== bulletIdx);
                                                                    updateBullets(selectedSlide.id, block.id, newBullets);
                                                                }}
                                                                className="btn btn-ghost btn-xs text-error"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => updateBullets(selectedSlide.id, block.id, [...block.bullets, ''])}
                                                        className="btn btn-outline btn-xs w-full"
                                                    >
                                                        + Add Bullet
                                                    </button>
                                                </div>
                                            ) : (
                                                <textarea
                                                    value={block.text}
                                                    onChange={(e) => updateBlock(selectedSlide.id, block.id, e.target.value)}
                                                    rows={block.kind === 'body' ? 4 : 2}
                                                    className="textarea textarea-bordered textarea-sm resize-none"
                                                    placeholder={`Enter ${block.kind}...`}
                                                />
                                            )}

                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => moveBlockUp(selectedSlide.id, block.id)}
                                                    disabled={idx === 0}
                                                    className="btn btn-ghost btn-xs flex-1"
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    onClick={() => moveBlockDown(selectedSlide.id, block.id)}
                                                    disabled={idx === selectedSlide.blocks.length - 1}
                                                    className="btn btn-ghost btn-xs flex-1"
                                                >
                                                    ↓
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="space-y-2">
                                    <label className="label-text font-semibold">Add Block</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => addBlock(selectedSlide.id, 'title')}
                                            className="btn btn-outline btn-xs"
                                        >
                                            + Title
                                        </button>
                                        <button
                                            onClick={() => addBlock(selectedSlide.id, 'subtitle')}
                                            className="btn btn-outline btn-xs"
                                        >
                                            + Subtitle
                                        </button>
                                        <button
                                            onClick={() => addBlock(selectedSlide.id, 'body')}
                                            className="btn btn-outline btn-xs"
                                        >
                                            + Body
                                        </button>
                                        <button
                                            onClick={() => addBlock(selectedSlide.id, 'bullets')}
                                            className="btn btn-outline btn-xs"
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
