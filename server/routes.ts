import type { Express } from "express";
import { createServer, type Server } from "http";
import { comparisonRequestSchema, type ComparisonResult, type TruckAnalysis, type YearCostBreakdown } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.post("/api/calculate-tco", async (req, res) => {
    try {
      const data = comparisonRequestSchema.parse(req.body);
      
      const { dieselTruck, electricTruck1, electricTruck2, timeframeYears } = data;

      // Calculate TCO for each truck
      const dieselAnalysis = calculateTruckAnalysis(dieselTruck, timeframeYears);
      const electric1Analysis = calculateTruckAnalysis(electricTruck1, timeframeYears);
      const electric2Analysis = calculateTruckAnalysis(electricTruck2, timeframeYears);

      // Calculate break-even points
      const dieselVsElectric1 = calculateBreakEven(
        dieselAnalysis,
        electric1Analysis,
        timeframeYears
      );

      const dieselVsElectric2 = calculateBreakEven(
        dieselAnalysis,
        electric2Analysis,
        timeframeYears
      );

      // Determine best electric option
      const bestElectricOption = electric1Analysis.totalCostOfOwnership < electric2Analysis.totalCostOfOwnership
        ? "electric1" as const
        : "electric2" as const;

      const bestElectricTCO = bestElectricOption === "electric1" 
        ? electric1Analysis.totalCostOfOwnership 
        : electric2Analysis.totalCostOfOwnership;

      const maxSavings = dieselAnalysis.totalCostOfOwnership - bestElectricTCO;

      // Calculate environmental comparison
      const bestElectricAnalysis = bestElectricOption === "electric1" 
        ? electric1Analysis 
        : electric2Analysis;
      
      const bestElectricCO2Saved = dieselAnalysis.environmentalImpact.totalCO2Emissions - 
        bestElectricAnalysis.environmentalImpact.totalCO2Emissions;

      const result: ComparisonResult = {
        dieselAnalysis,
        electric1Analysis,
        electric2Analysis,
        dieselVsElectric1,
        dieselVsElectric2,
        bestElectricOption,
        maxSavings,
        timeframeYears,
        environmentalComparison: {
          bestElectricCO2Saved,
          bestElectricName: bestElectricAnalysis.name,
        },
      };

      res.json(result);
    } catch (error) {
      console.error("TCO calculation error:", error);
      res.status(400).json({ error: "Invalid request data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function calculateTruckAnalysis(
  truck: typeof import("@shared/schema").truckParametersSchema._type,
  timeframeYears: number
): TruckAnalysis {
  const yearlyBreakdown: YearCostBreakdown[] = [];
  let cumulativeCost = 0;

  // Calculate depreciation based on expected lifespan
  // Assume 20% residual value after expected lifespan
  const totalDepreciation = truck.purchasePrice * 0.8;
  const annualDepreciation = totalDepreciation / truck.expectedLifespanYears;

  for (let year = 1; year <= timeframeYears; year++) {
    // Purchase cost only in year 1
    const purchaseCost = year === 1 ? truck.purchasePrice : 0;

    // Calculate fuel cost based on type
    let fuelCost: number;
    if (truck.type === "diesel") {
      // Diesel: annualMileage / MPG * pricePerGallon
      const gallonsPerYear = truck.annualMileage / truck.fuelEfficiency;
      fuelCost = gallonsPerYear * truck.fuelCostPerUnit;
    } else {
      // Electric: (annualMileage / 100) * kWh per 100 miles * price per kWh
      const kWhPerYear = (truck.annualMileage / 100) * truck.fuelEfficiency;
      fuelCost = kWhPerYear * truck.fuelCostPerUnit;
    }

    const maintenanceCost = truck.maintenanceCostAnnual;
    const insuranceCost = truck.insuranceCostAnnual;
    
    // Include annual depreciation cost in each year's total
    // Only apply depreciation up to the expected lifespan
    const depreciationCost = year <= truck.expectedLifespanYears ? annualDepreciation : 0;

    const totalCost = purchaseCost + fuelCost + maintenanceCost + insuranceCost + depreciationCost;
    cumulativeCost += totalCost;

    yearlyBreakdown.push({
      year,
      purchaseCost,
      fuelCost,
      maintenanceCost,
      insuranceCost,
      depreciationCost,
      totalCost,
      cumulativeCost,
    });
  }

  const totalFuelCost = yearlyBreakdown.reduce((sum, year) => sum + year.fuelCost, 0);
  const totalMaintenanceCost = yearlyBreakdown.reduce((sum, year) => sum + year.maintenanceCost, 0);
  const totalInsuranceCost = yearlyBreakdown.reduce((sum, year) => sum + year.insuranceCost, 0);

  // Calculate total depreciation from yearly breakdown
  const depreciation = yearlyBreakdown.reduce((sum, year) => sum + year.depreciationCost, 0);

  // Total cost of ownership is the final cumulative cost (which now includes depreciation)
  const totalCostOfOwnership = cumulativeCost;

  // Calculate environmental impact
  let totalFuelConsumed: number;
  let totalCO2Emissions: number;
  let fuelUnit: "gallons" | "kWh";

  if (truck.type === "diesel") {
    // Diesel: gallons consumed and CO2 emissions
    totalFuelConsumed = (truck.annualMileage / truck.fuelEfficiency) * timeframeYears;
    // Diesel emits approximately 22 lbs of CO2 per gallon burned
    totalCO2Emissions = totalFuelConsumed * 22;
    fuelUnit = "gallons";
  } else {
    // Electric: kWh consumed and CO2 emissions from grid
    totalFuelConsumed = ((truck.annualMileage / 100) * truck.fuelEfficiency) * timeframeYears;
    // US grid average: approximately 0.85 lbs CO2 per kWh (varies by region)
    totalCO2Emissions = totalFuelConsumed * 0.85;
    fuelUnit = "kWh";
  }

  return {
    name: truck.name,
    type: truck.type,
    totalCostOfOwnership,
    yearlyBreakdown,
    totalFuelCost,
    totalMaintenanceCost,
    totalInsuranceCost,
    depreciation,
    environmentalImpact: {
      totalCO2Emissions,
      totalFuelConsumed,
      fuelUnit,
    },
  };
}

function calculateBreakEven(
  truck1: TruckAnalysis,
  truck2: TruckAnalysis,
  timeframeYears: number
) {
  let breakEvenYear: number | null = null;
  let breakEvenMonth: number | null = null;

  // Check each year to find crossover point
  for (let i = 0; i < truck1.yearlyBreakdown.length; i++) {
    const year1Cumulative = truck1.yearlyBreakdown[i].cumulativeCost;
    const year2Cumulative = truck2.yearlyBreakdown[i].cumulativeCost;

    if (i === 0) {
      // Check if truck2 is already cheaper from the start
      if (year2Cumulative < year1Cumulative) {
        breakEvenYear = 0;
        breakEvenMonth = 0;
        break;
      }
    } else {
      const prevYear1Cumulative = truck1.yearlyBreakdown[i - 1].cumulativeCost;
      const prevYear2Cumulative = truck2.yearlyBreakdown[i - 1].cumulativeCost;

      // Check if crossover happened between previous year and this year
      if (
        prevYear2Cumulative > prevYear1Cumulative &&
        year2Cumulative <= year1Cumulative
      ) {
        // Linear interpolation to find approximate month
        const year1AnnualCost = year1Cumulative - prevYear1Cumulative;
        const year2AnnualCost = year2Cumulative - prevYear2Cumulative;
        const costDiff = prevYear2Cumulative - prevYear1Cumulative;
        const annualDiffChange = year1AnnualCost - year2AnnualCost;

        if (annualDiffChange > 0) {
          const monthsIntoYear = (costDiff / annualDiffChange) * 12;
          breakEvenYear = i;
          breakEvenMonth = Math.round(monthsIntoYear);
        } else {
          breakEvenYear = i;
          breakEvenMonth = null;
        }
        break;
      }
    }
  }

  const totalSavings = truck1.totalCostOfOwnership - truck2.totalCostOfOwnership;

  return {
    truck1Name: truck1.name,
    truck2Name: truck2.name,
    breakEvenYear,
    breakEvenMonth,
    totalSavings,
  };
}
