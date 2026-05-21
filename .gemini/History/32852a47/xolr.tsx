import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { PrismaClient } from "@prisma/client";
import { SectionHeader } from "@/components/ui/SectionHeader";

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

        <div className="mt-12 text-text-light leading-relaxed font-sans">
          {/* SOTA Markdown Renderer: Estilização nativa injetada diretamente no AST
              Garante fidelidade absoluta à identidade visual do motor sem dependências invasivas */}
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-3xl font-black text-text-bright mt-10 mb-6 uppercase tracking-tighter" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-accent-indigo mt-8 mb-4 tracking-tight" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-xl font-bold text-emerald-400 mt-6 mb-3" {...props} />,
              p: ({node, ...props}) => <p className="mb-4 text-[0.95rem] text-text-muted" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 text-[0.95rem] text-text-muted space-y-2" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 text-[0.95rem] text-text-muted space-y-2" {...props} />,
              li: ({node, ...props}) => <li className="pl-1" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold text-text-light" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-accent-indigo/50 pl-4 py-1 italic bg-white/5 rounded-r-lg my-6" {...props} />,
              code: ({node, inline, className, children, ...props}: any) =>
                inline
                  ? <code className="bg-slate-900/80 text-accent-amber px-1.5 py-0.5 rounded font-mono text-[0.85rem]" {...props}>{children}</code>
                  : <code className="block bg-[#0a0a0f] text-text-light p-4 rounded-xl border border-white/10 font-mono text-[0.85rem] overflow-x-auto my-6 shadow-2xl" {...props}>{children}</code>,
            }}
          >
            {content.body}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
