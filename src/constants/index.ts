export const MCQ_DATA = {
  currentScore: 0,
  totalQuestions: 3,
  currentQuestionIndex: 0,
  questions: [
    {
      id: 1,
      text: "What color is a banana?",
      options: [
        { id: 1, text: "Blue", isCorrect: false },
        { id: 2, text: "Yellow", isCorrect: true },
        { id: 3, text: "Red", isCorrect: false },
        { id: 4, text: "Green", isCorrect: false },
      ],
      selectedOption: null,
      answered: false,
      feedbackText: "",
      feedbackClass: "",
    },
    {
      id: 2,
      text: "Which animal is known for its black and white stripes?",
      options: [
        { id: 1, text: "Lion", isCorrect: false },
        { id: 2, text: "Zebra", isCorrect: true },
        { id: 3, text: "Elephant", isCorrect: false },
        { id: 4, text: "Monkey", isCorrect: false },
      ],
      selectedOption: null,
      answered: false,
      feedbackText: "",
      feedbackClass: "",
    },
    {
      id: 3,
      text: "What do bees make that we can eat?",
      options: [
        { id: 1, text: "Milk", isCorrect: false },
        { id: 2, text: "Honey", isCorrect: true },
        { id: 3, text: "Bread", isCorrect: false },
        { id: 4, text: "Cheese", isCorrect: false },
      ],
      selectedOption: null,
      answered: false,
      feedbackText: "",
      feedbackClass: "",
    },
  ],
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
  CURRENTSCORE: "currentScore",
};

export type IMCQData = typeof MCQ_DATA;
export type IDirectionType = (typeof DIRECTIONS)[keyof typeof DIRECTIONS];
