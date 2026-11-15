# Implementation Plan — i18n (FR/EN) for WeToo Frontend

## Summary

Add a `LangContext` / `LangProvider` that exposes `{ lang, toggleLang, t }`, drop a `LangToggle`
button next to the existing `ThemeToggle` in `SiteHeader`, and replace every hardcoded French UI
string with `t('key')` calls. The translation catalogue is split into `src/i18n/fr.js` and
`src/i18n/en.js`. No external library is needed — the codebase is self-contained and the pattern
mirrors the existing `ThemeContext` exactly.

---

## 0 · Files containing em-dashes / en-dashes (cadratins — U+2014 / U+2013)

These files carry `—` or `–` characters **inside JSX string literals or JS strings** and must be
audited when replacing hardcoded text. The character itself is not a bug; it must survive into the
translated strings verbatim.

| File (relative to `src/`) | Lines |
|---|---|
| `components/layout/nav.js` | 25 |
| `components/layout/SiteFooter.jsx` | 56 |
| `components/ui/Button.jsx` | 91 (comment only — no action needed) |
| `pages/Campaigns.jsx` | 97, 253 |
| `pages/Chat.jsx` | 307 |
| `pages/Community.jsx` | 181 |
| `pages/Home.jsx` | 141, 163 |
| `pages/Landing.jsx` | 60, 155, 292–295, 450, 457, 464, 483 |
| `pages/Leaderboard.jsx` | 196 |
| `pages/Login.jsx` | 212 |
| `pages/Profile.jsx` | 267, 318, 486 |
| `pages/Register.jsx` | 319 |

`—` used as a **fallback value** (e.g. `stats?.users ?? '—'`) must be preserved as the literal
string `'—'` in both language files — it is a data placeholder, not UI copy.

---

## 1 · Complete `fr.js` key structure

> File to create: `src/i18n/fr.js`
> All strings are extracted from actual file content read during exploration.

