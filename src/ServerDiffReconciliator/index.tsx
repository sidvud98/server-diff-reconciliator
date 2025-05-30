import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { RootContainer } from "./ServerDiffReconciliator.style";
import type { VNode } from "./ServerDiffReconciliator.interface";

// Initialize socket outside of component to prevent re-initialization
const socket: Socket = io("http://localhost:3001");

function createElement(vnode: VNode): HTMLElement | Text {
  if (vnode.type === "text") {
    return document.createTextNode(vnode.props.content || "");
  }

  const element = document.createElement(vnode.type) as HTMLElement;

  // Set properties
  Object.entries(vnode.props).forEach(([key, value]) => {
    if (key === "className" && typeof value === "string") {
      element.className = value;
    } else if (key === "selected") {
      if (value) {
        element.classList.add("selected");
      } else {
        element.classList.remove("selected");
      }
    } else if (key === "correct" && value !== null) {
      element.classList.remove("correct", "incorrect");
      if (value === true) element.classList.add("correct");
      if (value === false) element.classList.add("incorrect");
    } else if (key === "disabled" && vnode.type === "button") {
      (element as HTMLButtonElement).disabled = Boolean(value);
    } else if (key !== "content" && typeof value === "string") {
      element.setAttribute(key, value);
    }
  });

  // Add event listeners
  if (vnode.type === "div" && vnode.props.className === "option") {
    element.addEventListener("click", () => {
      const questionContainer = element.closest(".question-container");
      const questionIndex = parseInt(
        questionContainer?.getAttribute("data-question-index") || "0"
      );
      const optionIndex = Array.from(
        element.parentElement?.children || []
      ).indexOf(element);
      console.log("clicked option:", questionIndex, optionIndex);
      socket.emit("quiz-action", {
        type: "ANSWER_SELECTED",
        payload: { questionIndex, optionIndex },
      });
    });
  }

  if (vnode.type === "button" && vnode.props.className === "nav-button") {
    element.addEventListener("click", () => {
      const direction = vnode.key === "prev" ? -1 : 1;
      console.log("clicked navigate:", direction);
      socket.emit("quiz-action", {
        type: "NAVIGATE",
        payload: { direction },
      });
    });
  }

  // Set data-key attribute if key exists
  if (vnode.key !== undefined) {
    element.setAttribute("data-key", String(vnode.key));
  }

  // Create and append children
  if (vnode.children) {
    vnode.children.forEach((child) => {
      element.appendChild(createElement(child));
    });
  }

  return element;
}

function updateElement(existing: HTMLElement | Text, vnode: VNode): void {
  if (vnode.type === "text") {
    if (
      existing instanceof Text &&
      existing.textContent !== vnode.props.content
    ) {
      existing.textContent = vnode.props.content || "";
    }
    return;
  }

  if (!(existing instanceof HTMLElement)) return;

  // Update properties
  Object.entries(vnode.props).forEach(([key, value]) => {
    if (key === "className" && typeof value === "string") {
      if (existing.className !== value) {
        existing.className = value;
      }
    } else if (key === "selected") {
      const hasSelected = existing.classList.contains("selected");
      if (value && !hasSelected) {
        existing.classList.add("selected");
      } else if (!value && hasSelected) {
        existing.classList.remove("selected");
      }
    } else if (key === "correct" && value !== null) {
      const wasCorrect = existing.classList.contains("correct");
      const wasIncorrect = existing.classList.contains("incorrect");

      if (value === true && !wasCorrect) {
        if (wasIncorrect) existing.classList.remove("incorrect");
        existing.classList.add("correct");
      } else if (value === false && !wasIncorrect) {
        if (wasCorrect) existing.classList.remove("correct");
        existing.classList.add("incorrect");
      }
    } else if (key === "disabled" && existing instanceof HTMLButtonElement) {
      if (existing.disabled !== Boolean(value)) {
        existing.disabled = Boolean(value);
      }
    } else if (key !== "content" && typeof value === "string") {
      const currentValue = existing.getAttribute(key);
      if (currentValue !== value) {
        existing.setAttribute(key, value);
      }
    }
  });

  // Update children if they exist
  if (vnode.children && existing instanceof HTMLElement) {
    // Only update children for non-text nodes
    const existingChildren = Array.from(existing.childNodes);
    vnode.children.forEach((childVNode, i) => {
      const childElement = existingChildren[i];
      if (childElement instanceof HTMLElement || childElement instanceof Text) {
        updateElement(childElement, childVNode);
      }
    });
  }
}

const ServerDiffReconciliator = () => {
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    socket.on("initial-vdom", (vdom: VNode) => {
      const newRoot = createElement(vdom);
      if (newRoot instanceof HTMLElement) {
        setRootElement(newRoot);
      }
    });

    socket.on("vdom-update", (changes: VNode[]) => {
      console.log("changes received:", changes);
      changes.forEach((newNode) => {
        if (typeof newNode.key !== "undefined") {
          const existing = document.querySelector(
            `[data-key="${newNode.key}"]`
          );
          if (existing instanceof HTMLElement) {
            // Update the existing element instead of replacing it
            updateElement(existing, newNode);
          }
        }
      });
    });

    return () => {
      socket.off("initial-vdom");
      socket.off("vdom-update");
    };
  }, []);

  return (
    <RootContainer
      ref={(el) => {
        if (el && rootElement && !el.hasChildNodes()) {
          el.appendChild(rootElement);
        }
      }}
    />
  );
};

export default ServerDiffReconciliator;
