/**
 * LocalStorage Persistence Utilities
 * Handles saving and loading project data with brand and block styles
 */

import type { Project } from '@/types/domain'
import { APP_STORAGE_PREFIX } from '@/lib/constants/app'

// Export the storage key so other modules can use the same key
export const PROJECT_STORAGE_KEY = `${APP_STORAGE_PREFIX}_project`

/**
 * Save project to localStorage
 */
export function saveProject(project: Project): void {
  try {
    const json = JSON.stringify(project)
    localStorage.setItem(PROJECT_STORAGE_KEY, json)
  } catch (error) {
    console.error('Failed to save project to localStorage:', error)
  }
}

/**
 * Load project from localStorage
 */
export function loadProject(): Project | null {
  try {
    const json = localStorage.getItem(PROJECT_STORAGE_KEY)
    if (!json) return null

    const project = JSON.parse(json) as Project
    return project
  } catch (error) {
    console.error('Failed to load project from localStorage:', error)
    return null
  }
}

/**
 * Clear project from localStorage
 */
export function clearProject(): void {
  try {
    localStorage.removeItem(PROJECT_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear project from localStorage:', error)
  }
}

/**
 * Check if there's a saved project in localStorage
 */
export function hasSavedProject(): boolean {
  try {
    return localStorage.getItem(PROJECT_STORAGE_KEY) !== null
  } catch {
    return false
  }
}
