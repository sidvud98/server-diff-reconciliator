import "./index.css";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { io } from "socket.io-client";
import { applyPatch } from "fast-json-patch";
import type { Operation as IOperation } from "fast-json-patch";
import type { IQuizState } from "./ServerDiffReconciliator.interface";

let quizState: IQuizState | null = null;

// Wait for DOM to load on browser
document.addEventListener("DOMContentLoaded", () => {
  // If root is absent stop and return
  const root = document.getElementById("root");
  if (!root) {
    console.log("root not found!");
    return;
  }

  // Create container
  const containerWrapper = document.createElement("div");
  containerWrapper.className = "quiz-container-wrapper";
  root.appendChild(containerWrapper);

  // Create section elements
  const scoreElement = document.createElement("div");
  const questionElement = document.createElement("div");
  const navigationTogglerElement = document.createElement("div");

  // Add sections to containerWrapper
  containerWrapper.appendChild(scoreElement);
  containerWrapper.appendChild(questionElement);
  containerWrapper.appendChild(navigationTogglerElement);

  // Create roots for different sections
  const scoreRoot = createRoot(scoreElement);
  const questionRoot = createRoot(questionElement);
  const navigationRoot = createRoot(navigationTogglerElement);

  const socket = io("http://localhost:3001");

  const renderScore = () => {
    if (!quizState) return;
    scoreRoot.render(
      createElement(
        "div",
        { className: "score" },
        `Score: ${quizState.currentScore}/${quizState.totalQuestions}`
      )
    );
  };

  const renderQuestion = () => {
    if (!quizState) return;
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];

    questionRoot.render(
      createElement("div", { className: "question-container" }, [
        createElement("h2", { key: "title" }, currentQuestion.text),
        createElement(
          "div",
          { key: "options", className: "options" },
          currentQuestion.options.map((option) =>
            createElement(
              "label",
              {
                key: option.id,
                className: "option",
                onClick: (e) => {
                  e.preventDefault();
                  handleOptionSelect(currentQuestion.id, option.id);
                },
              },
              [
                createElement("input", {
                  key: "input",
                  type: "radio",
                  name: `question-${currentQuestion.id}`,
                  checked: currentQuestion.selectedOption === option.id,
                  readOnly: true,
                }),
                createElement("span", { key: "text" }, option.text),
              ]
            )
          )
        ),
        currentQuestion.answered &&
          currentQuestion.feedbackText &&
          createElement(
            "div",
            {
              key: "feedback",
              className: `feedback ${currentQuestion.feedbackClass}`,
            },
            currentQuestion.feedbackText
          ),
      ])
    );
  };

  const renderNavigation = () => {
    if (!quizState) return;
    navigationRoot.render(
      createElement("div", { className: "navigation" }, [
        createElement(
          "button",
          {
            key: "prev",
            className: "nav-button",
            onClick: () => handleNavigation("prev"),
            disabled: quizState?.currentQuestionIndex === 0,
          },
          "←"
        ),
        createElement(
          "button",
          {
            key: "next",
            className: "nav-button",
            onClick: () => handleNavigation("next"),
            disabled:
              quizState?.currentQuestionIndex ===
              quizState?.questions.length - 1,
          },
          "→"
        ),
      ])
    );
  };

  const handleOptionSelect = (questionId: number, optionId: number) => {
    socket.emit("selectOption", { questionId, optionId });
  };

  const handleNavigation = (direction: "prev" | "next") => {
    socket.emit("navigate", direction);
  };

  // Socket event handlers
  socket.on("initialState", (initialState: IQuizState) => {
    console.log("Received initial state:", initialState); // Debug log
    quizState = initialState;
    renderScore();
    renderQuestion();
    renderNavigation();
  });

  socket.on("stateUpdate", (patches: IOperation[]) => {
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
  questionRoot.render(createElement("div", null, "Loading..."));
});
