export type VocabularyItem = {
  word: string;
  translation: string;
  pronunciation: string; // IPA or simplified
  audioUrl: string; // Native speaker audio
  example: string;
  exampleTranslation: string;
  exampleAudioUrl: string;
  culturalNote?: string;
};

export type LessonContent = {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  level: 'beginner' | 'intermediate' | 'advanced';
  difficulty: 1 | 2 | 3 | 4 | 5;
  
  // Learning objectives
  learningGoals: string[];
  
  // Vocabulary with native audio
  vocabulary: VocabularyItem[];
  
  // Cultural context
  culturalStory: {
    title: string;
    content: string;
    islandTip: string;
  };
  
  // Lesson structure
  exercises: {
    listening: number;
    speaking: number;
    matching: number;
    conversation: number;
  };
  
  // Motivation & rewards
  completionMessage: string;
  mascotTip: {
    coco: string;
    lora: string;
  };
  
  // Premium content
  isPremium: boolean;
  unlockRequirement?: {
    streakDays?: number;
    lessonsCompleted?: number;
    xpRequired?: number;
  };
};

export type LearningPath = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  gradient: string[];
  estimatedDuration: string; // "2-3 weeks"
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  
  // Progress tracking
  totalLessons: number;
  lessonsCompleted: number;
  xpReward: number;
  
  // Content
  lessons: LessonContent[];
  
  // Rewards
  completionBadge: string;
  completionTitle: string;
  
  isPremium: boolean;
};

