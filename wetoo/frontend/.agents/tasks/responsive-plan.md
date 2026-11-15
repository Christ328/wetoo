# WeToo — Mobile Responsiveness Remediation Plan

## Audit Context

**Breakpoints to use:** `480px` (xs), `640px` (sm), `768px` (md), `1024px` (lg)  
**Constraints:**
- Do NOT touch `global.css`, `tokens.css`, or `components.css`
- Do NOT modify `.jsx` files unless a structural HTML change is strictly necessary
- Do NOT touch the backend
- BottomNav: already `position:fixed` on mobile via `components.css` (`display:flex` at ≤900px) — **do not break**
- SiteHeader burger: already functional (`display:none` nav, `display:inline-flex` burger at ≤1180px) — **do not break**

---

## Pre-Audit Notes: What Is Already Correct

Before listing issues, the following is confirmed working and must not be broken:

- `global.css`: `img,svg,video { max-width:100% }` covers all images globally.
- `components.css`: `.bottom-nav { display:none }` → `display:flex` at ≤900px, `position:fixed bottom:0` — correct.
- `components.css`: `.site-header__burger { display:none }` → `display:inline-flex` at ≤1180px — correct.
- `components.css`: `.app-body` padding collapses at ≤900px — correct.
- `components.css`: `.btn` has `min-height:44px` — all buttons satisfy touch-target size.
- `components.css`: `.input` has `min-height:46px` — all inputs satisfy touch-target size.
- `global.css`: `h1/h2/h3` all use `clamp()` — correct.
- `components.css`: `.tabs` uses `overflow-x:auto` — correct.

---

## File-by-File Audit & Remediation

---

### 1. `src/pages/Landing.css`

#### Issues Found

| # | Category | Location | Problem |
|---|----------|----------|---------|
| 1 | Multi-column grid, no mobile fallback | `.hero__grid` | `grid-template-columns: 1.05fr 0.95fr` — collapses only at `≤1000px`, but no xs/sm treatment for the inner elements after collapse |
| 2 | Multi-column grid | `.solution__grid`, `.impact__grid` | `1fr 1fr` — collapses only at `≤1000px`, fine but missing xs padding |
| 3 | Multi-column grid | `.trust__grid` | `0.85fr 1.15fr` — collapses at `≤1000px` but `.trust__list` stays `1fr 1fr` until `≤640px` |
| 4 | Multi-column grid | `.stats-strip` | `repeat(4, 1fr)` becomes `repeat(2,1fr)` at ≤1000px — still too wide at 320px; the `border-left` dividers on items 1/2/3 remain visible but item 3 border is only removed without item 4 |
| 5 | Pillar layout | `.pillar` | `grid-template-columns: 1.15fr 0.85fr` — collapses at ≤1000px, OK. But `pillar--reverse` uses `direction:rtl` which can break bidirectional text rendering on mobile |
| 6 | Float cards overflow | `.float-card--myth { left:-8px }`, `.float-card--badge { right:-6px }` | Negative offsets cause horizontal scroll on narrow viewports; clamped at ≤640px to 0 but the parent `hero__visual` has no `overflow:hidden` |
| 7 | Fixed width on chat preview | `.chat-preview { max-width:430px }` | Not an overflow issue (uses `max-width`), but on 320px screens the internal bubbles at `max-width:88%` can still be tight |
| 8 | CTA font-size | `.cta-final__title { font-size: clamp(1.7rem, 4vw, ...) }` | Already using clamp — ✅ no fix needed |

#### Remediation

Add the following to the **bottom** of `src/pages/Landing.css`:

```css
/* ---- Responsive additions (do not modify existing rules above) ---- */

/* xs: stats strip becomes single column */
@media (max-width: 480px) {
  .stats-strip {
    grid-template-columns: 1fr 1fr; /* keep 2-col — 4 items fit */
  }
  .stats-strip__item + .stats-strip__item {
    border-left: none; /* remove all vertical dividers at xs */
  }

  /* Hero visual: hide float cards on very small screens to avoid overflow */
  .float-card {
    display: none;
  }

  /* Pillar reverse: drop rtl trick on mobile to avoid text issues */
  .pillar--reverse {
    direction: ltr;
  }

  /* Solution / impact / trust images: ensure they don't overflow */
  .solution__img,
  .trust__img {
    max-height: 260px;
    object-fit: cover;
  }
}

/* sm: hero padding and CTA actions */
@media (max-width: 640px) {
  .hero {
    padding-block: var(--space-8) var(--space-8);
  }

  .hero__visual {
    overflow: hidden; /* prevent float-card bleed */
  }

  .cta-final {
    padding: var(--space-8) var(--space-5);
  }

  .cta-final__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .cta-final__actions .btn {
    width: 100%;
    justify-content: center;
  }
}
```

