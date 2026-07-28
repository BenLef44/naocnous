import { useState, useMemo } from 'react';
import { ControleWithMeta, STATUT_CONFIG } from './types';
import ControleDetail from './ControleDetail';
import {
  ChevronUp, ChevronDown, AlertTriangle, Calendar, Building2,
  CheckCircle2, XCircle, HelpCircle, ShieldCheck, BarChart3, Wrench,
  Eye, Pencil, Trash2, Filter,
} from 'lucide-react';
import {
  TYPE_CONTROLE_DATA, SITE_DATA, RESIDENCE_DATA,
  PRESTATAIRE_DATA, AGENT_DATA,
} from './dashboardData';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = 'controles' | 'points' | 'actions';

interface Props {
  controles: ControleWithMeta[];
  onUpdate: () => void;
  selectedTypes?: string[];
  selectedSiteNames?: string[];
}

// ─── Mock data generators (aligned with dashboard totals) ─────────────────────

const PERIODICITES = ['Annuelle', 'Semestrielle', 'Triennale', 'Quinquennale', 'Mensuelle', 'Trimestrielle'];

const PERIODICITE_MONTHS: Record<string, number> = {
  Mensuelle:     1,
  Trimestrielle: 3,
  Semestrielle:  6,
  Annuelle:      12,
  Triennale:     36,
  Quinquennale:  60,
};

function lastFromNext(dateProchain: string, periodicite: string): string {
  const months = PERIODICITE_MONTHS[periodicite];
  if (!months) return dateProchain;
  const d = new Date(dateProchain);
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}
const ORGANISMES   = ['APAVE', 'SOCOTEC', 'DEKRA', 'Bureau Veritas', 'Qualiconsult'];
const CRITICITES: Array<'Critique' | 'Majeure' | 'Mineure'> = ['Critique', 'Majeure', 'Mineure'];
const STATUTS_CONTROLE: Array<'manquant' | 'en_retard' | 'a_venir' | 'realise'> = ['manquant', 'en_retard', 'a_venir', 'realise'];
const STATUTS_ACTION: Array<'en_attente' | 'en_retard' | 'planifiees' | 'terminees'> = ['en_attente', 'en_retard', 'planifiees', 'terminees'];

function deterministicInt(seed: number, max: number) {
  const x = Math.sin(seed) * 10000;
  return Math.floor((x - Math.floor(x)) * max);
}

function pickFrom<T>(arr: T[], seed: number): T {
  return arr[deterministicInt(seed, arr.length)];
}

function fakeDate(seed: number, offsetDays: number): string {
  const d = new Date(Date.now() + (offsetDays + deterministicInt(seed, 60) - 30) * 86400000);
  return d.toISOString().slice(0, 10);
}

// ── Contrôles rows ────────────────────────────────────────────────────────────

interface ControleRow {
  id: string;
  type: string;       // emoji + nom
  periodicite: string;
  localisation: string;
  organisme: string;
  dateProchain: string | null;
  dateDernier: string | null;
  conformes: number;
  nonConformes: number;
  statut: 'manquant' | 'en_retard' | 'a_venir' | 'realise';
  actions: number;
}

// ── Periodicités Amiante ──────────────────────────────────────────────────────
// "Surveillance 3 ans" is a real periodicity (36 months).
// The others are event-triggered and carry no scheduled dates.

const PERIODICITES_AMIANTE = [
  'Surveillance 3 ans',
  'Repérage avant travaux',
  'Dégradation',
  'Démolition',
  'Après des travaux',
  'Demande des autorités',
] as const;

// Indices 10 through 49 are reserved for the 50 "with dateProchain only" slot
// We deterministically decide which 10 (of 50) get dateProchain only,
// and the other 40 get dateDernier only.
// We use a fixed set so it is stable (no Math.random).
const AMIANTE_PROCHAIN_ONLY_INDICES = new Set([2, 5, 9, 14, 18, 23, 28, 34, 39, 46]);

