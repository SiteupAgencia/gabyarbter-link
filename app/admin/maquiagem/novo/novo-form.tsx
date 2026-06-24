"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle, Save, CalendarOff, Users } from "lucide-react";
import { cn, formatPhoneBR } from "@/lib/utils";
import { createManualAppointment, createBlock, searchMakeClients } from "../actions";

type ClientMatch = {
  key: string;
  name: string;
  phone: string | null;
  visits: number;
  isMigrated: boolean;
};

type Service = {
  id: string;
  name: string;
  price_cents: number;
  duration_min: number;
};

const TZ = "America/Sao_Paulo";

function todayYmd(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function weekdayLabel(ymd: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return "";
  const d = new Date(`${ymd}T12:00:00-03:00`);
  return new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, weekday: "long" }).format(d);
}

/** Soma minutos a um horário "HH:MM". Retorna null se passar de 24h. */
function addMinutes(hm: string, mins: number): string | null {
  const m = /^(\d{2}):(\d{2})$/.exec(hm);
  if (!m) return null;
  const total = Number(m[1]) * 60 + Number(m[2]) + mins;
  if (total >= 24 * 60) return null;
  const h = Math.floor(total / 60);
  const mm = total % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

const inputCls =
  "w-full rounded-[0.9rem] bg-paper hairline px-4 py-3 text-ink placeholder:text-ink-mute focus:border-sage-300 focus:ring-2 focus:ring-sage-100 outline-none transition";

export function NovoForm({ services }: { services: Service[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"appt" | "block">("appt");
  const done = () => {
    router.push("/admin/maquiagem");
    router.refresh();
  };

  return (
    <div className="space-y-6 fade-up">
      <Link href="/admin/maquiagem" className="inline-flex text-sm text-ink-soft hover:text-ink transition">
        ← Voltar pra agenda
      </Link>

      <div className="grid grid-cols-2 gap-1 bg-cream-soft hairline rounded-2xl p-1">
        <TabBtn active={tab === "appt"} onClick={() => setTab("appt")}>
          Agendamento
        </TabBtn>
        <TabBtn active={tab === "block"} onClick={() => setTab("block")}>
          Bloqueio
        </TabBtn>
      </div>

      {tab === "appt" ? <ApptForm services={services} onDone={done} /> : <BlockForm onDone={done} />}
    </div>
  );
}

/* ---------- Agendamento manual ---------- */

function ApptForm({ services, onDone }: { services: Service[]; onDone: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState(todayYmd());
  const [start, setStart] = useState("");
  const [notes, setNotes] = useState("");

  // Dedupe: busca clientes já cadastrados enquanto a Gaby digita nome/telefone,
  // pra ela reaproveitar em vez de criar um cadastro repetido.
  const [matches, setMatches] = useState<ClientMatch[]>([]);
  const [showMatches, setShowMatches] = useState(false);
  const skipSearch = useRef(false);

  useEffect(() => {
    // Pular a busca logo depois de escolher uma cliente (evita reabrir sozinho).
    if (skipSearch.current) {
      skipSearch.current = false;
      return;
    }
    const nm = name.trim();
    const ph = phone.trim();
    const longEnough = nm.length >= 2 || ph.replace(/\D/g, "").length >= 8;
    if (!longEnough) {
      setMatches([]);
      setShowMatches(false);
      return;
    }
    const t = setTimeout(async () => {
      const res = await searchMakeClients({ name: nm, phone: ph });
      setMatches(res);
      setShowMatches(res.length > 0);
    }, 300);
    return () => clearTimeout(t);
  }, [name, phone]);

  function pickMatch(m: ClientMatch) {
    skipSearch.current = true;
    setName(m.name);
    if (m.phone) setPhone(formatPhoneBR(m.phone));
    setShowMatches(false);
    setMatches([]);
  }

  const service = services.find((s) => s.id === serviceId) ?? null;
  const endPreview = service && start ? addMinutes(start, service.duration_min) : null;

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createManualAppointment({
        serviceId,
        clientName: name,
        clientPhone: phone,
        dateYmd: date,
        startTime: start,
        notes,
      });
      if (res.ok) onDone();
      else setError(res.error);
    });
  }

  if (services.length === 0) {
    return <p className="text-sm text-ink-soft">Nenhum serviço ativo no catálogo.</p>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-5"
    >
      <Field label="Nome da cliente">
        <input value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} placeholder="Ex: Maria Silva" />
      </Field>

      <Field label="WhatsApp">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          inputMode="tel"
          className={inputCls}
          placeholder="(54) 99999-9999"
        />
      </Field>

      {showMatches && matches.length > 0 && (
        <div className="-mt-2 rounded-[0.9rem] bg-sage-50 hairline p-2.5 space-y-1">
          <p className="px-1 pb-1 text-xs font-medium text-ink-soft inline-flex items-center gap-1.5">
            <Users className="size-3.5" /> Já tem cadastro? Toque pra usar:
          </p>
          {matches.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => pickMatch(m)}
              className="w-full text-left rounded-[0.7rem] px-3 py-2 hover:bg-sage-100 transition"
            >
              <span className="block text-sm font-medium text-ink truncate">{m.name}</span>
              <span className="block text-xs text-ink-soft">
                {m.phone ? formatPhoneBR(m.phone) : "sem telefone"}
                {m.visits > 0 && ` · ${m.visits} atend.`}
                {m.isMigrated && " · cliente antiga"}
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowMatches(false)}
            className="w-full text-left rounded-[0.7rem] px-3 py-1.5 text-xs text-ink-mute hover:bg-sand/40 transition"
          >
            É uma cliente nova — seguir com o cadastro
          </button>
        </div>
      )}

      <Field label="Serviço">
        <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className={inputCls}>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · {formatBRL(s.price_cents)} · {s.duration_min}min
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Data">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputCls} />
        </Field>
        <Field label="Horário">
          <input type="time" value={start} onChange={(e) => setStart(e.target.value)} required className={inputCls} />
        </Field>
      </div>

      {endPreview && (
        <p className="-mt-2 text-sm text-ink-soft">
          Termina por volta das <strong className="text-ink">{endPreview}</strong>.
        </p>
      )}

      <Field label="Observações (opcional)">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={inputCls}
          placeholder="Ex: noiva, foto de gestante…"
        />
      </Field>

      {error && <ErrorLine>{error}</ErrorLine>}

      <SubmitBtn pending={pending} tone="primary">
        <Save className="size-4" /> Salvar agendamento
      </SubmitBtn>
    </form>
  );
}

