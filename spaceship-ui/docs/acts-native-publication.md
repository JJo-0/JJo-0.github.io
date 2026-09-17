# Native Acts dashboards — 2026-09-18

## Scope

The author's request is original code, colors and typography, not a rewritten summary.
The six existing canonical post URLs, dates and source links remain. The three
Acts 1:1–5 readings now use their complete original dashboards rather than the
previous MDX adaptations. Three Acts 1:6–14 dashboards follow as entries 7–9.
Writing and Bible shelves use the same nine-entry series registry. Existing
notices, policies, news and non-Acts posts are unchanged.

## Source versus hosting layer

`src/data/acts-native/*.html` contains the six exact uploaded UTF-8 files.
`manifest.json` records their byte lengths and SHA256, plus compiled CSS SHA256.
All original inline application scripts, datasets and style blocks are retained
in the served HTML. No chart scores, claims or scholarly wording are adjudicated.
Raw files and served HTML are intentionally different: `acts-native-source.mjs`
replaces the runtime Tailwind CDN with compiled styles, uses local Chart.js,
and adds a separate hosting adapter, a standalone toolbar and folded source link.
The iframe prevents the blog's typography and global CSS from replacing source fonts.

The existing overview archive is unchanged. Its display adapter removes the
previous forced blog font rules while keeping the approved paper/ink/green skin,
full source content and earlier modal/keyboard fixes. The source sans/serif
stacks differ by page; there is deliberately no universal replacement font.

## Explicit compatibility changes

- Acts 1:1–5 #3 requests a nonexistent `Sans Serif KR` family in its original
  Google Fonts URL, invalidating that combined request. The served URL requests
  its genuine `Noto Serif KR` heading family only; the original body fallback
  stack is preserved. The raw upload is not edited.
- That same source calls an event-dependent reception filter during startup.
  The adapter replays its own All button so initialization receives a real
  button event. Source function text and reception data are unchanged.
- The separate adapter adds dark-mode colors, narrow-screen containment,
  keyboard activation of clickable cards and rendering of paired emphasis
  markers. It does not substitute fonts or alter chart data. Native charts use
  actual Chart.js, not an alternative canvas renderer.

## Reproduction and checks

Run from `spaceship-ui`: `pnpm acts:native:compile` regenerates the six committed
styles with Tailwind 3.4.17, matching the originals' configuration. This is an
operator step; ordinary builds do not run a network CSS compiler.
`pnpm acts:native:check` verifies raw hashes, source-script/style preservation,
route/source mapping, canvas counts and the absence of font overrides.
The existing Blog CI/content check and browser/live-smoke pipelines run these
checks. Browser coverage includes nine routes, three widths, both themes,
original source toggles, actual font-face loading, all 22 charts, tab switches,
search/filter resets, keyboard cards, modal identity and client navigation.
Passing implementation tests does not establish scholarly correctness or peer review.
