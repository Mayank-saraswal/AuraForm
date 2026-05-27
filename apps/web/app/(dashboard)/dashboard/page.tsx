// apps/web/app/(dashboard)/dashboard/page.tsx
"use client";
import { trpc } from "~/trpc/client";
import { RiRamLine, RiEyeLine, RiArrowRightLine, RiAddLine } from "react-icons/ri";
import { TbChartInfographic } from "react-icons/tb";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import Link from "next/link";
import { truncate } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";

function StatCard({ label, value, icon: Icon }: {
  label: string; value: string | number; icon: React.ElementType;
}) {
  return (
    <Card className="liquid-glass card-lift relative overflow-hidden">
      <CardContent className="flex flex-col gap-2 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="font-serif text-5xl tracking-tight text-foreground">{value}</p>
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
    <div className="flex flex-col gap-8 py-4">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Welcome back. Here is what is happening with your forms.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-[120px] rounded-2xl liquid-glass" />)
        ) : (
          <>
            <StatCard label="Total forms" value={totalForms} icon={RiRamLine} />
            <StatCard label="Published" value={publishedForms} icon={RiEyeLine} />
            <StatCard label="Responses" value={totalResponses} icon={TbChartInfographic} />
          </>
        )}
      </div>

      {/* Recent forms */}
      <Card className="liquid-glass card-lift">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
          <CardTitle className="font-serif text-2xl tracking-tight">Recent Forms</CardTitle>
          <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-full text-xs hover:bg-primary hover:text-primary-foreground transition-colors">
            <Link href="/dashboard/forms">
              View all <RiArrowRightLine className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 border-b border-border/50 px-6 py-4 last:border-0">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="flex-1"><Skeleton className="h-5 w-48 mb-2" /><Skeleton className="h-3 w-24" /></div>
                </div>
              ))
            : data?.forms.length === 0
            ? (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <RiRamLine className="h-8 w-8 text-primary/50" />
                  </div>
                  <div>
                    <p className="font-serif text-2xl tracking-tight">No forms yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Get started by creating your first form.</p>
                  </div>
                  <Button asChild size="default" className="mt-2 bg-primary rounded-xl">
                    <Link href="/dashboard/forms/new"><RiAddLine className="mr-1.5 h-4 w-4" />Create form</Link>
                  </Button>
                </div>
              )
            : data?.forms.map((form: { id: string; title: string; responseCount: number; status: string }) => (
                <div key={form.id} className="group flex items-center gap-5 border-b border-border/50 px-6 py-4 hover:bg-accent/30 transition-colors last:border-0">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <RiRamLine className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-base font-semibold">{truncate(form.title, 50)}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {form.responseCount} response{form.responseCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[11px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-md ${form.status === "published" ? "border-[#10B981]/30 bg-[#10B981]/10 text-[#10B981]" : ""}`}
                  >
                    {form.status}
                  </Badge>
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
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
