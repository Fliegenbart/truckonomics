import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { ComparisonResult } from "@shared/schema";

interface AmortizationChartProps {
  result: ComparisonResult;
}

export function AmortizationChart({ result }: AmortizationChartProps) {
  const chartData = result.dieselAnalysis.yearlyBreakdown.map((diesel, index) => {
    const electric1 = result.electric1Analysis.yearlyBreakdown[index];
    const electric2 = result.electric2Analysis.yearlyBreakdown[index];

    return {
      year: diesel.year,
      [result.dieselAnalysis.name]: Math.round(diesel.cumulativeCost),
      [result.electric1Analysis.name]: Math.round(electric1.cumulativeCost),
      [result.electric2Analysis.name]: Math.round(electric2.cumulativeCost),
    };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="overflow-hidden border-card-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold">Amortization Timeline</CardTitle>
        <p className="text-sm text-muted-foreground">
          Cumulative cost comparison over time
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80 sm:h-96" data-testid="chart-amortization">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="year" 
                label={{ value: "Years", position: "insideBottom", offset: -5 }}
                className="text-xs"
              />
              <YAxis 
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                label={{ value: "Total Cost ($)", angle: -90, position: "insideLeft" }}
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
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Line
                type="monotone"
                dataKey={result.dieselAnalysis.name}
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey={result.electric1Analysis.name}
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey={result.electric2Analysis.name}
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
