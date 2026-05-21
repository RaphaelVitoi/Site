import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const legacyContent = [
  { slug: 'aula-1-2', category: 'aulas', title: 'A Geometria do Risco (Aula 1.2)', description: 'Fundamentos da geometria do risco.', body: '<p>Conteúdo em fase de transposição do legacy para o banco de dados.</p>', isPublished: true },
  { slug: 'aula-icm', category: 'aulas', title: 'Masterclass: ICM Pós-Flop', description: 'O edge mudou de lugar.', body: '<p>Conteúdo em fase de transposição. [O Simulador V2 será acoplado aqui]</p>', isPublished: true },
  { slug: 'leitura-icm', category: 'aulas', title: 'Leitura de ICM', description: 'Leitura obrigatória e referências.', body: '<p>Conteúdo em fase de transposição.</p>', isPublished: true },
  { slug: 'hermeneutica-blefe', category: 'biblioteca', title: 'Hermenêutica do Blefe', description: 'Análise estrutural do blefe no Poker.', body: '<p>Conteúdo em fase de transposição.</p>', isPublished: true },
  { slug: 'motor-diluicao', category: 'biblioteca', title: 'O Motor de Diluição', description: 'Dinâmica de diluição de equidade.', body: '<p>Conteúdo em fase de transposição.</p>', isPublished: true },
  { slug: 'paradoxo-valuation', category: 'biblioteca', title: 'O Paradoxo do Valuation', description: 'Valuation de stacks sob pressão ICM.', body: '<p>Conteúdo em fase de transposição.</p>', isPublished: true },
  { slug: 'estado-da-arte', category: 'artigos', title: 'O Estado da Arte', description: 'Filosofia e execução SOTA.', body: '<p>Conteúdo em fase de transposição.</p>', isPublished: true },
  { slug: 'smart-sniper', category: 'artigos', title: 'Diretriz Smart Sniper', description: 'Operação cirúrgica e minimalismo.', body: '<p>Conteúdo em fase de transposição.</p>', isPublished: true },
  { slug: 'validacao-smart-sniper', category: 'artigos', title: 'Validação Smart Sniper', description: 'Verificação clínica.', body: '<p>Conteúdo em fase de transposição.</p>', isPublished: true }
];

async function main() {
  console.log('Iniciando Ingestão de Dados SOTA...');
  for (const item of legacyContent) {
    await prisma.content.upsert({ where: { slug: item.slug }, update: item, create: item });
    console.log('[+] ' + item.category + ' / ' + item.slug + ' indexado.');
  }
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
