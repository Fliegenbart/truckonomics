import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PhoneCall, Share2, Check, Copy, ExternalLink } from "lucide-react";
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
    <div className="relative overflow-hidden">
      {/* Main CTA Card */}
      <div className="relative bg-gradient-to-br from-primary via-primary to-primary/90 rounded-2xl p-8 sm:p-10 text-primary-foreground shadow-xl">
        {/* Decorative pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full text-sm font-medium mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Kostenlose Erstberatung
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold mb-3">
              Bereit für die Elektrifizierung?
            </h3>
            <p className="text-primary-foreground/80 text-lg max-w-lg">
              Lassen Sie sich von unseren E-Mobilitäts-Experten zu Ihrer individuellen Flottenstrategie beraten.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary hover:bg-white/90 shadow-lg min-h-14 px-8 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <a
                href="https://www.eon.de/de/geschaeftskunden/e-mobilitaet/kontakt.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <PhoneCall className="h-5 w-5" />
                Beratung anfragen
                <ExternalLink className="h-4 w-4 opacity-60" />
              </a>
            </Button>

            <div className="flex gap-3">
              <Button
                onClick={handleShare}
                variant="outline"
                size="lg"
                className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white min-h-14 rounded-xl transition-all duration-300"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Kopiert!
                  </>
                ) : (
                  <>
                    <Share2 className="h-5 w-5 mr-2" />
                    Teilen
                  </>
                )}
              </Button>

              {onExportPdf && (
                <Button
                  onClick={onExportPdf}
                  disabled={isPdfExporting}
                  variant="outline"
                  size="lg"
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white min-h-14 rounded-xl transition-all duration-300"
                >
                  {isPdfExporting ? (
                    <>
                      <div className="h-5 w-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Erstelle PDF...
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5 mr-2" />
                      PDF Export
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* E.ON Drive Logo */}
        <div className="absolute bottom-4 right-4 opacity-30">
          <EonDriveLogo className="h-6 w-auto" />
        </div>
      </div>
    </div>
  );
}