```js
// src/i18n/fr.js
export const fr = {

  /* ── Navigation (nav.js / SiteHeader.jsx) ─────────────────────── */
  nav: {
    home:        'Accueil',
    askQuestion: 'Poser une question',
    chat:        'Chat',
    learn:       'Apprendre',
    community:   'Communauté',
    forum:       'Forum',
    campaigns:   'Campagnes',
    experts:     'Professionnel·les de santé',
    expertsShort:'Experts',
    myths:       'Mythes & vraies infos',
    mythsShort:  'Mythes',
    help:        'Besoin d\'aide',
    helpShort:   'Aide',
    profile:     'Profil',
    marketing: {
      problem:   'Le problème',
      solution:  'La solution',
      pillars:   'Les 4 piliers',
      impact:    'Impact',
    },
    ariaMain:    'Navigation principale',
    ariaMobile:  'Navigation mobile',
    ariaMenu:    'Menu',
  },

  /* ── SiteHeader ────────────────────────────────────────────────── */
  header: {
    ariaHome:    'WeToo, accueil',
    openMenu:    'Ouvrir le menu',
    closeMenu:   'Fermer le menu',
    signIn:      'Se connecter',
    openApp:     'Ouvrir la plateforme',
    createAccount:'Créer un compte',
    myProfile:   'Mon profil',
    seeCampaigns:'Voir les campagnes',
  },

  /* ── ThemeToggle / LangToggle ──────────────────────────────────── */
  theme: {
    switchTo:    (next) => `Passer en thème ${next}`,
    light:       'clair',
    dark:        'sombre',
  },
  lang: {
    switchTo:    'Switch to English',   // intentionally bilingual
    current:     'FR',
    ariaLabel:   'Changer la langue',
  },

  /* ── AppLayout ─────────────────────────────────────────────────── */
  layout: {
    skipToContent: 'Aller au contenu principal',
  },

  /* ── Landing page ──────────────────────────────────────────────── */
  landing: {
    badge:       'Défi mondial d\'innovation YTH Live 2026 · ETR',
    heroTitle1:  'Parler sans tabou.',
    heroTitle2:  'Apprendre sans jugement.',
    heroLead:    'WeToo est la plateforme communautaire qui aide les jeunes à trouver des informations fiables sur la santé sexuelle et le bien-être mental, à poser leurs questions en anonyme et à être mis en relation avec de vrais professionnels de santé.',
    ctaOpen:     'Ouvrir la plateforme',
    ctaPillars:  'Découvrir les 4 piliers',
    chipFree:    '100 % gratuit',
    chipAnon:    'Anonyme et sécurisé',
    chipOffline: 'Hors ligne : une perspective',
    chipInclusive:'Filles et garçons',

    chatPreviewTitle:   'WeToo · Espace anonyme',
    chatBubbleUser1:    'Est-ce que je peux tomber enceinte la première fois ?',
    chatBubbleBotPre:   'Bonne question, et tu n\'es pas seul·e à te la poser.',
    chatBubbleBotStrong:'Oui, c\'est possible',
    chatBubbleBotPost:  ': la première fois n\'est pas une protection. Veux-tu que je t\'explique les méthodes les plus fiables ?',
    chatBubbleUser2:    'Oui, et est-ce que le préservatif suffit ?',
    chatChip1:          'Méthodes fiables',
    chatChip2:          'Parler à une sage-femme',
    floatMythTitle:     'Mythe démonté',
    floatMythText:      '« Le préservatif, ça gâche tout. »',
    floatBadgeTitle:    'Niveau 3 · Éclaireur·se',
    floatBadgeText:     '+60 points d\'apprentissage',

    statsUsers:    'jeunes déjà inscrit·es',
    statsLessons:  'cours terminés',
    statsQuestions:'questions posées au chatbot',
    statsMyths:    'mythes démontés',
    statsFallback: '—',

    problemEyebrow:   'Le problème',
    problemTitle:     'Au Bénin, les jeunes apprennent la santé sexuelle dans les couloirs, sur Internet… ou pas du tout.',
    problemDesc:      'Les tabous familiaux et l\'absence de programme scolaire structuré laissent les adolescents livrés à eux-mêmes. Les conséquences sont concrètes et graves.',

    solutionEyebrow:  'La solution',
    solutionTitle:    'Un seul espace sûr qui réunit quatre dispositifs.',
    solutionDesc:     'WeToo ne se contente pas de diffuser de l\'information : il crée un écosystème interactif, éducatif et sécurisé, qui combine technologie frugale et accompagnement humain.',
    solutionCheck1:   'Accessible même sans smartphone haut de gamme',
    solutionCheck1Rest:' — application web légère et économe en données. Le mode hors ligne, le SMS et l\'USSD restent des perspectives.',
    solutionCheck2:   'Pensé pour tous les jeunes',
    solutionCheck2Rest:' — filles et garçons, scolarisés ou non, dans toute leur diversité.',
    solutionCheck3:   'Une communauté, pas juste un site',
    solutionCheck3Rest:' — animateurs, professionnels partenaires et campagnes mensuelles.',
    solutionCta:      'Tester le chatbot',
    solutionImgAlt:   'Des jeunes discutent ensemble dans la cour d\'un établissement en Afrique de l\'Ouest.',
    solutionBadge:    '4 professionnel·les partenaires',

    pillarsEyebrow:   'Les 4 piliers',
    pillarsTitle:     'Comment WeToo fonctionne, concrètement',
    pillarsDesc:      'Chaque pilier répond à une partie du problème — et les quatre se renforcent mutuellement.',

    impactEyebrow:    'La voix des jeunes',
    impactTitle:      'Ce sont les jeunes qui ont façonné cette idée.',
    impactDesc:       'Nous avons écouté des lycéen·nes, des apprenti·es et des jeunes déscolarisé·es à Cotonou et Parakou. Voici ce qu\'ils et elles nous ont dit.',
    impactPoint1Q:    '« Pourquoi les garçons sont toujours oubliés ? »',
    impactPoint1A:    'C\'est pour ça que WeToo est mixte, sans exception.',
    impactPoint2Q:    '« Je ne peux pas lire des longs textes. »',
    impactPoint2A:    'D\'où les formats audio, visuels et le chatbot.',
    impactPoint3Q:    '« Je n\'ai pas d\'internet tous les jours. »',
    impactPoint3A:    'D\'où notre perspective : le mode hors ligne, le SMS et l\'USSD.',

    trustEyebrow:     'Sécurité & accès',
    trustTitle:       'Un espace que les jeunes peuvent vraiment utiliser.',
    trustDesc:        'Parler de santé sexuelle et de santé mentale demande de la confiance. Nous l\'avons construite dans le produit, pas seulement dans le discours.',
    trustImgAlt:      'Une jeune femme consulte son téléphone, rassurée après avoir trouvé de l\'aide en ligne.',

    grantEyebrow:     'Avec la bourse',
    grantTitle:       'Ce que nous ferons avec le financement',
    grantDesc:        'Une étape suivante réaliste, mesurable et reproductible dans d\'autres pays.',

    ctaFinalTitle:    'Tu as une question, toi aussi ?',
    ctaFinalText:     'Entre dans un espace où l\'on ne te juge pas, où l\'on répond à tes vraies questions et où d\'autres jeunes t\'attendent.',
    ctaFinalJoin:     'Rejoindre WeToo',
    ctaFinalHelp:     'Trouver de l\'aide maintenant',
    ctaFinalNote:     'Gratuit, confidentiel, et pensé par des jeunes pour des jeunes.',

    testimonialPrev:  'Témoignage précédent',
    testimonialNext:  'Témoignage suivant',
    testimonialPause: 'Mettre en pause le défilement',
    testimonialPlay:  'Reprendre le défilement',
    testimonialPos:   (i, total) => `Témoignage ${i} sur ${total}`,
    testimonialAge:   (age) => `${age} ans`,
  },

  /* ── Home page ─────────────────────────────────────────────────── */
  home: {
    dashboardEyebrow: 'Ton tableau de bord',
    hello:            (name) => `Bonjour ${name}`,
    progressGood:     'Tu progresses bien : encore un effort pour atteindre le niveau suivant !',
    progressStart:    'Commence une leçon pour gagner tes premiers points et débloquer des badges.',
    statPoints:       'points',
    statStreak:       'jours de série',
    statRank:         'au classement',
    statLessons:      'cours terminés',
    seeLeaderboard:   'Voir le classement',
    myProfile:        'Mon profil',
    rankFallback:     '—',

    welcomeBadge:     'Bienvenue sur WeToo',
    welcomeTitle1:    'Un espace sûr pour parler de ',
    welcomeTitle2:    'santé et de bien-être',
    welcomeTitle3:    '.',
    welcomeLead:      'Pose tes questions sans tabou, apprends à ton rythme et échange avec d\'autres jeunes — en anonyme si tu le souhaites.',
    welcomeCreate:    'Créer un compte',
    welcomeAskAnon:   'Poser une question anonymement',

    quickEyebrow:     'Actions rapides',
    quickTitle:       'Par où veux-tu commencer ?',

    learnEyebrow:     'Apprentissage',
    learnTitle:       'Reprendre l\'apprentissage',
    learnDescAuth:    'Reprends là où tu t\'es arrêté·e.',
    learnDescAnon:    'Quelques cours pour découvrir.',
    loadingLessons:   'Chargement des cours…',
    noLessonsTitle:   'Aucun cours disponible',
    noLessonsDesc:    'Reviens bientôt, de nouveaux contenus arrivent.',

    campaignEyebrow:  'Engagement',
    campaignTitle:    'La campagne du mois',
    loadingCampaign:  'Chargement de la campagne…',
    noCampaignTitle:  'Pas de campagne en cours',
    noCampaignDesc:   'Une nouvelle campagne thématique arrive chaque mois.',
    participants:     'participant·es',
    seeCampaign:      'Voir la campagne',

    mythEyebrow:      'Vraies infos',
    mythTitle:        'Le mythe du jour',
    loadingMyths:     'Chargement des mythes…',
    noMythTitle:      'Aucun mythe pour l\'instant',
    mythTruth:        'La vérité',
    mythSource:       (src) => `Source : ${src}`,
    anotherMyth:      'Un autre mythe',

    postsEyebrow:     'Communauté',
    postsTitle:       'Dernières discussions',
    loadingPosts:     'Chargement des discussions…',
    noPostsTitle:     'Pas encore de discussion',
    noPostsDesc:      'Sois la première personne à lancer un sujet.',
    postReplies:      (n) => `${n} réponse${n > 1 ? 's' : ''}`,
    seeAllPosts:      'Voir toutes les discussions',

    helpTitle:        'Tu ne vas pas bien ?',
    helpText:         'Parle à quelqu\'un maintenant : lignes d\'écoute, contacts d\'urgence et ressources fiables.',
    helpCta:          'Trouver de l\'aide',
  },

  /* ── Chat page ─────────────────────────────────────────────────── */
  chat: {
    eyebrow:        'Espace confidentiel',
    title:          'Chat avec WeToo',
    desc:           'Pose tes questions en toute confidentialité. Réponses claires, sans jugement, à toute heure.',
    export:         'Exporter',
    newConvo:       'Nouvelle conversation',

    welcomeTitle:   'Bonjour, je suis WeToo.',
    welcomeText:    'Pose ta question librement : corps, contraception, IST, consentement, santé mentale… Je réponds avec des informations fiables et sans jugement.',
    exploreTheme:   'Explore un thème',
    topicQuestions: (label) => `Questions sur « ${label} »`,
    suggestedTitle: 'Questions fréquentes',
    available:      'Disponible à toute heure, en français.',

    themesSideTitle:'Thèmes',
    noConnection:   'Pas de connexion — réessaie.',
    inputLabel:     'Écris ton message',
    inputPlaceholder:'Écris ta question…',
    sendLabel:      'Envoyer',
    inputHint:      'Entrée pour envoyer • Maj + Entrée pour un retour à la ligne',
    disclaimer:     'Ceci ne remplace pas un avis médical. En cas d\'urgence, appelle le 112.',
    typingAria:     'WeToo est en train d\'écrire…',

    asideThemes:    'Thèmes & repères',
    hideThemes:     'Masquer les thèmes',
    showThemes:     'Thèmes & repères',
    asideAnon:      'Anonyme • Sans jugement • 24 h/24',
    asideAnonSub:   'Tu peux poser toutes tes questions, même les plus personnelles.',
    asideNote:      'Ceci ne remplace pas un avis médical.',
    asideCta:       'Voir les numéros d\'aide',

    confirmTitle:   'Nouvelle conversation ?',
    confirmDesc:    'L\'historique affiché sera effacé de cet appareil. Tu repartiras de zéro.',
    confirmCancel:  'Annuler',
    confirmOk:      'Effacer et recommencer',
    confirmNote:    'Tes échanges précédents ne seront plus visibles ici. Cette action est immédiate.',

    urgentMsg:      'Tu n\'es pas seul·e. De l\'aide est disponible tout de suite.',
    callBtn:        (phone) => `Appeler le ${phone}`,
    sourcesLabel:   (n) => `Sources (${n})`,

    exportHeader:   'Conversation WeToo',
    exportMe:       'Moi',
    exportEmpty:    'La conversation est vide pour le moment.',
    exportDone:     'Conversation exportée.',
    resetDone:      'Nouvelle conversation démarrée.',
    convoAria:      'Conversation',
    messagesAria:   'Messages de la conversation',
  },

  /* ── Learn page ────────────────────────────────────────────────── */
  learn: {
    eyebrow:        'Espace d\'apprentissage',
    title:          'Apprendre',
    desc:           'Des cours courts et clairs pour comprendre ton corps, tes relations et ton bien-être. Termine-les pour gagner des points et débloquer des badges.',

    progressEyebrow:'Ta progression',
    levelPrefix:    'Niv.\u00a0',   // non-breaking space preserved
    toNextLevel:    (pts) => `Vers le niveau suivant (${pts} pts)`,
    maxLevel:       'Niveau maximal atteint',
    statPoints:     'points',
    statDone:       'cours terminés',
    statStreak:     'jours d\'affilée',

    filterCategory: 'Catégorie',
    filterAll:      'Toutes',
    filterLevel:    'Niveau',
    filterAllLevels:'Tous',
    filterSearch:   'Rechercher',
    searchPlaceholder:'Titre ou mot-clé…',
    clearSearch:    'Effacer la recherche',
    filterByCat:    'Filtrer par catégorie',
    filterByLevel:  'Filtrer par niveau',

    levelBeginner:  'Débutant',
    levelIntermed:  'Intermédiaire',
    levelAdvanced:  'Avancé',

    noMatchTitle:   'Aucun cours ne correspond',
    noMatchDesc:    'Essaie de changer de catégorie, de niveau ou de mot-clé.',
    resetFilters:   'Réinitialiser les filtres',
    doneBadge:      'Terminé',

    quizEyebrow:    'Pour t\'entraîner',
    quizTitle:      'Quiz',
    quizDesc:       'Teste ce que tu sais en quelques minutes et gagne des points.',
    seeAllQuizzes:  'Voir tous les quiz',
    noQuizTitle:    'Pas encore de quiz',
    noQuizDesc:     'De nouveaux quiz arrivent très bientôt. Reviens vite !',
    quizStart:      'Commencer',
  },

  /* ── Community page ────────────────────────────────────────────── */
  community: {
    eyebrow:        'Entraide entre jeunes',
    title:          'Communauté',
    desc:           'Pose ta question, partage ton expérience, soutiens les autres — en anonyme si tu préfères.',
    newPost:        'Nouvelle discussion',
    searchPlaceholder:'Rechercher une discussion…',
    searchAria:     'Rechercher une discussion',
    filterAll:      'Toutes',
    filterByCat:    'Filtrer par catégorie',
    sortRecent:     'Récentes',
    sortPopular:    'Populaires',
    sortAria:       'Trier les discussions',

    noPostTitle:    'Aucune discussion pour l\'instant',
    noPostDesc:     'Sois la première personne à lancer un sujet. Ton message peut vraiment aider quelqu\'un.',
    launchPost:     'Lancer une discussion',
    listAria:       'Liste des discussions',

    whatsappTitle:  'Rejoins le groupe WhatsApp',
    whatsappSub:    'Une entraide quotidienne, près de chez toi.',
    members:        (n) => `${n} membres`,
    groupRules:     'Règles du groupe',
    joinGroup:      'Rejoindre le groupe',

    modTitle:       'Modération et sécurité',
    modSub:         'Ta sécurité passe avant tout.',
    modAnon:        'Anonymat\u00a0:',
    modAnonText:    'tu peux publier sans donner ton nom.',
    modReport:      'Signalement\u00a0:',
    modReportText:  'signale toute publication qui te semble irrespectueuse ou dangereuse.',
    modHuman:       'Modération humaine\u00a0:',
    modHumanText:   'une équipe relit les contenus sensibles et intervient si besoin.',

    composerTitle:  'Nouvelle discussion',
    composerDesc:   'Partage ce que tu veux, en anonyme si tu préfères. Reste bienveillant·e.',
    fieldTitle:     'Titre',
    fieldTitlePH:   'Résume ta question en une phrase',
    fieldCat:       'Catégorie',
    fieldCatPH:     'Choisir une catégorie…',
    fieldBody:      'Message',
    fieldBodyHint:  'Minimum 10 caractères. Ne partage pas d\'informations personnelles identifiantes.',
    fieldBodyPH:    'Explique ta situation ou ta question…',
    checkAnon:      'Publier en anonyme',
    kindnessNote:   'Bienveillance\u00a0: pas de jugement, pas de diagnostic médical, pas de données personnelles sur les autres.',
    cancel:         'Annuler',
    publish:        'Publier',

    reportTitle:    'Signaler cette publication',
    reportDesc:     'Ton signalement est anonyme et sera étudié par notre équipe de modération.',
    reportField:    'Raison du signalement',
    reportHint:     'Exemple : propos irrespectueux, contenu dangereux, harcèlement…',
    reportPH:       'Explique en quelques mots…',
    reportSend:     'Envoyer le signalement',

    validTitleMin:  'Le titre doit contenir au moins 5 caractères.',
    validCatReq:    'Choisis une catégorie.',
    validBodyMin:   'Le message doit contenir au moins 10 caractères.',
    validReportMin: 'Merci d\'indiquer la raison du signalement.',
    toastSupport:   'Merci pour ton soutien !',
    toastVote:      'Merci, ton avis compte !',
    toastPublished: (msg) => msg || 'Ta discussion a été publiée. Merci pour ta contribution !',
    toastReported:  (msg) => msg || 'Merci, ton signalement a été transmis à notre équipe.',
  },

  /* ── Experts page ──────────────────────────────────────────────── */
  experts: {
    eyebrow:        'Confidentiel et sans jugement',
    title:          'Professionnel·les de santé',
    desc:           'Pose ta question en privé à une sage-femme, une psychologue ou un infirmier. Confidentiel et sans jugement.',
    searchPH:       'Rechercher un·e professionnel·le…',
    searchAria:     'Rechercher un·e professionnel·le de santé',
    filterAll:      'Toutes les spécialités',
    filterAria:     'Filtrer par spécialité',
    loadingExperts: 'Chargement des professionnel·les…',
    noExpertTitle:  'Aucun·e professionnel·le trouvé·e',
    noExpertDesc:   'Essaie un autre mot-clé ou retire le filtre de spécialité.',
    askBtn:         'Poser ma question',
    sessions:       (n) => `${n} sessions`,

    myRequestsTitle:'Mes demandes',
    loadingReqs:    'Chargement de tes demandes…',
    noReqTitle:     'Aucune demande pour l\'instant',
    noReqDesc:      'Ta toute première question trouvera un·e professionnel·le prêt·e à t\'aider.',

    privacyTitle:   'Confidentialité',
    privacySub:     'Ta vie privée est protégée.',
    privacyText1:   'Ce que tu écris reste confidentiel. Seul·e le·la professionnel·le sollicité·e verra ta question, et rien n\'est partagé publiquement.',
    privacyText2:   'En cas d\'urgence, utilise plutôt les numéros d\'écoute\u00a0: ils sont gratuits et disponibles 24h/24.',
    seeHelplines:   'Voir les numéros d\'écoute',

    requestTitle:   'Poser ma question',
    requestDesc:    (name) => `Ta question sera transmise à ${name} en toute confidentialité.`,
    fieldQuestion:  'Ta question',
    fieldQHint:     'Ne partage pas d\'informations personnelles identifiantes (nom complet, adresse, numéro…).',
    fieldQPH:       'Explique ta situation et ta question…',
    counter:        (n, max) => `${n}/${max} caractères`,
    contactLegend:  'Comment souhaites-tu être recontacté·e ?',
    contactField:   'Ton moyen de contact',
    contactHint:    'Numéro de téléphone ou adresse e-mail selon ton choix.',
    contactPH:      'Ex. +229 90 00 00 00',
    consentText:    'J\'accepte que ma question soit transmise à ce·tte professionnel·le de santé.',
    cancel:         'Annuler',
    sendBtn:        'Envoyer ma question',

    successTitle:   'Demande envoyée',
    successMsg:     (name) => `Ta demande a bien été transmise à ${name}.`,
    etaLabel:       (h) => `Réponse estimée sous ~${h} h`,
    close:          'Fermer',

    contactOptions: {
      chat:     'Chat sur la plateforme',
      sms:      'SMS',
      call:     'Appel',
      whatsapp: 'WhatsApp',
    },
    statusLabels: {
      received:    'Reçue',
      in_progress: 'En cours',
      answered:    'Répondue',
      closed:      'Clôturée',
    },
    sentOn:    (date) => `Envoyée le ${date}`,

    validQMin:  'Merci de détailler ta question (10 caractères minimum).',
    validContact:'Merci d\'indiquer un moyen de contact (numéro, email…).',
    validConsent:'Merci de cocher la case de consentement.',
  },

  /* ── Campaigns page ────────────────────────────────────────────── */
  campaigns: {
    eyebrow:        'Mobilisation mensuelle',
    title:          'Campagnes',
    desc:           'Chaque mois, un thème, une mobilisation — en ligne et dans la vraie vie.',
    loading:        'Chargement des campagnes…',
    noTitle:        'Aucune campagne pour le moment',
    noDesc:         'De nouvelles mobilisations arriveront très bientôt. Reviens vite !',

    featuredLabel:  'Campagne du moment',
    featuredAria:   'Campagne du moment',
    participants:   (n) => `${n} participants`,
    joinBtn:        'Rejoindre la campagne',
    learnMore:      'En savoir plus',

    tabActive:      'En cours',
    tabUpcoming:    'À venir',
    tabPast:        'Passées',
    tabAria:        'Filtrer les campagnes par statut',

    noTabTitle:     'Aucune campagne dans cette section',
    noTabDesc:      'Change d\'onglet pour découvrir d\'autres mobilisations.',

    statusActive:   'En cours',
    statusUpcoming: 'À venir',
    statusPast:     'Passée',

    joinShort:      'Rejoindre',
    toastJoined:    (title) => `Merci ! Tu participes maintenant à « ${title} ».`,
    toastAlready:   'Tu participes déjà à cette campagne.',
    joinError:      (msg) => msg || 'Impossible de rejoindre la campagne pour le moment.',

    whatsappTitle:  'Rejoins la communauté WhatsApp',
    whatsappSub:    'Ne manque aucune mobilisation et échange avec d\'autres jeunes.',
    whatsappLoading:'Chargement du groupe…',
    whatsappJoin:   'Rejoindre le groupe',
    whatsappMembers:(n, name) => `${name} — ${n} membres`,
  },

  /* ── Login page ─────────────────────────────────────────────────── */
  login: {
    pill:           'Espace jeunes · 18-29 ans',
    title:          'Content de te revoir.',
    lead:           'Retrouve tes cours, tes badges et la communauté WeToo. Pose tes questions en toute confiance, sans jugement.',
    trustAnon:      'Espace anonyme et sécurisé',
    trustAnonSub:   'Tu peux participer en anonyme sur le forum et le chatbot.',
    trustData:      'Tes données restent privées',
    trustDataSub:   'Nous ne revendons jamais tes informations. Tu gardes le contrôle.',

    cardTitle:      'Se connecter',
    cardSub:        'Accède à ton espace personnel WeToo.',
    emailLabel:     'Adresse email',
    emailPH:        'toi@exemple.bj',
    passwordLabel:  'Mot de passe',
    submit:         'Se connecter',
    noAccount:      'Pas encore de compte ?',
    createFree:     'Créer un compte gratuit',

    demoTitle:      'Comptes de démonstration — clique pour remplir',
    demoPassword:   (pw) => `Mot de passe commun : ${pw}`,

    toastFilled:    (name) => `Compte de ${name} pré-rempli. Clique sur « Se connecter ».`,
    toastWelcome:   (name) => `Bon retour, ${name} ! Heureux de te revoir.`,
    toastError:     (msg) => msg || 'Connexion impossible. Réessaie.',

    validEmail:     'Indique ton adresse email.',
    validEmailFmt:  'Cette adresse email semble invalide.',
    validPassword:  'Indique ton mot de passe.',
  },

  /* ── Register page ─────────────────────────────────────────────── */
  register: {
    pill:           'Inscription gratuite',
    title:          'Rejoins la communauté WeToo.',
    lead:           'Crée ton compte en 1 minute pour apprendre, gagner des badges et échanger en toute confidentialité.',
    ageNoteTitle:   'Pourquoi te demander ton âge ?',
    ageNoteBody1:   'L\'espace WeToo est réservé aux ',
    ageNoteStrong:  '18-29 ans',
    ageNoteBody2:   ', une exigence du défi YTH Live. Ton âge sert uniquement à vérifier ton éligibilité : il reste',
    ageNoteConf:    ' confidentiel',
    ageNoteBody3:   ' et n\'est jamais partagé publiquement.',
    reassure:       'Espace anonyme et sécurisé · tes données restent privées.',

    cardTitle:      'Créer mon compte',
    cardSub:        'Tous les champs marqués d\'un * sont requis.',
    nameLabel:      'Nom complet',
    namePH:         'Ex : Awa Dossou',
    emailLabel:     'Adresse email',
    emailPH:        'toi@exemple.bj',
    pwLabel:        'Mot de passe',
    pwHint:         '6 caractères minimum. Un mot de passe varié est plus sûr.',
    pwStrength:     (label) => `Robustesse : ${label}`,
    ageLabel:       'Âge',
    ageHint:        'Réservé aux 18-29 ans — information confidentielle.',
    agePH:          'Ex : 22',
    genderLegend:   'Genre',
    regionLabel:    'Département',
    regionDefault:  'Choisis ton département',
    interestsLabel: 'Centres d\'intérêt',
    interestsHint:  'Sélectionne ce qui t\'intéresse pour personnaliser tes contenus.',
    interestsAria:  'Centres d\'intérêt',
    submit:         'Créer mon compte',
    hasAccount:     'Tu as déjà un compte ?',
    signIn:         'Se connecter',

    strengthTooShort:'Trop court',
    strengthWeak:   'Faible',
    strengthFair:   'Moyen',
    strengthGood:   'Bon',
    strengthStrong: 'Fort',

    genderGirl:     'Fille',
    genderBoy:      'Garçon',
    genderOther:    'Autre',

    toastWelcome:   'Bienvenue sur WeToo ! Ton compte est créé. 🎉',
    toastWarning:   'Vérifie les champs signalés avant de continuer.',
    toastError:     (msg) => msg || 'Impossible de créer ton compte. Réessaie.',

    validNameMin:   'Indique ton nom complet (2 caractères minimum).',
    validEmail:     'Indique ton adresse email.',
    validEmailFmt:  'Cette adresse email semble invalide.',
    validPwMin:     'Le mot de passe doit contenir au moins 6 caractères.',
    validAgeReq:    'Indique ton âge.',
    validAgeInt:    'L\'âge doit être un nombre entier.',
    validAgeRange:  'L\'espace est réservé aux 18-29 ans.',
    validGender:    'Choisis une option (fille, garçon ou autre).',
    validRegion:    'Choisis ton département.',
  },

  /* ── Profile page ──────────────────────────────────────────────── */
  profile: {
    eyebrow:        'Mon espace',
    title:          'Mon compte',
    desc:           'Gère ton profil, découvre tes badges et personnalise ton expérience.',
    tabProfile:     'Mon profil',
    tabBadges:      'Mes badges',
    tabSettings:    'Réglages',
    tabsAria:       'Sections du profil',

    memberSince:    (date) => `Membre depuis le ${date}`,
    seeLeaderboard: 'Voir le classement complet',

    avatarLegend:   'Choisis ton avatar',
    avatarAria:     'Choix de l\'avatar',
    avatarLabel:    (emoji) => `Avatar ${emoji}`,
    nameLabel:      'Nom complet',
    ageLabel:       'Âge',
    ageHint:        'Entre 18 et 29 ans — reste confidentiel.',
    genderLegend:   'Genre',
    regionLabel:    'Département',
    regionDefault:  'Non précisé',
    interestsLabel: 'Centres d\'intérêt',
    interestsAria:  'Centres d\'intérêt',
    save:           'Enregistrer les modifications',

    badgesIntro:    (obtained, total) => `Tu as obtenu ${obtained} badge${obtained > 1 ? 's' : ''} sur ${total}. Termine des cours, réussis des quiz et participe pour débloquer les autres.`,
    obtainedBadge:  'Obtenu',
    lockedBadge:    'À débloquer',
    criteriaLabel:  'Comment l\'obtenir :',

    noBadgeTitle:   'Aucun badge disponible',
    loadingBadges:  'Chargement de tes badges…',

    appearanceTitle:'Apparence',
    appearanceSub:  'Choisis le thème qui te met le plus à l\'aise.',
    themeGroupAria: 'Choix du thème',
    themeLight:     'Clair',
    themeDark:      'Sombre',

    offlineTitle:   'Mode hors ligne',
    offlineText:    'Nous travaillons sur un accès hors ligne pour les zones à faible connexion. Aujourd\'hui, la plateforme nécessite une connexion internet — aucune donnée n\'est stockée sur ton appareil.',

    logoutTitle:    'Se déconnecter',
    logoutText:     'Tu pourras te reconnecter plus tard : tes points et tes badges sont conservés.',
    logoutBtn:      'Se déconnecter',

    loadingProfile: 'Chargement de ton profil…',
    notAuthTitle:   'Connecte-toi pour voir ton profil',
    notAuthDesc:    'Ton niveau, tes badges et tes réglages sont personnels : crée un compte gratuit pour les retrouver.',
    signInBtn:      'Se connecter',

    toastSaved:     'Profil mis à jour !',
    toastWarning:   'Vérifie les champs signalés.',
    toastError:     (msg) => msg || 'Impossible de mettre à jour le profil.',

    validNameMin:   'Le nom doit contenir au moins 2 caractères.',
    validAgeInt:    'L\'âge doit être un nombre entier.',
    validAgeRange:  'L\'âge doit être compris entre 18 et 29 ans.',

    genderGirl:     'Fille',
    genderBoy:      'Garçon',
    genderOther:    'Autre',

    interestOptions:[
      'Santé mentale', 'Contraception', 'IST', 'Consentement', 'Puberté', 'Bien-être numérique',
    ],

    statPoints:     'points',
    statRank:       'rang',
    statStreak:     'série (jours)',
    statLessons:    'cours terminés',
    rankFallback:   '—',
  },

  /* ── Quick actions (Home) ───────────────────────────────────────── */
  quickActions: {
    chatTitle:      'Poser une question',
    chatText:       'Le chatbot répond 24 h/24, en anonyme.',
    learnTitle:     'Apprendre',
    learnText:      'Des cours courts et des quiz pour progresser.',
    communityTitle: 'Communauté',
    communityText:  'Le forum bienveillant et modéré des jeunes.',
    expertsTitle:   'Professionnel·les',
    expertsText:    'Sage-femme, psy, infirmier·e : en toute confiance.',
  },

  /* ── Shared / generic ───────────────────────────────────────────── */
  common: {
    loading:        'Chargement…',
    retry:          'Réessayer',
    cancel:         'Annuler',
    close:          'Fermer',
    save:           'Enregistrer',
    send:           'Envoyer',
    publish:        'Publier',
    join:           'Rejoindre',
    min:            'min',
  },
};
```

