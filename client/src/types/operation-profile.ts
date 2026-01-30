export type OperationProfilePreset = "kep" | "stueckgut" | "filial" | "custom";

export interface OperationProfile {
  presetId: OperationProfilePreset;
  dailyKm: number;
  dailyKmP90: number;
  stopsPerDay: number;
  stopMinutes: number;
  workDaysPerYear: number;
  opportunityCharging: boolean;
  opportunityChargeMinutes: number;
  useP90ForCalc: boolean;
}

