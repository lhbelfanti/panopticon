---
phase: 2
plan: fix-entry-table-filtering
wave: 1
gap_closure: true
---

# Fix Plan: Entry Table Filtering Not Triggering Refetch

## Problem
The subproject entries table correctly renders the filter inputs and updates internal state (updating the Export CSV href implicitly), but typing into the `EntriesTable` filter inputs does not submit the value to the URL to trigger the Remix/React-Router Loader, leaving the table rows stale.

## Tasks

<task type="auto">
  <name>Fix Entry Table logic</name>
  <files>app/components/EntriesTable/index.tsx</files>
  <action>Use the `useSubmit` or `useNavigate` hook from React Router to push URL query param updates when filter fields lose focus (onBlur) or when the user stops typing (debounced change), or wrap the filters in a `<Form method="GET">` so that submitting the form updates the URL.</action>
  <verify>Check that typing a filter reloads the table with mocked entries properly matching it.</verify>
  <done>Subproject entries filter correctly re-renders the table view based on the API response.</done>
</task>
