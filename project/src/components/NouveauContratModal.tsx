import { useState, useEffect, useRef } from 'react';
import {
  X, ChevronRight, ChevronDown, ChevronUp, Save, Loader2,
  Building2, TreePine, Check, Search, Euro, RefreshCw,
} from 'lucide-react';
import PdfViewer, { PdfViewerHandle } from './reglementaire/PdfViewer';
import { supabase } from '../lib/supabase';

// ─── Asset logos prestataires ─────────────────────────────────────────────────
import logoAlpesControles from '../assets/logo-Alpes-Controles.jpg';
import logoApave          from '../assets/logo-Apave.jpg';
import logoBureauVeritas  from '../assets/logo-Bureau-Veritas.jpg';
import logoDekra          from '../assets/logo-Dekra.jpg';
import logoQualiconsult   from '../assets/logo-Qualiconsult.jpg';
import logoSGS            from '../assets/logo-SGS.jpg';
import logoSOCOTEC        from '../assets/logo-SOCOTEC.png';

const PRESTATAIRE_LOGOS: Record<string, string> = {
  'alpes contrôles':  logoAlpesControles,
  'apave':            logoApave,
  'bureau veritas':   logoBureauVeritas,
  'dekra industrial': logoDekra,
  'qualiconsult':     logoQualiconsult,
  'sgs france':       logoSGS,
  'socotec':          logoSOCOTEC,
};
const getPresLogo = (nom: string) =>
  PRESTATAIRE_LOGOS[nom.toLowerCase()] ?? null;

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContratTypeKey =
  | 'p1' | 'p2' | 'p3' | 'p5' | 'p6' | 'interessement'
  | 'incendie' | 'electricite' | 'ascenseurs' | 'amiante'
  | 'legionelle' | 'climatisation';

interface ContratTypeDef {
  key:         ContratTypeKey;
  emoji:       string;
  label:       string;
  description: string;
  group:       'standard' | 'reglementaire';
}

const CONTRAT_TYPES: ContratTypeDef[] = [
  { key: 'p1',           emoji: '🔥', label: 'P1 — Fourniture énergie',      description: 'Gaz, combustible, chauffage urbain',            group: 'standard'      },
  { key: 'p2',           emoji: '🔧', label: 'P2 — Maintenance',             description: 'Maintenance préventive/corrective, astreinte',  group: 'standard'      },
  { key: 'p3',           emoji: '🏗',  label: 'P3 — Gros entretien',         description: 'Remplacement et renouvellement équipements',    group: 'standard'      },
  { key: 'p5',           emoji: '⚡', label: 'P5 — Travaux amélioration',    description: 'Optimisation / modernisation',                   group: 'standard'      },
  { key: 'p6',           emoji: '📈', label: 'P6 — Performance énergétique', description: 'Engagement résultats, bonus/malus KPI',          group: 'standard'      },
  { key: 'interessement',emoji: '🤝', label: 'Marché à intéressement',       description: 'Rémunération partielle selon performance',       group: 'standard'      },
  { key: 'incendie',     emoji: '🔥', label: 'Sécurité incendie',            description: 'SSI, extincteurs, désenfumage',                 group: 'reglementaire' },
  { key: 'electricite',  emoji: '⚡', label: 'Contrôles électriques',        description: 'Vérifications réglementaires périodiques',      group: 'reglementaire' },
  { key: 'ascenseurs',   emoji: '🛗', label: 'Ascenseurs / levage',          description: 'Organismes agréés, vérifications obligatoires', group: 'reglementaire' },
  { key: 'amiante',      emoji: '😷', label: 'Amiante / DTA',                description: 'Diagnostics, repérage, suivi',                  group: 'reglementaire' },
  { key: 'legionelle',   emoji: '💧', label: 'Légionelle / ECS',             description: 'Contrôles sanitaires eau chaude',               group: 'reglementaire' },
  { key: 'climatisation',emoji: '❄',  label: 'Climatisation / F-Gaz',       description: 'Obligations réglementaires fluides frigorigènes',group: 'reglementaire' },
];

// ─── Statuts & criticité avec couleurs ───────────────────────────────────────

