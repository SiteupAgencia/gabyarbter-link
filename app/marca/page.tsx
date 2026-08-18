import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Check,
  CircleAlert,
  Eye,
  Heart,
  Leaf,
  MessageCircle,
  Play,
  Send,
  Sparkles,
} from "lucide-react";
import { ContentBuilder, PaletteLab, PrintButton } from "./brand-tools";
import styles from "./brand-hub.module.css";

const nav = [
  ["norte", "Norte"],
  ["arquitetura", "Arquitetura"],
  ["cores", "Cores"],
  ["algoritmo", "Algoritmo"],
  ["conteudo", "Conteúdo"],
  ["instagram", "Instagram"],
  ["sopro", "Sopro"],
  ["plano", "Plano"],
] as const;

const sources = [
  {
    title: "Meta · 2026: AI Drives Performance",
    note: "Originalidade: a Meta informa que 75% das recomendações do Instagram nos EUA já vinham de posts originais no fim de 2025.",
    href: "https://about.fb.com/news/2026/01/2026-ai-drives-performance/",
  },
  {
    title: "Instagram · explicação pública de ranking (2025)",
    note: "Orientação pública de Adam Mosseri sobre tempo assistido, curtidas e envios como sinais centrais de distribuição.",
    href: "https://www.instagram.com/reel/DE7eV_zxKbx/",
  },
  {
    title: "Meta · Recommendation Guidelines",
    note: "Elegibilidade vem antes de alcance: conteúdo permitido pode não ser recomendado quando cai nas restrições de recomendação.",
    href: "https://about.fb.com/news/2020/08/recommendation-guidelines/",
  },
  {
    title: "Meta · Recommendations Reset",
    note: "As recomendações são personalizadas novamente a partir dos conteúdos e contas com que a pessoa interage.",
    href: "https://about.fb.com/news/2024/11/introducing-recommendations-reset-instagram/",
  },
  {
    title: "Labrecque & Milne · cor e personalidade de marca",
    note: "A cor influencia significado, familiaridade e percepção de personalidade; não existe uma cor universal que converta sozinha.",
    href: "https://doi.org/10.1007/s11747-010-0245-y",
  },
  {
    title: "Journal of Vision · cor, luminância e saliência",
    note: "Contraste cromático e de luminância contribuem para direcionar fixações em cenas naturais.",
    href: "https://pubmed.ncbi.nlm.nih.gov/19633349/",
  },
  {
    title: "Royal Society · contraste e atenção em cenas naturais",
    note: "Aumentar o contraste do objeto em relação ao fundo elevou fixação e detecção; objetos importam mais que cor isolada.",
    href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3758209/",
  },
  {
    title: "W3C · WCAG 2.2",
    note: "Texto comum deve atingir contraste mínimo 4,5:1; texto grande, 3:1.",
    href: "https://www.w3.org/TR/WCAG22/",
  },
];

