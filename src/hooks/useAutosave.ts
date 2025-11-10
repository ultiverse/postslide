import { useEffect } from 'react'
import { useProject } from '@/state/project.store'
import { saveProject } from '@/lib/persistence/localStorage'

export function useAutosave() {
  const project = useProject((s) => s.project)
  useEffect(() => {
    saveProject(project)
  }, [project])
}
