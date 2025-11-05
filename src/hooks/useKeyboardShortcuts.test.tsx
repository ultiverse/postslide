import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

// Mutable mock state and spies
const mockFns = {
    addSlide: vi.fn(),
    duplicateSlide: vi.fn(),
    removeSlide: vi.fn(),
    moveSlideUp: vi.fn(),
    moveSlideDown: vi.fn(),
} as const;

type TestStore = {
    selectedSlideId?: string;
    project: { slides: { id: string; }[]; };
    addSlide: typeof mockFns.addSlide;
    duplicateSlide: typeof mockFns.duplicateSlide;
    removeSlide: typeof mockFns.removeSlide;
    moveSlideUp: typeof mockFns.moveSlideUp;
    moveSlideDown: typeof mockFns.moveSlideDown;
};

let mockState: TestStore = {
    selectedSlideId: 's1',
    project: { slides: [{ id: 's1' }] },
    addSlide: mockFns.addSlide,
    duplicateSlide: mockFns.duplicateSlide,
    removeSlide: mockFns.removeSlide,
    moveSlideUp: mockFns.moveSlideUp,
    moveSlideDown: mockFns.moveSlideDown,
};

vi.mock('@/state/project.store', () => ({
    // Provide a properly-typed generic useProject mock so tests don't use `any`.
    useProject: <T,>(selector: (s: TestStore) => T) => selector(mockState) as T,
}));

import { useKeyboardShortcuts } from './useKeyboardShortcuts';

function HookTest() {
    useKeyboardShortcuts();
    return null;
}

describe('useKeyboardShortcuts', () => {
    beforeEach(() => {
        Object.values(mockFns).forEach((f) => f.mockClear());
        mockState = {
            selectedSlideId: 's1',
            project: { slides: [{ id: 's1' }, { id: 's2' }] },
            addSlide: mockFns.addSlide,
            duplicateSlide: mockFns.duplicateSlide,
            removeSlide: mockFns.removeSlide,
            moveSlideUp: mockFns.moveSlideUp,
            moveSlideDown: mockFns.moveSlideDown,
        };
    });

    it('adds slide on Enter when not focused in input', () => {
        render(<HookTest />);
        const ev = new KeyboardEvent('keydown', { key: 'Enter' });
        window.dispatchEvent(ev);
        expect(mockFns.addSlide).toHaveBeenCalled();
    });

    it('duplicates slide on Cmd/Ctrl+D', () => {
        render(<HookTest />);
        const ev = new KeyboardEvent('keydown', { key: 'd', ctrlKey: true });
        window.dispatchEvent(ev);
        expect(mockFns.duplicateSlide).toHaveBeenCalledWith('s1');
    });

    it('removes slide on Cmd/Ctrl+Backspace when more than 1 slide', () => {
        render(<HookTest />);
        const ev = new KeyboardEvent('keydown', { key: 'Backspace', metaKey: true });
        window.dispatchEvent(ev);
        expect(mockFns.removeSlide).toHaveBeenCalledWith('s1');
    });

    it('moves slide up and down on arrow shortcuts', () => {
        render(<HookTest />);
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', ctrlKey: true }));
        expect(mockFns.moveSlideUp).toHaveBeenCalledWith('s1');

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', metaKey: true }));
        expect(mockFns.moveSlideDown).toHaveBeenCalledWith('s1');
    });

    it('does nothing when no selectedSlideId', () => {
        mockState.selectedSlideId = undefined;
        render(<HookTest />);
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(mockFns.addSlide).not.toHaveBeenCalled();
    });
});
