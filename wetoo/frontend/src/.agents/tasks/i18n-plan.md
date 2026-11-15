# Implementation Plan — WeToo Frontend i18n Full Wiring

## Context

- **Build command:** `npm run build` (runs `vite build`) from `c:\Users\Omnibook\Downloads\Youth_Live\wetoo\frontend`
- **i18n system:** `LangContext.jsx` exposes `useLang()` → `{ t, lang, toggleLang }`.
  `t('dot.notation.key')` resolves against `fr.js` / `en.js` with a French fallback.
- Both catalogues (`fr.js` and `en.js`) are already very complete. Almost every UI string
  already has a matching key. The work is wiring the pages that still use hardcoded French strings.
- **No new architectural decisions needed:** the pattern is "import `useLang`, destructure `t`,
  replace every hardcoded string with `t('section.key')`."

---

## CORRECTION 1 — Mobile drawer audit (SiteHeader.jsx)

**File:** `src/components/layout/SiteHeader.jsx`

### Findings (from reading the file)

| Check | Status |
|---|---|
| `useLang()` imported and `t` destructured | ✅ Already done (line 11 + line 20) |
| `getAppNav(t)` / `getMarketingNav(t)` called (not static `APP_NAV`) | ✅ Already done (lines 35–36, 38) |
| `item.icon` rendered in drawer app-nav links | ✅ Already done (`const Icon = item.icon; … Icon ? <Icon …/>`) |
| All button labels / aria-labels use `t(…)` | ✅ `t('header.openMenu')`, `t('header.closeMenu')`, `t('header.signIn')`, etc. |
| Drawer footer buttons use `t(…)` | ✅ `t('header.myProfile')`, `t('header.seeCampaigns')`, `t('header.signIn')`, `t('header.createAccount')` |

**Conclusion: SiteHeader.jsx is fully wired. No changes required.**

---

## CORRECTION 2 — i18n wiring for every page and component

The table below lists each file, the hardcoded French strings it still contains,
the catalogue key that matches, and whether a new key must be added to both `fr.js`
and `en.js`.

### Legend
- ✅ Key exists in catalogue — just replace the string with `t('key')`
- ➕ Key must be ADDED to both `fr.js` and `en.js`

---

### 2-A  SiteFooter.jsx  
**File:** `src/components/layout/SiteFooter.jsx`  
**Current state:** No `useLang()` import; uses hardcoded French; uses static `APP_NAV` (already translated by nav.js so item labels are fine) but all other text is hardcoded.

| Hardcoded string | Matching key | Action |
|---|---|---|
| `"Parler sans tabou, apprendre sans jugement. Une plateforme pensée par et pour les jeunes."` | ➕ `footer.tagline` | ADD |
| `"Espace sécurisé · Modéré par une équipe formée"` | ➕ `footer.noteSafe` | ADD |
| `"Disponible au Bénin et partout dans le monde"` | ➕ `footer.noteGlobal` | ADD |
| `aria-label="Plan de la plateforme"` | ➕ `footer.navAria` | ADD |
| `"La plateforme"` (heading) | ➕ `footer.navHeading` | ADD |
| `"Besoin d'aide maintenant ?"` (heading) | ➕ `footer.helpHeading` | ADD |
| `"Numéros d'écoute"` | ➕ `footer.helplines` | ADD |
| `"Contacter un professionnel"` | ➕ `footer.contactPro` | ADD |
| `"Mythes & vraies infos"` | ✅ `nav.myths` | USE EXISTING |
| Bottom paragraph `"Projet WeToo - candidature au Défi mondial…"` | ➕ `footer.bottomNote` | ADD |
| `"Contenu éducatif. En cas d'urgence médicale…"` | ➕ `footer.disclaimer` | ADD |

**Changes needed:**
1. Add `import { useLang } from '../../context/LangContext.jsx';`
2. Call `const { t } = useLang();` inside the component
3. Replace `APP_NAV` import with `getAppNav(t)` (already exported from `nav.js`) so nav item labels switch language
4. Replace all hardcoded strings with `t('footer.*')` calls
5. Add the 10 new keys above to both `fr.js` and `en.js`

---

### 2-B  Home.jsx  
**File:** `src/pages/Home.jsx`  
**Current state:** No `useLang()` import. All strings hardcoded in French.

| Hardcoded string | Matching key | Action |
|---|---|---|
| `"Ton tableau de bord"` (eyebrow) | ✅ `home.dashboardEyebrow` | USE |
| `"Bonjour {name}"` | ✅ `home.hello` (function key) | USE |
| `"Tu progresses bien : encore un effort…"` | ✅ `home.progressGood` | USE |
| `"Commence une leçon pour gagner…"` | ✅ `home.progressStart` | USE |
| `"points"` (stat label) | ✅ `home.statPoints` | USE |
| `"jours de série"` | ✅ `home.statStreak` | USE |
| `"au classement"` | ✅ `home.statRank` | USE |
| `"cours terminés"` | ✅ `home.statLessons` | USE |
| `"Voir le classement"` | ✅ `home.seeLeaderboard` | USE |
| `"Mon profil"` | ✅ `home.myProfile` | USE |
| `"Bienvenue sur WeToo"` (badge) | ✅ `home.welcomeBadge` | USE |
| `"Un espace sûr pour parler de "` | ✅ `home.welcomeTitle1` | USE |
| `"santé et de bien-être"` | ✅ `home.welcomeTitle2` | USE |
| `"."` | ✅ `home.welcomeTitle3` | USE |
| lead paragraph `"Pose tes questions sans tabou…"` | ✅ `home.welcomeLead` | USE |
| `"Créer un compte"` | ✅ `home.welcomeCreate` | USE |
| `"Poser une question anonymement"` | ✅ `home.welcomeAskAnon` | USE |
| `"Actions rapides"` (eyebrow) | ✅ `home.quickEyebrow` | USE |
| `"Par où veux-tu commencer ?"` | ✅ `home.quickTitle` | USE |
| `QUICK_ACTIONS` array (4 titles + texts, currently hardcoded) | ✅ `quickActions.chatTitle/Text`, `learnTitle/Text`, `communityTitle/Text`, `expertsTitle/Text` | USE |
| `"Apprentissage"` (eyebrow) | ✅ `home.learnEyebrow` | USE |
| `"Reprendre l'apprentissage"` | ✅ `home.learnTitle` | USE |
| `"Reprends là où tu t'es arrêté·e."` | ✅ `home.learnDescAuth` | USE |
| `"Quelques cours pour découvrir."` | ✅ `home.learnDescAnon` | USE |
| `"Chargement des cours…"` | ✅ `home.loadingLessons` | USE |
| `"Aucun cours disponible"` | ✅ `home.noLessonsTitle` | USE |
| `"Reviens bientôt, de nouveaux contenus arrivent."` | ✅ `home.noLessonsDesc` | USE |
| `"Engagement"` (eyebrow) | ✅ `home.campaignEyebrow` | USE |
| `"La campagne du mois"` | ✅ `home.campaignTitle` | USE |
| `"Chargement de la campagne…"` | ✅ `home.loadingCampaign` | USE |
| `"Pas de campagne en cours"` | ✅ `home.noCampaignTitle` | USE |
| `"Une nouvelle campagne thématique arrive chaque mois."` | ✅ `home.noCampaignDesc` | USE |
| `"participant·es"` | ✅ `home.participants` | USE |
| `"Voir la campagne"` | ✅ `home.seeCampaign` | USE |
| `"Vraies infos"` (eyebrow) | ✅ `home.mythEyebrow` | USE |
| `"Le mythe du jour"` | ✅ `home.mythTitle` | USE |
| `"Chargement des mythes…"` | ✅ `home.loadingMyths` | USE |
| `"Aucun mythe pour l'instant"` | ✅ `home.noMythTitle` | USE |
| `"La vérité"` | ✅ `home.mythTruth` | USE |
| `"Source : {src}"` | ✅ `home.mythSource` (function) | USE |
| `"Un autre mythe"` | ✅ `home.anotherMyth` | USE |
| `"Communauté"` (eyebrow) | ✅ `home.postsEyebrow` | USE |
| `"Dernières discussions"` | ✅ `home.postsTitle` | USE |
| `"Chargement des discussions…"` | ✅ `home.loadingPosts` | USE |
| `"Pas encore de discussion"` | ✅ `home.noPostsTitle` | USE |
| `"Sois la première personne à lancer un sujet."` | ✅ `home.noPostsDesc` | USE |
| `"{n} réponse{s}"` (inline) | ✅ `home.postReplies` (function) | USE |
| `"Voir toutes les discussions"` | ✅ `home.seeAllPosts` | USE |
| `"Tu ne vas pas bien ?"` | ✅ `home.helpTitle` | USE |
| `"Parle à quelqu'un maintenant…"` | ✅ `home.helpText` | USE |
| `"Trouver de l'aide"` | ✅ `home.helpCta` | USE |

