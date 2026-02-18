# Repository Guidelines

## Project Structure & Module Organization
This repository is a static GitHub Pages site (no framework build step).

- `index.html`, `styles.css`, `main.js`: main personal site shell, styling, and rendering logic.
- `blackjack.html`, `blackjack.css`, `blackjack.js`: standalone game page.
- `content/site.json`: primary content source (profile text, links, section data).
- `assets/`: published static assets (for example `assets/images/`, `assets/docs/`).
- `.github/workflows/deploy-pages.yml`: deployment workflow and allowlist of files pushed to Pages.

## Build, Test, and Development Commands
- `python3 -m http.server 8000`  
  Serve the site locally at `http://localhost:8000`.
- `node --check main.js && node --check blackjack.js`  
  Quick JavaScript syntax validation.
- `python3 -m json.tool content/site.json >/dev/null`  
  Validate JSON content formatting/syntax.
- `rg --files`  
  Fast file discovery when navigating the repo.

## Coding Style & Naming Conventions
- Use 2-space indentation in HTML/CSS/JS and JSON.
- Prefer clear, small vanilla JS functions over large monolithic blocks.
- Use `kebab-case` for filenames (exception: existing legacy asset names).
- Keep CSS variables in `:root` and reuse them; avoid ad-hoc hardcoded colors.
- Keep content changes in `content/site.json` whenever possible, not hardcoded in HTML.

## Testing Guidelines
There is no formal test framework in this repo yet.

- Run the syntax/JSON checks above before committing.
- Manually verify desktop + mobile layout for UI changes.
- For behavior changes (e.g., Blackjack rules), test core flows: start round, hit/stand, win/loss, redirect conditions.

## Commit & Pull Request Guidelines
Git history uses short, imperative commit subjects (for example: `style upgrade`, `blackjack new rules`).

- Keep commit messages concise and action-focused.
- PRs should include:
  - What changed and why.
  - Files/sections affected.
  - Screenshots or short GIFs for visual/gameplay changes.
  - Any deployment workflow updates.

## Security & Content Notes
- Do not expose private source documents in deployed artifacts unless explicitly approved.
- If adding assets, ensure `.github/workflows/deploy-pages.yml` includes only intended public files.
- When adding/removing public pages or changing URLs, update all of: `sitemap.xml`, `robots.txt` (sitemap line), canonical tags in HTML, and `.github/workflows/deploy-pages.yml` artifact copy list.

## Internal Content Backlog
The following items were intentionally removed from public website copy and should be tracked here until finalized:

- Add newest validated result and manuscript/preprint status for structural variant insertion work.
- Add newest figures, conference abstract, and data-release plans for spatial CNS tumor profiling work.
- Add recent publications, preprints, posters, and invited talks since the 2023 CV snapshot.
- Add current thesis milestone target, expected graduation window, and planned residency/research direction.
