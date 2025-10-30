import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Canvas from './Canvas';
import type { Project } from '@/types/domain';

// Mock the project store
const mockUseProject = vi.fn();
vi.mock('@/state/project.store', () => ({
  useProject: (selector: any) => mockUseProject(selector),
}));

// Mock child components
vi.mock('./ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

vi.mock('./FontLoader', () => ({
  default: ({ children }: { children: (ready: boolean) => React.ReactNode }) => (
    <div data-testid="font-loader">{children(true)}</div>
  ),
}));

vi.mock('./CanvasRenderer', () => ({
  CanvasRenderer: ({ slide, spec, theme, fontsReady, showGrid }: any) => (
    <div data-testid="canvas-renderer">
      <div data-testid="slide-id">{slide?.id || 'no-slide'}</div>
      <div data-testid="spec-width">{spec.width}</div>
      <div data-testid="theme-primary">{theme.primary}</div>
      <div data-testid="fonts-ready">{String(fontsReady)}</div>
      <div data-testid="show-grid">{String(showGrid)}</div>
    </div>
  ),
}));

describe('Canvas', () => {
  const mockProject: Project = {
    id: 'test-project',
    title: 'Test Project',
    slides: [
      {
        id: 'slide-1',
        blocks: [
          { id: 'block-1', kind: 'title', text: 'Test Title' },
        ],
      },
      {
        id: 'slide-2',
        blocks: [
          { id: 'block-2', kind: 'body', text: 'Test Body' },
        ],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementation
    mockUseProject.mockImplementation((selector) => {
      const state = {
        project: mockProject,
        selectedSlideId: 'slide-1',
        showGrid: false,
      };
      return selector(state);
    });
  });

  it('renders all wrapper components', () => {
    render(<Canvas />);

    expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    expect(screen.getByTestId('font-loader')).toBeInTheDocument();
    expect(screen.getByTestId('canvas-renderer')).toBeInTheDocument();
  });

  it('passes correct spec to CanvasRenderer', () => {
    render(<Canvas />);

    expect(screen.getByTestId('spec-width')).toHaveTextContent('1080');
  });

  it('passes default theme when no brand is set', () => {
    render(<Canvas />);

    expect(screen.getByTestId('theme-primary')).toHaveTextContent('#4a67ff');
  });

  it('uses brand primary color when available', () => {
    mockUseProject.mockImplementation((selector) => {
      const state = {
        project: {
          ...mockProject,
          brand: {
            primary: '#ff0000',
          },
        },
        selectedSlideId: 'slide-1',
        showGrid: false,
      };
      return selector(state);
    });

    render(<Canvas />);

    expect(screen.getByTestId('theme-primary')).toHaveTextContent('#ff0000');
  });

  it('passes selected slide to CanvasRenderer', () => {
    render(<Canvas />);

    expect(screen.getByTestId('slide-id')).toHaveTextContent('slide-1');
  });

  it('passes null slide when no slide is selected', () => {
    mockUseProject.mockImplementation((selector) => {
      const state = {
        project: mockProject,
        selectedSlideId: null,
        showGrid: false,
      };
      return selector(state);
    });

    render(<Canvas />);

    expect(screen.getByTestId('slide-id')).toHaveTextContent('no-slide');
  });

  it('passes showGrid state to CanvasRenderer', () => {
    mockUseProject.mockImplementation((selector) => {
      const state = {
        project: mockProject,
        selectedSlideId: 'slide-1',
        showGrid: true,
      };
      return selector(state);
    });

    render(<Canvas />);

    expect(screen.getByTestId('show-grid')).toHaveTextContent('true');
  });

  it('passes fontsReady prop from FontLoader', () => {
    render(<Canvas />);

    expect(screen.getByTestId('fonts-ready')).toHaveTextContent('true');
  });

  it('renders with correct transform scale', () => {
    const { container } = render(<Canvas />);

    const scaledDiv = container.querySelector('[style*="scale(0.5)"]');
    expect(scaledDiv).toBeInTheDocument();
  });

  it('uses custom brand fonts when available', () => {
    mockUseProject.mockImplementation((selector) => {
      const state = {
        project: {
          ...mockProject,
          brand: {
            fontHead: 'CustomHeadFont',
            fontBody: 'CustomBodyFont',
          },
        },
        selectedSlideId: 'slide-1',
        showGrid: false,
      };
      return selector(state);
    });

    // This test verifies the component renders without error when custom fonts are set
    render(<Canvas />);
    expect(screen.getByTestId('canvas-renderer')).toBeInTheDocument();
  });

  it('handles slide not found gracefully', () => {
    mockUseProject.mockImplementation((selector) => {
      const state = {
        project: mockProject,
        selectedSlideId: 'non-existent-slide',
        showGrid: false,
      };
      return selector(state);
    });

    render(<Canvas />);

    expect(screen.getByTestId('slide-id')).toHaveTextContent('no-slide');
  });
});
