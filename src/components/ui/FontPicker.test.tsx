import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FontPicker } from './FontPicker';

describe('FontPicker', () => {
  it('renders with default value', () => {
    const onChange = vi.fn();
    render(<FontPicker value="" onChange={onChange} inheritedFont="Inter" />);

    expect(screen.getByText(/Inherit \(Inter\)/)).toBeInTheDocument();
  });

  it('renders with selected font', () => {
    const onChange = vi.fn();
    render(<FontPicker value="Roboto" onChange={onChange} inheritedFont="Inter" />);

    expect(screen.getByText('Roboto')).toBeInTheDocument();
  });

  it('opens dropdown when clicked', () => {
    const onChange = vi.fn();
    render(<FontPicker value="" onChange={onChange} inheritedFont="Inter" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Should show brand fonts section
    expect(screen.getByText('Brand Fonts')).toBeInTheDocument();
  });

  it('calls onChange when font is selected', () => {
    const onChange = vi.fn();
    render(<FontPicker value="" onChange={onChange} inheritedFont="Inter" />);

    // Open dropdown
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Click on a font
    const montserrat = screen.getByText('Montserrat');
    fireEvent.click(montserrat);

    expect(onChange).toHaveBeenCalledWith('Montserrat');
  });

  it('calls onChange with undefined when Inherit is selected', () => {
    const onChange = vi.fn();
    render(<FontPicker value="Roboto" onChange={onChange} inheritedFont="Inter" />);

    // Open dropdown
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Click on Inherit
    const inheritButton = screen.getAllByRole('button').find(btn =>
      btn.textContent?.includes('Inherit')
    );
    fireEvent.click(inheritButton!);

    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('closes dropdown after selection', () => {
    const onChange = vi.fn();
    render(<FontPicker value="" onChange={onChange} inheritedFont="Inter" />);

    // Open dropdown
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('Brand Fonts')).toBeInTheDocument();

    // Select a font
    const inter = screen.getByText('Inter');
    fireEvent.click(inter);

    // Dropdown should be closed (Brand Fonts should not be visible)
    expect(screen.queryByText('Brand Fonts')).not.toBeInTheDocument();
  });

  it('shows system fonts section', () => {
    const onChange = vi.fn();
    render(<FontPicker value="" onChange={onChange} inheritedFont="Inter" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('System Fonts')).toBeInTheDocument();
    expect(screen.getByText('System UI')).toBeInTheDocument();
    expect(screen.getByText('Sans Serif')).toBeInTheDocument();
    expect(screen.getByText('Serif')).toBeInTheDocument();
    expect(screen.getByText('Monospace')).toBeInTheDocument();
  });

  it('hides inherit option when showInherit is false', () => {
    const onChange = vi.fn();
    render(<FontPicker value="Roboto" onChange={onChange} showInherit={false} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Find all buttons in the dropdown (excluding the trigger button)
    const dropdownButtons = screen.getAllByRole('button').slice(1);
    const hasInherit = dropdownButtons.some(btn => btn.textContent?.includes('Inherit'));

    expect(hasInherit).toBe(false);
  });

  it('displays check mark for selected font', () => {
    const onChange = vi.fn();
    render(<FontPicker value="Roboto" onChange={onChange} inheritedFont="Inter" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Find all buttons and the one with Roboto text inside it (in the dropdown)
    const buttons = screen.getAllByRole('button');
    const robotoButton = buttons.find(btn => {
      const span = btn.querySelector('span');
      return span?.textContent === 'Roboto' && span?.style.fontFamily === 'Roboto';
    });

    expect(robotoButton).toBeDefined();
    expect(robotoButton?.querySelector('svg')).toBeInTheDocument();
  });
});
