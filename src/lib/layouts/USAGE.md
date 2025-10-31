# Layout System Usage Guide

Complete guide for using the schema-driven layout system in SlidePost.

## Quick Start

### 1. Applying a Template to a Slide

```typescript
import { useProjectStore } from '@/state/project.store'

function MyComponent() {
  const applyTemplateToSlide = useProjectStore(s => s.applyTemplateToSlide)

  // Apply the minimal-pro template to slide 's1'
  applyTemplateToSlide('s1', 'minimal-pro')
}
```

### 2. Applying a Specific Layout to a Slide

```typescript
import { useProjectStore } from '@/state/project.store'

function MyComponent() {
  const applyLayoutToSlide = useProjectStore(s => s.applyLayoutToSlide)

  // Apply a specific layout from a template
  applyLayoutToSlide('s1', 'minimal-pro', 'two-col-layout')
}
```

### 3. Auto-Match Best Layout for Slide Content

```typescript
import { useProjectStore } from '@/state/project.store'

function MyComponent() {
  const autoMatchLayoutForSlide = useProjectStore(s => s.autoMatchLayoutForSlide)

  // Automatically choose the best layout based on slide content
  autoMatchLayoutForSlide('s1', 'minimal-pro')
}
```

## Working with Layouts

### Getting Available Layouts for a Template

```typescript
import { getTemplateLayouts, getLayoutDescription } from '@/lib/layouts/utils'

// Get all layouts for a template
const layouts = getTemplateLayouts('minimal-pro')

// Display layouts to user
layouts.forEach(layout => {
  console.log(layout.id, getLayoutDescription(layout))
})
```

### Checking Layout Compatibility

```typescript
import { isSlideCompatibleWithLayout, matchSlideToLayout } from '@/lib/layouts/utils'

// Check if a specific layout works for a slide
const isCompatible = isSlideCompatibleWithLayout(slide, layout)

// Or automatically find the best match
const bestLayout = matchSlideToLayout(slide, 'minimal-pro')
```

### Getting Suggested Blocks for a Layout

```typescript
import { getSuggestedBlocksForLayout } from '@/lib/layouts/utils'

// Get recommended blocks for a layout
const suggestions = getSuggestedBlocksForLayout(layout)

// Add suggested blocks to slide
suggestions.forEach(({ kind, placeholder }) => {
  addBlock(slideId, kind)
})
```

## Complete Example: Layout Picker UI

Here's a complete example of a layout picker component:

```typescript
import { useState } from 'react'
import { useProjectStore } from '@/state/project.store'
import { getTemplateLayouts, getLayoutDescription } from '@/lib/layouts/utils'

function LayoutPicker({ slideId }: { slideId: string }) {
  const slide = useProjectStore(s =>
    s.project.slides.find(sl => sl.id === slideId)
  )
  const applyLayoutToSlide = useProjectStore(s => s.applyLayoutToSlide)
  const templateId = slide?.templateId || 'minimal-pro'

  const layouts = getTemplateLayouts(templateId)

  return (
    <div>
      <h3>Choose Layout</h3>
      <div className="grid grid-cols-2 gap-4">
        {layouts.map(layout => (
          <button
            key={layout.id}
            onClick={() => applyLayoutToSlide(slideId, templateId, layout.id)}
            className={`p-4 border rounded ${
              slide?.layoutId === layout.id ? 'border-blue-500' : 'border-gray-300'
            }`}
          >
            <div className="font-bold">{layout.kind}</div>
            <div className="text-sm text-gray-600">
              {getLayoutDescription(layout)}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
```

## Complete Example: Smart Layout Assistant

Here's an example of a smart assistant that suggests the best layout:

