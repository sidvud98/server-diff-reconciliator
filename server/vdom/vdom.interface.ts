interface IVNodeProps {
  className?: string;
  selected?: boolean;
  correct?: boolean | null;
  disabled?: boolean;
  content?: string;
  [key: string]: unknown;
}

export interface IVNode {
  type: string;
  props: IVNodeProps;
  key?: string | number;
  children?: IVNode[];
}

export interface IQuizState {
  currentQuestion: number;
  score: number;
  answers: (number | null)[];
}

export interface IAnswerSelectedPayload {
  questionIndex: number;
  optionIndex: number;
}

export interface INavigatePayload {
  direction: number;
}

export type IQuizAction =
  | { type: "ANSWER_SELECTED"; payload: IAnswerSelectedPayload }
  | { type: "NAVIGATE"; payload: INavigatePayload };
