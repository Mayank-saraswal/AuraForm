// apps/web/app/(dashboard)/dashboard/forms/new/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useForm }   from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trpc }      from "~/trpc/client";
import { createFormSchema, type CreateFormInput } from "@repo/schemas";
import toast from "react-hot-toast";
import { Button }    from "~/components/ui/button";
import { Input }     from "~/components/ui/input";
import { Label }     from "~/components/ui/label";
import { Textarea }  from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { RiLoader4Line, RiArrowRightLine } from "react-icons/ri";

export default function NewFormPage() {
  const router = useRouter();
  const utils  = trpc.useUtils();

  const createMutation = trpc.forms.create.useMutation({
    onSuccess: async (form) => {
      await utils.forms.list.invalidate();
      toast.success("Form created! Now add some fields.");
      const formObj = form as { id: string };
      router.push(`/dashboard/forms/${formObj.id}/edit`);
    },
    onError: (e) => toast.error(e.message),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<CreateFormInput>({ resolver: zodResolver(createFormSchema) });

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Create a new form</CardTitle>
          <p className="text-sm text-muted-foreground">
            Give your form a name. You can change it later.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Form title</Label>
              <Input id="title" placeholder="e.g. Netflix Watchlist Survey" {...register("title")} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea id="description" placeholder="What is this form about?" rows={3} {...register("description")} />
            </div>
            <Button
              type="submit"
              className="gap-2 bg-[#6C47FF] hover:bg-[#5B21B6]"
              disabled={isSubmitting || createMutation.isPending}
            >
              {(isSubmitting || createMutation.isPending)
                ? <RiLoader4Line className="h-4 w-4 animate-spin" />
                : <RiArrowRightLine className="h-4 w-4" />
              }
              Create and open editor
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
