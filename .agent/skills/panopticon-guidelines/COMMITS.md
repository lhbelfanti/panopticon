# Commit Message Conventions

This document outlines the standard conventions for crafting commit messages within the Panopticon project. These rules ensure a clean, understandable, and categorized history.

## Structure and Emojis

Every commit message must begin with a conventional tag (e.g., `feat`, `fix`, `refactor`, `docs`, `chore`), followed immediately by a corresponding emoji, and then the descriptive message.

The emojis categorize the impact of the commit:

- `breaking: 💥` : When there is a breaking change (e.g., API changes, database schema changes, etc.).
- `feat: 🔥` : When a new feature is added.
- `refactor: 🛠️` : When there is a big refactor (structural changes, major reorganizations).
- `refactor: ⚙️` : When there is a small refactor (code improvements without functional changes).
- `chore: 👨‍💻` : When there is a minor change or improvement in an existing feature.
- `fix: 🐛` : When there is a bug fix.
- `test: 🧪` : For tests.
- `docs: 📝` : When there is a documentation change.
- `assets: 🌌` : When new images or visual assets are added or modified.
- `cleanup: 🧹` : When files are deleted, dependencies are pruned, or the project is cleaned somehow.
- `style: 🎨` : For purely aesthetic changes like indentation, whitespace, or semicolons.
- `perf: ⚡️` : For performance improvements. When optimizing speed or memory usage.
- `build: 📦` : For build system changes. When modifying build scripts, dependencies, or build configurations.
- `ci: 🔄` : For continuous integration changes. When modifying CI/CD pipelines or configurations.
- `i18n: 🌐` : For internationalization changes. When adding or modifying translations.

## Formatting Best Practices

To maintain a highly readable `git log` and interface with GitHub seamlessly, all commits should adhere to these stylistic rules:

1. **Imperative Mood**: Always write the subject line in the imperative mood. (e.g., Use "Add new filtering logic" instead of "Added new filtering logic" or "Adds new filtering logic").
2. **Capitalization**: Always capitalize the first letter of the commit description after the emoji. (e.g., `feat: ⚡️ Add authentication` instead of `feat: ⚡️ add authentication`).
3. **No Trailing Punctuation**: Do not end the subject line with a period (`.`).
4. **Length Limits**: Keep the subject line (the first line) under 72 characters. If more context is needed, leave a blank line and provide a detailed commit body describing the *why* (the code explains the *how*).
## Granularity and Atomicity Rules

Commits should be strictly **atomic** (addressing only one logical change per commit) while striving to keep the overall quantity of commits minimize where practical. 

**Follow these specific rules:**

1. **Size Limits & Splitting**: If a single logical change (`feat ⚡️`, `refactor 🛠️`, `refactor ⚙️`, or `minor change 👨‍💻`) involves a massive amount of code (e.g., ~2000 lines), break it down into multiple, smaller logical commits (e.g., separating the UI layer commit from the backend layer commit).
2. **Isolate Tests**: If new tests are added, they must be in their own isolated commit. Do not mix test additions with the feature code itself.
3. **Isolate Bug Fixes**: A bug fix must NEVER be included inside another type of commit (e.g., do not bundle a `fix 🐛` into a `feat ⚡️` commit). Bug fixes must stand alone.
4. **Bundle Cleanups**: If a commit is strictly about cleaning up (e.g., `chore 🧹`), keep all the cleaning changes grouped together in one commit rather than splitting them into many tiny cleanup commits.
5. **Bundle Documentation**: Documentation changes (`docs 📝`) should be grouped together in their own separated commit. There is no need to split documentation changes across multiple commits unless they address completely unrelated domains.
6. **Bundle Assets**: Asset changes (`assets 🌌`) should be grouped together in their own separated commit. There is no need to split asset changes across multiple commits unless they address completely unrelated domains.
7. **Bundle Build**: Build changes (`build 📦`) should be grouped together in their own separated commit. There is no need to split build changes across multiple commits unless they address completely unrelated domains.
8. **Bundle CI**: CI changes (`ci 🔄`) should be grouped together in their own separated commit. There is no need to split CI changes across multiple commits unless they address completely unrelated domains.
9. **Bundle i18n**: i18n changes (`i18n 🌐`) should be grouped together in their own separated commit. There is no need to split i18n changes across multiple commits unless they address completely unrelated domains.
10. **Bundle Style**: Style changes (`style 🎨`) should be grouped together in their own separated commit. There is no need to split style changes across multiple commits unless they address completely unrelated domains.
11. **Bundle Perf**: Perf changes (`perf ⚡️`) should be grouped together in their own separated commit. There is no need to split perf changes across multiple commits unless they address completely unrelated domains.
