import { io, Socket } from "socket.io-client";
import { RootContainer } from "./ServerDiffReconciliator.style";
import { ID_ROOT_SERVER_DIFF_RECONCILIATOR, SERVER_URL } from "@constants";
import { useSocketConnection } from "@hooks/useSocketConnection";

const socket: Socket = io(SERVER_URL);

const ServerDiffReconciliator = () => {
  useSocketConnection(socket, ID_ROOT_SERVER_DIFF_RECONCILIATOR);

  return <RootContainer id={ID_ROOT_SERVER_DIFF_RECONCILIATOR} />;
};

export default ServerDiffReconciliator;
