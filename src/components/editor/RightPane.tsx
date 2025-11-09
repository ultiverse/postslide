import { useState, useRef, useEffect } from 'react';
import { useProject } from '@/state/project.store';
import { SortableBlockCard } from '@/components/blocks/SortableBlockCard';
import { BlockStyleControls } from '@/components/blocks/BlockStyleControls';
import { IconButton } from '@/components/ui';
import { LayoutPicker } from '@/components/editor/LayoutPicker';
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
import { Plus, X, Type, List, Image as ImageIcon, Palette, Sparkles } from 'lucide-react';
import { isTextBlock } from '@/lib/constants/blocks';

export function RightPane() {
    const project = useProject((s) => s.project);
    const selectedSlideId = useProject((s) => s.selectedSlideId);
    const selectedBlockId = useProject((s) => s.selectedBlockId);
    const setSelectedBlock = useProject((s) => s.setSelectedBlock);
    const addBlock = useProject((s) => s.addBlock);
    const updateBlock = useProject((s) => s.updateBlock);
    const updateBullets = useProject((s) => s.updateBullets);
    const updateImageBlock = useProject((s) => s.updateImageBlock);
    const updateBackgroundBlock = useProject((s) => s.updateBackgroundBlock);
    const updateDecorativeBlock = useProject((s) => s.updateDecorativeBlock);
    const removeBlock = useProject((s) => s.removeBlock);
    const moveBlockUp = useProject((s) => s.moveBlockUp);
    const moveBlockDown = useProject((s) => s.moveBlockDown);
    const convertBlockKind = useProject((s) => s.convertBlockKind);
    const reorderBlocks = useProject((s) => s.reorderBlocks);

    const selectedSlide = project.slides.find((s) => s.id === selectedSlideId);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const justAddedBulletRef = useRef<string | null>(null); // Track which block just had a bullet added

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleAddBlock = (kind: SlideBlock['kind']) => {
        if (selectedSlide) {
            addBlock(selectedSlide.id, kind);
            setIsDropdownOpen(false);

            // Scroll to the new block after it's been added
            setTimeout(() => {
                const blockCards = document.querySelectorAll('[data-block-card]');
                const lastBlock = blockCards[blockCards.length - 1];
                if (lastBlock) {
                    lastBlock.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 100);
        }
    };

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
        <aside className="flex flex-col overflow-y-auto border-l border-brand-200/50 shadow-sm  bg-neutral-50/80 backdrop-blur-sm">
            <div className="relative border-b border-brand-200/50 bg-gradient-to-r from-accent-500 to-brand-500 p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">Inspector</h2>
                    {selectedSlide && (
                        <div ref={dropdownRef} className="relative">
                            <IconButton
                                icon={Plus}
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="text-white hover:bg-white/20"
                                title="Add Block"
                            />
                            {isDropdownOpen && (
                                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-neutral-200 bg-white shadow-lg z-20">
                                    <div className="py-1">
                                        {/* Text Blocks */}
                                        <div className="px-3 py-1 text-xs font-semibold text-neutral-400">Text</div>
                                        <button
                                            onClick={() => handleAddBlock('title')}
                                            className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2"
                                        >
                                            <Type className="h-3 w-3" />
                                            Title
                                        </button>
                                        <button
                                            onClick={() => handleAddBlock('subtitle')}
                                            className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2"
                                        >
                                            <Type className="h-3 w-3" />
                                            Subtitle
                                        </button>
                                        <button
                                            onClick={() => handleAddBlock('body')}
                                            className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2"
                                        >
                                            <Type className="h-3 w-3" />
                                            Body
                                        </button>
                                        <button
                                            onClick={() => handleAddBlock('bullets')}
                                            className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2"
                                        >
                                            <List className="h-3 w-3" />
                                            Bullets
                                        </button>

                                        {/* Visual Blocks */}
                                        <div className="border-t border-neutral-100 mt-1 pt-1">
                                            <div className="px-3 py-1 text-xs font-semibold text-neutral-400">Visual</div>
                                            <button
                                                onClick={() => handleAddBlock('image')}
                                                className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2"
                                            >
                                                <ImageIcon className="h-3 w-3" />
                                                Image
                                            </button>
                                            <button
                                                onClick={() => handleAddBlock('background')}
                                                className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2"
                                            >
                                                <Palette className="h-3 w-3" />
                                                Background
                                            </button>
                                            <button
                                                onClick={() => handleAddBlock('decorative')}
                                                className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center gap-2"
                                            >
                                                <Sparkles className="h-3 w-3" />
                                                Decorative
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Layout Picker Section */}
            {selectedSlide && <LayoutPicker slide={selectedSlide} />}

            {/* Content Blocks Section */}
            <div className="space-y-6 p-4">
                {/* Blocks Section */}
                {selectedSlide ? (
                    <>

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
                                        <div key={block.id} data-block-card>
                                            <SortableBlockCard
                                                id={block.id}
                                                onMoveUp={() => moveBlockUp(selectedSlide.id, block.id)}
                                                onMoveDown={() => moveBlockDown(selectedSlide.id, block.id)}
                                                onRemove={() => removeBlock(selectedSlide.id, block.id)}
                                                canMoveUp={idx > 0}
                                                canMoveDown={idx < selectedSlide.blocks.length - 1}
                                                onClick={() => setSelectedBlock(block.id)}
                                                isSelected={selectedBlockId === block.id}
                                                styleControls={
                                                    <BlockStyleControls slideId={selectedSlide.id} block={block} />
                                                }
                                                headerContent={
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
                                                        disabled={!isTextBlock(block)}
                                                    >
                                                        <optgroup label="Text">
                                                            <option value="title">Title</option>
                                                            <option value="subtitle">Subtitle</option>
                                                            <option value="body">Body</option>
                                                            <option value="bullets">Bullets</option>
                                                        </optgroup>
                                                        <optgroup label="Visual">
                                                            <option value="image">Image</option>
                                                            <option value="background">Background</option>
                                                            <option value="decorative">Decorative</option>
                                                        </optgroup>
                                                    </select>
                                                }
                                            >
                                                {block.kind === 'bullets' ? (
                                                    <div className="space-y-1">
                                                        {block.bullets.map((bullet, bulletIdx) => (
                                                            <div key={bulletIdx} className="flex gap-1">
                                                                <input
                                                                    ref={(el) => {
                                                                        // Auto-focus on the last bullet item if it was just added via button click
                                                                        if (
                                                                            el &&
                                                                            bulletIdx === block.bullets.length - 1 &&
                                                                            bullet === '' &&
                                                                            justAddedBulletRef.current === block.id
                                                                        ) {
                                                                            setTimeout(() => {
                                                                                el.focus();
                                                                                justAddedBulletRef.current = null; // Clear the flag
                                                                            }, 0);
                                                                        }
                                                                    }}
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
                                                            onClick={() => {
                                                                justAddedBulletRef.current = block.id; // Set flag before adding bullet
                                                                updateBullets(selectedSlide.id, block.id, [
                                                                    ...block.bullets,
                                                                    '',
                                                                ]);
                                                            }}
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
                                                ) : block.kind === 'image' ? (
                                                    <div className="space-y-2">
                                                        <label className="block text-xs font-medium text-neutral-700">
                                                            Image URL
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={block.src}
                                                            onChange={(e) =>
                                                                updateImageBlock(selectedSlide.id, block.id, { src: e.target.value })
                                                            }
                                                            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                                            placeholder="https://example.com/image.jpg"
                                                        />

                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="block text-xs font-medium text-neutral-700 mb-1">
                                                                    Width (px)
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={block.width || ''}
                                                                    onChange={(e) =>
                                                                        updateImageBlock(selectedSlide.id, block.id, {
                                                                            width: e.target.value ? parseInt(e.target.value) : undefined
                                                                        })
                                                                    }
                                                                    className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm transition-colors focus:border-brand-500 focus:outline-none"
                                                                    placeholder="Auto"
                                                                    min="50"
                                                                    max="952"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-neutral-700 mb-1">
                                                                    Height (px)
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={block.height || ''}
                                                                    onChange={(e) =>
                                                                        updateImageBlock(selectedSlide.id, block.id, {
                                                                            height: e.target.value ? parseInt(e.target.value) : undefined
                                                                        })
                                                                    }
                                                                    className="w-full rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm transition-colors focus:border-brand-500 focus:outline-none"
                                                                    placeholder="300"
                                                                    min="50"
                                                                    max="952"
                                                                />
                                                            </div>
                                                        </div>

                                                        <label className="block text-xs font-medium text-neutral-700">
                                                            Object Fit
                                                        </label>
                                                        <select
                                                            value={block.fit || 'cover'}
                                                            onChange={(e) =>
                                                                updateImageBlock(selectedSlide.id, block.id, { fit: e.target.value as 'cover' | 'contain' | 'fill' })
                                                            }
                                                            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-colors focus:border-brand-500 focus:outline-none"
                                                        >
                                                            <option value="cover">Cover</option>
                                                            <option value="contain">Contain</option>
                                                            <option value="fill">Fill</option>
                                                        </select>
                                                        <p className="text-xs text-neutral-500">
                                                            Images flow with text blocks. Leave width empty for full width.
                                                        </p>
                                                    </div>
                                                ) : block.kind === 'background' ? (
                                                    <div className="space-y-2">
                                                        <label className="block text-xs font-medium text-neutral-700">
                                                            Background Style
                                                        </label>
                                                        <select
                                                            value={block.style}
                                                            onChange={(e) =>
                                                                updateBackgroundBlock(selectedSlide.id, block.id, { style: e.target.value as 'solid' | 'gradient' | 'image' })
                                                            }
                                                            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-colors focus:border-brand-500 focus:outline-none"
                                                        >
                                                            <option value="solid">Solid Color</option>
                                                            <option value="gradient">Gradient</option>
                                                            <option value="image">Image</option>
                                                        </select>

                                                        {block.style === 'solid' && (
                                                            <div>
                                                                <label className="block text-xs font-medium text-neutral-700 mb-1">
                                                                    Color
                                                                </label>
                                                                <input
                                                                    type="color"
                                                                    value={block.color || '#ffffff'}
                                                                    onChange={(e) =>
                                                                        updateBackgroundBlock(selectedSlide.id, block.id, { color: e.target.value })
                                                                    }
                                                                    className="w-full h-10 rounded-md border border-neutral-300 cursor-pointer"
                                                                />
                                                            </div>
                                                        )}

                                                        {block.style === 'gradient' && block.gradient && (
                                                            <>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                                                                        From Color
                                                                    </label>
                                                                    <input
                                                                        type="color"
                                                                        value={block.gradient.from}
                                                                        onChange={(e) =>
                                                                            updateBackgroundBlock(selectedSlide.id, block.id, {
                                                                                gradient: { ...block.gradient!, from: e.target.value }
                                                                            })
                                                                        }
                                                                        className="w-full h-10 rounded-md border border-neutral-300 cursor-pointer"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-medium text-neutral-700 mb-1">
                                                                        To Color
                                                                    </label>
                                                                    <input
                                                                        type="color"
                                                                        value={block.gradient.to}
                                                                        onChange={(e) =>
                                                                            updateBackgroundBlock(selectedSlide.id, block.id, {
                                                                                gradient: { ...block.gradient!, to: e.target.value }
                                                                            })
                                                                        }
                                                                        className="w-full h-10 rounded-md border border-neutral-300 cursor-pointer"
                                                                    />
                                                                </div>
                                                            </>
                                                        )}

                                                        {block.style === 'image' && (
                                                            <div>
                                                                <label className="block text-xs font-medium text-neutral-700 mb-1">
                                                                    Image URL
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={block.image || ''}
                                                                    onChange={(e) =>
                                                                        updateBackgroundBlock(selectedSlide.id, block.id, { image: e.target.value })
                                                                    }
                                                                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                                                    placeholder="https://example.com/bg.jpg"
                                                                />
                                                            </div>
                                                        )}

                                                        <div>
                                                            <label className="block text-xs font-medium text-neutral-700 mb-1">
                                                                Opacity
                                                            </label>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="1"
                                                                step="0.1"
                                                                value={block.opacity ?? 1}
                                                                onChange={(e) =>
                                                                    updateBackgroundBlock(selectedSlide.id, block.id, { opacity: parseFloat(e.target.value) })
                                                                }
                                                                className="w-full"
                                                            />
                                                            <span className="text-xs text-neutral-500">{Math.round((block.opacity ?? 1) * 100)}%</span>
                                                        </div>
                                                    </div>
                                                ) : block.kind === 'decorative' ? (
                                                    <div className="space-y-2">
                                                        <label className="block text-xs font-medium text-neutral-700">
                                                            Decorative Type
                                                        </label>
                                                        <select
                                                            value={block.variant}
                                                            onChange={(e) =>
                                                                updateDecorativeBlock(selectedSlide.id, block.id, { variant: e.target.value as 'arrow' | 'divider' | 'accent' | 'shape' | 'icon' })
                                                            }
                                                            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm transition-colors focus:border-brand-500 focus:outline-none"
                                                        >
                                                            <option value="arrow">Arrow</option>
                                                            <option value="divider">Divider</option>
                                                            <option value="accent">Accent</option>
                                                            <option value="shape">Shape</option>
                                                            <option value="icon">Icon</option>
                                                        </select>
                                                        <p className="text-xs text-neutral-500">
                                                            {block.variant === 'arrow' && 'Directional arrow indicator'}
                                                            {block.variant === 'divider' && 'Horizontal line separator'}
                                                            {block.variant === 'accent' && 'Visual accent element'}
                                                            {block.variant === 'shape' && 'Geometric shape'}
                                                            {block.variant === 'icon' && 'Icon element'}
                                                        </p>
                                                    </div>
                                                ) : null}
                                            </SortableBlockCard>
                                        </div>
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
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
