import { useMemo, useState } from 'react';
import { ControleWithMeta } from './types';
import {
  AccordionSection, SubAccordion, KpiCard, DonutChart, LineChart,
  YearSelect, PeriodSelect, CriticitéFilter, MiniSelect,
  formatNum, buildSlices, buildSlicesTop,
  COLORS_TYPE, COLORS_RESIDENCES,
  VENTILATION_TYPE_OPTIONS, VENTILATION_ASSIGNATION_OPTIONS,
  ASSIGNATION_OPTIONS,
  Periodicite, CriticitéKey, CRITICITE_CONFIG, CRITICITE_RATIOS,
} from './dashboardCharts';
import {
  TYPE_CONTROLE_DATA, SITE_DATA, RESIDENCE_DATA, BATIMENT_DATA, ETAGE_DATA, LOGEMENT_DATA,
  EQUIPEMENT_DATA, PRESTATAIRE_DATA, SERVICE_DATA, EQUIPE_DATA, AGENT_DATA,
  CATEGORIE_EQUIP_DATA, CATEGORIE_SITE_DATA,
  MONTHLY_CONTROLES, YEARLY_CONTROLES,
  MONTHLY_POINTS, YEARLY_POINTS,
  MONTHLY_ACTIONS, YEARLY_ACTIONS,
  MONTHLY_ANCIENNETE, YEARLY_ANCIENNETE,
  MONTHLY_TEMPS_RESOLUTION, YEARLY_TEMPS_RESOLUTION,
} from './dashboardData';

import imgManquant          from '../../assets/reglementaire-icons/Manquant-Controle-Doc-Triangle-Jaune.png';
import imgEnRetardCalendrier from '../../assets/reglementaire-icons/En-retard-Calendrier-Triangle-Rouge.png';
import imgAVenir            from '../../assets/reglementaire-icons/A-venir-Calendrier-Sablier-Bleu.png';
import imgRealise           from '../../assets/reglementaire-icons/Realise-Controle-Doc-Badge-Coche-Verte.png';
import imgNonConforme       from '../../assets/reglementaire-icons/Non-Conforme-Point-Controle-Doc-Triangle-Orange.png';
import imgConforme          from '../../assets/reglementaire-icons/Conforme-Point-Controle-Doc-Label-Vert.png';
import imgEnAttente         from '../../assets/reglementaire-icons/En-attente-Action-Corrective-Symbole-Pause-Orange.png';
import imgEnRetardAction    from '../../assets/reglementaire-icons/En-retard-Action-Corrective-Symbole-Sablier-Rouge.png';
import imgPlanifie          from '../../assets/reglementaire-icons/Planifie-Action-Corrective-Symbole-Calendrier-Bleu.png';
import imgTermine           from '../../assets/reglementaire-icons/Termine-Action-Corrective-Symbole-Coche-Verte.png';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  controles: ControleWithMeta[];
  selectedTypes?: string[];
  selectedSiteIds?: string[];
}

// ─── Tooltip type ─────────────────────────────────────────────────────────────

interface TooltipState { x: number; y: number; label: string; value: number; statut: string }

// ─── Statut configs ───────────────────────────────────────────────────────────

const SC_CONTROLES = {
  manquant:  { color: '#94a3b8', label: 'Manquants' },
  en_retard: { color: '#ef4444', label: 'En retard'  },
  a_venir:   { color: '#3b82f6', label: 'À venir'    },
  realise:   { color: '#10b981', label: 'Réalisés'   },
};
const SC_POINTS = {
  non_conforme: { color: '#f97316', label: 'Non conformes' },
  conforme:     { color: '#10b981', label: 'Conformes'     },
};
const SC_ACTIONS = {
  en_attente:  { color: '#f97316', label: 'En attente'  },
  en_retard:   { color: '#ef4444', label: 'En retard'   },
  planifiees:  { color: '#3b82f6', label: 'Planifiées'  },
  terminees:   { color: '#10b981', label: 'Terminées'   },
};
const SC_ANCIENNETE = { anciennete: { color: '#8b5cf6', label: 'Ancienneté moy. (jours)' } };
const SC_TEMPS_RESOLUTION = {
  critique: { color: '#ef4444', label: 'Critique' },
  majeure:  { color: '#f97316', label: 'Majeure'  },
  mineure:  { color: '#3b82f6', label: 'Mineure'  },
};

// ─── Helper: actif options depending on selected site level ──────────────────

