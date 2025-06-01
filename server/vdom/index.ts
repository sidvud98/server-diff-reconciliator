import type { QuizAction, VNode } from "./vdom.interface";
import {
  initialState,
  QUIZ_ACTION_TYPES,
  QUIZ_DATA,
  KEY_CODES,
  CLASSNAMES,
  QUIZ_LENGTH,
} from "../constants";

let currentState = { ...initialState };

// Helper function to check if node has changed
const hasNodeChanged = (oldNode: VNode, newNode: VNode): boolean => {
  if (oldNode.type !== newNode.type) return true;
  if (JSON.stringify(oldNode.props) !== JSON.stringify(newNode.props))
    return true;
  if (oldNode.key !== newNode.key) return true;
  return false;
};

export const diffVDOM = (
  oldNode: VNode,
  newNode: VNode,
  isRoot: boolean = true
): VNode[] => {
  const changes: VNode[] = [];

  // Handle score changes at root level and skip its children traversal
  if (
    isRoot &&
    oldNode.children?.[0]?.key === "score" &&
    newNode.children?.[0]?.key === "score"
  ) {
    const oldScoreContainer = oldNode.children[0];
    const newScoreContainer = newNode.children[0];

    if (
      oldScoreContainer.children?.[0]?.props.content !==
      newScoreContainer.children?.[0]?.props.content
    ) {
      changes.push(newScoreContainer);
    }

    // Skip index 0 (score container) in root level traversal
    if (oldNode.children && newNode.children) {
      for (let i = 1; i < oldNode.children.length; i++) {
        const childChanges = diffVDOM(
          oldNode.children[i],
          newNode.children[i],
          false
        );
        changes.push(...childChanges);
      }
      return changes;
    }
  }

  // For options container, find specific changed options
  if (newNode.key === "options" && oldNode.children && newNode.children) {
    const changedOptions = newNode.children.filter((newChild, index) => {
      const oldChild = oldNode.children![index];
      return hasNodeChanged(oldChild, newChild);
    });
    if (changedOptions.length > 0) {
      changes.push(...changedOptions);
      return changes;
    }
  }

  // For non-root nodes that have changed
  if (!isRoot && hasNodeChanged(oldNode, newNode)) {
    changes.push(newNode);
    return changes;
  }

  // For non-root nodes, recursively check children
  if (!isRoot && oldNode.children && newNode.children) {
    for (let i = 0; i < oldNode.children.length; i++) {
      const childChanges = diffVDOM(
        oldNode.children[i],
        newNode.children[i],
        false
      );
      changes.push(...childChanges);
    }
  }

  return changes;
};

export const updateVDOM = (oldVDOM: VNode, action: QuizAction): VNode => {
  const newVDOM = JSON.parse(JSON.stringify(oldVDOM));

  switch (action.type) {
    case QUIZ_ACTION_TYPES.ANSWER_SELECTED: {
      const { questionIndex, optionIndex } = action.payload;
      const correct =
        optionIndex === QUIZ_DATA.questions[questionIndex].correctAnswer;

      // Track old score before any updates
      const oldScore = currentState.score;

      // Update score if this is a new answer or changing an answer
      if (currentState.answers[questionIndex] !== optionIndex) {
        if (currentState.answers[questionIndex] === null) {
          // First answer for this question
          if (correct) currentState.score++;
        } else {
          // Changing an existing answer
          const wasCorrect =
            currentState.answers[questionIndex] ===
            QUIZ_DATA.questions[questionIndex].correctAnswer;
          if (wasCorrect && !correct) {
            currentState.score = Math.max(0, currentState.score - 1);
          }
          if (!wasCorrect && correct) {
            currentState.score++;
          }
        }
      }

      currentState.answers[questionIndex] = optionIndex;

      // Only update score display if score actually changed
      if (currentState.score !== oldScore) {
        const scoreNode = newVDOM.children![0];
        scoreNode.key = KEY_CODES.SCORE;
        scoreNode.children![0].props.content = `Score: ${currentState.score}/${QUIZ_LENGTH}`;
      }

      // Update options container
      const optionsContainer = newVDOM.children![1].children![1];
      optionsContainer.key = KEY_CODES.OPTIONS;

      // Update individual options
      optionsContainer.children = QUIZ_DATA.questions[
        questionIndex
      ].options.map((option, idx) => ({
        type: "div",
        key: `${KEY_CODES.OPTION}-${idx}`,
        props: {
          className: CLASSNAMES.OPTION,
          selected: idx === optionIndex,
          correct: idx === optionIndex ? correct : null,
        },
        children: [{ type: "text", props: { content: option } }],
      }));
      return newVDOM;
    }

    case QUIZ_ACTION_TYPES.NAVIGATE: {
      const { direction } = action.payload;
      const newQuestionIndex = currentState.currentQuestion + direction;

      // Validate navigation bounds
      if (
        newQuestionIndex < 0 ||
        newQuestionIndex >= QUIZ_DATA.questions.length
      ) {
        return oldVDOM; // Return original VDOM if navigation is out of bounds
      }

      currentState.currentQuestion = newQuestionIndex;

      // Update question
      const question = QUIZ_DATA.questions[currentState.currentQuestion];
      // Update question container's data attribute
      newVDOM.children![1].props["data-question-index"] =
        currentState.currentQuestion.toString();
      // Update question text
      newVDOM.children![1].children![0].children![0].props.content =
        question.text;

      // Update options container
      const optionsContainer = newVDOM.children![1].children![1];
      optionsContainer.key = KEY_CODES.OPTIONS;

      // Update options with the current question's options and preserve selection state
      const selectedAnswer = currentState.answers[currentState.currentQuestion];
      optionsContainer.children = QUIZ_DATA.questions[
        currentState.currentQuestion
      ].options.map((option, idx) => ({
        type: "div",
        key: `${KEY_CODES.OPTION}-${idx}`,
        props: {
          className: CLASSNAMES.OPTION,
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

// Function to reset quiz state to initial values
export const resetQuizState = () => {
  // Deep clone to ensure we get a fresh copy of initial state
  currentState = JSON.parse(JSON.stringify(initialState));
  console.log("Quiz state reset to", currentState);
};
