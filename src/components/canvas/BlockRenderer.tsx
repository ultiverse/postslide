import type { ImageBlock, BackgroundBlock, DecorativeBlock } from '@/types/domain';
import type React from 'react';
import { PageNumberDecorator } from '@/lib/decorators/PageNumberDecorator';
import { ProgressBarDecorator } from '@/lib/decorators/ProgressBarDecorator';

/**
 * Block Renderers
 *
 * Components for rendering different block types in the canvas.
 * These are low-level rendering components used by templates.
 */

interface ImageBlockProps {
  block: ImageBlock;
  x: number;
  y: number;
  width: number;
  height: number;
  onBlockClick?: (blockId: string) => void;
}

export function ImageBlockRenderer({ block, x, y, width, height, onBlockClick }: ImageBlockProps) {
  if (!block.src) {
    return (
      <div
        className="absolute bg-neutral-100 border-2 border-dashed border-neutral-300 flex items-center justify-center"
        style={{ left: x, top: y, width, height }}
        onClick={() => onBlockClick?.(block.id)}
      >
        <div className="text-center text-neutral-400">
          <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">No image</p>
        </div>
      </div>
    );
  }

  const objectFit = block.fit || 'cover';

  return (
    <div className="absolute overflow-hidden" style={{ left: x, top: y, width, height }} onClick={() => onBlockClick?.(block.id)}>
      <img
        src={block.src}
        alt={block.alt || ''}
        style={{
          width: '100%',
          height: '100%',
          objectFit: objectFit,
        }}
      />
    </div>
  );
}

interface BackgroundBlockProps {
  block: BackgroundBlock;
  width: number;
  height: number;
}

