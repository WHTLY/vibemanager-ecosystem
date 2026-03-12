# VibeManager improvement plan

## Phase 1 – Correctness & robustness

| # | Task | Owner | Notes |
|---|------|--------|------|
| 1.1 | Handle missing `aggregated.json` in frontend | done | Fetch `/aggregated.json`; loading + error state; aggregate also writes to frontend/public/ |
| 1.2 | Harden sync: safe git URL usage | done | execFileSync with args; URL validated via GIT_URL_RE (https/git@/ssh only, length cap) |

## Phase 2 – Quality & maintainability

| # | Task | Owner | Notes |
|---|------|--------|------|
| 2.1 | Lint backend: extend ESLint to `VibeManager-app/src/*.js` | done | eslint.config.js + @eslint/js, globals.node; `npm run lint` |
| 2.2 | Add aggregate test | done | test/fixtures/data/projects/fake/VibeAgent/; AGGREGATE_ROOT; node --test test/aggregate.test.js |
| 2.3 | Add frontend test (optional) | done | Vitest + RTL + jest-dom; App.test.jsx (load, filter by health) |

## Phase 3 – DX & docs

| # | Task | Owner | Notes |
|---|------|--------|------|
| 3.1 | README: one line that start runs aggregate then dev | done | Root README updated; note on sync + aggregate to refresh |
| 3.2 | Add `.env.example` when env is introduced | – | Skip until first env var exists |
| 3.3 | Shorten/customize `VibeManager-app/frontend/README.md` | done | One line: data from aggregated.json |

## Phase 4 – Optional / later

| # | Task | Owner | Notes |
|---|------|--------|------|
| 4.1 | Single CLI entry: `node cli.js sync|aggregate|both` | – | Delegates to sync.js / aggregate.js |
| 4.2 | TypeScript or JSDoc + checkJs for backend | – | Higher effort, better safety |
| 4.3 | Parallelize aggregate per-project reads | – | Only if many projects |
| 4.4 | Dashboard: "Refresh" or serve JSON from backend | – | If live refresh is needed |
| 4.5 | Document sensitivity of `repositories.json` (or gitignore) | – | If repo is public/shared |

## Done (this session)

- Fixed App.jsx template literals (filter + health badge classNames).
- Added `sync`, `aggregate`, `start` scripts; removed invalid `main` in VibeManager-app/package.json.
- Executed plan: 1.1–1.2, 2.1–2.3, 3.1, 3.3 (see table notes above).
