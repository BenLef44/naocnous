import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { ChevronRight, ChevronDown, Building2, MapPin, Euro, BarChart3, Droplets, BookOpen, Search, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Charge, Budget, Facture, ConsommationFluide, Annexe4Regle } from './financeTypes';
import FinanceDashboard from './FinanceDashboard';
import FinanceTableau from './FinanceTableau';
import FinanceFluides from './FinanceFluides';
import FinanceAnnexe4 from './FinanceAnnexe4';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Site { id: string; nom: string; code: string | null }
interface Residence { id: string; nom: string; site_id: string }

type SubView = 'dashboard' | 'tableau' | 'fluides' | 'annexe4';

const SUB_VIEWS: { id: SubView; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
  { id: 'tableau',   label: 'Répartition des charges', icon: Euro },
  { id: 'fluides',   label: 'Fluides & Énergie', icon: Droplets },
  { id: 'annexe4',   label: 'Annexe 4', icon: BookOpen },
];

// ─── Arborescence sidebar ─────────────────────────────────────────────────────

interface ArboProps {
  sites: Site[];
  residences: Residence[];
  selectedResidences: Set<string>;
  onToggleResidence: (id: string) => void;
  onToggleSite: (siteId: string) => void;
  width: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onResize: (newWidth: number) => void;
}

