import { useState } from "react";
import { TruckParametersCard } from "@/components/truck-parameters-card";
import { TimeframeSelector } from "@/components/timeframe-selector";
import { TaxIncentiveSelector } from "@/components/tax-incentive-selector";
import { Button } from "@/components/ui/button";
import { SummaryMetrics } from "@/components/summary-metrics";
import { AmortizationChart } from "@/components/amortization-chart";
import { CostBreakdownChart } from "@/components/cost-breakdown-chart";
import { DetailedTCOTable } from "@/components/detailed-tco-table";
import { EnvironmentalImpactCard } from "@/components/environmental-impact-card";
import { TechnicalSpecsComparison } from "@/components/technical-specs-comparison";
import { Calculator, RotateCcw, Truck } from "lucide-react";
import { EonLogo } from "@/components/eon-logo";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { TruckParameters, ComparisonResult, TaxIncentiveRegion } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import truckHeaderImage from "@assets/stock_images/modern_class_8_semi-_a48fa740.jpg";

const defaultDieselTruck: TruckParameters = {
  name: "Diesel-Sattelzug",
  type: "diesel",
  purchasePrice: 155000,
  annualMileage: 120000,
  fuelCostPerUnit: 1.65,
  maintenanceCostAnnual: 14000,
  insuranceCostAnnual: 11000,
  expectedLifespanYears: 12,
  fuelEfficiency: 32,
  technicalSpecs: {
    zulaessigesGesamtgewicht: 18000,
    zugGesamtgewicht: 40000,
    achskonfiguration: "4x2",
    nutzlast: 26000,
    leistungKW: 350,
    leistungPS: 476,
    drehmoment: 2300,
    tankKapazitaet: 400,
    reichweite: 1200,
    fahrerhaus: "Fernverkehr",
    laenge: 6200,
    hoehe: 3950,
  },
};

const defaultElectricTruck1: TruckParameters = {
  name: "Elektro-Sattelzug 1",
  type: "electric",
  purchasePrice: 170000,
  annualMileage: 120000,
  fuelCostPerUnit: 0.35,
  maintenanceCostAnnual: 7500,
  insuranceCostAnnual: 10000,
  expectedLifespanYears: 15,
  fuelEfficiency: 120,
  technicalSpecs: {
    zulaessigesGesamtgewicht: 27000,
    zugGesamtgewicht: 40000,
    achskonfiguration: "6x2",
    nutzlast: 22000,
    leistungKW: 400,
    leistungPS: 544,
    drehmoment: 2100,
    batterieKapazitaet: 600,
    reichweite: 500,
    ladeLeistungAC: 22,
    ladeLeistungDC: 400,
    fahrerhaus: "Fernverkehr",
    laenge: 6400,
    hoehe: 3950,
  },
};

const defaultElectricTruck2: TruckParameters = {
  name: "Elektro-Sattelzug 2",
  type: "electric",
  purchasePrice: 320000,
  annualMileage: 100000,
  fuelCostPerUnit: 0.35,
  maintenanceCostAnnual: 8500,
  insuranceCostAnnual: 11000,
  expectedLifespanYears: 12,
  fuelEfficiency: 130,
  technicalSpecs: {
    zulaessigesGesamtgewicht: 27000,
    zugGesamtgewicht: 44000,
    achskonfiguration: "6x4",
    nutzlast: 23000,
    leistungKW: 450,
    leistungPS: 612,
    drehmoment: 2200,
    batterieKapazitaet: 624,
    reichweite: 530,
    ladeLeistungAC: 43,
    ladeLeistungDC: 375,
    fahrerhaus: "Fernverkehr",
    laenge: 6450,
    hoehe: 4000,
  },
};

