import { useProject } from '@/state/project.store';
import { SortableBlockCard } from '@/components/blocks/SortableBlockCard';
import { IconButton } from '@/components/ui';
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
import { Plus, X } from 'lucide-react';

export function RightPane() {
    const project = useProject((s) => s.project);
    const selectedSlideId = useProject((s) => s.selectedSlideId);
    const addBlock = useProject((s) => s.addBlock);
    const updateBlock = useProject((s) => s.updateBlock);
    const updateBullets = useProject((s) => s.updateBullets);
    const removeBlock = useProject((s) => s.removeBlock);
    const moveBlockUp = useProject((s) => s.moveBlockUp);
    const moveBlockDown = useProject((s) => s.moveBlockDown);
    const convertBlockKind = useProject((s) => s.convertBlockKind);
    const reorderBlocks = useProject((s) => s.reorderBlocks);

    const selectedSlide = project.slides.find((s) => s.id === selectedSlideId);

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleBlockDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!selectedSlide || !over || active.id === over.id) return;

        const oldIndex = selectedSlide.blocks.findIndex((b) => b.id === active.id);
        const newIndex = selectedSlide.blocks.findIndex((b) => b.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return;

        const newBlocks = arrayMove(selectedSlide.blocks, oldIndex, newIndex);
        reorderBlocks(selectedSlide.id, newBlocks);
    };

    return (
        <aside className="flex flex-col overflow-y-auto border-l border-brand-200/50 bg-white/80 shadow-sm backdrop-blur-sm">
            <div className="border-b border-brand-200/50 bg-gradient-to-r from-accent-500 to-brand-500 p-4">
                <h2 className="text-lg font-bold text-white">Inspector</h2>
            </div>

            <div className="space-y-6 p-4">
                {/* Blocks Section */}
                {selectedSlide ? (
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
                ) : (
                    <div className="text-center text-sm text-neutral-500 py-8">
                        Select a slide to edit its content
                    </div>
                )}
            </div>
        </aside>
    );
}
