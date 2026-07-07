"use client";

import Link from "next/link";
import { Radio, CreditCard, ExternalLink } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { OPENREPEATER_SITE } from "@/lib/openRepeater";

const options = [
  {
    href: "/qsl/send",
    icon: CreditCard,
    title: "Send QSL Card",
    description: "Create and send a digital QSL card to another operator.",
    color: "from-ham-purple to-ham-accent",
  },
  {
    href: "/repeaters",
    icon: Radio,
    title: "Browse Repeaters",
    description: "Search the worldwide repeater list from Open Repeater.",
    color: "from-qsl-teal to-ham-accent",
  },
];

export default function AddPage() {
  return (
    <AppShell>
      <PageHeader title="Add" backHref="/" />

      <p className="text-sm text-gray-600 mb-4">What would you like to do?</p>

      <div className="space-y-3">
        {options.map((opt) => (
          <Link key={opt.href} href={opt.href}>
            <Card className="flex items-center gap-4 hover:border-ham-accent/40 transition-colors cursor-pointer">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${opt.color} flex items-center justify-center shrink-0`}>
                <opt.icon className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-ham-purple">{opt.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{opt.description}</p>
              </div>
            </Card>
          </Link>
        ))}

        <a
          href={`${OPENREPEATER_SITE}/add`}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Card className="flex items-center gap-4 hover:border-ham-accent/40 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-qsl-orange flex items-center justify-center shrink-0">
              <ExternalLink className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-ham-purple">Add Repeater on Open Repeater</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Submit a new repeater listing to the Open Repeater database.
              </p>
            </div>
          </Card>
        </a>
      </div>
    </AppShell>
  );
}
