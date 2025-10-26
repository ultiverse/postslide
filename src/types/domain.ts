export type SlideBlock =
  | { id: string; kind: 'title' | 'subtitle' | 'body'; text: string }
  | { id: string; kind: 'bullets'; bullets: string[] }

export type Slide = { id: string; templateId: string; blocks: SlideBlock[] }

export type Project = {
  id: string
  title: string
  slides: Slide[]
  brand?: { primary: string; fontHead: string; fontBody: string }
}