function getActifOptions(selectedSiteId: string) {
  if (!selectedSiteId) return [
    { value: 'campus',     label: 'Par campus' },
    { value: 'residence',  label: 'Par résidence' },
    { value: 'equipement', label: 'Par équipement rattaché' },
  ];
  return [
    { value: 'residence',  label: 'Par résidence' },
    { value: 'batiment',   label: 'Par bâtiment' },
    { value: 'etage',      label: 'Par étage' },
    { value: 'logement',   label: 'Par logement' },
    { value: 'equipement', label: 'Par équipement rattaché' },
  ];
}

function getActifRows(dim: string) {
  switch (dim) {
    case 'campus':     return SITE_DATA;
    case 'residence':  return RESIDENCE_DATA;
    case 'batiment':   return BATIMENT_DATA;
    case 'etage':      return ETAGE_DATA;
    case 'logement':   return LOGEMENT_DATA.slice(0, 12);
    case 'equipement': return EQUIPEMENT_DATA;
    default:           return SITE_DATA;
  }
}

function getTypeRows(dim: string) {
  switch (dim) {
    case 'type_controle':        return TYPE_CONTROLE_DATA as unknown as Array<{ nom: string; [key: string]: number | string }>;
    case 'categorie_equipement': return CATEGORIE_EQUIP_DATA;
    case 'categorie_site':       return CATEGORIE_SITE_DATA;
    default:                     return TYPE_CONTROLE_DATA as unknown as Array<{ nom: string; [key: string]: number | string }>;
  }
}

function getAssignationRows(dim: string) {
  switch (dim) {
    case 'prestataire': return PRESTATAIRE_DATA;
    case 'service':     return SERVICE_DATA;
    case 'equipe':      return EQUIPE_DATA;
    case 'agent':       return AGENT_DATA;
    default:            return PRESTATAIRE_DATA;
  }
}

// ─── GaugeConformite ─────────────────────────────────────────────────────────

interface GaugeProps { pct: number; pointsConformes: number; pointsNonConformes: number; }
function GaugeConformite({ pct, pointsConformes, pointsNonConformes }: GaugeProps) {
  const [year, setYear] = useState(2026);
  const color = pct >= 90 ? '#10b981' : pct >= 75 ? '#f59e0b' : '#ef4444';
  const circ = 2 * Math.PI * 52;
  const dash = (pct / 100) * circ;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Taux global de conformité</div>
        <YearSelect value={year} onChange={setYear} />
      </div>
      <div className="flex items-center justify-center flex-1">
        <div className="relative flex-shrink-0 w-44 h-44">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#e2e8f0" strokeWidth="10" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="10"
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.6s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black" style={{ color }}>{pct}%</span>
            <span className="text-xs text-slate-400 font-medium mt-0.5">conformité</span>
          </div>
        </div>
      </div>
      <div className="text-xs text-slate-400 border-t border-slate-50 pt-3">
        {(pointsConformes + pointsNonConformes).toLocaleString('fr-FR')} points vérifiés ·{' '}
        <span className="text-orange-600 font-semibold">{pointsNonConformes.toLocaleString('fr-FR')} non conformes</span> à traiter
      </div>
    </div>
  );
}

// ─── PyramideCriticites ───────────────────────────────────────────────────────

function PyramideCriticites() {
  const [year, setYear] = useState(2026);
  const rows = [
    { label: 'Critique', value: 12,  color: '#ef4444', text: 'text-red-700'    },
    { label: 'Majeure',  value: 48,  color: '#f97316', text: 'text-orange-700' },
    { label: 'Mineure',  value: 214, color: '#eab308', text: 'text-yellow-700' },
  ];
  const total = rows.reduce((s, r) => s + r.value, 0);
  const maxVal = Math.max(...rows.map(r => r.value));
  const minVal = Math.min(...rows.map(r => r.value));
  const scaleWidth = (v: number) => 15 + ((v - minVal) / (maxVal - minVal)) * 85;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Non-conformités</div>
        <YearSelect value={year} onChange={setYear} />
      </div>
      <div className="flex flex-col gap-3 items-center flex-1 justify-center">
        {rows.map((row) => (
          <div key={row.label} className="w-full flex items-center gap-3">
            <div className="w-16 text-right flex-shrink-0">
              <span className={`text-xs font-bold ${row.text}`}>{row.label}</span>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="h-9 rounded-md flex items-center justify-center transition-all"
                style={{ width: `${Math.round(scaleWidth(row.value))}%`, background: row.color }}>
                <span className="text-white text-sm font-black">{row.value}</span>
              </div>
            </div>
            <div className="w-12 flex-shrink-0" />
          </div>
        ))}
      </div>
      <div className="text-xs text-slate-400 border-t border-slate-50 pt-3">{total} points de contrôle non conformes</div>
    </div>
  );
}

