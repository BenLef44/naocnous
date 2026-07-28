import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  LayoutDashboard, Table2, AlertTriangle, Gauge, Calendar, FileText, Link,
  Building2, ChevronRight, ChevronDown, MapPin, Search, X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  ConsommationFluide, CompteurFluide, AlerteFluide, FactureFluide, StatutAlerte,
} from './fluideTypes';
import FluidsDashboard from './FluidsDashboard';
import FluidsTableau from './FluidsTableau';
import FluidsAlertes from './FluidsAlertes';
import FluidsCompteurs from './FluidsCompteurs';
import FluidsPlanning from './FluidsPlanning';
import FluidsExportOperat from './FluidsExportOperat';
import FluidsOsfi from './FluidsOsfi';

// ─── Types ────────────────────────────────────────────────────────────────────

type FluidView = 'dashboard' | 'tableau' | 'alertes' | 'compteurs' | 'planning' | 'operat' | 'osfi';

interface Site { id: string; nom: string; code: string | null }
interface Residence { id: string; nom: string; site_id: string; adresse?: string | null; nombre_logements?: number | null; annee_construction?: number | null }

const SUB_VIEWS: { id: FluidView; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'tableau',   label: 'Tableau',          icon: Table2 },
  { id: 'alertes',   label: 'Alertes',          icon: AlertTriangle },
  { id: 'compteurs', label: 'Compteurs',        icon: Gauge },
  { id: 'planning',  label: 'Planning',         icon: Calendar },
  { id: 'operat',    label: 'Export OPERAT',    icon: FileText },
  { id: 'osfi',      label: 'OSFI & Connecteurs', icon: Link },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

interface SidebarProps {
  sites: Site[];
  residences: Residence[];
  selectedResidences: Set<string>;
  onToggleResidence: (id: string) => void;
  onToggleSite: (siteId: string) => void;
  width: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onResize: (w: number) => void;
}

