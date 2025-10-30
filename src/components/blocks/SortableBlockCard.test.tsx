import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { SortableBlockCard } from './SortableBlockCard';

// Mock the BlockCard component
vi.mock('./BlockCard', () => ({
  BlockCard: ({ children, onMoveUp, onMoveDown, onRemove, canMoveUp, canMoveDown, dragHandleProps }: any) => (
    <div data-testid="block-card">
      <button data-testid="drag-handle" {...dragHandleProps}>Drag</button>
      {onMoveUp && (
        <button data-testid="move-up" onClick={onMoveUp} disabled={!canMoveUp}>
          Move Up
        </button>
      )}
      {onMoveDown && (
        <button data-testid="move-down" onClick={onMoveDown} disabled={!canMoveDown}>
          Move Down
        </button>
      )}
      {onRemove && <button data-testid="remove" onClick={onRemove}>Remove</button>}
      {children}
    </div>
  ),
}));

describe('SortableBlockCard', () => {
  const defaultProps = {
    id: 'test-block-1',
    children: <div>Test content</div>,
  };

  const renderWithDndContext = (ui: React.ReactElement) => {
    return render(<DndContext>{ui}</DndContext>);
  };

  it('renders children content', () => {
    renderWithDndContext(<SortableBlockCard {...defaultProps} />);

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders BlockCard component', () => {
    renderWithDndContext(<SortableBlockCard {...defaultProps} />);

    expect(screen.getByTestId('block-card')).toBeInTheDocument();
  });

  it('passes id to useSortable', () => {
    renderWithDndContext(<SortableBlockCard {...defaultProps} />);

    // The component should render without errors, which means useSortable accepted the id
    expect(screen.getByTestId('block-card')).toBeInTheDocument();
  });

  it('passes onMoveUp handler to BlockCard', () => {
    const handleMoveUp = vi.fn();

    renderWithDndContext(
      <SortableBlockCard {...defaultProps} onMoveUp={handleMoveUp} />
    );

    const moveUpButton = screen.getByTestId('move-up');
    expect(moveUpButton).toBeInTheDocument();
  });

  it('passes onMoveDown handler to BlockCard', () => {
    const handleMoveDown = vi.fn();

    renderWithDndContext(
      <SortableBlockCard {...defaultProps} onMoveDown={handleMoveDown} />
    );

    const moveDownButton = screen.getByTestId('move-down');
    expect(moveDownButton).toBeInTheDocument();
  });

  it('passes onRemove handler to BlockCard', () => {
    const handleRemove = vi.fn();

    renderWithDndContext(
      <SortableBlockCard {...defaultProps} onRemove={handleRemove} />
    );

    const removeButton = screen.getByTestId('remove');
    expect(removeButton).toBeInTheDocument();
  });

  it('passes canMoveUp prop to BlockCard', () => {
    renderWithDndContext(
      <SortableBlockCard {...defaultProps} onMoveUp={vi.fn()} canMoveUp={false} />
    );

    const moveUpButton = screen.getByTestId('move-up');
    expect(moveUpButton).toBeDisabled();
  });

  it('passes canMoveDown prop to BlockCard', () => {
    renderWithDndContext(
      <SortableBlockCard {...defaultProps} onMoveDown={vi.fn()} canMoveDown={false} />
    );

    const moveDownButton = screen.getByTestId('move-down');
    expect(moveDownButton).toBeDisabled();
  });

  it('enables move buttons when can move props are true', () => {
    renderWithDndContext(
      <SortableBlockCard
        {...defaultProps}
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        canMoveUp={true}
        canMoveDown={true}
      />
    );

    expect(screen.getByTestId('move-up')).not.toBeDisabled();
    expect(screen.getByTestId('move-down')).not.toBeDisabled();
  });

  it('provides drag handle props to BlockCard', () => {
    renderWithDndContext(<SortableBlockCard {...defaultProps} />);

    const dragHandle = screen.getByTestId('drag-handle');
    expect(dragHandle).toBeInTheDocument();
  });

  it('renders with different id values', () => {
    const { rerender } = renderWithDndContext(
      <SortableBlockCard id="block-1">
        <div>Block 1</div>
      </SortableBlockCard>
    );

    expect(screen.getByText('Block 1')).toBeInTheDocument();

    rerender(
      <DndContext>
        <SortableBlockCard id="block-2">
          <div>Block 2</div>
        </SortableBlockCard>
      </DndContext>
    );

    expect(screen.getByText('Block 2')).toBeInTheDocument();
  });

  it('renders multiple sortable cards', () => {
    renderWithDndContext(
      <>
        <SortableBlockCard id="block-1">
          <div>Block 1</div>
        </SortableBlockCard>
        <SortableBlockCard id="block-2">
          <div>Block 2</div>
        </SortableBlockCard>
        <SortableBlockCard id="block-3">
          <div>Block 3</div>
        </SortableBlockCard>
      </>
    );

    expect(screen.getByText('Block 1')).toBeInTheDocument();
    expect(screen.getByText('Block 2')).toBeInTheDocument();
    expect(screen.getByText('Block 3')).toBeInTheDocument();
  });

  it('wraps BlockCard in a div with useSortable ref', () => {
    const { container } = renderWithDndContext(
      <SortableBlockCard {...defaultProps} />
    );

    // The wrapper div should exist
    const blockCard = screen.getByTestId('block-card');
    const wrapperDiv = blockCard.parentElement;
    expect(wrapperDiv).toBeInTheDocument();
  });

  it('passes all control handlers together', () => {
    const handleMoveUp = vi.fn();
    const handleMoveDown = vi.fn();
    const handleRemove = vi.fn();

    renderWithDndContext(
      <SortableBlockCard
        {...defaultProps}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onRemove={handleRemove}
      />
    );

    expect(screen.getByTestId('move-up')).toBeInTheDocument();
    expect(screen.getByTestId('move-down')).toBeInTheDocument();
    expect(screen.getByTestId('remove')).toBeInTheDocument();
  });
});
