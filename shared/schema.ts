import { z } from "zod";

// Truck parameters schema
export const truckParametersSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["diesel", "electric"]),
  purchasePrice: z.number().min(0, "Purchase price must be positive"),
  annualMileage: z.number().min(0, "Annual mileage must be positive"),
  fuelCostPerUnit: z.number().min(0, "Fuel/electricity cost must be positive"),
  maintenanceCostAnnual: z.number().min(0, "Maintenance cost must be positive"),
  insuranceCostAnnual: z.number().min(0, "Insurance cost must be positive"),
  expectedLifespanYears: z.number().min(1).max(30, "Lifespan must be between 1 and 30 years"),
  fuelEfficiency: z.number().min(0, "Fuel efficiency must be positive"), // MPG for diesel, kWh/100mi for electric
});

export type TruckParameters = z.infer<typeof truckParametersSchema>;

// Comparison request schema
export const comparisonRequestSchema = z.object({
  dieselTruck: truckParametersSchema,
  electricTruck1: truckParametersSchema,
  electricTruck2: truckParametersSchema,
  timeframeYears: z.number().min(1).max(30),
});

export type ComparisonRequest = z.infer<typeof comparisonRequestSchema>;

// Year-by-year cost breakdown
export const yearCostBreakdownSchema = z.object({
  year: z.number(),
  purchaseCost: z.number(),
  fuelCost: z.number(),
  maintenanceCost: z.number(),
  insuranceCost: z.number(),
  totalCost: z.number(),
  cumulativeCost: z.number(),
});

export type YearCostBreakdown = z.infer<typeof yearCostBreakdownSchema>;

// Truck analysis result
export const truckAnalysisSchema = z.object({
  name: z.string(),
  type: z.enum(["diesel", "electric"]),
  totalCostOfOwnership: z.number(),
  yearlyBreakdown: z.array(yearCostBreakdownSchema),
  totalFuelCost: z.number(),
  totalMaintenanceCost: z.number(),
  totalInsuranceCost: z.number(),
  depreciation: z.number(),
});

export type TruckAnalysis = z.infer<typeof truckAnalysisSchema>;

// Break-even analysis
export const breakEvenAnalysisSchema = z.object({
  truck1Name: z.string(),
  truck2Name: z.string(),
  breakEvenYear: z.number().nullable(),
  breakEvenMonth: z.number().nullable(),
  totalSavings: z.number(),
});

export type BreakEvenAnalysis = z.infer<typeof breakEvenAnalysisSchema>;

// Complete comparison result
export const comparisonResultSchema = z.object({
  dieselAnalysis: truckAnalysisSchema,
  electric1Analysis: truckAnalysisSchema,
  electric2Analysis: truckAnalysisSchema,
  dieselVsElectric1: breakEvenAnalysisSchema,
  dieselVsElectric2: breakEvenAnalysisSchema,
  bestElectricOption: z.enum(["electric1", "electric2"]),
  maxSavings: z.number(),
  timeframeYears: z.number(),
});

export type ComparisonResult = z.infer<typeof comparisonResultSchema>;
