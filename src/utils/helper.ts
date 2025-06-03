import { Socket } from "socket.io-client";
import {
  CLASSNAMES,
  VDOM_PROPS,
  QUIZ_ACTION_TYPES,
  SOCKET_EVENT_NAMES,
} from "@constants";
import type { IVNode } from "@src/ServerDiffReconciliator/ServerDiffReconciliator.interface";

export const createCustomElement = (
  vnode: IVNode,
  socket: Socket
): HTMLElement | Text => {
  // Handle text nodes (leaf nodes in our virtual DOM)
  if (vnode.type === "text") {
    return document.createTextNode(vnode.props.content || "");
  }

  // Create the base DOM element
  const element = document.createElement(vnode.type) as HTMLElement;

  // Process all properties from the virtual node
  Object.entries(vnode.props).forEach(([key, value]) => {
    if (key === VDOM_PROPS.CLASSNAME && typeof value === "string") {
      element.className = value;
    }
    // Handle selection state for quiz options
    else if (key === VDOM_PROPS.SELECTED) {
      if (value) {
        element.classList.add(CLASSNAMES.SELECTED);
      } else {
        element.classList.remove(CLASSNAMES.SELECTED);
      }
    }
    // Handle correct/incorrect states for quiz answers
    else if (key === VDOM_PROPS.CORRECT && value !== null) {
      // Clear both states first to ensure clean state
      element.classList.remove(CLASSNAMES.CORRECT, CLASSNAMES.INCORRECT);
      if (value === true) element.classList.add(CLASSNAMES.CORRECT);
      if (value === false) element.classList.add(CLASSNAMES.INCORRECT);
    }
    // Handle disabled state for navigation buttons
    else if (key === VDOM_PROPS.DISABLED && vnode.type === "button") {
      (element as HTMLButtonElement).disabled = Boolean(value);
    }
    // Handle all other string attributes (except content which is handled separately)
    else if (key !== VDOM_PROPS.CONTENT && typeof value === "string") {
      element.setAttribute(key, value);
    }
  });

  // Add click handler for quiz options (divs with class "option")
  if (vnode.type === "div" && vnode.props.className === CLASSNAMES.OPTION) {
    element.addEventListener("click", () => {
      // If the option is already selected, do nothing
      if (vnode.props.selected) {
        return;
      }

      // Find the parent question container by traversing up the DOM tree
      const questionContainer = element.closest(
        `.${CLASSNAMES.QUESTION_CONTAINER}`
      );

      // Get the question index from the container's data attribute
      const questionIndex = parseInt(
        questionContainer?.getAttribute("data-question-index") || "0"
      );

      // Get option index directly from the data-key attribute (format: "option-{index}")
      const optionIndex = parseInt(
        element.getAttribute("data-key")?.split("-")[1] || "0"
      );

      // Emit event to server with the question and option indices
      socket.emit(SOCKET_EVENT_NAMES.QUIZ_ACTION, {
        type: QUIZ_ACTION_TYPES.ANSWER_SELECTED,
        payload: { questionIndex, optionIndex },
      });
    });
  }

  if (
    vnode.type === "button" &&
    vnode.props.className === CLASSNAMES.NAV_BUTTON
  ) {
    element.addEventListener("click", () => {
      // Add an extra layer of safety redundancy despite button being disabled
      // Do nothing if the button is disabled
      if (vnode.props.disabled) {
        return;
      }

      const direction = vnode.key === VDOM_PROPS.PREVIOUS ? -1 : 1;
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
    vnode.children.forEach((child: IVNode) => {
      element.appendChild(createCustomElement(child, socket));
    });
  }

  return element;
};