**Changes needed:**
1. `import { useLang } from '../context/LangContext.jsx';`
2. `const { t } = useLang();` inside `Home()`
3. Move `QUICK_ACTIONS` array construction inside the component (or make it a function of `t`) so it references `t('quickActions.chatTitle')` etc.
4. Replace every hardcoded string listed above with `t('…')` calls
5. Replace inline `réponse{s}` counter with `t('home.postReplies')(post.repliesCount)`

---

### 2-C  Chat.jsx  
**File:** `src/pages/Chat.jsx`  
**Current state:** No `useLang()` import. All strings hardcoded in French.

| Hardcoded string | Matching key | Action |
|---|---|---|
| `PageHeader eyebrow="Espace confidentiel"` | ✅ `chat.eyebrow` | USE |
| `PageHeader title="Chat avec WeToo"` | ✅ `chat.title` | USE |
| `PageHeader description="Pose tes questions…"` | ✅ `chat.desc` | USE |
| `"Exporter"` (Button) | ✅ `chat.export` | USE |
| `"Nouvelle conversation"` | ✅ `chat.newConvo` | USE |
| `aria-label="Conversation"` | ✅ `chat.convoAria` | USE |
| `aria-label="Messages de la conversation"` | ✅ `chat.messagesAria` | USE |
| `"WeToo est en train d'écrire…"` (sr-only) | ✅ `chat.typingAria` | USE |
| `"Pas de connexion - réessaie."` | ✅ `chat.noConnection` | USE |
| `label "Écris ton message"` | ✅ `chat.inputLabel` | USE |
| `placeholder="Écris ta question…"` | ✅ `chat.inputPlaceholder` | USE |
| `aria-label="Envoyer"` | ✅ `chat.sendLabel` | USE |
| `"Entrée pour envoyer • Maj + Entrée…"` | ✅ `chat.inputHint` | USE |
| `"Ceci ne remplace pas un avis médical…"` (disclaimer) | ✅ `chat.disclaimer` | USE |
| `"Masquer les thèmes"` / `"Thèmes & repères"` (aside toggle) | ✅ `chat.hideThemes` / `chat.showThemes` | USE |
| aside `aria-label="Thèmes et repères"` | ✅ `chat.asideThemes` | USE |
| `"Thèmes"` (aside card title) | ✅ `chat.themesSideTitle` | USE |
| `"Anonyme • Sans jugement • 24 h/24"` | ✅ `chat.asideAnon` | USE |
| `"Tu peux poser toutes tes questions…"` | ✅ `chat.asideAnonSub` | USE |
| `"Ceci ne remplace pas un avis médical."` (aside note) | ✅ `chat.asideNote` | USE |
| `"Voir les numéros d'aide"` (aside CTA) | ✅ `chat.asideCta` | USE |
| Modal `title="Nouvelle conversation ?"` | ✅ `chat.confirmTitle` | USE |
| Modal `description="L'historique affiché…"` | ✅ `chat.confirmDesc` | USE |
| `"Annuler"` | ✅ `chat.confirmCancel` | USE |
| `"Effacer et recommencer"` | ✅ `chat.confirmOk` | USE |
| Modal body `"Tes échanges précédents…"` | ✅ `chat.confirmNote` | USE |
| `"Tu n'es pas seul·e. De l'aide est disponible tout de suite."` | ✅ `chat.urgentMsg` | USE |
| `"Appeler le {phone}"` | ✅ `chat.callBtn` (function) | USE |
| `"Sources ({n})"` | ✅ `chat.sourcesLabel` (function) | USE |
| `"Explore un thème"` (WelcomeScreen block title) | ✅ `chat.exploreTheme` | USE |
| `"Questions sur « {label} »"` | ✅ `chat.topicQuestions` (function) | USE |
| `"Questions fréquentes"` | ✅ `chat.suggestedTitle` | USE |
| `"Disponible à toute heure, en français."` | ✅ `chat.available` | USE |
| `"Bonjour, je suis WeToo."` (WelcomeScreen) | ✅ `chat.welcomeTitle` | USE |
| Welcome body paragraph | ✅ `chat.welcomeText` | USE |
| Toast `'Nouvelle conversation démarrée.'` | ✅ `chat.resetDone` | USE |
| Toast `'La conversation est vide pour le moment.'` | ✅ `chat.exportEmpty` | USE |
| Toast `'Conversation exportée.'` | ✅ `chat.exportDone` | USE |
| Export header `'Conversation WeToo'` | ✅ `chat.exportHeader` | USE |
| Export `'Moi'` | ✅ `chat.exportMe` | USE |
| Fallback bot reply `'Je n'ai pas pu formuler de réponse…'` | ➕ `chat.botFallback` | ADD |

**Changes needed:**
1. `import { useLang } from '../context/LangContext.jsx';`
2. `const { t } = useLang();` at top of `Chat()`, `WelcomeScreen()`, and `BotExtras()` — or pass `t` as a prop to sub-components
3. Replace all strings listed above
4. In `exportConversation`, use `t('chat.exportHeader')`, `t('chat.exportMe')`, `t('chat.exportDone')`, `t('chat.exportEmpty')`, `t('chat.resetDone')`
5. Replace the hardcoded bot fallback reply string with `t('chat.botFallback')`
6. Add `chat.botFallback` to both `fr.js` (`'Je n'ai pas pu formuler de réponse. Reformule ta question, je reste là.'`) and `en.js` (`'I could not formulate a response. Rephrase your question and I'm still here.'`)

---

### 2-D  Learn.jsx  
**File:** `src/pages/Learn.jsx`  
**Current state:** No `useLang()` import.

| Hardcoded string | Matching key | Action |
|---|---|---|
| `PageHeader eyebrow="Espace d'apprentissage"` | ✅ `learn.eyebrow` | USE |
| `PageHeader title="Apprendre"` | ✅ `learn.title` | USE |
| `PageHeader description="Des cours courts…"` | ✅ `learn.desc` | USE |
| `"Ta progression"` (eyebrow) | ✅ `learn.progressEyebrow` | USE |
| `"Vers le niveau suivant ({pts} pts)"` | ✅ `learn.toNextLevel` (function) | USE |
| `"Niveau maximal atteint"` | ✅ `learn.maxLevel` | USE |
| `"points"` | ✅ `learn.statPoints` | USE |
| `"cours terminés"` | ✅ `learn.statDone` | USE |
| `"jours d'affilée"` | ✅ `learn.statStreak` | USE |
| `"Catégorie"` (filter label) | ✅ `learn.filterCategory` | USE |
| `"Toutes"` (chip) | ✅ `learn.filterAll` | USE |
| `"Niveau"` (filter label) | ✅ `learn.filterLevel` | USE |
| `"Tous"` (chip) | ✅ `learn.filterAllLevels` | USE |
| `aria-label="Filtrer par catégorie"` | ✅ `learn.filterByCat` | USE |
| `aria-label="Filtrer par niveau"` | ✅ `learn.filterByLevel` | USE |
| `"Rechercher"` (label) | ✅ `learn.filterSearch` | USE |
| `placeholder="Titre ou mot-clé…"` | ✅ `learn.searchPlaceholder` | USE |
| `label="Effacer la recherche"` | ✅ `learn.clearSearch` | USE |
| `LEVEL_LABELS` static object `{ débutant, intermédiaire, avancé }` | ✅ `learn.levelBeginner`, `learn.levelIntermed`, `learn.levelAdvanced` | USE |
| `"Aucun cours ne correspond"` | ✅ `learn.noMatchTitle` | USE |
| `"Essaie de changer de catégorie…"` | ✅ `learn.noMatchDesc` | USE |
| `"Réinitialiser les filtres"` | ✅ `learn.resetFilters` | USE |
| Badge `"Terminé"` | ✅ `learn.doneBadge` | USE |
| `SectionHeading eyebrow="Pour t'entraîner"` | ✅ `learn.quizEyebrow` | USE |
| `SectionHeading title="Quiz"` | ✅ `learn.quizTitle` | USE |
| `SectionHeading description="Teste ce que tu sais…"` | ✅ `learn.quizDesc` | USE |
| `"Voir tous les quiz"` | ✅ `learn.seeAllQuizzes` | USE |
| `"Pas encore de quiz"` | ✅ `learn.noQuizTitle` | USE |
| `"De nouveaux quiz arrivent très bientôt…"` | ✅ `learn.noQuizDesc` | USE |
| `"Commencer"` (quiz start button) | ✅ `learn.quizStart` | USE |

