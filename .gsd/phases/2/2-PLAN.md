---
phase: 2
plan: 2
wave: 2
depends_on: ["2.1"]
files_modified: [
  "app/services/api/entries/types.ts",
  "app/services/api/entries/index.server.ts",
  "app/routes/projects.$id._index.tsx",
  "app/routes/projects.$id.models.$modelId.tsx"
]
autonomous: true

must_haves:
  truths:
    - "User can view a parent project and its metadata"
    - "User can navigate into a specific model's subproject to view entries"
    - "Subproject view contains a paginated table of entries with column-based filters"
  artifacts:
    - "app/routes/projects.$id._index.tsx"
    - "app/routes/projects.$id.models.$modelId.tsx"
    - "app/services/api/entries/index.server.ts"
---

# Plan 2.2: Subproject Views & Entries Table

<objective>
Implement the core project management views allowing users to navigate from a parent Project into a specific Subproject (ML Model) to view and filter paginated text entries.

Purpose: To provide researchers the ability to drill down into their separated model experiments and filter the datasets cleanly.
Output: Entries mock service, Parent Project details route, and Subproject Entries Table route.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- app/services/api/projects/types.ts
- app/components/Sidebar/index.tsx (for layout reference)
</context>

<tasks>

<task type="auto">
  <name>Create Entries Mock Service</name>
  <files>
    app/services/api/entries/types.ts
    app/services/api/entries/index.server.ts
  </files>
  <action>
    Define `Entry` types containing `id`, `text`, `model`, `verdict` (Pending, Positive, Negative, Error), etc.
    Create stateful in-memory mock for fetching entries by Project ID and Model ID, evaluating pagination (`page`, `limit`) and column filters (`search`, `verdict`).
    AVOID: Returning the entire array if a pagination query is passed. Implement a manual slice.
  </action>
  <verify>Mock service exports `getEntries(projectId, modelId, params)` evaluating slice logic.</verify>
  <done>Service returns deterministic paginated mock entries based on URL queries.</done>
</task>

<task type="auto">
  <name>Build Parent Project View</name>
  <files>app/routes/projects.$id._index.tsx</files>
  <action>
    Create the route layout for viewing a Parent Project (`projects.$id`).
    Fetch the parent project by ID using `getProjectById`.
    Display project metadata (Behaviors) and render a grid/list of its available Subprojects (Models). Clicking a model links to the Subproject route.
    AVOID: Complex state. Just list the models.
  </action>
  <verify>Route successfully fetches project and renders links to nested model routes.</verify>
  <done>Parent project view summarizes the experiment and offers navigation into subprojects.</done>
</task>

<task type="auto">
  <name>Build Subproject Entries Table</name>
  <files>app/routes/projects.$id.models.$modelId.tsx</files>
  <action>
    Create the subproject route. Fetch entries using the mock service via the `loader` parsing the URL `searchParams`.
    Build a custom HTML `table` representing the Entries (ID, Text snippet, Verdict, Actions column).
    Implement column-based filtering inputs at the top of the table submitting `GET` forms to automatically append `?search=X&verdict=Y` to the URL.
    AVOID: Client-side routing state for standard filtering; always rely on React Router URL queries so the `loader` handles data fetching naturally.
  </action>
  <verify>Table columns map properly, form submission modifies URL, and loader returns filtered data.</verify>
  <done>Data grid is fully operational with server-side mock driven filtering and pagination controls.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Users can click a project in the Sidebar, land on the Parent view, and see its chosen Models.
- [ ] Users can click a Model to view that Subproject's paginated Entries table.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
