import type { QuizAction, VNode } from "./vdom.interface";
import { initialState, QUIZ_ACTION_TYPES, quizData } from "../constants";

let currentState = { ...initialState };

// Function to reset quiz state to initial values
export const resetQuizState = () => {
  // Deep clone to ensure we get a fresh copy of initial state
  currentState = JSON.parse(JSON.stringify(initialState));
  console.log("Quiz state reset to", currentState);
};

export const updateVDOM = (oldVDOM: VNode, action: QuizAction): VNode => {
  const newVDOM = JSON.parse(JSON.stringify(oldVDOM));

  switch (action.type) {
    case QUIZ_ACTION_TYPES.ANSWER_SELECTED: {
      const { questionIndex, optionIndex } = action.payload;
      const correct =
        optionIndex === quizData.questions[questionIndex].correctAnswer;

      // Update score if this is a new answer or changing an answer
      if (currentState.answers[questionIndex] !== optionIndex) {
        if (currentState.answers[questionIndex] === null) {
          // First answer for this question
          if (correct) currentState.score++;
        } else {
          // Changing an existing answer
          const wasCorrect =
            currentState.answers[questionIndex] ===
            quizData.questions[questionIndex].correctAnswer;
          if (wasCorrect && !correct) {
            currentState.score = Math.max(0, currentState.score - 1);
          }
          if (!wasCorrect && correct) {
            currentState.score++;
          }
        }
      }

      currentState.answers[questionIndex] = optionIndex;

      // Update score display
      const scoreNode = newVDOM.children![0];
      scoreNode.key = "score";
      scoreNode.children![0].props.content = `Score: ${currentState.score}/3`;

      // Update options container
      const optionsContainer = newVDOM.children![1].children![1];
      optionsContainer.key = "options";

      // Update individual options
      optionsContainer.children = quizData.questions[questionIndex].options.map(
        (option, idx) => ({
          type: "div",
          key: `option-${idx}`,
          props: {
            className: "option",
            selected: idx === optionIndex,
            correct: idx === optionIndex ? correct : null,
          },
          children: [{ type: "text", props: { content: option } }],
        })
      );
      return newVDOM;
    }

    case QUIZ_ACTION_TYPES.NAVIGATE: {
      const { direction } = action.payload;
      const newQuestionIndex = currentState.currentQuestion + direction;

      // Validate navigation bounds
      if (
        newQuestionIndex < 0 ||
        newQuestionIndex >= quizData.questions.length
      ) {
        return oldVDOM; // Return original VDOM if navigation is out of bounds
      }

      currentState.currentQuestion = newQuestionIndex;

      // Update question
      const question = quizData.questions[currentState.currentQuestion];
      // Update question container's data attribute
      newVDOM.children![1].props["data-question-index"] =
        currentState.currentQuestion.toString();
      // Update question text
      newVDOM.children![1].children![0].children![0].props.content =
        question.text;

      // Update options container
      const optionsContainer = newVDOM.children![1].children![1];
      optionsContainer.key = "options";

      // Update options with the current question's options and preserve selection state
      const selectedAnswer = currentState.answers[currentState.currentQuestion];
      optionsContainer.children = quizData.questions[
        currentState.currentQuestion
      ].options.map((option, idx) => ({
        type: "div",
        key: `option-${idx}`,
        props: {
          className: "option",
          selected: idx === selectedAnswer,
          correct:
            idx === selectedAnswer ? idx === question.correctAnswer : null,
        },
        children: [{ type: "text", props: { content: option } }],
      }));

      // Update navigation buttons
      newVDOM.children![2].children![0].props.disabled =
        currentState.currentQuestion === 0;
      newVDOM.children![2].children![1].props.disabled =
        currentState.currentQuestion === 2;

      return newVDOM;
    }

    default:
      return oldVDOM;
  }
};

export const diffVDOM = (oldVDOM: VNode, newVDOM: VNode): VNode[] => {
  const changes: VNode[] = [];

  // Helper function to check if node has changed
  const hasNodeChanged = (oldNode: VNode, newNode: VNode): boolean => {
    if (oldNode.type !== newNode.type) return true;
    if (JSON.stringify(oldNode.props) !== JSON.stringify(newNode.props))
      return true;
    if (oldNode.key !== newNode.key) return true;
    return false;
  };

  // Helper function to traverse and compare VDOMs
  const traverse = (oldNode: VNode, newNode: VNode, path: string[] = []) => {
    // Always include nodes with key "score" or "options" in changes
    if (newNode.key === "score" || newNode.key === "options") {
      changes.push(newNode);
      return;
    }

    if (hasNodeChanged(oldNode, newNode)) {
      changes.push(newNode);
      return;
    }

    if (oldNode.children && newNode.children) {
      for (let i = 0; i < oldNode.children.length; i++) {
        traverse(oldNode.children[i], newNode.children[i], [
          ...path,
          i.toString(),
        ]);
      }
    }
  };

  traverse(oldVDOM, newVDOM);
  return changes;
};
