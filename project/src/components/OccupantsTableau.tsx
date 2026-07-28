import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  User, Phone, Mail,
  FileText, Calendar, ClipboardCheck, ClipboardX, Receipt,
  ExternalLink, ArrowUpDown, Settings2, Paperclip,
  ChevronRight, X, GripVertical,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import logoCentrale from '../assets/2024_logo-centrale-h_blanc-rvb.jpg.webp';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Occupant {
  id: string;
  logement_id: string;
  photo_url: string | null;
  nom: string;
  prenom: string;
  telephone: string | null;
  email: string | null;
  etablissement: string | null;
  type_contrat: string;
  reference_bail: string | null;
  date_entree: string | null;
  date_sortie_prevue: string | null;
  statut_edl_entrant: string;
  date_edl_entrant: string | null;
  lien_edl_entrant: string | null;
  statut_edl_sortant: string;
  date_edl_sortant: string | null;
  lien_edl_sortant: string | null;
  factures_ref: { ref: string; montant: number }[];
  factures_montant: number;
  statut: string;
  created_at: string;
}

// ─── Établissement → badge/logo config ───────────────────────────────────────

type EtabCfg =
  | { type: 'img';    src: string; bg: string }
  | { type: 'badge';  initials: string; bg: string; text: string };

const ETAB_CFG: Record<string, EtabCfg> = {
  'Université Claude Bernard Lyon 1': {
    type: 'badge', initials: 'L1', bg: 'bg-gradient-to-br from-red-500 to-pink-500', text: 'text-white',
  },
  'Université Lumière Lyon 2': {
    type: 'badge', initials: 'L2', bg: 'bg-[#f0134d]', text: 'text-white',
  },
  'École Centrale de Lyon': {
    type: 'img', src: logoCentrale, bg: 'bg-[#8b1a2b]',
  },
};

