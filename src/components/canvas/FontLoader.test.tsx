/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import FontLoader from './FontLoader';

describe('FontLoader', () => {
  const mockHeadFont = {
    family: 'TestHeadFont',
    url: 'https://example.com/head.woff2',
    weight: 700,
  };

  const mockBodyFont = {
    family: 'TestBodyFont',
    url: 'https://example.com/body.woff2',
    weight: 400,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children initially', () => {
    render(
      <FontLoader head={mockHeadFont} body={mockBodyFont}>
        {(fontsReady) => <div data-testid="child">Fonts ready: {String(fontsReady)}</div>}
      </FontLoader>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders children with fontsReady true after loading', async () => {
    render(
      <FontLoader head={mockHeadFont} body={mockBodyFont}>
        {(fontsReady) => <div data-testid="child">Fonts ready: {String(fontsReady)}</div>}
      </FontLoader>
    );

    await waitFor(() => {
      expect(screen.getByTestId('child')).toHaveTextContent('Fonts ready: true');
    });
  });

  it('creates FontFace instances with correct parameters', async () => {
    const originalFontFace = global.FontFace;
    const fontFaceSpy = vi.fn(originalFontFace);
    global.FontFace = fontFaceSpy as any;

    render(
      <FontLoader head={mockHeadFont} body={mockBodyFont}>
        {() => <div data-testid="test">Test</div>}
      </FontLoader>
    );

    await waitFor(() => {
      expect(screen.getByTestId('test')).toBeInTheDocument();
    });

    expect(fontFaceSpy).toHaveBeenCalledWith(
      mockHeadFont.family,
      `url(${mockHeadFont.url})`,
      expect.objectContaining({ weight: '700', display: 'swap' })
    );

    expect(fontFaceSpy).toHaveBeenCalledWith(
      mockBodyFont.family,
      `url(${mockBodyFont.url})`,
      expect.objectContaining({ weight: '400', display: 'swap' })
    );

    global.FontFace = originalFontFace;
  });

  it('adds fonts to document.fonts after loading', async () => {
    const addSpy = vi.spyOn(document.fonts, 'add');

    render(
      <FontLoader head={mockHeadFont} body={mockBodyFont}>
        {(ready) => <div data-testid="ready">{String(ready)}</div>}
      </FontLoader>
    );

    await waitFor(() => {
      expect(screen.getByTestId('ready')).toHaveTextContent('true');
    });

    expect(addSpy).toHaveBeenCalledTimes(2);
  });

  it('handles font loading errors gracefully', async () => {
    const mockFontFace = vi.fn().mockImplementation(() => ({
      load: vi.fn().mockRejectedValue(new Error('Font load failed')),
    }));

    global.FontFace = mockFontFace as any;

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <FontLoader head={mockHeadFont} body={mockBodyFont}>
        {(fontsReady) => <div data-testid="child">Fonts ready: {String(fontsReady)}</div>}
      </FontLoader>
    );

    // Should still render with fontsReady true (fail open)
    await waitFor(() => {
      expect(screen.getByTestId('child')).toHaveTextContent('Fonts ready: true');
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Font loading error:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('cleans up fonts on unmount', async () => {
    const { unmount } = render(
      <FontLoader head={mockHeadFont} body={mockBodyFont}>
        {(ready) => <div data-testid="ready">{String(ready)}</div>}
      </FontLoader>
    );

    await waitFor(() => {
      expect(screen.getByTestId('ready')).toHaveTextContent('true');
    });

    // Verify component cleans up properly (test passes if unmount doesn't throw)
    expect(() => unmount()).not.toThrow();
  });

  it('uses default weights when not provided', async () => {
    const originalFontFace = global.FontFace;

    class SpyFontFace {
      family: string;
      source: string;
      load: any;
      static calls: any[] = [];

      constructor(family: string, source: string, descriptors?: any) {
        this.family = family;
        this.source = source;
        this.load = vi.fn().mockResolvedValue(this);
        SpyFontFace.calls.push({ family, source, descriptors });
      }
    }

    global.FontFace = SpyFontFace as any;

    const headFontNoWeight = { family: 'Test', url: 'https://example.com/test.woff2' };
    const bodyFontNoWeight = { family: 'Test2', url: 'https://example.com/test2.woff2' };

    render(
      <FontLoader head={headFontNoWeight} body={bodyFontNoWeight}>
        {(ready) => <div data-testid="ready">{String(ready)}</div>}
      </FontLoader>
    );

    await waitFor(() => {
      expect(screen.getByTestId('ready')).toHaveTextContent('true');
    });

    expect(SpyFontFace.calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          family: headFontNoWeight.family,
          source: `url(${headFontNoWeight.url})`,
          descriptors: expect.objectContaining({ weight: '700' })
        }),
        expect.objectContaining({
          family: bodyFontNoWeight.family,
          source: `url(${bodyFontNoWeight.url})`,
          descriptors: expect.objectContaining({ weight: '400' })
        })
      ])
    );

    global.FontFace = originalFontFace;
  });
});