// 🏝️ ISLAND ESSENTIALS PATH - Enhanced for Launch
export const islandEssentialsPath: LearningPath = {
  id: 'island_essentials',
  title: 'Island Essentials',
  subtitle: 'Your first steps into dushi life',
  description: 'Master the basics every visitor and local needs to know',
  icon: '🏝️',
  color: '#00CED1',
  gradient: ['#00CED1', '#20B2AA'],
  estimatedDuration: '1-2 weeks',
  difficulty: 'Beginner',
  totalLessons: 8,
  lessonsCompleted: 0,
  xpReward: 500,
  completionBadge: 'island_beginner',
  completionTitle: 'Island Beginner',
  isPremium: false,
  
  lessons: [
    {
      id: 'basic_greetings',
      title: 'Basic Greetings',
      description: 'Start every conversation with confidence',
      duration: 2,
      level: 'beginner',
      difficulty: 1,
      
      learningGoals: [
        'Greet people at any time of day',
        'Ask how someone is doing',
        'Respond to greetings naturally',
        'Use proper island etiquette'
      ],
      
      vocabulary: [
        {
          word: 'Bon dia',
          translation: 'Good morning',
          pronunciation: 'bone DEE-ah',
          audioUrl: '/audio/native/bon_dia.mp3',
          example: 'Bon dia, kon ta bai?',
          exampleTranslation: 'Good morning, how are you?',
          exampleAudioUrl: '/audio/native/bon_dia_example.mp3',
          culturalNote: 'Used until about 12 PM, very important for politeness'
        },
        {
          word: 'Bon tardi',
          translation: 'Good afternoon',
          pronunciation: 'bone TAR-dee',
          audioUrl: '/audio/native/bon_tardi.mp3',
          example: 'Bon tardi, señora',
          exampleTranslation: 'Good afternoon, ma\'am',
          exampleAudioUrl: '/audio/native/bon_tardi_example.mp3'
        },
        {
          word: 'Bon nochi',
          translation: 'Good evening/night',
          pronunciation: 'bone NO-chee',
          audioUrl: '/audio/native/bon_nochi.mp3',
          example: 'Bon nochi, ayo',
          exampleTranslation: 'Good night, goodbye',
          exampleAudioUrl: '/audio/native/bon_nochi_example.mp3'
        },
        {
          word: 'Kon ta bai?',
          translation: 'How are you?',
          pronunciation: 'cone tah BYE',
          audioUrl: '/audio/native/kon_ta_bai.mp3',
          example: 'Bon dia! Kon ta bai?',
          exampleTranslation: 'Good morning! How are you?',
          exampleAudioUrl: '/audio/native/kon_ta_bai_example.mp3',
          culturalNote: 'The most common way to ask how someone is doing'
        },
        {
          word: 'Mi ta bon',
          translation: 'I\'m good',
          pronunciation: 'mee tah bone',
          audioUrl: '/audio/native/mi_ta_bon.mp3',
          example: 'Mi ta bon, danki',
          exampleTranslation: 'I\'m good, thank you',
          exampleAudioUrl: '/audio/native/mi_ta_bon_example.mp3'
        },
        {
          word: 'Danki',
          translation: 'Thank you',
          pronunciation: 'DAHN-kee',
          audioUrl: '/audio/native/danki.mp3',
          example: 'Danki, mi dushi',
          exampleTranslation: 'Thank you, my dear',
          exampleAudioUrl: '/audio/native/danki_example.mp3'
        }
      ],
      
      culturalStory: {
        title: 'Island Greeting Etiquette',
        content: 'On the islands, greetings are sacred. Never rush past someone without a proper "Bon dia" or "Bon tardi." Locals will always stop what they\'re doing to greet you properly - it\'s a sign of respect and connection.',
        islandTip: '🌴 Pro tip: Add "mi dushi" (my dear) to make any greeting extra warm and local!'
      },
      
      exercises: {
        listening: 3,
        speaking: 2,
        matching: 4,
        conversation: 1
      },
      
      completionMessage: 'Mashá bon! You can now greet locals like a true islander! 🌴',
      
      mascotTip: {
        coco: 'Ayó! Remember, a smile makes every greeting twice as dushi! 😊',
        lora: 'Beautiful work, mi dushi. Greetings open hearts - you\'re already connecting to our culture. 💝'
      },
      
      isPremium: false
    },
    
    {
      id: 'island_pleasantries',
      title: 'Island Pleasantries',
      description: 'Small talk that opens big hearts',
      duration: 3,
      level: 'beginner',
      difficulty: 2,
      
      learningGoals: [
        'Make polite small talk',
        'Ask about the weather and day',
        'Show interest in local life',
        'Connect beyond basic greetings'
      ],
      
      vocabulary: [
        {
          word: 'Kon ta e dia?',
          translation: 'How\'s your day?',
          pronunciation: 'cone tah eh DEE-ah',
          audioUrl: '/audio/native/kon_ta_e_dia.mp3',
          example: 'Kon ta e dia pa bo?',
          exampleTranslation: 'How\'s your day going for you?',
          exampleAudioUrl: '/audio/native/kon_ta_e_dia_example.mp3'
        },
        {
          word: 'Ta kalor',
          translation: 'It\'s hot',
          pronunciation: 'tah kah-LORE',
          audioUrl: '/audio/native/ta_kalor.mp3',
          example: 'Abo, ta kalor awe!',
          exampleTranslation: 'Wow, it\'s hot today!',
          exampleAudioUrl: '/audio/native/ta_kalor_example.mp3',
          culturalNote: 'Always a safe conversation starter on the islands!'
        },
        {
          word: 'Ta dushi',
          translation: 'It\'s nice/sweet/pleasant',
          pronunciation: 'tah DOO-shee',
          audioUrl: '/audio/native/ta_dushi.mp3',
          example: 'E brisa ta dushi',
          exampleTranslation: 'The breeze is nice',
          exampleAudioUrl: '/audio/native/ta_dushi_example.mp3',
          culturalNote: 'The most versatile positive word in Papiamentu!'
        },
        {
          word: 'Tur kos ta bon?',
          translation: 'Everything okay?',
          pronunciation: 'toor kose tah bone',
          audioUrl: '/audio/native/tur_kos_ta_bon.mp3',
          example: 'Tur kos ta bon ku bo?',
          exampleTranslation: 'Is everything okay with you?',
          exampleAudioUrl: '/audio/native/tur_kos_ta_bon_example.mp3'
        }
      ],
      
      culturalStory: {
        title: 'The Art of Island Time',
        content: 'Island conversations flow like Caribbean currents - slow, warm, and meaningful. Don\'t rush. Locals will ask about your family, your day, the weather. It\'s not just politeness, it\'s how we stay connected as a community.',
        islandTip: '🌊 Island secret: "Ta dushi" can describe anything good - weather, food, music, even people!'
      },
      
      exercises: {
        listening: 4,
        speaking: 3,
        matching: 3,
        conversation: 2
      },
      
      completionMessage: 'You\'re learning to talk like family! Locals will love your effort! 💕',
      
      mascotTip: {
        coco: 'Dushi! Now you can chat about anything - weather, vibes, island life! 🌴',
        lora: 'You\'re not just learning words, you\'re learning to connect hearts. That\'s true island wisdom. 🦜'
      },
      
      isPremium: false
    },
    
    {
      id: 'beach_life',
      title: 'Beach Life Essentials',
      description: 'Everything you need for the perfect beach day',
      duration: 3,
      level: 'beginner',
      difficulty: 2,
      
      learningGoals: [
        'Navigate beach activities confidently',
        'Ask for beach equipment and services',
        'Describe weather and water conditions',
        'Order drinks and snacks at beach bars'
      ],
      
      vocabulary: [
        {
          word: 'Playa',
          translation: 'Beach',
          pronunciation: 'PLAH-yah',
          audioUrl: '/audio/native/playa.mp3',
          example: 'Nos ta bai na playa',
          exampleTranslation: 'We\'re going to the beach',
          exampleAudioUrl: '/audio/native/playa_example.mp3'
        },
        {
          word: 'Awa di laman',
          translation: 'Sea water',
          pronunciation: 'AH-wah dee lah-MAHN',
          audioUrl: '/audio/native/awa_di_laman.mp3',
          example: 'E awa di laman ta fresku',
          exampleTranslation: 'The sea water is cool',
          exampleAudioUrl: '/audio/native/awa_di_laman_example.mp3'
        },
        {
          word: 'Sòl',
          translation: 'Sun',
          pronunciation: 'sole',
          audioUrl: '/audio/native/sol.mp3',
          example: 'E sòl ta kaliente',
          exampleTranslation: 'The sun is hot',
          exampleAudioUrl: '/audio/native/sol_example.mp3'
        },
        {
          word: 'Un piña colada',
          translation: 'A piña colada',
          pronunciation: 'oon PEE-nyah ko-LAH-dah',
          audioUrl: '/audio/native/pina_colada.mp3',
          example: 'Por fabor, un piña colada',
          exampleTranslation: 'Please, a piña colada',
          exampleAudioUrl: '/audio/native/pina_colada_example.mp3',
          culturalNote: 'The ultimate island drink - perfect for any beach day!'
        },
        {
          word: 'Brisa',
          translation: 'Breeze',
          pronunciation: 'BREE-sah',
          audioUrl: '/audio/native/brisa.mp3',
          example: 'E brisa ta dushi',
          exampleTranslation: 'The breeze is nice',
          exampleAudioUrl: '/audio/native/brisa_example.mp3'
        }
      ],
      
      culturalStory: {
        title: 'Beach Culture & Paradise Living',
        content: 'Caribbean beaches aren\'t just places - they\'re our living rooms, our social hubs, our therapy sessions. Every local has a favorite beach spot, and sharing it with you is sharing a piece of our soul.',
        islandTip: '🏖️ Local secret: Ask for "e playa lokal" (the local beach) - tourists don\'t know about the hidden gems!'
      },
      
      exercises: {
        listening: 4,
        speaking: 4,
        matching: 3,
        conversation: 2
      },
      
      completionMessage: 'You\'re ready for paradise! Time to hit the beach! ☀️🏖️',
      
      mascotTip: {
        coco: 'Perfect! Now you can surf, chill, and order drinks like a beach boss! 🏄‍♂️',
        lora: 'The ocean is calling your name, mi dushi. You speak its language now. 🌊'
      },
      
      isPremium: false
    },
    
    {
      id: 'local_food_drinks',
      title: 'Local Food & Drinks',
      description: 'Taste the island with confidence',
      duration: 3,
      level: 'beginner',
      difficulty: 2,
      
      learningGoals: [
        'Order traditional dishes confidently',
        'Ask about ingredients and preparations',
        'Express food preferences',
        'Navigate local restaurants and food trucks'
      ],
      
      vocabulary: [
        {
          word: 'Pastechi',
          translation: 'Traditional pastry',
          pronunciation: 'pas-TEH-chee',
          audioUrl: '/audio/native/pastechi.mp3',
          example: 'Dos pastechi di karni',
          exampleTranslation: 'Two meat pastries',
          exampleAudioUrl: '/audio/native/pastechi_example.mp3',
          culturalNote: 'The ultimate local breakfast - crispy outside, savory inside!'
        },
        {
          word: 'Batido',
          translation: 'Fresh fruit smoothie',
          pronunciation: 'bah-TEE-do',
          audioUrl: '/audio/native/batido.mp3',
          example: 'Un batido di mango, por fabor',
          exampleTranslation: 'A mango smoothie, please',
          exampleAudioUrl: '/audio/native/batido_example.mp3'
        },
        {
          word: 'Keshi yena',
          translation: 'Stuffed cheese (national dish)',
          pronunciation: 'KEH-shee YEH-nah',
          audioUrl: '/audio/native/keshi_yena.mp3',
          example: 'Mi ke keshi yena ku karni',
          exampleTranslation: 'I want stuffed cheese with meat',
          exampleAudioUrl: '/audio/native/keshi_yena_example.mp3',
          culturalNote: 'Our national pride! Edam cheese stuffed with spiced meat or chicken'
        },
        {
          word: 'Kuminda krioyo',
          translation: 'Creole food',
          pronunciation: 'koo-MEE-dah KREE-oh-yo',
          audioUrl: '/audio/native/kuminda_krioyo.mp3',
          example: 'Unda tin kuminda krioyo?',
          exampleTranslation: 'Where is there Creole food?',
          exampleAudioUrl: '/audio/native/kuminda_krioyo_example.mp3'
        },
        {
          word: 'Por fabor',
          translation: 'Please',
          pronunciation: 'pore fah-BORE',
          audioUrl: '/audio/native/por_fabor.mp3',
          example: 'E karta, por fabor',
          exampleTranslation: 'The menu, please',
          exampleAudioUrl: '/audio/native/por_fabor_example.mp3'
        }
      ],
      
      culturalStory: {
        title: 'Food is Love, Island Style',
        content: 'In Caribbean culture, sharing food is sharing love. When locals invite you to eat, they\'re inviting you into their family. Every dish tells a story of African, Dutch, Spanish, and indigenous influences coming together.',
        islandTip: '🍽️ Always say "Ta dushi!" after tasting local food - it\'s the best compliment you can give!'
      },
      
      exercises: {
        listening: 4,
        speaking: 3,
        matching: 4,
        conversation: 2
      },
      
      completionMessage: 'You can now eat like a local! Bon probechu! (Enjoy your meal!) 🍹',
      
      mascotTip: {
        coco: 'Wauw! Now you can order all the dushi food - pastechi, batido, everything! 🥭',
        lora: 'Food connects souls, mi dushi. You\'re not just ordering - you\'re participating in our culture. 🍽️'
      },
      
      isPremium: false
    }
  ]
};

