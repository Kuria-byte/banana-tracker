# Banana Tracker: Codebase Architecture & Data Flow Analysis (2024 Update)

## 1. High-Level Architecture

**System Overview:**
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js Server Actions, Drizzle ORM, Neon PostgreSQL (integration in progress)
- **Data Layer:** Repository pattern with fallback to mock data, Zod validation schemas
- **Authentication:** Stack Auth (integration in progress), mock auth for now

**Key Patterns:**
- **Repository Pattern:** All data access (DB or mock) is abstracted in `/db/repositories`
- **Server Actions:** All mutations and queries are handled in `/app/actions`
- **Component Composition:** UI is built from reusable, domain-specific components
- **Validation:** Zod schemas in `/lib/validations` for all forms and data

---

## 2. File & Directory Organization

- `/app`: Next.js routes, layouts, server actions, and page-level logic
- `/components`: UI, feature, modal, and form components
- `/db`: Drizzle schema, DB client, and repository implementations
- `/lib`: Mock data, type definitions, validation schemas, and utilities
- `/public`, `/styles`, `/scripts`: Static assets, global styles, and scripts

---

## 3. Key Components & Responsibilities

### A. **Server Actions (`/app/actions`)**
- **Purpose:** Orchestrate all data mutations and queries, acting as the bridge between UI and data layer.
- **Pattern:** Each entity (farm, task, etc.) has its own action file (e.g., `farm-actions.ts`).
- **Data Flow:** Actions call repository functions, which attempt DB access and fallback to mock data if needed.

### B. **Repositories (`/db/repositories`)**
- **Purpose:** Encapsulate all data access logic (CRUD for DB and mock).
- **Pattern:** Each entity has a repository (e.g., `farm-repository.ts`, `task-repository.ts`).
- **Fallback:** If DB fails or is not available, fallback functions use mock data.
- **Aggregate Data:** Some repositories (e.g., `farm-plot-aggregate-repository.ts`) provide joined/aggregated data for dashboards.

### C. **Database Schema (`/db/schema.ts`)**
- **Entities:** Users, Farms, Plots, Tasks, Growth Records, Harvests, Sales, Expenses, Budgets, Buyers, etc.
- **Relationships:** Foreign keys link users, farms, plots, and tasks.
- **Enums:** Used for status, roles, payment methods, etc.
- **Status:** Schema is robust and production-ready, but not all tables are fully utilized yet.

### D. **Mock Data (`/lib/mock-data.ts`)**
- **Purpose:** Provides fallback and development data for all entities.
- **Pattern:** TypeScript interfaces mirror DB schema for consistency.
- **Transition:** Gradually being replaced by real DB operations.

### E. **UI Components (`/components`)**
- **Structure:** Organized by domain (dashboard, farms, tasks, etc.) and type (forms, modals, cards).
- **Reusability:** High for UI primitives (shadcn/ui), medium for forms and modals, lower for feature-specific components.
- **Data Flow:** Components receive data via props, often from server actions or page-level data fetching.

### F. **Pages & Routing (`/app`)**
- **Pattern:** Each feature has its own route directory (e.g., `/app/farms`, `/app/tasks`).
- **Data Fetching:** Server components fetch data via repositories and pass to client components.
- **Authentication:** Server-side user checks using Stack Auth (mocked for now).

---

## 4. Data Flow & Interdependencies

### **Typical Data Flow:**
1. **User Action:** Triggers a form submission or navigation.
2. **Server Action:** Called from UI, performs validation, and calls repository.
3. **Repository:** Attempts DB operation; falls back to mock data if needed.
4. **Data Transformation:** Repository maps DB rows to domain models.
5. **UI Update:** Data is passed to components for rendering; revalidation triggers UI refresh.

### **Example: Farm Creation**
- `FarmForm` (component) → `createFarm` (server action) → `farm-repository.createFarm` (DB or mock) → UI revalidates `/farms` page.

