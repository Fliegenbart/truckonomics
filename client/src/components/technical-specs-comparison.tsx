import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Zap, Weight, Gauge, Battery, Fuel, Ruler, Settings } from "lucide-react";
import type { TruckAnalysis } from "@shared/schema";

interface TechnicalSpecsComparisonProps {
  dieselAnalysis: TruckAnalysis;
  electric1Analysis: TruckAnalysis;
  electric2Analysis: TruckAnalysis;
}

export function TechnicalSpecsComparison({
  dieselAnalysis,
  electric1Analysis,
  electric2Analysis,
}: TechnicalSpecsComparisonProps) {
  const trucks = [dieselAnalysis, electric1Analysis, electric2Analysis];
  
  const formatNumber = (value: number | undefined, suffix: string = "") => {
    if (value === undefined || value === null) return "–";
    return `${value.toLocaleString("de-DE")}${suffix}`;
  };

  const hasSpecs = trucks.some(t => t.technicalSpecs);
  
  if (!hasSpecs) {
    return null;
  }

  const specRows = [
    {
      category: "Gewicht",
      icon: Weight,
      specs: [
        { label: "Zul. Gesamtgewicht", key: "zulaessigesGesamtgewicht" as const, suffix: " kg" },
        { label: "Zuggesamtgewicht", key: "zugGesamtgewicht" as const, suffix: " kg" },
        { label: "Nutzlast", key: "nutzlast" as const, suffix: " kg" },
      ],
    },
    {
      category: "Antrieb",
      icon: Gauge,
      specs: [
        { label: "Leistung", key: "leistungKW" as const, suffix: " kW" },
        { label: "Leistung", key: "leistungPS" as const, suffix: " PS" },
        { label: "Drehmoment", key: "drehmoment" as const, suffix: " Nm" },
        { label: "Achskonfiguration", key: "achskonfiguration" as const, suffix: "" },
      ],
    },
    {
      category: "Energie",
      icon: Battery,
      specs: [
        { label: "Batteriekapazität", key: "batterieKapazitaet" as const, suffix: " kWh", electricOnly: true },
        { label: "Tankkapazität", key: "tankKapazitaet" as const, suffix: " L", dieselOnly: true },
        { label: "Reichweite", key: "reichweite" as const, suffix: " km" },
        { label: "Ladeleistung AC", key: "ladeLeistungAC" as const, suffix: " kW", electricOnly: true },
        { label: "Ladeleistung DC", key: "ladeLeistungDC" as const, suffix: " kW", electricOnly: true },
      ],
    },
    {
      category: "Abmessungen",
      icon: Ruler,
      specs: [
        { label: "Länge", key: "laenge" as const, suffix: " mm" },
        { label: "Höhe", key: "hoehe" as const, suffix: " mm" },
        { label: "Fahrerhaus", key: "fahrerhaus" as const, suffix: "" },
      ],
    },
  ];

  return (
    <Card className="overflow-hidden border-card-border/50 shadow-sm" data-testid="card-technical-specs">
      <CardHeader className="pb-4 bg-gradient-to-b from-muted/30 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-xl font-semibold">Technische Spezifikationen</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="table-technical-specs">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                  Spezifikation
                </th>
                {trucks.map((truck, index) => (
                  <th key={index} className="text-center py-3 px-4 min-w-[140px]">
                    <div className="flex flex-col items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${truck.type === 'diesel' ? 'bg-chart-1/10' : 'bg-chart-2/10'}`}>
                        {truck.type === 'diesel' ? (
                          <Truck className="h-4 w-4 text-chart-1" />
                        ) : (
                          <Zap className="h-4 w-4 text-chart-2" />
                        )}
                      </div>
                      <span className="font-semibold text-xs">{truck.name}</span>
                      <Badge 
                        variant={truck.type === 'diesel' ? "secondary" : "default"}
                        className={`text-xs px-2 py-0.5 ${truck.type === 'electric' ? 'bg-chart-2 hover:bg-chart-2/90' : ''}`}
                      >
                        {truck.type === 'diesel' ? 'Diesel' : 'Elektro'}
                      </Badge>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specRows.map((category) => (
                <>
                  <tr key={category.category} className="bg-muted/20">
                    <td colSpan={4} className="py-2 px-4">
                      <div className="flex items-center gap-2">
                        <category.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                          {category.category}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {category.specs.map((spec) => {
                    const shouldShowRow = trucks.some(truck => {
                      if (!truck.technicalSpecs) return false;
                      const value = truck.technicalSpecs[spec.key];
                      if (value === undefined || value === null) return false;
                      if ('electricOnly' in spec && spec.electricOnly && truck.type !== 'electric') return false;
                      if ('dieselOnly' in spec && spec.dieselOnly && truck.type !== 'diesel') return false;
                      return true;
                    });
                    
                    if (!shouldShowRow) return null;
                    
                    return (
                      <tr key={spec.key} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                        <td className="py-3 px-4 pl-8 text-muted-foreground">{spec.label}</td>
                        {trucks.map((truck, index) => {
                          const specs = truck.technicalSpecs;
                          let value = specs ? specs[spec.key] : undefined;
                          
                          if ('electricOnly' in spec && spec.electricOnly && truck.type !== 'electric') {
                            value = undefined;
                          }
                          if ('dieselOnly' in spec && spec.dieselOnly && truck.type !== 'diesel') {
                            value = undefined;
                          }
                          
                          return (
                            <td 
                              key={index} 
                              className="py-3 px-4 text-center font-medium"
                              data-testid={`spec-${spec.key}-${index}`}
                            >
                              {typeof value === 'number' 
                                ? formatNumber(value, spec.suffix)
                                : value || "–"}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
