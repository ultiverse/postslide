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
    // Ensure any async font loading updates settle so React doesn't warn about
    // state updates outside of act in this test environment.
    return screen.findByText('Fonts ready: true').then(() => { });
  });

  it('renders children with fontsReady true after loading', async () => {
    render(
      <FontLoader head={mockHeadFont} body={mockBodyFont}>
        {(fontsReady) => <div data-testid="child">Fonts ready: {String(fontsReady)}</div>}
      </FontLoader>
    );

    await screen.findByText('Fonts ready: true');
    expect(screen.getByTestId('child')).toHaveTextContent('Fonts ready: true');
  });

  it('creates FontFace instances with correct parameters', async () => {
    const originalFontFace = global.FontFace;

    // Constructor-style spy for FontFace so `new FontFace(...)` works as expected.
    class SpyFontFace {
      static calls: Array<{ family: string; source: string; descriptors?: Record<string, unknown>; }> = [];
      family: string;
      source: string;
      descriptors?: Record<string, unknown>;
      load: () => Promise<SpyFontFace>;

      constructor(family: string, source: string, descriptors?: Record<string, unknown>) {
        SpyFontFace.calls.push({ family, source, descriptors });
        this.family = family;
        this.source = source;
        this.descriptors = descriptors;
        this.load = vi.fn().mockResolvedValue(this) as unknown as () => Promise<SpyFontFace>;
      }
    }

    global.FontFace = SpyFontFace as unknown as typeof FontFace;

    render(
      <FontLoader head={mockHeadFont} body={mockBodyFont}>
        {() => <div data-testid="test">Test</div>}
      </FontLoader>
    );

    await screen.findByTestId('test');
    expect(screen.getByTestId('test')).toBeInTheDocument();

    expect(SpyFontFace.calls).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          family: mockHeadFont.family,
          source: `url(${mockHeadFont.url})`,
          descriptors: expect.objectContaining({ weight: '700', display: 'swap' })
        }),
        expect.objectContaining({
          family: mockBodyFont.family,
          source: `url(${mockBodyFont.url})`,
          descriptors: expect.objectContaining({ weight: '400', display: 'swap' })
        })
      ])
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

    await screen.findByTestId('ready');
    expect(screen.getByTestId('ready')).toHaveTextContent('true');

    expect(addSpy).toHaveBeenCalledTimes(2);
  });

  it('handles font loading errors gracefully', async () => {
    const originalFontFace = global.FontFace;

    // Constructor-style mock that simulates load rejection
    class ErrorFontFace {
      load: () => Promise<never>;
      constructor() {
        this.load = vi.fn().mockRejectedValue(new Error('Font load failed')) as unknown as () => Promise<never>;
      }
    }

    global.FontFace = ErrorFontFace as unknown as typeof FontFace;

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(
      <FontLoader head={mockHeadFont} body={mockBodyFont}>
        {(fontsReady) => <div data-testid="child">Fonts ready: {String(fontsReady)}</div>}
      </FontLoader>
    );

    // Should still render with fontsReady true (fail open)
    await screen.findByText('Fonts ready: true');
    expect(screen.getByTestId('child')).toHaveTextContent('Fonts ready: true');

    expect(consoleSpy).toHaveBeenCalledWith('Font loading error:', expect.any(Error));

    consoleSpy.mockRestore();

    global.FontFace = originalFontFace;
  });

  it('cleans up fonts on unmount', async () => {
    const { unmount } = render(
      <FontLoader head={mockHeadFont} body={mockBodyFont}>
        {(ready) => <div data-testid="ready">{String(ready)}</div>}
      </FontLoader>
    );

    await screen.findByTestId('ready');
    expect(screen.getByTestId('ready')).toHaveTextContent('true');

    // Verify component cleans up properly (test passes if unmount doesn't throw)
    expect(() => unmount()).not.toThrow();
  });

  it('uses default weights when not provided', async () => {
    const originalFontFace = global.FontFace;

    class SpyFontFace {
      family: string;
      source: string;
      load: () => Promise<SpyFontFace>;
      static calls: Array<{ family: string; source: string; descriptors?: Record<string, unknown>; }> = [];

      constructor(family: string, source: string, descriptors?: Record<string, unknown>) {
        this.family = family;
        this.source = source;
        this.load = vi.fn().mockResolvedValue(this) as unknown as () => Promise<SpyFontFace>;
        SpyFontFace.calls.push({ family, source, descriptors });
      }
    }

    global.FontFace = SpyFontFace as unknown as typeof FontFace;

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
