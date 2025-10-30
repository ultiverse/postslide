import { useMemo } from 'react';
import type { Slide, SlideBlock } from '@/types/domain';
import type { ArtboardSpec, TextStyle, Theme } from '@/lib/types/design';
import { contentRect, isOverflow } from '@/lib/layout/grid';
import { createMeasurer } from '@/lib/layout/measure';
import { layoutBullets } from '@/lib/layout/bullets';
import GridOverlay from "@/components/canvas/GridOverlay";

type Props = {
  slide: Slide | null;
  spec: ArtboardSpec;
  theme: Theme;
  fontsReady: boolean;
  showGrid?: boolean;
};

/**
 * CanvasRenderer: Renders slide content at 1080x1080 with proper text layout.
 * Improvements:
 * - Memoized measurer for performance
 * - Better block positioning based on content type
 * - Overflow detection and indicators
 * - Baseline grid visualization
 */
export function CanvasRenderer({ slide, spec, theme, fontsReady, showGrid }: Props) {
  // Create measurer once
  const measure = useMemo(() => createMeasurer(), []);

  const artboardStyle: React.CSSProperties = {
    width: spec.width,
    height: spec.height,
    position: 'relative',
    background: theme.background,
  };

  const cr = contentRect(spec);

  // Calculate block positions with vertical stacking
  const renderedBlocks = useMemo(() => {
    if (!slide || !slide.blocks.length) return [];

    let currentY = cr.y;
    const blockGap = 24; // Gap between blocks

    return slide.blocks.map((block) => {
      const style: TextStyle = getStyleForBlock(block, theme);
      const frameX = cr.x;
      const frameW = cr.w;
      const maxH = cr.h - (currentY - cr.y);

      let layout;
      let frameH;

      if (block.kind === 'bullets') {
        layout = layoutBullets({
          items: block.bullets,
          style,
          frameWidth: frameW,
          bullet: {
            marker: '•',
            gap: 12,
            indent: 32,
            markerSizeRatio: 1,
          },
        });
        frameH = Math.min(layout.totalHeight, maxH);
      } else {
        layout = measure({
          text: block.text,
          style,
          maxWidth: frameW,
        });
        frameH = Math.min(layout.totalHeight, maxH);
      }

      const result = {
        block,
        style,
        layout,
        frame: { x: frameX, y: currentY, w: frameW, h: frameH },
        overflow: isOverflow(
          block.kind === 'bullets' ? layout.totalHeight : layout.totalHeight,
          frameH
        ),
      };

      currentY += frameH + blockGap;
      return result;
    });
  }, [slide, measure, cr, theme]);

  return (
    <div className="relative shadow-xl rounded-2xl overflow-hidden" style={artboardStyle}>
      <GridOverlay
        spec={spec}
        show={!!showGrid}
        showBaseline
        showSafeArea
        // Optional columns example:
        // columns={{ count: 4, gap: 24, color: "rgb(37,99,235)", alpha: 0.08 }}
        baseline={{ majorEvery: 4 }}
      />

      {/* Loading skeleton */}
      {!fontsReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
          <div className="w-full h-full animate-pulse bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 bg-[length:200%_100%]"
            style={{ animation: 'shimmer 1.5s infinite' }} />
        </div>
      )}

      {/* Render blocks */}
      {fontsReady && slide && renderedBlocks.map((rb) => {
        if (rb.block.kind === 'bullets') {
          return <BulletBlock key={rb.block.id} renderBlock={rb} />;
        }

        return <TextBlock key={rb.block.id} renderBlock={rb} />;
      })}
    </div>
  );
}

// Text block component
/* eslint-disable @typescript-eslint/no-explicit-any */
function TextBlock({ renderBlock }: { renderBlock: any; }) {
  const { style, layout, frame, overflow } = renderBlock;

  return (
    <div
      className="absolute"
      style={{
        left: frame.x,
        top: frame.y,
        width: frame.w,
        height: frame.h,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          fontSize: style.fontSize,
          lineHeight: `${style.lineHeight}px`,
          letterSpacing: style.letterSpacing ?? 0,
          color: style.color,
        }}
      >
        {layout.lines.map((ln: any, idx: number) => (
          <div
            key={idx}
            style={{
              height: style.lineHeight,
              overflow: 'hidden',
            }}
          >
            {ln.text}
          </div>
        ))}
      </div>
      {overflow && <OverflowBadge />}
    </div>
  );
}

// Bullet block component
function BulletBlock({ renderBlock }: { renderBlock: any; }) {
  const { style, layout, frame, overflow } = renderBlock;

  return (
    <div
      className="absolute"
      style={{
        left: frame.x,
        top: frame.y,
        width: frame.w,
        height: frame.h,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          fontFamily: style.fontFamily,
          fontWeight: style.fontWeight,
          fontSize: style.fontSize,
          lineHeight: `${style.lineHeight}px`,
          letterSpacing: style.letterSpacing ?? 0,
          color: style.color,
        }}
      >
        {layout.lines.map((ln: any, idx: number) => (
          <div
            key={idx}
            style={{
              height: style.lineHeight,
              paddingLeft: ln.xOffset,
              position: 'relative',
            }}
          >
            {ln.marker && (
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  width: ln.xOffset,
                  textAlign: 'center',
                }}
              >
                {ln.marker}
              </span>
            )}
            {ln.text}
          </div>
        ))}
      </div>
      {overflow && <OverflowBadge />}
    </div>
  );
}

function OverflowBadge() {
  return (
    <div className="absolute right-2 bottom-2 px-2 py-1 rounded-md bg-amber-500 text-white text-xs font-semibold shadow-lg flex items-center gap-1">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <span>Overflow</span>
    </div>
  );
}

// Helper to get text style based on block type
function getStyleForBlock(block: SlideBlock, theme: Theme): TextStyle {
  const baseFont = 'Inter, system-ui, sans-serif';

  switch (block.kind) {
    case 'title':
      return {
        fontFamily: baseFont,
        fontWeight: 700,
        fontSize: 72,
        lineHeight: 80,
        color: theme.text,
      };
    case 'subtitle':
      return {
        fontFamily: baseFont,
        fontWeight: 600,
        fontSize: 48,
        lineHeight: 56,
        color: theme.textMuted,
      };
    case 'body':
      return {
        fontFamily: baseFont,
        fontWeight: 400,
        fontSize: 32,
        lineHeight: 40,
        color: theme.text,
      };
    case 'bullets':
      return {
        fontFamily: baseFont,
        fontWeight: 400,
        fontSize: 28,
        lineHeight: 40,
        color: theme.text,
      };
    default:
      return {
        fontFamily: baseFont,
        fontWeight: 400,
        fontSize: 32,
        lineHeight: 40,
        color: theme.text,
      };
  }
}
