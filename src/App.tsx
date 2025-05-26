import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { applyPatch } from "fast-json-patch";
import type { Operation } from "fast-json-patch";
import "./App.css";

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

function App() {
  const [state, setState] = useState<QuizState | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:3001");

    socketRef.current.on("initialState", (initialState: QuizState) => {
      setState(initialState);
    });

    socketRef.current.on("stateUpdate", (patches: Operation[]) => {
      setState((prevState) => {
        if (!prevState) return null;
        const newState = JSON.parse(JSON.stringify(prevState));
        applyPatch(newState, patches);
        return newState;
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleOptionSelect = (questionId: number, optionId: number) => {
    socketRef.current?.emit("selectOption", { questionId, optionId });
  };

  const handleNavigation = (direction: "prev" | "next") => {
    socketRef.current?.emit("navigate", direction);
  };

  if (!state) return <div>Loading...</div>;

  const currentQuestion = state.questions[state.currentQuestionIndex];

  return (
    <div className="quiz-container">
      <div className="score">
        Score: {state.currentScore}/{state.totalQuestions}
      </div>

      <div className="question-container">
        <h2>{currentQuestion.text}</h2>
        <div className="options">
          {currentQuestion.options.map((option) => (
            <label key={option.id} className="option">
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                checked={currentQuestion.selectedOption === option.id}
                onChange={() =>
                  handleOptionSelect(currentQuestion.id, option.id)
                }
                disabled={currentQuestion.answered}
              />
              <span>{option.text}</span>
            </label>
          ))}
        </div>
        {currentQuestion.answered && (
          <div
            className={`feedback ${
              currentQuestion.options.find(
                (opt) => opt.id === currentQuestion.selectedOption
              )?.isCorrect
                ? "correct"
                : "incorrect"
            }`}
          >
            {currentQuestion.options.find(
              (opt) => opt.id === currentQuestion.selectedOption
            )?.isCorrect
              ? "Correct!"
              : "Incorrect!"}
          </div>
        )}
      </div>

      <div className="navigation">
        <button
          className="nav-button"
          onClick={() => handleNavigation("prev")}
          disabled={state.currentQuestionIndex === 0}
        >
          ←
        </button>
        <button
          className="nav-button"
          onClick={() => handleNavigation("next")}
          disabled={state.currentQuestionIndex === state.questions.length - 1}
        >
          →
        </button>
      </div>
    </div>
  );
}

export default App;
