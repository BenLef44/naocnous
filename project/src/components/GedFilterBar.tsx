import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Filter, ChevronDown, ChevronRight, Building2, Wrench, Calendar,
  X, Check, Search, Folder, Tag, MapPin, ChevronLeft,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type RootCategory  = 'technique' | 'administratif' | 'reglementaire';
export type SpecialCategory = 'DTA' | 'charges_bailleur';

export interface GedFilters {
  rootCategories:    RootCategory[];
  specialCategories: SpecialCategory[];
  siteIds:           string[];
  residenceIds:      string[];
  equipementCats:    string[];      // categorie level
  equipementSubCats: string[];      // sous_categorie level
  dateFrom:          string;        // YYYY-MM-DD or ''
  dateTo:            string;
  periodPreset:      string;        // '' | 'last30' | 'last90' | '2026' | '2025' | '2024' | '2023' | 'older'
}

export const EMPTY_FILTERS: GedFilters = {
  rootCategories: [],
  specialCategories: [],
  siteIds: [],
  residenceIds: [],
  equipementCats: [],
  equipementSubCats: [],
  dateFrom: '',
  dateTo: '',
  periodPreset: '',
};

// ─── Static reference data (from DB) ──────────────────────────────────────────

interface SiteRef    { id: string; nom: string; code: string; }
interface ResRef     { id: string; nom: string; siteId: string; }
interface EquipCat   { categorie: string; sousCats: string[]; }

// Sites réels CROUS Lyon
export const ALL_SITES: SiteRef[] = [
  { id: 'a1000001-0000-0000-0000-000000000001', nom: 'Campus La Doua / Villeurbanne', code: 'LY-DOUA' },
  { id: 'a1000001-0000-0000-0000-000000000002', nom: 'Campus Rockefeller / Laënnec',  code: 'LY-ROCKE' },
  { id: 'a1000001-0000-0000-0000-000000000003', nom: 'Campus Centre / Lyon 6',         code: 'LY-CENTRE6' },
  { id: 'a1000001-0000-0000-0000-000000000004', nom: 'Campus Manufacture des Tabacs',  code: 'LY-BERGES' },
  { id: 'a1000001-0000-0000-0000-000000000005', nom: 'Campus Porte des Alpes (Bron)',  code: 'LY-BRON' },
  { id: 'a1000001-0000-0000-0000-000000000006', nom: 'Campus ENS Lyon / Gerland',      code: 'LY-ENS' },
  { id: 'a1000001-0000-0000-0000-000000000007', nom: 'Campus Lyon 5 — Saint-Just',     code: 'LY-STJUST' },
  { id: 'a1000001-0000-0000-0000-000000000008', nom: "Campus Lyon Centre / Presqu'île", code: 'LY-PRESQUILE' },
  { id: 'a1000001-0000-0000-0000-000000000009', nom: 'Campus Lyon Centre / Lyon 6',    code: 'LY-CENTRE6B' },
  { id: 'a1000001-0000-0000-0000-000000000010', nom: 'Campus Saint-Priest',            code: 'LY-STPRIEST' },
  { id: 'a1000001-0000-0000-0000-000000000011', nom: 'Campus Bourg-en-Bresse',         code: 'LY-BOURG' },
  { id: 'a1000001-0000-0000-0000-000000000012', nom: 'Campus Saint-Étienne',           code: 'LY-STETIENNE' },
  { id: 'a1000001-0000-0000-0000-000000000013', nom: 'Campus Roanne',                  code: 'LY-ROANNE' },
];

