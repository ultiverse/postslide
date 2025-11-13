import { create } from 'zustand'
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware'
import type { Project, Slide, SlideBlock, ImageBlock, BackgroundBlock, DecorativeBlock, Brand, BlockStyle } from '@/types/domain'
import { createBlock } from '@/lib/constants/blocks'
import { getLayout, getSuggestedBlocksForLayout } from '@/lib/layouts/utils'
import { saveProject, loadCurrentProject } from '@/lib/persistence/localStorage'

// Custom storage implementation that uses our multi-project localStorage system
const projectStorage: StateStorage = {
  getItem: (): string | null => {
    // Load the current project
    const project = loadCurrentProject()
    if (!project) return null

    // Return in Zustand's expected format
    return JSON.stringify({
      state: {
        project,
        selectedSlideId: null, // Default - will be set by the store
      },
      version: 0,
    })
  },
  setItem: (_name: string, value: string): void => {
    try {
      const parsed = JSON.parse(value)
      const state = parsed.state

      if (state?.project) {
        // Save the project using our multi-project system
        saveProject(state.project)
      }
    } catch (error) {
      console.error('Failed to save project:', error)
    }
  },
  removeItem: (): void => {
    // We don't remove projects automatically - they're managed separately
    // This is called when clearing the store, but we keep projects in storage
  },
}

interface ProjectState {
  project: Project
  selectedSlideId: string | null
  selectedBlockId: string | null
  showGrid: boolean

  // Project-level
  setProject: (p: Project) => void
  updateProjectTitle: (title: string) => void
  toggleGrid: () => void

  // Brand-level
  updateBrand: (brand: Partial<Brand>) => void

  // Slide-level
  setSelectedSlide: (id: string | null) => void
  addSlide: (templateId?: string) => void
  duplicateSlide: (id: string) => void
  removeSlide: (id: string) => void
  moveSlideUp: (id: string) => void
  moveSlideDown: (id: string) => void
  reorderSlides: (slides: Slide[]) => void
  applyTemplateToSlide: (slideId: string, templateId: string) => void
  applyTemplateToAllSlides: (templateId: string) => void
  applyLayoutToSlide: (slideId: string, templateId: string, layoutId: string) => void
  applyLayoutWithBlocks: (slideId: string, templateId: string, layoutId: string) => void
  autoMatchLayoutForSlide: (slideId: string, templateId: string) => void

  // Block-level
  setSelectedBlock: (id: string | null) => void
  addBlock: (slideId: string, kind: SlideBlock['kind']) => void
  updateBlock: (slideId: string, blockId: string, text: string) => void
  updateBullets: (slideId: string, blockId: string, bullets: string[]) => void
  updateBlockStyle: (slideId: string, blockId: string, style: Partial<BlockStyle>) => void
  resetBlockStyle: (slideId: string, blockId: string) => void
  updateImageBlock: (slideId: string, blockId: string, updates: Partial<ImageBlock>) => void
  updateBackgroundBlock: (slideId: string, blockId: string, updates: Partial<BackgroundBlock>) => void
  updateDecorativeBlock: (slideId: string, blockId: string, updates: Partial<DecorativeBlock>) => void
  removeBlock: (slideId: string, blockId: string) => void
  moveBlockUp: (slideId: string, blockId: string) => void
  moveBlockDown: (slideId: string, blockId: string) => void
  convertBlockKind: (slideId: string, blockId: string, newKind: SlideBlock['kind']) => void,
  reorderBlocks: (slideId: string, blocks: SlideBlock[]) => void
}

const seed: Project = {
  id: 'demo',
  title: 'Demo Carousel',
  brand: {
    primary: '#3b82f6',
  },
  slides: [
    { id: 's1', templateId: 'minimal-pro', blocks: [
      { id: 'b1', kind: 'title', text: '5 Tips to Improve Your Resume' },
      { id: 'b2', kind: 'subtitle', text: 'Make it recruiter-proof in minutes' }
    ]},
    { id: 's2', templateId: 'minimal-pro', blocks: [
      { id: 'b3', kind: 'title', text: 'Tip #1: Keep it Scannable' },
      { id: 'b4', kind: 'bullets', bullets: ['Use headings', 'Short bullets', 'Consistent spacing'] }
    ]},
  ],
}

