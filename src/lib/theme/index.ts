export {
  DEFAULT_SPACING,
  DEFAULT_TYPOGRAPHY,
  LIGHT_COLORS,
  DARK_COLORS,
  COVER_SPACING,
  TWO_COL_SPACING,
  TWO_COL_TYPOGRAPHY,
  DEFAULT_LIGHT_THEME,
  DEFAULT_DARK_THEME,
  createThemeFromBrand,
  mergeTheme,
  getLayoutTheme,
  themeDefinitionToTheme,
} from './defaults'

export { useLayoutTheme } from './useLayoutTheme'

export type {
  ThemeDefinition,
  ColorPalette,
  TypographyScale,
  SpacingScale,
  Theme,
} from '../types/design'
