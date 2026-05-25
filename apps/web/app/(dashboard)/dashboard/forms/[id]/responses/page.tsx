// apps/web/app/(dashboard)/dashboard/forms/[id]/responses/page.tsx
"use client";
import React from "react";
import { useParams }   from "next/navigation";
import { trpc }        from "~/trpc/client";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton }    from "~/components/ui/skeleton";
import { Button }      from "~/components/ui/button";
import { formatDuration } from "~/lib/utils";
import { RiDownloadLine, RiBarChartLine, RiEyeLine, RiTimeLine } from "react-icons/ri";
import { TbChartInfographic } from "react-icons/tb";

function MetricCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: React.ElementType; color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ background: color + "20" }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CsvExportButton({ formId }: { formId: string }) {
  const [isExporting, setIsExporting] = React.useState(false);
  const utils = trpc.useUtils();

  async function handleExport() {
    setIsExporting(true);
    try {
      const data = await utils.client.responses.exportCsv.query({ id: formId });
      const blob = new Blob([data.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Export failed.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport} disabled={isExporting}>
      <RiDownloadLine className="h-4 w-4" />
      {isExporting ? "Exporting..." : "Export CSV"}
    </Button>
  );
}

export default function FormAnalyticsPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = trpc.responses.analytics.useQuery({ id });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  const analyticsData = data as {
    form: { title: string; viewCount: number; completionRate: number };
    totalResponses: number;
    avgTimeMs: number | null;
    dailyStats: { date: string; count: number }[];
  };

  const { form, totalResponses, avgTimeMs, dailyStats } = analyticsData;

  const completionColor = form.completionRate >= 70
    ? "#10B981" : form.completionRate >= 40 ? "#F59E0B" : "#EF4444";

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">{form.title}</h2>
          <p className="text-sm text-muted-foreground">Response analytics and insights</p>
        </div>
        <CsvExportButton formId={id} />
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="Total views"      value={form.viewCount.toLocaleString()}     icon={RiEyeLine}          color="#6C47FF" />
        <MetricCard label="Responses"        value={totalResponses.toLocaleString()}     icon={TbChartInfographic} color="#10B981" />
        <MetricCard label="Completion rate"  value={`${form.completionRate}%`}           icon={RiBarChartLine}     color={completionColor} />
        <MetricCard label="Avg. time"        value={avgTimeMs ? formatDuration(avgTimeMs) : "\u2014"} icon={RiTimeLine} color="#F59E0B" />
      </div>

      {/* Daily responses chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Responses over time (30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyStats} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(d: string) => d.slice(5)}
              />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#6C47FF"
                strokeWidth={2}
                dot={{ fill: "#6C47FF", r: 3 }}
                name="Responses"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Completion rate gauge (simple bar) */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Completion rate</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {totalResponses} completed out of {form.viewCount} views
            </span>
            <span className="font-bold" style={{ color: completionColor }}>
              {form.completionRate}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${form.completionRate}%`, background: completionColor }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {form.completionRate >= 70
              ? "Excellent completion rate. Your form is well-optimised."
              : form.completionRate >= 40
              ? "Average completion rate. Consider shortening your form."
              : "Low completion rate. Try reducing the number of questions."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