export default function Home() {
  const [dieselTruck, setDieselTruck] = useState<TruckParameters>(defaultDieselTruck);
  const [electricTruck1, setElectricTruck1] = useState<TruckParameters>(defaultElectricTruck1);
  const [electricTruck2, setElectricTruck2] = useState<TruckParameters>(defaultElectricTruck2);
  const [timeframeYears, setTimeframeYears] = useState(10);
  const [taxIncentiveRegion, setTaxIncentiveRegion] = useState<TaxIncentiveRegion>("bundesfoerderung");
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const { toast } = useToast();

  const calculateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/calculate-tco", {
        dieselTruck,
        electricTruck1,
        electricTruck2,
        timeframeYears,
        taxIncentiveRegion,
      });
      const data = await response.json();
      return data as ComparisonResult;
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Berechnung abgeschlossen",
        description: "Die Gesamtbetriebskosten-Analyse wurde erstellt.",
      });
      
      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
    onError: () => {
      toast({
        title: "Berechnung fehlgeschlagen",
        description: "Bitte überprüfen Sie Ihre Eingaben und versuchen Sie es erneut.",
        variant: "destructive",
      });
    },
  });

  const handleCalculate = () => {
    calculateMutation.mutate();
  };

  const handleReset = () => {
    setDieselTruck(defaultDieselTruck);
    setElectricTruck1(defaultElectricTruck1);
    setElectricTruck2(defaultElectricTruck2);
    setTimeframeYears(10);
    setTaxIncentiveRegion("bundesfoerderung");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Gradient Mesh Background */}
      <div className="gradient-mesh" />
      
      {/* Hero Header with Truck Image */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={truckHeaderImage} 
            alt="Class 8 Semi-Truck" 
            className="w-full h-full object-cover object-center"
          />
          {/* Premium gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-24">
          <div className="flex items-center gap-5 mb-6 fade-in">
            <div className="p-4 glass rounded-2xl border border-primary/20 shadow-lg">
              <EonLogo className="h-10 w-auto" />
            </div>
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gradient" data-testid="text-app-title">
                Truckonomics
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground mt-2 font-light">
                Gesamtbetriebskosten-Rechner
              </p>
            </div>
          </div>
          <p className="text-lg text-foreground/70 max-w-2xl leading-relaxed fade-in stagger-1">
            Vergleichen Sie Diesel- und Elektro-Sattelzüge mit umfassender TCO-Analyse inklusive Kaufpreis, Kraftstoffkosten, Wartung, Versicherung und Umweltauswirkungen.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 space-y-12 relative">
        {/* Input Section */}
        <section className="space-y-8 fade-in stagger-2">
          <div className="text-center sm:text-left">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
              Fahrzeugspezifikationen
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Konfigurieren Sie Ihre Schwerlast-LKWs für den Vergleich
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="card-hover">
              <TruckParametersCard
                truck={dieselTruck}
                onChange={setDieselTruck}
                truckIndex={0}
              />
            </div>
            <div className="card-hover">
              <TruckParametersCard
                truck={electricTruck1}
                onChange={setElectricTruck1}
                truckIndex={1}
              />
            </div>
            <div className="card-hover">
              <TruckParametersCard
                truck={electricTruck2}
                onChange={setElectricTruck2}
                truckIndex={2}
              />
            </div>
          </div>
        </section>

        {/* Calculation Controls */}
        <section className="space-y-8 fade-in stagger-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card border border-card-border rounded-2xl p-8 shadow-sm card-hover">
              <div>
                <h3 className="text-xl font-semibold mb-3">Analysezeitraum</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Wählen Sie den Zeitraum für die Gesamtbetriebskosten-Analyse
                </p>
                <TimeframeSelector
                  value={timeframeYears}
                  onChange={setTimeframeYears}
                />
              </div>
            </div>

            <div className="card-hover">
              <TaxIncentiveSelector
                value={taxIncentiveRegion}
                onChange={setTaxIncentiveRegion}
              />
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-2xl p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleCalculate}
                disabled={calculateMutation.isPending}
                size="lg"
                className="flex-1 min-h-14 text-lg font-medium rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                data-testid="button-calculate"
              >
                <Calculator className="mr-3 h-5 w-5" />
                {calculateMutation.isPending ? "Berechnung läuft..." : "TCO berechnen"}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                className="sm:w-auto min-h-14 rounded-xl transition-all duration-300"
                data-testid="button-reset"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Zurücksetzen
              </Button>
            </div>
          </div>
        </section>

        {/* Results Section */}
        {result && (
          <section id="results-section" className="space-y-10 scroll-mt-20 fade-in">
            <div className="text-center sm:text-left">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
                Analyseergebnisse
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg">
                Umfassender Kostenvergleich über {result.timeframeYears} Jahre
              </p>
            </div>

            <SummaryMetrics result={result} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="card-hover">
                <AmortizationChart result={result} />
              </div>
              <div className="card-hover">
                <CostBreakdownChart result={result} />
              </div>
            </div>

            <div className="card-hover">
              <EnvironmentalImpactCard result={result} />
            </div>

            <div className="card-hover">
              <TechnicalSpecsComparison
                dieselAnalysis={result.dieselAnalysis}
                electric1Analysis={result.electric1Analysis}
                electric2Analysis={result.electric2Analysis}
              />
            </div>

            <DetailedTCOTable result={result} />
          </section>
        )}

        {/* Footer */}
        <footer className="pt-16 pb-8 border-t border-border/50 mt-20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <EonLogo className="h-5 w-auto" />
              <span className="font-medium">Truckonomics</span>
              <span className="text-muted-foreground/60">v1.0</span>
            </div>
            <p className="text-center sm:text-right text-muted-foreground/80">
              Alle Berechnungen sind Schätzungen basierend auf den angegebenen Parametern
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
