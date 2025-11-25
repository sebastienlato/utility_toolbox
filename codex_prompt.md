# Codex Prompt — Useful Tools

You are Codex working inside an existing **React + Vite + Tailwind** project named **Useful Tools**.
Follow phases in order, and stop after each phase once the ‘Stop after’ conditions are met.

## Context & Constraints

- The project has ALREADY been created by the user using Vite and Tailwind.
- Do **NOT**:
  - Recreate or reinitialize the project.
  - Run scaffolding commands (e.g., `npm create vite@latest`, `npx tailwindcss init`, etc.).
  - Replace existing config files unless the user explicitly asks.
- You may **add dependencies** (e.g. `react-router-dom`, `qrcode.react`) and minimal config changes required for them to work.

- Detect whether the project uses **TypeScript or JavaScript** by inspecting `src/` and follow that choice consistently.

## Source of Truth

- **Follow `plan.md` as the main roadmap.**
- Use `architecture.md` as a reference for structure and how to add tools.
- Do **NOT** edit `plan.md` or `codex_prompt.md` unless explicitly requested.
- If something in `plan.md` is ambiguous, make a reasonable assumption and clearly explain it in your notes.

## Workflow Style

Work in **small, reviewable steps**:

1. Before making changes:

   - Briefly restate which **Phase** and **Tasks** from `plan.md` you’re working on.

2. Implement only what is in that phase.

3. After changes:

   - Show a concise summary of what changed (file-by-file).
   - Show a meaningful diff snippet for key files (not the entire project).
   - Propose a **multi-line commit message** in this format:

     ```bash
     git commit -m "feat: short summary" \
       -m "  - bullet 1" \
       -m "  - bullet 2" \
       -m "  - bullet 3"
     ```

4. Then **stop** and wait for user confirmation before starting the next phase.

## Code & Architecture Guidelines

- Use the **folder structure** described in `architecture.md` as a target (or refactor gently towards it).
- Prefer:

  - `src/features/...` for feature-specific screens and logic.
  - `src/components/...` for shared UI components (cards, buttons, layout).
  - `src/services/...` for reusable business logic.
  - A **tool registry** for central metadata about each tool.

- UI:

  - Use **Tailwind CSS** classes for styling.
  - Aim for a modern, slightly glassy, dark theme unless existing design dictates otherwise.
  - Ensure responsive design (mobile → desktop).
  - Keep JSX clean and readable (avoid deeply nested inline logic inside JSX where possible).

- Routing:
  - Use `react-router-dom` for SPA navigation:
    - `/` → Home (tool hub).
    - Named routes for each tool (e.g., `/image-resizer`).
  - Prefer a central router setup with lazy-loaded routes if appropriate.

## Tools Behavior (High-level)

- **Background removal**:

  - Build the UI and abstraction for background removal.
  - Implement logic via a **service** that is stubbed but structured for a real API.
  - Provide clear `TODO` comments where an external API would plug in.

- **Image renamer**:

  - Allow multiple images to be uploaded.
  - Configure filename patterns.
  - Download renamed files.
  - Use clean state management (hooks or small store).

- **Image resizer**:

  - Use `<canvas>` for client-side resizing.
  - Allow download of resized output.

- **QR code generator**:
  - Use a QR library to generate QR codes.
  - Support basic options (size, error correction).
  - Allow download of PNG output.

## Quality Bar

- Prioritize **clarity and maintainability**:

  - Meaningful component names.
  - Small, focused components.
  - Comments where logic is non-obvious.

- Accessibility:

  - Use semantic HTML (`<main>`, `<header>`, `<button>`, `<label>`, etc.).
  - Ensure keyboard navigation and focus states are clear.

- Do **not** introduce unnecessary dependencies.
- Extract reusable patterns (e.g., a `ToolPageShell`) where appropriate.

## If You Get Stuck

- If a step in `plan.md` is blocked due to missing context or conflicting code:
  - Explain the issue.
  - Propose 1–2 ways to proceed.
  - Wait for user confirmation.

Remember: Follow `plan.md` phase by phase, keep changes tight and reviewable, and always propose a **multi-line commit message** at the end of each phase.
