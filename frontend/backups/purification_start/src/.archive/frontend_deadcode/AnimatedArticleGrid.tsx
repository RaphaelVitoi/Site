"use client";

/**
 * IDENTITY: AnimatedArticleGrid SOTA v4.2 Gold
 * PATH: src/components/content/AnimatedArticleGrid.tsx
 * ROLE: Orquestrador visual de artefatos da biblioteca.
 * AESTHETIC: SOTA Gold Standard (Glassmorphism, Depth, Shimmer, Framer Motion).
 */

import Link from "next/link";
import { motion } from "framer-motion";

interface ArticleItem {
  href: string;
  tags: string[];
  title: string;
  description: string;
  readingTime: string;
  isNew: boolean;
}

export default function AnimatedArticleGrid({
  articles,
}: {
  readonly articles: ArticleItem[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {articles.map((article, idx) => (
        <motion.div
          key={article.href}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.05 }}
        >
          <Link
            href={article.href}
            className="group relative flex flex-col justify-between rounded-4xl border border-white/5 bg-slate-900/40 backdrop-blur-xl p-8 transition-all duration-500 hover:-translate-y-2 hover:border-accent-indigo/30 hover:bg-black/60 hover:shadow-[0_20px_50px_-20px_rgba(99,102,241,0.3)] h-full overflow-hidden"
          >
            {/* Shimmer de Fundo SOTA */}
            <div className="absolute inset-0 bg-radial-[at_top_right] from-accent-indigo/5 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-xl bg-white/5 border border-white/5 px-4 py-1 text-[0.6rem] font-black text-text-muted uppercase tracking-[0.2em] group-hover:bg-accent-indigo/20 group-hover:text-accent-indigo-light group-hover:border-accent-indigo/20 transition-all shadow-inner"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {article.isNew && (
                  <div className="relative flex items-center justify-center">
                    <span className="animate-ping absolute h-2 w-2 rounded-full bg-accent-emerald opacity-75"></span>
                    <span
                      className="h-2 w-2 rounded-full bg-accent-emerald shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                      title="Recente"
                    ></span>
                  </div>
                )}
              </div>

              <h3 className="mb-4 text-xl font-black text-white tracking-tighter group-hover:text-accent-indigo-light transition-colors leading-[1.2]">
                {article.title}
              </h3>

              <p className="mb-8 text-[0.85rem] text-text-muted leading-relaxed font-medium group-hover:text-text-main transition-colors">
                {article.description}
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-6 text-[0.65rem] font-black font-mono text-text-darker uppercase tracking-[0.2em] group-hover:border-white/10 transition-colors">
              <span className="flex items-center gap-2">
                <i className="fa-solid fa-clock opacity-50"></i>
                {article.readingTime}
              </span>
              <span className="flex items-center gap-2 text-accent-indigo opacity-0 -translate-x-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0">
                Explorar{" "}
                <i className="fa-solid fa-arrow-right-long text-[0.7rem]"></i>
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
