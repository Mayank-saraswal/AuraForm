// apps/web/app/f/[slug]/page.tsx
import { Metadata } from "next";
import { FormFillerClient } from "~/components/filler/form-filler-client";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ password?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Fill form — AuraForm`,
    description: "Fill out this form created with AuraForm.",
    robots: { index: false },
  };
}

export default async function FormFillerPage({ params, searchParams }: Props) {
  const { slug }     = await params;
  const { password } = await searchParams;
  return <FormFillerClient slug={slug} password={password} />;
}
