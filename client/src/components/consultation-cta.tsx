import { useMemo, useState } from "react";
import type { ComparisonResult, TaxIncentiveRegion, TruckParameters } from "@shared/schema";
import { useTenant } from "@/lib/tenant";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, Check, Send, Share2 } from "lucide-react";

interface ConsultationCTAProps {
  result: ComparisonResult;
  inputs: {
    dieselTruck: TruckParameters;
    electricTruck1: TruckParameters;
    electricTruck2: TruckParameters;
    timeframeYears: number;
    taxIncentiveRegion: TaxIncentiveRegion;
    fleetSize: number;
  };
}

export function ConsultationCTA({ result, inputs }: ConsultationCTAProps) {
  const { tenant, embed } = useTenant();
  const { toast } = useToast();
  const PartnerLogo = tenant.PartnerLogo;

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot

  const bestElectric = useMemo(() => {
    return result.bestElectricOption === "electric1"
      ? result.electric1Analysis
      : result.electric2Analysis;
  }, [result]);

  const bestBreakEven = useMemo(() => {
    return result.bestElectricOption === "electric1"
      ? result.dieselVsElectric1
      : result.dieselVsElectric2;
  }, [result]);

  const handleShare = async () => {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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

  const submitLead = async () => {
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Bitte ausfüllen",
        description: "Name und E-Mail sind erforderlich.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const utm: Record<string, string> = {};
      params.forEach((v, k) => {
        if (k.startsWith("utm_") || k === "source" || k === "tenant") {
          utm[k] = v;
        }
      });

      await apiRequest("POST", "/api/leads", {
        tenant: tenant.id,
        embed,
        url: window.location.href,
        utm,
        website,
        contact: {
          company: company.trim() || undefined,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          message: message.trim() || undefined,
        },
        calculation: {
          timeframeYears: inputs.timeframeYears,
          taxIncentiveRegion: inputs.taxIncentiveRegion,
          fleetSize: inputs.fleetSize,
          bestElectricName: bestElectric.name,
          maxSavings: result.maxSavings,
          breakEvenYear: bestBreakEven.breakEvenYear,
          breakEvenMonth: bestBreakEven.breakEvenMonth,
        },
        inputs,
      });

      toast({
        title: "Danke!",
        description: "Ihre Anfrage wurde übermittelt. Wir melden uns zeitnah.",
      });
      setOpen(false);
      setCompany("");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setWebsite("");
    } catch (err) {
      console.error(err);
      toast({
        title: "Senden fehlgeschlagen",
        description: "Bitte versuchen Sie es in ein paar Minuten erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="border border-border bg-card">
        <div className={embed ? "" : "grid lg:grid-cols-2"}>
          {/* Left - Text Content */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <p className="label-editorial mb-4">Nächster Schritt</p>
            <h3 className="font-serif text-2xl sm:text-3xl font-medium mb-4">
              Angebot & Umsetzung besprechen?
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
              Teilen Sie uns kurz Ihre Kontaktdaten mit. Wir melden uns mit einer Einordnung
              Ihrer Ergebnisse und den nächsten Schritten.
            </p>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setOpen(true)}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 min-h-12 px-6"
                data-testid="button-lead-open"
              >
                Beratung anfragen
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              {!embed && (
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="lg"
                  className="min-h-12 px-6 border-border"
                  data-testid="button-share"
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
              )}
            </div>

            <p className="text-xs text-muted-foreground mt-6 max-w-md">
              Hinweis: Datenschutz/Einwilligungstext wird für den Go-Live noch finalisiert.
            </p>
          </div>

          {/* Right - Brand Panel */}
          {!embed && (
            <div className="bg-foreground/[0.03] p-8 lg:p-12 flex flex-col justify-center items-center border-t lg:border-t-0 lg:border-l border-border">
              <div className="text-center">
                <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">
                  {tenant.poweredByLabel}
                </p>
                <PartnerLogo className="h-12 w-auto mx-auto mb-6" />
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Ihr Partner für die Elektrifizierung von Nutzfahrzeugflotten
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Beratung anfragen</DialogTitle>
            <DialogDescription>
              Wir nutzen Ihre Angaben, um Sie zu kontaktieren und die TCO-Ergebnisse einzuordnen.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              submitLead();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="lead-company">Unternehmen (optional)</Label>
              <Input
                id="lead-company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                autoComplete="organization"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lead-name">Name *</Label>
                <Input
                  id="lead-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-phone">Telefon (optional)</Label>
                <Input
                  id="lead-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-email">E-Mail *</Label>
              <Input
                id="lead-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-message">Nachricht (optional)</Label>
              <Textarea
                id="lead-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="z.B. geplanter Umstellungszeitpunkt, Depotstandort, Ladefenster ..."
              />
            </div>

            {/* Honeypot field (hidden) */}
            <div className="hidden" aria-hidden="true">
              <Label htmlFor="lead-website">Website</Label>
              <Input
                id="lead-website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.open(tenant.links.contact, "_blank", "noopener,noreferrer")}
                className="border-border"
              >
                Direktlink
              </Button>

              <Button type="submit" disabled={isSubmitting} className="min-w-40">
                {isSubmitting ? (
                  "Senden..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Anfrage senden
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