export default function BrandHubPage() {
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <a className={styles.wordmark} href="#top" aria-label="Voltar ao início">
          <span>Gaby Arbter</span>
          <small>brand hub</small>
        </a>
        <nav aria-label="Seções do guia">
          {nav.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </nav>
        <PrintButton />
      </header>

      <div className={styles.presenceThread} aria-hidden="true"><span /></div>

      <section id="top" className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Sistema vivo de marca · versão 1.1</p>
          <h1>Leveza que<br /><em>tem presença.</em></h1>
          <p className={styles.heroLead}>
            Um guia para a Gaby decidir como falar, fotografar, criar, vender e fazer tudo parecer parte da mesma mulher.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href="#norte">Começar pelo norte <ArrowDown size={16} /></a>
            <a className={styles.textAction} href="#conteudo">Montar um conteúdo <ArrowUpRight size={16} /></a>
          </div>
          <div className={styles.statusLine}>
            <span><Check size={14} /> Baseado no que já existe</span>
            <span><Check size={14} /> Aplicável ao Sopro</span>
            <span><Check size={14} /> Pronto para conteúdo</span>
          </div>
        </div>
        <div className={styles.heroPortrait}>
          <div className={styles.heroImageFrame}>
            <Image src="/photos/avatar.jpg" alt="Gaby Arbter sorrindo" fill priority sizes="(max-width: 800px) 92vw, 44vw" />
          </div>
          <p>Mulher antes do método.<br />Presença antes da performance.</p>
        </div>
      </section>

      <section className={styles.quickStart} aria-label="Como usar o guia">
        <p className={styles.eyebrow}>Se a Gaby tiver só 15 minutos</p>
        <div className={styles.quickGrid}>
          <a href="#norte"><b>01</b><span><strong>Entender</strong>qual é a ideia central</span></a>
          <a href="#cores"><b>02</b><span><strong>Aplicar</strong>cor, fonte e fotografia</span></a>
          <a href="#conteudo"><b>03</b><span><strong>Criar</strong>o post da semana</span></a>
          <a href="#plano"><b>04</b><span><strong>Executar</strong>sem tentar mudar tudo</span></a>
        </div>
      </section>

      <section id="norte" className={`${styles.section} ${styles.northSection}`}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>O norte</p>
          <h2>O que a marca precisa fazer alguém sentir?</h2>
          <p>Não é “parecer zen”. É fazer a mulher perceber que pode cuidar de si sem transformar cuidado em outra cobrança.</p>
        </div>
        <div className={styles.thesisCard}>
          <span>Ideia central</span>
          <blockquote>“Leveza com presença: um cuidado possível, humano e bonito, que cabe na vida real.”</blockquote>
          <div className={styles.thesisTags}><i>acolhe</i><i>traduz</i><i>orienta</i><i>não performa</i></div>
        </div>
        <div className={styles.basisGrid}>
          <article><span>01</span><h3>A fala da Gaby</h3><p>Entrevista sobre leveza, beleza, autoconhecimento, ansiedade, estética saudável e o desejo de vender sem polêmica ou excesso.</p></article>
          <article><span>02</span><h3>O perfil real</h3><p>Formatos já provados: conversa, reflexão com cena, prática de yoga e Ayurveda educativo. Volume não é o problema; sistema é.</p></article>
          <article><span>03</span><h3>O produto vivo</h3><p>O Sopro já tem linguagem, alunos, agenda, check-in e paleta. A marca deve crescer a partir dele, não fingir que ele não existe.</p></article>
          <article><span>04</span><h3>Pesquisa aplicada</h3><p>Branding B.R.A.N.D., evidências sobre cor e atenção, acessibilidade e documentação pública da Meta sobre recomendação.</p></article>
        </div>
      </section>

      <section id="arquitetura" className={`${styles.section} ${styles.darkSection}`}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Arquitetura</p>
          <h2>Uma mulher inteira.<br />Um universo. Várias portas.</h2>
        </div>
        <div className={styles.architecture}>
          <div className={styles.archMaster}><small>marca-mãe</small><strong>Gaby Arbter</strong><p>rosto · voz · visão de mundo</p></div>
          <div className={styles.archLine}><span /></div>
          <div className={styles.archUniverse}><small>universo e método</small><strong>Sopro</strong><p>observar → escolher → praticar → retornar</p></div>
          <div className={styles.archBranches}>
            <article><small>produto digital</small><b>Leveza que se sustenta</b></article>
            <article><small>experiência</small><b>Aulas e comunidade</b></article>
            <article><small>expressão</small><b>Beleza e autoimagem</b></article>
            <article><small>camada</small><b>Ayurveda cotidiano</b></article>
          </div>
        </div>
        <aside className={styles.ruleNote}><CircleAlert size={18} /><p><strong>Regra:</strong> nenhum tema precisa de identidade própria. Se a peça vem da Gaby e devolve a mulher para si, ela pertence ao mesmo universo.</p></aside>
      </section>

      <section className={`${styles.section} ${styles.audienceSection}`}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Posicionamento</p>
          <h2>Para quem já está cansada de tentar dar conta de si perfeitamente.</h2>
        </div>
        <div className={styles.audienceImage}><Image src="/photos/turma-yoga.jpg" alt="Gaby conduzindo uma prática de yoga em grupo" fill sizes="(max-width: 800px) 100vw, 48vw" /></div>
        <div className={styles.audienceCopy}>
          <div><small>Ela chega dizendo</small><p>“Eu sei que preciso me cuidar, mas parece que tudo exige mais energia do que eu tenho.”</p></div>
          <div><small>A Gaby não promete</small><p>cura, rotina perfeita, corpo ideal, iluminação ou uma nova personalidade em 21 dias.</p></div>
          <div><small>A Gaby facilita</small><p>percepção, repertório e pequenos gestos que a mulher consegue sustentar.</p></div>
        </div>
      </section>

      <section id="cores" className={`${styles.section} ${styles.colorSection}`}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Sistema visual</p>
          <h2>Cor não é atalho para o algoritmo.<br />É memória, hierarquia e legibilidade.</h2>
          <p>A paleta parte dos tokens que já vivem no Sopro. O azul organiza reflexão. O barro vira um pulso raro — a “cor vermelha” amadurecida para caber na Gaby.</p>
        </div>
        <PaletteLab />
        <div className={styles.ratioBar} aria-label="Proporção recomendada de cores">
          <span style={{ flex: 42, background: "#F7F1E5", color: "#2A2A26" }}>42%<small>creme</small></span>
          <span style={{ flex: 25, background: "#ECE2CC", color: "#2A2A26" }}>25%<small>areia</small></span>
          <span style={{ flex: 18, background: "#5C7050", color: "#F7F1E5" }}>18%<small>sálvia</small></span>
          <span style={{ flex: 7, background: "#2F3A27", color: "#F7F1E5" }}>7%</span>
          <span style={{ flex: 5, background: "#6F8B92", color: "#202521" }}>5%</span>
          <span style={{ flex: 3, background: "#B87355", color: "#202521" }}>3%</span>
        </div>
        <div className={styles.colorRules}>
          <article><b>Cor de reconhecimento</b><p>Sálvia aparece toda semana. Não precisa ocupar a tela inteira; precisa voltar com consistência.</p></article>
          <article><b>Cor de atenção</b><p>Barro só em um detalhe: etiqueta, palavra, linha ou CTA. Se tudo chama, nada chama.</p></article>
          <article><b>Cor de profundidade</b><p>Azul mineral separa reflexão de conteúdo didático sem cair no bege genérico do wellness.</p></article>
          <article><b>Contraste real</b><p>Texto comum segue 4,5:1. Nas fotos, use faixa sólida ou sombra; nunca dependa apenas da “beleza” da imagem.</p></article>
        </div>
        <div className={styles.typeSpecimen}>
          <div><small>Display · Cormorant Garamond</small><p>Retornar também é prática.</p></div>
          <div><small>Texto e interface · Inter</small><p>A serifada cria lembrança. A sans deixa a leitura simples, atual e confiável — principalmente no celular.</p></div>
        </div>
      </section>

      <section id="algoritmo" className={`${styles.section} ${styles.algorithmSection}`}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Cor × algoritmo</p>
          <h2>O algoritmo não enxerga “verde que vende”. Ele observa o que as pessoas fazem.</h2>
        </div>
        <div className={styles.signalFlow}>
          <article><Eye /><small>A peça consegue</small><b>ser percebida</b><p>Objeto humano, movimento, rosto, contraste e texto legível.</p></article>
          <i>→</i>
          <article><Play /><small>A ideia consegue</small><b>ser entendida</b><p>Gancho específico, uma promessa de conteúdo e ritmo sem excesso.</p></article>
          <i>→</i>
          <article><Heart /><small>O conteúdo consegue</small><b>ser sentido</b><p>Identificação, utilidade ou linguagem que parece ter nome e autora.</p></article>
          <i>→</i>
          <article><Send /><small>A pessoa decide</small><b>agir</b><p>Assistir, salvar, responder, curtir ou enviar para alguém.</p></article>
        </div>
        <div className={styles.evidenceGrid}>
          <article className={styles.evidencePrimary}><span>O que tem evidência</span><h3>Originalidade, interesse previsto e interação importam.</h3><p>A Meta diz que as recomendações se adaptam ao conteúdo e às contas com que a pessoa interage. Em 2026, informou que 75% das recomendações do Instagram nos EUA já vinham de posts originais.</p></article>
          <article><span>O papel da cor</span><h3>Cor ajuda o cérebro antes de ajudar o conteúdo.</h3><p>Contraste de cor e luminância pode orientar fixações, mas objetos e significado pesam mais. Por isso: Gaby, gesto e cena primeiro; paleta como amplificador.</p></article>
          <article><span>A inferência prática</span><h3>Identidade reduz o tempo para reconhecer “isso é dela”.</h3><p>Não é um sinal oficial de ranking. É uma hipótese operacional: reconhecimento + leitura + consistência podem aumentar a chance de retenção e ação.</p></article>
        </div>
        <div className={styles.algorithmRules}>
          <h3>Régua de criação para distribuição</h3>
          <ol>
            <li><b>0–2 segundos:</b> mostre pessoa, gesto ou objeto real; até sete palavras na tela.</li>
            <li><b>Uma ideia:</b> não tente explicar yoga, Ayurveda, maternidade e produto no mesmo Reel.</li>
            <li><b>Um contraste:</b> escolha só um ponto de atenção em barro ou azul.</li>
            <li><b>Uma ação:</b> enviar, salvar, responder ou entrar — nunca quatro CTAs.</li>
            <li><b>Conteúdo próprio:</b> priorize a Gaby, o Sopro, suas mãos, sua turma e sua rotina.</li>
          </ol>
        </div>
      </section>

      <section id="conteudo" className={`${styles.section} ${styles.contentSection}`}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Copiloto de conteúdo</p>
          <h2>Do “o que eu posto?” para um brief gravável.</h2>
          <p>Escolha o dia e o território. O resultado já respeita a cadência domingo, segunda e quinta e mantém um CTA só.</p>
        </div>
        <ContentBuilder />
        <div className={styles.contentLaw}>
          <div><b>50–60%</b><span>yoga, presença no corpo e Sopro</span></div>
          <div><b>20%</b><span>Ayurveda traduzido para o cotidiano</span></div>
          <div><b>10–15%</b><span>beleza como ritual e autoimagem</span></div>
          <div><b>5–10%</b><span>maternidade, só quando houver verdade</span></div>
        </div>
        <aside className={styles.badGood}>
          <div><small>Não parece Gaby</small><p>“3 hábitos para eliminar a ansiedade e transformar a sua vida.”</p></div>
          <div><small>Parece Gaby</small><p>“Talvez você não precise resolver o dia inteiro. Só perceber como chegou neste minuto.”</p></div>
        </aside>
      </section>

      <section id="instagram" className={`${styles.section} ${styles.instagramSection}`}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Instagram</p>
          <h2>Um feed com cadência, não um tabuleiro engessado.</h2>
          <p>A repetição fica na tipografia, nas cores e na voz. A vida continua tendo textura, luz diferente e movimento.</p>
        </div>
        <div className={styles.instagramLayout}>
          <div className={styles.phoneFeed} aria-label="Exemplo de grade de Instagram">
            <div className={styles.feedPhoto}><Image src="/photos/avatar.jpg" alt="" fill sizes="180px" /></div>
            <div className={styles.feedQuote}>O cuidado<br />possível.<small>manifesto</small></div>
            <div className={styles.feedPhoto}><Image src="/photos/aula-detalhe.jpg" alt="" fill sizes="180px" /></div>
            <div className={styles.feedDark}>Retornar<br />também é<br />prática.</div>
            <div className={styles.feedPhoto}><Image src="/photos/turma-yoga.jpg" alt="" fill sizes="180px" /></div>
            <div className={styles.feedSand}>Leveza<br />que se<br />sustenta.<small>experiência</small></div>
            <div className={styles.feedPhoto}><Image src="/maquiagem/sorriso-suave.jpg" alt="" fill sizes="180px" /></div>
            <div className={styles.feedBlue}>O que está<br />nas minhas<br />mãos hoje?</div>
            <div className={styles.feedPhoto}><Image src="/photos/aula-detalhe.jpg" alt="" fill sizes="180px" /></div>
          </div>
          <div className={styles.instagramRules}>
            <article><b>4–5</b><span>posts com a Gaby ou mulheres reais</span></article>
            <article><b>2–3</b><span>cenas, gestos, aula ou ambiente</span></article>
            <article><b>até 2</b><span>cards tipográficos em cada nove</span></article>
            <div className={styles.coverRecipe}>
              <small>Capa de Reel</small>
              <p><strong>Foto própria</strong> + frase de até sete palavras + uma etiqueta curta. O título não fica encostado nas bordas e precisa sobreviver ao recorte 1:1 do perfil.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="sopro" className={`${styles.section} ${styles.soproSection}`}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Aplicação no produto</p>
          <h2>O Sopro é a prova de que a marca já existe.</h2>
          <p>O trabalho não é redesenhar tudo. É nomear o sistema, corrigir as divergências e fazer app, conteúdo e produto parecerem parte do mesmo cuidado.</p>
        </div>
        <div className={styles.soproMap}>
          <article><span style={{ background: "#F7F1E5" }} /><div><small>Já existe</small><b>Cream #F7F1E5</b><p>vira a base oficial de respiro.</p></div></article>
          <article><span style={{ background: "#5C7050" }} /><div><small>Já existe</small><b>Sage 700 #5C7050</b><p>vira a assinatura reconhecível.</p></div></article>
          <article><span style={{ background: "#B87355" }} /><div><small>Já existe</small><b>Terra #B87355</b><p>vira pulso, não cor de fundo.</p></div></article>
          <article><span style={{ background: "#6F8B92" }} /><div><small>Entra</small><b>Azul mineral #6F8B92</b><p>separa reflexão de venda.</p></div></article>
        </div>
        <div className={styles.productPrinciples}>
          <article><Leaf /><b>Mesmo gesto</b><p>A linguagem visual do check-in, do Story e da página do produto deve parecer uma continuidade.</p></article>
          <article><MessageCircle /><b>Mesma voz</b><p>Notificação não fala como sistema; fala como Gaby: clara, curta e sem diminutivo forçado.</p></article>
          <article><BookOpen /><b>Mesma lógica</b><p>Observar → escolher → praticar → retornar organiza aula, conteúdo e “Leveza que se sustenta”.</p></article>
        </div>
      </section>

      <section id="plano" className={`${styles.section} ${styles.planSection}`}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Plano de implantação</p>
          <h2>Quatro semanas para a marca começar a ser reconhecida.</h2>
        </div>
        <div className={styles.timeline}>
          <article><time>Semana 1</time><h3>Travar o sistema</h3><ul><li>aprovar norte, arquitetura e paleta</li><li>definir bio e três posts fixados</li><li>escolher três capas-base</li></ul></article>
          <article><time>Semana 2</time><h3>Arrumar a recepção</h3><ul><li>avatar e seis destaques</li><li>bio com Sopro e Erechim</li><li>organizar links e promessa de cada porta</li></ul></article>
          <article><time>Semana 3</time><h3>Criar reconhecimento</h3><ul><li>domingo, segunda e quinta</li><li>uma manhã de fotos e vídeos no Sopro</li><li>começar série autoral recorrente</li></ul></article>
          <article><time>Semana 4</time><h3>Ligar ao produto</h3><ul><li>aquecer Leveza que se sustenta</li><li>conectar conteúdo à lista de interesse</li><li>medir envios, salvamentos e DMs</li></ul></article>
        </div>
        <div className={styles.finalChecklist}>
          <h3>Antes de publicar, a peça passa por cinco perguntas</h3>
          <div><span>1</span><p>Isso parece a Gaby inteira ou um perfil genérico de wellness?</p></div>
          <div><span>2</span><p>Existe uma cena, gesto ou observação real?</p></div>
          <div><span>3</span><p>Uma mulher entende a ideia sem ler duas vezes?</p></div>
          <div><span>4</span><p>Há contraste suficiente e só um ponto chamando atenção?</p></div>
          <div><span>5</span><p>O CTA corresponde ao momento: relação, consideração ou oferta?</p></div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sourcesSection}`}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Base e limites</p>
          <h2>De onde vieram as decisões.</h2>
          <p>O guia combina evidência interna e pesquisa externa. Nenhum estudo prova que uma paleta “agrada o algoritmo”; as recomendações são aplicações estratégicas, não causalidades inventadas.</p>
        </div>
        <div className={styles.sourcesList}>
          {sources.map((source) => (
            <a key={source.href} href={source.href} target="_blank" rel="noreferrer">
              <span><strong>{source.title}</strong><small>{source.note}</small></span><ArrowUpRight size={17} />
            </a>
          ))}
        </div>
        <div className={styles.internalSources}>
          <p><strong>Fontes internas:</strong> entrevista com a Gaby; briefing de essência e audiência; estratégia editorial; auditoria do perfil; código e tokens do Sopro; base de autores e filosofias; planejamento de “Leveza que se sustenta”; fotos reais e histórico operacional.</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <div><span>Gaby Arbter</span><small>Brand Hub · 18 de agosto de 2026</small></div>
        <p>Marca viva: observar, escolher, praticar, retornar.</p>
      </footer>
    </main>
  );
}
