import type { QuizState, VNode } from "server/vdom/vdom.interface";

export const quizData = {
  questions: [
    {
      id: 1,
      text: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: 2,
    },
    {
      id: 2,
      text: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correctAnswer: 1,
    },
    {
      id: 3,
      text: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      correctAnswer: 1,
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
