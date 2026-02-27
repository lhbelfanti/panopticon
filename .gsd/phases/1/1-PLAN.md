---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Core Layout and Sidebar

## Objective
Establish the application root layout and the global navigation Sidebar, including the mock API for fetching the user's projects.

## Context
- .gsd/SPEC.md
- .agent/skills/panopticon-guidelines/TASKS.md
- .agent/skills/panopticon-guidelines/CODE_CONVENTIONS.md

## Tasks

<task type="auto">
  <name>Create Project Mock Service</name>
  <files>
    - app/services/api/projects/types.ts
    - app/services/api/projects/index.server.ts
  </files>
  <action>
    - Create TypeScript types for `Project` (id, name, description, createdAt, etc.).
    - Implement a stateful in-memory mock service in `index.server.ts` that stores an array of projects.
    - Provide a `getProjects` function that returns the list with an artificial delay of 500ms-1s.
  </action>
  <verify>Check that `getProjects` is exported and returns a Promise array.</verify>
  <done>Mock service simulates fetching projects with a delay.</done>
</task>

<task type="auto">
  <name>Implement Sidebar Component</name>
  <files>
    - app/components/Sidebar/index.tsx
    - app/components/Sidebar/types.ts
    - app/routes.ts
    - app/root.tsx
  </files>
  <action>
    - Build a persistent Sidebar component according to the dark color palette.
    - Include Logo, App Name (Panopticon), description, and navigation links (Acciones Rápidas: Nueva Entrada, Nuevo Proyecto; Tus Proyectos).
    - Use the mock service to load the projects list server-side in the layout loader and pass to Sidebar.
    - Setup the root layout in `app/root.tsx` to include the Sidebar and an `<Outlet />`.
  </action>
  <verify>Run the dev server and verify the sidebar renders securely in the root layout.</verify>
  <done>Sidebar is functional, collapsible, displays a list of projects from the mock, and has the correct aesthetic.</done>
</task>

## Success Criteria
- [ ] Mock service returns projects with a delay.
- [ ] Sidebar component matches the design and displays project links.
- [ ] Root layout successfully integrates the Sidebar.
