import type { IMCQData } from "../constants";

// Helper function to remove isCorrect from options before sending to client
export const sanitizeStateForClient = (state: IMCQData) => {
  return {
    ...state,
    questions: state.questions.map((q) => ({
      ...q,
      options: q.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
      })),
    })),
  };
};
