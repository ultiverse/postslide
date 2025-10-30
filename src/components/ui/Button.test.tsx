import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';
import { Plus } from 'lucide-react';

describe('Button', () => {
  it('renders children content', () => {
    render(<Button>Click me</Button>);

    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByText('Click me'));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('applies default variant styles', () => {
    render(<Button>Default</Button>);

    const button = screen.getByText('Default');
    expect(button).toHaveClass('bg-gradient-to-r', 'from-brand-500', 'to-brand-600');
  });

  it('applies outline variant styles', () => {
    render(<Button variant="outline">Outline</Button>);

    const button = screen.getByText('Outline');
    expect(button).toHaveClass('border', 'border-neutral-300', 'bg-white');
  });

  it('applies ghost variant styles', () => {
    render(<Button variant="ghost">Ghost</Button>);

    const button = screen.getByText('Ghost');
    expect(button).toHaveClass('text-neutral-700', 'hover:bg-neutral-100');
  });

  it('applies destructive variant styles', () => {
    render(<Button variant="destructive">Delete</Button>);

    const button = screen.getByText('Delete');
    expect(button).toHaveClass('bg-error', 'text-white');
  });

  it('applies accent variant styles', () => {
    render(<Button variant="accent">Accent</Button>);

    const button = screen.getByText('Accent');
    expect(button).toHaveClass('from-accent-500', 'to-accent-600');
  });

  it('applies link variant styles', () => {
    render(<Button variant="link">Link</Button>);

    const button = screen.getByText('Link');
    expect(button).toHaveClass('text-brand-600', 'underline-offset-4');
  });

  it('supports different sizes', () => {
    const { rerender } = render(<Button size="xs">Extra Small</Button>);
    let button = screen.getByText('Extra Small');
    expect(button).toHaveClass('h-7', 'px-2.5', 'text-xs');

    rerender(<Button size="sm">Small</Button>);
    button = screen.getByText('Small');
    expect(button).toHaveClass('h-8', 'px-3', 'text-sm');

    rerender(<Button size="md">Medium</Button>);
    button = screen.getByText('Medium');
    expect(button).toHaveClass('h-10', 'px-4', 'text-sm');

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByText('Large');
    expect(button).toHaveClass('h-11', 'px-6', 'text-base');
  });

  it('renders with icon on the left by default', () => {
    const { container } = render(
      <Button icon={Plus}>With Icon</Button>
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Icon should come before the text
    const button = screen.getByText('With Icon');
    const iconParent = svg?.parentElement;
    expect(iconParent).toBe(button);
  });

  it('renders with icon on the right when specified', () => {
    const { container } = render(
      <Button icon={Plus} iconPosition="right">
        With Icon
      </Button>
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('applies correct icon size based on button size', () => {
    const { container, rerender } = render(
      <Button icon={Plus} size="xs">XS</Button>
    );

    let svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-3', 'w-3');

    rerender(<Button icon={Plus} size="sm">SM</Button>);
    svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-4', 'w-4');

    rerender(<Button icon={Plus} size="md">MD</Button>);
    svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-4', 'w-4');

    rerender(<Button icon={Plus} size="lg">LG</Button>);
    svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-5', 'w-5');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
  });

  it('does not trigger onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>
    );

    await user.click(screen.getByText('Disabled'));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);

    const button = screen.getByText('Custom');
    expect(button).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();

    render(<Button ref={ref}>Ref Test</Button>);

    expect(ref).toHaveBeenCalled();
  });

  it('supports asChild prop with Slot', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    const link = screen.getByText('Link Button');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('has proper focus styles', () => {
    render(<Button>Focus me</Button>);

    const button = screen.getByText('Focus me');
    expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-brand-500');
  });

  it('renders button type by default', () => {
    render(<Button>Button</Button>);

    const button = screen.getByText('Button');
    expect(button.tagName).toBe('BUTTON');
  });

  it('supports custom type attribute', () => {
    render(<Button type="submit">Submit</Button>);

    const button = screen.getByText('Submit');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('combines variant and size correctly', () => {
    render(
      <Button variant="destructive" size="lg">
        Large Delete
      </Button>
    );

    const button = screen.getByText('Large Delete');
    expect(button).toHaveClass('bg-error', 'h-11', 'px-6');
  });

  it('renders with both icon and text', () => {
    const { container } = render(
      <Button icon={Plus}>Add Item</Button>
    );

    expect(screen.getByText('Add Item')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('can render icon-only button', () => {
    const { container } = render(
      <Button icon={Plus} aria-label="Add" />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