---

## 2 · Complete `en.js` translations

> File to create: `src/i18n/en.js`
> Same key structure; strings are English equivalents.

```js
// src/i18n/en.js
export const en = {

  nav: {
    home:        'Home',
    askQuestion: 'Ask a question',
    chat:        'Chat',
    learn:       'Learn',
    community:   'Community',
    forum:       'Forum',
    campaigns:   'Campaigns',
    experts:     'Health professionals',
    expertsShort:'Experts',
    myths:       'Myths & real info',
    mythsShort:  'Myths',
    help:        'Need help',
    helpShort:   'Help',
    profile:     'Profile',
    marketing: {
      problem:   'The problem',
      solution:  'The solution',
      pillars:   'The 4 pillars',
      impact:    'Impact',
    },
    ariaMain:    'Main navigation',
    ariaMobile:  'Mobile navigation',
    ariaMenu:    'Menu',
  },

  header: {
    ariaHome:    'WeToo, home',
    openMenu:    'Open menu',
    closeMenu:   'Close menu',
    signIn:      'Log in',
    openApp:     'Open the platform',
    createAccount:'Create an account',
    myProfile:   'My profile',
    seeCampaigns:'See campaigns',
  },

  theme: {
    switchTo:    (next) => `Switch to ${next} theme`,
    light:       'light',
    dark:        'dark',
  },
  lang: {
    switchTo:    'Passer en français',
    current:     'EN',
    ariaLabel:   'Change language',
  },

  layout: {
    skipToContent: 'Skip to main content',
  },

  landing: {
    badge:       'YTH Live 2026 Global Innovation Challenge · ETR',
    heroTitle1:  'Speak freely.',
    heroTitle2:  'Learn without judgment.',
    heroLead:    'WeToo is the community platform that helps young people find reliable information on sexual health and mental well-being, ask questions anonymously, and connect with real healthcare professionals.',
    ctaOpen:     'Open the platform',
    ctaPillars:  'Discover the 4 pillars',
    chipFree:    '100% free',
    chipAnon:    'Anonymous & secure',
    chipOffline: 'Offline mode: in development',
    chipInclusive:'Girls and boys',

    chatPreviewTitle:   'WeToo · Anonymous space',
    chatBubbleUser1:    'Can I get pregnant the first time?',
    chatBubbleBotPre:   'Great question, and you\'re not alone in asking it.',
    chatBubbleBotStrong:'Yes, it\'s possible',
    chatBubbleBotPost:  ': the first time offers no protection. Would you like me to explain the most reliable methods?',
    chatBubbleUser2:    'Yes, and is a condom enough?',
    chatChip1:          'Reliable methods',
    chatChip2:          'Talk to a midwife',
    floatMythTitle:     'Myth busted',
    floatMythText:      '"Condoms ruin the experience."',
    floatBadgeTitle:    'Level 3 · Explorer',
    floatBadgeText:     '+60 learning points',

    statsUsers:    'young people registered',
    statsLessons:  'lessons completed',
    statsQuestions:'questions asked to the chatbot',
    statsMyths:    'myths busted',
    statsFallback: '—',

    problemEyebrow:   'The problem',
    problemTitle:     'In Benin, young people learn about sexual health in the hallways, online — or not at all.',
    problemDesc:      'Family taboos and the lack of structured school programmes leave teenagers on their own. The consequences are real and serious.',

    solutionEyebrow:  'The solution',
    solutionTitle:    'One safe space bringing four tools together.',
    solutionDesc:     'WeToo doesn\'t just share information: it creates an interactive, educational, and secure ecosystem that combines frugal technology with human support.',
    solutionCheck1:   'Accessible even without a high-end smartphone',
    solutionCheck1Rest:' — lightweight web app, data-efficient. Offline mode, SMS, and USSD remain upcoming features.',
    solutionCheck2:   'Designed for all young people',
    solutionCheck2Rest:' — girls and boys, in and out of school, in all their diversity.',
    solutionCheck3:   'A community, not just a website',
    solutionCheck3Rest:' — facilitators, partner professionals, and monthly campaigns.',
    solutionCta:      'Try the chatbot',
    solutionImgAlt:   'Young people discussing together in a school courtyard in West Africa.',
    solutionBadge:    '4 partner professionals',

    pillarsEyebrow:   'The 4 pillars',
    pillarsTitle:     'How WeToo works, concretely',
    pillarsDesc:      'Each pillar addresses part of the problem — and all four reinforce each other.',

    impactEyebrow:    'Young people\'s voices',
    impactTitle:      'Young people shaped this idea.',
    impactDesc:       'We listened to high-school students, apprentices, and out-of-school youth in Cotonou and Parakou. Here is what they told us.',
    impactPoint1Q:    '"Why are boys always forgotten?"',
    impactPoint1A:    'That\'s why WeToo is mixed, without exception.',
    impactPoint2Q:    '"I can\'t read long texts."',
    impactPoint2A:    'Hence the audio, visual formats and the chatbot.',
    impactPoint3Q:    '"I don\'t have internet every day."',
    impactPoint3A:    'Hence our vision: offline mode, SMS, and USSD.',

    trustEyebrow:     'Safety & access',
    trustTitle:       'A space young people can truly use.',
    trustDesc:        'Talking about sexual health and mental health takes trust. We built that trust into the product, not just the pitch.',
    trustImgAlt:      'A young woman checks her phone, relieved after finding help online.',

    grantEyebrow:     'With the grant',
    grantTitle:       'What we will do with the funding',
    grantDesc:        'A realistic, measurable next step that can be replicated in other countries.',

    ctaFinalTitle:    'Do you have a question too?',
    ctaFinalText:     'Step into a space where you won\'t be judged, where your real questions get answers, and where other young people are waiting for you.',
    ctaFinalJoin:     'Join WeToo',
    ctaFinalHelp:     'Find help now',
    ctaFinalNote:     'Free, confidential, and made by young people for young people.',

    testimonialPrev:  'Previous testimonial',
    testimonialNext:  'Next testimonial',
    testimonialPause: 'Pause auto-scroll',
    testimonialPlay:  'Resume auto-scroll',
    testimonialPos:   (i, total) => `Testimonial ${i} of ${total}`,
    testimonialAge:   (age) => `${age} years old`,
  },

  home: {
    dashboardEyebrow: 'Your dashboard',
    hello:            (name) => `Hi ${name}`,
    progressGood:     'Great progress — keep it up to reach the next level!',
    progressStart:    'Start a lesson to earn your first points and unlock badges.',
    statPoints:       'points',
    statStreak:       'day streak',
    statRank:         'on leaderboard',
    statLessons:      'lessons completed',
    seeLeaderboard:   'View leaderboard',
    myProfile:        'My profile',
    rankFallback:     '—',

    welcomeBadge:     'Welcome to WeToo',
    welcomeTitle1:    'A safe space to talk about ',
    welcomeTitle2:    'health and well-being',
    welcomeTitle3:    '.',
    welcomeLead:      'Ask questions without taboo, learn at your own pace, and connect with other young people — anonymously if you like.',
    welcomeCreate:    'Create an account',
    welcomeAskAnon:   'Ask a question anonymously',

    quickEyebrow:     'Quick actions',
    quickTitle:       'Where do you want to start?',

    learnEyebrow:     'Learning',
    learnTitle:       'Resume learning',
    learnDescAuth:    'Pick up where you left off.',
    learnDescAnon:    'A few lessons to get started.',
    loadingLessons:   'Loading lessons…',
    noLessonsTitle:   'No lessons available yet',
    noLessonsDesc:    'Come back soon, new content is on its way.',

    campaignEyebrow:  'Engagement',
    campaignTitle:    'Campaign of the month',
    loadingCampaign:  'Loading campaign…',
    noCampaignTitle:  'No active campaign',
    noCampaignDesc:   'A new thematic campaign launches every month.',
    participants:     'participants',
    seeCampaign:      'View campaign',

    mythEyebrow:      'Real facts',
    mythTitle:        'Myth of the day',
    loadingMyths:     'Loading myths…',
    noMythTitle:      'No myths yet',
    mythTruth:        'The truth',
    mythSource:       (src) => `Source: ${src}`,
    anotherMyth:      'Another myth',

    postsEyebrow:     'Community',
    postsTitle:       'Latest discussions',
    loadingPosts:     'Loading discussions…',
    noPostsTitle:     'No discussions yet',
    noPostsDesc:      'Be the first person to start a topic.',
    postReplies:      (n) => `${n} repl${n > 1 ? 'ies' : 'y'}`,
    seeAllPosts:      'See all discussions',

    helpTitle:        'Not feeling well?',
    helpText:         'Talk to someone now: listening lines, emergency contacts, and reliable resources.',
    helpCta:          'Find help',
  },

  chat: {
    eyebrow:        'Confidential space',
    title:          'Chat with WeToo',
    desc:           'Ask your questions in complete privacy. Clear answers, no judgment, at any hour.',
    export:         'Export',
    newConvo:       'New conversation',

    welcomeTitle:   'Hi, I\'m WeToo.',
    welcomeText:    'Ask freely: body, contraception, STIs, consent, mental health… I answer with reliable information and no judgment.',
    exploreTheme:   'Explore a topic',
    topicQuestions: (label) => `Questions on "${label}"`,
    suggestedTitle: 'Frequently asked questions',
    available:      'Available at any hour, in French.',

    themesSideTitle:'Topics',
    noConnection:   'No connection — please retry.',
    inputLabel:     'Type your message',
    inputPlaceholder:'Type your question…',
    sendLabel:      'Send',
    inputHint:      'Enter to send • Shift + Enter for a new line',
    disclaimer:     'This does not replace medical advice. In an emergency, call 112.',
    typingAria:     'WeToo is typing…',

    asideThemes:    'Topics & resources',
    hideThemes:     'Hide topics',
    showThemes:     'Topics & resources',
    asideAnon:      'Anonymous • Non-judgmental • 24/7',
    asideAnonSub:   'You can ask anything, even your most personal questions.',
    asideNote:      'This does not replace medical advice.',
    asideCta:       'See helpline numbers',

    confirmTitle:   'New conversation?',
    confirmDesc:    'The displayed history will be cleared from this device. You will start fresh.',
    confirmCancel:  'Cancel',
    confirmOk:      'Clear and start over',
    confirmNote:    'Your previous exchanges will no longer be visible here. This action is immediate.',

    urgentMsg:      'You are not alone. Help is available right now.',
    callBtn:        (phone) => `Call ${phone}`,
    sourcesLabel:   (n) => `Sources (${n})`,

    exportHeader:   'WeToo Conversation',
    exportMe:       'Me',
    exportEmpty:    'The conversation is empty.',
    exportDone:     'Conversation exported.',
    resetDone:      'New conversation started.',
    convoAria:      'Conversation',
    messagesAria:   'Conversation messages',
  },

  learn: {
    eyebrow:        'Learning space',
    title:          'Learn',
    desc:           'Short, clear lessons to understand your body, relationships, and well-being. Complete them to earn points and unlock badges.',

    progressEyebrow:'Your progress',
    levelPrefix:    'Lv.\u00a0',
    toNextLevel:    (pts) => `To next level (${pts} pts)`,
    maxLevel:       'Maximum level reached',
    statPoints:     'points',
    statDone:       'lessons completed',
    statStreak:     'day streak',

    filterCategory: 'Category',
    filterAll:      'All',
    filterLevel:    'Level',
    filterAllLevels:'All',
    filterSearch:   'Search',
    searchPlaceholder:'Title or keyword…',
    clearSearch:    'Clear search',
    filterByCat:    'Filter by category',
    filterByLevel:  'Filter by level',

    levelBeginner:  'Beginner',
    levelIntermed:  'Intermediate',
    levelAdvanced:  'Advanced',

    noMatchTitle:   'No lessons match',
    noMatchDesc:    'Try changing category, level, or keyword.',
    resetFilters:   'Reset filters',
    doneBadge:      'Done',

    quizEyebrow:    'Practice',
    quizTitle:      'Quizzes',
    quizDesc:       'Test your knowledge in a few minutes and earn points.',
    seeAllQuizzes:  'See all quizzes',
    noQuizTitle:    'No quizzes yet',
    noQuizDesc:     'New quizzes coming very soon. Check back!',
    quizStart:      'Start',
  },

  community: {
    eyebrow:        'Peer support',
    title:          'Community',
    desc:           'Ask a question, share your experience, support others — anonymously if you prefer.',
    newPost:        'New discussion',
    searchPlaceholder:'Search discussions…',
    searchAria:     'Search discussions',
    filterAll:      'All',
    filterByCat:    'Filter by category',
    sortRecent:     'Recent',
    sortPopular:    'Popular',
    sortAria:       'Sort discussions',

    noPostTitle:    'No discussions yet',
    noPostDesc:     'Be the first to start a topic. Your message can really help someone.',
    launchPost:     'Start a discussion',
    listAria:       'Discussion list',

    whatsappTitle:  'Join the WhatsApp group',
    whatsappSub:    'Daily peer support, near you.',
    members:        (n) => `${n} members`,
    groupRules:     'Group rules',
    joinGroup:      'Join the group',

    modTitle:       'Moderation and safety',
    modSub:         'Your safety comes first.',
    modAnon:        'Anonymity:',
    modAnonText:    'you can post without giving your name.',
    modReport:      'Reporting:',
    modReportText:  'report any post that seems disrespectful or dangerous.',
    modHuman:       'Human moderation:',
    modHumanText:   'a team reviews sensitive content and steps in when needed.',

    composerTitle:  'New discussion',
    composerDesc:   'Share what you want, anonymously if you prefer. Be kind.',
    fieldTitle:     'Title',
    fieldTitlePH:   'Summarise your question in one sentence',
    fieldCat:       'Category',
    fieldCatPH:     'Choose a category…',
    fieldBody:      'Message',
    fieldBodyHint:  'Minimum 10 characters. Do not share personally identifying information.',
    fieldBodyPH:    'Explain your situation or question…',
    checkAnon:      'Post anonymously',
    kindnessNote:   'Kindness: no judgment, no medical diagnosis, no personal data about others.',
    cancel:         'Cancel',
    publish:        'Publish',

    reportTitle:    'Report this post',
    reportDesc:     'Your report is anonymous and will be reviewed by our moderation team.',
    reportField:    'Reason for reporting',
    reportHint:     'Example: disrespectful comment, dangerous content, harassment…',
    reportPH:       'Explain briefly…',
    reportSend:     'Send report',

    validTitleMin:  'The title must be at least 5 characters.',
    validCatReq:    'Choose a category.',
    validBodyMin:   'The message must be at least 10 characters.',
    validReportMin: 'Please provide a reason for the report.',
    toastSupport:   'Thank you for your support!',
    toastVote:      'Thanks, your feedback matters!',
    toastPublished: (msg) => msg || 'Your discussion has been published. Thank you!',
    toastReported:  (msg) => msg || 'Thank you, your report has been sent to our team.',
  },

  experts: {
    eyebrow:        'Confidential and non-judgmental',
    title:          'Health professionals',
    desc:           'Ask your question privately to a midwife, psychologist, or nurse. Confidential and non-judgmental.',
    searchPH:       'Search for a professional…',
    searchAria:     'Search for a health professional',
    filterAll:      'All specialties',
    filterAria:     'Filter by specialty',
    loadingExperts: 'Loading professionals…',
    noExpertTitle:  'No professional found',
    noExpertDesc:   'Try a different keyword or remove the specialty filter.',
    askBtn:         'Ask my question',
    sessions:       (n) => `${n} sessions`,

    myRequestsTitle:'My requests',
    loadingReqs:    'Loading your requests…',
    noReqTitle:     'No requests yet',
    noReqDesc:      'Your first question will find a professional ready to help.',

    privacyTitle:   'Confidentiality',
    privacySub:     'Your privacy is protected.',
    privacyText1:   'What you write remains confidential. Only the professional you contact will see your question, and nothing is shared publicly.',
    privacyText2:   'In an emergency, use the helpline numbers instead: they are free and available 24/7.',
    seeHelplines:   'See helpline numbers',

    requestTitle:   'Ask my question',
    requestDesc:    (name) => `Your question will be sent to ${name} in complete confidence.`,
    fieldQuestion:  'Your question',
    fieldQHint:     'Do not share personally identifying information (full name, address, number…).',
    fieldQPH:       'Explain your situation and question…',
    counter:        (n, max) => `${n}/${max} characters`,
    contactLegend:  'How would you like to be contacted?',
    contactField:   'Your contact details',
    contactHint:    'Phone number or email address depending on your choice.',
    contactPH:      'E.g. +229 90 00 00 00',
    consentText:    'I agree for my question to be forwarded to this health professional.',
    cancel:         'Cancel',
    sendBtn:        'Send my question',

    successTitle:   'Request sent',
    successMsg:     (name) => `Your request has been sent to ${name}.`,
    etaLabel:       (h) => `Estimated response within ~${h} h`,
    close:          'Close',

    contactOptions: {
      chat:     'Chat on the platform',
      sms:      'SMS',
      call:     'Phone call',
      whatsapp: 'WhatsApp',
    },
    statusLabels: {
      received:    'Received',
      in_progress: 'In progress',
      answered:    'Answered',
      closed:      'Closed',
    },
    sentOn:    (date) => `Sent on ${date}`,

    validQMin:  'Please detail your question (minimum 10 characters).',
    validContact:'Please provide a contact method (number, email…).',
    validConsent:'Please check the consent box.',
  },

  campaigns: {
    eyebrow:        'Monthly mobilisation',
    title:          'Campaigns',
    desc:           'Every month, one theme, one mobilisation — online and in real life.',
    loading:        'Loading campaigns…',
    noTitle:        'No campaigns at the moment',
    noDesc:         'New mobilisations will arrive very soon. Come back!',

    featuredLabel:  'Campaign of the moment',
    featuredAria:   'Campaign of the moment',
    participants:   (n) => `${n} participants`,
    joinBtn:        'Join the campaign',
    learnMore:      'Learn more',

    tabActive:      'Active',
    tabUpcoming:    'Upcoming',
    tabPast:        'Past',
    tabAria:        'Filter campaigns by status',

    noTabTitle:     'No campaigns in this section',
    noTabDesc:      'Switch tabs to discover other mobilisations.',

    statusActive:   'Active',
    statusUpcoming: 'Upcoming',
    statusPast:     'Past',

    joinShort:      'Join',
    toastJoined:    (title) => `Thank you! You are now participating in "${title}".`,
    toastAlready:   'You are already participating in this campaign.',
    joinError:      (msg) => msg || 'Unable to join the campaign at the moment.',

    whatsappTitle:  'Join the WhatsApp community',
    whatsappSub:    'Don\'t miss any mobilisation and connect with other young people.',
    whatsappLoading:'Loading group…',
    whatsappJoin:   'Join the group',
    whatsappMembers:(n, name) => `${name} — ${n} members`,
  },

  login: {
    pill:           'Youth space · 18–29',
    title:          'Good to see you again.',
    lead:           'Find your lessons, badges, and the WeToo community. Ask your questions with confidence, no judgment.',
    trustAnon:      'Anonymous and secure space',
    trustAnonSub:   'You can participate anonymously on the forum and chatbot.',
    trustData:      'Your data stays private',
    trustDataSub:   'We never sell your information. You stay in control.',

    cardTitle:      'Log in',
    cardSub:        'Access your personal WeToo space.',
    emailLabel:     'Email address',
    emailPH:        'you@example.bj',
    passwordLabel:  'Password',
    submit:         'Log in',
    noAccount:      'No account yet?',
    createFree:     'Create a free account',

    demoTitle:      'Demo accounts — click to fill',
    demoPassword:   (pw) => `Shared password: ${pw}`,

    toastFilled:    (name) => `${name}'s account prefilled. Click "Log in".`,
    toastWelcome:   (name) => `Welcome back, ${name}! Great to see you.`,
    toastError:     (msg) => msg || 'Login failed. Please try again.',

    validEmail:     'Enter your email address.',
    validEmailFmt:  'This email address looks invalid.',
    validPassword:  'Enter your password.',
  },

  register: {
    pill:           'Free sign-up',
    title:          'Join the WeToo community.',
    lead:           'Create your account in 1 minute to learn, earn badges, and connect confidentially.',
    ageNoteTitle:   'Why do we ask your age?',
    ageNoteBody1:   'The WeToo space is reserved for ',
    ageNoteStrong:  '18–29 year-olds',
    ageNoteBody2:   ', a requirement of the YTH Live challenge. Your age is used only to verify eligibility: it remains',
    ageNoteConf:    ' confidential',
    ageNoteBody3:   ' and is never shared publicly.',
    reassure:       'Anonymous and secure space · your data stays private.',

    cardTitle:      'Create my account',
    cardSub:        'All fields marked with * are required.',
    nameLabel:      'Full name',
    namePH:         'E.g. Awa Dossou',
    emailLabel:     'Email address',
    emailPH:        'you@example.bj',
    pwLabel:        'Password',
    pwHint:         'Minimum 6 characters. A varied password is more secure.',
    pwStrength:     (label) => `Strength: ${label}`,
    ageLabel:       'Age',
    ageHint:        'Reserved for 18–29 — confidential information.',
    agePH:          'E.g. 22',
    genderLegend:   'Gender',
    regionLabel:    'Department',
    regionDefault:  'Choose your department',
    interestsLabel: 'Interests',
    interestsHint:  'Select what interests you to personalise your content.',
    interestsAria:  'Interests',
    submit:         'Create my account',
    hasAccount:     'Already have an account?',
    signIn:         'Log in',

    strengthTooShort:'Too short',
    strengthWeak:   'Weak',
    strengthFair:   'Fair',
    strengthGood:   'Good',
    strengthStrong: 'Strong',

    genderGirl:     'Girl',
    genderBoy:      'Boy',
    genderOther:    'Other',

    toastWelcome:   'Welcome to WeToo! Your account is created. 🎉',
    toastWarning:   'Check the highlighted fields before continuing.',
    toastError:     (msg) => msg || 'Unable to create your account. Please try again.',

    validNameMin:   'Enter your full name (minimum 2 characters).',
    validEmail:     'Enter your email address.',
    validEmailFmt:  'This email address looks invalid.',
    validPwMin:     'Password must be at least 6 characters.',
    validAgeReq:    'Enter your age.',
    validAgeInt:    'Age must be a whole number.',
    validAgeRange:  'This space is for 18–29 year-olds.',
    validGender:    'Choose an option (girl, boy, or other).',
    validRegion:    'Choose your department.',
  },

  profile: {
    eyebrow:        'My space',
    title:          'My account',
    desc:           'Manage your profile, discover your badges, and personalise your experience.',
    tabProfile:     'My profile',
    tabBadges:      'My badges',
    tabSettings:    'Settings',
    tabsAria:       'Profile sections',

    memberSince:    (date) => `Member since ${date}`,
    seeLeaderboard: 'View full leaderboard',

    avatarLegend:   'Choose your avatar',
    avatarAria:     'Avatar selection',
    avatarLabel:    (emoji) => `Avatar ${emoji}`,
    nameLabel:      'Full name',
    ageLabel:       'Age',
    ageHint:        '18 to 29 years old — stays confidential.',
    genderLegend:   'Gender',
    regionLabel:    'Department',
    regionDefault:  'Not specified',
    interestsLabel: 'Interests',
    interestsAria:  'Interests',
    save:           'Save changes',

    badgesIntro:    (obtained, total) => `You have earned ${obtained} badge${obtained > 1 ? 's' : ''} out of ${total}. Complete lessons, pass quizzes, and participate to unlock the others.`,
    obtainedBadge:  'Earned',
    lockedBadge:    'To unlock',
    criteriaLabel:  'How to earn it:',

    noBadgeTitle:   'No badges available',
    loadingBadges:  'Loading your badges…',

    appearanceTitle:'Appearance',
    appearanceSub:  'Choose the theme that suits you best.',
    themeGroupAria: 'Theme selection',
    themeLight:     'Light',
    themeDark:      'Dark',

    offlineTitle:   'Offline mode',
    offlineText:    'We are working on offline access for low-connectivity areas. Today the platform requires an internet connection — no data is stored on your device.',

    logoutTitle:    'Log out',
    logoutText:     'You can log back in later: your points and badges are saved.',
    logoutBtn:      'Log out',

    loadingProfile: 'Loading your profile…',
    notAuthTitle:   'Log in to see your profile',
    notAuthDesc:    'Your level, badges, and settings are personal: create a free account to access them.',
    signInBtn:      'Log in',

    toastSaved:     'Profile updated!',
    toastWarning:   'Check the highlighted fields.',
    toastError:     (msg) => msg || 'Unable to update the profile.',

    validNameMin:   'Name must be at least 2 characters.',
    validAgeInt:    'Age must be a whole number.',
    validAgeRange:  'Age must be between 18 and 29.',

    genderGirl:     'Girl',
    genderBoy:      'Boy',
    genderOther:    'Other',

    interestOptions:[
      'Mental health', 'Contraception', 'STIs', 'Consent', 'Puberty', 'Digital well-being',
    ],

    statPoints:     'points',
    statRank:       'rank',
    statStreak:     'day streak',
    statLessons:    'lessons done',
    rankFallback:   '—',
  },

  quickActions: {
    chatTitle:      'Ask a question',
    chatText:       'The chatbot answers 24/7, anonymously.',
    learnTitle:     'Learn',
    learnText:      'Short lessons and quizzes to progress.',
    communityTitle: 'Community',
    communityText:  'The kind, moderated forum for young people.',
    expertsTitle:   'Professionals',
    expertsText:    'Midwife, psychologist, nurse — in full confidence.',
  },

  common: {
    loading:        'Loading…',
    retry:          'Retry',
    cancel:         'Cancel',
    close:          'Close',
    save:           'Save',
    send:           'Send',
    publish:        'Publish',
    join:           'Join',
    min:            'min',
  },
};
```

---

## 3 · LangContext — new file

> File to create: `src/context/LangContext.jsx`

Pattern mirrors `ThemeContext.jsx` exactly: `createContext` → `LangProvider` → `useLang` export.

```jsx
// src/context/LangContext.jsx
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { fr } from '../i18n/fr.js';
import { en } from '../i18n/en.js';

