# Farm Manager

A comprehensive web application for banana farm management in Kenya.

## Overview

Farm Manager is a modern web application designed to streamline banana farm operations. It provides an integrated platform for tracking farm health, managing tasks, monitoring growth, recording financial transactions, and sharing agricultural knowledge.

## Features

- **Dashboard**: Comprehensive overview of farm operations and key metrics
- **Farm Management**: Track and manage multiple farms and plots
- **Task Management**: Assign and track farm-related tasks
- **Financial Management**: Record sales, expenses, and generate reports
- **Growth Tracking**: Monitor plant development and plan harvests
- **Knowledge Base**: Access agricultural best practices and guidance
- **Team Management**: Coordinate farm workers and assign responsibilities
- **User Authentication**: Secure role-based access control

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js Server Actions, Drizzle ORM
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: NextAuth.js with email and Google OAuth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v18.17.0 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/farm-manager.git
   cd farm-manager
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   Copy the `.env.example` file to `.env.local` and fill in the required values:
   ```bash
   cp .env.example .env.local
   ```

4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Setup

1. Create a Neon PostgreSQL database at [neon.tech](https://neon.tech)
2. Update the `DATABASE_URL` in your `.env.local` file
3. Run database migrations
   ```bash
   npm run db:push
   # or
   yarn db:push
   ```

## Project Structure

```
farm-manager/
├── app/               # Next.js App Router pages and API routes
├── components/        # UI components
├── db/                # Database schema and repositories
├── lib/               # Utilities, validations, and helpers
├── public/            # Static assets
├── styles/            # Global styles
└── types/             # TypeScript type definitions
```

## Development Workflow

1. Create a new branch for your feature
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them
   ```bash
   git add .
   git commit -m "Add your feature description"
   ```

3. Push your changes to the repository
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a pull request on GitHub

## Key Concepts

### Repository Pattern

All data access is abstracted through repositories in the `/db/repositories` directory. This allows for:
- Consistent data access patterns
- Easy mocking for testing
- Fallback to mock data when needed

Example:
```typescript
// Using a repository
import { farmRepository } from '@/db/repositories/farm-repository';

const farms = await farmRepository.getFarms({ status: 'ACTIVE' });
```

### Server Actions

Mutations and queries are handled through server actions in the `/app/actions` directory:

```typescript
// Using a server action
import { createFarm } from '@/app/actions/farm-actions';

const newFarm = await createFarm({
  name: 'Eastlands Farm',
  location: 'Nairobi',
  regionCode: 'NKM',
  size: 1.5,
  creatorId: 1
});
```

### Form Validation

All forms use Zod schemas for validation:

```typescript
// Form validation with Zod
import { farmSchema } from '@/lib/validations/farm-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const form = useForm({
  resolver: zodResolver(farmSchema),
  defaultValues: {
    name: '',
    location: '',
    regionCode: '',
    size: 0
  }
});
```

## Farm Health Scoring

Farm health is scored based on the following criteria:

1. Watering (0-4 points)
2. Weeding (0-2 points)
3. Desuckering (0-2 points)
4. Deleafing (0-1 point)
5. Cutting Miramba (0-1 point)
6. Pest Control (0-2 points)
7. Propping (0-1 point)
8. Mature Plantains Retention (0-1 point)
9. Banana Health (0-3 points)
10. Fencing/Trespassing Control (0-1 point)
11. Under Reporting Penalty (-4 to 0 points)

The total score determines the health status:
- **Good**: 70-100%
- **Average**: 50-69%
- **Poor**: 0-49%

## Deployment

The application is deployed on Vercel:

1. Push your changes to the main branch
2. Vercel will automatically deploy the changes

For manual deployments:
```bash
npm run build
# or
yarn build

vercel --prod
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Neon PostgreSQL](https://neon.tech/)
- [Vercel](https://vercel.com/)

## Contact

Project Link: [https://github.com/yourusername/farm-manager](https://github.com/yourusername/farm-manager)
