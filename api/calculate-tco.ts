import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z, ZodError } from 'zod';
import type { ComparisonResult, TruckAnalysis, YearCostBreakdown } from '../shared/schema';

const technicalSpecsSchema = z.object({
  zulaessigesGesamtgewicht: z.number().min(0).optional(),
  zugGesamtgewicht: z.number().min(0).optional(),
  achskonfiguration: z.enum(["4x2", "6x2", "6x4", "8x4"]).optional(),
  nutzlast: z.number().min(0).optional(),
  leistungKW: z.number().min(0).optional(),
  leistungPS: z.number().min(0).optional(),
  drehmoment: z.number().min(0).optional(),
  batterieKapazitaet: z.number().min(0).optional(),
  tankKapazitaet: z.number().min(0).optional(),
  reichweite: z.number().min(0).optional(),
  ladeLeistungAC: z.number().min(0).optional(),
  ladeLeistungDC: z.number().min(0).optional(),
  fahrerhaus: z.enum(["Fernverkehr", "Verteiler", "Nahverkehr", "Kipper"]).optional(),
  laenge: z.number().min(0).optional(),
  hoehe: z.number().min(0).optional(),
});

const truckParametersSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  type: z.enum(["diesel", "electric"]),
  purchasePrice: z.number().min(0, "Kaufpreis muss positiv sein"),
  annualMileage: z.number().min(0, "Jahreskilometer muss positiv sein"),
  fuelCostPerUnit: z.number().min(0, "Kraftstoff-/Stromkosten müssen positiv sein"),
  maintenanceCostAnnual: z.number().min(0, "Wartungskosten müssen positiv sein"),
  insuranceCostAnnual: z.number().min(0, "Versicherungskosten müssen positiv sein"),
  expectedLifespanYears: z.number().min(1).max(30, "Lebensdauer muss zwischen 1 und 30 Jahren liegen"),
  fuelEfficiency: z.number().min(0, "Kraftstoffeffizienz muss positiv sein"),
  technicalSpecs: technicalSpecsSchema.optional(),
});

const taxIncentiveRegions = ["bundesfoerderung", "bayern", "baden-wuerttemberg", "nordrhein-westfalen", "niedersachsen", "keine"] as const;
const comparisonRequestSchema = z.object({
  dieselTruck: truckParametersSchema,
  electricTruck1: truckParametersSchema,
  electricTruck2: truckParametersSchema,
  timeframeYears: z.number().min(1).max(30),
  taxIncentiveRegion: z.enum(taxIncentiveRegions).optional().default("bundesfoerderung"),
});

const regionalIncentives = {
  "bundesfoerderung": {
    region: "Nur Bundesförderung",
    federalCredit: 80000,
    stateCredit: 0,
    totalIncentive: 80000,
    description: "KsNI-Förderung für klimaschonende Nutzfahrzeuge (bis zu 80% der Mehrkosten)",
  },
  "bayern": {
    region: "Bayern",
    federalCredit: 80000,
    stateCredit: 10000,
    totalIncentive: 90000,
    description: "Bundesförderung + Bayerische Förderung für E-Nutzfahrzeuge",
  },
  "baden-wuerttemberg": {
    region: "Baden-Württemberg",
    federalCredit: 80000,
    stateCredit: 15000,
    totalIncentive: 95000,
    description: "Bundesförderung + BW-e-Gutschein für E-Nutzfahrzeuge",
  },
  "nordrhein-westfalen": {
    region: "Nordrhein-Westfalen",
    federalCredit: 80000,
    stateCredit: 8000,
    totalIncentive: 88000,
    description: "Bundesförderung + NRW progres.nrw Emissionsarme Mobilität",
  },
  "niedersachsen": {
    region: "Niedersachsen",
    federalCredit: 80000,
    stateCredit: 5000,
    totalIncentive: 85000,
    description: "Bundesförderung + Niedersächsische Klimaschutzförderung",
  },
  "keine": {
    region: "Keine Förderung",
    federalCredit: 0,
    stateCredit: 0,
    totalIncentive: 0,
    description: "Berechnung ohne Förderungen",
  },
} as const;

function parseRequestBody(req: VercelRequest) {
  const body = req.body;
  if (body === undefined || body === null) {
    return body;
  }

  if (typeof body === 'string') {
    return JSON.parse(body);
  }

  if (Buffer.isBuffer(body)) {
    return JSON.parse(body.toString('utf-8'));
  }

  return body;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let parsedBody: unknown;
    try {
      parsedBody = parseRequestBody(req);
    } catch (parseError) {
      console.error("Invalid JSON payload:", parseError);
      return res.status(400).json({ error: "Invalid JSON payload" });
    }

    const data = comparisonRequestSchema.parse(parsedBody);

    const { dieselTruck, electricTruck1, electricTruck2, timeframeYears, taxIncentiveRegion } = data;

    const incentiveAmount = regionalIncentives[taxIncentiveRegion || "bundesfoerderung"].totalIncentive;

    // Calculate TCO for each truck (apply incentives to electric trucks)
    const dieselAnalysis = calculateTruckAnalysis(dieselTruck, timeframeYears, 0);
    const electric1Analysis = calculateTruckAnalysis(electricTruck1, timeframeYears, incentiveAmount);
    const electric2Analysis = calculateTruckAnalysis(electricTruck2, timeframeYears, incentiveAmount);

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
    if (error instanceof ZodError) {
      console.error("TCO validation error:", error.issues);
      return res.status(400).json({ error: "Invalid request data" });
    }

    console.error("TCO calculation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

function calculateTruckAnalysis(
  truck: any,
  timeframeYears: number,
  taxIncentive: number = 0
): TruckAnalysis {
  const yearlyBreakdown: YearCostBreakdown[] = [];
  let cumulativeCost = 0;

  // Effective purchase price after tax incentives (only for electric)
  const effectivePurchasePrice = truck.purchasePrice - taxIncentive;

  // Calculate depreciation based on expected lifespan
  const totalDepreciation = truck.purchasePrice * 0.8;
  const annualDepreciation = totalDepreciation / truck.expectedLifespanYears;

  for (let year = 1; year <= timeframeYears; year++) {
    const purchaseCost = year === 1 ? effectivePurchasePrice : 0;

    let fuelCost: number;
    if (truck.type === "diesel") {
      const litersPerYear = (truck.annualMileage / 100) * truck.fuelEfficiency;
      fuelCost = litersPerYear * truck.fuelCostPerUnit;
    } else {
      const kWhPerYear = (truck.annualMileage / 100) * truck.fuelEfficiency;
      fuelCost = kWhPerYear * truck.fuelCostPerUnit;
    }

    const maintenanceCost = truck.maintenanceCostAnnual;
    const insuranceCost = truck.insuranceCostAnnual;

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
  const depreciation = yearlyBreakdown.reduce((sum, year) => sum + year.depreciationCost, 0);
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

  for (let i = 0; i < truck1.yearlyBreakdown.length; i++) {
    const year1Cumulative = truck1.yearlyBreakdown[i].cumulativeCost;
    const year2Cumulative = truck2.yearlyBreakdown[i].cumulativeCost;

    if (i === 0) {
      if (year2Cumulative < year1Cumulative) {
        breakEvenYear = 0;
        breakEvenMonth = 0;
        break;
      }
    } else {
      const prevYear1Cumulative = truck1.yearlyBreakdown[i - 1].cumulativeCost;
      const prevYear2Cumulative = truck2.yearlyBreakdown[i - 1].cumulativeCost;

      if (
        prevYear2Cumulative > prevYear1Cumulative &&
        year2Cumulative <= year1Cumulative
      ) {
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
