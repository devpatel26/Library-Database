import { useContext } from "react";
import { MessageContext } from "../context/messageContextObject";

export function useMessage() {
  const context = useContext(MessageContext);

  if (!context) {
    throw new Error("useMessage must be used within a MessageProvider.");
  }

  return context;
}