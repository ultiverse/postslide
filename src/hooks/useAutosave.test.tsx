import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { act } from 'react';

import { useAutosave } from './useAutosave';
import { useProject } from '@/state/project.store';

// helper to reset the real store to a small test seed
const seedProject = {
    id: 'test-seed',
    title: 'Test',
    slides: [{ id: 's1', templateId: 'minimal-pro', blocks: [] }],
};

function TestComp() {
    useAutosave();
    return null;
}

describe('useAutosave', () => {
    beforeEach(() => {
        vi.spyOn(window.localStorage, 'setItem').mockClear();
    });

    it('writes project to localStorage on mount', async () => {
        // reset real store
        useProject.setState({ project: seedProject });
        render(<TestComp />);
        await waitFor(() => expect(window.localStorage.getItem('slidepost.project')).toBe(JSON.stringify(seedProject)));
    });

    it('writes project again when project changes', async () => {
        const { rerender } = render(<TestComp />);

        // update the real store project (new object reference to trigger effect)
        const updated = { ...seedProject, title: 'Updated' };
        act(() => {
            useProject.setState({ project: updated });
            // rerender to let hook pick up new project
            rerender(<TestComp />);
        });

        await waitFor(() => expect(window.localStorage.getItem('slidepost.project')).toContain('Updated'));
    });
});