const CATALOGUES = { fr, en };
const LangContext = createContext(null);

function getInitialLang() {
  // Respect navigator language; default fr if undetermined or fr-* detected.
  if (typeof navigator === 'undefined') return 'fr';
  const navLang = navigator.language?.slice(0, 2).toLowerCase();
  return navLang === 'en' ? 'en' : 'fr';
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang);

  const toggleLang = useCallback(() => {
    setLang((l) => (l === 'fr' ? 'en' : 'fr'));
  }, []);

  /**
   * t(key) — looks up a dot-notation key like 'chat.title'.
   * Returns the value from the active catalogue; falls back to fr if missing in en.
   */
  const t = useCallback(
    (key) => {
      const parts = key.split('.');
      let node = CATALOGUES[lang];
      for (const part of parts) {
        if (node == null) break;
        node = node[part];
      }
      // Fallback to fr catalogue if key missing in current lang.
      if (node == null) {
        node = CATALOGUES.fr;
        for (const part of parts) {
          if (node == null) break;
          node = node[part];
        }
      }
      return node ?? key;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, toggleLang, t }), [lang, toggleLang, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside a LangProvider');
  return ctx;
}
```

---

## 4 · Integration of LangProvider in main.jsx

**File to modify:** `src/main.jsx`

Insert `<LangProvider>` immediately inside `<ThemeProvider>`, wrapping all children.
It must wrap `<App />` so every route-level component can call `useLang()`.

```jsx
// BEFORE (relevant excerpt):
import { ThemeProvider } from './context/ThemeContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// AFTER:
import { ThemeProvider } from './context/ThemeContext.jsx';
import { LangProvider } from './context/LangContext.jsx';   // ← add

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <LangProvider>                {/* ← wrap here */}
          <ToastProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ToastProvider>
        </LangProvider>               {/* ← close here */}
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
```

**Why inside `ThemeProvider` but outside `ToastProvider`:** `LangProvider` has no dependency on
auth or toasts, and wrapping `ToastProvider` means toast messages can also call `useLang()` in
future without changing the tree.

---

## 5 · LangToggle component — new file

> File to create: `src/components/layout/LangToggle.jsx`

Style is replicated directly from `ThemeToggle.jsx`. The toggle renders as an `IconButton` (same
`icon-btn` CSS class), labelled for accessibility. Because there are only two languages, the button
always shows the **opposite** language code as its label — exactly the same affordance ThemeToggle
uses for light/dark.

```jsx
// src/components/layout/LangToggle.jsx
import { Languages } from 'lucide-react';
import { useLang } from '../../context/LangContext.jsx';
import { IconButton } from '../ui/Button.jsx';