// ─── EvolutionResume (top-right summary chart) ───────────────────────────────

type RubriqueSummary = 'controles' | 'points' | 'actions';

function EvolutionResume() {
  const [rubrique, setRubrique]     = useState<RubriqueSummary>('actions');
  const [periodicite, setPeriodicite] = useState<Periodicite>('mois');
  const [year, setYear]             = useState(2026);
  const [tooltip, setTooltip]       = useState<TooltipState | null>(null);

  const [visControles, setVisControles] = useState<Set<string>>(new Set(['en_retard', 'manquant']));
  const [visPoints,    setVisPoints]    = useState<Set<string>>(new Set(['non_conforme']));
  const [visActions,   setVisActions]   = useState<Set<string>>(new Set(['en_attente', 'en_retard']));
  const [criticiteAC,  setCriticiteAC]  = useState<Set<CriticitéKey>>(new Set<CriticitéKey>(['critique', 'majeure']));

  const statutConfig = rubrique === 'controles' ? SC_CONTROLES : rubrique === 'points' ? SC_POINTS : SC_ACTIONS;
  const vis          = rubrique === 'controles' ? visControles  : rubrique === 'points' ? visPoints  : visActions;

  const toggleStatut = (s: string) => {
    const setter = rubrique === 'controles' ? setVisControles : rubrique === 'points' ? setVisPoints : setVisActions;
    setter(prev => { const n = new Set(prev); if (n.has(s)) { if (n.size > 1) n.delete(s); } else n.add(s); return n; });
  };

  const criticiteWeight = rubrique === 'controles' ? 1 : Array.from(criticiteAC).reduce((acc, k) => acc + CRITICITE_RATIOS[k], 0);

  const rawData =
    rubrique === 'controles' ? (periodicite === 'mois' ? MONTHLY_CONTROLES[year] : YEARLY_CONTROLES)
    : rubrique === 'points'  ? (periodicite === 'mois' ? MONTHLY_POINTS[year]    : YEARLY_POINTS)
    :                          (periodicite === 'mois' ? MONTHLY_ACTIONS[year]   : YEARLY_ACTIONS);

  const data = rawData.map(pt => {
    if (rubrique === 'controles') return pt;
    const fields = rubrique === 'points' ? ['non_conforme'] : ['en_attente', 'en_retard', 'planifiees', 'terminees'];
    const out = { ...pt };
    for (const f of fields) if (typeof pt[f] === 'number') out[f] = Math.round((pt[f] as number) * criticiteWeight);
    return out;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={rubrique}
          onChange={e => { setRubrique(e.target.value as RubriqueSummary); setTooltip(null); }}
          className="text-xs font-bold border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-300 uppercase tracking-wide flex-1 min-w-0"
        >
          <option value="controles">Contrôles</option>
          <option value="points">Points de contrôle</option>
          <option value="actions">Actions correctives</option>
        </select>
        <PeriodSelect value={periodicite} onChange={setPeriodicite} />
        {periodicite === 'mois' && <YearSelect value={year} onChange={setYear} />}
      </div>
      <LineChart data={data} statutConfig={statutConfig} visibleStatuts={vis} onToggleStatut={toggleStatut} tooltip={tooltip} onHover={setTooltip} />
      {rubrique !== 'controles' && (
        <div className="pt-1 border-t border-slate-50">
          <CriticitéFilter selected={criticiteAC} onChange={setCriticiteAC} />
        </div>
      )}
    </div>
  );
}

// ─── VentilationSection ───────────────────────────────────────────────────────

type KpiFieldControle = 'realise' | 'a_venir' | 'en_retard' | 'manquant';
type KpiFieldPoint    = 'conforme' | 'non_conforme';
type KpiFieldAction   = 'terminees' | 'planifiees' | 'en_retard' | 'en_attente';

interface VentilationSectionProps {
  kpiField: string;
  selectedSiteId: string;
  accentColor: string;
}

function VentilationSection({ kpiField, selectedSiteId, accentColor }: VentilationSectionProps) {
  const [typeDim,        setTypeDim]        = useState('type_controle');
  const [actifDim,       setActifDim]       = useState(selectedSiteId ? 'residence' : 'campus');
  const [assignationDim, setAssignationDim] = useState('prestataire');

  const actifOptions = getActifOptions(selectedSiteId);

  const typeSlices     = buildSlicesTop(getTypeRows(typeDim) as any, kpiField, COLORS_TYPE, 10);
  const actifSlices    = buildSlicesTop(getActifRows(actifDim) as any, kpiField, COLORS_RESIDENCES, 10);
  const assignSlices   = buildSlices(getAssignationRows(assignationDim) as any, kpiField, COLORS_TYPE);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <DonutChart slices={typeSlices} title="Par type"
        selectOptions={VENTILATION_TYPE_OPTIONS} selectedOption={typeDim} onOptionChange={setTypeDim} />
      <DonutChart slices={actifSlices} title="Par actif concerné"
        selectOptions={actifOptions} selectedOption={actifDim} onOptionChange={setActifDim} />
      <DonutChart slices={assignSlices} title="Par assignation"
        selectOptions={VENTILATION_ASSIGNATION_OPTIONS} selectedOption={assignationDim} onOptionChange={setAssignationDim} />
    </div>
  );
}

