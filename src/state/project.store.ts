import { create } from 'zustand'
import type { Project, Slide, SlideBlock } from '@/types/domain'

interface ProjectState {
  project: Project
  selectedSlideId: string | null
  showGrid: boolean

  // Project-level
  setProject: (p: Project) => void
  updateProjectTitle: (title: string) => void
  toggleGrid: () => void

  // Slide-level
  setSelectedSlide: (id: string | null) => void
  addSlide: () => void
  duplicateSlide: (id: string) => void
  removeSlide: (id: string) => void
  moveSlideUp: (id: string) => void
  moveSlideDown: (id: string) => void
  reorderSlides: (slides: Slide[]) => void

  // Block-level
  addBlock: (slideId: string, kind: SlideBlock['kind']) => void
  updateBlock: (slideId: string, blockId: string, text: string) => void
  updateBullets: (slideId: string, blockId: string, bullets: string[]) => void
  removeBlock: (slideId: string, blockId: string) => void
  moveBlockUp: (slideId: string, blockId: string) => void
  moveBlockDown: (slideId: string, blockId: string) => void
  convertBlockKind: (slideId: string, blockId: string, newKind: SlideBlock['kind']) => void,
  reorderBlocks: (slideId: string, blocks: SlideBlock[]) => void
}

const seed: Project = {
  id: 'demo',
  title: 'Demo Carousel',
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

export const useProject = create<ProjectState>((set) => ({
  project: seed,
  selectedSlideId: seed.slides[0]?.id || null,
  showGrid: false,

  // Project-level
  setProject: (p) => set({ project: p }),
  updateProjectTitle: (title) =>
    set((s) => ({ project: { ...s.project, title } })),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),

  // Slide-level
  setSelectedSlide: (id) => set({ selectedSlideId: id }),
  addSlide: () =>
    set((s) => {
      const newSlide = { id: crypto.randomUUID(), templateId: 'minimal-pro', blocks: [] }
      return {
        project: { ...s.project, slides: [...s.project.slides, newSlide] },
        selectedSlideId: newSlide.id,
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

  // Block-level
  addBlock: (slideId, kind) =>
    set((s) => ({
      project: {
        ...s.project,
        slides: s.project.slides.map((sl) =>
          sl.id === slideId
            ? {
                ...sl,
                blocks: [
                  ...sl.blocks,
                  kind === 'bullets'
                    ? { id: crypto.randomUUID(), kind, bullets: [''] }
                    : { id: crypto.randomUUID(), kind, text: '' },
                ],
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
            blocks: sl.blocks.map((b) => {
              if (b.id !== blockId) return b
              // Convert bullets to text
              if (b.kind === 'bullets' && newKind !== 'bullets') {
                return { id: b.id, kind: newKind, text: b.bullets.join('\n') }
              }
              // Convert text to bullets
              if ('text' in b && newKind === 'bullets') {
                return { id: b.id, kind: newKind, bullets: b.text.split('\n').filter(Boolean) }
              }
              // Convert between text types
              if ('text' in b && newKind !== 'bullets') {
                return { ...b, kind: newKind }
              }
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
}))
