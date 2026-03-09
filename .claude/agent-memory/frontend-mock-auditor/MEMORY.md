# Frontend Mock Auditor Memory

## Project Overview
- **Framework**: React Router v7 (file-system routing, SSR with loaders/actions)
- **Styling**: Tailwind CSS v4
- **i18n**: react-i18next with JSON locale files in `/public/locales/{en,es}/common.json`
- **Charts**: Recharts
- **No HTTP client**: All data fetching uses React Router loaders/actions (server-side)

## Mock Architecture
- **All backend calls are mocked in-memory** in `app/services/api/*/index.server.ts`
- In-memory stores: `entriesStore`, `predictionStore`, `analysisStore`, `projects[]`
- Simulated delays with `setTimeout` to mimic network latency
- No real API calls exist anywhere in the codebase
- Mock data files: `app/services/api/entries/mocks/platforms.ts`, `app/services/api/mock/store.ts`

## Key Hardcoded Data Locations
- `app/services/api/dashboard/index.server.ts` - hardcoded summary stats and activity
- `app/services/api/projects/index.server.ts` - BEHAVIOR_CONFIGS array, seed projects
- `app/services/api/entries/index.server.ts` - mockTextPool, entry generation
- `app/services/api/users/users.server.ts` - hardcoded user (id=1)
- `app/components/Dashboard/SummaryGrid/index.tsx` - hardcoded "/ 2,500", "85%", "LLaMA-3-8B"
- `app/components/ProjectForms/NewProjectForm.tsx` - hardcoded `modelsList` array
- `app/root.tsx` - hardcoded `getUserById(1)` call

## Route Structure
- `/` - Dashboard (auth required)
- `/login` - Auth (login/register/forgot)
- `/projects/new` - Create project
- `/projects/:id` - Project detail
- `/projects/:id/settings` - Project settings
- `/projects/:id/models/:modelId` - Entries table
- `/projects/:id/models/:modelId/analysis` - Analysis page
- `/projects/:id/models/:modelId/export` - CSV export (resource route)
- `/projects/:id/models/:modelId/predictions` - Prediction runs (resource route)
- `/entries/new` - New entry ingestion