// ─── EvolutionControles ───────────────────────────────────────────────────────

function EvolutionControles() {
  const [periodicite, setPeriodicite] = useState<Periodicite>('mois');
  const [year, setYear] = useState(2026);
  const [vis, setVis]   = useState<Set<string>>(new Set(['en_retard', 'manquant', 'a_venir', 'realise']));
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const data = periodicite === 'mois' ? MONTHLY_CONTROLES[year] : YEARLY_CONTROLES;
  const toggleStatut = (s: string) => {
    setVis(prev => { const n = new Set(prev); if (n.has(s)) { if (n.size > 1) n.delete(s); } else n.add(s); return n; });
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-slate-500">Par statut</span>
        <div className="flex gap-2 ml-auto">
          <PeriodSelect value={periodicite} onChange={setPeriodicite} />
          {periodicite === 'mois' && <YearSelect value={year} onChange={setYear} />}
        </div>
      </div>
      <LineChart data={data} statutConfig={SC_CONTROLES} visibleStatuts={vis} onToggleStatut={toggleStatut} tooltip={tooltip} onHover={setTooltip} />
    </div>
  );
}

// ─── EvolutionPoints ─────────────────────────────────────────────────────────

function EvolutionPoints() {
  const [periodiciteNC, setPeriodiciteNC] = useState<Periodicite>('mois');
  const [yearNC, setYearNC]               = useState(2026);
  const [visNC, setVisNC]                 = useState<Set<string>>(new Set(['non_conforme']));
  const [tooltipNC, setTooltipNC]         = useState<TooltipState | null>(null);
  const [criticiteNC, setCriticiteNC]     = useState<Set<CriticitéKey>>(new Set<CriticitéKey>(['critique', 'majeure']));
  const [typeDimNC, setTypeDimNC]         = useState('type_controle');
  const [actifDimNC, setActifDimNC]       = useState('campus');

  const [periodiciteANC, setPeriodiciteANC] = useState<Periodicite>('mois');
  const [yearANC, setYearANC]               = useState(2026);
  const [tooltipANC, setTooltipANC]         = useState<TooltipState | null>(null);
  const [typeDimANC, setTypeDimANC]         = useState('type_controle');
  const [actifDimANC, setActifDimANC]       = useState('campus');

  const criticiteWeightNC = Array.from(criticiteNC).reduce((acc, k) => acc + CRITICITE_RATIOS[k], 0);
  const dataNcRaw = periodiciteNC === 'mois' ? MONTHLY_POINTS[yearNC] : YEARLY_POINTS;
  const dataNc = dataNcRaw.map(pt => ({ ...pt, non_conforme: Math.round((pt.non_conforme as number) * criticiteWeightNC), conforme: pt.conforme }));

  const dataAnc = periodiciteANC === 'mois' ? MONTHLY_ANCIENNETE[yearANC] : YEARLY_ANCIENNETE;

  const toggleNC = (s: string) => {
    setVisNC(prev => { const n = new Set(prev); if (n.has(s)) { if (n.size > 1) n.delete(s); } else n.add(s); return n; });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {/* Graphique A — Évolution points de contrôle */}
      <div className="border border-slate-100 rounded-xl p-4">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-xs font-semibold text-slate-600">Évolution du nb. de points de contrôle</span>
          <div className="flex gap-2 ml-auto flex-wrap">
            <MiniSelect value={actifDimNC} onChange={setActifDimNC} options={[
              { value: 'campus', label: 'Tous campus' },
              { value: 'residence', label: 'Par résidence' },
              { value: 'equipement', label: 'Par équipement' },
            ]} />
            <MiniSelect value={typeDimNC} onChange={setTypeDimNC} options={VENTILATION_TYPE_OPTIONS} />
            <PeriodSelect value={periodiciteNC} onChange={setPeriodiciteNC} />
            {periodiciteNC === 'mois' && <YearSelect value={yearNC} onChange={setYearNC} />}
          </div>
        </div>
        <LineChart data={dataNc} statutConfig={SC_POINTS} visibleStatuts={visNC} onToggleStatut={toggleNC} tooltip={tooltipNC} onHover={setTooltipNC} />
        <div className="mt-2">
          <CriticitéFilter selected={criticiteNC} onChange={setCriticiteNC} />
        </div>
      </div>

      {/* Graphique B — Ancienneté moyenne */}
      <div className="border border-slate-100 rounded-xl p-4">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-xs font-semibold text-slate-600">Ancienneté moyenne des non-conformités</span>
          <div className="flex gap-2 ml-auto flex-wrap">
            <MiniSelect value={actifDimANC} onChange={setActifDimANC} options={[
              { value: 'campus', label: 'Tous campus' },
              { value: 'residence', label: 'Par résidence' },
              { value: 'equipement', label: 'Par équipement' },
            ]} />
            <MiniSelect value={typeDimANC} onChange={setTypeDimANC} options={VENTILATION_TYPE_OPTIONS} />
            <PeriodSelect value={periodiciteANC} onChange={setPeriodiciteANC} />
            {periodiciteANC === 'mois' && <YearSelect value={yearANC} onChange={setYearANC} />}
          </div>
        </div>
        <LineChart data={dataAnc} statutConfig={SC_ANCIENNETE} visibleStatuts={new Set(['anciennete'])} onToggleStatut={() => {}} tooltip={tooltipANC} onHover={setTooltipANC} yUnit="j" />
      </div>
    </div>
  );
}

