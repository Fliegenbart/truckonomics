import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Euro, Info } from "lucide-react";
import { regionalIncentives, type TaxIncentiveRegion, taxIncentiveRegions } from "@shared/schema";

interface TaxIncentiveSelectorProps {
  value: TaxIncentiveRegion;
  onChange: (value: TaxIncentiveRegion) => void;
}

export function TaxIncentiveSelector({ value, onChange }: TaxIncentiveSelectorProps) {
  const selectedIncentive = regionalIncentives[value];
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Euro className="h-5 w-5 text-primary" />
            Förderungen & Zuschüsse
          </CardTitle>
          <Badge variant="secondary">Nur Elektrofahrzeuge</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tax-region" className="text-xs uppercase tracking-wider font-medium">
            Region auswählen
          </Label>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger id="tax-region" data-testid="select-tax-region">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {taxIncentiveRegions.map((region) => (
                <SelectItem key={region} value={region}>
                  {regionalIncentives[region].region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedIncentive.totalIncentive > 0 && (
          <div className="space-y-3 pt-3 border-t">
            <p className="text-sm font-medium">Förderungsübersicht</p>
            
            <div className="space-y-2">
              {selectedIncentive.federalCredit > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Bundesförderung</span>
                  <span className="font-medium tabular-nums" data-testid="text-federal-credit">
                    {formatCurrency(selectedIncentive.federalCredit)}
                  </span>
                </div>
              )}
              
              {selectedIncentive.stateCredit > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Landesförderung</span>
                  <span className="font-medium tabular-nums" data-testid="text-state-credit">
                    {formatCurrency(selectedIncentive.stateCredit)}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm pt-2 border-t">
                <span className="font-medium">Gesamtförderung</span>
                <span className="font-bold text-primary tabular-nums" data-testid="text-total-incentive">
                  {formatCurrency(selectedIncentive.totalIncentive)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="pt-3 border-t">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              {selectedIncentive.description}
            </p>
          </div>
        </div>

        {selectedIncentive.totalIncentive > 0 && (
          <div className="pt-2">
            <p className="text-xs text-muted-foreground">
              * Förderungen werden auf Elektro-LKW-Kaufpreise angewendet. Voraussetzungen und Berechtigung können variieren.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
