import { OverflowBadge } from '@/components/ui/OverflowBadge';
import type { RenderedTextBlock } from './types';

/**
 * BulletBlock Component
 *
 * Renders a bullet list block with markers and proper indentation.
 * Shows an overflow badge if content exceeds the available space.
 */
export function BulletBlock({ renderBlock }: { renderBlock: RenderedTextBlock }) {
  const { style, layout, frame, overflow, block } = renderBlock;

  // Apply block-level style overrides
  const textAlign = block.style?.textAlign || 'left';
  const textTransform = block.style?.uppercase ? 'uppercase' : 'none';

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
          textAlign,
          textTransform,
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
