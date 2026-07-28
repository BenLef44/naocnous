import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import {
  AccordionSection, SubAccordion, DonutChart, LineChart, MiniSelect,
} from './reglementaire/dashboardCharts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Evenement {
  id: string;
  type_evenement: string;
  libelle: string;
  est_panne: boolean;
  rend_indisponible: boolean;
  taux_indisponibilite: number;
  date_debut_reel: string | null;
  date_fin_reel: string | null;
  cout_intervention: number | null;
  gravite: string;
  impact_service: string;
  prestataire: string | null;
  responsable: string | null;
}

interface ScoreRenouvellement {
  score_patrimonial: number;
  score_exploitation: number;
  score_risque: number;
  score_global: number;
  niveau: string;
  duree_vie_theorique: number | null;
  annee_previsionnelle: number | null;
  capex_estime: number | null;
  notes: string | null;
}

interface EquipProps {
  equipement_id: string;
  date_mise_en_service: string | null;
  designation: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dureeHeures(debut: string | null, fin: string | null): number {
  if (!debut || !fin) return 0;
  return Math.max(0, (new Date(fin).getTime() - new Date(debut).getTime()) / 3_600_000);
}

function ageAns(d?: string | null): number {
  if (!d) return 0;
  return Math.max(0, (Date.now() - new Date(d).getTime()) / (365.25 * 86_400_000));
}

function pctDureeVie(age: number, dureeVie: number | null): number {
  if (!dureeVie || dureeVie === 0) return 0;
  return Math.min(100, Math.round((age / dureeVie) * 100));
}

const niveauCfg: Record<string, { label: string; color: string; bg: string; border: string }> = {
  bon_etat:                { label: 'Bon état',                  color: '#10b981', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  surveillance:            { label: 'Surveillance',              color: '#3b82f6', bg: 'bg-blue-50',    border: 'border-blue-200'    },
  risque_eleve:            { label: 'Risque élevé',              color: '#f59e0b', bg: 'bg-amber-50',   border: 'border-amber-200'   },
  remplacement_prioritaire:{ label: 'Remplacement prioritaire',  color: '#ef4444', bg: 'bg-red-50',     border: 'border-red-200'     },
};

// ─── Score jauge SVG ──────────────────────────────────────────────────────────

function GaugeScore({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 52, cx = 70, cy = 70;
  const start = Math.PI * 0.8, end = Math.PI * 2.2;
  const sweep = end - start;
  const angle = start + (Math.max(0, Math.min(100, value)) / 100) * sweep;
  const px = cx + r * Math.cos(angle), py = cy + r * Math.sin(angle);
  const ax1 = cx + r * Math.cos(start), ay1 = cy + r * Math.sin(start);
  const ax2 = cx + r * Math.cos(end),   ay2 = cy + r * Math.sin(end);
  const vx1 = ax1, vy1 = ay1;
  const vx2 = cx + r * Math.cos(angle), vy2 = cy + r * Math.sin(angle);
  const hasSweep = (value / 100) * sweep > Math.PI ? 1 : 0;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 140 100" className="w-28 h-20">
        <path d={`M ${ax1} ${ay1} A ${r} ${r} 0 1 1 ${ax2} ${ay2}`} fill="none" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
        {value > 0 && (
          <path d={`M ${vx1} ${vy1} A ${r} ${r} 0 ${hasSweep} 1 ${vx2} ${vy2}`}
            fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
        )}
        <circle cx={px} cy={py} r="6" fill={color} stroke="white" strokeWidth="2" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="22" fontWeight="900" fill="#1e293b">{value}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="8" fill="#94a3b8">/100</text>
      </svg>
      <span className="text-[11px] font-semibold text-slate-500 text-center leading-tight">{label}</span>
    </div>
  );
}

function KpiSimple({ label, value, sub, accent = false }: { label: string; value: React.ReactNode; sub?: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 flex flex-col gap-0.5 ${accent ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{label}</span>
      <span className={`text-xl font-black leading-none mt-0.5 ${accent ? 'text-red-600' : 'text-slate-800'}`}>{value}</span>
      {sub && <span className="text-[11px] text-slate-400 leading-snug mt-0.5">{sub}</span>}
    </div>
  );
}

function ProgressBar({ value, max = 100, color = '#3b82f6', label }: { value: number; max?: number; color?: string; label?: string }) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-slate-500 w-24 flex-shrink-0 truncate">{label}</span>}
      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-bold text-slate-600 w-10 text-right flex-shrink-0">{pct}%</span>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function OngletRenouvellement({ equipement_id, date_mise_en_service: dateProp, designation }: EquipProps) {
  const [evenements,    setEvenements]   = useState<Evenement[]>([]);
  const [score,         setScore]        = useState<ScoreRenouvellement | null>(null);
  const [dateService,   setDateService]  = useState<string | null>(dateProp);
  const [loading,       setLoading]      = useState(true);

  const [ventilationCritA, setVentilationCritA] = useState('type');
  const [ventilationCritB, setVentilationCritB] = useState('gravite');
  const [evolutionCritA,   setEvolutionCritA]   = useState('pannes');
  const [evolutionCritB,   setEvolutionCritB]   = useState('couts');
  const [tooltipA, setTooltipA] = useState<{ x: number; y: number; label: string; value: number; statut: string } | null>(null);
  const [tooltipB, setTooltipB] = useState<{ x: number; y: number; label: string; value: number; statut: string } | null>(null);
  const [visA, setVisA] = useState(new Set(['pannes']));
  const [visB, setVisB] = useState(new Set(['couts']));

  useEffect(() => {
    Promise.all([
      supabase.from('evenements').select('*').eq('equipement_id', equipement_id).order('date_debut_reel'),
      supabase.from('scores_renouvellement').select('*').eq('equipement_id', equipement_id).maybeSingle(),
      supabase.from('equipements').select('date_mise_en_service').eq('id', equipement_id).maybeSingle(),
    ]).then(([evRes, scRes, eqRes]) => {
      setEvenements(evRes.data ?? []);
      setScore(scRes.data);
      // Priorité : date DB > prop passée
      setDateService(eqRes.data?.date_mise_en_service ?? dateProp);
      setLoading(false);
    });
  }, [equipement_id]);

  // ─── Calculs ────────────────────────────────────────────────────────────────

  const pannes      = useMemo(() => evenements.filter(e => e.est_panne), [evenements]);
  const maintenances = useMemo(() => evenements.filter(e => !e.est_panne), [evenements]);

  const age      = ageAns(dateService);
  const ageLabel = age >= 1 ? `${Math.round(age)} ans` : `${Math.round(age * 12)} mois`;

  const totalArretH = useMemo(() =>
    pannes.reduce((s, e) => s + dureeHeures(e.date_debut_reel, e.date_fin_reel), 0), [pannes]);

  const coutTotal = useMemo(() =>
    evenements.reduce((s, e) => s + (e.cout_intervention ?? 0), 0), [evenements]);

  const coutMoyAn = age > 0.5 ? Math.round(coutTotal / age) : 0;

  // Calcul MTBF sur la période couverte par les événements
  const premiereDate = evenements[0]?.date_debut_reel;
  const ANNEES = premiereDate
    ? Math.max(1, (Date.now() - new Date(premiereDate).getTime()) / (365.25 * 86_400_000))
    : Math.max(1, age);
  const heuresDispos = ANNEES * 365.25 * 24;
  const mtbf = pannes.length > 0 ? Math.round(heuresDispos / pannes.length) : 0;
  const mttr = pannes.length > 0 ? Math.round(totalArretH / pannes.length) : 0;
  const tauxDispo = Math.max(0, Math.round(((heuresDispos - totalArretH) / heuresDispos) * 1000) / 10);

  const dureeVie = score?.duree_vie_theorique ?? null;
  const pctAge   = pctDureeVie(age, dureeVie);

  // Données par année pour les graphiques (années couvertes par l'historique)
  const currentYear = new Date().getFullYear();
  const startYear   = Math.max(currentYear - 4, premiereDate ? new Date(premiereDate).getFullYear() : currentYear - 4);
  const anneesRange = Array.from({ length: currentYear - startYear }, (_, i) => startYear + i);
  const anneesData  = anneesRange.map(y => {
    const ev   = evenements.filter(e => e.date_debut_reel && new Date(e.date_debut_reel).getFullYear() === y);
    const p    = ev.filter(e => e.est_panne);
    const cout = ev.reduce((s, e) => s + (e.cout_intervention ?? 0), 0);
    const arrH = p.reduce((s, e) => s + dureeHeures(e.date_debut_reel, e.date_fin_reel), 0);
    return { label: `${y}`, shortLabel: `${y}`, pannes: p.length, couts: Math.round(cout), arret: Math.round(arrH) };
  });

  // Donuts
  function buildDonut(crit: string): { label: string; value: number; color: string }[] {
    const COLORS = ['#ef4444','#f59e0b','#3b82f6','#10b981','#8b5cf6','#64748b'];
    if (crit === 'type') {
      const map: Record<string, number> = {};
      evenements.forEach(e => { map[e.type_evenement] = (map[e.type_evenement] ?? 0) + 1; });
      const labels: Record<string, string> = {
        panne: 'Panne', maintenance_preventive: 'Maint. préventive',
        maintenance_corrective: 'Maint. corrective', incident: 'Incident', inspection: 'Inspection',
      };
      return Object.entries(map).map(([k, v], i) => ({ label: labels[k] ?? k, value: v, color: COLORS[i % COLORS.length] }));
    }
    if (crit === 'gravite') {
      const map: Record<string, number> = {};
      evenements.forEach(e => { map[e.gravite] = (map[e.gravite] ?? 0) + 1; });
      const order = ['critique','majeure','mineure'];
      const cols  = ['#ef4444','#f59e0b','#10b981'];
      return order.map((k, i) => ({ label: k.charAt(0).toUpperCase() + k.slice(1), value: map[k] ?? 0, color: cols[i] })).filter(s => s.value > 0);
    }
    if (crit === 'impact') {
      const map: Record<string, number> = {};
      evenements.forEach(e => { map[e.impact_service] = (map[e.impact_service] ?? 0) + 1; });
      const order = ['critique','fort','moyen','faible'];
      const cols  = ['#ef4444','#f97316','#f59e0b','#10b981'];
      return order.map((k, i) => ({ label: k.charAt(0).toUpperCase() + k.slice(1), value: map[k] ?? 0, color: cols[i] })).filter(s => s.value > 0);
    }
    if (crit === 'prest') {
      const map: Record<string, number> = {};
      evenements.forEach(e => { const key = e.prestataire ?? 'Interne'; map[key] = (map[key] ?? 0) + 1; });
      return Object.entries(map).map(([k, v], i) => ({ label: k, value: v, color: COLORS[i % COLORS.length] }));
    }
    return [];
  }

  const niveau = score?.niveau ?? 'surveillance';
  const nvCfg  = niveauCfg[niveau] ?? niveauCfg.surveillance;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm gap-2">
        <div className="w-4 h-4 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
        Chargement des données…
      </div>
    );
  }

