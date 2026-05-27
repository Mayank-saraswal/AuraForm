"use client";
import { useState } from "react";
import { trpc } from "~/trpc/client";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { RiPaletteLine, RiCheckLine, RiArrowRightLine } from "react-icons/ri";

const CATEGORIES = ["All", "Minimal", "Gradient", "Dark", "Playful", "Professional", "Cinematic"];

export default function ThemeGalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const searchParams = useSearchParams();
  const router       = useRouter();
  
  const formId = searchParams?.get("formId");

  const { data: themes, isLoading } = trpc.themes.list.useQuery();

  const updateFormMutation = trpc.forms.update.useMutation({
    onSuccess: () => {
      toast.success("Theme applied successfully!");
      if (formId) router.push(`/dashboard/forms/${formId}/edit`);
    },
    onError: (e) => toast.error(e.message),
  });

  const filteredThemes = (themes ?? []).filter((t: any) => {
    if (activeCategory === "All") return true;
    return t.category === activeCategory.toLowerCase();
  });

  function applyTheme(themeId: string) {
    if (!formId) return;
    updateFormMutation.mutate({ id: formId, themeId });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Theme Gallery</h1>
        <p className="text-sm text-muted-foreground">
          {formId
            ? "Choose a theme for your form. You can customise it later."
            : "Browse available themes. Select a form first to apply a theme."
          }
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="sm"
            className={activeCategory === cat ? "bg-primary hover:bg-primary/90" : ""}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full rounded-xl" />
          ))}
        </div>
      ) : filteredThemes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <RiPaletteLine className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No themes found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredThemes.map((theme: any) => {
            const config = theme.config as any;
            return (
              <div
                key={theme.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
              >
                {/* Visual Preview */}
                <div
                  className="relative aspect-[4/3] w-full p-6"
                  style={{
                    backgroundColor: config.bgColor,
                    backgroundImage: config.bgImage ? `url(${config.bgImage})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* Overlay */}
                  {config.bgImage && (
                    <div
                      className="absolute inset-0"
                      style={{ backgroundColor: `rgba(0,0,0,${config.bgOverlayOpacity ?? 0})` }}
                    />
                  )}

                  {/* Mock content */}
                  <div className="relative z-10 flex h-full flex-col gap-4 rounded-xl bg-white/10 p-5 backdrop-blur-md border border-white/20 shadow-xl"
                       style={{ borderColor: `${config.accentColor}40` }}>
                    <div className="h-2 w-1/3 rounded-full" style={{ backgroundColor: config.accentColor }} />
                    <div className="h-6 w-3/4 rounded-md" style={{ backgroundColor: config.textColor }} />
                    <div className="h-4 w-1/2 rounded-md opacity-60" style={{ backgroundColor: config.textColor }} />
                    <div className="mt-auto h-10 w-full rounded-md opacity-20" style={{ backgroundColor: config.questionColor }} />
                    <div className="h-10 w-1/3 rounded-md ml-auto" style={{ backgroundColor: config.buttonBgColor ?? config.accentColor }} />
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                    {formId ? (
                      <Button
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => applyTheme(theme.id)}
                        disabled={updateFormMutation.isPending}
                      >
                        {updateFormMutation.isPending ? "Applying..." : "Apply theme"}
                        {!updateFormMutation.isPending && <RiCheckLine className="ml-2 h-4 w-4" />}
                      </Button>
                    ) : (
                      <Badge className="bg-white text-black hover:bg-white/90 cursor-default px-3 py-1.5 text-sm font-medium">
                        View only
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between border-t p-4">
                  <div>
                    <h3 className="text-sm font-semibold">{theme.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">
                      {theme.category ?? "General"}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-5 w-5 rounded-full border shadow-sm" style={{ backgroundColor: config.bgColor }} title="Background" />
                    <div className="h-5 w-5 rounded-full border shadow-sm" style={{ backgroundColor: config.accentColor }} title="Accent" />
                    <div className="h-5 w-5 rounded-full border shadow-sm" style={{ backgroundColor: config.textColor }} title="Text" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
