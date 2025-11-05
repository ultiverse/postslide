import type { Template, Slide, Brand, TextBlock, TemplateSchema } from '@/types/domain';
import type { ArtboardSpec, TextStyle, Theme } from '@/lib/types/design';
import { contentRect, isOverflow } from '@/lib/layout/grid';
import { createMeasurer } from '@/lib/layout/measure';
import { layoutBullets } from '@/lib/layout/bullets';
import { useMemo } from 'react';
import { ImageBlockRenderer, BackgroundBlockRenderer, DecorativeBlockRenderer } from '@/components/canvas/BlockRenderer';
import { isTextBlock } from '@/lib/constants/blocks';
import { renderSlideFromSchema } from '@/lib/layouts';
import { DEFAULT_LIGHT_THEME, DEFAULT_DARK_THEME } from '@/lib/theme';
import { OverflowBadge } from '@/components/ui/OverflowBadge';

/**
 * Minimal Pro Template
 * Clean, professional layout with vertical block stacking
 * Emphasizes readability with generous spacing
 */

// --- Rendered Block Types ---

type Frame = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type TextLayout = {
  lines: Array<{ text: string; xOffset?: number; marker?: string; }>;
  totalHeight: number;
};

type RenderedTextBlock = {
  type: 'text';
  block: TextBlock;
  style: TextStyle;
  layout: TextLayout;
  frame: Frame;
  overflow: boolean;
};

type RenderedImageBlock = {
  type: 'image';
  block: { kind: 'image'; id: string; src: string; width?: number; height?: number; };
  frame: Frame;
};

type RenderedBlock = RenderedTextBlock | RenderedImageBlock;

const ARTBOARD_SPEC: ArtboardSpec = {
  width: 1080,
  height: 1080,
  safeInset: 80,
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
        fontSize: 80,
        lineHeight: 88,
        color: theme.text,
      };
    case 'subtitle':
      return {
        fontFamily: headFont,
        fontWeight: 600,
        fontSize: 52,
        lineHeight: 64,
        color: theme.textMuted,
      };
    case 'body':
      return {
        fontFamily: baseFont,
        fontWeight: 400,
        fontSize: 36,
        lineHeight: 48,
        color: theme.text,
      };
    case 'bullets':
      return {
        fontFamily: baseFont,
        fontWeight: 400,
        fontSize: 32,
        lineHeight: 48,
        color: theme.text,
      };
  }
}

