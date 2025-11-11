import { useState, useRef, useCallback, useEffect } from 'react'
import { useProject } from '@/state/project.store'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Brand } from '@/types/domain'

export function BrandSettings() {
  // Subscribe to brand explicitly to ensure re-renders on brand changes
  const brand: Brand = useProject((s) => s.project.brand) || {
    primary: '#3b82f6',
  }
  const updateBrand = useProject((s) => s.updateBrand)

  const [isExpanded, setIsExpanded] = useState(false)

  // Local state for immediate UI feedback
  const [localColor, setLocalColor] = useState('')

  // Debounce timer ref
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Sync local color with brand when brand changes externally
  useEffect(() => {
    setLocalColor(brand.primary)
  }, [brand.primary])

  const handleColorChange = useCallback((color: string) => {
    // Update local state immediately for responsive UI
    setLocalColor(color)

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Debounce the actual brand update
    debounceTimer.current = setTimeout(() => {
      updateBrand({ primary: color })
    }, 150) // 150ms debounce - good balance between responsiveness and performance
  }, [updateBrand])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  return (
    <div className="border-b border-brand-200/50 bg-white/80">
      {/* Accordion Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-brand-50/30"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-brand-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-brand-600" />
          )}
          <h3 className="text-sm font-semibold text-brand-900">Brand</h3>
        </div>
        <div
          className="h-4 w-4 rounded border border-brand-300"
          style={{ backgroundColor: localColor || brand.primary }}
        />
      </button>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="space-y-4 border-t border-brand-200/30 bg-gradient-to-b from-brand-50/20 to-transparent px-4 py-4">
          {/* Primary Color */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-brand-700">
              Primary Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={localColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="h-9 w-16 cursor-pointer rounded border border-brand-300 bg-white transition-all hover:border-brand-400"
              />
              <input
                type="text"
                value={localColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="flex-1 rounded border border-brand-300 bg-white px-2 py-1.5 text-xs font-mono text-brand-900 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="#3b82f6"
              />
            </div>
            <p className="text-xs text-brand-500 mt-1">
              Changes apply to all slides automatically
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
