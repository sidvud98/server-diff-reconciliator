import styled from "styled-components";

export const RootContainer = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  flex-direction: column;
  gap: 16px;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  color: #333;

  .quiz-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .score {
    font-size: 30px;
    text-align: center;
  }

  .question-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .option {
    padding: 1rem;
    border: 2px solid #ccc;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;

    &.selected {
      border-color: #646cff;
      background-color: #f0f0ff;
    }

    &.correct {
      border-color: #4caf50;
      color: #4caf50;
    }

    &.incorrect {
      border-color: #f44336;
      color: #f44336;
    }
  }

  .navigation {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .nav-button {
    padding: 0.5rem 1rem;
    font-size: 1.5rem;
    border: none;
    background-color: #646cff;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .nav-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;
