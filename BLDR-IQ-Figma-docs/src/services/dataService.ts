import { Project } from "../types/project";

/**
 * Data Service for Project Management
 * 
 * This service abstracts all data storage operations.
 * Currently uses localStorage, but can be easily swapped with:
 * - Supabase database
 * - REST API
 * - GraphQL
 * - Any other backend
 * 
 * To integrate with Supabase:
 * 1. Replace localStorage calls with supabase.from('projects') queries
 * 2. Add proper error handling
 * 3. Implement real-time subscriptions if needed
 */

const PROJECTS_KEY = "bldriq_projects";

class DataService {
  /**
   * Get all projects for a user
   * TODO: Replace with Supabase query filtered by userId
   * Example: supabase.from('projects').select('*').eq('user_id', userId)
   */
  async getProjects(userId?: string): Promise<Project[]> {
    try {
      const projectsJson = localStorage.getItem(PROJECTS_KEY);
      const allProjects: Project[] = projectsJson ? JSON.parse(projectsJson) : [];
      
      // If userId is provided, filter projects
      // For now, return all projects in guest mode (no filtering)
      if (userId && userId !== "guest-user-1") {
        return allProjects.filter(p => p.userId === userId);
      }
      
      return allProjects;
    } catch (error) {
      console.error("Error loading projects:", error);
      return [];
    }
  }

  /**
   * Get a single project by ID
   * TODO: Replace with Supabase query
   * Example: supabase.from('projects').select('*').eq('id', projectId).single()
   */
  async getProject(projectId: string, userId?: string): Promise<Project | null> {
    try {
      const projects = await this.getProjects(userId);
      return projects.find(p => p.id === projectId) || null;
    } catch (error) {
      console.error("Error loading project:", error);
      return null;
    }
  }

  /**
   * Save a new project or update existing one
   * TODO: Replace with Supabase insert/update
   * Example: supabase.from('projects').upsert(project)
   */
  async saveProject(project: Project): Promise<Project> {
    try {
      const projects = await this.getProjects();
      const existingIndex = projects.findIndex(p => p.id === project.id);

      if (existingIndex >= 0) {
        // Update existing
        projects[existingIndex] = {
          ...project,
          updatedAt: new Date().toISOString(),
        };
      } else {
        // Add new
        projects.push({
          ...project,
          createdAt: project.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
      
      return existingIndex >= 0 ? projects[existingIndex] : projects[projects.length - 1];
    } catch (error) {
      console.error("Error saving project:", error);
      throw new Error("Failed to save project");
    }
  }

  /**
   * Delete a project
   * TODO: Replace with Supabase delete
   * Example: supabase.from('projects').delete().eq('id', projectId)
   */
  async deleteProject(projectId: string, userId?: string): Promise<void> {
    try {
      const projects = await this.getProjects();
      const filteredProjects = projects.filter(p => {
        // Only delete if it matches the ID and belongs to the user
        if (userId && userId !== "guest-user-1") {
          return !(p.id === projectId && p.userId === userId);
        }
        return p.id !== projectId;
      });

      localStorage.setItem(PROJECTS_KEY, JSON.stringify(filteredProjects));
    } catch (error) {
      console.error("Error deleting project:", error);
      throw new Error("Failed to delete project");
    }
  }

  /**
   * Get project statistics for a user
   * TODO: Can be optimized with database aggregations
   */
  async getProjectStats(userId?: string): Promise<{
    totalProjects: number;
    totalBudget: number;
    activeProjects: number;
  }> {
    try {
      const projects = await this.getProjects(userId);
      
      return {
        totalProjects: projects.length,
        totalBudget: projects.reduce((sum, p) => sum + p.grandTotal, 0),
        activeProjects: projects.filter(p => p.status === "Active").length,
      };
    } catch (error) {
      console.error("Error getting project stats:", error);
      return { totalProjects: 0, totalBudget: 0, activeProjects: 0 };
    }
  }
}

export const dataService = new DataService();