const MOCK_AMIANTE: ControleRow[] = Array.from({ length: 50 }, (_, i) => {
  const s = 1000 + i * 7; // seed range far from general rows
  const site = pickFrom(SITE_DATA, s);
  const res  = pickFrom(RESIDENCE_DATA, s + 1);
  const perio = PERIODICITES_AMIANTE[deterministicInt(s + 2, PERIODICITES_AMIANTE.length)];
  const hasProchainOnly = AMIANTE_PROCHAIN_ONLY_INDICES.has(i);
  const hasDernierOnly  = !hasProchainOnly;

  // Build dates
  let dateProchain: string | null = null;
  let dateDernier:  string | null = null;

  if (hasProchainOnly) {
    // 10 rows: only "Prochain contrôle"
    // Date can be future (à venir) or past (en retard)
    const offsetDays = deterministicInt(s + 3, 2) === 0 ? 90 : -45;
    dateProchain = fakeDate(s + 3, offsetDays);
    dateDernier  = null;
  } else {
    // 40 rows: only "Dernier contrôle" — statut Réalisé
    // For "Surveillance 3 ans" derive dateDernier normally (within last 3 years)
    // For event-triggered types: a date in the past
    const pastOffset = -(180 + deterministicInt(s + 4, 900)); // 6 months to ~3 years ago
    dateDernier  = fakeDate(s + 4, pastOffset);
    dateProchain = null;
  }

  // Statut
  let statut: ControleRow['statut'];
  if (hasProchainOnly) {
    const d = new Date(dateProchain!);
    statut = d < new Date() ? 'en_retard' : 'a_venir';
  } else {
    statut = 'realise';
  }

  return {
    id: `amiante-${i}`,
    type: '😷 Amiante / DTA',
    periodicite: perio,
    localisation: `${site.nom} › ${res.nom}`,
    organisme: pickFrom(ORGANISMES, s + 5),
    dateProchain,
    dateDernier,
    conformes: statut === 'realise' ? 4 + deterministicInt(s + 6, 12) : 0,
    nonConformes: statut === 'realise' ? deterministicInt(s + 7, 4) : 0,
    statut,
    actions: statut === 'realise' ? deterministicInt(s + 8, 3) : statut === 'en_retard' ? 1 + deterministicInt(s + 8, 2) : 0,
  };
});

const MOCK_CONTROLES: ControleRow[] = (() => {
  const rows: ControleRow[] = [];
  let idx = 0;
  // Distribute rows according to TYPE_CONTROLE_DATA totals — skip Amiante (handled separately)
  for (const typeRow of TYPE_CONTROLE_DATA) {
    if (typeRow.nom === '😷 Amiante / DTA') continue;
    const total = typeRow.manquant + typeRow.en_retard + typeRow.a_venir + typeRow.realise;
    const counts = {
      manquant: typeRow.manquant,
      en_retard: typeRow.en_retard,
      a_venir: typeRow.a_venir,
      realise: typeRow.realise,
    };
    // Generate up to 3 representative rows per type (sampled)
    const step = Math.max(1, Math.floor(total / 3));
    let sample = 0;
    for (const statut of STATUTS_CONTROLE) {
      const n = counts[statut];
      if (n === 0) continue;
      for (let k = 0; k < Math.min(n, Math.max(1, Math.round(n / step))); k++) {
        const s = idx + k * 7;
        const site     = pickFrom(SITE_DATA, s);
        const res      = pickFrom(RESIDENCE_DATA, s + 1);
        const perio    = pickFrom(PERIODICITES, s + 2);
        const dateNext = fakeDate(s, statut === 'en_retard' ? -60 : statut === 'a_venir' ? 90 : 0);
        rows.push({
          id: `c-${idx}-${k}`,
          type: typeRow.nom,
          periodicite: perio,
          localisation: `${site.nom} › ${res.nom}`,
          organisme: pickFrom(ORGANISMES, s + 3),
          dateProchain: dateNext,
          dateDernier: lastFromNext(dateNext, perio),
          conformes: statut === 'realise' ? 8 + deterministicInt(s + 6, 20) : 0,
          nonConformes: statut === 'realise' ? deterministicInt(s + 7, 5) : 0,
          statut,
          actions: statut === 'realise' ? deterministicInt(s + 8, 4) : statut === 'en_retard' ? 1 + deterministicInt(s + 8, 3) : 0,
        });
        sample++;
      }
      idx += 13;
    }
    void sample;
  }
  // Inject the 50 dedicated Amiante rows
  return [...rows, ...MOCK_AMIANTE];
})();

// ── Points de contrôle rows ────────────────────────────────────────────────────