**Changes needed:**
1. `import { useLang } from '../context/LangContext.jsx';`
2. `const { t } = useLang();` inside `Learn()`
3. Build `LEVEL_LABELS` map dynamically from `t()` instead of a static object
4. Replace all strings listed above

---

### 2-E  Community.jsx  
**File:** `src/pages/Community.jsx`  
**Current state:** No `useLang()` import.

| Hardcoded string | Matching key | Action |
|---|---|---|
| `PageHeader eyebrow/title/description` | ✅ `community.eyebrow/title/desc` | USE |
| `"Nouvelle discussion"` (button) | ✅ `community.newPost` | USE |
| `placeholder="Rechercher une discussion…"` | ✅ `community.searchPlaceholder` | USE |
| `aria-label="Rechercher une discussion"` | ✅ `community.searchAria` | USE |
| `"Toutes"` (chip) | ✅ `community.filterAll` | USE |
| `aria-label="Filtrer par catégorie"` | ✅ `community.filterByCat` | USE |
| `SORT_TABS` array `{ Récentes, Populaires }` | ✅ `community.sortRecent`, `community.sortPopular` | USE |
| `ariaLabel="Trier les discussions"` | ✅ `community.sortAria` | USE |
| `"Chargement des discussions…"` | ✅ `community.searchPlaceholder` — actually ➕ `community.loadingPosts` | ADD (already exists in `home.loadingPosts`; add dedicated key to `community` namespace) |
| `"Aucune discussion pour l'instant"` | ✅ `community.noPostTitle` | USE |
| `"Sois la première personne à lancer un sujet…"` | ✅ `community.noPostDesc` | USE |
| `"Lancer une discussion"` | ✅ `community.launchPost` | USE |
| `aria-label="Liste des discussions"` | ✅ `community.listAria` | USE |
| `"Rejoins le groupe WhatsApp"` / subtitle | ✅ `community.whatsappTitle/Sub` | USE |
| `"{n} membres"` | ✅ `community.members` (function) | USE |
| `"Règles du groupe"` | ✅ `community.groupRules` | USE |
| `"Rejoindre le groupe"` | ✅ `community.joinGroup` | USE |
| `"Modération et sécurité"` / subtitle | ✅ `community.modTitle/Sub` | USE |
| Moderation bullets (Anonymat, Signalement, Modération humaine) | ✅ `community.modAnon/AnonText/Report/ReportText/Human/HumanText` | USE |
| `LoadingState label="Chargement du groupe…"` | ✅ `community.whatsappTitle` — actually use ➕ `community.loadingGroup` | ADD |
| Modal `title="Nouvelle discussion"` | ✅ `community.composerTitle` | USE |
| Modal `description="Partage ce que tu veux…"` | ✅ `community.composerDesc` | USE |
| Field `label="Titre"` | ✅ `community.fieldTitle` | USE |
| `placeholder="Résume ta question…"` | ✅ `community.fieldTitlePH` | USE |
| Field `label="Catégorie"` | ✅ `community.fieldCat` | USE |
| `<option value="">Choisir une catégorie…</option>` | ✅ `community.fieldCatPH` | USE |
| Field `label="Message"` | ✅ `community.fieldBody` | USE |
| `hint="Minimum 10 caractères…"` | ✅ `community.fieldBodyHint` | USE |
| `placeholder="Explique ta situation…"` | ✅ `community.fieldBodyPH` | USE |
| `"Publier en anonyme"` | ✅ `community.checkAnon` | USE |
| Bienveillance note paragraph | ✅ `community.kindnessNote` | USE |
| `"Annuler"` | ✅ `community.cancel` | USE |
| `"Publier"` | ✅ `community.publish` | USE |
| Report modal title/description | ✅ `community.reportTitle/Desc` | USE |
| Report field label / hint / placeholder | ✅ `community.reportField/Hint/PH` | USE |
| `"Envoyer le signalement"` | ✅ `community.reportSend` | USE |
| Toast error strings (validation) | ✅ `community.validTitleMin/CatReq/BodyMin/ReportMin` | USE |
| Toast success strings | ✅ `community.toastSupport/Vote/Published/Reported` (functions) | USE |

**New keys to add:** `community.loadingPosts`, `community.loadingGroup`  
(fr: `'Chargement des discussions…'` / `'Chargement du groupe…'`; en: `'Loading discussions…'` / `'Loading group…'`)

---

### 2-F  Experts.jsx  
**File:** `src/pages/Experts.jsx`  
**Current state:** No `useLang()` import.

| Hardcoded string | Matching key | Action |
|---|---|---|
| `PageHeader eyebrow/title/description` | ✅ `experts.eyebrow/title/desc` | USE |
| `placeholder="Rechercher un·e professionnel·le…"` | ✅ `experts.searchPH` | USE |
| `aria-label="Rechercher un·e professionnel·le de santé"` | ✅ `experts.searchAria` | USE |
| `"Toutes les spécialités"` (chip) | ✅ `experts.filterAll` | USE |
| `aria-label="Filtrer par spécialité"` | ✅ `experts.filterAria` | USE |
| `LoadingState label="Chargement des professionnel·les…"` | ✅ `experts.loadingExperts` | USE |
| `"Aucun·e professionnel·le trouvé·e"` | ✅ `experts.noExpertTitle` | USE |
| `"Essaie un autre mot-clé…"` | ✅ `experts.noExpertDesc` | USE |
| `"{n} sessions"` | ✅ `experts.sessions` (function) | USE |
| `"Poser ma question"` (card button) | ✅ `experts.askBtn` | USE |
| `h2 "Mes demandes"` | ✅ `experts.myRequestsTitle` | USE |
| `LoadingState label="Chargement de tes demandes…"` | ✅ `experts.loadingReqs` | USE |
| `"Aucune demande pour l'instant"` | ✅ `experts.noReqTitle` | USE |
| `"Ta toute première question…"` | ✅ `experts.noReqDesc` | USE |
| `"Envoyée le {date}"` | ✅ `experts.sentOn` (function) | USE |
| `REQUEST_STATUS` object labels `{Reçue, En cours, Répondue, Clôturée}` | ✅ `experts.statusLabels.*` | USE |
| `CardHeader title="Confidentialité"` | ✅ `experts.privacyTitle` | USE |
| `CardHeader subtitle="Ta vie privée est protégée."` | ✅ `experts.privacySub` | USE |
| Privacy paragraphs (2) | ✅ `experts.privacyText1/Text2` | USE |
| `"Voir les numéros d'écoute"` | ✅ `experts.seeHelplines` | USE |
| `CONTACT_OPTIONS` array labels | ✅ `experts.contactOptions.chat/sms/call/whatsapp` | USE |
| Modal title `"Poser ma question"` | ✅ `experts.requestTitle` | USE |
| Modal description `"Ta question sera transmise à {name}…"` | ✅ `experts.requestDesc` (function) | USE |
| `"Demande envoyée"` (success state title) | ✅ `experts.successTitle` | USE |
| Success message | ✅ `experts.successMsg` (function) | USE |
| `"Réponse estimée sous ~{h} h"` | ✅ `experts.etaLabel` (function) | USE |
| `"Fermer"` | ✅ `experts.close` | USE |
| Field label `"Ta question"` | ✅ `experts.fieldQuestion` | USE |
| Field hint | ✅ `experts.fieldQHint` | USE |
| Field placeholder | ✅ `experts.fieldQPH` | USE |
| `"{n}/{max} caractères"` | ✅ `experts.counter` (function) | USE |
| RadioPills legend | ✅ `experts.contactLegend` | USE |
| Contact field label/hint/placeholder | ✅ `experts.contactField/Hint/PH` | USE |
| Consent checkbox text | ✅ `experts.consentText` | USE |
| `"Annuler"` | ✅ `experts.cancel` | USE |
| `"Envoyer ma question"` | ✅ `experts.sendBtn` | USE |
| Toast error strings | ✅ `experts.validQMin/Contact/Consent` | USE |

