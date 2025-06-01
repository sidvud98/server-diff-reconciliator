import styled from "styled-components";
import { type Theme } from "../theme";

export const RootContainer = styled.div<{ theme: Theme }>`
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  box-shadow: ${({ theme }) => theme.shadows.default};
  color: ${({ theme }) => theme.colors.text.primary};
  width: 36rem;

  .quiz-container {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.lg};

    h2 {
      margin: 0;
    }
  }

  .score {
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: ${({ theme }) => theme.fontWeight.normal};
    text-align: center;
  }

  .question-container {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
    user-select: none;
  }

  .option {
    padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    cursor: pointer;
    font-weight: ${({ theme }) => theme.fontWeight.semiBold};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &.selected {
      box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    }

    &.correct {
      border-color: ${({ theme }) => theme.colors.status.correct};
      color: ${({ theme }) => theme.colors.backgroundLight};
      background-color: ${({ theme }) => theme.colors.status.correct};
    }

    &.incorrect {
      border-color: ${({ theme }) => theme.colors.status.incorrect};
      color: ${({ theme }) => theme.colors.backgroundLight};
      background-color: ${({ theme }) => theme.colors.status.incorrect};
    }
  }

  .navigation {
    display: flex;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing.sm};

    .nav-button {
      padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
      font-size: ${({ theme }) => theme.fontSize.medium};
      border: none;
      background-color: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.text.light};
      border-radius: ${({ theme }) => theme.borderRadius.sm};
      cursor: pointer;
      width: 50%;
      box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;

      &:disabled {
        background-color: ${({ theme }) => theme.colors.border.default};
        cursor: not-allowed;
      }
    }
  }
`;
