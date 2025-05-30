import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { createRoot, type Root } from "react-dom/client";
import { RootContainer } from "./ServerDiffReconciliator.style";
import type { VNode } from "./ServerDiffReconciliator.interface";
import { QUIZ_ACTION_TYPES, SERVER_URL, SOCKET_EVENT_NAMES } from "@constants";

// Initialize socket outside of component to prevent re-initialization
const socket: Socket = io(SERVER_URL);

function createElement(vnode: VNode): React.ReactElement {
  if (vnode.type === "text") {
    return React.createElement(React.Fragment, null, vnode.props.content || "");
  }

  // Prepare props for React element
  const props: Record<string, any> = { ...vnode.props };

  // Handle class names
  const classNames = [props.className];
  if (props.selected) classNames.push("selected");
  if (props.correct !== null && props.correct !== undefined) {
    classNames.push(props.correct ? "correct" : "incorrect");
  }
  props.className = classNames.filter(Boolean).join(" ");

  // Add click handlers
  if (vnode.type === "div" && vnode.props.className === "option") {
    props.onClick = () => {
      const element = document.querySelector(`[data-key="${vnode.key}"]`);
      const questionContainer = element?.closest(".question-container");
      const questionIndex = parseInt(
        questionContainer?.getAttribute("data-question-index") || "0"
      );
      const optionKey = vnode.key as string;
      const optionIndex = parseInt(optionKey.split("-")[1]);

      socket.emit(SOCKET_EVENT_NAMES.QUIZ_ACTION, {
        type: QUIZ_ACTION_TYPES.ANSWER_SELECTED,
        payload: { questionIndex, optionIndex },
      });
    };
  }

  if (vnode.type === "button" && vnode.props.className === "nav-button") {
    props.onClick = () => {
      const direction = vnode.key === "prev" ? -1 : 1;
      const questionContainer = document.querySelector(".question-container");
      const currentQuestionIndex = parseInt(
        questionContainer?.getAttribute("data-question-index") || "0"
      );
      const newIndex = currentQuestionIndex + direction;

      if (newIndex >= 0 && newIndex <= 2) {
        // We know there are 3 questions
        socket.emit(SOCKET_EVENT_NAMES.QUIZ_ACTION, {
          type: QUIZ_ACTION_TYPES.NAVIGATE,
          payload: { direction },
        });
      }
    };
  }

  // Set data attributes
  if (vnode.key !== undefined) {
    props["data-key"] = String(vnode.key);
  }

  // Create React element with children
  return React.createElement(
    vnode.type,
    props,
    vnode.children?.map((child) => createElement(child))
  );
}

const ServerDiffReconciliator = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Root | null>(null);
  const [vdom, setVdom] = useState<VNode | null>(null);

  useEffect(() => {
    // Initialize React root
    if (containerRef.current && !rootRef.current) {
      rootRef.current = createRoot(containerRef.current);
    }

    // Handle reconnection
    const handleReconnect = () => {
      console.log("Socket reconnected, cleaning up old state");
      setVdom(null);
    };

    socket.on("connect", handleReconnect);

    socket.on(SOCKET_EVENT_NAMES.INITIAL_VDOM, (newVdom: VNode) => {
      console.log("Received initial VDOM", newVdom);
      setVdom(newVdom);
    });

    socket.on(SOCKET_EVENT_NAMES.VDOM_UPDATE, (changes: VNode[]) => {
      setVdom((prev) => {
        console.log("changes received:", changes, prev);
        if (!prev) return prev;
        const updated = JSON.parse(JSON.stringify(prev)); // Deep clone to avoid mutation

        changes.forEach((change) => {
          const updateNode = (node: VNode) => {
            if (node.key === change.key) {
              Object.assign(node, change);
              return;
            }
            node.children?.forEach(updateNode);
          };
          updateNode(updated);
        });

        return updated;
      });
    });

    return () => {
      socket.off("connect");
      socket.off(SOCKET_EVENT_NAMES.INITIAL_VDOM);
      socket.off(SOCKET_EVENT_NAMES.VDOM_UPDATE);
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }
    };
  }, []);

  // Create and maintain React root
  useEffect(() => {
    if (containerRef.current && !rootRef.current) {
      rootRef.current = createRoot(containerRef.current);
    }
  }, []);

  // Render VDOM changes
  useEffect(() => {
    if (rootRef.current && vdom) {
      console.log("Rendering updated VDOM");
      const element = createElement(vdom);
      rootRef.current.render(element);
    }
  }, [vdom]);

  return <RootContainer ref={containerRef} />;
};

export default ServerDiffReconciliator;
