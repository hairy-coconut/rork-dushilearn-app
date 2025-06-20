export type ExerciseType = 
  | "multiple-choice" 
  | "translation" 
  | "matching" 
  | "fill-blank"
  | "vocab"
  | "text-input"
  | "dropdown"
  | "spot-error";

export type Exercise = {
  id: string;
  type: "multiple-choice" | "translation" | "fill-blank" | "matching" | "spot-error";
  question: string;
  options?: string[];
  correctAnswer: string;
  translation?: string;
  lessonId: string;
  questionWord: string;
  feedback?: {
    correct: string;
    incorrect: string;
  };
  isPremium?: boolean;
};

export type ExerciseSet = {
  lessonId: string;
  exercises: Exercise[];
};

export const exerciseSets: Record<string, ExerciseSet> = {
  "island-greetings": {
    lessonId: "island-greetings",
    exercises: [
      {
        id: "greet1",
        type: "multiple-choice",
        question: "What's the best way to greet someone in the morning?",
        options: [
          "Bon dia",
          "Bon tardi",
          "Bon nochi",
          "Bon siman"
        ],
        correctAnswer: "Bon dia",
        translation: "Good morning",
        lessonId: "island-greetings",
        questionWord: "morning greeting",
        feedback: {
          correct: "🌴 Perfect! You're speaking like a local already!",
          incorrect: "💡 Remember: 'Bon dia' is used in the morning!"
        },
        isPremium: false
      },
      {
        id: "greet2",
        type: "fill-blank",
        question: "Complete the conversation:\nA: 'Bon dia!'\nB: '...'\nA: 'Kon ta bai?'\nB: '...'",
        correctAnswer: "Bon dia! Mi ta bon, danki!",
        translation: "Good morning! I'm good, thanks!",
        lessonId: "island-greetings",
        questionWord: "greeting conversation",
        feedback: {
          correct: "🎉 Excellent! You're mastering the local greetings!",
          incorrect: "💭 Try again! Remember to respond to both the greeting and the question."
        },
        isPremium: false
      }
    ]
  },
  "beach-essentials": {
    lessonId: "beach-essentials",
    exercises: [
      {
        id: "beach1",
        type: "multiple-choice",
        question: "How do you say 'The water is cool'?",
        options: [
          "E awa ta fresku",
          "E awa ta kalor",
          "E awa ta dushi",
          "E awa ta bon"
        ],
        correctAnswer: "E awa ta fresku",
        translation: "The water is cool",
        lessonId: "beach-essentials",
        questionWord: "water temperature",
        feedback: {
          correct: "🏖️ Perfect! You're ready for the beach!",
          incorrect: "💡 Remember: 'fresku' means cool!"
        },
        isPremium: false
      },
      {
        id: "beach2",
        type: "translation",
        question: "Translate: 'We're going to the beach'",
        correctAnswer: "Nos ta bai na playa",
        lessonId: "beach-essentials",
        questionWord: "beach plans",
        feedback: {
          correct: "🌊 Excellent! You're speaking like a local!",
          incorrect: "💭 Remember: 'Nos ta bai' means 'We're going'"
        },
        isPremium: false
      }
    ]
  },
  "love-flirtation": {
    lessonId: "love-flirtation",
    exercises: [
      {
        id: "love1",
        type: "multiple-choice",
        question: "How do you say 'You're sweet' to someone you like?",
        options: [
          "Bo ta dushi",
          "Bo ta bon",
          "Bo ta fresku",
          "Bo ta kalor"
        ],
        correctAnswer: "Bo ta dushi",
        translation: "You're sweet",
        lessonId: "love-flirtation",
        questionWord: "romantic compliment",
        feedback: {
          correct: "💝 Perfect! That's the sweetest compliment!",
          incorrect: "💡 Remember: 'dushi' is the sweetest word in Papiamentu!"
        },
        isPremium: true
      },
      {
        id: "love2",
        type: "fill-blank",
        question: "Complete the romantic conversation:\nA: 'Mi stima bo, mi ...'\nB: 'Mi ... bo tambe!'",
        correctAnswer: "dushi, stima",
        translation: "I love you, my sweet, I love you too!",
        lessonId: "love-flirtation",
        questionWord: "love confession",
        feedback: {
          correct: "💖 Beautiful! You're speaking the language of love!",
          incorrect: "💭 Remember: 'stima' means love and 'dushi' means sweet!"
        },
        isPremium: true
      }
    ]
  },
  "local-slang": {
    lessonId: "local-slang",
    exercises: [
      {
        id: "slang1",
        type: "multiple-choice",
        question: "What does 'Hende loko' mean?",
        options: [
          "Crazy people",
          "Happy people",
          "Sad people",
          "Tired people"
        ],
        correctAnswer: "Crazy people",
        translation: "Crazy people",
        lessonId: "local-slang",
        questionWord: "local expression",
        feedback: {
          correct: "😄 Perfect! You're getting the local humor!",
          incorrect: "💡 'Hende loko' is a fun way to say 'crazy people'!"
        },
        isPremium: true
      },
      {
        id: "slang2",
        type: "spot-error",
        question: "Find the mistake in this conversation:\nA: 'Bo ta un dushi!'\nB: 'No wak bo!'\nA: 'Hende loko!'",
        correctAnswer: "No wak bo",
        translation: "Don't look at you",
        lessonId: "local-slang",
        questionWord: "slang error",
        feedback: {
          correct: "🎯 Great catch! It should be 'No wak mi'!",
          incorrect: "👀 Look at the pronouns in the conversation!"
        },
        isPremium: true
      }
    ]
  },
  "introductions": {
    lessonId: "introductions",
    exercises: [
      {
        id: "intro1",
        type: "multiple-choice",
        question: "How do you say 'My name is...' in Papiamento?",
        options: ["Mi ta...", "Mi nomber ta...", "Mi yama...", "Ami ta..."],
        correctAnswer: "Mi nomber ta...",
        translation: "My name is...",
        lessonId: "introductions",
        questionWord: "Mi nomber ta"
      },
      {
        id: "intro2",
        type: "translation",
        question: "Translate 'I am from...' to Papiamento",
        correctAnswer: "Mi ta di...",
        lessonId: "introductions",
        questionWord: "Mi ta di"
      },
      {
        id: "intro3",
        type: "multiple-choice",
        question: "How do you ask 'What is your name?' in Papiamento?",
        options: ["Kon ta bai?", "Ken bo ta?", "Kiko bo nomber ta?", "Di unda bo ta?"],
        correctAnswer: "Kiko bo nomber ta?",
        translation: "What is your name?",
        lessonId: "introductions",
        questionWord: "Kiko bo nomber ta?"
      }
    ]
  },
  "bon-bini-curacao": {
    lessonId: "bon-bini-curacao",
    exercises: [
      // Step 1: Essential Vocabulary
      { id: "bb1", type: "vocab", question: "Bon dia", correctAnswer: "Good morning/day" },
      { id: "bb2", type: "vocab", question: "Bon tardi", correctAnswer: "Good afternoon" },
      { id: "bb3", type: "vocab", question: "Bon nochi", correctAnswer: "Good night" },
      { id: "bb4", type: "vocab", question: "Bon bini", correctAnswer: "Welcome" },
      { id: "bb5", type: "vocab", question: "Masha danki", correctAnswer: "Thank you very much" },
      { id: "bb6", type: "vocab", question: "Mi nòmber ta…", correctAnswer: "My name is..." },
      // Step 2: Interactive Activity
      { id: "bb7", type: "text-input", question: "Introduce yourself in Papiamentu! (e.g., Bon dia, mi nòmber ta Alex!)", correctAnswer: "Bon dia, mi nòmber ta" },
      { id: "bb8", type: "fill-blank", question: "Good afternoon! = Bon _____", correctAnswer: "tardi" },
      { id: "bb9", type: "fill-blank", question: "My name is Maria. = Mi _____ ta Maria", correctAnswer: "nòmber" },
      // Step 3: Quick Quiz (Matching)
      { id: "bb10", type: "matching", question: "Match the phrases:", options: ["Bon nochi", "Bon dia", "Mi nòmber ta…"], correctAnswer: "Good night|Good morning/day|My name is..." },
    ],
  },
  "island-vibes-basic-phrases": {
    lessonId: "island-vibes-basic-phrases",
    exercises: [
      // Step 1: Essential Vocabulary
      { id: "iv1", type: "vocab", question: "Kon ta bai?", correctAnswer: "How are you?" },
      { id: "iv2", type: "vocab", question: "Bon, danki!", correctAnswer: "Good, thanks!" },
      { id: "iv3", type: "vocab", question: "Pasa bon!", correctAnswer: "Have a good time!" },
      { id: "iv4", type: "vocab", question: "Te aworó!", correctAnswer: "See you later!" },
      { id: "iv5", type: "vocab", question: "Ayo!", correctAnswer: "Goodbye!" },
      { id: "iv6", type: "vocab", question: "Por fabor", correctAnswer: "Please" },
      { id: "iv7", type: "vocab", question: "Despensa", correctAnswer: "Excuse me" },
      { id: "iv8", type: "vocab", question: "No tin problema", correctAnswer: "No problem" },
      { id: "iv9", type: "vocab", question: "Si / No", correctAnswer: "Yes / No" },
      { id: "iv10", type: "vocab", question: "Mi gusta", correctAnswer: "I like it!" },
      // Step 2: Interactive Role-play (Dropdown)
      { id: "iv11", type: "dropdown", question: "Visitor: Kon ta bai?\nLocal: [Bon, danki! / Mi gusta!]", options: ["Bon, danki!", "Mi gusta!"], correctAnswer: "Bon, danki!" },
      { id: "iv12", type: "dropdown", question: "Visitor: [Bon, danki! / Te aworó!]\nLocal: Pasa bon!", options: ["Bon, danki!", "Te aworó!"], correctAnswer: "Te aworó!" },
      // Step 3: Phrase Match Game (Drag-and-drop)
      { id: "iv13", type: "matching", question: "Match each phrase to its meaning:", options: ["Pasa bon", "Despensa", "No tin problema"], correctAnswer: "Have a good time!|Excuse me|No problem" },
    ],
  },
  "numbers-counting": {
    lessonId: "numbers-counting",
    exercises: [
      {
        id: "num1",
        type: "multiple-choice",
        question: "How do you say 'I want two smoothies'?",
        options: [
          "Mi ke dos batido",
          "Mi ke un batido",
          "Mi ke tres batido",
          "Mi ke sinku batido"
        ],
        correctAnswer: "Mi ke dos batido",
        translation: "I want two smoothies",
        lessonId: "numbers-counting",
        questionWord: "ordering numbers",
        feedback: {
          correct: "🍹 Perfect! You're ready to order like a local!",
          incorrect: "💡 Remember: 'dos' means two!"
        }
      },
      {
        id: "num2",
        type: "matching",
        question: "Match the numbers with their meanings:",
        options: [
          "Un - One",
          "Dos - Two",
          "Tres - Three",
          "Kuater - Four"
        ],
        correctAnswer: "Un - One, Dos - Two, Tres - Three, Kuater - Four",
        lessonId: "numbers-counting",
        questionWord: "number matching",
        feedback: {
          correct: "🎯 Excellent! You're counting like a pro!",
          incorrect: "📝 Try again! Remember the sequence: un, dos, tres, kuater..."
        }
      }
    ]
  },
  "days-months": {
    lessonId: "days-months",
    exercises: [
      {
        id: "days1",
        type: "multiple-choice",
        question: "How do you say 'Monday' in Papiamentu?",
        options: ["Djamars", "Djaluna", "Djarason", "Djaweps"],
        correctAnswer: "Djaluna",
        translation: "Monday",
        lessonId: "days-months",
        questionWord: "Djaluna"
      },
      {
        id: "days2",
        type: "translation",
        question: "Translate 'Friday' to Papiamentu",
        correctAnswer: "Djabièrnè",
        lessonId: "days-months",
        questionWord: "Djabièrnè"
      },
      {
        id: "days3",
        type: "multiple-choice",
        question: "What day is 'Djasabra'?",
        options: ["Thursday", "Friday", "Saturday", "Sunday"],
        correctAnswer: "Saturday",
        translation: "Saturday",
        lessonId: "days-months",
        questionWord: "Djasabra"
      },
      {
        id: "months1",
        type: "multiple-choice",
        question: "How do you say 'January' in Papiamentu?",
        options: ["Febrüari", "Yanüari", "Mart", "April"],
        correctAnswer: "Yanüari",
        translation: "January",
        lessonId: "days-months",
        questionWord: "Yanüari"
      },
      {
        id: "months2",
        type: "translation",
        question: "Translate 'July' to Papiamentu",
        correctAnswer: "Yüli",
        lessonId: "days-months",
        questionWord: "Yüli"
      },
      {
        id: "months3",
        type: "multiple-choice",
        question: "What month is 'Novèmber'?",
        options: ["October", "November", "December", "September"],
        correctAnswer: "November",
        translation: "November",
        lessonId: "days-months",
        questionWord: "Novèmber"
      }
    ]
  },
  "time-weather": {
    lessonId: "time-weather",
    exercises: [
      {
        id: "time1",
        type: "multiple-choice",
        question: "How do you ask 'What time is it?' in Papiamentu?",
        options: ["Ki ora ta?", "Ki dia ta?", "Ki mes ta?", "Ki tempu ta?"],
        correctAnswer: "Ki ora ta?",
        translation: "What time is it?",
        lessonId: "time-weather",
        questionWord: "Ki ora ta?"
      },
      {
        id: "time2",
        type: "translation",
        question: "Translate 'It's finished' to Papiamentu",
        correctAnswer: "Ta kaba",
        lessonId: "time-weather",
        questionWord: "Ta kaba"
      },
      {
        id: "time3",
        type: "multiple-choice",
        question: "What does 'Ta kuminsá' mean?",
        options: ["It's finished", "It's starting", "It's raining", "It's sunny"],
        correctAnswer: "It's starting",
        translation: "It's starting",
        lessonId: "time-weather",
        questionWord: "Ta kuminsá"
      },
      {
        id: "weather1",
        type: "multiple-choice",
        question: "How do you say 'It's hot' in Papiamentu?",
        options: ["Ta fresku", "Ta kalor", "Ta yobida", "Ta sòl"],
        correctAnswer: "Ta kalor",
        translation: "It's hot",
        lessonId: "time-weather",
        questionWord: "Ta kalor"
      },
      {
        id: "weather2",
        type: "translation",
        question: "Translate 'It's raining' to Papiamentu",
        correctAnswer: "Ta yobida",
        lessonId: "time-weather",
        questionWord: "Ta yobida"
      },
      {
        id: "weather3",
        type: "multiple-choice",
        question: "What does 'Ta fresku' mean?",
        options: ["It's hot", "It's cool", "It's raining", "It's sunny"],
        correctAnswer: "It's cool",
        translation: "It's cool",
        lessonId: "time-weather",
        questionWord: "Ta fresku"
      },
      {
        id: "weather4",
        type: "multiple-choice",
        question: "How do you say 'It's sunny' in Papiamentu?",
        options: ["Ta kalor", "Ta fresku", "Ta yobida", "Ta sòl"],
        correctAnswer: "Ta sòl",
        translation: "It's sunny",
        lessonId: "time-weather",
        questionWord: "Ta sòl"
      },
      {
        id: "time5",
        type: "multiple-choice",
        question: "Complete the conversation about plans:\nA: 'Ki ora nos ta bai na playa?'\nB: 'Nos por bai na ...'\nA: 'Ta bon! I ki tempu ta?'\nB: 'Ta ...'",
        options: [
          "2 ora i ta sòl",
          "3 ora i ta yobida",
          "4 ora i ta fresku",
          "5 ora i ta kalor"
        ],
        correctAnswer: "2 ora i ta sòl",
        translation: "2 o'clock and it's sunny",
        lessonId: "time-weather",
        questionWord: "time and weather"
      },
      {
        id: "time6",
        type: "translation",
        question: "Translate this conversation about the beach:\n'What time are we going to the beach?'\n'We can go at 2 PM.'\n'Is it sunny?'\n'Yes, it's a beautiful day!'",
        correctAnswer: "Ki ora nos ta bai na playa?\nNos por bai na 2 ora di tardi.\nTa sòl?\nSi, ta un dia bunita!",
        lessonId: "time-weather",
        questionWord: "beach plans"
      },
      {
        id: "time7",
        type: "multiple-choice",
        question: "Complete the conversation about beach plans:\nA: 'Bon dia! Ki tempu ta?'\nB: 'Ta sòl i ta kalor.'\nA: 'Ki ora nos ta bai na playa?'\nB: 'Nos por bai na ...'\nA: 'I unda nos ta bai?'\nB: 'Nos ta bai na ...'",
        options: [
          "2 ora i Playa Porto Mari",
          "3 ora i Playa Kenepa",
          "4 ora i Playa Piskado",
          "5 ora i Playa Lagun"
        ],
        correctAnswer: "2 ora i Playa Porto Mari",
        translation: "2 o'clock and Porto Mari Beach",
        lessonId: "time-weather",
        questionWord: "beach planning"
      }
    ]
  },
  "family-relationships": {
    lessonId: "family-relationships",
    exercises: [
      {
        id: "family1",
        type: "multiple-choice",
        question: "How do you say 'Mother' in Papiamentu?",
        options: ["Papa", "Mama", "Tanta", "Tio"],
        correctAnswer: "Mama",
        translation: "Mother",
        lessonId: "family-relationships",
        questionWord: "Mama"
      },
      {
        id: "family2",
        type: "translation",
        question: "Translate 'Father' to Papiamentu",
        correctAnswer: "Papa",
        lessonId: "family-relationships",
        questionWord: "Papa"
      },
      {
        id: "family3",
        type: "multiple-choice",
        question: "What does 'Ruman' mean?",
        options: ["Child", "Sibling", "Aunt", "Uncle"],
        correctAnswer: "Sibling",
        translation: "Sibling",
        lessonId: "family-relationships",
        questionWord: "Ruman"
      },
      {
        id: "family4",
        type: "multiple-choice",
        question: "How do you say 'Grandmother' in Papiamentu?",
        options: ["Abuela", "Abuelo", "Tanta", "Tio"],
        correctAnswer: "Abuela",
        translation: "Grandmother",
        lessonId: "family-relationships",
        questionWord: "Abuela"
      },
      {
        id: "family5",
        type: "translation",
        question: "Translate 'Aunt' to Papiamentu",
        correctAnswer: "Tanta",
        lessonId: "family-relationships",
        questionWord: "Tanta"
      },
      {
        id: "family6",
        type: "multiple-choice",
        question: "What does 'Yiu' mean?",
        options: ["Child", "Sibling", "Aunt", "Uncle"],
        correctAnswer: "Child",
        translation: "Child",
        lessonId: "family-relationships",
        questionWord: "Yiu"
      }
    ]
  },
  "shopping-markets": {
    lessonId: "shopping-markets",
    exercises: [
      {
        id: "shopping1",
        type: "multiple-choice",
        question: "How do you ask 'How much does it cost?' in Papiamentu?",
        options: ["Ki ora ta?", "Kuantu e ta kosta?", "Ki dia ta?", "Ki mes ta?"],
        correctAnswer: "Kuantu e ta kosta?",
        translation: "How much does it cost?",
        lessonId: "shopping-markets",
        questionWord: "Kuantu e ta kosta?"
      },
      {
        id: "shopping2",
        type: "translation",
        question: "Translate 'It's too expensive' to Papiamentu",
        correctAnswer: "Ta muy karu",
        lessonId: "shopping-markets",
        questionWord: "Ta muy karu"
      },
      {
        id: "shopping3",
        type: "multiple-choice",
        question: "What does 'Mi ta bai' mean?",
        options: ["It's good", "I'll take it", "It's too expensive", "How much is it?"],
        correctAnswer: "I'll take it",
        translation: "I'll take it",
        lessonId: "shopping-markets",
        questionWord: "Mi ta bai"
      },
      {
        id: "shopping4",
        type: "multiple-choice",
        question: "How do you say 'It's good' in Papiamentu?",
        options: ["Ta muy karu", "Ta bon", "Mi ta bai", "Kuantu e ta kosta?"],
        correctAnswer: "Ta bon",
        translation: "It's good",
        lessonId: "shopping-markets",
        questionWord: "Ta bon"
      },
      {
        id: "shopping5",
        type: "translation",
        question: "Translate 'I want to buy this' to Papiamentu",
        correctAnswer: "Mi ke kumpra esaki",
        lessonId: "shopping-markets",
        questionWord: "Mi ke kumpra esaki"
      },
      {
        id: "shopping6",
        type: "multiple-choice",
        question: "What does 'Ta muy barata' mean?",
        options: ["It's too expensive", "It's very cheap", "It's good", "I'll take it"],
        correctAnswer: "It's very cheap",
        translation: "It's very cheap",
        lessonId: "shopping-markets",
        questionWord: "Ta muy barata"
      },
      {
        id: "shopping7",
        type: "multiple-choice",
        question: "How do you say 'Do you have this in another color?' in Papiamentu?",
        options: ["Bo tin esaki den otro koló?", "Kuantu e ta kosta?", "Ta muy karu", "Mi ta bai"],
        correctAnswer: "Bo tin esaki den otro koló?",
        translation: "Do you have this in another color?",
        lessonId: "shopping-markets",
        questionWord: "Bo tin esaki den otro koló?"
      },
      {
        id: "shopping8",
        type: "multiple-choice",
        question: "Complete the conversation:\nVendedor: 'Kuantu e ta kosta?'\nBo: 'E ta kosta 25 florin.'\nVendedor: 'Ta muy karu!'\nBo: 'Mi por duna bo 20 florin.'\nVendedor: '...'",
        options: ["Ta bon, mi ta bai", "No, ta muy barata", "Mi ke mas", "No tin problema"],
        correctAnswer: "Ta bon, mi ta bai",
        translation: "Okay, I'll take it",
        lessonId: "shopping-markets",
        questionWord: "Ta bon, mi ta bai"
      },
      {
        id: "shopping9",
        type: "translation",
        question: "Translate this market conversation:\n'How much are these fruits?'\n'They cost 15 florin.'\n'That's too expensive. Can you give me a discount?'\n'Okay, I'll give it to you for 12 florin.'",
        correctAnswer: "Kuantu e fruta aki ta kosta?\nE ta kosta 15 florin.\nTa muy karu. Bo por duna mi un deskwento?\nTa bon, mi ta duna bo 12 florin.",
        lessonId: "shopping-markets",
        questionWord: "market conversation"
      },
      {
        id: "shopping10",
        type: "multiple-choice",
        question: "Complete the conversation at the market:\nVendedor: 'Bon dia! Ki bo ke?'\nBo: 'Mi ke un kilo di ...'\nVendedor: 'E ta kosta 12 florin.'\nBo: 'Ta muy karu. Mi por paga 10 florin?'\nVendedor: 'Ta bon, mi ta bai.'",
        options: [
          "fruta i un batido",
          "kuminda i un kafé",
          "bebida i un pastechi",
          "bestia i un palu"
        ],
        correctAnswer: "fruta i un batido",
        translation: "fruit and a smoothie",
        lessonId: "shopping-markets",
        questionWord: "market order"
      }
    ]
  },
  "food-drinks": {
    lessonId: "food-drinks",
    exercises: [
      {
        id: "food1",
        type: "translation",
        question: "Translate this order at a beach bar:\n'I would like a mango smoothie and two pastries, please.'",
        correctAnswer: "Mi ke un batido di mango i dos pastechi, por fabor.",
        lessonId: "food-drinks",
        questionWord: "beach bar order",
        feedback: {
          correct: "🍹 Dushi! You're ordering like a true islander!",
          incorrect: "💭 Remember: 'batido di mango' for mango smoothie and 'pastechi' for pastries!"
        }
      },
      {
        id: "food2",
        type: "multiple-choice",
        question: "What's the best way to compliment the food?",
        options: [
          "Ta dushi!",
          "Ta bon!",
          "Ta fresku!",
          "Ta kalor!"
        ],
        correctAnswer: "Ta dushi!",
        translation: "It's delicious!",
        lessonId: "food-drinks",
        questionWord: "food compliment",
        feedback: {
          correct: "😋 Perfect! That's the highest compliment you can give!",
          incorrect: "💡 'Ta dushi!' is the local way to say something is delicious!"
        }
      },
      {
        id: "food3",
        type: "multiple-choice",
        question: "What does 'Restorant' mean?",
        options: ["Food", "Drink", "Restaurant", "Coffee"],
        correctAnswer: "Restaurant",
        translation: "Restaurant",
        lessonId: "food-drinks",
        questionWord: "Restorant"
      },
      {
        id: "food4",
        type: "multiple-choice",
        question: "How do you say 'Coffee' in Papiamentu?",
        options: ["Bira", "Kafé", "Batido", "Bebida"],
        correctAnswer: "Kafé",
        translation: "Coffee",
        lessonId: "food-drinks",
        questionWord: "Kafé"
      },
      {
        id: "food5",
        type: "translation",
        question: "Translate 'Beer' to Papiamentu",
        correctAnswer: "Bira",
        lessonId: "food-drinks",
        questionWord: "Bira"
      },
      {
        id: "food6",
        type: "multiple-choice",
        question: "What does 'Batido' mean?",
        options: ["Beer", "Coffee", "Smoothie", "Water"],
        correctAnswer: "Smoothie",
        translation: "Smoothie",
        lessonId: "food-drinks",
        questionWord: "Batido"
      },
      {
        id: "food7",
        type: "multiple-choice",
        question: "How do you say 'I'm hungry' in Papiamentu?",
        options: ["Mi ta sed", "Mi ta hambri", "Mi ta kansa", "Mi ta fresku"],
        correctAnswer: "Mi ta hambri",
        translation: "I'm hungry",
        lessonId: "food-drinks",
        questionWord: "Mi ta hambri"
      },
      {
        id: "food8",
        type: "translation",
        question: "Translate 'I'm thirsty' to Papiamentu",
        correctAnswer: "Mi ta sed",
        lessonId: "food-drinks",
        questionWord: "Mi ta sed"
      },
      {
        id: "food9",
        type: "multiple-choice",
        question: "Complete the restaurant conversation:\nMesero: 'Bon dia! Ki bo ke bebe?'\nBo: 'Mi ke un ...'\nMesero: 'Ta bon! I ki bo ke kome?'\nBo: 'Mi ta hambri, mi ke ...'",
        options: [
          "Kafé i un pastechi",
          "Bira i un batido",
          "Batido i un kuminda",
          "Bebida i un restorant"
        ],
        correctAnswer: "Kafé i un pastechi",
        translation: "Coffee and a pastechi",
        lessonId: "food-drinks",
        questionWord: "restaurant order"
      },
      {
        id: "food10",
        type: "translation",
        question: "Translate this restaurant conversation:\n'Good afternoon! What would you like to drink?'\n'I'm thirsty, I'd like a smoothie.'\n'And what would you like to eat?'\n'I'm hungry, I'd like some local food.'",
        correctAnswer: "Bon tardi! Ki bo ke bebe?\nMi ta sed, mi ke un batido.\nI ki bo ke kome?\nMi ta hambri, mi ke kuminda lokal.",
        lessonId: "food-drinks",
        questionWord: "restaurant conversation"
      },
      {
        id: "food11",
        type: "translation",
        question: "Translate this conversation at a local restaurant:\n'Good afternoon! Welcome to our restaurant.'\n'Thank you! I'm hungry and thirsty.'\n'Would you like to try our local special?'\n'Yes, please! And I'd like a cold drink.'\n'Perfect! It's a beautiful day to enjoy our food.'",
        correctAnswer: "Bon tardi! Bon bini na nos restorant.\nMasha danki! Mi ta hambri i sed.\nBo ke proba nos speshal di dia?\nSi, por fabor! I mi ke un bebida fresku.\nPerfekto! Ta un dia bunita pa disfruta di nos kuminda.",
        lessonId: "food-drinks",
        questionWord: "restaurant welcome"
      }
    ]
  },
  "animals-nature": {
    lessonId: "animals-nature",
    exercises: [
      {
        id: "nature1",
        type: "multiple-choice",
        question: "How do you say 'Animal' in Papiamentu?",
        options: ["Bestia", "Piska", "Para", "Palu"],
        correctAnswer: "Bestia",
        translation: "Animal",
        lessonId: "animals-nature",
        questionWord: "Bestia"
      },
      {
        id: "nature2",
        type: "translation",
        question: "Translate 'Fish' to Papiamentu",
        correctAnswer: "Piska",
        lessonId: "animals-nature",
        questionWord: "Piska"
      },
      {
        id: "nature3",
        type: "multiple-choice",
        question: "What does 'Para' mean?",
        options: ["Fish", "Bird", "Tree", "Beach"],
        correctAnswer: "Bird",
        translation: "Bird",
        lessonId: "animals-nature",
        questionWord: "Para"
      },
      {
        id: "nature4",
        type: "multiple-choice",
        question: "How do you say 'Tree' in Papiamentu?",
        options: ["Playa", "Zèk", "Palu", "Bestia"],
        correctAnswer: "Palu",
        translation: "Tree",
        lessonId: "animals-nature",
        questionWord: "Palu"
      },
      {
        id: "nature5",
        type: "translation",
        question: "Translate 'Beach' to Papiamentu",
        correctAnswer: "Playa",
        lessonId: "animals-nature",
        questionWord: "Playa"
      },
      {
        id: "nature6",
        type: "multiple-choice",
        question: "What does 'Zèk' mean?",
        options: ["Beach", "Tree", "Sea", "Fish"],
        correctAnswer: "Sea",
        translation: "Sea",
        lessonId: "animals-nature",
        questionWord: "Zèk"
      }
    ]
  },
  "curacao-traditions": {
    lessonId: "curacao-traditions",
    exercises: [
      {
        id: "trad1",
        type: "multiple-choice",
        question: "What do you say during the Harvest Festival?",
        options: [
          "Dushi Simadan!",
          "Bon Aña!",
          "Ta dushi!",
          "Bon dia!"
        ],
        correctAnswer: "Dushi Simadan!",
        translation: "Sweet Harvest Festival!",
        lessonId: "curacao-traditions",
        questionWord: "festival greeting",
        feedback: {
          correct: "🎉 Excellent! You're celebrating like a local!",
          incorrect: "💭 During Simadan, we say 'Dushi Simadan!' to show appreciation!"
        }
      },
      {
        id: "trad2",
        type: "fill-blank",
        question: "Complete the festival conversation:\nA: 'Nos ta bai ...'\nB: 'Dushi ...!'\nA: 'Ta un selebrashon ...!'",
        correctAnswer: "Simadan, Simadan, grandi",
        translation: "We're going to Simadan, Sweet Simadan!, It's a big celebration!",
        lessonId: "curacao-traditions",
        questionWord: "festival conversation",
        feedback: {
          correct: "🌟 Perfect! You're ready to join the celebration!",
          incorrect: "💡 Remember: Simadan is the Harvest Festival, and it's a 'selebrashon grandi'!"
        }
      },
      {
        id: "traditions1",
        type: "multiple-choice",
        question: "What is 'Simadan' in English?",
        options: ["Carnival", "Harvest Festival", "New Year's", "Music Festival"],
        correctAnswer: "Harvest Festival",
        translation: "Harvest Festival",
        lessonId: "curacao-traditions",
        questionWord: "Simadan"
      },
      {
        id: "traditions2",
        type: "translation",
        question: "Translate 'Tumba' to English",
        correctAnswer: "Music",
        lessonId: "curacao-traditions",
        questionWord: "Tumba"
      },
      {
        id: "traditions3",
        type: "multiple-choice",
        question: "What does 'Karnaval' mean?",
        options: ["Harvest Festival", "Music", "Carnival", "New Year's"],
        correctAnswer: "Carnival",
        translation: "Carnival",
        lessonId: "curacao-traditions",
        questionWord: "Karnaval"
      },
      {
        id: "traditions4",
        type: "multiple-choice",
        question: "How do you say 'New Year's' in Papiamentu?",
        options: ["Simadan", "Tumba", "Karnaval", "Dande"],
        correctAnswer: "Dande",
        translation: "New Year's",
        lessonId: "curacao-traditions",
        questionWord: "Dande"
      },
      {
        id: "traditions5",
        type: "translation",
        question: "Translate 'Cultural Heritage' to Papiamentu",
        correctAnswer: "Herensia Kultural",
        lessonId: "curacao-traditions",
        questionWord: "Herensia Kultural"
      },
      {
        id: "traditions6",
        type: "multiple-choice",
        question: "What does 'Tradishon' mean?",
        options: ["Culture", "Tradition", "History", "Music"],
        correctAnswer: "Tradition",
        translation: "Tradition",
        lessonId: "curacao-traditions",
        questionWord: "Tradishon"
      },
      {
        id: "traditions7",
        type: "multiple-choice",
        question: "How do you say 'Local Celebration' in Papiamentu?",
        options: ["Tradishon", "Karnaval", "Selebrashon Lokal", "Dande"],
        correctAnswer: "Selebrashon Lokal",
        translation: "Local Celebration",
        lessonId: "curacao-traditions",
        questionWord: "Selebrashon Lokal"
      },
      {
        id: "traditions8",
        type: "multiple-choice",
        question: "Complete the conversation about Carnival:\nA: 'Ki ora Karnaval ta kuminsá?'\nB: 'E ta kuminsá na ...'\nA: 'I unda e ta tuma lugá?'\nB: 'E ta tuma lugá na ...'",
        options: [
          "7 ora di anochi na Otrobanda",
          "8 ora di anochi na Punda",
          "9 ora di anochi na Scharloo",
          "10 ora di anochi na Brievengat"
        ],
        correctAnswer: "7 ora di anochi na Otrobanda",
        translation: "7 PM in Otrobanda",
        lessonId: "curacao-traditions",
        questionWord: "carnival details"
      },
      {
        id: "traditions9",
        type: "translation",
        question: "Translate this conversation about Simadan:\n'When is the Harvest Festival?'\n'It starts in April.'\n'What time does it begin?'\n'It begins at 6 PM in Bandabou.'",
        correctAnswer: "Ki ora Simadan ta?\nE ta kuminsá na April.\nKi ora e ta kuminsá?\nE ta kuminsá na 6 ora di tardi na Bandabou.",
        lessonId: "curacao-traditions",
        questionWord: "festival details"
      },
      {
        id: "traditions10",
        type: "translation",
        question: "Translate this conversation about local celebrations:\n'When is the next festival?'\n'It's the Harvest Festival next month.'\n'What time does it start?'\n'It starts at 6 PM in Bandabou.'\n'Is it a big celebration?'\n'Yes, it's one of our most important traditions!'",
        correctAnswer: "Ki ora e próximo selebrashon ta?\nTa Simadan otro mes.\nKi ora e ta kuminsá?\nE ta kuminsá na 6 ora di tardi na Bandabou.\nTa un selebrashon grandi?\nSi, ta un di nos tradishonnan mas importante!",
        lessonId: "curacao-traditions",
        questionWord: "festival planning"
      }
    ]
  },
  "island-history": {
    lessonId: "island-history",
    exercises: [
      {
        id: "history1",
        type: "multiple-choice",
        question: "How do you say 'History' in Papiamentu?",
        options: ["Kultura", "Historia", "Tradishon", "Herensia"],
        correctAnswer: "Historia",
        translation: "History",
        lessonId: "island-history",
        questionWord: "Historia"
      },
      {
        id: "history2",
        type: "translation",
        question: "Translate 'Culture' to Papiamentu",
        correctAnswer: "Kultura",
        lessonId: "island-history",
        questionWord: "Kultura"
      },
      {
        id: "history3",
        type: "multiple-choice",
        question: "What does 'Herensia' mean?",
        options: ["History", "Culture", "Heritage", "Tradition"],
        correctAnswer: "Heritage",
        translation: "Heritage",
        lessonId: "island-history",
        questionWord: "Herensia"
      },
      {
        id: "history4",
        type: "multiple-choice",
        question: "How do you say 'Ancient' in Papiamentu?",
        options: ["Moderno", "Antiguo", "Nobo", "Viejo"],
        correctAnswer: "Antiguo",
        translation: "Ancient",
        lessonId: "island-history",
        questionWord: "Antiguo"
      },
      {
        id: "history5",
        type: "translation",
        question: "Translate 'Historical Site' to Papiamentu",
        correctAnswer: "Sitio Historiko",
        lessonId: "island-history",
        questionWord: "Sitio Historiko"
      },
      {
        id: "history6",
        type: "multiple-choice",
        question: "What does 'Monumento' mean?",
        options: ["Museum", "Monument", "Building", "Statue"],
        correctAnswer: "Monument",
        translation: "Monument",
        lessonId: "island-history",
        questionWord: "Monumento"
      },
      {
        id: "history7",
        type: "multiple-choice",
        question: "Complete the conversation with a tour guide:\nGuia: 'Bon dia! Mi ta bo guia di dia.'\nBo: 'Bon dia! Mi ke sa mas di ...'\nGuia: 'Ta bon! E ta un parti importante di nos ...'\nBo: 'I ki ora e ta kuminsá?'\nGuia: 'E ta kuminsá na ...'",
        options: [
          "Historia di Kòrsou i Herensia",
          "Kultura di isla i Tradishon",
          "Bestia i Palu",
          "Kuminda i Bebida"
        ],
        correctAnswer: "Historia di Kòrsou i Herensia",
        translation: "History of Curaçao and Heritage",
        lessonId: "island-history",
        questionWord: "tour guide"
      },
      {
        id: "history8",
        type: "translation",
        question: "Translate this conversation about historical sites:\n'Good morning! I'd like to learn about the island's history.'\n'Perfect! Let's start with the historic district.'\n'What time does the tour begin?'\n'It starts at 9 AM. It's a beautiful day for a tour.'\n'Great! I'm excited to learn about the culture.'",
        correctAnswer: "Bon dia! Mi ke siña di historia di isla.\nPerfekto! Laga nos kuminsá ku e distrito historiko.\nKi ora e tour ta kuminsá?\nE ta kuminsá na 9 ora di mainta. Ta un dia bunita pa un tour.\nExcelente! Mi ta emocioná pa siña di e kultura.",
        lessonId: "island-history",
        questionWord: "historical tour"
      }
    ]
  },
  "getting-around": {
    lessonId: "getting-around",
    exercises: [
      {
        id: "transport1",
        type: "multiple-choice",
        question: "How do you ask a taxi driver to take you to the beach?",
        options: [
          "Skòrtá mi na playa",
          "Mi ke un taxi",
          "Unda e taxi ta bai?",
          "Ki ora e taxi ta bini?"
        ],
        correctAnswer: "Skòrtá mi na playa",
        translation: "Take me to the beach",
        lessonId: "getting-around",
        questionWord: "taxi request",
        feedback: {
          correct: "🚕 Perfect! You're ready to explore the island!",
          incorrect: "💡 Remember: 'Skòrtá mi' means 'Take me'!"
        },
        isPremium: false
      },
      {
        id: "transport2",
        type: "fill-blank",
        question: "Complete the bus conversation:\nA: '...'\nB: 'E bus ta bai na Willemstad'\nA: '...'",
        correctAnswer: "Undaki e bus ta bai?, Danki",
        translation: "Where does this bus go?, Thanks",
        lessonId: "getting-around",
        questionWord: "bus conversation",
        feedback: {
          correct: "🚌 Excellent! You're navigating like a local!",
          incorrect: "💭 Try asking where the bus goes first!"
        },
        isPremium: false
      }
    ]
  },
  "simple-questions": {
    lessonId: "simple-questions",
    exercises: [
      {
        id: "questions1",
        type: "multiple-choice",
        question: "What's the best way to ask someone where they're going?",
        options: [
          "Unda bo ta bai?",
          "Ki ora ta?",
          "Kon ta bai?",
          "Ki bo ke?"
        ],
        correctAnswer: "Unda bo ta bai?",
        translation: "Where are you going?",
        lessonId: "simple-questions",
        questionWord: "location question",
        feedback: {
          correct: "💬 Perfect! You're asking questions like a local!",
          incorrect: "💡 Remember: 'Unda' means 'where'!"
        },
        isPremium: false
      },
      {
        id: "questions2",
        type: "matching",
        question: "Match the questions with their meanings:",
        options: [
          "Ki ora ta? - What time is it?",
          "Kon ta bai? - How are you?",
          "Unda bo ta bai? - Where are you going?",
          "Ki bo ke? - What do you want?"
        ],
        correctAnswer: "Ki ora ta? - What time is it?, Kon ta bai? - How are you?, Unda bo ta bai? - Where are you going?, Ki bo ke? - What do you want?",
        lessonId: "simple-questions",
        questionWord: "question matching",
        feedback: {
          correct: "🎯 Excellent! You're mastering the basic questions!",
          incorrect: "📝 Try again! Remember: 'Ki' means 'what' and 'Kon' means 'how'!"
        },
        isPremium: false
      }
    ]
  },
  "family-friends": {
    lessonId: "family-friends",
    exercises: [
      {
        id: "family1",
        type: "multiple-choice",
        question: "How do you say 'My mother is sweet'?",
        options: [
          "Mi mama ta dushi",
          "Mi tata ta dushi",
          "Mi amigu ta dushi",
          "Mi ta dushi"
        ],
        correctAnswer: "Mi mama ta dushi",
        translation: "My mother is sweet",
        lessonId: "family-friends",
        questionWord: "family description",
        feedback: {
          correct: "👨‍👩‍👧‍👦 Perfect! You're speaking about family like a local!",
          incorrect: "💡 Remember: 'mama' means mother!"
        },
        isPremium: true
      },
      {
        id: "family2",
        type: "fill-blank",
        question: "Complete the family conversation:\nA: 'Bo tin ...?'\nB: 'Si, mi tin un ... i un ...'\nA: '...!'",
        correctAnswer: "ruman, ruman, ruman, Ta bon",
        translation: "Do you have siblings?, Yes, I have a brother and a sister, That's good!",
        lessonId: "family-friends",
        questionWord: "family conversation",
        feedback: {
          correct: "💖 Beautiful! You're connecting with family like a local!",
          incorrect: "💭 Remember: 'ruman' means sibling!"
        },
        isPremium: true
      }
    ]
  },
  "numbers-money": {
    lessonId: "numbers-money",
    exercises: [
      {
        id: "money1",
        type: "multiple-choice",
        question: "How do you say 'It's too expensive' when bargaining?",
        options: [
          "Ta muy karu",
          "Ta bon",
          "Ta barata",
          "Ta dushi"
        ],
        correctAnswer: "Ta muy karu",
        translation: "It's too expensive",
        lessonId: "numbers-money",
        questionWord: "bargaining",
        feedback: {
          correct: "💰 Perfect! You're bargaining like a local!",
          incorrect: "💡 Remember: 'Ta muy karu' is the key to bargaining!"
        },
        isPremium: true
      },
      {
        id: "money2",
        type: "spot-error",
        question: "Find the mistake in this market conversation:\nA: 'Kuantu e ta kosta?'\nB: 'E ta kosta 50 florin'\nA: 'Ta muy barata'\nB: 'Ta bon, mi ta bai'",
        correctAnswer: "Ta muy barata",
        translation: "It's too cheap",
        lessonId: "numbers-money",
        questionWord: "market error",
        feedback: {
          correct: "🎯 Great catch! You wouldn't say it's too cheap when bargaining!",
          incorrect: "👀 Look at the bargaining strategy - would you say it's too cheap?"
        },
        isPremium: true
      }
    ]
  },
  "homeowners": {
    lessonId: "homeowners",
    exercises: [
      {
        id: "home1",
        type: "multiple-choice",
        question: "How do you say 'I need maintenance for my house'?",
        options: [
          "Mi ke mantenimento di mi kasa",
          "Mi tin un kasa",
          "Mi ke un kasa",
          "Mi kasa ta bon"
        ],
        correctAnswer: "Mi ke mantenimento di mi kasa",
        translation: "I need maintenance for my house",
        lessonId: "homeowners",
        questionWord: "maintenance request",
        feedback: {
          correct: "🏡 Perfect! You're managing your property like a local!",
          incorrect: "💡 Remember: 'mantenimento' means maintenance!"
        },
        isPremium: true
      },
      {
        id: "home2",
        type: "translation",
        question: "Translate: 'I have a contract with a local contractor'",
        correctAnswer: "Mi tin un kontraktu ku un kontraktista lokal",
        lessonId: "homeowners",
        questionWord: "contract translation",
        feedback: {
          correct: "📝 Excellent! You're handling contracts like a local!",
          incorrect: "💭 Remember: 'kontraktu' is contract and 'kontraktista' is contractor!"
        },
        isPremium: true
      }
    ]
  },
  "business": {
    lessonId: "business",
    exercises: [
      {
        id: "business1",
        type: "multiple-choice",
        question: "How do you say 'He's an important client'?",
        options: [
          "E ta un kliënt importante",
          "E ta un negoshi importante",
          "E ta un kontrakto importante",
          "E ta importante"
        ],
        correctAnswer: "E ta un kliënt importante",
        translation: "He's an important client",
        lessonId: "business",
        questionWord: "client description",
        feedback: {
          correct: "💼 Perfect! You're speaking business like a local!",
          incorrect: "💡 Remember: 'kliënt' means client!"
        },
        isPremium: true
      },
      {
        id: "business2",
        type: "fill-blank",
        question: "Complete the business meeting:\nA: 'Bon dia, ...'\nB: 'Bon dia, ...'\nA: '... nos negoshi?'\nB: '... ta bon'",
        correctAnswer: "mi ta Kees, mi ta Maria, Kon ta bai, Ta",
        translation: "Good morning, I'm Kees, Good morning, I'm Maria, How's our business going?, It's going well",
        lessonId: "business",
        questionWord: "business meeting",
        feedback: {
          correct: "🤝 Excellent! You're conducting business like a local!",
          incorrect: "💭 Remember to introduce yourself and ask about the business!"
        },
        isPremium: true
      }
    ]
  },
  "healthcare-medical": {
    lessonId: "healthcare-medical",
    exercises: [
      {
        id: "health1",
        type: "multiple-choice",
        question: "Which phrase means 'I need a doctor'?",
        options: [
          "Mi mester un dòkter",
          "Mi ta bon",
          "Mi tin doló",
          "Mi ke piskurá"
        ],
        correctAnswer: "Mi mester un dòkter",
        translation: "I need a doctor",
        lessonId: "healthcare-medical",
        questionWord: "doctor request",
        feedback: {
          correct: "🏥 Great! You're ready for a clinic visit!",
          incorrect: "💡 Remember: 'mester' means 'need'!"
        },
        isPremium: true
      },
      {
        id: "health2",
        type: "fill-blank",
        question: "Complete the sentence: 'Mi tin ___ na kabes' (I have pain in my head)",
        correctAnswer: "doló",
        translation: "I have pain in my head",
        lessonId: "healthcare-medical",
        questionWord: "pain expression",
        feedback: {
          correct: "💊 Excellent! You can describe symptoms now!",
          incorrect: "💭 Try again! Remember: 'doló' means pain."
        },
        isPremium: true
      }
    ]
  },
  "hospitality-service": {
    lessonId: "hospitality-service",
    exercises: [
      {
        id: "hotel1",
        type: "multiple-choice",
        question: "What's the best way to welcome guests to your hotel?",
        options: [
          "Bon bini na nos hotel",
          "Kon ta bai?",
          "Por mi tuma bo orden?",
          "Mi ta bon, danki"
        ],
        correctAnswer: "Bon bini na nos hotel",
        translation: "Welcome to our hotel",
        lessonId: "hospitality-service",
        questionWord: "guest welcome",
        feedback: {
          correct: "🏨 Perfect! A warm welcome goes a long way!",
          incorrect: "💡 'Bon bini' means welcome!"
        },
        isPremium: true
      },
      {
        id: "hotel2",
        type: "translation",
        question: "Translate: 'Can I take your order?'",
        correctAnswer: "Por mi tuma bo orden?",
        lessonId: "hospitality-service",
        questionWord: "order taking",
        feedback: {
          correct: "🍽️ Excellent! You're ready for table service!",
          incorrect: "💭 Remember: 'tuma' means take and 'orden' is order!"
        },
        isPremium: true
      }
    ]
  },
  "scuba-diving": {
    lessonId: "scuba-diving",
    exercises: [
      {
        id: "dive1",
        type: "multiple-choice",
        question: "How do you say 'Don't touch the coral'?",
        options: [
          "No toka e korál",
          "No mira e korál",
          "Toka e korál",
          "Mira e korál"
        ],
        correctAnswer: "No toka e korál",
        translation: "Don't touch the coral",
        lessonId: "scuba-diving",
        questionWord: "dive instruction",
        feedback: {
          correct: "🤿 Great! Safety first under water!",
          incorrect: "💡 Remember: 'No toka' means don't touch!"
        },
        isPremium: true
      },
      {
        id: "dive2",
        type: "spot-error",
        question: "Find the mistake in the dive briefing:\nInstructor: 'Mira e korál, no toka e korál'\nDiver: 'Ta bon, mi ta pone mi bute'",
        correctAnswer: "bute",
        translation: "Should be 'buta' (tank)",
        lessonId: "scuba-diving",
        questionWord: "gear terminology",
        feedback: {
          correct: "🌊 Excellent! 'Buta' is the correct word for tank!",
          incorrect: "👀 Look closely at the equipment term!"
        },
        isPremium: true
      }
    ]
  },
  "nightlife": {
    lessonId: "nightlife",
    exercises: [
      {
        id: "night1",
        type: "multiple-choice",
        question: "How do you order a cold beer?",
        options: [
          "Por fabor, un bir fríu",
          "Mi ke un cocktail",
          "Un bir kalor, por fabor",
          "Ban bai baila"
        ],
        correctAnswer: "Por fabor, un bir fríu",
        translation: "Please, a cold beer",
        lessonId: "nightlife",
        questionWord: "drink order",
        feedback: {
          correct: "🍻 Cheers! You're ready for the bar!",
          incorrect: "💡 'Fríu' means cold—perfect for beer!"
        },
        isPremium: true
      },
      {
        id: "night2",
        type: "fill-blank",
        question: "Complete the phrase for inviting someone to dance: 'Nos ta bai ___?'",
        correctAnswer: "baila",
        translation: "Shall we go dance?",
        lessonId: "nightlife",
        questionWord: "dance invite",
        feedback: {
          correct: "💃 Great moves! Let's hit the dance floor!",
          incorrect: "💭 Remember the verb 'baila' means dance!"
        },
        isPremium: true
      }
    ]
  },
  "daily-conversations": {
    lessonId: "daily-conversations",
    exercises: [
      {
        id: "daily1",
        type: "multiple-choice",
        question: "What's a friendly way to ask 'What's up?'",
        options: [
          "Kiko ta pasiando?",
          "Kon ta bai?",
          "Bon dia",
          "Ta bon?"
        ],
        correctAnswer: "Kiko ta pasiando?",
        translation: "What's happening? / What's up?",
        lessonId: "daily-conversations",
        questionWord: "greeting question",
        feedback: {
          correct: "☀️ Nice! You've started a friendly chat!",
          incorrect: "💡 'Kiko ta pasiando' is the casual what's up!"
        },
        isPremium: true
      },
      {
        id: "daily2",
        type: "translation",
        question: "Translate: 'Have a lovely day!'",
        correctAnswer: "Masha dushi dia!",
        lessonId: "daily-conversations",
        questionWord: "well wishes",
        feedback: {
          correct: "🌅 Beautiful wish! Locals will appreciate it!",
          incorrect: "💭 'Masha dushi dia' is the island way to wish someone a great day!"
        },
        isPremium: true
      }
    ]
  }
};