  const ventilOpts  = [{ value: 'type', label: 'Type événement' }, { value: 'gravite', label: 'Gravité' }, { value: 'impact', label: 'Impact service' }];
  const ventilOptsB = [{ value: 'gravite', label: 'Gravité' }, { value: 'impact', label: 'Impact service' }, { value: 'prest', label: 'Prestataire' }];
  const evolutionOpts = [{ value: 'pannes', label: 'Pannes / an' }, { value: 'couts', label: 'Coûts (€)' }, { value: 'arret', label: 'Arrêt cumulé (h)' }];
  const lineStatutCfg = { pannes: { color: '#ef4444', label: 'Pannes' }, couts: { color: '#f59e0b', label: 'Coûts (€)' }, arret: { color: '#3b82f6', label: 'Arrêt (h)' } };

  return (
    <div className="flex flex-col gap-4 pb-6">

      {/* Bandeau score global */}
      <div className={`rounded-2xl border ${nvCfg.border} ${nvCfg.bg} p-4 flex items-center justify-between gap-4 flex-wrap`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-sm"
            style={{ background: nvCfg.color }}>
            {score?.score_global ?? '—'}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: nvCfg.color }}>Indice de renouvellement</p>
            <p className="text-lg font-black text-slate-800">{nvCfg.label}</p>
            {score?.notes && (
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-lg leading-snug">{score.notes.slice(0, 120)}{score.notes.length > 120 ? '…' : ''}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-6 flex-shrink-0">
          <GaugeScore value={score?.score_patrimonial ?? 0} label="Patrimoine"  color="#3b82f6" />
          <GaugeScore value={score?.score_exploitation ?? 0} label="Exploitation" color="#f59e0b" />
          <GaugeScore value={score?.score_risque ?? 0}       label="Risque"       color="#ef4444" />
        </div>
      </div>

      {/* 1. État & Vétusté patrimoniale */}
      <AccordionSection title="1 — État & Vétusté patrimoniale" subtitle="Âge, durée de vie, obsolescence" accentColor="bg-blue-500" defaultOpen={true}>
        <SubAccordion title="Indicateurs principaux" accentColor="bg-blue-400" defaultOpen={true}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <KpiSimple label="Âge équipement" value={ageLabel}
              sub={dateService ? `Mis en service le ${new Date(dateService).toLocaleDateString('fr-FR')}` : 'Date non renseignée'} />
            <KpiSimple label="% durée de vie" value={pctAge > 0 ? `${pctAge}%` : '—'}
              sub={dureeVie ? `Durée théorique : ${dureeVie} ans` : 'Non renseigné'}
              accent={pctAge >= 100} />
            <KpiSimple label="Année remplacement" value={score?.annee_previsionnelle ?? '—'}
              sub={score?.capex_estime ? `CAPEX estimé : ${score.capex_estime.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €` : 'CAPEX non renseigné'} />
            <KpiSimple label="Score patrimonial" value={score ? `${score.score_patrimonial}/100` : '—'}
              sub="Vétusté + âge + obsolescence"
              accent={(score?.score_patrimonial ?? 0) >= 70} />
          </div>
          {dureeVie && age > 0 && (
            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Avancement durée de vie</p>
              <ProgressBar
                value={Math.round(age)} max={dureeVie}
                color={pctAge >= 100 ? '#ef4444' : pctAge >= 80 ? '#f59e0b' : '#3b82f6'}
                label={`${Math.round(age)} / ${dureeVie} ans`}
              />
              <p className="text-[11px] text-slate-400">
                Durée résiduelle estimée :{' '}
                <span className="font-semibold text-slate-600">
                  {Math.max(0, dureeVie - Math.round(age))} ans
                  {score?.annee_previsionnelle ? ` (jusqu'en ${score.annee_previsionnelle})` : ''}
                </span>
              </p>
            </div>
          )}
        </SubAccordion>

        <SubAccordion title="Ventilation événements" accentColor="bg-blue-300" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-4">
            <DonutChart title="Répartition par type" slices={buildDonut(ventilationCritA)}
              selectOptions={ventilOpts} selectedOption={ventilationCritA} onOptionChange={setVentilationCritA}
              centerTotal={evenements.length} />
            <DonutChart title="Répartition gravité / impact" slices={buildDonut(ventilationCritB)}
              selectOptions={ventilOptsB} selectedOption={ventilationCritB} onOptionChange={setVentilationCritB}
              centerTotal={evenements.length} />
          </div>
        </SubAccordion>

        <SubAccordion title="Évolution annuelle" accentColor="bg-blue-200" defaultOpen={false}>
          {anneesData.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <MiniSelect value={evolutionCritA} options={evolutionOpts}
                  onChange={v => { setEvolutionCritA(v); setVisA(new Set([v])); }} />
                <LineChart data={anneesData} statutConfig={lineStatutCfg}
                  visibleStatuts={visA}
                  onToggleStatut={s => setVisA(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; })}
                  tooltip={tooltipA} onHover={setTooltipA} />
              </div>
              <div>
                <MiniSelect value={evolutionCritB} options={evolutionOpts}
                  onChange={v => { setEvolutionCritB(v); setVisB(new Set([v])); }} />
                <LineChart data={anneesData} statutConfig={lineStatutCfg}
                  visibleStatuts={visB}
                  onToggleStatut={s => setVisB(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; })}
                  tooltip={tooltipB} onHover={setTooltipB} />
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-6">Pas d'historique suffisant pour afficher l'évolution</p>
          )}
        </SubAccordion>
      </AccordionSection>

      {/* 2. Performance Exploitation & Maintenance */}
      <AccordionSection title="2 — Performance exploitation & maintenance" subtitle="Fiabilité, coûts, disponibilité" accentColor="bg-amber-500" defaultOpen={true}>
        <SubAccordion title="Indicateurs principaux" accentColor="bg-amber-400" defaultOpen={true}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <KpiSimple label="Nombre de pannes" value={pannes.length}
              sub={`Sur ${Math.round(ANNEES)} ans d'historique`}
              accent={pannes.length >= 4} />
            <KpiSimple label="MTBF" value={mtbf > 0 ? `${mtbf}h` : '—'}
              sub="Temps moyen entre pannes" />
            <KpiSimple label="MTTR" value={mttr > 0 ? `${mttr}h` : '—'}
              sub="Temps moyen de réparation" />
            <KpiSimple label="Taux disponibilité" value={`${tauxDispo}%`}
              sub={`Arrêt cumulé : ${Math.round(totalArretH)}h`}
              accent={tauxDispo < 97} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <KpiSimple label="Coût total maintenance" value={`${Math.round(coutTotal).toLocaleString('fr-FR')} €`}
              sub={`Depuis ${Math.round(2026 - ANNEES)}`} />
            <KpiSimple label="Coût moyen / an" value={`${coutMoyAn.toLocaleString('fr-FR')} €`}
              sub="Maintenance + réparations" />
            <KpiSimple label="Score exploitation" value={score ? `${score.score_exploitation}/100` : '—'}
              sub="Fiabilité + coût + disponibilité"
              accent={(score?.score_exploitation ?? 0) >= 70} />
          </div>
          <div className="bg-slate-50 rounded-xl p-3 mt-3 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Disponibilité sur la période</p>
            <ProgressBar
              value={tauxDispo} max={100}
              color={tauxDispo < 97 ? '#ef4444' : tauxDispo < 99 ? '#f59e0b' : '#10b981'}
              label={`${tauxDispo}%`}
            />
            {score?.capex_estime && coutMoyAn > 0 && (
              <p className="text-[11px] text-slate-400">
                Ratio maint/remplacement estimé :{' '}
                <span className="font-semibold text-slate-600">
                  {Math.round((coutMoyAn / score.capex_estime) * 100)}% du CAPEX / an
                </span>
                {coutMoyAn / score.capex_estime > 0.1
                  ? <span className="ml-1 text-red-500 font-bold">— Seuil critique &gt;10%</span>
                  : null}
              </p>
            )}
          </div>

          {/* Historique pannes */}
          {pannes.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Historique pannes</p>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {pannes.slice().reverse().map(e => {
                  const duree = dureeHeures(e.date_debut_reel, e.date_fin_reel);
                  const gravCols: Record<string, string> = {
                    critique: 'bg-red-100 text-red-700 border-red-200',
                    majeure:  'bg-amber-100 text-amber-700 border-amber-200',
                    mineure:  'bg-slate-100 text-slate-600 border-slate-200',
                  };
                  return (
                    <div key={e.id} className="flex items-start gap-2.5 px-3 py-2 bg-white border border-slate-100 rounded-xl text-xs hover:border-slate-200 transition-colors">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md border text-[10px] font-bold flex-shrink-0 ${gravCols[e.gravite] ?? gravCols.mineure}`}>
                        {e.gravite}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-700 truncate">{e.libelle}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {e.date_debut_reel ? new Date(e.date_debut_reel).toLocaleDateString('fr-FR') : '—'}
                          {duree > 0 ? ` · ${Math.round(duree)}h d'arrêt` : ''}
                          {e.cout_intervention ? ` · ${Math.round(e.cout_intervention).toLocaleString('fr-FR')} €` : ''}
                          {e.prestataire ? ` · ${e.prestataire}` : ''}
                        </p>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0
                        ${e.taux_indisponibilite >= 80 ? 'bg-red-100 text-red-600' : e.taux_indisponibilite >= 40 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                        {e.taux_indisponibilite}% indispo
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </SubAccordion>

        <SubAccordion title="Ventilation pannes" accentColor="bg-amber-300" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-4">
            <DonutChart title="Pannes par gravité" slices={buildDonut('gravite')} centerTotal={pannes.length} />
            <DonutChart title="Pannes par impact service" slices={buildDonut('impact')} centerTotal={pannes.length} />
          </div>
        </SubAccordion>
      </AccordionSection>

      {/* 3. Risque & Conformité */}
      <AccordionSection title="3 — Risque & conformité" subtitle="Sécurité, réglementaire, impact occupants" accentColor="bg-red-500" defaultOpen={true}>
        <SubAccordion title="Indicateurs principaux" accentColor="bg-red-400" defaultOpen={true}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <KpiSimple label="Score risque global" value={score ? `${score.score_risque}/100` : '—'} sub="Pondération 40%" accent={(score?.score_risque ?? 0) >= 75} />
            <KpiSimple label="Pannes critiques" value={pannes.filter(e => e.gravite === 'critique').length}
              sub="Impact sécurité/service" accent={pannes.filter(e => e.gravite === 'critique').length >= 2} />
            <KpiSimple label="Impact occupants fort" value={pannes.filter(e => ['fort','critique'].includes(e.impact_service)).length}
              sub="Pannes forte perturbation" accent={pannes.filter(e => ['fort','critique'].includes(e.impact_service)).length >= 2} />
            <KpiSimple label="Taux indisponibilité moy." value={pannes.length > 0
              ? `${Math.round(pannes.reduce((s, e) => s + e.taux_indisponibilite, 0) / pannes.length)}%`
              : '—'}
              sub="Sur les pannes recensées" />
          </div>
          {score && (
            <div className={`rounded-xl border ${nvCfg.border} ${nvCfg.bg} p-3 flex items-start gap-3`}>
              <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ background: nvCfg.color }} />
              <div>
                <p className="text-xs font-bold" style={{ color: nvCfg.color }}>Recommandation : {nvCfg.label}</p>
                {score.annee_previsionnelle && (
                  <p className="text-xs text-slate-600 mt-0.5">
                    Renouvellement prévu en <span className="font-bold">{score.annee_previsionnelle}</span>
                    {score.capex_estime ? ` — CAPEX estimé : ${Math.round(score.capex_estime).toLocaleString('fr-FR')} €` : ''}
                  </p>
                )}
                {score.notes && <p className="text-[11px] text-slate-500 mt-1 leading-snug">{score.notes}</p>}
              </div>
            </div>
          )}
        </SubAccordion>

        <SubAccordion title="Ventilation risques" accentColor="bg-red-300" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-4">
            <DonutChart title="Événements par prestataire" slices={buildDonut('prest')} centerTotal={pannes.length} />
            <DonutChart title="Événements par impact service" slices={buildDonut('impact')} centerTotal={evenements.length} />
          </div>
        </SubAccordion>
      </AccordionSection>

    </div>
  );
}
