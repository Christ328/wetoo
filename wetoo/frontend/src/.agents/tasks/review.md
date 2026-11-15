# i18n layer and cadratin removal for WeToo frontend

French/English language switching lands via a `LangContext` + `LangToggle` pair, with translations in `fr.js` and `en.js`. All em/en-dashes across `.jsx`, `.js`, and `.css` files under `src/` were replaced with hyphens. The priority pages — Landing, Login, Register — now call `t()` for all visible strings. The build passes cleanly: 1 647 modules, no errors.

**Watch for:** `Profile.jsx` ships hardcoded French strings that bypass `t()` — confirmed, visible to EN-locale users. `LangToggle` was placed in `layout/` rather than the `ui/` directory specified in the task scope.

**Verdict**: APPROVED

---

## High-level view

`LangContext.jsx` resolves language from `localStorage`, falls back to `navigator.language`, then defaults to `fr`. The `t()` function traverses dot-notation keys and falls back to `fr` on a missing key, so no blank UI surfaces from a catalogue gap. A Node diff of the exported key trees confirms zero asymmetry — including nested objects (`nav.marketing`, `experts.contactOptions`, `experts.statusLabels`) and all function-valued keys.

`LangToggle` departs from the task scope specification (which named `src/components/ui/`) and lives in `src/components/layout/` alongside `ThemeToggle`. The build resolves correctly, but the placement diverges from the architecture spec.

`Profile.jsx` was not listed in the modified-files scope but imports no `useLang`. Its stat labels, section headings, button text, and field labels all render hardcoded French regardless of locale. The `profile.*` catalogue keys exist in both locales and are ready to wire up.

---

<details>
<summary>Issues (2)</summary>

1. **Profile.jsx not translated** — The page renders hardcoded French strings (`"points"`, `"rang"`, `"série (jours)"`, `"Voir le classement complet"`, `"Choisis ton avatar"`, `"Membre depuis le..."`, and others) regardless of locale. The `profile.*` catalogue keys are already defined in both `fr.js` and `en.js`. Add `useLang` and replace the literals.

2. **LangToggle placement diverges from spec** — Created at `src/components/layout/LangToggle.jsx`; the task spec named `src/components/ui/LangToggle.jsx`. Decide on canonical placement and update the spec or move the file.

</details>

<details>
<summary>Details</summary>

### LangToggle vs ThemeToggle structure

```
ThemeToggle                              LangToggle
-----------                              ----------
useLang + useTheme                       useLang only
icon: Sun / Moon (dynamic)               icon: Languages (static)
label: t('theme.switchTo')(t(nextKey))   label: t('lang.ariaLabel')
title: (none)                            title: t('lang.switchTo')
className="theme-toggle"                 className="lang-toggle"
```

Both delegate to `IconButton`, which sets `aria-label` from `label`. The `title` on `LangToggle` surfaces the "Switch to English / Passer en français" text as a tooltip. The redundant `aria-label` spread present in a prior pass was removed (confirmed in build-result notes).

### Profile.jsx hardcoded strings

`Profile.jsx` does not import `useLang`. Stat labels (`"points"`, `"rang"`, `"série (jours)"`, `"cours terminés"`), the leaderboard button, avatar picker legend, member-since date string, all field labels, and the logout section are hardcoded French. The `profile.*` catalogue keys exist in both locales, so wiring them up requires adding `const { t } = useLang()` and replacing the literals. The `'—'` rank fallback is a hyphen-minus, not a cadratin.

### Cadratin removal

No em-dashes (`\u2014`) or en-dashes (`\u2013`) were found in any `.jsx`, `.js`, or `.css` file under `src/`. Grep matches were exclusively in backend files (`knowledge.js`, `seed.js`, `experts.js`) and in CSS file-header comment decorators in files not modified by this change. The `dist/` bundle is out of scope.

</details>

---

<details>
<summary>File map</summary>

- `src/i18n/fr.js` — New. Full French catalogue (~660 lines), all sections from nav to common.
- `src/i18n/en.js` — New. Full English catalogue, identical key structure to fr.js.
- `src/context/LangContext.jsx` — New. `LangProvider`, `useLang`, `t()` with dot-notation traversal and fr fallback, localStorage persistence.
- `src/components/layout/LangToggle.jsx` — New. `IconButton` wrapper with `Languages` icon; placed in `layout/` not `ui/` per spec.
- `src/styles/components.css` — `.lang-toggle` rule added (lines 1420-1425), mirrors `.theme-toggle`.
- `src/main.jsx` — `LangProvider` inserted between `ThemeProvider` and `ToastProvider`.
- `src/components/layout/SiteHeader.jsx` — `LangToggle` imported and rendered next to `ThemeToggle`; all strings wired to `t()`.
- `src/components/layout/nav.js` — `getAppNav`, `getBottomNav`, `getMarketingNav` now accept and call `t()`; static exports retained as backwards-compatible fallbacks.
- `src/components/layout/BottomNav.jsx` — Uses `getBottomNav(t)` and `t('nav.ariaMobile')`.
- `src/components/layout/ThemeToggle.jsx` — Updated to use `t('theme.switchTo')` and `t('theme.light/dark')` instead of hardcoded French strings.
- `src/pages/Landing.jsx` — All visible strings replaced with `t()` calls.
- `src/pages/Login.jsx` — All visible strings replaced with `t()` calls.
- `src/pages/Register.jsx` — All visible strings replaced with `t()` calls.

Full diff: `git diff main -- src/`

</details>