// ─── EvolutionActions ─────────────────────────────────────────────────────────

function EvolutionActions() {
  const [periodiciteAC, setPeriodiciteAC] = useState<Periodicite>('mois');
  const [yearAC, setYearAC]               = useState(2026);
  const [visAC, setVisAC]                 = useState<Set<string>>(new Set(['en_attente', 'en_retard']));
  const [tooltipAC, setTooltipAC]         = useState<TooltipState | null>(null);
  const [criticiteAC, setCriticiteAC]     = useState<Set<CriticitéKey>>(new Set<CriticitéKey>(['critique', 'majeure']));
  const [assignDimAC, setAssignDimAC]     = useState('prestataire');
  const [typeDimAC, setTypeDimAC]         = useState('type_controle');
  const [actifDimAC, setActifDimAC]       = useState('campus');

  const [periodiciteTR, setPeriodiciteTR] = useState<Periodicite>('mois');
  const [yearTR, setYearTR]               = useState(2026);
  const [visTR, setVisTR]                 = useState<Set<string>>(new Set(['critique', 'majeure', 'mineure']));
  const [tooltipTR, setTooltipTR]         = useState<TooltipState | null>(null);
  const [criticiteTR, setCriticiteTR]     = useState<Set<CriticitéKey>>(new Set<CriticitéKey>(['critique', 'majeure', 'mineure']));
  const [assignDimTR, setAssignDimTR]     = useState('prestataire');
  const [typeDimTR, setTypeDimTR]         = useState('type_controle');
  const [actifDimTR, setActifDimTR]       = useState('campus');

  const criticiteWeightAC = Array.from(criticiteAC).reduce((acc, k) => acc + CRITICITE_RATIOS[k], 0);
  const dataACRaw = periodiciteAC === 'mois' ? MONTHLY_ACTIONS[yearAC] : YEARLY_ACTIONS;
  const dataAC = dataACRaw.map(pt => ({
    ...pt,
    en_attente:  Math.round((pt.en_attente  as number) * criticiteWeightAC),
    en_retard:   Math.round((pt.en_retard   as number) * criticiteWeightAC),
    planifiees:  Math.round((pt.planifiees  as number) * criticiteWeightAC),
    terminees:   Math.round((pt.terminees   as number) * criticiteWeightAC),
  }));

  const dataTR = periodiciteTR === 'mois' ? MONTHLY_TEMPS_RESOLUTION[yearTR] : YEARLY_TEMPS_RESOLUTION;
  const dataTRFiltered = dataTR.map(pt => ({
    ...pt,
    critique: criticiteTR.has('critique') ? pt.critique : 0,
    majeure:  criticiteTR.has('majeure')  ? pt.majeure  : 0,
    mineure:  criticiteTR.has('mineure')  ? pt.mineure  : 0,
  }));

  const toggleAC = (s: string) => {
    setVisAC(prev => { const n = new Set(prev); if (n.has(s)) { if (n.size > 1) n.delete(s); } else n.add(s); return n; });
  };
  const toggleTR = (s: string) => {
    setVisTR(prev => { const n = new Set(prev); if (n.has(s)) { if (n.size > 1) n.delete(s); } else n.add(s); return n; });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {/* Graphique A — Évolution nb actions correctives */}
      <div className="border border-slate-100 rounded-xl p-4">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-xs font-semibold text-slate-600">Évolution du nombre d'actions correctives</span>
          <div className="flex gap-2 ml-auto flex-wrap">
            <MiniSelect value={assignDimAC} onChange={setAssignDimAC} options={ASSIGNATION_OPTIONS} />
            <MiniSelect value={actifDimAC} onChange={setActifDimAC} options={[
              { value: 'campus', label: 'Tous campus' },
              { value: 'residence', label: 'Par résidence' },
              { value: 'equipement', label: 'Par équipement' },
            ]} />
            <MiniSelect value={typeDimAC} onChange={setTypeDimAC} options={VENTILATION_TYPE_OPTIONS} />
            <PeriodSelect value={periodiciteAC} onChange={setPeriodiciteAC} />
            {periodiciteAC === 'mois' && <YearSelect value={yearAC} onChange={setYearAC} />}
          </div>
        </div>
        <LineChart data={dataAC} statutConfig={SC_ACTIONS} visibleStatuts={visAC} onToggleStatut={toggleAC} tooltip={tooltipAC} onHover={setTooltipAC} />
        <div className="mt-2">
          <CriticitéFilter selected={criticiteAC} onChange={setCriticiteAC} />
        </div>
      </div>

      {/* Graphique B — Temps moyen de résolution */}
      <div className="border border-slate-100 rounded-xl p-4">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="text-xs font-semibold text-slate-600">Temps moyen de résolution</span>
          <div className="flex gap-2 ml-auto flex-wrap">
            <MiniSelect value={assignDimTR} onChange={setAssignDimTR} options={ASSIGNATION_OPTIONS} />
            <MiniSelect value={actifDimTR} onChange={setActifDimTR} options={[
              { value: 'campus', label: 'Tous campus' },
              { value: 'residence', label: 'Par résidence' },
              { value: 'equipement', label: 'Par équipement' },
            ]} />
            <MiniSelect value={typeDimTR} onChange={setTypeDimTR} options={VENTILATION_TYPE_OPTIONS} />
            <PeriodSelect value={periodiciteTR} onChange={setPeriodiciteTR} />
            {periodiciteTR === 'mois' && <YearSelect value={yearTR} onChange={setYearTR} />}
          </div>
        </div>
        <LineChart data={dataTRFiltered} statutConfig={SC_TEMPS_RESOLUTION} visibleStatuts={visTR} onToggleStatut={toggleTR} tooltip={tooltipTR} onHover={setTooltipTR} yUnit="j" />
        <div className="mt-2">
          <CriticitéFilter selected={criticiteTR} onChange={setCriticiteTR} />
        </div>
      </div>
    </div>
  );
}

