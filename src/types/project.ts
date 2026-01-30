export interface LineItem {
  id: string;
  scopeName: string;
  unitType: string;
  quantity: number;
  unitCost: number;
  total: number;
  notes?: string;
  isCustom?: boolean;
  customScopeName?: string;
  isAssembly?: boolean; // Flag for assembly package line items
  assemblyName?: string; // Track which assembly this belongs to for cost breakdown grouping
  assemblyCategory?: string; // Track assembly category (Office, Restroom, etc.) for pie chart grouping
  isDynamicCommonArea?: boolean; // Flag for the auto-updating common area assembly
  assemblySqft?: number; // Square footage footprint of the assembly (for common area calculations)
  // GC-specific cost breakdown
  laborCost?: number;
  materialCost?: number;
  equipmentCost?: number;
  subcontractorCost?: number;
  // Per-item markup override
  customMarkup?: number;
  // Tax applicability
  taxable?: boolean;
}

export interface CategoryBreakdown {
  name: string;
  value: number;
  color: string;
}

export interface Project {
  id: string;
  userId?: string; // Optional for now, will be required when auth is integrated
  projectName: string;
  address: string;
  gcCompanyName?: string; // GC company name providing the budget
  gcMarkupPercentage: number;
  generalConditionsPercentage: number;
  lineItems: LineItem[];
  subtotal: number;
  grandTotal: number;
  categoryBreakdown?: CategoryBreakdown[]; // Cost breakdown by category
  createdAt: string;
  updatedAt: string;
  status: "Draft" | "Active" | "Completed" | "Archived";
  notes?: string;
  // GC-specific fields
  overheadPercentage?: number;
  profitPercentage?: number; // Separate from markup for clarity
  bondInsurancePercentage?: number;
  salesTaxPercentage?: number;
  contingencyPercentage?: number;
  // Conceptual template specific
  scopeGapBufferPercentage?: number; // 5, 10, 15, or 20 - only for Conceptual BLD template
  templateType?: string; // Track which template was used to enable template-specific features
}
