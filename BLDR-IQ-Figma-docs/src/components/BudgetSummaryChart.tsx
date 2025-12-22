import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { LineItem } from "../types/project";
import { calculateCategoryBreakdown } from "../utils/categoryBreakdown";
import { formatCurrency } from "../utils/formatCurrency";

interface BudgetSummaryChartProps {
  lineItems: LineItem[];
}

export function BudgetSummaryChart({ lineItems }: BudgetSummaryChartProps) {
  if (lineItems.length === 0) return null;

  const categoryTotals = calculateCategoryBreakdown(lineItems);
  const total = categoryTotals.reduce((sum, cat) => sum + cat.value, 0);

  // Don't render if there are no values
  if (total === 0 || categoryTotals.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Cost Breakdown by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="w-full lg:w-1/2 h-[300px] min-h-[300px] flex-shrink-0">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryTotals}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryTotals.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 space-y-3 w-full">
            {categoryTotals.map((category) => (
              <div key={category.name} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(category.value)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{((category.value / total) * 100).toFixed(1)}% of subtotal</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}