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
import { Calculator, RotateCcw, Truck } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { TruckParameters, ComparisonResult, TaxIncentiveRegion } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const defaultDieselTruck: TruckParameters = {
  name: "Diesel Semi-Truck",
  type: "diesel",
  purchasePrice: 165000,
  annualMileage: 120000,
  fuelCostPerUnit: 3.8,
  maintenanceCostAnnual: 15000,
  insuranceCostAnnual: 12000,
  expectedLifespanYears: 12,
  fuelEfficiency: 6.5,
};

const defaultElectricTruck1: TruckParameters = {
  name: "Electric Semi-Truck 1",
  type: "electric",
  purchasePrice: 180000,
  annualMileage: 120000,
  fuelCostPerUnit: 0.13,
  maintenanceCostAnnual: 8000,
  insuranceCostAnnual: 11000,
  expectedLifespanYears: 15,
  fuelEfficiency: 170,
};

const defaultElectricTruck2: TruckParameters = {
  name: "Electric Semi-Truck 2",
  type: "electric",
  purchasePrice: 350000,
  annualMileage: 100000,
  fuelCostPerUnit: 0.13,
  maintenanceCostAnnual: 9000,
  insuranceCostAnnual: 12000,
  expectedLifespanYears: 12,
  fuelEfficiency: 180,
};

export default function Home() {
  const [dieselTruck, setDieselTruck] = useState<TruckParameters>(defaultDieselTruck);
  const [electricTruck1, setElectricTruck1] = useState<TruckParameters>(defaultElectricTruck1);
  const [electricTruck2, setElectricTruck2] = useState<TruckParameters>(defaultElectricTruck2);
  const [timeframeYears, setTimeframeYears] = useState(10);
  const [taxIncentiveRegion, setTaxIncentiveRegion] = useState<TaxIncentiveRegion>("federal");
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
        title: "Calculation Complete",
        description: "Total cost of ownership analysis has been generated.",
      });
      
      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    },
    onError: () => {
      toast({
        title: "Calculation Failed",
        description: "Please check your inputs and try again.",
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
    setTaxIncentiveRegion("federal");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-card-border backdrop-blur-lg bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight" data-testid="text-app-title">
                Heavy-Duty Truck TCO
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Compare Class 8 diesel vs electric semi-trucks
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Input Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
              Truck Specifications
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Configure your Class 8 heavy-duty trucks for comparison
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TruckParametersCard
              truck={dieselTruck}
              onChange={setDieselTruck}
              truckIndex={0}
            />
            <TruckParametersCard
              truck={electricTruck1}
              onChange={setElectricTruck1}
              truckIndex={1}
            />
            <TruckParametersCard
              truck={electricTruck2}
              onChange={setElectricTruck2}
              truckIndex={2}
            />
          </div>
        </section>

        {/* Calculation Controls */}
        <section className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-card-border rounded-md p-6 space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Analysis Timeframe</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select the period for total cost of ownership analysis
                </p>
                <TimeframeSelector
                  value={timeframeYears}
                  onChange={setTimeframeYears}
                />
              </div>
            </div>

            <TaxIncentiveSelector
              value={taxIncentiveRegion}
              onChange={setTaxIncentiveRegion}
            />
          </div>

          <div className="bg-card border border-card-border rounded-md p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleCalculate}
                disabled={calculateMutation.isPending}
                size="lg"
                className="flex-1 min-h-12"
                data-testid="button-calculate"
              >
                <Calculator className="mr-2 h-5 w-5" />
                {calculateMutation.isPending ? "Calculating..." : "Calculate TCO"}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                className="sm:w-auto min-h-12"
                data-testid="button-reset"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Reset
              </Button>
            </div>
          </div>
        </section>

        {/* Results Section */}
        {result && (
          <section id="results-section" className="space-y-8 scroll-mt-20">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
                Analysis Results
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Comprehensive cost comparison over {result.timeframeYears} years
              </p>
            </div>

            <SummaryMetrics result={result} />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <AmortizationChart result={result} />
              <CostBreakdownChart result={result} />
            </div>

            <EnvironmentalImpactCard result={result} />

            <DetailedTCOTable result={result} />
          </section>
        )}

        {/* Footer */}
        <footer className="pt-12 pb-6 border-t border-border mt-16">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>Truck TCO Calculator v1.0</p>
            <p className="text-center sm:text-right">
              All calculations are estimates based on provided parameters
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
