# SlidePost Template System

Templates define the visual layout and styling for slides in SlidePost. Each template is a self-contained module that renders slides according to its own design system.

## Overview

A template is a pure rendering function that takes a `Slide` and `Brand` configuration and returns a JSX element. Templates control:

- Typography (font sizes, weights, line heights)
- Layout (how blocks are positioned)
- Spacing (gaps, margins, padding)
- Colors (from brand or template defaults)
- Visual style (backgrounds, borders, accents)

## Template Interface

```typescript
type Template = {
  id: string                                    // Unique identifier (e.g., 'minimal-pro')
  name: string                                  // Display name (e.g., 'Minimal Pro')
  description?: string                          // Short description for gallery
  layout: (slide: Slide, brand: Brand) => JSX.Element  // Render function
  defaults: Partial<Slide>                      // Default blocks for new slides
  coverStyle?: 'title-heavy' | 'image-forward' | 'stat'  // Visual category
}
```

## Creating a New Template

### 1. Create a Template File

Create a new file in `src/templates/` (e.g., `my-template.tsx`):

```tsx
import type { Template, Slide, Brand } from '@/types/domain';

function MyTemplateLayout({ slide, brand }: { slide: Slide; brand: Brand }) {
  // Your custom layout logic here
  return (
    <div style={{ width: 1080, height: 1080, background: '#fff' }}>
      {slide.blocks.map(block => (
        // Render blocks according to your design
        <div key={block.id}>
          {/* Custom rendering */}
        </div>
      ))}
    </div>
  );
}

export const myTemplate: Template = {
  id: 'my-template',
  name: 'My Template',
  description: 'A custom template for...',
  layout: (slide: Slide, brand: Brand) => (
    <MyTemplateLayout slide={slide} brand={brand} />
  ),
  defaults: {
    blocks: [
      { id: crypto.randomUUID(), kind: 'title', text: 'Title Here' },
      { id: crypto.randomUUID(), kind: 'body', text: 'Content here...' },
    ],
  },
  coverStyle: 'title-heavy',
};
```

### 2. Register Your Template

Add your template to `src/templates/index.ts`:

```typescript
import { myTemplate } from './my-template';

export const templates: Template[] = [
  minimalPro,
  myTemplate,  // Add here
];
```

### 3. Test Your Template

1. Run the dev server: `npm run dev`
2. Navigate to `/templates` to see your template in the gallery
3. Click "Apply to Project" to test it on actual slides

## Design Guidelines

### Canvas Specifications

- **Canvas size**: 1080x1080px
- **Safe area**: 64px inset on all sides
- **Content area**: 952x952px (1080 - 64*2)
- **Baseline grid**: 8px

### Typography Scale

Recommended sizes for 1080px canvas:

- **Title**: 64-80px, bold (700-900 weight)
- **Subtitle**: 40-56px, semi-bold (600 weight)
- **Body**: 28-36px, regular (400 weight)
- **Bullets**: 24-32px, regular (400 weight)

### Using Brand Configuration

Templates receive a `Brand` object with:

```typescript
type Brand = {
  primary: string      // Brand color (hex)
  fontHead: string     // Heading font family
  fontBody: string     // Body font family
}
```

Use these to make your template adapt to the user's brand:

```tsx
const style = {
  color: brand.primary,           // Use brand color
  fontFamily: brand.fontHead,     // Use brand heading font
};
```

### Block Types

SlidePost supports multiple block types organized into categories:

#### Text Blocks (Editable)

```typescript
type TextBlock =
  | { id: string; kind: 'title' | 'subtitle' | 'body'; text: string }
  | { id: string; kind: 'bullets'; bullets: string[] }
```

#### Image Blocks

```typescript
type ImageBlock = {
  id: string
  kind: 'image'
  src: string              // URL or data URI
  alt?: string
  fit?: 'cover' | 'contain' | 'fill'
  position?: { x: number; y: number; width: number; height: number }
}
```

#### Background Blocks

```typescript
type BackgroundBlock = {
  id: string
  kind: 'background'
  style: 'solid' | 'gradient' | 'image'
  color?: string           // For solid backgrounds
  gradient?: {
    from: string
    to: string
    direction?: 'to-r' | 'to-br' | 'to-b' | 'to-bl'
  }
  image?: string           // URL for background image
  opacity?: number         // 0-1
}
```

#### Decorative Blocks

