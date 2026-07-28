import { useMemo, useState } from 'react';
import { AlertTriangle, TrendingUp, FileText, Zap, Euro, Clock, CheckCircle2 } from 'lucide-react';
import type { Charge, Budget, Facture, ConsommationFluide } from './financeTypes';
import { fmtEur, STATUT_CHARGE_CFG } from './financeTypes';
import { BudgetBar, ResponsableChip, StatutChargeChip, StatutFactureChip } from './FinanceShared';

// ─── Mini SVG bar chart ───────────────────────────────────────────────────────

function BarChart({ data, color = '#3b82f6', label }: { data: number[]; color?: string; label: string }) {
  const max = Math.max(...data, 1);
  const W = 240, H = 60, BAR_W = Math.floor(W / data.length) - 2;
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <svg width={W} height={H} className="overflow-visible">
        {data.map((v, i) => {
          const h = Math.round((v / max) * (H - 8));
          return (
            <rect key={i}
              x={i * (BAR_W + 2)} y={H - h} width={BAR_W} height={h}
              rx={2} fill={color} opacity={0.85} />
          );
        })}
      </svg>
    </div>
  );
}

// ─── Mini donut ───────────────────────────────────────────────────────────────

function MiniDonut({ slices, size = 64 }: { slices: { value: number; color: string; label: string }[]; size?: number }) {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return <div className="w-16 h-16 rounded-full bg-slate-100" />;
  const R = (size - 12) / 2, cx = size / 2, cy = size / 2;
  let ang = -Math.PI / 2;
  const paths = slices.map(sl => {
    const a = (sl.value / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(ang), y1 = cy + R * Math.sin(ang);
    ang += a;
    const x2 = cx + R * Math.cos(ang), y2 = cy + R * Math.sin(ang);
    const large = a > Math.PI ? 1 : 0;
    return { d: `M${cx},${cy} L${x1},${y1} A${R},${R},0,${large},1,${x2},${y2} Z`, color: sl.color, label: sl.label, value: sl.value };
  });
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={R / 2.2} fill="white" />
      {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} opacity={0.9} />)}
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#334155">{total}</text>
    </svg>
  );
}

// ─── Fluides line chart ───────────────────────────────────────────────────────

