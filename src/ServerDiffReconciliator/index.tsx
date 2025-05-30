import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { RootContainer } from "./ServerDiffReconciliator.style";
import type { VNode } from "./ServerDiffReconciliator.interface";

const socket: Socket = io("http://localhost:3001");

const createElement = (vnode: VNode): HTMLElement | Text => {
  // Handle text nodes (leaf nodes in our virtual DOM)
  if (vnode.type === "text") {
    return document.createTextNode(vnode.props.content || "");
  }

  // Create the base DOM element
  const element = document.createElement(vnode.type) as HTMLElement;

  // Process all properties from the virtual node
  Object.entries(vnode.props).forEach(([key, value]) => {
    if (key === "className" && typeof value === "string") {
      element.className = value;
    }
    // Handle selection state for quiz options
    else if (key === "selected") {
      if (value) {
        element.classList.add("selected");
      } else {
        element.classList.remove("selected");
      }
    }
    // Handle correct/incorrect states for quiz answers
    else if (key === "correct" && value !== null) {
      // Clear both states first to ensure clean state
      element.classList.remove("correct", "incorrect");
      if (value === true) element.classList.add("correct");
      if (value === false) element.classList.add("incorrect");
    }
    // Handle disabled state for navigation buttons
    else if (key === "disabled" && vnode.type === "button") {
      (element as HTMLButtonElement).disabled = Boolean(value);
    }
    // Handle all other string attributes (except content which is handled separately)
    else if (key !== "content" && typeof value === "string") {
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
};

const ServerDiffReconciliator = () => {
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    socket.on("initial-vdom", (vdom: VNode) => {
      console.log("initial vdom received:", vdom);
      const newRoot = createElement(vdom);
      if (newRoot instanceof HTMLElement) {
        setRootElement(newRoot);
      }
    });

    socket.on("vdom-update", (changes: VNode[]) => {
      console.log("changes received:", changes);
      changes.forEach((newNode) => {
        console.log("newNode", newNode);
        if (typeof newNode.key !== "undefined") {
          // If this is an option update
          if ((newNode.key as string).startsWith("option-")) {
            const optionElement = document.querySelector(
              `.option[data-key="${newNode.key}"]`
            );
            const newOptionElement = createElement(newNode);
            (optionElement as HTMLElement).parentElement?.replaceChild(
              newOptionElement,
              optionElement as HTMLElement
            );
          } else {
            // For other nodes (like score), handle normally
            const existing = document.querySelector(
              `[data-key="${newNode.key}"]`
            );
            const parent = (existing as HTMLElement).parentElement;
            const newElement = createElement(newNode);
            parent?.replaceChild(
              newElement as HTMLElement,
              existing as HTMLElement
            );
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
      ref={(elem) => {
        if (elem && rootElement && !elem.hasChildNodes()) {
          elem.appendChild(rootElement);
        }
      }}
    />
  );
};

export default ServerDiffReconciliator;
