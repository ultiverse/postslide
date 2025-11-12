/**
 * LocalStorage Persistence Utilities
 * Supports multiple projects with individual storage keys
 */

import type { Project } from '@/types/domain'
import { APP_STORAGE_PREFIX } from '@/lib/constants/app'

// Storage keys
export const CURRENT_PROJECT_KEY = `${APP_STORAGE_PREFIX}_current_project`
export const LAST_URL_KEY = `${APP_STORAGE_PREFIX}_last_url`

/**
 * Get storage key for a specific project
 */
function getProjectKey(projectId: string): string {
  return `${APP_STORAGE_PREFIX}_project_${projectId}`
}

/**
 * Save project to localStorage using its own key
 */
export function saveProject(project: Project): void {
  try {
    const projectKey = getProjectKey(project.id)
    const json = JSON.stringify(project)
    localStorage.setItem(projectKey, json)

    // Update current project reference
    localStorage.setItem(CURRENT_PROJECT_KEY, project.id)
  } catch (error) {
    console.error('Failed to save project to localStorage:', error)
  }
}

/**
 * Load a specific project by ID
 */
export function loadProject(projectId: string): Project | null {
  try {
    const projectKey = getProjectKey(projectId)
    const json = localStorage.getItem(projectKey)
    if (!json) return null

    const project = JSON.parse(json) as Project
    return project
  } catch (error) {
    console.error('Failed to load project from localStorage:', error)
    return null
  }
}

/**
 * Load the current project (last active)
 */
export function loadCurrentProject(): Project | null {
  try {
    const currentProjectId = localStorage.getItem(CURRENT_PROJECT_KEY)
    if (!currentProjectId) return null

    return loadProject(currentProjectId)
  } catch (error) {
    console.error('Failed to load current project:', error)
    return null
  }
}

/**
 * Get the current project ID
 */
export function getCurrentProjectId(): string | null {
  try {
    return localStorage.getItem(CURRENT_PROJECT_KEY)
  } catch {
    return null
  }
}

/**
 * Set the current project ID
 */
export function setCurrentProjectId(projectId: string): void {
  try {
    localStorage.setItem(CURRENT_PROJECT_KEY, projectId)
  } catch (error) {
    console.error('Failed to set current project:', error)
  }
}

/**
 * Delete a specific project
 */
export function deleteProject(projectId: string): void {
  try {
    const projectKey = getProjectKey(projectId)
    localStorage.removeItem(projectKey)

    // Clear current project if it was the deleted one
    const currentId = getCurrentProjectId()
    if (currentId === projectId) {
      localStorage.removeItem(CURRENT_PROJECT_KEY)
    }
  } catch (error) {
    console.error('Failed to delete project from localStorage:', error)
  }
}

/**
 * Get all project IDs from localStorage
 */
export function getAllProjectIds(): string[] {
  try {
    const projectIds: string[] = []
    const prefix = `${APP_STORAGE_PREFIX}_project_`

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(prefix)) {
        const projectId = key.substring(prefix.length)
        projectIds.push(projectId)
      }
    }

    return projectIds
  } catch (error) {
    console.error('Failed to get project IDs:', error)
    return []
  }
}

/**
 * Save last URL
 */
export function saveLastUrl(url: string): void {
  try {
    localStorage.setItem(LAST_URL_KEY, url)
  } catch (error) {
    console.error('Failed to save last URL:', error)
  }
}

/**
 * Load last URL
 */
export function loadLastUrl(): string | null {
  try {
    return localStorage.getItem(LAST_URL_KEY)
  } catch {
    return null
  }
}

/**
 * Check if a project exists in localStorage
 */
export function hasProject(projectId: string): boolean {
  try {
    const projectKey = getProjectKey(projectId)
    return localStorage.getItem(projectKey) !== null
  } catch {
    return false
  }
}