// ─── Scale helpers ────────────────────────────────────────────────────────────

const TOTAL_TYPES = TYPE_CONTROLE_DATA.length;
const TOTAL_SITES = 25;

// ─── Main component ───────────────────────────────────────────────────────────

export default function ReglementaireDashboard({ controles, selectedTypes = [], selectedSiteIds = [] }: Props) {
  const selectedSiteId = selectedSiteIds.length === 1 ? selectedSiteIds[0] : '';
  const [activeKpiControle, setActiveKpiControle] = useState<KpiFieldControle>('realise');
  const [activeKpiPoint,    setActiveKpiPoint]    = useState<KpiFieldPoint>('non_conforme');
  const [activeKpiAction,   setActiveKpiAction]   = useState<KpiFieldAction>('en_attente');

  const typeRatio = selectedTypes.length === 0 ? 1 : selectedTypes.length / TOTAL_TYPES;
  const siteRatio = selectedSiteIds.length === 0 ? 1 : selectedSiteIds.length / TOTAL_SITES;
  const filterRatio = typeRatio * siteRatio;
  const scale = (v: number) => Math.round(v * filterRatio);

  const stats = useMemo(() => {
    const controleRealise  = scale(1050);
    const controleAVenir   = scale(380);
    const controleEnRetard = scale(290);
    const controleManquant = scale(200);
    const controleTotal    = controleRealise + controleAVenir + controleEnRetard + controleManquant;
    const pointsTotal      = controleTotal * 25;
    const pointsNonConf    = Math.round(pointsTotal * 0.08);
    const pointsConf       = pointsTotal - pointsNonConf;
    const actionsTotal     = Math.round(pointsNonConf * 0.70);
    const actionsEnAttente = Math.round(actionsTotal * 0.28);
    const actionsEnRetard  = Math.round(actionsTotal * 0.18);
    const actionsPlanif    = Math.round(actionsTotal * 0.24);
    const actionsTerminees = actionsTotal - actionsEnAttente - actionsEnRetard - actionsPlanif;
    const conformitePct    = Math.round((pointsConf / Math.max(1, pointsConf + pointsNonConf)) * 100);
    return { controleManquant, controleEnRetard, controleAVenir, controleRealise, controleTotal, pointsConf, pointsNonConf, actionsEnAttente, actionsEnRetard, actionsPlanif, actionsTerminees, conformitePct };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterRatio]);

  void controles;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">

      {/* ── Summary panels ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <GaugeConformite pct={stats.conformitePct} pointsConformes={stats.pointsConf} pointsNonConformes={stats.pointsNonConf} />
        <PyramideCriticites />
        <EvolutionResume />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          RUBRIQUE 1 — CONTRÔLES
      ══════════════════════════════════════════════════════════════ */}
      <AccordionSection
        title="Contrôles"
        subtitle={`${stats.controleTotal.toLocaleString('fr-FR')} contrôles réglementaires au total`}
        accentColor="bg-slate-700"
        defaultOpen={true}
      >
        <div className="space-y-3 mt-3">

          {/* Niveau 1 — Indicateurs */}
          <SubAccordion title="Indicateurs en date du jour" accentColor="bg-slate-400" defaultOpen={true}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-1">
              <KpiCard label="Manquants" value={stats.controleManquant} img={imgManquant}           bg="bg-slate-50"  border="border-slate-200"   accentBorder="border-slate-500"   textColor="text-slate-500"   valueColor="text-slate-700"   isActive={activeKpiControle === 'manquant'}  onClick={() => setActiveKpiControle('manquant')} />
              <KpiCard label="En retard" value={stats.controleEnRetard} img={imgEnRetardCalendrier} bg="bg-red-50"    border="border-red-200"     accentBorder="border-red-500"     textColor="text-red-500"     valueColor="text-red-700"     isActive={activeKpiControle === 'en_retard'} onClick={() => setActiveKpiControle('en_retard')} />
              <KpiCard label="À venir"   value={stats.controleAVenir}   img={imgAVenir}            bg="bg-blue-50"   border="border-blue-200"    accentBorder="border-blue-500"    textColor="text-blue-500"    valueColor="text-blue-700"    isActive={activeKpiControle === 'a_venir'}   onClick={() => setActiveKpiControle('a_venir')} />
              <KpiCard label="Réalisés"  value={stats.controleRealise}  img={imgRealise}           bg="bg-emerald-50" border="border-emerald-200" accentBorder="border-emerald-500" textColor="text-emerald-600" valueColor="text-emerald-700" isActive={activeKpiControle === 'realise'}   onClick={() => setActiveKpiControle('realise')} />
            </div>
          </SubAccordion>

          {/* Niveau 2 — Ventilation */}
          <SubAccordion title="Ventilation" accentColor="bg-slate-500" defaultOpen={false}>
            <div className="mt-1">
              <VentilationSection kpiField={activeKpiControle} selectedSiteId={selectedSiteId} accentColor="bg-slate-500" />
            </div>
          </SubAccordion>

          {/* Niveau 3 — Évolution */}
          <SubAccordion title="Évolution" accentColor="bg-slate-600" defaultOpen={false}>
            <div className="mt-1">
              <EvolutionControles />
            </div>
          </SubAccordion>

        </div>
      </AccordionSection>

      {/* ══════════════════════════════════════════════════════════════
          RUBRIQUE 2 — POINTS DE CONTRÔLE
      ══════════════════════════════════════════════════════════════ */}
      <AccordionSection
        title="Points de contrôle"
        subtitle={`${(stats.pointsConf + stats.pointsNonConf).toLocaleString('fr-FR')} points vérifiés · conformité ${stats.conformitePct}%`}
        accentColor="bg-emerald-500"
        defaultOpen={true}
      >
        <div className="space-y-3 mt-3">

          {/* Niveau 1 — Indicateurs */}
          <SubAccordion title="Indicateurs en date du jour" accentColor="bg-emerald-300" defaultOpen={true}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              <KpiCard label="Non conformes" value={stats.pointsNonConf} img={imgNonConforme} bg="bg-orange-50" border="border-orange-200" accentBorder="border-orange-500" textColor="text-orange-500" valueColor="text-orange-700" isActive={activeKpiPoint === 'non_conforme'} onClick={() => setActiveKpiPoint('non_conforme')} />
              <KpiCard label="Conformes"     value={stats.pointsConf}    img={imgConforme}    bg="bg-emerald-50" border="border-emerald-200" accentBorder="border-emerald-500" textColor="text-emerald-600" valueColor="text-emerald-700" isActive={activeKpiPoint === 'conforme'} onClick={() => setActiveKpiPoint('conforme')} />
            </div>
            <div className="mt-3 bg-slate-50/60 rounded-xl border border-slate-100 p-4 flex items-center gap-5">
              {(() => {
                const pct = stats.conformitePct;
                const color = pct >= 90 ? '#10b981' : pct >= 75 ? '#f59e0b' : '#ef4444';
                return (
                  <>
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="38" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                        <circle cx="50" cy="50" r="38" fill="none" stroke={color} strokeWidth="12" strokeDasharray={`${pct * 2.39} 239`} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-black text-slate-800">{pct}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-700">Taux de conformité global</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Sur {(stats.pointsConf + stats.pointsNonConf).toLocaleString('fr-FR')} points vérifiés,{' '}
                        <span className="text-orange-600 font-semibold">{stats.pointsNonConf.toLocaleString('fr-FR')} non conformes</span> à traiter
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </SubAccordion>

          {/* Niveau 2 — Ventilation */}
          <SubAccordion title="Ventilation" accentColor="bg-emerald-400" defaultOpen={false}>
            <div className="mt-1">
              <VentilationSection kpiField={activeKpiPoint} selectedSiteId={selectedSiteId} accentColor="bg-emerald-400" />
            </div>
          </SubAccordion>

          {/* Niveau 3 — Évolution */}
          <SubAccordion title="Évolution" accentColor="bg-emerald-500" defaultOpen={false}>
            <div className="mt-1">
              <EvolutionPoints />
            </div>
          </SubAccordion>

        </div>
      </AccordionSection>

      {/* ══════════════════════════════════════════════════════════════
          RUBRIQUE 3 — ACTIONS CORRECTIVES
      ══════════════════════════════════════════════════════════════ */}
      <AccordionSection
        title="Actions correctives"
        subtitle={`${(stats.actionsEnAttente + stats.actionsEnRetard + stats.actionsPlanif + stats.actionsTerminees).toLocaleString('fr-FR')} actions correctives générées`}
        accentColor="bg-amber-500"
        defaultOpen={true}
      >
        <div className="space-y-3 mt-3">

          {/* Niveau 1 — Indicateurs */}
          <SubAccordion title="Indicateurs en date du jour" accentColor="bg-amber-300" defaultOpen={true}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-1">
              <KpiCard label="En attente" value={stats.actionsEnAttente} img={imgEnAttente}      bg="bg-orange-50" border="border-orange-200" accentBorder="border-orange-500" textColor="text-orange-500"  valueColor="text-orange-700"  isActive={activeKpiAction === 'en_attente'}  onClick={() => setActiveKpiAction('en_attente')} />
              <KpiCard label="En retard"  value={stats.actionsEnRetard}  img={imgEnRetardAction} bg="bg-red-50"    border="border-red-200"    accentBorder="border-red-500"    textColor="text-red-500"     valueColor="text-red-700"     isActive={activeKpiAction === 'en_retard'}   onClick={() => setActiveKpiAction('en_retard')} />
              <KpiCard label="Planifiées" value={stats.actionsPlanif}    img={imgPlanifie}       bg="bg-blue-50"   border="border-blue-200"   accentBorder="border-blue-500"   textColor="text-blue-500"    valueColor="text-blue-700"    isActive={activeKpiAction === 'planifiees'}  onClick={() => setActiveKpiAction('planifiees')} />
              <KpiCard label="Terminées"  value={stats.actionsTerminees} img={imgTermine}        bg="bg-emerald-50" border="border-emerald-200" accentBorder="border-emerald-500" textColor="text-emerald-600" valueColor="text-emerald-700" isActive={activeKpiAction === 'terminees'} onClick={() => setActiveKpiAction('terminees')} />
            </div>
          </SubAccordion>

          {/* Niveau 2 — Ventilation */}
          <SubAccordion title="Ventilation" accentColor="bg-amber-400" defaultOpen={false}>
            <div className="mt-1">
              <VentilationSection kpiField={activeKpiAction} selectedSiteId={selectedSiteId} accentColor="bg-amber-400" />
            </div>
          </SubAccordion>

          {/* Niveau 3 — Évolution */}
          <SubAccordion title="Évolution" accentColor="bg-amber-500" defaultOpen={false}>
            <div className="mt-1">
              <EvolutionActions />
            </div>
          </SubAccordion>

        </div>
      </AccordionSection>

    </div>
  );
}