export const ALL_RESIDENCES: ResRef[] = [
  { id: 'b1000001-0000-0000-0000-000000000001', nom: 'Résidence Jussieu',            siteId: 'a1000001-0000-0000-0000-000000000001' },
  { id: 'b1000001-0000-0000-0000-000000000002', nom: 'Résidence Les Antonins',       siteId: 'a1000001-0000-0000-0000-000000000001' },
  { id: 'b1000001-0000-0000-0000-000000000003', nom: 'Résidence Puvis de Chavannes', siteId: 'a1000001-0000-0000-0000-000000000001' },
  { id: 'b1000001-0000-0000-0000-000000000004', nom: 'Résidence Einstein',           siteId: 'a1000001-0000-0000-0000-000000000001' },
  { id: 'b1000001-0000-0000-0000-000000000005', nom: 'Résidence Jussieu Studios',    siteId: 'a1000001-0000-0000-0000-000000000001' },
  { id: 'b1000001-0000-0000-0000-000000000006', nom: 'Résidence Archimède',          siteId: 'a1000001-0000-0000-0000-000000000001' },
  { id: 'b1000001-0000-0000-0000-000000000007', nom: 'Résidence Althéa',             siteId: 'a1000001-0000-0000-0000-000000000001' },
  { id: 'b1000001-0000-0000-0000-000000000008', nom: 'Résidence Paradin',            siteId: 'a1000001-0000-0000-0000-000000000002' },
  { id: 'b1000001-0000-0000-0000-000000000009', nom: 'Résidence Croix du Sud',       siteId: 'a1000001-0000-0000-0000-000000000002' },
  { id: 'b1000001-0000-0000-0000-000000000010', nom: 'Résidence Jean Mermoz',        siteId: 'a1000001-0000-0000-0000-000000000002' },
  { id: 'b1000001-0000-0000-0000-000000000011', nom: 'Résidence Jacques Cavalier',   siteId: 'a1000001-0000-0000-0000-000000000003' },
  { id: 'b1000001-0000-0000-0000-000000000012', nom: 'Résidence Voltaire',           siteId: 'a1000001-0000-0000-0000-000000000003' },
  { id: 'b1000001-0000-0000-0000-000000000013', nom: 'Résidence La Madeleine',       siteId: 'a1000001-0000-0000-0000-000000000004' },
  { id: 'b1000001-0000-0000-0000-000000000014', nom: 'Résidence Les Quais',          siteId: 'a1000001-0000-0000-0000-000000000004' },
  { id: 'b1000001-0000-0000-0000-000000000015', nom: 'Résidence Garibaldi',          siteId: 'a1000001-0000-0000-0000-000000000004' },
  { id: 'b1000001-0000-0000-0000-000000000016', nom: 'Résidence Benjamin Delessert', siteId: 'a1000001-0000-0000-0000-000000000004' },
  { id: 'b1000001-0000-0000-0000-000000000017', nom: 'Résidence André Lirondelle',   siteId: 'a1000001-0000-0000-0000-000000000004' },
  { id: 'b1000001-0000-0000-0000-000000000018', nom: 'Résidence Alice Guy',          siteId: 'a1000001-0000-0000-0000-000000000005' },
  { id: 'b1000001-0000-0000-0000-000000000019', nom: 'Résidence Les Girondins',      siteId: 'a1000001-0000-0000-0000-000000000006' },
  { id: 'b1000001-0000-0000-0000-000000000020', nom: 'Résidence André Allix',        siteId: 'a1000001-0000-0000-0000-000000000007' },
  { id: 'b1000001-0000-0000-0000-000000000021', nom: 'Résidence Philomène Magnin',   siteId: 'a1000001-0000-0000-0000-000000000007' },
  { id: 'b1000001-0000-0000-0000-000000000022', nom: "Résidence Arches d'Agrippa",   siteId: 'a1000001-0000-0000-0000-000000000007' },
  { id: 'b1000001-0000-0000-0000-000000000023', nom: 'Résidence Jean Meygret',       siteId: 'a1000001-0000-0000-0000-000000000007' },
  { id: 'b1000001-0000-0000-0000-000000000024', nom: 'Résidence Confluence',         siteId: 'a1000001-0000-0000-0000-000000000008' },
  { id: 'b1000001-0000-0000-0000-000000000025', nom: 'Résidence Bugeaud',            siteId: 'a1000001-0000-0000-0000-000000000009' },
  { id: 'b1000001-0000-0000-0000-000000000026', nom: 'Résidence Aimé Césaire',       siteId: 'a1000001-0000-0000-0000-000000000010' },
];

