# Farm Manager PRD

## 1. Executive Summary

Farm Manager is a comprehensive web application designed to streamline banana farm management operations in Kenya. The application provides an integrated platform for tracking farm health, managing tasks, monitoring growth, recording financial transactions, and sharing agricultural knowledge.

The application is built with a modern tech stack using Next.js, React, TypeScript, Tailwind CSS, and shadcn/ui for the frontend, with Server Actions and Drizzle ORM for the backend, all connected to a Neon PostgreSQL database. It implements the repository pattern for data access with fallback to mock data where necessary.

## 2. Target Audience

- **Farm Owners/Administrators**: Full access to all features including financial management
- **Farm Managers**: Manage day-to-day operations, tasks, and farm health
- **Field Workers**: Record growth data, complete tasks, and report issues

## 3. System Architecture Overview

### 3.1. Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Server Actions, Drizzle ORM
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: NextAuth.js with email and Google OAuth providers
- **State Management**: React Query for client-side data fetching
- **Form Handling**: React Hook Form with Zod validation

### 3.2. Architectural Patterns

- **Repository Pattern**: All data access is abstracted in `/db/repositories` with fallback to mock data
- **Server Actions**: Mutations and queries handled in `/app/actions`
- **Component Composition**: UI built from reusable, domain-specific components
- **Validation**: Zod schemas for all forms and data inputs

## 4. Core Features

### 4.1. Dashboard

The dashboard provides a comprehensive overview of farm operations and key metrics:

- **Farm Health Summary**: Visual representation of farm health statuses
- **Task Progress**: Overview of pending, in-progress, and completed tasks
- **Weather Information**: Current weather conditions for farm locations
- **Farm Statistics**: Total farms, total area, active tasks, health concerns
- **Insights Section**: Personalized recommendations based on farm data
- **Yield Summary**: Recent harvest data and trends

### 4.2. Farm Management

Farm management features allow for comprehensive tracking and management of all farms:

- **Farm Listing**: View, filter, and sort all farms
- **Farm Details**: Comprehensive view of farm information
- **Farm Creation and Editing**: Forms to add and update farm information
- **Farm Health Scoring**: Automated scoring based on defined criteria
- **Plot Management**: Track individual plots within farms
- **Farm Tasks**: Manage tasks specific to each farm

### 4.3. Task Management

Task management features enable efficient assignment and tracking of all farm-related tasks:

- **Task Listing**: View, filter, and sort all tasks
- **Task Creation and Assignment**: Assign tasks to team members
- **Task Status Tracking**: Monitor progress of tasks
- **Due Date Management**: Track and receive notifications for upcoming deadlines
- **Task Prioritization**: Set and filter tasks by priority level
- **Task Comments**: Add notes and updates to tasks

### 4.4. Financial Management

Financial management features provide comprehensive tracking of sales and expenses:

- **Sales Recording**: Track all sales transactions
- **Expense Tracking**: Record and categorize all expenses
- **Financial Dashboard**: Overview of revenue, expenses, and profit
- **Category Management**: Customize expense categories
- **Budget Planning**: Set and track budgets by category
- **Financial Reports**: Generate profit and loss statements

### 4.5. Growth Tracking

Growth tracking features allow for monitoring plant development and harvest planning:

- **Growth Stage Recording**: Track plant development stages
- **Harvest Forecasting**: Predict upcoming harvests based on growth data
- **Yield Tracking**: Record and analyze harvest yields
- **Historical Data Visualization**: View growth trends over time

### 4.6. Knowledge Base

The knowledge base provides a repository of agricultural information:

- **Article Listing**: Browse articles by category
- **Article Creation**: Admin can create and publish new articles
- **Content Search**: Find relevant information quickly
- **Category Browsing**: Explore articles by topic (cultivation, disease management, etc.)

### 4.7. Team Management

Team management features enable effective coordination of farm workers:

- **Team Member Listing**: View all team members
- **Role Assignment**: Assign roles and responsibilities
- **Farm Assignment**: Associate team members with specific farms
- **Activity Tracking**: Monitor team member actions

### 4.8. User Authentication

User authentication ensures secure access to the application:

- **Registration and Login**: Create accounts and authenticate users
- **Role-Based Access**: Control permissions based on user roles
- **Profile Management**: Update user information and preferences
- **Password Reset**: Secure password recovery

## 5. File Structure

```
farm-manager/
├── app/
│   ├── actions/
│   │   ├── auth-actions.ts
│   │   ├── farm-actions.ts
│   │   ├── task-actions.ts
│   │   ├── growth-actions.ts
│   │   ├── finance-actions.ts
│   │   └── knowledge-actions.ts
│   ├── api/
│   │   ├── auth/
│   │   ├── webhooks/
│   │   └── [...nextauth]/
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── farms/
│   │   ├── [id]/
│   │   │   ├── page.tsx
│   │   │   ├── edit/
│   │   │   ├── plots/
│   │   │   └── tasks/
│   │   ├── new/
│   │   └── page.tsx
│   ├── tasks/
│   │   ├── [id]/
│   │   ├── new/
│   │   └── page.tsx
│   ├── finances/
│   │   ├── sales/
│   │   ├── expenses/
│   │   ├── budget/
│   │   └── page.tsx
│   ├── knowledge/
│   │   ├── [id]/
│   │   ├── new/
│   │   └── page.tsx
│   ├── profile/
│   ├── team/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── dashboard/
│   │   ├── farm-health-card.tsx
│   │   ├── task-progress-card.tsx
│   │   ├── weather-card.tsx
│   │   └── yield-summary-card.tsx
│   ├── farms/
│   │   ├── farm-form.tsx
│   │   ├── farm-list.tsx
│   │   ├── farm-detail/
│   │   └── plots/
│   ├── tasks/
│   │   ├── task-form.tsx
│   │   ├── task-list.tsx
│   │   └── task-detail/
│   ├── finances/
│   │   ├── sale-form.tsx
│   │   ├── expense-form.tsx
│   │   ├── budget-form.tsx
│   │   └── report-generators/
│   ├── knowledge/
│   │   ├── article-form.tsx
│   │   ├── article-list.tsx
│   │   └── article-detail.tsx
│   ├── team/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── data-table.tsx
│   │   └── [other shadcn components]
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   └── common/
│       ├── loading-state.tsx
│       ├── error-boundary.tsx
│       └── empty-state.tsx
├── db/
│   ├── schema.ts
│   ├── client.ts
│   └── repositories/
│       ├── farm-repository.ts
│       ├── task-repository.ts
│       ├── user-repository.ts
│       ├── growth-repository.ts
│       ├── finance-repository.ts
│       └── knowledge-repository.ts
├── lib/
│   ├── auth.ts
│   ├── utils.ts
│   ├── constants.ts
│   ├── mock-data/
│   │   ├── farms.ts
│   │   ├── tasks.ts
│   │   └── [other mock data]
│   └── validations/
│       ├── farm-schema.ts
│       ├── task-schema.ts
│       └── [other validation schemas]
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── styles/
│   └── globals.css
├── types/
│   ├── farm.ts
│   ├── task.ts
│   ├── user.ts
│   └── [other type definitions]
└── config/
    ├── site.ts
    └── navigation.ts
```

## 6. Database Schema

The database schema is built using Drizzle ORM with PostgreSQL and includes the following key entities:

- **Users**: Management of user accounts and roles
- **Farms**: Core farm information and health status
- **Plots**: Individual plots within farms
- **Tasks**: Work assignments and status tracking
- **Growth Records**: Documentation of plant development
- **Farm Health Metrics**: Health scoring criteria tracking
- **Sales**: Financial records of produce sales
- **Expenses**: Financial records of operational costs
- **Knowledge Articles**: Agricultural information and best practices

## 7. Farm Health Scoring System

Farm health is scored based on the following criteria:

1. **Watering** (0-4 points): Schedule adherence twice a week
2. **Weeding** (0-2 points): Inside planting holes
3. **Desuckering** (0-2 points): Multiple stages management
4. **Deleafing** (0-1 point): Proper leaf removal
5. **Cutting Miramba** (0-1 point): Into 2-inch pieces
6. **Pest Control** (0-2 points): Reporting and mitigation
7. **Propping** (0-1 point): Support for plants
8. **Mature Plantains** (0-1 point): No loss of mature fruit
9. **Banana Health** (0-3 points): Productivity and weight
10. **Fencing** (0-1 point): Trespassing control
11. **Under Reporting** (-4 to 0 points): Penalty for unreported issues

