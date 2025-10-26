import { useEffect } from 'react';
import { useProject } from '@/state/project.store';
export function useAutosave() {
    const project = useProject((s) => s.project);
    useEffect(() => {
        localStorage.setItem('slidepost.project', JSON.stringify(project));
    }, [project]);
}
