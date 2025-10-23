import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Truck, Zap } from "lucide-react";
import type { TruckParameters } from "@shared/schema";

interface TruckParametersCardProps {
  truck: TruckParameters;
  onChange: (truck: TruckParameters) => void;
  truckIndex: number;
}

export function TruckParametersCard({ truck, onChange, truckIndex }: TruckParametersCardProps) {
  const updateField = <K extends keyof TruckParameters>(field: K, value: TruckParameters[K]) => {
    onChange({ ...truck, [field]: value });
  };

  const isDiesel = truck.type === "diesel";

  return (
    <Card>
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {isDiesel ? (
              <Truck className="h-5 w-5 text-chart-1" />
            ) : (
              <Zap className="h-5 w-5 text-chart-2" />
            )}
            <CardTitle className="text-lg">
              {isDiesel ? "Diesel Truck" : `Electric Truck ${truckIndex}`}
            </CardTitle>
          </div>
          <Badge variant={isDiesel ? "secondary" : "default"} className="shrink-0">
            {isDiesel ? "Diesel" : "Electric"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`name-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
            Model Name
          </Label>
          <Input
            id={`name-${truckIndex}`}
            value={truck.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Enter truck model"
            data-testid={`input-name-${truckIndex}`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`purchase-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
              Purchase Price
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                $
              </span>
              <Input
                id={`purchase-${truckIndex}`}
                type="number"
                value={truck.purchasePrice}
                onChange={(e) => updateField("purchasePrice", parseFloat(e.target.value) || 0)}
                className="pl-7"
                min="0"
                data-testid={`input-purchase-${truckIndex}`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`mileage-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
              Annual Mileage
            </Label>
            <Input
              id={`mileage-${truckIndex}`}
              type="number"
              value={truck.annualMileage}
              onChange={(e) => updateField("annualMileage", parseFloat(e.target.value) || 0)}
              placeholder="25000"
              min="0"
              data-testid={`input-mileage-${truckIndex}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`fuel-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
              {isDiesel ? "Diesel ($/gal)" : "Electricity ($/kWh)"}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                $
              </span>
              <Input
                id={`fuel-${truckIndex}`}
                type="number"
                step="0.01"
                value={truck.fuelCostPerUnit}
                onChange={(e) => updateField("fuelCostPerUnit", parseFloat(e.target.value) || 0)}
                className="pl-7"
                min="0"
                data-testid={`input-fuel-${truckIndex}`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`efficiency-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
              {isDiesel ? "MPG" : "kWh/100mi"}
            </Label>
            <Input
              id={`efficiency-${truckIndex}`}
              type="number"
              step="0.1"
              value={truck.fuelEfficiency}
              onChange={(e) => updateField("fuelEfficiency", parseFloat(e.target.value) || 0)}
              placeholder={isDiesel ? "8" : "2.5"}
              min="0"
              data-testid={`input-efficiency-${truckIndex}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`maintenance-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
              Maintenance (Annual)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                $
              </span>
              <Input
                id={`maintenance-${truckIndex}`}
                type="number"
                value={truck.maintenanceCostAnnual}
                onChange={(e) => updateField("maintenanceCostAnnual", parseFloat(e.target.value) || 0)}
                className="pl-7"
                min="0"
                data-testid={`input-maintenance-${truckIndex}`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`insurance-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
              Insurance (Annual)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                $
              </span>
              <Input
                id={`insurance-${truckIndex}`}
                type="number"
                value={truck.insuranceCostAnnual}
                onChange={(e) => updateField("insuranceCostAnnual", parseFloat(e.target.value) || 0)}
                className="pl-7"
                min="0"
                data-testid={`input-insurance-${truckIndex}`}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`lifespan-${truckIndex}`} className="text-xs uppercase tracking-wider font-medium">
            Expected Lifespan (Years)
          </Label>
          <Input
            id={`lifespan-${truckIndex}`}
            type="number"
            value={truck.expectedLifespanYears}
            onChange={(e) => updateField("expectedLifespanYears", parseFloat(e.target.value) || 1)}
            placeholder="10"
            min="1"
            max="30"
            data-testid={`input-lifespan-${truckIndex}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