### **Interdependencies:**
- **Repositories** are the single source of truth for data access.
- **Server Actions** depend on repositories for all data.
- **UI Components** depend on server actions for data and mutations.
- **Validation Schemas** are shared between forms and server actions for consistency.

---

## 5. Current State & Gaps

### **Progress**
- **DB Integration:** Most repositories now attempt real DB access first, with mock fallback.
- **Server Actions:** All major entities use server actions for CRUD.
- **UI:** Highly modular, with clear separation of concerns and strong TypeScript typing.
- **Authentication:** Stack Auth integration started, but not fully enforced.

### **Gaps & Improvement Areas**
- **Full DB Migration:** Some features (especially tasks, growth, and health) still rely on mock data for fallback. Complete the transition to DB for all entities.
- **Error Handling:** Improve error boundaries and user feedback for failed operations.
- **Data Consistency:** Ensure all data transformations (DB → model → UI) are type-safe and consistent.
- **Testing:** Add unit and integration tests for repositories, server actions, and critical UI flows.
- **Performance:** Implement pagination, loading states, and optimize large data queries.
- **Authentication & Authorization:** Enforce real auth and role-based access throughout server actions and UI.
- **Documentation:** Expand code comments and API docs, especially for complex data flows and business logic.

---

## 6. Living Document & Collaboration

- **Update this document** with every major architectural or data flow change.
- **Reference this for onboarding** new developers and for planning refactors or new features.
- **Use the repository pattern** for all new data access to ensure consistency and testability.
- **Prioritize**: Complete DB migration, robust error handling, and full authentication integration.

---

## 7. Visual Data Flow (Example)

```plaintext
[UI Form] 
   ↓
[Server Action] 
   ↓
[Repository (DB → fallback to mock)] 
   ↓
[Data Transformation] 
   ↓
[UI Component]
```

---

## 8. Next Steps

1. **Finish DB migration** for all entities (remove mock fallback where possible).
2. **Enforce authentication** and role-based access in all server actions.
3. **Add error boundaries** and user-friendly error messages.
4. **Implement tests** for repositories and server actions.
5. **Document** all new features and data flows in this living document.

---

## 9. Common Pitfall: Mixing Client and Server Logic in Next.js (App Router)

### The Problem
- **Mixing client and server logic** (e.g., importing and calling server/database code in Client Components or in useEffect) can cause runtime errors, such as:
  - `Error: DATABASE_URL environment variable is not set`
  - This happens because environment variables and server-only code are not available in the browser.
- In our project, this occurred when a Client Component (`FarmForm`) tried to fetch users directly from the database using a repository function, causing the database code to run in the browser.

### How to Avoid This
- **Never import or call server/database code in Client Components.**
- **Always fetch data in Server Components or server actions, and pass it as props to Client Components.**
- For forms or modals that need server data (e.g., user lists), fetch the data in the parent Server Component and pass it down.
- Use API routes or server actions for dynamic client-side fetching if needed, but prefer server-side data fetching for initial render.

### Best Practices for Component & Page Structure
- **Server Components**: Fetch all required data (DB, API, etc.) and pass to child components as props.
- **Client Components**: Use only for interactivity, UI state, and form handling. Receive all data via props.
- **Modals/Forms**: If they need server data, require it as a prop and let the parent fetch it.
- **Never access environment variables or database code in the browser.**

### Example Solution
```tsx
// Server Component (page or parent)
import { getAllUsers } from "@/db/repositories/user-repository";
import { FarmForm } from "@/components/forms/farm-form";

export default async function FarmPage() {
  const users = await getAllUsers(); // server-side
  return <FarmForm users={users} />;
}

// Client Component (form)
export function FarmForm({ users }) {
  // Use users prop directly
}
```

### Summary
- **Always keep server and client logic separate.**
- **Fetch data on the server, pass as props to the client.**
- This avoids environment variable errors and ensures secure, maintainable code.

---

**This document should be versioned and updated as the codebase evolves.**