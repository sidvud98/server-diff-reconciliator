import { io, Socket } from "socket.io-client";
import { RootContainer } from "./ServerDiffReconciliator.style";
import { SERVER_URL } from "@constants";
import { useSocketConnection } from "../hooks/useSocketConnection";

const socket: Socket = io(SERVER_URL);

const ServerDiffReconciliator = () => {
  useSocketConnection(socket);

  return <RootContainer id="root-server-diff-reconciliator" />;
};

export default ServerDiffReconciliator;
