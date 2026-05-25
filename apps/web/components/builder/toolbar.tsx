// apps/web/components/builder/toolbar.tsx
"use client";
import { useState } from "react";
import { useFormBuilder } from "~/stores/form-builder";
import { trpc } from "~/trpc/client";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import toast from "react-hot-toast";
import {
  RiEyeLine, RiEyeOffLine, RiLoader4Line, RiGlobalLine, RiLinkM,
  RiShareLine, RiCheckLine, RiArrowLeftLine, RiSettings3Line,
} from "react-icons/ri";
import Link from "next/link";
import { getFormShareUrl } from "~/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "~/components/ui/dialog";
import { FormSettingsDrawer } from "./form-settings-drawer";

export function BuilderToolbar({ formId }: { formId: string }) {
  const { form, isDirty, previewMode, togglePreview } = useFormBuilder();
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied]       = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const utils = trpc.useUtils();

  const publishMutation   = trpc.forms.publish.useMutation();
  const unpublishMutation = trpc.forms.unpublish.useMutation();

  const isPublished = form?.status === "published";
  const shareUrl    = form?.slug ? getFormShareUrl(form.slug) : null;

  async function handlePublish() {
    try {
      await publishMutation.mutateAsync({
        id: formId,
        visibility: "public",
      });
      await utils.forms.getById.invalidate({ id: formId });
      toast.success("Form published!");
    } catch (e: unknown) {
      toast.error((e as { message?: string }).message ?? "Failed to publish.");
    }
  }

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex h-14 items-center justify-between border-b bg-background px-4">
      {/* Left */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/dashboard/forms">
            <RiArrowLeftLine className="h-4 w-4" />
          </Link>
        </Button>
        <div className="h-4 w-px bg-border" />
        <span className="max-w-[200px] truncate text-sm font-medium">
          {form?.title ?? "Untitled form"}
        </span>
        {isDirty && <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/30">Unsaved</Badge>}
        {isPublished && <Badge className="bg-[#10B981]/10 text-[#10B981] text-xs">Live</Badge>}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          onClick={togglePreview}
        >
          {previewMode
            ? <><RiEyeOffLine className="h-4 w-4" />Exit preview</>
            : <><RiEyeLine className="h-4 w-4" />Preview</>
          }
        </Button>

        {isPublished && shareUrl && (
          <Dialog open={shareOpen} onOpenChange={setShareOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <RiShareLine className="h-4 w-4" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share your form</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-2">
                <div className="flex gap-2">
                  <Input value={shareUrl} readOnly className="font-mono text-xs" />
                  <Button size="sm" variant="outline" onClick={copyLink} className="gap-1.5 shrink-0">
                    {copied ? <RiCheckLine className="h-4 w-4 text-[#10B981]" /> : <RiLinkM className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setSettingsOpen(true)}>
          <RiSettings3Line className="h-4 w-4" />
          Settings
        </Button>

        {isPublished ? (
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await unpublishMutation.mutateAsync({ id: formId });
              await utils.forms.getById.invalidate({ id: formId });
              toast.success("Form unpublished.");
            }}
            disabled={unpublishMutation.isPending}
            className="gap-1.5"
          >
            {unpublishMutation.isPending && <RiLoader4Line className="h-4 w-4 animate-spin" />}
            Unpublish
          </Button>
        ) : (
          <Button
            size="sm"
            className="gap-1.5 bg-[#6C47FF] hover:bg-[#5B21B6]"
            onClick={handlePublish}
            disabled={publishMutation.isPending}
          >
            {publishMutation.isPending
              ? <RiLoader4Line className="h-4 w-4 animate-spin" />
              : <RiGlobalLine className="h-4 w-4" />
            }
            Publish
          </Button>
        )}
      </div>
      <FormSettingsDrawer formId={formId} open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
