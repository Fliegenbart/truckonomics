import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import type { LucideIcon } from "lucide-react";
import { FileText, Leaf, Wrench, Zap } from "lucide-react";
import { EonDriveLogo } from "@/components/eon-drive-logo";

export type TenantId = "eon";

export interface TenantBenefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface TenantConfig {
  id: TenantId;
  appName: string;
  poweredByLabel: string;
  partnerName: string;
  PartnerLogo: React.ComponentType<{ className?: string }>;
  links: {
    contact: string;
    learnMore: string;
  };
  benefits: TenantBenefit[];
}

const TENANTS: Record<TenantId, TenantConfig> = {
  eon: {
    id: "eon",
    appName: "Truckonomics",
    poweredByLabel: "powered by",
    partnerName: "E.ON Drive",
    PartnerLogo: EonDriveLogo,
    links: {
      contact: "https://www.eon.de/de/geschaeftskunden/e-mobilitaet/kontakt.html",
      learnMore: "https://www.eon.de/de/geschaeftskunden/e-mobilitaet.html",
    },
    benefits: [
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
    ],
  },
};

function getTenantIdFromUrl(): TenantId {
  try {
    const tenantParam = new URLSearchParams(window.location.search).get("tenant");
    if (tenantParam && tenantParam in TENANTS) {
      return tenantParam as TenantId;
    }
  } catch {
    // noop
  }
  return "eon";
}

function getEmbedModeFromUrl(pathname: string): boolean {
  if (pathname.startsWith("/embed")) return true;
  try {
    const embedParam = new URLSearchParams(window.location.search).get("embed");
    return embedParam === "1" || embedParam === "true";
  } catch {
    return false;
  }
}

type TenantContextValue = {
  tenant: TenantConfig;
  embed: boolean;
};

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [pathname] = useLocation();

  const value = useMemo<TenantContextValue>(() => {
    const id = getTenantIdFromUrl();
    return {
      tenant: TENANTS[id],
      embed: getEmbedModeFromUrl(pathname),
    };
  }, [pathname]);

  useEffect(() => {
    document.documentElement.dataset.tenant = value.tenant.id;
    document.documentElement.dataset.embed = value.embed ? "1" : "0";
  }, [value.tenant.id, value.embed]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error("useTenant must be used within TenantProvider");
  }
  return ctx;
}
