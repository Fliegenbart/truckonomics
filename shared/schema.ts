import { z } from "zod";
import { pgTable, serial, integer, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

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

// Regional tax incentives and rebates
export const taxIncentiveRegions = ["federal", "california", "texas", "new-york", "florida", "none"] as const;
export type TaxIncentiveRegion = typeof taxIncentiveRegions[number];

// Comparison request schema
export const comparisonRequestSchema = z.object({
  dieselTruck: truckParametersSchema,
  electricTruck1: truckParametersSchema,
  electricTruck2: truckParametersSchema,
  timeframeYears: z.number().min(1).max(30),
  taxIncentiveRegion: z.enum(taxIncentiveRegions).optional().default("federal"),
});

export type ComparisonRequest = z.infer<typeof comparisonRequestSchema>;

// Year-by-year cost breakdown
export const yearCostBreakdownSchema = z.object({
  year: z.number(),
  purchaseCost: z.number(),
  fuelCost: z.number(),
  maintenanceCost: z.number(),
  insuranceCost: z.number(),
  depreciationCost: z.number(),
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
  environmentalImpact: z.object({
    totalCO2Emissions: z.number(), // Total CO2 in pounds over timeframe
    totalFuelConsumed: z.number(), // Gallons for diesel, kWh for electric
    fuelUnit: z.enum(["gallons", "kWh"]),
  }),
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
  environmentalComparison: z.object({
    bestElectricCO2Saved: z.number(), // Total CO2 saved by best electric option vs diesel
    bestElectricName: z.string(),
  }),
});

export type ComparisonResult = z.infer<typeof comparisonResultSchema>;

// Regional incentive data
export interface RegionalIncentive {
  region: string;
  federalCredit: number;
  stateCredit: number;
  totalIncentive: number;
  description: string;
}

export const regionalIncentives: Record<TaxIncentiveRegion, RegionalIncentive> = {
  "federal": {
    region: "Federal Only",
    federalCredit: 7500,
    stateCredit: 0,
    totalIncentive: 7500,
    description: "Federal Clean Vehicle Credit (up to $7,500 for new EVs meeting requirements)",
  },
  "california": {
    region: "California",
    federalCredit: 7500,
    stateCredit: 2000,
    totalIncentive: 9500,
    description: "Federal credit + CA Clean Vehicle Rebate Project (CVRP)",
  },
  "texas": {
    region: "Texas",
    federalCredit: 7500,
    stateCredit: 2500,
    totalIncentive: 10000,
    description: "Federal credit + TX Light-Duty Motor Vehicle Purchase or Lease Incentive",
  },
  "new-york": {
    region: "New York",
    federalCredit: 7500,
    stateCredit: 2000,
    totalIncentive: 9500,
    description: "Federal credit + NY Drive Clean Rebate",
  },
  "florida": {
    region: "Florida",
    federalCredit: 7500,
    stateCredit: 0,
    totalIncentive: 7500,
    description: "Federal credit only (no state-level EV incentives)",
  },
  "none": {
    region: "No Incentives",
    federalCredit: 0,
    stateCredit: 0,
    totalIncentive: 0,
    description: "Calculate without tax incentives",
  },
};

// Preset truck models
export const presetTruckModels: Record<string, TruckParameters> = {
  "ford-f150-diesel": {
    name: "Ford F-150 PowerStroke Diesel",
    type: "diesel",
    purchasePrice: 68000,
    annualMileage: 25000,
    fuelCostPerUnit: 4.5,
    maintenanceCostAnnual: 7500,
    insuranceCostAnnual: 3200,
    expectedLifespanYears: 12,
    fuelEfficiency: 24, // Combined MPG
  },
  "ram-2500-diesel": {
    name: "RAM 2500 Cummins Diesel",
    type: "diesel",
    purchasePrice: 75000,
    annualMileage: 30000,
    fuelCostPerUnit: 4.5,
    maintenanceCostAnnual: 8500,
    insuranceCostAnnual: 3800,
    expectedLifespanYears: 15,
    fuelEfficiency: 20, // Combined MPG
  },
  "chevy-silverado-diesel": {
    name: "Chevy Silverado 3500HD Duramax",
    type: "diesel",
    purchasePrice: 85000,
    annualMileage: 25000,
    fuelCostPerUnit: 4.5,
    maintenanceCostAnnual: 8000,
    insuranceCostAnnual: 3500,
    expectedLifespanYears: 10,
    fuelEfficiency: 18, // Combined MPG
  },
  "ford-f150-lightning": {
    name: "Ford F-150 Lightning",
    type: "electric",
    purchasePrice: 62000,
    annualMileage: 25000,
    fuelCostPerUnit: 0.13,
    maintenanceCostAnnual: 2800,
    insuranceCostAnnual: 2900,
    expectedLifespanYears: 12,
    fuelEfficiency: 49, // kWh per 100 miles (EPA: 70 MPGe combined)
  },
  "rivian-r1t": {
    name: "Rivian R1T",
    type: "electric",
    purchasePrice: 73000,
    annualMileage: 25000,
    fuelCostPerUnit: 0.13,
    maintenanceCostAnnual: 2500,
    insuranceCostAnnual: 3200,
    expectedLifespanYears: 12,
    fuelEfficiency: 51, // kWh per 100 miles (EPA: dual motor)
  },
  "tesla-cybertruck": {
    name: "Tesla Cybertruck",
    type: "electric",
    purchasePrice: 80000,
    annualMileage: 25000,
    fuelCostPerUnit: 0.13,
    maintenanceCostAnnual: 2200,
    insuranceCostAnnual: 3500,
    expectedLifespanYears: 15,
    fuelEfficiency: 56, // kWh per 100 miles (dual motor AWD)
  },
  "chevy-silverado-ev": {
    name: "Chevy Silverado EV",
    type: "electric",
    purchasePrice: 96000,
    annualMileage: 25000,
    fuelCostPerUnit: 0.13,
    maintenanceCostAnnual: 3000,
    insuranceCostAnnual: 3300,
    expectedLifespanYears: 12,
    fuelEfficiency: 60, // kWh per 100 miles (RST trim)
  },
  "gmc-hummer-ev": {
    name: "GMC Hummer EV Pickup",
    type: "electric",
    purchasePrice: 110000,
    annualMileage: 20000,
    fuelCostPerUnit: 0.13,
    maintenanceCostAnnual: 3500,
    insuranceCostAnnual: 4200,
    expectedLifespanYears: 12,
    fuelEfficiency: 70, // kWh per 100 miles (heavier vehicle, EPA data)
  },
};

// Database table: Saved scenarios
export const scenarios = pgTable("scenarios", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  dieselTruck: jsonb("diesel_truck").notNull().$type<TruckParameters>(),
  electricTruck1: jsonb("electric_truck_1").notNull().$type<TruckParameters>(),
  electricTruck2: jsonb("electric_truck_2").notNull().$type<TruckParameters>(),
  timeframeYears: integer("timeframe_years").notNull(),
  taxIncentiveRegion: text("tax_incentive_region").notNull().$type<TaxIncentiveRegion>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert and select schemas for scenarios
export const insertScenarioSchema = createInsertSchema(scenarios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type Scenario = typeof scenarios.$inferSelect;
