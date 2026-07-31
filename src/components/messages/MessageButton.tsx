"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

type MessageButtonProps = {
  callsign: string;
  className?: string;
};

export function MessageButton({ callsign, className }: MessageButtonProps) {
  const { isLoggedIn } = useAuth();
  const href = isLoggedIn
    ? `/messages?to=${encodeURIComponent(callsign)}`
    : `/login?next=${encodeURIComponent(`/messages?to=${callsign}`)}`;

  return (
    <Link href={href} className={cn("sm:flex-1 block", className)}>
      <Button
        variant="outline"
        className="w-full flex items-center justify-center gap-2 border-ham-purple text-ham-purple hover:bg-ham-purple/5"
      >
        <MessageSquare className="w-4 h-4" />
        Send Message
      </Button>
    </Link>
  );
}
