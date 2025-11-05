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
const DEFAULT_FONT = 'Inter, system-ui, sans-serif';
const DEFAULT_WIDTH = 1080;
const DEFAULT_HEIGHT = 1080;
const DIVIDER_WIDTH = 120;
const DIVIDER_HEIGHT = 4;
const TEXT_DIVIDER_GAP = 32;

/**
 * SectionBreakSlide Layout Primitive
 *
 * Minimalist divider slide to separate sections in a presentation.
 * Features a simple title with optional decorative divider line.
 *
 * Expected slots:
 * - title (text, h1): Section title
 * - subtitle (text, h2): Optional section number or subtitle
 */
export function SectionBreakSlide({
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

  // Find blocks
  const titleBlock = textBlocks.find(b => b.kind === 'title');
  const subtitleBlock = textBlocks.find(b => b.kind === 'subtitle');

  // Define text styles - memoized for stable deps
  const titleStyle: TextStyle = useMemo(() => ({
    fontFamily: brand.fontHead || brand.fontBody || DEFAULT_FONT,
    ...typography.display,
    color: colors.text,
  }), [brand.fontHead, brand.fontBody, typography.display, colors.text]);

  const subtitleStyle: TextStyle = useMemo(() => ({
    fontFamily: brand.fontHead || brand.fontBody || DEFAULT_FONT,
    ...typography.h2,
    color: colors.textMuted,
  }), [brand.fontHead, brand.fontBody, typography.h2, colors.textMuted]);

  // Measure text blocks
  const titleLayout = useMemo(() => {
    if (!titleBlock || titleBlock.kind === 'bullets') return null;
    return measure({
      text: titleBlock.text,
      style: titleStyle,
      maxWidth: cr.w,
    });
  }, [titleBlock, titleStyle, cr.w, measure]);

  const subtitleLayout = useMemo(() => {
    if (!subtitleBlock || subtitleBlock.kind === 'bullets') return null;
    return measure({
      text: subtitleBlock.text,
      style: subtitleStyle,
      maxWidth: cr.w,
    });
  }, [subtitleBlock, subtitleStyle, cr.w, measure]);

  // Calculate vertical centering with divider
  const titleHeight = titleLayout?.totalHeight || 0;
  const subtitleHeight = subtitleLayout?.totalHeight || 0;
  const dividerSpace = TEXT_DIVIDER_GAP + DIVIDER_HEIGHT + TEXT_DIVIDER_GAP;

  // Layout order: subtitle (if exists), divider, title
  const totalContentHeight =
    (subtitleHeight > 0 ? subtitleHeight + dividerSpace : 0) +
    titleHeight;

  const startY = cr.y + (cr.h - totalContentHeight) / 2;

  let currentY = startY;

  // Subtitle comes first (section number or label)
  const subtitleY = currentY;
  if (subtitleHeight > 0) {
    currentY += subtitleHeight + TEXT_DIVIDER_GAP;
  }

  // Divider
  const dividerY = currentY;
  currentY += DIVIDER_HEIGHT + TEXT_DIVIDER_GAP;

  // Title
  const titleY = currentY;

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

      {/* Subtitle (section number/label) */}
      {subtitleBlock && subtitleLayout && (
        <div
          className="absolute"
          style={{
            left: cr.x,
            top: subtitleY,
            width: cr.w,
            height: subtitleHeight,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              fontFamily: subtitleStyle.fontFamily,
              fontWeight: subtitleStyle.fontWeight,
              fontSize: subtitleStyle.fontSize,
              lineHeight: `${subtitleStyle.lineHeight}px`,
              color: subtitleStyle.color,
              letterSpacing: subtitleStyle.letterSpacing,
              textAlign: 'center',
              textTransform: 'uppercase',
            }}
          >
            {subtitleLayout.lines.map((ln: { text: string; }, idx: number) => (
              <div
                key={idx}
                style={{
                  height: subtitleStyle.lineHeight,
                  overflow: 'hidden',
                }}
              >
                {ln.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decorative divider */}
      <div
        className="absolute"
        style={{
          left: cr.x + (cr.w - DIVIDER_WIDTH) / 2,
          top: dividerY,
          width: DIVIDER_WIDTH,
          height: DIVIDER_HEIGHT,
          background: colors.primary,
        }}
      />

      {/* Title */}
      {titleBlock && titleLayout && (
        <div
          className="absolute"
          style={{
            left: cr.x,
            top: titleY,
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
              <div
                key={idx}
                style={{
                  height: titleStyle.lineHeight,
                  overflow: 'hidden',
                }}
              >
                {ln.text}
              </div>
            ))}
          </div>
        </div>
      )}

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
