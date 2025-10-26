import { useEffect } from 'react'
import { useProject } from '@/state/project.store'

export function useKeyboardShortcuts() {
  const selectedSlideId = useProject((s) => s.selectedSlideId)
  const projectSlidesLength = useProject((s) => s.project.slides.length)
  const addSlide = useProject((s) => s.addSlide)
  const duplicateSlide = useProject((s) => s.duplicateSlide)
  const removeSlide = useProject((s) => s.removeSlide)
  const moveSlideUp = useProject((s) => s.moveSlideUp)
  const moveSlideDown = useProject((s) => s.moveSlideDown)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedSlideId) return

      const isInputFocused =
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'

      // Enter: add new slide (only when not typing in inputs)
      if (e.key === 'Enter' && !e.metaKey && !e.ctrlKey && !isInputFocused) {
        e.preventDefault()
        addSlide()
        return
      }

      // Cmd+D: duplicate slide
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault()
        duplicateSlide(selectedSlideId)
        return
      }

      // Cmd+Backspace: delete slide
      if ((e.metaKey || e.ctrlKey) && e.key === 'Backspace') {
        e.preventDefault()
        if (projectSlidesLength > 1) {
          removeSlide(selectedSlideId)
        }
        return
      }

      // Cmd+Up: move slide up
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowUp') {
        e.preventDefault()
        moveSlideUp(selectedSlideId)
        return
      }

      // Cmd+Down: move slide down
      if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowDown') {
        e.preventDefault()
        moveSlideDown(selectedSlideId)
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    selectedSlideId,
    projectSlidesLength,
    addSlide,
    duplicateSlide,
    removeSlide,
    moveSlideUp,
    moveSlideDown,
  ])
}
