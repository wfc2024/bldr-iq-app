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
 * @param lineItems - Array of line items
 * @returns Array of category breakdowns with totals and colors
 */
export function calculateCategoryBreakdown(lineItems: LineItem[]): CategoryBreakdown[] {
  if (lineItems.length === 0) return [];

  // Calculate totals for predefined categories
  const categoryTotals = categories.map((category, index) => {
    const total = lineItems
      .filter(item => {
        // Skip custom items
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
      color: COLORS[index % COLORS.length],
    };
  }).filter(cat => cat.value > 0);

  // Calculate total for custom items
  const customTotal = lineItems
    .filter(item => item.isCustom)
    .reduce((sum, item) => sum + item.total, 0);

  // Add custom items category if there are any
  if (customTotal > 0) {
    categoryTotals.push({
      name: "Custom Items",
      value: customTotal,
      color: "#F7931E", // Orange brand color for custom items
    });
  }

  return categoryTotals;
}