import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ComparisonResult } from "@shared/schema";

interface DetailedTCOTableProps {
  result: ComparisonResult;
}

export function DetailedTCOTable({ result }: DetailedTCOTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const tableData = result.dieselAnalysis.yearlyBreakdown.map((diesel, index) => {
    const electric1 = result.electric1Analysis.yearlyBreakdown[index];
    const electric2 = result.electric2Analysis.yearlyBreakdown[index];
    
    const dieselCost = diesel.totalCost;
    const electric1Cost = electric1.totalCost;
    const electric2Cost = electric2.totalCost;
    
    const bestElectricCost = Math.min(electric1Cost, electric2Cost);
    const savings = dieselCost - bestElectricCost;

    return {
      year: diesel.year,
      dieselCost,
      electric1Cost,
      electric2Cost,
      savings,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Jährliche Kostenübersicht</CardTitle>
        <p className="text-sm text-muted-foreground">
          Detaillierte jährliche Kosten- und Ersparnis-Vergleich
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-card z-10 min-w-20">Jahr</TableHead>
                <TableHead className="text-right min-w-32">{result.dieselAnalysis.name}</TableHead>
                <TableHead className="text-right min-w-32">{result.electric1Analysis.name}</TableHead>
                <TableHead className="text-right min-w-32">{result.electric2Analysis.name}</TableHead>
                <TableHead className="text-right min-w-32">Jährl. Ersparnis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.year} data-testid={`row-year-${row.year}`}>
                  <TableCell className="sticky left-0 bg-card z-10 font-medium">
                    Jahr {row.year}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(row.dieselCost)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(row.electric1Cost)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(row.electric2Cost)}
                  </TableCell>
                  <TableCell className={`text-right tabular-nums font-medium ${row.savings > 0 ? "text-chart-2" : "text-chart-4"}`}>
                    {row.savings > 0 ? "+" : ""}{formatCurrency(row.savings)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold bg-muted/50">
                <TableCell className="sticky left-0 bg-muted/50 z-10">
                  Gesamt
                </TableCell>
                <TableCell className="text-right tabular-nums" data-testid="total-diesel">
                  {formatCurrency(result.dieselAnalysis.totalCostOfOwnership)}
                </TableCell>
                <TableCell className="text-right tabular-nums" data-testid="total-electric1">
                  {formatCurrency(result.electric1Analysis.totalCostOfOwnership)}
                </TableCell>
                <TableCell className="text-right tabular-nums" data-testid="total-electric2">
                  {formatCurrency(result.electric2Analysis.totalCostOfOwnership)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-chart-2" data-testid="total-savings">
                  +{formatCurrency(result.maxSavings)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
