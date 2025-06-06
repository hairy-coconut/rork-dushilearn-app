export type Lesson = {
  id: string;
  title: string;
  description: string;
  level: number;
  exercises: number;
  completed: boolean;
  icon: string;
};

export type Category = {
  id: string;
  title: string;
  lessons: Lesson[];
  color: string;
};

export const categories: Category[] = [
  {
    id: "basics",
    title: "Basics",
    color: "#4ECDC4",
    lessons: [
      {
        id: "greetings",
        title: "Greetings",
        description: "Learn basic greetings in Papiamento",
        level: 1,
        exercises: 5,
        completed: false,
        icon: "hand-wave",
      },
      {
        id: "introductions",
        title: "Introductions",
        description: "Introduce yourself in Papiamento",
        level: 1,
        exercises: 6,
        completed: false,
        icon: "user",
      },
      {
        id: "numbers",
        title: "Numbers",
        description: "Count from 1 to 10 in Papiamento",
        level: 1,
        exercises: 4,
        completed: false,
        icon: "hash",
      },
    ],
  },
  {
    id: "phrases",
    title: "Common Phrases",
    color: "#FF9F1C",
    lessons: [
      {
        id: "restaurant",
        title: "At the Restaurant",
        description: "Order food and drinks in Papiamento",
        level: 2,
        exercises: 7,
        completed: false,
        icon: "utensils",
      },
      {
        id: "directions",
        title: "Asking for Directions",
        description: "Navigate around town in Papiamento",
        level: 2,
        exercises: 5,
        completed: false,
        icon: "map-pin",
      },
    ],
  },
  {
    id: "vocabulary",
    title: "Vocabulary",
    color: "#2A9D8F",
    lessons: [
      {
        id: "colors",
        title: "Colors",
        description: "Learn colors in Papiamento",
        level: 1,
        exercises: 4,
        completed: false,
        icon: "palette",
      },
      {
        id: "family",
        title: "Family",
        description: "Family-related vocabulary in Papiamento",
        level: 2,
        exercises: 6,
        completed: false,
        icon: "users",
      },
    ],
  },
];