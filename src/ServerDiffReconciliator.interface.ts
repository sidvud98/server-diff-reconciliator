export interface IOption {
  id: number;
  text: string;
}

export interface IQuestion {
  id: number;
  text: string;
  options: IOption[];
  selectedOption: number | null;
  answered: boolean;
  feedbackText: string;
  feedbackClass: string;
}

export interface IQuizState {
  currentScore: number;
  totalQuestions: number;
  currentQuestionIndex: number;
  questions: IQuestion[];
}
