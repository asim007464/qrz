"use client";

import { useEffect, useState } from "react";

export function useToast() {
  const [message, setMessage] = useState("");

  function showToast(msg: string) {
    setMessage(msg);
  }

  function clear() {
    setMessage("");
  }

  return { message, showToast, clear };
}

export default function Toast({
  message,
  onDone,
}: {
  message: string;
  onDone: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [message, onDone]);

  if (!message) return null;

  return <div className="toast">{message}</div>;
}
