// apps/web/app/(marketing)/explore/page.tsx
"use client";
import { useState } from "react";
import { trpc }       from "~/trpc/client";
import Link           from "next/link";
import { motion }     from "framer-motion";
import { RiRamLine, RiSearchLine, RiArrowRightLine, RiEyeLine } from "react-icons/ri";
import { TbChartInfographic } from "react-icons/tb";
import { Badge }      from "~/components/ui/badge";
import { Input }      from "~/components/ui/input";
import { Skeleton }   from "~/components/ui/skeleton";
import { getFormShareUrl, truncate } from "~/lib/utils";

const CATEGORIES = ["All", "Streaming", "Social", "Culture", "Gaming", "Anime", "Startup", "Minimal"];

export default function ExplorePage() {
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState("All");

  const { data, isLoading } = trpc.forms.listPublic.useQuery({ page: 1, limit: 24 });

  const rawForms = (data as { forms: {
    id: string; title: string; slug: string | null; description: string | null;
    responseCount: number; viewCount: number;
    theme: { name: string; category?: string; config?: { accentColor?: string; bgColor?: string } } | null;
  }[] } | undefined)?.forms ?? [];

  const forms = rawForms.filter((f) => {
    const matchSearch = !search || f.title.toLowerCase().includes(search.toLowerCase());
    const matchCat    = category === "All" || f.theme?.category === category.toLowerCase();
    return matchSearch && matchCat;
  });

  return (
    <div className="bg-[#050505] min-h-dvh px-4 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-primary">Explore</p>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Discover public forms
          </h1>
          <p className="mt-4 text-white/50">
            Browse forms created by the AuraForm community. Fill them out or use as inspiration.
          </p>
        </div>

        {/* Search + filter */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-md">
            <RiSearchLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              placeholder="Search forms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-white/30"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                  category === cat
                    ? "bg-primary text-white"
                    : "border border-white/10 bg-white/5 text-white/50 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : forms.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <RiRamLine className="h-12 w-12 text-white/20" />
            <p className="text-white/50">No public forms found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {forms.map((form, i) => {
              const themeConfig = form.theme?.config;
              return (
                <motion.div
                  key={form.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group card-lift overflow-hidden rounded-xl border border-white/10"
                >
                  {/* Theme preview strip */}
                  <div
                    className="flex h-24 items-end justify-between p-4"
                    style={{
                      background: themeConfig?.bgColor ?? "#1a1a1a",
                      borderBottom: `2px solid ${(themeConfig?.accentColor ?? "var(--primary)")}20`,
                    }}
                  >
                    <div
                      className="h-2 w-16 rounded-full"
                      style={{ background: themeConfig?.accentColor ?? "var(--primary)" }}
                    />
                    {form.theme && (
                      <Badge className="text-[10px]" style={{
                        background: (themeConfig?.accentColor ?? "var(--primary)") + "30",
                        color: themeConfig?.accentColor ?? "var(--primary)",
                        border: "none",
                      }}>
                        {form.theme.name}
                      </Badge>
                    )}
                  </div>

                  {/* Card content */}
                  <div className="bg-[#111] p-4">
                    <h3 className="text-sm font-semibold text-white line-clamp-2">
                      {truncate(form.title, 60)}
                    </h3>
                    <div className="mt-2 flex items-center gap-3 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <TbChartInfographic className="h-3.5 w-3.5" />
                        {form.responseCount} responses
                      </span>
                      {form.description && (
                        <span className="flex items-center gap-1">
                          <RiEyeLine className="h-3.5 w-3.5" />
                          {form.viewCount} views
                        </span>
                      )}
                    </div>
                    <Link
                      href={form.slug ? getFormShareUrl(form.slug) : "#"}
                      className="mt-3 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Fill form <RiArrowRightLine className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
