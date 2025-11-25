# Repository Guidelines

## Project Structure & Module Organization
The app is a Vite + React + TypeScript SPA. Source lives under `src/`, with `main.tsx` bootstrapping the app and `App.tsx` hosting routing/layout concerns. Feature folders (e.g., `src/features/tools`) should encapsulate their own pages, hooks, and services; shared UI goes under `src/components`, while cross-cutting logic such as API helpers belongs in `src/services`. Static assets reside in `public/`, and build artifacts land in `dist/` (gitignored). Keep architecture.md in sync when introducing new modules or registry entries.

## Build, Test, and Development Commands
- `npm install` — install dependencies after cloning or when package.json changes.  
- `npm run dev` — start the Vite dev server with hot reload on `http://localhost:5173`.  
- `npm run build` — run TypeScript project references (`tsc -b`) and produce the optimized Vite build under `dist/`.  
- `npm run lint` — execute the flat ESLint config (`eslint.config.js`) against all `ts/tsx` files; fix issues before committing.  
- `npm run preview` — serve the production build locally; run this before shipping UI-heavy changes.

## Coding Style & Naming Conventions
Write TypeScript with ES2020 features and React function components; prefer hooks over class components. Use two-space indentation, single quotes in JSX attributes when possible, and keep files short with focused exports. Components use PascalCase (`ToolCard.tsx`), hooks use `useCamelCase` (`useImageRenamer.ts`), and utilities use camelCase. Favor Tailwind utility classes; extract repeated patterns into small components or helper class strings. Run ESLint frequently and address autofixable issues via `npm run lint -- --fix`.

## Testing Guidelines
No automated tests are configured yet, so add Vitest + React Testing Library when you introduce logic that benefits from coverage. Co-locate spec files as `ComponentName.test.tsx` or `hookName.test.ts` near the unit under test. Prefer test IDs instead of brittle DOM selectors, and mirror user flows via RTL. When Vitest is present, run `npm run test -- --coverage` and target meaningful coverage on new code paths; include screenshots or GIFs for UI-only work until automated tests exist.

## Commit & Pull Request Guidelines
History favors short, imperative messages (`added proper architecture`). Follow that style: `verb + scope`, ≤72 chars, and reference issues in the body when relevant. Each PR should include: summary of changes, testing evidence (commands + results or screenshots), architectural considerations (e.g., new tool registry entries), and any follow-up tasks. Keep PRs focused; if you touch the registry or add dependencies, call that out explicitly so reviewers can verify deployment implications.
