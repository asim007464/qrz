import Link from "next/link";
import { Bot } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ProfileBanner } from "@/components/layout/ProfileBanner";
import { ActivityFeed } from "@/components/home/ActivityFeed";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { currentUser, activities } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <AppShell>
      <ProfileBanner user={currentUser} className="mb-4" />

      <ActivityFeed activities={activities} />

      <Card className="mt-4 overflow-hidden p-0">
        <div className="gradient-purple p-5 text-white">
          <p className="text-xs font-medium uppercase tracking-wider opacity-70">Upcoming Event</p>
          <h3 className="text-xl font-bold mt-1">HAMFEST INDIA 2024</h3>
          <p className="text-sm text-white/70 mt-1">
            Join operators from across the country for workshops, demos, and DX sessions.
          </p>
          <Link href="/contact">
            <Button variant="secondary" size="sm" className="mt-3 bg-white/20 hover:bg-white/30 border-0">
              View Details
            </Button>
          </Link>
        </div>
      </Card>

      <Card className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="w-10 h-10 rounded-full gradient-purple flex items-center justify-center shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm text-ham-purple">AI Assistant</p>
          <p className="text-xs text-gray-500">Ask about bands, propagation, or QSL info</p>
        </div>
        <Link href="/contact" className="w-full sm:w-auto">
          <Button size="sm" variant="outline" className="w-full sm:w-auto">Chat</Button>
        </Link>
      </Card>
    </AppShell>
  );
}