**Verify:** Open the landing page on a 375px viewport. No horizontal scrollbar. Stats strip, hero, CTA render without overflow.

---

### 2. `src/pages/Home.css`

#### Issues Found

| # | Category | Location | Problem |
|---|----------|----------|---------|
| 1 | flex-row no collapse | `.home-page__campaign` | `display:flex; gap:var(--space-8); align-items:center; flex-wrap:wrap` — wraps but `.home-page__campaign-side { align-items:flex-end }` creates an awkward right-aligned block when wrapped; corrected at ≤520px but `.home-page__campaign-main { min-width:260px }` can still cause overflow on 320px |
| 2 | min-width fixed | `.home-page__campaign-main { min-width:260px }` | On a 320px screen with padding, 260px min-width plus gap leaves no room |
| 3 | Welcome title | `.home-page__welcome-title { font-size: clamp(1.8rem,...) }` | Already clamp — ✅ |
| 4 | Hello greeting | `.home-page__hello { font-size: clamp(1.6rem,...) }` | Already clamp — ✅ |
| 5 | Stats grid | `.home-page__stats { grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)) }` | At 320px with 4 items, `minmax(110px,1fr)` can force 2 per row — acceptable, but verify |

#### Remediation

Add to the **bottom** of `src/pages/Home.css`:

```css
/* ---- Responsive additions ---- */
@media (max-width: 480px) {
  .home-page__campaign-main {
    min-width: 0; /* override 260px — flex-wrap handles it */
    width: 100%;
  }

  .home-page__campaign {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-5);
  }

  .home-page__campaign-side {
    align-items: flex-start;
    width: 100%;
  }

  /* Quick-access tiles: reduce min-height on xs */
  .home-page__tile {
    min-height: 100px;
    padding: var(--space-4);
  }
}
```

**Verify:** Dashboard renders on 375px without horizontal overflow. Campaign block stacks cleanly.

---

### 3. `src/pages/Learn.css`

#### Issues Found

| # | Category | Location | Problem |
|---|----------|----------|---------|
| 1 | Fixed min-width | `.learn-page__band-text { min-width:220px }` | On 320px screen this can overflow |
| 2 | Filter group max-width | `.learn-page__filter-group--search { max-width:420px }` | Not an overflow issue (max not min) — ✅ |
| 3 | Missing xs breakpoint | The existing `@media (max-width:768px)` handles `flex-direction:column` but no xs treatment for the stat grid |

#### Remediation

Add to the **bottom** of `src/pages/Learn.css`:

```css
/* ---- Responsive additions ---- */
@media (max-width: 480px) {
  .learn-page__band-text {
    min-width: 0; /* was 220px — causes overflow on 320px */
    width: 100%;
  }

  .learn-page__band-stats {
    grid-template-columns: 1fr 1fr;
  }

  .learn-page__filter-group--search {
    max-width: 100%;
  }

  .learn-page__quiz-head {
    flex-direction: column;
    align-items: flex-start;
  }
}
```

**Verify:** Learn page on 375px — progress band, filter bar, quiz header all fit without overflow.

---

### 4. `src/pages/LessonDetail.css`

#### Issues Found

| # | Category | Location | Problem |
|---|----------|----------|---------|
| 1 | Emoji icon fixed size | `.lesson-detail__emoji { width:72px; height:72px }` | At xs, combined with header text it's fine, and `flex-direction:column` is applied at ≤640px — ✅ |
| 2 | Title font-size | `.lesson-detail__title { font-size:clamp(...) }` | Already clamp — ✅ |
| 3 | Lesson nav | `.lesson-detail__nav { grid-template-columns:1fr 1fr }` | Collapses to `1fr` at ≤640px — ✅ |
| 4 | sticky progress bar | `.lesson-detail__progress { position:sticky; top:var(--space-2) }` | On mobile the header is 68px tall; `top:var(--space-2)` (8px) causes the sticky bar to hide under the header |
| 5 | CTA body min-width | `.lesson-detail__cta-text { min-width:220px }` | Can overflow on 320px |

