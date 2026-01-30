import type { Express } from "express";
import { createServer, type Server } from "http";
import {
  comparisonRequestSchema,
  type ComparisonResult,
  type TruckAnalysis,
  type YearCostBreakdown,
  type OperationProfile,
  regionalIncentives,
  insertScenarioSchema,
} from "@shared/schema";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.post("/api/calculate-tco", async (req, res) => {
    try {
      const data = comparisonRequestSchema.parse(req.body);
      
      const { dieselTruck, electricTruck1, electricTruck2, timeframeYears, taxIncentiveRegion, operationProfile } = data;

      const incentiveAmount = regionalIncentives[taxIncentiveRegion || "bundesfoerderung"].totalIncentive;

      // Calculate TCO for each truck (apply incentives to electric trucks)
      const dieselAnalysis = calculateTruckAnalysis(dieselTruck, timeframeYears, 0, operationProfile);
      const electric1Analysis = calculateTruckAnalysis(electricTruck1, timeframeYears, incentiveAmount, operationProfile);
      const electric2Analysis = calculateTruckAnalysis(electricTruck2, timeframeYears, incentiveAmount, operationProfile);

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

  // Scenario management routes
  
  // Get all saved scenarios
  app.get("/api/scenarios", async (_req, res) => {
    try {
      const scenarios = await storage.getAllScenarios();
      res.json(scenarios);
    } catch (error) {
      console.error("Error fetching scenarios:", error);
      res.status(500).json({ error: "Failed to fetch scenarios" });
    }
  });

  // Get a specific scenario
  app.get("/api/scenarios/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid scenario ID" });
      }
      
      const scenario = await storage.getScenario(id);
      if (!scenario) {
        return res.status(404).json({ error: "Scenario not found" });
      }
      
      res.json(scenario);
    } catch (error) {
      console.error("Error fetching scenario:", error);
      res.status(500).json({ error: "Failed to fetch scenario" });
    }
  });

  // Create a new scenario
  app.post("/api/scenarios", async (req, res) => {
    try {
      const data = insertScenarioSchema.parse(req.body);
      const scenario = await storage.createScenario(data);
      res.status(201).json(scenario);
    } catch (error) {
      console.error("Error creating scenario:", error);
      res.status(400).json({ error: "Invalid scenario data" });
    }
  });

  // Update a scenario
  app.patch("/api/scenarios/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid scenario ID" });
      }
      
      const data = insertScenarioSchema.partial().parse(req.body);
      const scenario = await storage.updateScenario(id, data);
      
      if (!scenario) {
        return res.status(404).json({ error: "Scenario not found" });
      }
      
      res.json(scenario);
    } catch (error) {
      console.error("Error updating scenario:", error);
      res.status(400).json({ error: "Invalid scenario data" });
    }
  });

  // Delete a scenario
  app.delete("/api/scenarios/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid scenario ID" });
      }
      
      const success = await storage.deleteScenario(id);
      
      if (!success) {
        return res.status(404).json({ error: "Scenario not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting scenario:", error);
      res.status(500).json({ error: "Failed to delete scenario" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function calculateTruckAnalysis(
  truck: typeof import("@shared/schema").truckParametersSchema._type,
  timeframeYears: number,
  taxIncentive: number = 0,
  operationProfile?: OperationProfile
): TruckAnalysis {
  const profile: OperationProfile = {
    dailyKm: 0,
    dailyKmP90: 0,
    stopsPerDay: 0,
    stopMinutes: 0,
    workDaysPerYear: 250,
    opportunityCharging: false,
    opportunityChargeMinutes: 0,
    opportunityChargePowerKw: 150,
    publicChargeShare: 0,
    publicChargeCostPerKwh: 0,
    p90SharePercent: 10,
    downtimeCostPerDay: 0,
    infrastructureCapex: 0,
    infrastructureOpexAnnual: 0,
    infrastructureLifetimeYears: 10,
    ...(operationProfile || {}),
  };

  const yearlyBreakdown: YearCostBreakdown[] = [];
  let cumulativeCost = 0;

  // Effective purchase price after tax incentives (only for electric)
  const effectivePurchasePrice = truck.purchasePrice - taxIncentive;

  // Calculate depreciation based on expected lifespan
  // Assume 20% residual value after expected lifespan (based on original price, not after incentives)
  const totalDepreciation = truck.purchasePrice * 0.8;
  const annualDepreciation = totalDepreciation / truck.expectedLifespanYears;

  const isElectric = truck.type === "electric";
  const publicShare = Math.min(Math.max(profile.publicChargeShare, 0), 100) / 100;
  const effectiveFuelCostPerUnit = isElectric && publicShare > 0
    ? truck.fuelCostPerUnit * (1 - publicShare) + profile.publicChargeCostPerKwh * publicShare
    : truck.fuelCostPerUnit;

  const infrastructureAnnualCost = isElectric
    ? profile.infrastructureCapex / Math.max(1, profile.infrastructureLifetimeYears) + profile.infrastructureOpexAnnual
    : 0;

  const estimateBaseRangeKm = () => {
    if (!isElectric) return null;
    const tech = truck.technicalSpecs;
    if (tech?.reichweite) return tech.reichweite;
    if (tech?.batterieKapazitaet) {
      return (tech.batterieKapazitaet * 100) / Math.max(1, truck.fuelEfficiency);
    }
    return null;
  };

  const baseRangeKm = estimateBaseRangeKm();
  const opportunityChargeKm =
    isElectric && profile.opportunityCharging && profile.opportunityChargeMinutes > 0 && profile.opportunityChargePowerKw > 0
      ? ((profile.opportunityChargeMinutes / 60) * profile.opportunityChargePowerKw * 0.9 * 100) /
        Math.max(1, truck.fuelEfficiency)
      : 0;
  const effectiveRangeKm = baseRangeKm !== null ? baseRangeKm + opportunityChargeKm : null;

  const p90Share = Math.min(Math.max(profile.p90SharePercent, 0), 100) / 100;
  const p90Days = Math.round(profile.workDaysPerYear * p90Share);
  const dailyP90Km = profile.dailyKmP90 || 0;
  const downtimeRiskFactor =
    isElectric && effectiveRangeKm !== null && dailyP90Km > effectiveRangeKm
      ? Math.min(1, (dailyP90Km - effectiveRangeKm) / Math.max(1, dailyP90Km))
      : 0;
  const downtimeAnnualCost =
    isElectric && profile.downtimeCostPerDay > 0 ? profile.downtimeCostPerDay * p90Days * downtimeRiskFactor : 0;

  for (let year = 1; year <= timeframeYears; year++) {
    // Purchase cost only in year 1 (after tax incentives)
    const purchaseCost = year === 1 ? effectivePurchasePrice : 0;

    let fuelCost: number;
    if (truck.type === "diesel") {
      const litersPerYear = (truck.annualMileage / 100) * truck.fuelEfficiency;
      fuelCost = litersPerYear * effectiveFuelCostPerUnit;
    } else {
      const kWhPerYear = (truck.annualMileage / 100) * truck.fuelEfficiency;
      fuelCost = kWhPerYear * effectiveFuelCostPerUnit;
    }

    const maintenanceCost = truck.maintenanceCostAnnual;
    const insuranceCost = truck.insuranceCostAnnual;
    
    // Include annual depreciation cost in each year's total
    // Only apply depreciation up to the expected lifespan
    const depreciationCost = year <= truck.expectedLifespanYears ? annualDepreciation : 0;

    const infrastructureCost = isElectric
      ? year <= profile.infrastructureLifetimeYears
        ? infrastructureAnnualCost
        : 0
      : 0;
    const downtimeCost = isElectric ? downtimeAnnualCost : 0;

    const totalCost =
      purchaseCost +
      fuelCost +
      maintenanceCost +
      insuranceCost +
      depreciationCost +
      infrastructureCost +
      downtimeCost;
    cumulativeCost += totalCost;

    yearlyBreakdown.push({
      year,
      purchaseCost,
      fuelCost,
      maintenanceCost,
      insuranceCost,
      depreciationCost,
      infrastructureCost,
      downtimeCost,
      totalCost,
      cumulativeCost,
    });
  }

  const totalFuelCost = yearlyBreakdown.reduce((sum, year) => sum + year.fuelCost, 0);
  const totalMaintenanceCost = yearlyBreakdown.reduce((sum, year) => sum + year.maintenanceCost, 0);
  const totalInsuranceCost = yearlyBreakdown.reduce((sum, year) => sum + year.insuranceCost, 0);

  // Calculate total depreciation from yearly breakdown
  const depreciation = yearlyBreakdown.reduce((sum, year) => sum + year.depreciationCost, 0);
  const totalInfrastructureCost = yearlyBreakdown.reduce((sum, year) => sum + year.infrastructureCost, 0);
  const totalDowntimeCost = yearlyBreakdown.reduce((sum, year) => sum + year.downtimeCost, 0);

  // Total cost of ownership is the final cumulative cost (which now includes depreciation)
  const totalCostOfOwnership = cumulativeCost;

  let totalFuelConsumed: number;
  let totalCO2Emissions: number;
  let fuelUnit: "liters" | "kWh";

  if (truck.type === "diesel") {
    totalFuelConsumed = ((truck.annualMileage / 100) * truck.fuelEfficiency) * timeframeYears;
    totalCO2Emissions = totalFuelConsumed * 2.64;
    fuelUnit = "liters";
  } else {
    totalFuelConsumed = ((truck.annualMileage / 100) * truck.fuelEfficiency) * timeframeYears;
    totalCO2Emissions = totalFuelConsumed * 0.38;
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
    totalInfrastructureCost,
    totalDowntimeCost,
    environmentalImpact: {
      totalCO2Emissions,
      totalFuelConsumed,
      fuelUnit,
    },
    technicalSpecs: truck.technicalSpecs,
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
