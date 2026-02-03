import { Project } from "../types/project";
import { supabase } from "../lib/supabase";

/**
 * Data Service for Project Management with Supabase
 * 
 * Handles all project CRUD operations using Supabase database.
 */

class DataService {
  /**
   * Get all projects for a user
   */
  async getProjects(userId?: string): Promise<Project[]> {
    try {
      if (!userId) {
        return [];
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error loading projects:", error);
        return [];
      }

      // Transform database format to app format
      return (data || []).map(this.transformFromDb);
    } catch (error) {
      console.error("Error loading projects:", error);
      return [];
    }
  }

  /**
   * Get a single project by ID
   */
  async getProject(projectId: string, userId?: string): Promise<Project | null> {
    try {
      if (!userId) {
        return null;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error("Error loading project:", error);
        return null;
      }

      return data ? this.transformFromDb(data) : null;
    } catch (error) {
      console.error("Error loading project:", error);
      return null;
    }
  }

  /**
   * Save a new project or update existing one
   */
  async saveProject(project: Project): Promise<Project> {
    try {
      const dbProject = this.transformToDb(project);

      // Check if project exists
      const { data: existingProject } = await supabase
        .from('projects')
        .select('id')
        .eq('id', project.id)
        .single();

      if (existingProject) {
        // Update existing project
        const { data, error } = await supabase
          .from('projects')
          .update(dbProject)
          .eq('id', project.id)
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        return this.transformFromDb(data);
      } else {
        // Insert new project
        const { data, error } = await supabase
          .from('projects')
          .insert([dbProject])
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        return this.transformFromDb(data);
      }
    } catch (error: any) {
      console.error("Error saving project:", error);
      throw new Error(error.message || "Failed to save project");
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string, userId?: string): Promise<void> {
    try {
      if (!userId) {
        throw new Error("User ID required");
      }

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error("Error deleting project:", error);
      throw new Error(error.message || "Failed to delete project");
    }
  }

  /**
   * Get project statistics for a user
   */
  async getProjectStats(userId?: string): Promise<{
    totalProjects: number;
    totalBudget: number;
    activeProjects: number;
  }> {
    try {
      if (!userId) {
        return { totalProjects: 0, totalBudget: 0, activeProjects: 0 };
      }

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

  /**
   * Transform database row to app Project type
   */
  private transformFromDb(dbProject: any): Project {
    return {
      id: dbProject.id,
      userId: dbProject.user_id,
      projectName: dbProject.project_name,
      address: dbProject.address,
      gcCompanyName: dbProject.gc_company_name || "",
      gcMarkupPercentage: Number(dbProject.gc_markup_percentage),
      generalConditionsPercentage: Number(dbProject.general_conditions_percentage),
      lineItems: dbProject.line_items || [],
      subtotal: Number(dbProject.subtotal),
      grandTotal: Number(dbProject.grand_total),
      categoryBreakdown: dbProject.category_breakdown || {},
      createdAt: dbProject.created_at,
      updatedAt: dbProject.updated_at,
      status: dbProject.status,
      notes: dbProject.notes || "",
      overheadPercentage: dbProject.overhead_percentage ? Number(dbProject.overhead_percentage) : undefined,
      profitPercentage: dbProject.profit_percentage ? Number(dbProject.profit_percentage) : undefined,
      bondInsurancePercentage: dbProject.bond_insurance_percentage ? Number(dbProject.bond_insurance_percentage) : undefined,
      salesTaxPercentage: dbProject.sales_tax_percentage ? Number(dbProject.sales_tax_percentage) : undefined,
      contingencyPercentage: dbProject.contingency_percentage ? Number(dbProject.contingency_percentage) : undefined,
      scopeGapBufferPercentage: dbProject.scope_gap_buffer_percentage ? Number(dbProject.scope_gap_buffer_percentage) : undefined,
      templateType: dbProject.template_type || undefined,
    };
  }

  /**
   * Transform app Project type to database row
   */
  private transformToDb(project: Project): any {
    return {
      id: project.id,
      user_id: project.userId,
      project_name: project.projectName,
      address: project.address,
      gc_company_name: project.gcCompanyName || null,
      gc_markup_percentage: project.gcMarkupPercentage,
      general_conditions_percentage: project.generalConditionsPercentage,
      line_items: project.lineItems,
      subtotal: project.subtotal,
      grand_total: project.grandTotal,
      category_breakdown: project.categoryBreakdown || null,
      status: project.status,
      notes: project.notes || null,
      overhead_percentage: project.overheadPercentage ?? null,
      profit_percentage: project.profitPercentage ?? null,
      bond_insurance_percentage: project.bondInsurancePercentage ?? null,
      sales_tax_percentage: project.salesTaxPercentage ?? null,
      contingency_percentage: project.contingencyPercentage ?? null,
      scope_gap_buffer_percentage: project.scopeGapBufferPercentage ?? null,
      template_type: project.templateType || null,
    };
  }
}

export const dataService = new DataService();