The total score determines the health status:
- **Good**: 70-100%
- **Average**: 50-69%
- **Poor**: 0-49%

## 8. Implementation Approach

### 8.1. Server Actions

Server actions handle all data mutations and queries:

```typescript
// Example of farm-actions.ts
export async function createFarm(data) {
  const validatedData = farmSchema.parse(data);
  const farm = await farmRepository.createFarm(validatedData);
  revalidatePath('/farms');
  return farm;
}

export async function getFarms(filters) {
  return farmRepository.getFarms(filters);
}
```

### 8.2. Repositories

Repositories abstract all data access with fallback to mock data:

```typescript
// Example of farm-repository.ts
export const farmRepository = {
  async createFarm(data) {
    try {
      const [farm] = await db.insert(farms).values(data).returning();
      return farm;
    } catch (error) {
      console.error('Failed to create farm in database, using mock data:', error);
      // Fallback to mock data
      const newFarm = {
        id: mockFarms.length + 1,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      mockFarms.push(newFarm);
      return newFarm;
    }
  },
  
  async getFarms(filters = {}) {
    try {
      let query = db.select().from(farms);
      
      // Apply filters
      if (filters.status) {
        query = query.where(eq(farms.healthStatus, filters.status));
      }
      
      // Get results
      const results = await query;
      return results;
    } catch (error) {
      console.error('Failed to get farms from database, using mock data:', error);
      // Fallback to mock data
      return mockFarms;
    }
  }
  // Other methods...
};
```

### 8.3. Validations

Zod schemas validate all data inputs:

```typescript
// Example of farm-schema.ts
export const farmSchema = z.object({
  name: z.string().min(1, { message: "Farm name is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  regionCode: z.string().min(1, { message: "Region code is required" }),
  size: z.number().positive({ message: "Size must be greater than 0" }),
  isActive: z.boolean().default(true),
  creatorId: z.number().int().positive(),
});
```

## 9. Development Roadmap

### Phase 1: Core Infrastructure (Week 1, Days 1-3)
- Project setup and configuration
- Authentication implementation
- Basic layout and navigation
- Database setup and initial schema

### Phase 2: Farm & Plot Management (Week 1, Days 4-6)
- Farm listing and details
- Farm creation and editing
- Plot management
- Farm health scoring

### Phase 3: Task Management (Week 1, Day 7 - Week 2, Day 1)
- Task creation and assignment
- Task listing and filtering
- Task status workflow
- Task completion tracking

### Phase 4: Financial Management (Week 2, Days 2-4)
- Sales recording
- Expense tracking
- Financial dashboard
- Reports generation

### Phase 5: Growth & Knowledge (Week 2, Days 5-6)
- Growth tracking
- Harvest forecasting
- Knowledge base articles
- Team management

### Phase 6: Testing & Deployment (Week 2, Day 7 - Week 3, Day 1)
- Comprehensive testing
- Bug fixes and refinements
- Performance optimization
- Deployment to Vercel

## 10. Metrics & Success Criteria

The success of the Farm Manager application will be measured by the following criteria:

1. **User Adoption**: 90% of intended users actively using the system
2. **Data Accuracy**: 95% accuracy in farm health scoring and financial tracking
3. **Efficiency Improvement**: 30% reduction in time spent on administrative tasks
4. **Financial Visibility**: Complete visibility into farm profitability metrics
5. **System Stability**: 99.9% uptime and less than 1% error rate in production

## 11. Future Enhancements

After the initial release, the following enhancements are planned:

1. **Mobile Application**: React Native app for field data collection
2. **Offline Support**: Progressive Web App capabilities for limited connectivity areas
3. **Advanced Analytics**: AI-powered predictions for yield and health
4. **Weather Integration**: Automated alerts and recommendations based on weather forecasts
5. **IoT Integration**: Support for soil moisture sensors and automated irrigation systems
