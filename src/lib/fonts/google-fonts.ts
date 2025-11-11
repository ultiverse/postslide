/**
 * Google Fonts Integration
 * Dynamically loads Google Fonts and manages font families for the brand system
 */

export const AVAILABLE_FONTS = [
  { name: 'Inter', category: 'sans-serif' },
  { name: 'Montserrat', category: 'sans-serif' },
  { name: 'Roboto', category: 'sans-serif' },
  { name: 'Plus Jakarta Sans', category: 'sans-serif' },
  { name: 'Lora', category: 'serif' },
  { name: 'Playfair Display', category: 'serif' },
  { name: 'Open Sans', category: 'sans-serif' },
  { name: 'Poppins', category: 'sans-serif' },
] as const

export type FontName = typeof AVAILABLE_FONTS[number]['name']

/**
 * Load a Google Font dynamically
 */
export function loadGoogleFont(fontFamily: string, weights: number[] = [400, 500, 600, 700, 800, 900]): void {
  // Check if font is already loaded
  const linkId = `google-font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`
  if (document.getElementById(linkId)) {
    return
  }

  // Create link element
  const link = document.createElement('link')
  link.id = linkId
  link.rel = 'stylesheet'

  // Build Google Fonts URL with weights
  const fontName = fontFamily.replace(/\s+/g, '+')
  const weightString = weights.join(';')
  link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@${weightString}&display=swap`

  document.head.appendChild(link)
}

/**
 * Load multiple Google Fonts at once
 */
export function loadGoogleFonts(fontFamilies: string[]): void {
  fontFamilies.forEach(font => loadGoogleFont(font))
}

/**
 * Preload all available fonts for instant access
 */
export function preloadAllFonts(): void {
  AVAILABLE_FONTS.forEach(font => loadGoogleFont(font.name))
}

/**
 * Get CSS font-family string with fallbacks
 */
export function getFontFamilyWithFallbacks(fontFamily: string): string {
  const font = AVAILABLE_FONTS.find(f => f.name === fontFamily)

  if (!font) {
    return fontFamily
  }

  const fallback = font.category === 'serif'
    ? 'Georgia, serif'
    : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

  return `"${fontFamily}", ${fallback}`
}