---

### 2-G  Campaigns.jsx  
**File:** `src/pages/Campaigns.jsx`  
**Current state:** No `useLang()` import.

| Hardcoded string | Matching key | Action |
|---|---|---|
| `PageHeader eyebrow/title/description` | ✅ `campaigns.eyebrow/title/desc` | USE |
| `LoadingState label="Chargement des campagnes…"` | ✅ `campaigns.loading` | USE |
| `"Aucune campagne pour le moment"` | ✅ `campaigns.noTitle` | USE |
| `"De nouvelles mobilisations arriveront…"` | ✅ `campaigns.noDesc` | USE |
| `aria-label="Campagne du moment"` | ✅ `campaigns.featuredAria` | USE |
| Badge `"Campagne du moment"` | ✅ `campaigns.featuredLabel` | USE |
| `"{n} participants"` | ✅ `campaigns.participants` (function) | USE |
| `"Rejoindre la campagne"` | ✅ `campaigns.joinBtn` | USE |
| `"En savoir plus"` | ✅ `campaigns.learnMore` | USE |
| `STATUS_TABS` array `{En cours, À venir, Passées}` | ✅ `campaigns.tabActive/Upcoming/Past` | USE |
| `ariaLabel="Filtrer les campagnes par statut"` | ✅ `campaigns.tabAria` | USE |
| `STATUS_LABELS` object `{En cours, À venir, Passée}` | ✅ `campaigns.statusActive/Upcoming/Past` | USE |
| `"Aucune campagne dans cette section"` | ✅ `campaigns.noTabTitle` | USE |
| `"Change d'onglet pour découvrir…"` | ✅ `campaigns.noTabDesc` | USE |
| `"Rejoindre"` (card button short) | ✅ `campaigns.joinShort` | USE |
| `"En savoir plus"` (card button) | ✅ `campaigns.learnMore` | USE |
| Toast messages for join | ✅ `campaigns.toastJoined/Already/Error` (functions) | USE |
| `CardHeader title="Rejoins la communauté WhatsApp"` | ✅ `campaigns.whatsappTitle` | USE |
| `CardHeader subtitle` | ✅ `campaigns.whatsappSub` | USE |
| `LoadingState label="Chargement du groupe…"` | ✅ `campaigns.whatsappLoading` | USE |
| `"{group.name} - {group.members} membres"` | ✅ `campaigns.whatsappMembers` (function) | USE |
| `"Rejoindre le groupe"` | ✅ `campaigns.whatsappJoin` | USE |

---

### 2-H  Login.jsx  
**File:** `src/pages/Login.jsx`  
**Current state:** Already imports `useLang` and calls `t(…)` for validation, toasts, and form labels. ✅

**Remaining hardcoded strings:**  
None that require i18n action — `Login.jsx` is already fully wired via `useLang`.

---

### 2-I  Register.jsx  
**File:** `src/pages/Register.jsx`  
**Current state:** Already imports `useLang` and uses `t(…)` extensively. ✅  
**Remaining hardcoded strings:** None. Register.jsx is already fully wired.

---

### 2-J  Profile.jsx  
**File:** `src/pages/Profile.jsx`  
**Current state:** No `useLang()` import. All strings hardcoded in French.

| Hardcoded string | Matching key | Action |
|---|---|---|
| `PageHeader eyebrow/title/description` | ✅ `profile.eyebrow/title/desc` | USE |
| `TABS` array labels `{Mon profil, Mes badges, Réglages}` | ✅ `profile.tabProfile/Badges/Settings` | USE |
| `ariaLabel="Sections du profil"` | ✅ `profile.tabsAria` | USE |
| `"Membre depuis le {date}"` | ✅ `profile.memberSince` (function) | USE |
| `"Voir le classement complet"` | ✅ `profile.seeLeaderboard` | USE |
| `GENDER_OPTIONS` array labels `{Fille, Garçon, Autre}` | ✅ `profile.genderGirl/Boy/Other` | USE |
| `legend="Choisis ton avatar"` | ✅ `profile.avatarLegend` | USE |
| `aria-label="Choix de l'avatar"` | ✅ `profile.avatarAria` | USE |
| `aria-label="Avatar {emoji}"` | ✅ `profile.avatarLabel` (function) | USE |
| Field `label="Nom complet"` | ✅ `profile.nameLabel` | USE |
| Field `label="Âge"` | ✅ `profile.ageLabel` | USE |
| `hint="Entre 18 et 29 ans…"` | ✅ `profile.ageHint` | USE |
| `legend="Genre"` | ✅ `profile.genderLegend` | USE |
| Field `label="Département"` | ✅ `profile.regionLabel` | USE |
| `<option value="">Non précisé</option>` | ✅ `profile.regionDefault` | USE |
| `"Centres d'intérêt"` (label) | ✅ `profile.interestsLabel` | USE |
| `aria-label="Centres d'intérêt"` | ✅ `profile.interestsAria` | USE |
| `INTEREST_OPTIONS` static array | ✅ `profile.interestOptions` (array in catalogue) | USE |
| `"Enregistrer les modifications"` | ✅ `profile.save` | USE |
| `"Chargement de tes badges…"` | ✅ `profile.loadingBadges` | USE |
| `"Tu as obtenu {n} badge{s} sur {total}…"` | ✅ `profile.badgesIntro` (function) | USE |
| Badge `"Obtenu"` | ✅ `profile.obtainedBadge` | USE |
| Badge `"À débloquer"` | ✅ `profile.lockedBadge` | USE |
| `"Comment l'obtenir :"` | ✅ `profile.criteriaLabel` | USE |
| `"Aucun badge disponible"` | ✅ `profile.noBadgeTitle` | USE |
| Settings `h2 "Apparence"` | ✅ `profile.appearanceTitle` | USE |
| Settings subtitle `"Choisis le thème…"` | ✅ `profile.appearanceSub` | USE |
| `aria-label="Choix du thème"` | ✅ `profile.themeGroupAria` | USE |
| `"Clair"` button | ✅ `profile.themeLight` | USE |
| `"Sombre"` button | ✅ `profile.themeDark` | USE |
| `h2 "Mode hors ligne"` | ✅ `profile.offlineTitle` | USE |
| Offline paragraph | ✅ `profile.offlineText` | USE |
| `h2 "Se déconnecter"` | ✅ `profile.logoutTitle` | USE |
| Logout paragraph | ✅ `profile.logoutText` | USE |
| `"Se déconnecter"` (button) | ✅ `profile.logoutBtn` | USE |
| `LoadingState label="Chargement de ton profil…"` | ✅ `profile.loadingProfile` | USE |
| `EmptyState title="Connecte-toi pour voir ton profil"` | ✅ `profile.notAuthTitle` | USE |
| `EmptyState description` | ✅ `profile.notAuthDesc` | USE |
| `"Se connecter"` (action button in empty state) | ✅ `profile.signInBtn` | USE |
| Inline validation errors (name, age) | ✅ `profile.validNameMin/AgeInt/AgeRange` | USE |
| `toast.warning('Vérifie les champs signalés.')` | ✅ `profile.toastWarning` | USE |
| `toast.success('Profil mis à jour !')` | ✅ `profile.toastSaved` | USE |
| `toast.error(err.message || '…')` | ✅ `profile.toastError` (function) | USE |
| `"points"`, `"rang"`, `"série (jours)"`, `"cours terminés"` (stat labels) | ✅ `profile.statPoints/Rank/Streak/Lessons` | USE |
| `"Aucun badge disponible"` | ✅ `profile.noBadgeTitle` | USE |