```typescript
import { useProjectStore } from '@/state/project.store'
import { matchSlideToLayout, getLayoutDescription } from '@/lib/layouts/utils'

function LayoutAssistant({ slideId }: { slideId: string }) {
  const slide = useProjectStore(s =>
    s.project.slides.find(sl => sl.id === slideId)
  )
  const autoMatchLayoutForSlide = useProjectStore(s => s.autoMatchLayoutForSlide)
  const templateId = slide?.templateId || 'minimal-pro'

  if (!slide) return null

  const suggestedLayout = matchSlideToLayout(slide, templateId)

  if (!suggestedLayout) return null

  return (
    <div className="bg-blue-50 p-4 rounded">
      <h4 className="font-bold">💡 Layout Suggestion</h4>
      <p className="text-sm mb-2">
        Based on your content, we recommend: <strong>{suggestedLayout.kind}</strong>
      </p>
      <p className="text-xs text-gray-600 mb-3">
        {getLayoutDescription(suggestedLayout)}
      </p>
      <button
        onClick={() => autoMatchLayoutForSlide(slideId, templateId)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Apply Suggested Layout
      </button>
    </div>
  )
}
```

## How Layout Matching Works

The `matchSlideToLayout` function analyzes slide content and suggests layouts based on these rules:

1. **Title Slide** - Selected when:
   - Slide has only a title (and optionally a subtitle)
   - No bullets, images, or body text

2. **Two-Column Slide** - Selected when:
   - 4+ text blocks (good for comparison)
   - OR has image + 2+ text blocks (text + image side-by-side)

3. **List Slide** - Default for most content:
   - Any combination of title, body, bullets, images
   - General-purpose content layout

Future layout types:
- **Stat Slide** - Large number with caption
- **Quote Slide** - Centered quote with attribution
- **Cover Slide** - Full-bleed image with overlay text

## Store API Reference

### `applyTemplateToSlide(slideId: string, templateId: string)`
Apply a template to a single slide using its default layout.

### `applyTemplateToAllSlides(templateId: string)`
Apply a template to all slides in the project.

### `applyLayoutToSlide(slideId: string, templateId: string, layoutId: string)`
Apply a specific layout from a template to a slide.

### `autoMatchLayoutForSlide(slideId: string, templateId: string)`
Automatically select and apply the best layout based on slide content.

## Utility Functions Reference

### `getTemplateById(templateId: string)`
Get a template object by its ID.

### `getTemplateSchema(templateId: string)`
Get the schema for a template.

### `getLayout(templateId: string, layoutId: string)`
Get a specific layout definition.

### `getDefaultLayout(templateId: string)`
Get the first/default layout for a template.

### `getTemplateLayouts(templateId: string)`
Get all available layouts for a template.

### `matchSlideToLayout(slide: Slide, templateId: string)`
Find the best matching layout for slide content.

### `getSuggestedBlocksForLayout(layout: LayoutDefinition)`
Get recommended blocks to create for a layout.

### `isSlideCompatibleWithLayout(slide: Slide, layout: LayoutDefinition)`
Check if a slide can be rendered with a layout.

### `getLayoutDescription(layout: LayoutDefinition)`
Get a human-readable description of a layout.

## Data Model

### Slide with Layout

```typescript
type Slide = {
  id: string
  templateId?: string  // e.g., 'minimal-pro'
  layoutId?: string    // e.g., 'two-col-layout' (optional)
  blocks: SlideBlock[]
}
```

When `layoutId` is set, the renderer will use that specific layout. Otherwise, it uses the template's default layout (first in schema).

### Template with Schema

```typescript
type Template = {
  id: string
  name: string
  schema?: TemplateSchema  // New: declarative layout definitions
  layout: (slide, brand) => ReactElement  // Existing: render function
  defaults: Partial<Slide>
}
```

The `schema` field defines available layouts declaratively. The `layout` function can use `renderSlideFromSchema` to render based on the schema.

## Migration Path

Existing templates without schemas continue to work. New templates should define schemas:

```typescript
const myTemplateSchema: TemplateSchema = {
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
    {
      id: 'two-col',
      kind: 'two-col',
      slots: [
        { id: 'title', type: 'text', style: 'h1' },
        { id: 'left', type: 'text', style: 'body' },
        { id: 'right', type: 'text', style: 'body' },
      ],
    },
  ],
}

export const myTemplate: Template = {
  id: 'my-template',
  name: 'My Template',
  schema: myTemplateSchema,
  layout: (slide, brand) => renderSlideFromSchema(myTemplateSchema, slide, brand),
  defaults: { blocks: [...] },
}
```
