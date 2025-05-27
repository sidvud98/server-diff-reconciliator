import { createRoot } from "react-dom/client";
import "./index.css";
import ServerDiffReconciliator from "./ServerDiffReconciliator/ServerDiffReconciliator";

createRoot(document.getElementById("root")!).render(
  <ServerDiffReconciliator />
);
