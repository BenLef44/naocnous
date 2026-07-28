import React, { useEffect, useRef, useState } from 'react';
import { seedDemoData } from './lib/seed';
import { usePatrimoineStore } from './store/patrimoineStore';
import Arborescence from './components/Arborescence';
import FicheDetail from './components/FicheDetail';
import Dashboard from './components/Dashboard';
import PatrimoineDashboard from './components/PatrimoineDashboard';
import EquipementsGlobal from './components/EquipementsGlobal';
import GED from './components/GED';
import Contrats from './components/Contrats';
import Reglementaire from './components/reglementaire/Reglementaire';
import { TYPE_CONTROLES } from './components/reglementaire/ReglementaireSidebar';
import RenouvellementPPI from './components/RenouvellementPPI';
import CoutsFinances from './components/finance/CoutsFinances';
import Interventions from './components/interventions/Interventions';
import Predictif from './components/predictif/Predictif';
import Approvisionnements from './components/approvisionnements/Approvisionnements';
import EtatsDesLieux from './components/edl/EtatsDesLieux';
import ConsoFluides from './components/fluides/ConsoFluides';
import CommCenter from './components/communication/CommCenter';
import Configuration from './components/configuration/Configuration';
import GestionLocative from './components/locatif/GestionLocative';
import { MOCK_NOTIFICATIONS } from './components/communication/commData';
import type { Notification } from './components/communication/commTypes';
import logoUrl from '/images/site/Ecole-Angele-Vannier/Logo-Ville-Saint-Malo copy.png';
import {
  LayoutDashboard, Building2, Wrench, FileText, ClipboardList, ShieldCheck,
  Menu, X, Bell, ChevronLeft, ChevronRight, SlidersHorizontal, ChevronDown, Users, Check, Search, RefreshCw, Euro, Headset, Brain, PackageSearch, ShoppingCart, Droplets, MessageSquare, Settings, Home,
} from 'lucide-react';
import syncBnsIcon        from './assets/Syncho-BNS.png';
import logoApave          from './assets/logo-Apave.jpg';
import logoSocotec        from './assets/logo-SOCOTEC.png';
import logoDekra          from './assets/logo-Dekra.jpg';
import logoBureauVeritas  from './assets/logo-Bureau-Veritas.jpg';
import logoQualiconsult   from './assets/logo-Qualiconsult.jpg';
import logoSGS            from './assets/logo-SGS.jpg';
import logoAlpesControles from './assets/logo-Alpes-Controles.jpg';

// ── Assignee data ─────────────────────────────────────────────────────────────

const ORG_CFG: Record<string, { logo?: string; bg: string; text: string; abbr: string; specialite: string }> = {
  'APAVE':                    { logo: logoApave,          bg: '#4a9520', text: '#fff', abbr: 'AP',  specialite: 'Contrôle technique' },
  'SOCOTEC':                  { logo: logoSocotec,        bg: '#0099d8', text: '#fff', abbr: 'SO',  specialite: 'Inspection / Certification' },
  'DEKRA':                    { logo: logoDekra,          bg: '#1a6b30', text: '#fff', abbr: 'DE',  specialite: 'Contrôle & Essais' },
  'Bureau Veritas':            { logo: logoBureauVeritas,  bg: '#8b7355', text: '#fff', abbr: 'BV',  specialite: 'Certification / Essais' },
  'QUALICONSULT':              { logo: logoQualiconsult,   bg: '#3c3c3c', text: '#fff', abbr: 'QU',  specialite: 'Contrôle construction' },
  'SGS':                      { logo: logoSGS,            bg: '#888580', text: '#fff', abbr: 'SG',  specialite: 'Inspection & Tests' },
  'Alpes Contrôles':           { logo: logoAlpesControles, bg: '#cc0000', text: '#fff', abbr: 'AC',  specialite: 'Contrôle technique' },
  'SOCOTEC Diagnostic':        { logo: logoSocotec,        bg: '#0099d8', text: '#fff', abbr: 'SD',  specialite: 'Diagnostic immobilier' },
  'Bureau Alliance Contrôle':  { logo: undefined,          bg: '#2563eb', text: '#fff', abbr: 'BAC', specialite: 'Contrôle réglementaire' },
  'Acritec':                   { logo: undefined,          bg: '#6b21a8', text: '#fff', abbr: 'ACR', specialite: 'Contrôle technique' },
};

