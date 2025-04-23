// Définition des modules de formation pour l'application IKIGAI

export const MODULES = [
  // Modules de l'île de la Pleine Conscience
  {
    id: 'mindfulness_intro',
    title: 'Introduction à la pleine conscience',
    description: 'Découvrez les principes fondamentaux de la pleine conscience et ses bienfaits',
    icon: '🧘',
    duration: '15 min',
    points: 100,
    islandId: 'mindfulness',
    content: `
      <div class="mb-4">
        <h3 class="text-xl font-bold mb-2">Qu'est-ce que la pleine conscience ?</h3>
        <p>La pleine conscience est la pratique qui consiste à porter son attention sur le moment présent, délibérément et sans jugement. C'est une façon d'être pleinement présent à ce que vous faites, où vous êtes et avec qui vous êtes.</p>
      </div>
      
      <div class="mb-4">
        <h3 class="text-xl font-bold mb-2">Bienfaits au travail</h3>
        <ul class="list-disc pl-5 space-y-2">
          <li>Réduction du stress et de l'anxiété</li>
          <li>Amélioration de la concentration et de la productivité</li>
          <li>Meilleure gestion des émotions</li>
          <li>Relations professionnelles plus harmonieuses</li>
        </ul>
      </div>
    `,
    questions: [
      {
        id: 'mindfulness_understanding',
        question: 'Selon vous, qu\'est-ce que la pleine conscience ?',
        type: 'multiple_choice',
        required: true,
        options: [
          { id: 'a', label: 'Une technique pour ne penser qu\'au futur' },
          { id: 'b', label: 'La capacité à faire plusieurs choses en même temps' },
          { id: 'c', label: 'Porter son attention sur le moment présent, sans jugement' },
          { id: 'd', label: 'Une méthode pour éviter les pensées négatives uniquement' }
        ]
      },
      {
        id: 'mindfulness_benefits',
        question: 'Quels bienfaits de la pleine conscience vous intéressent le plus ?',
        type: 'checkbox',
        required: true,
        maxSelect: 2,
        options: [
          { id: 'a', label: 'Réduction du stress' },
          { id: 'b', label: 'Meilleure concentration' },
          { id: 'c', label: 'Amélioration du sommeil' },
          { id: 'd', label: 'Gestion des émotions' },
          { id: 'e', label: 'Relations plus harmonieuses' }
        ]
      }
    ]
  },
  {
    id: 'mindfulness_breathing',
    title: 'Techniques de respiration',
    description: 'Apprenez des exercices de respiration pour vous recentrer rapidement',
    icon: '🫁',
    duration: '10 min',
    points: 100,
    islandId: 'mindfulness',
    content: `
      <div class="mb-4">
        <h3 class="text-xl font-bold mb-2">La respiration consciente</h3>
        <p>La respiration est une ancre puissante pour nous ramener au moment présent. Ces techniques simples peuvent être pratiquées n'importe où, même au bureau.</p>
      </div>
      
      <div class="mb-4">
        <h3 class="text-xl font-bold mb-2">Technique 4-7-8</h3>
        <ol class="list-decimal pl-5 space-y-2">
          <li>Inspirez par le nez pendant 4 secondes</li>
          <li>Retenez votre souffle pendant 7 secondes</li>
          <li>Expirez lentement par la bouche pendant 8 secondes</li>
          <li>Répétez 3 à 5 fois</li>
        </ol>
      </div>
    `,
    questions: [
      {
        id: 'breathing_frequency',
        question: 'À quelle fréquence pratiquez-vous des exercices de respiration ?',
        type: 'multiple_choice',
        required: true,
        options: [
          { id: 'a', label: 'Jamais' },
          { id: 'b', label: 'Rarement' },
          { id: 'c', label: 'Occasionnellement' },
          { id: 'd', label: 'Régulièrement' }
        ]
      },
      {
        id: 'breathing_benefits',
        question: 'Sur une échelle de 1 à 5, à quel point vous sentez-vous détendu après avoir pratiqué l\'exercice 4-7-8 ?',
        type: 'scale',
        required: true,
        max: 5,
        labels: ['Pas du tout', 'Extrêmement']
      }
    ]
  },
  
  // Modules de l'île de la Productivité
  {
    id: 'productivity_focus',
    title: 'Techniques de concentration',
    description: 'Découvrez des méthodes pour améliorer votre focus et éviter les distractions',
    icon: '🎯',
    duration: '12 min',
    points: 100,
    islandId: 'productivity',
    content: `
      <div class="mb-4">
        <h3 class="text-xl font-bold mb-2">La méthode Pomodoro</h3>
        <p>Cette technique consiste à travailler en intervalles de 25 minutes, suivis de courtes pauses de 5 minutes. Après 4 cycles, prenez une pause plus longue de 15-30 minutes.</p>
      </div>
      
      <div class="mb-4">
        <h3 class="text-xl font-bold mb-2">Éliminer les distractions</h3>
        <ul class="list-disc pl-5 space-y-2">
          <li>Désactivez les notifications</li>
          <li>Utilisez des applications de blocage</li>
          <li>Communiquez vos plages de concentration à vos collègues</li>
        </ul>
      </div>
    `,
    questions: [
      {
        id: 'focus_challenges',
        question: 'Quelles sont vos principales sources de distraction au travail ?',
        type: 'checkbox',
        required: true,
        options: [
          { id: 'a', label: 'Notifications (email, messagerie)' },
          { id: 'b', label: 'Collègues qui interrompent' },
          { id: 'c', label: 'Réseaux sociaux' },
          { id: 'd', label: 'Pensées vagabondes' },
          { id: 'e', label: 'Bruit ambiant' }
        ]
      },
      {
        id: 'pomodoro_interest',
        question: 'Pensez-vous que la méthode Pomodoro pourrait vous aider ?',
        type: 'multiple_choice',
        required: true,
        options: [
          { id: 'a', label: 'Oui, certainement' },
          { id: 'b', label: 'Peut-être' },
          { id: 'c', label: 'Je ne suis pas sûr' },
          { id: 'd', label: 'Non, cela ne me conviendrait pas' }
        ]
      }
    ]
  },
  
  // Modules de l'île Anti-Stress
  {
    id: 'stress_management',
    title: 'Gestion du stress',
    description: 'Apprenez à identifier et gérer efficacement votre stress au travail',
    icon: '🌊',
    duration: '15 min',
    points: 100,
    islandId: 'stress',
    content: `
      <div class="mb-4">
        <h3 class="text-xl font-bold mb-2">Reconnaître les signes du stress</h3>
        <p>Le stress se manifeste différemment selon les personnes : irritabilité, fatigue, troubles du sommeil, difficultés de concentration, tensions musculaires...</p>
      </div>
      
      <div class="mb-4">
        <h3 class="text-xl font-bold mb-2">Techniques rapides d'apaisement</h3>
        <ul class="list-disc pl-5 space-y-2">
          <li>Respiration profonde pendant 2 minutes</li>
          <li>Étirements au bureau</li>
          <li>Visualisation positive</li>
          <li>Courte marche à l'extérieur</li>
        </ul>
      </div>
    `,
    questions: [
      {
        id: 'stress_level',
        question: 'Comment évaluez-vous votre niveau de stress actuel ?',
        type: 'scale',
        required: true,
        max: 5,
        labels: ['Très élevé', 'Très bas']
      },
      {
        id: 'stress_symptoms',
        question: 'Quels symptômes de stress ressentez-vous le plus souvent ?',
        type: 'checkbox',
        required: true,
        options: [
          { id: 'a', label: 'Fatigue' },
          { id: 'b', label: 'Irritabilité' },
          { id: 'c', label: 'Troubles du sommeil' },
          { id: 'd', label: 'Difficultés de concentration' },
          { id: 'e', label: 'Tensions musculaires' }
        ]
      }
    ]
  },
  
  // Modules de l'île de l'Équilibre
  {
    id: 'work_life_balance',
    title: 'Équilibre vie pro/perso',
    description: 'Découvrez des stratégies pour mieux concilier vie professionnelle et personnelle',
    icon: '⚖️',
    duration: '12 min',
    points: 100,
    islandId: 'balance',
    content: `
      <div class="mb-4">
        <h3 class="text-xl font-bold mb-2">Définir ses limites</h3>
        <p>Établir des frontières claires entre travail et vie personnelle est essentiel pour préserver son équilibre et son bien-être.</p>
      </div>
      
      <div class="mb-4">
        <h3 class="text-xl font-bold mb-2">Stratégies pratiques</h3>
        <ul class="list-disc pl-5 space-y-2">
          <li>Définir des horaires de travail fixes</li>
          <li>Créer des rituels de transition</li>
          <li>Désactiver les notifications professionnelles en dehors des heures de travail</li>
          <li>Planifier des activités personnelles importantes</li>
        </ul>
      </div>
    `,
    questions: [
      {
        id: 'balance_satisfaction',
        question: 'Êtes-vous satisfait de votre équilibre actuel entre vie professionnelle et personnelle ?',
        type: 'scale',
        required: true,
        max: 5,
        labels: ['Pas du tout', 'Totalement']
      },
      {
        id: 'balance_challenges',
        question: 'Quels sont vos plus grands défis pour maintenir cet équilibre ?',
        type: 'text',
        required: true,
        placeholder: 'Partagez vos défis...',
      }
    ]
  }
];