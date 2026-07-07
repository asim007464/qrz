import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { analyticsData } from "@/lib/mock-data";

export default function AnalyticsPage() {
  return (
    <AppShell>
      <PageHeader title="Analytics" backHref="/menu" />
      <AnalyticsDashboard data={analyticsData} />
    </AppShell>
  );
}