const AGENT_CFG: Record<string, { photo: string; service: string }> = {
  'Martin D.':  { photo: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',  service: 'Patrimoine' },
  'Leroy P.':   { photo: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',  service: 'Technique' },
  'Dupont A.':  { photo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',   service: 'Sécurité' },
  'Bernard C.': { photo: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',  service: 'Technique' },
  'Moreau F.':  { photo: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',  service: 'Patrimoine' },
  'Simon B.':   { photo: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',    service: 'Administration' },
  'Laurent E.': { photo: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1', service: 'Technique' },
  'Michel G.':  { photo: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',   service: 'Sécurité' },
};
const PRESTATAIRES = Object.keys(ORG_CFG);
const AGENTS       = Object.keys(AGENT_CFG);

function OrgLogo({ name }: { name: string }) {
  const c = ORG_CFG[name];
  const [err, setErr] = React.useState(false);
  if (!c) return null;
  if (c.logo && !err) {
    return (
      <img src={c.logo} alt={name}
        className="rounded object-contain flex-shrink-0 bg-white border border-slate-200"
        style={{ width: 28, height: 28, padding: 2 }}
        onError={() => setErr(true)} />
    );
  }
  return (
    <span className="inline-flex items-center justify-center rounded flex-shrink-0 font-black leading-none"
      style={{ width: 28, height: 28, background: c.bg, color: c.text, fontSize: 7 }}>
      {c.abbr}
    </span>
  );
}

function AgentAvatar({ name }: { name: string }) {
  const c = AGENT_CFG[name];
  const [err, setErr] = React.useState(false);
  if (c && !err) {
    return <img src={c.photo} alt={name}
      className="rounded-full object-cover flex-shrink-0 border border-slate-200"
      style={{ width: 28, height: 28 }} onError={() => setErr(true)} />;
  }
  const initials = name.split(/[\s.]+/).filter(Boolean).slice(0,2).map((w: string) => w[0]).join('').toUpperCase();
  return <span className="inline-flex items-center justify-center rounded-full bg-slate-300 text-slate-700 font-bold flex-shrink-0"
    style={{ width: 28, height: 28, fontSize: 9 }}>{initials}</span>;
}

type View = 'dashboard' | 'arborescence' | 'equipements' | 'documents' | 'contrats' | 'reglementaire' | 'edl' | 'ppi' | 'finance' | 'fluides' | 'interventions' | 'predictif' | 'approvisionnements' | 'communication' | 'configuration' | 'locatif';

const NAV_ITEMS: { id: View; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'dashboard',          label: 'Tableau de bord',              icon: LayoutDashboard, description: 'Vue d\'ensemble transverse' },
  { id: 'interventions',      label: 'Interventions',                icon: Headset,         description: 'Demandes & tickets d\'intervention' },
  { id: 'arborescence',       label: 'Référentiel Patrimoine - BNS', icon: Building2,       description: 'Sites, Bâtiments & Équipements' },
  { id: 'equipements',        label: 'Équipements',                  icon: Wrench,          description: 'Référentiel équipements' },
  { id: 'documents',          label: 'Documents (GED)',              icon: FileText,        description: 'Gestion documentaire' },
  { id: 'contrats',           label: 'Contrats',                     icon: ClipboardList,   description: 'Suivi des contrats' },
  { id: 'reglementaire',      label: 'Réglementaire',                icon: ShieldCheck,     description: 'Contrôles obligatoires' },
  { id: 'edl',                label: 'États des lieux',              icon: ClipboardList,   description: 'États des lieux entrants & sortants' },
  { id: 'locatif',           label: 'Gestion locative',             icon: Home,            description: 'Baux, occupants & taux d\'occupation' },
  { id: 'ppi',                label: 'Renouvellements & PPI',        icon: RefreshCw,       description: 'Programme pluriannuel d\'investissement' },
  { id: 'finance',            label: 'Coûts & Finances',             icon: Euro,            description: 'Répartition des charges & suivi budgétaire' },
  { id: 'fluides',            label: 'Conso. Fluides',               icon: Droplets,        description: 'Cockpit énergétique — eau, électricité, gaz, chaleur' },
  { id: 'predictif',          label: 'Prédictif',                    icon: Brain,           description: 'Intelligence prédictive IA' },
  { id: 'approvisionnements', label: 'Approvisionnements',           icon: PackageSearch,   description: 'Stocks, commandes & interface Epona' },
  { id: 'communication',      label: 'Centre de communication',      icon: MessageSquare,   description: 'Notifications, emails, escalades et synthèses' },
];

export default function App() {
  const { activeView, setActiveView, selectedNode } = usePatrimoineStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [arboCollapsed, setArboCollapsed] = useState(false);
  const [patrimoineTab, setPatrimoineTab] = useState<'dashboard' | 'arborescence'>('arborescence');
  const [seeded, setSeeded] = useState(false);
  const [eponaSyncing, setEponaSyncing] = useState(false);
  const [eponaLastSync, setEponaLastSync] = useState('28/05/2026 09:14:00');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(true);

  // BNS sync state — default last sync = today at 02:30
  const [bnsLastSync, setBnsLastSync] = useState(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} 02:30:00`;
  });
  const [bnsSyncModalOpen, setBnsSyncModalOpen] = useState(false);
  const [bnsSyncProgress, setBnsSyncProgress] = useState(0);
  const [bnsSyncStep, setBnsSyncStep] = useState('');
  const [bnsSyncDone, setBnsSyncDone] = useState(false);
  const [bnsSyncResult, setBnsSyncResult] = useState<{ residences: number; logements: number } | null>(null);

  function startBnsSync() {
    setBnsSyncModalOpen(true);
    setBnsSyncProgress(0);
    setBnsSyncStep('Connexion à la base externe BNS...');
    setBnsSyncDone(false);
    setBnsSyncResult(null);

    const steps: [number, string][] = [
      [8,  'Connexion à la base externe BNS...'],
      [20, 'Récupération des données de résidences...'],
      [35, 'Synchronisation Résidence Jacques Cavalier...'],
      [48, 'Synchronisation Résidence Campus Centre Lyon 6...'],
      [58, 'Synchronisation Résidence Campus Manufacture...'],
      [68, 'Synchronisation des logements — bâtiment A...'],
      [76, 'Synchronisation des logements — bâtiment B...'],
      [84, 'Synchronisation des logements — bâtiment C...'],
      [91, 'Vérification de l\'intégrité des données...'],
      [96, 'Finalisation et mise à jour du cache local...'],
      [100, 'Synchronisation terminée.'],
    ];

    let i = 0;
    const tick = () => {
      if (i >= steps.length) {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        setBnsLastSync(`${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
        setBnsSyncDone(true);
        setBnsSyncResult({ residences: 0, logements: 0 });
        return;
      }
      const [progress, label] = steps[i];
      setBnsSyncProgress(progress);
      setBnsSyncStep(label);
      i++;
      setTimeout(tick, i === steps.length ? 200 : 430 + Math.random() * 120);
    };
    setTimeout(tick, 300);
  }
  const [regleView, setRegleView]     = useState<string>('dashboard');
  const [assigneeOpen, setAssigneeOpen]   = useState(false);
  const [assigneeTab,  setAssigneeTab]    = useState<'prestataires' | 'agents'>('prestataires');
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [assigneeSelection, setAssigneeSelection] = useState<{ prestataires: Set<string>; agents: Set<string> }>({
    prestataires: new Set(),
    agents: new Set(),
  });

  // ── Notifications ─────────────────────────────────────────────────────────
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.lu).length;
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    if (notifOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  useEffect(() => {
    seedDemoData().then(() => setSeeded(true));
  }, []);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 flex flex-col bg-white border-r border-slate-200 text-slate-800 transition-all duration-300 ease-in-out overflow-hidden ${sidebarOpen ? 'w-56' : 'w-14'}`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-3 border-b border-slate-200 gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-800 leading-none">Naofix</p>
              <p className="text-xs text-slate-400 leading-none mt-0.5">Patrimoine</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto p-1 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
          >
            {sidebarOpen ? <X className="w-3.5 h-3.5 text-slate-400" /> : <Menu className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-x-hidden flex flex-col min-h-0">
          {/* Nav items — always scrollable */}
          <div className="overflow-y-auto py-2" style={{ flex: '0 1 auto' }}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 mx-0 transition-all duration-150 group
                  ${activeView === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <item.icon className={`w-4 h-4 flex-shrink-0 ${activeView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`} />
                {sidebarOpen && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
              </button>
            ))}
          </div>

          {/* Contextual filters zone — takes remaining space only when visible */}
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">

          {/* Contextual filters — visible only when Réglementaire is active + sidebar open */}
          {activeView === 'reglementaire' && sidebarOpen && (
            <div className="border-t border-slate-200 mt-1 flex flex-col min-h-0 flex-1 overflow-hidden">

              {/* ── Types de contrôle accordion ── */}
              <button
                onClick={() => setFiltersOpen(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 transition-colors group flex-shrink-0"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Types de contrôle</span>
                  {selectedTypes.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold leading-none flex-shrink-0">
                      {selectedTypes.length}
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${filtersOpen ? '' : '-rotate-90'}`} />
              </button>

              {filtersOpen && (
                <div className="px-2 pb-2 overflow-y-auto space-y-0.5" style={{ maxHeight: 220 }}>
                  <label className="flex items-center gap-2 py-1.5 px-1.5 rounded-md hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" checked={selectedTypes.length === 0} onChange={() => setSelectedTypes([])}
                      className="w-3.5 h-3.5 rounded cursor-pointer flex-shrink-0" style={{ accentColor: '#2563eb' }} />
                    <span className="text-xs font-semibold text-slate-700">Tous les types</span>
                  </label>
                  <div className="border-t border-slate-100 my-1" />
                  {TYPE_CONTROLES.map(({ key, icon }) => {
                    const checked = selectedTypes.includes(key);
                    return (
                      <label key={key}
                        className={`flex items-center gap-2 py-1.5 px-1.5 rounded-md cursor-pointer transition-colors ${checked ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                        <input type="checkbox" checked={checked}
                          onChange={() => checked ? setSelectedTypes(selectedTypes.filter(t => t !== key)) : setSelectedTypes([...selectedTypes, key])}
                          className="w-3.5 h-3.5 rounded cursor-pointer flex-shrink-0" style={{ accentColor: '#2563eb' }} />
                        <span className="text-sm flex-shrink-0">{icon}</span>
                        <span className={`text-xs leading-tight truncate ${checked ? 'text-blue-700 font-medium' : 'text-slate-600'}`}>{key}</span>
                      </label>
                    );
                  })}
                  {selectedTypes.length > 0 && (
                    <button onClick={() => setSelectedTypes([])}
                      className="w-full mt-1 text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 justify-center py-1">
                      <X className="w-3 h-3" /> Effacer
                    </button>
                  )}
                </div>
              )}

              {/* ── Assigné à accordion — only in planning view ── */}
              {regleView === 'planning' && (
                <>
                  <button
                    onClick={() => setAssigneeOpen(v => !v)}
                    className="w-full flex items-center justify-between px-3 py-2.5 border-t border-slate-200 hover:bg-slate-50 transition-colors group flex-shrink-0"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Assigné à</span>
                      {(assigneeSelection.prestataires.size + assigneeSelection.agents.size) > 0 && (
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold leading-none flex-shrink-0">
                          {assigneeSelection.prestataires.size + assigneeSelection.agents.size}
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${assigneeOpen ? '' : '-rotate-90'}`} />
                  </button>

                  {assigneeOpen && (
                    <div className="flex flex-col overflow-hidden flex-1 min-h-0">
                      {/* Sub-tabs */}
                      <div className="px-2 pt-1 pb-1.5 flex-shrink-0">
                        <div className="flex bg-slate-100 rounded-lg p-0.5">
                          {(['prestataires', 'agents'] as const).map(t => {
                            const cnt = t === 'prestataires' ? assigneeSelection.prestataires.size : assigneeSelection.agents.size;
                            return (
                              <button key={t} type="button"
                                onClick={() => { setAssigneeTab(t); setAssigneeSearch(''); }}
                                className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all flex items-center justify-center gap-1
                                  ${assigneeTab === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                {t === 'prestataires' ? 'Prestas' : 'Agents'}
                                {cnt > 0 && (
                                  <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[9px] font-bold inline-flex items-center justify-center">
                                    {cnt}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Search */}
                      <div className="px-2 pb-1.5 flex-shrink-0">
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                          <Search className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <input type="text" value={assigneeSearch} onChange={e => setAssigneeSearch(e.target.value)}
                            placeholder="Rechercher..."
                            className="flex-1 text-[11px] bg-transparent outline-none text-slate-700 placeholder:text-slate-400 min-w-0" />
                        </div>
                      </div>

                      {/* Select all / clear */}
                      <div className="px-3 pb-1 flex items-center justify-between flex-shrink-0">
                        <button type="button"
                          onClick={() => {
                            if (assigneeTab === 'prestataires')
                              setAssigneeSelection(s => ({ ...s, prestataires: new Set(PRESTATAIRES) }));
                            else
                              setAssigneeSelection(s => ({ ...s, agents: new Set(AGENTS) }));
                          }}
                          className="text-[11px] text-blue-600 hover:text-blue-700 font-medium">Tout</button>
                        {(assigneeTab === 'prestataires' ? assigneeSelection.prestataires.size : assigneeSelection.agents.size) > 0 && (
                          <button type="button"
                            onClick={() => {
                              if (assigneeTab === 'prestataires')
                                setAssigneeSelection(s => ({ ...s, prestataires: new Set() }));
                              else
                                setAssigneeSelection(s => ({ ...s, agents: new Set() }));
                            }}
                            className="text-[11px] text-slate-400 hover:text-slate-600">
                            Effacer
                          </button>
                        )}
                      </div>

                      {/* List */}
                      <div className="overflow-y-auto flex-1 min-h-0 space-y-0.5 px-1.5 pb-2">
                        {assigneeTab === 'prestataires' && PRESTATAIRES
                          .filter(p => p.toLowerCase().includes(assigneeSearch.toLowerCase()))
                          .map(name => {
                            const checked = assigneeSelection.prestataires.has(name);
                            return (
                              <button key={name} type="button"
                                onClick={() => {
                                  const next = new Set(assigneeSelection.prestataires);
                                  checked ? next.delete(name) : next.add(name);
                                  setAssigneeSelection(s => ({ ...s, prestataires: next }));
                                }}
                                className={`w-full flex items-center gap-2 px-1.5 py-1.5 rounded-md text-left transition-colors
                                  ${checked ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                                <span className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
                                  ${checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                                  {checked && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
                                </span>
                                <OrgLogo name={name} />
                                <div className="flex-1 min-w-0">
                                  <div className={`text-xs font-medium truncate ${checked ? 'text-blue-700' : 'text-slate-700'}`}>{name}</div>
                                  <div className="text-[10px] text-slate-400 truncate">{ORG_CFG[name]?.specialite}</div>
                                </div>
                              </button>
                            );
                          })}

                        {assigneeTab === 'agents' && AGENTS
                          .filter(a => a.toLowerCase().includes(assigneeSearch.toLowerCase()))
                          .map(name => {
                            const checked = assigneeSelection.agents.has(name);
                            return (
                              <button key={name} type="button"
                                onClick={() => {
                                  const next = new Set(assigneeSelection.agents);
                                  checked ? next.delete(name) : next.add(name);
                                  setAssigneeSelection(s => ({ ...s, agents: next }));
                                }}
                                className={`w-full flex items-center gap-2 px-1.5 py-1.5 rounded-md text-left transition-colors
                                  ${checked ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                                <span className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
                                  ${checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                                  {checked && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
                                </span>
                                <AgentAvatar name={name} />
                                <div className="flex-1 min-w-0">
                                  <div className={`text-xs font-medium truncate ${checked ? 'text-blue-700' : 'text-slate-700'}`}>{name}</div>
                                  <div className="text-[10px] text-slate-400 truncate">{AGENT_CFG[name]?.service}</div>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          </div>
        </nav>

        {/* Configuration — always visible at bottom of nav */}
        <div className="border-t border-slate-100 flex-shrink-0">
          <button
            onClick={() => setActiveView('configuration')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-150 group
              ${activeView === 'configuration'
                ? 'bg-slate-800 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
            title={!sidebarOpen ? 'Configuration' : undefined}
          >
            <Settings className={`w-4 h-4 flex-shrink-0 ${activeView === 'configuration' ? 'text-white' : 'text-slate-500 group-hover:text-slate-700'}`} />
            {sidebarOpen && (
              <span className="text-sm font-medium truncate">Configuration</span>
            )}
          </button>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-200 p-3">
          <div className={`flex items-center gap-2 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 flex-shrink-0">
              AD
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <p className="text-xs font-medium text-slate-800 truncate">Administrateur</p>
                <p className="text-xs text-slate-400 truncate">CNOUS</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3 flex-shrink-0">
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-slate-800">
              {activeView === 'configuration' ? 'Configuration' : NAV_ITEMS.find((n) => n.id === activeView)?.label}
            </h1>
            <p className="text-xs text-slate-400">
              {activeView === 'configuration' ? 'Profils, droits, périmètres et journaux d\'administration' : NAV_ITEMS.find((n) => n.id === activeView)?.description}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!seeded && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="animate-spin w-3 h-3 border border-slate-300 border-t-transparent rounded-full" />
                Initialisation...
              </div>
            )}

            {/* Epona sync banner — only on Approvisionnements view */}
            {activeView === 'approvisionnements' && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
                <div className="w-7 h-7 rounded-md bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="hidden sm:block leading-none">
                  <p className="text-xs font-semibold text-emerald-800 leading-none">Synchronisé avec Epona</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5 leading-none">
                    Dernière sync : {eponaLastSync}
                  </p>
                </div>
                <button
                  disabled={eponaSyncing}
                  onClick={() => {
                    setEponaSyncing(true);
                    setTimeout(() => {
                      const now = new Date();
                      const pad = (n: number) => String(n).padStart(2, '0');
                      setEponaLastSync(`${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
                      setEponaSyncing(false);
                    }, 1800);
                  }}
                  className="hidden sm:flex items-center gap-1.5 ml-2 px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 transition-colors whitespace-nowrap flex-shrink-0 disabled:opacity-60 disabled:cursor-not-allowed">
                  <RefreshCw className={`w-3 h-3 ${eponaSyncing ? 'animate-spin' : ''}`} />
                  Sync manuelle
                </button>
              </div>
            )}

            {/* Cartouche sources fluides — visible uniquement sur le module Conso. Fluides */}
            {activeView === 'fluides' ? (
              <div className="flex items-center gap-1.5">
                {[
                  { label: 'EDF',                couleur: '#f59e0b', icon: '⚡', fluide: 'Élec',  synchro: '29/05/2026 09:47' },
                  { label: 'Engie',              couleur: '#3b82f6', icon: '🔥', fluide: 'Gaz',   synchro: '29/05/2026 09:32' },
                  { label: 'Eau du Grand Lyon',  couleur: '#06b6d4', icon: '💧', fluide: 'Eau',   synchro: '29/05/2026 08:15' },
                ].map(src => (
                  <div key={src.label} className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1.5 shadow-sm">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: src.couleur }} />
                    <div className="hidden md:block leading-none">
                      <p className="text-[11px] font-bold text-slate-700 leading-none whitespace-nowrap">{src.label} <span className="font-normal text-slate-400">· {src.fluide}</span></p>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-none font-mono">{src.synchro}</p>
                    </div>
                    <div className="block md:hidden text-[10px] font-bold text-slate-600">{src.fluide}</div>
                  </div>
                ))}
              </div>
            ) : activeView !== 'equipements' && activeView !== 'approvisionnements' ? (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
                <div className="w-7 h-7 rounded-md bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <img src={syncBnsIcon} alt="BNS" className="w-4 h-4 object-contain" />
                </div>
                <div className="hidden sm:block leading-none">
                  <p className="text-xs font-semibold text-emerald-800 leading-none">Synchronisé avec BNS</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5 leading-none">
                    Dernière sync : {bnsLastSync}
                  </p>
                </div>
                <button
                  onClick={startBnsSync}
                  className="hidden sm:flex items-center gap-1.5 ml-2 px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 hover:border-slate-300 transition-colors whitespace-nowrap flex-shrink-0">
                  <RefreshCw className="w-3 h-3" />
                  Sync manuelle
                </button>
              </div>
            ) : null}

            <div ref={notifRef} className="relative">
              <button
                onClick={() => setNotifOpen(v => !v)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative"
              >
                <Bell className="w-4 h-4 text-slate-500" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-100 z-[500] overflow-hidden flex flex-col" style={{ maxHeight: '80vh' }}>
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-bold text-slate-800">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={() => setNotifications(prev => prev.map(n => ({ ...n, lu: true })))}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          Tout marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>

                  {/* List */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-50" style={{ scrollbarWidth: 'thin' }}>
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <Bell className="w-8 h-8 mb-3 opacity-20" />
                        <p className="text-sm font-medium">Aucune notification</p>
                        <p className="text-xs mt-1 text-slate-300">Vous êtes à jour !</p>
                      </div>
                    ) : (
                      notifications.map(n => {
                        const moduleColors: Record<string, string> = {
                          interventions: 'bg-orange-100 text-orange-700',
                          maintenance: 'bg-emerald-100 text-emerald-700',
                          contrats: 'bg-blue-100 text-blue-700',
                          reglementaire: 'bg-violet-100 text-violet-700',
                          approvisionnements: 'bg-amber-100 text-amber-700',
                          edl: 'bg-teal-100 text-teal-700',
                          equipements: 'bg-slate-100 text-slate-700',
                          renouvellements: 'bg-pink-100 text-pink-700',
                        };
                        const canalIcon: Record<string, string> = {
                          email: '✉',
                          notif: '🔔',
                          email_notif: '✉',
                          sms: '📱',
                        };
                        return (
                          <div
                            key={n.id}
                            className={`group relative flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 cursor-pointer ${!n.lu ? 'bg-blue-50/40' : ''}`}
                            onClick={() => {
                              setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, lu: true } : x));
                              if (n.targetView) {
                                setNotifOpen(false);
                                setActiveView(n.targetView as Parameters<typeof setActiveView>[0]);
                              }
                            }}
                          >
                            {/* Unread dot */}
                            <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${!n.lu ? 'bg-blue-500' : 'bg-transparent'}`} />

                            <div className="flex-1 min-w-0">
                              {/* Top row: type badge + canal */}
                              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${moduleColors[n.module] ?? 'bg-slate-100 text-slate-600'}`}>{n.type}</span>
                                <span className="text-[10px] text-slate-400">{canalIcon[n.canal]}</span>
                              </div>
                              {/* Subject */}
                              <p className={`text-xs truncate leading-snug ${n.lu ? 'text-slate-600' : 'text-slate-800 font-medium'}`}>{n.objet}</p>
                              {/* Equipment */}
                              {n.equipement && (
                                <p className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">
                                  {n.equipement}
                                </p>
                              )}
                              {/* Localisation breadcrumb */}
                              {n.localisation && n.localisation.length > 0 && (
                                <p className="text-[10px] text-slate-400 truncate mt-0.5 leading-tight">
                                  {n.localisation.map((seg, i) => (
                                    <span key={i}>
                                      {i > 0 && <span className="mx-0.5 text-slate-300">›</span>}
                                      <span className={i === n.localisation!.length - 1 ? 'text-slate-500' : ''}>{seg}</span>
                                    </span>
                                  ))}
                                </p>
                              )}
                              {/* Date */}
                              <p className="text-[10px] text-slate-400 mt-0.5">{n.date.replace(' ', ' à ')}</p>
                            </div>

                            {/* Mark unread button — appears on hover for read notifications */}
                            {n.lu && (
                              <button
                                title="Marquer comme non lu"
                                onClick={e => {
                                  e.stopPropagation();
                                  setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, lu: false } : x));
                                }}
                                className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded-md"
                              >
                                <span className="w-2 h-2 rounded-full bg-slate-400 block" title="Marquer non lu" />
                              </button>
                            )}
                            {/* Mark read button — appears on hover for unread notifications */}
                            {!n.lu && (
                              <button
                                title="Marquer comme lu"
                                onClick={e => {
                                  e.stopPropagation();
                                  setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, lu: true } : x));
                                }}
                                className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-100 rounded-md"
                              >
                                <span className="w-2 h-2 rounded-full bg-blue-400 block" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-slate-100 flex-shrink-0">
                    <button
                      onClick={() => { setNotifOpen(false); setActiveView('communication'); }}
                      className="w-full text-xs font-semibold text-blue-600 hover:text-blue-700 text-center transition-colors py-1"
                    >
                      Voir toutes les notifications dans le Centre de communication →
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <img src={logoUrl} alt="Ville de Saint-Malo" className="h-9 object-contain" />
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {activeView === 'dashboard' && (
            <div className="flex-1 overflow-auto">
              <Dashboard onNavigate={v => setActiveView(v as View)} />
            </div>
          )}

          {activeView === 'arborescence' && (
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Tab bar */}
              <div className="flex-shrink-0 bg-white border-b border-slate-200 px-4 flex items-center gap-1">
                <button
                  onClick={() => setPatrimoineTab('dashboard')}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    patrimoineTab === 'dashboard'
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Tableau de bord
                </button>
                <button
                  onClick={() => setPatrimoineTab('arborescence')}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    patrimoineTab === 'arborescence'
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Arborescence
                </button>
              </div>

              {/* Dashboard tab */}
              {patrimoineTab === 'dashboard' && (
                <div className="flex-1 overflow-auto bg-slate-50">
                  <PatrimoineDashboard />
                </div>
              )}

              {/* Arborescence tab */}
              {patrimoineTab === 'arborescence' && (
                <div className="flex-1 overflow-hidden flex relative">
                  {/* Arborescence panel */}
                  <div className={`flex-shrink-0 border-r border-slate-200 bg-white transition-all duration-300 ${arboCollapsed ? 'w-0 overflow-hidden' : 'w-72'}`}>
                    <Arborescence />
                  </div>

                  {/* Toggle button */}
                  <button
                    onClick={() => setArboCollapsed(!arboCollapsed)}
                    className="absolute z-20 mt-2 ml-0 hidden"
                  />

                  {/* Fiche detail */}
                  <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
                    {selectedNode ? (
                      <div className="flex-1 overflow-hidden bg-white m-4 rounded-xl border border-slate-200 shadow-sm">
                        <FicheDetail />
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col">
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                          <Building2 className="w-16 h-16 mb-4 opacity-10" />
                          <p className="text-sm font-medium">Sélectionnez un élément</p>
                          <p className="text-xs mt-1 text-slate-300">Cliquez sur un nœud dans l'arborescence pour afficher les détails</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Collapse button */}
                  <button
                    onClick={() => setArboCollapsed(!arboCollapsed)}
                    className={`absolute top-2 z-10 w-5 h-8 bg-white border border-slate-200 rounded-r-lg flex items-center justify-center shadow-sm hover:bg-slate-50 transition-all ${arboCollapsed ? 'left-0' : 'left-72'}`}
                  >
                    {arboCollapsed ? <ChevronRight className="w-3 h-3 text-slate-400" /> : <ChevronLeft className="w-3 h-3 text-slate-400" />}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeView === 'equipements' && (
            <div className="flex-1 overflow-hidden bg-white">
              <EquipementsGlobal />
            </div>
          )}

          {activeView === 'documents' && (
            <div className="flex-1 overflow-hidden bg-white">
              <GED />
            </div>
          )}

          {activeView === 'contrats' && (
            <div className="flex-1 overflow-hidden bg-white">
              <Contrats />
            </div>
          )}

          {activeView === 'reglementaire' && (
            <div className="flex-1 overflow-hidden bg-white">
              <Reglementaire
                selectedTypes={selectedTypes}
                onChangeTypes={setSelectedTypes}
                onViewChange={setRegleView}
                assigneeSelection={assigneeSelection}
              />
            </div>
          )}

          {activeView === 'ppi' && (
            <div className="flex-1 overflow-hidden bg-white">
              <RenouvellementPPI />
            </div>
          )}

          {activeView === 'finance' && (
            <div className="flex-1 overflow-hidden bg-white">
              <CoutsFinances />
            </div>
          )}

          {activeView === 'interventions' && (
            <div className="flex-1 overflow-hidden">
              <Interventions />
            </div>
          )}

          {activeView === 'predictif' && (
            <div className="flex-1 overflow-hidden">
              <Predictif />
            </div>
          )}

          {activeView === 'approvisionnements' && (
            <div className="flex-1 overflow-hidden">
              <Approvisionnements />
            </div>
          )}

          {activeView === 'edl' && (
            <div className="flex-1 overflow-hidden flex">
              <EtatsDesLieux />
            </div>
          )}

          {activeView === 'fluides' && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <ConsoFluides />
            </div>
          )}

          {activeView === 'communication' && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <CommCenter />
            </div>
          )}

          {activeView === 'locatif' && (
            <div className="flex-1 overflow-hidden flex flex-col bg-white">
              <GestionLocative
                onNavigateToLogement={(logementId) => { setActiveView('arborescence'); }}
                onNavigateToEDL={() => { setActiveView('edl'); }}
              />
            </div>
          )}

          {activeView === 'configuration' && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <Configuration />
            </div>
          )}
        </div>
      </div>

      {/* ── BNS Sync Modal ──────────────────────────────────────────────── */}
      {bnsSyncModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-emerald-50">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <img src={syncBnsIcon} alt="BNS" className="w-5 h-5 object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-emerald-900 leading-none">Synchronisation BNS</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">Base Nationale des Structures</p>
              </div>
              {bnsSyncDone && (
                <button
                  onClick={() => { setBnsSyncModalOpen(false); setBnsSyncProgress(0); }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Progression</span>
                  <span className="text-xs font-bold text-slate-700 tabular-nums">{bnsSyncProgress}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${bnsSyncProgress}%`,
                      background: bnsSyncDone
                        ? 'linear-gradient(90deg,#10b981,#059669)'
                        : 'linear-gradient(90deg,#3b82f6,#6366f1)',
                    }}
                  />
                </div>
              </div>

              {/* Current step */}
              <div className="flex items-start gap-2.5 min-h-[36px]">
                {!bnsSyncDone ? (
                  <div className="mt-0.5 w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                ) : (
                  <div className="mt-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
                <p className="text-xs text-slate-600 leading-snug">{bnsSyncStep}</p>
              </div>

              {/* Steps checklist */}
              <div className="space-y-1.5 border border-slate-100 rounded-xl p-3 bg-slate-50">
                {[
                  { label: 'Connexion à la base externe',        threshold: 8  },
                  { label: 'Données résidences récupérées',       threshold: 20 },
                  { label: 'Résidence Jacques Cavalier',          threshold: 35 },
                  { label: 'Campus Centre Lyon 6',                threshold: 48 },
                  { label: 'Campus Manufacture',                  threshold: 58 },
                  { label: 'Logements — bâtiment A',              threshold: 68 },
                  { label: 'Logements — bâtiment B',              threshold: 76 },
                  { label: 'Logements — bâtiment C',              threshold: 84 },
                  { label: 'Vérification intégrité',              threshold: 91 },
                  { label: 'Mise à jour du cache local',          threshold: 100 },
                ].map((s) => {
                  const done = bnsSyncProgress > s.threshold;
                  const active = !done && bnsSyncProgress >= s.threshold - 12 && bnsSyncProgress <= s.threshold;
                  return (
                    <div key={s.label} className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        done    ? 'bg-emerald-500' :
                        active  ? 'border-2 border-blue-400' :
                                  'border border-slate-200 bg-white'
                      }`}>
                        {done && <Check className="w-2 h-2 text-white" />}
                        {active && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
                      </div>
                      <span className={`text-[11px] leading-none transition-colors ${
                        done   ? 'text-emerald-700 font-medium' :
                        active ? 'text-blue-600 font-semibold' :
                                 'text-slate-400'
                      }`}>{s.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Result */}
              {bnsSyncDone && bnsSyncResult && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 space-y-2 animate-[fadeIn_0.2s_ease-out]">
                  <p className="text-xs font-bold text-emerald-800">Résultat de la synchronisation</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Nouvelles résidences', value: bnsSyncResult.residences },
                      { label: 'Nouveaux logements',   value: bnsSyncResult.logements  },
                    ].map(r => (
                      <div key={r.label} className="bg-white rounded-lg border border-emerald-100 px-3 py-2 text-center">
                        <p className="text-xl font-black text-emerald-700 tabular-nums">{r.value}</p>
                        <p className="text-[10px] text-emerald-600 font-medium leading-snug mt-0.5">{r.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-emerald-600">Aucun nouvel élément détecté — les données sont à jour.</p>
                </div>
              )}

              {/* Footer button */}
              {bnsSyncDone && (
                <button
                  onClick={() => { setBnsSyncModalOpen(false); setBnsSyncProgress(0); }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors">
                  Fermer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