export function LangToggle() {
  const { lang, toggleLang, t } = useLang();
  return (
    <IconButton
      label={t('lang.switchTo')}          // "Switch to English" / "Passer en français"
      icon={Languages}
      onClick={toggleLang}
      className="lang-toggle"
      aria-label={t('lang.ariaLabel')}
    />
  );
}
```

> **Icon choice:** `Languages` from lucide-react (already installed) — a globe+letters glyph that
> unambiguously signals language switching without adding a new dependency.

---

## 6 · Integration of LangToggle in SiteHeader.jsx

**File to modify:** `src/components/layout/SiteHeader.jsx`

Two changes only:
1. Import `LangToggle` from `./LangToggle.jsx`.
2. Place `<LangToggle />` immediately after `<ThemeToggle />` inside `site-header__actions`.

```jsx
// BEFORE (relevant excerpt in SiteHeader.jsx):
import { ThemeToggle } from './ThemeToggle.jsx';
// ...
<div className="site-header__actions">
  <ThemeToggle />
  {/* ... auth buttons ... */}
</div>

// AFTER:
import { ThemeToggle } from './ThemeToggle.jsx';
import { LangToggle } from './LangToggle.jsx';   // ← add
// ...
<div className="site-header__actions">
  <ThemeToggle />
  <LangToggle />                                  // ← add, right after ThemeToggle
  {/* ... auth buttons ... */}
