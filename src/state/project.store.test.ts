import { beforeEach, describe, expect, it } from 'vitest'
import { useProject } from './project.store'

// Reset the store to its initial seed before each test
beforeEach(() => {
  // Replace with the original seed by calling setProject with the original project
  // The module's initial seed is captured at module initialization; we can reconstruct by
  // reading the current state's project at import time. For safety, re-importing isn't trivial
  // in tests, so we'll just reset to a known shape close to the seed used in the store.
  useProject.setState({
    project: {
      id: 'test-seed',
      title: 'Test Project',
      slides: [
        { id: 's1', templateId: 'minimal-pro', blocks: [ { id: 'b1', kind: 'title', text: 'Hello' } ] },
      ],
    },
    selectedSlideId: 's1',
    showGrid: false,
  })
})

describe('project.store', () => {
  it('adds a slide and selects it', () => {
    const before = useProject.getState()
    const beforeLen = before.project.slides.length

    useProject.getState().addSlide()

    const after = useProject.getState()
    expect(after.project.slides.length).toBe(beforeLen + 1)
    expect(after.selectedSlideId).toBeDefined()
    // selectedSlideId should be the id of the newly added slide (last one)
    expect(after.selectedSlideId).toBe(after.project.slides[after.project.slides.length - 1].id)
  })

  it('removes a slide and updates selectedSlideId', () => {
    // ensure we have two slides
    useProject.setState((s) => ({ project: { ...s.project, slides: [ ...s.project.slides, { id: 's2', templateId: 'minimal-pro', blocks: [] } ] } }))
    const stateBefore = useProject.getState()
    expect(stateBefore.project.slides.length).toBeGreaterThanOrEqual(2)

    // remove selected slide (s1)
    useProject.getState().removeSlide('s1')
    const after = useProject.getState()
    expect(after.project.slides.find(s => s.id === 's1')).toBeUndefined()
    // selectedSlideId should no longer be 's1'
    expect(after.selectedSlideId).not.toBe('s1')
  })

  it('adds and updates a block', () => {
    const slideId = useProject.getState().project.slides[0].id
    // add a body block
    useProject.getState().addBlock(slideId, 'body')
    const slide = useProject.getState().project.slides.find(s => s.id === slideId)!
    const bodyBlock = slide.blocks.find(b => b.kind === 'body')
    expect(bodyBlock).toBeDefined()

    // update block text
    if (bodyBlock && 'text' in bodyBlock) {
      useProject.getState().updateBlock(slideId, bodyBlock.id, 'Updated body')
      const updated = useProject.getState().project.slides.find(s => s.id === slideId)!
      const updatedBlock = updated.blocks.find(b => b.id === bodyBlock.id) as any
      expect(updatedBlock.text).toBe('Updated body')
    }
  })

  it('reorders blocks safely', () => {
    const slideId = useProject.getState().project.slides[0].id
    // create 3 blocks
    useProject.getState().addBlock(slideId, 'title')
    useProject.getState().addBlock(slideId, 'subtitle')
    useProject.getState().addBlock(slideId, 'body')

    const slide = useProject.getState().project.slides.find(s => s.id === slideId)!
    const originalIds = slide.blocks.map(b => b.id)
    // reverse order
    const reversed = [...slide.blocks].reverse()
    // attempt reorder with correct ids should succeed
    useProject.getState().reorderBlocks(slideId, reversed)
    const after = useProject.getState().project.slides.find(s => s.id === slideId)!
    expect(after.blocks.map(b => b.id)).toEqual(reversed.map(b => b.id))

    // attempt reorder with invalid blocks (missing id) should be ignored
    const badOrder = reversed.slice(0, reversed.length - 1) // wrong length
    useProject.getState().reorderBlocks(slideId, badOrder as any)
    const afterBad = useProject.getState().project.slides.find(s => s.id === slideId)!
    // state should remain unchanged
    expect(afterBad.blocks.map(b => b.id)).toEqual(reversed.map(b => b.id))
  })
})
