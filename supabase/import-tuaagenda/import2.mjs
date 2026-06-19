#!/usr/bin/env node
// =============================================================
// Import v2 — histórico REAL do TuaAgenda (via API) -> Supabase
//
//  Fontes (em ~/Downloads):
//    tuaagenda-agendamentos.json  -> 3.562 atendimentos datados
//    relatorio5973514911372898016.csv -> cadastro (cruza 100% por idCliente)
//
//  Gera (out2/, gitignored):
//    seed-services.sql      -> serviços históricos (inativos)
//    seed-clients.sql       -> make_clients (todos os contatos, ligados por tuaagenda_id)
//    seed-appointments.sql  -> make_appointments (atendimentos datados, source='tuaagenda')
//
//  Dry-run only: NÃO grava na produção. Rode os .sql no painel/psql após revisar.
//  Pré-requisito no banco: onda16 + onda17.
// =============================================================
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const DL = path.join(os.homedir(), "Downloads");
const OUT = path.join(import.meta.dirname, "out2");
const REF = new Date("2026-06-19T00:00:00-03:00").getTime(); // "hoje" p/ futuro vs passado

// ---------- CSV ----------
function parseCSV(t) {
  t = t.replace(/^﻿/, ""); const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < t.length; i++) { const c = t[i];
    if (q) { if (c === '"') { if (t[i+1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else { if (c === '"') q = true; else if (c === ",") { row.push(f); f = ""; }
      else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; }
      else if (c !== "\r") f += c; } }
  if (f.length || row.length) { row.push(f); rows.push(row); }
  const h = rows.shift().map(x => x.trim());
  return rows.filter(r => r.some(v => v && v.trim())).map(r => Object.fromEntries(h.map((k, i) => [k, (r[i] ?? "").trim()])));
}

// ---------- normalização ----------
const digits = s => (s || "").replace(/\D/g, "");
function toE164(raw) { // E.164 BR, robusto p/ DDD-55 (fix da revisão)
  const d = digits(raw);
  if (d.length === 13 && d.startsWith("55")) return "+" + d;
  if (d.length === 12 && d.startsWith("55")) return "+" + d;
  if (d.length === 11 || d.length === 10) return "+55" + d;
  return null;
}
function parseBirthday(raw) {
  const m = (raw || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); if (!m) return null;
  const dd = +m[1], mm = +m[2], yy = +m[3];
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31 || yy < 1900 || yy > 2026) return null;
  return `${yy}-${String(mm).padStart(2,"0")}-${String(dd).padStart(2,"0")}`;
}
const slugify = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "servico";
const sq = v => (v === null || v === undefined || v === "") ? "null" : "'" + String(v).replace(/'/g, "''") + "'";
const mode = arr => { const c = {}; let best = null, bn = -1; for (const x of arr) { c[x] = (c[x]||0)+1; if (c[x] > bn) { bn = c[x]; best = x; } } return best; };
const looksJunk = n => { n = (n||"").trim(); if (!n) return true; if (/^\d{1,2}[:h]\d{2}/.test(n)) return true; if (/hor[áa]rio|\binsta\b|teste|^\d+\s*horarios?/i.test(n)) return true; return false; };

// ---------- carrega ----------
const AG = JSON.parse(fs.readFileSync(path.join(DL, "tuaagenda-agendamentos.json"), "utf8"));
const REGROWS = parseCSV(fs.readFileSync(path.join(DL, "relatorio5973514911372898016.csv"), "utf8"));
const REG = Object.fromEntries(REGROWS.filter(r => r.ID).map(r => [r.ID, r]));

// ---------- parsing de serviço a partir do descricao ----------
function serviceOf(desc) {
  const p = (desc || "").split(" - ").map(x => x.trim());
  if (p.length >= 3 && p[p.length - 2]) return p[p.length - 2].replace(/\s+/g, " ").trim();
  return "Outro (migrado)";
}
function clientNameFromDesc(desc) {
  const p = (desc || "").split(" - ").map(x => x.trim());
  return p.length >= 3 ? p.slice(0, p.length - 2).join(" - ").trim() : (desc || "").trim();
}

// ========== 1. SERVIÇOS ==========
const svcAgg = {}; // name -> {totals:[], durs:[], count}
for (const a of AG) {
  const name = serviceOf(a.descricao);
  const s = (svcAgg[name] ||= { totals: [], durs: [], count: 0 });
  s.count++;
  if (a.total > 0) s.totals.push(Math.round(a.total * 100));
  const i = Date.parse(a.inicio?.replace(" ", "T") + "-03:00"), f = Date.parse(a.fim?.replace(" ", "T") + "-03:00");
  if (i && f && f > i) s.durs.push(Math.round((f - i) / 60000));
}
const slugSeen = new Set();
const services = Object.entries(svcAgg).map(([name, s]) => {
  let slug = slugify(name); while (slugSeen.has(slug)) slug += "-x"; slugSeen.add(slug);
  let dur = mode(s.durs) || 40; if (dur <= 0 || dur > 1440) dur = 40;
  let price = mode(s.totals) || 15000; if (price <= 0) price = 100;
  return { name, slug, price, dur, count: s.count };
});
const svcSlug = Object.fromEntries(services.map(s => [s.name, s.slug]));

let sqlSvc = `-- Serviços históricos do TuaAgenda (inativos). Idempotente por slug.\nbegin;\n`;
sqlSvc += `insert into public.make_services (slug, name, description, price_cents, duration_min, payment_methods, active, sort_order, source) values\n`;
sqlSvc += services.map((s, i) => `  (${sq(s.slug)}, ${sq(s.name)}, ${sq("Serviço migrado do TuaAgenda (" + s.count + " atendimentos no histórico).")}, ${s.price}, ${s.dur}, '{}', false, ${100 + i}, 'tuaagenda')`).join(",\n");
sqlSvc += `\non conflict (slug) do update set source='tuaagenda', active=case when make_services.source='tuaagenda' then false else make_services.active end;\ncommit;\n`;

// ========== 2. agregados por cliente (a partir dos atendimentos reais) ==========
const cliAgg = {}; // idCliente -> {visits, spentCents, last}
for (const a of AG) {
  if (!a.idCliente) continue;
  const c = (cliAgg[a.idCliente] ||= { visits: 0, spentCents: 0, last: null });
  if (a.situacao === "ATENDIDO") { c.visits++; c.spentCents += Math.round((a.total || 0) * 100); }
  if (!c.last || a.inicio > c.last) c.last = a.inicio;
}

// ========== 3. CLIENTES (todos os contatos do cadastro) ==========
const stats = { junk: 0, phoneless: 0, sharedPhone: 0, badBday: 0, renamed: 0, clampedDur: 0 };
let clients = REGROWS.filter(r => r.ID).map(r => {
  const phone = toE164(r["Telefone"]);
  let name = (r["Nome"] || "").trim();
  const email = (r["Email"] || "").trim();
  const bdayRaw = r["Data de Nascimento"]; const birthday = parseBirthday(bdayRaw);
  if (bdayRaw && bdayRaw.trim() && !birthday) stats.badBday++;
  const agg = cliAgg[r.ID];
  const isClient = !!agg;
  const nameJunk = looksJunk(name) || (digits(name).length >= 10 && /^[+\d()\s-]+$/.test(name));
  if (!isClient && !phone && !email && !birthday && nameJunk) { stats.junk++; return null; }
  // nome-lixo ("18:00", número-como-nome) mesmo com atendimento → placeholder estável
  if (nameJunk) { name = phone ? "Cliente " + digits(phone).slice(-4) : "Cliente " + (r.ID || "").slice(0, 4); stats.renamed++; }
  if (!phone) stats.phoneless++;
  return {
    tuaagenda_id: r.ID, phone, name, nickname: r["Apelido"], email, birthday, cpf: r["CPF"],
    cep: r["CEP"], street: r["Rua"], number: r["Nº Endereço"], complement: r["Complemento"],
    neighborhood: r["Bairro"], city: r["Cidade"], state: r["Estado"], country: r["País"],
    is_client: isClient, visits: agg ? agg.visits : 0, spentCents: agg ? agg.spentCents : 0,
  };
}).filter(Boolean);

// telefone NÃO é único (famílias compartilham) — mantemos em todos; só contamos os compartilhados.
const byPhone = {};
for (const c of clients) if (c.phone) (byPhone[c.phone] ||= []).push(c);
for (const arr of Object.values(byPhone)) if (arr.length > 1) stats.sharedPhone += arr.length;

const CC = ["tuaagenda_id","phone","name","nickname","email","birthday","cpf","cep","street","street_number","complement","neighborhood","city","state","country","is_client","legacy_visits","legacy_spent_cents","source","imported_at"];
const cliRow = c => "(" + [sq(c.tuaagenda_id), sq(c.phone), sq(c.name), sq(c.nickname), sq(c.email),
  c.birthday ? sq(c.birthday) : "null", sq(c.cpf), sq(c.cep), sq(c.street), sq(c.number), sq(c.complement),
  sq(c.neighborhood), sq(c.city), sq(c.state), sq(c.country), c.is_client ? "true" : "false",
  c.visits, c.spentCents, "'tuaagenda'", "now()"].join(",") + ")";
const chunk = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i*n, i*n+n));
let sqlCli = `-- make_clients a partir do TuaAgenda. Idempotente por tuaagenda_id.\nbegin;\n`;
for (const part of chunk(clients, 300))
  sqlCli += `insert into public.make_clients (${CC.join(",")}) values\n  ${part.map(cliRow).join(",\n  ")}\non conflict (tuaagenda_id) where tuaagenda_id is not null do update set phone=excluded.phone, name=excluded.name, email=coalesce(excluded.email,make_clients.email), birthday=coalesce(excluded.birthday,make_clients.birthday), cpf=coalesce(excluded.cpf,make_clients.cpf), city=coalesce(excluded.city,make_clients.city), is_client=excluded.is_client, legacy_visits=excluded.legacy_visits, legacy_spent_cents=excluded.legacy_spent_cents, source='tuaagenda';\n`;
