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
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="overflow-hidden border border-border bg-card shadow-none">
      <CardHeader className="pb-4">
        <p className="label-editorial mb-2">Kostenentwicklung</p>
        <CardTitle className="font-serif text-xl font-medium">Amortisationszeitraum</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 sm:h-96" data-testid="chart-amortization">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="1 4" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="year"
                label={{ value: "Jahre", position: "insideBottom", offset: -5 }}
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                label={{ value: "Gesamtkosten (€)", angle: -90, position: "insideLeft" }}
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "2px",
                  color: "hsl(var(--popover-foreground))",
                  fontSize: "13px",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px", fontSize: "13px" }} />
              <Line
                type="monotone"
                dataKey={result.dieselAnalysis.name}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey={result.electric1Analysis.name}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey={result.electric2Analysis.name}
                stroke="hsl(var(--foreground))"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
