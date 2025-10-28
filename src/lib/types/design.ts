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

export interface Theme {
  primary: string;
  text: string;
  textMuted: string;
  background: string;
}