function EtabLogo({ etablissement }: { etablissement: string | null }) {
  if (!etablissement) return null;
  const cfg = ETAB_CFG[etablissement];
  if (!cfg) return null;

  if (cfg.type === 'img') {
    return (
      <span className={`inline-flex items-center justify-center w-7 h-5 rounded overflow-hidden flex-shrink-0 ${cfg.bg} border border-slate-100`}>
        <img src={cfg.src} alt={etablissement} className="w-full h-full object-contain" />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center justify-center w-7 h-5 rounded flex-shrink-0 ${cfg.bg}`}>
      <span className={`text-[9px] font-extrabold leading-none tracking-tight ${cfg.text}`}>{cfg.initials}</span>
    </span>
  );
}

// ─── Column definitions ───────────────────────────────────────────────────────

interface ColDef {
  id: string;
  label: string;       // ligne 1 entête
  label2?: string;     // ligne 2 entête (optionnel)
  icon?: React.ReactNode;
  defaultWidth: number;
  minWidth: number;
  canHide: boolean;
}

const ALL_COLUMNS: ColDef[] = [
  { id: 'photo',    label: 'Photo',                                                        defaultWidth: 56,  minWidth: 40,  canHide: false },
  { id: 'nom',      label: 'Nom & Prénom',      label2: 'Établissement',
    icon: <User className="w-3 h-3" />,                                                    defaultWidth: 220, minWidth: 140, canHide: false },
  { id: 'statut',   label: 'Statut',                                                       defaultWidth: 150, minWidth: 100, canHide: true  },
  { id: 'contact',  label: 'Téléphone',         label2: 'Email',
    icon: <Phone className="w-3 h-3" />,                                                   defaultWidth: 200, minWidth: 120, canHide: true  },
  { id: 'contrat',  label: 'Type de contrat',   label2: 'Réf. bail',
    icon: <FileText className="w-3 h-3" />,                                                defaultWidth: 200, minWidth: 140, canHide: true  },
  { id: 'entree',   label: "Date d'entrée",     label2: 'ÉDL entrant',
    icon: <Calendar className="w-3 h-3" />,                                                defaultWidth: 170, minWidth: 130, canHide: true  },
  { id: 'sortie',   label: 'Date sortie prévue', label2: 'ÉDL sortant',
    icon: <Calendar className="w-3 h-3" />,                                                defaultWidth: 170, minWidth: 130, canHide: true  },
  { id: 'factures', label: 'Factures',
    icon: <Receipt className="w-3 h-3" />,                                                 defaultWidth: 160, minWidth: 100, canHide: true  },
];

const DEFAULT_VISIBLE = ALL_COLUMNS.map(c => c.id);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_CONTRAT_LABELS: Record<string, string> = {
  bail_classique:         'Bail classique',
  colocation:             'Colocation',
  logement_temporaire:    'Logement temporaire',
  echange_international:  'Échange international',
};

const STATUT_CFG: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  occupant_actuel: { label: 'Occupant actuel', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  ancien_occupant: { label: 'Ancien occupant', bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200',   dot: 'bg-slate-400'   },
  a_venir:         { label: 'À venir',          bg: 'bg-blue-50',   text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500'    },
};

const EDL_CFG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  a_realiser:     { label: 'À réaliser', icon: <ClipboardX     className="w-3.5 h-3.5" />, color: 'text-amber-600'   },
  realise:        { label: 'Réalisé',    icon: <ClipboardCheck className="w-3.5 h-3.5" />, color: 'text-emerald-600' },
  non_applicable: { label: 'N/A',        icon: <ClipboardX     className="w-3.5 h-3.5" />, color: 'text-slate-400'   },
};

const TRI_OPTIONS: { value: string; label: string }[] = [
  { value: 'recent', label: 'Du plus récent au plus ancien' },
  { value: 'ancien', label: 'Du plus ancien au plus récent' },
];

function fmtDate(d: string | null) {
  if (!d) return '—';
  try { return format(parseISO(d), 'dd/MM/yyyy', { locale: fr }); } catch { return d; }
}

function DocClip({ count = 1 }: { count?: number }) {
  return (
    <button
      title={`${count} document${count > 1 ? 's' : ''} disponible${count > 1 ? 's' : ''}`}
      onClick={e => e.stopPropagation()}
      className="inline-flex items-center gap-0.5 ml-1 text-blue-500 hover:text-blue-700 transition-colors flex-shrink-0"
    >
      <Paperclip className="w-3 h-3" />
      <span className="text-[10px] font-bold leading-none">{count}</span>
    </button>
  );
}

function EdlCell({ statut, date, lien }: { statut: string; date: string | null; lien: string | null }) {
  const cfg = EDL_CFG[statut] ?? EDL_CFG.a_realiser;
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
        {cfg.icon}{cfg.label}
      </span>
      {date && <span className="text-[11px] text-slate-400">{fmtDate(date)}</span>}
      {lien && (
        <a href={lien} target="_blank" rel="noopener noreferrer"
          className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5">
          <ExternalLink className="w-2.5 h-2.5" /> Document
        </a>
      )}
    </div>
  );
}

function Avatar({ url, nom, prenom }: { url: string | null; nom: string; prenom: string }) {
  if (url) {
    return <img src={url} alt={`${prenom} ${nom}`}
      className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0" />;
  }
  const initials = `${prenom[0] ?? ''}${nom[0] ?? ''}`.toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm">
      <span className="text-xs font-bold text-slate-500">{initials || <User className="w-4 h-4" />}</span>
    </div>
  );
}

// ─── Mock data ────────────────────────────────────────────────────────────────

function buildMockOccupants(logementId: string): Occupant[] {
  return [
    {
      id: 'mock-1', logement_id: logementId,
      photo_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1',
      nom: 'MARTIN', prenom: 'Camille',
      telephone: '06 12 34 56 78', email: 'camille.martin@univ-lyon1.fr',
      etablissement: 'Université Claude Bernard Lyon 1',
      type_contrat: 'bail_classique', reference_bail: 'BAIL-LYON-2026-00108',
      date_entree: '2025-09-01', date_sortie_prevue: '2026-06-30',
      statut_edl_entrant: 'realise', date_edl_entrant: '2025-09-01', lien_edl_entrant: null,
      statut_edl_sortant: 'a_realiser', date_edl_sortant: null, lien_edl_sortant: null,
      factures_ref: [{ ref: 'FACT-2025-0042', montant: 85 }],
      factures_montant: 85,
      statut: 'occupant_actuel', created_at: '2025-08-15T10:00:00Z',
    },
    {
      id: 'mock-2', logement_id: logementId,
      photo_url: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1',
      nom: 'DUBOIS', prenom: 'Théo',
      telephone: null, email: 'theo.dubois@ec-lyon.fr',
      etablissement: 'École Centrale de Lyon',
      type_contrat: 'echange_international', reference_bail: 'BAIL-LYON-2025-00072',
      date_entree: '2024-09-01', date_sortie_prevue: '2025-06-28',
      statut_edl_entrant: 'realise', date_edl_entrant: '2024-09-02', lien_edl_entrant: null,
      statut_edl_sortant: 'realise', date_edl_sortant: '2025-06-30', lien_edl_sortant: null,
      factures_ref: [],
      factures_montant: 0,
      statut: 'ancien_occupant', created_at: '2024-08-10T08:30:00Z',
    },
    {
      id: 'mock-3', logement_id: logementId,
      photo_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1',
      nom: 'LEGRAND', prenom: 'Sophie',
      telephone: '07 89 01 23 45', email: 'sophie.legrand@univ-lyon2.fr',
      etablissement: 'Université Lumière Lyon 2',
      type_contrat: 'bail_classique', reference_bail: 'BAIL-LYON-2026-00215',
      date_entree: '2026-09-01', date_sortie_prevue: '2027-06-30',
      statut_edl_entrant: 'a_realiser', date_edl_entrant: null, lien_edl_entrant: null,
      statut_edl_sortant: 'a_realiser', date_edl_sortant: null, lien_edl_sortant: null,
      factures_ref: [],
      factures_montant: 0,
      statut: 'a_venir', created_at: '2026-05-20T14:00:00Z',
    },
  ];
}

// ─── Resizable header cell ────────────────────────────────────────────────────

function ResizableTh({ col, width, onResize }: { col: ColDef; width: number; onResize: (id: string, delta: number) => void }) {
  const dragging = useRef(false);
  const startX   = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    startX.current   = e.clientX;
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      onResize(col.id, ev.clientX - startX.current);
      startX.current = ev.clientX;
    };
    const onUp = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [col.id, onResize]);

  return (
    <th style={{ width, minWidth: col.minWidth, position: 'relative' }}
      className="px-3 py-2 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border-b border-slate-200 select-none align-top">
      <div className="flex flex-col gap-0.5 pr-2">
        {/* Ligne 1 */}
        <span className="flex items-center gap-1 truncate">
          {col.icon && <span className="text-slate-400 flex-shrink-0">{col.icon}</span>}
          <span className="truncate">{col.label}</span>
        </span>
        {/* Ligne 2 si présente */}
        {col.label2 && (
          <span className="text-[10px] font-medium text-slate-400 normal-case tracking-normal truncate pl-0.5">
            {col.label2}
          </span>
        )}
      </div>
      {/* Drag handle */}
      <span onMouseDown={onMouseDown}
        className="absolute right-0 top-0 h-full w-2 cursor-col-resize flex items-center justify-center group"
        style={{ userSelect: 'none' }}>
        <span className="w-px h-4 bg-slate-300 group-hover:bg-blue-400 transition-colors rounded-full" />
      </span>
    </th>
  );
}

// ─── Settings sidebar ─────────────────────────────────────────────────────────

interface SidebarProps {
  visibleCols: string[];
  setVisibleCols: (cols: string[]) => void;
  tri: string;
  setTri: (t: string) => void;
  onClose: () => void;
}

function SettingsSidebar({ visibleCols, setVisibleCols, tri, setTri, onClose }: SidebarProps) {
  const hideable   = ALL_COLUMNS.filter(c => c.canHide);
  const selected   = visibleCols.filter(id => hideable.some(c => c.id === id));
  const available  = hideable.filter(c => !selected.includes(c.id));
  const [localSel, setLocalSel] = useState<string[]>(selected);
  const [localTri, setLocalTri] = useState(tri);
  const dragOver = useRef<string | null>(null);

  const addCol    = (id: string) => setLocalSel(prev => [...prev, id]);
  const removeCol = (id: string) => setLocalSel(prev => prev.filter(x => x !== id));

  const handleDragStart = (e: React.DragEvent, id: string) => { e.dataTransfer.setData('colId', id); };
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    const srcId = e.dataTransfer.getData('colId');
    if (srcId === targetId) return;
    setLocalSel(prev => {
      const arr  = [...prev];
      const from = arr.indexOf(srcId);
      const to   = arr.indexOf(targetId);
      if (from === -1 || to === -1) return prev;
      arr.splice(from, 1);
      arr.splice(to, 0, srcId);
      return arr;
    });
    dragOver.current = null;
  };

  const apply = () => {
    const fixed   = ALL_COLUMNS.filter(c => !c.canHide).map(c => c.id);
    const ordered = ALL_COLUMNS.map(c => c.id).filter(id => fixed.includes(id) || localSel.includes(id));
    setVisibleCols(ordered);
    setTri(localTri);
    onClose();
  };

  const colLabel = (col: ColDef) => col.label2 ? `${col.label} / ${col.label2}` : col.label;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[520px] bg-white shadow-2xl flex flex-col border-l border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Paramètres du tableau</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Tri */}
          <section>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5" /> Tri par défaut
            </h4>
            <div className="space-y-1.5">
              {TRI_OPTIONS.map(opt => (
                <label key={opt.value}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors
                    ${localTri === opt.value ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
                  <input type="radio" name="tri" value={opt.value} checked={localTri === opt.value}
                    onChange={() => setLocalTri(opt.value)} className="accent-blue-600" />
                  <span className="text-xs font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Colonnes */}
          <section>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Colonnes visibles
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {/* Disponibles */}
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Disponibles</p>
                <div className="min-h-[120px] rounded-lg border border-slate-200 bg-slate-50 p-2 space-y-1">
                  {available.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic text-center pt-4">Toutes affichées</p>
                  ) : available.map(col => (
                    <button key={col.id} onClick={() => addCol(col.id)}
                      className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-xs text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all group">
                      <span className="flex items-center gap-1.5">
                        {col.icon && <span className="text-slate-400">{col.icon}</span>}
                        {colLabel(col)}
                      </span>
                      <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Sélectionnées */}
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">
                  Sélectionnées <span className="text-slate-300">— glisser pour ordonner</span>
                </p>
                <div className="min-h-[120px] rounded-lg border border-slate-200 bg-white p-2 space-y-1">
                  {localSel.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic text-center pt-4">Aucune colonne</p>
                  ) : localSel.map(id => {
                    const col = hideable.find(c => c.id === id);
                    if (!col) return null;
                    return (
                      <div key={id} draggable
                        onDragStart={e => handleDragStart(e, id)}
                        onDragOver={e => { e.preventDefault(); dragOver.current = id; }}
                        onDrop={e => handleDrop(e, id)}
                        className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-xs text-slate-700 bg-blue-50 border border-blue-100 cursor-grab active:cursor-grabbing group">
                        <div className="flex items-center gap-1.5">
                          <GripVertical className="w-3 h-3 text-slate-300 group-hover:text-slate-500 flex-shrink-0" />
                          {col.icon && <span className="text-slate-400">{col.icon}</span>}
                          <span className="font-medium">{colLabel(col)}</span>
                        </div>
                        <button onClick={() => removeCol(id)}
                          className="p-0.5 hover:bg-red-50 rounded text-slate-300 hover:text-red-500 transition-colors flex-shrink-0">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 px-1">
              Les colonnes <span className="font-medium text-slate-500">Photo</span> et <span className="font-medium text-slate-500">Nom & Prénom</span> sont toujours visibles.
            </p>
          </section>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-end gap-2 flex-shrink-0">
          <button onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Annuler
          </button>
          <button onClick={apply}
            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            Appliquer
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props { logementId: string; }

export default function OccupantsTableau({ logementId }: Props) {
  const [occupants,   setOccupants]   = useState<Occupant[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [tri,         setTri]         = useState('recent');
  const [visibleCols, setVisibleCols] = useState<string[]>(DEFAULT_VISIBLE);
  const [showSidebar, setShowSidebar] = useState(false);
  const [colWidths,   setColWidths]   = useState<Record<string, number>>(() =>
    Object.fromEntries(ALL_COLUMNS.map(c => [c.id, c.defaultWidth]))
  );

  const handleResize = useCallback((id: string, delta: number) => {
    setColWidths(prev => {
      const col = ALL_COLUMNS.find(c => c.id === id)!;
      return { ...prev, [id]: Math.max(col.minWidth, prev[id] + delta) };
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    supabase.from('occupants').select('*').eq('logement_id', logementId)
      .order('date_entree', { ascending: false })
      .then(({ data }) => {
        setOccupants(data && data.length > 0 ? (data as Occupant[]) : buildMockOccupants(logementId));
        setLoading(false);
      });
  }, [logementId]);

  const sorted = useMemo(() => {
    return [...occupants].sort((a, b) => {
      const da = a.date_entree ?? '';
      const db = b.date_entree ?? '';
      return tri === 'recent' ? db.localeCompare(da) : da.localeCompare(db);
    });
  }, [occupants, tri]);

  const activeCols = ALL_COLUMNS.filter(c => visibleCols.includes(c.id));
  const totalWidth = activeCols.reduce((s, c) => s + colWidths[c.id], 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
          Chargement des occupants…
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Barre de contrôles */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSidebar(true)} title="Paramètres du tableau"
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 text-slate-500 hover:text-slate-700">
            <Settings2 className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5" /> Ordre :
          </span>
          <select value={tri} onChange={e => setTri(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/40 cursor-pointer">
            {TRI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {occupants.length} occupant{occupants.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Tableau */}
      <div className="flex-1 overflow-auto">
        <table className="text-sm border-collapse" style={{ tableLayout: 'fixed', width: totalWidth }}>
          <thead className="sticky top-0 z-10">
            <tr>
              {activeCols.map(col => (
                <ResizableTh key={col.id} col={col} width={colWidths[col.id]} onResize={handleResize} />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={activeCols.length} className="text-center py-16 text-slate-400 text-sm">
                  <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Aucun occupant enregistré pour ce logement
                </td>
              </tr>
            ) : (
              sorted.map((o, idx) => (
                <OccupantRow key={o.id} occupant={o} idx={idx} colWidths={colWidths} activeCols={activeCols} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {showSidebar && (
        <SettingsSidebar
          visibleCols={visibleCols}
          setVisibleCols={setVisibleCols}
          tri={tri}
          setTri={setTri}
          onClose={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function OccupantRow({ occupant: o, idx, colWidths, activeCols }: {
  occupant: Occupant;
  idx: number;
  colWidths: Record<string, number>;
  activeCols: ColDef[];
}) {
  const statutCfg = STATUT_CFG[o.statut] ?? STATUT_CFG.ancien_occupant;
  const rowBg     = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';

  const cellFor = (id: string) => {
    const w = colWidths[id];
    switch (id) {
      case 'photo':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <Avatar url={o.photo_url} nom={o.nom} prenom={o.prenom} />
          </td>
        );

      case 'nom':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <p className="font-semibold text-slate-800 text-sm leading-tight truncate">
              {o.nom.toUpperCase()} {o.prenom}
            </p>
            {o.etablissement && (
              <div className="flex items-center gap-1.5 mt-1">
                <EtabLogo etablissement={o.etablissement} />
                <span className="text-[11px] text-slate-500 leading-tight truncate">{o.etablissement}</span>
              </div>
            )}
          </td>
        );

      case 'statut':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap
              ${statutCfg.bg} ${statutCfg.text} ${statutCfg.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statutCfg.dot}`} />
              {statutCfg.label}
            </span>
          </td>
        );

      case 'contact':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <div className="flex flex-col gap-0.5">
              {o.telephone ? (
                <a href={`tel:${o.telephone}`}
                  className="flex items-center gap-1 text-xs text-slate-600 hover:text-blue-600 transition-colors">
                  <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />{o.telephone}
                </a>
              ) : (
                <span className="flex items-center gap-1 text-xs text-slate-300 italic">
                  <Phone className="w-3 h-3 flex-shrink-0" /> Non renseigné
                </span>
              )}
              {o.email ? (
                <a href={`mailto:${o.email}`}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                  <Mail className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{o.email}</span>
                </a>
              ) : (
                <span className="flex items-center gap-1 text-xs text-slate-300 italic">
                  <Mail className="w-3 h-3 flex-shrink-0" /> —
                </span>
              )}
            </div>
          </td>
        );

      case 'contrat':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <div className="flex flex-col gap-1">
              <span className="inline-flex items-center gap-0.5 self-start">
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                  {TYPE_CONTRAT_LABELS[o.type_contrat] ?? o.type_contrat}
                </span>
                <DocClip count={1} />
              </span>
              {o.reference_bail ? (
                <span className="font-mono text-[10px] text-slate-400 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded self-start leading-tight">
                  {o.reference_bail}
                </span>
              ) : <span className="text-[10px] text-slate-300 italic">Réf. non renseignée</span>}
            </div>
          </td>
        );

      case 'entree':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1 text-xs text-slate-600 whitespace-nowrap">
                <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
                {fmtDate(o.date_entree)}
              </span>
              <EdlCell statut={o.statut_edl_entrant} date={o.date_edl_entrant} lien={o.lien_edl_entrant} />
            </div>
          </td>
        );

      case 'sortie':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1 text-xs text-slate-600 whitespace-nowrap">
                <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
                {o.date_sortie_prevue ? fmtDate(o.date_sortie_prevue) : <span className="italic text-slate-400">Non définie</span>}
              </span>
              <EdlCell statut={o.statut_edl_sortant} date={o.date_edl_sortant} lien={o.lien_edl_sortant} />
            </div>
          </td>
        );

      case 'factures':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            {o.factures_ref && o.factures_ref.length > 0 ? (
              <div className="flex flex-col gap-1">
                {o.factures_ref.map((f, i) => (
                  <div key={i} className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-0.5">
                      <span className="text-xs font-semibold text-slate-700">{f.montant} €</span>
                      <DocClip count={1} />
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 leading-tight">{f.ref}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-slate-300 italic">—</span>
            )}
          </td>
        );

      default:
        return <td key={id} style={{ width: w }} className="px-3 py-2.5" />;
    }
  };

  return (
    <tr className={`${rowBg} hover:bg-blue-50/30 transition-colors`}>
      {activeCols.map(col => cellFor(col.id))}
    </tr>
  );
}