#### Remediation

Add to the **bottom** of `src/pages/LessonDetail.css`:

```css
/* ---- Responsive additions ---- */
@media (max-width: 768px) {
  /* Fix sticky progress bar clearing the fixed header */
  .lesson-detail__progress {
    top: calc(var(--header-h) + var(--space-2));
  }
}

@media (max-width: 480px) {
  .lesson-detail__cta-text {
    min-width: 0;
    width: 100%;
  }

  .lesson-detail__cta-body {
    flex-direction: column;
    align-items: stretch;
  }

  .lesson-detail__cta-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .lesson-detail__cta-actions .btn {
    width: 100%;
    justify-content: center;
  }
}
```

**Verify:** Lesson detail on 375px — sticky progress bar does not hide under header; CTA block stacks correctly.

---

### 5. `src/pages/Community.css`

#### Issues Found

| # | Category | Location | Problem |
|---|----------|----------|---------|
| 1 | Two-column layout stacks correctly | `.community-page__layout` | Default is `1fr`, becomes `1fr 340px` at ≥1024px — ✅ (mobile-first, correct) |
| 2 | Sidebar fixed width | At desktop `340px` sidebar — fine, desktop only — ✅ |
| 3 | Search max-width | `.community-page__search { max-width:520px }` → overridden to `100%` at ≥1024px — but on mobile `max-width:520px` is narrower than full width on some tablets; not an overflow but limits usability |
| 4 | Form actions | `.community-page__form-actions` — `flex-wrap:wrap; justify-content:flex-end` — on xs, two buttons may be awkwardly sized |

#### Remediation

Add to the **bottom** of `src/pages/Community.css`:

```css
/* ---- Responsive additions ---- */
@media (max-width: 480px) {
  .community-page__search {
    max-width: 100%;
  }

  .community-page__form-actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .community-page__form-actions .btn {
    width: 100%;
    justify-content: center;
  }
}
```

**Verify:** Community page on 375px — search bar fills width, modal form actions stack cleanly.

---

### 6. `src/pages/PostDetail.css`

#### Issues Found

| # | Category | Location | Problem |
|---|----------|----------|---------|
| 1 | Title font-size | `.post-detail__title { font-size:clamp(1.5rem, 3vw, ...) }` | `3vw` at 375px = 11.25px which is too small! The clamp floor of `1.5rem` saves it, but the viewport interpolation is awkward |
| 2 | Ghost avatar | `.post-detail__ghost { width:64px; height:64px }` | Fine, but combined with author text in a `flex-wrap` row can be tight at 320px |
| 3 | Reaction buttons | `.post-detail__react { min-height:44px }` | ✅ meets touch target |
| 4 | Form actions | `.post-detail__form-actions { justify-content:flex-end; flex-wrap:wrap }` | Two buttons at xs can be awkwardly sized |

#### Remediation

Add to the **bottom** of `src/pages/PostDetail.css`:

```css
/* ---- Responsive additions ---- */
@media (max-width: 480px) {
  .post-detail__head {
    flex-direction: column;
    align-items: flex-start;
  }

  .post-detail__actions {
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .post-detail__form-actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .post-detail__form-actions .btn {
    width: 100%;
    justify-content: center;
  }
}
```

**Verify:** Post detail on 375px — post header, actions row, reply form actions render without overflow.

---

### 7. `src/pages/Experts.css`

#### Issues Found

| # | Category | Location | Problem |
|---|----------|----------|---------|
| 1 | Search max-width | `.experts-page__search { max-width:520px }` | Same as community — on tablets it limits the input; on mobile it's fine since it's `<100%` |
| 2 | Grid | Likely uses `.grid-2` / `.grid-3` utility from `global.css` with `auto-fit minmax` — ✅ responsive by default |
| 3 | Form actions | `.experts-page__form-actions { justify-content:flex-end; flex-wrap:wrap }` | xs issue — two buttons |
| 4 | Request head | `.experts-page__request-head { display:flex; align-items:flex-start; justify-content:space-between }` | At xs, status badge + expert name can overlap |

#### Remediation

Add to the **bottom** of `src/pages/Experts.css`:

```css
/* ---- Responsive additions ---- */
@media (max-width: 480px) {
  .experts-page__search {
    max-width: 100%;
  }

  .experts-page__form-actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .experts-page__form-actions .btn {
    width: 100%;
    justify-content: center;
  }

  .experts-page__request-head {
    flex-direction: column;
    gap: var(--space-2);
  }
}
```

**Verify:** Experts page on 375px — search, form modal actions, request list all fit cleanly.

---

### 8. `src/pages/Campaigns.css`

#### Issues Found

| # | Category | Location | Problem |
|---|----------|----------|---------|
| 1 | Featured hero layout | `.campaigns-page__featured { display:flex; align-items:center; gap:var(--space-6); padding:var(--space-8) }` | On narrow screens the emoji (3.5rem) + body text side by side is cramped. Already collapsed at ≤640px — ✅ |
| 2 | Featured emoji size | At ≤640px it stays `3.5rem` with the column layout — on 320px the large emoji + padding can be tight |
| 3 | Card actions | `.campaigns-page__card-actions { flex-wrap:wrap }` — ✅ |
| 4 | Grid | Uses `global.css` utility `.grid-2/.grid-3` with `auto-fit` — ✅ |

#### Remediation

Add to the **bottom** of `src/pages/Campaigns.css`:

```css
/* ---- Responsive additions ---- */
@media (max-width: 480px) {
  .campaigns-page__featured {
    padding: var(--space-5);
    gap: var(--space-4);
  }

  .campaigns-page__featured-emoji {
    font-size: 2.5rem;
  }

  .campaigns-page__featured-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .campaigns-page__featured-actions .btn {
    width: 100%;
    justify-content: center;
  }
}
```

**Verify:** Campaigns page on 375px — featured banner, actions stack correctly.

---

### 9. `src/pages/CampaignDetail.css`

#### Issues Found

| # | Category | Location | Problem |
|---|----------|----------|---------|
| 1 | Hero layout | `.campaign-detail__hero { display:flex; align-items:center; gap:var(--space-6); padding:var(--space-10) var(--space-8) }` | Collapses at ≤640px — ✅. But `padding:var(--space-10) var(--space-8)` = 40px vertical, 32px horizontal — at 320px this leaves only 256px of content width |
| 2 | Hero emoji | `font-size:4rem` at mobile (after collapse) — very large, reduces to `3rem` at ≤640px — acceptable |
| 3 | Timeline | `.campaign-detail__timeline { padding-left:var(--space-6) }` with `::before left:17px` — on 320px screens the 24px wide content left of the timeline marker is fine |
| 4 | Share / CTA actions | `flex-wrap:wrap` — ✅ |
| 5 | Breadcrumb overflow | No `flex-wrap` or `min-width:0` on the breadcrumb span |

#### Remediation

Add to the **bottom** of `src/pages/CampaignDetail.css`:

```css
/* ---- Responsive additions ---- */
@media (max-width: 480px) {
  .campaign-detail__hero {
    padding: var(--space-5) var(--space-4);
    gap: var(--space-3);
  }

  .campaign-detail__breadcrumb {
    flex-wrap: wrap;
  }

  .campaign-detail__breadcrumb span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: calc(100vw - 120px);
  }

  .campaign-detail__hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .campaign-detail__hero-actions .btn {
    width: 100%;
    justify-content: center;
  }
}
```

**Verify:** Campaign detail on 375px — hero padding, breadcrumb, action buttons all fit without overflow.

---

### 10. `src/pages/Chat.css`

#### Issues Found

| # | Category | Location | Problem |
|---|----------|----------|---------|
| 1 | Two-column layout | `.chat-page__layout { grid-template-columns: minmax(0,1fr) 300px }` | Collapses to `1fr` at ≤1024px — ✅ |
| 2 | Panel height | `height: clamp(420px, 66dvh, 700px)` | At 375px with BottomNav (64px) + header (68px), 66dvh ≈ 541px. Total = 541+68+64 = 673px > typical mobile viewport (667px). Scroll would hide composer |
| 3 | Fixed height chat panel | At ≤768px becomes `clamp(400px, 72dvh, 780px)` — 72dvh on a 667px screen = 480px. With header (68) + bottom-nav (64) = 612px → fits a 667px screen by 55px, which is very tight |
| 4 | Aside toggle button | `.chat-page__aside-toggle { min-height:46px }` — ✅ touch target |
| 5 | Composer on mobile | The composer is inside the fixed-height panel — ✅ it scrolls with the panel |