---

### 2-K  Myths.jsx  
**File:** `src/pages/Myths.jsx`  
**Current state:** No `useLang()` import.

| Hardcoded string | Matching key | Action |
|---|---|---|
| `PageHeader eyebrow="Idées reçues"` | ➕ `myths.eyebrow` | ADD |
| `PageHeader title="Mythes & vraies infos"` | ✅ `nav.myths` (could reuse) — better ➕ `myths.title` | ADD |
| `PageHeader description="Des rumeurs circulent…"` | ➕ `myths.desc` | ADD |
| `"Poser ma question au chatbot"` | ➕ `myths.askChatbot` | ADD |
| `"{n} mythe(s) démonté(s)"` (pluralize) | ➕ `myths.countSingular` / `myths.countPlural` | ADD |
| `"{n} résultat(s) affiché(s)"` | ➕ `myths.resultSingular` / `myths.resultPlural` | ADD |
| `label="Rechercher un mythe ou une information"` (sr-only) | ➕ `myths.searchLabel` | ADD |
| `placeholder="Rechercher un mythe ou une information…"` | ➕ `myths.searchPH` | ADD |
| `aria-label="Filtrer par catégorie"` | ➕ `myths.filterByCat` | ADD |
| `"Toutes"` (chip) | ✅ `learn.filterAll` — better ➕ `myths.filterAll` | ADD |
| `"Aucun mythe ne correspond"` (empty state title) | ➕ `myths.noMatchTitle` | ADD |
| `"Essaie un autre mot-clé…"` | ➕ `myths.noMatchDesc` | ADD |
| `"Réinitialiser les filtres"` | ➕ `myths.resetFilters` | ADD |
| `"Tu as entendu une autre rumeur ?"` (CTA title) | ➕ `myths.ctaTitle` | ADD |
| CTA subtitle paragraph | ➕ `myths.ctaDesc` | ADD |
| `"Poser ma question au chatbot"` (CTA button) | same as `myths.askChatbot` | ADD |
| MythCard `"Mythe"` label | ➕ `myths.cardMythLabel` | ADD |
| MythCard `"Vraie info"` label | ➕ `myths.cardTruthLabel` | ADD |
| MythCard `"Source : {src}"` | ➕ `myths.cardSource` (function) | ADD |
| MythCard `"Replier"` / `"Voir la vraie info"` | ➕ `myths.cardHide` / `myths.cardReveal` | ADD |
| MythCard `"Source : {src}"` (hint) | same as `myths.cardSource` | ADD |

**New keys to add to both `fr.js` and `en.js`** (under `myths: { … }` namespace):
```
eyebrow, title, desc, askChatbot, countSingular, countPlural,
resultSingular, resultPlural, searchLabel, searchPH, filterByCat,
filterAll, noMatchTitle, noMatchDesc, resetFilters,
ctaTitle, ctaDesc, cardMythLabel, cardTruthLabel, cardSource,
cardHide, cardReveal
```

---

### 2-L  Quizzes.jsx  
**File:** `src/pages/Quizzes.jsx`  
**Current state:** No `useLang()` import.

| Hardcoded string | Matching key | Action |
|---|---|---|
| `PageHeader eyebrow="Espace d'apprentissage"` | ✅ `learn.eyebrow` | USE |
| `PageHeader title="Quiz"` | ✅ `learn.quizTitle` | USE |
| `PageHeader description="Teste ce que tu sais…"` | ➕ `quizzes.desc` | ADD |
| `"Aucun quiz pour le moment"` | ➕ `quizzes.noTitle` | ADD |
| `"De nouveaux quiz arrivent très bientôt…"` | ➕ `quizzes.noDesc` | ADD |
| `"Voir les cours"` (empty state action) | ➕ `quizzes.seeLessons` | ADD |
| `"Commencer"` (card button) | ✅ `learn.quizStart` | USE |
| `"Pas encore prêt·e ? Revoir les cours"` (footer link) | ➕ `quizzes.footerLink` | ADD |

**New keys:** `quizzes.desc`, `quizzes.noTitle`, `quizzes.noDesc`, `quizzes.seeLessons`, `quizzes.footerLink`

---

### 2-M  QuizRunner.jsx  
**File:** `src/pages/QuizRunner.jsx`  
**Current state:** No `useLang()` import.

| Hardcoded string | Matching key | Action |
|---|---|---|
| `LoadingState label="Chargement du quiz…"` | ➕ `quizRunner.loading` | ADD |
| `"Retour aux quiz"` (back button) | ➕ `quizRunner.backToQuizzes` | ADD |
| `"Ce quiz n'a pas de questions"` | ➕ `quizRunner.noQuestionsTitle` | ADD |
| `"Choisis un autre quiz pour t'entraîner."` | ➕ `quizRunner.noQuestionsDesc` | ADD |
| `"Voir tous les quiz"` (empty action) | ✅ `learn.seeAllQuizzes` | USE |
| Breadcrumb `"Quiz"` | ➕ `quizRunner.breadcrumb` | ADD |
| `"{quiz.points} points à gagner"` Badge | ➕ `quizRunner.pointsToWin` (function) | ADD |
| `"Question {n} / {total}"` | ➕ `quizRunner.questionStep` (function) | ADD |
| `"{n} sur {total} répondue{s}"` | ➕ `quizRunner.answeredCount` (function) | ADD |
| `"Précédent"` button | ➕ `quizRunner.prev` | ADD |
| `"Suivant"` button | ➕ `quizRunner.next` | ADD |
| `"Terminer le quiz"` button | ➕ `quizRunner.finish` | ADD |
| `"Réponds à toutes les questions…"` hint | ➕ `quizRunner.hintAllRequired` | ADD |
| `"Tu peux répondre à toutes les questions…"` (anon hint) | ➕ `quizRunner.hintAnon` | ADD |
| `"Impossible d'envoyer tes réponses. Réessaie."` | ➕ `quizRunner.submitError` | ADD |
| Result `"Résultat"` eyebrow | ➕ `quizRunner.resultEyebrow` | ADD |
| `scoreMessage()` four strings | ➕ `quizRunner.score100/score75/score50/score0` | ADD |
| `"{correct} bonne{s} réponse{s}"` | ➕ `quizRunner.correctCount` (function) | ADD |
| `"+{pts} points"` | ➕ `quizRunner.awardedPoints` (function) | ADD |
| `"Recommencer"` | ➕ `quizRunner.restart` | ADD |
| `"Voir d'autres quiz"` | ➕ `quizRunner.seeOthers` | ADD |
| `"Corrections"` (section title) | ➕ `quizRunner.corrections` | ADD |
| `"Question {n}"` (correction index) | ➕ `quizRunner.correctionIndex` (function) | ADD |
| Badge `"Bonne réponse"` | ➕ `quizRunner.correct` | ADD |
| Badge `"À revoir"` | ➕ `quizRunner.wrong` | ADD |
| Modal `title="Nouveaux badges débloqués !"` | ➕ `quizRunner.badgesTitle` | ADD |
| Modal `description` | ➕ `quizRunner.badgesDesc` | ADD |
| `"Super !"` (modal footer button) | ➕ `quizRunner.badgesOk` | ADD |

---

### 2-N  Leaderboard.jsx  
**File:** `src/pages/Leaderboard.jsx`  
**Current state:** No `useLang()` import.

