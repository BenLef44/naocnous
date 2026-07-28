import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Search, ClipboardCheck, ClipboardX, CalendarClock, Euro, ChevronRight, ChevronDown, ChevronUp, User, GripVertical, Settings2, ArrowUpDown, X, MapPin, Building2, Calendar, LogIn, LogOut, CheckCheck, PenLine, Eye, Clipboard as ClipboardEdit } from 'lucide-react';
import { EdlRecord, EdlStatut, EdlType, EDL_CFG, PreEdlRecord, PRE_EDL_CFG, preEdlTotal, DEMO_PRE_EDL } from './edlTypes';

type TabMode = 'edl' | 'pre_edl';

interface Props {
  records: EdlRecord[];
  preEdlRecords?: PreEdlRecord[];
  loading: boolean;
  onOpenPreEdl?: (r: PreEdlRecord) => void;
  onCreatePreEdl?: () => void;
  onOpenEdl?: (r: EdlRecord) => void;
}

// ── Effective statut (date in future → force a_realiser) ──────────────────────

const TODAY_MS = (() => { const d = new Date(); d.setHours(0,0,0,0); return d.getTime(); })();

function effectiveStatut(r: EdlRecord): EdlStatut {
  if (r.date) {
    const edlDate = new Date(r.date);
    edlDate.setHours(0,0,0,0);
    if (edlDate.getTime() > TODAY_MS) return 'a_realiser';
  }
  return r.statut;
}

// ── Student photo helpers ─────────────────────────────────────────────────────

const PHOTOS_F = [
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/1587014/pexels-photo-1587014.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/3768914/pexels-photo-3768914.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/712513/pexels-photo-712513.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/1820919/pexels-photo-1820919.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/2085739/pexels-photo-2085739.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/1858175/pexels-photo-1858175.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/2170387/pexels-photo-2170387.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/1587296/pexels-photo-1587296.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/3586798/pexels-photo-3586798.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/2726111/pexels-photo-2726111.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/3454296/pexels-photo-3454296.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/4328031/pexels-photo-4328031.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/2709388/pexels-photo-2709388.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
];

const PHOTOS_M = [
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/846741/pexels-photo-846741.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/213117/pexels-photo-213117.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/839011/pexels-photo-839011.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/1121796/pexels-photo-1121796.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/937481/pexels-photo-937481.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/3785104/pexels-photo-3785104.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/3192024/pexels-photo-3192024.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/2531553/pexels-photo-2531553.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
];

// Agent photos — professional portraits 30-60 years old
const AGENT_PHOTOS = [
  'https://images.pexels.com/photos/5792641/pexels-photo-5792641.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/6551937/pexels-photo-6551937.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/3760376/pexels-photo-3760376.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/8090137/pexels-photo-8090137.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'https://images.pexels.com/photos/5490276/pexels-photo-5490276.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
];

const FEMALE_PRENOMS = new Set([
  'léa','chloé','emma','alice','manon','camille','louise','jade','inès','sophie','marie',
  'julie','laura','charlotte','clara','océane','zoé','anaïs','lucie','sarah','eva','margot',
  'pauline','juliette','romane','maeva','elise','noemie','victoria','constance','capucine',
  'clémence','axelle','ambre','sofia','elisa','maëva','noémie','élodie','aurélie','laure',
  'perrine','mélanie','melissa','sixtine','albane','oriane',
]);

