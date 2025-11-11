import { OverflowBadge } from '@/components/ui/OverflowBadge';
import type { RenderedTextBlock } from './types';

/**
 * TextBlock Component
 *
 * Renders a single text block (title, subtitle, or body) with its calculated layout.
 * Shows an overflow badge if content exceeds the available space.
 */
export function TextBlock({ renderBlock }: { renderBlock: RenderedTextBlock }) {
  const { style, layout, frame, overflow, block } = renderBlock;
  console.log('[TextBlock] Rendering', block.kind, 'with fontFamily:', style.fontFamily, 'Full style:', style);

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
      data-block-kind={block.kind}
      data-font-family={style.fontFamily}
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
