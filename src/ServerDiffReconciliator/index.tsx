import React, { useEffect } from "react";
import "../index.css";
import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { io } from "socket.io-client";
import { applyPatch } from "fast-json-patch";
import type { Operation as IOperation } from "fast-json-patch";
import type { IOption, IQuizState } from "./ServerDiffReconciliator.interface";
import { AppWrapper } from "./ServerDiffReconciliator.style";
import {
  SERVER_URL,
  SOCKET_EVENT_NAMES,
  type IDirectionType,
  DIFF_SLUGS,
} from "../constants";

// Variable & socket initialization
let quizState: IQuizState | null = null;
const socket = io(SERVER_URL);

//        ▄▖     ▌    ▘     ▄▖      ▗ ▘       ▄▖▗     ▗
// ▀▘▀▘▀▘ ▙▘█▌▛▌▛▌█▌▛▘▌▛▌▛▌ ▙▖▌▌▛▌▛▘▜▘▌▛▌▛▌▛▘ ▚ ▜▘▀▌▛▘▜▘ ▀▘▀▘▀▘
// ▀▘▀▘▀▘ ▌▌▙▖▌▌▙▌▙▖▌ ▌▌▌▙▌ ▌ ▙▌▌▌▙▖▐▖▌▙▌▌▌▄▌ ▄▌▐▖█▌▌ ▐▖ ▀▘▀▘▀▘
//                       ▄▌

const handleOptionSelect = (questionId: number, optionId: number) => {
  socket.emit(SOCKET_EVENT_NAMES.SELECT_OPTION, { questionId, optionId });
};

const handleNavigation = (direction: IDirectionType) => {
  socket.emit(SOCKET_EVENT_NAMES.NAVIGATE, direction);
};

const renderScore = (quizState: IQuizState | null, scoreRoot: Root) => {
  if (!quizState) return;
  scoreRoot.render(
    createElement(
      "div",
      { className: "score" },
      `Score: ${quizState.currentScore}/${quizState.totalQuestions}`
    )
  );
};

const renderNavigation = (
  quizState: IQuizState | null,
  navigationRoot: Root
) => {
  if (!quizState) return;
  const disabledPrevFlag = quizState?.currentQuestionIndex === 0;
  const disabledNextFlag =
    quizState?.currentQuestionIndex === quizState?.questions.length - 1;
  navigationRoot.render(
    createElement("div", { className: "navigation" }, [
      createElement(
        "button",
        {
          key: "prev",
          className: `nav-button ${disabledPrevFlag ? "disabled" : ""}`,
          onClick: () => handleNavigation("prev"),
          disabled: disabledPrevFlag,
        },
        "←"
      ),
      createElement(
        "button",
        {
          key: "next",
          className: `nav-button ${disabledNextFlag ? "disabled" : ""}`,
          onClick: () => handleNavigation("next"),
          disabled: disabledNextFlag,
        },
        "→"
      ),
    ])
  );
};

const renderQuestion = (quizState: IQuizState | null, questionRoot: Root) => {
  if (!quizState) return;
  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];

  const createOptionElement = (option: IOption) =>
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
    );

  questionRoot.render(
    createElement("div", { className: "question-container" }, [
      createElement("h2", { key: "title" }, currentQuestion.text),
      createElement(
        "div",
        { key: "options", className: "options" },
        currentQuestion.options.map(createOptionElement)
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

//        ▄▖     ▌    ▘     ▄▖      ▗ ▘       ▄▖   ▌
// ▀▘▀▘▀▘ ▙▘█▌▛▌▛▌█▌▛▘▌▛▌▛▌ ▙▖▌▌▛▌▛▘▜▘▌▛▌▛▌▛▘ ▙▖▛▌▛▌ ▀▘▀▘▀▘
// ▀▘▀▘▀▘ ▌▌▙▖▌▌▙▌▙▖▌ ▌▌▌▙▌ ▌ ▙▌▌▌▙▖▐▖▌▙▌▌▌▄▌ ▙▖▌▌▙▌ ▀▘▀▘▀▘
//                       ▄▌

const ServerDiffReconciliator: React.FC = () => {
  useEffect(() => {
    // Wait for DOM to load on browser
    const root = document.getElementById("server-diff-reconciliator-root");
    // If root is absent stop and return
    if (!root) {
      console.log("root not found!");
      return;
    }

    // Create wrapper container
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
    const scoreNode = createRoot(scoreElement);
    const questionNode = createRoot(questionElement);
    const navigationNode = createRoot(navigationTogglerElement);

    // Socket event handlers
    socket.on(SOCKET_EVENT_NAMES.INITIAL_STATE, (initialState: IQuizState) => {
      console.log("Received initial state:", initialState); // Debug log
      quizState = initialState;
      renderScore(quizState, scoreNode);
      renderQuestion(quizState, questionNode);
      renderNavigation(quizState, navigationNode);
    });

    socket.on(SOCKET_EVENT_NAMES.STATE_UPDATE, (patches: IOperation[]) => {
      if (!quizState) return;
      console.log("Received patches:", patches); // Debug log
      const newState = JSON.parse(JSON.stringify(quizState));
      applyPatch(newState, patches);
      quizState = newState;

      // Check what changed and only update affected components
      patches.forEach((patch) => {
        const path = patch.path.split("/");
        if (path.includes(DIFF_SLUGS.CURRENT_SCORE))
          renderScore(quizState, scoreNode);
        if (
          path.includes(DIFF_SLUGS.QUESTIONS) ||
          path.includes(DIFF_SLUGS.CURRENT_QUESTION_INDEX)
        )
          renderQuestion(quizState, questionNode);
        if (path.includes(DIFF_SLUGS.CURRENT_QUESTION_INDEX))
          renderNavigation(quizState, navigationNode);
      });
    });
  }, []);

  return (
    <AppWrapper>
      <div id="server-diff-reconciliator-root" />
    </AppWrapper>
  );
};

export default ServerDiffReconciliator;
