import type { LayoutProps } from './types';
import type { TextBlock } from '@/types/domain';
import type { TextStyle } from '@/lib/types/design';
import { useMemo } from 'react';
import { contentRect } from '@/lib/layout/grid';
import { createMeasurer } from '@/lib/layout/measure';
import { BackgroundBlockRenderer, DecorativeBlockRenderer } from '@/components/canvas/BlockRenderer';
import { isTextBlock } from '@/lib/constants/blocks';
import { useLayoutTheme } from '@/lib/theme/useLayoutTheme';

// Layout constants
const DEFAULT_FONT = 'Inter';
const DEFAULT_WIDTH = 1080;
const DEFAULT_HEIGHT = 1080;
const TITLE_GAP = 48;
const TIMELINE_HEIGHT = 4;
const DOT_SIZE = 20;
const LABEL_GAP = 24;
const DESCRIPTION_GAP = 12;

/**
 * TimelineSlide Layout Primitive
 *
 * Horizontal timeline with milestones and descriptions.
 * Perfect for roadmaps, historical progression, or step-by-step processes.
 *
 * Expected slots:
 * - title (text, h1): Optional main title
 * - body blocks: Each body block becomes a timeline item (up to 4)
 *   Format: "Label | Description" or just "Label"
 */
export function TimelineSlide({
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

  // Separate blocks
  const backgroundBlocks = slide.blocks.filter(b => b.kind === 'background');
  const decorativeBlocks = slide.blocks.filter(b => b.kind === 'decorative');
  const textBlocks = slide.blocks.filter(isTextBlock) as TextBlock[];

  // Find title and timeline items
  const titleBlock = textBlocks.find(b => b.kind === 'title');
  const timelineItems = textBlocks
    .filter(b => b.kind === 'body' || b.kind === 'subtitle')
    .slice(0, 4); // Max 4 timeline items

  // Define text styles (memoized)
  const titleStyle: TextStyle = useMemo(() => ({
    ...typography.h1,
    fontFamily: DEFAULT_FONT, // Apply after typography to override
    color: colors.text,
  }), [typography.h1, colors.text]);

  const labelStyle: TextStyle = useMemo(() => ({
    ...typography.h2,
    fontFamily: DEFAULT_FONT, // Apply after typography to override
    color: colors.text,
  }), [typography.h2, colors.text]);

  const descriptionStyle: TextStyle = useMemo(() => ({
    ...typography.caption,
    fontFamily: DEFAULT_FONT, // Apply after typography to override
    color: colors.textMuted,
  }), [typography.caption, colors.textMuted]);

  // Measure title
  const titleLayout = useMemo(() => {
    if (!titleBlock || titleBlock.kind === 'bullets') return null;
    return measure({
      text: titleBlock.text,
      style: titleStyle,
      maxWidth: cr.w,
    });
  }, [titleBlock, titleStyle, cr.w, measure]);

  const titleHeight = titleLayout?.totalHeight || 0;
  const timelineStartY = cr.y + (titleHeight > 0 ? titleHeight + TITLE_GAP : 0);
  const timelineContentHeight = cr.h - (titleHeight > 0 ? titleHeight + TITLE_GAP : 0);

  // Calculate timeline layout
  const itemCount = timelineItems.length;
  const itemWidth = itemCount > 1 ? cr.w / (itemCount - 1) : cr.w;
  const timelineLineY = timelineStartY + timelineContentHeight * 0.3;

  // Parse timeline items (support "Label | Description" format)
  const parsedItems = timelineItems.map(item => {
    const text = item.kind === 'bullets' ? '' : item.text;
    const parts = text.split('|').map(s => s.trim());
    return {
      label: parts[0] || text,
      description: parts[1] || '',
    };
  });

  // Measure each item
  const itemLayouts = useMemo(() => {
    return parsedItems.map(({ label, description }) => {
      const labelLayout = measure({
        text: label,
        style: labelStyle,
        maxWidth: itemWidth - 40,
      });
      const descLayout = description ? measure({
        text: description,
        style: descriptionStyle,
        maxWidth: itemWidth - 40,
      }) : null;
      return { labelLayout, descLayout };
    });
  }, [parsedItems, labelStyle, descriptionStyle, itemWidth, measure]);

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

      {/* Title */}
      {titleBlock && titleLayout && (
        <div
          className="absolute"
          style={{
            left: cr.x,
            top: cr.y,
            width: cr.w,
            height: titleHeight,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              fontFamily: titleStyle.fontFamily,
              fontWeight: titleStyle.fontWeight,
              fontSize: titleStyle.fontSize,
              lineHeight: `${titleStyle.lineHeight}px`,
              color: titleStyle.color,
              textAlign: 'center',
            }}
          >
            {titleLayout.lines.map((ln: { text: string; }, idx: number) => (
              <div key={idx} style={{ height: titleStyle.lineHeight, overflow: 'hidden' }}>
                {ln.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline line */}
      {itemCount > 1 && (
        <div
          className="absolute"
          style={{
            left: cr.x,
            top: timelineLineY - TIMELINE_HEIGHT / 2,
            width: cr.w,
            height: TIMELINE_HEIGHT,
            background: colors.textMuted,
            opacity: 0.3,
          }}
        />
      )}

      {/* Timeline items */}
      {parsedItems.map((item, idx) => {
        const itemX = itemCount > 1
          ? cr.x + (idx * itemWidth)
          : cr.x + cr.w / 2;
        const layout = itemLayouts[idx];

        return (
          <div key={idx}>
            {/* Dot */}
            <div
              className="absolute"
              style={{
                left: itemX - DOT_SIZE / 2,
                top: timelineLineY - DOT_SIZE / 2,
                width: DOT_SIZE,
                height: DOT_SIZE,
                borderRadius: '50%',
                background: colors.primary,
                border: `3px solid ${colors.background}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            />

            {/* Label */}
            {layout.labelLayout && (
              <div
                className="absolute"
                style={{
                  left: itemX - (itemWidth - 40) / 2,
                  top: timelineLineY + DOT_SIZE / 2 + LABEL_GAP,
                  width: itemWidth - 40,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    fontFamily: labelStyle.fontFamily,
                    fontWeight: labelStyle.fontWeight,
                    fontSize: labelStyle.fontSize,
                    lineHeight: `${labelStyle.lineHeight}px`,
                    color: labelStyle.color,
                    textAlign: 'center',
                  }}
                >
                  {layout.labelLayout.lines.map((ln: { text: string; }, lnIdx: number) => (
                    <div key={lnIdx} style={{ height: labelStyle.lineHeight, overflow: 'hidden' }}>
                      {ln.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {layout.descLayout && (
              <div
                className="absolute"
                style={{
                  left: itemX - (itemWidth - 40) / 2,
                  top: timelineLineY + DOT_SIZE / 2 + LABEL_GAP + (layout.labelLayout?.totalHeight || 0) + DESCRIPTION_GAP,
                  width: itemWidth - 40,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    fontFamily: descriptionStyle.fontFamily,
                    fontWeight: descriptionStyle.fontWeight,
                    fontSize: descriptionStyle.fontSize,
                    lineHeight: `${descriptionStyle.lineHeight}px`,
                    color: descriptionStyle.color,
                    textAlign: 'center',
                  }}
                >
                  {layout.descLayout.lines.map((ln: { text: string; }, lnIdx: number) => (
                    <div key={lnIdx} style={{ height: descriptionStyle.lineHeight, overflow: 'hidden' }}>
                      {ln.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
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
