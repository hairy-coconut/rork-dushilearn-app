export type Lesson = {
  id: string;
  title: string;
  description: string;
  level: number;
  exercises: number;
  completed: boolean;
  icon: string;
  learningGoal: string;
  vocabulary: {
    word: string;
    translation: string;
    example: string;
  }[];
  culturalTip: string;
  isPremium: boolean;
  pack: "freemium" | "premium" | "addon";
};

export type Category = {
  id: string;
  title: string;
  lessons: Lesson[];
  color: string;
  isPremium: boolean;
};

export const categories: Category[] = [
  {
    id: "freemium",
    title: "Essential Island Skills 🟢",
    color: "#4ECDC4",
    isPremium: false,
    lessons: [
      {
        id: "island-greetings",
        title: "Island Greetings 🌴",
        description: "Master the art of saying hello like a local!",
        learningGoal: "You'll learn how to greet people at different times of day, ask how they're doing, and respond naturally in Papiamentu.",
        vocabulary: [
          {
            word: "Bon dia",
            translation: "Good morning",
            example: "Bon dia, mi ta Kees! = Good morning, I'm Kees!"
          },
          {
            word: "Kon ta bai?",
            translation: "How are you?",
            example: "Kon ta bai? Mi ta bon, danki! = How are you? I'm good, thanks!"
          },
          {
            word: "Ayo",
            translation: "Goodbye",
            example: "Ayo, te otro biaha! = Goodbye, until next time!"
          }
        ],
        culturalTip: "In Curaçao, 'Bon siman' (Good week) is often used on Mondays to wish people a good week ahead!",
        level: 1,
        exercises: 6,
        completed: false,
        icon: "hand-wave",
        isPremium: false,
        pack: "freemium"
      },
      {
        id: "beach-essentials",
        title: "Beach & Sun Essentials 🏖️",
        description: "Get ready for the perfect beach day!",
        learningGoal: "You'll learn essential beach vocabulary and phrases to enjoy the sun and sea like a local.",
        vocabulary: [
          {
            word: "Playa",
            translation: "Beach",
            example: "Nos ta bai na playa = We're going to the beach"
          },
          {
            word: "Awa",
            translation: "Water",
            example: "E awa ta fresku = The water is cool"
          },
          {
            word: "Sòl",
            translation: "Sun",
            example: "Ta sòl i ta kalor = It's sunny and hot"
          }
        ],
        culturalTip: "Locals love to say 'Ta dushi!' when the water is perfect for swimming!",
        level: 1,
        exercises: 6,
        completed: false,
        icon: "beach",
        isPremium: false,
        pack: "freemium"
      },
      {
        id: "local-food",
        title: "Ordering Local Food 🍹",
        description: "Order food and drinks like a true islander!",
        learningGoal: "You'll learn to order food, discuss preferences, and understand menus at local restaurants and beach bars.",
        vocabulary: [
          {
            word: "Batido",
            translation: "Smoothie",
            example: "Un batido di mango, por fabor = A mango smoothie, please"
          },
          {
            word: "Pastechi",
            translation: "Pastry",
            example: "Dos pastechi di karni = Two meat pastries"
          },
          {
            word: "Por fabor",
            translation: "Please",
            example: "Por fabor, mi ke un batido = Please, I want a smoothie"
          }
        ],
        culturalTip: "Try saying 'Ta dushi!' (It's delicious!) when enjoying local food - it's the highest compliment you can give!",
        level: 1,
        exercises: 6,
        completed: false,
        icon: "food",
        isPremium: false,
        pack: "freemium"
      },
      {
        id: "getting-around",
        title: "Getting Around the Island 🚕",
        description: "Navigate Curaçao like a local!",
        learningGoal: "You'll learn essential phrases for transportation, directions, and getting around the island confidently.",
        vocabulary: [
          {
            word: "Taxi",
            translation: "Taxi",
            example: "Mi ke un taxi = I want a taxi"
          },
          {
            word: "Bus",
            translation: "Bus",
            example: "Undaki e bus ta bai? = Where does this bus go?"
          },
          {
            word: "Skòrtá mi",
            translation: "Take me",
            example: "Skòrtá mi na playa = Take me to the beach"
          }
        ],
        culturalTip: "Taxis don't use meters in Curaçao - always agree on the price before getting in!",
        level: 1,
        exercises: 6,
        completed: false,
        icon: "car",
        isPremium: false,
        pack: "freemium"
      },
      {
        id: "simple-questions",
        title: "Simple Questions & Responses 💬",
        description: "Ask and answer with confidence!",
        learningGoal: "You'll learn to ask basic questions and understand responses in everyday situations.",
        vocabulary: [
          {
            word: "Ki ora ta?",
            translation: "What time is it?",
            example: "Ki ora ta? Ta 2 ora = What time is it? It's 2 o'clock"
          },
          {
            word: "Unda bo ta bai?",
            translation: "Where are you going?",
            example: "Unda bo ta bai? Mi ta bai na playa = Where are you going? I'm going to the beach"
          },
          {
            word: "Kon ta bai?",
            translation: "How are you?",
            example: "Kon ta bai? Mi ta bon, danki = How are you? I'm good, thanks"
          }
        ],
        culturalTip: "Curaçaoans are friendly and love to chat - don't be shy to ask questions!",
        level: 1,
        exercises: 6,
        completed: false,
        icon: "comment-question",
        isPremium: false,
        pack: "freemium"
      },
      {
        id: "emergency-basics",
        title: "Emergency Basics 🚨",
        description: "Stay safe and get help when needed!",
        learningGoal: "You'll learn essential phrases for emergencies and getting help quickly.",
        vocabulary: [
          {
            word: "Ayudo!",
            translation: "Help!",
            example: "Ayudo! Mi tin un problema = Help! I have a problem"
          },
          {
            word: "Dòkter",
            translation: "Doctor",
            example: "Mi mester un dòkter = I need a doctor"
          },
          {
            word: "Polis",
            translation: "Police",
            example: "Mi ke yama polis = I want to call the police"
          }
        ],
        culturalTip: "Emergency number in Curaçao is 911, just like in the US!",
        level: 1,
        exercises: 6,
        completed: false,
        icon: "medical-bag",
        isPremium: false,
        pack: "freemium"
      }
    ]
  },
  {
    id: "premium",
    title: "Premium Island Life 🔒",
    color: "#FF6B6B",
    isPremium: true,
    lessons: [
      {
        id: "love-flirtation",
        title: "Love & Flirtation 💝",
        description: "Express your feelings in Papiamentu!",
        learningGoal: "You'll learn romantic phrases and expressions to connect with locals on a deeper level.",
        vocabulary: [
          {
            word: "Mi stima bo",
            translation: "I love you",
            example: "Mi stima bo, mi dushi = I love you, my sweet"
          },
          {
            word: "Bo ta dushi",
            translation: "You're sweet",
            example: "Bo ta dushi, mi amor = You're sweet, my love"
          },
          {
            word: "Mi tin un novio/novia",
            translation: "I have a boyfriend/girlfriend",
            example: "Mi tin un novio, el ta dushi = I have a boyfriend, he's sweet"
          }
        ],
        culturalTip: "In Curaçao, 'dushi' is used for everything sweet - from food to people you love!",
        level: 2,
        exercises: 8,
        completed: false,
        icon: "heart",
        isPremium: true,
        pack: "premium"
      },
      {
        id: "local-slang",
        title: "Local Slang & Humor 😄",
        description: "Talk like a true islander!",
        learningGoal: "You'll learn local expressions, slang, and humor to connect with locals on a deeper level.",
        vocabulary: [
          {
            word: "Bo ta un dushi",
            translation: "You're a sweetheart",
            example: "Bo ta un dushi, mi amigu = You're a sweetheart, my friend"
          },
          {
            word: "No wak mi",
            translation: "Don't look at me",
            example: "No wak mi, mi ta shy = Don't look at me, I'm shy"
          },
          {
            word: "Hende loko",
            translation: "Crazy people",
            example: "E ta un hende loko = He's a crazy person"
          }
        ],
        culturalTip: "Curaçaoans love to joke and use playful expressions - it's part of our warm culture!",
        level: 2,
        exercises: 8,
        completed: false,
        icon: "emoticon",
        isPremium: true,
        pack: "premium"
      },
      {
        id: "family-friends",
        title: "Family & Friends 👨‍👩‍👧‍👦",
        description: "Connect with loved ones in Papiamentu!",
        learningGoal: "You'll learn family-related vocabulary and phrases to connect with locals on a personal level.",
        vocabulary: [
          {
            word: "Mama",
            translation: "Mother",
            example: "Mi mama ta dushi = My mother is sweet"
          },
          {
            word: "Tata",
            translation: "Father",
            example: "Mi tata ta fuerte = My father is strong"
          },
          {
            word: "Amigu",
            translation: "Friend",
            example: "Bo ta mi amigu = You are my friend"
          }
        ],
        culturalTip: "Family is central to Curaçaoan culture - showing respect to elders is very important!",
        level: 2,
        exercises: 8,
        completed: false,
        icon: "account-group",
        isPremium: true,
        pack: "premium"
      },
      {
        id: "numbers-money",
        title: "Numbers & Money 💰",
        description: "Master numbers and handle money like a local!",
        learningGoal: "You'll learn to count, handle money, and bargain like a true islander.",
        vocabulary: [
          {
            word: "Florin",
            translation: "Guilder (currency)",
            example: "E ta kosta 20 florin = It costs 20 guilders"
          },
          {
            word: "Ta muy karu",
            translation: "It's too expensive",
            example: "Ta muy karu, por fabor mas barata = It's too expensive, please cheaper"
          },
          {
            word: "Ta bon",
            translation: "It's good",
            example: "Ta bon, mi ta bai = It's good, I'll take it"
          }
        ],
        culturalTip: "Bargaining is common in local markets - start with 'Ta muy karu' and negotiate!",
        level: 2,
        exercises: 8,
        completed: false,
        icon: "cash",
        isPremium: true,
        pack: "premium"
      }
    ]
  },
  {
    id: "addons",
    title: "Specialized Packs 🎯",
    color: "#9B5DE5",
    isPremium: true,
    lessons: [
      {
        id: "kids-papiamentu",
        title: "Papiamentu for Kids 👶",
        description: "Fun and easy Papiamentu for young learners!",
        learningGoal: "You'll learn basic vocabulary and phrases through fun, visual exercises designed for children.",
        vocabulary: [
          {
            word: "Mucha",
            translation: "Child",
            example: "Mi ta un mucha = I am a child"
          },
          {
            word: "Dushi",
            translation: "Sweet",
            example: "E ta un mucha dushi = He's a sweet child"
          },
          {
            word: "Play",
            translation: "Play",
            example: "Nos ta play = We are playing"
          }
        ],
        culturalTip: "Children in Curaçao often mix Papiamentu with Dutch and English - it's perfectly normal!",
        level: 1,
        exercises: 6,
        completed: false,
        icon: "baby-face",
        isPremium: true,
        pack: "addon"
      },
      {
        id: "immigration",
        title: "Papiamentu for Immigration 🛂",
        description: "Essential language skills for long-term stays!",
        learningGoal: "You'll learn practical vocabulary and phrases for daily life in Curaçao.",
        vocabulary: [
          {
            word: "Permiso",
            translation: "Permission",
            example: "Mi tin permiso = I have permission"
          },
          {
            word: "Dokumento",
            translation: "Document",
            example: "Mi tin mi dokumento = I have my document"
          },
          {
            word: "Residensia",
            translation: "Residence",
            example: "Mi tin residensia = I have residence"
          }
        ],
        culturalTip: "Understanding local bureaucracy in Papiamentu can make your stay much smoother!",
        level: 3,
        exercises: 8,
        completed: false,
        icon: "passport",
        isPremium: true,
        pack: "addon"
      },
      {
        id: "homeowners",
        title: "Papiamentu for Homeowners 🏡",
        description: "Essential language skills for property owners!",
        learningGoal: "You'll learn practical vocabulary and phrases for managing property and dealing with local services.",
        vocabulary: [
          {
            word: "Kasa",
            translation: "House",
            example: "Mi tin un kasa na Kòrsou = I have a house in Curaçao"
          },
          {
            word: "Mantenimento",
            translation: "Maintenance",
            example: "Mi ke mantenimento di mi kasa = I want maintenance for my house"
          },
          {
            word: "Kontraktu",
            translation: "Contract",
            example: "Mi tin un kontraktu = I have a contract"
          }
        ],
        culturalTip: "Local contractors often prefer to communicate in Papiamentu - knowing the basics helps a lot!",
        level: 3,
        exercises: 8,
        completed: false,
        icon: "home",
        isPremium: true,
        pack: "addon"
      },
      {
        id: "business",
        title: "Business Papiamentu 💼",
        description: "Professional language skills for work!",
        learningGoal: "You'll learn business vocabulary and phrases for professional settings in Curaçao.",
        vocabulary: [
          {
            word: "Negoshi",
            translation: "Business",
            example: "Mi tin un negoshi = I have a business"
          },
          {
            word: "Kliënt",
            translation: "Client",
            example: "E ta un kliënt importante = He's an important client"
          },
          {
            word: "Kontrakto",
            translation: "Contract",
            example: "Nos tin un kontrakto = We have a contract"
          }
        ],
        culturalTip: "Business meetings often start with casual conversation - it's part of building trust!",
        level: 3,
        exercises: 8,
        completed: false,
        icon: "briefcase",
        isPremium: true,
        pack: "addon"
      },
      {
        id: "healthcare-medical",
        title: "Healthcare & Medical 🏥",
        description: "Communicate confidently in medical settings!",
        learningGoal: "You'll learn essential medical vocabulary and phrases to describe symptoms, seek assistance, and converse with healthcare professionals.",
        vocabulary: [
          {
            word: "Dòkter",
            translation: "Doctor",
            example: "Mi mester un dòkter = I need a doctor"
          },
          {
            word: "Piskurá",
            translation: "Medicine",
            example: "Mi mester piskurá = I need medicine"
          },
          {
            word: "Doló",
            translation: "Pain",
            example: "Mi tin doló na kabes = I have a headache"
          }
        ],
        culturalTip: "Using Papiamentu at clinics shows respect and can speed up your care!",
        level: 3,
        exercises: 8,
        completed: false,
        icon: "hospital",
        isPremium: true,
        pack: "addon"
      },
      {
        id: "hospitality-service",
        title: "Hospitality & Service Industry 🏨",
        description: "Deliver top-notch service in Papiamentu!",
        learningGoal: "You'll learn phrases for welcoming guests, taking orders, and handling requests in hotels, restaurants, and tours.",
        vocabulary: [
          {
            word: "Bon bini",
            translation: "Welcome",
            example: "Bon bini na nos hotel = Welcome to our hotel"
          },
          {
            word: "Orden",
            translation: "Order",
            example: "Por mi tuma bo orden? = Can I take your order?"
          },
          {
            word: "Kuminda",
            translation: "Food",
            example: "Kuminda ta yega pronto = The food will arrive soon"
          }
        ],
        culturalTip: "A warm 'Bon bini' goes a long way in Curaçao's hospitality culture!",
        level: 3,
        exercises: 8,
        completed: false,
        icon: "bell",
        isPremium: true,
        pack: "addon"
      },
      {
        id: "scuba-diving",
        title: "Scuba Diving & Water Sports 🤿",
        description: "Dive into adventure with local lingo!",
        learningGoal: "You'll learn vocabulary for diving equipment, safety instructions, and marine life to enhance underwater experiences.",
        vocabulary: [
          {
            word: "Buta",
            translation: "Tank",
            example: "Mi ta pone mi buta = I'm putting on my tank"
          },
          {
            word: "Mundu bou di awa",
            translation: "Underwater world",
            example: "Nos ta bai eksplorá e mundu bou di awa = We are exploring the underwater world"
          },
          {
            word: "Korál",
            translation: "Coral",
            example: "No toka e korál = Don't touch the coral"
          }
        ],
        culturalTip: "Curaçao is famous for shore diving—knowing the terms keeps you safe and wins local respect!",
        level: 3,
        exercises: 8,
        completed: false,
        icon: "scuba-diving",
        isPremium: true,
        pack: "addon"
      },
      {
        id: "nightlife",
        title: "Nightlife & Entertainment 🌙",
        description: "Party like a local on Curaçao!",
        learningGoal: "You'll learn phrases for ordering drinks, chatting at bars, and navigating the island's nightlife scene.",
        vocabulary: [
          {
            word: "Un bir",
            translation: "A beer",
            example: "Por fabor, un bir fríu = Please, a cold beer"
          },
          {
            word: "Baila",
            translation: "Dance",
            example: "Nos ta bai baila? = Shall we go dance?"
          },
          {
            word: "Fiesta",
            translation: "Party",
            example: "E fiesta ta kuminsá tardu = The party starts late"
          }
        ],
        culturalTip: "Locals often start nightlife late—don't show up before 11 PM!",
        level: 2,
        exercises: 8,
        completed: false,
        icon: "glass-cocktail",
        isPremium: true,
        pack: "addon"
      },
      {
        id: "daily-conversations",
        title: "Everyday Small Talk ☀️",
        description: "Keep the conversation flowing anywhere!",
        learningGoal: "You'll learn versatile phrases for casual chats in shops, on the street, and with new friends.",
        vocabulary: [
          {
            word: "Kiko ta pasiando?",
            translation: "What's happening? / What's up?",
            example: "Kiko ta pasiando? Tur kos ta bon = What's up? All good"
          },
          {
            word: "Masha dushi dia",
            translation: "Have a lovely day",
            example: "Masha dushi dia! Te otro biaha = Have a lovely day! See you next time"
          },
          {
            word: "Mi ta bai traha",
            translation: "I'm going to work",
            example: "Aki nos papia despues. Mi ta bai traha = Let's chat later. I'm off to work"
          }
        ],
        culturalTip: "A friendly smile and small talk in Papiamentu opens doors everywhere on the island!",
        level: 1,
        exercises: 8,
        completed: false,
        icon: "chat",
        isPremium: true,
        pack: "addon"
      }
    ]
  }
];