# GRC Prompt Generator

Static site for The AI GRC Desk. Pick a workstream, use case and tech stack to get a structured AI prompt, a stack-specific workflow and a governance check. No build step and no backend: open `index.html` in a browser.

## Files

- `index.html` – page shell
- `styles.css` – styling
- `data.js` – all content (workstreams, stacks, use cases, framework list, subscribe settings)
- `app.js` – behaviour

## Editing content

Everything the page shows lives in `data.js`; the comment at the top explains how to add a use case. A use case with only `workstream`, `label` and `sub` shows "coming soon".

## Email capture

`DATA.subscribe` in `data.js`: the subscribe button links to `pageUrl`. To show the Beehiiv form inline, set `embedUrl` to the iframe `src` from Beehiiv's embed code (it must start with `https://embeds.beehiiv.com/`).

## Hosting on GitHub Pages

1. Create a repository on GitHub (Pages on a free account needs it to be public).
2. Push this folder to the `main` branch.
3. Repository Settings → Pages → Build and deployment → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
4. The site appears at `https://<username>.github.io/<repository>/` after a minute or two.

All asset paths are relative, so it works from a repository subpath.
