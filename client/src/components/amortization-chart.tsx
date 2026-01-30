import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine,
} from "recharts";
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

  const yearTicks = chartData.map((d) => d.year);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const interpolateCumulativeCost = (
    breakdown: { year: number; cumulativeCost: number }[],
    x: number,
  ): number | null => {
    if (!breakdown.length) return null;
    if (x <= 1) return breakdown[0].cumulativeCost;

    const lastYear = breakdown[breakdown.length - 1]?.year ?? breakdown.length;
    if (x >= lastYear) return breakdown[breakdown.length - 1].cumulativeCost;

    const lowerYear = Math.floor(x);
    const upperYear = Math.ceil(x);
    const lower = breakdown[lowerYear - 1];
    const upper = breakdown[upperYear - 1];
    if (!lower || !upper) return null;

    if (lowerYear === upperYear) return lower.cumulativeCost;

    const t = x - lowerYear;
    return lower.cumulativeCost + (upper.cumulativeCost - lower.cumulativeCost) * t;
  };

  const getBreakEvenMarker = (
    electric: { year: number; cumulativeCost: number }[],
    breakEvenYear: number | null,
    breakEvenMonth: number | null,
  ): { x: number; y: number } | null => {
    if (breakEvenYear === null) return null;

    let x = breakEvenYear;
    if (breakEvenMonth !== null && breakEvenMonth !== 0) {
      x = breakEvenYear + breakEvenMonth / 12;
    }

    // If the electric truck is already cheaper from year 1, the backend returns 0/0.
    // Our chart starts at year 1, so we highlight the first visible point.
    if (x < 1) x = 1;

    const dieselY = interpolateCumulativeCost(result.dieselAnalysis.yearlyBreakdown, x);
    const electricY = interpolateCumulativeCost(electric, x);

    if (dieselY === null && electricY === null) return null;
    const y =
      dieselY !== null && electricY !== null ? (dieselY + electricY) / 2 : electricY ?? dieselY!;

    return { x, y };
  };

  const breakEven1 = getBreakEvenMarker(
    result.electric1Analysis.yearlyBreakdown,
    result.dieselVsElectric1.breakEvenYear,
    result.dieselVsElectric1.breakEvenMonth,
  );

  const breakEven2 = getBreakEvenMarker(
    result.electric2Analysis.yearlyBreakdown,
    result.dieselVsElectric2.breakEvenYear,
    result.dieselVsElectric2.breakEvenMonth,
  );

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
                type="number"
                domain={[1, result.timeframeYears]}
                ticks={yearTicks}
                allowDecimals={false}
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

              {/* Break-even markers (where electric becomes cheaper than diesel) */}
              {breakEven1 && (
                <ReferenceLine
                  x={breakEven1.x}
                  stroke="hsl(var(--primary) / 0.35)"
                  strokeDasharray="3 3"
                />
              )}
              {breakEven2 && (
                <ReferenceLine
                  x={breakEven2.x}
                  stroke="hsl(var(--foreground) / 0.35)"
                  strokeDasharray="3 3"
                />
              )}

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

              {breakEven1 && (
                <ReferenceDot
                  x={breakEven1.x}
                  y={breakEven1.y}
                  r={7}
                  fill="hsl(var(--primary))"
                  stroke="hsl(var(--background))"
                  strokeWidth={3}
                />
              )}
              {breakEven2 && (
                <ReferenceDot
                  x={breakEven2.x}
                  y={breakEven2.y}
                  r={7}
                  fill="hsl(var(--foreground))"
                  stroke="hsl(var(--background))"
                  strokeWidth={3}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
