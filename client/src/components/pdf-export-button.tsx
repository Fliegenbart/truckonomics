import { useState, useCallback } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTenant } from "@/lib/tenant";
import type { ComparisonResult } from "@shared/schema";

interface PdfExportButtonProps {
  result: ComparisonResult;
  fleetSize: number;
}

export function PdfExportButton({ result, fleetSize }: PdfExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { tenant } = useTenant();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("de-DE").format(Math.round(value));
  };

  const handleExport = useCallback(async () => {
    setIsExporting(true);

    try {
      // Dynamic import of html2pdf
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default;

      const bestElectric =
        result.bestElectricOption === "electric1"
          ? result.electric1Analysis
          : result.electric2Analysis;

      const bestBreakEven =
        result.bestElectricOption === "electric1"
          ? result.dieselVsElectric1
          : result.dieselVsElectric2;

      const formatBreakEven = () => {
        if (!bestBreakEven || bestBreakEven.breakEvenYear === null) {
          return "Nicht im Zeitraum";
        }
        if (bestBreakEven.breakEvenMonth) {
          return `${bestBreakEven.breakEvenYear} Jahre ${bestBreakEven.breakEvenMonth} Monate`;
        }
        return `${bestBreakEven.breakEvenYear} Jahre`;
      };

      // Get purchase costs from year 1 breakdown (purchase cost is in first year)
      const dieselPurchase = result.dieselAnalysis.yearlyBreakdown[0]?.purchaseCost || 0;
      const electric1Purchase = result.electric1Analysis.yearlyBreakdown[0]?.purchaseCost || 0;
      const electric2Purchase = result.electric2Analysis.yearlyBreakdown[0]?.purchaseCost || 0;

      // Create PDF content
      const content = document.createElement("div");
      content.innerHTML = `
        <div style="font-family: 'Outfit', -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #404040;">
          <!-- Header -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #EA1B0A;">
            <div>
              <h1 style="font-size: 32px; font-weight: 700; color: #EA1B0A; margin: 0 0 8px 0; letter-spacing: -0.02em;">
                ${tenant.appName}
              </h1>
              <p style="font-size: 14px; color: #666; margin: 0;">
                TCO-Analyse | ${new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 10px; color: #999; margin: 0 0 4px 0;">${tenant.poweredByLabel}</p>
              <div style="font-size: 18px; font-weight: 600; color: #EA1B0A;">${tenant.partnerName}</div>
            </div>
          </div>

          <!-- Fleet Info -->
          ${fleetSize > 1 ? `
          <div style="background: linear-gradient(135deg, #FEF2F0 0%, #FDEAED 100%); padding: 20px; border-radius: 12px; margin-bottom: 32px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="font-size: 32px; font-weight: 700; color: #EA1B0A;">${fleetSize}</div>
              <div>
                <p style="font-weight: 600; color: #333; margin: 0;">Fahrzeuge in der Flotte</p>
                <p style="font-size: 13px; color: #666; margin: 0;">Alle Werte hochgerechnet auf die gesamte Flotte</p>
              </div>
            </div>
          </div>
          ` : ""}

          <!-- Summary Box -->
          <div style="background: linear-gradient(135deg, #22C55E15 0%, #16A34A10 100%); padding: 24px; border-radius: 16px; margin-bottom: 32px; border: 1px solid #22C55E30;">
            <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #666; margin: 0 0 16px 0;">
              Zusammenfassung
            </h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;">
              <div>
                <p style="font-size: 13px; color: #666; margin: 0 0 4px 0;">Maximale Ersparnis</p>
                <p style="font-size: 28px; font-weight: 700; color: #22C55E; margin: 0;">
                  ${formatCurrency(result.maxSavings * fleetSize)}
                </p>
                <p style="font-size: 12px; color: #888; margin: 4px 0 0 0;">über ${result.timeframeYears} Jahre</p>
              </div>
              <div>
                <p style="font-size: 13px; color: #666; margin: 0 0 4px 0;">Amortisation</p>
                <p style="font-size: 28px; font-weight: 700; color: #333; margin: 0;">
                  ${formatBreakEven()}
                </p>
                <p style="font-size: 12px; color: #888; margin: 4px 0 0 0;">${bestElectric.name}</p>
              </div>
            </div>
          </div>

          <!-- TCO Comparison Table -->
          <div style="margin-bottom: 32px;">
            <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 16px 0; color: #333;">
              Gesamtbetriebskosten (TCO) über ${result.timeframeYears} Jahre
            </h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="text-align: left; padding: 12px; border: 1px solid #e0e0e0; font-weight: 600;">Kostenkategorie</th>
                  <th style="text-align: right; padding: 12px; border: 1px solid #e0e0e0; font-weight: 600;">${result.dieselAnalysis.name}</th>
                  <th style="text-align: right; padding: 12px; border: 1px solid #e0e0e0; font-weight: 600;">${result.electric1Analysis.name}</th>
                  <th style="text-align: right; padding: 12px; border: 1px solid #e0e0e0; font-weight: 600;">${result.electric2Analysis.name}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 10px 12px; border: 1px solid #e0e0e0;">Anschaffung</td>
                  <td style="text-align: right; padding: 10px 12px; border: 1px solid #e0e0e0;">${formatCurrency(dieselPurchase * fleetSize)}</td>
                  <td style="text-align: right; padding: 10px 12px; border: 1px solid #e0e0e0;">${formatCurrency(electric1Purchase * fleetSize)}</td>
                  <td style="text-align: right; padding: 10px 12px; border: 1px solid #e0e0e0;">${formatCurrency(electric2Purchase * fleetSize)}</td>
                </tr>
                <tr style="background: #fafafa;">
                  <td style="padding: 10px 12px; border: 1px solid #e0e0e0;">Kraftstoff/Strom</td>
                  <td style="text-align: right; padding: 10px 12px; border: 1px solid #e0e0e0;">${formatCurrency(result.dieselAnalysis.totalFuelCost * fleetSize)}</td>
                  <td style="text-align: right; padding: 10px 12px; border: 1px solid #e0e0e0;">${formatCurrency(result.electric1Analysis.totalFuelCost * fleetSize)}</td>
                  <td style="text-align: right; padding: 10px 12px; border: 1px solid #e0e0e0;">${formatCurrency(result.electric2Analysis.totalFuelCost * fleetSize)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; border: 1px solid #e0e0e0;">Wartung</td>
                  <td style="text-align: right; padding: 10px 12px; border: 1px solid #e0e0e0;">${formatCurrency(result.dieselAnalysis.totalMaintenanceCost * fleetSize)}</td>
                  <td style="text-align: right; padding: 10px 12px; border: 1px solid #e0e0e0;">${formatCurrency(result.electric1Analysis.totalMaintenanceCost * fleetSize)}</td>
                  <td style="text-align: right; padding: 10px 12px; border: 1px solid #e0e0e0;">${formatCurrency(result.electric2Analysis.totalMaintenanceCost * fleetSize)}</td>
                </tr>
                <tr style="background: #fafafa;">
                  <td style="padding: 10px 12px; border: 1px solid #e0e0e0;">Versicherung</td>
                  <td style="text-align: right; padding: 10px 12px; border: 1px solid #e0e0e0;">${formatCurrency(result.dieselAnalysis.totalInsuranceCost * fleetSize)}</td>
                  <td style="text-align: right; padding: 10px 12px; border: 1px solid #e0e0e0;">${formatCurrency(result.electric1Analysis.totalInsuranceCost * fleetSize)}</td>
                  <td style="text-align: right; padding: 10px 12px; border: 1px solid #e0e0e0;">${formatCurrency(result.electric2Analysis.totalInsuranceCost * fleetSize)}</td>
                </tr>
                <tr style="background: #EA1B0A10;">
                  <td style="padding: 12px; border: 1px solid #e0e0e0; font-weight: 700;">Gesamt TCO</td>
                  <td style="text-align: right; padding: 12px; border: 1px solid #e0e0e0; font-weight: 700; color: #EA1B0A;">${formatCurrency(result.dieselAnalysis.totalCostOfOwnership * fleetSize)}</td>
                  <td style="text-align: right; padding: 12px; border: 1px solid #e0e0e0; font-weight: 700; color: #22C55E;">${formatCurrency(result.electric1Analysis.totalCostOfOwnership * fleetSize)}</td>
                  <td style="text-align: right; padding: 12px; border: 1px solid #e0e0e0; font-weight: 700; color: #22C55E;">${formatCurrency(result.electric2Analysis.totalCostOfOwnership * fleetSize)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Environmental Impact -->
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 24px; border-radius: 16px; margin-bottom: 32px;">
            <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #166534; margin: 0 0 16px 0;">
              Umweltauswirkungen
            </h2>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center;">
              <div>
                <p style="font-size: 24px; font-weight: 700; color: #16a34a; margin: 0;">
                  ${formatNumber(result.dieselAnalysis.environmentalImpact.totalCO2Emissions * fleetSize)}
                </p>
                <p style="font-size: 12px; color: #666; margin: 4px 0 0 0;">kg CO₂ (Diesel)</p>
              </div>
              <div>
                <p style="font-size: 24px; font-weight: 700; color: #16a34a; margin: 0;">
                  ${formatNumber(result.electric1Analysis.environmentalImpact.totalCO2Emissions * fleetSize)}
                </p>
                <p style="font-size: 12px; color: #666; margin: 4px 0 0 0;">kg CO₂ (${result.electric1Analysis.name})</p>
              </div>
              <div>
                <p style="font-size: 24px; font-weight: 700; color: #16a34a; margin: 0;">
                  ${formatNumber((result.dieselAnalysis.environmentalImpact.totalCO2Emissions - bestElectric.environmentalImpact.totalCO2Emissions) * fleetSize)}
                </p>
                <p style="font-size: 12px; color: #666; margin: 4px 0 0 0;">kg CO₂ Einsparung</p>
              </div>
            </div>
          </div>

          <!-- Footer CTA -->
          <div style="background: #EA1B0A; color: white; padding: 24px; border-radius: 16px; text-align: center;">
            <h3 style="font-size: 20px; font-weight: 600; margin: 0 0 8px 0;">
              Bereit für die Elektrifizierung?
            </h3>
            <p style="font-size: 14px; opacity: 0.9; margin: 0 0 16px 0;">
              Kontaktieren Sie uns für eine individuelle Flottenberatung
            </p>
            <p style="font-size: 16px; font-weight: 600; margin: 0;">
              eon.de/drive | 0800 - 33 66 443
            </p>
          </div>

          <!-- Disclaimer -->
          <p style="font-size: 10px; color: #999; margin-top: 24px; text-align: center;">
            Diese Analyse dient nur zu Informationszwecken. Alle Berechnungen sind Schätzungen basierend auf den angegebenen Parametern.
            Erstellt mit ${tenant.appName} | ${tenant.poweredByLabel} ${tenant.partnerName} | ${window.location.href}
          </p>
        </div>
      `;

      const opt = {
        margin: 10,
        filename: `TCO-Analyse_${new Date().toISOString().split("T")[0]}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" as const },
      };

      await html2pdf().set(opt).from(content).save();
    } catch (error) {
      console.error("PDF export failed:", error);
    } finally {
      setIsExporting(false);
    }
  }, [result, fleetSize, tenant.appName, tenant.partnerName, tenant.poweredByLabel]);

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      size="lg"
      className="min-h-14 rounded-xl transition-all duration-300 hover:border-primary/50"
    >
      {isExporting ? (
        <>
          <div className="h-5 w-5 mr-2 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          PDF wird erstellt...
        </>
      ) : (
        <>
          <FileDown className="h-5 w-5 mr-2" />
          Als PDF exportieren
        </>
      )}
    </Button>
  );
}