function MinimalProLayout({ slide, brand }: { slide: Slide; brand: Brand; }) {
  const measure = useMemo(() => createMeasurer(), []);

  const theme: Theme = useMemo(() => ({
    primary: brand.primary,
    text: '#1a1a1a',
    textMuted: '#525252',
    background: '#ffffff',
  }), [brand.primary]);

  const spec = ARTBOARD_SPEC;
  const cr = contentRect(spec);

  // Separate blocks into backgrounds, content blocks, and decorative elements
  const backgroundBlocks = slide.blocks.filter(b => b.kind === 'background');
  const contentBlocks = slide.blocks.filter(b => isTextBlock(b) || b.kind === 'image');
  const decorativeBlocks = slide.blocks.filter(b => b.kind === 'decorative');

  // Calculate block positions with vertical stacking for content blocks (text + images)
  const renderedBlocks = useMemo((): RenderedBlock[] => {
    if (!contentBlocks.length) return [];

    let currentY = cr.y;
    const blockGap = 32; // Increased from 24 for stronger consistent spacing

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
              gap: 16,
              indent: 40,
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
function TextBlock({ renderBlock }: { renderBlock: RenderedTextBlock; }) {
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
        {layout.lines.map((ln, idx) => (
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
function BulletBlock({ renderBlock }: { renderBlock: RenderedTextBlock; }) {
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
        {layout.lines.map((ln, idx) => (
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

// Schema definition for Minimal Pro
const minimalProSchema: TemplateSchema = {
  id: 'minimal-pro',
  name: 'Minimal Pro',
  description: 'Clean, professional layout with vertical block stacking and generous spacing',
  theme: {
    id: 'light',
    variants: ['light', 'dark'],
  },
  decorators: {
    // Navigation arrow on first slide (bottom-right, follows outer gutter)
    first: [
      {
        type: 'arrow',
        position: { anchor: 'bottom-right', offsetX: -80, offsetY: -80 },
        props: {
          direction: 'right',
          size: 120,
          color: '#3b82f6',
        },
      },
    ],
    // Navigation arrows on middle slides (both sides, follow outer gutter)
    middle: [
      {
        type: 'arrow',
        position: { anchor: 'bottom-left', offsetX: 80, offsetY: -80 },
        props: {
          direction: 'left',
          size: 120,
          color: '#3b82f6',
        },
      },
      {
        type: 'arrow',
        position: { anchor: 'bottom-right', offsetX: -80, offsetY: -80 },
        props: {
          direction: 'right',
          size: 120,
          color: '#3b82f6',
        },
      },
      {
        type: 'pageNumber',
        position: { anchor: 'bottom-center', offsetY: -96 },
        props: {
          format: 'current/total',
          fontSize: 20,
          color: '#525252',
        },
      },
    ],
    // Back arrow on last slide (bottom-left, follows outer gutter)
    last: [
      {
        type: 'arrow',
        position: { anchor: 'bottom-left', offsetX: 80, offsetY: -80 },
        props: {
          direction: 'left',
          size: 120,
          color: '#3b82f6',
        },
      },
    ],
  },
  progressBar: {
    enabled: true,
    position: 'bottom',
    height: 4,
    startColor: '#3b82f6',
    endColor: '#8b5cf6',
    style: 'gradient',
  },
  layouts: [
    {
      id: 'list',
      kind: 'list',
      slots: [
        { id: 'title', type: 'text', style: 'h1' },
        { id: 'body', type: 'text', style: 'body' },
        { id: 'bullets', type: 'bullets', style: 'body' },
      ],
    },
    {
      id: 'title',
      kind: 'title',
      slots: [
        { id: 'title', type: 'text', style: 'h1' },
        { id: 'subtitle', type: 'text', style: 'h2' },
      ],
    },
    {
      id: 'two-col',
      kind: 'two-col',
      slots: [
        { id: 'title', type: 'text', style: 'h1' },
        { id: 'left-content', type: 'text', style: 'body' },
        { id: 'right-content', type: 'text', style: 'body' },
      ],
    },
    {
      id: 'stat',
      kind: 'stat',
      slots: [
        { id: 'number', type: 'text', style: 'h1' },
        { id: 'label', type: 'text', style: 'caption' },
        { id: 'context', type: 'text', style: 'body' },
      ],
    },
    {
      id: 'quote',
      kind: 'quote',
      slots: [
        { id: 'quote', type: 'text', style: 'h2' },
        { id: 'attribution', type: 'text', style: 'caption' },
      ],
    },
    {
      id: 'cover',
      kind: 'cover',
      slots: [
        { id: 'title', type: 'text', style: 'h1' },
        { id: 'subtitle', type: 'text', style: 'h2' },
        { id: 'background', type: 'image' },
      ],
    },
    {
      id: 'image-focus',
      kind: 'image-focus',
      slots: [
        { id: 'image', type: 'image' },
        { id: 'title', type: 'text', style: 'h2' },
        { id: 'caption', type: 'text', style: 'body' },
      ],
    },
    {
      id: 'comparison',
      kind: 'comparison',
      slots: [
        { id: 'title', type: 'text', style: 'h1' },
        { id: 'left-label', type: 'text', style: 'h2' },
        { id: 'left-content', type: 'bullets', style: 'body' },
        { id: 'right-label', type: 'text', style: 'h2' },
        { id: 'right-content', type: 'bullets', style: 'body' },
      ],
    },
    {
      id: 'timeline',
      kind: 'timeline',
      slots: [
        { id: 'title', type: 'text', style: 'h1' },
        { id: 'item-1', type: 'text', style: 'body' },
        { id: 'item-2', type: 'text', style: 'body' },
        { id: 'item-3', type: 'text', style: 'body' },
        { id: 'item-4', type: 'text', style: 'body' },
      ],
    },
    {
      id: 'section-break',
      kind: 'section-break',
      slots: [
        { id: 'title', type: 'text', style: 'h1' },
        { id: 'subtitle', type: 'text', style: 'h2' },
      ],
    },
  ],
};

export const minimalPro: Template = {
  id: 'minimal-pro',
  name: 'Minimal Pro',
  description: 'Clean, professional layout with vertical block stacking and generous spacing',
  schema: minimalProSchema,
  theme: DEFAULT_LIGHT_THEME,
  themeVariants: {
    light: DEFAULT_LIGHT_THEME,
    dark: DEFAULT_DARK_THEME,
  },
  layout: (slide: Slide, brand: Brand, slideIndex?: number, totalSlides?: number) => {
    // Use schema-driven renderer if schema is available
    if (minimalProSchema) {
      return renderSlideFromSchema(minimalProSchema, slide, brand, minimalPro, slideIndex, totalSlides);
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
