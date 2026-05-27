"use client";
import { useEffect } from "react";
import { useForm }   from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "~/trpc/client";
import { useFormBuilder } from "~/stores/form-builder";
import toast from "react-hot-toast";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { Separator } from "~/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "~/components/ui/select";
import { RiLoader4Line, RiLinkM, RiLockLine, RiTimeLine, RiMailLine } from "react-icons/ri";
import { slugSchema } from "@repo/schemas";

const formSettingsSchema = z.object({
  title:           z.string().min(2).max(200).trim(),
  description:     z.string().max(2000).optional(),
  slug:            slugSchema.optional().or(z.literal("")),
  visibility:      z.enum(["public", "unlisted"]),
  responseLimit:   z.coerce.number().int().min(1).optional().nullable(),
  notifyOnResponse: z.boolean(),
  notifyEmail:     z.string().email().optional().nullable().or(z.literal("")),
  passwordProtected: z.boolean(),
  password:        z.string().min(6).max(100).optional(),
  thankYouTitle:   z.string().max(200).optional(),
  thankYouMessage: z.string().max(1000).optional(),
  showBranding:    z.boolean(),
});

type FormSettings = z.infer<typeof formSettingsSchema>;

interface Props { formId: string; open: boolean; onClose: () => void; }

export function FormSettingsDrawer({ formId, open, onClose }: Props) {
  const { form, setForm } = useFormBuilder();
  const utils = trpc.useUtils();

  const updateMutation = trpc.forms.update.useMutation({
    onSuccess: async (updated) => {
      setForm(updated as any);
      await utils.forms.getById.invalidate({ id: formId });
      toast.success("Settings saved.");
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  const {
    register, handleSubmit, reset, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormSettings>({
    resolver: zodResolver(formSettingsSchema) as any,
  });

  useEffect(() => {
    if (form && open) {
      reset({
        title:            form.title,
        description:      (form.description as string) ?? "",
        slug:             (form.slug as string) ?? "",
        visibility:       (form.visibility as "public" | "unlisted") ?? "unlisted",
        responseLimit:    (form.responseLimit as number) ?? undefined,
        notifyOnResponse: (form.notifyOnResponse as boolean) ?? false,
        notifyEmail:      (form.notifyEmail as string) ?? "",
        passwordProtected: !!form.passwordHash,
        thankYouTitle:    (form.thankYouTitle as string) ?? "",
        thankYouMessage:  (form.thankYouMessage as string) ?? "",
        showBranding:     (form.showBranding as boolean) ?? true,
      });
    }
  }, [form, open, reset]);

  const pwProtected = watch("passwordProtected");
  const notify      = watch("notifyOnResponse");

  async function onSubmit(data: FormSettings) {
    const payload = {
      ...data,
      slug: data.slug === "" ? undefined : data.slug,
      notifyEmail: data.notifyEmail === "" ? null : data.notifyEmail,
    };
    await updateMutation.mutateAsync({ id: formId, ...payload });
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-lg">
        <SheetHeader className="pb-4">
          <SheetTitle>Form settings</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-6">

          {/* ── General ─────────────────────────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              General
            </p>

            <div className="flex flex-col gap-1.5">
              <Label>Form title</Label>
              <Input {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea {...register("description")} rows={2} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1.5">
                <RiLinkM className="h-3.5 w-3.5" />
                Custom URL slug
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  /f/
                </span>
                <Input {...register("slug")} placeholder="my-awesome-form" className="font-mono" />
              </div>
              {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              <p className="text-[11px] text-muted-foreground">
                Lowercase letters, numbers and hyphens only
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Visibility</Label>
              <Select
                value={watch("visibility")}
                onValueChange={(v) => setValue("visibility", v as "public" | "unlisted")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">
                    Public — appears in explore gallery
                  </SelectItem>
                  <SelectItem value="unlisted">
                    Unlisted — link only, not listed publicly
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Show AuraForm branding</p>
                <p className="text-xs text-muted-foreground">
                  "Powered by AuraForm" footer on the form
                </p>
              </div>
              <Switch
                checked={watch("showBranding")}
                onCheckedChange={(v) => setValue("showBranding", v)}
              />
            </div>
          </section>

          <Separator />

          {/* ── Closing conditions ───────────────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <RiTimeLine className="mr-1 inline h-3.5 w-3.5" />
              Closing conditions
            </p>

            <div className="flex flex-col gap-1.5">
              <Label>Response limit <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                type="number"
                min={1}
                {...register("responseLimit")}
                placeholder="No limit"
              />
              <p className="text-[11px] text-muted-foreground">
                Stop accepting responses after this many submissions
              </p>
            </div>
          </section>

          <Separator />

          {/* ── Notifications ────────────────────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <RiMailLine className="mr-1 inline h-3.5 w-3.5" />
              Notifications
            </p>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Email on new response</p>
                <p className="text-xs text-muted-foreground">
                  Get notified each time someone submits
                </p>
              </div>
              <Switch
                checked={notify}
                onCheckedChange={(v) => setValue("notifyOnResponse", v)}
              />
            </div>

            {notify && (
              <div className="flex flex-col gap-1.5">
                <Label>Notification email <span className="text-muted-foreground text-xs">(leave blank to use account email)</span></Label>
                <Input {...register("notifyEmail")} type="email" placeholder="you@example.com" />
              </div>
            )}
          </section>

          <Separator />

          {/* ── Security ─────────────────────────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <RiLockLine className="mr-1 inline h-3.5 w-3.5" />
              Security
            </p>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Password protection</p>
                <p className="text-xs text-muted-foreground">
                  Require a password to open the form
                </p>
              </div>
              <Switch
                checked={pwProtected}
                onCheckedChange={(v) => setValue("passwordProtected", v)}
              />
            </div>

            {pwProtected && (
              <div className="flex flex-col gap-1.5">
                <Label>Password</Label>
                <Input {...register("password")} type="password" placeholder="Enter a password" />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
            )}
          </section>

          <Separator />

          {/* ── Thank-you screen ──────────────────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Thank-you screen
            </p>

            <div className="flex flex-col gap-1.5">
              <Label>Title</Label>
              <Input {...register("thankYouTitle")} placeholder="Thank you!" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Message</Label>
              <Textarea
                {...register("thankYouMessage")}
                placeholder="Your response has been recorded."
                rows={2}
              />
            </div>
          </section>

          {/* Save */}
          <div className="sticky bottom-0 bg-background pt-4 pb-2">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isSubmitting || updateMutation.isPending}
            >
              {(isSubmitting || updateMutation.isPending) && (
                <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save settings
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