| Hardcoded string | Matching key | Action |
|---|---|---|
| `PageHeader eyebrow="Communauté"` | ✅ `nav.community` | USE |
| `PageHeader title="Classement"` | ➕ `leaderboard.title` | ADD |
| `PageHeader description` | ➕ `leaderboard.desc` | ADD |
| `"Connecte-toi pour voir ta propre position…"` | ➕ `leaderboard.notAuthNote` | ADD |
| `"Se connecter"` (button) | ✅ `header.signIn` | USE |
| `LoadingState label="Chargement du classement…"` | ➕ `leaderboard.loading` | ADD |
| `"Le classement est vide pour l'instant"` | ➕ `leaderboard.emptyTitle` | ADD |
| `"Sois le premier à gagner des points…"` | ➕ `leaderboard.emptyDesc` | ADD |
| `"Commencer à apprendre"` | ➕ `leaderboard.startLearning` | ADD |
| `aria-label="Podium des trois premiers"` | ➕ `leaderboard.podiumAria` | ADD |
| `"toi"` (you badge) | ➕ `leaderboard.you` | ADD |
| `"C'est toi"` (badge label) | ➕ `leaderboard.itsYou` | ADD |
| `aria-label="C'est toi"` | same `leaderboard.itsYou` | USE |
| `"Ta position"` | ➕ `leaderboard.myPosition` | ADD |
| `POINT_RULES` labels (5 strings) | ➕ `leaderboard.ruleLesson/Quiz/Post/React/Streak` | ADD |
| `POINT_RULES` values `{+10 pts, +15 pts, +5 pts, +2 pts, + bonus}` | ➕ same keys with `Val` suffix | ADD |
| `h2 "Comment gagner des points ?"` | ➕ `leaderboard.howToTitle` | ADD |
| How-to subtitle paragraph | ➕ `leaderboard.howToDesc` | ADD |
| `"Gagner mes premiers points"` | ➕ `leaderboard.firstPoints` | ADD |
| `"Besoin d'en parler ? Retrouve un soutien…"` | ➕ `leaderboard.footnote` | ADD |

---

### 2-O  Resources.jsx  
**File:** `src/pages/Resources.jsx`  
**Current state:** No `useLang()` import. Contains extensive hardcoded content (guides, emergency text).

| Hardcoded string | Matching key | Action |
|---|---|---|
| `PageHeader eyebrow="Aide immédiate"` | ➕ `resources.eyebrow` | ADD |
| `PageHeader title="Ressources & aide"` | ➕ `resources.title` | ADD |
| `PageHeader description` | ➕ `resources.desc` | ADD |
| `LoadingState label="Chargement des numéros d'aide…"` | ➕ `resources.loading` | ADD |
| `h2 "Besoin d'aide tout de suite ?"` | ➕ `resources.emergencyTitle` | ADD |
| Emergency subtitle paragraph | ➕ `resources.emergencySubtitle` | ADD |
| `"En cas de danger immédiat, rends-toi au centre de santé…"` | ➕ `resources.emergencyFallback` | ADD |
| `"En cas de danger immédiat, appelle le 112…"` (note) | ➕ `resources.emergencyNote` | ADD |
| `SectionHeading eyebrow="Lignes d'écoute"` | ➕ `resources.linesEyebrow` | ADD |
| `SectionHeading title="Numéros et services d'aide"` | ➕ `resources.linesTitle` | ADD |
| `SectionHeading description` | ➕ `resources.linesDesc` | ADD |
| `EmptyState title/description` | ➕ `resources.emptyTitle/Desc` | ADD |
| `"Réessayer"` | ✅ `common.retry` | USE |
| `SectionHeading eyebrow="Repères"` | ➕ `resources.guidesEyebrow` | ADD |
| `SectionHeading title="Des situations, des premiers pas"` | ➕ `resources.guidesTitle` | ADD |
| `SectionHeading description` | ➕ `resources.guidesDesc` | ADD |
| Guide 1 title `"Si tu penses à te faire du mal"` | ➕ `resources.guide1Title` | ADD |
| Guide 1 steps (4 items) | ➕ `resources.guide1Step1/2/3/4` | ADD |
| Guide 1 emphasis | ➕ `resources.guide1Emphasis` | ADD |
| Guide 2 title / bullets | ➕ `resources.guide2Title/Bullet1/2/3/4` | ADD |
| Guide 3 title / text / CTA | ➕ `resources.guide3Title/Text` | ADD |
| `"Ouvrir le chatbot"` | ➕ `resources.openChatbot` | ADD |
| `"Aller au forum"` | ➕ `resources.goToCommunity` | ADD |
| Guide 4 title / bullets / CTA | ➕ `resources.guide4Title/Bullet1/2/3` | ADD |
| `"Parler à un·e expert·e"` | ➕ `resources.talkToExpert` | ADD |
| CTA card title `"Tu veux en parler à quelqu'un ?"` | ➕ `resources.ctaTitle` | ADD |
| CTA subtitle | ➕ `resources.ctaDesc` | ADD |
| `"Poser une question au chatbot"` | ➕ `resources.askChatbot` | ADD |
| `"Parler à un·e expert·e"` | already `resources.talkToExpert` | ADD |
| `"Rejoindre la communauté"` | ➕ `resources.joinCommunity` | ADD |
| Disclaimer paragraph | ➕ `resources.disclaimer` | ADD |
| `FALLBACK_HELPLINES` (3 items, names/descriptions) | Keep hardcoded in FR for now, or add to `resources.fallbackLines` as an array — but since these are data objects (not UI strings) and are only shown when the API fails, they can remain hardcoded and language-neutral; the critical UI labels around them will be translated. | SKIP data strings |
| HelplineCard `"Appeler le {phone}"` | ➕ `resources.callLabel` (function) | ADD |
| HelplineCard `"Ouvrir le site"` | ➕ `resources.openSite` | ADD |

---

### 2-P  LessonDetail.jsx  
**File:** `src/pages/LessonDetail.jsx`  
**Current state:** No `useLang()` import.

| Hardcoded string | Matching key | Action |
|---|---|---|
| `LoadingState label="Chargement du cours…"` | ➕ `lessonDetail.loading` | ADD |
| `"Retour aux cours"` | ➕ `lessonDetail.backToLearn` | ADD |
| `"Cours introuvable"` | ➕ `lessonDetail.notFoundTitle` | ADD |
| `"Ce cours n'existe pas ou a été retiré."` | ➕ `lessonDetail.notFoundDesc` | ADD |
| `"Voir tous les cours"` | ➕ `lessonDetail.seeAll` | ADD |
| `aria-label="Fil d'Ariane"` | ➕ `common.breadcrumbAria` | ADD (shared) |
| Breadcrumb `"Apprendre"` | ✅ `learn.title` | USE |
| `LEVEL_LABELS` static object | ✅ `learn.levelBeginner/Intermed/Advanced` | USE |
| Badge `"Terminé"` | ✅ `learn.doneBadge` | USE |
| `ProgressBar label="Progression de lecture"` | ➕ `lessonDetail.readProgress` | ADD |
| `aria-label="Points clés à retenir"` | ➕ `lessonDetail.keyPointsAria` | ADD |
| `"À retenir"` (keypoints heading) | ➕ `lessonDetail.toRemember` | ADD |
| `"Terminé"` (complete button when done) | ✅ `learn.doneBadge` | USE |
| `"Marquer comme terminé"` | ➕ `lessonDetail.markDone` | ADD |
| `"Tu gagneras {pts} points en terminant ce cours."` | ➕ `lessonDetail.willEarnPoints` (function) | ADD |
| `aria-label="Navigation entre les cours"` | ➕ `lessonDetail.navAria` | ADD |
| `"Sources"` (section title) | ➕ `lessonDetail.sourcesTitle` | ADD |
| CTA card `h2 "Des questions ?"` | ➕ `lessonDetail.ctaTitle` | ADD |
| CTA description | ➕ `lessonDetail.ctaDesc` | ADD |
| `"Ouvrir le chatbot"` | ✅ `resources.openChatbot` (reuse) or ➕ `lessonDetail.openChatbot` | ADD |
| `"Quiz : {title}"` button | ➕ `lessonDetail.quizBtn` (function) | ADD |
| Toast `"Bravo ! Tu gagnes {pts} points."` | ➕ `lessonDetail.toastPoints` (function) | ADD |
| Toast `"Tu avais déjà terminé ce cours."` | ➕ `lessonDetail.toastAlreadyDone` | ADD |
| Toast `"Impossible d'enregistrer ta progression. Réessaie."` | ➕ `lessonDetail.toastError` | ADD |
| Modal `title="Nouveaux badges débloqués !"` | ✅ `quizRunner.badgesTitle` (reuse) or ➕ `lessonDetail.badgesTitle` | ADD |
| Modal `description` | ➕ `lessonDetail.badgesDesc` | ADD |
| `"Super !"` | ✅ `quizRunner.badgesOk` (reuse) or ➕ `lessonDetail.badgesOk` | ADD |

