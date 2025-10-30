import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconButton } from './IconButton';
import { Plus, Trash2, Edit } from 'lucide-react';

describe('IconButton', () => {
  it('renders icon', () => {
    const { container } = render(<IconButton icon={Plus} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<IconButton icon={Plus} onClick={handleClick} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('applies default ghost variant', () => {
    render(<IconButton icon={Plus} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-neutral-700', 'hover:bg-neutral-100');
  });

  it('applies default variant styles', () => {
    render(<IconButton icon={Plus} variant="default" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-brand-500', 'text-white');
  });

  it('applies outline variant styles', () => {
    render(<IconButton icon={Plus} variant="outline" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('border', 'border-neutral-300', 'bg-white');
  });

  it('applies ghost variant styles', () => {
    render(<IconButton icon={Plus} variant="ghost" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-neutral-700', 'hover:bg-neutral-100');
  });

  it('applies destructive variant styles', () => {
    render(<IconButton icon={Trash2} variant="destructive" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('border', 'border-error', 'text-error');
  });

  it('supports different sizes', () => {
    const { rerender } = render(<IconButton icon={Plus} size="xs" />);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('h-6', 'w-6', 'text-xs');

    rerender(<IconButton icon={Plus} size="sm" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('h-8', 'w-8', 'text-sm');

    rerender(<IconButton icon={Plus} size="md" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('h-10', 'w-10');

    rerender(<IconButton icon={Plus} size="lg" />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('h-12', 'w-12');
  });

  it('renders with default sm size', () => {
    render(<IconButton icon={Plus} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-8', 'w-8');
  });

  it('is disabled when disabled prop is true', () => {
    render(<IconButton icon={Plus} disabled />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('applies disabled styles', () => {
    render(<IconButton icon={Plus} disabled />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
  });

  it('does not trigger onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<IconButton icon={Plus} onClick={handleClick} disabled />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<IconButton icon={Plus} className="custom-class" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();

    render(<IconButton icon={Plus} ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it('has proper focus styles', () => {
    render(<IconButton icon={Plus} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-brand-500'
    );
  });

  it('renders icon with correct size class', () => {
    const { container } = render(<IconButton icon={Plus} />);

    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-4', 'w-4');
  });

  it('supports title attribute for tooltip', () => {
    render(<IconButton icon={Plus} title="Add item" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Add item');
  });

  it('supports aria-label for accessibility', () => {
    render(<IconButton icon={Plus} aria-label="Add new item" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Add new item');
  });

  it('supports type attribute', () => {
    render(<IconButton icon={Plus} type="submit" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('renders different icons', () => {
    const { container, rerender } = render(<IconButton icon={Plus} />);

    let svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();

    rerender(<IconButton icon={Trash2} />);
    svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();

    rerender(<IconButton icon={Edit} />);
    svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('combines variant and size correctly', () => {
    render(<IconButton icon={Plus} variant="destructive" size="lg" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('border-error', 'h-12', 'w-12');
  });

  it('is a square button', () => {
    render(<IconButton icon={Plus} size="md" />);

    const button = screen.getByRole('button');
    // Both width and height should be the same
    expect(button).toHaveClass('h-10', 'w-10');
  });

  it('has rounded corners', () => {
    render(<IconButton icon={Plus} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('rounded-md');
  });

  it('centers the icon', () => {
    render(<IconButton icon={Plus} />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
  });

  it('supports onClick with custom logic', async () => {
    const user = userEvent.setup();
    let clickCount = 0;
    const handleClick = () => {
      clickCount++;
    };

    render(<IconButton icon={Plus} onClick={handleClick} />);

    const button = screen.getByRole('button');
    await user.click(button);
    await user.click(button);

    expect(clickCount).toBe(2);
  });

  it('can be used in a form', () => {
    const handleSubmit = vi.fn((e) => e.preventDefault());

    render(
      <form onSubmit={handleSubmit}>
        <IconButton icon={Plus} type="submit" />
      </form>
    );

    const button = screen.getByRole('button');
    button.click();

    expect(handleSubmit).toHaveBeenCalled();
  });
});