</div>
```

**Why right after ThemeToggle:** these are both "global preference" toggles. Grouping them together
at the leftmost position of the actions strip follows the existing mental model users already have
for the ThemeToggle.

---

## 7 · ThemeToggle style to replicate for LangToggle

The `ThemeToggle` renders an `IconButton` with `className="theme-toggle"`. No bespoke CSS is
defined for `.theme-toggle` in `components.css` — it inherits `.icon-btn` fully:

```css
/* From components.css — already defined, NO changes needed: */
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex: none;
  border-radius: var(--radius-pill);
  color: var(--text-muted);
  border: 1.5px solid transparent;
  transition: background-color var(--duration-base) var(--ease-out),
    color var(--duration-base) var(--ease-out),
    border-color var(--duration-base) var(--ease-out);
}
.icon-btn:hover {
  background: var(--primary-soft);
  color: var(--primary-soft-text);
}
```

`LangToggle` uses `className="lang-toggle"` which also inherits `.icon-btn` unchanged.
**No new CSS is required.** If the implementer wants a subtle text badge showing the current
language code (e.g. "FR"), they can add:

```css
/* Optional — add to components.css only if the text badge is desired: */
.lang-toggle {
  position: relative;
  font-size: var(--text-2xs);
  font-weight: var(--weight-bold);
  letter-spacing: 0.04em;
  gap: 2px;
}
```

But the base `IconButton` alone is sufficient and consistent with `ThemeToggle`.

---

## 8 · Replacing hardcoded strings — file-by-file instructions

For each file below:
1. Add `import { useLang } from '../../context/LangContext.jsx';` (adjust relative path).
2. Inside the component: `const { t } = useLang();`
3. Replace each hardcoded string with the corresponding `t('section.key')` call.

For **data-constant arrays** defined at module level (e.g. `PILLARS`, `PROBLEMS` in `Landing.jsx`,
`APP_NAV` in `nav.js`, `QUICK_ACTIONS` in `Home.jsx`), move the array **inside the component** so
`t()` is in scope, or convert to a function that receives `t` as argument.

### Files to update

| File | `useLang` import path | Keys namespace |
|---|---|---|
| `components/layout/nav.js` → convert to a function `getNav(t)` | `../../context/LangContext.jsx` | `nav.*` |
| `components/layout/SiteHeader.jsx` | `../../context/LangContext.jsx` | `header.*`, `nav.*` |
| `components/layout/AppLayout.jsx` | `../../context/LangContext.jsx` | `layout.*` |
| `pages/Landing.jsx` | `../context/LangContext.jsx` | `landing.*` |
| `pages/Home.jsx` | `../context/LangContext.jsx` | `home.*`, `quickActions.*` |
| `pages/Chat.jsx` | `../context/LangContext.jsx` | `chat.*` |
| `pages/Learn.jsx` | `../context/LangContext.jsx` | `learn.*` |
| `pages/Community.jsx` | `../context/LangContext.jsx` | `community.*` |
| `pages/Experts.jsx` | `../context/LangContext.jsx` | `experts.*` |
| `pages/Campaigns.jsx` | `../context/LangContext.jsx` | `campaigns.*` |
| `pages/Login.jsx` | `../context/LangContext.jsx` | `login.*` |
| `pages/Register.jsx` | `../context/LangContext.jsx` | `register.*` |
| `pages/Profile.jsx` | `../context/LangContext.jsx` | `profile.*` |

### Special case: `nav.js`

`nav.js` is a plain JS module, not a component. Convert it so callers pass `t`:

```js
// nav.js — AFTER refactor
export function getAppNav(t) {
  return [
    { to: '/app',            label: t('nav.home'),        short: t('nav.home'),         icon: Home,        end: true },
    { to: '/app/chat',       label: t('nav.askQuestion'), short: t('nav.chat'),          icon: MessageCircle },
    { to: '/app/apprendre',  label: t('nav.learn'),       short: t('nav.learn'),         icon: GraduationCap },
    { to: '/app/communaute', label: t('nav.community'),   short: t('nav.community'),     icon: Users },
    { to: '/app/campagnes',  label: t('nav.campaigns'),   short: t('nav.campaigns'),     icon: Megaphone },
    { to: '/app/expertes',   label: t('nav.experts'),     short: t('nav.expertsShort'),  icon: Stethoscope },
    { to: '/app/mythes',     label: t('nav.myths'),       short: t('nav.mythsShort'),    icon: Sparkles },
    { to: '/app/ressources', label: t('nav.help'),        short: t('nav.helpShort'),     icon: LifeBuoy },
  ];
}

