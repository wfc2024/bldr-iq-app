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
}
