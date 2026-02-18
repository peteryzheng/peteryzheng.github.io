# Personal Website (GitHub Pages)

This repo now contains a static personal site built with plain `HTML/CSS/JS`.

## Local preview

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Content updates

- Main content source: `content/site.json`
- Page structure: `index.html`
- Styling/theme: `styles.css`
- Rendering/interaction logic: `main.js`

For pending profile-content tasks (milestones, publications, training trajectory), use the internal backlog in `AGENTS.md`.

## Deployment

Deployment is configured through GitHub Actions in `.github/workflows/deploy-pages.yml`.

Only these files are published to GitHub Pages:
- `index.html`
- `styles.css`
- `main.js`
- `content/site.json`
- `assets/docs/Youyun_Zheng_CV_S23.pdf`

This keeps the AMCAS and DAC source PDFs out of the deployed public site artifact.
