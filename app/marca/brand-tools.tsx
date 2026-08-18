"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, Printer, Sparkles } from "lucide-react";
import styles from "./brand-hub.module.css";

export const COLORS = [
  { name: "Creme", hex: "#F7F1E5", role: "base e respiro", usage: "42%" },
  { name: "Areia", hex: "#ECE2CC", role: "acolhimento e matéria", usage: "25%" },
  { name: "Sálvia Sopro", hex: "#5C7050", role: "presença e assinatura", usage: "18%" },
  { name: "Bosque", hex: "#2F3A27", role: "profundidade e contraste", usage: "7%" },
  { name: "Azul mineral", hex: "#6F8B92", role: "reflexão e confiança", usage: "5%" },
  { name: "Barro", hex: "#B87355", role: "pulso e conversão gentil", usage: "3%" },
] as const;

export function PrintButton() {
  return (
    <button className={styles.printButton} type="button" onClick={() => window.print()}>
      <Printer size={16} aria-hidden="true" />
      Salvar em PDF
    </button>
  );
}

export function PaletteLab() {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(hex: string) {
    await navigator.clipboard.writeText(hex);
    setCopied(hex);
    window.setTimeout(() => setCopied(null), 1400);
  }

  return (
    <div className={styles.paletteGrid}>
      {COLORS.map((color) => (
        <button
          type="button"
          key={color.hex}
          className={styles.swatch}
          onClick={() => copy(color.hex)}
          aria-label={`Copiar ${color.name}: ${color.hex}`}
        >
          <span className={styles.swatchColor} style={{ background: color.hex }} />
          <span className={styles.swatchText}>
            <span>
              <strong>{color.name}</strong>
              <small>{color.role}</small>
            </span>
            <span className={styles.swatchMeta}>
              <b>{color.usage}</b>
              <code>{color.hex}</code>
              {copied === color.hex ? <Check size={14} /> : <Clipboard size={14} />}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

const days = {
  domingo: {
    label: "Domingo à noite",
    intention: "Conexão",
    format: "Reel de 15–25s ou foto-carta",
    opening: "Uma cena real que fecha a semana e abre espaço para a próxima.",
    cta: "Uma pergunta que a pessoa queira responder ou enviar para alguém.",
  },
  segunda: {
    label: "Segunda",
    intention: "Autoridade leve",
    format: "Reel explicativo ou carrossel de 5–7 telas",
    opening: "Nomeie um estado cotidiano antes de explicar yoga, Ayurveda ou filosofia.",
    cta: "Salvar para praticar ou compartilhar com uma mulher específica.",
  },
  quinta: {
    label: "Quinta",
    intention: "Conversão gentil",
    format: "Story em 3 quadros + Reel curto",
    opening: "Mostre o ambiente, a prática ou o produto antes de fazer o convite.",
    cta: "Escolha um caminho: Sopro, direct ou lista de Leveza que se sustenta.",
  },
} as const;

const themes = {
  yoga: {
    label: "Yoga / Sopro",
    scene: "tapete usado, sala antes da aula, mãos ajustando o espaço",
    question: "Em que momento do dia você percebe que se abandonou um pouco?",
    bridge: "Presença não começa na postura perfeita; começa em notar como você chegou.",
  },
  ayurveda: {
    label: "Ayurveda cotidiano",
    scene: "chá, panela, janela, óleo ou gesto simples de cozinha",
    question: "O que o seu corpo está pedindo que a pressa não deixa você ouvir?",
    bridge: "O nome pode ser antigo. O cuidado precisa caber na vida de hoje.",
  },
  beleza: {
    label: "Beleza e autoimagem",
    scene: "rosto real, mãos, preparação, textura de pele e luz natural",
    question: "Você se arruma para se esconder ou para se reconhecer?",
    bridge: "Beleza aqui não é correção. É um jeito de olhar para si com mais presença.",
  },
  filosofia: {
    label: "Filosofia praticada",
    scene: "caminhada, diário, luz da manhã ou um minuto antes do celular",
    question: "O que está, de verdade, nas suas mãos hoje?",
    bridge: "Uma ideia só ganha corpo quando encontra um gesto possível.",
  },
} as const;

export function ContentBuilder() {
  const [day, setDay] = useState<keyof typeof days>("domingo");
  const [theme, setTheme] = useState<keyof typeof themes>("yoga");
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => ({ ...days[day], ...themes[theme] }), [day, theme]);

  const draft = `${result.label} · ${result.intention}\nFormato: ${result.format}\nCena: ${result.scene}\nGancho: ${result.question}\nIdeia: ${result.bridge}\nCTA: ${result.cta}`;

  async function copyDraft() {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className={styles.builder}>
      <div className={styles.builderControls}>
        <label>
          Quando ela vai postar?
          <select value={day} onChange={(event) => setDay(event.target.value as keyof typeof days)}>
            {Object.entries(days).map(([value, item]) => (
              <option key={value} value={value}>{item.label}</option>
            ))}
          </select>
        </label>
        <label>
          Qual território?
          <select value={theme} onChange={(event) => setTheme(event.target.value as keyof typeof themes)}>
            {Object.entries(themes).map(([value, item]) => (
              <option key={value} value={value}>{item.label}</option>
            ))}
          </select>
        </label>
      </div>
      <div className={styles.draftCard}>
        <div className={styles.draftTopline}>
          <span><Sparkles size={15} /> Rascunho de partida</span>
          <button type="button" onClick={copyDraft}>
            {copied ? <Check size={15} /> : <Clipboard size={15} />}
            {copied ? "Copiado" : "Copiar brief"}
          </button>
        </div>
        <p className={styles.draftTitle}>{result.label} · {result.intention}</p>
        <dl>
          <div><dt>Formato</dt><dd>{result.format}</dd></div>
          <div><dt>Cena</dt><dd>{result.scene}</dd></div>
          <div><dt>Gancho</dt><dd>“{result.question}”</dd></div>
          <div><dt>Ideia</dt><dd>{result.bridge}</dd></div>
          <div><dt>CTA</dt><dd>{result.cta}</dd></div>
        </dl>
      </div>
    </div>
  );
}
