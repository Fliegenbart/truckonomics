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
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCO2 = (lbs: number) => {
    const tons = lbs / 2000;
    if (tons >= 1) {
      return `${formatNumber(tons)} tons`;
    }
    return `${formatNumber(lbs)} lbs`;
  };

  const formatFuel = (amount: number, unit: "gallons" | "kWh") => {
    if (unit === "gallons") {
      return `${formatNumber(amount)} gallons`;
    }
    return `${formatNumber(amount)} kWh`;
  };

  const co2SavedTons = environmentalComparison.bestElectricCO2Saved / 2000;
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
    <Card>
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600 dark:text-green-500" />
            Environmental Impact
          </CardTitle>
          <Badge variant="default" className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600">
            Over {result.timeframeYears} Years
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Emissions Saved */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              {savingsType === "positive" ? "CO₂ Emissions Saved" : "CO₂ Emissions Comparison"}
            </span>
            {savingsType === "positive" && <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-500" />}
          </div>
          <div className="space-y-1">
            {savingsType === "positive" ? (
              <>
                <p className="text-2xl font-bold text-green-600 dark:text-green-500" data-testid="text-co2-saved">
                  {formatCO2(environmentalComparison.bestElectricCO2Saved)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {percentageReduction.toFixed(0)}% reduction by choosing {environmentalComparison.bestElectricName}
                </p>
              </>
            ) : savingsType === "zero" ? (
              <>
                <p className="text-2xl font-bold" data-testid="text-co2-saved">
                  No significant difference
                </p>
                <p className="text-xs text-muted-foreground">
                  {environmentalComparison.bestElectricName} has similar lifetime emissions to diesel
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold" data-testid="text-co2-saved">
                  +{formatCO2(absSavings)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Additional emissions from {environmentalComparison.bestElectricName} due to grid electricity source
                </p>
              </>
            )}
          </div>
        </div>

        {/* Detailed Emissions Comparison */}
        <div className="space-y-3 pt-3 border-t">
          <p className="text-sm font-medium">Emissions by Truck</p>
          
          <div className="space-y-2">
            {[result.dieselAnalysis, result.electric1Analysis, result.electric2Analysis].map((analysis, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant={analysis.type === "diesel" ? "secondary" : "default"} className="text-xs shrink-0">
                    {analysis.type === "diesel" ? "Diesel" : "Electric"}
                  </Badge>
                  <span className="text-muted-foreground truncate" title={analysis.name}>
                    {analysis.name.length > 20 ? analysis.name.substring(0, 20) + "..." : analysis.name}
                  </span>
                </div>
                <span className="font-medium tabular-nums" data-testid={`text-emissions-${index}`}>
                  {formatCO2(analysis.environmentalImpact.totalCO2Emissions)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Fuel Consumption */}
        <div className="space-y-3 pt-3 border-t">
          <p className="text-sm font-medium">Total Energy Consumed</p>
          
          <div className="space-y-2">
            {[result.dieselAnalysis, result.electric1Analysis, result.electric2Analysis].map((analysis, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground truncate" title={analysis.name}>
                  {analysis.name.length > 20 ? analysis.name.substring(0, 20) + "..." : analysis.name}
                </span>
                <span className="font-medium tabular-nums" data-testid={`text-fuel-consumed-${index}`}>
                  {formatFuel(analysis.environmentalImpact.totalFuelConsumed, analysis.environmentalImpact.fuelUnit)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Environmental Note */}
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            * Electric vehicle emissions based on US grid average (0.85 lbs CO₂/kWh). Actual emissions vary by region and energy source.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
