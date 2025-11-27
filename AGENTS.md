# Repository Guidelines

## Project Structure & Module Organization
This is a Vite + React + TypeScript SPA. All runtime code lives under `src/`, with `main.tsx` bootstrapping React and `App.tsx` hosting routing/layout. Feature folders such as `src/features/tools` should bundle pages, hooks, and supporting services to keep domains isolated; reusable UI sits in `src/components`, and shared logic (API helpers, formatters) belongs in `src/services`. Place static assets in `public/`, while build artifacts are emitted into `dist/` (gitignored). Whenever you add a new module category or registry entry, mirror it in `architecture.md` so future contributors understand the boundaries.

## Build, Test, and Development Commands
- `npm install` — install or update dependencies after cloning or editing `package.json`.
- `npm run dev` — start the Vite dev server on `http://localhost:5173` with HMR for local work.
- `npm run build` — run TypeScript project references (`tsc -b`) and produce the optimized Vite output in `dist/`.
- `npm run lint` — execute the flat ESLint config (`eslint.config.js`) against all `ts/tsx` files; fix issues before committing.
- `npm run preview` — serve the production build locally; use this for final UI smoke tests before shipping.

## Coding Style & Naming Conventions
Write modern TypeScript using ES2020 features and React function components; prefer hooks over classes. Use two-space indentation and favor single quotes inside JSX attributes when practical. Components follow PascalCase (`ToolCard.tsx`), hooks use `useCamelCase` (`useImageRenamer.ts`), utilities stay camelCase, and CSS relies on Tailwind utility classes; extract recurring patterns into lightweight helpers. Run `npm run lint -- --fix` for autofixable issues and keep files focused with a default export per module when possible.

## Testing Guidelines
Vitest + React Testing Library are the preferred stack when logic warrants coverage. Co-locate specs as `ComponentName.test.tsx` or `hookName.test.ts`. Target real user flows, lean on test IDs, and avoid brittle DOM selectors. When tests exist, run `npm run test -- --coverage` before PRs and add screenshots or GIFs for purely visual changes until automated coverage expands.

## Commit & Pull Request Guidelines
Follow the repository history: short, imperative commit messages (`verb + scope`, ≤72 chars), referencing issues in the body when relevant. Pull requests should summarize changes, list testing evidence (commands + results or media), mention architectural updates or registry additions, and call out dependency or tooling modifications explicitly. Keep PRs focused, and ensure lint/build/test commands all pass locally before requesting review.