export const EQUIP_CATS: EquipCat[] = [
  { categorie: 'Ascenseurs',        sousCats: ['Ascenseur électrique', 'Escalier mécanique', 'Monte-charge', 'Plateforme PMR'] },
  { categorie: 'Chauffage',         sousCats: ['Chaudière fioul', 'Chaudière gaz', 'Pompe à chaleur', 'Réseau distribution', 'Sous-station'] },
  { categorie: 'Climatisation',     sousCats: ['Armoire climatisation', 'Climatisation VRV/DRV', 'Groupe froid'] },
  { categorie: 'Eau sanitaire',     sousCats: ['Adoucisseur', 'Ballon ECS', 'Réseau ECS', 'Surpresseur'] },
  { categorie: 'Électricité',       sousCats: ['Armoire électrique', 'Groupe électrogène', 'TGBT', 'Transformateur'] },
  { categorie: 'Électroménager',    sousCats: ['Réfrigération professionnelle'] },
  { categorie: 'Gaz',               sousCats: ['Centrale gaz', 'Chaufferie', 'Détendeur', 'Réseau gaz'] },
  { categorie: 'Sécurité incendie', sousCats: ['Centrale incendie', 'Colonnes sèches', 'Désenfumage', 'SSI'] },
  { categorie: 'Structure bâtiment', sousCats: ['Charpente', 'Façade', 'Garde-corps', 'Toiture terrasse'] },
  { categorie: 'Ventilation',       sousCats: ['CTA', 'Désenfumage', 'Extracteur VMC', 'Tourelle extraction'] },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const ROOT_CFG: Record<RootCategory, { label: string; color: string; bg: string; border: string }> = {
  technique:     { label: 'Technique',     color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200'    },
  administratif: { label: 'Administratif', color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200'   },
  reglementaire: { label: 'Réglementaire', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
};

const SPECIAL_CFG: Record<SpecialCategory, { label: string; color: string; bg: string; border: string }> = {
  DTA:              { label: 'DTA (Amiante)',           color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200'    },
  charges_bailleur: { label: 'Charges Bailleur-Preneur', color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-300' },
};

const PERIOD_PRESETS = [
  { value: 'last30',  label: '30 derniers jours' },
  { value: 'last90',  label: '90 derniers jours' },
  { value: '2026',    label: 'Année 2026' },
  { value: '2025',    label: 'Année 2025' },
  { value: '2024',    label: 'Année 2024' },
  { value: '2023',    label: 'Année 2023' },
  { value: 'older',   label: 'Avant 2023' },
];

// ─── Active filter count ───────────────────────────────────────────────────────

export function countActiveFilters(f: GedFilters): number {
  return (
    f.rootCategories.length +
    f.specialCategories.length +
    f.siteIds.length +
    f.residenceIds.length +
    f.equipementCats.length +
    f.equipementSubCats.length +
    (f.dateFrom || f.dateTo || f.periodPreset ? 1 : 0)
  );
}

// ─── Pill component ───────────────────────────────────────────────────────────

function Pill({ label, color, bg, border, onRemove }: {
  label: string; color: string; bg: string; border: string; onRemove: () => void;
}) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${bg} ${color} ${border} whitespace-nowrap`}>
      {label}
      <button onClick={onRemove} className="ml-0.5 hover:opacity-70 transition-opacity">
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}

// ─── Dropdown portal ──────────────────────────────────────────────────────────

function Dropdown({ trigger, children, width = 280 }: {
  trigger: React.ReactNode; children: React.ReactNode; width?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
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

// ─── Site tree picker ──────────────────────────────────────────────────────────

function SiteTreePicker({ selectedSiteIds, selectedResIds, onChange }: {
  selectedSiteIds: string[];
  selectedResIds:  string[];
  onChange: (siteIds: string[], resIds: string[]) => void;
}) {
  const [search,  setSearch]  = useState('');
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
    const next = selectedSiteIds.includes(id)
      ? selectedSiteIds.filter(x => x !== id)
      : [...selectedSiteIds, id];
    // If deselecting a site, also remove its residences
    const siteResIds = ALL_RESIDENCES.filter(r => r.siteId === id).map(r => r.id);
    const nextRes = selectedSiteIds.includes(id)
      ? selectedResIds.filter(r => !siteResIds.includes(r))
      : selectedResIds;
    onChange(next, nextRes);
  };

  const toggleRes = (id: string) => {
    const next = selectedResIds.includes(id)
      ? selectedResIds.filter(x => x !== id)
      : [...selectedResIds, id];
    onChange(selectedSiteIds, next);
  };

  const toggleExpand = (id: string) => {
    setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const totalSelected = selectedSiteIds.length + selectedResIds.length;

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
          const residences = ALL_RESIDENCES.filter(r => r.siteId === site.id);
          const isExpanded = expanded.has(site.id) || !!search;
          const siteSelected = selectedSiteIds.includes(site.id);
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
      {totalSelected > 0 && (
        <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">{totalSelected} sélectionné{totalSelected > 1 ? 's' : ''}</span>
          <button onClick={() => onChange([], [])} className="text-[11px] text-red-500 hover:text-red-600">Effacer</button>
        </div>
      )}
    </div>
  );
}

// ─── Equip tree picker ────────────────────────────────────────────────────────

function EquipTreePicker({ selectedCats, selectedSubCats, onChange }: {
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
    const next = selectedCats.includes(cat)
      ? selectedCats.filter(x => x !== cat)
      : [...selectedCats, cat];
    // deselect sub-cats when parent deselected
    const catObj = EQUIP_CATS.find(c => c.categorie === cat);
    const nextSub = selectedCats.includes(cat)
      ? selectedSubCats.filter(s => !catObj?.sousCats.includes(s))
      : selectedSubCats;
    onChange(next, nextSub);
  };

  const toggleSub = (sub: string) => {
    const next = selectedSubCats.includes(sub)
      ? selectedSubCats.filter(x => x !== sub)
      : [...selectedSubCats, sub];
    onChange(selectedCats, next);
  };

  const toggleExpand = (cat: string) => {
    setExpanded(prev => { const s = new Set(prev); s.has(cat) ? s.delete(cat) : s.add(cat); return s; });
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
        {filteredCats.map(({ categorie, sousCats }) => {
          const isExpanded = expanded.has(categorie) || !!search;
          const catSelected = selectedCats.includes(categorie);
          const someSubSelected = sousCats.some(s => selectedSubCats.includes(s));
          return (
            <div key={categorie}>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50">
                <button onClick={() => toggleExpand(categorie)} className="flex-shrink-0 text-slate-400">
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                <input type="checkbox" checked={catSelected || someSubSelected}
                  ref={el => { if (el) el.indeterminate = !catSelected && someSubSelected; }}
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
      {(selectedCats.length + selectedSubCats.length) > 0 && (
        <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">{selectedCats.length + selectedSubCats.length} sélectionné{selectedCats.length + selectedSubCats.length > 1 ? 's' : ''}</span>
          <button onClick={() => onChange([], [])} className="text-[11px] text-red-500 hover:text-red-600">Effacer</button>
        </div>
      )}
    </div>
  );
}

// ─── Period picker ────────────────────────────────────────────────────────────

function PeriodPicker({ filters, onChange }: {
  filters: GedFilters;
  onChange: (patch: Partial<GedFilters>) => void;
}) {
  return (
    <div className="p-3 space-y-3">
      <div>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Période prédéfinie</p>
        <div className="grid grid-cols-2 gap-1">
          {PERIOD_PRESETS.map(p => (
            <button key={p.value}
              onClick={() => onChange({ periodPreset: filters.periodPreset === p.value ? '' : p.value, dateFrom: '', dateTo: '' })}
              className={`text-left text-xs px-2.5 py-1.5 rounded-lg border transition-all
                ${filters.periodPreset === p.value
                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-medium'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="border-t border-slate-100 pt-3">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Période personnalisée</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">Du</label>
            <input type="date" value={filters.dateFrom}
              onChange={e => onChange({ dateFrom: e.target.value, periodPreset: '' })}
              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300/40" />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">Au</label>
            <input type="date" value={filters.dateTo}
              onChange={e => onChange({ dateTo: e.target.value, periodPreset: '' })}
              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300/40" />
          </div>
        </div>
      </div>
      {(filters.dateFrom || filters.dateTo || filters.periodPreset) && (
        <button onClick={() => onChange({ dateFrom: '', dateTo: '', periodPreset: '' })}
          className="text-[11px] text-red-500 hover:text-red-600 w-full text-right">
          Effacer la période
        </button>
      )}
    </div>
  );
}

// ─── Trigger button ───────────────────────────────────────────────────────────

function TriggerBtn({ icon, label, count, active }: {
  icon: React.ReactNode; label: string; count?: number; active?: boolean;
}) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all select-none
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

// ─── Main filter bar ──────────────────────────────────────────────────────────

interface GedFilterBarProps {
  filters: GedFilters;
  onChange: (patch: Partial<GedFilters>) => void;
  onReset: () => void;
}

export default function GedFilterBar({ filters, onChange, onReset }: GedFilterBarProps) {
  const totalActive = countActiveFilters(filters);

  // Pills helpers
  const removeSite = (id: string) =>
    onChange({ siteIds: filters.siteIds.filter(x => x !== id) });
  const removeRes = (id: string) =>
    onChange({ residenceIds: filters.residenceIds.filter(x => x !== id) });
  const removeEquipCat = (c: string) =>
    onChange({ equipementCats: filters.equipementCats.filter(x => x !== c) });
  const removeEquipSub = (s: string) =>
    onChange({ equipementSubCats: filters.equipementSubCats.filter(x => x !== s) });

  const periodLabel = filters.periodPreset
    ? PERIOD_PRESETS.find(p => p.value === filters.periodPreset)?.label
    : filters.dateFrom && filters.dateTo
      ? `${filters.dateFrom} → ${filters.dateTo}`
      : filters.dateFrom ? `Depuis ${filters.dateFrom}`
      : filters.dateTo   ? `Jusqu'au ${filters.dateTo}`
      : null;

  const hasPills = (
    filters.rootCategories.length + filters.specialCategories.length +
    filters.siteIds.length + filters.residenceIds.length +
    filters.equipementCats.length + filters.equipementSubCats.length +
    (periodLabel ? 1 : 0)
  ) > 0;

  return (
    <div className="bg-white border-b border-slate-100 flex-shrink-0">
      {/* Main filter row */}
      <div className="px-4 py-2.5 flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span className="font-medium">Filtres</span>
          {totalActive > 0 && (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{totalActive}</span>
          )}
        </div>

        <div className="w-px h-4 bg-slate-200 flex-shrink-0" />

        {/* Categories */}
        <Dropdown
          width={320}
          trigger={
            <TriggerBtn
              icon={<Tag className="w-3 h-3" />}
              label="Catégories"
              count={filters.rootCategories.length + filters.specialCategories.length}
              active={filters.rootCategories.length + filters.specialCategories.length > 0}
            />
          }
        >
          <div className="p-3 space-y-2">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Catégories principales</p>
            <div className="space-y-1">
              {(Object.keys(ROOT_CFG) as RootCategory[]).map(root => {
                const cfg = ROOT_CFG[root];
                const active = filters.rootCategories.includes(root);
                return (
                  <label key={root} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all border
                    ${active ? `${cfg.bg} ${cfg.border}` : 'bg-white border-transparent hover:bg-slate-50'}`}>
                    <input type="checkbox" checked={active}
                      onChange={() => onChange({ rootCategories: active ? filters.rootCategories.filter(x => x !== root) : [...filters.rootCategories, root] })}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 cursor-pointer" />
                    <span className={`text-xs font-medium ${active ? cfg.color : 'text-slate-700'}`}>{cfg.label}</span>
                    {active && <Check className={`w-3 h-3 ml-auto ${cfg.color}`} />}
                  </label>
                );
              })}
            </div>
            <div className="border-t border-slate-100 pt-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Catégories spéciales</p>
              {(Object.keys(SPECIAL_CFG) as SpecialCategory[]).map(sc => {
                const cfg = SPECIAL_CFG[sc];
                const active = filters.specialCategories.includes(sc);
                return (
                  <label key={sc} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all border mt-1
                    ${active ? `${cfg.bg} ${cfg.border}` : 'bg-white border-transparent hover:bg-slate-50'}`}>
                    <input type="checkbox" checked={active}
                      onChange={() => onChange({ specialCategories: active ? filters.specialCategories.filter(x => x !== sc) : [...filters.specialCategories, sc] })}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 cursor-pointer" />
                    <span className={`text-xs font-medium ${active ? cfg.color : 'text-slate-700'}`}>{cfg.label}</span>
                    {active && <Check className={`w-3 h-3 ml-auto ${cfg.color}`} />}
                  </label>
                );
              })}
            </div>
          </div>
        </Dropdown>

        {/* Sites */}
        <Dropdown
          width={340}
          trigger={
            <TriggerBtn
              icon={<MapPin className="w-3 h-3" />}
              label="Sites"
              count={filters.siteIds.length + filters.residenceIds.length}
              active={filters.siteIds.length + filters.residenceIds.length > 0}
            />
          }
        >
          <SiteTreePicker
            selectedSiteIds={filters.siteIds}
            selectedResIds={filters.residenceIds}
            onChange={(siteIds, residenceIds) => onChange({ siteIds, residenceIds })}
          />
        </Dropdown>

        {/* Équipements */}
        <Dropdown
          width={320}
          trigger={
            <TriggerBtn
              icon={<Wrench className="w-3 h-3" />}
              label="Équipements"
              count={filters.equipementCats.length + filters.equipementSubCats.length}
              active={filters.equipementCats.length + filters.equipementSubCats.length > 0}
            />
          }
        >
          <EquipTreePicker
            selectedCats={filters.equipementCats}
            selectedSubCats={filters.equipementSubCats}
            onChange={(cats, subCats) => onChange({ equipementCats: cats, equipementSubCats: subCats })}
          />
        </Dropdown>

        {/* Période */}
        <Dropdown
          width={300}
          trigger={
            <TriggerBtn
              icon={<Calendar className="w-3 h-3" />}
              label="Période"
              count={filters.dateFrom || filters.dateTo || filters.periodPreset ? 1 : undefined}
              active={!!(filters.dateFrom || filters.dateTo || filters.periodPreset)}
            />
          }
        >
          <PeriodPicker filters={filters} onChange={onChange} />
        </Dropdown>

        {totalActive > 0 && (
          <>
            <div className="w-px h-4 bg-slate-200 flex-shrink-0" />
            <button onClick={onReset}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium transition-colors flex-shrink-0">
              <X className="w-3 h-3" /> Réinitialiser
            </button>
          </>
        )}
      </div>

      {/* Active filter pills */}
      {hasPills && (
        <div className="px-4 pb-2.5 flex items-center gap-1.5 flex-wrap">
          <ChevronLeft className="w-3 h-3 text-slate-300 flex-shrink-0" />
          {filters.rootCategories.map(r => {
            const cfg = ROOT_CFG[r];
            return <Pill key={r} label={cfg.label} color={cfg.color} bg={cfg.bg} border={cfg.border} onRemove={() => onChange({ rootCategories: filters.rootCategories.filter(x => x !== r) })} />;
          })}
          {filters.specialCategories.map(sc => {
            const cfg = SPECIAL_CFG[sc];
            return <Pill key={sc} label={cfg.label} color={cfg.color} bg={cfg.bg} border={cfg.border} onRemove={() => onChange({ specialCategories: filters.specialCategories.filter(x => x !== sc) })} />;
          })}
          {filters.siteIds.map(id => {
            const s = ALL_SITES.find(x => x.id === id);
            return s ? <Pill key={id} label={s.nom.replace('Campus ', '')} color="text-blue-700" bg="bg-blue-50" border="border-blue-200" onRemove={() => removeSite(id)} /> : null;
          })}
          {filters.residenceIds.map(id => {
            const r = ALL_RESIDENCES.find(x => x.id === id);
            return r ? <Pill key={id} label={r.nom.replace('Résidence ', '')} color="text-slate-700" bg="bg-slate-100" border="border-slate-300" onRemove={() => removeRes(id)} /> : null;
          })}
          {filters.equipementCats.map(c => (
            <Pill key={c} label={c} color="text-slate-700" bg="bg-slate-100" border="border-slate-300" onRemove={() => removeEquipCat(c)} />
          ))}
          {filters.equipementSubCats.map(s => (
            <Pill key={s} label={s} color="text-slate-600" bg="bg-slate-50" border="border-slate-200" onRemove={() => removeEquipSub(s)} />
          ))}
          {periodLabel && (
            <Pill label={periodLabel} color="text-slate-700" bg="bg-slate-100" border="border-slate-300"
              onRemove={() => onChange({ dateFrom: '', dateTo: '', periodPreset: '' })} />
          )}
        </div>
      )}
    </div>
  );
}
