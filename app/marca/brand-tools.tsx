"use client";

import { useState } from "react";
import { Check, Clipboard, Printer } from "lucide-react";
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
