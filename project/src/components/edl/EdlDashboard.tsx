import React from 'react';
import {
  ClipboardCheck, ClipboardX, Clock, AlertTriangle, TrendingUp, Users,
  Search, Zap, CheckCircle2, Euro, CalendarClock,
} from 'lucide-react';
import { EdlRecord, EDL_CFG, PreEdlRecord, PRE_EDL_CFG, preEdlTotal, DEMO_PRE_EDL } from './edlTypes';

interface Props {
  records: EdlRecord[];
  preEdlRecords?: PreEdlRecord[];
  loading: boolean;
  onOpenPreEdl?: (r: PreEdlRecord) => void;
  onCreatePreEdl?: () => void;
}

export default function EdlDashboard({ records, preEdlRecords = DEMO_PRE_EDL, loading, onOpenPreEdl, onCreatePreEdl }: Props) {
  const entrants = records.filter(r => r.type === 'entrant');
  const sortants = records.filter(r => r.type === 'sortant');

  const entrantsARealiser = entrants.filter(r => r.statut === 'a_realiser').length;
  const entrantsRealises  = entrants.filter(r => r.statut === 'realise').length;
  const sortantsARealiser = sortants.filter(r => r.statut === 'a_realiser').length;
  const sortantsRealises  = sortants.filter(r => r.statut === 'realise').length;

  const totalARealiser   = records.filter(r => r.statut === 'a_realiser').length;
  const totalRealises    = records.filter(r => r.statut === 'realise').length;
  const totalRecords     = records.filter(r => r.statut !== 'non_applicable').length;
  const tauxRealisation  = totalRecords > 0 ? Math.round((totalRealises / totalRecords) * 100) : 0;

  // Pre-EDL stats
  const preEdlPrevus    = preEdlRecords.filter(r => r.statut !== 'clos').length;
  const preEdlRealises  = preEdlRecords.filter(r => r.statut === 'clos').length;
  const preEdlEnRetard  = preEdlRecords.filter(r => {
    if (r.statut === 'clos') return false;
    if (!r.date_sortie_prevue) return false;
    const sortie = new Date(r.date_sortie_prevue);
    const diff = (sortie.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff < 14 && r.statut === 'cree';
  }).length;
  const coutMoyen       = preEdlRecords.filter(r => r.statut === 'clos' && preEdlTotal(r) > 0).reduce((acc, r, _, arr) => acc + preEdlTotal(r) / arr.length, 0);
  const montantTotal    = preEdlRecords.reduce((acc, r) => acc + preEdlTotal(r), 0);

  // Prefill quality stats (simulated)
  const edlAujourdhui    = 3;
  const edlPreRemplis    = 3;
  const tauxPreRemplissage = 100;
  const echecsSiLogement = 0;
  const echecsPatrimoine = 0;

  const recent = [...records]
    .filter(r => r.statut === 'realise' && r.date)
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
    .slice(0, 5);

  const aRealiserList = records.filter(r => r.statut === 'a_realiser').slice(0, 6);

  const activePreEdl = preEdlRecords.filter(r => r.statut !== 'clos').slice(0, 5);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Row 1: main KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total EDL"          value={records.length}       icon={<Users className="w-5 h-5 text-blue-600" />}         bg="bg-blue-50"    border="border-blue-100" />
        <KpiCard label="À réaliser"          value={totalARealiser}       icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} bg="bg-amber-50"   border="border-amber-100"   valueColor="text-amber-600" />
        <KpiCard label="Réalisés"            value={totalRealises}        icon={<ClipboardCheck className="w-5 h-5 text-emerald-600" />} bg="bg-emerald-50" border="border-emerald-100" valueColor="text-emerald-600" />
        <KpiCard label="Taux de réalisation" value={`${tauxRealisation}%`} icon={<TrendingUp className="w-5 h-5 text-blue-600" />}   bg="bg-blue-50"    border="border-blue-100" />
      </div>

      {/* Row 2: Pre-EDL KPIs */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CalendarClock className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-bold text-slate-700">Activité Pré-EDL</h2>
          <button
            onClick={onCreatePreEdl}
            className="ml-auto text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg hover:bg-amber-100 transition-colors"
          >
            + Créer un Pré-EDL
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <KpiCard label="Pré-EDL prévus"             value={preEdlPrevus}                   icon={<Clock className="w-4 h-4 text-amber-600" />}       bg="bg-amber-50"   border="border-amber-100"   valueColor="text-amber-700" />
          <KpiCard label="Pré-EDL réalisés"           value={preEdlRealises}                 icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />} bg="bg-emerald-50" border="border-emerald-100" valueColor="text-emerald-700" />
          <KpiCard label="En retard"                  value={preEdlEnRetard}                 icon={<AlertTriangle className="w-4 h-4 text-red-500" />}   bg="bg-red-50"     border="border-red-100"     valueColor="text-red-600" />
          <KpiCard label="Coût moyen estimé"          value={coutMoyen > 0 ? `${Math.round(coutMoyen)} €` : '—'} icon={<Euro className="w-4 h-4 text-slate-500" />}       bg="bg-slate-50"   border="border-slate-200" />
          <KpiCard label="Montant prévisionnel total" value={montantTotal > 0 ? `${montantTotal.toLocaleString('fr-FR')} €` : '—'} icon={<Euro className="w-4 h-4 text-red-500" />} bg="bg-red-50" border="border-red-100" valueColor="text-red-600" />
        </div>
      </div>

      {/* Row 3: Entrants / Sortants split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SplitCard title="EDL Entrants" icon={<ClipboardCheck className="w-4 h-4 text-blue-600" />}   aRealiser={entrantsARealiser} realises={entrantsRealises} total={entrants.length} color="blue" />
        <SplitCard title="EDL Sortants" icon={<ClipboardX    className="w-4 h-4 text-orange-500" />} aRealiser={sortantsARealiser} realises={sortantsRealises} total={sortants.length} color="orange" />
      </div>

      {/* Row 4: Pre-EDL en cours + qualité pré-remplissage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active pre-EDL */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-amber-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-amber-100 flex items-center gap-2 bg-amber-50">
            <CalendarClock className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">Pré-EDL en cours</span>
            <span className="ml-auto text-xs font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">{activePreEdl.length}</span>
          </div>
          {activePreEdl.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-300" />
              <p className="text-sm text-slate-400">Aucun Pré-EDL en cours</p>
            </div>
          ) : (
            <ul className="divide-y divide-amber-50">
              {activePreEdl.map(r => {
                const cfg = PRE_EDL_CFG[r.statut];
                const total = preEdlTotal(r);
                return (
                  <li
                    key={r.id}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 transition-colors cursor-pointer"
                    onClick={() => onOpenPreEdl?.(r)}
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 flex-shrink-0">
                      {r.prenom[0]}{r.nom[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{r.prenom} {r.nom}</p>
                      <p className="text-xs text-slate-400 truncate">{r.logement_numero} — {r.residence_nom}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {total > 0 && <p className="text-xs font-bold text-red-600">{total.toLocaleString('fr-FR')} €</p>}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>{cfg.label}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Pre-fill quality widget */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-700">Qualité du pré-remplissage</span>
          </div>
          <div className="p-4 space-y-3">
            <QualityRow label="EDL créés aujourd'hui"          value={edlAujourdhui}       />
            <QualityRow label="EDL pré-remplis auto."          value={edlPreRemplis}        suffix="/" max={edlAujourdhui} />
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Taux de pré-remplissage</span>
                <span className="font-bold text-emerald-600">{tauxPreRemplissage}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${tauxPreRemplissage}%` }} />
              </div>
            </div>
            <div className="pt-1 border-t border-slate-100 space-y-1.5">
              <QualityRow label="Échecs SI Logement"   value={echecsSiLogement} isError={echecsSiLogement > 0} />
              <QualityRow label="Échecs Patrimoine"    value={echecsPatrimoine} isError={echecsPatrimoine > 0} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 5: À réaliser + récents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-slate-700">EDL à réaliser</span>
            {totalARealiser > 0 && (
              <span className="ml-auto text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{totalARealiser}</span>
            )}
          </div>
          {aRealiserList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <ClipboardCheck className="w-8 h-8 text-emerald-300" />
              <p className="text-sm text-slate-400">Aucun EDL en attente</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {aRealiserList.map(r => (
                <li key={`${r.occupant_id}-${r.type}`} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                    {r.prenom[0]}{r.nom[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{r.prenom} {r.nom}</p>
                    <p className="text-xs text-slate-400 truncate">{r.logement_numero} — {r.residence_nom}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${r.type === 'entrant' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                    {r.type === 'entrant' ? 'Entrée' : 'Sortie'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-700">EDL récemment réalisés</span>
          </div>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <ClipboardX className="w-8 h-8 text-slate-200" />
              <p className="text-sm text-slate-400">Aucun EDL réalisé</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {recent.map(r => (
                <li key={`${r.occupant_id}-${r.type}`} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700 flex-shrink-0">
                    {r.prenom[0]}{r.nom[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{r.prenom} {r.nom}</p>
                    <p className="text-xs text-slate-400 truncate">{r.logement_numero} — {r.residence_nom}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-slate-500">{r.date ? new Date(r.date).toLocaleDateString('fr-FR') : '—'}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${r.type === 'entrant' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                      {r.type === 'entrant' ? 'Entrée' : 'Sortie'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, bg, border, valueColor = 'text-slate-800' }: {
  label: string; value: string | number; icon: React.ReactNode;
  bg: string; border: string; valueColor?: string;
}) {
  return (
    <div className={`${bg} border ${border} rounded-xl p-4 flex items-center gap-3`}>
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-slate-500 font-medium leading-tight">{label}</p>
        <p className={`text-2xl font-bold ${valueColor} leading-tight`}>{value}</p>
      </div>
    </div>
  );
}

function SplitCard({ title, icon, aRealiser, realises, total, color }: {
  title: string; icon: React.ReactNode;
  aRealiser: number; realises: number; total: number; color: 'blue' | 'orange';
}) {
  const pct = total > 0 ? Math.round((realises / total) * 100) : 0;
  const barColor = color === 'blue' ? 'bg-blue-500' : 'bg-orange-500';
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-semibold text-slate-700">{title}</span>
        <span className="ml-auto text-xs text-slate-400">{total} au total</span>
      </div>
      <div className="flex gap-4">
        <div className="text-center">
          <p className="text-xl font-bold text-amber-600">{aRealiser}</p>
          <p className="text-xs text-slate-400">À réaliser</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-emerald-600">{realises}</p>
          <p className="text-xs text-slate-400">Réalisés</p>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Taux</span>
            <span className="font-semibold">{pct}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function QualityRow({ label, value, suffix, max, isError }: {
  label: string; value: number; suffix?: string; max?: number; isError?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className={`font-bold ${isError ? 'text-red-600' : 'text-slate-700'}`}>
        {value}{suffix}{max !== undefined ? max : ''}
      </span>
    </div>
  );
}