const STATUTS: { value: string; label: string; color: string }[] = [
  { value: 'actif',               label: 'Actif',                 color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  { value: 'en_cours_signature',  label: 'En cours de signature', color: 'bg-blue-100 text-blue-700 border-blue-300'          },
  { value: 'suspendu',            label: 'Suspendu',              color: 'bg-amber-100 text-amber-700 border-amber-300'        },
  { value: 'resilie',             label: 'Résilié',               color: 'bg-red-100 text-red-700 border-red-300'             },
  { value: 'expire',              label: 'Expiré',                color: 'bg-slate-100 text-slate-500 border-slate-300'        },
];

const CRITICITES: { value: string; label: string; color: string }[] = [
  { value: 'haute',   label: 'Haute',   color: 'bg-red-100 text-red-700 border-red-300'         },
  { value: 'normale', label: 'Normale', color: 'bg-amber-100 text-amber-700 border-amber-300'   },
  { value: 'basse',   label: 'Basse',   color: 'bg-slate-100 text-slate-500 border-slate-300'   },
];

// ─── Étape 1 : Choix du type ──────────────────────────────────────────────────

function Step1({
  selected, onSelect, onNext, onClose,
}: {
  selected: ContratTypeKey | null;
  onSelect: (k: ContratTypeKey) => void;
  onNext:   () => void;
  onClose:  () => void;
}) {
  const standards     = CONTRAT_TYPES.filter(t => t.group === 'standard');
  const reglementaire = CONTRAT_TYPES.filter(t => t.group === 'reglementaire');

  const Card = ({ t }: { t: ContratTypeDef }) => {
    const active = selected === t.key;
    return (
      <button
        onClick={() => onSelect(t.key)}
        className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 text-center transition-all
          ${active
            ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100'
            : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-sm'
          }`}
      >
        <span className="text-3xl leading-none">{t.emoji}</span>
        <span className={`text-xs font-semibold leading-snug ${active ? 'text-emerald-700' : 'text-slate-700'}`}>{t.label}</span>
        <span className="text-[10px] text-slate-400 leading-tight">{t.description}</span>
        {active && (
          <span className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-white" />
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
        <div>
          <p className="text-[11px] font-bold text-emerald-600 tracking-widest uppercase mb-0.5">NOUVEAU CONTRAT — ÉTAPE 1/2</p>
          <h2 className="text-lg font-semibold text-slate-800">Choisir le type de contrat</h2>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Contrats standards</p>
          <div className="grid grid-cols-3 gap-3">{standards.map(t => <Card key={t.key} t={t} />)}</div>
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Contrats réglementaires</p>
          <div className="grid grid-cols-3 gap-3">{reglementaire.map(t => <Card key={t.key} t={t} />)}</div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center flex-shrink-0">
        <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">Annuler</button>
        <button
          onClick={onNext}
          disabled={!selected}
          className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          Suivant <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Hooks Supabase ───────────────────────────────────────────────────────────

interface Prestataire { id: string; nom: string; categorie: string; }
interface Agent       { id: string; nom: string; prenom: string; poste: string; service: string; }

interface SiteNode     { id: string; nom: string; residences: ResidenceNode[]; }
interface ResidenceNode{ id: string; nom: string; site_id: string; batiments: BatimentNode[]; }
interface BatimentNode { id: string; nom: string; residence_id: string; etages: EtageNode[]; }
interface EtageNode    { id: string; nom: string; batiment_id: string; }

function usePrestataires() {
  const [list, setList] = useState<Prestataire[]>([]);
  useEffect(() => {
    supabase.from('prestataires').select('id, nom, categorie').eq('actif', true).order('nom')
      .then(({ data }) => setList(data ?? []));
  }, []);
  return list;
}

function useAgents() {
  const [list, setList] = useState<Agent[]>([]);
  useEffect(() => {
    supabase.from('agents_internes').select('id, nom, prenom, poste, service').eq('actif', true).order('nom')
      .then(({ data }) => setList(data ?? []));
  }, []);
  return list;
}

function useSiteTree() {
  const [tree, setTree] = useState<SiteNode[]>([]);
  useEffect(() => {
    Promise.all([
      supabase.from('sites').select('id, nom').order('nom'),
      supabase.from('residences').select('id, nom, site_id').order('nom'),
      supabase.from('batiments').select('id, nom, residence_id').order('nom'),
      supabase.from('etages').select('id, nom, batiment_id').order('nom'),
    ]).then(([s, r, b, e]) => {
      const sites = s.data ?? [], residences = r.data ?? [], batiments = b.data ?? [], etages = e.data ?? [];
      setTree(sites.map(site => ({
        ...site,
        residences: residences.filter(res => res.site_id === site.id).map(res => ({
          ...res,
          batiments: batiments.filter(bat => bat.residence_id === res.id).map(bat => ({
            ...bat,
            etages: etages.filter(et => et.batiment_id === bat.id),
          })),
        })),
      })));
    });
  }, []);
  return tree;
}

// ─── Treeview ─────────────────────────────────────────────────────────────────

type NodeType = 'site' | 'residence' | 'batiment' | 'etage';
interface SelectedNode { id: string; nom: string; type: NodeType; }

function SiteTreeModal({ onClose, onConfirm, initial }: {
  onClose:   () => void;
  onConfirm: (nodes: SelectedNode[]) => void;
  initial:   SelectedNode[];
}) {
  const tree = useSiteTree();
  const [selected, setSelected] = useState<Set<string>>(new Set(initial.map(n => n.id)));
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search,   setSearch]   = useState('');

  const allIds = (node: SiteNode | ResidenceNode | BatimentNode): string[] => {
    if ('residences' in node) return [node.id, ...node.residences.flatMap(allIds)];
    if ('batiments' in node)  return [node.id, ...node.batiments.flatMap(allIds)];
    return [node.id, ...(node as BatimentNode).etages.map(e => e.id)];
  };

  const toggleNode = (childIds: string[]) => {
    setSelected(prev => {
      const n = new Set(prev);
      childIds.every(i => n.has(i)) ? childIds.forEach(i => n.delete(i)) : childIds.forEach(i => n.add(i));
      return n;
    });
  };
  const toggleExpand = (id: string) =>
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const isPartial = (ids: string[]) => ids.some(i => selected.has(i)) && !ids.every(i => selected.has(i));

  const handleConfirm = () => {
    const nodes: SelectedNode[] = [];
    tree.forEach(site => {
      if (selected.has(site.id)) nodes.push({ id: site.id, nom: site.nom, type: 'site' });
      site.residences.forEach(res => {
        if (selected.has(res.id)) nodes.push({ id: res.id, nom: res.nom, type: 'residence' });
        res.batiments.forEach(bat => {
          if (selected.has(bat.id)) nodes.push({ id: bat.id, nom: bat.nom, type: 'batiment' });
          bat.etages.forEach(et => {
            if (selected.has(et.id)) nodes.push({ id: et.id, nom: et.nom, type: 'etage' });
          });
        });
      });
    });
    onConfirm(nodes);
  };

  const indent = (level: number) => ({ paddingLeft: `${level * 16 + 8}px` });
  const filtered = search
    ? tree.filter(s => s.nom.toLowerCase().includes(search.toLowerCase()) ||
        s.residences.some(r => r.nom.toLowerCase().includes(search.toLowerCase()) ||
          r.batiments.some(b => b.nom.toLowerCase().includes(search.toLowerCase()))))
    : tree;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <TreePine className="w-4 h-4 text-emerald-600" />
            <h3 className="font-semibold text-slate-800 text-sm">Sélectionner les sites / périmètre</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-4 py-2 border-b border-slate-100 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {filtered.map(site => {
            const siteIds    = allIds(site);
            const siteOpen   = expanded.has(site.id);
            const siteParti  = isPartial(siteIds);
            return (
              <div key={site.id}>
                <div style={indent(0)} className="flex items-center gap-1.5 py-1 hover:bg-slate-50 pr-3">
                  <input type="checkbox" checked={siteIds.every(i => selected.has(i))}
                    ref={el => { if (el) el.indeterminate = siteParti; }}
                    onChange={() => toggleNode(siteIds)} onClick={e => e.stopPropagation()}
                    className="accent-emerald-600 w-3.5 h-3.5 flex-shrink-0" />
                  <button className="flex items-center gap-1 flex-1 text-left" onClick={() => toggleExpand(site.id)}>
                    <Building2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="text-xs font-semibold text-slate-700 flex-1">{site.nom}</span>
                    {siteOpen ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                  </button>
                </div>
                {siteOpen && site.residences.map(res => {
                  const resIds   = allIds(res);
                  const resOpen  = expanded.has(res.id);
                  const resParti = isPartial(resIds);
                  return (
                    <div key={res.id}>
                      <div style={indent(1)} className="flex items-center gap-1.5 py-1 hover:bg-slate-50 pr-3">
                        <input type="checkbox" checked={resIds.every(i => selected.has(i))}
                          ref={el => { if (el) el.indeterminate = resParti; }}
                          onChange={() => toggleNode(resIds)} onClick={e => e.stopPropagation()}
                          className="accent-emerald-600 w-3.5 h-3.5 flex-shrink-0" />
                        <button className="flex items-center gap-1 flex-1 text-left" onClick={() => toggleExpand(res.id)}>
                          <span className="text-[10px] text-slate-400">🏠</span>
                          <span className="text-xs text-slate-700 flex-1">{res.nom}</span>
                          {resOpen ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                        </button>
                      </div>
                      {resOpen && res.batiments.map(bat => {
                        const batIds   = [bat.id, ...bat.etages.map(e => e.id)];
                        const batOpen  = expanded.has(bat.id);
                        const batParti = isPartial(batIds);
                        return (
                          <div key={bat.id}>
                            <div style={indent(2)} className="flex items-center gap-1.5 py-1 hover:bg-slate-50 pr-3">
                              <input type="checkbox" checked={batIds.every(i => selected.has(i))}
                                ref={el => { if (el) el.indeterminate = batParti; }}
                                onChange={() => toggleNode(batIds)} onClick={e => e.stopPropagation()}
                                className="accent-emerald-600 w-3.5 h-3.5 flex-shrink-0" />
                              <button className="flex items-center gap-1 flex-1 text-left" onClick={() => toggleExpand(bat.id)}>
                                <span className="text-[10px] text-slate-400">🏢</span>
                                <span className="text-xs text-slate-600 flex-1">{bat.nom}</span>
                                {batOpen ? <ChevronUp className="w-3 h-3 text-slate-400" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
                              </button>
                            </div>
                            {batOpen && bat.etages.map(et => (
                              <div key={et.id} style={indent(3)} className="flex items-center gap-1.5 py-0.5 hover:bg-slate-50 pr-3">
                                <input type="checkbox" checked={selected.has(et.id)}
                                  onChange={() => toggleNode([et.id])}
                                  className="accent-emerald-600 w-3.5 h-3.5 flex-shrink-0" />
                                <span className="text-[10px] text-slate-400 flex-shrink-0">—</span>
                                <span className="text-xs text-slate-500">{et.nom}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="px-5 py-3 border-t border-slate-100 flex justify-between items-center flex-shrink-0">
          <span className="text-xs text-slate-500">{selected.size} sélectionné{selected.size !== 1 ? 's' : ''}</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Annuler</button>
            <button onClick={handleConfirm}
              className="px-4 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium">Confirmer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Composant Récurrence ─────────────────────────────────────────────────────

type RecurrenceFreq = 'quotidienne' | 'hebdomadaire' | 'mensuelle' | 'annuelle';
type RecurrenceFin  = 'occurrences' | 'date';

interface RecurrenceConfig {
  active:         boolean;
  frequence:      RecurrenceFreq;
  // mensuelle
  modeJour:       'numero' | 'relatif'; // "Jour n°6 du mois" ou "Premier Lundi du mois"
  jourNumero:     number;               // 1–31
  ordinalOrd:     string;              // Premier, Deuxième…
  ordinalJour:    string;              // Lundi, Mardi…
  // hebdomadaire
  joursHebdo:     string[];
  // tous les X
  intervalleVal:  number;
  // fin
  finMode:        RecurrenceFin;
  finOccurrences: number;
  finDate:        string;
}

const JOURS_SEMAINE = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const ORDINAUX = ['Premier', 'Deuxième', 'Troisième', 'Quatrième', 'Dernier'];

function RecurrencePanel({
  config,
  onChange,
  dateDebut,
}: {
  config:    RecurrenceConfig;
  onChange:  (c: RecurrenceConfig) => void;
  dateDebut: string;
}) {
  const set = (patch: Partial<RecurrenceConfig>) => onChange({ ...config, ...patch });

  const freqLabel = {
    quotidienne: 'Jour',
    hebdomadaire: 'Semaine(s)',
    mensuelle: 'Mois',
    annuelle: 'An(s)',
  }[config.frequence];

  const freqTabs: { key: RecurrenceFreq; label: string }[] = [
    { key: 'quotidienne',  label: 'Quotidienne'  },
    { key: 'hebdomadaire', label: 'Hebdomadaire' },
    { key: 'mensuelle',    label: 'Mensuelle'    },
    { key: 'annuelle',     label: 'Annuelle'     },
  ];

  const btnNumCls = "w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center justify-center transition-colors select-none";

  return (
    <div className="space-y-3 pt-1">
      {/* Toggle activation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[11px] font-semibold text-slate-600">Récurrence</span>
        </div>
        <button
          type="button"
          onClick={() => set({ active: !config.active })}
          className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${config.active ? 'bg-emerald-500' : 'bg-slate-200'}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${config.active ? 'left-4' : 'left-0.5'}`} />
        </button>
      </div>

      {config.active && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3">
          {/* Fréquence — onglets */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Paramétrage des récurrences</p>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-white">
              {freqTabs.map(f => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => set({ frequence: f.key })}
                  className={`flex-1 py-1.5 text-[11px] font-medium transition-colors
                    ${config.frequence === f.key
                      ? 'bg-slate-200 text-slate-800'
                      : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Options selon fréquence */}
          {config.frequence === 'mensuelle' && (
            <div className="space-y-2">
              {/* Jour n° */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="modeJour" checked={config.modeJour === 'numero'}
                  onChange={() => set({ modeJour: 'numero' })}
                  className="accent-emerald-600 w-3.5 h-3.5" />
                <span className="text-xs text-slate-600 font-medium">Jour n°</span>
                <div className="flex items-center gap-1 ml-1">
                  <button type="button" onClick={() => set({ jourNumero: Math.max(1, config.jourNumero - 1) })} className={btnNumCls}>−</button>
                  <span className="w-8 text-center text-xs font-semibold text-slate-700">{config.jourNumero}</span>
                  <button type="button" onClick={() => set({ jourNumero: Math.min(31, config.jourNumero + 1) })} className={btnNumCls}>+</button>
                </div>
                <span className="text-xs text-slate-400">Du mois</span>
              </label>
              {/* Chaque */}
              <label className="flex items-center gap-2 cursor-pointer flex-wrap">
                <input type="radio" name="modeJour" checked={config.modeJour === 'relatif'}
                  onChange={() => set({ modeJour: 'relatif' })}
                  className="accent-emerald-600 w-3.5 h-3.5" />
                <span className="text-xs text-slate-600 font-medium">Chaque</span>
                <select value={config.ordinalOrd} onChange={e => set({ ordinalOrd: e.target.value })}
                  disabled={config.modeJour !== 'relatif'}
                  className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none disabled:opacity-40">
                  {ORDINAUX.map(o => <option key={o}>{o}</option>)}
                </select>
                <select value={config.ordinalJour} onChange={e => set({ ordinalJour: e.target.value })}
                  disabled={config.modeJour !== 'relatif'}
                  className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none disabled:opacity-40">
                  {JOURS_SEMAINE.map(j => <option key={j}>{j}</option>)}
                </select>
                <span className="text-xs text-slate-400">Du mois</span>
              </label>
            </div>
          )}

          {config.frequence === 'hebdomadaire' && (
            <div>
              <p className="text-[10px] text-slate-500 mb-1.5">Jours de la semaine</p>
              <div className="flex gap-1 flex-wrap">
                {JOURS_SEMAINE.map(j => (
                  <button key={j} type="button"
                    onClick={() => {
                      const cur = config.joursHebdo;
                      set({ joursHebdo: cur.includes(j) ? cur.filter(x => x !== j) : [...cur, j] });
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors
                      ${config.joursHebdo.includes(j)
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300'
                      }`}
                  >
                    {j.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tous les N */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Tous les</span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => set({ intervalleVal: Math.max(1, config.intervalleVal - 1) })} className={btnNumCls}>−</button>
              <span className="w-8 text-center text-xs font-semibold text-slate-700">{config.intervalleVal}</span>
              <button type="button" onClick={() => set({ intervalleVal: config.intervalleVal + 1 })} className={btnNumCls}>+</button>
            </div>
            <span className="text-xs text-slate-500">{freqLabel}</span>
          </div>

          {/* Fin de récurrence */}
          <div className="border-t border-slate-200 pt-3 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fin de récurrence</p>
            {/* Au bout de N occurrences */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="finMode" checked={config.finMode === 'occurrences'}
                onChange={() => set({ finMode: 'occurrences' })}
                className="accent-emerald-600 w-3.5 h-3.5" />
              <span className="text-xs text-slate-600 font-medium">Au bout de</span>
              <div className="flex items-center gap-1">
                <button type="button"
                  disabled={config.finMode !== 'occurrences'}
                  onClick={() => set({ finOccurrences: Math.max(1, config.finOccurrences - 1) })}
                  className={btnNumCls + ' disabled:opacity-40'}>−</button>
                <span className={`w-8 text-center text-xs font-semibold ${config.finMode !== 'occurrences' ? 'text-slate-300' : 'text-slate-700'}`}>
                  {config.finOccurrences}
                </span>
                <button type="button"
                  disabled={config.finMode !== 'occurrences'}
                  onClick={() => set({ finOccurrences: config.finOccurrences + 1 })}
                  className={btnNumCls + ' disabled:opacity-40'}>+</button>
              </div>
              <span className="text-xs text-slate-400">Occurrences</span>
            </label>
            {/* Jusqu'au */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="radio" name="finMode" checked={config.finMode === 'date'}
                onChange={() => set({ finMode: 'date' })}
                className="accent-emerald-600 w-3.5 h-3.5 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-medium">Jusqu'au</span>
                  <input type="date" value={config.finDate}
                    disabled={config.finMode !== 'date'}
                    onChange={e => set({ finDate: e.target.value })}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none disabled:opacity-40" />
                  <button type="button"
                    disabled={config.finMode !== 'date'}
                    onClick={() => set({ finDate: new Date().toISOString().split('T')[0] })}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 disabled:opacity-40 font-medium">
                    Aujourd'hui
                  </button>
                </div>
                {dateDebut && config.finMode === 'date' && (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Date minimale : {new Date(dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Petits composants UI ─────────────────────────────────────────────────────

function Accordeon({ title, color, badge, open, onToggle, children }: {
  title: string; color: string; badge?: React.ReactNode;
  open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${color}`} />
          <span className="text-sm font-semibold text-slate-700">{title}</span>
          {badge}
        </div>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
      </button>
      {open && <div className="px-4 py-3 border-t border-slate-100 bg-white space-y-3">{children}</div>}
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-slate-500 mb-1 block">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls  = "w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 bg-white";
const selectCls = inputCls;

// ─── Selects colorés (Statut / Criticité) ────────────────────────────────────

function ColoredSelect({ value, onChange, options }: {
  value:    string;
  onChange: (v: string) => void;
  options:  { value: string; label: string; color: string }[];
}) {
  const cur = options.find(o => o.value === value);
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`w-full border rounded-lg pl-3 pr-8 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 appearance-none cursor-pointer
          ${cur?.color ?? 'border-slate-200 bg-white text-slate-700'}`}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-current opacity-60" />
    </div>
  );
}

// ─── Dropdown Prestataire avec logo ──────────────────────────────────────────

function PresDropdown({ value, onChange, options, placeholder }: {
  value:       string;
  onChange:    (id: string) => void;
  options:     Prestataire[];
  placeholder: string;
}) {
  const [open, setOpen]     = useState(false);
  const [q,    setQ]        = useState('');
  const ref                  = useRef<HTMLDivElement>(null);
  const current              = options.find(p => p.id === value);
  const filtered             = q ? options.filter(p => p.nom.toLowerCase().includes(q.toLowerCase())) : options;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white hover:border-emerald-300 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-left"
      >
        {current ? (
          <>
            {getPresLogo(current.nom)
              ? <img src={getPresLogo(current.nom)!} alt="" className="h-5 w-8 object-contain flex-shrink-0" />
              : <span className="w-8 h-5 rounded bg-slate-100 flex items-center justify-center text-[9px] text-slate-400 font-bold flex-shrink-0">{current.nom.slice(0,2).toUpperCase()}</span>
            }
            <span className="flex-1 font-medium text-slate-700">{current.nom}</span>
          </>
        ) : (
          <span className="text-slate-400 flex-1">{placeholder}</span>
        )}
        <ChevronDown className="w-3 h-3 text-slate-400 flex-shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
          <div className="px-2 pt-2 pb-1">
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher..."
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
          </div>
          <div className="max-h-48 overflow-y-auto pb-1">
            <button type="button" onClick={() => { onChange(''); setOpen(false); setQ(''); }}
              className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-50 transition-colors">
              — Aucun —
            </button>
            {filtered.map(p => {
              const logo = getPresLogo(p.nom);
              return (
                <button key={p.id} type="button"
                  onClick={() => { onChange(p.id); setOpen(false); setQ(''); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-emerald-50 transition-colors
                    ${p.id === value ? 'bg-emerald-50' : ''}`}
                >
                  {logo
                    ? <img src={logo} alt="" className="h-5 w-8 object-contain flex-shrink-0" />
                    : <span className="w-8 h-5 rounded bg-slate-100 flex items-center justify-center text-[9px] text-slate-400 font-bold flex-shrink-0">{p.nom.slice(0,2).toUpperCase()}</span>
                  }
                  <div className="flex-1 text-left">
                    <p className="font-medium text-slate-700">{p.nom}</p>
                    {p.categorie && <p className="text-[10px] text-slate-400">{p.categorie}</p>}
                  </div>
                  {p.id === value && <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Multi-select prestataires avec logo (sous-traitants) ────────────────────

function PresMultiSelect({ values, onChange, options, exclude }: {
  values:  string[];
  onChange: (ids: string[]) => void;
  options:  Prestataire[];
  exclude?: string;
}) {
  const available = options.filter(p => p.id !== exclude);
  const toggle    = (id: string) =>
    onChange(values.includes(id) ? values.filter(x => x !== id) : [...values, id]);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden max-h-36 overflow-y-auto">
      {available.map(p => {
        const logo    = getPresLogo(p.nom);
        const checked = values.includes(p.id);
        return (
          <label key={p.id}
            className={`flex items-center gap-2.5 px-3 py-1.5 cursor-pointer transition-colors border-b border-slate-50 last:border-0
              ${checked ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
          >
            <input type="checkbox" checked={checked} onChange={() => toggle(p.id)}
              className="accent-emerald-600 w-3 h-3 flex-shrink-0" />
            {logo
              ? <img src={logo} alt="" className="h-4 w-7 object-contain flex-shrink-0" />
              : <span className="w-7 h-4 rounded bg-slate-100 flex items-center justify-center text-[9px] text-slate-400 font-bold flex-shrink-0">{p.nom.slice(0,2).toUpperCase()}</span>
            }
            <span className="text-[11px] text-slate-600 font-medium">{p.nom}</span>
          </label>
        );
      })}
    </div>
  );
}

// ─── Étape 2 : Qualification ──────────────────────────────────────────────────

const CENTRES_COUT = [
  'CRC-001 — Campus La Doua / Villeurbanne',
  'CRC-002 — Campus Manufacture des Tabacs',
  'CRC-003 — Campus Rockefeller / Laënnec',
  'CRC-004 — Campus Centre / Lyon 6',
  'CRC-005 — Campus Porte des Alpes (Bron)',
  'CRC-006 — Campus ENS Lyon / Gerland',
  'CRC-007 — Campus Lyon 5 — Saint-Just',
  "CRC-008 — Campus Lyon Centre / Presqu'île",
  'CRC-009 — Campus Lyon Centre / Lyon 6',
  'CRC-010 — Campus Bourg-en-Bresse',
  'CRC-011 — Campus Saint-Étienne',
  'CRC-012 — Campus Roanne',
  'CRC-013 — Campus Grenoble Nord',
  'CRC-099 — CROUS Lyon — Siège',
];

const CATEGORIES_EQ = [
  'Ascenseurs', 'Chauffage', 'Climatisation', 'Eau sanitaire',
  'Électricité', 'Gaz', 'Sécurité incendie', 'Ventilation',
  'Structure bâtiment', 'Électroménager',
];

const DEFAULT_RECURRENCE: RecurrenceConfig = {
  active: false, frequence: 'annuelle',
  modeJour: 'numero', jourNumero: 1,
  ordinalOrd: 'Premier', ordinalJour: 'Lundi',
  joursHebdo: [],
  intervalleVal: 1,
  finMode: 'date', finOccurrences: 1, finDate: '',
};

function Step2({ typeKey, typeLabel, typeEmoji, onBack, onClose, onSaved }: {
  typeKey:   ContratTypeKey;
  typeLabel: string;
  typeEmoji: string;
  onBack:    () => void;
  onClose:   () => void;
  onSaved:   () => void;
}) {
  const pdfRef   = useRef<PdfViewerHandle>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const prestataires = usePrestataires();
  const agents       = useAgents();

  const [acc1Open, setAcc1Open] = useState(true);
  const [acc2Open, setAcc2Open] = useState(false);
  const [acc3Open, setAcc3Open] = useState(false);

  // — Accordéon 1 : Contrat —
  const [reference,      setReference]      = useState('');
  const [intitule,       setIntitule]        = useState('');
  const [statut,         setStatut]          = useState('actif');
  const [criticite,      setCriticite]       = useState('normale');
  const [titulaire,      setTitulaire]       = useState('');
  const [sousTraitants,  setSousTraitants]   = useState<string[]>([]);
  const [referentNom,    setReferentNom]     = useState('');
  const [responsable,    setResponsable]     = useState('');
  const [selectedSites,  setSelectedSites]   = useState<SelectedNode[]>([]);
  const [showTree,       setShowTree]        = useState(false);
  const [categoriesEq,   setCategoriesEq]    = useState<string[]>([]);

  // — Accordéon 2 : Période —
  const [dateDebut,      setDateDebut]       = useState('');
  const [dateFin,        setDateFin]         = useState('');
  const [preavis,        setPreavis]         = useState('90');
  const [nbReconductions,setNbReconductions] = useState('');
  const [reconduction,   setReconduction]    = useState(false);
  const [alertesAuto,    setAlertesAuto]     = useState(true);
  const [prochaineEch,   setProchaineEch]    = useState('');
  const [recurrence,     setRecurrence]      = useState<RecurrenceConfig>(DEFAULT_RECURRENCE);

  // — Accordéon 3 : Budget —
  const [montantAnnuel,  setMontantAnnuel]   = useState('');
  const [montantMax,     setMontantMax]      = useState('');
  const [centreCout,     setCentreCout]      = useState('');
  const [budgetImputable,setBudgetImputable] = useState(false);
  const [revisionTarifaire, setRevisionTarifaire] = useState('');

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('contrats').insert([{
      reference:         reference || null,
      nom:               intitule,
      type_contrat:      typeKey,
      statut,
      prestataire:       prestataires.find(p => p.id === titulaire)?.nom ?? titulaire,
      date_debut:        dateDebut  || null,
      date_fin:          dateFin    || null,
      type_reconduction: reconduction ? 'tacite' : 'sans_reconduction',
      montant_annuel:    montantAnnuel ? parseFloat(montantAnnuel) : null,
      alerte_echeance:   alertesAuto,
    }]);
    setSaving(false);
    if (!error) onSaved();
  };

  const toggleCatEq = (c: string) =>
    setCategoriesEq(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <p className="text-[11px] font-bold text-emerald-600 tracking-widest uppercase">NOUVEAU CONTRAT — ÉTAPE 2/2</p>
            <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              <span>{typeEmoji}</span> {typeLabel}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><X className="w-4 h-4" /></button>
        </div>

        {/* Corps : PDF (large) + Formulaire */}
        <div className="flex-1 flex overflow-hidden">

          {/* Colonne gauche : PDF — 58% */}
          <div className="w-[58%] border-r border-slate-100 p-4 flex flex-col min-h-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">DOCUMENT CONTRAT — PDF</p>
            <div className="flex-1 min-h-0">
              <PdfViewer ref={pdfRef} file={pdfFile} onFileChange={setPdfFile} uploadLabel="Déposer le contrat" />
            </div>
          </div>

          {/* Colonne droite : accordéons — 42% */}
          <div className="w-[42%] overflow-y-auto p-4 space-y-2.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SAISIE</p>

            {/* ── Accordéon 1 — Contrat ── */}
            <Accordeon title="1 — Contrat" color="bg-blue-500" open={acc1Open} onToggle={() => setAcc1Open(v => !v)}>

              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identification</p>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Référence contrat">
                  <input value={reference} onChange={e => setReference(e.target.value)}
                    placeholder="CTR-2025-XXX" className={inputCls + ' font-mono'} />
                </Field>
                <Field label="Type contrat">
                  <input value={`${typeEmoji} ${typeLabel}`} readOnly
                    className={inputCls + ' bg-slate-50 text-slate-500 cursor-default'} />
                </Field>
              </div>
              <Field label="Intitulé contrat" required>
                <input value={intitule} onChange={e => setIntitule(e.target.value)}
                  placeholder="Ex : Vérification périodique installations électriques" className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Statut">
                  <ColoredSelect value={statut} onChange={setStatut} options={STATUTS} />
                </Field>
                <Field label="Criticité">
                  <ColoredSelect value={criticite} onChange={setCriticite} options={CRITICITES} />
                </Field>
              </div>

              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">Prestataire</p>
              <Field label="Titulaire marché" required>
                <PresDropdown value={titulaire} onChange={setTitulaire} options={prestataires} placeholder="Sélectionner un prestataire..." />
              </Field>
              <Field label="Sous-traitants">
                <PresMultiSelect values={sousTraitants} onChange={setSousTraitants} options={prestataires} exclude={titulaire} />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Référent prestataire">
                  <input value={referentNom} onChange={e => setReferentNom(e.target.value)}
                    placeholder="Nom, prénom" className={inputCls} />
                </Field>
                <Field label="Responsable interne">
                  <select value={responsable} onChange={e => setResponsable(e.target.value)} className={selectCls}>
                    <option value="">Sélectionner...</option>
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.prenom} {a.nom} — {a.poste}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">Périmètre</p>
              <Field label="Sites / Périmètre">
                <div className="flex gap-1">
                  <div className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs min-h-[28px] bg-slate-50 flex flex-wrap gap-1">
                    {selectedSites.length === 0
                      ? <span className="text-slate-400">Aucun site sélectionné</span>
                      : selectedSites.slice(0, 3).map(n => (
                          <span key={n.id} className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                            {n.nom}
                            <button onClick={() => setSelectedSites(prev => prev.filter(x => x.id !== n.id))}><X className="w-2.5 h-2.5" /></button>
                          </span>
                        ))
                    }
                    {selectedSites.length > 3 && <span className="text-[10px] text-slate-400">+{selectedSites.length - 3} autres</span>}
                  </div>
                  <button type="button" onClick={() => setShowTree(true)}
                    className="flex-shrink-0 p-1.5 border border-slate-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-colors">
                    <TreePine className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </Field>

              <Field label="Catégories d'équipements">
                <div className="flex flex-wrap gap-1">
                  {CATEGORIES_EQ.map(c => (
                    <button key={c} type="button" onClick={() => toggleCatEq(c)}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors
                        ${categoriesEq.includes(c)
                          ? 'bg-blue-100 text-blue-700 border-blue-300'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300'
                        }`}
                    >{c}</button>
                  ))}
                </div>
              </Field>
            </Accordeon>

            {/* ── Accordéon 2 — Période & Échéances ── */}
            <Accordeon title="2 — Période & échéances" color="bg-amber-500" open={acc2Open} onToggle={() => setAcc2Open(v => !v)}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Validité</p>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Date début" required>
                  <input type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} className={inputCls} />
                </Field>
                <Field label="Date fin" required>
                  <input type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} className={inputCls} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Préavis résiliation (jours)">
                  <input type="number" value={preavis} onChange={e => setPreavis(e.target.value)} placeholder="90" className={inputCls} />
                </Field>
                <Field label="Reconductions max">
                  <input type="number" value={nbReconductions} onChange={e => setNbReconductions(e.target.value)} placeholder="3" className={inputCls} />
                </Field>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <label className="text-[11px] font-medium text-slate-500">Reconduction automatique</label>
                <button type="button" onClick={() => setReconduction(v => !v)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${reconduction ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${reconduction ? 'left-4' : 'left-0.5'}`} />
                </button>
              </div>

              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">Échéances</p>
              <Field label="Prochaine échéance">
                <input type="date" value={prochaineEch} onChange={e => setProchaineEch(e.target.value)} className={inputCls} />
              </Field>
              <div className="flex items-center justify-between py-0.5">
                <label className="text-[11px] font-medium text-slate-500">Alertes automatiques</label>
                <button type="button" onClick={() => setAlertesAuto(v => !v)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${alertesAuto ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${alertesAuto ? 'left-4' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Récurrence */}
              <RecurrencePanel config={recurrence} onChange={setRecurrence} dateDebut={dateDebut} />
            </Accordeon>

            {/* ── Accordéon 3 — Budget & Finance ── */}
            <Accordeon title="3 — Budget & finance" color="bg-emerald-500" open={acc3Open} onToggle={() => setAcc3Open(v => !v)}>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Montant annuel (€ HT)">
                  <div className="relative">
                    <Euro className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <input type="number" step="0.01" value={montantAnnuel}
                      onChange={e => setMontantAnnuel(e.target.value)}
                      placeholder="0,00"
                      className={inputCls + ' pl-7'} />
                  </div>
                </Field>
                <Field label="Montant maximum (€ HT)">
                  <div className="relative">
                    <Euro className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <input type="number" step="0.01" value={montantMax}
                      onChange={e => setMontantMax(e.target.value)}
                      placeholder="0,00"
                      className={inputCls + ' pl-7'} />
                  </div>
                </Field>
              </div>
              <Field label="Centre de coût">
                <select value={centreCout} onChange={e => setCentreCout(e.target.value)} className={selectCls}>
                  <option value="">Sélectionner...</option>
                  {CENTRES_COUT.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <div className="flex items-center justify-between py-0.5">
                <label className="text-[11px] font-medium text-slate-500">Budget imputable</label>
                <button type="button" onClick={() => setBudgetImputable(v => !v)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${budgetImputable ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${budgetImputable ? 'left-4' : 'left-0.5'}`} />
                </button>
              </div>
              <Field label="Révision tarifaire">
                <input value={revisionTarifaire} onChange={e => setRevisionTarifaire(e.target.value)}
                  placeholder="Ex : Révision annuelle indice BT01, juillet de chaque année"
                  className={inputCls} />
              </Field>
            </Accordeon>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex justify-between items-center flex-shrink-0">
          <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-700 transition-colors">← Retour</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Annuler</button>
            <button onClick={handleSave} disabled={saving || !intitule}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium rounded-lg transition-colors">
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement…</>
                : <><Save className="w-4 h-4" /> Enregistrer</>
              }
            </button>
          </div>
        </div>
      </div>

      {showTree && (
        <SiteTreeModal initial={selectedSites} onClose={() => setShowTree(false)}
          onConfirm={nodes => { setSelectedSites(nodes); setShowTree(false); }} />
      )}
    </>
  );
}

// ─── Modale principale ────────────────────────────────────────────────────────

interface NouveauContratModalProps {
  onClose: () => void;
  onSaved?: () => void;
}

export default function NouveauContratModal({ onClose, onSaved }: NouveauContratModalProps) {
  const [step,    setStep]    = useState<1 | 2>(1);
  const [typeKey, setTypeKey] = useState<ContratTypeKey | null>(null);
  const typeDef = CONTRAT_TYPES.find(t => t.key === typeKey);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden
        ${step === 1 ? 'w-full max-w-2xl max-h-[92vh]' : 'w-full max-w-6xl h-[92vh]'}`}
      >
        {step === 1 ? (
          <Step1 selected={typeKey} onSelect={setTypeKey} onNext={() => setStep(2)} onClose={onClose} />
        ) : typeDef ? (
          <Step2 typeKey={typeDef.key} typeLabel={typeDef.label} typeEmoji={typeDef.emoji}
            onBack={() => setStep(1)} onClose={onClose} onSaved={() => { onSaved?.(); onClose(); }} />
        ) : null}
      </div>
    </div>
  );
}
