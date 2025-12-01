import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, Calendar, Euro, Award } from "lucide-react";
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
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatBreakEven = () => {
    if (!bestBreakEven || bestBreakEven.breakEvenYear === null) {
      return "Nicht im Zeitraum";
    }
    if (bestBreakEven.breakEvenMonth) {
      return `${bestBreakEven.breakEvenYear}J ${bestBreakEven.breakEvenMonth}M`;
    }
    return `${bestBreakEven.breakEvenYear} Jahre`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="overflow-hidden border-card-border/50 shadow-sm hover:shadow-md transition-all duration-300 group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 gap-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Max. Ersparnis
          </CardTitle>
          <div className="p-2 rounded-xl bg-chart-2/10 group-hover:bg-chart-2/15 transition-colors">
            <TrendingDown className="h-4 w-4 text-chart-2" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl sm:text-4xl font-bold tabular-nums text-chart-2" data-testid="text-max-savings">
            {formatCurrency(result.maxSavings)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            vs Diesel über {result.timeframeYears} Jahre
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-card-border/50 shadow-sm hover:shadow-md transition-all duration-300 group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 gap-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Amortisation
          </CardTitle>
          <div className="p-2 rounded-xl bg-chart-1/10 group-hover:bg-chart-1/15 transition-colors">
            <Calendar className="h-4 w-4 text-chart-1" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl sm:text-4xl font-bold tabular-nums" data-testid="text-break-even">
            {formatBreakEven()}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {bestElectric.name}
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-card-border/50 shadow-sm hover:shadow-md transition-all duration-300 group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 gap-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Diesel TCO
          </CardTitle>
          <div className="p-2 rounded-xl bg-chart-4/10 group-hover:bg-chart-4/15 transition-colors">
            <Euro className="h-4 w-4 text-chart-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl sm:text-4xl font-bold tabular-nums" data-testid="text-diesel-tco">
            {formatCurrency(result.dieselAnalysis.totalCostOfOwnership)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {result.timeframeYears}-Jahres Gesamtkosten
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-card-border/50 shadow-sm hover:shadow-md transition-all duration-300 group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 gap-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Bester Elektro TCO
          </CardTitle>
          <div className="p-2 rounded-xl bg-chart-2/10 group-hover:bg-chart-2/15 transition-colors">
            <Award className="h-4 w-4 text-chart-2" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl sm:text-4xl font-bold tabular-nums text-chart-2" data-testid="text-best-electric-tco">
            {formatCurrency(bestElectric.totalCostOfOwnership)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {bestElectric.name}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