---

### 2-Q  PostDetail.jsx  
**File:** `src/pages/PostDetail.jsx`  
**Current state:** No `useLang()` import.

| Hardcoded string | Matching key | Action |
|---|---|---|
| `LoadingState label="Chargement de la discussion…"` | ➕ `postDetail.loading` | ADD |
| Breadcrumb `"Communauté"` | ✅ `nav.community` | USE |
| `"Anonyme"` (author name) | ➕ `postDetail.anonymous` | ADD |
| `"{n} réponse{s}"` / `"Réponses"` (section title) | ➕ `postDetail.repliesCount` (function) / `postDetail.repliesTitle` | ADD |
| `"Sois la première personne à répondre"` | ➕ `postDetail.noRepliesTitle` | ADD |
| `"Ton message peut apporter du réconfort…"` | ➕ `postDetail.noRepliesDesc` | ADD |
| Badge `"Meilleure réponse"` | ➕ `postDetail.bestAnswer` | ADD |
| `CardHeader title="Écris ta réponse"` | ➕ `postDetail.replyFormTitle` | ADD |
| `CardHeader subtitle="Réponds avec respect…"` | ➕ `postDetail.replyFormSub` | ADD |
| Field `label="Ta réponse"` | ➕ `postDetail.replyFieldLabel` | ADD |
| `placeholder="Écris ton message bienveillant…"` | ➕ `postDetail.replyPlaceholder` | ADD |
| `"Répondre en anonyme"` | ➕ `postDetail.replyAnon` | ADD |
| `"Envoyer"` | ✅ `common.send` | USE |
| `"Je soutiens"` (reaction button) | ➕ `postDetail.reactSupport` | ADD |
| `"Utile"` (reaction button) | ➕ `postDetail.reactHelpful` | ADD |
| `"Signaler"` | ➕ `postDetail.report` | ADD |
| Report modal title/description | ✅ `community.reportTitle/Desc` | USE |
| Report field label/hint/placeholder | ✅ `community.reportField/Hint/PH` | USE |
| `"Annuler"` / `"Envoyer le signalement"` | ✅ `community.cancel/reportSend` | USE |
| Toast `"Merci pour ton soutien !"` | ✅ `community.toastSupport` | USE |
| Toast `"Merci, ton avis compte !"` | ✅ `community.toastVote` | USE |
| Toast `"Ta réponse a bien été publiée. Merci !"` | ➕ `postDetail.toastReplyPublished` | ADD |
| Toast `"Ta réponse doit contenir au moins 5 caractères."` | ➕ `postDetail.validReplyMin` | ADD |
| Toast `"Merci d'indiquer la raison du signalement."` | ✅ `community.validReportMin` | USE |
| Toast `"Merci, ton signalement a été transmis."` | ✅ `community.toastReported` (function) | USE |

---

### 2-R  CampaignDetail.jsx  
**File:** `src/pages/CampaignDetail.jsx`  
**Current state:** No `useLang()` import.

| Hardcoded string | Matching key | Action |
|---|---|---|
| `LoadingState label="Chargement de la campagne…"` | ➕ `campaignDetail.loading` | ADD |
| Breadcrumb `"Campagnes"` | ✅ `campaigns.title` | USE |
| `"{n} participants"` | ✅ `campaigns.participants` (function) | USE |
| `"Rejoindre la campagne"` | ✅ `campaigns.joinBtn` | USE |
| `h2 "À propos de cette campagne"` | ➕ `campaignDetail.aboutTitle` | ADD |
| `CardHeader title="Le savais-tu ?"` | ➕ `campaignDetail.factsTitle` | ADD |
| `h2 "Programme de la campagne"` | ➕ `campaignDetail.scheduleTitle` | ADD |
| `CardHeader title="Ressources à consulter"` | ➕ `campaignDetail.resourcesTitle` | ADD |
| `CardHeader title="Partage la campagne"` | ➕ `campaignDetail.shareTitle` | ADD |
| `"Plus on est nombreux·ses…"` (share text) | ➕ `campaignDetail.shareDesc` | ADD |
| `"Copier le lien"` | ➕ `campaignDetail.copyLink` | ADD |
| `"Partager sur WhatsApp"` | ➕ `campaignDetail.shareWhatsapp` | ADD |
| Toast `"Lien de la campagne copié !"` | ➕ `campaignDetail.toastCopied` | ADD |
| Toast `"Impossible de copier le lien…"` | ➕ `campaignDetail.toastCopyError` | ADD |
| Toast join messages | ✅ `campaigns.toastJoined/Already` (functions) | USE |
| `shareText` for WhatsApp: `"Découvre la campagne…"` | ➕ `campaignDetail.shareText` (function) | ADD |
| CTA `h2 "Besoin de parler ?"` | ➕ `campaignDetail.cta1Title` | ADD |
| CTA description | ➕ `campaignDetail.cta1Desc` | ADD |
| `"Ouvrir le chat"` | ➕ `campaignDetail.openChat` | ADD |
| CTA `h2 "Rejoins la communauté"` | ➕ `campaignDetail.cta2Title` | ADD |
| CTA description | ➕ `campaignDetail.cta2Desc` | ADD |
| `"Aller au forum"` | ➕ `campaignDetail.goToForum` | ADD |

---

### 2-S  PostCard.jsx (components/domain/)  
**File:** `src/components/domain/PostCard.jsx`  
**Current state:** No `useLang()` import. Uses `CATEGORY_LABELS` object hardcoded in French.

| Hardcoded string | Matching key | Action |
|---|---|---|
| `CATEGORY_LABELS` object (6 labels) | ➕ `postCard.catQuestions/Mental/Relations/Grossesse/Ist/Confidences` | ADD |
| `"Discussion"` (fallback label) | ➕ `postCard.catFallback` | ADD |
| `aria-label="Je soutiens cette publication ({n})"` | ➕ `postCard.reactSupportAria` (function) | ADD |
| `aria-label="Je trouve cette publication utile ({n})"` | ➕ `postCard.reactHelpfulAria` (function) | ADD |
| `"Signaler cette publication"` (IconButton label) | ➕ `postCard.reportLabel` | ADD |
| `"Anonyme"` (author name fallback) | ✅ reuse `postDetail.anonymous` or ➕ `postCard.anonymous` | ADD |

---

## CORRECTION 3 — New catalogue keys summary

All keys marked ➕ above must be added to **both** `src/i18n/fr.js` and `src/i18n/en.js`.

### New namespaces / keys to add

**`footer`** (10 keys):
```js
tagline, noteSafe, noteGlobal, navAria, navHeading, helpHeading, helplines, contactPro, bottomNote, disclaimer
```

**`chat`** (1 new key):
```js
botFallback
```

**`myths`** (22 new keys):
```js
eyebrow, title, desc, askChatbot, countSingular, countPlural,
resultSingular, resultPlural, searchLabel, searchPH, filterByCat,
filterAll, noMatchTitle, noMatchDesc, resetFilters,
ctaTitle, ctaDesc, cardMythLabel, cardTruthLabel, cardSource,
cardHide, cardReveal
```

**`quizzes`** (5 new keys):
```js
desc, noTitle, noDesc, seeLessons, footerLink
```

