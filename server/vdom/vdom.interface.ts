interface VNodeProps {
  className?: string;
  selected?: boolean;
  correct?: boolean | null;
  disabled?: boolean;
  content?: string;
  [key: string]: unknown;
}

export interface VNode {
  type: string;
  props: VNodeProps;
  key?: string | number;
  children?: VNode[];
}

export interface QuizState {
  currentQuestion: number;
  score: number;
  answers: (number | null)[];
}

export interface AnswerSelectedPayload {
  questionIndex: number;
  optionIndex: number;
}

export interface NavigatePayload {
  direction: number;
}

export type QuizAction =
  | { type: "ANSWER_SELECTED"; payload: AnswerSelectedPayload }
  | { type: "NAVIGATE"; payload: NavigatePayload };
