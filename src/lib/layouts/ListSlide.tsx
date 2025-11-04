import type { LayoutProps } from './types';
import type { TextBlock } from '@/types/domain';
import type { TextStyle } from '@/lib/types/design';
import { useMemo } from 'react';
import { contentRect, isOverflow } from '@/lib/layout/grid';
import { createMeasurer } from '@/lib/layout/measure';
import { layoutBullets } from '@/lib/layout/bullets';
import { BackgroundBlockRenderer, DecorativeBlockRenderer, ImageBlockRenderer } from '@/components/canvas/BlockRenderer';
import { isTextBlock } from '@/lib/constants/blocks';
import { useLayoutTheme } from '@/lib/theme/useLayoutTheme';

// Layout constants (kept for backward compatibility)
const DEFAULT_FONT = 'Inter, system-ui, sans-serif';
const DEFAULT_WIDTH = 1080;
const DEFAULT_HEIGHT = 1080;

/**
 * ListSlide Layout Primitive
 *
 * Vertical stacking layout for content slides with text, bullets, and images.
 * This is the most common layout for content-heavy slides.
 *
 * Expected slots:
 * - title (text, h1): Slide title
 * - body (text, body): Body text
 * - bullets (bullets, body): Bullet points
 * - image (image): Optional image
 */
export function ListSlide({
  slide,
  brand,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  safeInset,
  theme: providedTheme,
}: LayoutProps) {
  const measure = useMemo(() => createMeasurer(), []);
  const { spacing, typography, colors } = useLayoutTheme(brand, providedTheme);

  const spec = {
    width,
    height,
    safeInset: safeInset ?? spacing.safeInset,
    baseline: spacing.baseline
  };
  const cr = contentRect(spec);

  // Separate blocks into layers
  const backgroundBlocks = slide.blocks.filter(b => b.kind === 'background');
  const contentBlocks = slide.blocks.filter(b => isTextBlock(b) || b.kind === 'image');
  const decorativeBlocks = slide.blocks.filter(b => b.kind === 'decorative');

  // Define text styles based on block kind
  const getStyleForBlock = (block: TextBlock): TextStyle => {
    const baseFont = brand.fontBody || DEFAULT_FONT;
    const headFont = brand.fontHead || baseFont;

    switch (block.kind) {
      case 'title':
        return {
          fontFamily: headFont,
          ...typography.h1,
          color: colors.text,
        };
      case 'subtitle':
        return {
          fontFamily: headFont,
          ...typography.h2,
          color: colors.textMuted,
        };
      case 'body':
        return {
          fontFamily: baseFont,
          ...typography.body,
          color: colors.text,
        };
      case 'bullets':
        return {
          fontFamily: baseFont,
          ...typography.body,
          color: colors.text,
        };
    }
  };

  // Calculate block positions with vertical stacking
  const renderedBlocks = useMemo(() => {
    if (!contentBlocks.length) return [];

    let currentY = cr.y;

    return contentBlocks.map((block) => {
      const frameX = cr.x;
      const frameW = cr.w;
      const maxH = cr.h - (currentY - cr.y);

      if (block.kind === 'image') {
        // Image block
        const imgHeight = block.height || spacing.imageHeight;
        const imgWidth = block.width || frameW;
        const frameH = Math.min(imgHeight, maxH);

        const result = {
          block,
          frame: { x: frameX, y: currentY, w: imgWidth, h: frameH },
          type: 'image' as const,
        };

        currentY += frameH + spacing.blockGap;
        return result;
      } else {
        // Text block
        const textBlock = block as TextBlock;
        const style = getStyleForBlock(textBlock);

        let layout;
        let frameH;

        if (textBlock.kind === 'bullets') {
          layout = layoutBullets({
            items: textBlock.bullets,
            style,
            frameWidth: frameW,
            bullet: {
              marker: '•',
              gap: spacing.bulletGap,
              indent: spacing.bulletIndent,
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

        currentY += frameH + spacing.blockGap;
        return result;
      }
    });
  }, [contentBlocks, measure, cr, spacing, colors, typography, brand]);

  const artboardStyle: React.CSSProperties = {
    width: spec.width,
    height: spec.height,
    position: 'relative',
    background: colors.background,
  };

  return (
    <div style={artboardStyle}>
      {/* Background layer */}
      {backgroundBlocks.map((block) => (
        <BackgroundBlockRenderer
          key={block.id}
          block={block}
          width={spec.width}
          height={spec.height}
        />
      ))}

      {/* Content blocks (text and images in order) */}
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

      {/* Decorative layer */}
      {decorativeBlocks.map((block) => {
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
