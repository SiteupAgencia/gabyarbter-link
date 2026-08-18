import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Eye,
  Heart,
  Send,
} from "lucide-react";
import { ContentBuilder, PaletteLab, PrintButton } from "./brand-tools";
import styles from "./brand-hub.module.css";

const nav = [
  ["essencia", "Essência"],
  ["visual", "Visual"],
  ["conteudo", "Conteúdo"],
  ["acao", "Fazer agora"],
] as const;

const sources = [
  {
    title: "Meta · originalidade e recomendações",
    href: "https://about.fb.com/news/2026/01/2026-ai-drives-performance/",
  },
  {
    title: "Meta · como recomendações se personalizam",
    href: "https://about.fb.com/news/2024/11/introducing-recommendations-reset-instagram/",
  },
  {
    title: "Cor e personalidade de marca",
    href: "https://doi.org/10.1007/s11747-010-0245-y",
  },
  {
    title: "W3C · contraste e legibilidade",
    href: "https://www.w3.org/TR/WCAG22/",
  },
];

export default function BrandHubPage() {
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <a className={styles.wordmark} href="#top" aria-label="Voltar ao início">
          <span>Gaby Arbter</span>
          <small>guia de marca</small>
        </a>
        <nav aria-label="Seções do guia">
          {nav.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </nav>
        <PrintButton />
      </header>

      <div className={styles.presenceThread} aria-hidden="true"><span /></div>

      <section id="top" className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Guia simples de marca e conteúdo</p>
          <h1>Leveza que<br /><em>tem presença.</em></h1>
          <p className={styles.heroLead}>
            O essencial para a Gaby falar, criar e vender com a mesma identidade — sem transformar presença em performance.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href="#essencia">Entender a marca <ArrowDown size={18} /></a>
            <a className={styles.textAction} href="#conteudo">Criar um conteúdo <ArrowUpRight size={18} /></a>
          </div>
        </div>
        <div className={styles.heroPortrait}>
          <div className={styles.heroImageFrame}>
            <Image src="/photos/avatar.jpg" alt="Gaby Arbter sorrindo" fill priority sizes="(max-width: 800px) 92vw, 44vw" />
          </div>
          <p>Mulher antes do método.<br />Presença antes da performance.</p>
        </div>
      </section>

      <section id="essencia" className={`${styles.section} ${styles.essenceSection}`}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>01 · Essência</p>
          <h2>O cuidado não precisa virar outra cobrança.</h2>
        </div>

        <div className={styles.thesisCard}>
          <small>Ideia central</small>
          <blockquote>“Um cuidado possível, humano e bonito, que cabe na vida real.”</blockquote>
          <p>A Gaby acolhe, traduz e propõe um gesto. Ela não promete perfeição.</p>
        </div>

        <div className={styles.brandPath}>
          <article>
            <span>01</span><small>Quem conduz</small><h3>Gaby Arbter</h3>
            <p>Rosto, voz e visão de mundo.</p>
          </article>
          <article>
            <span>02</span><small>O universo</small><h3>Sopro</h3>
            <p>Observar, escolher, praticar e retornar.</p>
          </article>
          <article>
            <span>03</span><small>O primeiro produto</small><h3>Leveza que se sustenta</h3>
            <p>Uma prática para mulheres cansadas de tentar dar conta de si perfeitamente.</p>
          </article>
        </div>
      </section>

      <section id="visual" className={`${styles.section} ${styles.visualSection}`}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>02 · Visual</p>
          <h2>Natural, reconhecível e fácil de ler.</h2>
          <p>Areia e creme dão respiro. Sálvia assina a marca. Azul organiza a reflexão. Barro aparece apenas como pulso.</p>
        </div>

        <PaletteLab />

        <div className={styles.visualGuide}>
          <div className={styles.typeCard}>
            <small>Tipografia</small>
            <p className={styles.serifSample}>Retornar também é prática.</p>
            <p><strong>Cormorant Garamond</strong> para frases e títulos. <strong>Inter</strong> para tudo que precisa ser lido com facilidade.</p>
          </div>
          <div className={styles.photoCard}>
            <Image src="/photos/aula-detalhe.jpg" alt="Gaby conduzindo uma prática" fill sizes="(max-width: 760px) 100vw, 45vw" />
            <div><small>Fotografia</small><strong>Vida real antes do template.</strong></div>
          </div>
        </div>

        <div className={styles.threeRules}>
          <article><b>Foto própria</b><p>Gaby, mãos, sala, turma, objeto ou gesto verdadeiro.</p></article>
          <article><b>Frase curta</b><p>Uma ideia por peça. Na capa, até sete palavras.</p></article>
          <article><b>Um contraste</b><p>Só um ponto em barro ou azul para chamar atenção.</p></article>
        </div>
      </section>

      <section id="conteudo" className={`${styles.section} ${styles.contentSection}`}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>03 · Conteúdo</p>
          <h2>Clareza primeiro.<br />Algoritmo depois.</h2>
          <p>Cor ajuda a reconhecer. O que sustenta a distribuição é conteúdo próprio, uma ideia compreendida rápido e uma ação real da pessoa.</p>
        </div>

        <div className={styles.signalStrip}>
          <article><Eye /><div><small>1 · Perceber</small><b>Uma cena ou pergunta real.</b></div></article>
          <article><Heart /><div><small>2 · Sentir</small><b>Uma verdade que toca sem exagero.</b></div></article>
          <article><Send /><div><small>3 · Agir</small><b>Salvar, responder, enviar ou entrar.</b></div></article>
        </div>

        <div className={styles.builderIntro}>
          <div><small>Copiloto prático</small><h3>Monte o próximo conteúdo.</h3></div>
          <p>Escolha o dia e o território. O resultado vira um brief curto para gravar, escrever ou levar à IA do app.</p>
        </div>
        <ContentBuilder />

        <div className={styles.weeklyRhythm}>
          <article><time>Domingo</time><h3>Conectar</h3><p>Uma reflexão ou cena real para abrir a semana.</p></article>
          <article><time>Segunda</time><h3>Ensinar</h3><p>Yoga, Ayurveda, beleza ou filosofia traduzidos para a vida.</p></article>
          <article><time>Quinta</time><h3>Convidar</h3><p>Mostrar a experiência e fazer um único convite.</p></article>
        </div>

        <aside className={styles.voiceExample}>
          <div><small>Evitar</small><p>“3 hábitos para eliminar a ansiedade.”</p></div>
          <div><small>Usar</small><p>“Talvez você não precise resolver o dia inteiro. Só perceber como chegou neste minuto.”</p></div>
        </aside>
      </section>

      <section id="acao" className={`${styles.section} ${styles.actionSection}`}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>04 · Fazer agora</p>
          <h2>Três movimentos até o lançamento.</h2>
          <p>O objetivo é chegar ao fim de setembro com reconhecimento, desejo e uma conversa já acontecendo em torno de “Leveza que se sustenta”.</p>
        </div>

        <div className={styles.actionSteps}>
          <article><span>Agora</span><h3>Arrumar a casa</h3><p>Bio clara, três posts fixados, destaques simples e identidade visual aplicada.</p></article>
          <article><span>Toda semana</span><h3>Criar reconhecimento</h3><p>Domingo, segunda e quinta. Fotos próprias, séries recorrentes e uma linguagem constante.</p></article>
          <article><span>Antes de vender</span><h3>Criar desejo</h3><p>Nomear o cansaço, mostrar pequenos retornos possíveis e abrir a lista de interesse.</p></article>
        </div>

        <div className={styles.publishCheck}>
          <h3>Antes de publicar, pergunte:</h3>
          <p><Check /> Isso parece a Gaby ou um perfil genérico?</p>
          <p><Check /> Existe uma cena, observação ou gesto real?</p>
          <p><Check /> A pessoa entende a ideia e o próximo passo?</p>
        </div>

        <details className={styles.sourcesDetails}>
          <summary>Ver fontes e critérios usados</summary>
          <p>O guia combina entrevistas, histórico editorial, identidade do Sopro e pesquisa externa. Nenhuma cor “agrada o algoritmo” sozinha; a paleta serve a reconhecimento, atenção e leitura.</p>
          <div>
            {sources.map((source) => (
              <a key={source.href} href={source.href} target="_blank" rel="noreferrer">
                {source.title}<ArrowUpRight size={16} />
              </a>
            ))}
          </div>
        </details>
      </section>

      <footer className={styles.footer}>
        <div><span>Gaby Arbter</span><small>Guia de marca · agosto de 2026</small></div>
        <p>Observar, escolher, praticar, retornar.</p>
      </footer>
    </main>
  );
}