**`quizRunner`** (24 new keys):
```js
loading, backToQuizzes, noQuestionsTitle, noQuestionsDesc, breadcrumb,
pointsToWin, questionStep, answeredCount, prev, next, finish,
hintAllRequired, hintAnon, submitError, resultEyebrow,
score100, score75, score50, score0,
correctCount, awardedPoints, restart, seeOthers,
corrections, correctionIndex, correct, wrong,
badgesTitle, badgesDesc, badgesOk
```

**`leaderboard`** (15+ new keys):
```js
title, desc, notAuthNote, loading, emptyTitle, emptyDesc, startLearning,
podiumAria, you, itsYou, myPosition,
ruleLesson, ruleQuiz, rulePost, ruleReact, ruleStreak,
ruleLessonVal, ruleQuizVal, rulePostVal, ruleReactVal, ruleStreakVal,
howToTitle, howToDesc, firstPoints, footnote
```

**`resources`** (30+ new keys):
```js
eyebrow, title, desc, loading, emergencyTitle, emergencySubtitle,
emergencyFallback, emergencyNote,
linesEyebrow, linesTitle, linesDesc, emptyTitle, emptyDesc,
guidesEyebrow, guidesTitle, guidesDesc,
guide1Title, guide1Step1, guide1Step2, guide1Step3, guide1Step4, guide1Emphasis,
guide2Title, guide2Bullet1, guide2Bullet2, guide2Bullet3, guide2Bullet4,
guide3Title, guide3Text, openChatbot, goToCommunity,
guide4Title, guide4Bullet1, guide4Bullet2, guide4Bullet3, talkToExpert,
ctaTitle, ctaDesc, askChatbot, joinCommunity, disclaimer,
callLabel, openSite
```

**`lessonDetail`** (15+ new keys):
```js
loading, backToLearn, notFoundTitle, notFoundDesc, seeAll,
readProgress, keyPointsAria, toRemember, markDone, willEarnPoints,
navAria, sourcesTitle, ctaTitle, ctaDesc, openChatbot, quizBtn,
toastPoints, toastAlreadyDone, toastError,
badgesTitle, badgesDesc, badgesOk
```

**`postDetail`** (15+ new keys):
```js
loading, anonymous, repliesCount, repliesTitle,
noRepliesTitle, noRepliesDesc, bestAnswer,
replyFormTitle, replyFormSub, replyFieldLabel, replyPlaceholder, replyAnon,
reactSupport, reactHelpful, report,
toastReplyPublished, validReplyMin
```

**`campaignDetail`** (15+ new keys):
```js
loading, aboutTitle, factsTitle, scheduleTitle, resourcesTitle,
shareTitle, shareDesc, copyLink, shareWhatsapp,
toastCopied, toastCopyError, shareText,
cta1Title, cta1Desc, openChat,
cta2Title, cta2Desc, goToForum
```

**`postCard`** (8 new keys):
```js
catQuestions, catMental, catRelations, catGrossesse, catIst, catConfidences,
catFallback, reactSupportAria, reactHelpfulAria, reportLabel, anonymous
```

**`community`** (2 new keys):
```js
loadingPosts, loadingGroup
```

**`common`** (1 new key):
```js
breadcrumbAria
```

---

## Implementation order (dependency-based)

- [ ] 1. **Add all new catalogue keys** to `src/i18n/fr.js` and `src/i18n/en.js` (all new namespaces and keys listed in Correction 3). No component touches until this is done.
      Files: `src/i18n/fr.js`, `src/i18n/en.js`
      Verify: `npm run build` from `c:\Users\Omnibook\Downloads\Youth_Live\wetoo\frontend` — no errors.

- [ ] 2. **Wire SiteFooter.jsx**: add `useLang` import, call `t`, use `getAppNav(t)` for nav labels, replace all hardcoded strings.
      Files: `src/components/layout/SiteFooter.jsx`
      Verify: `npm run build` — no errors.

- [ ] 3. **Wire PostCard.jsx**: add `useLang` import, replace `CATEGORY_LABELS` object and all hardcoded aria-labels/strings.
      Files: `src/components/domain/PostCard.jsx`
      Verify: `npm run build` — no errors.

- [ ] 4. **Wire Home.jsx**: add `useLang` import, move `QUICK_ACTIONS` inside component body using `t()`, replace every hardcoded string.
      Files: `src/pages/Home.jsx`
      Verify: `npm run build` — no errors.

- [ ] 5. **Wire Chat.jsx**: add `useLang` import, pass `t` to sub-components `WelcomeScreen` and `BotExtras` as props, replace all hardcoded strings.
      Files: `src/pages/Chat.jsx`
      Verify: `npm run build` — no errors.

- [ ] 6. **Wire Learn.jsx**: add `useLang` import, build `LEVEL_LABELS` from `t()`, replace all strings.
      Files: `src/pages/Learn.jsx`
      Verify: `npm run build` — no errors.

- [ ] 7. **Wire Community.jsx**: add `useLang` import, build `SORT_TABS` from `t()`, replace all strings.
      Files: `src/pages/Community.jsx`
      Verify: `npm run build` — no errors.

- [ ] 8. **Wire Experts.jsx**: add `useLang` import, build `CONTACT_OPTIONS` and `REQUEST_STATUS` from `t()`, replace all strings.
      Files: `src/pages/Experts.jsx`
      Verify: `npm run build` — no errors.

- [ ] 9. **Wire Campaigns.jsx**: add `useLang` import, build `STATUS_TABS` and `STATUS_LABELS` from `t()`, replace all strings.
      Files: `src/pages/Campaigns.jsx`
      Verify: `npm run build` — no errors.

- [ ] 10. **Wire Profile.jsx**: add `useLang` import, build `TABS`, `GENDER_OPTIONS`, `INTEREST_OPTIONS` from `t()`, replace all strings including inline validation messages.
       Files: `src/pages/Profile.jsx`
       Verify: `npm run build` — no errors.

- [ ] 11. **Wire Myths.jsx**: add `useLang` import, replace all strings in both `Myths()` and `MythCard()`.
       Files: `src/pages/Myths.jsx`
       Verify: `npm run build` — no errors.

- [ ] 12. **Wire Quizzes.jsx**: add `useLang` import, replace all strings.
       Files: `src/pages/Quizzes.jsx`
       Verify: `npm run build` — no errors.

- [ ] 13. **Wire QuizRunner.jsx**: add `useLang` import, replace `scoreMessage()` with `t()` calls, replace all UI strings.
       Files: `src/pages/QuizRunner.jsx`
       Verify: `npm run build` — no errors.

- [ ] 14. **Wire Leaderboard.jsx**: add `useLang` import, build `POINT_RULES` from `t()`, replace all strings.
       Files: `src/pages/Leaderboard.jsx`
       Verify: `npm run build` — no errors.

- [ ] 15. **Wire Resources.jsx**: add `useLang` import, replace all UI strings (guide content, emergency text, CTA). Leave `FALLBACK_HELPLINES` data strings (names, descriptions) hardcoded — they are static reference data, not UI labels.
       Files: `src/pages/Resources.jsx`
       Verify: `npm run build` — no errors.

- [ ] 16. **Wire LessonDetail.jsx**: add `useLang` import, reuse `learn.levelBeginner/Intermed/Advanced` for `LEVEL_LABELS`, replace all strings.
       Files: `src/pages/LessonDetail.jsx`
       Verify: `npm run build` — no errors.

- [ ] 17. **Wire PostDetail.jsx**: add `useLang` import, replace all strings, reuse `community.reportTitle/Desc/Field/Hint/PH/validReportMin/toastReported/toastSupport/toastVote`.
       Files: `src/pages/PostDetail.jsx`
       Verify: `npm run build` — no errors.

- [ ] 18. **Wire CampaignDetail.jsx**: add `useLang` import, replace all strings.
       Files: `src/pages/CampaignDetail.jsx`
       Verify: `npm run build` — no errors.

- [ ] 19. **Final build verification**: run `npm run build` from `c:\Users\Omnibook\Downloads\Youth_Live\wetoo\frontend` and confirm zero errors and zero warnings about missing translation keys.
       Verify: `npm run build` exits with code 0 and produces output in `dist/`.
