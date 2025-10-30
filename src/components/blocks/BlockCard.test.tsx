import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlockCard } from './BlockCard';

describe('BlockCard', () => {
  it('renders children content', () => {
    render(
      <BlockCard>
        <div>Test content</div>
      </BlockCard>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders drag handle', () => {
    render(
      <BlockCard>
        <div>Content</div>
      </BlockCard>
    );

    const dragHandle = screen.getByLabelText('Drag block');
    expect(dragHandle).toBeInTheDocument();
    expect(dragHandle).toHaveAttribute('title', 'Drag to reorder');
  });

  it('calls onMoveUp when move up button is clicked', async () => {
    const user = userEvent.setup();
    const handleMoveUp = vi.fn();

    render(
      <BlockCard onMoveUp={handleMoveUp}>
        <div>Content</div>
      </BlockCard>
    );

    const moveUpButton = screen.getByTitle('Move up');
    await user.click(moveUpButton);

    expect(handleMoveUp).toHaveBeenCalledOnce();
  });

  it('calls onMoveDown when move down button is clicked', async () => {
    const user = userEvent.setup();
    const handleMoveDown = vi.fn();

    render(
      <BlockCard onMoveDown={handleMoveDown}>
        <div>Content</div>
      </BlockCard>
    );

    const moveDownButton = screen.getByTitle('Move down');
    await user.click(moveDownButton);

    expect(handleMoveDown).toHaveBeenCalledOnce();
  });

  it('calls onRemove when remove button is clicked', async () => {
    const user = userEvent.setup();
    const handleRemove = vi.fn();

    render(
      <BlockCard onRemove={handleRemove}>
        <div>Content</div>
      </BlockCard>
    );

    const removeButton = screen.getByTitle('Remove');
    await user.click(removeButton);

    expect(handleRemove).toHaveBeenCalledOnce();
  });

  it('disables move up button when canMoveUp is false', () => {
    render(
      <BlockCard onMoveUp={vi.fn()} canMoveUp={false}>
        <div>Content</div>
      </BlockCard>
    );

    const moveUpButton = screen.getByTitle('Move up');
    expect(moveUpButton).toBeDisabled();
  });

  it('disables move down button when canMoveDown is false', () => {
    render(
      <BlockCard onMoveDown={vi.fn()} canMoveDown={false}>
        <div>Content</div>
      </BlockCard>
    );

    const moveDownButton = screen.getByTitle('Move down');
    expect(moveDownButton).toBeDisabled();
  });

  it('enables move up button when canMoveUp is true', () => {
    render(
      <BlockCard onMoveUp={vi.fn()} canMoveUp={true}>
        <div>Content</div>
      </BlockCard>
    );

    const moveUpButton = screen.getByTitle('Move up');
    expect(moveUpButton).not.toBeDisabled();
  });

  it('enables move down button when canMoveDown is true', () => {
    render(
      <BlockCard onMoveDown={vi.fn()} canMoveDown={true}>
        <div>Content</div>
      </BlockCard>
    );

    const moveDownButton = screen.getByTitle('Move down');
    expect(moveDownButton).not.toBeDisabled();
  });

  it('does not render move up button when onMoveUp is not provided', () => {
    render(
      <BlockCard>
        <div>Content</div>
      </BlockCard>
    );

    expect(screen.queryByTitle('Move up')).not.toBeInTheDocument();
  });

  it('does not render move down button when onMoveDown is not provided', () => {
    render(
      <BlockCard>
        <div>Content</div>
      </BlockCard>
    );

    expect(screen.queryByTitle('Move down')).not.toBeInTheDocument();
  });

  it('does not render remove button when onRemove is not provided', () => {
    render(
      <BlockCard>
        <div>Content</div>
      </BlockCard>
    );

    expect(screen.queryByTitle('Remove')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <BlockCard className="custom-class">
        <div>Content</div>
      </BlockCard>
    );

    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();

    render(
      <BlockCard ref={ref}>
        <div>Content</div>
      </BlockCard>
    );

    expect(ref).toHaveBeenCalled();
  });

  it('applies dragHandleProps to drag handle button', () => {
    const dragHandleProps = {
      'data-testid': 'custom-drag-handle',
      onClick: vi.fn(),
    };

    render(
      <BlockCard dragHandleProps={dragHandleProps}>
        <div>Content</div>
      </BlockCard>
    );

    const dragHandle = screen.getByTestId('custom-drag-handle');
    expect(dragHandle).toBeInTheDocument();
  });

  it('renders all control buttons when all handlers are provided', () => {
    render(
      <BlockCard
        onMoveUp={vi.fn()}
        onMoveDown={vi.fn()}
        onRemove={vi.fn()}
      >
        <div>Content</div>
      </BlockCard>
    );

    expect(screen.getByTitle('Move up')).toBeInTheDocument();
    expect(screen.getByTitle('Move down')).toBeInTheDocument();
    expect(screen.getByTitle('Remove')).toBeInTheDocument();
  });

  it('has proper card styling', () => {
    const { container } = render(
      <BlockCard>
        <div>Content</div>
      </BlockCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-gradient-to-br', 'border', 'rounded-lg', 'shadow-sm');
  });

  it('has proper content section', () => {
    const { container } = render(
      <BlockCard>
        <div data-testid="inner-content">Test</div>
      </BlockCard>
    );

    const contentSection = screen.getByTestId('inner-content').parentElement;
    expect(contentSection).toHaveClass('p-3');
  });
});
