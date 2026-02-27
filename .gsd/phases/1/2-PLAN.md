---
phase: 1
plan: 2
wave: 1
---

# Plan 1.2: Authentication Module

## Objective
Adapt the existing Login and Register modules from the Binarizer project for Panopticon, strictly adhering to our mock constraints and conventions.

## Context
- .gsd/DECISIONS.md
- .agent/skills/panopticon-guidelines/CODE_CONVENTIONS.md
- /Users/lhbelfanti/workspace/github/binarizer/app/services/api/auth

## Tasks

<task type="auto">
  <name>Create Mock Auth Service</name>
  <files>
    - app/services/api/auth/types.ts
    - app/services/api/auth/index.server.ts
  </files>
  <action>
    - Review the logic in the Binarizer project's auth module.
    - Instead of actual API endpoints, implement an in-memory mock service for `login` and `register`.
    - Accept any valid input and resolve after a 500ms-1s delay, simulating a successful JWT/Session return.
  </action>
  <verify>Auth functions delay and resolve successfully with dummy token data.</verify>
  <done>Mock authentication functions are ready to be called.</done>
</task>

<task type="auto">
  <name>Implement Login Screen</name>
  <files>
    - app/routes/login._index.tsx
  </files>
  <action>
    - Create the Login route component using the dark color palette.
    - Include the app title, logo, email, and password fields.
    - Use React Router v7 `action` to handle form submission, calling the Mock Auth Service.
    - On success, redirect to the Dashboard (`/`).
    - Setup basic static localization keys if not already done.
  </action>
  <verify>Form submit hits the action, waits the delay, and redirects to Dashboard.</verify>
  <done>Login screen operates with mock auth logic and routes properly on success.</done>
</task>

## Success Criteria
- [ ] Mock Auth service implemented with delays.
- [ ] Login screen created and functional using the dark theme.
- [ ] Successful login redirects properly to the dashboard.
