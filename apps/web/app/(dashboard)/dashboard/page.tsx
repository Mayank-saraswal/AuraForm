// apps/web/app/(dashboard)/dashboard/page.tsx
"use client";
import { trpc } from "~/trpc/client";
import { RiFormLine, RiEyeLine, RiArrowRightLine, RiAddLine } from "react-icons/ri";
import { TbChartInfographic } from "react-icons/tb";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import Link from "next/link";
import { truncate } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: React.ElementType; color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ background: color + "20" }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardOverviewPage() {
  const { data, isLoading } = trpc.forms.list.useQuery({ page: 1, limit: 5 });

  const totalForms     = data?.total ?? 0;
  const publishedForms = data?.forms.filter((f: { status: string }) => f.status === "published").length ?? 0;
  const totalResponses = data?.forms.reduce((acc: number, f: { responseCount: number }) => acc + f.responseCount, 0) ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : (
          <>
            <StatCard label="Total forms"        value={totalForms}     icon={RiFormLine}         color="#6C47FF" />
            <StatCard label="Published forms"    value={publishedForms} icon={RiEyeLine}          color="#10B981" />
            <StatCard label="Total responses"    value={totalResponses} icon={TbChartInfographic} color="#F59E0B" />
          </>
        )}
      </div>

      {/* Recent forms */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-semibold">Recent Forms</CardTitle>
          <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
            <Link href="/dashboard/forms">
              View all <RiArrowRightLine className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 border-t px-5 py-4">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <div className="flex-1"><Skeleton className="h-4 w-40 mb-1" /><Skeleton className="h-3 w-24" /></div>
                </div>
              ))
            : data?.forms.length === 0
            ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <RiFormLine className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No forms yet.</p>
                  <Button asChild size="sm" className="bg-[#6C47FF]">
                    <Link href="/dashboard/forms/new"><RiAddLine className="mr-1.5 h-4 w-4" />Create your first form</Link>
                  </Button>
                </div>
              )
            : data?.forms.map((form: { id: string; title: string; responseCount: number; status: string }) => (
                <div key={form.id} className="flex items-center gap-4 border-t px-5 py-3.5 hover:bg-accent/40 transition-colors">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#6C47FF]/10">
                    <RiFormLine className="h-4 w-4 text-[#6C47FF]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{truncate(form.title, 50)}</p>
                    <p className="text-xs text-muted-foreground">
                      {form.responseCount} response{form.responseCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Badge
                    variant={form.status === "published" ? "default" : "secondary"}
                    className={`text-xs ${form.status === "published" ? "bg-[#10B981]/10 text-[#10B981]" : ""}`}
                  >
                    {form.status}
                  </Badge>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/forms/${form.id}/edit`}>
                      <RiArrowRightLine className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))
          }
        </CardContent>
      </Card>
    </div>
  );
}
