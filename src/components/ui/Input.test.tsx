import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />);

    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with default type text', () => {
    render(<Input data-testid="test-input" />);

    const input = screen.getByTestId('test-input') as HTMLInputElement;
    // When type is not specified, HTML defaults to 'text' but the attribute may not be present
    expect(input.type).toBe('text');
  });

  it('supports different input types', () => {
    const { rerender } = render(<Input type="email" data-testid="test-input" />);
    let input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('type', 'email');

    rerender(<Input type="password" data-testid="test-input" />);
    input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('type', 'password');

    rerender(<Input type="number" data-testid="test-input" />);
    input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('type', 'number');

    rerender(<Input type="tel" data-testid="test-input" />);
    input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('type', 'tel');
  });

  it('handles user input', async () => {
    const user = userEvent.setup();
    render(<Input data-testid="test-input" />);

    const input = screen.getByTestId('test-input') as HTMLInputElement;
    await user.type(input, 'Hello World');

    expect(input.value).toBe('Hello World');
  });

  it('calls onChange handler', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Input onChange={handleChange} data-testid="test-input" />);

    const input = screen.getByTestId('test-input');
    await user.type(input, 'Test');

    expect(handleChange).toHaveBeenCalled();
  });

  it('supports controlled input with value prop', () => {
    const { rerender } = render(<Input value="Initial" onChange={vi.fn()} data-testid="test-input" />);

    let input = screen.getByTestId('test-input') as HTMLInputElement;
    expect(input.value).toBe('Initial');

    rerender(<Input value="Updated" onChange={vi.fn()} data-testid="test-input" />);
    input = screen.getByTestId('test-input') as HTMLInputElement;
    expect(input.value).toBe('Updated');
  });

  it('shows placeholder text', () => {
    render(<Input placeholder="Enter your name" />);

    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(<Input disabled data-testid="test-input" />);

    const input = screen.getByTestId('test-input');
    expect(input).toBeDisabled();
  });

  it('applies disabled styles when disabled', () => {
    render(<Input disabled data-testid="test-input" />);

    const input = screen.getByTestId('test-input');
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('applies custom className', () => {
    render(<Input className="custom-input" data-testid="test-input" />);

    const input = screen.getByTestId('test-input');
    expect(input).toHaveClass('custom-input');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();

    render(<Input ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it('has default input styles', () => {
    render(<Input data-testid="test-input" />);

    const input = screen.getByTestId('test-input');
    expect(input).toHaveClass(
      'flex',
      'h-9',
      'w-full',
      'rounded-md',
      'border',
      'border-input',
      'bg-transparent',
      'px-3',
      'py-1'
    );
  });

  it('has focus styles', () => {
    render(<Input data-testid="test-input" />);

    const input = screen.getByTestId('test-input');
    expect(input).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-1', 'focus-visible:ring-ring');
  });

  it('supports required attribute', () => {
    render(<Input required data-testid="test-input" />);

    const input = screen.getByTestId('test-input');
    expect(input).toBeRequired();
  });

  it('supports readonly attribute', () => {
    render(<Input readOnly data-testid="test-input" />);

    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('readonly');
  });

  it('supports maxLength attribute', () => {
    render(<Input maxLength={10} data-testid="test-input" />);

    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('maxLength', '10');
  });

  it('supports name attribute for forms', () => {
    render(<Input name="username" data-testid="test-input" />);

    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('name', 'username');
  });

  it('supports id attribute', () => {
    render(<Input id="email-input" />);

    const input = document.getElementById('email-input');
    expect(input).toBeInTheDocument();
  });

  it('supports aria-label for accessibility', () => {
    render(<Input aria-label="Search" data-testid="test-input" />);

    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('aria-label', 'Search');
  });

  it('supports aria-describedby for accessibility', () => {
    render(<Input aria-describedby="helper-text" data-testid="test-input" />);

    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('aria-describedby', 'helper-text');
  });

  it('handles file input type', () => {
    render(<Input type="file" data-testid="test-input" />);

    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('type', 'file');
  });

  it('applies file input styles', () => {
    render(<Input type="file" data-testid="test-input" />);

    const input = screen.getByTestId('test-input');
    expect(input).toHaveClass('file:border-0', 'file:bg-transparent', 'file:text-sm');
  });

  it('supports defaultValue for uncontrolled inputs', () => {
    render(<Input defaultValue="Default text" data-testid="test-input" />);

    const input = screen.getByTestId('test-input') as HTMLInputElement;
    expect(input.value).toBe('Default text');
  });

  it('can clear input value', async () => {
    const user = userEvent.setup();
    render(<Input data-testid="test-input" />);

    const input = screen.getByTestId('test-input') as HTMLInputElement;
    await user.type(input, 'Text to clear');
    expect(input.value).toBe('Text to clear');

    await user.clear(input);
    expect(input.value).toBe('');
  });

  it('supports autoComplete attribute', () => {
    render(<Input autoComplete="email" data-testid="test-input" />);

    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('autoComplete', 'email');
  });

  it('supports autoFocus attribute', () => {
    render(<Input autoFocus data-testid="test-input" />);

    const input = screen.getByTestId('test-input');
    // React's autoFocus prop becomes the autofocus HTML attribute (lowercase)
    expect(input).toHaveFocus();
  });
});
