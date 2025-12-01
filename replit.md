# Truckonomics - Schwerlast-LKW TCO-Rechner

## Übersicht

Ein webbasierter Gesamtbetriebskosten-Rechner (TCO) zum Vergleich von schweren Diesel-Sattelzügen (40-Tonner) mit Elektro-Alternativen. Die Anwendung führt zustandslose Berechnungen durch, um Benutzern bei fundierten finanziellen Entscheidungen beim Kauf von Nutzfahrzeugen zu helfen. Analysiert werden Kaufpreis, Kraftstoffkosten, Wartung, Versicherung und Amortisationspunkte über wählbare Zeiträume (3-20 Jahre).

**Branding**: Die Anwendung heißt "Truckonomics" mit einem Hero-Header mit professionellem Sattelzug-Bild und modernem Apple-inspiriertem Design.

**Sprache**: Deutsch (de-DE)
**Währung**: Euro (€)

## Benutzereinstellungen

Bevorzugter Kommunikationsstil: Einfache, alltägliche Sprache.

## Systemarchitektur

### Frontend-Architektur

**Framework**: React 18 mit TypeScript, Vite als Build-Tool und Entwicklungsserver.

**Routing**: Wouter für leichtgewichtiges Client-seitiges Routing. Minimale Routing-Struktur mit einer Startseite für den Rechner und einer 404-Fallback-Seite.

**UI-Framework**: Shadcn UI (New York Style Variante) basierend auf Radix UI Primitiven mit Tailwind CSS für Styling. Bietet eine umfassende Komponentenbibliothek mit barrierefreien, anpassbaren Komponenten.

**Design-System**: Premium Apple/Jony Ive-inspirierte Ästhetik mit:
- Animiertem Gradient-Mesh-Hintergrund
- Glasmorphismus-Effekte (Backdrop-Blur)
- Lebhaftes Blau als Primärfarbe (210 100% 55%)
- Subtile lila Gradient-Akzente
- Großzügige Weißräume
- Feine Interaktionsanimationen (300-700ms Übergänge)
- Blaue Schatten-Töne

**State Management**: 
- React Hook Form mit Zod Resolvers für Formular-Validierung
- TanStack Query (React Query) für Server State Management
- Lokaler Komponentenstatus für UI-Interaktionen

**Datenvisualisierung**: Recharts-Bibliothek für interaktive Diagramme:
- Amortisationszeitraum (Liniendiagramm mit kumulativen Kosten)
- Kostenaufschlüsselung (Gestapeltes Balkendiagramm nach Kategorie)
- Jahres-Vergleichstabellen

**Typografie**: Inter Schriftfamilie via Google Fonts mit spezifischen Größenskalen.

**Theme-Unterstützung**: Integrierter Hell-/Dunkelmodus-Toggle mit Theme-Persistenz via localStorage.

### Backend-Architektur

**Runtime**: Node.js mit Express.js Server-Framework.

**API-Design**: RESTful API mit Berechnungs- und Persistenz-Endpunkten:
- `POST /api/calculate-tco`: Akzeptiert LKW-Parameter und Zeitraum, gibt umfassende TCO-Analyse zurück
- `GET /api/scenarios`: Alle gespeicherten Szenarien abrufen
- `POST /api/scenarios`: Neues Szenario speichern
- `PATCH /api/scenarios/:id`: Bestehendes Szenario aktualisieren
- `DELETE /api/scenarios/:id`: Gespeichertes Szenario löschen

**Berechnungs-Engine**: Server-seitige TypeScript-Funktionen:
- Jährliche Kostenaufschlüsselung (Kraftstoff, Wartung, Versicherung)
- Kumulative Kosten über Zeiträume
- Amortisationspunkte zwischen Diesel und Elektro
- Optimale Elektro-LKW-Auswahl basierend auf Gesamtkosten

**Validierung**: Zod-Schemas zwischen Client und Server geteilt für typsichere Datenvalidierung.

### Datenspeicherung

**Speicherarchitektur**: PostgreSQL-Datenbank via Neon Serverless mit Drizzle ORM für Szenario-Persistenz.

**Datenbank-Tabellen**:
- `scenarios`: Speichert gespeicherte LKW-Vergleichskonfigurationen
  - id (Serial Primary Key)
  - name (Text)
  - dieselTruck, electricTruck1, electricTruck2 (JSONB)
  - timeframeYears (Integer)
  - taxIncentiveRegion (Text)
  - createdAt, updatedAt (Timestamps)

### LKW-Voreinstellungen (Europäische Modelle)

