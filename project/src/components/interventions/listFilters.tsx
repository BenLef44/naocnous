import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, ChevronDown, ChevronRight, Building2, Wrench, Folder, User, X,
} from 'lucide-react';
import { ALL_SITES, ALL_RESIDENCES, EQUIP_CATS } from '../GedFilterBar';
import { CATEGORIES_DI } from './interventionsTypes';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PeriodePreset = 'today' | 'yesterday' | 'this_week' | 'this_month';

export interface PeriodeFilter {
  preset: PeriodePreset | 'custom' | null;
  customStart: string; // datetime-local string
  customEnd:   string;
}

export const EMPTY_PERIODE: PeriodeFilter = { preset: null, customStart: '', customEnd: '' };

export const PERIODE_PRESETS: { key: PeriodePreset; label: string }[] = [
  { key: 'today',      label: "Aujourd'hui"    },
  { key: 'yesterday',  label: 'Hier'            },
  { key: 'this_week',  label: 'Cette semaine'   },
  { key: 'this_month', label: 'Ce mois'         },
];

// Returns [start, end] timestamps in ms for the given filter, or null if not set
export function periodeRange(f: PeriodeFilter): [number, number] | null {
  const now = new Date();
  const sod = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const eod = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();

  switch (f.preset) {
    case 'today':
      return [sod(now), eod(now)];

    case 'yesterday': {
      const y = new Date(now); y.setDate(y.getDate() - 1);
      return [sod(y), eod(y)];
    }

    case 'this_week': {
      const dow = (now.getDay() + 6) % 7; // Mon = 0
      const mon = new Date(now); mon.setDate(now.getDate() - dow);
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
      return [sod(mon), eod(sun)];
    }

    case 'this_month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return [sod(start), eod(end)];
    }

    case 'custom': {
      const s = f.customStart ? new Date(f.customStart).getTime() : null;
      const e = f.customEnd   ? new Date(f.customEnd).getTime()   : null;
      if (s !== null && e !== null) return [s, e];
      return null;
    }

    default:
      return null;
  }
}

