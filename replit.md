# Truckonomics - Heavy-Duty Truck TCO Calculator

## Overview

A web-based Total Cost of Ownership (TCO) calculator designed to compare Class 8 heavy-duty diesel semi-trucks against electric truck alternatives. The application performs stateless calculations to help users make informed financial decisions about commercial truck purchases by analyzing purchase price, fuel costs, maintenance, insurance, and break-even points over customizable timeframes (3-20 years).

**Branding**: The application is branded as "Truckonomics" with a hero-style header featuring a professional Class 8 semi-truck image and modern Apple-inspired design aesthetics.

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

**API Design**: RESTful API with calculation and persistence endpoints:
- `POST /api/calculate-tco`: Accepts truck parameters and timeframe, returns comprehensive TCO analysis
- `GET /api/scenarios`: Retrieve all saved scenarios
- `POST /api/scenarios`: Save new scenario configuration
- `PATCH /api/scenarios/:id`: Update existing scenario
- `DELETE /api/scenarios/:id`: Delete saved scenario

**Calculation Engine**: Server-side TypeScript functions that:
- Calculate yearly cost breakdowns (fuel, maintenance, insurance)
- Compute cumulative costs over timeframes
- Determine break-even points between diesel and electric options
- Identify optimal electric truck choice based on total cost

**Data Flow**: Hybrid model - TCO calculations are stateless (performed on-demand), while scenario configurations can be persisted to database for later retrieval and comparison. No session management or user authentication required.

**Validation**: Zod schemas shared between client and server for type-safe data validation. Truck parameters validated for:
- Positive numeric values for costs and mileage
- Lifespan constraints (1-30 years)
- Required string fields (truck names)

**Development Server**: Vite integration with HMR (Hot Module Replacement) for efficient development workflow. Express middleware serves Vite's development server in dev mode.

### Data Storage Solutions

**Storage Architecture**: PostgreSQL database via Neon serverless with Drizzle ORM for scenario persistence.

**Database Tables**:
- `scenarios`: Stores saved truck comparison configurations
  - id (serial primary key)
  - name (text)
  - dieselTruck, electricTruck1, electricTruck2 (JSONB)
  - timeframeYears (integer)
  - taxIncentiveRegion (text)
  - createdAt, updatedAt (timestamps)

**API Endpoints**:
- `GET /api/scenarios` - List all saved scenarios
- `GET /api/scenarios/:id` - Retrieve specific scenario
- `POST /api/scenarios` - Save new scenario
- `PATCH /api/scenarios/:id` - Update scenario
- `DELETE /api/scenarios/:id` - Delete scenario

**Storage Interface**: DatabaseStorage class implements IStorage interface providing CRUD operations for scenarios.

**Rationale**: While TCO calculations are stateless, users requested the ability to save and compare multiple configurations over time. JSONB columns store truck parameters flexibly while timestamps track scenario modifications.

### Authentication and Authorization

**Current Implementation**: None. The application is public and requires no user accounts or authentication.

**Design Decision**: As a calculation tool without data persistence, authentication would add unnecessary complexity without providing value. Users can perform calculations anonymously.

### External Dependencies

**Database**: 
- Drizzle ORM with PostgreSQL via `@neondatabase/serverless`
- Neon serverless connection with WebSocket support
- Connection string via `DATABASE_URL` environment variable
- Active scenario persistence with CRUD operations

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