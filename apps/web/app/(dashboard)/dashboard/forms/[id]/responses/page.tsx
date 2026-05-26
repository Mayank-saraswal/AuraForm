// apps/web/app/(dashboard)/dashboard/forms/[id]/responses/page.tsx
"use client";
import React, { useState } from "react";
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
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "~/components/ui/table";

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

      {/* Individual Responses Table */}
      <ResponsesTable formId={id} />
    </div>
  );
}

// ── Responses Table with Pagination ──────────────────────────────────────────
function ResponsesTable({ formId }: { formId: string }) {
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const { data, isLoading } = trpc.responses.list.useQuery({
    formId,
    page,
    limit: LIMIT,
  });

  const responses = (data as { responses?: unknown[] } | undefined)?.responses ?? [];
  const total = (data as { total?: number } | undefined)?.total ?? 0;

  const columns: ColumnDef<Record<string, unknown>>[] = [
    {
      accessorKey: "submittedAt",
      header:      "Submitted",
      cell: ({ row }) => {
        const val = row.original["submittedAt"];
        if (!val) return "—";
        return format(new Date(val as string), "dd MMM yyyy, hh:mm a");
      },
    },
    {
      accessorKey: "timeToCompleteMs",
      header:      "Time",
      cell: ({ row }) => {
        const ms = row.original["timeToCompleteMs"] as number | null;
        return ms ? formatDuration(ms) : "—";
      },
    },
    {
      id:     "answers",
      header: "First answer",
      cell:   ({ row }) => {
        const answers = row.original["answers"] as Array<{ value: unknown }> | undefined;
        const first = answers?.[0];
        if (!first) return "—";
        const val = first.value;
        if (Array.isArray(val)) return val.join(", ");
        return String(val ?? "—").slice(0, 60);
      },
    },
  ];

  const table = useReactTable({
    data:             responses as Record<string, unknown>[],
    columns,
    getCoreRowModel:  getCoreRowModel(),
    manualPagination: true,
    rowCount:         total,
  });

  if (isLoading) return <Skeleton className="h-64 rounded-xl" />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold">
          Individual Responses ({total})
        </CardTitle>
        <CsvExportButton formId={formId} />
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id} className="text-xs">
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-10 text-center text-sm text-muted-foreground">
                  No responses yet.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Page {page} of {Math.ceil(total / LIMIT)}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline" size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline" size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / LIMIT)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
