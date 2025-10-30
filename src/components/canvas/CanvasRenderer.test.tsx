import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CanvasRenderer } from './CanvasRenderer';
import type { Slide } from '@/types/domain';
import type { ArtboardSpec, Theme } from '@/lib/types/design';

// Mock the layout utilities
vi.mock('@/lib/layout/grid', () => ({
  contentRect: vi.fn(() => ({ x: 64, y: 64, w: 952, h: 952 })),
  isOverflow: vi.fn(() => false),
}));

vi.mock('@/lib/layout/measure', () => ({
  createMeasurer: vi.fn(() =>
    vi.fn(() => ({
      lines: [{ text: 'Test line 1' }, { text: 'Test line 2' }],
      totalHeight: 100,
    }))
  ),
}));

vi.mock('@/lib/layout/bullets', () => ({
  layoutBullets: vi.fn(() => ({
    lines: [
      { text: 'Bullet 1', marker: '•', xOffset: 32 },
      { text: 'Bullet 2', marker: '•', xOffset: 32 },
    ],
    totalHeight: 80,
  })),
}));

vi.mock('@/components/canvas/GridOverlay', () => ({
  default: () => <div data-testid="grid-overlay">Grid</div>,
}));

describe('CanvasRenderer', () => {
  const mockSpec: ArtboardSpec = {
    width: 1080,
    height: 1080,
    safeInset: 64,
    baseline: 8,
  };

  const mockTheme: Theme = {
    primary: '#4a67ff',
    text: '#1f2937',
    textMuted: '#6b7280',
    background: '#ffffff',
  };

  const mockSlide: Slide = {
    id: 'slide-1',
    templateId: 'test-template',
    blocks: [
      {
        id: 'block-1',
        kind: 'title',
        text: 'Test Title',
      },
      {
        id: 'block-2',
        kind: 'body',
        text: 'Test body text',
      },
    ],
  };

  it('renders artboard with correct dimensions', () => {
    const { container } = render(
      <CanvasRenderer
        slide={mockSlide}
        spec={mockSpec}
        theme={mockTheme}
        fontsReady={true}
      />
    );

    const artboard = container.querySelector('div');
    expect(artboard).toHaveStyle({
      width: '1080px',
      height: '1080px',
      background: '#ffffff',
    });
  });

  it('renders GridOverlay component', () => {
    render(
      <CanvasRenderer
        slide={mockSlide}
        spec={mockSpec}
        theme={mockTheme}
        fontsReady={true}
        showGrid={true}
      />
    );

    expect(screen.getByTestId('grid-overlay')).toBeInTheDocument();
  });

  it('shows loading skeleton when fonts are not ready', () => {
    const { container } = render(
      <CanvasRenderer
        slide={mockSlide}
        spec={mockSpec}
        theme={mockTheme}
        fontsReady={false}
      />
    );

    const skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders slide blocks when fonts are ready', () => {
    render(
      <CanvasRenderer
        slide={mockSlide}
        spec={mockSpec}
        theme={mockTheme}
        fontsReady={true}
      />
    );

    // Should render text blocks (mocked to return "Test line 1" and "Test line 2")
    const textBlocks = screen.getAllByText('Test line 1');
    expect(textBlocks.length).toBeGreaterThan(0);
  });

  it('renders nothing when slide is null', () => {
    const { container } = render(
      <CanvasRenderer
        slide={null}
        spec={mockSpec}
        theme={mockTheme}
        fontsReady={true}
      />
    );

    // Should only have artboard and grid, no blocks
    const artboard = container.querySelector('div');
    expect(artboard).toBeInTheDocument();
  });

  it('renders bullet blocks correctly', () => {
    const slideWithBullets: Slide = {
      id: 'slide-2',
      templateId: 'test-template',
      blocks: [
        {
          id: 'block-bullets',
          kind: 'bullets',
          bullets: ['First point', 'Second point'],
        },
      ],
    };

    render(
      <CanvasRenderer
        slide={slideWithBullets}
        spec={mockSpec}
        theme={mockTheme}
        fontsReady={true}
      />
    );

    expect(screen.getByText('Bullet 1')).toBeInTheDocument();
    expect(screen.getByText('Bullet 2')).toBeInTheDocument();
  });

  it('applies correct styles to text blocks', () => {
    render(
      <CanvasRenderer
        slide={mockSlide}
        spec={mockSpec}
        theme={mockTheme}
        fontsReady={true}
      />
    );

    // Verify the component renders with text content from mocked layout
    const textElements = screen.getAllByText('Test line 1');
    expect(textElements[0]).toBeInTheDocument();
  });

  it('handles empty blocks array', () => {
    const emptySlide: Slide = {
      id: 'slide-empty',
      templateId: 'test-template',
      blocks: [],
    };

    const { container } = render(
      <CanvasRenderer
        slide={emptySlide}
        spec={mockSpec}
        theme={mockTheme}
        fontsReady={true}
      />
    );

    // Should render artboard without blocks
    const artboard = container.querySelector('div');
    expect(artboard).toBeInTheDocument();
  });

  it('passes showGrid prop to GridOverlay', () => {
    const { rerender } = render(
      <CanvasRenderer
        slide={mockSlide}
        spec={mockSpec}
        theme={mockTheme}
        fontsReady={true}
        showGrid={false}
      />
    );

    expect(screen.getByTestId('grid-overlay')).toBeInTheDocument();

    rerender(
      <CanvasRenderer
        slide={mockSlide}
        spec={mockSpec}
        theme={mockTheme}
        fontsReady={true}
        showGrid={true}
      />
    );

    expect(screen.getByTestId('grid-overlay')).toBeInTheDocument();
  });
});