interface PointRow {
  id: string;
  type: string;
  localisation: string;
  organisme: string;
  dateControle: string;
  libelle: string;
  conforme: boolean;
  criticite: 'Critique' | 'Majeure' | 'Mineure';
  actions: number;
}

const POINT_LIBELLES = [
  'Extincteurs vérifiés et conformes', 'Tableau électrique conforme NF C 15-100',
  'Système de désenfumage opérationnel', 'Ascenseur certifié et en service',
  'Chaudière collective : pression nominale OK', 'Analyse légionelles < seuil réglementaire',
  'BAES autonomie > 1h vérifiée', 'Porte coupe-feu fermeture automatique fonctionnelle',
  'Cheminement PMR dégagé et conforme', 'Rapport amiante DTA à jour',
  'Structure toiture : pas de désordre apparent', 'Fluide frigorigène < seuil fuite annuelle',
  'EPI vérifiés et en bon état', 'DPE affiché et valide',
  'Commission sécurité avis favorable', 'VMC débit conforme',
];

const MOCK_POINTS: PointRow[] = (() => {
  const rows: PointRow[] = [];
  let idx = 0;
  for (const typeRow of TYPE_CONTROLE_DATA) {
    const total = typeRow.manquant + typeRow.en_retard + typeRow.a_venir + typeRow.realise;
    const nc = Math.round(total * 0.08);
    const c  = Math.round(total * 0.92);
    for (let k = 0; k < Math.min(4, Math.max(2, Math.round((nc + c) / 80))); k++) {
      const s = idx + k * 11;
      const site = pickFrom(SITE_DATA, s);
      const res  = pickFrom(RESIDENCE_DATA, s + 1);
      const isConf = k < Math.round((c / (nc + c)) * 4);
      rows.push({
        id: `p-${idx}-${k}`,
        type: typeRow.nom,
        localisation: `${site.nom} › ${res.nom}`,
        organisme: pickFrom(ORGANISMES, s + 2),
        dateControle: fakeDate(s, -deterministicInt(s + 3, 180)),
        libelle: pickFrom(POINT_LIBELLES, s + 4),
        conforme: isConf,
        criticite: isConf ? pickFrom(['Mineure', 'Majeure'] as const, s + 5) : pickFrom(CRITICITES, s + 6),
        actions: isConf ? 0 : 1 + deterministicInt(s + 7, 3),
      });
    }
    idx += 17;
  }
  return rows;
})();

// ── Actions correctives rows ───────────────────────────────────────────────────

interface ActionRow {
  id: string;
  type: string;
  localisation: string;
  description: string;
  assignation: string;
  criticite: 'Critique' | 'Majeure' | 'Mineure';
  statut: 'en_attente' | 'en_retard' | 'planifiees' | 'terminees';
  echeance: string;
}

const ACTION_DESCRIPTIONS = [
  'Remplacement extincteurs hors délai', 'Mise en conformité tableau électrique',
  'Réparation trappe désenfumage', 'Révision ascenseur — certificat expiré',
  'Purge réseau ECS — légionelles > seuil', 'Remplacement BAES défaillants',
  'Remplacement joint porte coupe-feu', 'Mise à jour rapport amiante DTA',
  'Réfection cheminement PMR — obstacle', 'Contrôle étanchéité toiture — infiltration',
  'Recharge fluide frigorigène — fuite détectée', 'Vérification EPI — conformité EN 397',
  'Mise à jour DPE — bâtiment rénové', 'Levée réserve commission sécurité',
  'Nettoyage VMC — encrassement signalé', 'Vérification pression chaudière collective',
];