#### Remediation

Add to the **bottom** of `src/pages/Chat.css`:

```css
/* ---- Responsive additions ---- */
@media (max-width: 640px) {
  /* Use a calculated height that accounts for header + bottom nav */
  .chat-page__panel {
    height: calc(
      100dvh
      - var(--header-h)
      - var(--bottom-nav-h)
      - var(--safe-top)
      - var(--safe-bottom)
      - var(--space-8)   /* breathing room */
    );
    min-height: 320px;
    max-height: none;
  }
}

@media (max-width: 480px) {
  .chat-page__scroll {
    padding: var(--space-3);
  }

  .chat-page__composer {
    padding: var(--space-2) var(--space-3) var(--space-2);
  }
}
```

**Verify:** Chat page on 375px — the chat panel is fully visible above the BottomNav, composer input is accessible without scrolling the page.

---

### 11. `src/pages/Profile.css`

#### Issues Found

| # | Category | Location | Problem |
|---|----------|----------|---------|
| 1 | Two-column grid | `.profile-page__grid { grid-template-columns: 0.85fr 1.15fr }` at ≥1000px | Default is `1fr` — ✅ mobile-first |
| 2 | Stats grid | `.profile-page__stats { grid-template-columns: repeat(2, minmax(0,1fr)) }` | Fixed 2-col, no xs collapse. On 320px, two stat cards side-by-side at ~140px each is very tight |
| 3 | Avatar option | `.profile-page__avatar-option { width:48px; height:48px }` | ✅ meets 44px touch target |
| 4 | Identity at xs | Already `flex-direction:column` at ≤520px — ✅ |
| 5 | Theme buttons | `.profile-page__theme-btn { min-height:44px }` — ✅ |

#### Remediation

Add to the **bottom** of `src/pages/Profile.css`:

```css
/* ---- Responsive additions ---- */
@media (max-width: 480px) {
  /* Stats cards: stay 2-col but use smaller padding */
  .profile-page__stat {
    padding: var(--space-2);
  }

  .profile-page__stat-value {
    font-size: var(--text-lg); /* was text-xl — prevent overflow in narrow cards */
  }

  .profile-page__form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .profile-page__form-actions .btn {
    width: 100%;
    justify-content: center;
  }

  /* Badge grid: ensure cards don't overflow */
  .profile-page__badge {
    min-width: 0;
  }
}
```

**Verify:** Profile page on 375px — stat cards, form actions render without overflow.

---

### 12. `src/pages/Quizzes.css`

#### Issues Found

| # | Category | Location | Problem |
|---|----------|----------|---------|
| 1 | Grid | Uses global `.grid-3` utility with `auto-fit minmax(280px,1fr)` | On 320px, `minmax(280px,1fr)` forces a single 280px column that is nearly as wide as the viewport — but `min(100%, 280px)` in `global.css` saves it — ✅ |
| 2 | Card emoji | `.quizzes-page__emoji { width:56px; height:56px }` — not an issue |
| 3 | No responsive rules at all | The file has **zero** `@media` blocks | No xs/sm-specific adjustments |

#### Remediation

Add to the **bottom** of `src/pages/Quizzes.css`:

```css
/* ---- Responsive additions ---- */
@media (max-width: 480px) {
  .quizzes-page__grid {
    margin-top: var(--space-5);
  }

  .quizzes-page__action .btn {
    width: 100%;
    justify-content: center;
  }
}
```

**Verify:** Quizzes page on 375px — cards fill width, start buttons are full-width and easy to tap.

---

### 13. `src/pages/QuizRunner.css`

#### Issues Found

| # | Category | Location | Problem |
|---|----------|----------|---------|
| 1 | Header layout | `.quiz-runner__header { display:flex; align-items:center; gap:var(--space-4) }` | The 64px emoji + title text can be cramped at 320px |
| 2 | Nav at xs | Already collapses at ≤560px with `flex-direction:column-reverse` and `width:100%` on buttons — ✅ |
| 3 | Score number | `.quiz-runner__score-number { font-size:clamp(var(--text-5xl), 12vw, var(--text-6xl)) }` | At 375px: `12vw = 45px` ≈ `text-5xl` — ✅ |
| 4 | Option min-height | `.quiz-runner__option { min-height:52px }` — ✅ exceeds 44px touch target |

#### Remediation

Add to the **bottom** of `src/pages/QuizRunner.css`:

