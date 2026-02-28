---
phase: 1
plan: 6
wave: 3
gap_closure: true
depends_on: ["1.5"]
files_modified: [
  "app/app.css",
  "app/components/Sidebar/index.tsx",
  "app/routes/_index.tsx",
  "public/locales/en/common.json",
  "public/locales/es/common.json"
]
autonomous: true

must_haves:
  truths:
    - "Sidebar selected state perfectly matches Stitch Mockups (solid primary background with dark text)."
    - "User logo is yellow, and logout/cancel buttons use bittersweet-shimmer."
    - "All text defaults to English, Spanish available via translation, with a toggle button at top right."
    - "New Project and New Entry tiles match mockup layout with 'Create now ->' / 'Add new ->' yellow links."
    - "Activity Summary widgets are smaller."
    - "Recent Activity layout allows more items, uses relative time, right-aligned status badges, and specialized icons/colors per type."
---

# Plan 1.6: Final Component Polish & i18n (Gap Closure)

<objective>
Refine the Phase 1 UI based on the final user corrections: correct active states for the sidebar, precise color assignments for user/logout buttons, English-first internationalization, layout sizing shrinking for Dashboard summaries, and an augmented "Recent Activity" list with dynamic dates, states, and icons.
</objective>

<tasks>

<task type="auto">
  <name>Global Setup & Colors</name>
  <files>
    app/app.css
  </files>
  <action>
    Re-add `--color-bittersweet-shimmer: hsl(0, 43%, 51%);` to the theme in `app/app.css`.
  </action>
  <verify>CSS variable is available globally.</verify>
</task>

<task type="auto">
  <name>i18n Dictionaries</name>
  <files>
    public/locales/en/common.json
    public/locales/es/common.json
  </files>
  <action>
    Populate the JSON files with English (default) and Spanish translations for all text present in Sidebar and Dashboard.
  </action>
  <verify>Both locales have identical key structures but different translated strings.</verify>
</task>

<task type="auto">
  <name>Sidebar Refinement</name>
  <files>
    app/components/Sidebar/index.tsx
  </files>
  <action>
    - Update `NavItem` active state: instead of a left border, use `bg-primary` with `text-background-dark` (or `text-sidebar-dark`) and `font-semibold` when active.
    - User icon at bottom: change text color to `text-primary`.
    - Logout button: change text color/hover to `text-bittersweet-shimmer`.
    - Apply `useTranslation()` to Sidebar strings.
  </action>
  <verify>Active state matches solid yellow background styling.</verify>
</task>

<task type="auto">
  <name>Dashboard Layout adjustments</name>
  <files>
    app/routes/_index.tsx
  </files>
  <action>
    - Add Language Switcher (EN/ES) at the top right of the header section.
    - Apply `useTranslation()` globally to all texts, making English the default wording.
    - Shrink "Activity Summary" tiles: reduce padding (`p-4` instead of `p-6`), reduce value size (`text-3xl` instead of `text-4xl`).
    - Update "New Project" / "New Predicion" layout: ensure descriptions are constrained in height, and add "Create now ->" and "Add new ->" links respectively at the bottom of the tiles, colored with `text-primary`.
    - Update "Recent Activity" list:
      - Use smaller weight/padding to fit more items.
      - Add a format relative time function (e.g. "created 2 hours ago" / "creado hace 2 horas").
      - Add a right-aligned State badge: "done" (or "created", etc.) / "processing".
      - Change icons/colors per activity: Project = Folder (Blue), Entries = Document (Green), Predictions = Activity/Vital (Yellow).
  </action>
  <verify>Dashboard successfully translates on toggle, layout aligns with requested tighter metrics.</verify>
</task>

</tasks>

<success_criteria>
- All tasks verified.
</success_criteria>
