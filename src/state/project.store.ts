import { create } from 'zustand'

export type SlideBlock =
  | { id: string; kind: 'title' | 'subtitle' | 'body'; text: string }
  | { id: string; kind: 'bullets'; bullets: string[] }

export type Slide = { id: string; templateId: string; blocks: SlideBlock[] }
export type Project = { id: string; title: string; slides: Slide[] }

type State = {
  project: Project
  setProject: (p: Project) => void
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

export const useProject = create<State>((set) => ({
  project: seed,
  setProject: (p) => set({ project: p }),
}))
