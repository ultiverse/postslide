import { useProject } from '@/state/project.store'
import { RotateCcw } from 'lucide-react'
import { AVAILABLE_FONTS } from '@/lib/fonts/google-fonts'
import { LIGHT_COLORS } from '@/lib/theme/defaults'
import type { SlideBlock, TextBlock } from '@/types/domain'

interface BlockStyleControlsProps {
  slideId: string
  block: SlideBlock
}

export function BlockStyleControls({ slideId, block }: BlockStyleControlsProps) {
  // Subscribe to brand explicitly to ensure re-renders on brand changes
  const brand = useProject((s) => s.project.brand) || {
    primary: '#3b82f6',
  }
  const updateBlockStyle = useProject((s) => s.updateBlockStyle)
  const resetBlockStyle = useProject((s) => s.resetBlockStyle)

  // Only text blocks can have style overrides
  if (!('text' in block || block.kind === 'bullets')) {
    return null
  }

  const textBlock = block as TextBlock
  const style = textBlock.style || {}

  // Calculate inherited values based on block type and template defaults
  const getInheritedColor = (): string => {
    switch (block.kind) {
      case 'title':
        return brand.primary // Titles use brand primary for emphasis
      case 'subtitle':
        return LIGHT_COLORS.textMuted // Subtitles use muted gray
      case 'body':
      case 'bullets':
      default:
        return LIGHT_COLORS.text // Body text uses near-black
    }
  }

  const getInheritedFont = (): string => {
    // Font comes from template typography (Inter by default)
    return 'Inter'
  }

  const inheritedColor = getInheritedColor()
  const inheritedFont = getInheritedFont()

  const hasOverrides = Boolean(textBlock.style && Object.keys(textBlock.style).length > 0)

  return (
    <div className="space-y-3 border-t border-brand-200/50 bg-gradient-to-b from-brand-50/20 to-transparent px-3 py-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-brand-700">Style Overrides</h4>
        {hasOverrides && (
          <button
            onClick={() => resetBlockStyle(slideId, block.id)}
            className="flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-100 active:bg-brand-200"
            title="Reset to brand defaults"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      {/* Text Color */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-brand-700">
          Text Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={style.color || inheritedColor}
            onChange={(e) => updateBlockStyle(slideId, block.id, { color: e.target.value })}
            className="h-8 w-12 cursor-pointer rounded border border-brand-300 bg-white transition-all hover:border-brand-400"
          />
          <input
            type="text"
            value={style.color || ''}
            onChange={(e) => updateBlockStyle(slideId, block.id, { color: e.target.value })}
            className="flex-1 rounded border border-brand-300 bg-white px-2 py-1 text-xs font-mono text-brand-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder={`Inherit (${inheritedColor})`}
          />
        </div>
        <p className="text-xs text-brand-500">
          {style.color ? `Overriding inherited color (${inheritedColor})` : `Inherited from template`}
        </p>
      </div>

      {/* Font Family */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-brand-700">
          Font Family
        </label>
        <select
          value={style.fontFamily || ''}
          onChange={(e) => {
            const selectedFont = e.target.value || undefined;
            updateBlockStyle(slideId, block.id, { fontFamily: selectedFont });
          }}
          className="w-full rounded border border-brand-300 bg-white px-2 py-1.5 text-xs text-brand-900 transition-colors hover:border-brand-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">
            Inherit ({inheritedFont})
          </option>
          {AVAILABLE_FONTS.map((font) => (
            <option key={font.name} value={font.name}>
              {font.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-brand-500">
          {style.fontFamily ? `Overriding inherited font (${inheritedFont})` : `Inherited from template`}
        </p>
      </div>

      {/* Text Alignment */}
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-brand-700">
          Text Alignment
        </label>
        <div className="flex gap-1">
          {(['left', 'center', 'right'] as const).map((align) => (
            <button
              key={align}
              onClick={() => updateBlockStyle(slideId, block.id, { textAlign: align })}
              className={`flex-1 rounded border px-3 py-1.5 text-xs font-medium transition-all ${
                (style.textAlign || 'left') === align
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-brand-300 bg-white text-brand-700 hover:bg-brand-50'
              }`}
            >
              {align.charAt(0).toUpperCase() + align.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Uppercase Toggle */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="checkbox"
          id={`uppercase-${block.id}`}
          checked={style.uppercase || false}
          onChange={(e) => updateBlockStyle(slideId, block.id, { uppercase: e.target.checked })}
          className="h-4 w-4 cursor-pointer rounded border-brand-300 text-brand-600 transition-colors focus:ring-2 focus:ring-brand-500 focus:ring-offset-0"
        />
        <label
          htmlFor={`uppercase-${block.id}`}
          className="cursor-pointer text-xs font-medium text-brand-700"
        >
          UPPERCASE TEXT
        </label>
      </div>
    </div>
  )
}
