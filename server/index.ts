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
      text: "What is React?",
      options: [
        {
          id: 1,
          text: "A JavaScript library for building user interfaces",
          isCorrect: true,
        },
        { id: 2, text: "A programming language", isCorrect: false },
        { id: 3, text: "A database system", isCorrect: false },
        { id: 4, text: "An operating system", isCorrect: false },
      ],
      selectedOption: null,
      answered: false,
      feedbackText: "",
      feedbackClass: "",
    },
    {
      id: 2,
      text: "What is TypeScript?",
      options: [
        { id: 1, text: "A CSS framework", isCorrect: false },
        { id: 2, text: "A superset of JavaScript", isCorrect: true },
        { id: 3, text: "A database", isCorrect: false },
        { id: 4, text: "A web browser", isCorrect: false },
      ],
      selectedOption: null,
      answered: false,
      feedbackText: "",
      feedbackClass: "",
    },
    {
      id: 3,
      text: "What is Node.js?",
      options: [
        { id: 1, text: "A browser", isCorrect: false },
        { id: 2, text: "A frontend framework", isCorrect: false },
        { id: 3, text: "A JavaScript runtime environment", isCorrect: true },
        { id: 4, text: "A programming language", isCorrect: false },
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

io.on("connection", (socket) => {
  console.log("Client connected");

  // Initialize client state
  clientStates.set(socket.id, JSON.parse(JSON.stringify(initialState)));

  const initialStateWithoutIsCorrectKey = {
    ...initialState,
    questions: initialState.questions.map((q) => ({
      ...q,
      options: q.options.map(({ isCorrect, ...opt }) => opt),
    })),
  };

  // Send initial state to client
  socket.emit("initialState", initialStateWithoutIsCorrectKey);

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
        question.feedbackText = option.isCorrect ? "Correct!" : "Incorrect!";
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
