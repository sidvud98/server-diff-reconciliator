import type { QuizState, VNode } from "server/vdom/vdom.interface";

export const quizData = {
  questions: [
    {
      id: 1,
      text: "Which country recently overtook Japan to become the world's 4th largest economy?",
      options: [
        "The United Kingdom overtook Japan to become the 4th largest economy.",
        "India overtook Japan to become the 4th largest economy.",
        "Germany overtook Japan to become the 4th largest economy.",
        "Brazil overtook Japan to become the 4th largest economy.",
      ],
      correctAnswer: 1,
    },
    {
      id: 2,
      text: "Which company became the world's first to hit a $3 trillion market value in stock markets?",
      options: [
        "Amazon was the first company to hit a $3 trillion valuation.",
        "Microsoft was the first company to reach a $3 trillion valuation.",
        "Apple was the first company to hit a $3 trillion valuation.",
        "Google was the first company to hit a $3 trillion valuation.",
      ],
      correctAnswer: 2,
    },
    {
      id: 3,
      text: "Which country's football team won the 2022 FIFA World Cup?",
      options: [
        "The French football team won the 2022 FIFA World Cup.",
        "The Brazilian football team won the 2022 FIFA World Cup.",
        "The German football team won the 2022 FIFA World Cup.",
        "The Argentinian football team won the 2022 FIFA World Cup.",
      ],
      correctAnswer: 3,
    },
  ],
};

export const CLASSNAMES = {
  CORRECT: "correct",
  INCORRECT: "incorrect",
  DISABLED: "disabled",
  SELECTED: "selected",
  OPTION: "option",
  OPTIONS: "options",
  NAV_BUTTON: "nav-button",
  QUESTION_CONTAINER: "question-container",
  QUIZ_CONTAINER: "quiz-container",
  SCORE: "score",
  NAVIGATION: "navigation",
};

export const KEY_CODES = {
  ...CLASSNAMES,
  QUESTION: "question",
  PREVIOUS: "prev",
  NEXT: "next",
};

export const NODE_TYPES = {
  TEXT: "text",
  DIV: "div",
  H2: "h2",
  BUTTON: "button",
};

export const SOCKET_EVENT_NAMES = {
  INITIAL_VDOM: "initial-vdom",
  VDOM_UPDATE: "vdom-update",
  QUIZ_ACTION: "quiz-action",
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
};

export const CLIENT_URL = "http://localhost:5173";
export const SERVER_URL = "http://localhost:3001";
export const SERVER_PORT = 3001;

export const QUIZ_ACTION_TYPES = {
  ANSWER_SELECTED: "ANSWER_SELECTED",
  NAVIGATE: "NAVIGATE",
} as const;
export type QuizActionType =
  (typeof QUIZ_ACTION_TYPES)[keyof typeof QUIZ_ACTION_TYPES];

export const initialState: QuizState = {
  currentQuestion: 0,
  score: 0,
  answers: [null, null, null],
};

// Create initial VDOM tree
export const initialVDOM: VNode = {
  type: NODE_TYPES.DIV,
  props: { className: CLASSNAMES.QUIZ_CONTAINER },
  children: [
    {
      type: NODE_TYPES.DIV,
      props: { className: CLASSNAMES.SCORE },
      key: KEY_CODES.SCORE,
      children: [
        {
          type: NODE_TYPES.TEXT,
          props: { content: `Score: ${initialState.score}/3` },
        },
      ],
    },
    {
      type: NODE_TYPES.DIV,
      props: {
        className: CLASSNAMES.QUESTION_CONTAINER,
        "data-question-index": initialState.currentQuestion.toString(),
      },
      key: KEY_CODES.QUESTION,
      children: [
        {
          type: NODE_TYPES.H2,
          props: {},
          children: [
            {
              type: NODE_TYPES.TEXT,
              props: { content: quizData.questions[0].text },
            },
          ],
        },
        {
          type: NODE_TYPES.DIV,
          props: { className: CLASSNAMES.OPTIONS },
          key: KEY_CODES.OPTIONS,
          children: quizData.questions[0].options.map((option, idx) => ({
            type: NODE_TYPES.DIV,
            key: `${KEY_CODES.OPTION}-${idx}`,
            props: {
              className: CLASSNAMES.OPTION,
              selected: false,
              correct: null,
            },
            children: [
              {
                type: NODE_TYPES.TEXT,
                props: { content: option },
              },
            ],
          })),
        },
      ],
    },
    {
      type: NODE_TYPES.DIV,
      props: { className: CLASSNAMES.NAVIGATION },
      key: KEY_CODES.NAVIGATION,
      children: [
        {
          type: NODE_TYPES.BUTTON,
          props: {
            disabled: true,
            className: CLASSNAMES.NAV_BUTTON,
          },
          key: KEY_CODES.PREVIOUS,
          children: [
            {
              type: NODE_TYPES.TEXT,
              props: { content: "←" },
            },
          ],
        },
        {
          type: NODE_TYPES.BUTTON,
          props: {
            disabled: false,
            className: CLASSNAMES.NAV_BUTTON,
          },
          key: KEY_CODES.NEXT,
          children: [
            {
              type: NODE_TYPES.TEXT,
              props: { content: "→" },
            },
          ],
        },
      ],
    },
  ],
};
