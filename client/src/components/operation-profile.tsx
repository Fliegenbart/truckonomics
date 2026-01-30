import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Activity, Route } from "lucide-react";
import type { OperationProfile, OperationProfilePreset } from "@/types/operation-profile";

const presetCopy: Record<
  OperationProfilePreset,
  { label: string; description: string; values?: Partial<OperationProfile> }
> = {
  kep: {
    label: "KEP / Paket (viele Stopps)",
    description: "City-Zustellung mit vielen Stopps und kurzen Distanzen.",
    values: {
      dailyKm: 80,
      dailyKmP90: 130,
      stopsPerDay: 95,
      stopMinutes: 8,
      opportunityCharging: false,
      opportunityChargeMinutes: 0,
      opportunityChargePowerKw: 0,
      publicChargeShare: 0,
      publicChargeCostPerKwh: 0.55,
      p90SharePercent: 10,
      downtimeCostPerDay: 800,
      infrastructureCapex: 35000,
      infrastructureOpexAnnual: 1200,
      infrastructureLifetimeYears: 10,
      useP90ForCalc: false,
    },
  },
  stueckgut: {
    label: "Stückgut / Handel (wenige Stopps)",
    description: "Urbaner Verteilerverkehr mit längeren Distanzen und Stopps.",
    values: {
      dailyKm: 200,
      dailyKmP90: 250,
      stopsPerDay: 12,
      stopMinutes: 20,
      opportunityCharging: true,
      opportunityChargeMinutes: 30,
      opportunityChargePowerKw: 150,
      publicChargeShare: 20,
      publicChargeCostPerKwh: 0.55,
      p90SharePercent: 10,
      downtimeCostPerDay: 1200,
      infrastructureCapex: 50000,
      infrastructureOpexAnnual: 1800,
      infrastructureLifetimeYears: 10,
      useP90ForCalc: false,
    },
  },
  filial: {
    label: "Filialversorgung (Retail)",
    description: "Hub → Stadt mit stabilen Touren und planbaren Zeitfenstern.",
    values: {
      dailyKm: 170,
      dailyKmP90: 200,
      stopsPerDay: 10,
      stopMinutes: 20,
      opportunityCharging: true,
      opportunityChargeMinutes: 30,
      opportunityChargePowerKw: 150,
      publicChargeShare: 15,
      publicChargeCostPerKwh: 0.55,
      p90SharePercent: 10,
      downtimeCostPerDay: 1200,
      infrastructureCapex: 55000,
      infrastructureOpexAnnual: 2000,
      infrastructureLifetimeYears: 10,
      useP90ForCalc: false,
    },
  },
  custom: {
    label: "Individuell",
    description: "Eigene Werte definieren.",
  },
};

interface OperationProfileProps {
  value: OperationProfile;
  onChange: (value: OperationProfile) => void;
  syncMileage: boolean;
  onSyncMileageChange: (value: boolean) => void;
  computedAnnualMileage: number;
}

