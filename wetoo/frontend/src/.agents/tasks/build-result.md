# Build Result

**Date:** review findings fix pass  
**Command:** `npm run build` (Vite 5.4.21)  
**Outcome:** ✅ SUCCESS — 1647 modules transformed, no errors or warnings.

## Findings Fixed

1. **Landing.jsx sentinel pattern** — Replaced all `t('landing.problemEyebrow') === 'The problem'` conditional blocks (PROBLEMS, TRUST, PLAN, PILLARS arrays, ~40+ inline string pairs) with proper `t()` catalogue calls. Added per-item keys to both `fr.js` and `en.js` under `landing.*`:
   - `problem1–4Title/Text`, `trust1–4Title/Text`, `plan1–4Title/Text`
   - `pillarChatbot/Learn/Community/Campaigns` × `Title/Tagline/Desc/Bullet1–3/Outro`

2. **ThemeToggle not connected to i18n** — Added `useLang()` import, replaced hardcoded `'clair'`/`'sombre'` with `t('theme.switchTo')(t(nextKey))` using the existing `theme.light`/`theme.dark` catalogue keys.

3. **LangToggle dual aria-label** — Removed the redundant `aria-label` spread prop; now uses only the `label` prop (`t('lang.ariaLabel')`) which `IconButton` sets as `aria-label` internally. The `switchTo` value is passed via `title` for tooltip.

4. **Pillar bullets mixed-language in EN locale** — The first pillar's third bullet in `en.js` was the standalone key `pillarChatbotBullet3` ("Knows how to say...") which is now fully in English. All four pillar bullet arrays are consistent in both languages.

## Output

```
dist/index.html                   1.08 kB │ gzip:   0.57 kB
dist/assets/index-DDIQzQ8P.css  139.11 kB │ gzip:  20.23 kB
dist/assets/index-DcV7sY_d.js   426.30 kB │ gzip: 122.53 kB
✓ built in 1.63s
```
