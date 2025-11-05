import type { Template } from '@/types/domain';
import { minimalPro } from './minimal-pro';

/**
 * Template Registry
 *
 * Central registry of all available slide templates.
 * To add a new template:
 * 1. Create a new file in this directory (e.g., my-template.tsx)
 * 2. Export a Template object
 * 3. Import and add it to the templates array below
 */

export const templates: Template[] = [
  minimalPro,
  // Add more templates here as they're created:
  // coachStoryboard,
  // metricHighlights,
  // journeySteps,
  // punchyTips,
];

/**
 * Get a template by ID
 */
export function getTemplate(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}

/**
 * Get the default template (Minimal Pro)
 */
export function getDefaultTemplate(): Template {
  return minimalPro;
}

/**
 * Get all available templates
 */
export function getAllTemplates(): Template[] {
  return templates;
}
