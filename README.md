# Welcome Bonus — landing page

A responsive Welcome Bonus landing page built as a **web component** (`<welcome-bonus>`) with plain HTML, CSS and vanilla JavaScript. No frameworks, no build step.

All texts and numbers are loaded from `campaign.json` (in production this would be the CMS API).

## How to run

The page loads JSON with `fetch`, so it must be served over HTTP (opening `index.html` directly from disk will not work).

**Option 1: VS Code Live Server**
Open the project folder in VS Code → right-click `index.html` → *Open with Live Server*.

**Option 2: Node.js**
```bash
npx serve .
```
Then open the URL it prints (e.g. http://localhost:3000).

> The project folder must be the server root, because image paths in the JSON start with `/images/…`.

**Test the "promotion ended" state:** set `endsAt` in `campaign.json` to a past date, e.g. `"2020-01-01T00:00:00Z"`.

## Embedding

```html
<link rel="stylesheet" href="welcome-bonus.css">
<script type="module" src="welcome-bonus.js"></script>

<welcome-bonus
  src="https://cms.example.com/campaigns/welcome-bonus"
  error-text="აქციის ჩატვირთვა ვერ მოხერხდა. სცადეთ მოგვიანებით.">
</welcome-bonus>
```

| Attribute | Purpose |
|---|---|
| `src` | URL of the campaign JSON |
| `error-text` | Message shown if the data fails to load (it can't come from the JSON itself) |

## Project structure

```
index.html          demo page that embeds the component
welcome-bonus.js    the custom element: loading, rendering, countdown
welcome-bonus.css   component styles (scoped with the wbl- prefix)
campaign.json       mock CMS data
images/             campaign images
```

## Implementation notes

- **Custom element without Shadow DOM.** Styles are scoped with a unique `wbl-` class prefix and selectors under `welcome-bonus`, so a plain external stylesheet works. Shadow DOM would give full encapsulation and is a possible next step.
- **Rendering.** The markup is rendered once with template strings. Every value from the JSON goes through `escapeHtml()` to prevent XSS from CMS content. Live updates (the countdown) only change `textContent`, so the DOM is not rebuilt every second.
- **Countdown.** Each tick recalculates the remaining time from `Date.now()` instead of subtracting 1 second, so it stays exact even when the browser throttles timers in background tabs. When time runs out, it shows `00 : 00 : 00 : 00` and *"აქცია დასრულდა"* and stops. An invalid `endsAt` is treated as ended. The timer is cleared in `disconnectedCallback`.
- **Progress bar.** The fill is based on `progress.current`; the scale ends at the last milestone. The last milestone sits at 95% of the track so the bar continues slightly past it, as in the design.
- **Slots.** A horizontal row with scroll-snap. It scrolls by touch, trackpad, Shift + wheel and keyboard (the row is focusable). The scrollbar is hidden to match the design and appears on hover for mouse users.
- **Georgian capitals.** Chrome does not apply `text-transform: uppercase` to Georgian, so elements marked with `data-caps` are converted to Mtavruli in JS. The JSON keeps normal text.
- **Responsive.** Desktop-first, with fluid font sizes via `clamp()` and breakpoints at 767px (mobile/tablet) and 480px (small phones).
- **Accessibility.** Semantic headings, a `<table>` for deposit tiers, `<details>`/`<summary>` for the rules accordion (works without JS and with the keyboard), `role="progressbar"` with ARIA values, `role="timer"`, alt texts from the data, and visible focus styles.

## Changes to the provided data

- **Added fields** (all texts must come from JSON): `hero.titleHighlight`, `missions.sectionTitle`, `missions.titleHighlight`, `register.url`, `deposit.url`, `deposit.currency`, `missions.buttonUrl`, and a `labels` object for small UI texts (table headers, countdown units, etc.).
- **More slots:** the slot list was extended with repeated entries (unique `id`s) to demonstrate horizontal scrolling. The component renders whatever list the CMS sends.
- The brief shows `hero.hero`, while the provided `campaign.json` uses `hero.image`; I followed the provided file. The hero banner itself is part of the background images (`full_desktop.png` / `full_mobile.png`), so it isn't rendered a second time.

## Design notes

- The **mobile mockup uses different sample data** from the JSON (e.g. 75₾ / 100₾ progress, "სხვა სლოტები", "3. შენი მისია"). The page always renders the values from `campaign.json`.
- **Font:** the brand font `"Noto Sans Ambassadori"` is first in the font stack, with `Noto Sans Georgian` as the fallback. Line breaks may differ slightly from the mockup because the brand font isn't publicly available; when embedded on the main site, the brand font is used automatically.

## Possible improvements

- Shadow DOM for full style encapsulation
- Per-slot links, if the CMS provides a URL for each slot
- A loading skeleton while the JSON is being fetched
- Unit tests for the countdown and progress calculations