const STATUT_ACTION_CONFIG = {
  en_attente:  { label: 'En attente',  bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-500'  },
  en_retard:   { label: 'En retard',   bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500'     },
  planifiees:  { label: 'Planifiée',   bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500'    },
  terminees:   { label: 'Terminée',    bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
};

const CRITICITE_CFG = {
  Critique: { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'    },
  Majeure:  { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  Mineure:  { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
};

const MOCK_ACTIONS: ActionRow[] = (() => {
  const rows: ActionRow[] = [];
  let idx = 0;
  for (const typeRow of TYPE_CONTROLE_DATA) {
    const total = typeRow.manquant + typeRow.en_retard + typeRow.a_venir + typeRow.realise;
    const nActions = Math.round(total * 0.08 * 0.70);
    for (let k = 0; k < Math.min(4, Math.max(1, Math.round(nActions / 20))); k++) {
      const s = idx + k * 13;
      const site = pickFrom(SITE_DATA, s);
      const res  = pickFrom(RESIDENCE_DATA, s + 1);
      const statut = pickFrom(STATUTS_ACTION, s + 2);
      rows.push({
        id: `a-${idx}-${k}`,
        type: typeRow.nom,
        localisation: `${site.nom} › ${res.nom}`,
        description: pickFrom(ACTION_DESCRIPTIONS, s + 3),
        assignation: pickFrom([...PRESTATAIRE_DATA.map(p => p.nom), ...AGENT_DATA.map(a => a.nom)], s + 4),
        criticite: pickFrom(CRITICITES, s + 5),
        statut,
        echeance: fakeDate(s + 6, statut === 'en_retard' ? -30 : statut === 'terminees' ? -60 : 45),
      });
    }
    idx += 19;
  }
  return rows;
})();

// ─── Organisme logos ─────────────────────────────────────────────────────────

const ORGANISME_LOGOS: Record<string, { url: string; bg: string }> = {
  'APAVE':          { url: 'https://www.apave.com/favicon.ico',                        bg: '#e8001d' },
  'SOCOTEC':        { url: 'https://www.socotec.fr/favicon.ico',                       bg: '#005baa' },
  'DEKRA':          { url: 'https://www.dekra.fr/favicon.ico',                         bg: '#006f3c' },
  'Bureau Veritas': { url: 'https://group.bureauveritas.com/favicon.ico',              bg: '#003087' },
  'Qualiconsult':   { url: 'https://www.qualiconsult.fr/favicon.ico',                  bg: '#e2001a' },
};

const ORGANISME_INITIALS: Record<string, string> = {
  'APAVE':          'AP',
  'SOCOTEC':        'SC',
  'DEKRA':          'DK',
  'Bureau Veritas': 'BV',
  'Qualiconsult':   'QC',
};

function OrganismeLogo({ nom }: { nom: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  const logo = ORGANISME_LOGOS[nom];
  const initials = ORGANISME_INITIALS[nom] ?? nom.slice(0, 2).toUpperCase();

  if (!logo || imgFailed) {
    return (
      <div className="flex items-center gap-1.5">
        <div
          className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: logo?.bg ?? '#64748b' }}
        >
          <span className="text-white text-[9px] font-bold leading-none">{initials}</span>
        </div>
        <span className="text-xs text-slate-600 whitespace-nowrap">{nom}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: logo.bg }}
      >
        <img
          src={logo.url}
          alt={nom}
          className="w-4 h-4 object-contain"
          onError={() => setImgFailed(true)}
        />
      </div>
      <span className="text-xs text-slate-600 whitespace-nowrap">{nom}</span>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR');
}

function daysUntil(d?: string | null) {
  if (!d) return null;
  return Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// ─── Shared sort Th ──────────────────────────────────────────────────────────

function SortTh<K extends string>({
  label, field, sortKey, sortDir, onSort,
}: {
  label: string; field: K; sortKey: K; sortDir: 'asc' | 'desc';
  onSort: (k: K) => void;
}) {
  const active = sortKey === field;
  return (
    <th
      onClick={() => onSort(field)}
      className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none whitespace-nowrap"
    >
      <span className="flex items-center gap-1">
        {label}
        {active
          ? sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-emerald-500" /> : <ChevronDown className="w-3 h-3 text-emerald-500" />
          : <ChevronUp className="w-3 h-3 opacity-20" />}
      </span>
    </th>
  );
}

function StaticTh({ label }: { label: string }) {
  return (
    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
      {label}
    </th>
  );
}

function ActionButtons() {
  return (
    <div className="flex items-center gap-1">
      <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" title="Voir"><Eye className="w-3.5 h-3.5" /></button>
      <button className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Modifier"><Pencil className="w-3.5 h-3.5" /></button>
      <button className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Supprimer"><Trash2 className="w-3.5 h-3.5" /></button>
    </div>
  );
}

function EmptyRow({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-16 text-center text-slate-400">
        <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
        Aucun résultat
      </td>
    </tr>
  );
}

// ─── Tab: Contrôles ──────────────────────────────────────────────────────────

type SortKeyC = 'type' | 'periodicite' | 'localisation' | 'organisme' | 'dateProchain' | 'statut';

function TabControles({ dbControles, onUpdate, rows: rawRows }: { dbControles: ControleWithMeta[]; onUpdate: () => void; rows: ControleRow[] }) {
  const [selected, setSelected] = useState<ControleWithMeta | null>(null);
  const [sortKey, setSortKey]   = useState<SortKeyC>('dateProchain');
  const [sortDir, setSortDir]   = useState<'asc' | 'desc'>('asc');

  const handleSort = (k: SortKeyC) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('asc'); }
  };

  const rows = useMemo(() => {
    return [...rawRows].sort((a, b) => {
      let va = '', vb = '';
      if (sortKey === 'type')         { va = a.type;         vb = b.type; }
      else if (sortKey === 'periodicite') { va = a.periodicite; vb = b.periodicite; }
      else if (sortKey === 'localisation') { va = a.localisation; vb = b.localisation; }
      else if (sortKey === 'organisme')   { va = a.organisme;    vb = b.organisme; }
      else if (sortKey === 'dateProchain') { va = a.dateProchain ?? ''; vb = b.dateProchain ?? ''; }
      else if (sortKey === 'statut')      { va = a.statut;       vb = b.statut; }
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [rawRows, sortKey, sortDir]);

  const th = (label: string, field: SortKeyC) => (
    <SortTh label={label} field={field} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
  );

  return (
    <>
      <div className="flex-1 overflow-auto min-h-0">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100">
            <tr>
              {th('Type de contrôle', 'type')}
              {th('Périodicité', 'periodicite')}
              <StaticTh label="Localisation" />
              {th('Organisme', 'organisme')}
              {th('Prochain contrôle', 'dateProchain')}
              <StaticTh label="Dernier contrôle" />
              <StaticTh label="Conformité" />
              <StaticTh label="Actions" />
              {th('Statut', 'statut')}
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.length === 0 ? <EmptyRow cols={10} /> : rows.map(row => {
              const cfg  = STATUT_CONFIG[row.statut];
              const days = daysUntil(row.dateProchain);
              const isRetard  = row.statut === 'en_retard';
              const isUrgent  = days !== null && days <= 30 && days >= 0;

              const dbCtrl = dbControles.find(c => c.type_controle?.nom?.includes(row.type.replace(/^[\S]+ /, '')));
              return (
                <tr key={row.id}
                  className={`hover:bg-slate-50/60 cursor-pointer transition-colors ${isRetard ? 'bg-red-50/20' : ''}`}
                  onClick={() => { if (dbCtrl) setSelected(dbCtrl); }}
                >
                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-700 truncate max-w-52 block">{row.type}</span>
                  </td>

                  {/* Périodicité */}
                  <td className="px-4 py-3">
                    {row.periodicite === 'Surveillance 3 ans'
                      ? <span className="text-xs text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full whitespace-nowrap">{row.periodicite}</span>
                      : (PERIODICITES_AMIANTE as readonly string[]).includes(row.periodicite)
                        ? <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">⚡ {row.periodicite}</span>
                        : <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">{row.periodicite}</span>
                    }
                  </td>

                  {/* Localisation */}
                  <td className="px-4 py-3 max-w-[160px]">
                    {(() => {
                      const parts = row.localisation.split(' › ');
                      return (
                        <div className="text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 flex-shrink-0 text-slate-400" />
                            <span className="font-medium text-slate-600 leading-tight">{parts[0]}</span>
                          </div>
                          {parts[1] && (
                            <div className="flex items-center gap-1 mt-0.5 pl-4">
                              <span className="text-slate-300">›</span>
                              <span className="leading-tight">{parts[1]}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </td>

                  {/* Organisme */}
                  <td className="px-4 py-3">
                    <OrganismeLogo nom={row.organisme} />
                  </td>

                  {/* Prochain contrôle */}
                  <td className="px-4 py-3">
                    <div className={`flex items-center gap-1 text-xs ${isRetard ? 'text-red-600 font-semibold' : isUrgent ? 'text-amber-600 font-medium' : 'text-slate-600'}`}>
                      {(isRetard || isUrgent) && <AlertTriangle className="w-3 h-3" />}
                      <Calendar className="w-3 h-3" />
                      {formatDate(row.dateProchain)}
                    </div>
                    {days !== null && (
                      <div className={`text-xs mt-0.5 ${isRetard ? 'text-red-500' : isUrgent ? 'text-amber-500' : 'text-slate-400'}`}>
                        {isRetard ? `${Math.abs(days)} j de retard` : `J-${days}`}
                      </div>
                    )}
                  </td>

                  {/* Dernier contrôle */}
                  <td className="px-4 py-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(row.dateDernier)}
                    </div>
                  </td>

                  {/* Conformité */}
                  <td className="px-4 py-3">
                    {(row.conformes + row.nonConformes > 0) ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
                          <CheckCircle2 className="w-3 h-3" />{row.conformes}
                        </span>
                        {row.nonConformes > 0 && (
                          <span className="flex items-center gap-0.5 text-red-600 font-medium">
                            <XCircle className="w-3 h-3" />{row.nonConformes}
                          </span>
                        )}
                      </div>
                    ) : <span className="text-slate-300 text-xs">—</span>}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    {row.actions > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                        <Wrench className="w-3 h-3" />{row.actions}
                      </span>
                    ) : <span className="text-slate-300 text-xs">—</span>}
                  </td>

                  {/* Statut */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </td>

                  {/* Action buttons */}
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <ActionButtons />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {selected && (
        <ControleDetail controle={selected} onClose={() => setSelected(null)} onUpdate={() => { setSelected(null); onUpdate(); }} />
      )}
    </>
  );
}

// ─── Tab: Points de contrôle ─────────────────────────────────────────────────

type SortKeyP = 'type' | 'localisation' | 'organisme' | 'dateControle' | 'conforme' | 'criticite';

function TabPoints({ rows: rawRows }: { rows: PointRow[] }) {
  const [sortKey, setSortKey] = useState<SortKeyP>('dateControle');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (k: SortKeyP) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('asc'); }
  };

  const rows = useMemo(() => {
    return [...rawRows].sort((a, b) => {
      let va = '', vb = '';
      if (sortKey === 'type')         { va = a.type;          vb = b.type; }
      else if (sortKey === 'localisation') { va = a.localisation;  vb = b.localisation; }
      else if (sortKey === 'organisme')    { va = a.organisme;      vb = b.organisme; }
      else if (sortKey === 'dateControle') { va = a.dateControle;   vb = b.dateControle; }
      else if (sortKey === 'conforme')     { va = String(a.conforme); vb = String(b.conforme); }
      else if (sortKey === 'criticite')    { va = a.criticite;     vb = b.criticite; }
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [rawRows, sortKey, sortDir]);

  const th = (label: string, field: SortKeyP) => (
    <SortTh label={label} field={field} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
  );

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100">
          <tr>
            {th('Type de contrôle', 'type')}
            <StaticTh label="Localisation" />
            {th('Organisme', 'organisme')}
            {th('Date de contrôle', 'dateControle')}
            <StaticTh label="Libellé du point" />
            {th('Conformité', 'conforme')}
            {th('Criticité', 'criticite')}
            <StaticTh label="Actions" />
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.length === 0 ? <EmptyRow cols={9} /> : rows.map(row => {
            const cc = CRITICITE_CFG[row.criticite];
            return (
              <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                {/* Type */}
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-700 truncate max-w-52 block">{row.type}</span>
                </td>

                {/* Localisation */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Building2 className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate max-w-48">{row.localisation}</span>
                  </div>
                </td>

                {/* Organisme */}
                <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{row.organisme}</td>

                {/* Date contrôle */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <Calendar className="w-3 h-3" />
                    {formatDate(row.dateControle)}
                  </div>
                </td>

                {/* Libellé */}
                <td className="px-4 py-3 text-xs text-slate-600 max-w-56">
                  <span className="truncate block">{row.libelle}</span>
                </td>

                {/* Conformité */}
                <td className="px-4 py-3">
                  {row.conforme ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />Conforme
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                      <XCircle className="w-3 h-3" />Non conforme
                    </span>
                  )}
                </td>

                {/* Criticité */}
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${cc.bg} ${cc.text} ${cc.border}`}>
                    {row.criticite}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  {row.actions > 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                      <Wrench className="w-3 h-3" />{row.actions}
                    </span>
                  ) : <span className="text-slate-300 text-xs">—</span>}
                </td>

                {/* Action buttons */}
                <td className="px-4 py-3"><ActionButtons /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Tab: Actions correctives ────────────────────────────────────────────────

type SortKeyA = 'type' | 'localisation' | 'assignation' | 'criticite' | 'statut' | 'echeance';

function TabActions({ rows: rawRows }: { rows: ActionRow[] }) {
  const [sortKey, setSortKey] = useState<SortKeyA>('echeance');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (k: SortKeyA) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('asc'); }
  };

  const rows = useMemo(() => {
    return [...rawRows].sort((a, b) => {
      let va = '', vb = '';
      if (sortKey === 'type')         { va = a.type;         vb = b.type; }
      else if (sortKey === 'localisation') { va = a.localisation; vb = b.localisation; }
      else if (sortKey === 'assignation')  { va = a.assignation;  vb = b.assignation; }
      else if (sortKey === 'criticite')    { va = a.criticite;    vb = b.criticite; }
      else if (sortKey === 'statut')       { va = a.statut;       vb = b.statut; }
      else if (sortKey === 'echeance')     { va = a.echeance;     vb = b.echeance; }
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }, [rawRows, sortKey, sortDir]);

  const th = (label: string, field: SortKeyA) => (
    <SortTh label={label} field={field} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
  );

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100">
          <tr>
            {th('Type de contrôle', 'type')}
            <StaticTh label="Localisation" />
            <StaticTh label="Description" />
            {th('Assignation', 'assignation')}
            {th('Criticité', 'criticite')}
            {th('Statut', 'statut')}
            {th('Échéance', 'echeance')}
            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.length === 0 ? <EmptyRow cols={8} /> : rows.map(row => {
            const sc = STATUT_ACTION_CONFIG[row.statut];
            const cc = CRITICITE_CFG[row.criticite];
            const days = daysUntil(row.echeance);
            const isRetard = row.statut === 'en_retard';
            const isUrgent = days !== null && days <= 14 && days >= 0;
            return (
              <tr key={row.id} className={`hover:bg-slate-50/60 transition-colors ${isRetard ? 'bg-red-50/20' : ''}`}>
                {/* Type */}
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-700 truncate max-w-48 block">{row.type}</span>
                </td>

                {/* Localisation */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Building2 className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate max-w-44">{row.localisation}</span>
                  </div>
                </td>

                {/* Description */}
                <td className="px-4 py-3 text-xs text-slate-600 max-w-56">
                  <span className="truncate block">{row.description}</span>
                </td>

                {/* Assignation */}
                <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">{row.assignation}</td>

                {/* Criticité */}
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${cc.bg} ${cc.text} ${cc.border}`}>
                    {row.criticite}
                  </span>
                </td>

                {/* Statut */}
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {sc.label}
                  </span>
                </td>

                {/* Échéance */}
                <td className="px-4 py-3">
                  <div className={`flex items-center gap-1 text-xs ${isRetard ? 'text-red-600 font-semibold' : isUrgent ? 'text-amber-600 font-medium' : 'text-slate-600'}`}>
                    {(isRetard || isUrgent) && <AlertTriangle className="w-3 h-3" />}
                    <Calendar className="w-3 h-3" />
                    {formatDate(row.echeance)}
                  </div>
                  {days !== null && row.statut !== 'terminees' && (
                    <div className={`text-xs mt-0.5 ${isRetard ? 'text-red-500' : isUrgent ? 'text-amber-500' : 'text-slate-400'}`}>
                      {isRetard ? `${Math.abs(days)} j de retard` : `J-${days}`}
                    </div>
                  )}
                </td>

                {/* Action buttons */}
                <td className="px-4 py-3"><ActionButtons /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Filter helpers ───────────────────────────────────────────────────────────

function matchesTypeFilter(rowType: string, selectedTypes: string[]): boolean {
  if (selectedTypes.length === 0) return true;
  // rowType looks like "🔥 Sécurité incendie" ; selectedTypes look like "Sécurité incendie"
  return selectedTypes.some(t => rowType.includes(t));
}

function matchesSiteFilter(localisation: string, selectedSiteNames: string[]): boolean {
  if (selectedSiteNames.length === 0) return true;
  const loc = localisation.toLowerCase();
  return selectedSiteNames.some(name => loc.includes(name.toLowerCase()));
}

function applyRowFilters<T extends { type: string; localisation: string }>(
  rows: T[],
  selectedTypes: string[],
  selectedSiteNames: string[],
): T[] {
  return rows.filter(r =>
    matchesTypeFilter(r.type, selectedTypes) &&
    matchesSiteFilter(r.localisation, selectedSiteNames),
  );
}

// ─── Active filter chips ───────────────────────────────────────────────────────

function ActiveFilterChips({
  selectedTypes,
  selectedSiteNames,
  totalFiltered,
  totalAll,
}: {
  selectedTypes: string[];
  selectedSiteNames: string[];
  totalFiltered: number;
  totalAll: number;
}) {
  const hasFilters = selectedTypes.length > 0 || selectedSiteNames.length > 0;
  if (!hasFilters) return null;
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50/60 border-b border-blue-100 flex-wrap flex-shrink-0 z-20">
      <Filter className="w-3 h-3 text-blue-400 flex-shrink-0" />
      <span className="text-xs text-blue-600 font-medium">Filtres actifs :</span>
      {selectedTypes.map(t => (
        <span key={t} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
          {t}
        </span>
      ))}
      {selectedSiteNames.map(n => (
        <span key={n} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
          <Building2 className="w-3 h-3" />{n}
        </span>
      ))}
      <span className="ml-auto text-xs text-slate-500">
        {totalFiltered} résultat{totalFiltered !== 1 ? 's' : ''} sur {totalAll}
      </span>
    </div>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'controles', label: 'Contrôles',           icon: ShieldCheck },
  { id: 'points',    label: 'Points de contrôle',  icon: BarChart3   },
  { id: 'actions',   label: 'Actions correctives', icon: Wrench      },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function ReglementaireTableau({ controles, onUpdate, selectedTypes = [], selectedSiteNames = [] }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('controles');

  const filteredControles = useMemo(() => applyRowFilters(MOCK_CONTROLES, selectedTypes, selectedSiteNames), [selectedTypes, selectedSiteNames]);
  const filteredPoints    = useMemo(() => applyRowFilters(MOCK_POINTS,    selectedTypes, selectedSiteNames), [selectedTypes, selectedSiteNames]);
  const filteredActions   = useMemo(() => applyRowFilters(MOCK_ACTIONS,   selectedTypes, selectedSiteNames), [selectedTypes, selectedSiteNames]);

  const activeCount = activeTab === 'controles' ? filteredControles.length
                    : activeTab === 'points'    ? filteredPoints.length
                    : filteredActions.length;
  const activeTotal = activeTab === 'controles' ? MOCK_CONTROLES.length
                    : activeTab === 'points'    ? MOCK_POINTS.length
                    : MOCK_ACTIONS.length;

  const tabCounts: Record<TabId, number> = {
    controles: filteredControles.length,
    points:    filteredPoints.length,
    actions:   filteredActions.length,
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      {/* Tabs */}
      <div className="flex items-end gap-0 px-6 border-b border-slate-100 bg-white flex-shrink-0 z-20">
        {TABS.map(tab => {
          const Icon    = tab.icon;
          const isActive = activeTab === tab.id;
          const count   = tabCounts[tab.id];
          const hasFilter = selectedTypes.length > 0 || selectedSiteNames.length > 0;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
                isActive
                  ? 'border-emerald-500 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                hasFilter && count === 0 ? 'bg-slate-100 text-slate-400'
                : isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active filter chips */}
      <ActiveFilterChips
        selectedTypes={selectedTypes}
        selectedSiteNames={selectedSiteNames}
        totalFiltered={activeCount}
        totalAll={activeTotal}
      />

      {/* Tab content */}
      <div className="flex flex-col flex-1 min-h-0">
        {activeTab === 'controles' && <TabControles dbControles={controles} onUpdate={onUpdate} rows={filteredControles} />}
        {activeTab === 'points'    && <TabPoints rows={filteredPoints} />}
        {activeTab === 'actions'   && <TabActions rows={filteredActions} />}
      </div>
    </div>
  );
}
