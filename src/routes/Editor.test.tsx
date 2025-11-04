import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Editor from './Editor';

// Mock project store used by Editor
const mockUseProject = vi.fn();
vi.mock('@/state/project.store', () => ({
    useProject: (selector: any) => mockUseProject(selector),
}));

// Mock Canvas to avoid rendering heavy internals
vi.mock('@/components/canvas', () => ({
    default: () => <div data-testid="mock-canvas">canvas</div>,
}));

// Mock SortableSlideCard and SortableBlockCard
vi.mock('@/components/slides/SortableSlideCard', () => ({
    SortableSlideCard: (props: any) => (
        <div data-testid={`slide-${props.slide?.id || 'unknown'}`} onClick={props.onSelect}>{props.slide?.title || props.slide?.id}</div>
    ),
}));

vi.mock('@/components/blocks/SortableBlockCard', () => ({
    SortableBlockCard: (props: any) => (
        <div data-testid={`block-${props.id || 'unknown'}`}>{props.children}</div>
    ),
}));

beforeEach(() => {
    vi.clearAllMocks();
    mockUseProject.mockImplementation((selector) => {
        const state = {
            project: {
                id: 'p1',
                title: 'P',
                slides: [{ id: 's1', templateId: 'minimal-pro', blocks: [{ id: 'b1', kind: 'title', text: 'Hi' }] }],
            },
            selectedSlideId: 's1',
            showGrid: false,
            addSlide: () => { },
            duplicateSlide: () => { },
            removeSlide: () => { },
            moveSlideUp: () => { },
            moveSlideDown: () => { },
            reorderSlides: () => { },
            addBlock: () => { },
            updateBlock: () => { },
            updateBullets: () => { },
            removeBlock: () => { },
            moveBlockUp: () => { },
            moveBlockDown: () => { },
            convertBlockKind: () => { },
            reorderBlocks: () => { },
            setSelectedSlide: () => { },
            updateProjectTitle: () => { },
        };
        return selector(state);
    });
});

describe('Editor (smoke)', () => {
    it('renders main panes and Canvas', () => {
        render(<Editor />);
        expect(screen.getByTestId('mock-canvas')).toBeInTheDocument();
        // Ensure Add Slide button exists
        expect(screen.getByRole('button', { name: /Add Slide/i })).toBeInTheDocument();
    });
});
