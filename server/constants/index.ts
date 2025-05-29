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

export const SOCKET_EVENT_NAMES = {
  INITIAL_VDOM: "initial-vdom",
  VDOM_UPDATE: "vdom-update",
  QUIZ_ACTION: "quiz-action",
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
};

export const initialState: QuizState = {
  currentQuestion: 0,
  score: 0,
  answers: [null, null, null],
};

// Create initial VDOM tree
export const initialVDOM: VNode = {
  type: "div",
  props: { className: "quiz-container" },
  children: [
    {
      type: "div",
      props: { className: "score" },
      key: "score",
      children: [
        {
          type: "text",
          props: { content: `Score: ${initialState.score}/3` },
        },
      ],
    },
    {
      type: "div",
      props: {
        className: "question-container",
        "data-question-index": initialState.currentQuestion.toString(),
      },
      key: "question",
      children: [
        {
          type: "h2",
          props: {},
          children: [
            {
              type: "text",
              props: { content: quizData.questions[0].text },
            },
          ],
        },
        {
          type: "div",
          props: { className: "options" },
          key: "options",
          children: quizData.questions[0].options.map((option, idx) => ({
            type: "div",
            key: `option-${idx}`,
            props: {
              className: "option",
              selected: false,
              correct: null,
            },
            children: [
              {
                type: "text",
                props: { content: option },
              },
            ],
          })),
        },
      ],
    },
    {
      type: "div",
      props: { className: "navigation" },
      key: "navigation",
      children: [
        {
          type: "button",
          props: {
            disabled: true,
            className: "nav-button",
          },
          key: "prev",
          children: [
            {
              type: "text",
              props: { content: "←" },
            },
          ],
        },
        {
          type: "button",
          props: {
            disabled: false,
            className: "nav-button",
          },
          key: "next",
          children: [
            {
              type: "text",
              props: { content: "→" },
            },
          ],
        },
      ],
    },
  ],
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
