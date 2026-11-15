// Données de départ (seed) de WeToo — entièrement en français.
// Ce fichier génère l'état initial écrit dans data/db.json au premier lancement.
// Aucun contenu médical dangereux : on renvoie toujours vers un professionnel.
import bcrypt from 'bcryptjs';

// --- Petits assistants locaux pour alléger la rédaction ---------------------

/** Construit une section de cours. */
const sec = (heading, body, keyPoints, imagePrompt) => ({
  heading,
  body,
  keyPoints,
  imagePrompt,
});

/** Construit une question de quiz (les bonnes réponses sont des index 1-based). */
const q = (qid, question, opts, correctIdx, explanation, multi = false) => ({
  id: qid,
  question,
  options: opts.map((text, i) => ({ id: `${qid}-o${i + 1}`, text })),
  correctOptionIds: correctIdx.map((n) => `${qid}-o${n}`),
  multi: multi || correctIdx.length > 1,
  explanation,
});

/** Date ISO à J-n (pour des données réalistes). */
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

/**
 * Génère l'objet de données initial.
 */
export function createSeed() {
  // Mot de passe de démonstration commun à tous les comptes de test.
  const demoHash = bcrypt.hashSync('wetoo123', 10);

  // --- Utilisateurs de démonstration ---------------------------------------
  const users = [
    {
      id: 'u-awa',
      name: 'Awa',
      email: 'awa@wetoo.bj',
      passwordHash: demoHash,
      age: 20,
      gender: 'fille',
      region: 'Littoral',
      avatar: '🌸',
      interests: ['santé mentale', 'contraception', 'relations'],
      points: 320,
      badges: ['b-first', 'b-curieux', 'b-mythes', 'b-soutien'],
      completedLessons: ['l-puberte-filles', 'l-contraception-bases', 'l-consentement', 'l-stress'],
      streak: 6,
      createdAt: daysAgo(40),
    },
    {
      id: 'u-rodrigue',
      name: 'Rodrigue',
      email: 'rodrigue@wetoo.bj',
      passwordHash: demoHash,
      age: 23,
      gender: 'garçon',
      region: 'Atlantique',
      avatar: '⚽',
      interests: ['IST', 'dépistage', 'sport'],
      points: 180,
      badges: ['b-first', 'b-curieux', 'b-sante'],
      completedLessons: ['l-ist', 'l-depistage-vih', 'l-puberte-garcons'],
      streak: 3,
      createdAt: daysAgo(28),
    },
    {
      id: 'u-grace',
      name: 'Grâce',
      email: 'grace@wetoo.bj',
      passwordHash: demoHash,
      age: 19,
      gender: 'fille',
      region: 'Ouémé',
      avatar: '📚',
      interests: ['règles', 'estime de soi', 'bien-être'],
      points: 95,
      badges: ['b-first', 'b-regulier'],
      completedLessons: ['l-regles', 'l-estime'],
      streak: 8,
      createdAt: daysAgo(18),
    },
    {
      id: 'u-sessi',
      name: 'Sessi',
      email: 'sessi@wetoo.bj',
      passwordHash: demoHash,
      age: 25,
      gender: 'autre',
      region: 'Zou',
      avatar: '🎨',
      interests: ['orientation', 'identité', 'communauté'],
      points: 460,
      badges: ['b-first', 'b-curieux', 'b-allie', 'b-sans-tabou', 'b-expert'],
      completedLessons: ['l-relations-saines', 'l-consentement', 'l-ist', 'l-depression', 'l-estime'],
      streak: 4,
      createdAt: daysAgo(55),
    },
  ];

  // --- Catégories du forum --------------------------------------------------
  const categories = [
    {
      id: 'questions',
      label: 'Questions & réponses',
      description: 'Pose toutes tes questions, il n’y a pas de question bête.',
      emoji: '❓',
      color: '#2563EB',
    },
    {
      id: 'sante-mentale',
      label: 'Santé mentale',
      description: 'Parler de ses émotions, du stress, de l’anxiété, se sentir moins seul·e.',
      emoji: '🧠',
      color: '#7C3AED',
    },
    {
      id: 'relations',
      label: 'Relations & consentement',
      description: 'Amour, amitié, respect, consentement et limites.',
      emoji: '💬',
      color: '#EC4899',
    },
    {
      id: 'grossesse',
      label: 'Grossesse & contraception',
      description: 'Contraception, grossesse, tout ce qu’il faut savoir sans tabou.',
      emoji: '🤰',
      color: '#F59E0B',
    },
    {
      id: 'ist',
      label: 'IST & dépistage',
      description: 'Infections sexuellement transmissibles, dépistage et traitement.',
      emoji: '🩺',
      color: '#10B981',
    },
    {
      id: 'confidences',
      label: 'Confidences (anonyme)',
      description: 'Un espace 100% anonyme pour te confier en toute sécurité.',
      emoji: '🤫',
      color: '#64748B',
    },
  ];

  // --- Experts --------------------------------------------------------------
  const experts = [
    {
      id: 'e-chantal',
      name: 'Chantal Adjovi',
      role: 'Sage-femme',
      specialty: 'Grossesse, contraception et santé de la femme',
      bio: "Sage-femme depuis 12 ans au Bénin, j'accompagne les jeunes sur la contraception, la grossesse et l'hygiène menstruelle avec bienveillance et sans jugement.",
      languages: ['français', 'fon', 'yoruba'],
      availability: 'Lun–Ven 9h–17h',
      avatar: '👩‍⚕️',
      rating: 4.9,
      sessionsDone: 214,
    },
    {
      id: 'e-nadege',
      name: 'Dr. Nadège Houngbédji',
      role: 'Psychologue',
      specialty: 'Anxiété, dépression, stress, estime de soi',
      bio: "Psychologue clinicienne, je reçois les jeunes qui traversent des moments difficiles. Parler, c'est déjà un premier pas vers le mieux-être.",
      languages: ['français', 'fon'],
      availability: 'Lun–Sam 10h–19h',
      avatar: '🧑‍⚕️',
      rating: 4.8,
      sessionsDone: 176,
    },
    {
      id: 'e-senan',
      name: 'Sènan Agbo',
      role: 'Infirmier',
      specialty: 'IST, dépistage VIH, éducation à la santé',
      bio: "Infirmier communautaire, je fais la promotion du dépistage et de la prévention des IST. Confidentiel, gratuit dans de nombreux centres, et sans jugement.",
      languages: ['français', 'fon', 'bariba'],
      availability: 'Mar–Sam 8h–16h',
      avatar: '🧑‍⚕️',
      rating: 4.7,
      sessionsDone: 143,
    },
    {
      id: 'e-kossi',
      name: 'Dr. Kossi Dossou',
      role: 'Médecin généraliste',
      specialty: 'Santé des adolescents et jeunes adultes',
      bio: "Médecin généraliste, j'aborde la santé sexuelle et le bien-être global des jeunes : sommeil, hygiène de vie, prévention.",
      languages: ['français', 'yoruba', 'fon'],
      availability: 'Lun–Ven 8h–15h',
      avatar: '👨‍⚕️',
      rating: 4.6,
      sessionsDone: 98,
    },
  ];

  // --- Cours (14 leçons) ----------------------------------------------------
  const lectures = [
    {
      id: 'l-puberte-filles',
      title: 'La puberté chez les filles',
      category: 'Corps & puberté',
      level: 'débutant',
      durationMin: 8,
      points: 30,
      emoji: '🌷',
      cover: '/assets/covers/puberte-filles.svg',
      summary: 'Comprendre les changements du corps à l’adolescence chez les filles.',
      tags: ['puberté', 'corps', 'adolescence'],
      sections: [
        sec(
          'Ce qui change dans ton corps',
          "La puberté est la période où ton corps se transforme pour devenir celui d'une adulte. Chez les filles, elle commence souvent entre 9 et 14 ans. Les seins commencent à se développer, des poils apparaissent, et les premières règles surviennent. Chaque corps a son propre rythme : il n'y a pas de « bon » moment pour commencer.",
          ['La puberté commence généralement entre 9 et 14 ans.', 'Le rythme est différent pour chaque personne.', 'Ces changements sont normaux et sains.'],
          'Une adolescente souriante devant un miroir, ambiance douce et lumineuse.'
        ),
        sec(
          'Les émotions aussi changent',
          "Pendant la puberté, les hormones peuvent rendre les émotions plus fortes : tu peux te sentir joyeuse puis triste sans raison claire. C'est normal. Prendre soin de son sommeil, bouger, et parler à une personne de confiance aide beaucoup à se sentir mieux.",
          ['Les émotions intenses sont courantes.', 'Dormir et bouger aident à se sentir mieux.', 'En parler fait du bien.'],
          'Illustration d’un cerveau et d’un cœur reliés par des couleurs douces.'
        ),
        sec(
          'Quand demander de l’aide',
          "Si tes règles ne viennent pas du tout à 16 ans, si tu as très mal, ou si ces changements t'inquiètent, parles-en à une sage-femme ou à un médecin. Consulter n'est pas une honte : c'est prendre soin de soi.",
          ['Une absence de règles à 16 ans mérite un avis médical.', 'Une douleur très forte n’est pas normale.', 'Consulter est un signe de maturité.'],
          'Une jeune fille en consultation bienveillante avec une sage-femme.'
        ),
      ],
      sources: [
        { title: 'OMS — Santé de l’adolescent', label: 'Organisation mondiale de la Santé', url: 'https://www.who.int/fr/health-topics/adolescent-health' },
      ],
    },
    {
      id: 'l-puberte-garcons',
      title: 'La puberté chez les garçons',
      category: 'Corps & puberté',
      level: 'débutant',
      durationMin: 8,
      points: 30,
      emoji: '🌱',
      cover: '/assets/covers/puberte-garcons.svg',
      summary: 'Comprendre les changements du corps à l’adolescence chez les garçons.',
      tags: ['puberté', 'corps', 'adolescence'],
      sections: [
        sec(
          'Des changements progressifs',
          "Chez les garçons, la puberté débute souvent entre 10 et 15 ans. La voix mue, des poils apparaissent, le corps grandit vite et les épaules s'élargissent. Il est aussi normal d'avoir des érections spontanées ou des émissions nocturnes : cela ne signifie pas qu'il y a un problème.",
          ['La puberté commence généralement entre 10 et 15 ans.', 'Érections et émissions nocturnes sont normales.', 'Chaque corps avance à son rythme.'],
          'Un adolescent en pleine croissance, ambiance dynamique.'
        ),
        sec(
          'Prendre soin de son corps',
          "Avec la puberté, la transpiration et les odeurs deviennent plus marquées. Se laver chaque jour, surtout après le sport, porter des vêtements propres et utiliser un déodorant simple garde une bonne hygiène.",
          ['Se laver quotidiennement limite les odeurs.', 'L’hygiène après le sport est importante.', 'Un déodorant simple suffit.'],
          'Illustration de soins d’hygiène simples au quotidien.'
        ),
        sec(
          'Le mental compte aussi',
          "La pression de « devenir un homme » peut peser. En réalité, être un homme, c'est aussi savoir écouter, demander de l'aide et respecter les autres. Si quelque chose te pèse, en parler à un adulte de confiance est une force, pas une faiblesse.",
          ['Les attentes de la société peuvent peser.', 'Demander de l’aide est une force.', 'Le respect est au cœur des relations.'],
          'Deux jeunes garçons discutant calmement.'
        ),
      ],
      sources: [{ title: 'OMS — Santé de l’adolescent', label: 'OMS', url: 'https://www.who.int/fr/health-topics/adolescent-health' }],
    },
    {
      id: 'l-regles',
      title: 'Les règles et l’hygiène menstruelle',
      category: 'Règles & hygiène',
      level: 'débutant',
      durationMin: 9,
      points: 35,
      emoji: '🩸',
      cover: '/assets/covers/regles.svg',
      summary: 'Tout comprendre sur les règles et une bonne hygiène menstruelle.',
      tags: ['règles', 'menstrues', 'hygiène'],
      sections: [
        sec(
          'Le cycle menstruel en bref',
          "Les règles surviennent environ une fois par mois et durent de 3 à 7 jours. Le cycle est souvent irrégulier dans les premières années : c'est fréquent et normal. Un cycle courant dure entre 21 et 35 jours.",
          ['Les règles durent en moyenne 3 à 7 jours.', 'Un cycle dure entre 21 et 35 jours.', 'L’irrégularité est fréquente les premières années.'],
          'Calendrier illustrant un cycle menstruel simple.'
        ),
        sec(
          'Une bonne hygiène menstruelle',
          "Change de protection régulièrement (toutes les 4 à 6 heures), lave-toi à l'eau propre, et lave ou jette correctement tes protections. Les serviettes lavables et les coupes menstruelles sont économiques et écologiques si elles sont bien entretenues.",
          ['Change de protection toutes les 4 à 6 heures.', 'Nettoie-toi à l’eau propre.', 'Les protections lavables sont une option durable.'],
          'Illustration de différents types de protections hygiéniques.'
        ),
        sec(
          'Gérer les douleurs',
          "Des douleurs légères sont courantes. Une bouillotte, du repos et une activité douce peuvent aider. Si la douleur t'empêche d'aller à l'école chaque mois, parles-en à un professionnel de santé.",
          ['La chaleur et le repos soulagent.', 'Une douleur invalidante doit être évaluée.', 'Les règles ne doivent pas gâcher ta vie.'],
          'Deux mains tenant une bouillotte chaude.'
        ),
      ],
      sources: [{ title: 'UNICEF — Hygiène menstruelle', label: 'UNICEF', url: 'https://www.unicef.org/fr/wash/menstrual-hygiene' }],
    },
    {
      id: 'l-contraception-bases',
      title: 'La contraception : les bases',
      category: 'Contraception',
      level: 'débutant',
      durationMin: 10,
      points: 40,
      emoji: '💊',
      cover: '/assets/covers/contraception.svg',
      summary: 'Découvrir les principales méthodes de contraception et leur efficacité.',
      tags: ['contraception', 'prévention', 'grossesse'],
      sections: [
        sec(
          'À quoi sert la contraception',
          "La contraception sert à éviter une grossesse non désirée. Certaines méthodes protègent aussi des IST (le préservatif), d'autres non. Le choix appartient à chacun·e et peut évoluer avec le temps : parles-en à une sage-femme pour trouver ce qui te convient.",
          ['La contraception évite une grossesse non désirée.', 'Seul le préservatif protège des IST.', 'Le meilleur choix est celui qui te convient.'],
          'Plusieurs méthodes contraceptives illustrées simplement.'
        ),
        sec(
          'Les grandes familles de méthodes',
          "Il existe le préservatif, la pilule, l'implant, l'injectable, le dispositif intra-utérin (stérilet), et la pilule du lendemain en cas d'urgence. L'efficacité varie : les méthodes « longue durée » comme l'implant sont parmi les plus fiables.",
          ['Le préservatif protège grossesse ET IST.', 'Implant et stérilet sont très efficaces.', 'La pilule du lendemain est une urgence, pas un plan régulier.'],
          'Schéma clair des méthodes contraceptives.'
        ),
        sec(
          'Où en obtenir au Bénin',
          "La plupart des méthodes sont disponibles gratuitement ou à faible coût dans les centres de santé, les centres de planification familiale et auprès des sages-femmes. Le personnel est tenu à la confidentialité.",
          ['Disponibles en centres de santé et planning familial.', 'Souvent gratuites ou peu coûteuses.', 'La confidentialité est garantie.'],
          'Entrée d’un centre de santé communautaire au Bénin.'
        ),
      ],
      sources: [{ title: 'OMS — Planification familiale', label: 'OMS', url: 'https://www.who.int/fr/news-room/fact-sheets/detail/family-planning-contraception' }],
    },
    {
      id: 'l-preservatif',
      title: 'Le préservatif : mode d’emploi',
      category: 'Contraception',
      level: 'débutant',
      durationMin: 8,
      points: 40,
      emoji: '🛡️',
      cover: '/assets/covers/preservatif.svg',
      summary: 'Utiliser correctement le préservatif, la seule méthode qui protège des IST.',
      tags: ['préservatif', 'IST', 'prévention'],
      sections: [
        sec(
          'Pourquoi il est essentiel',
          "Le préservatif est la seule méthode qui protège à la fois d'une grossesse non désirée et des IST, y compris le VIH. Bien utilisé, il est très efficace. Il est disponible gratuitement dans de nombreux centres au Bénin.",
          ['Protège à la fois des IST et de la grossesse.', 'Bien utilisé, il est très efficace.', 'Gratuit dans de nombreux centres.'],
          'Préservatif présenté de manière pédagogique et neutre.'
        ),
        sec(
          'Comment bien l’utiliser',
          "Ouvre l'emballage avec les doigts, jamais avec les dents. Mets-le avant tout contact, en pinçant le bout pour chasser l'air. Roule-le jusqu'à la base. Après usage, retire-le en tenant la base et jette-le à la poubelle. Utilise un nouveau préservatif à chaque rapport.",
          ['Ne jamais l’ouvrir avec les dents.', 'Chasser l’air en pinçant le bout.', 'Un préservatif par rapport, à chaque fois.'],
          'Étapes simples d’utilisation du préservatif.'
        ),
        sec(
          'Les erreurs fréquentes',
          "Utiliser de l'huile (comme l'huile de palme) avec un préservatif en latex le fragilise. Ne jamais réutiliser un préservatif. Si le préservatif craque, parle rapidement à un professionnel : la contraception d'urgence et le dépistage existent.",
          ['L’huile fragilise le latex.', 'On ne réutilise jamais un préservatif.', 'En cas de rupture, consulte rapidement.'],
          'Illustration d’un préservatif et d’une bouteille d’huile barrée.'
        ),
      ],
      sources: [{ title: 'OMS — Préservatifs', label: 'OMS', url: 'https://www.who.int/fr/news-room/fact-sheets/detail/family-planning-contraception' }],
    },
    {
      id: 'l-ist',
      title: 'IST : comprendre et se protéger',
      category: 'IST & dépistage',
      level: 'intermédiaire',
      durationMin: 10,
      points: 45,
      emoji: '🦠',
      cover: '/assets/covers/ist.svg',
      summary: 'Reconnaître les IST, savoir comment s’en protéger et où se faire soigner.',
      tags: ['IST', 'VIH', 'prévention', 'dépistage'],
      sections: [
        sec(
          'Qu’est-ce qu’une IST ?',
          "Les infections sexuellement transmissibles (IST) se transmettent lors de rapports sexuels non protégés. Les plus courantes sont le VIH, la chlamydia, la gonorrhée, la syphilis et l'herpès. Beaucoup ne montrent aucun symptôme, d'où l'importance du dépistage.",
          ['Elles se transmettent sans protection.', 'Beaucoup sont silencieuses (sans symptômes).', 'Le dépistage est la clé.'],
          'Illustration pédagogique des principales IST.'
        ),
        sec(
          'Comment s’en protéger',
          "Le préservatif, utilisé correctement à chaque rapport, réduit fortement le risque. Se faire dépister régulièrement, et en parler à son/sa partenaire, fait partie d'une sexualité responsable et respectueuse.",
          ['Le préservatif est la protection principale.', 'Le dépistage régulier protège tout le monde.', 'En parler avec son ou sa partenaire est essentiel.'],
          'Deux jeunes discutant de prévention sereinement.'
        ),
        sec(
          'Se soigner, sans honte',
          "La plupart des IST se soignent très bien, surtout détectées tôt. Le dépistage et le traitement sont confidentiels. Ne jamais se soigner seul·e avec des restes de médicaments : cela peut aggraver l'infection.",
          ['La plupart des IST se soignent.', 'Un traitement précoce évite les complications.', 'Ne jamais s’automédiquer.'],
          'Boîte de dépistage et personnel de santé bienveillant.'
        ),
      ],
      sources: [{ title: 'OMS — Infections sexuellement transmissibles', label: 'OMS', url: 'https://www.who.int/fr/news-room/fact-sheets/detail/sexually-transmitted-infections-(stis)' }],
    },
    {
      id: 'l-depistage-vih',
      title: 'Le dépistage du VIH',
      category: 'IST & dépistage',
      level: 'intermédiaire',
      durationMin: 8,
      points: 45,
      emoji: '🧪',
      cover: '/assets/covers/depistage.svg',
      summary: 'Pourquoi, comment et où se faire dépister du VIH en toute confidentialité.',
      tags: ['VIH', 'dépistage', 'santé'],
      sections: [
        sec(
          'Pourquoi se faire dépister',
          "Le dépistage du VIH est rapide, gratuit dans de nombreux centres et confidentiel. Connaître son statut permet, si nécessaire, de commencer un traitement tôt et de vivre en bonne santé. Aujourd'hui, une personne séropositive bien suivie peut vivre une vie longue et épanouie.",
          ['Rapide, souvent gratuit et confidentiel.', 'Un traitement précoce change tout.', 'On peut vivre normalement avec le VIH.'],
          'Trousse de dépistage rapide présentée simplement.'
        ),
        sec(
          'Le test de dépistage',
          "Le dépistage se fait souvent par un test rapide à partir d'une goutte de sang ou de salive, avec un résultat en quelques minutes. Un test peut nécessiter une confirmation. Il est proposé avec un accompagnement et un conseil avant et après.",
          ['Test rapide, résultat en quelques minutes.', 'Une confirmation peut être nécessaire.', 'Accompagnement et conseil sont proposés.'],
          'Professionnel de santé réalisant un test rapide.'
        ),
        sec(
          'Confidentialité et droits',
          "Le dépistage est confidentiel. Personne ne peut te forcer à révéler ton statut. Si tu es séropositif·ve, tu as droit aux soins, à la confidentialité et au respect. Parler avec un expert WeToo peut t'aider à franchir le pas.",
          ['Le dépistage est confidentiel.', 'Personne ne peut divulguer ton statut.', 'Tu as droit au respect et aux soins.'],
          'Symbole de confidentialité et de protection.'
        ),
      ],
      sources: [{ title: 'ONUSIDA — Dépistage du VIH', label: 'ONUSIDA', url: 'https://www.unaids.org/fr' }],
    },
    {
      id: 'l-consentement',
      title: 'Consentement : dire oui, dire non',
      category: 'Relations & consentement',
      level: 'débutant',
      durationMin: 8,
      points: 40,
      emoji: '🤝',
      cover: '/assets/covers/consentement.svg',
      summary: 'Comprendre le consentement, une base essentielle de toute relation.',
      tags: ['consentement', 'relations', 'respect'],
      sections: [
        sec(
          'Le consentement, c’est quoi ?',
          "Le consentement, c'est un accord libre, clair et enthousiaste. Il doit être donné à chaque fois, pour chaque acte, et peut être retiré à tout moment. Le silence ou l'absence de « non » n'est jamais un « oui ».",
          ['Libre, clair et enthousiaste.', 'Donné à chaque fois et réversible.', 'Le silence n’est pas un oui.'],
          'Deux personnes se parlant avec respect et sourire.'
        ),
        sec(
          'Ce qui n’est jamais un consentement',
          "La pression, la menace, l'alcool qui empêche de raisonner, l'âge (une personne mineure ne peut consentir), la peur : aucun de ces éléments ne permet un vrai consentement. Forcer quelqu'un est un acte grave, puni par la loi.",
          ['La pression et la menace annulent le consentement.', 'Une personne ivre ne peut consentir.', 'Forcer est interdit par la loi.'],
          'Panneau « respect » et main tendue.'
        ),
        sec(
          'Comment le demander',
          "Demander, c'est simple : « Est-ce que tu veux ? Ça te va ? ». Écouter la réponse, y compris un hésitation, est essentiel. Respecter un « non » renforce la confiance et la relation.",
          ['Demander directement et simplement.', 'Écouter attentivement la réponse.', 'Respecter un non renforce la relation.'],
          'Illustration d’un dialogue respectueux.'
        ),
      ],
      sources: [{ title: 'UNFPA — Consentement et droits', label: 'UNFPA', url: 'https://www.unfpa.org/fr' }],
    },
    {
      id: 'l-relations-saines',
      title: 'Relations saines et respectueuses',
      category: 'Relations & consentement',
      level: 'débutant',
      durationMin: 9,
      points: 40,
      emoji: '💞',
      cover: '/assets/covers/relations-saines.svg',
      summary: 'Reconnaître les signes d’une relation saine et ceux d’une relation toxique.',
      tags: ['relations', 'amour', 'respect'],
      sections: [
        sec(
          'Les signes d’une relation saine',
          "Dans une relation saine, on se sent respecté·e, écouté·e et libre. On peut dire non, avoir ses ami·e·s, et se sentir soutenu·e. La jalousie excessive, le contrôle et les humiliations n'ont pas leur place dans l'amour.",
          ['Respect, écoute et liberté.', 'On peut dire non sans peur.', 'Le contrôle n’est pas de l’amour.'],
          'Un couple jeune, serein et souriant.'
        ),
        sec(
          'Repérer les signaux d’alerte',
          "Si ton/ta partenaire te rabaisse, t'isole de tes proches, t'oblige à des choses, fouille ton téléphone ou te menace, ce sont des signaux d'alerte. Ce n'est pas de ta faute, et de l'aide existe.",
          ['Rabaisser, isoler et menacer sont des alertes.', 'Ce n’est jamais ta faute.', 'De l’aide est disponible.'],
          'Main tendue et signaux de prudence.'
        ),
        sec(
          'Comment réagir',
          "Parle à une personne de confiance ou à un expert WeToo. Tu peux mettre des limites claires, et si tu te sens en danger, contacte les autorités ou une ligne d'écoute. Ta sécurité passe toujours en premier.",
          ['Parle à quelqu’un de confiance.', 'Poser des limites est légitime.', 'En cas de danger, contacte de l’aide.'],
          'Téléphone et numéro d’écoute.'
        ),
      ],
      sources: [{ title: 'OMS — Violence à l’égard des femmes', label: 'OMS', url: 'https://www.who.int/fr/news-room/fact-sheets/detail/violence-against-women' }],
    },
    {
      id: 'l-grossesse',
      title: 'Grossesse non désirée : que faire ?',
      category: 'Grossesse & contraception',
      level: 'intermédiaire',
      durationMin: 10,
      points: 45,
      emoji: '🤰',
      cover: '/assets/covers/grossesse.svg',
      summary: 'Les options et les démarches en cas de grossesse non désirée.',
      tags: ['grossesse', 'contraception', 'aide'],
      sections: [
        sec(
          'D’abord, respirer et s’informer',
          "Une grossesse non désirée peut faire peur. La première étape est de confirmer la grossesse (test ou centre de santé) et de s'informer calmement sur ses options, sans se précipiter et sans se juger.",
          ['Confirmer la grossesse d’abord.', 'S’informer avant de décider.', 'Le jugement n’a pas sa place.'],
          'Personne assise, réfléchissant calmement.'
        ),
        sec(
          'Les options possibles',
          "Plusieurs chemins existent : poursuivre la grossesse, la confier à l'adoption, ou, si légalement encadré, l'interrompre dans un cadre médical sûr. Au Bénin, l'interruption de grossesse est strictement encadrée par la loi de 2021. Il faut toujours passer par un professionnel de santé : les méthodes non médicales sont dangereuses.",
          ['Plusieurs options existent.', 'La loi béninoise encadre strictement l’IVG.', 'Jamais de méthode non médicale.'],
          'Professionnel de santé expliquant les options.'
        ),
        sec(
          'Se faire accompagner',
          "Une sage-femme, un médecin ou un expert WeToo peut t'expliquer chaque option, tes droits et te mettre en lien avec les services adaptés. Tu n'es pas seul·e, et personne n'a le droit de te contraindre.",
          ['Un professionnel peut t’accompagner.', 'Tu as droit à un choix libre.', 'Personne ne peut te contraindre.'],
          'Accompagnement bienveillant en centre de santé.'
        ),
      ],
      sources: [
        { title: 'OMS — Santé et droits sexuels et reproductifs', label: 'OMS', url: 'https://www.who.int/fr/health-topics/sexual-and-reproductive-health' },
      ],
    },
    {
      id: 'l-stress',
      title: 'Gérer le stress et l’anxiété',
      category: 'Santé mentale',
      level: 'débutant',
      durationMin: 9,
      points: 40,
      emoji: '🧘',
      cover: '/assets/covers/stress.svg',
      summary: 'Des techniques simples pour apaiser le stress et l’anxiété du quotidien.',
      tags: ['stress', 'anxiété', 'bien-être'],
      sections: [
        sec(
          'Comprendre le stress',
          "Le stress est une réaction normale face à une pression. Il devient un problème quand il dure et t'épuise. Le reconnaître est la première étape pour le gérer : mains moites, cœur rapide, pensées qui tournent en boucle.",
          ['Le stress est normal, mais pas quand il dure.', 'Des signes corporels l’annoncent.', 'Le reconnaître aide à le gérer.'],
          'Illustration calme de respiration guidée.'
        ),
        sec(
          'Des techniques qui aident',
          "Respirer lentement (inspirer 4 secondes, expirer 6), bouger, dormir suffisamment, limiter les écrans le soir, parler à quelqu'un. Ces gestes simples réduisent réellement le stress au quotidien.",
          ['La respiration lente apaise.', 'Le sport et le sommeil aident.', 'Parler fait baisser la pression.'],
          'Jeune personne respirant profondément.'
        ),
        sec(
          'Quand consulter',
          "Si l'anxiété t'empêche d'étudier, de dormir ou de sortir pendant plusieurs semaines, parles-en à un psychologue. C'est un soin, pas une faiblesse.",
          ['Une anxiété persistante se soigne.', 'Un psychologue peut aider.', 'Demander de l’aide est courageux.'],
          'Cabinet chaleureux de psychologue.'
        ),
      ],
      sources: [{ title: 'OMS — Santé mentale', label: 'OMS', url: 'https://www.who.int/fr/health-topics/mental-health' }],
    },
    {
      id: 'l-depression',
      title: 'Dépression et mal-être : demander de l’aide',
      category: 'Santé mentale',
      level: 'intermédiaire',
      durationMin: 10,
      points: 45,
      emoji: '💙',
      cover: '/assets/covers/depression.svg',
      summary: 'Reconnaître les signes de la dépression et savoir vers qui se tourner.',
      tags: ['dépression', 'santé mentale', 'aide'],
      sections: [
        sec(
          'Reconnaître les signes',
          "La dépression, ce n'est pas juste « être triste ». C'est une tristesse ou un vide qui dure, avec une perte d'intérêt, de la fatigue, des troubles du sommeil, et parfois des idées sombres. Ce n'est pas de la paresse ni un manque de volonté.",
          ['Ce n’est pas de la paresse.', 'Les symptômes durent plusieurs semaines.', 'Les idées sombres doivent alerter.'],
          'Ambiance douce évoquant la reconstruction.'
        ),
        sec(
          'Ce qui aide vraiment',
          "Parler à quelqu'un de confiance, consulter un psychologue ou un médecin, garder un sommeil régulier et un lien social. La dépression se soigne : thérapie et, si besoin, médicament prescrit par un médecin.",
          ['Parler est un premier pas.', 'La dépression se soigne.', 'Le traitement est médical, jamais improvisé.'],
          'Séance d’écoute bienveillante.'
        ),
        sec(
          'Si tu penses à en finir',
          "Si tu as des pensées de suicide, ce n'est pas un signe de faiblesse : c'est une souffrance qui a besoin d'aide immédiate. Parle tout de suite à un adulte de confiance, appelle une ligne d'écoute (Bénin : 137) ou rends-toi aux urgences. Ta vie compte.",
          ['Les pensées suicidaires exigent une aide immédiate.', 'Appelle une ligne d’écoute sans attendre.', 'Ta vie compte, toujours.'],
          'Main tendue vers la lumière.'
        ),
      ],
      sources: [{ title: 'OMS — Dépression', label: 'OMS', url: 'https://www.who.int/fr/news-room/fact-sheets/detail/depression' }],
    },
    {
      id: 'l-estime',
      title: 'Estime de soi et image corporelle',
      category: 'Santé mentale',
      level: 'débutant',
      durationMin: 8,
      points: 35,
      emoji: '🪞',
      cover: '/assets/covers/estime.svg',
      summary: 'Apprendre à s’aimer et à accepter son corps tel qu’il est.',
      tags: ['estime de soi', 'image corporelle', 'confiance'],
      sections: [
        sec(
          'D’où vient l’image de soi',
          "L'image que tu as de toi se construit avec les regards des autres, mais aussi et surtout avec ce que tu te dis à toi-même. Les réseaux sociaux renvoient souvent des images irréalistes qui abîment la confiance.",
          ['L’image de soi se construit progressivement.', 'Les réseaux montrent du irréel.', 'Tu comptes plus qu’un filtre.'],
          'Miroir et reflet positif.'
        ),
        sec(
          'Renforcer son estime',
          "Note tes réussites, même petites. Entoure-toi de personnes bienveillantes. Compare-toi à toi-même plutôt qu'aux autres. Ces habitudes renforcent petit à petit la confiance en soi.",
          ['Célèbre tes petites réussites.', 'Entoure-toi de bienveillance.', 'Compare-toi à toi-même.'],
          'Jeune personne confiante et souriante.'
        ),
        sec(
          'Quand le corps pèse trop',
          "Si ton rapport à ton corps provoque une détresse forte, des troubles alimentaires ou une obsession, parles-en à un professionnel. On peut t'aider à retrouver une relation apaisée avec ton corps.",
          ['Une souffrance forte mérite de l’aide.', 'Les troubles alimentaires se traitent.', 'Un accompagnement existe.'],
          'Soutien bienveillant autour de l’estime de soi.'
        ),
      ],
      sources: [{ title: 'UNICEF — Santé mentale des adolescents', label: 'UNICEF', url: 'https://www.unicef.org/fr' }],
    },
    {
      id: 'l-alcool-drogues',
      title: 'Alcool, tabac et drogues',
      category: 'Bien-être & prévention',
      level: 'intermédiaire',
      durationMin: 9,
      points: 40,
      emoji: '🚭',
      cover: '/assets/covers/alcool.svg',
      summary: 'Comprendre les risques de l’alcool, du tabac et des drogues, et réduire les risques.',
      tags: ['alcool', 'tabac', 'drogues', 'prévention'],
      sections: [
        sec(
          'Les risques principaux',
          "L'alcool et les drogues altèrent le jugement, réduisent la vigilance et peuvent mener à des comportements à risque (relations non protégées, accidents, violences). Le tabac et l'alcool nuisent aussi gravement à la santé à long terme.",
          ['L’alcool altère le jugement.', 'Cela augmente les comportements à risque.', 'Les effets sur la santé sont réels.'],
          'Symbole de prévention (interdit au volant, etc.).'
        ),
        sec(
          'Réduire les risques',
          "Si tu consommes, évite de conduire, ne reste pas seul·e, bois de l'eau, et ne laisse jamais ta boisson sans surveillance. Ne mélange pas alcool et médicaments. Et souviens-toi : sous l'effet de l'alcool, on ne peut pas donner un consentement valable.",
          ['Ne conduis jamais après avoir bu.', 'Ne laisse pas ta boisson sans surveillance.', 'Alcool et consentement ne vont pas ensemble.'],
          'Verre d’eau et message de prudence.'
        ),
        sec(
          'Vers qui se tourner',
          "Si tu sens que tu perds le contrôle, ou si un·e proche est concerné·e, des professionnels peuvent accompagner sans juger. Parler tôt évite d'entrer dans la dépendance.",
          ['Perdre le contrôle doit alerter.', 'Un accompagnement existe.', 'Parler tôt est essentiel.'],
          'Accompagnement bienveillant.'
        ),
      ],
      sources: [{ title: 'OMS — Alcool', label: 'OMS', url: 'https://www.who.int/fr/news-room/fact-sheets/detail/alcohol' }],
    },
  ];

  // Chaque leçon expose un nombre de sections (utile pour les listes).
  const lessons = lectures.map((l) => ({ ...l, sectionsCount: l.sections.length }));

  // --- Quiz (8) -------------------------------------------------------------
  const quizzes = [
    {
      id: 'quiz-puberte',
      title: 'Puberté : vrai ou faux ?',
      topic: 'Corps & puberté',
      points: 25,
      emoji: '🌷',
      description: 'Teste tes connaissances sur les changements du corps à l’adolescence.',
      questions: [
        q('qp1', 'La puberté commence au même âge pour tout le monde.', ['Vrai', 'Faux'], [2], 'Faux. Le rythme est différent pour chaque personne ; il n’y a pas de « bon » moment.'),
        q('qp2', 'Les émissions nocturnes chez les garçons sont normales.', ['Vrai', 'Faux'], [1], 'Vrai. Elles font partie du fonctionnement normal du corps.'),
        q('qp3', 'Les changements d’humeur pendant la puberté sont anormaux.', ['Vrai', 'Faux'], [2], 'Faux. Les hormones peuvent rendre les émotions plus fortes, c’est courant.'),
        q('qp4', 'À 16 ans sans règles, il vaut mieux consulter.', ['Vrai', 'Faux'], [1], 'Vrai. Une absence de règles à 16 ans mérite un avis médical.'),
      ],
    },
    {
      id: 'quiz-regles',
      title: 'Règles & hygiène',
      topic: 'Règles & hygiène',
      points: 25,
      emoji: '🩸',
      description: 'Vérifie ce que tu sais sur le cycle menstruel et l’hygiène.',
      questions: [
        q('qr1', 'Combien de temps durent les règles en moyenne ?', ['1 jour', '3 à 7 jours', '15 jours'], [2], 'En moyenne 3 à 7 jours ; au-delà, il faut consulter.'),
        q('qr2', 'À quelle fréquence changer sa protection ?', ['1 fois par jour', 'Toutes les 4 à 6 heures', 'Une fois par semaine'], [2], 'Toutes les 4 à 6 heures, pour rester propre et éviter les infections.'),
        q('qr3', 'Un cycle irrégulier les premières années est normal.', ['Vrai', 'Faux'], [1], 'Vrai. La régularité vient souvent avec le temps.'),
        q('qr4', 'Une douleur qui empêche d’aller à l’école chaque mois est normale.', ['Vrai', 'Faux'], [2], 'Faux. Une douleur invalidante doit être évaluée par un professionnel.'),
      ],
    },
    {
      id: 'quiz-contraception',
      title: 'Contraception : les bases',
      topic: 'Contraception',
      points: 30,
      emoji: '💊',
      description: 'Saurez-vous choisir la bonne réponse sur la contraception ?',
      questions: [
        q('qc1', 'Quelle méthode protège à la fois des IST et de la grossesse ?', ['La pilule', 'Le préservatif', 'L’implant'], [2], 'Seul le préservatif protège aussi des IST.'),
        q('qc2', 'La pilule du lendemain est une méthode régulière.', ['Vrai', 'Faux'], [2], 'Faux. C’est une méthode d’urgence, pas un moyen régulier.'),
        q('qc3', 'L’implant et le stérilet sont parmi les méthodes les plus efficaces.', ['Vrai', 'Faux'], [1], 'Vrai. Leur efficacité est élevée car ils ne dépendent pas d’un geste quotidien.'),
        q('qc4', 'Où se procurer une contraception au Bénin ?', ['Nulle part', 'En centre de santé / planning familial', 'Uniquement à l’étranger'], [2], 'Dans les centres de santé et de planification familiale, souvent gratuitement.'),
        q('qc5', 'La contraception doit être choisie par le/la partenaire masculin seulement.', ['Vrai', 'Faux'], [2], 'Faux. Le choix se fait librement et peut être discuté, mais la décision appartient à la personne concernée.'),
      ],
    },
    {
      id: 'quiz-preservatif',
      title: 'Le préservatif, sans erreur',
      topic: 'Contraception',
      points: 25,
      emoji: '🛡️',
      description: 'Vérifie ta maîtrise de l’usage correct du préservatif.',
      questions: [
        q('qz1', 'Comment ouvrir l’emballage ?', ['Avec les dents', 'Avec les doigts', 'Avec des ciseaux'], [2], 'Avec les doigts, pour ne pas déchirer le préservatif.'),
        q('qz2', 'Faut-il pincer le bout du préservatif ?', ['Oui, pour chasser l’air', 'Non'], [1], 'Oui, pour chasser l’air et éviter les ruptures.'),
        q('qz3', 'Peut-on réutiliser un préservatif ?', ['Oui', 'Non'], [2], 'Non, jamais. Un préservatif par rapport.'),
        q('qz4', 'L’huile de palme fragilise le préservatif en latex.', ['Vrai', 'Faux'], [1], 'Vrai. L’huile abîme le latex et augmente le risque de rupture.'),
      ],
    },
    {
      id: 'quiz-ist',
      title: 'IST : démêler le vrai du faux',
      topic: 'IST & dépistage',
      points: 30,
      emoji: '🦠',
      description: 'Testez vos connaissances sur les infections sexuellement transmissibles.',
      questions: [
        q('qi1', 'Le VIH se transmet par un baiser.', ['Vrai', 'Faux'], [2], 'Faux. Le VIH ne se transmet pas par la salive, ni par les baisers.'),
        q('qi2', 'Toutes les IST donnent des symptômes visibles.', ['Vrai', 'Faux'], [2], 'Faux. Beaucoup sont silencieuses, d’où l’importance du dépistage.'),
        q('qi3', 'La plupart des IST se soignent bien.', ['Vrai', 'Faux'], [1], 'Vrai, surtout détectées et traitées tôt.'),
        q('qi4', 'On peut se soigner une IST seul·e avec des médicaments restants.', ['Vrai', 'Faux'], [2], 'Faux. Cela peut aggraver l’infection. Il faut consulter.'),
        q('qi5', 'Le dépistage est confidentiel.', ['Vrai', 'Faux'], [1], 'Vrai. Le dépistage est confidentiel et accompagné.'),
      ],
    },
    {
      id: 'quiz-consentement',
      title: 'Consentement : le comprendre',
      topic: 'Relations & consentement',
      points: 25,
      emoji: '🤝',
      description: 'Le consentement n’a pas de secret : vérifie-le.',
      questions: [
        q('qs1', 'Le silence signifie un accord.', ['Vrai', 'Faux'], [2], 'Faux. Le silence ou l’absence de « non » n’est jamais un oui.'),
        q('qs2', 'Le consentement peut être retiré à tout moment.', ['Vrai', 'Faux'], [1], 'Vrai. Il doit être donné à chaque fois et peut être retiré.'),
        q('qs3', 'Une personne très ivre peut donner un consentement valable.', ['Vrai', 'Faux'], [2], 'Faux. L’alcool empêche un consentement libre et éclairé.'),
        q('qs4', 'Respecter un « non » renforce la confiance.', ['Vrai', 'Faux'], [1], 'Vrai. Le respect est la base d’une relation saine.'),
      ],
    },
    {
      id: 'quiz-sante-mentale',
      title: 'Santé mentale : les bons réflexes',
      topic: 'Santé mentale',
      points: 30,
      emoji: '🧠',
      description: 'Comment prendre soin de son mental ?',
      questions: [
        q('qm1', 'La dépression, c’est un manque de volonté.', ['Vrai', 'Faux'], [2], 'Faux. C’est une vraie souffrance qui se soigne, pas un manque de volonté.'),
        q('qm2', 'Respirer lentement peut aider à calmer le stress.', ['Vrai', 'Faux'], [1], 'Vrai. Inspirer 4 s, expirer 6 s apaise le système nerveux.'),
        q('qm3', 'Demander de l’aide est un signe de faiblesse.', ['Vrai', 'Faux'], [2], 'Faux. C’est un signe de courage et de maturité.'),
        q('qm4', 'Si tu penses à en finir, il faut attendre que ça passe seul.', ['Vrai', 'Faux'], [2], 'Faux. Il faut une aide immédiate : un adulte de confiance, une ligne d’écoute (137), ou les urgences.'),
      ],
    },
    {
      id: 'quiz-mythes',
      title: 'Grand quiz : briseur de mythes',
      topic: 'Mythes & idées fausses',
      points: 35,
      emoji: '💥',
      description: 'Démolis les idées fausses les plus courantes sur la santé sexuelle.',
      questions: [
        q('qy1', 'La pilule rend stérile.', ['Vrai', 'Faux'], [2], 'Faux. La pilule n’affecte pas la fertilité à long terme.'),
        q('qy2', 'La fellation ne présente aucun risque d’IST.', ['Vrai', 'Faux'], [2], 'Faux. Certaines IST se transmettent par la fellation ; le préservatif réduit le risque.'),
        q('qy3', 'La première fois, on ne peut pas tomber enceinte.', ['Vrai', 'Faux'], [2], 'Faux. Une grossesse est possible dès le premier rapport.'),
        q('qy4', 'Un premier rapport peut se faire sans préservatif si l’on se connaît bien.', ['Vrai', 'Faux'], [2], 'Faux. Se connaître ne protège ni d’une grossesse ni d’une IST.'),
        q('qy5', 'Se laver après un rapport protège des IST.', ['Vrai', 'Faux'], [2], 'Faux. Le lavage ne protège pas ; seul le préservatif le fait.'),
      ],
    },
  ];

  // --- Mythes (12+) ---------------------------------------------------------
  const myths = [
    { id: 'm1', myth: 'La pilule contraceptive rend stérile.', truth: 'Faux. La pilule empêche temporairement l’ovulation mais n’altère pas la fertilité à long terme.', category: 'Contraception', source: 'OMS' },
    { id: 'm2', myth: 'La fellation ne présente aucun risque.', truth: 'Faux. Certaines IST (herpès, gonorrhée, chlamydia, VIH dans de rares cas) peuvent se transmettre par la fellation.', category: 'IST', source: 'OMS' },
    { id: 'm3', myth: 'La première fois, on ne peut pas tomber enceinte.', truth: 'Faux. Une grossesse est possible dès le premier rapport sexuel.', category: 'Grossesse', source: 'UNFPA' },
    { id: 'm4', myth: 'Le VIH se transmet par le baiser.', truth: 'Faux. Le VIH ne se transmet pas par la salive, les baisers, les câlins ou le partage d’un repas.', category: 'IST', source: 'ONUSIDA' },
    { id: 'm5', myth: 'On ne peut pas avoir d’IST sans symptômes.', truth: 'Faux. De nombreuses IST sont silencieuses ; seul le dépistage permet de savoir.', category: 'IST', source: 'OMS' },
    { id: 'm6', myth: 'Se laver après un rapport protège des IST.', truth: 'Faux. Le lavage ne protège pas ; seul le préservatif réduit le risque.', category: 'IST', source: 'OMS' },
    { id: 'm7', myth: 'Les contraceptifs font grossir, donc ils sont mauvais.', truth: 'Certaines personnes observent des effets, mais ils varient. Un professionnel peut aider à trouver la méthode adaptée sans danger.', category: 'Contraception', source: 'OMS' },
    { id: 'm8', myth: 'Tirer le préservatif avec les dents, c’est plus rapide.', truth: 'Faux. On l’ouvre avec les doigts, sinon on risque de le déchirer.', category: 'Contraception', source: 'OMS' },
    { id: 'm9', myth: 'Si une fille dit non, elle veut dire oui.', truth: 'Faux et grave. Non, c’est non. Le consentement doit être clair et enthousiaste.', category: 'Consentement', source: 'UNFPA' },
    { id: 'm10', myth: 'La dépression, ce n’est pas une vraie maladie.', truth: 'Faux. C’est un trouble réel qui se soigne ; en parler sauve des vies.', category: 'Santé mentale', source: 'OMS' },
    { id: 'm11', myth: 'Les règles sont sales ou honteuses.', truth: 'Faux. Les règles sont un phénomène naturel et sain ; il n’y a aucune honte.', category: 'Hygiène menstruelle', source: 'UNICEF' },
    { id: 'm12', myth: 'Masturbation = problèmes de santé.', truth: 'Faux. La masturbation est naturelle et sans danger pour la santé.', category: 'Corps & puberté', source: 'OMS' },
    { id: 'm13', myth: 'On peut se soigner une IST tout seul.', truth: 'Faux. S’automédiquer aggrave souvent l’infection. Il faut consulter un professionnel.', category: 'IST', source: 'OMS' },
    { id: 'm14', myth: 'Deux préservatifs valent mieux qu’un.', truth: 'Faux. Les superposer augmente le risque de rupture. Un seul, bien mis.', category: 'Contraception', source: 'OMS' },
  ];

  // --- Posts du forum (12) + réponses --------------------------------------
  const posts = [
    {
      id: 'p1', title: 'Est-ce normal d’avoir peur avant la première fois ?', category: 'relations',
      body: 'Mon copain et moi parlons de notre première fois. J’ai très peur et je ne sais pas si c’est normal…',
      anonymous: false, authorId: 'u-grace', status: 'published', flags: [], reactions: { support: 12, helpful: 5 },
      createdAt: daysAgo(3),
    },
    {
      id: 'p2', title: 'Comment parler de contraception à ma mère ?', category: 'grossesse',
      body: 'Je voudrais aller au centre de santé mais j’ai peur du jugement de ma famille. Des conseils ?',
      anonymous: false, authorId: 'u-awa', status: 'published', flags: [], reactions: { support: 20, helpful: 9 },
      createdAt: daysAgo(5),
    },
    {
      id: 'p3', title: 'J’ai eu un rapport non protégé, que faire ?', category: 'ist',
      body: 'Ça me stresse beaucoup. Est-ce qu’il faut aller au centre tout de suite ou attendre des symptômes ?',
      anonymous: true, authorId: null, status: 'published', flags: [], reactions: { support: 15, helpful: 18 },
      createdAt: daysAgo(1),
    },
    {
      id: 'p4', title: 'Je me sens seul et je n’arrive plus à dormir', category: 'sante-mentale',
      body: 'Depuis quelques semaines, je suis épuisé et je perds la motivation. Est-ce que ça vous arrive aussi ?',
      anonymous: true, authorId: null, status: 'published', flags: [], reactions: { support: 27, helpful: 6 },
      createdAt: daysAgo(2),
    },
    {
      id: 'p5', title: 'Le préservatif s’est déchiré, j’ai paniqué', category: 'grossesse',
      body: 'On ne s’en est rendu compte qu’après. Quelles sont les étapes à suivre ?',
      anonymous: true, authorId: null, status: 'published', flags: [], reactions: { support: 9, helpful: 21 },
      createdAt: daysAgo(4),
    },
    {
      id: 'p6', title: 'Comment reconnaître une relation toxique ?', category: 'relations',
      body: 'Mon/ma partenaire est très jaloux·se et contrôle mon téléphone. Est-ce que c’est normal ?',
      anonymous: false, authorId: 'u-awa', status: 'published', flags: [], reactions: { support: 18, helpful: 14 },
      createdAt: daysAgo(6),
    },
    {
      id: 'p7', title: 'Le dépistage du VIH est-il vraiment confidentiel ?', category: 'ist',
      body: 'J’hésite à y aller par peur que quelqu’un l’apprenne.',
      anonymous: true, authorId: null, status: 'published', flags: [], reactions: { support: 11, helpful: 16 },
      createdAt: daysAgo(8),
    },
    {
      id: 'p8', title: 'Règles très douloureuses : vos astuces ?', category: 'questions',
      body: 'Chaque mois, j’ai tellement mal que je rate les cours. Qu’est-ce qui vous aide ?',
      anonymous: false, authorId: 'u-grace', status: 'published', flags: [], reactions: { support: 14, helpful: 10 },
      createdAt: daysAgo(9),
    },
    {
      id: 'p9', title: 'Est-ce que je peux tomber enceinte en étant vierge ?', category: 'questions',
      body: 'Question peut-être bête mais je préfère demander ici.',
      anonymous: true, authorId: null, status: 'published', flags: [], reactions: { support: 8, helpful: 12 },
      createdAt: daysAgo(11),
    },
    {
      id: 'p10', title: 'Comment accepter mon corps ?', category: 'sante-mentale',
      body: 'Je me compare beaucoup aux photos sur les réseaux et je me sens mal.',
      anonymous: false, authorId: 'u-sessi', status: 'published', flags: [], reactions: { support: 22, helpful: 7 },
      createdAt: daysAgo(12),
    },
    {
      id: 'p11', title: 'Mes parents pensent que parler de sexe est tabou', category: 'confidences',
      body: 'Je n’ai personne à qui parler. Heureusement que cette communauté existe.',
      anonymous: true, authorId: null, status: 'published', flags: [], reactions: { support: 25, helpful: 4 },
      createdAt: daysAgo(14),
    },
    {
      id: 'p12', title: 'Un ami proche a l’air très déprimé', category: 'sante-mentale',
      body: 'Comment l’aider sans le braquer ? Je ne veux pas qu’il se sente juger.',
      anonymous: false, authorId: 'u-sessi', status: 'published', flags: [], reactions: { support: 19, helpful: 13 },
      createdAt: daysAgo(16),
    },
  ];

  const postIdsByIndex = posts.map((p) => p.id);
  const postRef = (i) => ({ postId: postIdsByIndex[i - 1] });

  const replies = [
    { id: 'r1', ...postRef(1), body: 'C’est complètement normal d’avoir peur. Prends le temps d’en parler, et rien ne doit se faire sans envie réelle des deux côtés.', anonymous: false, authorId: 'u-awa', isBestAnswer: true, reactions: { support: 7, helpful: 9 }, status: 'published', flags: [], createdAt: daysAgo(2) },
    { id: 'r2', ...postRef(1), body: 'N’oublie pas le préservatif, même la première fois. La protection, c’est pour vous deux.', anonymous: true, authorId: null, isBestAnswer: false, reactions: { support: 5, helpful: 6 }, status: 'published', flags: [], createdAt: daysAgo(2) },
    { id: 'r3', ...postRef(2), body: 'Tu peux commencer par parler à la sage-femme du centre de santé. Elle est tenue à la confidentialité.', anonymous: false, authorId: 'u-rodrigue', isBestAnswer: true, reactions: { support: 10, helpful: 12 }, status: 'published', flags: [], createdAt: daysAgo(4) },
    { id: 'r4', ...postRef(3), body: 'Va au centre de santé rapidement : il existe une contraception d’urgence et un dépistage. Pas besoin d’attendre des symptômes.', anonymous: false, authorId: 'u-sessi', isBestAnswer: true, reactions: { support: 9, helpful: 15 }, status: 'published', flags: [], createdAt: daysAgo(1) },
    { id: 'r5', ...postRef(4), body: 'Tu n’es pas seul·e. Ce que tu décris mérite l’écoute d’un psychologue. En parler, c’est déjà aider.', anonymous: false, authorId: 'u-awa', isBestAnswer: true, reactions: { support: 14, helpful: 8 }, status: 'published', flags: [], createdAt: daysAgo(1) },
    { id: 'r6', ...postRef(5), body: 'Pilule du lendemain le plus tôt possible (idéalement < 72h) et dépistage ensuite. Le centre de santé peut t’accompagner.', anonymous: true, authorId: null, isBestAnswer: true, reactions: { support: 6, helpful: 17 }, status: 'published', flags: [], createdAt: daysAgo(3) },
    { id: 'r7', ...postRef(6), body: 'Contrôler le téléphone, c’est du contrôle, pas de l’amour. Ton ressenti est légitime.', anonymous: false, authorId: 'u-grace', isBestAnswer: true, reactions: { support: 12, helpful: 11 }, status: 'published', flags: [], createdAt: daysAgo(5) },
    { id: 'r8', ...postRef(7), body: 'Oui, le dépistage est confidentiel. Le personnel ne peut pas divulguer ton statut.', anonymous: false, authorId: 'u-rodrigue', isBestAnswer: true, reactions: { support: 8, helpful: 13 }, status: 'published', flags: [], createdAt: daysAgo(7) },
    { id: 'r9', ...postRef(8), body: 'La chaleur locale (bouillotte) et le repos aident. Si la douleur t’empêche de vivre normalement, consulte.', anonymous: true, authorId: null, isBestAnswer: true, reactions: { support: 7, helpful: 9 }, status: 'published', flags: [], createdAt: daysAgo(8) },
    { id: 'r10', ...postRef(12), body: 'Écoute-le sans juger, propose-lui de parler à un professionnel, et reste présent·e. Ton soutien compte énormément.', anonymous: false, authorId: 'u-awa', isBestAnswer: true, reactions: { support: 11, helpful: 10 }, status: 'published', flags: [], createdAt: daysAgo(15) },
  ];

  // --- Campagnes mensuelles (6) --------------------------------------------
  const campaigns = [
    {
      id: 'c-contraception', month: 'Janvier', title: 'Janvier sans stress : la contraception expliquée',
      theme: 'Contraception', emoji: '💊', dateLabel: 'Tout le mois de janvier',
      description: 'Un mois pour découvrir les méthodes contraceptives et trouver celle qui te convient.',
      hashtags: ['#WeTooContraception', '#MonChoixMonCorps'], participants: 412, status: 'past',
      resources: [
        { label: 'Guide des méthodes contraceptives', type: 'pdf' },
        { label: 'Où trouver une sage-femme près de toi', type: 'article' },
      ],
      schedule: [
        { day: 'Semaine 1', label: 'Lancement & quiz de sensibilisation', activity: 'Quiz contraception' },
        { day: 'Semaine 2', label: 'Live avec une sage-femme', activity: 'Questions/réponses en direct' },
        { day: 'Semaine 3', label: 'Témoignages et partage', activity: 'Forum' },
        { day: 'Semaine 4', label: 'Bilan du mois', activity: 'Synthèse et ressources' },
      ],
      facts: [
        'La contraception est disponible dans les centres de planification familiale au Bénin.',
        'Seul le préservatif protège aussi des IST.',
        'La pilule du lendemain est une méthode d’urgence.',
      ],
    },
    {
      id: 'c-sante-mentale', month: 'Février', title: 'Février bienveillant : parlons santé mentale',
      theme: 'Santé mentale', emoji: '🧠', dateLabel: 'Tout le mois de février',
      description: 'Briser le silence autour de la santé mentale et rappeler que demander de l’aide est une force.',
      hashtags: ['#WeTooMentalHealth', '#CaVaAller'], participants: 530, status: 'past',
      resources: [
        { label: 'Techniques anti-stress', type: 'article' },
        { label: 'Contacter un psychologue', type: 'contact' },
      ],
      schedule: [
        { day: 'Semaine 1', label: 'Reconnaître ses émotions', activity: 'Ateliers forum' },
        { day: 'Semaine 2', label: 'Live psychologue', activity: 'Réponses en direct' },
        { day: 'Semaine 3', label: 'Défi bien-être 7 jours', activity: 'Challenge quotidien' },
        { day: 'Semaine 4', label: 'Témoignages', activity: 'Partage bienveillant' },
      ],
      facts: [
        '1 jeune sur 7 vit avec un trouble de santé mentale.',
        'Parler réduit la souffrance.',
        'Aucune émotion n’est honteuse.',
      ],
    },
    {
      id: 'c-depistage', month: 'Mars', title: 'Mars : connaître son statut, c’est se protéger',
      theme: 'Dépistage VIH', emoji: '🧪', dateLabel: 'Tout le mois de mars',
      description: 'Un mois dédié au dépistage du VIH et des IST, gratuit et confidentiel.',
      hashtags: ['#JeMeDepiste', '#WeTooSante'], participants: 356, status: 'active',
      resources: [
        { label: 'Centres de dépistage au Bénin', type: 'article' },
        { label: 'Ligne d’écoute santé 137', type: 'contact' },
      ],
      schedule: [
        { day: 'Semaine 1', label: 'Démystifier le VIH', activity: 'Quiz & infos' },
        { day: 'Semaine 2', label: 'Journée dépistage communautaire', activity: 'Mobilisation' },
        { day: 'Semaine 3', label: 'Live avec un infirmier', activity: 'Q/R' },
        { day: 'Semaine 4', label: 'Témoignages de jeunes dépistés', activity: 'Partage' },
      ],
      facts: [
        'Le dépistage du VIH est confidentiel et souvent gratuit.',
        'Un traitement précoce permet de vivre en bonne santé.',
        'Se dépister, c’est se respecter et respecter les autres.',
      ],
    },
    {
      id: 'c-consentement', month: 'Avril', title: 'Avril : le consentement, on en parle',
      theme: 'Consentement', emoji: '🤝', dateLabel: 'Tout le mois d’avril',
      description: 'Comprendre le consentement et construire des relations respectueuses.',
      hashtags: ['#ConsentementOui', '#WeTooRespect'], participants: 288, status: 'active',
      resources: [
        { label: 'Guide du consentement', type: 'pdf' },
        { label: 'Signaler une situation', type: 'form' },
      ],
      schedule: [
        { day: 'Semaine 1', label: 'C’est quoi le consentement ?', activity: 'Infographies' },
        { day: 'Semaine 2', label: 'Reconnaître une relation toxique', activity: 'Atelier forum' },
        { day: 'Semaine 3', label: 'Live avec une psychologue', activity: 'Q/R' },
        { day: 'Semaine 4', label: 'Engagement communautaire', activity: 'Signature de charte' },
      ],
      facts: [
        'Le consentement doit être libre, clair et enthousiaste.',
        'Il peut être retiré à tout moment.',
        'Le respect protège tout le monde.',
      ],
    },
    {
      id: 'c-hygiene', month: 'Mai', title: 'Mai : règles et hygiène, sans tabou',
      theme: 'Hygiène menstruelle', emoji: '🩸', dateLabel: 'Tout le mois de mai',
      description: 'Lutter contre la précarité menstruelle et les tabous autour des règles.',
      hashtags: ['#PasDeHonte', '#WeTooMenstrues'], participants: 401, status: 'upcoming',
      resources: [
        { label: 'Bien choisir sa protection', type: 'article' },
        { label: 'Distribuer des serviettes', type: 'action' },
      ],
      schedule: [
        { day: 'Semaine 1', label: 'Comprendre son cycle', activity: 'Cours & quiz' },
        { day: 'Semaine 2', label: 'Collecte de protections', activity: 'Solidarité' },
        { day: 'Semaine 3', label: 'Live sage-femme', activity: 'Q/R' },
        { day: 'Semaine 4', label: 'Bilan et engagement', activity: 'Synthèse' },
      ],
      facts: [
        'Les règles sont naturelles et saines.',
        'Une bonne hygiène évite les infections.',
        'Aucune fille ne doit manquer l’école à cause de ses règles.',
      ],
    },
    {
      id: 'c-numerique', month: 'Juin', title: 'Juin : bien-être numérique',
      theme: 'Bien-être numérique', emoji: '📱', dateLabel: 'Tout le mois de juin',
      description: 'Prendre soin de son esprit à l’ère des écrans et des réseaux sociaux.',
      hashtags: ['#DeconnexionUtile', '#WeTooDigital'], participants: 275, status: 'upcoming',
      resources: [
        { label: 'Hygiène numérique', type: 'article' },
        { label: 'Gérer son image en ligne', type: 'video' },
      ],
      schedule: [
        { day: 'Semaine 1', label: 'Écrans et sommeil', activity: 'Atelier' },
        { day: 'Semaine 2', label: 'Défi déconnexion', activity: 'Challenge' },
        { day: 'Semaine 3', label: 'Cyberharcèlement', activity: 'Live' },
        { day: 'Semaine 4', label: 'Bilan', activity: 'Synthèse' },
      ],
      facts: [
        'Trop d’écrans le soir nuit au sommeil.',
        'Les réseaux sociaux peuvent abîmer l’image de soi.',
        'Des pauses numériques font du bien.',
      ],
    },
  ];

  // --- Badges (10) ----------------------------------------------------------
  const badges = [
    { id: 'b-first', name: 'Premier pas', emoji: '👟', description: 'Bienvenue dans l’aventure WeToo ! Tu as rejoint la communauté.', criteria: 'Créer un compte sur WeToo.' },
    { id: 'b-curieux', name: 'Curieux·se', emoji: '🔎', description: 'Tu as terminé ta première leçon. La curiosité, c’est une force.', criteria: 'Terminer 1 leçon.' },
    { id: 'b-allie', name: 'Allié·e', emoji: '🤝', description: 'Tu as soutenu un·e membre de la communauté.', criteria: 'Réagir à un post ou publier une réponse.' },
    { id: 'b-sans-tabou', name: 'Sans tabou', emoji: '🗣️', description: 'Tu oses parler de santé sexuelle sans honte.', criteria: 'Publier ou répondre 3 fois sur le forum.' },
    { id: 'b-mythes', name: 'Briseur de mythes', emoji: '💥', description: 'Tu déconstruis les idées fausses.', criteria: 'Réussir le quiz des mythes.' },
    { id: 'b-soutien', name: 'Soutien de la communauté', emoji: '💖', description: 'Tes réponses aident réellement les autres.', criteria: 'Recevoir 5 réactions « utile » sur tes réponses.' },
    { id: 'b-expert', name: 'Expert en devenir', emoji: '🎓', description: 'Tu maîtrises de plus en plus de sujets.', criteria: 'Terminer 5 leçons.' },
    { id: 'b-regulier', name: 'Régulier·e', emoji: '🔥', description: 'Tu reviens régulièrement : la régularité paie.', criteria: 'Atteindre une série de 7 jours.' },
    { id: 'b-sante', name: 'Esprit sain', emoji: '🧘', description: 'Tu prends soin de ta santé mentale.', criteria: 'Terminer une leçon de santé mentale.' },
    { id: 'b-ambassadeur', name: 'Ambassadrice/Ambassadeur WeToo', emoji: '🏅', description: 'Tu es un pilier de la communauté WeToo.', criteria: 'Atteindre 1000 points.' },
  ];

  // --- Témoignages (6) ------------------------------------------------------
  const testimonials = [
    { id: 't1', name: 'Awa, 20 ans', role: 'Étudiante', quote: 'WeToo m’a aidée à comprendre ma santé sans peur du jugement. J’ai enfin osé poser mes questions.', avatar: '🌸', age: 20 },
    { id: 't2', name: 'Rodrigue, 23 ans', role: 'Lycéen', quote: 'Le chatbot répond en français, simplement, à toute heure. C’est comme un grand frère qui sait tout.', avatar: '⚽', age: 23 },
    { id: 't3', name: 'Grâce, 19 ans', role: 'Coiffeuse', quote: 'J’ai appris que les règles ne sont pas une honte. J’en parle maintenant autour de moi.', avatar: '📚', age: 19 },
    { id: 't4', name: 'Sessi, 25 ans', role: 'Artisan·e', quote: 'L’espace anonyme m’a permis de me confier pour la première fois sans avoir peur.', avatar: '🎨', age: 25 },
    { id: 't5', name: 'Bio, 21 ans', role: 'Mécanicien', quote: 'Le forum m’a aidé à comprendre l’importance du dépistage. Je l’ai fait, et je vais bien.', avatar: '🔧', age: 21 },
    { id: 't6', name: 'Afi, 22 ans', role: 'Étudiante', quote: 'Pouvoir écrire à une experte en toute confidentialité change tout.', avatar: '🌻', age: 22 },
  ];

  // --- Ressources d’aide (3) ------------------------------------------------
  const helplines = [
    {
      country: 'Bénin',
      name: 'Ligne verte d’écoute et d’orientation',
      contact: '137 (appel gratuit)',
      hours: '24h/24, 7j/7',
      description: 'Écoute, information et orientation pour les jeunes en détresse ou en questionnement.',
      url: null,
    },
    {
      country: 'Bénin',
      name: 'Urgences santé (SAMU)',
      contact: '112',
      hours: '24h/24, 7j/7',
      description: 'Numéro d’urgence pour toute situation médicale grave ou danger immédiat.',
      url: null,
    },
    {
      country: 'Internationale',
      name: 'Centre de ressources ONUSIDA',
      contact: 'En ligne',
      hours: 'Consultation permanente',
      description: 'Informations internationales fiables sur le VIH, la prévention et les droits.',
      url: 'https://www.unaids.org/fr',
    },
  ];

  return {
    users,
    categories,
    experts,
    lessons,
    quizzes,
    myths,
    posts,
    replies,
    campaigns,
    badges,
    testimonials,
    helplines,
    // Collections initialement vides (remplies à l'usage).
    reactions: [],
    reports: [],
    expertRequests: [],
    campaignJoins: [],
    chatSessions: [],
    counters: [],
  };
}

export default createSeed;
