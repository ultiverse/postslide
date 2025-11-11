import { useEffect } from 'react'
import { preloadAllFonts } from '@/lib/fonts/google-fonts'

/**
 * Hook to preload all available fonts
 */
export function useFontLoader() {
  // Preload all fonts on mount
  useEffect(() => {
    preloadAllFonts()
  }, [])
}