export function OperationProfileCard({
  value,
  onChange,
  syncMileage,
  onSyncMileageChange,
  computedAnnualMileage,
}: OperationProfileProps) {
  const setField = <K extends keyof OperationProfile>(field: K, next: OperationProfile[K]) => {
    onChange({ ...value, [field]: next, presetId: value.presetId === "custom" ? "custom" : value.presetId });
  };

  const handlePresetChange = (presetId: OperationProfilePreset) => {
    if (presetId === "custom") {
      onChange({ ...value, presetId: "custom" });
      return;
    }
    const preset = presetCopy[presetId].values;
    onChange({
      ...value,
      presetId,
      ...(preset || {}),
    });
  };

  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="space-y-2 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Route className="h-5 w-5 text-primary" />
            Einsatzprofil (Depot → Stadt)
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="h-4 w-4" />
            Praxisnah
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Wählen Sie ein Profil oder passen Sie die Tour-Realität an.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="profile-preset" className="text-xs uppercase tracking-wider font-medium">
            Preset
          </Label>
          <Select value={value.presetId} onValueChange={(v) => handlePresetChange(v as OperationProfilePreset)}>
            <SelectTrigger id="profile-preset">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(presetCopy).map(([key, preset]) => (
                <SelectItem key={key} value={key}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{presetCopy[value.presetId].description}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="daily-km" className="text-xs uppercase tracking-wider font-medium">
              km/Tag (typisch)
            </Label>
            <Input
              id="daily-km"
              type="number"
              min="0"
              value={value.dailyKm}
              onChange={(e) => setField("dailyKm", Number(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="daily-km-p90" className="text-xs uppercase tracking-wider font-medium">
              km/Tag (P90)
            </Label>
            <Input
              id="daily-km-p90"
              type="number"
              min="0"
              value={value.dailyKmP90}
              onChange={(e) => setField("dailyKmP90", Number(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stops" className="text-xs uppercase tracking-wider font-medium">
              Stopps/Tag
            </Label>
            <Input
              id="stops"
              type="number"
              min="0"
              value={value.stopsPerDay}
              onChange={(e) => setField("stopsPerDay", Number(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stop-minutes" className="text-xs uppercase tracking-wider font-medium">
              Standzeit/Stopp (min)
            </Label>
            <Input
              id="stop-minutes"
              type="number"
              min="0"
              value={value.stopMinutes}
              onChange={(e) => setField("stopMinutes", Number(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="workdays" className="text-xs uppercase tracking-wider font-medium">
              Arbeitstage/Jahr
            </Label>
            <Input
              id="workdays"
              type="number"
              min="0"
              value={value.workDaysPerYear}
              onChange={(e) => setField("workDaysPerYear", Number(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">
              Abgeleitete Jahreskilometer:{" "}
              <span className="font-medium tabular-nums">
                {new Intl.NumberFormat("de-DE").format(computedAnnualMileage)} km
              </span>
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">P90 für Kalkulation</p>
                <p className="text-xs text-muted-foreground">
                  Konservativer Ansatz für schwierige Tage
                </p>
              </div>
              <Switch
                checked={value.useP90ForCalc}
                onCheckedChange={(checked) => setField("useP90ForCalc", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Jahreskilometer übernehmen</p>
                <p className="text-xs text-muted-foreground">
                  Werte automatisch in die Fahrzeuge schreiben
                </p>
              </div>
              <Switch checked={syncMileage} onCheckedChange={onSyncMileageChange} />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Opportunity / Destination Charging</p>
              <p className="text-xs text-muted-foreground">Zwischenladen am Tag möglich</p>
            </div>
            <Switch
              checked={value.opportunityCharging}
              onCheckedChange={(checked) => setField("opportunityCharging", checked)}
            />
          </div>

          {value.opportunityCharging && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="opportunity-minutes" className="text-xs uppercase tracking-wider font-medium">
                  Ladezeit tagsüber (min)
                </Label>
                <Input
                  id="opportunity-minutes"
                  type="number"
                  min="0"
                  value={value.opportunityChargeMinutes}
                  onChange={(e) => setField("opportunityChargeMinutes", Number(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opportunity-power" className="text-xs uppercase tracking-wider font-medium">
                  Ladeleistung (kW)
                </Label>
                <Input
                  id="opportunity-power"
                  type="number"
                  min="0"
                  value={value.opportunityChargePowerKw}
                  onChange={(e) => setField("opportunityChargePowerKw", Number(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="public-share" className="text-xs uppercase tracking-wider font-medium">
                  Anteil öffentliches Laden (%)
                </Label>
                <Input
                  id="public-share"
                  type="number"
                  min="0"
                  max="100"
                  value={value.publicChargeShare}
                  onChange={(e) => setField("publicChargeShare", Number(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="public-cost" className="text-xs uppercase tracking-wider font-medium">
                  Preis öffentlich (€/kWh)
                </Label>
                <Input
                  id="public-cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={value.publicChargeCostPerKwh}
                  onChange={(e) => setField("publicChargeCostPerKwh", Number(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Wird als Mischpreis in der Berechnung verwendet.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          <div>
            <p className="text-sm font-medium">Infrastruktur (Depot)</p>
            <p className="text-xs text-muted-foreground">
              Kosten pro Fahrzeug für Ladehardware und Netzanschluss
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="infra-capex" className="text-xs uppercase tracking-wider font-medium">
                CAPEX (€/Fahrzeug)
              </Label>
              <Input
                id="infra-capex"
                type="number"
                min="0"
                value={value.infrastructureCapex}
                onChange={(e) => setField("infrastructureCapex", Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="infra-opex" className="text-xs uppercase tracking-wider font-medium">
                Opex pro Jahr (€/Fahrzeug)
              </Label>
              <Input
                id="infra-opex"
                type="number"
                min="0"
                value={value.infrastructureOpexAnnual}
                onChange={(e) => setField("infrastructureOpexAnnual", Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="infra-life" className="text-xs uppercase tracking-wider font-medium">
                Abschreibung (Jahre)
              </Label>
              <Input
                id="infra-life"
                type="number"
                min="1"
                value={value.infrastructureLifetimeYears}
                onChange={(e) => setField("infrastructureLifetimeYears", Number(e.target.value) || 1)}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          <div>
            <p className="text-sm font-medium">Ausfallkosten (P90-Tage)</p>
            <p className="text-xs text-muted-foreground">
              Monetarisiert Risiko an den schwierigsten Tagen
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="p90-share" className="text-xs uppercase tracking-wider font-medium">
                P90-Anteil der Tage (%)
              </Label>
              <Input
                id="p90-share"
                type="number"
                min="0"
                max="100"
                value={value.p90SharePercent}
                onChange={(e) => setField("p90SharePercent", Number(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                ~{Math.round((value.workDaysPerYear * value.p90SharePercent) / 100)} Tage/Jahr
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="downtime-cost" className="text-xs uppercase tracking-wider font-medium">
                Ausfallkosten pro Tag (€)
              </Label>
              <Input
                id="downtime-cost"
                type="number"
                min="0"
                value={value.downtimeCostPerDay}
                onChange={(e) => setField("downtimeCostPerDay", Number(e.target.value) || 0)}
              />
            </div>
            <div className="flex items-end">
              <p className="text-xs text-muted-foreground">
                Wird nur angesetzt, wenn die E-Reichweite die P90-Tage nicht abdeckt.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
