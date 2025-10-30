import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndContext } from '@dnd-kit/core';
import { SortableSlideCard } from './SortableSlideCard';

describe('SortableSlideCard', () => {
  const createMockSlide = (id: string, text: string = 'Test Slide') => ({
    id,
    blocks: [
      {
        id: `${id}-block-1`,
        kind: 'title' as const,
        text,
      },
    ],
  });

  const defaultProps = {
    slide: createMockSlide('slide-1'),
    index: 0,
    isSelected: false,
    onSelect: vi.fn(),
    onMoveUp: vi.fn(),
    onMoveDown: vi.fn(),
    totalSlides: 3,
  };

  const renderWithDndContext = (ui: React.ReactElement) => {
    return render(<DndContext>{ui}</DndContext>);
  };

  it('renders slide title from first block', () => {
    renderWithDndContext(<SortableSlideCard {...defaultProps} />);

    expect(screen.getByText('Test Slide')).toBeInTheDocument();
  });

  it('renders "Untitled slide" when no blocks', () => {
    const slideWithoutBlocks = {
      ...defaultProps,
      slide: { id: 'slide-1', blocks: [] },
    };

    renderWithDndContext(<SortableSlideCard {...slideWithoutBlocks} />);

    expect(screen.getByText('Untitled slide')).toBeInTheDocument();
  });

  it('renders "Untitled slide" when first block has no text', () => {
    const slideWithEmptyText = {
      ...defaultProps,
      slide: {
        id: 'slide-1',
        blocks: [{ id: 'b1', kind: 'title' as const, text: '' }],
      },
    };

    renderWithDndContext(<SortableSlideCard {...slideWithEmptyText} />);

    expect(screen.getByText('Untitled slide')).toBeInTheDocument();
  });

  it('displays slide number (index + 1)', () => {
    renderWithDndContext(<SortableSlideCard {...defaultProps} index={2} />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onSelect when card is clicked', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    renderWithDndContext(
      <SortableSlideCard {...defaultProps} onSelect={handleSelect} />
    );

    const card = screen.getByText('Test Slide').closest('div[class*="rounded-lg"]');
    if (card) await user.click(card);

    expect(handleSelect).toHaveBeenCalledOnce();
  });

  it('applies selected styles when isSelected is true', () => {
    const { container } = renderWithDndContext(
      <SortableSlideCard {...defaultProps} isSelected={true} />
    );

    const card = container.querySelector('[class*="bg-brand-50"]');
    expect(card).toBeInTheDocument();
  });

  it('applies unselected styles when isSelected is false', () => {
    const { container } = renderWithDndContext(
      <SortableSlideCard {...defaultProps} isSelected={false} />
    );

    const card = container.querySelector('[class*="bg-white"]');
    expect(card).toBeInTheDocument();
  });

  it('renders move up button', () => {
    renderWithDndContext(<SortableSlideCard {...defaultProps} />);

    expect(screen.getByTitle('Move up')).toBeInTheDocument();
  });

  it('renders move down button', () => {
    renderWithDndContext(<SortableSlideCard {...defaultProps} />);

    expect(screen.getByTitle('Move down')).toBeInTheDocument();
  });

  it('disables move up button when index is 0', () => {
    renderWithDndContext(<SortableSlideCard {...defaultProps} index={0} />);

    const moveUpButton = screen.getByTitle('Move up');
    expect(moveUpButton).toBeDisabled();
  });

  it('enables move up button when index is not 0', () => {
    renderWithDndContext(<SortableSlideCard {...defaultProps} index={1} />);

    const moveUpButton = screen.getByTitle('Move up');
    expect(moveUpButton).not.toBeDisabled();
  });

  it('disables move down button when at last position', () => {
    renderWithDndContext(
      <SortableSlideCard {...defaultProps} index={2} totalSlides={3} />
    );

    const moveDownButton = screen.getByTitle('Move down');
    expect(moveDownButton).toBeDisabled();
  });

  it('enables move down button when not at last position', () => {
    renderWithDndContext(
      <SortableSlideCard {...defaultProps} index={0} totalSlides={3} />
    );

    const moveDownButton = screen.getByTitle('Move down');
    expect(moveDownButton).not.toBeDisabled();
  });

  it('calls onMoveUp and prevents propagation when move up clicked', async () => {
    const user = userEvent.setup();
    const handleMoveUp = vi.fn();
    const handleSelect = vi.fn();

    renderWithDndContext(
      <SortableSlideCard
        {...defaultProps}
        index={1}
        onMoveUp={handleMoveUp}
        onSelect={handleSelect}
      />
    );

    const moveUpButton = screen.getByTitle('Move up');
    await user.click(moveUpButton);

    expect(handleMoveUp).toHaveBeenCalledOnce();
    expect(handleSelect).not.toHaveBeenCalled(); // Should not trigger onSelect
  });

  it('calls onMoveDown and prevents propagation when move down clicked', async () => {
    const user = userEvent.setup();
    const handleMoveDown = vi.fn();
    const handleSelect = vi.fn();

    renderWithDndContext(
      <SortableSlideCard
        {...defaultProps}
        index={0}
        onMoveDown={handleMoveDown}
        onSelect={handleSelect}
      />
    );

    const moveDownButton = screen.getByTitle('Move down');
    await user.click(moveDownButton);

    expect(handleMoveDown).toHaveBeenCalledOnce();
    expect(handleSelect).not.toHaveBeenCalled(); // Should not trigger onSelect
  });

  it('renders drag handle', () => {
    renderWithDndContext(<SortableSlideCard {...defaultProps} />);

    expect(screen.getByTitle('Drag to reorder')).toBeInTheDocument();
  });

  it('prevents propagation when drag handle is clicked', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    renderWithDndContext(
      <SortableSlideCard {...defaultProps} onSelect={handleSelect} />
    );

    const dragHandle = screen.getByTitle('Drag to reorder');
    await user.click(dragHandle);

    expect(handleSelect).not.toHaveBeenCalled();
  });

  it('handles slides with bullet blocks', () => {
    const slideWithBullets = {
      ...defaultProps,
      slide: {
        id: 'slide-bullets',
        blocks: [
          {
            id: 'b1',
            kind: 'bullets' as const,
            bullets: ['Point 1', 'Point 2'],
          },
        ],
      },
    };

    renderWithDndContext(<SortableSlideCard {...slideWithBullets} />);

    // Should show "Untitled slide" since bullets don't have text property
    expect(screen.getByText('Untitled slide')).toBeInTheDocument();
  });

  it('truncates long slide titles with line-clamp', () => {
    const slideWithLongTitle = {
      ...defaultProps,
      slide: createMockSlide('slide-long', 'This is a very long slide title that should be truncated'),
    };

    const { container } = renderWithDndContext(
      <SortableSlideCard {...slideWithLongTitle} />
    );

    const titleElement = container.querySelector('.line-clamp-2');
    expect(titleElement).toBeInTheDocument();
  });

  it('shows different styling for selected vs unselected state for controls', () => {
    const { rerender } = renderWithDndContext(
      <SortableSlideCard {...defaultProps} isSelected={false} />
    );

    let dragHandle = screen.getByTitle('Drag to reorder');
    expect(dragHandle).toHaveClass('text-neutral-600');

    rerender(
      <DndContext>
        <SortableSlideCard {...defaultProps} isSelected={true} />
      </DndContext>
    );

    dragHandle = screen.getByTitle('Drag to reorder');
    expect(dragHandle).toHaveClass('text-brand-700');
  });

  it('renders with whitespace-only title as untitled', () => {
    const slideWithWhitespace = {
      ...defaultProps,
      slide: createMockSlide('slide-ws', '   '),
    };

    renderWithDndContext(<SortableSlideCard {...slideWithWhitespace} />);

    const titleElement = screen.getByText('Untitled slide');
    expect(titleElement).toHaveClass('italic', 'text-neutral-400');
  });
});
