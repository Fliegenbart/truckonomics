import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Truck, Zap, ChevronDown, Settings2 } from "lucide-react";
import type { TruckParameters, TechnicalSpecs, AxleConfiguration, CabinType } from "@shared/schema";
import { presetTruckModels, axleConfigurations, cabinTypes } from "@shared/schema";
import { useState } from "react";
import { getTruckImage } from "@/lib/truck-images";

interface TruckParametersCardProps {
  truck: TruckParameters;
  onChange: (truck: TruckParameters) => void;
  truckIndex: number;
}

export function TruckParametersCard({ truck, onChange, truckIndex }: TruckParametersCardProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof TruckParameters, string>>>({});
  const [specsOpen, setSpecsOpen] = useState(false);
  const [selectedPresetKey, setSelectedPresetKey] = useState<string | undefined>(undefined);

  const updateField = <K extends keyof TruckParameters>(field: K, value: TruckParameters[K]) => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
    
    if (typeof value === 'number') {
      if (isNaN(value) || value < 0) {
        setErrors(prev => ({ ...prev, [field]: 'Muss eine positive Zahl sein' }));
        return;
      }
      if (field === 'expectedLifespanYears' && (value < 1 || value > 30)) {
        setErrors(prev => ({ ...prev, [field]: 'Muss zwischen 1 und 30 Jahren liegen' }));
        return;
      }
    }
    if (typeof value === 'string' && field === 'name' && value.trim().length === 0) {
      setErrors(prev => ({ ...prev, [field]: 'Name ist erforderlich' }));
      return;
    }
    
    onChange({ ...truck, [field]: value });
  };

  const updateTechnicalSpec = <K extends keyof TechnicalSpecs>(field: K, value: TechnicalSpecs[K]) => {
    const currentSpecs = truck.technicalSpecs || {};
    onChange({
      ...truck,
      technicalSpecs: {
        ...currentSpecs,
        [field]: value,
      },
    });
  };

  const isDiesel = truck.type === "diesel";
  const specs = truck.technicalSpecs || {};

  const handlePresetSelect = (presetId: string) => {
    if (presetId === "custom") {
      setSelectedPresetKey(undefined);
      return;
    }
    const preset = presetTruckModels[presetId];
    if (preset) {
      setSelectedPresetKey(presetId);
      onChange(preset);
      setErrors({});
    }
  };

  const dieselPresets = Object.entries(presetTruckModels).filter(([, model]) => model.type === "diesel");
  const electricPresets = Object.entries(presetTruckModels).filter(([, model]) => model.type === "electric");
  const availablePresets = isDiesel ? dieselPresets : electricPresets;

  return (
    <Card className="overflow-hidden border border-border bg-card shadow-none">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {isDiesel ? (
              <Truck className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Zap className="h-5 w-5 text-primary" />
            )}
            <CardTitle className="font-serif text-xl font-medium">
              {isDiesel ? "Diesel-LKW" : `Elektro-LKW ${truckIndex}`}
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className={`shrink-0 px-2.5 py-0.5 text-xs font-medium border ${isDiesel ? 'border-muted-foreground/30 text-muted-foreground' : 'border-primary/30 text-primary'}`}
          >
            {isDiesel ? "Diesel" : "Elektro"}
          </Badge>
        </div>

        {/* Truck Image - minimal */}
        <div className="relative h-28 -mx-6 overflow-hidden border-y border-border">
          <img
            src={getTruckImage(selectedPresetKey, truck.type)}
            alt={truck.name}
            className="w-full h-full object-cover grayscale-[30%] opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
          <div className="absolute bottom-3 left-6 right-6">
            <p className="text-sm font-medium text-foreground truncate">{truck.name}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div className="space-y-2">
          <Label htmlFor={`preset-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
            Voreinstellung
          </Label>
          <Select onValueChange={handlePresetSelect} data-testid={`select-preset-${truckIndex}`}>
            <SelectTrigger id={`preset-${truckIndex}`}>
              <SelectValue placeholder="Voreinstellung wählen oder anpassen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Eigene Konfiguration</SelectItem>
              {availablePresets.map(([id, model]) => (
                <SelectItem key={id} value={id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`name-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
            Modellname
          </Label>
          <Input
            id={`name-${truckIndex}`}
            value={truck.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="LKW-Modell eingeben"
            data-testid={`input-name-${truckIndex}`}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`purchase-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
              Kaufpreis
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                €
              </span>
              <Input
                id={`purchase-${truckIndex}`}
                type="number"
                value={truck.purchasePrice || ''}
                onChange={(e) => updateField("purchasePrice", parseFloat(e.target.value) || 0)}
                className="pl-7"
                min="0"
                data-testid={`input-purchase-${truckIndex}`}
              />
            </div>
            {errors.purchasePrice && (
              <p className="text-xs text-destructive">{errors.purchasePrice}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`mileage-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
              Jahreskilometer
            </Label>
            <Input
              id={`mileage-${truckIndex}`}
              type="number"
              value={truck.annualMileage || ''}
              onChange={(e) => updateField("annualMileage", parseFloat(e.target.value) || 0)}
              placeholder="120000"
              min="0"
              data-testid={`input-mileage-${truckIndex}`}
            />
            {errors.annualMileage && (
              <p className="text-xs text-destructive">{errors.annualMileage}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`fuel-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
              {isDiesel ? "Diesel (€/L)" : "Strom (€/kWh)"}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                €
              </span>
              <Input
                id={`fuel-${truckIndex}`}
                type="number"
                step="0.01"
                value={truck.fuelCostPerUnit || ''}
                onChange={(e) => updateField("fuelCostPerUnit", parseFloat(e.target.value) || 0)}
                className="pl-7"
                min="0"
                data-testid={`input-fuel-${truckIndex}`}
              />
            </div>
            {errors.fuelCostPerUnit && (
              <p className="text-xs text-destructive">{errors.fuelCostPerUnit}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`efficiency-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
              {isDiesel ? "L/100km" : "kWh/100km"}
            </Label>
            <Input
              id={`efficiency-${truckIndex}`}
              type="number"
              step="0.1"
              value={truck.fuelEfficiency || ''}
              onChange={(e) => updateField("fuelEfficiency", parseFloat(e.target.value) || 0)}
              placeholder={isDiesel ? "32" : "120"}
              min="0"
              data-testid={`input-efficiency-${truckIndex}`}
            />
            {errors.fuelEfficiency && (
              <p className="text-xs text-destructive">{errors.fuelEfficiency}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`maintenance-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
              Wartung (Jährlich)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                €
              </span>
              <Input
                id={`maintenance-${truckIndex}`}
                type="number"
                value={truck.maintenanceCostAnnual || ''}
                onChange={(e) => updateField("maintenanceCostAnnual", parseFloat(e.target.value) || 0)}
                className="pl-7"
                min="0"
                data-testid={`input-maintenance-${truckIndex}`}
              />
            </div>
            {errors.maintenanceCostAnnual && (
              <p className="text-xs text-destructive">{errors.maintenanceCostAnnual}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`insurance-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
              Versicherung (Jährlich)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                €
              </span>
              <Input
                id={`insurance-${truckIndex}`}
                type="number"
                value={truck.insuranceCostAnnual || ''}
                onChange={(e) => updateField("insuranceCostAnnual", parseFloat(e.target.value) || 0)}
                className="pl-7"
                min="0"
                data-testid={`input-insurance-${truckIndex}`}
              />
            </div>
            {errors.insuranceCostAnnual && (
              <p className="text-xs text-destructive">{errors.insuranceCostAnnual}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`lifespan-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
            Erwartete Lebensdauer (Jahre)
          </Label>
          <Input
            id={`lifespan-${truckIndex}`}
            type="number"
            value={truck.expectedLifespanYears || ''}
            onChange={(e) => updateField("expectedLifespanYears", parseFloat(e.target.value) || 1)}
            placeholder="10"
            min="1"
            max="30"
            data-testid={`input-lifespan-${truckIndex}`}
          />
          {errors.expectedLifespanYears && (
            <p className="text-xs text-destructive">{errors.expectedLifespanYears}</p>
          )}
        </div>

        <Collapsible open={specsOpen} onOpenChange={setSpecsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between px-0 py-2 h-auto text-sm font-medium hover:bg-transparent"
              data-testid={`toggle-specs-${truckIndex}`}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Settings2 className="h-4 w-4" />
                <span>Technische Spezifikationen</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${specsOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <div className="p-4 border border-border space-y-4">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Gewicht & Konfiguration</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`zgg-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
                    Zul. Gesamtgewicht (kg)
                  </Label>
                  <Input
                    id={`zgg-${truckIndex}`}
                    type="number"
                    value={specs.zulaessigesGesamtgewicht || ''}
                    onChange={(e) => updateTechnicalSpec("zulaessigesGesamtgewicht", parseFloat(e.target.value) || undefined)}
                    placeholder="18000"
                    min="0"
                    data-testid={`input-zgg-${truckIndex}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`zuggewicht-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
                    Zuggesamtgewicht (kg)
                  </Label>
                  <Input
                    id={`zuggewicht-${truckIndex}`}
                    type="number"
                    value={specs.zugGesamtgewicht || ''}
                    onChange={(e) => updateTechnicalSpec("zugGesamtgewicht", parseFloat(e.target.value) || undefined)}
                    placeholder="40000"
                    min="0"
                    data-testid={`input-zuggewicht-${truckIndex}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`achse-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
                    Achskonfiguration
                  </Label>
                  <Select 
                    value={specs.achskonfiguration || ''} 
                    onValueChange={(v) => updateTechnicalSpec("achskonfiguration", v as AxleConfiguration)}
                  >
                    <SelectTrigger id={`achse-${truckIndex}`} data-testid={`select-achse-${truckIndex}`}>
                      <SelectValue placeholder="Auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {axleConfigurations.map((config) => (
                        <SelectItem key={config} value={config}>
                          {config}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`nutzlast-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
                    Nutzlast (kg)
                  </Label>
                  <Input
                    id={`nutzlast-${truckIndex}`}
                    type="number"
                    value={specs.nutzlast || ''}
                    onChange={(e) => updateTechnicalSpec("nutzlast", parseFloat(e.target.value) || undefined)}
                    placeholder="26000"
                    min="0"
                    data-testid={`input-nutzlast-${truckIndex}`}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border border-border space-y-4">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Antrieb & Leistung</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`leistung-kw-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
                    Leistung (kW)
                  </Label>
                  <Input
                    id={`leistung-kw-${truckIndex}`}
                    type="number"
                    value={specs.leistungKW || ''}
                    onChange={(e) => updateTechnicalSpec("leistungKW", parseFloat(e.target.value) || undefined)}
                    placeholder="350"
                    min="0"
                    data-testid={`input-leistung-kw-${truckIndex}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`leistung-ps-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
                    Leistung (PS)
                  </Label>
                  <Input
                    id={`leistung-ps-${truckIndex}`}
                    type="number"
                    value={specs.leistungPS || ''}
                    onChange={(e) => updateTechnicalSpec("leistungPS", parseFloat(e.target.value) || undefined)}
                    placeholder="476"
                    min="0"
                    data-testid={`input-leistung-ps-${truckIndex}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`drehmoment-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
                    Drehmoment (Nm)
                  </Label>
                  <Input
                    id={`drehmoment-${truckIndex}`}
                    type="number"
                    value={specs.drehmoment || ''}
                    onChange={(e) => updateTechnicalSpec("drehmoment", parseFloat(e.target.value) || undefined)}
                    placeholder="2300"
                    min="0"
                    data-testid={`input-drehmoment-${truckIndex}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`reichweite-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
                    Reichweite (km)
                  </Label>
                  <Input
                    id={`reichweite-${truckIndex}`}
                    type="number"
                    value={specs.reichweite || ''}
                    onChange={(e) => updateTechnicalSpec("reichweite", parseFloat(e.target.value) || undefined)}
                    placeholder={isDiesel ? "1200" : "500"}
                    min="0"
                    data-testid={`input-reichweite-${truckIndex}`}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border border-border space-y-4">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                {isDiesel ? "Tank & Kabine" : "Batterie & Laden"}
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                {isDiesel ? (
                  <div className="space-y-2">
                    <Label htmlFor={`tank-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
                      Tankkapazität (L)
                    </Label>
                    <Input
                      id={`tank-${truckIndex}`}
                      type="number"
                      value={specs.tankKapazitaet || ''}
                      onChange={(e) => updateTechnicalSpec("tankKapazitaet", parseFloat(e.target.value) || undefined)}
                      placeholder="400"
                      min="0"
                      data-testid={`input-tank-${truckIndex}`}
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor={`batterie-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
                        Batteriekapazität (kWh)
                      </Label>
                      <Input
                        id={`batterie-${truckIndex}`}
                        type="number"
                        value={specs.batterieKapazitaet || ''}
                        onChange={(e) => updateTechnicalSpec("batterieKapazitaet", parseFloat(e.target.value) || undefined)}
                        placeholder="600"
                        min="0"
                        data-testid={`input-batterie-${truckIndex}`}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor={`fahrerhaus-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
                    Fahrerhaus
                  </Label>
                  <Select 
                    value={specs.fahrerhaus || ''} 
                    onValueChange={(v) => updateTechnicalSpec("fahrerhaus", v as CabinType)}
                  >
                    <SelectTrigger id={`fahrerhaus-${truckIndex}`} data-testid={`select-fahrerhaus-${truckIndex}`}>
                      <SelectValue placeholder="Auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {cabinTypes.map((cabin) => (
                        <SelectItem key={cabin} value={cabin}>
                          {cabin}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!isDiesel && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`lade-ac-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
                      Ladeleistung AC (kW)
                    </Label>
                    <Input
                      id={`lade-ac-${truckIndex}`}
                      type="number"
                      value={specs.ladeLeistungAC || ''}
                      onChange={(e) => updateTechnicalSpec("ladeLeistungAC", parseFloat(e.target.value) || undefined)}
                      placeholder="22"
                      min="0"
                      data-testid={`input-lade-ac-${truckIndex}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`lade-dc-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
                      Ladeleistung DC (kW)
                    </Label>
                    <Input
                      id={`lade-dc-${truckIndex}`}
                      type="number"
                      value={specs.ladeLeistungDC || ''}
                      onChange={(e) => updateTechnicalSpec("ladeLeistungDC", parseFloat(e.target.value) || undefined)}
                      placeholder="400"
                      min="0"
                      data-testid={`input-lade-dc-${truckIndex}`}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border border-border space-y-4">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Abmessungen</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`laenge-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
                    Länge (mm)
                  </Label>
                  <Input
                    id={`laenge-${truckIndex}`}
                    type="number"
                    value={specs.laenge || ''}
                    onChange={(e) => updateTechnicalSpec("laenge", parseFloat(e.target.value) || undefined)}
                    placeholder="6200"
                    min="0"
                    data-testid={`input-laenge-${truckIndex}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`hoehe-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
                    Höhe (mm)
                  </Label>
                  <Input
                    id={`hoehe-${truckIndex}`}
                    type="number"
                    value={specs.hoehe || ''}
                    onChange={(e) => updateTechnicalSpec("hoehe", parseFloat(e.target.value) || undefined)}
                    placeholder="3950"
                    min="0"
                    data-testid={`input-hoehe-${truckIndex}`}
                  />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
