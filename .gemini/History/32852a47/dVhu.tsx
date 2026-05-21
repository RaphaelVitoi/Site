import { notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SotaMarkdown } from "@/components/ui/SotaMarkdown";

const prisma = new PrismaClient();

export default async function ContentPage({ params }: { params: { slug: string } }) {
  const content = await prisma.content.findUnique({
    where: { slug: params.slug, isPublished: true },
  });

  if (!content) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-bg-base relative pt-24 pb-16 px-6">
      <article className="max-w-4xl mx-auto sota-container glass-panel p-8 sm:p-12 animate-sota-in border-accent-indigo/20">
        <SectionHeader
          step="MD"
          label={content.category}
          title={content.title}
          description={content.description || "Aprofundamento Teórico e Analítico"}
        />

        <div className="mt-12">
          <SotaMarkdown content={content.body} />
        </div>
      </article>
    </div>
  );
}
