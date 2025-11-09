import { useEffect } from 'react'
import { useProject } from '@/state/project.store'
import { preloadAllFonts, loadGoogleFont } from '@/lib/fonts/google-fonts'

/**
 * Hook to preload all available fonts and load project-specific fonts
 */
export function useFontLoader() {
  const project = useProject((s) => s.project)

  // Preload all fonts on mount
  useEffect(() => {
    preloadAllFonts()
  }, [])

  // Load project brand fonts when they change
  useEffect(() => {
    if (project.brand) {
      const brand = project.brand
      const loadFonts = async () => {
        if (brand.fontHead) {
          await loadGoogleFont(brand.fontHead)
        }
        if (brand.fontBody) {
          await loadGoogleFont(brand.fontBody)
        }
      }
      loadFonts()
    }
  }, [project.brand])
}
