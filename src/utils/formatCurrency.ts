/**
 * Format a number as currency with proper comma separators
 * @param amount - The number to format
 * @returns Formatted currency string (e.g., "$116,175.00")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number with commas but no currency symbol
 * @param amount - The number to format
 * @returns Formatted number string (e.g., "116,175.00")
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