function strHash(s: string): number {
  let h = 0;
  for (const c of s) h = (Math.imul(31, h) + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function getStudentPhotoUrl(prenom: string, nom: string, photoUrl: string | null): string {
  if (photoUrl) return photoUrl;
  const isFemale = FEMALE_PRENOMS.has(prenom.toLowerCase());
  const pool = isFemale ? PHOTOS_F : PHOTOS_M;
  // Use both prenom+nom as hash key so different people with same prenom get different photos
  return pool[strHash(`${prenom}|${nom}`) % pool.length];
}

function getAgentPhotoUrl(agentName: string): string {
  return AGENT_PHOTOS[strHash(agentName) % AGENT_PHOTOS.length];
}

function StudentAvatar({ prenom, nom, photoUrl, size = 30 }: {
  prenom: string; nom: string; photoUrl: string | null; size?: number;
}) {
  const [err, setErr] = useState(false);
  const src = getStudentPhotoUrl(prenom, nom, photoUrl);
  if (!err) {
    return (
      <img src={src} alt={`${prenom} ${nom}`}
        className="rounded-full object-cover flex-shrink-0 border border-slate-200"
        style={{ width: size, height: size }}
        onError={() => setErr(true)} />
    );
  }
  const initials = `${prenom?.[0] ?? ''}${nom?.[0] ?? ''}`.toUpperCase();
  return (
    <span className="rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold flex-shrink-0 text-[10px]"
      style={{ width: size, height: size }}>
      {initials}
    </span>
  );
}

function AgentAvatar({ name, size = 26 }: { name: string; size?: number }) {
  const [err, setErr] = useState(false);
  if (!err) {
    return (
      <img src={getAgentPhotoUrl(name)} alt={name}
        className="rounded-full object-cover flex-shrink-0 border border-slate-200"
        style={{ width: size, height: size }}
        onError={() => setErr(true)} />
    );
  }
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <span className="rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold flex-shrink-0 text-[9px]"
      style={{ width: size, height: size }}>
      {initials}
    </span>
  );
}

// ── Column definitions ────────────────────────────────────────────────────────

interface ColDef {
  id: string; label: string; label2?: string;
  icon?: React.ReactNode; defaultWidth: number; minWidth: number;
  canHide: boolean; sortable?: boolean;
}

const EDL_COLUMNS: ColDef[] = [
  { id: 'occupant',   label: 'Occupant',      icon: <User           className="w-3 h-3" />, defaultWidth: 200, minWidth: 160, canHide: false, sortable: true  },
  { id: 'logement',   label: 'Logement',      label2: 'Type · Surface', icon: <Building2      className="w-3 h-3" />, defaultWidth: 140, minWidth: 100, canHide: false, sortable: true  },
  { id: 'residence',  label: 'Résidence',     label2: 'Bâtiment · Étage', icon: <MapPin         className="w-3 h-3" />, defaultWidth: 180, minWidth: 140, canHide: true,  sortable: true  },
  { id: 'type',       label: 'Type EDL',      icon: <LogIn          className="w-3 h-3" />, defaultWidth: 130, minWidth: 100, canHide: false, sortable: true  },
  { id: 'statut',     label: 'Statut',        icon: <ClipboardCheck className="w-3 h-3" />, defaultWidth: 120, minWidth: 90,  canHide: false, sortable: true  },
  { id: 'date',       label: 'Date EDL',      icon: <Calendar       className="w-3 h-3" />, defaultWidth: 110, minWidth: 90,  canHide: false, sortable: true  },
  { id: 'entree',     label: 'Entrée',        icon: <Calendar       className="w-3 h-3" />, defaultWidth: 100, minWidth: 80,  canHide: true,  sortable: true  },
  { id: 'sortie',     label: 'Sortie prévue', icon: <Calendar       className="w-3 h-3" />, defaultWidth: 110, minWidth: 80,  canHide: true,  sortable: true  },
  { id: 'agent',      label: 'Assigné à',     icon: <User           className="w-3 h-3" />, defaultWidth: 170, minWidth: 130, canHide: true,  sortable: true  },
  { id: 'action',     label: 'Action',        defaultWidth: 80,  minWidth: 60,  canHide: true,  sortable: false },
];

const TRI_OPTIONS = [
  { value: 'date_desc',      label: 'Date EDL (plus récente)' },
  { value: 'date_asc',       label: 'Date EDL (plus ancienne)' },
  { value: 'occupant_asc',   label: 'Occupant (A → Z)' },
  { value: 'occupant_desc',  label: 'Occupant (Z → A)' },
  { value: 'logement_asc',   label: 'Logement (A → Z)' },
  { value: 'logement_desc',  label: 'Logement (Z → A)' },
  { value: 'residence_asc',  label: 'Résidence (A → Z)' },
  { value: 'residence_desc', label: 'Résidence (Z → A)' },
  { value: 'type_asc',       label: 'Type (entrant d\'abord)' },
  { value: 'type_desc',      label: 'Type (sortant d\'abord)' },
  { value: 'statut_asc',     label: 'Statut (A → Z)' },
  { value: 'agent_asc',      label: 'Agent (A → Z)' },
  { value: 'agent_desc',     label: 'Agent (Z → A)' },
];

// ── ResizableTh ───────────────────────────────────────────────────────────────

function ResizableTh({ col, width, onResize, sortField, sortDir, onSort }: {
  col: ColDef; width: number;
  onResize: (id: string, delta: number) => void;
  sortField: string; sortDir: 'asc' | 'desc'; onSort: (id: string) => void;
}) {
  const dragging = useRef(false); const startX = useRef(0);
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); dragging.current = true; startX.current = e.clientX;
    const onMove = (ev: MouseEvent) => { if (!dragging.current) return; onResize(col.id, ev.clientX - startX.current); startX.current = ev.clientX; };
    const onUp   = () => { dragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
  }, [col.id, onResize]);

  const isActive = sortField === col.id;
  if (!col.label) {
    return (
      <th style={{ width, minWidth: col.minWidth, position: 'relative' }}
        className="px-3 py-2.5 bg-slate-50 border-b border-slate-200 select-none" />
    );
  }
  return (
    <th style={{ width, minWidth: col.minWidth, position: 'relative' }}
      className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-600 bg-slate-50 border-b border-slate-200 select-none align-top"
      onClick={() => col.sortable && onSort(col.id)}>
      <div className={`flex flex-col gap-0.5 pr-3 ${col.sortable ? 'cursor-pointer' : ''}`}>
        <span className="flex items-center gap-1">
          {col.icon && <span className="text-slate-400 flex-shrink-0">{col.icon}</span>}
          <span className="uppercase tracking-wide leading-tight">{col.label}</span>
          {col.sortable && (
            <span className="ml-auto flex-shrink-0">
              {isActive
                ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-500" /> : <ChevronDown className="w-3 h-3 text-blue-500" />)
                : <ChevronUp className="w-3 h-3 text-slate-300" />}
            </span>
          )}
        </span>
        {col.label2 && <span className="text-[10px] font-normal text-slate-400 normal-case tracking-normal leading-tight">{col.label2}</span>}
      </div>
      <span onMouseDown={onMouseDown} onClick={e => e.stopPropagation()}
        className="absolute right-0 top-0 h-full w-2 cursor-col-resize flex items-center justify-center group" style={{ userSelect: 'none' }}>
        <span className="w-px h-4 bg-slate-300 group-hover:bg-blue-400 transition-colors rounded-full" />
      </span>
    </th>
  );
}

