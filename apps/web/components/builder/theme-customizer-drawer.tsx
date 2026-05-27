"use client";
import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { trpc } from "~/trpc/client";
import { useFormBuilder } from "~/stores/form-builder";
import toast from "react-hot-toast";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "~/components/ui/select";
import { RiLoader4Line, RiPaletteLine } from "react-icons/ri";
import { ThemeConfig } from "@repo/schemas";
import { ColorPicker } from "~/components/ui/color-picker";

interface Props { formId: string; open: boolean; onClose: () => void; }

type CustomizerForm = {
  fontFamily: string;
  textColor: string;
  accentColor: string;
  bgColor: string;
  questionBgColor: string;
};

export function ThemeCustomizerDrawer({ formId, open, onClose }: Props) {
  const { form, setForm } = useFormBuilder();
  const utils = trpc.useUtils();

  const updateMutation = trpc.forms.updateCustomTheme.useMutation({
    onSuccess: async (data) => {
      setForm({ ...form!, theme: data.theme as any, themeId: data.theme.id } as any);
      await utils.forms.getById.invalidate({ id: formId });
      toast.success("Theme customized.");
    },
    onError: (e) => toast.error(e.message),
  });

  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<CustomizerForm>();

  useEffect(() => {
    if (form?.theme && open) {
      const config = form.theme.config as Partial<ThemeConfig>;
      reset({
        fontFamily: config.fontFamily ?? "inter",
        textColor: config.textColor ?? "#000000",
        accentColor: config.accentColor ?? "#3b82f6",
        bgColor: config.bgColor ?? "#ffffff",
        questionBgColor: config.questionBgColor ?? "",
      });
    }
  }, [form, open, reset]);

  async function onSubmit(data: CustomizerForm) {
    const payload = {
      ...data,
      questionBgColor: data.questionBgColor || null,
    };
    await updateMutation.mutateAsync({ id: formId, themeConfig: payload });
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-md">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <RiPaletteLine className="h-5 w-5" />
            Design Customizer
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-6">
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Font Family</Label>
              <Controller
                control={control}
                name="fontFamily"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="geist">Geist</SelectItem>
                      <SelectItem value="space-grotesk">Space Grotesk</SelectItem>
                      <SelectItem value="bebas-neue">Bebas Neue</SelectItem>
                      <SelectItem value="playfair-display">Playfair Display</SelectItem>
                      <SelectItem value="noto-sans">Noto Sans</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Text Color</Label>
              <Controller
                control={control}
                name="textColor"
                render={({ field }) => (
                  <ColorPicker value={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Accent Color</Label>
              <Controller
                control={control}
                name="accentColor"
                render={({ field }) => (
                  <ColorPicker value={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Background Color</Label>
              <Controller
                control={control}
                name="bgColor"
                render={({ field }) => (
                  <ColorPicker value={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Question Background Color (Optional)</Label>
              <Controller
                control={control}
                name="questionBgColor"
                render={({ field }) => (
                  <ColorPicker 
                    value={field.value} 
                    onChange={field.onChange} 
                    placeholder="e.g. #ffffff or rgba(0,0,0,0.5)" 
                  />
                )}
              />
            </div>
          </section>

          <div className="sticky bottom-0 bg-background pt-4 pb-2 mt-auto">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isSubmitting || updateMutation.isPending}
            >
              {(isSubmitting || updateMutation.isPending) && (
                <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
              )}
              Apply Changes
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