// 🛒 MARKET & SHOPPING PATH
export const marketShoppingPath: LearningPath = {
  id: 'market_shopping',
  title: 'Market & Shopping',
  subtitle: 'Shop smart, bargain like a local',
  description: 'Master the art of island commerce and local markets',
  icon: '🛒',
  color: '#FF6B35',
  gradient: ['#FF6B35', '#FF8E53'],
  estimatedDuration: '2-3 weeks',
  difficulty: 'Beginner',
  totalLessons: 6,
  lessonsCompleted: 0,
  xpReward: 400,
  completionBadge: 'market_master',
  completionTitle: 'Market Master',
  isPremium: false,
  
  lessons: [
    {
      id: 'floating_market',
      title: 'Floating Market Magic',
      description: 'Navigate Willemstad\'s famous floating market',
      duration: 3,
      level: 'beginner',
      difficulty: 2,
      
      learningGoals: [
        'Ask for prices and negotiate',
        'Identify fresh fruits and vegetables',
        'Use numbers and currency',
        'Express quantities and preferences'
      ],
      
      vocabulary: [
        {
          word: 'Kuantu e ta kosta?',
          translation: 'How much does it cost?',
          pronunciation: 'KWAN-too eh tah KOSE-tah',
          audioUrl: '/audio/native/kuantu_e_ta_kosta.mp3',
          example: 'Kuantu e mango ta kosta?',
          exampleTranslation: 'How much does the mango cost?',
          exampleAudioUrl: '/audio/native/kuantu_mango_example.mp3'
        },
        {
          word: 'Ta karu',
          translation: 'It\'s expensive',
          pronunciation: 'tah KAH-roo',
          audioUrl: '/audio/native/ta_karu.mp3',
          example: 'Abo, ta karu dje!',
          exampleTranslation: 'Wow, that\'s expensive!',
          exampleAudioUrl: '/audio/native/ta_karu_example.mp3'
        },
        {
          word: 'Mango fresku',
          translation: 'Fresh mango',
          pronunciation: 'MAHN-go FRES-koo',
          audioUrl: '/audio/native/mango_fresku.mp3',
          example: 'Mi ke tres mango fresku',
          exampleTranslation: 'I want three fresh mangoes',
          exampleAudioUrl: '/audio/native/mango_fresku_example.mp3'
        }
      ],
      
      culturalStory: {
        title: 'Venezuelan Boats & Island Trading',
        content: 'The floating market is where Venezuelan boats sell fresh produce directly from their homeland. It\'s been happening for over 100 years - a floating bridge between cultures.',
        islandTip: '⛵ Best time: Early morning when everything is freshest and vendors are most willing to negotiate!'
      },
      
      exercises: {
        listening: 3,
        speaking: 4,
        matching: 3,
        conversation: 3
      },
      
      completionMessage: 'You can now shop the floating market like a pro! 🛥️',
      
      mascotTip: {
        coco: 'Perfecto! Now you can get the freshest fruits and bargain like a local! 🥭',
        lora: 'The floating market holds our trading history, mi dushi. You\'re part of that tradition now. ⛵'
      },
      
      isPremium: false
    }
  ]
};

