/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock canvas and fonts for testing
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
})) as any;

// Mock FontFace for FontLoader tests
class MockFontFace {
  family: string;
  source: string;
  load: any;

  constructor(family: string, source: string, _descriptors?: any) {
    this.family = family;
    this.source = source;
    this.load = vi.fn().mockResolvedValue(this);
  }
}

global.FontFace = MockFontFace as any;

// Mock document.fonts with proper Set-like interface
const mockFonts = new Set<any>();
Object.defineProperty(document, 'fonts', {
  value: {
    add: vi.fn((font: any) => mockFonts.add(font)),
    delete: vi.fn((font: any) => mockFonts.delete(font)),
    check: vi.fn(() => true),
    ready: Promise.resolve(),
  },
  writable: true,
});
