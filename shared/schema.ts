import { z } from "zod";
import { pgTable, serial, integer, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const axleConfigurations = ["4x2", "6x2", "6x4", "8x4"] as const;
export type AxleConfiguration = typeof axleConfigurations[number];

export const cabinTypes = ["Fernverkehr", "Verteiler", "Nahverkehr", "Kipper"] as const;
export type CabinType = typeof cabinTypes[number];

export const technicalSpecsSchema = z.object({
  zulaessigesGesamtgewicht: z.number().min(0).optional(),
  zugGesamtgewicht: z.number().min(0).optional(),
  achskonfiguration: z.enum(axleConfigurations).optional(),
  nutzlast: z.number().min(0).optional(),
  leistungKW: z.number().min(0).optional(),
  leistungPS: z.number().min(0).optional(),
  drehmoment: z.number().min(0).optional(),
  batterieKapazitaet: z.number().min(0).optional(),
  tankKapazitaet: z.number().min(0).optional(),
  reichweite: z.number().min(0).optional(),
  ladeLeistungAC: z.number().min(0).optional(),
  ladeLeistungDC: z.number().min(0).optional(),
  fahrerhaus: z.enum(cabinTypes).optional(),
  laenge: z.number().min(0).optional(),
  hoehe: z.number().min(0).optional(),
});

export type TechnicalSpecs = z.infer<typeof technicalSpecsSchema>;

export const truckParametersSchema = z.object({
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

export type TruckParameters = z.infer<typeof truckParametersSchema>;

export const taxIncentiveRegions = ["bundesfoerderung", "bayern", "baden-wuerttemberg", "nordrhein-westfalen", "niedersachsen", "keine"] as const;
export type TaxIncentiveRegion = typeof taxIncentiveRegions[number];

export const comparisonRequestSchema = z.object({
  dieselTruck: truckParametersSchema,
  electricTruck1: truckParametersSchema,
  electricTruck2: truckParametersSchema,
  timeframeYears: z.number().min(1).max(30),
  taxIncentiveRegion: z.enum(taxIncentiveRegions).optional().default("bundesfoerderung"),
});

export type ComparisonRequest = z.infer<typeof comparisonRequestSchema>;

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
    totalCO2Emissions: z.number(),
    totalFuelConsumed: z.number(),
    fuelUnit: z.enum(["liters", "kWh"]),
  }),
  technicalSpecs: technicalSpecsSchema.optional(),
});

export type TruckAnalysis = z.infer<typeof truckAnalysisSchema>;

export const breakEvenAnalysisSchema = z.object({
  truck1Name: z.string(),
  truck2Name: z.string(),
  breakEvenYear: z.number().nullable(),
  breakEvenMonth: z.number().nullable(),
  totalSavings: z.number(),
});

export type BreakEvenAnalysis = z.infer<typeof breakEvenAnalysisSchema>;

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
    bestElectricCO2Saved: z.number(),
    bestElectricName: z.string(),
  }),
});

export type ComparisonResult = z.infer<typeof comparisonResultSchema>;

export interface RegionalIncentive {
  region: string;
  federalCredit: number;
  stateCredit: number;
  totalIncentive: number;
  description: string;
}

export const regionalIncentives: Record<TaxIncentiveRegion, RegionalIncentive> = {
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
};