sqlCli += `commit;\n`;

// ========== 4. ATENDIMENTOS ==========
function tsLit(s) { return s ? s.trim().replace(" ", " ") + "-03" : null; } // 'YYYY-MM-DD HH:MM:SS-03'
let skipNoClient = 0;
const appts = [];
for (const a of AG) {
  if (!a.idCliente) { skipNoClient++; continue; }
  const reg = REG[a.idCliente];
  const slug = svcSlug[serviceOf(a.descricao)] || "outro-migrado";
  let name = (reg && (reg["Nome"] || "").trim()) || "";
  if (!name || looksJunk(name) || (digits(name).length >= 10 && /^[+\d()\s-]+$/.test(name))) {
    const fromDesc = clientNameFromDesc(a.descricao);
    name = (fromDesc && !looksJunk(fromDesc)) ? fromDesc : (a.idCliente ? "Cliente " + a.idCliente.slice(0, 4) : "Cliente");
  }
  const phone = reg ? toE164(reg["Telefone"]) : null;
  const email = reg ? ((reg["Email"] || "").trim() || null) : null;
  const startMs = Date.parse((a.inicio || "").replace(" ", "T") + "-03:00");
  let endMs = a.fim ? Date.parse((a.fim || "").replace(" ", "T") + "-03:00") : NaN;
  if (!endMs || isNaN(endMs) || endMs <= startMs) endMs = startMs + 40 * 60000;
  if (endMs - startMs > 600 * 60000) { endMs = startMs + 600 * 60000; stats.clampedDur++; } // clamp cursos multi-dia (não travar agenda)
  // -3h compensa o offset antes do toISOString (UTC) pra o literal sair em wall-clock -03
  const endLit = new Date(endMs - 3 * 3600 * 1000).toISOString().slice(0, 19).replace("T", " ") + "-03";
  let status = a.situacao === "NAO_ATENDIDO" ? "no_show" : (startMs < REF ? "completed" : "confirmed");
  appts.push({
    tid: a.id, slug, name, phone, email, tcli: a.idCliente,
    starts: tsLit(a.inicio), ends: endLit, status,
    total: Math.round((a.total || 0) * 100), notes: (a.obs || "").trim() || null,
  });
}
const aRow = a => "(" + [sq(a.tid), sq(a.slug), sq(a.name), sq(a.phone), sq(a.email), sq(a.tcli),
  sq(a.starts), sq(a.ends), sq(a.status), a.total, sq(a.notes)].join(",") + ")";
