import type { Slide, TemplateSchema, LayoutDefinition, LayoutSlot } from '@/types/domain'
import { templates } from '@/templates'

/**
 * Get a template by ID
 */
export function getTemplateById(templateId: string) {
  return templates.find(t => t.id === templateId)
}

/**
 * Get the schema for a template
 */
export function getTemplateSchema(templateId: string): TemplateSchema | undefined {
  const template = getTemplateById(templateId)
  return template?.schema
}

/**
 * Get a specific layout from a template's schema
 */
export function getLayout(templateId: string, layoutId: string): LayoutDefinition | undefined {
  const schema = getTemplateSchema(templateId)
  if (!schema) return undefined
  return schema.layouts.find(l => l.id === layoutId)
}

/**
 * Get the default layout for a template (first layout in schema)
 */
export function getDefaultLayout(templateId: string): LayoutDefinition | undefined {
  const schema = getTemplateSchema(templateId)
  return schema?.layouts[0]
}

/**
 * Get all available layouts for a template
 */
export function getTemplateLayouts(templateId: string): LayoutDefinition[] {
  const schema = getTemplateSchema(templateId)
  return schema?.layouts || []
}

/**
 * Match a slide to the best layout based on its content
 *
 * This is a smart function that analyzes slide blocks and suggests
 * the most appropriate layout from a template's schema.
 */
export function matchSlideToLayout(slide: Slide, templateId: string): LayoutDefinition | undefined {
  const layouts = getTemplateLayouts(templateId)
  if (layouts.length === 0) return undefined

  // Analyze slide content
  const hasTitle = slide.blocks.some(b => b.kind === 'title')
  const hasSubtitle = slide.blocks.some(b => b.kind === 'subtitle')
  const hasBullets = slide.blocks.some(b => b.kind === 'bullets')
  const hasImage = slide.blocks.some(b => b.kind === 'image')
  const textBlockCount = slide.blocks.filter(b => b.kind === 'title' || b.kind === 'subtitle' || b.kind === 'body').length
  const hasOnlyTitleAndSubtitle = hasTitle && (hasSubtitle || textBlockCount === 1) && !hasBullets && !hasImage

  // Try to find the best matching layout

  // Title slide: only title and optional subtitle
  if (hasOnlyTitleAndSubtitle) {
    const titleLayout = layouts.find(l => l.kind === 'title' || l.kind === 'cover')
    if (titleLayout) return titleLayout
  }

  // Two-column: if we have multiple content blocks
  if (textBlockCount >= 4 || (hasImage && textBlockCount >= 2)) {
    const twoColLayout = layouts.find(l => l.kind === 'two-col')
    if (twoColLayout) return twoColLayout
  }

  // List/content slide: default for most content
  const listLayout = layouts.find(l => l.kind === 'list')
  if (listLayout) return listLayout

  // Fallback to first layout
  return layouts[0]
}

/**
 * Get suggested blocks for a layout
 *
 * Based on a layout's slots, suggest which blocks should be created
 */
export function getSuggestedBlocksForLayout(layout: LayoutDefinition): Array<{ kind: Slide['blocks'][0]['kind'], placeholder: string }> {
  const suggestions: Array<{ kind: Slide['blocks'][0]['kind'], placeholder: string }> = []
  const seenKinds = new Set<string>() // Track which block kinds we've already suggested

  for (const slot of layout.slots) {
    switch (slot.type) {
      case 'text':
        let blockKind: Slide['blocks'][0]['kind']
        let placeholder: string

        if (slot.style === 'h1' || slot.id.includes('title') || slot.id.includes('number')) {
          blockKind = 'title'
          placeholder = 'Your Title Here'
        } else if (slot.style === 'h2' || slot.id.includes('subtitle') || slot.id.includes('attribution') || slot.id.includes('label')) {
          blockKind = 'subtitle'
          placeholder = 'Your Subtitle'
        } else {
          blockKind = 'body'
          placeholder = 'Start writing your content...'
        }

        // Only add if we haven't seen this kind before
        if (!seenKinds.has(blockKind)) {
          suggestions.push({ kind: blockKind, placeholder })
          seenKinds.add(blockKind)
        }
        break
      case 'bullets':
        if (!seenKinds.has('bullets')) {
          suggestions.push({ kind: 'bullets', placeholder: 'Add bullet points' })
          seenKinds.add('bullets')
        }
        break
      case 'image':
        if (!seenKinds.has('image')) {
          suggestions.push({ kind: 'image', placeholder: 'Add an image' })
          seenKinds.add('image')
        }
        break
      // 'number' slot type doesn't directly map to a block kind yet
    }
  }

  return suggestions
}

/**
 * Check if a slide is compatible with a layout
 *
 * Returns true if the slide's blocks can be reasonably rendered by the layout
 */
export function isSlideCompatibleWithLayout(slide: Slide, layout: LayoutDefinition): boolean {
  // For now, all slides are compatible with all layouts
  // Layouts will adapt to render whatever blocks are present
  // In the future, we could add stricter validation
  return true
}

/**
 * Get a human-readable description of a layout
 */
export function getLayoutDescription(layout: LayoutDefinition): string {
  const slotDescriptions = layout.slots.map(s => {
    const styleDesc = s.style ? ` (${s.style})` : ''
    return `${s.id}: ${s.type}${styleDesc}`
  }).join(', ')

  const kindDescriptions: Record<typeof layout.kind, string> = {
    'title': 'Centered title slide',
    'list': 'Vertical content stack',
    'two-col': 'Two-column layout',
    'stat': 'Large stat with caption',
    'quote': 'Centered quote',
    'cover': 'Cover slide',
  }

  return `${kindDescriptions[layout.kind]} — ${slotDescriptions}`
}