function ArborescenceSidebar({
  sites, residences, selectedResidences, onToggleResidence, onToggleSite,
  width, collapsed, onToggleCollapse, onResize,
}: ArboProps) {
  const [search, setSearch] = useState('');
  const [openSites, setOpenSites] = useState<Set<string>>(new Set());
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (sites.length > 0) setOpenSites(new Set(sites.map(s => s.id)));
  }, [sites]);

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current;
      const next = Math.min(420, Math.max(180, startWidthRef.current + delta));
      onResize(next);
    };
    const onUp = () => setIsResizing(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isResizing, onResize]);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    setIsResizing(true);
  };

  const filteredSites = useMemo(() => {
    if (!search) return sites;
    const q = search.toLowerCase();
    return sites.filter(s =>
      s.nom.toLowerCase().includes(q) ||
      residences.filter(r => r.site_id === s.id).some(r => r.nom.toLowerCase().includes(q))
    );
  }, [sites, residences, search]);

  const totalSelected = selectedResidences.size;

  if (collapsed) {
    return (
      <div className="flex-shrink-0 w-10 border-r border-slate-200 bg-white flex flex-col items-center pt-3 gap-2">
        <button onClick={onToggleCollapse} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title="Ouvrir l'arborescence">
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
        {totalSelected > 0 && (
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">{totalSelected}</span>
        )}
        <Building2 className="w-4 h-4 text-slate-300 mt-2" />
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 border-r border-slate-200 bg-white flex flex-col relative" style={{ width }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100 flex-shrink-0">
        <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span className="text-xs font-bold text-slate-600 flex-1">Périmètre</span>
        {totalSelected > 0 && (
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">{totalSelected} sél.</span>
        )}
        <button onClick={onToggleCollapse} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
          <X className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Search */}
      <div className="px-2 py-2 border-b border-slate-100 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
            className="w-full text-xs border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-slate-300" />
        </div>
      </div>

      {/* All / clear */}
      <div className="px-3 py-1.5 flex items-center justify-between border-b border-slate-50 flex-shrink-0">
        <button onClick={() => residences.forEach(r => !selectedResidences.has(r.id) && onToggleResidence(r.id))}
          className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold">Tout</button>
        {totalSelected > 0 && (
          <button onClick={() => residences.forEach(r => selectedResidences.has(r.id) && onToggleResidence(r.id))}
            className="text-[11px] text-slate-400 hover:text-slate-600">Effacer</button>
        )}
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {filteredSites.map(site => {
          const siteResidences = residences.filter(r => r.site_id === site.id);
          const allSel = siteResidences.length > 0 && siteResidences.every(r => selectedResidences.has(r.id));
          const someSel = siteResidences.some(r => selectedResidences.has(r.id));
          const isOpen = openSites.has(site.id);
          return (
            <div key={site.id}>
              <div className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-slate-50 group">
                <button onClick={() => setOpenSites(prev => { const n = new Set(prev); isOpen ? n.delete(site.id) : n.add(site.id); return n; })}
                  className="flex-shrink-0 w-3.5 h-3.5 flex items-center justify-center">
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                </button>
                <input type="checkbox" checked={allSel}
                  ref={el => { if (el) el.indeterminate = someSel && !allSel; }}
                  onChange={() => onToggleSite(site.id)}
                  className="w-3.5 h-3.5 rounded flex-shrink-0 cursor-pointer" style={{ accentColor: '#2563eb' }} />
                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-slate-700 truncate flex-1">{site.nom}</span>
                <span className="text-[10px] text-slate-400">{siteResidences.length}</span>
              </div>
              {isOpen && siteResidences
                .filter(r => !search || r.nom.toLowerCase().includes(search.toLowerCase()))
                .map(r => {
                  const sel = selectedResidences.has(r.id);
                  return (
                    <label key={r.id} className={`flex items-center gap-1.5 pl-7 pr-2 py-1.5 cursor-pointer transition-colors ${sel ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                      <input type="checkbox" checked={sel} onChange={() => onToggleResidence(r.id)}
                        className="w-3.5 h-3.5 rounded flex-shrink-0 cursor-pointer" style={{ accentColor: '#2563eb' }} />
                      <Building2 className="w-3 h-3 text-slate-300 flex-shrink-0" />
                      <span className={`text-xs truncate ${sel ? 'text-blue-700 font-medium' : 'text-slate-600'}`}>{r.nom}</span>
                    </label>
                  );
                })}
            </div>
          );
        })}
      </div>

      {/* Resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors z-10"
        onMouseDown={onMouseDown}
        style={{ background: isResizing ? '#3b82f6' : 'transparent' }}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CoutsFinances() {
  const [subView, setSubView] = useState<SubView>('dashboard');
  const [charges, setCharges] = useState<Charge[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [fluides, setFluides] = useState<ConsommationFluide[]>([]);
  const [annexe4, setAnnexe4] = useState<Annexe4Regle[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [residences, setResidences] = useState<Residence[]>([]);
  const [selectedResidences, setSelectedResidences] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);

  // ── Load data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      const [
        { data: sitesData },
        { data: resData },
        { data: chargesData },
        { data: budgetsData },
        { data: facturesData },
        { data: fluidesData },
        { data: annexe4Data },
      ] = await Promise.all([
        supabase.from('sites').select('id, nom, code').order('nom'),
        supabase.from('residences').select('id, nom, site_id').order('nom'),
        supabase.from('charges').select('*, batiment:batiments(nom), residence:residences(nom), contrat:contrats(nom)').order('date_declaration', { ascending: false }),
        supabase.from('budgets').select('*').order('annee', { ascending: false }),
        supabase.from('factures').select('*').order('date_emission', { ascending: false }),
        supabase.from('consommations_fluides').select('*').order('annee', { ascending: false }).order('mois'),
        supabase.from('annexe4_regles').select('*').order('ref_section').order('id'),
      ]);

      setSites(sitesData ?? []);
      setResidences(resData ?? []);
      setCharges((chargesData ?? []) as Charge[]);
      setBudgets(budgetsData ?? []);
      setFactures(facturesData ?? []);
      setFluides(fluidesData ?? []);
      setAnnexe4(annexe4Data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  // ── Arborescence handlers ─────────────────────────────────────────────────
  const handleToggleResidence = useCallback((id: string) => {
    setSelectedResidences(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleToggleSite = useCallback((siteId: string) => {
    const siteRes = residences.filter(r => r.site_id === siteId);
    const allSel = siteRes.every(r => selectedResidences.has(r.id));
    setSelectedResidences(prev => {
      const next = new Set(prev);
      siteRes.forEach(r => allSel ? next.delete(r.id) : next.add(r.id));
      return next;
    });
  }, [residences, selectedResidences]);

  // ── Filter data by selected residences ───────────────────────────────────
  const filtered = useMemo(() => {
    if (selectedResidences.size === 0) return { charges, budgets, factures, fluides };
    const resIds = selectedResidences;
    return {
      charges: charges.filter(c => c.residence_id && resIds.has(c.residence_id)),
      budgets: budgets.filter(b => b.residence_id && resIds.has(b.residence_id)),
      factures,
      fluides: fluides.filter(f => f.residence_id && resIds.has(f.residence_id)),
    };
  }, [charges, budgets, factures, fluides, selectedResidences]);

  const residenceLabel = useMemo(() => {
    if (selectedResidences.size === 0) return 'Toutes résidences';
    if (selectedResidences.size === 1) {
      const id = [...selectedResidences][0];
      return residences.find(r => r.id === id)?.nom ?? '';
    }
    return `${selectedResidences.size} résidences sélectionnées`;
  }, [selectedResidences, residences]);

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Sub-nav */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-1 px-4 h-11">
          {SUB_VIEWS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setSubView(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap
                ${subView === id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Arborescence sidebar */}
        <ArborescenceSidebar
          sites={sites}
          residences={residences}
          selectedResidences={selectedResidences}
          onToggleResidence={handleToggleResidence}
          onToggleSite={handleToggleSite}
          width={sidebarWidth}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
          onResize={setSidebarWidth}
        />

        {/* Main content */}
        <div className="flex-1 overflow-auto min-w-0 bg-slate-50">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
              <div className="animate-spin w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full mr-2" />
              Chargement des données financières…
            </div>
          ) : (
            <div className="p-4 h-full">
              {subView === 'dashboard' && (
                <FinanceDashboard
                  charges={filtered.charges}
                  budgets={filtered.budgets}
                  factures={filtered.factures}
                  fluides={filtered.fluides}
                  residenceLabel={residenceLabel}
                />
              )}
              {subView === 'tableau' && (
                <div className="bg-white rounded-xl border border-slate-100 h-full flex flex-col overflow-hidden">
                  <FinanceTableau charges={filtered.charges} />
                </div>
              )}
              {subView === 'fluides' && (
                <FinanceFluides fluides={filtered.fluides} />
              )}
              {subView === 'annexe4' && (
                <div className="bg-white rounded-xl border border-slate-100 p-4 h-full flex flex-col overflow-hidden">
                  <FinanceAnnexe4 regles={annexe4} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
