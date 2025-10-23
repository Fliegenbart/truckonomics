import { useState } from "react";
import { TruckParametersCard } from "@/components/truck-parameters-card";
import { TimeframeSelector } from "@/components/timeframe-selector";
import { Button } from "@/components/ui/button";
import { SummaryMetrics } from "@/components/summary-metrics";
import { AmortizationChart } from "@/components/amortization-chart";
import { CostBreakdownChart } from "@/components/cost-breakdown-chart";
import { DetailedTCOTable } from "@/components/detailed-tco-table";
import { Calculator, RotateCcw } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { TruckParameters, ComparisonResult } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const defaultDieselTruck: TruckParameters = {
  name: "Diesel Truck",
  type: "diesel",
  purchasePrice: 85000,
  annualMileage: 25000,
  fuelCostPerUnit: 4.5,
  maintenanceCostAnnual: 8000,
  insuranceCostAnnual: 3500,
  expectedLifespanYears: 10,
  fuelEfficiency: 8,
};

const defaultElectricTruck1: TruckParameters = {
  name: "Electric Truck Model 1",
  type: "electric",
  purchasePrice: 125000,
  annualMileage: 25000,
  fuelCostPerUnit: 0.13,
  maintenanceCostAnnual: 3500,
  insuranceCostAnnual: 3000,
  expectedLifespanYears: 10,
  fuelEfficiency: 2.5,
};

const defaultElectricTruck2: TruckParameters = {
  name: "Electric Truck Model 2",
  type: "electric",
  purchasePrice: 140000,
  annualMileage: 25000,
  fuelCostPerUnit: 0.13,
  maintenanceCostAnnual: 3000,
  insuranceCostAnnual: 2800,
  expectedLifespanYears: 10,
  fuelEfficiency: 2.2,
};

export default function Home() {
  const [dieselTruck, setDieselTruck] = useState<TruckParameters>(defaultDieselTruck);
  const [electricTruck1, setElectricTruck1] = useState<TruckParameters>(defaultElectricTruck1);
  const [electricTruck2, setElectricTruck2] = useState<TruckParameters>(defaultElectricTruck2);
  const [timeframeYears, setTimeframeYears] = useState(10);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const { toast } = useToast();

  const calculateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/calculate-tco", {
        dieselTruck,
        electricTruck1,
        electricTruck2,
        timeframeYears,
      });
      return response as ComparisonResult;
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
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-card-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight" data-testid="text-app-title">
            Truck TCO Calculator
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Input Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
              Vehicle Parameters
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Enter the specifications and costs for each truck to compare
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
          <div className="bg-card border border-card-border rounded-md p-6 space-y-6">
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
