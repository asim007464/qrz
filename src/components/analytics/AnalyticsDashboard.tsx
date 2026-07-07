"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { AnalyticsData } from "@/types";
import { Card } from "@/components/ui/Card";
import { TrendingUp } from "lucide-react";

type AnalyticsDashboardProps = {
  data: AnalyticsData;
};

function StatCard({
  label,
  value,
  change,
}: {
  label: string;
  value: number;
  change: number;
}) {
  return (
    <Card className="text-center">
      <p className="text-2xl md:text-3xl font-bold text-ham-purple">
        {value.toLocaleString()}
      </p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      <div className="flex items-center justify-center gap-1 mt-2 text-green-600 text-xs font-medium">
        <TrendingUp className="w-3.5 h-3.5" />
        +{change}%
      </div>
    </Card>
  );
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <StatCard label="Views" value={data.views} change={data.viewsChange} />
        <StatCard label="Clicks" value={data.clicks} change={data.clicksChange} />
        <StatCard label="Shares" value={data.shares} change={data.sharesChange} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold text-ham-purple mb-4">Views Over Time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.viewsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#7C3AED"
                strokeWidth={2.5}
                dot={{ fill: "#7C3AED", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="font-semibold text-ham-purple mb-4">Traffic Source</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.trafficSources}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {data.trafficSources.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-ham-purple mb-3">Recent Activity</h3>
        <div className="space-y-3">
          {data.recentActivity.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 border-b border-gray-50 last:border-0"
            >
              <p className="text-sm text-gray-700">{item.message}</p>
              <span className="text-xs text-gray-400 shrink-0">{item.timestamp}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
