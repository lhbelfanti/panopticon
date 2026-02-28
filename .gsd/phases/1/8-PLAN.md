---
phase: 1
plan: 8
wave: 6
gap_closure: true
depends_on: ["1.7"]
files_modified: [
  "app/components/Sidebar/index.tsx",
  "app/routes/_index.tsx"
]
autonomous: true

must_haves:
  truths:
    - "Profile hover background matches icon color (yellow) and icon turns dark."
    - "Logout hover background matches icon color (red) and icon turns white."
    - "Analyzed Entries card displays total 'X/Y' where Y is small and gray, followed by a green percentage icon and text."
    - "Recent Activity Prediction rows map correctly to 'Done' or 'In Progress' states instead of 'created'."
    - "Sidebar Collapse Button has clearer borders/colors to stand out from the background."
    - "Sidebar Branding uses `panopticon-logo-no-text.png` paired with explicit 'PANOPTICON' yellow HTML text."
---

# Plan 1.8: Final UI Glare & Detail Adjustments

<objective>
Execute the absolute final visual checks on Phase 1 per user request. This closes out the last stylistic gaps regarding hover states on destructive/profile buttons, enhances the Activity Summary token fractions, and standardizes the logo composition.
</objective>

<tasks>

<task type="auto">
  <name>Sidebar Visuals & Branding</name>
  <files>
    app/components/Sidebar/index.tsx
  </files>
  <action>
    - Update the Header branding: Remove `panopticon-logo.png`. Always use `panopticon-logo-no-text.png`. When expanded, append a `<span className="text-primary font-bold tracking-widest">PANOPTICON</span>` next to it.
    - Improve Collapse Button visibility: Add a thicker border `border-white/20`, bump size slightly, or add a persistent drop-shadow so it doesn't get lost.
    - Update Footer Hover Colors: 
      - Profile button: `hover:bg-primary group-hover:text-background-dark`.
      - Logout button: `hover:bg-bittersweet-shimmer hover:text-white-1`.
  </action>
  <verify>Navigation elements trigger appropriate inverse color contrast on hover. Logo uses separated asset and text.</verify>
</task>

<task type="auto">
  <name>Dashboard Layout: Metrics & Status Mapping</name>
  <files>
    app/routes/_index.tsx
  </files>
  <action>
    - Activity Summary 'Tweets Analyzed' widget: Update logic to show something like `{analyzed} <span className="text-light-gray-70 text-lg">/ {total}</span>`.
    - Next to it, add a green trend up icon and `<span className="text-green-500 font-medium">XX%</span>`.
    - Recent Activity Predictions mapping: Check the `activity.type === 'predictions_made'`. Ensure its status map checks the underlying state to yield `In Progress` (processing) or `Done` instead of a generic "Created" action.
  </action>
  <verify>Activity text has fractions. Predictions show accurate ML processing statuses.</verify>
</task>

</tasks>

<success_criteria>
- All tasks verified through successful TS compilation and browser interaction match.
</success_criteria>
