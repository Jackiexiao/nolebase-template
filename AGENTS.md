# Repository Guidelines

## Project Structure & Module Organization
Markdown sits in `笔记/` and shared views in `视图/`; keep each note's `assets/` sibling to preserve relative links when syncing from Obsidian to VitePress. `index.md` defines the landing page, `.vitepress/` holds theme/config (creators, giscus), `metadata/` stores global copy, `public/` keeps static assets, `scripts/` houses automation, and `.github/workflows/` contains CI.

## Build, Test, and Development Commands
- `pnpm install` — installs workspace dependencies.
- `pnpm docs:dev` — runs `scripts/update.ts` then starts the dev server.
- `pnpm docs:build` — builds `.vitepress/dist`; gate merges on success.
- `pnpm docs:serve` — serves `.vitepress/dist` for manual smoke tests.
- `pnpm run update` — refreshes metadata, thumbnails, and git stats headless.

## Coding Style & Naming Conventions
`.editorconfig` enforces UTF-8, LF endings, two-space indentation, trimmed whitespace, and trailing newlines. Components under `.vitepress/theme` stay PascalCase with named exports, Markdown slugs prefer kebab-case or descriptive Chinese names (e.g., `JavaSE/集合进阶.md`), and images live in per-note `assets/` folders referenced relatively. Lint TypeScript/JS with `pnpm dlx eslint .` and prose with `pnpm dlx markdownlint '**/*.md'`.

## Testing Guidelines
`pnpm docs:build` is the main regression test because it executes the update script, Markdown transforms, and asset bundling in one pass. Follow with `pnpm docs:serve` to manually verify UnoCSS tokens, enhanced headings, and giscus slots. When altering parsers or front-matter, run `pnpm tsx test-date-parse.ts` plus targeted spot checks (temporary cases can live in `笔记/test_feature.md`).

## Commit & Pull Request Guidelines
History favors short commits named with an author tag plus issue (e.g., `风铃 #43`); continue that or adopt `<scope>: <summary>` while keeping one logical change per commit. Run `pnpm run update && pnpm docs:build` (or `pnpm docs:dev`) before pushing. Pull requests should link issues, summarize scope, attach screenshots for UI changes, and call out deployments when `metadata/index.ts` or `.vitepress/theme/index.ts` is touched.

## Deployment & Configuration Tips
Adjust global copy in `metadata/index.ts`, homepage sections in `index.md`, and contributor links via `.vitepress/creators.ts`. Tune giscus inside `.vitepress/theme/index.ts`, ensuring the referenced GitHub repository remains public. For Vercel, keep the output directory at `.vitepress/dist`, disable unused Netlify workflows, and verify env vars before promoting.

## Security & Access Controls
Limit secrets to local `.env` files and never commit API tokens; CI reads configuration from repository settings. Giscus discussions require a public GitHub repo, so confirm visibility before enabling comments. When syncing from Obsidian, scan pasted code blocks for credentials and use `.gitignore` to exclude private vault folders.
