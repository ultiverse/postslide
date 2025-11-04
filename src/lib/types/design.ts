export type Px = number;

export interface ArtboardSpec {
  width: Px;           // 1080
  height: Px;          // 1080
  safeInset: Px;       // 64 default
  baseline: Px;        // 8 default
}

export interface TextStyle {
  fontFamily: string;      // e.g., "Inter"
  fontWeight: number;      // 400, 600, 700
  fontSize: Px;            // in px units on the 1080 canvas
  lineHeight: Px;          // explicit for pixel-perfect baseline
  letterSpacing?: number;  // optional
  color: string;           // hex
}

export interface ColorPalette {
  primary: string;        // Brand/accent color
  text: string;           // Main text color
  textMuted: string;      // Secondary text color
  background: string;     // Background color
  surface?: string;       // Optional surface/card color
  border?: string;        // Optional border color
}

export interface TypographyScale {
  // Display/Hero - For cover slides and major titles
  display: {
    fontWeight: number;
    fontSize: Px;
    lineHeight: Px;
    letterSpacing?: number;
  };

  // Heading 1 - Main slide titles
  h1: {
    fontWeight: number;
    fontSize: Px;
    lineHeight: Px;
    letterSpacing?: number;
  };

  // Heading 2 - Subtitles, section headers
  h2: {
    fontWeight: number;
    fontSize: Px;
    lineHeight: Px;
    letterSpacing?: number;
  };

  // Body - Main content text
  body: {
    fontWeight: number;
    fontSize: Px;
    lineHeight: Px;
  };

  // Caption - Small text, labels, attributions
  caption: {
    fontWeight: number;
    fontSize: Px;
    lineHeight: Px;
  };

  // Stat - Large numbers
  stat: {
    fontWeight: number;
    fontSize: Px;
    lineHeight: Px;
  };

  // Quote - Quote text styling
  quote: {
    fontWeight: number;
    fontSize: Px;
    lineHeight: Px;
    letterSpacing?: number;
  };
}

export interface SpacingScale {
  baseline: Px;          // Base unit (typically 8)
  safeInset: Px;        // Edge safe area (64-80)
  blockGap: Px;         // Gap between blocks (24)
  columnGap: Px;        // Gap between columns (48)
  bulletIndent: Px;     // Bullet list indentation (48)
  bulletGap: Px;        // Gap between bullets (8-12)
  verticalGap: Px;      // General vertical spacing (16-24)
  imageHeight: Px;      // Default image height (300)
}

export interface Theme {
  // Basic colors (backward compatible)
  primary: string;
  text: string;
  textMuted: string;
  background: string;

  // Extended theme system
  colors?: ColorPalette;
  typography?: TypographyScale;
  spacing?: SpacingScale;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description?: string;
  colors: ColorPalette;
  typography: TypographyScale;
  spacing: SpacingScale;
}
