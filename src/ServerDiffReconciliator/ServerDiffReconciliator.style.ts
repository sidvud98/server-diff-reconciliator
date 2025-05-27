import styled from "styled-components";

export const AppWrapper = styled.div`
  .quiz-container-wrapper {
    background-color: white;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
    gap: 16px;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;

    .score {
      font-size: 30px;
    }

    h2 {
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
    }

    .question-container {
      display: flex;
      justify-content: start;
      align-items: start;
      flex-direction: column;
      min-height: 230px;
      width: 550px;
      gap: 12px;

      .options {
        display: flex;
        align-items: start;
        flex-direction: column;

        label.option {
          cursor: pointer;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
      }

      .feedback {
        font-weight: 600;
        font-size: 20px;
        color: white;
        border-radius: 8px;
        padding: 2px 8px;
        min-width: 106px;
        text-align: center;
        user-select: none;

        &.correct {
          background-color: #6cdb6c;
        }
        &.incorrect {
          background-color: red;
        }
      }
    }

    .navigation {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      user-select: none;

      .nav-button.disabled {
        cursor: not-allowed;
        border: none;
      }
    }
  }
`;
