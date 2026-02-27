---
phase: 1
plan: 3
wave: 2
---

# Plan 1.3: Welcome Dashboard

## Objective
Build the Welcome screen which displays activity summaries, dynamic recent activities, and provides quick actions for projects and entries.

## Context
- .gsd/SPEC.md
- .agent/skills/panopticon-guidelines/TASKS.md

## Tasks

<task type="auto">
  <name>Create Dashboard Mocks</name>
  <files>
    - app/services/api/dashboard/types.ts
    - app/services/api/dashboard/index.server.ts
  </files>
  <action>
    - Implement a dynamic mock service returning a summary object (tweets analyzed, active projects, average precision).
    - Implement a recent activity mock returning the latest events (e.g., "CSV uploaded", "Project created").
    - Ensure a 500ms-1s delay on responses.
  </action>
  <verify>Dashboard endpoints return the correct stateful structures.</verify>
  <done>Activity summary and recent activities are functionally mocked.</done>
</task>

<task type="auto">
  <name>Build Welcome Screen</name>
  <files>
    - app/routes/_index.tsx
  </files>
  <action>
    - Construct the main Dashboard screen within the global Layout.
    - Include Title, subtitle with version.
    - Use the mock services in a Route `loader` to fetch and display the Data Summaries and Recent Activity list.
    - Implement "Nuevo Proyecto" and "Nueva Entrada" buttons that link to `/projects/new` and `/entries/new`.
  </action>
  <verify>Navigate to `/` to see the dashboard layout with loaded mock data.</verify>
  <done>Welcome dashboard renders completely with dynamic mock data.</done>
</task>

## Success Criteria
- [ ] Dashboard mock services simulate real backend responses dynamically.
- [ ] Welcome Screen displays summary widgets and a recent activity log beautifully.
- [ ] Quick action buttons are present and correctly link to respective targets.