export const useProject = create<ProjectState>()(
  persist(
    (set) => ({
  project: seed,
  selectedSlideId: seed.slides[0]?.id || null,
  selectedBlockId: null,
  showGrid: false,

  // Project-level
  setProject: (p) => set({ project: p }),
  updateProjectTitle: (title) =>
    set((s) => ({ project: { ...s.project, title } })),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),

  // Brand-level
  updateBrand: (brand) =>
    set((s) => {
      const newBrand = {
        primary: s.project.brand?.primary || '#3b82f6',
        ...brand
      };
      return {
        project: {
          ...s.project,
          brand: newBrand,
        },
      };
    }),

  // Slide-level
  setSelectedSlide: (id) => set({ selectedSlideId: id }),
  addSlide: (templateId = 'minimal-pro') =>
    set((s) => {
      const newSlide = {
        id: crypto.randomUUID(),
        templateId, // Use provided templateId or default
        blocks: [
          { id: crypto.randomUUID(), kind: 'title' as const, text: '' }
        ]
      }
      return {
        project: { ...s.project, slides: [...s.project.slides, newSlide] },
        selectedSlideId: newSlide.id,
      }
    }),
  autoMatchLayoutForSlide: (slideId, templateId) =>
    set((s) => {
      const slide = s.project.slides.find((sl) => sl.id === slideId)
      if (!slide) return s

      // Apply the template (the layout matching happens during render)
      return {
        project: {
          ...s.project,
          slides: s.project.slides.map((sl) =>
            sl.id === slideId ? { ...sl, templateId } : sl
          ),
        },
      }
    }),
  duplicateSlide: (id) =>
    set((s) => {
      const idx = s.project.slides.findIndex((sl) => sl.id === id)
      if (idx === -1) return s
      const original = s.project.slides[idx]
      const duplicate = {
        ...original,
        id: crypto.randomUUID(),
        blocks: original.blocks.map((b) => ({ ...b, id: crypto.randomUUID() })),
      }
      const slides = [...s.project.slides]
      slides.splice(idx + 1, 0, duplicate)
      return { project: { ...s.project, slides }, selectedSlideId: duplicate.id }
    }),
  removeSlide: (id) =>
    set((s) => {
      const slides = s.project.slides.filter((sl) => sl.id !== id)
      const newSelected = s.selectedSlideId === id ? slides[0]?.id || null : s.selectedSlideId
      return { project: { ...s.project, slides }, selectedSlideId: newSelected }
    }),
  moveSlideUp: (id) =>
    set((s) => {
      const idx = s.project.slides.findIndex((sl) => sl.id === id)
      if (idx <= 0) return s
      const slides = [...s.project.slides]
      ;[slides[idx - 1], slides[idx]] = [slides[idx], slides[idx - 1]]
      return { project: { ...s.project, slides } }
    }),
  moveSlideDown: (id) =>
    set((s) => {
      const idx = s.project.slides.findIndex((sl) => sl.id === id)
      if (idx === -1 || idx >= s.project.slides.length - 1) return s
      const slides = [...s.project.slides]
      ;[slides[idx], slides[idx + 1]] = [slides[idx + 1], slides[idx]]
      return { project: { ...s.project, slides } }
    }),
  reorderSlides: (slides) =>
    set((s) => ({ project: { ...s.project, slides } })),
  applyTemplateToSlide: (slideId, templateId) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((sl) =>
          sl.id === slideId ? { ...sl, templateId } : sl
        ),
      },
    })),
  applyTemplateToAllSlides: (templateId) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((sl) => ({ ...sl, templateId })),
      },
    })),
  applyLayoutToSlide: (slideId, templateId, layoutId) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((sl) =>
          sl.id === slideId ? { ...sl, templateId, layoutId } : sl
        ),
      },
    })),
  applyLayoutWithBlocks: (slideId, templateId, layoutId) =>
    set((s) => {
      const slide = s.project.slides.find((sl) => sl.id === slideId)
      if (!slide) return s

      const layout = getLayout(templateId, layoutId)
      if (!layout) {
        // Fallback to just applying layout without adding blocks
        return {
          project: {
            ...s.project,
            slides: s.project.slides.map((sl) =>
              sl.id === slideId ? { ...sl, templateId, layoutId } : sl
            ),
          },
        }
      }

      // Get suggested blocks for this layout
      const suggestions = getSuggestedBlocksForLayout(layout)

      // Helper to check if a block has only placeholder/empty content
      const isBlockEmpty = (block: SlideBlock): boolean => {
        if (block.kind === 'title' || block.kind === 'subtitle' || block.kind === 'body') {
          return !block.text || block.text.trim() === ''
        }
        if (block.kind === 'bullets') {
          return block.bullets.length === 0 || block.bullets.every((b) => !b || b.trim() === '')
        }
        if (block.kind === 'image') {
          return !block.src || block.src === ''
        }
        // Background and decorative blocks are considered "not empty" (user-added)
        return false
      }

      // Check if all blocks are empty (placeholders)
      const allBlocksEmpty = slide.blocks
        .filter((b) => b.kind !== 'background' && b.kind !== 'decorative')
        .every(isBlockEmpty)

      let finalBlocks: SlideBlock[]

      if (allBlocksEmpty) {
        // If all blocks are empty, replace with new layout's blocks
        // Keep background and decorative blocks
        const backgroundAndDecorative = slide.blocks.filter(
          (b) => b.kind === 'background' || b.kind === 'decorative'
        )
        const newBlocks: SlideBlock[] = suggestions.map(({ kind, placeholder }) => {
          const block = createBlock(kind)
          // Set placeholder text
          if ('text' in block) {
            return { ...block, text: placeholder }
          }
          return block
        })
        finalBlocks = [...backgroundAndDecorative, ...newBlocks]
      } else {
        // If blocks have content, keep them and add missing ones
        const existingBlockKinds = new Set(slide.blocks.map((b) => b.kind))
        const newBlocks: SlideBlock[] = suggestions
          .filter(({ kind }) => !existingBlockKinds.has(kind))
          .map(({ kind, placeholder }) => {
            const block = createBlock(kind)
            // Set placeholder text
            if ('text' in block) {
              return { ...block, text: placeholder }
            }
            return block
          })
        finalBlocks = [...slide.blocks, ...newBlocks]
      }

      return {
        project: {
          ...s.project,
          slides: s.project.slides.map((sl) =>
            sl.id === slideId
              ? {
                  ...sl,
                  templateId,
                  layoutId,
                  blocks: finalBlocks,
                }
              : sl
          ),
        },
      }
    }),

  // Block-level
  setSelectedBlock: (id) => set({ selectedBlockId: id }),
  addBlock: (slideId, kind) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((sl) =>
          sl.id === slideId
            ? {
                ...sl,
                blocks: [...sl.blocks, createBlock(kind)],
              }
            : sl,
        ),
      },
    })),
  updateBlock: (slideId, blockId, text) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((sl) =>
          sl.id === slideId
            ? {
                ...sl,
                blocks: sl.blocks.map((b) =>
                  b.id === blockId && 'text' in b ? { ...b, text } : b,
                ),
              }
            : sl,
        ),
      },
    })),
  updateBullets: (slideId, blockId, bullets) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((sl) =>
          sl.id === slideId
            ? {
                ...sl,
                blocks: sl.blocks.map((b) =>
                  b.id === blockId && b.kind === 'bullets' ? { ...b, bullets } : b,
                ),
              }
            : sl,
        ),
      },
    })),
  updateBlockStyle: (slideId, blockId, style) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((sl) =>
          sl.id === slideId
            ? {
                ...sl,
                blocks: sl.blocks.map((b) => {
                  if (b.id === blockId && ('text' in b || b.kind === 'bullets')) {
                    return { ...b, style: { ...b.style, ...style } }
                  }
                  return b
                }),
              }
            : sl,
        ),
      },
    })),
  resetBlockStyle: (slideId, blockId) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((sl) =>
          sl.id === slideId
            ? {
                ...sl,
                blocks: sl.blocks.map((b) => {
                  if (b.id === blockId && ('text' in b || b.kind === 'bullets')) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { style, ...rest } = b
                    return rest as SlideBlock
                  }
                  return b
                }),
              }
            : sl,
        ),
      },
    })),
  updateImageBlock: (slideId, blockId, updates) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((sl) =>
          sl.id === slideId
            ? {
                ...sl,
                blocks: sl.blocks.map((b) =>
                  b.id === blockId && b.kind === 'image' ? { ...b, ...updates } : b,
                ),
              }
            : sl,
        ),
      },
    })),
  updateBackgroundBlock: (slideId, blockId, updates) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((sl) =>
          sl.id === slideId
            ? {
                ...sl,
                blocks: sl.blocks.map((b) =>
                  b.id === blockId && b.kind === 'background' ? { ...b, ...updates } : b,
                ),
              }
            : sl,
        ),
      },
    })),
  updateDecorativeBlock: (slideId, blockId, updates) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((sl) =>
          sl.id === slideId
            ? {
                ...sl,
                blocks: sl.blocks.map((b) =>
                  b.id === blockId && b.kind === 'decorative' ? { ...b, ...updates } : b,
                ),
              }
            : sl,
        ),
      },
    })),
  removeBlock: (slideId, blockId) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((sl) =>
          sl.id === slideId
            ? { ...sl, blocks: sl.blocks.filter((b) => b.id !== blockId) }
            : sl,
        ),
      },
  })),
  moveBlockUp: (slideId, blockId) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((sl) => {
          if (sl.id !== slideId) return sl
          const idx = sl.blocks.findIndex((b) => b.id === blockId)
          if (idx <= 0) return sl
          const blocks = [...sl.blocks]
          ;[blocks[idx - 1], blocks[idx]] = [blocks[idx], blocks[idx - 1]]
          return { ...sl, blocks }
        }),
      },
    })),
  moveBlockDown: (slideId, blockId) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((sl) => {
          if (sl.id !== slideId) return sl
          const idx = sl.blocks.findIndex((b) => b.id === blockId)
          if (idx === -1 || idx >= sl.blocks.length - 1) return sl
          const blocks = [...sl.blocks]
          ;[blocks[idx], blocks[idx + 1]] = [blocks[idx + 1], blocks[idx]]
          return { ...sl, blocks }
        }),
      },
    })),
  convertBlockKind: (slideId, blockId, newKind) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((sl) => {
          if (sl.id !== slideId) return sl
          return {
            ...sl,
            blocks: sl.blocks.map((b): SlideBlock => {
              if (b.id !== blockId) return b

              // Convert bullets to a text block when newKind is a text kind
              if (b.kind === 'bullets' && (newKind === 'title' || newKind === 'subtitle' || newKind === 'body')) {
                return { id: b.id, kind: newKind, text: b.bullets.join('\n') } as SlideBlock
              }

              // Convert bullets to another non-text kind (unlikely) - fallback to creating a new block
              if (b.kind === 'bullets' && newKind !== 'bullets' && !(newKind === 'title' || newKind === 'subtitle' || newKind === 'body')) {
                return createBlock(newKind) as SlideBlock
              }

              // Convert text-like blocks to bullets
              if ('text' in b && newKind === 'bullets') {
                return { id: b.id, kind: 'bullets', bullets: b.text.split('\n').filter(Boolean) } as SlideBlock
              }

              // Convert between text types (title/subtitle/body)
              if ('text' in b && (newKind === 'title' || newKind === 'subtitle' || newKind === 'body')) {
                return { ...b, kind: newKind } as SlideBlock
              }

              // For other conversions (e.g., to image/background/decorative), create a sane default block
              if (newKind === 'image' || newKind === 'background' || newKind === 'decorative') {
                return createBlock(newKind) as SlideBlock
              }

              // If none of the above matched, return the original block
              return b
            }),
          }
        }),
      },
    })),
    reorderBlocks: (slideId, blocks) =>
      set((s) => {
        // Optional safety checks to avoid corrupting state
        const target = s.project.slides.find((sl) => sl.id === slideId);
        if (!target) return s;

        const existingIds = new Set(target.blocks.map((b) => b.id));
        const sameLength = blocks.length === target.blocks.length;
        const onlyExisting = blocks.every((b) => existingIds.has(b.id));
        if (!sameLength || !onlyExisting) return s;

        return {
          project: {
            ...s.project,
            slides: s.project.slides.map((sl) =>
              sl.id === slideId ? { ...sl, blocks: [...blocks] } : sl,
            ),
          },
        };
      }),
    }),
    {
      name: 'project-store', // Name doesn't matter since we use custom storage
      storage: createJSONStorage(() => projectStorage),
      partialize: (state) => ({
        project: state.project,
        selectedSlideId: state.selectedSlideId,
      }),
    }
  )
)