function Sidebar({ sites, residences, selectedResidences, onToggleResidence, onToggleSite, width, collapsed, onToggleCollapse, onResize }: SidebarProps) {
  const [search, setSearch] = useState('');
  const [openSites, setOpenSites] = useState<Set<string>>(new Set());
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWRef = useRef(0);

  useEffect(() => {
    if (sites.length > 0) setOpenSites(new Set(sites.map(s => s.id)));
  }, [sites]);

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent) => {
      const next = Math.min(420, Math.max(180, startWRef.current + e.clientX - startXRef.current));
      onResize(next);
    };
    const onUp = () => setIsResizing(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isResizing, onResize]);

  const filteredSites = useMemo(() => {
    if (!search) return sites;
    const q = search.toLowerCase();
    return sites.filter(s => s.nom.toLowerCase().includes(q) || residences.some(r => r.site_id === s.id && r.nom.toLowerCase().includes(q)));
  }, [sites, residences, search]);

  const totalSel = selectedResidences.size;

  if (collapsed) {
    return (
      <div className="flex-shrink-0 w-10 border-r border-slate-200 bg-white flex flex-col items-center pt-3 gap-2">
        <button onClick={onToggleCollapse} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
        {totalSel > 0 && (
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">{totalSel}</span>
        )}
        <Building2 className="w-4 h-4 text-slate-300 mt-2" />
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 border-r border-slate-200 bg-white flex flex-col relative" style={{ width }}>
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100 flex-shrink-0">
        <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span className="text-xs font-bold text-slate-600 flex-1">Périmètre</span>
        {totalSel > 0 && (
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">{totalSel} sél.</span>
        )}
        <button onClick={onToggleCollapse} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
          <X className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      <div className="px-2 py-2 border-b border-slate-100 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
            className="w-full text-xs border border-slate-200 rounded-lg pl-6 pr-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-300" />
        </div>
      </div>

      <div className="px-3 py-1.5 flex items-center justify-between border-b border-slate-50 flex-shrink-0">
        <button onClick={() => residences.forEach(r => !selectedResidences.has(r.id) && onToggleResidence(r.id))}
          className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold">Tout</button>
        {totalSel > 0 && (
          <button onClick={() => residences.forEach(r => selectedResidences.has(r.id) && onToggleResidence(r.id))}
            className="text-[11px] text-slate-400 hover:text-slate-600">Effacer</button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {filteredSites.map(site => {
          const siteRes = residences.filter(r => r.site_id === site.id);
          const allSel = siteRes.length > 0 && siteRes.every(r => selectedResidences.has(r.id));
          const someSel = siteRes.some(r => selectedResidences.has(r.id));
          const isOpen = openSites.has(site.id);
          return (
            <div key={site.id}>
              <div className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-slate-50">
                <button onClick={() => setOpenSites(p => { const n = new Set(p); isOpen ? n.delete(site.id) : n.add(site.id); return n; })}
                  className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                </button>
                <input type="checkbox" checked={allSel} ref={el => { if (el) el.indeterminate = someSel && !allSel; }}
                  onChange={() => onToggleSite(site.id)}
                  className="w-3.5 h-3.5 rounded flex-shrink-0 cursor-pointer" style={{ accentColor: '#2563eb' }} />
                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-slate-700 truncate flex-1">{site.nom}</span>
                <span className="text-[10px] text-slate-400">{siteRes.length}</span>
              </div>
              {isOpen && siteRes
                .filter(r => !search || r.nom.toLowerCase().includes(search.toLowerCase()))
                .map(r => (
                  <label key={r.id} className={`flex items-center gap-1.5 pl-7 pr-2 py-1.5 cursor-pointer transition-colors ${selectedResidences.has(r.id) ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                    <input type="checkbox" checked={selectedResidences.has(r.id)} onChange={() => onToggleResidence(r.id)}
                      className="w-3.5 h-3.5 rounded flex-shrink-0 cursor-pointer" style={{ accentColor: '#2563eb' }} />
                    <Building2 className="w-3 h-3 text-slate-300 flex-shrink-0" />
                    <span className={`text-xs truncate ${selectedResidences.has(r.id) ? 'text-blue-700 font-medium' : 'text-slate-600'}`}>{r.nom}</span>
                  </label>
                ))}
            </div>
          );
        })}
      </div>

      {/* Resize handle */}
      <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 transition-colors z-10"
        onMouseDown={e => { e.preventDefault(); startXRef.current = e.clientX; startWRef.current = width; setIsResizing(true); }}
        style={{ background: isResizing ? '#3b82f6' : 'transparent' }} />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ConsoFluides() {
  const [view, setView]                   = useState<FluidView>('dashboard');
  const [consommations, setConsommations] = useState<ConsommationFluide[]>([]);
  const [compteurs, setCompteurs]         = useState<CompteurFluide[]>([]);
  const [alertes, setAlertes]             = useState<AlerteFluide[]>([]);
  const [factures, setFactures]           = useState<FactureFluide[]>([]);
  const [sites, setSites]                 = useState<Site[]>([]);
  const [residences, setResidences]       = useState<Residence[]>([]);
  const [selectedResidences, setSelectedResidences] = useState<Set<string>>(new Set());
  const [loading, setLoading]             = useState(true);
  const [annee, setAnnee]                 = useState(2026);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth]   = useState(240);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const [
      { data: sitesData },
      { data: resData },
      { data: consoData },
      { data: compteursData },
      { data: alertesData },
      { data: facturesData },
    ] = await Promise.all([
      supabase.from('sites').select('id, nom, code').order('nom'),
      supabase.from('residences').select('id, nom, site_id, adresse, nombre_logements, annee_construction').order('nom'),
      supabase.from('consommations_fluides').select('*, residences(nom)').order('annee', { ascending: false }).order('mois'),
      supabase.from('compteurs_fluides').select('*, residences(nom)').order('reference'),
      supabase.from('alertes_fluides').select('*, residences(nom), compteurs_fluides(reference)').order('date_detection', { ascending: false }),
      supabase.from('factures_fluides').select('*, residences(nom)').order('date_emission', { ascending: false }),
    ]);

    setSites(sitesData ?? []);
    setResidences(resData ?? []);
    setConsommations((consoData ?? []) as ConsommationFluide[]);
    setCompteurs((compteursData ?? []) as CompteurFluide[]);
    setAlertes((alertesData ?? []) as AlerteFluide[]);
    setFactures((facturesData ?? []) as FactureFluide[]);
    setLoading(false);
  }

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

  const filtered = useMemo(() => {
    const ids = selectedResidences;
    if (ids.size === 0) return { consommations, compteurs, alertes, factures };
    return {
      consommations: consommations.filter(c => c.residence_id && ids.has(c.residence_id)),
      compteurs:     compteurs.filter(c => c.residence_id && ids.has(c.residence_id)),
      alertes:       alertes.filter(a => a.residence_id && ids.has(a.residence_id)),
      factures:      factures.filter(f => f.residence_id && ids.has(f.residence_id)),
    };
  }, [consommations, compteurs, alertes, factures, selectedResidences]);

  const residenceLabel = useMemo(() => {
    if (selectedResidences.size === 0) return 'Toutes résidences';
    if (selectedResidences.size === 1) return residences.find(r => r.id === [...selectedResidences][0])?.nom ?? '';
    return `${selectedResidences.size} résidences`;
  }, [selectedResidences, residences]);

  const anneesDisponibles = useMemo(() => [...new Set(consommations.map(c => c.annee))].sort((a, b) => b - a), [consommations]);

  const alertesActives = useMemo(() => filtered.alertes.filter(a => a.statut !== 'resolue' && a.statut !== 'ignoree').length, [filtered.alertes]);

  async function handleUpdateAlerte(id: string, statut: StatutAlerte) {
    await supabase.from('alertes_fluides').update({ statut }).eq('id', id);
    setAlertes(prev => prev.map(a => a.id === id ? { ...a, statut } : a));
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Sub-nav */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-1 px-4 h-11">
          {SUB_VIEWS.map(({ id, label, icon: Icon }) => {
            const isAlertes = id === 'alertes' && alertesActives > 0;
            return (
              <button key={id} onClick={() => setView(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap relative
                  ${view === id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
                {isAlertes && (
                  <span className={`ml-0.5 text-[10px] font-black px-1 py-0.5 rounded-full leading-none ${view === id ? 'bg-white text-red-600' : 'bg-red-500 text-white'}`}>
                    {alertesActives}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          sites={sites} residences={residences}
          selectedResidences={selectedResidences}
          onToggleResidence={handleToggleResidence}
          onToggleSite={handleToggleSite}
          width={sidebarWidth} collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
          onResize={setSidebarWidth}
        />

        <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm gap-2">
              <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
              Chargement des données énergétiques…
            </div>
          ) : (
            <>
              {view === 'dashboard' && (
                <FluidsDashboard
                  consommations={filtered.consommations}
                  alertes={filtered.alertes}
                  compteurs={filtered.compteurs}
                  factures={filtered.factures}
                  residenceLabel={residenceLabel}
                  annee={annee}
                  onAnneeChange={setAnnee}
                  anneesDisponibles={anneesDisponibles}
                />
              )}
              {view === 'tableau' && (
                <FluidsTableau consommations={filtered.consommations} annee={annee} />
              )}
              {view === 'alertes' && (
                <FluidsAlertes alertes={filtered.alertes} onUpdateStatut={handleUpdateAlerte} />
              )}
              {view === 'compteurs' && (
                <FluidsCompteurs compteurs={filtered.compteurs} />
              )}
              {view === 'planning' && (
                <FluidsPlanning alertes={filtered.alertes} factures={filtered.factures} />
              )}
              {view === 'operat' && (
                <FluidsExportOperat
                  consommations={filtered.consommations}
                  residences={residences}
                  sites={sites}
                  residencesSel={selectedResidences}
                />
              )}
              {view === 'osfi' && (
                <FluidsOsfi />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
