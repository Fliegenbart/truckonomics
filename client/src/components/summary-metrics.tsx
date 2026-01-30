import { Truck } from "lucide-react";
import type { ComparisonResult } from "@shared/schema";

interface SummaryMetricsProps {
  result: ComparisonResult;
  fleetSize?: number;
}

export function SummaryMetrics({ result, fleetSize = 1 }: SummaryMetricsProps) {
  if (!result || !result.electric1Analysis || !result.electric2Analysis || !result.dieselAnalysis) {
    return null;
  }

  const bestElectric = result.bestElectricOption === "electric1"
    ? result.electric1Analysis
    : result.electric2Analysis;

  const bestBreakEven = result.bestElectricOption === "electric1"
    ? result.dieselVsElectric1
    : result.dieselVsElectric2;

  const isFleet = fleetSize > 1;

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
      return "—";
    }
    if (bestBreakEven.breakEvenMonth) {
      return `${bestBreakEven.breakEvenYear}J ${bestBreakEven.breakEvenMonth}M`;
    }
    return `${bestBreakEven.breakEvenYear} Jahre`;
  };

  return (
    <div className="space-y-8">
      {/* Fleet indicator - minimal */}
      {isFleet && (
        <div className="flex items-center gap-3 py-3 px-4 border border-border bg-card">
          <Truck className="h-4 w-4 text-primary" />
          <span className="text-sm">
            <span className="font-medium">{fleetSize} Fahrzeuge</span>
            <span className="text-muted-foreground"> · Alle Werte für die gesamte Flotte</span>
          </span>
        </div>
      )}

      {/* Editorial Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border border-border bg-card">
        {/* Max Savings */}
        <div className="p-6 lg:p-8 border-r border-b lg:border-b-0 border-border">
          <p className="label-editorial mb-4">
            {isFleet ? "Flottenersparnis" : "Max. Ersparnis"}
          </p>
          <p className="font-sans text-4xl sm:text-5xl lg:text-6xl font-bold tabular-nums tracking-tight text-primary leading-none" data-testid="text-max-savings">
            {formatCurrency(result.maxSavings * fleetSize)}
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            vs Diesel · {result.timeframeYears} Jahre
          </p>
        </div>

        {/* Break Even */}
        <div className="p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-border">
          <p className="label-editorial mb-4">Amortisation</p>
          <p className="font-sans text-4xl sm:text-5xl lg:text-6xl font-bold tabular-nums tracking-tight text-foreground leading-none" data-testid="text-break-even">
            {formatBreakEven()}
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            {bestElectric.name}
          </p>
        </div>

        {/* Diesel TCO */}
        <div className="p-6 lg:p-8 border-r border-border">
          <p className="label-editorial mb-4">
            {isFleet ? "TCO Diesel" : "Diesel TCO"}
          </p>
          <p className="font-sans text-4xl sm:text-5xl lg:text-6xl font-bold tabular-nums tracking-tight text-foreground/70 leading-none" data-testid="text-diesel-tco">
            {formatCurrency(result.dieselAnalysis.totalCostOfOwnership * fleetSize)}
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            Gesamtkosten
          </p>
        </div>

        {/* Best Electric TCO */}
        <div className="p-6 lg:p-8">
          <p className="label-editorial mb-4">
            {isFleet ? "TCO Elektro" : "Bester Elektro"}
          </p>
          <p className="font-sans text-4xl sm:text-5xl lg:text-6xl font-bold tabular-nums tracking-tight text-primary leading-none" data-testid="text-best-electric-tco">
            {formatCurrency(bestElectric.totalCostOfOwnership * fleetSize)}
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            {bestElectric.name}
          </p>
        </div>
      </div>
    </div>
  );
}
