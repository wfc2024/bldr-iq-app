import { LineItem, CategoryBreakdown } from "../types/project";
import { scopeOfWorkData, categories } from "../data/scopeOfWork";

const COLORS = [
  "#1B2D4F", // Navy blue (brand color)
  "#F7931E", // Orange (brand color)
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f43f5e", // rose
  "#84cc16", // lime
  "#6366f1", // indigo
  "#14b8a6", // teal
  "#f97316", // orange
  "#a855f7", // violet
];

/**
 * Calculate cost breakdown by category from line items
 * Assemblies are grouped by assembly category (Office, Restroom, etc.), while regular items are grouped by scope category
 * @param lineItems - Array of line items
 * @returns Array of category breakdowns with totals and colors
 */
export function calculateCategoryBreakdown(lineItems: LineItem[]): CategoryBreakdown[] {
  if (lineItems.length === 0) return [];

  const breakdowns: CategoryBreakdown[] = [];
  let colorIndex = 0;

  // First, group assembly items by assembly category (not assembly name)
  const assemblyGroups = new Map<string, number>();
  lineItems.forEach(item => {
    if (item.isAssembly && item.assemblyCategory) {
      const currentTotal = assemblyGroups.get(item.assemblyCategory) || 0;
      assemblyGroups.set(item.assemblyCategory, currentTotal + item.total);
    }
  });

  // Add assembly groups to breakdowns
  assemblyGroups.forEach((total, assemblyCategory) => {
    breakdowns.push({
      name: assemblyCategory,
      value: total,
      color: COLORS[colorIndex % COLORS.length],
    });
    colorIndex++;
  });

  // Calculate totals for predefined categories (non-assembly items)
  const categoryTotals = categories.map((category) => {
    const total = lineItems
      .filter(item => {
        // Skip assembly items (already counted above)
        if (item.isAssembly) return false;
        
        // Skip custom items (handled separately below)
        if (item.isCustom) return false;
        
        // Find the group for this scope
        const scopeData = scopeOfWorkData.find(
          s => s.name === item.scopeName
        );
        return scopeData?.group === category;
      })
      .reduce((sum, item) => sum + item.total, 0);

    return {
      name: category,
      value: total,
      color: COLORS[colorIndex % COLORS.length],
    };
  }).filter(cat => cat.value > 0);

  // Increment color index for each non-zero category
  categoryTotals.forEach(() => colorIndex++);
  breakdowns.push(...categoryTotals);

  // Calculate total for custom items (non-assembly)
  const customTotal = lineItems
    .filter(item => item.isCustom && !item.isAssembly)
    .reduce((sum, item) => sum + item.total, 0);

  // Add custom items category if there are any
  if (customTotal > 0) {
    breakdowns.push({
      name: "Custom Items",
      value: customTotal,
      color: COLORS[colorIndex % COLORS.length],
    });
  }

  return breakdowns;
}
