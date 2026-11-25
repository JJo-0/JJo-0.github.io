# Home / Research Map performance experiment

## Candidate and controls

- A: baseline `fd7599ca4deecbd54b0e198957ee0236e3153bdf`
- B: graph-only `fbfca28bb255865ed917e58b78fb052257ce9746`
- C: profile-only: apply the profile change `f2a99a727dbe791e073a28b3883777acbf37c045` to A, resolving the Home import/hunk against A without any graph changes.
- D: combined candidate: exact PR head SHA.

Use identical content and dependency lockfiles for all variants; do not use a changing public deployment as an experimental control. Build each separately with `pnpm install --frozen-lockfile && pnpm build`, run four preview servers at distinct local ports (4321–4324). Run the candidate's script:

```sh
JJO_HOME_VARIANTS='{"A":{"url":"http://127.0.0.1:4321","sha":"<40-char-A>"},"B":{"url":"http://127.0.0.1:4322","sha":"<40-char-B>"},"C":{"url":"http://127.0.0.1:4323","sha":"<40-char-C>"},"D":{"url":"http://127.0.0.1:4324","sha":"<40-char-D>"}}' \
JJO_HOME_REPEATS=3 node scripts/browser-home-ab.mjs
```

The two-variant A/D run is supported if the intermediate controls are unavailable. It cannot identify the separate contribution of B/C. Record the exact SHA of every preview, use the same Chrome, machine and CPU throttling, and compare medians within each viewport, language and cache condition. The script records cold/warm initial HTML and resource bytes, FCP, observed LCP, long-task excess (not Lighthouse TBT), profile/map requests, 2-second visible-idle canvas redraw count and CDP main-thread task time. Third-party advertising/analytics are blocked by the existing smoke harness; this is not a field performance report or INP. Use the existing Mobile performance workflow's Lighthouse reports for lab LCP/TBT/CLS; do not relabel synthetic interaction latency as field INP.

## Regression gates

- Static preview first: no graph data/runtime, animated media or GPU context probe before explicit map/profile interaction.
- Map activation: preserve all same-language links, keyboard navigation/tooltip, drag, retry and theme refresh. No repeated idle redraw; hidden map does not redraw.
- Profile: static first frame <15 KiB, one-shot 34 frames / 2.27 seconds, disabled for reduced motion, no GIF network request.
- Existing content, renderer isolation, mobile motion, NEWS and article navigation contracts remain in CI.

The A/B experiment is **not measured** merely by creating this script. Report run outputs and exact tested refs before claiming a speedup. No score improvement is assumed.
