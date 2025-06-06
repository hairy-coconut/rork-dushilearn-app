export type ExerciseType = 
  | "multiple-choice" 
  | "translation" 
  | "matching" 
  | "fill-blank";

export type Exercise = {
  id: string;
  type: ExerciseType;
  question: string;
  options?: string[];
  correctAnswer: string;
  translation?: string;
  lessonId?: string;
  questionWord?: string; // The specific word being asked about for audio lookup
};

export type ExerciseSet = {
  lessonId: string;
  exercises: Exercise[];
};

export const exerciseSets: Record<string, ExerciseSet> = {
  "greetings": {
    lessonId: "greetings",
    exercises: [
      {
        id: "greet1",
        type: "multiple-choice",
        question: "How do you say 'Hello' in Papiamento?",
        options: ["Bon dia", "Bon bini", "Danki", "Ayo"],
        correctAnswer: "Bon dia",
        translation: "Good day/Hello",
        lessonId: "greetings",
        questionWord: "Bon dia"
      },
      {
        id: "greet2",
        type: "multiple-choice",
        question: "How do you say 'Good afternoon' in Papiamento?",
        options: ["Bon nochi", "Bon tardi", "Bon dia", "Kon ta bai"],
        correctAnswer: "Bon tardi",
        translation: "Good afternoon",
        lessonId: "greetings",
        questionWord: "Bon tardi"
      },
      {
        id: "greet3",
        type: "translation",
        question: "Translate 'Bon nochi' to English",
        correctAnswer: "Good night",
        lessonId: "greetings",
        questionWord: "Bon nochi"
      },
      {
        id: "greet4",
        type: "multiple-choice",
        question: "How do you say 'How are you?' in Papiamento?",
        options: ["Kon ta bai", "Bon bini", "Mi ta bon", "Danki"],
        correctAnswer: "Kon ta bai",
        translation: "How are you?",
        lessonId: "greetings",
        questionWord: "Kon ta bai"
      },
      {
        id: "greet5",
        type: "translation",
        question: "Translate 'Thank you' to Papiamento",
        correctAnswer: "Danki",
        lessonId: "greetings",
        questionWord: "Danki"
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
  }
};