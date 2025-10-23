import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { ComparisonResult } from "@shared/schema";

interface CostBreakdownChartProps {
  result: ComparisonResult;
}

export function CostBreakdownChart({ result }: CostBreakdownChartProps) {
  const calculateTotalsByCategory = (analysis: typeof result.dieselAnalysis) => {
    const totals = analysis.yearlyBreakdown.reduce(
      (acc, year) => ({
        purchase: acc.purchase + year.purchaseCost,
        fuel: acc.fuel + year.fuelCost,
        maintenance: acc.maintenance + year.maintenanceCost,
        insurance: acc.insurance + year.insuranceCost,
        depreciation: acc.depreciation + year.depreciationCost,
      }),
      { purchase: 0, fuel: 0, maintenance: 0, insurance: 0, depreciation: 0 }
    );
    return totals;
  };

  const dieselTotals = calculateTotalsByCategory(result.dieselAnalysis);
  const electric1Totals = calculateTotalsByCategory(result.electric1Analysis);
  const electric2Totals = calculateTotalsByCategory(result.electric2Analysis);

  const chartData = [
    {
      name: result.dieselAnalysis.name.length > 15 
        ? result.dieselAnalysis.name.substring(0, 15) + "..." 
        : result.dieselAnalysis.name,
      Purchase: Math.round(dieselTotals.purchase),
      Fuel: Math.round(dieselTotals.fuel),
      Maintenance: Math.round(dieselTotals.maintenance),
      Insurance: Math.round(dieselTotals.insurance),
      Depreciation: Math.round(dieselTotals.depreciation),
    },
    {
      name: result.electric1Analysis.name.length > 15 
        ? result.electric1Analysis.name.substring(0, 15) + "..." 
        : result.electric1Analysis.name,
      Purchase: Math.round(electric1Totals.purchase),
      Fuel: Math.round(electric1Totals.fuel),
      Maintenance: Math.round(electric1Totals.maintenance),
      Insurance: Math.round(electric1Totals.insurance),
      Depreciation: Math.round(electric1Totals.depreciation),
    },
    {
      name: result.electric2Analysis.name.length > 15 
        ? result.electric2Analysis.name.substring(0, 15) + "..." 
        : result.electric2Analysis.name,
      Purchase: Math.round(electric2Totals.purchase),
      Fuel: Math.round(electric2Totals.fuel),
      Maintenance: Math.round(electric2Totals.maintenance),
      Insurance: Math.round(electric2Totals.insurance),
      Depreciation: Math.round(electric2Totals.depreciation),
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Breakdown Comparison</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total costs by category over {result.timeframeYears} years
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80" data-testid="chart-breakdown">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="name" 
                className="text-xs"
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                label={{ value: "Cost ($)", angle: -90, position: "insideLeft" }}
                className="text-xs"
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--popover-border))",
                  borderRadius: "var(--radius)",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Bar dataKey="Purchase" stackId="a" fill="hsl(var(--chart-1))" />
              <Bar dataKey="Fuel" stackId="a" fill="hsl(var(--chart-2))" />
              <Bar dataKey="Maintenance" stackId="a" fill="hsl(var(--chart-4))" />
              <Bar dataKey="Insurance" stackId="a" fill="hsl(var(--chart-5))" />
              <Bar dataKey="Depreciation" stackId="a" fill="hsl(var(--chart-3))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