```css
/* ---- Responsive additions ---- */
@media (max-width: 480px) {
  .quiz-runner__header {
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .quiz-runner__header-emoji {
    width: 52px;
    height: 52px;
  }

  .quiz-runner__title {
    font-size: var(--text-xl); /* override clamp floor — title stays readable */
  }

  .quiz-runner__score-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .quiz-runner__score-actions .btn {
    width: 100%;
    justify-content: center;
  }
}
```

**Verify:** Quiz runner on 375px — header, options, score screen all render correctly.

---

### 14. `src/pages/Myths.css`

#### Issues Found

| # | Category | Location | Problem |
|---|----------|----------|---------|
| 1 | Grid | `.myths-page__grid { grid-template-columns: repeat(auto-fill, minmax(min(100%, 330px), 1fr)) }` | ✅ mobile-first (uses `min(100%, 330px)`) |
| 2 | Search max-width | `.myths-page__search { max-width:520px; width:100% }` | ✅ |
| 3 | CTA section | `.myths-page__cta { flex-wrap:wrap; justify-content:space-between }` — collapses at ≤520px — ✅ |
| 4 | Myth/truth cards | `.myth-card__myth / .myth-card__truth` have `padding:var(--space-4)` — fine on mobile |
| 5 | No xs breakpoint | No `@media` rules between 520px and 0 |

#### Remediation

Add to the **bottom** of `src/pages/Myths.css`:

```css
/* ---- Responsive additions ---- */
@media (max-width: 480px) {
  .myths-page__tools {
    margin-bottom: var(--space-5);
  }

  /* Myth icon: slightly smaller on xs */
  .myth-card__icon {
    width: 28px;
    height: 28px;
  }

  /* Ensure the card text doesn't overflow narrow screens */
  .myth-card__text {
    font-size: var(--text-sm);
    word-break: break-word;
  }
}
```

**Verify:** Myths page on 375px — cards render without overflow, text readable.

---

### 15. `src/pages/Leaderboard.css`

#### Issues Found

| # | Category | Location | Problem |
|---|----------|----------|---------|
| 1 | Podium 3-col | `.leaderboard-page__podium { grid-template-columns: repeat(3, minmax(0,1fr)) }` | No minimum column width — at 320px, each podium card is ~100px wide, which is very tight for the content inside (avatar, name, points) |
| 2 | Row grid | `.leaderboard-page__row { grid-template-columns: 2rem auto 1fr auto auto }` | At 560px it drops to 4-col and hides level label — at 320px there's still potential overflow with long usernames |
| 3 | Points list | `grid-template-columns:1fr 1fr` at ≥720px, `1fr` below — ✅ |
| 4 | Podium item padding | Already reduced at ≤560px — ✅ |

#### Remediation

Add to the **bottom** of `src/pages/Leaderboard.css`:

```css
/* ---- Responsive additions ---- */
@media (max-width: 480px) {
  .leaderboard-page__podium {
    gap: var(--space-2);
  }

  .leaderboard-page__podium-item {
    padding: var(--space-3) var(--space-1);
    gap: var(--space-1);
  }

  .leaderboard-page__podium-name {
    font-size: var(--text-xs);
  }

  .leaderboard-page__podium-points strong {
    font-size: var(--text-base);
  }

  .leaderboard-page__row {
    grid-template-columns: 1.5rem auto 1fr auto;
    gap: var(--space-1);
    padding-inline: var(--space-2);
    min-height: 48px;
  }

  /* Prevent long usernames from overflowing */
  .leaderboard-page__row-name {
    max-width: 0; /* rely on min-width:0 + overflow:hidden + text-overflow already set */
  }
}
```

**Verify:** Leaderboard on 375px — podium and list rows render without overflow. Long usernames are truncated.

---

### 16. `src/pages/Resources.css`

#### Issues Found

| # | Category | Location | Problem |
|---|----------|----------|---------|
| 1 | Emergency grid | `.resources-page__emergency-calls { grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px),1fr)) }` | ✅ mobile-first |
| 2 | Call button | `.resources-page__call { min-height:64px; display:flex; align-items:center }` | ✅ large touch target |
| 3 | Grid | `.resources-page__grid { grid-template-columns: repeat(auto-fill, minmax(min(100%,300px),1fr)) }` | ✅ |
| 4 | CTA | `.resources-page__cta { display:flex; flex-wrap:wrap }` + xs breakpoint for full-width buttons — ✅ |
| 5 | Emergency head layout | `.resources-page__emergency-head { display:flex; gap:var(--space-4); align-items:flex-start }` | On 320px, the 52px icon + title text side-by-side can be tight |

