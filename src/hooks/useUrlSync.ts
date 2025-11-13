import { useEffect, useRef } from 'react'
import { useProject } from '@/state/project.store'
import {
  parseUrlHash,
  updateUrlHash,
  onHashChange,
} from '@/lib/routing/urlManager'
import { loadProject, saveLastUrl } from '@/lib/persistence/localStorage'

/**
 * Syncs the Zustand store with URL hash parameters
 * Handles:
 * - Loading project from URL on mount
 * - Updating URL when project/slide changes
 * - Browser back/forward navigation
 */
export function useUrlSync() {
  const project = useProject((s) => s.project)
  const selectedSlideId = useProject((s) => s.selectedSlideId)
  const setProject = useProject((s) => s.setProject)
  const setSelectedSlide = useProject((s) => s.setSelectedSlide)

  // Track if we're initializing from URL (prevents loops)
  const isInitializing = useRef(true)
  const lastProjectId = useRef<string | null>(null)
  const lastSlideId = useRef<string | null>(null)

  // Initialize from URL on mount
  useEffect(() => {
    const { projectId, slideId } = parseUrlHash()

    if (projectId && projectId !== project.id) {
      // Load project from localStorage
      const loadedProject = loadProject(projectId)
      if (loadedProject) {
        setProject(loadedProject)
        lastProjectId.current = projectId

        // If no slide specified in URL, default to first slide
        if (!slideId && loadedProject.slides.length > 0) {
          const firstSlideId = loadedProject.slides[0].id
          setSelectedSlide(firstSlideId)
          lastSlideId.current = firstSlideId
        }
      }
    }

    if (slideId && slideId !== selectedSlideId) {
      setSelectedSlide(slideId)
      lastSlideId.current = slideId
    } else if (!slideId && !selectedSlideId && project.slides.length > 0) {
      // No slide in URL and no slide selected - default to first slide
      const firstSlideId = project.slides[0].id
      setSelectedSlide(firstSlideId)
      lastSlideId.current = firstSlideId
    }

    isInitializing.current = false

    // Save current URL as last URL
    saveLastUrl(window.location.href)
  }, []) // Only run on mount

  // Update URL when project or slide changes (after initialization)
  useEffect(() => {
    if (isInitializing.current) return

    const currentProjectId = project.id
    const currentSlideId = selectedSlideId

    // Only update URL if something actually changed
    if (
      currentProjectId !== lastProjectId.current ||
      currentSlideId !== lastSlideId.current
    ) {
      updateUrlHash(currentProjectId, currentSlideId, false)
      lastProjectId.current = currentProjectId
      lastSlideId.current = currentSlideId

      // Save current URL
      saveLastUrl(window.location.href)
    }
  }, [project.id, selectedSlideId])

  // Listen for browser back/forward
  useEffect(() => {
    const cleanup = onHashChange(({ projectId, slideId }) => {
      // Load project if it changed
      if (projectId && projectId !== project.id) {
        const loadedProject = loadProject(projectId)
        if (loadedProject) {
          setProject(loadedProject)
          lastProjectId.current = projectId

          // If no slide specified, default to first slide
          if (!slideId && loadedProject.slides.length > 0) {
            const firstSlideId = loadedProject.slides[0].id
            setSelectedSlide(firstSlideId)
            lastSlideId.current = firstSlideId
          }
        }
      }

      // Update selected slide if it changed
      if (slideId && slideId !== selectedSlideId) {
        setSelectedSlide(slideId)
        lastSlideId.current = slideId
      } else if (!slideId && project.slides.length > 0) {
        // No slide in URL - default to first slide
        const firstSlideId = project.slides[0].id
        setSelectedSlide(firstSlideId)
        lastSlideId.current = firstSlideId
      }

      // Save current URL
      saveLastUrl(window.location.href)
    })

    return cleanup
  }, [project.id, selectedSlideId, setProject, setSelectedSlide])
}