export function periodeLabel(f: PeriodeFilter): string | null {
  if (!f.preset) return null;
  if (f.preset === 'custom') {
    const parts: string[] = [];
    if (f.customStart) parts.push(new Date(f.customStart).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
    if (f.customEnd)   parts.push(new Date(f.customEnd).toLocaleDateString('fr-FR',   { day: '2-digit', month: '2-digit' }));
    return parts.length === 2 ? parts.join(' → ') : 'Personnalisée';
  }
  return PERIODE_PRESETS.find(p => p.key === f.preset)?.label ?? null;
}

// ─── Shared dropdown wrapper ──────────────────────────────────────────────────

export function ListDropdown({ trigger, children, width = 300 }: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-[100] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
          style={{ width }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Filter button ─────────────────────────────────────────────────────────────

export function ListFilterBtn({ icon, label, count, active }: {
  icon: React.ReactNode; label: string; count?: number; active?: boolean;
}) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all select-none
      ${active ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
      {icon}
      <span>{label}</span>
      {count != null && count > 0 && (
        <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold
          ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
          {count}
        </span>
      )}
      <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
    </div>
  );
}

// ─── SitePicker ───────────────────────────────────────────────────────────────

export function SitePicker({ selectedSiteIds, selectedResIds, onChange }: {
  selectedSiteIds: string[];
  selectedResIds:  string[];
  onChange: (siteIds: string[], resIds: string[]) => void;
}) {
  const [search, setSearch]     = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filteredSites = useMemo(() => {
    if (!search) return ALL_SITES;
    const q = search.toLowerCase();
    return ALL_SITES.filter(s =>
      s.nom.toLowerCase().includes(q) ||
      ALL_RESIDENCES.filter(r => r.siteId === s.id).some(r => r.nom.toLowerCase().includes(q))
    );
  }, [search]);

  const toggleSite = (id: string) => {
    const removing    = selectedSiteIds.includes(id);
    const nextSite    = removing ? selectedSiteIds.filter(x => x !== id) : [...selectedSiteIds, id];
    const siteResIds  = ALL_RESIDENCES.filter(r => r.siteId === id).map(r => r.id);
    const nextRes     = removing ? selectedResIds.filter(r => !siteResIds.includes(r)) : selectedResIds;
    onChange(nextSite, nextRes);
  };

  const toggleRes = (id: string) => {
    const next = selectedResIds.includes(id) ? selectedResIds.filter(x => x !== id) : [...selectedResIds, id];
    onChange(selectedSiteIds, next);
  };

  const toggleExpand = (id: string) =>
    setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const total = selectedSiteIds.length + selectedResIds.length;

  return (
    <div className="flex flex-col">
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un site ou résidence…"
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/40" />
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto px-2 pb-2 space-y-0.5">
        {filteredSites.map(site => {
          const residences      = ALL_RESIDENCES.filter(r => r.siteId === site.id);
          const isExpanded      = expanded.has(site.id) || !!search;
          const siteSelected    = selectedSiteIds.includes(site.id);
          const someResSelected = residences.some(r => selectedResIds.includes(r.id));
          return (
            <div key={site.id}>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 group">
                <button onClick={() => toggleExpand(site.id)} className="flex-shrink-0 text-slate-400">
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                <input type="checkbox" checked={siteSelected || someResSelected}
                  ref={el => { if (el) el.indeterminate = !siteSelected && someResSelected; }}
                  onChange={() => toggleSite(site.id)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 cursor-pointer flex-shrink-0" />
                <Building2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span className="text-xs text-slate-700 flex-1 min-w-0 truncate font-medium">{site.nom}</span>
                <span className="text-[10px] text-slate-400 flex-shrink-0">{site.code}</span>
              </div>
              {isExpanded && residences.map(res => (
                <div key={res.id} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 ml-6">
                  <input type="checkbox" checked={selectedResIds.includes(res.id)}
                    onChange={() => toggleRes(res.id)}
                    className="w-3 h-3 rounded border-slate-300 text-blue-600 cursor-pointer flex-shrink-0" />
                  <Folder className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  <span className="text-[11px] text-slate-600 flex-1 min-w-0 truncate">{res.nom}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {total > 0 && (
        <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">{total} sélectionné{total > 1 ? 's' : ''}</span>
          <button onClick={() => onChange([], [])} className="text-[11px] text-red-500 hover:text-red-600">Effacer</button>
        </div>
      )}
    </div>
  );
}

// ─── EquipPicker ──────────────────────────────────────────────────────────────

export function EquipPicker({ selectedCats, selectedSubCats, onChange }: {
  selectedCats:    string[];
  selectedSubCats: string[];
  onChange: (cats: string[], subCats: string[]) => void;
}) {
  const [search,   setSearch]   = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filteredCats = useMemo(() => {
    if (!search) return EQUIP_CATS;
    const q = search.toLowerCase();
    return EQUIP_CATS
      .map(c => ({ ...c, sousCats: c.sousCats.filter(s => s.toLowerCase().includes(q) || c.categorie.toLowerCase().includes(q)) }))
      .filter(c => c.sousCats.length > 0 || c.categorie.toLowerCase().includes(q));
  }, [search]);

  const toggleCat = (cat: string) => {
    const removing = selectedCats.includes(cat);
    const nextCat  = removing ? selectedCats.filter(x => x !== cat) : [...selectedCats, cat];
    const catObj   = EQUIP_CATS.find(c => c.categorie === cat);
    const nextSub  = removing ? selectedSubCats.filter(s => !catObj?.sousCats.includes(s)) : selectedSubCats;
    onChange(nextCat, nextSub);
  };

  const toggleSub = (sub: string) => {
    const next = selectedSubCats.includes(sub) ? selectedSubCats.filter(x => x !== sub) : [...selectedSubCats, sub];
    onChange(selectedCats, next);
  };

  const toggleExpand = (cat: string) =>
    setExpanded(prev => { const s = new Set(prev); s.has(cat) ? s.delete(cat) : s.add(cat); return s; });

  const total = selectedCats.length + selectedSubCats.length;

  return (
    <div className="flex flex-col">
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une catégorie…"
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/40" />
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto px-2 pb-2 space-y-0.5">
        {filteredCats.map(({ categorie, sousCats }) => {
          const isExpanded  = expanded.has(categorie) || !!search;
          const catSelected = selectedCats.includes(categorie);
          const someSubSel  = sousCats.some(s => selectedSubCats.includes(s));
          return (
            <div key={categorie}>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50">
                <button onClick={() => toggleExpand(categorie)} className="flex-shrink-0 text-slate-400">
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                <input type="checkbox" checked={catSelected || someSubSel}
                  ref={el => { if (el) el.indeterminate = !catSelected && someSubSel; }}
                  onChange={() => toggleCat(categorie)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 cursor-pointer flex-shrink-0" />
                <Wrench className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-700 flex-1 min-w-0 truncate font-medium">{categorie}</span>
                <span className="text-[10px] text-slate-400">{sousCats.length}</span>
              </div>
              {isExpanded && sousCats.map(sub => (
                <div key={sub} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 ml-6">
                  <input type="checkbox" checked={selectedSubCats.includes(sub)}
                    onChange={() => toggleSub(sub)}
                    className="w-3 h-3 rounded border-slate-300 text-blue-600 cursor-pointer flex-shrink-0" />
                  <span className="text-[11px] text-slate-600">{sub}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {total > 0 && (
        <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">{total} sélectionné{total > 1 ? 's' : ''}</span>
          <button onClick={() => onChange([], [])} className="text-[11px] text-red-500 hover:text-red-600">Effacer</button>
        </div>
      )}
    </div>
  );
}

// ─── CatDIPicker ──────────────────────────────────────────────────────────────

export function CatDIPicker({ selected, onChange }: {
  selected: string[]; onChange: (cats: string[]) => void;
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return CATEGORIES_DI;
    const q = search.toLowerCase();
    return CATEGORIES_DI.filter(c => c.label.toLowerCase().includes(q));
  }, [search]);

  const toggle = (key: string) => {
    const next = selected.includes(key) ? selected.filter(x => x !== key) : [...selected, key];
    onChange(next);
  };

  return (
    <div className="flex flex-col">
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une catégorie…"
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/40" />
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto px-2 pb-2 space-y-0.5">
        {filtered.map(cat => {
          const active = selected.includes(cat.key);
          return (
            <div key={cat.key}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
              onClick={() => toggle(cat.key)}>
              <input type="checkbox" checked={active} onChange={() => toggle(cat.key)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 cursor-pointer flex-shrink-0"
                onClick={e => e.stopPropagation()} />
              <span className="text-sm flex-shrink-0">{cat.icon}</span>
              <span className="text-xs text-slate-700 flex-1 min-w-0 truncate">{cat.label}</span>
            </div>
          );
        })}
      </div>
      {selected.length > 0 && (
        <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">{selected.length} sélectionnée{selected.length > 1 ? 's' : ''}</span>
          <button onClick={() => onChange([])} className="text-[11px] text-red-500 hover:text-red-600">Effacer</button>
        </div>
      )}
    </div>
  );
}

// ─── DemandeurPicker ──────────────────────────────────────────────────────────

export function DemandeurPicker({ items, selected, onChange }: {
  items:    string[];
  selected: string[];
  onChange: (names: string[]) => void;
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(n => n.toLowerCase().includes(q));
  }, [items, search]);

  const toggle = (name: string) => {
    const next = selected.includes(name) ? selected.filter(x => x !== name) : [...selected, name];
    onChange(next);
  };

  return (
    <div className="flex flex-col">
      <div className="px-3 pt-3 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un demandeur…"
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/40" />
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto px-2 pb-2 space-y-0.5">
        {filtered.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-6">Aucun demandeur trouvé</p>
        )}
        {filtered.map(name => {
          const active = selected.includes(name);
          return (
            <div key={name}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
              onClick={() => toggle(name)}>
              <input type="checkbox" checked={active} onChange={() => toggle(name)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 cursor-pointer flex-shrink-0"
                onClick={e => e.stopPropagation()} />
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 text-slate-500" />
              </div>
              <span className="text-xs text-slate-700 flex-1 min-w-0 truncate">{name}</span>
            </div>
          );
        })}
      </div>
      {selected.length > 0 && (
        <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">{selected.length} sélectionné{selected.length > 1 ? 's' : ''}</span>
          <button onClick={() => onChange([])} className="text-[11px] text-red-500 hover:text-red-600">Effacer</button>
        </div>
      )}
    </div>
  );
}

// ─── PeriodePicker ────────────────────────────────────────────────────────────

export function PeriodePicker({ value, onChange }: {
  value:    PeriodeFilter;
  onChange: (v: PeriodeFilter) => void;
}) {
  return (
    <div className="flex flex-col p-3 space-y-1">
      {/* Predefined presets */}
      {PERIODE_PRESETS.map(p => (
        <label key={p.key}
          className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer"
          onClick={() => onChange({ preset: p.key, customStart: '', customEnd: '' })}>
          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
            ${value.preset === p.key ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
            {value.preset === p.key && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
          </div>
          <span className="text-xs text-slate-700">{p.label}</span>
        </label>
      ))}

      {/* Custom */}
      <label
        className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer"
        onClick={() => onChange({ ...value, preset: 'custom' })}>
        <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
          ${value.preset === 'custom' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
          {value.preset === 'custom' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
        <span className="text-xs text-slate-700">Période personnalisée</span>
      </label>

      {/* Custom date-time inputs */}
      {value.preset === 'custom' && (
        <div className="space-y-2 pt-2 mt-1 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Début</label>
            <input type="datetime-local" value={value.customStart}
              onChange={e => onChange({ ...value, customStart: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/40" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Fin</label>
            <input type="datetime-local" value={value.customEnd}
              onChange={e => onChange({ ...value, customEnd: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/40" />
          </div>
        </div>
      )}

      {/* Clear */}
      {value.preset !== null && (
        <div className="border-t border-slate-100 pt-2 flex justify-end">
          <button
            onClick={() => onChange(EMPTY_PERIODE)}
            className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-600 transition-colors">
            <X className="w-3 h-3" /> Effacer la période
          </button>
        </div>
      )}
    </div>
  );
}