#### Remediation

Add to the **bottom** of `src/pages/Resources.css`:

```css
/* ---- Responsive additions ---- */
@media (max-width: 480px) {
  .resources-page__emergency-head {
    flex-direction: column;
    gap: var(--space-3);
  }

  .resources-page__emergency-icon {
    width: 44px;
    height: 44px;
  }

  .resources-page__call-number {
    font-size: var(--text-xl); /* was text-2xl — prevents overflow in narrow call buttons */
  }
}
```

**Verify:** Resources page on 375px — emergency section renders cleanly, call buttons are fully visible.

---

### 17. `src/pages/Login.css`

#### Issues Found

| # | Category | Location | Problem |
|---|----------|----------|---------|
| 1 | Two-column at 900px | `.login-page__inner { grid-template-columns:1fr 1fr }` | Default is `1fr` — ✅ mobile-first |
| 2 | Title | `.login-page__title { font-size: clamp(2rem, 4vw, ...) }` | ✅ |
| 3 | Trust items | `.login-page__trust-item { display:flex; gap:var(--space-4); padding:var(--space-4) }` | On 320px the icon + text is fine since it has `align-items:flex-start` |
| 4 | Demo buttons | `.login-page__demo-btn { min-height:56px }` | ✅ touch target |
| 5 | Demo meta hidden at ≤520px | Already done — ✅ |
| 6 | Input with icon padding | `.login-page__input { padding-left: calc(var(--space-4)*2 + 18px) }` = 50px | ✅ enough space |
| 7 | No xs breakpoint for form actions | Submit button spans full width already (`.btn--block` implied) |

#### Remediation

Add to the **bottom** of `src/pages/Login.css`:

```css
/* ---- Responsive additions ---- */
@media (max-width: 480px) {
  .login-page {
    padding-block: var(--space-6) var(--space-10);
  }

  .login-page__trust-item {
    padding: var(--space-3);
    gap: var(--space-3);
  }

  .login-page__card {
    padding: var(--space-5);
  }
}
```

> **Note:** `.login-page__card` padding refers to a `.card--pad-md` or similar from `components.css`. Only add this rule if the card padding needs to be overridden; verify by inspection that the selector matches the rendered element.

**Verify:** Login page on 375px — form fits without horizontal scroll, trust items don't overflow.

---

### 18. `src/pages/Register.css`

#### Issues Found

| # | Category | Location | Problem |
|---|----------|----------|---------|
| 1 | Two-column at 980px | `.register-page__inner { grid-template-columns: 0.85fr 1.15fr }` | Default `1fr` — ✅ mobile-first |
| 2 | Title | `.register-page__title { font-size:clamp(1.9rem, 4vw, ...) }` | ✅ |
| 3 | Input with icon | Same as login — ✅ |
| 4 | Chip selection | `.register-page__chips { flex-wrap:wrap }` — ✅ |
| 5 | No xs breakpoint | No rules for 480px and below |

#### Remediation

Add to the **bottom** of `src/pages/Register.css`:

```css
/* ---- Responsive additions ---- */
@media (max-width: 480px) {
  .register-page {
    padding-block: var(--space-6) var(--space-10);
  }

  .register-page__note {
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-3);
  }

  /* Strength bars are already flex:1 with flex-wrap — fine */
  /* Chips are already flex-wrap — fine */
}
```

**Verify:** Register page on 375px — form, note block, chips render without overflow.

---

### 19. `src/components/layout/SiteHeader.jsx` + CSS in `components.css`

#### Issues Found (CSS in components.css, read-only reference)

| # | Category | Finding |
|---|----------|---------|
| 1 | Burger button | `.site-header__burger { display:none }` → `display:inline-flex` at ≤1180px — ✅ |
| 2 | Nav hidden | `.site-header__nav { display:none }` at ≤1180px — ✅ |
| 3 | Drawer panel | `width: min(340px, 88vw)` — ✅ fits any screen |
| 4 | Drawer links | `.drawer__link { min-height:48px }` — ✅ |
| 5 | Actions buttons | `.hide-sm` (≤768px) and `.hide-xs` (≤520px) hide action buttons — ✅ |
| 6 | Drawer `inset` | `inset: calc(var(--header-h) + var(--safe-top)) 0 0 0` — starts below header, correct |

