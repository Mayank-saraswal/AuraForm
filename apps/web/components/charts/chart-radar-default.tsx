"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart"

import { trpc } from "~/trpc/client"
import { Skeleton } from "~/components/ui/skeleton"

export const description = "A radar chart showing user countries"

const chartConfig = {
  desktop: {
    label: "Visitors",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ChartRadarDefault() {
  const { data, isLoading } = trpc.responses.globalAnalytics.useQuery()
  const rawData = data?.countryStats ?? []

  return (
    <Card className="liquid-glass card-lift relative overflow-hidden h-full flex flex-col">
      <CardHeader className="items-center pb-4 border-b border-border/50">
        <CardTitle className="font-serif text-2xl tracking-tight">Top Countries</CardTitle>
        <CardDescription>
          Showing form visitors by country location
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0 flex-1 flex items-center justify-center">
        {isLoading ? (
          <Skeleton className="h-[250px] w-full rounded-xl bg-primary/5 mt-4" />
        ) : rawData.length === 0 ? (
          <div className="flex h-[250px] w-full items-center justify-center text-sm text-muted-foreground">
            No country data available.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[300px]"
          >
            <RadarChart data={rawData}>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <PolarAngleAxis dataKey="country" />
              <PolarGrid />
              <Radar
                dataKey="desktop"
                fill="var(--color-desktop)"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm border-t border-border/50 pt-4 mt-auto">
        <div className="flex items-center gap-2 leading-none font-medium">
          Analytics based on the last 6 months <TrendingUp className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-2 leading-none text-muted-foreground">
          Aggregated across all forms
        </div>
      </CardFooter>
    </Card>
  )
}