let sqlAppt = `-- make_appointments: histórico datado do TuaAgenda. Idempotente por tuaagenda_id.\n-- Pré: rodar seed-services.sql antes (resolve service_id por slug).\nbegin;\n`;
for (const part of chunk(appts, 250)) {
  sqlAppt += `insert into public.make_appointments
  (tuaagenda_id, service_id, client_name, client_phone, client_email, tuaagenda_client_id,
   starts_at, ends_at, status, total_cents, amount_cents, deposit_cents, payment_method, notes,
   completed_at, confirmed_at, cancelled_at, source, created_at)
select v.tid, s.id, v.cname, v.cphone, v.cemail, v.tcli,
   v.starts::timestamptz, v.ends::timestamptz, v.status, v.total, v.total, 0, null, v.notes,
   case when v.status='completed' then v.starts::timestamptz end,
   case when v.status='confirmed' then now() end,
   case when v.status='no_show' then v.starts::timestamptz end,
   'tuaagenda', now()
from (values\n  ${part.map(aRow).join(",\n  ")}
) as v(tid, slug, cname, cphone, cemail, tcli, starts, ends, status, total, notes)
join public.make_services s on s.slug = v.slug
on conflict (tuaagenda_id) where tuaagenda_id is not null do update set
  service_id=excluded.service_id, client_name=excluded.client_name, client_phone=excluded.client_phone,
  status=excluded.status, total_cents=excluded.total_cents, amount_cents=excluded.amount_cents,
  completed_at=excluded.completed_at, source='tuaagenda';\n`;
}
sqlAppt += `commit;\n`;

