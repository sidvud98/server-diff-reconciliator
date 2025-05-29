import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { RootContainer } from "./ServerDiffReconciliator.style";
import type { VNode } from "./ServerDiffReconciliator.interface";
import { QUIZ_ACTION_TYPES, SERVER_URL, SOCKET_EVENT_NAMES } from "@constants";

// Initialize socket outside of component to prevent re-initialization
const socket: Socket = io(SERVER_URL);

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
      socket.emit(SOCKET_EVENT_NAMES.QUIZ_ACTION, {
        type: QUIZ_ACTION_TYPES.ANSWER_SELECTED,
        payload: { questionIndex, optionIndex },
      });
    });
  }

  if (vnode.type === "button" && vnode.props.className === "nav-button") {
    element.addEventListener("click", () => {
      const direction = vnode.key === "prev" ? -1 : 1;
      console.log("clicked navigate:", direction);
      socket.emit(SOCKET_EVENT_NAMES.QUIZ_ACTION, {
        type: QUIZ_ACTION_TYPES.NAVIGATE,
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

const ServerDiffReconciliator = () => {
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Handle reconnection
    const handleReconnect = () => {
      console.log("Socket reconnected, cleaning up old state");
      if (rootElement) {
        // Clear all children
        while (rootElement.firstChild) {
          rootElement.removeChild(rootElement.firstChild);
        }
        setRootElement(null);
      }
    };

    socket.on("connect", handleReconnect);

    socket.on(SOCKET_EVENT_NAMES.INITIAL_VDOM, (vdom: VNode) => {
      console.log("Received initial VDOM", vdom);
      const newRoot = createElement(vdom);
      if (newRoot instanceof HTMLElement) {
        setRootElement(newRoot);
      }
    });

    socket.on(SOCKET_EVENT_NAMES.VDOM_UPDATE, (changes: VNode[]) => {
      console.log("changes received:", changes);
      changes.forEach((newNode) => {
        if (typeof newNode.key !== "undefined") {
          const existing = document.querySelector(
            `[data-key="${newNode.key}"]`
          );
          if (existing instanceof HTMLElement) {
            const parent = existing.parentElement;
            const newElement = createElement(newNode);
            if (newElement instanceof HTMLElement && parent) {
              parent.replaceChild(newElement, existing);
            }
          }
        }
      });
    });

    return () => {
      socket.off("connect");
      socket.off(SOCKET_EVENT_NAMES.INITIAL_VDOM);
      socket.off(SOCKET_EVENT_NAMES.VDOM_UPDATE);
    };
  }, [rootElement]);

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