**No changes needed.** The SiteHeader burger/drawer is fully functional.

**Verify:** At 375px, tapping the burger opens the drawer. Drawer links are tappable (≥48px height). Drawer closes on overlay click and on navigation.

---

### 20. `src/components/layout/BottomNav.jsx` + CSS in `components.css`

#### Issues Found (CSS in components.css, read-only reference)

| # | Category | Finding |
|---|----------|---------|
| 1 | Display | `display:none` by default, `display:flex` at ≤900px — ✅ |
| 2 | Position | `position:fixed; bottom:0; left:0; right:0` — ✅ |
| 3 | Height | `height: calc(var(--bottom-nav-h) + var(--safe-bottom))` — ✅ safe area inset |
| 4 | Touch target | `.bottom-nav__item { min-height:var(--bottom-nav-h) }` = 64px — ✅ |
| 5 | Content padding | `app-main` gets `padding-bottom` at ≤900px — ✅ content not hidden behind nav |

**No changes needed.** BottomNav already meets all requirements.

---

### 21. `src/components/layout/AppLayout.jsx`

#### Issues Found

| # | Category | Finding |
|---|----------|---------|
| 1 | Structure | `app-shell > app-main > app-body > Outlet` | The `app-body` receives padding adjustments from `components.css` at ≤900px — ✅ |
| 2 | Marketing main | `.marketing-main { padding-top: calc(var(--header-h) + var(--safe-top)) }` — ✅ |

**No JSX changes needed.** The layout shell is correct.

---

## Implementation Order

Apply the changes in this order (each step leaves the site buildable):

1. **`Landing.css`** — most visible page, biggest layout issues
2. **`Home.css`** — dashboard, primary app entry point
3. **`Chat.css`** — critical fix: panel height calculation
4. **`LessonDetail.css`** — sticky progress bar offset fix
5. **`Learn.css`**, **`Quizzes.css`**, **`QuizRunner.css`** — learning flow
6. **`Community.css`**, **`PostDetail.css`** — community flow
7. **`Experts.css`**, **`Campaigns.css`**, **`CampaignDetail.css`** — content pages
8. **`Profile.css`**, **`Leaderboard.css`** — profile/gamification
9. **`Resources.css`**, **`Myths.css`** — informational pages
10. **`Login.css`**, **`Register.css`** — auth pages

---

## Global Issues Shared Across Pages

These patterns appear in multiple files and should be addressed when touching each file:

| Pattern | Files Affected | Fix |
|---------|---------------|-----|
| `flex` row with `flex-wrap:wrap` but no `align-items:flex-start` | Home, Campaign, Resources | Add `align-items:flex-start` so wrapped rows don't stretch awkwardly |
| `min-width: 220–260px` on flex children | Learn, LessonDetail, Home | Change to `min-width:0` and let the grid/flex handle sizing |
| Two-button `form-actions` rows | Community, Experts, PostDetail | Stack vertically on xs with `flex-direction:column-reverse` (primary action on top) |
| Action button groups (`flex-wrap:wrap`) | Campaigns, CampaignDetail, Login | Stack vertically on xs and set `width:100%` |

---

## Testing Checklist

After applying all changes, test at these viewport widths using browser DevTools:

- [ ] 320px (iPhone SE 1st gen / very small Android)
- [ ] 375px (iPhone SE 2nd gen / standard small)
- [ ] 390px (iPhone 14)
- [ ] 414px (iPhone Plus)
- [ ] 480px (xs breakpoint boundary)
- [ ] 640px (sm breakpoint boundary)
- [ ] 768px (md breakpoint boundary)
- [ ] 1024px (lg breakpoint boundary)

For each viewport, verify:
- [ ] No horizontal scrollbar on `body`
- [ ] All text is readable (minimum ~14px rendered)
- [ ] All tap targets are ≥44px in both dimensions
- [ ] BottomNav is visible and not overlapping content
- [ ] SiteHeader burger opens the drawer
- [ ] Chat panel does not hide the composer under BottomNav
- [ ] Sticky progress bar in LessonDetail clears the header

---

*Plan written by the planning agent. Do not modify `global.css`, `tokens.css`, or `components.css`. Do not modify `.jsx` files.*