function FluidLineChart({ data, color = '#3b82f6' }: { data: { mois: number; valeur: number }[]; color?: string }) {
  const W = 260, H = 70;
  if (data.length < 2) return <div className="h-16 flex items-center justify-center text-slate-300 text-xs">Données insuffisantes</div>;
  const vals = data.map(d => d.valeur);
  const min = Math.min(...vals), max = Math.max(...vals, min + 1);
  const pts = data.map((d, i) => {
    const x = 8 + (i / (data.length - 1)) * (W - 16);
    const y = H - 8 - ((d.valeur - min) / (max - min)) * (H - 16);
    return `${x},${y}`;
  });
  return (
    <svg width={W} height={H} className="overflow-visible">
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      {data.map((d, i) => {
        const [x, y] = pts[i].split(',').map(Number);
        return <circle key={i} cx={x} cy={y} r={2.5} fill={color} />;
      })}
    </svg>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  charges: Charge[];
  budgets: Budget[];
  factures: Facture[];
  fluides: ConsommationFluide[];
  residenceLabel: string;
}

export default function FinanceDashboard({ charges, budgets, factures, fluides, residenceLabel }: Props) {
  const [selectedBudgetType, setSelectedBudgetType] = useState('maintenance');

  // ── KPI ──────────────────────────────────────────────────────────────────
  const totalEstime   = charges.reduce((s, c) => s + c.cout_estime, 0);
  const totalReel     = charges.reduce((s, c) => s + (c.cout_reel ?? 0), 0);
  const nbLitiges     = charges.filter(c => c.statut === 'litige').length;
  const nbEnAttente   = charges.filter(c => c.statut === 'en_attente').length;
  const nbValide      = charges.filter(c => c.statut === 'valide').length;
  const pctBailleur   = charges.length > 0
    ? Math.round((charges.filter(c => c.responsable === 'Propriétaire').length / charges.length) * 100) : 0;
  const pctGest       = charges.length > 0
    ? Math.round((charges.filter(c => c.responsable === 'Gestionnaire').length / charges.length) * 100) : 0;
  const montantImpaye = factures.filter(f => f.statut === 'impaye').reduce((s, f) => s + f.montant_ttc, 0);
  const nbFactures    = factures.length;
  const nbImpaye      = factures.filter(f => f.statut === 'impaye').length;

  // ── Budget sélectionné ────────────────────────────────────────────────────
  const budgetActuel = useMemo(
    () => budgets.find(b => b.type_budget === selectedBudgetType && b.annee === 2026),
    [budgets, selectedBudgetType]
  );

  // ── Répartition par statut ────────────────────────────────────────────────
  const statutSlices = useMemo(() => {
    const map: Record<string, number> = {};
    charges.forEach(c => { map[c.statut] = (map[c.statut] ?? 0) + 1; });
    const colors: Record<string, string> = {
      valide: '#10b981', en_cours: '#f59e0b', planifie: '#3b82f6', en_attente: '#94a3b8',
      litige: '#ef4444', clos: '#64748b', annule: '#cbd5e1', travaux: '#f97316',
      arbitrage: '#0ea5e9', etude: '#06b6d4',
    };
    return Object.entries(map).map(([k, v]) => ({ label: k, value: v, color: colors[k] ?? '#94a3b8' }));
  }, [charges]);

  // ── Responsable répartition ───────────────────────────────────────────────
  const respSlices = useMemo(() => [
    { label: 'Propriétaire', value: charges.filter(c => c.responsable === 'Propriétaire').length, color: '#2563eb' },
    { label: 'Gestionnaire', value: charges.filter(c => c.responsable === 'Gestionnaire').length, color: '#10b981' },
    { label: 'Partagé',      value: charges.filter(c => c.responsable === 'Partagé').length,      color: '#f59e0b' },
  ].filter(s => s.value > 0), [charges]);

  // ── Coûts par mois (2026) ─────────────────────────────────────────────────
  const coutsMois = useMemo(() => {
    const m: number[] = Array(5).fill(0);
    charges.forEach(c => {
      const d = c.date_declaration;
      if (!d) return;
      const mois = new Date(d).getMonth();
      if (mois < 5) m[mois] += c.cout_reel ?? c.cout_estime;
    });
    return m;
  }, [charges]);

  // ── Fluides — electricité résidence ──────────────────────────────────────
  const fluidElec = useMemo(
    () => fluides
      .filter(f => f.type_fluide === 'electricite' && f.annee === 2026)
      .sort((a, b) => a.mois - b.mois)
      .map(f => ({ mois: f.mois, valeur: f.cout_euros ?? 0 })),
    [fluides]
  );
  const fluidGaz = useMemo(
    () => fluides
      .filter(f => f.type_fluide === 'gaz' && f.annee === 2026)
      .sort((a, b) => a.mois - b.mois)
      .map(f => ({ mois: f.mois, valeur: f.cout_euros ?? 0 })),
    [fluides]
  );
  const alertesFluides = fluides.filter(f => f.alerte_seuil).length;
  const coutFluidesTotal = fluides.filter(f => f.annee === 2026).reduce((s, f) => s + (f.cout_euros ?? 0), 0);

  const MOIS_LABELS = ['Jan','Fév','Mar','Avr','Mai','Jun'];

  return (
    <div className="flex flex-col gap-4 pb-8">

      {/* ── Bandeau résidence ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Périmètre</p>
          <p className="text-base font-black text-slate-800">{residenceLabel || 'Toutes résidences'}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Source : BNS · SI Logement · Epona · OPERAT/OSFI</span>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Données 2026</span>
        </div>
      </div>

      {/* ── 4 KPI exécutifs ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Charges déclarées', value: charges.length, sub: `${nbValide} validées · ${nbEnAttente} en attente`, icon: FileText, iconColor: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Coût total estimé', value: fmtEur(totalEstime), sub: `Réel : ${fmtEur(totalReel)}`, icon: Euro, iconColor: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Litiges en cours', value: nbLitiges, sub: 'Désaccords de répartition', icon: AlertTriangle, iconColor: nbLitiges > 0 ? 'text-red-500' : 'text-slate-400', bg: nbLitiges > 0 ? 'bg-red-50' : 'bg-slate-50', border: nbLitiges > 0 ? 'border-red-200' : 'border-slate-100' },
          { label: 'Factures impayées', value: nbImpaye, sub: montantImpaye > 0 ? fmtEur(montantImpaye) : 'Aucun impayé', icon: Clock, iconColor: nbImpaye > 0 ? 'text-amber-500' : 'text-slate-400', bg: nbImpaye > 0 ? 'bg-amber-50' : 'bg-slate-50', border: nbImpaye > 0 ? 'border-amber-200' : 'border-slate-100' },
        ].map(({ label, value, sub, icon: Icon, iconColor, bg, border }, i) => (
          <div key={i} className={`rounded-2xl border ${border} ${bg} p-4 flex items-start gap-3`}>
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{label}</p>
              <p className="text-xl font-black text-slate-800 mt-0.5 leading-none">{value}</p>
              <p className="text-[11px] text-slate-500 mt-1 leading-snug">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Ligne 2 : Répartition + Budget + Fluides ─────────────────────── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Répartition des charges */}
        <div className="rounded-xl border border-slate-100 bg-white p-4">
          <p className="text-xs font-black text-slate-600 mb-3">Répartition des charges</p>
          <div className="flex items-center gap-4">
            <MiniDonut slices={respSlices} size={72} />
            <div className="flex flex-col gap-2 flex-1">
              {respSlices.map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-xs text-slate-600 flex-1">{s.label}</span>
                  <span className="text-xs font-bold text-slate-700">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-50 flex gap-3">
            <div className="flex-1 text-center">
              <p className="text-[10px] text-slate-400">% Propriétaire</p>
              <p className="text-lg font-black text-blue-600">{pctBailleur}%</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-[10px] text-slate-400">% Gestionnaire</p>
              <p className="text-lg font-black text-emerald-600">{pctGest}%</p>
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="rounded-xl border border-slate-100 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black text-slate-600">Budget 2026</p>
            <select value={selectedBudgetType} onChange={e => setSelectedBudgetType(e.target.value)}
              className="text-[10px] border border-slate-200 rounded px-1.5 py-1 bg-white focus:outline-none">
              <option value="maintenance">Maintenance</option>
              <option value="energie">Énergie</option>
              <option value="travaux">Travaux</option>
            </select>
          </div>
          {budgetActuel ? (
            <>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <p className="text-[10px] text-slate-400">Initial</p>
                  <p className="text-sm font-black text-slate-700">{fmtEur(budgetActuel.montant_initial)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Consommé</p>
                  <p className={`text-sm font-black ${budgetActuel.montant_consomme > budgetActuel.montant_initial ? 'text-red-600' : 'text-slate-700'}`}>
                    {fmtEur(budgetActuel.montant_consomme)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Engagé</p>
                  <p className="text-sm font-black text-amber-600">{fmtEur(budgetActuel.montant_engage)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Restant</p>
                  <p className={`text-sm font-black ${budgetActuel.montant_initial - budgetActuel.montant_consomme - budgetActuel.montant_engage < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {fmtEur(Math.max(0, budgetActuel.montant_initial - budgetActuel.montant_consomme - budgetActuel.montant_engage))}
                  </p>
                </div>
              </div>
              <BudgetBar consomme={budgetActuel.montant_consomme} initial={budgetActuel.montant_initial} engage={budgetActuel.montant_engage} />
              <p className="text-[10px] text-slate-400 mt-1.5">Source : {budgetActuel.source_systeme}</p>
            </>
          ) : (
            <p className="text-xs text-slate-400 mt-4">Aucun budget saisi pour ce périmètre</p>
          )}
        </div>

        {/* Fluides */}
        <div className="rounded-xl border border-slate-100 bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-black text-slate-600">Fluides 2026</p>
            {alertesFluides > 0 && (
              <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                {alertesFluides} alertes
              </span>
            )}
          </div>
          <p className="text-lg font-black text-slate-800 mb-1">{fmtEur(coutFluidesTotal)}</p>
          <p className="text-[10px] text-slate-400 mb-2">Coût fluides cumulé — Source : OPERAT/OSFI</p>
          {fluidElec.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Zap className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] font-bold text-slate-500">Électricité (€/mois)</span>
              </div>
              <FluidLineChart data={fluidElec} color="#f59e0b" />
            </div>
          )}
          {fluidGaz.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <TrendingUp className="w-3 h-3 text-blue-500" />
                <span className="text-[10px] font-bold text-slate-500">Gaz (€/mois)</span>
              </div>
              <FluidLineChart data={fluidGaz} color="#3b82f6" />
            </div>
          )}
        </div>
      </div>

      {/* ── Évolution mensuelle des coûts ─────────────────────────────────── */}
      <div className="rounded-xl border border-slate-100 bg-white p-4">
        <p className="text-xs font-black text-slate-600 mb-3">Évolution mensuelle des charges déclarées — 2026</p>
        <div className="flex items-end gap-3">
          <BarChart data={coutsMois} color="#3b82f6" label="Coût total (€)" />
          <div className="flex-1">
            <div className="grid grid-cols-5 gap-1">
              {MOIS_LABELS.slice(0, 5).map((m, i) => (
                <div key={m} className="text-center">
                  <p className="text-[10px] font-bold text-slate-700">{fmtEur(coutsMois[i])}</p>
                  <p className="text-[10px] text-slate-400">{m}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tableau récent + Statuts ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">

        {/* 5 dernières charges */}
        <div className="rounded-xl border border-slate-100 bg-white p-4">
          <p className="text-xs font-black text-slate-600 mb-3">Dernières charges déclarées</p>
          <div className="space-y-2">
            {[...charges].sort((a, b) => b.date_declaration.localeCompare(a.date_declaration)).slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{c.type_charge}</p>
                  <p className="text-[10px] text-slate-400">{c.reference} · {new Date(c.date_declaration).toLocaleDateString('fr-FR')}</p>
                </div>
                <ResponsableChip responsable={c.responsable} />
                <p className="text-xs font-bold text-slate-600 flex-shrink-0">{fmtEur(c.cout_reel ?? c.cout_estime)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition par statut + factures */}
        <div className="rounded-xl border border-slate-100 bg-white p-4">
          <p className="text-xs font-black text-slate-600 mb-3">État des charges</p>
          <div className="flex items-start gap-4">
            <MiniDonut slices={statutSlices} size={64} />
            <div className="flex flex-col gap-1.5 flex-1">
              {Object.entries(STATUT_CHARGE_CFG)
                .filter(([k]) => statutSlices.some(s => s.label === k))
                .map(([k, c]) => {
                  const count = charges.filter(ch => ch.statut === k).length;
                  return (
                    <div key={k} className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
                      <span className="text-[11px] text-slate-600 flex-1">{c.label}</span>
                      <span className="text-[11px] font-bold text-slate-700">{count}</span>
                    </div>
                  );
                })}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-50">
            <p className="text-xs font-black text-slate-600 mb-2">Facturation</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[11px] text-slate-600">Payées</span>
                <span className="ml-auto text-[11px] font-bold text-emerald-600">{factures.filter(f => f.statut === 'paye').length}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[11px] text-slate-600">Impayées</span>
                <span className="ml-auto text-[11px] font-bold text-red-600">{nbImpaye}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[11px] text-slate-600">En cours</span>
                <span className="ml-auto text-[11px] font-bold text-blue-600">{factures.filter(f => f.statut === 'facture').length}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-600">Total</span>
                <span className="ml-auto text-[11px] font-bold text-slate-600">{nbFactures}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
