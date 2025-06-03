import { SOCKET_EVENT_NAMES } from "@constants";
import { useEffect } from "react";
import { Socket } from "socket.io-client";
import type { IVNode } from "../ServerDiffReconciliator/ServerDiffReconciliator.interface.ts";
import { createCustomElement } from "../utils/helper";

export const useSocketConnection = (socket: Socket) => {
  useEffect(() => {
    socket.on(SOCKET_EVENT_NAMES.INITIAL_VDOM, (vdom: IVNode) => {
      console.log("Initial VDOM received:", vdom);
      const newRoot = createCustomElement(vdom, socket);
      document
        .getElementById("root-server-diff-reconciliator")
        ?.appendChild(newRoot);
    });

    socket.on(SOCKET_EVENT_NAMES.VDOM_UPDATE, (changes: IVNode[]) => {
      console.log("changes received:", changes);
      changes.forEach((newNode) => {
        if (typeof newNode.key !== "undefined") {
          // If this is an option update
          if ((newNode.key as string).startsWith("option-")) {
            const optionElement = document.querySelector(
              `.option[data-key="${newNode.key}"]`
            );
            const newOptionElement = createCustomElement(newNode, socket);
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
            const newElement = createCustomElement(newNode, socket);
            parent?.replaceChild(
              newElement as HTMLElement,
              existing as HTMLElement
            );
          }
        }
      });
    });

    return () => {
      socket.off(SOCKET_EVENT_NAMES.INITIAL_VDOM);
      socket.off(SOCKET_EVENT_NAMES.VDOM_UPDATE);
    };
  }, [socket]);
};