/* ---------- Bloqueio ---------- */

function BlockForm({ onDone }: { onDone: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [date, setDate] = useState(todayYmd());
  const [recurring, setRecurring] = useState(false);
  const [allDay, setAllDay] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const showTimes = recurring || !allDay;

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createBlock({
        dateYmd: date,
        allDay: recurring ? false : allDay,
        startTime: start,
        endTime: end,
        reason,
        recurring,
      });
      if (res.ok) onDone();
      else setError(res.error);
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-5"
    >
      <Field label="Motivo (opcional)">
        <input value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls} placeholder="Ex: Yoga, Folga, Almoço" />
      </Field>

      <Field label="Data">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputCls} />
      </Field>

      <label className="flex items-start gap-2.5 text-sm text-ink select-none cursor-pointer">
        <input
          type="checkbox"
          checked={recurring}
          onChange={(e) => setRecurring(e.target.checked)}
          className="size-4 mt-0.5 rounded border-sand text-sage-700 focus:ring-sage-200"
        />
        <span>
          Repetir toda semana neste horário
          {recurring && date && (
            <span className="block text-xs text-ink-soft mt-0.5">
              Bloqueia toda <span className="capitalize">{weekdayLabel(date)}</span>.
            </span>
          )}
        </span>
      </label>

      {!recurring && (
        <label className="flex items-center gap-2.5 text-sm text-ink select-none cursor-pointer">
          <input
            type="checkbox"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            className="size-4 rounded border-sand text-sage-700 focus:ring-sage-200"
          />
          Bloquear o dia inteiro
        </label>
      )}

      {showTimes && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Início">
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)} required={showTimes} className={inputCls} />
          </Field>
          <Field label="Fim">
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} required={showTimes} className={inputCls} />
          </Field>
        </div>
      )}

      {error && <ErrorLine>{error}</ErrorLine>}

      <SubmitBtn pending={pending} tone="neutral">
        <CalendarOff className="size-4" /> Salvar bloqueio
      </SubmitBtn>
    </form>
  );
}

/* ---------- UI helpers ---------- */

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[0.85rem] py-2 text-sm font-medium transition",
        active ? "bg-paper text-ink elev-soft" : "text-ink-soft hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-ink mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function ErrorLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-terra inline-flex items-start gap-1.5">
      <AlertCircle className="size-4 mt-px shrink-0" />
      {children}
    </p>
  );
}

function SubmitBtn({
  pending,
  tone,
  children,
}: {
  pending: boolean;
  tone: "primary" | "neutral";
  children: React.ReactNode;
}) {
  const styles =
    tone === "primary"
      ? "bg-sage-gradient text-cream elev-soft hover:opacity-95"
      : "bg-ink text-cream hover:opacity-90";
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-medium transition disabled:opacity-50",
        styles,
      )}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
