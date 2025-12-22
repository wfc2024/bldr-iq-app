import { Project } from "../types/project";

/**
 * Migration utility to handle data format changes
 * This ensures backward compatibility when upgrading from localStorage-only to user-based storage
 */

const OLD_PROJECTS_KEY = "projects";
const NEW_PROJECTS_KEY = "bldriq_projects";

/**
 * Migrate old projects to new format with userId
 * This should be called once on app initialization
 */
export function migrateProjectsData() {
  try {
    // Check if we already have data in the new format
    const newData = localStorage.getItem(NEW_PROJECTS_KEY);
    if (newData) {
      // Already migrated
      return;
    }

    // Check for old data
    const oldData = localStorage.getItem(OLD_PROJECTS_KEY);
    if (!oldData) {
      // No data to migrate
      return;
    }

    // Parse old projects
    const oldProjects: Project[] = JSON.parse(oldData);
    
    // Add guest user ID and generalConditionsPercentage to all existing projects
    const migratedProjects = oldProjects.map(project => ({
      ...project,
      userId: project.userId || "guest-user-1",
      generalConditionsPercentage: project.generalConditionsPercentage || 8,
    }));

    // Save to new key
    localStorage.setItem(NEW_PROJECTS_KEY, JSON.stringify(migratedProjects));
    
    console.log(`Migrated ${migratedProjects.length} projects to new format`);
  } catch (error) {
    console.error("Error migrating projects data:", error);
  }
}

/**
 * Ensure existing projects have the generalConditionsPercentage field
 * This should be called when loading projects from storage
 */
export function ensureGeneralConditionsField(project: Project): Project {
  if (typeof project.generalConditionsPercentage === 'undefined') {
    return {
      ...project,
      generalConditionsPercentage: 8,
    };
  }
  return project;
}