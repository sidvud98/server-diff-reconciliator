import { createRoot } from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "styled-components";
import ServerDiffReconciliator from "./ServerDiffReconciliator";
import { theme } from "./theme";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={theme}>
    <ServerDiffReconciliator />
  </ThemeProvider>
);
