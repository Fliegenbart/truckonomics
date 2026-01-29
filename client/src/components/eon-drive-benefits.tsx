import { Zap, Leaf, FileText, Wrench, ArrowRight } from "lucide-react";
import { EonDriveLogo } from "./eon-drive-logo";

const benefits = [
  {
    icon: Zap,
    title: "Ladeinfrastruktur",
    description: "Komplette Depot-Charging Lösung aus einer Hand",
  },
  {
    icon: Leaf,
    title: "Grüner Strom",
    description: "100% Ökostrom-Tarif für Ihre Flotte",
  },
  {
    icon: FileText,
    title: "Fördermittel",
    description: "Unterstützung bei der Beantragung von Förderungen",
  },
  {
    icon: Wrench,
    title: "Full Service",
    description: "24/7 Wartung & technischer Support",
  },
];

export function EonDriveBenefits() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-card via-card to-primary/5 border border-card-border rounded-2xl p-8 shadow-sm">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-chart-2/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
              Ihr Partner für E-Mobilität
            </p>
            <h3 className="text-2xl font-semibold">
              Elektrifizierung mit <span className="text-primary">E.ON Drive</span>
            </h3>
          </div>
          <div className="hidden sm:block">
            <EonDriveLogo className="h-8 w-auto opacity-80" />
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="group flex items-start gap-4 p-4 rounded-xl bg-background/50 hover:bg-background/80 border border-transparent hover:border-primary/10 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex-shrink-0 p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                <benefit.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">{benefit.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Link */}
        <a
          href="https://www.eon.de/de/geschaeftskunden/e-mobilitaet.html"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
        >
          Mehr über E.ON Drive erfahren
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </div>
  );
}
