import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, TrendingDown } from "lucide-react";
import type { ComparisonResult } from "@shared/schema";

interface EnvironmentalImpactCardProps {
  result: ComparisonResult;
}

export function EnvironmentalImpactCard({ result }: EnvironmentalImpactCardProps) {
  const { dieselAnalysis, environmentalComparison } = result;
  
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCO2 = (kg: number) => {
    const tons = kg / 1000;
    if (tons >= 1) {
      return `${formatNumber(tons)} Tonnen`;
    }
    return `${formatNumber(kg)} kg`;
  };

  const formatFuel = (amount: number, unit: "liters" | "kWh") => {
    if (unit === "liters") {
      return `${formatNumber(amount)} Liter`;
    }
    return `${formatNumber(amount)} kWh`;
  };

  const co2SavedTons = environmentalComparison.bestElectricCO2Saved / 1000;
  const percentageReduction = (environmentalComparison.bestElectricCO2Saved / dieselAnalysis.environmentalImpact.totalCO2Emissions) * 100;
  const absSavings = Math.abs(environmentalComparison.bestElectricCO2Saved);
  
  let savingsType: "positive" | "zero" | "negative";
  if (Math.abs(environmentalComparison.bestElectricCO2Saved) < 100) {
    savingsType = "zero";
  } else if (environmentalComparison.bestElectricCO2Saved > 0) {
    savingsType = "positive";
  } else {
    savingsType = "negative";
  }

  return (
    <Card className="border border-border bg-card shadow-none">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="label-editorial mb-2">Nachhaltigkeit</p>
            <CardTitle className="font-serif text-xl font-medium flex items-center gap-2">
              <Leaf className="h-5 w-5 text-foreground" />
              Umweltauswirkungen
            </CardTitle>
          </div>
          <span className="text-sm text-muted-foreground">
            {result.timeframeYears} Jahre
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {savingsType === "positive" ? "CO₂-Einsparung" : "CO₂-Vergleich"}
            </span>
            {savingsType === "positive" && <TrendingDown className="h-4 w-4 text-primary" />}
          </div>
          <div className="space-y-1">
            {savingsType === "positive" ? (
              <>
                <p className="font-serif text-3xl font-semibold text-primary" data-testid="text-co2-saved">
                  {formatCO2(environmentalComparison.bestElectricCO2Saved)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {percentageReduction.toFixed(0)}% Reduktion · {environmentalComparison.bestElectricName}
                </p>
              </>
            ) : savingsType === "zero" ? (
              <>
                <p className="font-serif text-2xl font-semibold" data-testid="text-co2-saved">
                  Kein signifikanter Unterschied
                </p>
                <p className="text-sm text-muted-foreground">
                  {environmentalComparison.bestElectricName} hat ähnliche Lebenszyklus-Emissionen
                </p>
              </>
            ) : (
              <>
                <p className="font-serif text-2xl font-semibold" data-testid="text-co2-saved">
                  +{formatCO2(absSavings)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Zusätzliche Emissionen durch Stromquelle
                </p>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          <p className="label-editorial">Emissionen nach Fahrzeug</p>

          <div className="space-y-3">
            {[result.dieselAnalysis, result.electric1Analysis, result.electric2Analysis].map((analysis, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${analysis.type === "diesel" ? "bg-muted-foreground" : "bg-primary"}`} />
                  <span className="text-muted-foreground truncate" title={analysis.name}>
                    {analysis.name.length > 25 ? analysis.name.substring(0, 25) + "..." : analysis.name}
                  </span>
                </div>
                <span className="font-medium tabular-nums" data-testid={`text-emissions-${index}`}>
                  {formatCO2(analysis.environmentalImpact.totalCO2Emissions)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          <p className="label-editorial">Gesamtenergieverbrauch</p>

          <div className="space-y-3">
            {[result.dieselAnalysis, result.electric1Analysis, result.electric2Analysis].map((analysis, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground truncate" title={analysis.name}>
                  {analysis.name.length > 25 ? analysis.name.substring(0, 25) + "..." : analysis.name}
                </span>
                <span className="font-medium tabular-nums" data-testid={`text-fuel-consumed-${index}`}>
                  {formatFuel(analysis.environmentalImpact.totalFuelConsumed, analysis.environmentalImpact.fuelUnit)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            * Elektrofahrzeug-Emissionen basierend auf deutschem Strommix (0,38 kg CO₂/kWh).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
