# CLAUDE.md - Farm Manager Development Context

## Project Overview
Farm Manager is a comprehensive web application for banana farm management in Kenya. It provides integrated platform for tracking farm health, managing tasks, monitoring growth, recording financial transactions, and sharing agricultural knowledge.

## Tech Stack
- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Server Actions, Drizzle ORM
- **Database**: Neon PostgreSQL (serverless) - REAL DATABASE, NOT MOCK DATA
- **Authentication**: NextAuth.js with email and Google OAuth
- **Deployment**: Vercel

## Architecture Patterns
- **Repository Pattern**: All data access abstracted in `/db/repositories` with real database operations
- **Server Actions**: Mutations and queries handled in `/app/actions`
- **Component Composition**: UI built from reusable, domain-specific components using shadcn/ui
- **Form Validation**: Zod schemas for all forms and data inputs with React Hook Form

## Database Schema Key Entities
- **Users**: Farm managers, consultants, workers with roles and permissions
- **Farms**: Core farm information with health scoring (18-point system)
- **Plots**: Individual plots within farms with layout management
- **Tasks**: Work assignments with status tracking (PENDING/IN_PROGRESS/COMPLETED)
- **Growth Records**: Plant development tracking
- **Farm Health Metrics**: 11 criteria scoring system
- **Financial Records**: Sales and expenses tracking

## Farm Health Scoring System (Critical Business Logic)
11 criteria totaling 18 points:
1. Watering (0-4 pts), 2. Weeding (0-2 pts), 3. Desuckering (0-2 pts)
4. Deleafing (0-1 pt), 5. Cutting Miramba (0-1 pt), 6. Pest Control (0-2 pts)
7. Propping (0-1 pt), 8. Mature Plantains (0-1 pt), 9. Banana Health (0-3 pts)
10. Fencing (0-1 pt), 11. Under Reporting (-4 to 0 pts)
- **Good**: 70-100%, **Average**: 50-69%, **Poor**: 0-49%

## Design Principles
- **Clarity & Efficiency**: Clean, functional design prioritizing user workflow
- **Progressive Disclosure**: Complex info revealed progressively, avoid overwhelming
- **Contextual Actions**: Actions presented where needed, not scattered
- **Card-Based Layouts**: Consistent card patterns for list views
- **Responsive Design**: Mobile-first approach with proper breakpoints

## Development Guidelines
- **Read files before editing**: Always understand existing code structure
- **Follow existing patterns**: Reuse component structures (especially modal patterns)
- **Clean Code Practices**: Meaningful names, single responsibility, DRY principles
- **Type Safety**: Use TypeScript and Zod schemas for all data operations
- **No Database Schema Changes**: Work with existing database structure

## Current Task Management
- **Data Flow**: page.tsx → TasksClient.tsx → TaskCard.tsx
- **Repository**: task-repository.ts handles all database operations
- **Server Actions**: task-actions.ts provides mutation operations
- **UI Pattern**: Card-based grid layout with status tabs

## Key Files to Understand Before Changes
- `/db/schema.ts` - Database schema and relationships
- `/db/repositories/task-repository.ts` - Data access patterns
- `/app/actions/task-actions.ts` - Server action patterns
- `/components/tasks/task-card.tsx` - Current UI component
- `/components/modals/task-form-modal.tsx` - Modal pattern reference

## Testing Commands
- Run linting: `npm run lint` (check if exists in package.json)
- Run type checking: `npm run typecheck` (check if exists in package.json)
- Run tests: Check package.json for test scripts

## Important Notes
- NO MOCK DATA - All data comes from real Neon PostgreSQL database
- Maintain existing functionality while adding new features
- Follow shadcn/ui component patterns for consistency
- Use existing repository and server action architecture
- Keep TaskCard clean and uncluttered per design principles