```typescript
type DecorativeBlock = {
  id: string
  kind: 'decorative'
  variant: 'arrow' | 'divider' | 'accent' | 'shape' | 'icon'
  props?: Record<string, unknown>
}
```

**Decorative variants:**
- **arrow**: Direction indicator (right, left, up, down)
- **divider**: Horizontal line separator
- **accent**: Visual accent (bar, circle, underline)
- **shape**: Geometric shapes (circle, square, triangle)
- **icon**: Icon elements (star, heart, check)

Your template should handle all block types appropriately. Use the helper functions from `@/lib/constants/blocks` to check block types:

```typescript
import { isTextBlock, isVisualBlock, isEditableBlock } from '@/lib/constants/blocks';
```

## Layout Utilities

### Block Renderers

SlidePost provides pre-built renderers for visual blocks:

```tsx
import {
  ImageBlockRenderer,
  BackgroundBlockRenderer,
  DecorativeBlockRenderer
} from '@/components/canvas/BlockRenderer';

// In your template layout:
<BackgroundBlockRenderer block={bgBlock} width={1080} height={1080} />
<ImageBlockRenderer block={imgBlock} x={64} y={64} width={952} height={400} />
<DecorativeBlockRenderer block={decoBlock} x={500} y={900} />
```

**Rendering order:**
1. Background blocks (bottom layer)
2. Image blocks
3. Text blocks
4. Decorative blocks (top layer)

See [minimal-pro.tsx](./minimal-pro.tsx) for a complete example.

### Text Measurement

Use the layout utilities to calculate text dimensions:

```tsx
import { createMeasurer } from '@/lib/layout/measure';
import { layoutBullets } from '@/lib/layout/bullets';

const measure = createMeasurer();

// Measure text blocks
const layout = measure({
  text: block.text,
  style: { fontFamily: 'Inter', fontSize: 48, lineHeight: 56, fontWeight: 600 },
  maxWidth: 952,
});

// Layout bullets
const bulletLayout = layoutBullets({
  items: block.bullets,
  style: textStyle,
  frameWidth: 952,
  bullet: { marker: '•', gap: 12, indent: 32, markerSizeRatio: 1 },
});
```

### Grid and Safe Area

```tsx
import { contentRect } from '@/lib/layout/grid';

const spec = { width: 1080, height: 1080, safeInset: 64, baseline: 8 };
const cr = contentRect(spec); // { x: 64, y: 64, w: 952, h: 952 }
```

## Template Examples

### Minimal Pro (Reference Implementation)

See `src/templates/minimal-pro.tsx` for a complete example demonstrating:

- Vertical block stacking
- Text measurement and overflow detection
- Brand color and font integration
- Responsive text sizing

### Ideas for New Templates

**Coach's Storyboard**: Large imagery areas with compact text overlays

**Metric Highlights**: Big numbers with supporting context, minimal text

**Journey Steps**: Numbered steps with icons, sequential layout

**Punchy Tips**: Bold headlines with short supporting bullets, high contrast

## Best Practices

1. **Keep it pure**: Templates should be stateless rendering functions
2. **Handle empty states**: Gracefully handle slides with no blocks
3. **Respect the safe area**: Keep critical content within the 64px inset
4. **Test overflow**: Ensure long text doesn't break your layout
5. **Use the brand**: Incorporate brand colors and fonts appropriately
6. **Provide good defaults**: Include sensible default blocks
7. **Document your design**: Add a description explaining the template's purpose

## Free-Form Slides

Users can also create slides without a template by setting `templateId` to `undefined` or an empty string. These slides use the default `CanvasRenderer` which provides a simple vertical stacking layout.

To create a free-form slide programmatically:

```typescript
useProject.getState().addSlide(''); // Empty string = no template
```

## Troubleshooting

**Template not showing in gallery**: Make sure it's exported and added to the `templates` array in `index.ts`

**Layout looks wrong**: Check your canvas dimensions (must be 1080x1080) and ensure you're using absolute positioning correctly

**Fonts not loading**: Templates receive fonts through the `FontLoader` component in Canvas - use `brand.fontHead` and `brand.fontBody`

**Overflow issues**: Use the `isOverflow()` utility and show appropriate indicators

## Resources

- [Type definitions](../types/domain.ts)
- [Design system types](../lib/types/design.ts)
- [Layout utilities](../lib/layout/)
- [Minimal Pro template](./minimal-pro.tsx)