**Diesel-LKWs** (5 Modelle):
- Mercedes-Benz Actros
- MAN TGX
- Scania R-Serie
- Volvo FH
- DAF XG+

**Elektro-LKWs** (14 Modelle):
- Mercedes-Benz eActros 600 (Fernverkehr, 621 kWh, 500 km)
- Mercedes-Benz eActros 400 (Verteiler, 414 kWh, 480 km)
- Mercedes-Benz eActros 300 (Nahverkehr, 336 kWh, 330 km)
- MAN eTGX (6 Batterien, 560 kWh, 500 km)
- Volvo FH Electric (540 kWh, 345 km)
- Volvo FH Aero Electric 600 km (780 kWh, 600 km)
- Volvo FM Electric (Verteiler, 540 kWh, 380 km)
- DAF XF Electric (525 kWh, 500 km)
- DAF XD Electric (Verteiler, 420 kWh, 350 km)
- Scania 40 R BEV (6 Batterien, 624 kWh, 350 km)
- Renault E-Tech T 585 (585 kWh, 460 km)
- Renault E-Tech T 780 (780 kWh, 600 km)
- Iveco S-eWay BEV (738 kWh, 530 km)
- BYD ETH8 (Nahverkehr, 255 kWh, 200 km)

### Förderungsregionen (Deutschland)

- Nur Bundesförderung (KsNI-Förderung)
- Bayern
- Baden-Württemberg
- Nordrhein-Westfalen
- Niedersachsen
- Keine Förderung

### Technische Spezifikationen

Jedes Fahrzeug kann optionale technische Spezifikationen haben, die in aufklappbaren Bereichen angezeigt werden:

**Gewicht & Konfiguration**:
- Zulässiges Gesamtgewicht (kg)
- Zuggesamtgewicht (kg)
- Achskonfiguration (4x2, 6x2, 6x4, 8x4)
- Nutzlast (kg)

**Antrieb & Leistung**:
- Leistung (kW und PS)
- Drehmoment (Nm)
- Reichweite (km)

**Energie**:
- Diesel: Tankkapazität (L)
- Elektro: Batteriekapazität (kWh), Ladeleistung AC/DC (kW)

**Abmessungen**:
- Länge (mm)
- Höhe (mm)
- Fahrerhaus-Typ (Fernverkehr, Verteiler, Nahverkehr, Kipper)

Die technischen Spezifikationen werden in einer Vergleichstabelle in den Ergebnissen angezeigt, sind aber derzeit rein informativ und beeinflussen nicht die TCO-Berechnung.

### Einheiten

**Kraftstoffeffizienz**:
- Diesel: L/100km (Liter pro 100 Kilometer)
- Elektro: kWh/100km (Kilowattstunden pro 100 Kilometer)

**Kraftstoffkosten**:
- Diesel: €/L (Euro pro Liter)
- Elektro: €/kWh (Euro pro Kilowattstunde)

**CO₂-Emissionen**: kg CO₂ (basierend auf deutschem Strommix: 0,38 kg CO₂/kWh)

### Authentifizierung und Autorisierung

**Aktuelle Implementierung**: Keine. Die Anwendung ist öffentlich und erfordert keine Benutzerkonten.

### Externe Abhängigkeiten

**Datenbank**: 
- Drizzle ORM mit PostgreSQL via `@neondatabase/serverless`
- Neon Serverless-Verbindung mit WebSocket-Unterstützung
- Verbindungsstring via `DATABASE_URL` Umgebungsvariable

**UI-Bibliotheken**:
- Radix UI Primitive für barrierefreie Komponenten
- Recharts für Datenvisualisierung
- Lucide React für Icons
- Tailwind CSS für Utility-First Styling

**Formular-Management**:
- React Hook Form für Formular-Status und Validierung
- Hookform Resolvers für Zod-Schema-Integration

**Entwicklungswerkzeuge**:
- TypeScript für Typsicherheit
- Vite Plugins für Replit-Integration
- ESBuild für Produktions-Server-Bundling

### Wichtige Architekturentscheidungen

1. **Zustandsloses Berechnungsmodell**: Berechnungen werden bei Bedarf durchgeführt statt gecacht.

2. **Geteilte Schema-Validierung**: Zod-Schemas im shared-Verzeichnis ermöglichen Client und Server identische Validierungsregeln.

3. **Komponentengetriebene UI**: Shadcn UI bietet Balance zwischen vorgefertigten Komponenten und Anpassungsmöglichkeiten.

4. **Monorepo-Struktur**: Client- und Server-Code in einem Repository mit geteilten Typen.