export const presetTruckModels: Record<string, TruckParameters> = {
  "mercedes-actros": {
    name: "Mercedes-Benz Actros",
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
  },
  "man-tgx": {
    name: "MAN TGX",
    type: "diesel",
    purchasePrice: 150000,
    annualMileage: 115000,
    fuelCostPerUnit: 1.65,
    maintenanceCostAnnual: 13500,
    insuranceCostAnnual: 10500,
    expectedLifespanYears: 12,
    fuelEfficiency: 33,
    technicalSpecs: {
      zulaessigesGesamtgewicht: 18000,
      zugGesamtgewicht: 40000,
      achskonfiguration: "4x2",
      nutzlast: 25000,
      leistungKW: 340,
      leistungPS: 460,
      drehmoment: 2300,
      tankKapazitaet: 390,
      reichweite: 1150,
      fahrerhaus: "Fernverkehr",
      laenge: 6100,
      hoehe: 3900,
    },
  },
  "scania-r-series": {
    name: "Scania R-Serie",
    type: "diesel",
    purchasePrice: 160000,
    annualMileage: 120000,
    fuelCostPerUnit: 1.65,
    maintenanceCostAnnual: 14500,
    insuranceCostAnnual: 11500,
    expectedLifespanYears: 12,
    fuelEfficiency: 31,
    technicalSpecs: {
      zulaessigesGesamtgewicht: 18000,
      zugGesamtgewicht: 40000,
      achskonfiguration: "4x2",
      nutzlast: 26000,
      leistungKW: 370,
      leistungPS: 500,
      drehmoment: 2550,
      tankKapazitaet: 420,
      reichweite: 1300,
      fahrerhaus: "Fernverkehr",
      laenge: 6300,
      hoehe: 4000,
    },
  },
  "volvo-fh": {
    name: "Volvo FH",
    type: "diesel",
    purchasePrice: 158000,
    annualMileage: 118000,
    fuelCostPerUnit: 1.65,
    maintenanceCostAnnual: 14200,
    insuranceCostAnnual: 11200,
    expectedLifespanYears: 12,
    fuelEfficiency: 32,
    technicalSpecs: {
      zulaessigesGesamtgewicht: 18000,
      zugGesamtgewicht: 40000,
      achskonfiguration: "4x2",
      nutzlast: 25500,
      leistungKW: 355,
      leistungPS: 483,
      drehmoment: 2400,
      tankKapazitaet: 410,
      reichweite: 1250,
      fahrerhaus: "Fernverkehr",
      laenge: 6200,
      hoehe: 3980,
    },
  },
  "daf-xg": {
    name: "DAF XG+",
    type: "diesel",
    purchasePrice: 162000,
    annualMileage: 120000,
    fuelCostPerUnit: 1.65,
    maintenanceCostAnnual: 14000,
    insuranceCostAnnual: 11000,
    expectedLifespanYears: 12,
    fuelEfficiency: 30,
    technicalSpecs: {
      zulaessigesGesamtgewicht: 18000,
      zugGesamtgewicht: 40000,
      achskonfiguration: "4x2",
      nutzlast: 26000,
      leistungKW: 390,
      leistungPS: 530,
      drehmoment: 2600,
      tankKapazitaet: 430,
      reichweite: 1350,
      fahrerhaus: "Fernverkehr",
      laenge: 6400,
      hoehe: 4050,
    },
  },
  "mercedes-eactros": {
    name: "Mercedes-Benz eActros",
    type: "electric",
    purchasePrice: 450000,
    annualMileage: 100000,
    fuelCostPerUnit: 0.35,
    maintenanceCostAnnual: 8000,
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
  },
  "man-etgx": {
    name: "MAN eTGX",
    type: "electric",
    purchasePrice: 420000,
    annualMileage: 100000,
    fuelCostPerUnit: 0.35,
    maintenanceCostAnnual: 7500,
    insuranceCostAnnual: 9500,
    expectedLifespanYears: 15,
    fuelEfficiency: 125,
    technicalSpecs: {
      zulaessigesGesamtgewicht: 27000,
      zugGesamtgewicht: 40000,
      achskonfiguration: "6x2",
      nutzlast: 21500,
      leistungKW: 360,
      leistungPS: 490,
      drehmoment: 1800,
      batterieKapazitaet: 480,
      reichweite: 400,
      ladeLeistungAC: 22,
      ladeLeistungDC: 375,
      fahrerhaus: "Fernverkehr",
      laenge: 6300,
      hoehe: 3900,
    },
  },
  "volvo-fh-electric": {
    name: "Volvo FH Electric",
    type: "electric",
    purchasePrice: 400000,
    annualMileage: 100000,
    fuelCostPerUnit: 0.35,
    maintenanceCostAnnual: 7800,
    insuranceCostAnnual: 9800,
    expectedLifespanYears: 15,
    fuelEfficiency: 118,
    technicalSpecs: {
      zulaessigesGesamtgewicht: 27000,
      zugGesamtgewicht: 44000,
      achskonfiguration: "6x2",
      nutzlast: 22500,
      leistungKW: 490,
      leistungPS: 666,
      drehmoment: 2400,
      batterieKapazitaet: 540,
      reichweite: 450,
      ladeLeistungAC: 43,
      ladeLeistungDC: 250,
      fahrerhaus: "Fernverkehr",
      laenge: 6350,
      hoehe: 3970,
    },
  },
  "daf-xf-electric": {
    name: "DAF XF Electric",
    type: "electric",
    purchasePrice: 380000,
    annualMileage: 95000,
    fuelCostPerUnit: 0.35,
    maintenanceCostAnnual: 7600,
    insuranceCostAnnual: 9600,
    expectedLifespanYears: 15,
    fuelEfficiency: 130,
    technicalSpecs: {
      zulaessigesGesamtgewicht: 27000,
      zugGesamtgewicht: 40000,
      achskonfiguration: "6x2",
      nutzlast: 21000,
      leistungKW: 350,
      leistungPS: 476,
      drehmoment: 1700,
      batterieKapazitaet: 525,
      reichweite: 400,
      ladeLeistungAC: 22,
      ladeLeistungDC: 350,
      fahrerhaus: "Fernverkehr",
      laenge: 6250,
      hoehe: 3920,
    },
  },
  "scania-electric": {
    name: "Scania 45 R Electric",
    type: "electric",
    purchasePrice: 430000,
    annualMileage: 100000,
    fuelCostPerUnit: 0.35,
    maintenanceCostAnnual: 8200,
    insuranceCostAnnual: 10200,
    expectedLifespanYears: 15,
    fuelEfficiency: 115,
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
  },
  "renault-e-tech-t": {
    name: "Renault E-Tech T",
    type: "electric",
    purchasePrice: 360000,
    annualMileage: 90000,
    fuelCostPerUnit: 0.35,
    maintenanceCostAnnual: 7200,
    insuranceCostAnnual: 9200,
    expectedLifespanYears: 15,
    fuelEfficiency: 135,
    technicalSpecs: {
      zulaessigesGesamtgewicht: 26000,
      zugGesamtgewicht: 40000,
      achskonfiguration: "6x2",
      nutzlast: 20000,
      leistungKW: 330,
      leistungPS: 449,
      drehmoment: 1600,
      batterieKapazitaet: 540,
      reichweite: 400,
      ladeLeistungAC: 22,
      ladeLeistungDC: 250,
      fahrerhaus: "Verteiler",
      laenge: 6100,
      hoehe: 3850,
    },
  },
};

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

export const insertScenarioSchema = createInsertSchema(scenarios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type Scenario = typeof scenarios.$inferSelect;
