import { ChartAreaInteractive } from "~/components/charts/chart-area-interactive"
import { ChartRadarDefault } from "~/components/charts/chart-radar-default"

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-8 py-4">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">Analytics</h1>
        <p className="mt-2 text-muted-foreground">Explore your form performance and visitor statistics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartAreaInteractive />
        </div>
        <div className="lg:col-span-1">
          <ChartRadarDefault />
        </div>
      </div>
    </div>
  )
}
