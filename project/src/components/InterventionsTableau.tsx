import { useState, useMemo, useRef, useCallback } from 'react';
import {
  Wrench, Tag, Calendar, ChevronRight, X, GripVertical, ChevronUp, ChevronDown,
  ArrowUpDown, Settings2, AlertTriangle, Clock, CheckCircle2, Ban, Pause,
  RefreshCw, Flame, Thermometer, Zap, Lightbulb, WashingMachine, Wifi,
  Sofa, Droplets, Lock, User, Users, Phone, Smartphone, MoreHorizontal,
  Paperclip, Camera, Wrench as WrenchParts, Euro, Star,
} from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { fr } from 'date-fns/locale';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CategorieIntervention = 'reparation' | 'entretien' | 'action_corrective';
export type StatutIntervention    = 'en_attente' | 'planifiee' | 'en_retard' | 'realisee' | 'annulee';
export type PrioriteIntervention  = 'basse' | 'normale' | 'haute' | 'urgente';
export type CanalCommunication    = 'my_residence' | 'telephone' | 'autre';

export interface Intervention {
  id: string;
  categorie: CategorieIntervention;
  libelle: string;
  assigne_a?: string | null;
  priorite: PrioriteIntervention;
  date_prevue?: string | null;       // ISO datetime
  duree_estimee_min?: number | null; // minutes
  recurrente?: boolean;
  date_realisee?: string | null;
  duree_reelle_min?: number | null;
  cout_total?: number | null;
  has_pieces?: boolean;
  has_photos?: boolean;
  has_pj?: boolean;
  statut: StatutIntervention;
  // Logement-specific
  demandeur?: string | null;
  canal?: CanalCommunication | null;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

export function buildMockInterventions(isLogement: boolean): Intervention[] {
  if (isLogement) {
    return [
      {
        id: 'int-1', categorie: 'reparation', libelle: 'Remplacement plaque induction HS',
        assigne_a: 'M. Dupont (Prestataire)', priorite: 'haute',
        date_prevue: '2026-05-28T09:00:00', duree_estimee_min: 90,
        date_realisee: null, duree_reelle_min: null, recurrente: false,
        cout_total: 320, has_pieces: true, has_photos: false, has_pj: true,
        statut: 'planifiee', demandeur: 'Thomas Leroy', canal: 'my_residence',
      },
      {
        id: 'int-2', categorie: 'entretien', libelle: 'Entretien VMC annuel',
        assigne_a: 'Équipe technique interne', priorite: 'normale',
        date_prevue: '2026-04-15T08:00:00', duree_estimee_min: 30, recurrente: true,
        date_realisee: '2026-04-15T08:45:00', duree_reelle_min: 45,
        cout_total: 0, has_pieces: false, has_photos: true, has_pj: false,
        statut: 'realisee', demandeur: null, canal: null,
      },
      {
        id: 'int-3', categorie: 'reparation', libelle: 'Fuite robinetterie douche',
        assigne_a: 'M. Bernard (Plomberie)', priorite: 'urgente',
        date_prevue: '2026-05-10T10:00:00', duree_estimee_min: 60, recurrente: false,
        date_realisee: '2026-05-10T11:15:00', duree_reelle_min: 75,
        cout_total: 180, has_pieces: true, has_photos: true, has_pj: true,
        statut: 'realisee', demandeur: 'Amina Diallo', canal: 'telephone',
      },
      {
        id: 'int-4', categorie: 'action_corrective', libelle: 'Mise en conformité détecteur fumée',
        assigne_a: null, priorite: 'haute',
        date_prevue: '2026-04-01T09:00:00', duree_estimee_min: 20, recurrente: false,
        date_realisee: null, duree_reelle_min: null,
        cout_total: null, has_pieces: false, has_photos: false, has_pj: true,
        statut: 'en_retard', demandeur: null, canal: null,
      },
      {
        id: 'int-5', categorie: 'entretien', libelle: 'Vérification tableau électrique',
        assigne_a: 'Legrand Maintenance', priorite: 'basse',
        date_prevue: '2026-06-10T14:00:00', duree_estimee_min: 45, recurrente: true,
        date_realisee: null, duree_reelle_min: null,
        cout_total: null, has_pieces: false, has_photos: false, has_pj: false,
        statut: 'en_attente', demandeur: null, canal: null,
      },
    ];
  }
  // Resto'U columns (no demandeur/canal)
  return [
    {
      id: 'int-r1', categorie: 'entretien', libelle: 'Entretien préventif filtre condenseur',
      assigne_a: 'Liebherr Service France', priorite: 'normale',
      date_prevue: '2026-06-01T08:00:00', duree_estimee_min: 60, recurrente: true,
      date_realisee: null, duree_reelle_min: null,
      cout_total: null, has_pieces: false, has_photos: false, has_pj: true,
      statut: 'planifiee',
    },
    {
      id: 'int-r2', categorie: 'reparation', libelle: 'Remplacement joint de porte',
      assigne_a: 'Liebherr Service France', priorite: 'haute',
      date_prevue: '2026-05-20T09:30:00', duree_estimee_min: 45, recurrente: false,
      date_realisee: '2026-05-20T10:00:00', duree_reelle_min: 30,
      cout_total: 145, has_pieces: true, has_photos: true, has_pj: false,
      statut: 'realisee',
    },
    {
      id: 'int-r3', categorie: 'action_corrective', libelle: 'Calibrage sonde température',
      assigne_a: 'Bureau Veritas', priorite: 'haute',
      date_prevue: '2026-04-10T09:00:00', duree_estimee_min: 30, recurrente: false,
      date_realisee: null, duree_reelle_min: null,
      cout_total: null, has_pieces: false, has_photos: false, has_pj: true,
      statut: 'en_retard',
    },
    {
      id: 'int-r4', categorie: 'entretien', libelle: 'Nettoyage condenseur + vérification fluide R-290',
      assigne_a: 'Équipe cuisine interne', priorite: 'normale',
      date_prevue: '2026-09-01T07:00:00', duree_estimee_min: 90, recurrente: true,
      date_realisee: null, duree_reelle_min: null,
      cout_total: null, has_pieces: false, has_photos: false, has_pj: false,
      statut: 'en_attente',
    },
    {
      id: 'int-r5', categorie: 'reparation', libelle: 'Remplacement roulette défectueuse',
      assigne_a: 'Technicien interne', priorite: 'basse',
      date_prevue: '2026-05-05T14:00:00', duree_estimee_min: 20, recurrente: false,
      date_realisee: null, duree_reelle_min: null,
      cout_total: 35, has_pieces: true, has_photos: false, has_pj: false,
      statut: 'annulee',
    },
  ];
}

// ─── Config maps ──────────────────────────────────────────────────────────────

const CATEGORIE_CFG: Record<CategorieIntervention, { label: string; icon: React.ReactNode; bg: string; text: string; border: string; dot: string }> = {
  reparation:        { label: 'Réparation',       icon: <Wrench      className="w-3.5 h-3.5" />, bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500'    },
  entretien:         { label: 'Entretien',         icon: <RefreshCw   className="w-3.5 h-3.5" />, bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500'   },
  action_corrective: { label: 'Action corrective', icon: <AlertTriangle className="w-3.5 h-3.5" />, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
};

const STATUT_CFG: Record<StatutIntervention, { label: string; icon: React.ReactNode; bg: string; text: string; border: string; dot: string }> = {
  en_attente: { label: 'En attente', icon: <Pause       className="w-3 h-3" />, bg: 'bg-slate-100', text: 'text-slate-600',   border: 'border-slate-300',   dot: 'bg-slate-400'  },
  planifiee:  { label: 'Planifiée',  icon: <Calendar    className="w-3 h-3" />, bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',    dot: 'bg-blue-500'   },
  en_retard:  { label: 'En retard',  icon: <Clock       className="w-3 h-3" />, bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',     dot: 'bg-red-500'    },
  realisee:   { label: 'Réalisée',   icon: <CheckCircle2 className="w-3 h-3" />, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  annulee:    { label: 'Annulée',    icon: <Ban         className="w-3 h-3" />, bg: 'bg-slate-100', text: 'text-slate-400',   border: 'border-slate-200',   dot: 'bg-slate-300'  },
};

const PRIORITE_CFG: Record<PrioriteIntervention, { label: string; color: string; icon: React.ReactNode }> = {
  basse:   { label: 'Basse',   color: 'text-slate-400', icon: <Star className="w-3 h-3 fill-slate-200 text-slate-300" /> },
  normale: { label: 'Normale', color: 'text-blue-500',  icon: <Star className="w-3 h-3 fill-blue-200 text-blue-400"  /> },
  haute:   { label: 'Haute',   color: 'text-amber-600', icon: <Star className="w-3 h-3 fill-amber-300 text-amber-500" /> },
  urgente: { label: 'Urgente', color: 'text-red-600',   icon: <Flame className="w-3.5 h-3.5 fill-red-100 text-red-500" /> },
};

const CANAL_CFG: Record<CanalCommunication, { label: string; icon: React.ReactNode }> = {
  my_residence: { label: 'My Residence', icon: <Smartphone className="w-3 h-3 text-blue-500" /> },
  telephone:    { label: 'Téléphone',    icon: <Phone      className="w-3 h-3 text-slate-500" /> },
  autre:        { label: 'Autre',        icon: <MoreHorizontal className="w-3 h-3 text-slate-400" /> },
};

const STATUT_LIST = Object.keys(STATUT_CFG) as StatutIntervention[];
const CATEGORIE_LIST = Object.keys(CATEGORIE_CFG) as CategorieIntervention[];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDatetime(d?: string | null) {
  if (!d) return '—';
  try { return format(parseISO(d), "dd/MM/yyyy 'à' HH:mm", { locale: fr }); } catch { return d; }
}

function fmtDuree(min?: number | null) {
  if (!min) return null;
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60); const m = min % 60;
  return m > 0 ? `${h}h${String(m).padStart(2,'0')}` : `${h}h`;
}

function fmtCout(n?: number | null) {
  if (n == null) return null;
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

// ─── Column definitions ───────────────────────────────────────────────────────

interface ColDef { id: string; label: string; label2?: string; icon?: React.ReactNode; defaultWidth: number; minWidth: number; canHide: boolean; sortable?: boolean }

function buildCols(isLogement: boolean): ColDef[] {
  const cols: ColDef[] = [
    { id: 'categorie',   label: 'Catégorie',             icon: <Tag      className="w-3 h-3" />, defaultWidth: 150, minWidth: 120, canHide: false, sortable: true  },
    { id: 'libelle',     label: 'Libellé de la tâche',   icon: <Wrench   className="w-3 h-3" />, defaultWidth: 220, minWidth: 160, canHide: false, sortable: true  },
  ];
  if (isLogement) {
    cols.push({ id: 'demandeur', label: 'Demandeur', label2: 'Canal', icon: <User className="w-3 h-3" />, defaultWidth: 160, minWidth: 120, canHide: true, sortable: false });
  }
  cols.push(
    { id: 'assigne',     label: 'Assigné à',             icon: <Users    className="w-3 h-3" />, defaultWidth: 160, minWidth: 120, canHide: true,  sortable: true  },
    { id: 'priorite',    label: 'Priorité',              icon: <Star     className="w-3 h-3" />, defaultWidth: 100, minWidth: 80,  canHide: true,  sortable: true  },
    { id: 'date_prevue', label: 'Date prévue', label2: 'Durée estimée', icon: <Calendar className="w-3 h-3" />, defaultWidth: 170, minWidth: 130, canHide: true, sortable: true },
    { id: 'date_realisee', label: 'Date réalisée', label2: 'Durée réelle', icon: <CheckCircle2 className="w-3 h-3" />, defaultWidth: 170, minWidth: 130, canHide: true, sortable: false },
    { id: 'cr',          label: 'CR',  label2: 'Coût · Pièces · Photos · PJ', icon: <Euro className="w-3 h-3" />, defaultWidth: 160, minWidth: 130, canHide: true, sortable: false },
    { id: 'statut',      label: 'Statut',               icon: <Clock    className="w-3 h-3" />, defaultWidth: 130, minWidth: 100, canHide: false, sortable: true  },
  );
  return cols;
}

const TRI_OPTIONS = [
  { value: 'categorie_asc',    label: 'Catégorie (A → Z)' },
  { value: 'categorie_desc',   label: 'Catégorie (Z → A)' },
  { value: 'libelle_asc',      label: 'Tâche (A → Z)' },
  { value: 'libelle_desc',     label: 'Tâche (Z → A)' },
  { value: 'date_prevue_asc',  label: 'Date prévue (plus ancienne)' },
  { value: 'date_prevue_desc', label: 'Date prévue (plus récente)' },
  { value: 'priorite_asc',     label: 'Priorité (basse → urgente)' },
  { value: 'priorite_desc',    label: 'Priorité (urgente → basse)' },
];

const PRIORITE_ORDER: Record<PrioriteIntervention, number> = { basse: 0, normale: 1, haute: 2, urgente: 3 };

// ─── Resizable TH ─────────────────────────────────────────────────────────────

function ResizableTh({ col, width, onResize, sortField, sortDir, onSort }: {
  col: ColDef; width: number;
  onResize: (id: string, delta: number) => void;
  sortField: string; sortDir: 'asc' | 'desc'; onSort: (id: string) => void;
}) {
  const dragging = useRef(false); const startX = useRef(0);
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); dragging.current = true; startX.current = e.clientX;
    const onMove = (ev: MouseEvent) => { if (!dragging.current) return; onResize(col.id, ev.clientX - startX.current); startX.current = ev.clientX; };
    const onUp = () => { dragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
  }, [col.id, onResize]);

  const isActive = sortField === col.id;
  return (
    <th style={{ width, minWidth: col.minWidth, position: 'relative' }}
      className="px-3 py-2 text-left text-[11px] font-semibold text-slate-600 bg-slate-50 border-b border-slate-200 select-none align-top"
      onClick={() => col.sortable && onSort(col.id)}>
      <div className={`flex flex-col gap-0.5 pr-3 ${col.sortable ? 'cursor-pointer' : ''}`}>
        <span className="flex items-start gap-1">
          {col.icon && <span className="text-slate-400 flex-shrink-0 mt-px">{col.icon}</span>}
          <span className="break-words leading-tight" style={{ wordBreak: 'break-word', whiteSpace: 'normal', overflowWrap: 'anywhere' }}>{col.label}</span>
          {col.sortable && (
            <span className="ml-auto flex-shrink-0 mt-px">
              {isActive ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-500" /> : <ChevronDown className="w-3 h-3 text-blue-500" />) : <ChevronUp className="w-3 h-3 text-slate-300" />}
            </span>
          )}
        </span>
        {col.label2 && <span className="text-[10px] font-medium text-slate-400 normal-case tracking-normal pl-0.5 leading-tight" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{col.label2}</span>}
      </div>
      <span onMouseDown={onMouseDown} className="absolute right-0 top-0 h-full w-2 cursor-col-resize flex items-center justify-center group" style={{ userSelect: 'none' }} onClick={e => e.stopPropagation()}>
        <span className="w-px h-4 bg-slate-300 group-hover:bg-blue-400 transition-colors rounded-full" />
      </span>
    </th>
  );
}

// ─── Settings sidebar ─────────────────────────────────────────────────────────

function SettingsSidebar({ allCols, visibleCols, setVisibleCols, defaultSort, setDefaultSort, onClose }: {
  allCols: ColDef[]; visibleCols: string[];
  setVisibleCols: (c: string[]) => void;
  defaultSort: string; setDefaultSort: (s: string) => void; onClose: () => void;
}) {
  const hideable  = allCols.filter(c => c.canHide);
  const [localSel, setLocalSel]   = useState(visibleCols.filter(id => hideable.some(c => c.id === id)));
  const [localSort, setLocalSort] = useState(defaultSort);
  const dragOver  = useRef<string | null>(null);

  const addCol    = (id: string) => setLocalSel(p => [...p, id]);
  const removeCol = (id: string) => setLocalSel(p => p.filter(x => x !== id));
  const available = hideable.filter(c => !localSel.includes(c.id));
  const colLabel  = (c: ColDef) => c.label2 ? `${c.label} / ${c.label2}` : c.label;

  const handleDragStart = (e: React.DragEvent, id: string) => { e.dataTransfer.setData('colId', id); };
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    const srcId = e.dataTransfer.getData('colId'); if (srcId === targetId) return;
    setLocalSel(prev => { const arr = [...prev]; const from = arr.indexOf(srcId); const to = arr.indexOf(targetId); if (from === -1 || to === -1) return prev; arr.splice(from, 1); arr.splice(to, 0, srcId); return arr; });
    dragOver.current = null;
  };

  const apply = () => {
    const fixed   = allCols.filter(c => !c.canHide).map(c => c.id);
    const ordered = allCols.map(c => c.id).filter(id => fixed.includes(id) || localSel.includes(id));
    setVisibleCols(ordered);
    setDefaultSort(localSort);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[480px] bg-white shadow-2xl flex flex-col border-l border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-800">Paramètres du tableau</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-4 h-4 text-slate-500" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          <section>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5"><ArrowUpDown className="w-3.5 h-3.5" /> Tri par défaut</h4>
            <div className="space-y-1.5">
              {TRI_OPTIONS.map(opt => (
                <label key={opt.value} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${localSort === opt.value ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
                  <input type="radio" name="sort" value={opt.value} checked={localSort === opt.value} onChange={() => setLocalSort(opt.value)} className="accent-blue-600" />
                  <span className="text-xs font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </section>
          <section>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5" /> Colonnes visibles</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Disponibles</p>
                <div className="min-h-[100px] rounded-lg border border-slate-200 bg-slate-50 p-2 space-y-1">
                  {available.length === 0
                    ? <p className="text-[11px] text-slate-400 italic text-center pt-4">Toutes affichées</p>
                    : available.map(col => (
                      <button key={col.id} onClick={() => addCol(col.id)} className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-xs text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all group">
                        <span className="flex items-center gap-1.5">{col.icon && <span className="text-slate-400">{col.icon}</span>}{colLabel(col)}</span>
                        <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500" />
                      </button>
                    ))}
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Sélectionnées <span className="text-slate-300">— glisser</span></p>
                <div className="min-h-[100px] rounded-lg border border-slate-200 bg-white p-2 space-y-1">
                  {localSel.length === 0
                    ? <p className="text-[11px] text-slate-400 italic text-center pt-4">Aucune colonne</p>
                    : localSel.map(id => {
                        const col = hideable.find(c => c.id === id); if (!col) return null;
                        return (
                          <div key={id} draggable onDragStart={e => handleDragStart(e, id)} onDragOver={e => { e.preventDefault(); dragOver.current = id; }} onDrop={e => handleDrop(e, id)}
                            className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-xs text-slate-700 bg-blue-50 border border-blue-100 cursor-grab active:cursor-grabbing group">
                            <div className="flex items-center gap-1.5">
                              <GripVertical className="w-3 h-3 text-slate-300 group-hover:text-slate-500 flex-shrink-0" />
                              {col.icon && <span className="text-slate-400">{col.icon}</span>}
                              <span className="font-medium">{colLabel(col)}</span>
                            </div>
                            <button onClick={() => removeCol(id)} className="p-0.5 hover:bg-red-50 rounded text-slate-300 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                          </div>
                        );
                      })}
                </div>
              </div>
            </div>
          </section>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Annuler</button>
          <button onClick={apply} className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Appliquer</button>
        </div>
      </div>
    </>
  );
}

// ─── Filter dropdowns ─────────────────────────────────────────────────────────

function CategorieFilterDropdown({ active, toggle, clear }: { active: Set<string>; toggle: (k: string) => void; clear: () => void }) {
  const [open, setOpen] = useState(false);
  const count = active.size;
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${open || count > 0 ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
        <Tag className="w-3.5 h-3.5" /> Catégorie
        {count > 0 && <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold">{count}</span>}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-30 bg-white border border-slate-200 rounded-xl shadow-xl p-3 min-w-[220px]">
          <div className="flex flex-col gap-1.5">
            {CATEGORIE_LIST.map(key => {
              const cfg = CATEGORIE_CFG[key]; const isActive = active.has(key);
              return (
                <button key={key} onClick={() => toggle(key)} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all text-left w-full ${isActive ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm` : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                  <span className={isActive ? cfg.text : 'text-slate-400'}>{cfg.icon}</span>{cfg.label}
                </button>
              );
            })}
          </div>
          {count > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex justify-end">
              <button onClick={() => { clear(); setOpen(false); }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all">
                <X className="w-3 h-3" /> Effacer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatutFilterDropdown({ active, toggle, clear }: { active: Set<string>; toggle: (k: string) => void; clear: () => void }) {
  const [open, setOpen] = useState(false);
  const count = active.size;
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${open || count > 0 ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
        <Clock className="w-3.5 h-3.5" /> Statut
        {count > 0 && <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold">{count}</span>}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-30 bg-white border border-slate-200 rounded-xl shadow-xl p-3 min-w-[200px]">
          <div className="flex flex-col gap-1.5">
            {STATUT_LIST.map(key => {
              const cfg = STATUT_CFG[key]; const isActive = active.has(key);
              return (
                <button key={key} onClick={() => toggle(key)} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all text-left w-full ${isActive ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm` : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? cfg.dot : 'bg-slate-300'}`} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
          {count > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex justify-end">
              <button onClick={() => { clear(); setOpen(false); }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all">
                <X className="w-3 h-3" /> Effacer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const PRIORITE_FILTER_LIST: PrioriteIntervention[] = ['urgente', 'haute', 'normale', 'basse'];

function PrioriteFilterDropdown({ active, toggle, clear }: { active: Set<string>; toggle: (k: string) => void; clear: () => void }) {
  const [open, setOpen] = useState(false);
  const count = active.size;
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${open || count > 0 ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
        <Flame className="w-3.5 h-3.5" /> Priorité
        {count > 0 && <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold">{count}</span>}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-30 bg-white border border-slate-200 rounded-xl shadow-xl p-3 min-w-[180px]">
          <div className="flex flex-col gap-1.5">
            {PRIORITE_FILTER_LIST.map(key => {
              const cfg = PRIORITE_CFG[key]; const isActive = active.has(key);
              return (
                <button key={key} onClick={() => toggle(key)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all text-left w-full ${isActive ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                  <span className={isActive ? 'text-blue-600' : cfg.color}>{cfg.icon}</span>
                  {cfg.label}
                </button>
              );
            })}
          </div>
          {count > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex justify-end">
              <button onClick={() => { clear(); setOpen(false); }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all">
                <X className="w-3 h-3" /> Effacer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function IntervRow({ int, idx, colWidths, activeCols, isLogement }: {
  int: Intervention; idx: number;
  colWidths: Record<string, number>;
  activeCols: ColDef[];
  isLogement: boolean;
}) {
  const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';

  const cellFor = (id: string) => {
    const w = colWidths[id];
    switch (id) {

      case 'categorie': {
        const cfg = CATEGORIE_CFG[int.categorie];
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              <span className={cfg.text}>{cfg.icon}</span>{cfg.label}
            </span>
          </td>
        );
      }

      case 'libelle':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <p className="font-semibold text-slate-800 text-sm leading-snug" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{int.libelle}</p>
          </td>
        );

      case 'demandeur':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            {int.demandeur
              ? (
                <div>
                  <p className="text-xs font-medium text-slate-700 flex items-center gap-1"><User className="w-3 h-3 text-slate-400" />{int.demandeur}</p>
                  {int.canal && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                      {CANAL_CFG[int.canal].icon}
                      {CANAL_CFG[int.canal].label}
                    </span>
                  )}
                </div>
              )
              : <span className="text-xs text-slate-300 italic">—</span>}
          </td>
        );

      case 'assigne':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            {int.assigne_a
              ? <p className="text-xs text-slate-700 flex items-start gap-1"><Users className="w-3 h-3 text-slate-400 mt-px flex-shrink-0" /><span style={{ wordBreak: 'break-word' }}>{int.assigne_a}</span></p>
              : <span className="text-xs text-slate-300 italic">Non assigné</span>}
          </td>
        );

      case 'priorite': {
        const cfg = PRIORITE_CFG[int.priorite];
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
              {cfg.icon}{cfg.label}
            </span>
          </td>
        );
      }

      case 'date_prevue':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <div className="flex items-start gap-1">
              {int.recurrente && <RefreshCw className="w-3 h-3 text-blue-400 flex-shrink-0 mt-px" title="Tâche récurrente" />}
              <div>
                <p className="text-xs text-slate-700 whitespace-nowrap">{fmtDatetime(int.date_prevue)}</p>
                {int.duree_estimee_min && <p className="text-[10px] text-slate-400 mt-0.5">Estimée : {fmtDuree(int.duree_estimee_min)}</p>}
              </div>
            </div>
          </td>
        );

      case 'date_realisee':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            {int.date_realisee
              ? (
                <div>
                  <p className="text-xs text-emerald-700 whitespace-nowrap">{fmtDatetime(int.date_realisee)}</p>
                  {int.duree_reelle_min && <p className="text-[10px] text-slate-400 mt-0.5">Réelle : {fmtDuree(int.duree_reelle_min)}</p>}
                </div>
              )
              : <span className="text-xs text-slate-300 italic">—</span>}
          </td>
        );

      case 'cr':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <div className="flex flex-col gap-1">
              {int.cout_total != null
                ? <span className="text-xs font-semibold text-slate-800 flex items-center gap-1"><Euro className="w-3 h-3 text-slate-400" />{fmtCout(int.cout_total)}</span>
                : <span className="text-xs text-slate-300 italic">Coût : —</span>}
              <div className="flex items-center gap-2 mt-0.5">
                <span title="Pièces détachées" className={`flex items-center gap-0.5 text-[10px] font-medium ${int.has_pieces ? 'text-amber-600' : 'text-slate-200'}`}>
                  <WrenchParts className="w-3 h-3" />
                </span>
                <span title="Photos" className={`flex items-center gap-0.5 text-[10px] font-medium ${int.has_photos ? 'text-blue-500' : 'text-slate-200'}`}>
                  <Camera className="w-3 h-3" />
                </span>
                <span title="Pièces jointes" className={`flex items-center gap-0.5 text-[10px] font-medium ${int.has_pj ? 'text-slate-600' : 'text-slate-200'}`}>
                  <Paperclip className="w-3 h-3" />
                </span>
              </div>
            </div>
          </td>
        );

      case 'statut': {
        const cfg = STATUT_CFG[int.statut];
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
              {cfg.label}
            </span>
          </td>
        );
      }

      default:
        return <td key={id} style={{ width: w }} className="px-3 py-2.5" />;
    }
  };

  // Suppress unused warning — isLogement used to conditionally show demandeur col via activeCols
  void isLogement;

  return (
    <tr className={`${rowBg} hover:bg-blue-50/40 transition-colors`}>
      {activeCols.map(col => cellFor(col.id))}
    </tr>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  interventions: Intervention[];
  isLogement: boolean;
}

export default function InterventionsTableau({ interventions, isLogement }: Props) {
  const ALL_COLUMNS = useMemo(() => buildCols(isLogement), [isLogement]);
  const DEFAULT_VISIBLE = useMemo(() => ALL_COLUMNS.map(c => c.id), [ALL_COLUMNS]);

  const [sortField,      setSortField]      = useState('date_prevue');
  const [sortDir,        setSortDir]        = useState<'asc' | 'desc'>('desc');
  const [defaultSort,    setDefaultSort]    = useState('date_prevue_desc');
  const [visibleCols,    setVisibleCols]    = useState<string[]>(DEFAULT_VISIBLE);
  const [showSidebar,    setShowSidebar]    = useState(false);
  const [activeCateg,    setActiveCateg]   = useState<Set<string>>(new Set());
  const [activeStatuts,  setActiveStatuts] = useState<Set<string>>(new Set());
  const [activePriorites, setActivePriorites] = useState<Set<string>>(new Set());
  const [colWidths, setColWidths] = useState<Record<string, number>>(() =>
    Object.fromEntries(ALL_COLUMNS.map(c => [c.id, c.defaultWidth]))
  );

  const handleResize = useCallback((id: string, delta: number) => {
    setColWidths(prev => {
      const col = ALL_COLUMNS.find(c => c.id === id)!;
      return { ...prev, [id]: Math.max(col.minWidth, prev[id] + delta) };
    });
  }, [ALL_COLUMNS]);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const applyDefaultSort = (s: string) => {
    setDefaultSort(s);
    const parts = s.split('_'); const dir = parts.pop() as 'asc' | 'desc'; const field = parts.join('_');
    setSortField(field); setSortDir(dir);
  };

  const display = useMemo(() => {
    let items = [...interventions];
    if (activeCateg.size > 0)     items = items.filter(i => activeCateg.has(i.categorie));
    if (activeStatuts.size > 0)   items = items.filter(i => activeStatuts.has(i.statut));
    if (activePriorites.size > 0) items = items.filter(i => activePriorites.has(i.priorite));
    items.sort((a, b) => {
      let va = '', vb = '';
      if (sortField === 'categorie')   { va = a.categorie; vb = b.categorie; }
      if (sortField === 'libelle')     { va = a.libelle; vb = b.libelle; }
      if (sortField === 'assigne')     { va = a.assigne_a ?? ''; vb = b.assigne_a ?? ''; }
      if (sortField === 'date_prevue') { va = a.date_prevue ?? ''; vb = b.date_prevue ?? ''; }
      if (sortField === 'statut')      { va = a.statut; vb = b.statut; }
      if (sortField === 'priorite')    {
        const diff = PRIORITE_ORDER[a.priorite] - PRIORITE_ORDER[b.priorite];
        return sortDir === 'asc' ? diff : -diff;
      }
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return items;
  }, [interventions, activeCateg, activeStatuts, activePriorites, sortField, sortDir]);

  const activeCols  = ALL_COLUMNS.filter(c => visibleCols.includes(c.id));
  const totalWidth  = activeCols.reduce((s, c) => s + colWidths[c.id], 0);
  const filterCount = activeCateg.size + activeStatuts.size + activePriorites.size;

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-white flex-shrink-0 flex-wrap">
        <button onClick={() => setShowSidebar(true)} title="Paramètres du tableau"
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 text-slate-500 hover:text-slate-700 flex-shrink-0">
          <Settings2 className="w-3.5 h-3.5" />
        </button>

        <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 flex-shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5" /> Ordre :
        </span>
        <select value={`${sortField}_${sortDir}`} onChange={e => applyDefaultSort(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/40 cursor-pointer flex-shrink-0">
          {TRI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <div className="w-px h-5 bg-slate-200 flex-shrink-0" />

        <CategorieFilterDropdown active={activeCateg}     toggle={k => setActiveCateg(p =>     { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; })} clear={() => setActiveCateg(new Set())}     />
        <StatutFilterDropdown    active={activeStatuts}   toggle={k => setActiveStatuts(p =>   { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; })} clear={() => setActiveStatuts(new Set())}   />
        <PrioriteFilterDropdown  active={activePriorites} toggle={k => setActivePriorites(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; })} clear={() => setActivePriorites(new Set())} />

        <span className="ml-auto text-xs text-slate-400 font-medium flex-shrink-0">
          {display.length} intervention{display.length > 1 ? 's' : ''}
          {filterCount > 0 && <span className="ml-1 text-blue-500">({filterCount} filtre{filterCount > 1 ? 's' : ''})</span>}
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="text-sm border-collapse" style={{ tableLayout: 'fixed', width: totalWidth }}>
          <thead className="sticky top-0 z-10">
            <tr>
              {activeCols.map(col => (
                <ResizableTh key={col.id} col={col} width={colWidths[col.id]} onResize={handleResize} sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {display.length === 0
              ? (
                <tr>
                  <td colSpan={activeCols.length} className="text-center py-16 text-slate-400 text-sm">
                    <Wrench className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Aucune intervention{filterCount > 0 ? ' pour ces filtres' : ' enregistrée'}
                  </td>
                </tr>
              )
              : display.map((int, idx) => (
                <IntervRow key={int.id} int={int} idx={idx} colWidths={colWidths} activeCols={activeCols} isLogement={isLogement} />
              ))
            }
          </tbody>
        </table>
      </div>

      {showSidebar && (
        <SettingsSidebar
          allCols={ALL_COLUMNS} visibleCols={visibleCols} setVisibleCols={setVisibleCols}
          defaultSort={defaultSort} setDefaultSort={applyDefaultSort} onClose={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
}
