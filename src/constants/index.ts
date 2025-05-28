const QUESTIONS_DATA = [
  {
    id: 1,
    text: "Which country recently overtook Japan to become the world's 4th largest economy?",
    options: [
      {
        id: 1,
        text: "The United Kingdom overtook Japan to become the 4th largest economy.",
        isCorrect: false,
      },
      {
        id: 2,
        text: "India overtook Japan to become the 4th largest economy.",
        isCorrect: true,
      },
      {
        id: 3,
        text: "Germany overtook Japan to become the 4th largest economy.",
        isCorrect: false,
      },
      {
        id: 4,
        text: "Brazil overtook Japan to become the 4th largest economy.",
        isCorrect: false,
      },
    ],
    selectedOption: null,
    answered: false,
    feedbackText: "",
    feedbackClass: "",
  },
  {
    id: 2,
    text: "Which company became the world's first to hit a $3 trillion market value in stock markets?",
    options: [
      {
        id: 1,
        text: "Amazon was the first company to hit a $3 trillion valuation.",
        isCorrect: false,
      },
      {
        id: 2,
        text: "Microsoft was the first company to reach a $3 trillion valuation.",
        isCorrect: false,
      },
      {
        id: 3,
        text: "Apple was the first company to hit a $3 trillion valuation.",
        isCorrect: true,
      },
      {
        id: 4,
        text: "Google was the first company to hit a $3 trillion valuation.",
        isCorrect: false,
      },
    ],
    selectedOption: null,
    answered: false,
    feedbackText: "",
    feedbackClass: "",
  },
  {
    id: 3,
    text: "Which country's football team won the 2022 FIFA World Cup?",
    options: [
      {
        id: 1,
        text: "The French football team won the 2022 FIFA World Cup.",
        isCorrect: false,
      },
      {
        id: 2,
        text: "The Brazilian football team won the 2022 FIFA World Cup.",
        isCorrect: false,
      },
      {
        id: 3,
        text: "The German football team won the 2022 FIFA World Cup.",
        isCorrect: false,
      },
      {
        id: 4,
        text: "The Argentinian football team won the 2022 FIFA World Cup.",
        isCorrect: true,
      },
    ],
    selectedOption: null,
    answered: false,
    feedbackText: "",
    feedbackClass: "",
  },
];

export const INITIAL_DATA = {
  currentScore: 0,
  totalQuestions: 3,
  currentQuestionIndex: 0,
  questions: QUESTIONS_DATA,
};

export const CLIENT_URL = "http://localhost:5173";
export const SERVER_URL = "http://localhost:3001";
export const SERVER_PORT = 3001;

export const OPTIONS = {
  CORRECT: "Correct",
  INCORRECT: "Incorrect",
};

export const OPTIONS_CLASSES = {
  CORRECT: "correct",
  INCORRECT: "incorrect",
};

export const SOCKET_EVENT_NAMES = {
  CONNECTION: "connection",
  INITIAL_STATE: "initialState",
  SELECT_OPTION: "selectOption",
  NAVIGATE: "navigate",
  STATE_UPDATE: "stateUpdate",
  DISCONNECT: "disconnect",
};

export const DIRECTIONS = {
  NEXT: "next",
  PREVIOUS: "prev",
};

export const DIFF_SLUGS = {
  CURRENT_SCORE: "currentScore",
  QUESTIONS: "questions",
  CURRENT_QUESTION_INDEX: "currentQuestionIndex",
};

export type IMCQData = typeof INITIAL_DATA;
export type IDirectionType = (typeof DIRECTIONS)[keyof typeof DIRECTIONS];
