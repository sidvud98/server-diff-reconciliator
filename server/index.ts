import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import jsonpatch from "fast-json-patch";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Initial state
const initialState = {
  currentScore: 0,
  totalQuestions: 3,
  currentQuestionIndex: 0,
  questions: [
    {
      id: 1,
      text: "What color is a banana?",
      options: [
        { id: 1, text: "Blue", isCorrect: false },
        { id: 2, text: "Yellow", isCorrect: true },
        { id: 3, text: "Red", isCorrect: false },
        { id: 4, text: "Green", isCorrect: false },
      ],
      selectedOption: null,
      answered: false,
      feedbackText: "",
      feedbackClass: "",
    },
    {
      id: 2,
      text: "Which animal is known for its black and white stripes?",
      options: [
        { id: 1, text: "Lion", isCorrect: false },
        { id: 2, text: "Zebra", isCorrect: true },
        { id: 3, text: "Elephant", isCorrect: false },
        { id: 4, text: "Monkey", isCorrect: false },
      ],
      selectedOption: null,
      answered: false,
      feedbackText: "",
      feedbackClass: "",
    },
    {
      id: 3,
      text: "What do bees make that we can eat?",
      options: [
        { id: 1, text: "Milk", isCorrect: false },
        { id: 2, text: "Honey", isCorrect: true },
        { id: 3, text: "Bread", isCorrect: false },
        { id: 4, text: "Cheese", isCorrect: false },
      ],
      selectedOption: null,
      answered: false,
      feedbackText: "",
      feedbackClass: "",
    },
  ],
};

// Keep track of current state for each client
const clientStates = new Map();

// Helper function to remove isCorrect from options before sending to client
const sanitizeStateForClient = (state) => {
  return {
    ...state,
    questions: state.questions.map((q) => ({
      ...q,
      options: q.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
      })),
    })),
  };
};

io.on("connection", (socket) => {
  console.log("Client connected");

  // Initialize client state
  clientStates.set(socket.id, JSON.parse(JSON.stringify(initialState)));

  // Send initial state to client
  socket.emit("initialState", sanitizeStateForClient(initialState));

  // Handle option selection
  socket.on("selectOption", ({ questionId, optionId }) => {
    const currentState = clientStates.get(socket.id);
    const previousState = JSON.parse(JSON.stringify(currentState));

    const question = currentState.questions.find((q) => q.id === questionId);
    if (question) {
      const option = question.options.find((opt) => opt.id === optionId);
      if (option) {
        // Get previous answer state to handle score changes
        const previousOption = question.options.find(
          (opt) => opt.id === question.selectedOption
        );

        // Update selected option
        question.selectedOption = optionId;
        question.answered = true;

        // Update score based on the change
        if (!previousOption && option.isCorrect) {
          // First answer and it's correct
          currentState.currentScore += 1;
        } else if (previousOption?.isCorrect && !option.isCorrect) {
          // Changed from correct to incorrect
          currentState.currentScore -= 1;
        } else if (!previousOption?.isCorrect && option.isCorrect) {
          // Changed from incorrect to correct
          currentState.currentScore += 1;
        }

        // Set feedback text and class based on the selected option
        question.feedbackText = option.isCorrect ? "Correct" : "Incorrect";
        question.feedbackClass = option.isCorrect ? "correct" : "incorrect";
      }
    }

    // Generate diff
    const patches = jsonpatch.compare(previousState, currentState);
    socket.emit("stateUpdate", patches);
  });

  // Handle question navigation
  socket.on("navigate", (direction) => {
    const currentState = clientStates.get(socket.id);
    const previousState = JSON.parse(JSON.stringify(currentState));

    if (direction === "next" && currentState.currentQuestionIndex < 2) {
      currentState.currentQuestionIndex += 1;
    } else if (direction === "prev" && currentState.currentQuestionIndex > 0) {
      currentState.currentQuestionIndex -= 1;
    }

    // Generate diff
    const patches = jsonpatch.compare(previousState, currentState);
    socket.emit("stateUpdate", patches);
  });

  socket.on("disconnect", () => {
    clientStates.delete(socket.id);
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
