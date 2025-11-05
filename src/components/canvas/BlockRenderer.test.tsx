import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ImageBlockRenderer, BackgroundBlockRenderer, DecorativeBlockRenderer } from './BlockRenderer';
import type { ImageBlock, BackgroundBlock, DecorativeBlock } from '@/types/domain';

describe('BlockRenderer', () => {
    it('renders placeholder when image.src is missing', () => {
        const block: ImageBlock = { id: 'i1', kind: 'image', src: '', alt: '', fit: 'cover' };
        render(<ImageBlockRenderer block={block} x={0} y={0} width={200} height={100} />);
        expect(screen.getByText(/No image/i)).toBeInTheDocument();
    });

    it('renders solid background style', () => {
        const block: BackgroundBlock = { id: 'b1', kind: 'background', style: 'solid', color: '#ff0000', opacity: 0.5 };
        const { container } = render(<BackgroundBlockRenderer block={block} width={300} height={200} />);
        const el = container.firstChild as HTMLElement;
        expect(el).toBeTruthy();
        // style should include backgroundColor
        expect(el.style.backgroundColor).toBe('rgb(255, 0, 0)');
    });

    it('renders an arrow decorative', () => {
        const block: DecorativeBlock = { id: 'd1', kind: 'decorative', variant: 'arrow', props: { direction: 'down', size: 24, color: '#123456' } };
        const { container } = render(<DecorativeBlockRenderer block={block} x={10} y={20} />);
        const svg = container.querySelector('svg');
        expect(svg).toBeTruthy();
    });
});
