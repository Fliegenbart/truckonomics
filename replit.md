# Truck TCO Calculator

## Overview

A web-based Total Cost of Ownership (TCO) calculator designed to compare diesel trucks against electric truck alternatives. The application performs stateless calculations to help users make informed financial decisions about truck purchases by analyzing purchase price, fuel costs, maintenance, insurance, and break-even points over customizable timeframes (3-20 years).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Wouter for lightweight client-side routing. The application uses a minimal routing structure with a home page for the calculator and a 404 fallback.

**UI Framework**: Shadcn UI (New York style variant) built on Radix UI primitives with Tailwind CSS for styling. This provides a comprehensive component library with accessible, customizable components.

**Design System**: Carbon Design System principles focusing on clarity, scannable information architecture, and professional aesthetics. The color palette uses neutral tones with professional blue for primary actions and green/orange for savings/cost indicators.

**State Management**: 
- React Hook Form with Zod resolvers for form validation
- TanStack Query (React Query) for server state management (though this app performs stateless calculations)
- Local component state for UI interactions

**Data Visualization**: Recharts library for rendering interactive charts including:
- Amortization timeline (line chart showing cumulative costs)
- Cost breakdown (stacked bar chart by category)
- Year-by-year comparison tables

**Typography**: Inter font family loaded via Google Fonts with specific size scales for headings (32px), section headers (24px), body text (14px), and data values (16px with tabular numbers).

**Theme Support**: Built-in light/dark mode toggle with theme persistence via localStorage. Theme variables defined in CSS custom properties with automatic computation for interactive states.

### Backend Architecture

**Runtime**: Node.js with Express.js server framework.

**API Design**: RESTful API with a single primary endpoint:
- `POST /api/calculate-tco`: Accepts truck parameters and timeframe, returns comprehensive TCO analysis

**Calculation Engine**: Server-side TypeScript functions that:
- Calculate yearly cost breakdowns (fuel, maintenance, insurance)
- Compute cumulative costs over timeframes
- Determine break-even points between diesel and electric options
- Identify optimal electric truck choice based on total cost

**Data Flow**: Stateless request/response model. No session management or persistent storage required as calculations are performed on-demand based on user inputs.

**Validation**: Zod schemas shared between client and server for type-safe data validation. Truck parameters validated for:
- Positive numeric values for costs and mileage
- Lifespan constraints (1-30 years)
- Required string fields (truck names)

**Development Server**: Vite integration with HMR (Hot Module Replacement) for efficient development workflow. Express middleware serves Vite's development server in dev mode.

### Data Storage Solutions

**Storage Architecture**: No persistent database required. The application is completely stateless.

**Rationale**: TCO calculations are deterministic based on input parameters. There's no need to store user data, calculation history, or session state. This simplifies deployment and eliminates database overhead.

**Schema Definition**: Drizzle ORM configuration exists for potential future database integration (PostgreSQL via Neon), but is not currently utilized. The schema file defines TypeScript types using Zod for runtime validation.

### Authentication and Authorization

**Current Implementation**: None. The application is public and requires no user accounts or authentication.

**Design Decision**: As a calculation tool without data persistence, authentication would add unnecessary complexity without providing value. Users can perform calculations anonymously.

### External Dependencies

**Database**: 
- Drizzle ORM configured for PostgreSQL (via `@neondatabase/serverless`)
- Connection string expected via `DATABASE_URL` environment variable
- Currently unused but infrastructure prepared for future features

**UI Libraries**:
- Radix UI primitives for accessible component foundations
- Recharts for data visualization
- Lucide React for iconography
- Tailwind CSS for utility-first styling

**Form Management**:
- React Hook Form for form state and validation
- Hookform Resolvers for Zod schema integration

**Utilities**:
- date-fns for date manipulation
- clsx and tailwind-merge for conditional class name composition
- class-variance-authority for component variant management

**Development Tools**:
- TypeScript for type safety across client and server
- Vite plugins for Replit integration (runtime error overlay, dev banner, cartographer)
- ESBuild for production server bundling
- PostCSS with Autoprefixer for CSS processing

**Key Architectural Decisions**:

1. **Stateless Calculation Model**: Chose to perform calculations on-demand rather than caching results, prioritizing simplicity and reducing infrastructure requirements.

2. **Shared Schema Validation**: Using Zod schemas in a shared directory allows both client and server to validate data with identical rules, preventing type mismatches and validation discrepancies.

3. **Component-Driven UI**: Shadcn UI provides a balance between pre-built components and customization, avoiding the weight of full UI frameworks while maintaining consistency.

4. **Monorepo Structure**: Client and server code in a single repository with shared types enables faster development and easier maintenance, though requires careful path aliasing configuration.