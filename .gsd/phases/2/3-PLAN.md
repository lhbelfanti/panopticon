---
phase: 2
plan: 3
wave: 3
depends_on: ["2.2"]
files_modified: [
  "app/routes/projects.$id._index.tsx",
  "app/routes/projects.$id.models.$modelId.tsx",
  "app/services/api/projects/index.server.ts",
  "app/services/api/entries/index.server.ts"
]
autonomous: true

must_haves:
  truths:
    - "User can trigger a standard UI confirmation modal to delete a project or single entry"
    - "Deleting a parent project redirects to dashboard or standard project"
    - "Entries table includes a button to export entries as a CSV"
  artifacts:
    - "app/routes/projects.$id._index.tsx" (updated with Modal)
    - "app/routes/projects.$id.models.$modelId.tsx" (updated with Modal)
---

# Plan 2.3: State Mutations (Delete & Export)

<objective>
Finalize the Project Management Core by adding the destructive actions (Delete Project, Delete Entry) guarded by standard UI confirmation modals, and wire up the Export CSV functionality.

Purpose: To give researchers control over their data lifecycle safely, without over-complicating the UI.
Output: Modal components integrated inline into the routes, tied to React Router `action` endpoints.
</objective>

<context>
Load for context:
- app/routes/projects.$id._index.tsx
- app/routes/projects.$id.models.$modelId.tsx
</context>

<tasks>

<task type="auto">
  <name>Project Deletion Modal</name>
  <files>
    app/routes/projects.$id._index.tsx
    app/services/api/projects/index.server.ts
  </files>
  <action>
    Add a `deleteProject(id)` mock service method.
    In `projects.$id._index.tsx`, implement a standard HTML `<dialog>` based modal or absolute positioned div wrapper toggled via local state holding a Form with `intent="delete_project"`.
    On submission, the route `action` handles the mock deletion and redirects to `/`.
    AVOID: Complex external modal context providers. Simple boolean states are enough.
  </action>
  <verify>Mock project returns 404/null after deletion and redirects correctly.</verify>
  <done>Delete project safely removes parent and shifts user away.</done>
</task>

<task type="auto">
  <name>Entry Deletion Modal</name>
  <files>
    app/routes/projects.$id.models.$modelId.tsx
    app/services/api/entries/index.server.ts
  </files>
  <action>
    Add a `deleteEntry(id)` mock service method.
    In the Entries Table route, add a generic confirmation modal triggered by clicking the trash icon on a row, maintaining the `selectedEntryId` in state.
    Confirming submits a Form POST. The `action` handles deletion and refreshes the table loader automatically.
    AVOID: Client-side list splicing; deleting server-side ensures accurate pagination state on reload.
  </action>
  <verify>Deleting an entry removes it from the mock store and updates the table on completion.</verify>
  <done>Row selection translates to accurate target deletion via standard modal confirmation.</done>
</task>

<task type="auto">
  <name>Export CSV Action</name>
  <files>app/routes/projects.$id.models.$modelId.tsx</files>
  <action>
    Add an "Export CSV" button to the subproject view.
    Instead of submitting a form, this can hit a new resource route (e.g., `/api/export`) or trigger a specific `action` that returns a `new Response(csvString, { headers: { 'Content-Type': 'text/csv' } })`.
    Build a minimal CSV stringifier mock.
    AVOID: Complex file streaming logic for the mock phase. A raw string response with attachment headers suffices.
  </action>
  <verify>Clicking the button downloads a `.csv` file mimicking the database extract.</verify>
  <done>Export feature triggers standard browser download.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Deleting a project throws the confirmation modal, executes successfully, and redirects.
- [ ] Deleting an entry inside a subproject correctly fires the modal and eliminates the row.
- [ ] The Export button outputs a valid mock CSV payload.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
