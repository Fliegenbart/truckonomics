import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Share2, Check } from "lucide-react";
import { EonDriveLogo } from "./eon-drive-logo";

interface ConsultationCTAProps {
  onExportPdf?: () => void;
  isPdfExporting?: boolean;
}

export function ConsultationCTA({ onExportPdf, isPdfExporting }: ConsultationCTAProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="border border-border bg-card">
      <div className="grid lg:grid-cols-2">
        {/* Left - Text Content */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          <p className="label-editorial mb-4">Nächster Schritt</p>
          <h3 className="font-serif text-2xl sm:text-3xl font-medium mb-4">
            Bereit für die Elektrifizierung?
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
            Lassen Sie sich von unseren E-Mobilitäts-Experten zu Ihrer individuellen Flottenstrategie beraten.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 min-h-12 px-6"
            >
              <a
                href="https://www.eon.de/de/geschaeftskunden/e-mobilitaet/kontakt.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                Beratung anfragen
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>

            <Button
              onClick={handleShare}
              variant="outline"
              size="lg"
              className="min-h-12 px-6 border-border"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Kopiert
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Teilen
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right - Brand Panel */}
        <div className="bg-foreground/[0.03] p-8 lg:p-12 flex flex-col justify-center items-center border-t lg:border-t-0 lg:border-l border-border">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">Powered by</p>
            <EonDriveLogo className="h-12 w-auto mx-auto mb-6" />
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Ihr Partner für die Elektrifizierung von Nutzfahrzeugflotten
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
