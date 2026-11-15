// Base de connaissances du chatbot WeToo (français).
// Recherche par mots-clés scorée, sans IA externe : technologie frugale et locale.
// Chaque entrée : { id, category, keywords[], question, answer, myths[], followUps[],
//                   sources[], urgent, resources[] }.
// IMPORTANT : aucun contenu dangereux ; toujours renvoyer vers un professionnel.

// Ressources réutilisables.
const R_CENTRE = {
  label: 'Rends-toi au centre de santé ou de planification familiale le plus proche (souvent gratuit).',
  type: 'advice',
  url: null,
};
const R_EXPERT = {
  label: 'Tu peux poser ta question à un expert WeToo, en toute confidentialité.',
  type: 'advice',
  url: null,
};
const R_137 = {
  label: 'Ligne verte d’écoute au Bénin : 137 (gratuit, 24h/24).',
  type: 'helpline',
  url: null,
};
const R_CONDOM = {
  label: 'Le préservatif, utilisé correctement à chaque rapport, protège des IST et des grossesses.',
  type: 'advice',
  url: null,
};

export const KNOWLEDGE = [
  {
    id: 'k-puberte',
    category: 'Corps & puberté',
    keywords: ['puberté', 'puberte', 'adolescence', 'glande', 'mue', 'poils', 'érection', 'erection', 'sperme', 'développement du corps', 'changements'],
    question: 'Qu’est-ce qui se passe dans mon corps pendant la puberté ?',
    answer:
      "La puberté, c’est la période où ton corps change pour devenir celui d’un adulte. Chez les filles, elle commence souvent entre 9 et 14 ans ; chez les garçons, entre 10 et 15 ans. Tu peux voir apparaître des poils, une voix qui mue, des seins qui poussent, ou des érections et émissions nocturnes spontanées : tout cela est normal. Le rythme est différent pour chacun·e, et ces changements prennent plusieurs années. Si quelque chose t’inquiète (absence de règles à 16 ans, douleur forte), parles-en à une sage-femme ou à un médecin.",
    myths: [
      { myth: 'La puberté commence au même âge pour tout le monde.', truth: 'Chaque corps a son propre rythme ; il n’y a pas de « bon » moment.' },
      { myth: 'Les érections spontanées sont un problème.', truth: 'Elles sont normales et sans danger.' },
    ],
    followUps: ['Que faire si mes règles ne viennent pas ?', 'Comment parler de mon corps à mes parents ?', 'Est-ce normal d’avoir des sautes d’humeur ?'],
    sources: [{ title: 'OMS — Santé de l’adolescent', label: 'OMS', url: 'https://www.who.int/fr/health-topics/adolescent-health' }],
    urgent: false,
    resources: [R_EXPERT],
  },
  {
    id: 'k-regles',
    category: 'Règles & hygiène',
    keywords: ['règles', 'regles', 'menstrues', 'menstruation', 'cycle', 'sang', 'serviette', 'tampon', 'coupe menstruelle', 'hygiene intime', 'hygiène intime'],
    question: 'Comment se passent les règles et quelle hygiène adopter ?',
    answer:
      "Les règles surviennent environ une fois par mois et durent de 3 à 7 jours. Dans les premières années, un cycle irrégulier est fréquent et normal : il se régularise souvent avec le temps. Change ta protection toutes les 4 à 6 heures et lave-toi à l’eau propre pour éviter les infections. Les serviettes lavables et les coupes menstruelles sont économiques et écologiques si tu les entretiens bien. Si tu as très mal au point de rater l’école chaque mois, consulte : une douleur invalidante n’est pas une fatalité.",
    myths: [
      { myth: 'Les règles sont sales ou honteuses.', truth: 'Les règles sont un phénomène naturel et sain.' },
      { myth: 'Un cycle irrégulier est toujours anormal.', truth: 'L’irrégularité est fréquente les premières années.' },
    ],
    followUps: ['Comment soulager les douleurs de règles ?', 'Comment savoir si mon cycle est normal ?', 'Quelle protection est la plus adaptée ?'],
    sources: [{ title: 'UNICEF — Hygiène menstruelle', label: 'UNICEF', url: 'https://www.unicef.org/fr/wash/menstrual-hygiene' }],
    urgent: false,
    resources: [R_EXPERT],
  },
  {
    id: 'k-contraception',
    category: 'Contraception',
    keywords: ['contraception', 'contraceptif', 'pilule', 'implant', 'injectable', 'piqûre', 'sterilet', 'stérilet', 'diu', 'méthode', 'eviter une grossesse', 'éviter une grossesse', 'planning familial'],
    question: 'Quelles sont les méthodes de contraception ?',
    answer:
      "Il existe plusieurs méthodes : le préservatif, la pilule, l’implant, l’injectable, le stérilet (dispositif intra-utérin) et la pilule du lendemain en cas d’urgence. Toutes ne se valent pas : l’implant et le stérilet figurent parmi les plus efficaces car ils ne dépendent pas d’un geste quotidien. Le préservatif est le seul à protéger à la fois d’une grossesse et des IST. Le meilleur choix est celui qui te convient : une sage-femme peut t’aider à décider, en toute confidentialité. La plupart des méthodes sont disponibles gratuitement ou à faible coût dans les centres de santé au Bénin.",
    myths: [
      { myth: 'La pilule rend stérile.', truth: 'Faux. La pilule n’altère pas la fertilité à long terme.' },
      { myth: 'La pilule du lendemain est une contraception régulière.', truth: 'Faux. C’est une méthode d’urgence, pas un moyen régulier.' },
    ],
    followUps: ['Quelle contraception me convient le mieux ?', 'La contraception est-elle gratuite au Bénin ?', 'La pilule fait-elle grossir ?'],
    sources: [{ title: 'OMS — Planification familiale', label: 'OMS', url: 'https://www.who.int/fr/news-room/fact-sheets/detail/family-planning-contraception' }],
    urgent: false,
    resources: [R_CENTRE, R_EXPERT],
  },
  {
    id: 'k-preservatif',
    category: 'Contraception',
    keywords: ['préservatif', 'preservatif', 'capote', 'condom', 'protection', 'mettre un préservatif', 'usage correct', 'rupture'],
    question: 'Comment utiliser correctement un préservatif ?',
    answer:
      "Le préservatif est la seule méthode qui protège à la fois de la grossesse et des IST, y compris le VIH. Ouvre l’emballage avec les doigts (jamais avec les dents), pince le bout pour chasser l’air, puis déroule-le jusqu’à la base avant tout contact. Après le rapport, retire-le en tenant la base et jette-le. Utilise un préservatif neuf à chaque rapport, et n’en mets jamais deux. Attention : les huiles (comme l’huile de palme) fragilisent le latex et augmentent le risque de rupture.",
    myths: [
      { myth: 'Deux préservatifs valent mieux qu’un.', truth: 'Faux. Les superposer augmente le risque de rupture.' },
      { myth: 'On peut réutiliser un préservatif.', truth: 'Faux. Un préservatif par rapport, toujours neuf.' },
    ],
    followUps: ['Que faire si le préservatif se déchire ?', 'Le préservatif réduit-il la sensation ?', 'Où trouver des préservatifs gratuits ?'],
    sources: [{ title: 'OMS — Préservatifs', label: 'OMS', url: 'https://www.who.int/fr/news-room/fact-sheets/detail/family-planning-contraception' }],
    urgent: false,
    resources: [R_CONDOM, R_CENTRE],
  },
  {
    id: 'k-pilule-lendemain',
    category: 'Contraception',
    keywords: ['pilule du lendemain', 'lendemain', 'contraception d urgence', 'urgence', 'rapport non protégé', 'rapport non protege', 'oubli de pilule', 'rupture de préservatif'],
    question: 'J’ai eu un rapport non protégé, que faire ?',
    answer:
      "La contraception d’urgence (pilule du lendemain) peut réduire le risque de grossesse si elle est prise le plus tôt possible, idéalement dans les 72 heures (3 jours). Plus elle est prise tôt, plus elle est efficace ; elle n’est pas efficace à 100%. Elle ne protège PAS des IST : il faut donc envisager un dépistage. Cette pilule ne doit pas être utilisée comme méthode régulière. Va rapidement dans un centre de santé ou une pharmacie pour en obtenir et pour être conseillé·e.",
    myths: [{ myth: 'On peut attendre une semaine avant de la prendre.', truth: 'Faux. L’efficacité diminue vite ; il faut la prendre au plus tôt.' }],
    followUps: ['Comment obtenir la pilule du lendemain ?', 'La pilule du lendemain est-elle dangereuse ?', 'Faut-il faire un dépistage après ?'],
    sources: [{ title: 'OMS — Contraception d’urgence', label: 'OMS', url: 'https://www.who.int/fr/news-room/fact-sheets/detail/emergency-contraception' }],
    urgent: false,
    resources: [R_CENTRE, R_EXPERT],
  },
  {
    id: 'k-ist',
    category: 'IST',
    keywords: ['ist', 'mst', 'infection sexuellement transmissible', 'infection', 'chlamydia', 'gonorrhee', 'gonorrhée', 'chaude-pisse', 'syphilis', 'herpes', 'herpès', 'boutons', 'brulure en urinant', 'brûlure en urinant', 'ecoulement', 'écoulement'],
    question: 'Que sont les IST et comment s’en protéger ?',
    answer:
      "Les infections sexuellement transmissibles (IST) se transmettent lors de rapports sexuels non protégés. Les plus fréquentes sont le VIH, la chlamydia, la gonorrhée, la syphilis et l’herpès. Beaucoup ne provoquent aucun symptôme, ce qui rend le dépistage essentiel. Le préservatif, utilisé correctement à chaque rapport, réduit fortement le risque. La plupart des IST se soignent très bien lorsqu’elles sont détectées tôt : ne les laisse pas traîner et ne t’automédique jamais.",
    myths: [
      { myth: 'Les IST donnent toujours des symptômes visibles.', truth: 'Faux. De nombreuses IST sont silencieuses.' },
      { myth: 'On peut se soigner une IST seul·e.', truth: 'Faux. S’automédiquer aggrave souvent l’infection.' },
    ],
    followUps: ['Quels sont les symptômes d’une IST ?', 'Où se faire dépister au Bénin ?', 'Mon/ma partenaire doit-il/elle aussi se soigner ?'],
    sources: [{ title: 'OMS — Infections sexuellement transmissibles', label: 'OMS', url: 'https://www.who.int/fr/news-room/fact-sheets/detail/sexually-transmitted-infections-(stis)' }],
    urgent: false,
    resources: [R_CENTRE, R_EXPERT],
  },
  {
    id: 'k-vih',
    category: 'IST / VIH',
    keywords: ['vih', 'sida', 'seropositif', 'séropositif', 'seropositive', 'séropositive', 'virus', 'traitement vih', 'antiretroviral', 'antirétroviral'],
    question: 'Qu’est-ce que le VIH et comment se transmet-il ?',
    answer:
      "Le VIH est un virus qui affaiblit le système immunitaire s’il n’est pas traité. Il se transmet par le sang, le sperme, les sécrétions vaginales et le lait maternel, principalement lors de rapports non protégés ou par le partage de matériel d’injection. Il ne se transmet PAS par les baisers, les câlins, la sueur, la salive ou le partage d’un repas. Aujourd’hui, une personne séropositive bien suivie et sous traitement peut vivre une vie longue et en bonne santé. Se faire dépister est la première étape, et c’est confidentiel.",
    myths: [
      { myth: 'Le VIH se transmet par le baiser.', truth: 'Faux. Le VIH ne se transmet pas par la salive.' },
      { myth: 'Être séropositif = condamné.', truth: 'Faux. Avec un traitement suivi, on vit longtemps et en bonne santé.' },
    ],
    followUps: ['Comment se transmet le VIH ?', 'Où se faire dépister au Bénin ?', 'Un traitement existe-t-il ?'],
    sources: [{ title: 'ONUSIDA', label: 'ONUSIDA', url: 'https://www.unaids.org/fr' }],
    urgent: false,
    resources: [R_CENTRE, R_EXPERT],
  },
  {
    id: 'k-depistage',
    category: 'Dépistage',
    keywords: ['dépistage', 'depistage', 'test', 'test rapide', 'faire un test', 'se faire tester', 'resultat', 'résultat', 'confidentiel'],
    question: 'Comment se passe un dépistage du VIH ou d’une IST ?',
    answer:
      "Le dépistage est rapide, souvent gratuit et toujours confidentiel. Pour le VIH, il se fait fréquemment par un test rapide (une goutte de sang ou de salive) avec un résultat en quelques minutes ; un test peut nécessiter une confirmation. Un accompagnement et un conseil sont proposés avant et après le test. Personne ne peut divulguer ton statut sans ton accord. Connaître son statut permet, si besoin, de commencer un traitement tôt et de rester en bonne santé. N’aie pas honte : se dépister, c’est se respecter.",
    myths: [{ myth: 'Tout le monde saura que je me suis fait dépister.', truth: 'Faux. Le dépistage est confidentiel.' }],
    followUps: ['Où puis-je me faire dépister gratuitement ?', 'Le résultat est-il vraiment confidentiel ?', 'Que faire si le test est positif ?'],
    sources: [{ title: 'ONUSIDA — Dépistage', label: 'ONUSIDA', url: 'https://www.unaids.org/fr' }],
    urgent: false,
    resources: [R_CENTRE, R_EXPERT],
  },
  {
    id: 'k-grossesse',
    category: 'Grossesse',
    keywords: ['grossesse', 'enceinte', 'tomber enceinte', 'retard de règles', 'retard de regles', 'test de grossesse', 'symptomes de grossesse', 'symptômes de grossesse', 'nausée'],
    question: 'Comment savoir si je suis enceinte et que faire ?',
    answer:
      "Un retard de règles peut faire penser à une grossesse, mais seule un test ou un examen peut confirmer. Tu peux faire un test de grossesse en pharmacie ou dans un centre de santé. Si tu es enceinte et que cette grossesse n’était pas prévue, respire : plusieurs options existent et tu n’es pas seul·e. Une sage-femme ou un médecin peut t’expliquer calmement tes droits et les possibilités, sans te juger. Ne reste pas seule avec cette inquiétude : plus tôt tu es accompagné·e, plus tu auras de choix.",
    myths: [{ myth: 'La première fois, on ne peut pas tomber enceinte.', truth: 'Faux. Une grossesse est possible dès le premier rapport.' }],
    followUps: ['Quelles sont les options en cas de grossesse non désirée ?', 'Où faire un test de grossesse ?', 'La pilule du lendemain peut-elle encore m’aider ?'],
    sources: [{ title: 'OMS — Santé reproductive', label: 'OMS', url: 'https://www.who.int/fr/health-topics/sexual-and-reproductive-health' }],
    urgent: false,
    resources: [R_CENTRE, R_EXPERT],
  },
  {
    id: 'k-ivg',
    category: 'Grossesse',
    keywords: ['ivg', 'avortement', 'interruption de grossesse', 'interrompre', 'ne pas garder', 'solutions grossesse'],
    question: 'Quelles sont les options en cas de grossesse non désirée ?',
    answer:
      "En cas de grossesse non désirée, plusieurs chemins sont possibles : poursuivre la grossesse, la confier à l’adoption, ou, dans un cadre strictement encadré par la loi, l’interrompre médicalement. Au Bénin, l’interruption volontaire de grossesse est strictement encadrée par la loi de 2021 (elle est autorisée dans certaines situations précises). Il faut TOUJOURS passer par un professionnel de santé : les méthodes non médicales (produits, objets, breuvages) sont très dangereuses et peuvent tuer. Va dans un centre de santé pour être informé·e et accompagné·e sans jugement.",
    myths: [{ myth: 'On peut avorter seul·e avec des produits.', truth: 'Faux, c’est extrêmement dangereux. Il faut un cadre médical.' }],
    followUps: ['La loi béninoise autorise-t-elle l’IVG ?', 'Vers qui me tourner sans jugement ?', 'Comment rester en bonne santé après ?'],
    sources: [{ title: 'OMS — Interruption de grossesse', label: 'OMS', url: 'https://www.who.int/fr/health-topics/abortion' }],
    urgent: false,
    resources: [R_CENTRE, R_EXPERT],
  },
  {
    id: 'k-consentement',
    category: 'Relations & consentement',
    keywords: ['consentement', 'consentir', 'dire non', 'dire oui', 'accord', 'limites', 'forcement', 'forcer'],
    question: 'C’est quoi le consentement ?',
    answer:
      "Le consentement, c’est un accord libre, clair et enthousiaste. Il doit être donné à chaque fois, pour chaque acte, et peut être retiré à tout moment. Le silence, l’absence de « non », la pression, la menace ou l’ivresse ne sont jamais un consentement. Une personne mineure ne peut pas consentir. Demander « est-ce que tu veux ? » est simple et respectueux, et écouter la réponse renforce la confiance. Forcer quelqu’un est un acte grave, interdit par la loi.",
    myths: [
      { myth: 'Si elle ne dit rien, c’est oui.', truth: 'Faux. Le silence n’est jamais un oui.' },
      { myth: 'Dire non puis changer d’avis, c’est mal.', truth: 'Le consentement peut être retiré à tout moment.' },
    ],
    followUps: ['Comment demander le consentement ?', 'Que faire si on me force ?', 'Qu’est-ce qu’une relation respectueuse ?'],
    sources: [{ title: 'UNFPA — Consentement', label: 'UNFPA', url: 'https://www.unfpa.org/fr' }],
    urgent: false,
    resources: [R_EXPERT],
  },
  {
    id: 'k-relations-saines',
    category: 'Relations & consentement',
    keywords: ['relation saine', 'relation toxique', 'jalousie', 'amour', 'couple', 'respect', 'controle', 'contrôle', 'partenaire'],
    question: 'Comment savoir si ma relation est saine ?',
    answer:
      "Dans une relation saine, tu te sens respecté·e, écouté·e et libre. Tu peux dire non, voir tes ami·e·s et te sentir soutenu·e. À l’inverse, la jalousie excessive, le contrôle du téléphone, les humiliations ou les menaces sont des signaux d’alerte. Le contrôle n’est pas de l’amour : c’est de la domination. Si tu vis cela, ce n’est pas de ta faute, et de l’aide existe. Parle à une personne de confiance ou à un expert WeToo.",
    myths: [{ myth: 'La jalousie prouve l’amour.', truth: 'Faux. La jalousie excessive est un signe de contrôle, pas d’amour.' }],
    followUps: ['Comment fixer des limites dans mon couple ?', 'Que faire face au contrôle ?', 'Comment quitter une relation toxique ?'],
    sources: [{ title: 'OMS — Violence à l’égard des femmes', label: 'OMS', url: 'https://www.who.int/fr/news-room/fact-sheets/detail/violence-against-women' }],
    urgent: false,
    resources: [R_EXPERT],
  },
  {
    id: 'k-violences',
    category: 'Violences & abus',
    keywords: ['violence', 'viol', 'abus', 'agression', 'agressée', 'agressé', 'maltraitance', 'inceste', 'menace', 'battu', 'battue'],
    question: 'Je subis des violences, que faire ?',
    answer:
      "Si tu subis des violences, ce n’est jamais ta faute : la honte doit changer de camp. La violence peut être physique, sexuelle, psychologique ou économique, et aucune forme n’est acceptable. Ta sécurité passe avant tout : si tu es en danger immédiat, éloigne-toi et appelle à l’aide (112) ou demande à une personne de confiance. Tu peux aussi contacter les services sociaux, la ligne d’écoute 137, ou un expert WeToo. Tu as le droit d’être protégé·e et entendu·e. Parler n’est pas trahir : c’est te protéger.",
    myths: [{ myth: 'Si on ne se défend pas, c’est qu’on était d’accord.', truth: 'Faux. La peur peut paralyser : l’absence de défense n’est jamais un consentement.' }],
    followUps: ['Vers qui me tourner en cas de violence ?', 'Comment porter plainte ?', 'Comment me reconstruire après ?'],
    sources: [{ title: 'OMS — Prévention de la violence', label: 'OMS', url: 'https://www.who.int/fr/health-topics/violence-prevention' }],
    urgent: true,
    resources: [
      { label: 'En cas de danger immédiat, appelle le 112 ou rends-toi dans un lieu sûr.', type: 'advice', url: null },
      R_137,
      R_EXPERT,
    ],
  },
  {
    id: 'k-harcelement',
    category: 'Violences & abus',
    keywords: ['harcèlement', 'harcelement', 'cyberharcelement', 'cyberharcèlement', 'harcèlement scolaire', 'moqueries', 'insultes', 'en ligne', 'réseaux sociaux'],
    question: 'Comment réagir face au harcèlement ?',
    answer:
      "Le harcèlement, qu’il soit à l’école ou en ligne, n’est jamais anodin et n’est jamais de ta faute. Ne réponds pas aux provocations, mais conserve les preuves (captures d’écran, messages) si cela se passe en ligne. Parle à un adulte de confiance : parent, enseignant, conseiller. Tu peux aussi signaler la personne sur les plateformes et demander de l’aide à WeToo. Tu n’es pas seul·e, et ce que tu ressens est légitime.",
    myths: [{ myth: 'Le harcèlement, c’est des blagues sans conséquence.', truth: 'Faux. Il peut faire beaucoup de mal et doit être pris au sérieux.' }],
    followUps: ['Comment bloquer et signaler en ligne ?', 'Comment en parler à mes parents ?', 'Comment retrouver confiance ?'],
    sources: [{ title: 'UNICEF — Lutte contre le harcèlement', label: 'UNICEF', url: 'https://www.unicef.org/fr/end-violence' }],
    urgent: false,
    resources: [R_EXPERT],
  },
  {
    id: 'k-orientation',
    category: 'Identité & bien-être',
    keywords: ['orientation sexuelle', 'homosexualite', 'homosexualité', 'lesbienne', 'gay', 'bisexuel', 'bisexuelle', 'attirance', 'identite de genre', 'identité de genre', 'trans', 'transgenre', 'non binaire'],
    question: 'Comment comprendre mon orientation sexuelle ou mon identité de genre ?',
    answer:
      "L’orientation sexuelle décrit qui l’on aime ; l’identité de genre, le genre auquel on se sent appartenir. Découvrir tout cela prend du temps et n’est ni un choix ni une maladie. Beaucoup de jeunes se sentent différent·e·s ou isolé·e·s pendant cette période, et c’est normal de se poser des questions. Tu as le droit au respect, quoi qu’il arrive, et tu n’es pas seul·e. Trouve des personnes bienveillantes ou un espace sûr pour en parler ; un psychologue ou un expert WeToo peut aussi t’écouter sans jugement.",
    myths: [{ myth: 'Ce sont juste des phases, ça passera.', truth: 'Ce que tu ressens est réel et mérite du respect, pas d’être minimisé.' }],
    followUps: ['Comment me sentir accepté·e ?', 'Comment en parler à un proche ?', 'Où trouver un espace sûr ?'],
    sources: [{ title: 'OMS — Santé et droits', label: 'OMS', url: 'https://www.who.int/fr' }],
    urgent: false,
    resources: [R_EXPERT],
  },
  {
    id: 'k-anxiete',
    category: 'Santé mentale',
    keywords: ['anxiété', 'anxiete', 'angoisse', 'stress', 'panique', 'crise d angoisse', 'nerveux', 'nerveuse', 'peur'],
    question: 'Comment gérer le stress et l’anxiété ?',
    answer:
      "Le stress et l’anxiété sont des réactions normales face aux pressions, mais ils deviennent un problème quand ils durent et t’épuisent. Quelques gestes simples aident vraiment : respirer lentement (inspirer 4 secondes, expirer 6), bouger, dormir suffisamment, limiter les écrans le soir et parler à quelqu’un. Si l’anxiété t’empêche d’étudier, de dormir ou de sortir pendant plusieurs semaines, consulte un psychologue. Ce n’est pas une faiblesse : c’est prendre soin de soi.",
    myths: [{ myth: 'Le stress, il suffit de l’ignorer.', truth: 'Faux. Mieux vaut des techniques concrètes et, si besoin, un accompagnement.' }],
    followUps: ['Quelle technique de respiration utiliser ?', 'Quand consulter un psychologue ?', 'Comment mieux dormir ?'],
    sources: [{ title: 'OMS — Santé mentale', label: 'OMS', url: 'https://www.who.int/fr/health-topics/mental-health' }],
    urgent: false,
    resources: [R_EXPERT],
  },
  {
    id: 'k-depression',
    category: 'Santé mentale',
    keywords: ['dépression', 'depression', 'déprimé', 'deprime', 'déprimée', 'triste', 'vide', 'plus envie de rien', 'fatigue', 'perte d interet'],
    question: 'Suis-je déprimé·e ?',
    answer:
      "La dépression, ce n’est pas juste « être triste » : c’est une tristesse ou un vide qui dure, avec une perte d’intérêt, une grande fatigue, des troubles du sommeil et parfois des idées sombres. Ce n’est ni de la paresse ni un manque de volonté. La bonne nouvelle : la dépression se soigne, par la parole (thérapie) et, si besoin, un traitement prescrit par un médecin. Si ces symptômes durent plus de deux semaines, parle à un adulte de confiance ou à un psychologue. Tu mérites d’aller mieux.",
    myths: [{ myth: 'La dépression, c’est dans la tête, il suffit de sourire.', truth: 'Faux. C’est un trouble réel qui se soigne.' }],
    followUps: ['Quand faut-il consulter ?', 'Comment aider un ami déprimé ?', 'Un psychologue peut-il vraiment m’aider ?'],
    sources: [{ title: 'OMS — Dépression', label: 'OMS', url: 'https://www.who.int/fr/news-room/fact-sheets/detail/depression' }],
    urgent: false,
    resources: [R_EXPERT, R_137],
  },
  {
    id: 'k-suicide',
    category: 'Prévention & urgence',
    keywords: ['suicide', 'me suicider', 'mourir', 'je veux mourir', 'me tuer', 'en finir', 'plus envie de vivre', 'me faire du mal', 'automutilation', 'overdose'],
    question: 'Je pense à en finir, que puis-je faire ?',
    answer:
      "Ta souffrance est réelle et tu mérites de l’aide, tout de suite. Ces pensées ne font pas de toi une personne faible ou « folle » : elles signalent une douleur qui a besoin de soutien. Ne reste pas seul·e : parle immédiatement à un adulte de confiance, ou appelle la ligne verte 137 (gratuite, 24h/24) ou le 112. Tu peux aussi te rendre aux urgences du centre de santé le plus proche. Nous sommes là pour t’accompagner, et un professionnel peut t’aider à traverser cette période. Ta vie compte, et il existe des solutions.",
    myths: [{ myth: 'En parler, c’est attirer l’attention.', truth: 'Faux. En parler, c’est demander l’aide dont on a besoin — et c’est courageux.' }],
    followUps: ['Qui peut m’écouter tout de suite ?', 'Comment parler de mes idées noires ?', 'Où trouver un professionnel près de moi ?'],
    sources: [
      { title: 'OMS — Prévention du suicide', label: 'OMS', url: 'https://www.who.int/fr/health-topics/suicide' },
      { title: 'Ligne verte Bénin', label: 'Appel gratuit 137', url: null },
    ],
    urgent: true,
    resources: [R_137, { label: 'Appelle aussi le 112 en cas de danger immédiat.', type: 'helpline', url: null }, R_EXPERT],
  },
  {
    id: 'k-solitude',
    category: 'Santé mentale',
    keywords: ['solitude', 'seul', 'seule', 'isolement', 'personne ne me comprend', 'pas d amis'],
    question: 'Je me sens seul·e, que faire ?',
    answer:
      "La solitude est une émotion difficile, mais très répandue — tu n’es pas « bizarre » de la ressentir. Essaie de créer de petits liens : rejoindre une activité, un groupe, ou simplement parler à une personne en qui tu as confiance. Notre forum communautaire et ses espaces anonymes sont faits pour ça : tu peux y écrire sans être jugé·e. Si ce sentiment devient un poids constant, un psychologue peut t’aider. Tu comptes, et ta présence fait de la différence.",
    myths: [{ myth: 'Être seul·e au milieu des autres, c’est normal, il ne faut rien dire.', truth: 'Faux. En parler fait partie de la solution.' }],
    followUps: ['Comment me faire des ami·e·s ?', 'Où rencontrer des jeunes bienveillants ?', 'Comment sortir de l’isolement ?'],
    sources: [{ title: 'OMS — Santé mentale des adolescents', label: 'OMS', url: 'https://www.who.int/fr/health-topics/mental-health' }],
    urgent: false,
    resources: [R_EXPERT, R_137],
  },
  {
    id: 'k-estime',
    category: 'Estime de soi',
    keywords: ['estime de soi', 'confiance en soi', 'image corporelle', 'je me trouve moche', 'complexe', 'mocheté', 'poids', 'obèse', 'maigre'],
    question: 'Comment reprendre confiance en moi et aimer mon corps ?',
    answer:
      "L’image que tu as de toi se construit avec les regards des autres, mais surtout avec ce que tu te dis à toi-même. Les réseaux sociaux renvoient souvent des images irréalistes qui abîment la confiance. Note tes réussites, même petites ; entoure-toi de personnes bienveillantes ; et compare-toi à toi-même plutôt qu’aux autres. Ton corps n’a pas besoin d’être « parfait » pour être aimé. Si ton rapport à ton corps provoque une grande détresse, parle à un professionnel : on peut t’aider.",
    myths: [{ myth: 'Il faut un corps parfait pour être aimé·e.', truth: 'Faux. Les images de réseaux sociaux sont retouchées et irréalistes.' }],
    followUps: ['Comment arrêter de me comparer ?', 'Comment mieux vivre mon corps ?', 'Que faire en cas de trouble alimentaire ?'],
    sources: [{ title: 'UNICEF — Bien-être des adolescents', label: 'UNICEF', url: 'https://www.unicef.org/fr' }],
    urgent: false,
    resources: [R_EXPERT],
  },
  {
    id: 'k-alcool',
    category: 'Prévention',
    keywords: ['alcool', 'boire', 'ivre', 'tabac', 'cigarette', 'fumer', 'drogue', 'chanvre', 'dépendance', 'addiction'],
    question: 'Quels sont les risques de l’alcool, du tabac et des drogues ?',
    answer:
      "L’alcool et les drogues altèrent le jugement et la vigilance, ce qui augmente les comportements à risque (relations non protégées, accidents, violences). Sous l’effet de l’alcool, on ne peut PAS donner un consentement valable. Le tabac et l’alcool nuisent gravement à la santé à long terme. Si tu consommes, évite de conduire, ne reste pas seul·e, ne laisse pas ta boisson sans surveillance et ne mélange pas alcool et médicaments. Si tu sens que tu perds le contrôle, ou si un·e proche est concerné·e, des professionnels peuvent aider sans juger.",
    myths: [{ myth: 'Un verre, ça ne compte pas.', truth: 'Même en petite quantité, l’alcool altère le jugement et la vigilance.' }],
    followUps: ['Comment réduire les risques ?', 'Vers qui me tourner si je suis dépendant·e ?', 'L’alcool et le consentement ?'],
    sources: [{ title: 'OMS — Alcool', label: 'OMS', url: 'https://www.who.int/fr/news-room/fact-sheets/detail/alcohol' }],
    urgent: false,
    resources: [R_EXPERT],
  },
  {
    id: 'k-hygiene-intime',
    category: 'Hygiène',
    keywords: ['hygiène intime', 'hygiene intime', 'odeur', 'infection vaginale', 'mycose', 'démangeaisons', 'démangeaison', 'perte blanche', 'pertes blanches', 'se laver'],
    question: 'Comment prendre soin de mon hygiène intime ?',
    answer:
      "L’hygiène intime, c’est simple : de l’eau propre à l’extérieur, une fois par jour (plus après le sport), sans produits parfumés ni douches internes qui déséquilibrent la flore. Porte des sous-vêtements en coton et change de protection régulièrement pendant les règles. Des pertes blanches légères peuvent être normales, mais une odeur forte, des démangeaisons ou des douleurs peuvent signaler une infection : consulte, ça se soigne facilement. Ne t’automédique pas.",
    myths: [{ myth: 'Il faut se laver très souvent et avec des produits forts.', truth: 'Faux. Trop de lavage et les produits parfumés abîment la flore protectrice.' }],
    followUps: ['Que faire en cas de démangeaisons ?', 'Les pertes blanches sont-elles normales ?', 'Comment entretenir une coupe menstruelle ?'],
    sources: [{ title: 'OMS — Hygiène', label: 'OMS', url: 'https://www.who.int/fr' }],
    urgent: false,
    resources: [R_CENTRE, R_EXPERT],
  },
  {
    id: 'k-mythes',
    category: 'Mythes',
    keywords: ['mythe', 'vrai ou faux', 'rumeur', 'on dit que', 'c est vrai que', 'idée reçue', 'fellation', 'première fois'],
    question: 'Est-ce vrai que… (idées reçues sur la santé sexuelle) ?',
    answer:
      "Beaucoup d’idées reçues circulent sur la santé sexuelle. Par exemple : la fellation présente un risque d’IST (utilise un préservatif) ; la première fois, on PEUT tomber enceinte ; le VIH ne se transmet PAS par le baiser ; la pilule ne rend PAS stérile ; se laver après un rapport ne protège PAS des IST ; et deux préservatifs ne valent pas mieux qu’un seul. Face à une rumeur, le réflexe utile est simple : vérifier auprès d’un professionnel de santé ou de sources fiables comme celles de l’OMS. Pose ta question ici si tu as un doute, on t’aidera à y voir clair.",
    myths: [
      { myth: 'Fellation = aucun risque.', truth: 'Faux. Certaines IST peuvent se transmettre par la fellation.' },
      { myth: 'Le VIH se transmet par le baiser.', truth: 'Faux.' },
    ],
    followUps: ['Et si je ne suis pas sûr·e d’une information ?', 'Comment repérer une source fiable ?', 'Peux-tu corriger une rumeur précise ?'],
    sources: [{ title: 'OMS — Fiches d’information', label: 'OMS', url: 'https://www.who.int/fr/news-room/fact-sheets' }],
    urgent: false,
    resources: [R_EXPERT],
  },
  {
    id: 'k-aide-benin',
    category: 'Où trouver de l’aide',
    keywords: ['où trouver de l aide', 'ou trouver de l aide', 'aide', 'aider', 'ressources', 'centre de santé', 'contacter un expert', 'benin', 'bénin', 'ligne d écoute'],
    question: 'Où trouver de l’aide au Bénin ?',
    answer:
      "Au Bénin, tu peux trouver de l’aide auprès des centres de santé et de planification familiale, des sages-femmes, des psychologues et des services sociaux. La ligne verte d’écoute 137 est gratuite et disponible 24h/24, et le 112 pour les urgences. Sur WeToo, tu peux poser une question à un expert en toute confidentialité, discuter sur le forum (y compris en anonyme) et suivre des cours. Si tu es en danger immédiat, éloigne-toi et appelle à l’aide tout de suite. Tu n’es jamais seul·e : demander de l’aide est un signe de force.",
    myths: [{ myth: 'Demander de l’aide, c’est avouer sa faiblesse.', truth: 'Faux. C’est une preuve de courage et le premier pas vers le mieux-être.' }],
    followUps: ['Comment contacter un expert WeToo ?', 'Le 137 est-il vraiment gratuit ?', 'Que faire en cas d’urgence ?'],
    sources: [{ title: 'WeToo — Ressources d’aide', label: 'WeToo', url: null }],
    urgent: true,
    resources: [R_137, R_EXPERT, R_CENTRE],
  },
];

export default KNOWLEDGE;