// ── Settings sidebar ──────────────────────────────────────────────────────────

function SettingsSidebar({ visibleCols, setVisibleCols, defaultSort, setDefaultSort, onClose }: {
  visibleCols: string[];
  setVisibleCols: (c: string[]) => void;
  defaultSort: string; setDefaultSort: (s: string) => void; onClose: () => void;
}) {
  const hideable = EDL_COLUMNS.filter(c => c.canHide);
  const [localSel,  setLocalSel]  = useState(visibleCols.filter(id => hideable.some(c => c.id === id)));
  const [localSort, setLocalSort] = useState(defaultSort);
  const dragOver = useRef<string | null>(null);

  const addCol    = (id: string) => setLocalSel(p => [...p, id]);
  const removeCol = (id: string) => setLocalSel(p => p.filter(x => x !== id));
  const available = hideable.filter(c => !localSel.includes(c.id));
  const colLabel  = (c: ColDef) => c.label2 ? `${c.label} / ${c.label2}` : c.label;

  const handleDragStart = (e: React.DragEvent, id: string) => { e.dataTransfer.setData('colId', id); };
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    const srcId = e.dataTransfer.getData('colId'); if (srcId === targetId) return;
    setLocalSel(prev => {
      const arr = [...prev];
      const from = arr.indexOf(srcId); const to = arr.indexOf(targetId);
      if (from === -1 || to === -1) return prev;
      arr.splice(from, 1); arr.splice(to, 0, srcId); return arr;
    });
    dragOver.current = null;
  };

  const apply = () => {
    const fixed   = EDL_COLUMNS.filter(c => !c.canHide).map(c => c.id);
    const ordered = EDL_COLUMNS.map(c => c.id).filter(id => fixed.includes(id) || localSel.includes(id));
    setVisibleCols(ordered);
    setDefaultSort(localSort);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[460px] bg-white shadow-2xl flex flex-col border-l border-slate-200">
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
          <section>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5" /> Tri par défaut
            </h4>
            <div className="space-y-1.5">
              {TRI_OPTIONS.map(opt => (
                <label key={opt.value}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-colors
                    ${localSort === opt.value ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}>
                  <input type="radio" name="sort" value={opt.value} checked={localSort === opt.value}
                    onChange={() => setLocalSort(opt.value)} className="accent-blue-600" />
                  <span className="text-xs font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <ClipboardCheck className="w-3.5 h-3.5" /> Colonnes visibles
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">Disponibles</p>
                <div className="min-h-[100px] rounded-lg border border-slate-200 bg-slate-50 p-2 space-y-1">
                  {available.length === 0
                    ? <p className="text-[11px] text-slate-400 italic text-center pt-4">Toutes affichées</p>
                    : available.map(col => (
                      <button key={col.id} onClick={() => addCol(col.id)}
                        className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-xs text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all group">
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
                            <button onClick={() => removeCol(id)} className="p-0.5 hover:bg-red-50 rounded text-slate-300 hover:text-red-500 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
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

// ── Agent dropdown ─────────────────────────────────────────────────────────────

function AgentDropdown({ agents, selected, onChange }: {
  agents: string[]; selected: string | null; onChange: (v: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
          ${selected ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
        <User className="w-3.5 h-3.5" />
        {selected ?? 'Assigné à'}
        {selected && (
          <span onClick={e => { e.stopPropagation(); onChange(null); }}
            className="ml-1 w-3.5 h-3.5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-[9px] font-bold cursor-pointer hover:bg-indigo-300">
            ×
          </span>
        )}
        <ChevronDown className="w-3 h-3 opacity-50" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden min-w-[180px]">
          <div className="py-1">
            <button onClick={() => { onChange(null); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-xs text-slate-400 hover:bg-slate-50">
              Tous les agents
            </button>
            {agents.map(a => (
              <button key={a} onClick={() => { onChange(a); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-indigo-50 transition-colors
                  ${selected === a ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700'}`}>
                <AgentAvatar name={a} size={20} />
                {a}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── EDL Row ───────────────────────────────────────────────────────────────────

function EdlRow({ r, idx, activeCols, colWidths, onOpen }: {
  r: EdlRecord; idx: number;
  activeCols: ColDef[]; colWidths: Record<string, number>;
  onOpen?: (r: EdlRecord) => void;
}) {
  const rowBg  = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';
  const effSt  = effectiveStatut(r);
  const cfg    = EDL_CFG[effSt];
  const isSigned = effSt === 'realise';

  const cellFor = (id: string) => {
    const w = colWidths[id];
    switch (id) {
      case 'occupant':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <StudentAvatar prenom={r.prenom} nom={r.nom} photoUrl={r.photo_url} size={30} />
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 text-xs leading-snug">{r.prenom} {r.nom}</p>
                {r.etablissement && <p className="text-[10px] text-slate-400 truncate">{r.etablissement}</p>}
              </div>
            </div>
          </td>
        );

      case 'logement':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{r.logement_numero}</span>
            {r.type_logement && <p className="text-[10px] text-slate-400 mt-0.5">{r.type_logement}{r.surface_m2 ? ` · ${r.surface_m2}m²` : ''}</p>}
          </td>
        );

      case 'residence':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <p className="text-xs text-slate-700 truncate">{r.residence_nom}</p>
            {(r.batiment_nom || r.etage_numero != null) && (
              <p className="text-[10px] text-slate-400 mt-0.5">
                {[r.batiment_nom, r.etage_numero != null ? `Ét. ${r.etage_numero}` : null].filter(Boolean).join(' · ')}
              </p>
            )}
          </td>
        );

      case 'type':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <div className="flex flex-col gap-1">
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border w-fit
                ${r.type === 'entrant' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                {r.type === 'entrant'
                  ? <LogIn  className="w-3.5 h-3.5 flex-shrink-0" />
                  : <LogOut className="w-3.5 h-3.5 flex-shrink-0" />}
                {r.type === 'entrant' ? 'Entrée' : 'Sortie'}
              </span>
              {isSigned && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full w-fit">
                  <CheckCheck className="w-3 h-3" />
                  <PenLine className="w-3 h-3" />
                  Signé
                </span>
              )}
            </div>
          </td>
        );

      case 'statut':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </td>
        );

      case 'date':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5 text-xs text-slate-600 whitespace-nowrap">
            {r.date ? new Date(r.date).toLocaleDateString('fr-FR') : <span className="text-slate-300">—</span>}
          </td>
        );

      case 'entree':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">
            {r.date_entree ? new Date(r.date_entree).toLocaleDateString('fr-FR') : <span className="text-slate-300">—</span>}
          </td>
        );

      case 'sortie':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">
            {r.date_sortie_prevue ? new Date(r.date_sortie_prevue).toLocaleDateString('fr-FR') : <span className="text-slate-300">—</span>}
          </td>
        );

      case 'agent':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            {r.agent_edl ? (
              <div className="flex items-center gap-2">
                <AgentAvatar name={r.agent_edl} size={26} />
                <span className="text-xs text-slate-700 font-medium truncate">{r.agent_edl}</span>
              </div>
            ) : <span className="text-slate-300 text-xs">—</span>}
          </td>
        );

      case 'action':
        return (
          <td key={id} style={{ width: w }} className="px-3 py-2.5">
            <button
              onClick={e => { e.stopPropagation(); onOpen?.(r); }}
              title={effSt === 'realise' ? 'Voir l\'EDL' : 'Démarrer l\'EDL'}
              className={`p-1.5 rounded-lg border transition-all ${
                effSt === 'realise'
                  ? 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                  : 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100'
              }`}>
              {effSt === 'realise'
                ? <Eye          className="w-3.5 h-3.5" />
                : <ClipboardEdit className="w-3.5 h-3.5" />}
            </button>
          </td>
        );

      default:
        return <td key={id} style={{ width: w }} className="px-3 py-2.5" />;
    }
  };

  return (
    <tr className={`${rowBg} hover:bg-blue-50/30 transition-colors cursor-pointer group`} onClick={() => onOpen?.(r)}>
      {activeCols.map(col => cellFor(col.id))}
    </tr>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function EdlListe({ records, preEdlRecords = DEMO_PRE_EDL, loading, onOpenPreEdl, onCreatePreEdl, onOpenEdl }: Props) {
  const [tab, setTab]               = useState<TabMode>('edl');
  const [search, setSearch]         = useState('');
  const [filterType, setFilterType] = useState<EdlType | 'tous'>('tous');
  const [filterStatut, setFilterStatut] = useState<EdlStatut | 'tous'>('tous');
  const [filterAgent, setFilterAgent]   = useState<string | null>(null);

  const defaultVisibleIds = useMemo(() => EDL_COLUMNS.map(c => c.id), []);
  const [visibleCols,   setVisibleCols]   = useState<string[]>(defaultVisibleIds);
  const [showSidebar,   setShowSidebar]   = useState(false);
  const [sortField,     setSortField]     = useState('date');
  const [sortDir,       setSortDir]       = useState<'asc' | 'desc'>('desc');
  const [defaultSort,   setDefaultSort]   = useState('date_desc');
  const [colWidths,     setColWidths]     = useState<Record<string, number>>(
    () => Object.fromEntries(EDL_COLUMNS.map(c => [c.id, c.defaultWidth]))
  );

  const handleResize = useCallback((id: string, delta: number) => {
    setColWidths(prev => {
      const col = EDL_COLUMNS.find(c => c.id === id)!;
      return { ...prev, [id]: Math.max(col.minWidth, prev[id] + delta) };
    });
  }, []);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const applyDefaultSort = (s: string) => {
    setDefaultSort(s);
    const parts = s.split('_'); const dir = parts.pop() as 'asc' | 'desc'; const field = parts.join('_');
    setSortField(field); setSortDir(dir);
  };

  const allAgents = useMemo(() => {
    const set = new Set<string>();
    records.forEach(r => r.agent_edl && set.add(r.agent_edl));
    return [...set].sort();
  }, [records]);

  const filteredEdl = useMemo(() => {
    let items = records.filter(r => {
      const q   = search.toLowerCase();
      const eff = effectiveStatut(r);
      const matchSearch = !q
        || r.nom.toLowerCase().includes(q)
        || r.prenom.toLowerCase().includes(q)
        || r.logement_numero.toLowerCase().includes(q)
        || r.residence_nom.toLowerCase().includes(q)
        || (r.agent_edl ?? '').toLowerCase().includes(q);
      const matchType   = filterType   === 'tous' || r.type === filterType;
      const matchStatut = filterStatut === 'tous' || eff    === filterStatut;
      const matchAgent  = !filterAgent || r.agent_edl === filterAgent;
      return matchSearch && matchType && matchStatut && matchAgent;
    });

    items.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'occupant':   return dir * `${a.nom}${a.prenom}`.localeCompare(`${b.nom}${b.prenom}`);
        case 'logement':   return dir * a.logement_numero.localeCompare(b.logement_numero);
        case 'residence':  return dir * a.residence_nom.localeCompare(b.residence_nom);
        case 'type':       return dir * a.type.localeCompare(b.type);
        case 'statut':     return dir * effectiveStatut(a).localeCompare(effectiveStatut(b));
        case 'date':       return dir * ((a.date ?? '').localeCompare(b.date ?? ''));
        case 'entree':     return dir * ((a.date_entree ?? '').localeCompare(b.date_entree ?? ''));
        case 'sortie':     return dir * ((a.date_sortie_prevue ?? '').localeCompare(b.date_sortie_prevue ?? ''));
        case 'agent':      return dir * ((a.agent_edl ?? '').localeCompare(b.agent_edl ?? ''));
        default:           return 0;
      }
    });
    return items;
  }, [records, search, filterType, filterStatut, filterAgent, sortField, sortDir]);

  const filteredPreEdl = preEdlRecords.filter(r => {
    const q = search.toLowerCase();
    return !q
      || r.nom.toLowerCase().includes(q)
      || r.prenom.toLowerCase().includes(q)
      || r.logement_numero.toLowerCase().includes(q)
      || r.residence_nom.toLowerCase().includes(q);
  });

  const activeCols = EDL_COLUMNS.filter(c => visibleCols.includes(c.id));
  const totalWidth = activeCols.reduce((s, c) => s + colWidths[c.id], 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Toolbar row 1 */}
      <div className="px-4 py-3 border-b border-slate-100 bg-white flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 flex-shrink-0">
          <button onClick={() => setTab('edl')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${tab === 'edl' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <ClipboardCheck className="w-3.5 h-3.5" />
            États des lieux
            <span className="ml-1 bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{records.length}</span>
          </button>
          <button onClick={() => setTab('pre_edl')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${tab === 'pre_edl' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <CalendarClock className="w-3.5 h-3.5" />
            Pré-EDL
            <span className="ml-1 bg-amber-200 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{preEdlRecords.length}</span>
          </button>
        </div>

        <div className="relative flex-1 min-w-40 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input type="text" placeholder="Rechercher occupant, logement…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>

        {tab === 'edl' && (
          <>
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 flex-shrink-0">
              {(['tous', 'entrant', 'sortant'] as const).map(t => (
                <button key={t} onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${filterType === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  {t === 'tous' ? 'Tous' : t === 'entrant' ? 'Entrants' : 'Sortants'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 flex-shrink-0">
              {(['tous', 'a_realiser', 'realise'] as const).map(s => (
                <button key={s} onClick={() => setFilterStatut(s)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${filterStatut === s ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  {s === 'tous' ? 'Tous' : EDL_CFG[s].label}
                </button>
              ))}
            </div>
            <AgentDropdown agents={allAgents} selected={filterAgent} onChange={setFilterAgent} />
          </>
        )}

        {tab === 'edl' && (
          <button onClick={() => onOpenEdl?.({ id: 'new', occupant_id: '', logement_id: '', nom: '', prenom: '', logement_numero: '', residence_nom: '', type: 'entrant', statut: 'a_realiser', date: null, lien: null, date_entree: null, date_sortie_prevue: null, etablissement: null, type_contrat: null, batiment_nom: null, etage_numero: null, type_logement: null, surface_m2: null, photo_url: null, agent_edl: null })}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex-shrink-0">
            + Créer un EDL
          </button>
        )}
        {tab === 'pre_edl' && (
          <button onClick={onCreatePreEdl}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors flex-shrink-0">
            + Créer un Pré-EDL
          </button>
        )}

        <span className="text-xs text-slate-400 ml-auto flex-shrink-0">
          {tab === 'edl' ? filteredEdl.length : filteredPreEdl.length} résultat{(tab === 'edl' ? filteredEdl.length : filteredPreEdl.length) !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Toolbar row 2 — table controls (EDL tab only) */}
      {tab === 'edl' && (
        <div className="px-4 py-2 border-b border-slate-100 bg-white flex items-center gap-3 flex-shrink-0 flex-wrap">
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
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tab === 'edl' ? (
          filteredEdl.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <ClipboardX className="w-10 h-10 text-slate-200" />
              <p className="text-sm text-slate-400">Aucun état des lieux trouvé</p>
            </div>
          ) : (
            <table className="text-sm border-collapse" style={{ tableLayout: 'fixed', width: Math.max(totalWidth, 900) }}>
              <thead className="sticky top-0 z-10">
                <tr>
                  {activeCols.map(col => (
                    <ResizableTh key={col.id} col={col} width={colWidths[col.id]}
                      onResize={handleResize} sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEdl.map((r, idx) => (
                  <EdlRow key={`${r.occupant_id}-${r.type}`} r={r} idx={idx}
                    activeCols={activeCols} colWidths={colWidths} onOpen={onOpenEdl} />
                ))}
              </tbody>
            </table>
          )
        ) : (
          <PreEdlTable records={filteredPreEdl} onOpen={onOpenPreEdl} />
        )}
      </div>

      {showSidebar && (
        <SettingsSidebar
          visibleCols={visibleCols} setVisibleCols={setVisibleCols}
          defaultSort={defaultSort} setDefaultSort={applyDefaultSort}
          onClose={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
}

// ── PreEdlTable ───────────────────────────────────────────────────────────────

function PreEdlTable({ records, onOpen }: { records: PreEdlRecord[]; onOpen?: (r: PreEdlRecord) => void }) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <CalendarClock className="w-10 h-10 text-slate-200" />
        <p className="text-sm text-slate-400">Aucun Pré-EDL trouvé</p>
      </div>
    );
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-amber-50 border-b border-amber-100 sticky top-0 z-10">
          <th className="text-left px-4 py-2.5 text-xs font-semibold text-amber-700 uppercase tracking-wide">Occupant</th>
          <th className="text-left px-4 py-2.5 text-xs font-semibold text-amber-700 uppercase tracking-wide">Logement</th>
          <th className="text-left px-4 py-2.5 text-xs font-semibold text-amber-700 uppercase tracking-wide">Résidence</th>
          <th className="text-left px-4 py-2.5 text-xs font-semibold text-amber-700 uppercase tracking-wide">Statut</th>
          <th className="text-left px-4 py-2.5 text-xs font-semibold text-amber-700 uppercase tracking-wide">Créé le</th>
          <th className="text-left px-4 py-2.5 text-xs font-semibold text-amber-700 uppercase tracking-wide">Sortie prévue</th>
          <th className="text-right px-4 py-2.5 text-xs font-semibold text-amber-700 uppercase tracking-wide">Estimation</th>
          <th className="px-4 py-2.5" />
        </tr>
      </thead>
      <tbody className="divide-y divide-amber-50">
        {records.map(r => {
          const cfg   = PRE_EDL_CFG[r.statut];
          const total = preEdlTotal(r);
          return (
            <tr key={r.id} className="hover:bg-amber-50 transition-colors cursor-pointer group" onClick={() => onOpen?.(r)}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <StudentAvatar prenom={r.prenom} nom={r.nom} photoUrl={null} size={30} />
                  <p className="font-medium text-slate-800 text-xs">{r.prenom} {r.nom}</p>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="font-mono text-xs font-semibold text-slate-700 bg-amber-100 px-2 py-0.5 rounded">{r.logement_numero}</span>
              </td>
              <td className="px-4 py-3 text-xs text-slate-600">{r.residence_nom}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-slate-500">
                {new Date(r.date_creation).toLocaleDateString('fr-FR')}
              </td>
              <td className="px-4 py-3 text-xs text-slate-500">
                {r.date_sortie_prevue ? new Date(r.date_sortie_prevue).toLocaleDateString('fr-FR') : <span className="text-slate-300">—</span>}
              </td>
              <td className="px-4 py-3 text-right">
                {total > 0 ? (
                  <span className="flex items-center justify-end gap-1 text-xs font-bold text-red-600">
                    <Euro className="w-3 h-3" />{total.toLocaleString('fr-FR')} €
                  </span>
                ) : <span className="text-xs text-slate-300">—</span>}
              </td>
              <td className="px-4 py-3">
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
