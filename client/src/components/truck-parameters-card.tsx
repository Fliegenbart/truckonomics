import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Zap } from "lucide-react";
import type { TruckParameters } from "@shared/schema";
import { presetTruckModels } from "@shared/schema";
import { useState } from "react";

interface TruckParametersCardProps {
  truck: TruckParameters;
  onChange: (truck: TruckParameters) => void;
  truckIndex: number;
}

export function TruckParametersCard({ truck, onChange, truckIndex }: TruckParametersCardProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof TruckParameters, string>>>({});

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

  const isDiesel = truck.type === "diesel";

  const handlePresetSelect = (presetId: string) => {
    if (presetId === "custom") return;
    const preset = presetTruckModels[presetId];
    if (preset) {
      onChange(preset);
      setErrors({});
    }
  };

  const dieselPresets = Object.entries(presetTruckModels).filter(([, model]) => model.type === "diesel");
  const electricPresets = Object.entries(presetTruckModels).filter(([, model]) => model.type === "electric");
  const availablePresets = isDiesel ? dieselPresets : electricPresets;

  return (
    <Card className="overflow-hidden border-card-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="space-y-4 pb-5 bg-gradient-to-b from-muted/30 to-transparent">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isDiesel ? 'bg-chart-1/10' : 'bg-chart-2/10'}`}>
              {isDiesel ? (
                <Truck className="h-5 w-5 text-chart-1" />
              ) : (
                <Zap className="h-5 w-5 text-chart-2" />
              )}
            </div>
            <CardTitle className="text-xl font-semibold">
              {isDiesel ? "Diesel-LKW" : `Elektro-LKW ${truckIndex}`}
            </CardTitle>
          </div>
          <Badge 
            variant={isDiesel ? "secondary" : "default"} 
            className={`shrink-0 px-3 py-1 rounded-full font-medium ${isDiesel ? '' : 'bg-chart-2 hover:bg-chart-2/90'}`}
          >
            {isDiesel ? "Diesel" : "Elektro"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-2">
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
      </CardContent>
    </Card>
  );
}
