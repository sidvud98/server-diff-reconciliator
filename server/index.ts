import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { updateVDOM, diffVDOM, resetQuizState } from "./vdom";
import {
  CLIENT_URL,
  initialVDOM,
  SERVER_PORT,
  SOCKET_EVENT_NAMES,
} from "./constants";
import type { QuizAction } from "./vdom/vdom.interface";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

// Create function to reset server state
const resetServerState = () => {
  // Reset the VDOM to initial state
  currentVDOM = JSON.parse(JSON.stringify(initialVDOM));
  // Reset the state in vdom.ts
  resetQuizState();
  console.log("Server state fully reset", { currentVDOM });
};

let currentVDOM = initialVDOM;

io.on(SOCKET_EVENT_NAMES.CONNECTION, (socket) => {
  console.log("Client connected");

  // Reset server state on new connection
  resetServerState();
  console.log("Server state reset for new connection");

  // Send initial VDOM to client
  socket.emit(
    SOCKET_EVENT_NAMES.INITIAL_VDOM,
    JSON.parse(JSON.stringify(initialVDOM))
  );

  // Handle quiz interactions
  socket.on(SOCKET_EVENT_NAMES.QUIZ_ACTION, (action: QuizAction) => {
    const newVDOM = updateVDOM(currentVDOM, action);
    const diff = diffVDOM(currentVDOM, newVDOM);
    currentVDOM = newVDOM;

    // Send only the changed subtrees to client
    socket.emit(SOCKET_EVENT_NAMES.VDOM_UPDATE, diff);
  });

  socket.on(SOCKET_EVENT_NAMES.DISCONNECT, () => {
    console.log("Client disconnected");
  });
});

httpServer.listen(SERVER_PORT, () => {
  console.log(`Server running on port ${SERVER_PORT}`);
});
