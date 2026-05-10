/**
 * IDENTITY: A Geometria do Risco
 * PATH: src/app/biblioteca/geometria-do-risco/page.tsx
 * ROLE: Página do artigo principal sobre a física do pós-flop sob ICM.
 */

import { ContentPageHeader } from '@/components/layout/ContentPageHeader';
import { SotaMarkdown } from '@/components/ui/SotaMarkdown';
import ContentFooter from '@/components/content/ContentFooter';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { DownwardDriftSimulator } from '@/components/simulator/DownwardDriftSimulator';

const introduction = `
# A GEOMETRIA DO RISCO
### A Desconstrução do Pós-Flop sob a Ótica do ICM

"O poker é uma ciência de informação incompleta jogada por humanos falhos. Acreditamos dominar a matemática, mas frequentemente somos traídos por aplicar a equação certa no universo errado. Num cenário de extrema pressão financeira, as fichas deixam de ser pedaços de plástico e passam a representar a vossa perspetiva de sobrevivência."

---

## 1. A Ilusão do Vácuo (ChipEV vs. ICM)

Excluindo a fase de Heads-Up Final, praticamente todas as instâncias de um MTT são severamente distorcidas pelo ICM. Note-se a distinção vital: um pote jogado em Heads-Up (2-way) numa mesa que ainda possui 9 jogadores ativos continua sujeito a pressões letais de ICM devido à presença, passividade e valuation das restantes stacks. 

O risco não está apenas na mão que segura, mas na sombra dos adversários que observam.
`;

const archetypes = `
## 3. Os 5 Arquétipos Clínicos do ICM

### 🤝 Arquétipo I: O Pacto Silencioso (Evitação de Ruína)
**Cenário:** Chip Leader (70bb) vs Vice Chip Leader (65bb) com uma mesa cheia de micro-stacks (10bb a 15bb).
**A Resolução:** Ocorre o que definimos como "Pacto Silencioso". Um choque direto aniquila a Esperança Matemática de ambos. Traps e slowplays deixam de ser jogadas fantasiosas e tornam-se mecanismos vitais para não engordar o SPR para níveis irreversíveis.

### ⚖️ Arquétipo II: O Paradoxo do Valuation (Mid vs Big)
**Cenário:** BTN (40bb) abre em raise, BB (54bb - Chip Leader) defende.
**A Resolução:** O RP do BTN (~21.4%) é quase o dobro do RP do BB (~12.9%). O BB sobrevive à colisão; o BTN colapsa. A matemática corta brutalmente a frequência de blefe do BTN.

### ⚔️ Arquétipo III: A Guerra na Lama (Sobrevivência dos Shorts)
**Cenário:** Dois jogadores confrontam-se com ~10bb numa mesa dominada por colossos de 80bb+.
**A Resolução:** O laddering passivo impera. O RP ancora numa faixa tática respeitável (~7% a 10%). Quem entra em push com qualquer mão marginal é punido pela matemática.

### 👑 Arquétipo IV: A Ameaça Orgânica (FGS e o Efeito Kingmaker)
**Cenário:** Chip Leader absoluto (90bb) ataca o Vice-Líder (25bb).
**A Resolução:** O modelo impõe um RP substancial (~12%) ao próprio CL. Se o CL dobrar o Vice, ele arma o único rival capaz de usurpar sua coroa. O FGS protege o "God Mode".

### 🔥 Arquétipo V: A Transferência do Risco (Batata Quente)
**Cenário:** Open-Shove direto de 20bb sobre as blinds.
**A Resolução:** O agressor transfere imediatamente o peso volitivo para o defensor. O pavor da eliminação força ranges defensáveis a um overfold matemático.
`;

const conclusion = `
## O Fim do MDF e a Inércia Humana

Quando enfrentamos uma aposta pot-size no river, a defesa quebra vertiginosamente dos 50% para a casa dos **~30% a 38%**. O OOP é forçado àquilo que os leigos chamam de overfold, mas que na realidade é uma **Abstenção Estrutural GTO**.

"A matemática exige extração cirúrgica de EV. Numa mesa final, a responsabilidade de cada jogador não é provar coragem; é realizar o EV monetário e defender a Perspectiva Matemática daquela stack específica."
`;

export default function GeometriaRiscoPage() {
  return (
    <div className="min-h-screen bg-bg-base text-text-bright">
      <ContentPageHeader
        title="Geometria do Risco"
        subtitle="A desconstrução do pós-flop sob a ótica do ICM e os arquétipos clínicos de colisão."
        category="Teoria Avançada"
        icon="fa-draw-polygon"
      />

      <div className="sota-container py-12 md:py-24">
        <SectionHeader
          step="01"
          label="Perspectiva"
          title="O Vácuo Matemático"
          description="Por que o ChipEV morre na Mesa Final."
        />
        <div className="max-w-4xl mx-auto mb-16">
          <GlassPanel className="p-8">
            <SotaMarkdown content={introduction} />
          </GlassPanel>
        </div>

        <SectionHeader
          step="02"
          label="Dinâmica"
          title="Simulador de Drift"
          description="Visualize a asfixia do Risk Premium em tempo real."
        />
        <div className="mb-16">
          <DownwardDriftSimulator />
        </div>

        <SectionHeader
          step="03"
          label="Arquétipos"
          title="Casos Clínicos"
          description="As 5 leis de interação entre stacks em Mesas Finais."
        />
        <div className="max-w-4xl mx-auto mb-16">
          <GlassPanel className="p-8 border-l-4 border-l-accent-indigo">
            <SotaMarkdown content={archetypes} />
          </GlassPanel>
        </div>

        <SectionHeader
          step="04"
          label="Síntese"
          title="O Colapso do MDF"
          description="A abstenção estrutural e a inércia humana."
        />
        <div className="max-w-4xl mx-auto">
          <GlassPanel className="p-8">
            <SotaMarkdown content={conclusion} />
          </GlassPanel>
        </div>
      </div>

      <ContentFooter 
        shareTitle="A Geometria do Risco | Raphael Vitoi"
        shareUrl="https://www.raphaelvitoi.com/biblioteca/geometria-do-risco"
        backLinkHref="/biblioteca" 
        backLinkText="Voltar para Biblioteca"
      />
    </div>
  );
}
