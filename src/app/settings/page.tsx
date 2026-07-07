import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Bell, Moon, Shield, Globe, ChevronRight } from "lucide-react";

const settingsGroups = [
  {
    title: "Account",
    items: [
      { icon: Bell, label: "Notifications", desc: "Push and email alerts" },
      { icon: Moon, label: "Appearance", desc: "Theme and display" },
      { icon: Shield, label: "Privacy", desc: "Who can see your profile" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: Globe, label: "Language & Region", desc: "English (US)" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeader title="Settings" backHref="/menu" />

      {settingsGroups.map((group) => (
        <div key={group.title} className="mb-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
            {group.title}
          </h3>
          <Card padding={false} className="overflow-hidden divide-y divide-gray-50">
            {group.items.map((item) => (
              <button
                key={item.label}
                className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
              >
                <item.icon className="w-5 h-5 text-ham-purple shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </Card>
        </div>
      ))}
    </AppShell>
  );
}
