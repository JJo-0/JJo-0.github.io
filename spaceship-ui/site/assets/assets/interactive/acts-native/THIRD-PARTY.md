# Third-party assets

`chart.umd-4.4.8.js` is the unmodified Chart.js 4.4.8 distribution from
`https://cdn.jsdelivr.net/npm/chart.js@4.4.8/dist/chart.umd.js`.
SHA256: `e4cf4d144b222634f2e64ff707cd57b953f8de4b65b231cd5ac6bde114648e4d`.
Copyright (c) 2025 Chart.js Contributors; MIT license retained in the file header
and `Chart.js-LICENSE.md` (from the same package version).

The six `acts-*.css` files are generated with Tailwind CSS 3.4.17 using the
original HTML and per-page configuration. Tailwind is MIT-licensed; see
`Tailwind-LICENSE.txt`. Regenerate using `pnpm acts:native:compile` from
`spaceship-ui`. The per-file SHA256 digests are in
`src/data/acts-native/manifest.json`.

Font families and Google Fonts declarations belong to the source dashboards.
No font binaries are included in this directory or this change.
