# self-website

Personal site for Swarang Tanksali. Plain HTML, CSS and JavaScript: no build step, no packages, no third-party scripts, fonts or analytics.

```
index.html          page content
css/styles.css      design and animation
js/main.js          interactions (loader, hero canvas, counters, before/after, timeline, terminal, recommendations)
assets/             portrait, CV, favicon
versions/           saved earlier versions (v2-timeline: clickable career timeline)
```

Open a saved version at http://127.0.0.1:8765/versions/v2-timeline/ while previewing.

## Preview locally

```bash
python -m http.server 8765 --bind 127.0.0.1
```

Then open http://127.0.0.1:8765.

## Editing

- **Recommendations:** add entries to the `RECOMMENDATIONS` array at the top of `js/main.js` (`name`, `role`, `relation`, `text`). Text is rendered with `textContent`, so it can't inject HTML. If the array is empty, the section and its nav link hide themselves.
- **Cache busting:** bump `?v=` on the CSS/JS links in `index.html` after edits.
- **CV:** replace `assets/Swarang-Tanksali-CV.pdf`. Note: the current CV includes a phone number, and anyone visiting the site can download it.

## Security

A strict Content-Security-Policy (`default-src 'self'`) is set in `index.html`. The site makes no outbound requests. The only external links are LinkedIn and `mailto:`.
