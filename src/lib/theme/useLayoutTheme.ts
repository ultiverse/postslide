import { useMemo } from 'react'
import type { Theme, ColorPalette, TypographyScale, SpacingScale } from '../types/design'
import type { Brand } from '@/types/domain'
import { DEFAULT_LIGHT_THEME, DEFAULT_TYPOGRAPHY, DEFAULT_SPACING } from './defaults'

/**
 * Hook to create or use a theme for layouts
 * Handles backward compatibility and provides convenient access to theme properties
 */
export function useLayoutTheme(brand: Brand, providedTheme?: Theme) {
  const theme: Theme = useMemo(() => {
    if (providedTheme) return providedTheme

    return {
      primary: brand.primary,
      text: DEFAULT_LIGHT_THEME.colors.text,
      textMuted: DEFAULT_LIGHT_THEME.colors.textMuted,
      background: DEFAULT_LIGHT_THEME.colors.background,
      colors: {
        ...DEFAULT_LIGHT_THEME.colors,
        primary: brand.primary,
      },
      typography: DEFAULT_TYPOGRAPHY,
      spacing: DEFAULT_SPACING,
    }
  }, [brand.primary, providedTheme])

  const spacing: SpacingScale = theme.spacing || DEFAULT_SPACING
  const typography: TypographyScale = theme.typography || DEFAULT_TYPOGRAPHY
  const colors: ColorPalette = theme.colors || {
    primary: theme.primary,
    text: theme.text,
    textMuted: theme.textMuted,
    background: theme.background,
  }

  return {
    theme,
    spacing,
    typography,
    colors,
  }
}
