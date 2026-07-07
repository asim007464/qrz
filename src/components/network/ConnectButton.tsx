"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";

export function ConnectButton({ callsign }: { callsign: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const connect = async () => {
    setStatus("loading");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      window.location.href = `/login?next=/profile/${callsign}`;
      return;
    }
    const res = await fetch("/api/network", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ callsign }),
    });
    if (res.ok) setStatus("done");
    else setStatus("error");
  };

  return (
    <Button className="flex-1 flex items-center justify-center gap-2" onClick={connect} disabled={status === "loading" || status === "done"}>
      <UserPlus className="w-4 h-4" />
      {status === "done" ? "Following" : status === "loading" ? "Connecting…" : status === "error" ? "Try again" : "Connect"}
    </Button>
  );
}