// 🏖️ ISLAND ADVENTURES PATH  
export const islandAdventuresPath: LearningPath = {
  id: 'island_adventures',
  title: 'Island Adventures',
  subtitle: 'Explore like a local, adventure like a pro',
  description: 'Discover hidden gems and navigate island life',
  icon: '🏖️',
  color: '#9C27B0',
  gradient: ['#9C27B0', '#E91E63'],
  estimatedDuration: '3-4 weeks',
  difficulty: 'Intermediate',
  totalLessons: 8,
  lessonsCompleted: 0,
  xpReward: 600,
  completionBadge: 'island_explorer',
  completionTitle: 'Island Explorer',
  isPremium: true,
  
  lessons: [
    {
      id: 'hidden_beaches',
      title: 'Hidden Beach Secrets',
      description: 'Find the spots only locals know',
      duration: 4,
      level: 'intermediate',
      difficulty: 3,
      
      learningGoals: [
        'Ask for directions to secret spots',
        'Understand local recommendations',
        'Navigate using landmarks',
        'Connect with local beach culture'
      ],
      
      vocabulary: [
        {
          word: 'Playa skondí',
          translation: 'Hidden beach',
          pronunciation: 'PLAH-yah skon-DEE',
          audioUrl: '/audio/native/playa_skondi.mp3',
          example: 'Unda tin playa skondí?',
          exampleTranslation: 'Where are there hidden beaches?',
          exampleAudioUrl: '/audio/native/playa_skondi_example.mp3',
          culturalNote: 'The best beaches are often the ones locals keep secret!'
        }
      ],
      
      culturalStory: {
        title: 'Secret Beach Protocol',
        content: 'Every island has its secret beaches - pristine spots where locals go to escape crowds. Finding them requires trust, respect, and knowing the right questions to ask.',
        islandTip: '🏝️ Secret: Ask "Unda lokal ta bai pa rilaks?" (Where do locals go to relax?)'
      },
      
      exercises: {
        listening: 5,
        speaking: 4,
        matching: 3,
        conversation: 4
      },
      
      completionMessage: 'You\'ve unlocked the island\'s best-kept secrets! 🏖️✨',
      
      mascotTip: {
        coco: 'Wauw! Now you know where to find the most epic hidden spots! 🏄‍♂️',
        lora: 'These secret places are gifts from the island, mi dushi. Treat them with love. 🌊'
      },
      
      isPremium: true,
      unlockRequirement: {
        lessonsCompleted: 5,
        streakDays: 3
      }
    }
  ]
};

export const allLearningPaths = [
  islandEssentialsPath,
  marketShoppingPath,
  islandAdventuresPath
];