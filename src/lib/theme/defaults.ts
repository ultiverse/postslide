import { ThemeDefinition, ColorPalette, TypographyScale, SpacingScale, Theme } from '../types/design'
import { Brand } from '../../types/domain'

/**
 * Default spacing scale - works for most layouts
 */
export const DEFAULT_SPACING: SpacingScale = {
  baseline: 8,
  safeInset: 64,
  blockGap: 24,
  columnGap: 48,
  bulletIndent: 48,
  bulletGap: 12,
  verticalGap: 16,
  imageHeight: 300,
}

/**
 * Default typography scale - balanced for readability
 */
export const DEFAULT_TYPOGRAPHY: TypographyScale = {
  display: {
    fontWeight: 800,
    fontSize: 96,
    lineHeight: 104,
    letterSpacing: -0.03,
  },
  h1: {
    fontWeight: 700,
    fontSize: 72,
    lineHeight: 80,
    letterSpacing: -0.02,
  },
  h2: {
    fontWeight: 600,
    fontSize: 48,
    lineHeight: 56,
  },
  body: {
    fontWeight: 400,
    fontSize: 32,
    lineHeight: 40,
  },
  caption: {
    fontWeight: 500,
    fontSize: 24,
    lineHeight: 32,
  },
  stat: {
    fontWeight: 700,
    fontSize: 144,
    lineHeight: 152,
  },
  quote: {
    fontWeight: 600,
    fontSize: 48,
    lineHeight: 60,
    letterSpacing: -0.02,
  },
}

/**
 * Light color palette (default)
 */
export const LIGHT_COLORS: ColorPalette = {
  primary: '#3b82f6',     // Blue-500
  text: '#1a1a1a',        // Near black
  textMuted: '#666666',   // Medium gray
  background: '#ffffff',  // White
  surface: '#f9fafb',     // Gray-50
  border: '#e5e7eb',      // Gray-200
}

/**
 * Dark color palette
 */
export const DARK_COLORS: ColorPalette = {
  primary: '#60a5fa',     // Blue-400 (slightly lighter for dark mode)
  text: '#ffffff',        // White
  textMuted: '#e0e0e0',   // Light gray
  background: '#1a1a1a',  // Near black
  surface: '#2a2a2a',     // Slightly lighter black
  border: '#404040',      // Medium dark gray
}

/**
 * Cover slide spacing (larger safe insets)
 */
export const COVER_SPACING: SpacingScale = {
  ...DEFAULT_SPACING,
  safeInset: 80,
  verticalGap: 24,
}

/**
 * Two-column spacing (tighter for space efficiency)
 */
export const TWO_COL_SPACING: SpacingScale = {
  ...DEFAULT_SPACING,
  bulletGap: 8,
}

/**
 * Two-column typography (smaller for space efficiency)
 */
export const TWO_COL_TYPOGRAPHY: TypographyScale = {
  ...DEFAULT_TYPOGRAPHY,
  h1: {
    fontWeight: 700,
    fontSize: 64,
    lineHeight: 72,
    letterSpacing: -0.02,
  },
  h2: {
    fontWeight: 600,
    fontSize: 40,
    lineHeight: 48,
  },
  body: {
    fontWeight: 400,
    fontSize: 28,
    lineHeight: 36,
  },
  caption: {
    fontWeight: 500,
    fontSize: 20,
    lineHeight: 28,
  },
}

/**
 * Default light theme
 */
export const DEFAULT_LIGHT_THEME: ThemeDefinition = {
  id: 'light',
  name: 'Light',
  description: 'Clean light theme with dark text',
  colors: LIGHT_COLORS,
  typography: DEFAULT_TYPOGRAPHY,
  spacing: DEFAULT_SPACING,
}

/**
 * Default dark theme
 */
export const DEFAULT_DARK_THEME: ThemeDefinition = {
  id: 'dark',
  name: 'Dark',
  description: 'Modern dark theme with light text',
  colors: DARK_COLORS,
  typography: DEFAULT_TYPOGRAPHY,
  spacing: DEFAULT_SPACING,
}

/**
 * Utility to create a theme from a brand
 * @param brand Brand configuration
 * @param baseTheme Optional base theme to extend
 */
export function createThemeFromBrand(brand: Brand, baseTheme?: ThemeDefinition): Theme {
  const base = baseTheme || DEFAULT_LIGHT_THEME

  return {
    // Backward compatible fields
    primary: brand.primary,
    text: base.colors.text,
    textMuted: base.colors.textMuted,
    background: base.colors.background,

    // Extended theme system
    colors: {
      ...base.colors,
      primary: brand.primary, // Override with brand color
    },
    typography: base.typography,
    spacing: base.spacing,
  }
}

/**
 * Utility to merge theme overrides
 */
export function mergeTheme(base: ThemeDefinition, overrides: Partial<ThemeDefinition>): ThemeDefinition {
  return {
    ...base,
    ...overrides,
    colors: { ...base.colors, ...overrides.colors },
    typography: { ...base.typography, ...overrides.typography },
    spacing: { ...base.spacing, ...overrides.spacing },
  }
}

/**
 * Get theme for a specific layout kind
 * Some layouts need adjusted spacing/typography
 */
export function getLayoutTheme(
  baseTheme: ThemeDefinition,
  layoutKind: string
): ThemeDefinition {
  switch (layoutKind) {
    case 'cover':
      return {
        ...baseTheme,
        spacing: COVER_SPACING,
      }

    case 'two-col':
    case 'comparison':
      return {
        ...baseTheme,
        typography: TWO_COL_TYPOGRAPHY,
        spacing: TWO_COL_SPACING,
      }

    default:
      return baseTheme
  }
}

/**
 * Convert ThemeDefinition to Theme for use in layout components
 */
export function themeDefinitionToTheme(def: ThemeDefinition): Theme {
  return {
    primary: def.colors.primary,
    text: def.colors.text,
    textMuted: def.colors.textMuted,
    background: def.colors.background,
    colors: def.colors,
    typography: def.typography,
    spacing: def.spacing,
  }
}
