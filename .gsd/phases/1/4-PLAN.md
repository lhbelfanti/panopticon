---
phase: 1
plan: 4
wave: 3
gap_closure: true
depends_on: ["1.1", "1.2", "1.3"]
files_modified: [
  "app/routes/_index.tsx",
  "app/routes/login._index.tsx",
  "app/components/Sidebar/index.tsx"
]
autonomous: true

must_haves:
  truths:
    - "The app matches the design expectations set by the Stitch mockups."
  artifacts:
    - "app/routes/_index.tsx"
    - "app/routes/login._index.tsx"
---

# Plan 1.4: Stitch Mockup Integration (Gap Closure)

<objective>
Refactor the Phase 1 UI components (Login, Sidebar, and Dashboard) to use the Stitch MCP Project `8383642106793118502` designs as inspiration. The goal is to make the layout and styling look as alike as possible to the mockups using our own HTML structure and Tailwind classes.

Purpose: Closure for verification gap to ensure the project meets the exact visual fidelity requested in the mockups, notably color positioning and correct logo usage.
Output: Refactored `login._index.tsx`, `_index.tsx`, and `Sidebar` that visually resemble the mockups.
</objective>

<context>
Load for context:
- app/routes/_index.tsx
- app/routes/login._index.tsx
- app/components/Sidebar/index.tsx
</context>

<tasks>

<task type="auto">
  <name>Align Login Screen with Stitch Mockups</name>
  <files>
    public/panopticon-logo.png
    public/panopticon-logo-no-text.png
    app/routes/login._index.tsx
  </files>
  <action>
    Copy `media/panopticon-logo.png` and `media/panopticon-logo-no-text.png` into the `public/` directory so the frontend can serve them as `/panopticon-logo.png` and `/panopticon-logo-no-text.png`.
    Review Stitch screen `7b8c38ea93e548808882644ebc33511b` (Login / Registration).
    Refactor `app/routes/login._index.tsx` using Tailwind to closely mimic the design iteratively, applying the exact color mapping.
    Incorporate the correct logo: Use `<img src="/panopticon-logo.png" />` where the full logo is required, and use `<img src="/panopticon-logo-no-text.png" />` if space is constrained.
    Update the .ico with a "panopticon.ico" version of the logo without text.
    AVOID: Altering the server `login` logic must be avoided. Focus strictly on desktop sizes (no mobile breakpoints).
  </action>
  <verify>Route `login._index.tsx` mounts without compiling errors and matches mockup layout.</verify>
  <done>Login visual structure strongly resembles the Stitch mockup.</done>
</task>

<task type="auto">
  <name>Align Welcome Dashboard and Sidebar</name>
  <files>
    app/routes/_index.tsx
    app/components/Sidebar/index.tsx
  </files>
  <action>
    Review Stitch screen `b8e05ffb147d4d079904def35ddb5956` (Welcome Home Dashboard).
    Refactor `_index.tsx` iteratively to match the layouts. Implement the Progress Bar for the "Remaining Tokens" Activity Summary widget. 
    Refactor `Sidebar/index.tsx` iteratively. Include: A "Home" section (links to Welcome), "Quick Actions", and "Your Projects". Add hierarchical icons to these sections.
    Include the collapse button at the top (right or behind logo) and the User Info + Logout button at the bottom.
    Incorporate the correct logos in the Sidebar: `/panopticon-logo.png` for expanded view, `/panopticon-logo-no-text.png` for collapsed views.
    AVOID: Re-building from scratch. Modify the existing Tailwind layouts. Do not build UI for mobile viewports, only desktop. Exclude non-MVP Sidebar items (e.g. Knowledge Base) seen in the mocks.
  </action>
  <verify>Navigation and dashboard routes match the visual layout and color mapping of the mockups.</verify>
  <done>Dashboard tiles and sidebar visually capture the MCP design payload correctly.</done>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Visual fidelity of Login and Dashboard heavily resembles the Stitch mockups.
- [ ] Correct application of project colors according to the design.
- [ ] The supplied logo PNGs render correctly in the intended contexts.
</verification>

<success_criteria>
- [ ] All tasks verified
- [ ] Must-haves confirmed
</success_criteria>
