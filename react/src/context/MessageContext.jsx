import React, { useCallback, useMemo, useRef, useState } from "react";
import { MessageContext } from "./messageContextObject";
import GlobalMessage from "../components/GlobalMessage";

export function MessageProvider({ children }) {
  const [messageState, setMessageState] = useState({
    type: "info",
    message: "",
  });

  const timeoutRef = useRef(null);

  const clearMessage = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setMessageState({
      type: "info",
      message: "",
    });
  }, []);

  const showMessage = useCallback((type, message, duration = 2600) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setMessageState({ type, message });

    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        setMessageState({
          type: "info",
          message: "",
        });
        timeoutRef.current = null;
      }, duration);
    }
  }, []);

  const value = useMemo(
    () => ({
      showSuccess: (message, duration) => showMessage("success", message, duration),
      showError: (message, duration) => showMessage("error", message, duration),
      showWarning: (message, duration) => showMessage("warning", message, duration),
      showInfo: (message, duration) => showMessage("info", message, duration),
      clearMessage,
    }),
    [showMessage, clearMessage]
  );

  return (
    <MessageContext.Provider value={value}>
      {children}
      <GlobalMessage
        type={messageState.type}
        message={messageState.message}
        onClose={clearMessage}
      />
    </MessageContext.Provider>
  );
}