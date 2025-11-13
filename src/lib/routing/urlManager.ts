/**
 * URL Management for Projects and Slides
 *
 * URL Format: /editor#<projectId>/<slideId>
 * Examples:
 * - /editor#project-123/slide-456
 * - /editor#project-123 (no slide selected)
 * - /editor (no project or slide)
 */

interface RouteParams {
  projectId: string | null
  slideId: string | null
}

/**
 * Parse the current URL hash to extract project and slide IDs
 */
export function parseUrlHash(): RouteParams {
  const hash = window.location.hash.slice(1) // Remove '#'

  if (!hash) {
    return { projectId: null, slideId: null }
  }

  const parts = hash.split('/')
  const projectId = parts[0] || null
  const slideId = parts[1] || null

  return { projectId, slideId }
}

/**
 * Update the URL hash with project and slide IDs
 * @param projectId Project ID (optional)
 * @param slideId Slide ID (optional)
 * @param replace If true, replace history entry instead of pushing new one
 */
export function updateUrlHash(
  projectId: string | null,
  slideId: string | null,
  replace = false
): void {
  let hash = ''

  if (projectId) {
    hash = projectId
    if (slideId) {
      hash += `/${slideId}`
    }
  }

  const url = hash ? `#${hash}` : '#'

  if (replace) {
    window.history.replaceState(null, '', url)
  } else {
    window.history.pushState(null, '', url)
  }
}

/**
 * Get the current project ID from URL
 */
export function getCurrentProjectIdFromUrl(): string | null {
  return parseUrlHash().projectId
}

/**
 * Get the current slide ID from URL
 */
export function getCurrentSlideIdFromUrl(): string | null {
  return parseUrlHash().slideId
}

/**
 * Navigate to a project (optionally with a specific slide)
 */
export function navigateToProject(projectId: string, slideId?: string): void {
  updateUrlHash(projectId, slideId || null)
}

/**
 * Navigate to a slide within the current project
 */
export function navigateToSlide(slideId: string): void {
  const { projectId } = parseUrlHash()
  if (!projectId) {
    console.warn('Cannot navigate to slide without a project in URL')
    return
  }
  updateUrlHash(projectId, slideId)
}

/**
 * Clear the URL hash (navigate to root)
 */
export function clearUrlHash(): void {
  updateUrlHash(null, null)
}

/**
 * Listen for hash changes (browser back/forward)
 */
export function onHashChange(callback: (params: RouteParams) => void): () => void {
  const handler = () => {
    const params = parseUrlHash()
    callback(params)
  }

  window.addEventListener('hashchange', handler)

  // Return cleanup function
  return () => {
    window.removeEventListener('hashchange', handler)
  }
}
