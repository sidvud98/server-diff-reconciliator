import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import jsonpatch from "fast-json-patch";
import {
  INITIAL_DATA,
  CLIENT_URL,
  OPTIONS,
  OPTIONS_CLASSES,
  SOCKET_EVENT_NAMES,
  SERVER_PORT,
  DIRECTIONS,
  type IDirectionType,
} from "../src/constants";
import { sanitizeStateForClient } from "../src/utils/helper";
import type {
  IQuestion,
  IOption,
} from "../src/ServerDiffReconciliator/ServerDiffReconciliator.interface";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

// Initial state
const initialState = INITIAL_DATA;

// Keep track of current state for each client
const clientStates = new Map();

io.on(SOCKET_EVENT_NAMES.CONNECTION, (socket) => {
  // Initialize client state
  clientStates.set(socket.id, JSON.parse(JSON.stringify(initialState)));

  // Send initial state to client
  socket.emit(
    SOCKET_EVENT_NAMES.INITIAL_STATE,
    sanitizeStateForClient(initialState)
  );

  // Handle option selection
  socket.on(
    SOCKET_EVENT_NAMES.SELECT_OPTION,
    ({ questionId, optionId }: { questionId: number; optionId: number }) => {
      const currentState = clientStates.get(socket.id);
      const previousState = JSON.parse(JSON.stringify(currentState));

      const question = currentState.questions.find(
        (q: IQuestion) => q.id === questionId
      );
      if (question) {
        const option = question.options.find(
          (opt: IOption) => opt.id === optionId
        );
        if (option) {
          // Get previous answer state to handle score changes
          const previousOption = question.options.find(
            (opt: IOption) => opt.id === question.selectedOption
          );

          // Update selected option
          question.selectedOption = optionId;
          question.answered = true;

          // Update score based on the change
          if (!previousOption && option.isCorrect) {
            currentState.currentScore += 1;
          } else if (previousOption?.isCorrect && !option.isCorrect) {
            currentState.currentScore -= 1;
          } else if (!previousOption?.isCorrect && option.isCorrect) {
            currentState.currentScore += 1;
          }

          // Set feedback text and class based on the selected option
          question.feedbackText = option.isCorrect
            ? OPTIONS.CORRECT
            : OPTIONS.INCORRECT;
          question.feedbackClass = option.isCorrect
            ? OPTIONS_CLASSES.CORRECT
            : OPTIONS_CLASSES.INCORRECT;
        }
      }

      // Generate diff
      const patches = jsonpatch.compare(previousState, currentState);
      socket.emit(SOCKET_EVENT_NAMES.STATE_UPDATE, patches);
    }
  );

  // Handle question navigation
  socket.on(SOCKET_EVENT_NAMES.NAVIGATE, (direction: IDirectionType) => {
    const currentState = clientStates.get(socket.id);
    const previousState = JSON.parse(JSON.stringify(currentState));

    if (
      direction === DIRECTIONS.NEXT &&
      currentState.currentQuestionIndex < 2
    ) {
      currentState.currentQuestionIndex += 1;
    } else if (
      direction === DIRECTIONS.PREVIOUS &&
      currentState.currentQuestionIndex > 0
    ) {
      currentState.currentQuestionIndex -= 1;
    }

    // Generate diff
    const patches = jsonpatch.compare(previousState, currentState);
    socket.emit(SOCKET_EVENT_NAMES.STATE_UPDATE, patches);
  });

  socket.on(SOCKET_EVENT_NAMES.DISCONNECT, () => {
    clientStates.delete(socket.id);
  });
});

httpServer.listen(SERVER_PORT, () => {
  console.log(`Server running on port ${SERVER_PORT}`);
});
