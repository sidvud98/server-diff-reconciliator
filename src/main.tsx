import "./index.css";
import { createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { io } from "socket.io-client";
import { applyPatch } from "fast-json-patch";
import type { Operation } from "fast-json-patch";

interface Option {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  text: string;
  options: Option[];
  selectedOption: number | null;
  answered: boolean;
}

interface QuizState {
  currentScore: number;
  totalQuestions: number;
  currentQuestionIndex: number;
  questions: Question[];
}

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) return;

  // Create container
  const container = document.createElement("div");
  container.className = "quiz-container";
  rootElement.appendChild(container);

  // Create section elements
  const scoreElement = document.createElement("div");
  const questionElement = document.createElement("div");
  const navigationElement = document.createElement("div");

  // Add sections to container
  container.appendChild(scoreElement);
  container.appendChild(questionElement);
  container.appendChild(navigationElement);

  // Create roots for different sections
  const scoreRoot = createRoot(scoreElement);
  const questionRoot = createRoot(questionElement);
  const navigationRoot = createRoot(navigationElement);

  let quizState: QuizState | null = null;
  const socket = io("http://localhost:3001");

  function renderScore() {
    if (!quizState) return;
    scoreRoot.render(
      h(
        "div",
        { className: "score" },
        `Score: ${quizState.currentScore}/${quizState.totalQuestions}`
      )
    );
  }

  function renderQuestion() {
    if (!quizState) return;
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];

    questionRoot.render(
      h("div", { className: "question-container" }, [
        h("h2", { key: "title" }, currentQuestion.text),
        h(
          "div",
          { key: "options", className: "options" },
          currentQuestion.options.map((option) =>
            h(
              "label",
              {
                key: option.id,
                className: "option",
                onClick: (e) => {
                  // Prevent default to handle the click ourselves
                  e.preventDefault();
                  if (!currentQuestion.answered) {
                    handleOptionSelect(currentQuestion.id, option.id);
                  }
                },
              },
              [
                h("input", {
                  key: "input",
                  type: "radio",
                  name: `question-${currentQuestion.id}`,
                  checked: currentQuestion.selectedOption === option.id,
                  readOnly: true, // Since we're handling click on the label
                  disabled: currentQuestion.answered,
                }),
                h("span", { key: "text" }, option.text),
              ]
            )
          )
        ),
        currentQuestion.answered &&
          h(
            "div",
            {
              key: "feedback",
              className: `feedback ${
                currentQuestion.options.find(
                  (opt) => opt.id === currentQuestion.selectedOption
                )?.isCorrect
                  ? "correct"
                  : "incorrect"
              }`,
            },
            currentQuestion.options.find(
              (opt) => opt.id === currentQuestion.selectedOption
            )?.isCorrect
              ? "Correct!"
              : "Incorrect!"
          ),
      ])
    );
  }

  function renderNavigation() {
    if (!quizState) return;
    navigationRoot.render(
      h("div", { className: "navigation" }, [
        h(
          "button",
          {
            key: "prev",
            className: "nav-button",
            onClick: () => handleNavigation("prev"),
            disabled: quizState?.currentQuestionIndex === 0,
          },
          "←"
        ),
        h(
          "button",
          {
            key: "next",
            className: "nav-button",
            onClick: () => handleNavigation("next"),
            disabled:
              quizState?.currentQuestionIndex === quizState?.questions.length - 1,
          },
          "→"
        ),
      ])
    );
  }

  function handleOptionSelect(questionId: number, optionId: number) {
    socket.emit("selectOption", { questionId, optionId });
  }

  function handleNavigation(direction: "prev" | "next") {
    socket.emit("navigate", direction);
  }

  // Socket event handlers
  socket.on("initialState", (initialState: QuizState) => {
    console.log("Received initial state:", initialState); // Debug log
    quizState = initialState;
    renderScore();
    renderQuestion();
    renderNavigation();
  });

  socket.on("stateUpdate", (patches: Operation[]) => {
    if (!quizState) return;
    console.log("Received patches:", patches); // Debug log
    const newState = JSON.parse(JSON.stringify(quizState));
    applyPatch(newState, patches);
    quizState = newState;

    // Check what changed and only update affected components
    patches.forEach((patch) => {
      const path = patch.path.split("/");
      if (path.includes("currentScore")) renderScore();
      if (path.includes("questions") || path.includes("currentQuestionIndex"))
        renderQuestion();
      if (path.includes("currentQuestionIndex")) renderNavigation();
    });
  });

  // Show initial loading state
  questionRoot.render(h("div", null, "Loading..."));
});
