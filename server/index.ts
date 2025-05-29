import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { updateVDOM, diffVDOM, resetQuizState } from "./vdom";
import { initialVDOM } from "./constants";
import type { QuizAction } from "./vdom/vdom.interface";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Create function to reset server state
const resetServerState = () => {
  // Reset the VDOM to initial state
  currentVDOM = JSON.parse(JSON.stringify(initialVDOM));
  // Reset the state in vdom.ts
  resetQuizState();
};

let currentVDOM = initialVDOM;

io.on("connection", (socket) => {
  console.log("Client connected");

  // Reset server state on new connection
  resetServerState();

  // Send initial VDOM to client
  socket.emit("initial-vdom", currentVDOM);

  // Handle quiz interactions
  socket.on("quiz-action", (action: QuizAction) => {
    const newVDOM = updateVDOM(currentVDOM, action);
    const diff = diffVDOM(currentVDOM, newVDOM);
    currentVDOM = newVDOM;

    // Send only the changed subtrees to client
    socket.emit("vdom-update", diff);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
