---
phase: 2
plan: 1
wave: 1
depends_on: []
files_modified: [
  "app/services/api/projects/types.ts",
  "app/services/api/projects/index.server.ts",
  "app/routes/projects.new.tsx"
]
autonomous: true

must_haves:
  truths:
    - "User can create a new project by specifying name, description, target behaviors, and ML models"
    - "System creates a parent project and subprojects for each selected ML model"
  artifacts:
    - "app/routes/projects.new.tsx"
    - "app/services/api/projects/index.server.ts"
---

# Plan 2.1: Advanced Project Creation

<objective>
Update the mock API to support the new "Subproject" architecture based on ML models, and build the "New Project" screen with behavior and model selection.

Purpose: To allow researchers to create analysis projects and automatically shard them into subprojects for easier, model-isolated comparisons.
Output: Enhanced `projects` mock service and the `/projects/new` React Router route.
</objective>

<context>
Load for context:
- .gsd/SPEC.md
- app/services/api/projects/types.ts
- app/services/api/projects/index.server.ts
</context>

<tasks>

<task type="auto">
  <name>Enhance Project Mock Types and Service</name>
  <files>
    app/services/api/projects/types.ts
    app/services/api/projects/index.server.ts
  </files>
  <action>
    Update `types.ts` to include `TargetBehavior` and `MLModel` enums/literals.
    Modify `Project` to represent a parent containing an array of `subprojects` (which have identical shape but a specific `model` attached).
    Update `index.server.ts` `createProject` to accept behaviors and models, generating the nested subprojects accordingly.
    AVOID: Breaking the existing layout loader in Phase 1 that expects a flat list (decide if we return parent projects only, or flatten subprojects for the sidebar).
  </action>
  <verify>Check IDE typing errors on `root.tsx` after modifications.</verify>
  <done>Mock service handles parental projects with inner model-specific subprojects.</done>
</task>

<task type="auto">
  <name>Build New Project Screen</name>
  <files>app/routes/projects.new.tsx</files>
  <action>
    Create a form for Name, Description, array of Target Behaviors (checkboxes or multi-select), and array of ML Models (checkboxes).
    Use `useActionData` for errors and `useNavigation` for loading states to submit to the mock service.
    Redirect to the newly created project's parent view ID upon success.
    AVOID: Using external UI libraries. Build custom form elements with Tailwind variables.
  </action>
  <verify>Route successfully resolves and renders the form.</verify>
  <done>UI allows selecting multiple behaviors and models, creating the complex project payload.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Users can browse to `/projects/new` and submit a complex project.
- [ ] The `getProjects` service correctly returns the newly structured data.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
