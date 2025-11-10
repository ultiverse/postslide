import { useMemo } from 'react';
import type { Slide, Brand, TextBlock as TextBlockType } from '@/types/domain';
import type { ArtboardSpec, TextStyle, Theme } from '@/lib/types/design';
import { contentRect, isOverflow } from '@/lib/layout/grid';
import { createMeasurer } from '@/lib/layout/measure';
import { layoutBullets } from '@/lib/layout/bullets';
import { isTextBlock } from '@/lib/constants/blocks';
import { ImageBlockRenderer, BackgroundBlockRenderer, DecorativeBlockRenderer } from '@/components/canvas/BlockRenderer';
import { TextBlock } from './TextBlock';
import { BulletBlock } from './BulletBlock';
import type { RenderedBlock } from './types';

const ARTBOARD_SPEC: ArtboardSpec = {
  width: 1080,
  height: 1080,
  safeInset: 80,
  baseline: 8,
};

function getStyleForBlock(block: TextBlockType, theme: Theme, brand: Brand): TextStyle {
  const defaultFont = 'Inter';

  switch (block.kind) {
    case 'title':
      return {
        fontFamily: defaultFont,
        fontWeight: 700,
        fontSize: 80,
        lineHeight: 88,
        color: theme.text,
      };
    case 'subtitle':
      return {
        fontFamily: defaultFont,
        fontWeight: 600,
        fontSize: 52,
        lineHeight: 64,
        color: theme.textMuted,
      };
    case 'body':
      return {
        fontFamily: defaultFont,
        fontWeight: 400,
        fontSize: 36,
        lineHeight: 48,
        color: theme.text,
      };
    case 'bullets':
      return {
        fontFamily: defaultFont,
        fontWeight: 400,
        fontSize: 32,
        lineHeight: 48,
        color: theme.text,
      };
  }
}

/**
 * MinimalProLayout Component
 *
 * Renders slides with vertical block stacking and generous spacing.
 * Features strong contrast, consistent spacing, and clean typography.
 */
export function MinimalProLayout({ slide, brand }: { slide: Slide; brand: Brand }) {
  const measure = useMemo(() => createMeasurer(), []);

  const theme: Theme = useMemo(
    () => ({
      primary: brand.primary,
      text: '#0a0a0a',
      textMuted: '#525252',
      background: '#ffffff',
    }),
    [brand.primary]
  );

  const spec = ARTBOARD_SPEC;
  const cr = contentRect(spec);

  // Separate blocks into backgrounds, content blocks, and decorative elements
  const backgroundBlocks = slide.blocks.filter((b) => b.kind === 'background');
  const contentBlocks = slide.blocks.filter((b) => isTextBlock(b) || b.kind === 'image');
  const decorativeBlocks = slide.blocks.filter((b) => b.kind === 'decorative');

  // Calculate block positions with vertical stacking for content blocks (text + images)
  const renderedBlocks = useMemo((): RenderedBlock[] => {
    if (!contentBlocks.length) return [];

    let currentY = cr.y;
    const blockGap = 32;

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
        const textBlock = block as TextBlockType;
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
              indent: 48,
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
        const x = (block.props?.x as number) ?? spec.width / 2 - 24;
        const y = (block.props?.y as number) ?? spec.height - 100;
        return <DecorativeBlockRenderer key={block.id} block={block} x={x} y={y} />;
      })}
    </div>
  );
}
