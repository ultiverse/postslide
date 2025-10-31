import type { Template, Slide, Brand, TextBlock, TemplateSchema } from '@/types/domain';
import type { ArtboardSpec, TextStyle, Theme } from '@/lib/types/design';
import { contentRect, isOverflow } from '@/lib/layout/grid';
import { createMeasurer } from '@/lib/layout/measure';
import { layoutBullets } from '@/lib/layout/bullets';
import { useMemo } from 'react';
import { ImageBlockRenderer, BackgroundBlockRenderer, DecorativeBlockRenderer } from '@/components/canvas/BlockRenderer';
import { isTextBlock } from '@/lib/constants/blocks';
import { renderSlideFromSchema } from '@/lib/layouts';

/**
 * Minimal Pro Template
 * Clean, professional layout with vertical block stacking
 * Emphasizes readability with generous spacing
 */

const ARTBOARD_SPEC: ArtboardSpec = {
  width: 1080,
  height: 1080,
  safeInset: 64,
  baseline: 8,
};

function getStyleForBlock(block: TextBlock, theme: Theme, brand: Brand): TextStyle {
  const baseFont = brand.fontBody || 'Inter, system-ui, sans-serif';
  const headFont = brand.fontHead || baseFont;

  switch (block.kind) {
    case 'title':
      return {
        fontFamily: headFont,
        fontWeight: 700,
        fontSize: 72,
        lineHeight: 80,
        color: theme.text,
      };
    case 'subtitle':
      return {
        fontFamily: headFont,
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
  }
}

function MinimalProLayout({ slide, brand }: { slide: Slide; brand: Brand; }) {
  const measure = useMemo(() => createMeasurer(), []);

  const theme: Theme = useMemo(() => ({
    primary: brand.primary,
    text: '#1a1a1a',
    textMuted: '#666666',
    background: '#ffffff',
  }), [brand.primary]);

  const spec = ARTBOARD_SPEC;
  const cr = contentRect(spec);

  // Separate blocks into backgrounds, content blocks, and decorative elements
  const backgroundBlocks = slide.blocks.filter(b => b.kind === 'background');
  const contentBlocks = slide.blocks.filter(b => isTextBlock(b) || b.kind === 'image');
  const decorativeBlocks = slide.blocks.filter(b => b.kind === 'decorative');

  // Calculate block positions with vertical stacking for content blocks (text + images)
  const renderedBlocks = useMemo(() => {
    if (!contentBlocks.length) return [];

    let currentY = cr.y;
    const blockGap = 24; // Gap between blocks

    return contentBlocks.map((block) => {
      const frameX = cr.x;
      const frameW = cr.w;
      const maxH = cr.h - (currentY - cr.y);

      if (block.kind === 'image') {
        // Image block
        const imgHeight = block.height || 300;
        const imgWidth = block.width || frameW;
        const frameH = Math.min(imgHeight, maxH);

        const result = {
          block,
          frame: { x: frameX, y: currentY, w: imgWidth, h: frameH },
          type: 'image' as const,
        };

        currentY += frameH + blockGap;
        return result;
      } else {
        // Text block
        const textBlock = block as TextBlock;
        const style: TextStyle = getStyleForBlock(textBlock, theme, brand);

        let layout;
        let frameH;

        if (textBlock.kind === 'bullets') {
          layout = layoutBullets({
            items: textBlock.bullets,
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
            text: textBlock.text,
            style,
            maxWidth: frameW,
          });
          frameH = Math.min(layout.totalHeight, maxH);
        }

        const result = {
          block: textBlock,
          style,
          layout,
          frame: { x: frameX, y: currentY, w: frameW, h: frameH },
          overflow: isOverflow(layout.totalHeight, frameH),
          type: 'text' as const,
        };

        currentY += frameH + blockGap;
        return result;
      }
    });
  }, [contentBlocks, measure, cr, theme, brand]);

  const artboardStyle: React.CSSProperties = {
    width: spec.width,
    height: spec.height,
    position: 'relative',
    background: theme.background,
  };

  return (
    <div style={artboardStyle}>
      {/* Render background blocks first (bottom layer) */}
      {backgroundBlocks.map((block) => (
        <BackgroundBlockRenderer
          key={block.id}
          block={block}
          width={spec.width}
          height={spec.height}
        />
      ))}

      {/* Render content blocks (text and images in order) */}
      {renderedBlocks.map((rb) => {
        if (rb.type === 'image') {
          return (
            <ImageBlockRenderer
              key={rb.block.id}
              block={rb.block}
              x={rb.frame.x}
              y={rb.frame.y}
              width={rb.frame.w}
              height={rb.frame.h}
            />
          );
        } else if (rb.block.kind === 'bullets') {
          return <BulletBlock key={rb.block.id} renderBlock={rb} />;
        }
        return <TextBlock key={rb.block.id} renderBlock={rb} />;
      })}

      {/* Render decorative blocks (top layer) */}
      {decorativeBlocks.map((block) => {
        // Position decorative elements at the bottom center by default
        const x = block.props?.x as number ?? spec.width / 2 - 24;
        const y = block.props?.y as number ?? spec.height - 100;
        return (
          <DecorativeBlockRenderer
            key={block.id}
            block={block}
            x={x}
            y={y}
          />
        );
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

// Schema definition for Minimal Pro
const minimalProSchema: TemplateSchema = {
  id: 'minimal-pro',
  name: 'Minimal Pro',
  description: 'Clean, professional layout with vertical block stacking and generous spacing',
  layouts: [
    {
      id: 'default',
      kind: 'list',
      slots: [
        { id: 'title', type: 'text', style: 'h1' },
        { id: 'body', type: 'text', style: 'body' },
        { id: 'bullets', type: 'bullets', style: 'body' },
      ],
    },
  ],
};

export const minimalPro: Template = {
  id: 'minimal-pro',
  name: 'Minimal Pro',
  description: 'Clean, professional layout with vertical block stacking and generous spacing',
  schema: minimalProSchema,
  layout: (slide: Slide, brand: Brand) => {
    // Use schema-driven renderer if schema is available
    if (minimalProSchema) {
      return renderSlideFromSchema(minimalProSchema, slide, brand);
    }
    // Fallback to original implementation
    return <MinimalProLayout slide={slide} brand={brand} />;
  },
  defaults: {
    // Note: IDs will be generated when blocks are actually created
    blocks: [
      { id: 'temp-1', kind: 'title', text: 'Your Title Here' },
      { id: 'temp-2', kind: 'body', text: 'Start writing your content...' },
    ],
  },
  coverStyle: 'title-heavy',
};
