import { useState, useEffect, useRef } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import FontLoader from './FontLoader';
import { CanvasRenderer } from './CanvasRenderer';
import { useProject } from '@/state/project.store';
import type { ArtboardSpec, Theme } from '@/lib/types/design';

const spec: ArtboardSpec = {
  width: 1080,
  height: 1080,
  safeInset: 64,
  baseline: 8,
};

// Default theme matching the brand colors
const defaultTheme: Theme = {
  primary: '#4a67ff',
  text: '#1f2937',      // neutral-800
  textMuted: '#6b7280',  // neutral-500
  background: '#ffffff',
};

// Default font configuration (Google Fonts)
const defaultFonts = {
  head: {
    family: 'Inter',
    url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2',
    weight: 700,
  },
  body: {
    family: 'Inter',
    url: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
    weight: 400,
  },
};

/**
 * Canvas: Top-level component for slide rendering.
 * Integrates ErrorBoundary, FontLoader, and CanvasRenderer.
 * Improvements:
 * - Default fonts and theme
 * - Proper scaling for display
 * - Development grid toggle
 */
export default function Canvas() {
  const project = useProject(s => s.project);
  const selectedSlideId = useProject(s => s.selectedSlideId);
  const showGrid = useProject(s => s.showGrid);

  const selectedSlide = project.slides.find(s => s.id === selectedSlideId) ?? null;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      const container = containerRef.current.parentElement;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Account for padding (32px top + 32px bottom, 32px left + 32px right)
      const availableWidth = containerWidth - 64;
      const availableHeight = containerHeight - 64;

      // Calculate scale to fit within available space (use 90% to leave some margin)
      const scaleX = (availableWidth / spec.width) * 0.9;
      const scaleY = (availableHeight / spec.height) * 0.9;

      // Use the smaller scale to ensure it fits both dimensions
      const optimalScale = Math.min(scaleX, scaleY, 0.6); // Cap at 0.6 for max size

      setScale(optimalScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Use brand fonts from project if available, otherwise defaults
  const headFont = project.brand?.fontHead
    ? { ...defaultFonts.head, family: project.brand.fontHead }
    : defaultFonts.head;

  const bodyFont = project.brand?.fontBody
    ? { ...defaultFonts.body, family: project.brand.fontBody }
    : defaultFonts.body;

  // Use brand primary color if available
  const theme: Theme = {
    ...defaultTheme,
    primary: project.brand?.primary ?? defaultTheme.primary,
  };

  return (
    <ErrorBoundary>
      <FontLoader head={headFont} body={bodyFont}>
        {fontsReady => (
          <div ref={containerRef} style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
            <CanvasRenderer
              slide={selectedSlide}
              spec={spec}
              theme={theme}
              fontsReady={fontsReady}
              showGrid={showGrid}
            />
          </div>
        )}
      </FontLoader>
    </ErrorBoundary>
  );
}
