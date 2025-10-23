import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, Calendar, DollarSign, Award } from "lucide-react";
import type { ComparisonResult } from "@shared/schema";

interface SummaryMetricsProps {
  result: ComparisonResult;
}

export function SummaryMetrics({ result }: SummaryMetricsProps) {
  if (!result || !result.electric1Analysis || !result.electric2Analysis || !result.dieselAnalysis) {
    return null;
  }

  const bestElectric = result.bestElectricOption === "electric1" 
    ? result.electric1Analysis 
    : result.electric2Analysis;
  
  const bestBreakEven = result.bestElectricOption === "electric1"
    ? result.dieselVsElectric1
    : result.dieselVsElectric2;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatBreakEven = () => {
    if (!bestBreakEven || bestBreakEven.breakEvenYear === null) {
      return "Not within timeframe";
    }
    if (bestBreakEven.breakEvenMonth) {
      return `${bestBreakEven.breakEvenYear}y ${bestBreakEven.breakEvenMonth}m`;
    }
    return `${bestBreakEven.breakEvenYear} years`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Max Savings
          </CardTitle>
          <TrendingDown className="h-5 w-5 text-chart-2" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold tabular-nums" data-testid="text-max-savings">
            {formatCurrency(result.maxSavings)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            vs Diesel over {result.timeframeYears} years
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Break-Even Point
          </CardTitle>
          <Calendar className="h-5 w-5 text-chart-1" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold tabular-nums" data-testid="text-break-even">
            {formatBreakEven()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {bestElectric.name}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Diesel TCO
          </CardTitle>
          <DollarSign className="h-5 w-5 text-chart-4" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold tabular-nums" data-testid="text-diesel-tco">
            {formatCurrency(result.dieselAnalysis.totalCostOfOwnership)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {result.timeframeYears}-year total cost
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Best Electric TCO
          </CardTitle>
          <Award className="h-5 w-5 text-chart-2" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold tabular-nums" data-testid="text-best-electric-tco">
            {formatCurrency(bestElectric.totalCostOfOwnership)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {bestElectric.name}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
