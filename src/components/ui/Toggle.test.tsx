import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from './Toggle';

describe('Toggle', () => {
  it('renders without label', () => {
    render(<Toggle checked={false} />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  it('renders with label', () => {
    render(<Toggle label="Enable feature" checked={false} />);

    expect(screen.getByText('Enable feature')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('reflects checked state visually', () => {
    const { rerender } = render(<Toggle checked={false} />);

    let toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    rerender(<Toggle checked={true} />);

    toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onCheckedChange when clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Toggle checked={false} onCheckedChange={handleChange} />);

    const toggle = screen.getByRole('switch');
    await user.click(toggle);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('toggles from checked to unchecked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Toggle checked={true} onCheckedChange={handleChange} />);

    const toggle = screen.getByRole('switch');
    await user.click(toggle);

    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('does not call onCheckedChange when disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Toggle checked={false} onCheckedChange={handleChange} disabled />);

    const toggle = screen.getByRole('switch');
    await user.click(toggle);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('applies custom colors', () => {
    const { container } = render(
      <Toggle
        checked={true}
        checkedColor="#ff0000"
        uncheckedColor="#00ff00"
      />
    );

    const toggle = container.querySelector('button[role="switch"]');
    expect(toggle).toHaveStyle({ backgroundColor: '#ff0000' });
  });

  it('applies unchecked color when not checked', () => {
    const { container } = render(
      <Toggle
        checked={false}
        checkedColor="#ff0000"
        uncheckedColor="#00ff00"
      />
    );

    const toggle = container.querySelector('button[role="switch"]');
    expect(toggle).toHaveStyle({ backgroundColor: '#00ff00' });
  });

  it('supports different sizes', () => {
    const { rerender, container } = render(<Toggle size="sm" checked={false} />);

    let toggle = container.querySelector('button[role="switch"]');
    expect(toggle).toHaveClass('h-5', 'w-9');

    rerender(<Toggle size="md" checked={false} />);
    toggle = container.querySelector('button[role="switch"]');
    expect(toggle).toHaveClass('h-6', 'w-12');

    rerender(<Toggle size="lg" checked={false} />);
    toggle = container.querySelector('button[role="switch"]');
    expect(toggle).toHaveClass('h-7', 'w-14');
  });

  it('has proper accessibility attributes', () => {
    render(<Toggle label="Dark mode" checked={true} />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(toggle).toHaveAttribute('aria-label', 'Dark mode');
    expect(toggle).toHaveAttribute('type', 'button');
  });

  it('shows disabled state', () => {
    render(<Toggle checked={false} disabled />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toBeDisabled();
    expect(toggle).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('applies custom className', () => {
    render(<Toggle checked={false} className="custom-class" />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();

    render(<Toggle checked={false} ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it('animates thumb position based on checked state', () => {
    const { container } = render(<Toggle checked={true} size="md" />);

    const thumb = container.querySelector('[aria-hidden="true"]');
    expect(thumb).toHaveStyle({ transform: 'translateX(1.5rem)' });
  });

  it('wraps toggle in label when label prop is provided', () => {
    const { container } = render(<Toggle label="Test label" checked={false} />);

    const label = container.querySelector('label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('flex', 'select-none', 'items-center');
  });

  it('does not wrap in label when no label prop', () => {
    const { container } = render(<Toggle checked={false} />);

    const label = container.querySelector('label');
    expect(label).not.toBeInTheDocument();
  });
});
