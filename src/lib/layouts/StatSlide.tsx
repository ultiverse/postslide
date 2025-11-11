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

/**
 * StatSlide Layout Primitive
 *
 * Centered layout for highlighting key metrics and statistics.
 * Features a large number with label and optional context.
 *
 * Expected slots:
 * - number (text, h1): Large statistic or number
 * - label (text, caption): Description of the stat
 * - context (text, body): Optional additional context
 */
export function StatSlide({
  slide,
  brand,
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  safeInset,
  theme: providedTheme,
}: LayoutProps) {
  console.log('[StatSlide] Component rendering with brand.primary:', brand.primary);

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

  // Map blocks to stat components
  // For stat slide, we use the first title block as the number
  // First subtitle becomes the label
  // First body block becomes context
  const numberBlock = textBlocks.find(b => b.kind === 'title');
  const labelBlock = textBlocks.find(b => b.kind === 'subtitle');
  const contextBlock = textBlocks.find(b => b.kind === 'body'); // First body block

  // Text styles for stat components (memoized)
  const numberStyle: TextStyle = useMemo(() => ({
    ...typography.stat,
    fontFamily: DEFAULT_FONT, // Apply after typography to override
    color: colors.primary, // Use brand color for emphasis
  }), [typography.stat, colors.primary]);

  const labelStyle: TextStyle = useMemo(() => ({
    ...typography.h2,
    fontFamily: DEFAULT_FONT, // Apply after typography to override
    color: colors.textMuted,
  }), [typography.h2, colors.textMuted]);

  const contextStyle: TextStyle = useMemo(() => ({
    ...typography.caption,
    fontFamily: DEFAULT_FONT, // Apply after typography to override
    color: colors.text,
  }), [typography.caption, colors.text]);

  // Measure text blocks
  const numberLayout = useMemo(() => {
    if (!numberBlock || numberBlock.kind === 'bullets') return null;
    return measure({
      text: numberBlock.text,
      style: numberStyle,
      maxWidth: cr.w,
    });
  }, [numberBlock, numberStyle, cr.w, measure]);

  const labelLayout = useMemo(() => {
    if (!labelBlock || labelBlock.kind === 'bullets') return null;
    return measure({
      text: labelBlock.text,
      style: labelStyle,
      maxWidth: cr.w,
    });
  }, [labelBlock, labelStyle, cr.w, measure]);

  const contextLayout = useMemo(() => {
    if (!contextBlock || contextBlock.kind === 'bullets') return null;
    return measure({
      text: contextBlock.text,
      style: contextStyle,
      maxWidth: cr.w * 0.8, // Narrower for better readability
    });
  }, [contextBlock, contextStyle, cr.w, measure]);

  // Calculate vertical centering
  const numberHeight = numberLayout?.totalHeight || 0;
  const labelHeight = labelLayout?.totalHeight || 0;
  const contextHeight = contextLayout?.totalHeight || 0;

  const totalContentHeight =
    numberHeight +
    (labelHeight > 0 ? spacing.verticalGap + labelHeight : 0) +
    (contextHeight > 0 ? spacing.verticalGap * 2 + contextHeight : 0);

  const startY = cr.y + (cr.h - totalContentHeight) / 2;

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

      {/* Number/Stat */}
      {numberBlock && numberLayout && (
        <div
          className="absolute"
          style={{
            left: cr.x,
            top: startY,
            width: cr.w,
            height: numberHeight,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              fontFamily: numberStyle.fontFamily,
              fontWeight: numberStyle.fontWeight,
              fontSize: numberStyle.fontSize,
              lineHeight: `${numberStyle.lineHeight}px`,
              color: numberStyle.color,
              textAlign: 'center',
            }}
          >
            {numberLayout.lines.map((ln: { text: string; }, idx: number) => (
              <div
                key={idx}
                style={{
                  height: numberStyle.lineHeight,
                  overflow: 'hidden',
                }}
              >
                {ln.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Label */}
      {labelBlock && labelLayout && (
        <div
          className="absolute"
          style={{
            left: cr.x,
            top: startY + numberHeight + spacing.verticalGap,
            width: cr.w,
            height: labelHeight,
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
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {labelLayout.lines.map((ln: { text: string; }, idx: number) => (
              <div
                key={idx}
                style={{
                  height: labelStyle.lineHeight,
                  overflow: 'hidden',
                }}
              >
                {ln.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Context */}
      {contextBlock && contextLayout && (
        <div
          className="absolute"
          style={{
            left: cr.x + cr.w * 0.1, // Center narrower text
            top: startY + numberHeight + labelHeight + spacing.verticalGap * 2,
            width: cr.w * 0.8,
            height: contextHeight,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              fontFamily: contextStyle.fontFamily,
              fontWeight: contextStyle.fontWeight,
              fontSize: contextStyle.fontSize,
              lineHeight: `${contextStyle.lineHeight}px`,
              color: contextStyle.color,
              textAlign: 'center',
            }}
          >
            {contextLayout.lines.map((ln: { text: string; }, idx: number) => (
              <div
                key={idx}
                style={{
                  height: contextStyle.lineHeight,
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
