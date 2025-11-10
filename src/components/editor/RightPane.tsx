import { useProject } from '@/state/project.store';
import { SortableBlockCard } from '@/components/blocks/SortableBlockCard';
import { BlockStyleControls, BlockKindSelector } from '@/components/blocks/controls';
import {
  BulletsEditor,
  TextEditor,
  ImageBlockEditor,
  BackgroundBlockEditor,
  DecorativeBlockEditor
} from '@/components/blocks/editors';
import { LayoutPicker } from '@/components/editor/LayoutPicker';
import { InspectorHeader } from '@/components/editor/InspectorHeader';
import { AddBlockDropdown } from '@/components/editor/AddBlockDropdown';
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
import { isTextBlock } from '@/lib/constants/blocks';

// Helper component to route to the correct block editor
function BlockEditor({ slideId, block }: { slideId: string; block: SlideBlock }) {
  const updateBlock = useProject((s) => s.updateBlock);
  const updateBullets = useProject((s) => s.updateBullets);
  const updateImageBlock = useProject((s) => s.updateImageBlock);
  const updateBackgroundBlock = useProject((s) => s.updateBackgroundBlock);
  const updateDecorativeBlock = useProject((s) => s.updateDecorativeBlock);

  if (block.kind === 'bullets') {
    return <BulletsEditor slideId={slideId} block={block} onUpdate={updateBullets} />;
  }

  if ('text' in block) {
    return <TextEditor slideId={slideId} block={block} onUpdate={updateBlock} />;
  }

  if (block.kind === 'image') {
    return <ImageBlockEditor slideId={slideId} block={block} onUpdate={updateImageBlock} />;
  }

  if (block.kind === 'background') {
    return <BackgroundBlockEditor slideId={slideId} block={block} onUpdate={updateBackgroundBlock} />;
  }

  if (block.kind === 'decorative') {
    return <DecorativeBlockEditor slideId={slideId} block={block} onUpdate={updateDecorativeBlock} />;
  }

  return null;
}

export function RightPane() {
  const project = useProject((s) => s.project);
  const selectedSlideId = useProject((s) => s.selectedSlideId);
  const selectedBlockId = useProject((s) => s.selectedBlockId);
  const setSelectedBlock = useProject((s) => s.setSelectedBlock);
  const addBlock = useProject((s) => s.addBlock);
  const removeBlock = useProject((s) => s.removeBlock);
  const moveBlockUp = useProject((s) => s.moveBlockUp);
  const moveBlockDown = useProject((s) => s.moveBlockDown);
  const convertBlockKind = useProject((s) => s.convertBlockKind);
  const reorderBlocks = useProject((s) => s.reorderBlocks);

  const selectedSlide = project.slides.find((s) => s.id === selectedSlideId);

  const handleAddBlock = (kind: SlideBlock['kind']) => {
    if (selectedSlide) {
      addBlock(selectedSlide.id, kind);

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
    <aside className="flex flex-col overflow-y-auto border-l border-brand-200/50 shadow-sm bg-neutral-50/80 backdrop-blur-sm">
      <InspectorHeader hasSlide={!!selectedSlide} onAddBlock={handleAddBlock} />

      {/* Layout Picker Section */}
      {selectedSlide && <LayoutPicker slide={selectedSlide} />}

      {/* Content Blocks Section */}
      <div className="space-y-6 p-4">
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
                          <BlockKindSelector
                            value={block.kind}
                            onChange={(kind) => convertBlockKind(selectedSlide.id, block.id, kind)}
                            disabled={!isTextBlock(block)}
                          />
                        }
                      >
                        <BlockEditor slideId={selectedSlide.id} block={block} />
                      </SortableBlockCard>
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* Add Block Button Below Cards */}
            <div className="mt-3">
              <AddBlockDropdown
                onAddBlock={handleAddBlock}
                position="top"
                align="left"
                variant="button"
              />
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
