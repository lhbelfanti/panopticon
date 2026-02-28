---
phase: 1
plan: 5
gap_closure: true
depends_on: ["1.4"]
files_modified: [
  "index.html",
  "app/root.tsx",
  "app/routes/_index.tsx",
  "app/routes/login._index.tsx",
  "app/components/Sidebar/index.tsx"
]
autonomous: true

must_haves:
  truths:
    - "The app uses the exact color palette (primary yellow, background-dark, sidebar-dark) mapped in the Stitch designs."
    - "The app favors black and yellow as primary elements, and shadows/accents use the designated variables."
    - "The logo inside the Sidebar is centered properly."
    - "The browser tab icon strictly uses `panopticon.ico`."
---

# Plan 1.5: Final Visual Refinements (Gap Closure 2)

<objective>
Refine the stylistic choices deployed in Plan 1.4 to strictly conform to the CSS Tailwind structure explicitly found in the generated Stitch UI HTML. Specifically, removing the generic tailwind colors and mapping the exact #HEX payload provided by the mockups. Also fixing the centering of the main logo and the Vite default favicon.
</objective>

<context>
- Colors extracted from Stitch mockup:
```javascript
colors: {
    "primary": "#eebd2b", // Yellow
    "background-light": "#f8f7f6",
    "background-dark": "#0a0a0a", // Smoky black style
    "sidebar-dark": "#1a1a1a",    // Onyx
}
```
- Current global colors in `app.css` (`bittersweet-shimmer`, `orange-crayola`) are wrong and violate the mockups.
- Favicon is still the react-router default loaded somewhere.
</context>

<tasks>

<task type="auto">
  <name>Align Global Color Palette</name>
  <files>
    app.css
  </files>
  <action>
    Modify `app.css` (or wherever CSS custom properties are stored) to redefine the core colors to the specific hex codes from the Stitch mockup. 
    Define:
    - `--color-primary: #eebd2b;`
    - `--color-background-dark: #0a0a0a;`
    - `--color-sidebar-dark: #1a1a1a;`
    Ensure these map correctly to Tailwind classes (e.g. `bg-primary`, `text-primary`).
  </action>
  <verify>CSS variables correspond to the new exact hex values.</verify>
</task>

<task type="auto">
  <name>Update Component Styling constraints</name>
  <files>
    app/components/Sidebar/index.tsx
    app/routes/_index.tsx
    app/routes/login._index.tsx
  </files>
  <action>
    Refactor Sidebar, Dashboard, and Login UI. 
    - Strip out the incorrect vibrant colors (`bg-blue-500`, `bg-purple-500`, `bg-bittersweet-shimmer`).
    - Use black (`background-dark` or `sidebar-dark`) and yellow (`primary`) predominantly.
    - Check the "shadows" and selections; use `primary` mapping (or `primary/10`, `primary/20` for transparencies as seen in the HTML snippet) to highlight active menus and widget icons instead of random colors.
    - Centering Fix: the `<img src="/panopticon-logo-no-text.png" />` and `<img src="/panopticon-logo.png" />` inside `app/components/Sidebar/index.tsx` need correct flexbox alignment to be centered perfectly.
  </action>
  <verify>Design visually matches the "mainly black and yellow" request without random vibrant shades.</verify>
</task>

<task type="auto">
  <name>Fix the Favicon</name>
  <files>
    app/root.tsx
    (or any index.html equivalent if applicable)
  </files>
  <action>
    Locate where `favicon.ico` is being loaded (likely `Links` export in `root.tsx` or `index.html`).
    Change the reference to `/panopticon.ico`. 
    Ensure the `public/favicon.ico` is deleted if it's the Vite default, so it doesn't conflict.
  </action>
  <verify>The `panopticon.ico` is the only active favicon link.</verify>
</task>

</tasks>

<verification>
After all tasks, verify:
- [ ] Visual fidelity strongly leans black and yellow (`#eebd2b`, `#1a1a1a`, `#0a0a0a`).
- [ ] Panopticon logo in sidebar is centered perfectly.
- [ ] HTML header requests `panopticon.ico`, not the default router one.
</verification>