export function getBottomNav(t) {
  return [
    { to: '/app',            label: t('nav.home'),      icon: Home,         end: true },
    { to: '/app/apprendre',  label: t('nav.learn'),     icon: GraduationCap },
    { to: '/app/chat',       label: t('nav.chat'),      icon: MessageCircle },
    { to: '/app/communaute', label: t('nav.forum'),     icon: Users },
    { to: '/app/profil',     label: t('nav.profile'),   icon: User,         end: true },
  ];
}

export function getMarketingNav(t) {
  return [
    { href: '#probleme', label: t('nav.marketing.problem') },
    { href: '#solution', label: t('nav.marketing.solution') },
    { href: '#piliers',  label: t('nav.marketing.pillars') },
    { href: '#impact',   label: t('nav.marketing.impact') },
  ];
}
```

Update `SiteHeader.jsx` and `BottomNav.jsx` to call `getAppNav(t)` / `getBottomNav(t)` /
`getMarketingNav(t)` after obtaining `t` from `useLang()`.

---

## 9 · File listing summary

| Action | Path |
|---|---|
| **Create** | `src/i18n/fr.js` |
| **Create** | `src/i18n/en.js` |
| **Create** | `src/context/LangContext.jsx` |
| **Create** | `src/components/layout/LangToggle.jsx` |
| **Modify** | `src/main.jsx` — wrap with `<LangProvider>` |
| **Modify** | `src/components/layout/SiteHeader.jsx` — import + render `<LangToggle />` |
| **Modify** | `src/components/layout/nav.js` — convert to `getAppNav(t)` / `getBottomNav(t)` / `getMarketingNav(t)` |
| **Modify** | `src/components/layout/BottomNav.jsx` — consume `getBottomNav(t)` |
| **Modify** | `src/components/layout/AppLayout.jsx` — `t('layout.skipToContent')` |
| **Modify** | `src/pages/Landing.jsx` — all hardcoded strings → `t('landing.*')` |
| **Modify** | `src/pages/Home.jsx` — all hardcoded strings → `t('home.*')`, `t('quickActions.*')` |
| **Modify** | `src/pages/Chat.jsx` — all hardcoded strings → `t('chat.*')` |
| **Modify** | `src/pages/Learn.jsx` — all hardcoded strings → `t('learn.*')` |
| **Modify** | `src/pages/Community.jsx` — all hardcoded strings → `t('community.*')` |
| **Modify** | `src/pages/Experts.jsx` — all hardcoded strings → `t('experts.*')` |
| **Modify** | `src/pages/Campaigns.jsx` — all hardcoded strings → `t('campaigns.*')` |
| **Modify** | `src/pages/Login.jsx` — all hardcoded strings → `t('login.*')` |
| **Modify** | `src/pages/Register.jsx` — all hardcoded strings → `t('register.*')` |
| **Modify** | `src/pages/Profile.jsx` — all hardcoded strings → `t('profile.*')` |
| **Optional** | `src/styles/components.css` — add `.lang-toggle` rule if text badge desired |

---

## 10 · Verification

The project uses **Vite**. No test runner was detected in the repo, so the verification step is a
clean build:

```bash
# from wetoo/frontend/
npm run build
# Expected: no TypeScript / ESLint errors; dist/ produced
```

Visual check:
1. Load the app — default language is French (matches `navigator.language`).
2. Click `LangToggle` in the header — all visible strings switch to English.
3. Click again — switches back to French.
4. `ThemeToggle` and `LangToggle` sit side-by-side in the header actions strip.
5. Cadratin characters (`—`) in translated strings render correctly in both languages.