// ========== escreve ==========
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, ".gitignore"), "*\n");
fs.writeFileSync(path.join(OUT, "seed-services.sql"), sqlSvc);
fs.writeFileSync(path.join(OUT, "seed-clients.sql"), sqlCli);
fs.writeFileSync(path.join(OUT, "seed-appointments.sql"), sqlAppt);

// ========== relatório ==========
const brl = c => "R$ " + (c/100).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
const stDist = {}; for (const a of appts) stDist[a.status] = (stDist[a.status]||0)+1;
const rev = appts.filter(a => a.status === "completed").reduce((s,a)=>s+a.total,0);
const withPhone = appts.filter(a => a.phone).length;
console.log("\n========  IMPORT v2 · HISTÓRICO REAL · DRY-RUN  ========\n");
console.log("SERVIÇOS históricos criados:", services.length);
console.log("CLIENTES (make_clients):", clients.length, "| com telefone:", clients.filter(c=>c.phone).length,
  "| clientes-de-fato:", clients.filter(c=>c.is_client).length, "| c/ aniversário:", clients.filter(c=>c.birthday).length);
console.log("  junk descartado:", stats.junk, "| nome-lixo renomeado:", stats.renamed, "| sem telefone:", stats.phoneless, "| telefones compartilhados (mantidos):", stats.sharedPhone, "| aniversário ilegível:", stats.badBday);
console.log("\nATENDIMENTOS (make_appointments):", appts.length, "| pulados sem cliente:", skipNoClient);
console.log("  status:", JSON.stringify(stDist), "| durações multi-dia clampadas:", stats.clampedDur);
console.log("  com telefone:", withPhone, "| sem telefone (client_phone null):", appts.length - withPhone);
console.log("  receita 'completed':", brl(rev), "  (esperado ~R$ 474.876)");
console.log("\nArquivos em", path.relative(process.cwd(), OUT) + ":");
console.log("  seed-services.sql     (" + services.length + " serviços)");
console.log("  seed-clients.sql      (" + clients.length + " clientes)");
console.log("  seed-appointments.sql (" + appts.length + " atendimentos)");
console.log("\n>> DRY-RUN: nada gravado. Revisar e rodar os .sql no painel após onda16+onda17.\n");