export function BackgroundBlockRenderer({ block, width, height }: BackgroundBlockProps) {
  const opacity = block.opacity ?? 1;

  let backgroundStyle: React.CSSProperties = {};

  switch (block.style) {
    case 'solid':
      backgroundStyle = {
        backgroundColor: block.color || '#ffffff',
        opacity,
      };
      break;
    case 'gradient':
      if (block.gradient) {
        const { from, to, direction = 'to-br' } = block.gradient;
        const gradientMap: Record<string, string> = {
          'to-r': '90deg',
          'to-br': '135deg',
          'to-b': '180deg',
          'to-bl': '225deg',
        };
        const angle = gradientMap[direction] || '135deg';
        backgroundStyle = {
          backgroundImage: `linear-gradient(${angle}, ${from}, ${to})`,
          opacity,
        };
      }
      break;
    case 'image':
      if (block.image) {
        backgroundStyle = {
          backgroundImage: `url(${block.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity,
        };
      }
      break;
  }

  return (
    <div
      className="absolute inset-0"
      style={{
        ...backgroundStyle,
        width,
        height,
      }}
    />
  );
}

interface DecorativeBlockProps {
  block: DecorativeBlock;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export function DecorativeBlockRenderer({ block, x, y, width, height }: DecorativeBlockProps) {
  const props = block.props || {};

  switch (block.variant) {
    case 'arrow':
      return (
        <ArrowDecorative
          x={x}
          y={y}
          direction={props.direction as string || 'right'}
          size={props.size as number || 48}
          color={props.color as string || '#000000'}
        />
      );
    case 'divider':
      return (
        <DividerDecorative
          x={x}
          y={y}
          width={width || 200}
          thickness={props.thickness as number || 2}
          color={props.color as string || '#e5e7eb'}
          style={props.style as string || 'solid'}
        />
      );
    case 'accent':
      return (
        <AccentDecorative
          x={x}
          y={y}
          width={width || 60}
          height={height || 4}
          type={props.type as string || 'bar'}
          color={props.color as string || '#4a67ff'}
        />
      );
    case 'shape':
      return (
        <ShapeDecorative
          x={x}
          y={y}
          shape={props.shape as string || 'circle'}
          size={props.size as number || 100}
          fill={props.fill as string || '#4a67ff'}
          stroke={props.stroke as string || 'none'}
        />
      );
    case 'icon': {
      // Check if this is a special decorator type (pageNumber, progressBar, custom)
      const decoratorType = props.decoratorType as string;

      if (decoratorType === 'pageNumber') {
        return <PageNumberDecorator block={block} x={props.x as number || x} y={props.y as number || y} />;
      }

      if (decoratorType === 'progressBar') {
        return <ProgressBarDecorator block={block} x={props.x as number || x} y={props.y as number || y} />;
      }

      if (decoratorType === 'custom' && props.component) {
        // Render custom React component
        return (
          <div className="absolute" style={{ left: props.x as number || x, top: props.y as number || y }}>
            {props.component as React.ReactNode}
          </div>
        );
      }

      // Default icon rendering
      return (
        <IconDecorative
          x={x}
          y={y}
          name={props.name as string || 'star'}
          size={props.size as number || 64}
          color={props.color as string || '#4a67ff'}
        />
      );
    }
    default:
      return null;
  }
}

// Arrow decorative component
function ArrowDecorative({ x, y, direction, size, color }: {
  x: number;
  y: number;
  direction: string;
  size: number;
  color: string;
}) {
  const rotationMap: Record<string, number> = {
    right: 0,
    down: 90,
    left: 180,
    up: 270,
  };
  const rotation = rotationMap[direction] || 0;

  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        transformOrigin: 'center',
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M5 12h14m0 0l-7-7m7 7l-7 7"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// Divider decorative component
function DividerDecorative({ x, y, width, thickness, color, style }: {
  x: number;
  y: number;
  width: number;
  thickness: number;
  color: string;
  style: string;
}) {
  const borderStyle = style === 'dashed' ? 'dashed' : style === 'dotted' ? 'dotted' : 'solid';

  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
        width,
        height: thickness,
        backgroundColor: borderStyle === 'solid' ? color : 'transparent',
        borderTop: borderStyle !== 'solid' ? `${thickness}px ${borderStyle} ${color}` : 'none',
      }}
    />
  );
}

// Accent decorative component
function AccentDecorative({ x, y, width, height, type, color }: {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  color: string;
}) {
  if (type === 'circle') {
    const size = Math.max(width, height);
    return (
      <div
        className="absolute rounded-full"
        style={{
          left: x,
          top: y,
          width: size,
          height: size,
          backgroundColor: color,
        }}
      />
    );
  }

  if (type === 'underline') {
    return (
      <div
        className="absolute"
        style={{
          left: x,
          top: y,
          width,
          height,
          backgroundColor: color,
          borderRadius: height / 2,
        }}
      />
    );
  }

  // Default: bar
  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
        width,
        height,
        backgroundColor: color,
      }}
    />
  );
}

// Shape decorative component
function ShapeDecorative({ x, y, shape, size, fill, stroke }: {
  x: number;
  y: number;
  shape: string;
  size: number;
  fill: string;
  stroke: string;
}) {
  return (
    <div className="absolute" style={{ left: x, top: y, width: size, height: size }}>
      {shape === 'circle' && (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill={fill} stroke={stroke} strokeWidth={stroke !== 'none' ? 2 : 0} />
        </svg>
      )}
      {shape === 'square' && (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <rect x="5" y="5" width="90" height="90" fill={fill} stroke={stroke} strokeWidth={stroke !== 'none' ? 2 : 0} />
        </svg>
      )}
      {shape === 'triangle' && (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <polygon points="50,10 90,90 10,90" fill={fill} stroke={stroke} strokeWidth={stroke !== 'none' ? 2 : 0} />
        </svg>
      )}
    </div>
  );
}

// Icon decorative component
function IconDecorative({ x, y, name, size, color }: {
  x: number;
  y: number;
  name: string;
  size: number;
  color: string;
}) {
  const iconMap: Record<string, React.ReactNode> = {
    star: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    ),
    heart: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    ),
    check: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    ),
  };

  const icon = iconMap[name] || iconMap.star;

  return (
    <div className="absolute" style={{ left: x, top: y, width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
        {icon}
      </svg>
    </div>
  );
}
