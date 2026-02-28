---
phase: 1
plan: 7
wave: 5
gap_closure: true
depends_on: ["1.6"]
files_modified: [
  "app/components/Sidebar/index.tsx",
  "app/routes/_index.tsx",
  "public/locales/en/common.json",
  "public/locales/es/common.json"
]
autonomous: true

must_haves:
  truths:
    - "New Project and New Prediction main sections take up 60-70% of the tile width, wrapping text."
    - "Language toggle is moved from Dashboard header into the static Sidebar across all pages."
    - "All text strings across the Dashboard (including Recent Activity formatters) are strictly passed through i18next."
    - "Remaining Tokens progress bar sits inline horizontally with the raw number, reducing height."
    - "Activity Summary replaces 'tweets' with 'entries', shows percentage analyzed in green."
    - "Activity Summary contains a new widget detailing the 'most used model'."
    - "Recent Activity File Upload states say 'uploaded' instead of 'done'."
    - "Recent Activity matches correct Stitch Icons: Folder/Multiple Folders for Projects, Document/Multiple Documents for Entries."
    - "Sidebar Profile/Logout items have rounded highlight hover states."
    - "Clicking Logout inside the Sidebar opens a global, styled Confirmation Modal."
---

# Plan 1.7: Deep Layout & Localization Polish

<objective>
Execute the ultimate Gap Closure modifications requested for Phase 1. Reposition the language toggle globally. Refine the Dashboard Activity Summary layout significantly by tightening the tokens progress bar, implementing the "most used model" widget, and integrating deep i18n localization throughout all recent activity strings.
</objective>

<tasks>

<task type="auto">
  <name>Comprehensive i18n Updates</name>
  <files>
    public/locales/en/common.json
    public/locales/es/common.json
    app/routes/_index.tsx
  </files>
  <action>
    - Add translation keys for "Most used model", "Analyzed entries" (replacing tweets), "uploaded" status, "Logout confirmation" text, and any lingering hardcoded strings in `_index.tsx`.
    - Apply `t()` globally to all texts.
  </action>
  <verify>Searching for hardcoded english outside of `t()` yields nothing.</verify>
</task>

<task type="auto">
  <name>Global Sidebar Enhancements</name>
  <files>
    app/components/Sidebar/index.tsx
  </files>
  <action>
    - Inject the language translation toggle logic into the Sidebar header or footer.
    - Give the Profile circle and Logout button an explicit rounded hover highlight (`rounded-full hover:bg-white/10` or similar).
    - Implement a React local state Modal that triggers on the Logout click. Design a backdrop-blur absolute modal mimicking standard Panopticon styling (dark mode, bittersweet-shimmer destructive buttons) to confirm "Are you sure you want to log out?".
  </action>
  <verify>Sidebar toggle properly switches standard `react-i18next` contexts. Logout securely traps the click in a UI modal.</verify>
</task>

<task type="auto">
  <name>Dashboard Layout: Action Tiles & Recent Activity Icons</name>
  <files>
    app/routes/_index.tsx
  </files>
  <action>
    - Restrict the `p` description tags inside the "New Project" and "New Prediction" tiles to `w-[70%]` to force multiline behavior.
    - Inside `Recent Activity`, re-map the icons explicitly: `Folder` or `Files` for projects, `FileText` or `FileStack` for entries.
    - Redefine the frontend translation logic so `csv_uploaded` translates strictly to the `status.uploaded` JSON key.
  </action>
  <verify>Descriptions don't span 100% width. Icons precisely represent payload type.</verify>
</task>

<task type="auto">
  <name>Dashboard Layout: Activity Summary Tightening</name>
  <files>
    app/routes/_index.tsx
  </files>
  <action>
    - Ensure the Grid has 5 blocks now (creating a 5-column grid or breaking gracefully).
    - Change "Analyzed tweets" to "Analyzed entries" and append a `<span className="text-green-500">X%</span>` string.
    - Build a new widget for "Most used model" (e.g. `LLaMA-3-8B`) using an abstract brain or CPU icon.
    - Refactor the "Remaining Tokens" tile to place the raw number e.g. `2.5M` side-by-side with an inline `<progress>` or nested `div` bar taking up the remaining flex width.
  </action>
  <verify>Activity visual footprint is shorter and explicitly contains the new model widget and inline tokens bar.</verify>
</task>

</tasks>

<success_criteria>
- All tasks verified through successful TS compilation and browser interaction match.
</success_criteria>
