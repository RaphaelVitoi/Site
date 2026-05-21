import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== [SEED SOTA] Injetando Cenários ICM Iniciais ===');

  await prisma.icmScenario.upsert({
    where: { slug: 'bolha-ft-utg-bb' },
    update: {},
    create: {
      slug: 'bolha-ft-utg-bb',
      name: 'A Bolha da Mesa Final',
      category: 'baseline',
      narrativeTitle: 'Sobrevivência Máxima',
      narrativeSubtitle: 'UTG vs BB em cenário de bolha extrema',
      theory: 'Na bolha da mesa final, a pressão de ICM atinge seu pico. A sobrevivência é mais importante que a acumulação de fichas, exigindo um EV_Fold significativamente positivo e um Risk Premium brutal para colisões marginais.',
      exploit: JSON.stringify(['Exploração de overfolds', 'Shove em mid-stacks cautelosos']),
      verdict: 'FOLD ESTRUTURAL',
      stacks: JSON.stringify([9.25, 52.24, 22.08, 6.88, 44.16, 24.16, 39.88, 12.73, 53.88]),
      prizes: JSON.stringify([237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47]),
      ipPos: 'UTG',
      oopPos: 'BB',
      ipRp: 16.6,
      oopRp: 0,
      sprData: JSON.stringify({ spr: 2.5 }),
      defaultStreetFreqs: JSON.stringify({ flop: 0.5 }),
      isPublished: true,
      quizzes: {
        create: [
          {
            question: 'Como o ICM afeta a sua tomada de decisão como UTG (Stack: 9.25bb) diante da Bolha da FT?',
            explanation: 'Sua stack curta na bolha tem valor de sobrevivência inflado. Agressão aleatória destrói valuation brutalmente.',
            options: JSON.stringify([
              { text: 'Aumento do EV Fold (Desejo de Dobrar Rápido)', isOptimal: false, evLoss: 1.2 },
              { text: 'Contenção Estrutural (Valuation Alto e FGS Extremo)', isOptimal: true, evLoss: 0 },
              { text: 'Agressão Expandida para Roubar os Blinds Grandes', isOptimal: false, evLoss: 2.5 },
            ])
          }
        ]
      }
    }
  });

  await prisma.icmScenario.upsert({
    where: { slug: 'chipleader-pressure' },
    update: {},
    create: {
      slug: 'chipleader-pressure',
      name: 'Pressão do Chipleader',
      category: 'exploit',
      narrativeTitle: 'A Tirania da Vantagem',
      narrativeSubtitle: 'BTN (CL) vs SB (Mid) e BB (Short)',
      theory: 'Como Chipleader, a utilidade de suas fichas extras cai, mas sua habilidade de ameaçar a sobrevivência dos mid-stacks dispara. Isso permite uma expansão exponencial do range de agressão (Edge Relativa).',
      verdict: 'AGRESSÃO CONTÍNUA',
      stacks: JSON.stringify([65.4, 28.4, 22.8, 18.5, 14.5, 8.2, 32.5, 45.2, 38.1]),
      prizes: JSON.stringify([237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47]),
      ipPos: 'BTN',
      oopPos: 'BB',
      ipRp: 2.1,
      oopRp: 21.4,
      sprData: JSON.stringify({ spr: 15 }),
      defaultStreetFreqs: JSON.stringify({ flop: 0.8 }),
      isPublished: true,
      quizzes: {
        create: [
          {
            question: 'Diante de um Mid-Stack que defendeu os blinds, qual o peso das Reverse Implied Odds (RIO) para você (CL)?',
            explanation: 'O CL sofre RIO mínimas contra mid-stacks, pois o risco de eliminação estrutural pertence exclusivamente ao adversário.',
            options: JSON.stringify([
              { text: 'Catastrófico (Risco de perder a liderança)', isOptimal: false, evLoss: 0.8 },
              { text: 'Irrelevante (Poder de colisão assimétrico)', isOptimal: true, evLoss: 0 },
              { text: 'Moderado (Devido ao Table Draw)', isOptimal: false, evLoss: 0.4 },
            ])
          }
        ]
      }
      }
      });

      await prisma.icmScenario.upsert({
      where: { slug: 'multiway-entropia' },
      update: {},
      create: {
      slug: 'multiway-entropia',
      name: 'Entropia Multiway',
      category: 'toyGame',
      narrativeTitle: 'A Armadilha das Pot Odds',
      narrativeSubtitle: '3-Way Pós-Flop (IP vs 2 OOP)',
      theory: 'Em cenários com múltiplos jogadores, a atratividade aparente das Pot Odds é aniquilada pelo crescimento exponencial das Reverse Implied Odds (N^(2+f)).',
      verdict: 'FOLD RESTRITO',
      stacks: JSON.stringify([30, 30, 30, 30, 30, 30, 30, 30, 30]),
      prizes: JSON.stringify([237.34, 170.96, 135.17, 109.99, 90.28, 73.95, 59.92, 47.56, 36.47]),
      ipPos: 'BTN',
      oopPos: 'BB',
      ipRp: 8.5,
      oopRp: 10.5,
      sprData: JSON.stringify({ spr: 4 }),
      defaultStreetFreqs: JSON.stringify({ flop: 0.2 }),
      isPublished: true,
      quizzes: {
        create: [
          {
            question: 'O pote oferece odds de 4:1. O Board é conectado. Você tem middle-pair. Por que o call é Insolvente?',
            explanation: 'A probabilidade de RIO cresce exponencialmente em potes Multiway. Acertar sua mão marginal e colidir contra um monstro escondido aniquila seu Valuation.',
            options: JSON.stringify([
              { text: 'Porque o Pot Entrapment me força ao All-in no Turn', isOptimal: false, evLoss: 0.6 },
              { text: 'As Pot Odds não compensam a Aversão à Perda Multiway (RIO x^2)', isOptimal: true, evLoss: 0 },
            ])
          }
        ]
      }
    }
  });

  console.log('=== [SEED SOTA] 3 Cenários Matemáticos Materializados com Sucesso. ===');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
