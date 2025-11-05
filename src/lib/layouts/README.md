# Layout Primitives

Schema-driven layout system for SlidePost templates.

## Overview

The layout primitives system provides reusable, composable layout components that can be configured via JSON schemas rather than writing custom React code for each template.

## Architecture

### Key Components

1. **TemplateSchema** - Declarative template definition
2. **Layout Primitives** - Reusable layout components (TitleSlide, ListSlide, TwoColSlide, etc.)
3. **Schema Renderer** - Converts schema definitions into rendered layouts

### Type Definitions

```typescript
// Schema types (defined in src/types/domain.ts)
type TemplateSchema = {
  id: string
  name: string
  description?: string
  layouts: LayoutDefinition[]
}

type LayoutDefinition = {
  id: string
  kind: 'title' | 'two-col' | 'list' | 'stat' | 'quote' | 'cover'
  slots: LayoutSlot[]
}

type LayoutSlot = {
  id: string
  type: 'text' | 'image' | 'bullets' | 'number'
  style?: 'h1' | 'h2' | 'body' | 'caption'
  props?: Record<string, unknown>
}
```

## Available Layout Primitives

### TitleSlide

Centered title slide with optional subtitle. Ideal for cover slides and section breaks.

**Expected Slots:**
- `title` (text, h1): Main title
- `subtitle` (text, h2): Optional subtitle

**Example:**
```typescript
{
  id: 'title-layout',
  kind: 'title',
  slots: [
    { id: 'title', type: 'text', style: 'h1' },
    { id: 'subtitle', type: 'text', style: 'h2' },
  ],
}
```

### ListSlide

Vertical stacking layout for content slides. Supports text, bullets, and images.

**Expected Slots:**
- `title` (text, h1): Slide title
- `body` (text, body): Body text
- `bullets` (bullets, body): Bullet points
- `image` (image): Optional image

**Example:**
```typescript
{
  id: 'content-layout',
  kind: 'list',
  slots: [
    { id: 'title', type: 'text', style: 'h1' },
    { id: 'body', type: 'text', style: 'body' },
    { id: 'bullets', type: 'bullets', style: 'body' },
  ],
}
```

### TwoColSlide

Two-column layout for content comparison or text + image layouts.

**Expected Slots:**
- `title` (text, h1): Optional title spanning both columns
- `left-*` (text/image): Content for left column
- `right-*` (text/image): Content for right column

**Example:**
```typescript
{
  id: 'two-col-layout',
  kind: 'two-col',
  slots: [
    { id: 'title', type: 'text', style: 'h1' },
    { id: 'left-content', type: 'text', style: 'body' },
    { id: 'right-content', type: 'text', style: 'body' },
  ],
}
```

## Usage

### Creating a Schema-Based Template

```typescript
import type { Template, TemplateSchema } from '@/types/domain'
import { renderSlideFromSchema } from '@/lib/layouts'

const myTemplateSchema: TemplateSchema = {
  id: 'my-template',
  name: 'My Template',
  description: 'A custom template using schema',
  layouts: [
    {
      id: 'default',
      kind: 'list',
      slots: [
        { id: 'title', type: 'text', style: 'h1' },
        { id: 'body', type: 'text', style: 'body' },
      ],
    },
  ],
}

export const myTemplate: Template = {
  id: 'my-template',
  name: 'My Template',
  description: 'A custom template using schema',
  schema: myTemplateSchema,
  layout: (slide, brand) => renderSlideFromSchema(myTemplateSchema, slide, brand),
  defaults: {
    blocks: [
      { id: 'temp-1', kind: 'title', text: 'Your Title Here' },
      { id: 'temp-2', kind: 'body', text: 'Start writing...' },
    ],
  },
}
```

### Using Layout Primitives Directly

```typescript
import { ListSlide } from '@/lib/layouts'

function MyCustomTemplate({ slide, brand }) {
  const layoutProps = {
    slots: [
      { id: 'title', type: 'text', style: 'h1' },
      { id: 'body', type: 'text', style: 'body' },
    ],
    slide,
    brand,
  }

  return <ListSlide {...layoutProps} />
}
```

## Layout Constants

All layouts use consistent constants for styling:

```typescript
const DEFAULT_FONT = 'Inter, system-ui, sans-serif'
const DEFAULT_WIDTH = 1080
const DEFAULT_HEIGHT = 1080
const DEFAULT_SAFE_INSET = 64
const DEFAULT_BASELINE = 8
const DEFAULT_TEXT_COLOR = '#1a1a1a'
const DEFAULT_TEXT_MUTED = '#666666'
const DEFAULT_BACKGROUND = '#ffffff'
```

## Block Mapping

The layout primitives automatically map slide blocks to layout slots:

1. **Title blocks** → title slots
2. **Subtitle blocks** → subtitle slots
3. **Body blocks** → body slots
4. **Bullet blocks** → bullet slots
5. **Image blocks** → image slots

Currently uses a simple "find by block kind" approach. Future versions may support more sophisticated mapping.

## Future Enhancements

### Planned Layout Primitives

- **StatSlide** - Large number/stat with caption
- **QuoteSlide** - Centered quote with attribution
- **CoverSlide** - Full-bleed image with title overlay

### Planned Features

- Custom slot mapping configuration
- Layout selection based on slide content
- Dynamic layout switching within a presentation
- User-configurable layout parameters
- Visual template builder UI

## Migration Guide

### From React-based Templates to Schema-based

**Before (React-based):**
```typescript
export const myTemplate: Template = {
  id: 'my-template',
  name: 'My Template',
  layout: (slide, brand) => (
    <div>
      {/* Custom React code */}
    </div>
  ),
  defaults: { blocks: [...] },
}
```

**After (Schema-based):**
```typescript
const schema: TemplateSchema = {
  id: 'my-template',
  name: 'My Template',
  layouts: [
    {
      id: 'default',
      kind: 'list',
      slots: [
        { id: 'title', type: 'text', style: 'h1' },
        { id: 'body', type: 'text', style: 'body' },
      ],
    },
  ],
}

export const myTemplate: Template = {
  id: 'my-template',
  name: 'My Template',
  schema,
  layout: (slide, brand) => renderSlideFromSchema(schema, slide, brand),
  defaults: { blocks: [...] },
}
```

## Benefits

1. **Faster Development** - Define templates in minutes, not hours
2. **Consistency** - All templates use the same layout primitives
3. **Maintainability** - Updates to primitives improve all templates
4. **Inspectability** - Templates can be analyzed and validated
5. **Future-Proof** - Enables user-generated templates and visual builders
6. **Serializable** - Templates can be saved/loaded as JSON
