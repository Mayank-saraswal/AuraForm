"use client";
import { useState } from "react";
import { trpc } from "~/trpc/client";
import Link from "next/link";
import toast from "react-hot-toast";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "~/components/ui/select";
import {
  RiAddLine, RiSearchLine, RiMoreLine, RiEditLine, RiDeleteBinLine,
  RiEyeLine, RiBarChartLine, RiClipboardLine, RiGlobalLine, RiLinkM,
  RiFileList3Line, RiArrowUpLine, RiArrowDownLine,
} from "react-icons/ri";
import { formatDistanceToNow } from "date-fns";
import { getFormShareUrl, truncate } from "~/lib/utils";
import { QRShareModal } from "~/components/dashboard/qr-share-modal";

type SortField = "updatedAt" | "createdAt" | "responseCount";
type Status = "all" | "draft" | "published" | "archived";

export default function FormsListPage() {
  const [search,    setSearch]    = useState("");
  const [status,    setStatus]    = useState<Status>("all");
  const [sortBy,    setSortBy]    = useState<SortField>("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [qrFormId,  setQrFormId]  = useState<string | null>(null);
  const [page,      setPage]      = useState(1);

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.forms.list.useQuery({
    page,
    limit: 12,
    status: status === "all" ? undefined : status as "draft" | "published" | "archived",
  });

  const deleteMutation = trpc.forms.delete.useMutation({
    onSuccess: () => { utils.forms.list.invalidate(); toast.success("Form deleted."); },
    onError:   (e) => toast.error(e.message),
  });

  const cloneMutation = trpc.forms.clone.useMutation({
    onSuccess: (f) => {
      utils.forms.list.invalidate();
      toast.success("Form cloned! Opening editor…");
    },
    onError: (e) => toast.error(e.message),
  });

  const publishMutation   = trpc.forms.publish.useMutation({
    onSuccess: () => { utils.forms.list.invalidate(); toast.success("Form published."); },
    onError:   (e) => toast.error(e.message),
  });

  const unpublishMutation = trpc.forms.unpublish.useMutation({
    onSuccess: () => { utils.forms.list.invalidate(); toast.success("Form unpublished."); },
    onError:   (e) => toast.error(e.message),
  });

  // Client-side filter + sort (data already paged from server)
  const forms = (data?.forms ?? [])
    .filter((f) => !search || f.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const dir = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "responseCount") return (a.responseCount - b.responseCount) * dir;
      const valA = new Date(a[sortBy]).getTime();
      const valB = new Date(b[sortBy]).getTime();
      return (valA - valB) * dir;
    });

  const qrForm = forms.find((f) => f.id === qrFormId);

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <RiSearchLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search forms…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortField)}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updatedAt">Last updated</SelectItem>
              <SelectItem value="createdAt">Created date</SelectItem>
              <SelectItem value="responseCount">Responses</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setSortOrder((o) => o === "asc" ? "desc" : "asc")}
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
          >
            {sortOrder === "asc"
              ? <RiArrowUpLine className="h-4 w-4" />
              : <RiArrowDownLine className="h-4 w-4" />
            }
          </Button>

          <Button asChild className="gap-1.5 bg-[#6C47FF] hover:bg-[#5B21B6]">
            <Link href="/dashboard/forms/new">
              <RiAddLine className="h-4 w-4" />
              New form
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground">
        {isLoading ? "Loading…" : `${data?.total ?? 0} forms`}
      </p>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : forms.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <RiFileList3Line className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {search ? "No forms match your search." : "No forms yet. Create your first one!"}
          </p>
          {!search && (
            <Button asChild size="sm" className="bg-[#6C47FF]">
              <Link href="/dashboard/forms/new">
                <RiAddLine className="mr-1.5 h-4 w-4" />
                Create form
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => {
            const isPublished = form.status === "published";
            const shareUrl    = form.slug ? getFormShareUrl(form.slug) : null;

            return (
              <div
                key={form.id}
                className="group flex flex-col rounded-xl border bg-card transition-shadow hover:shadow-md"
              >
                {/* Theme colour strip */}
                <div className="flex h-2 w-full overflow-hidden rounded-t-xl">
                  <div className="flex-1 bg-[#6C47FF]" />
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate text-sm font-semibold">
                        {truncate(form.title, 50)}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Updated {formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Actions menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                          <RiMoreLine className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/forms/${form.id}/edit`} className="gap-2">
                            <RiEditLine className="h-4 w-4" />
                            Edit form
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/forms/${form.id}/responses`} className="gap-2">
                            <RiBarChartLine className="h-4 w-4" />
                            View analytics
                          </Link>
                        </DropdownMenuItem>

                        {isPublished && shareUrl && (
                          <>
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => navigator.clipboard.writeText(shareUrl).then(() => toast.success("Link copied!"))}
                            >
                              <RiClipboardLine className="h-4 w-4" />
                              Copy link
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => setQrFormId(form.id)}
                            >
                              <RiLinkM className="h-4 w-4" />
                              QR code
                            </DropdownMenuItem>
                          </>
                        )}

                        <DropdownMenuSeparator />

                        {isPublished ? (
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => unpublishMutation.mutate({ id: form.id })}
                          >
                            <RiEyeLine className="h-4 w-4" />
                            Unpublish
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="gap-2"
                            onClick={() => publishMutation.mutate({ id: form.id, visibility: "unlisted" })}
                          >
                            <RiGlobalLine className="h-4 w-4" />
                            Publish
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem
                          className="gap-2"
                          onClick={() => cloneMutation.mutate({ id: form.id })}
                        >
                          <RiClipboardLine className="h-4 w-4" />
                          Clone form
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="gap-2 text-destructive focus:text-destructive"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <RiDeleteBinLine className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this form?</AlertDialogTitle>
                              <AlertDialogDescription>
                                All responses will be permanently deleted. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive hover:bg-destructive/90"
                                onClick={() => deleteMutation.mutate({ id: form.id })}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{form.responseCount} response{form.responseCount !== 1 ? "s" : ""}</span>
                    <span>·</span>
                    <span>{form.viewCount} view{form.viewCount !== 1 ? "s" : ""}</span>
                  </div>

                  {/* Footer */}
                  <div className="mt-auto flex items-center justify-between">
                    <Badge
                      className={
                        form.status === "published"
                          ? "bg-[#10B981]/10 text-[#10B981] text-xs border-none"
                          : form.status === "archived"
                          ? "bg-muted text-muted-foreground text-xs border-none"
                          : "bg-[#F59E0B]/10 text-[#F59E0B] text-xs border-none"
                      }
                    >
                      {form.status}
                    </Badge>
                    <div className="flex items-center gap-1.5">
                      {isPublished && shareUrl && (
                        <Button asChild variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                          <a href={shareUrl} target="_blank" rel="noreferrer">
                            <RiEyeLine className="h-3.5 w-3.5" />
                            View
                          </a>
                        </Button>
                      )}
                      <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                        <Link href={`/dashboard/forms/${form.id}/edit`}>
                          <RiEditLine className="mr-1 h-3.5 w-3.5" />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {data && data.total > 12 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {Math.ceil(data.total / 12)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(data.total / 12)}
          >
            Next
          </Button>
        </div>
      )}

      {/* QR modal */}
      {qrForm?.slug && (
        <QRShareModal
          open={!!qrFormId}
          onClose={() => setQrFormId(null)}
          slug={qrForm.slug}
          title={qrForm.title}
        />
      )}
    </div>
  );
}
