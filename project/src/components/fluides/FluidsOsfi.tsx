import React, { useState, useMemo } from 'react';
import {
  CheckCircle2, AlertTriangle, XCircle, RefreshCw, Plus, Settings,
  ArrowRight, Wifi, WifiOff, Activity, Database, ChevronRight,
  ChevronDown, Clock, Shield, Zap, BarChart3, Link, Check, X,
  AlertCircle, Info, FileText,
} from 'lucide-react';

// ─── Connector catalog ────────────────────────────────────────────────────────

type ConnectorStatus = 'connecte' | 'erreur' | 'non_configure' | 'en_attente';
type ConnectorCategory = 'osfi' | 'comptage' | 'export' | 'api';

interface Connector {
  id: string;
  nom: string;
  logoInitials: string;
  logoColor: string;
  logoBg: string;
  category: ConnectorCategory;
  description: string;
  features: string[];
  protocole: string;
  status: ConnectorStatus;
  url?: string;
  derniereSynchro?: string;
  mesuresImportees?: number;
  tauxReussite?: number;
  erreurs?: string[];
  compteursMappés?: number;
  compteursTotal?: number;
  frequenceSynchro?: string;
  version?: string;
}

const CONNECTORS: Connector[] = [
  {
    id: 'deepki',
    nom: 'Deepki',
    logoInitials: 'DK',
    logoColor: '#ffffff',
    logoBg: '#1a6b3c',
    category: 'osfi',
    description: "Plateforme d'intelligence artificielle pour la performance énergétique des bâtiments.",
    features: ['Consommations temps réel', 'Analyse prédictive', 'Reporting OPERAT', 'Multi-fluides'],
    protocole: 'REST API v2',
    status: 'connecte',
    url: 'https://api.deepki.com/v2',
    derniereSynchro: 'Il y a 2 min',
    mesuresImportees: 25400,
    tauxReussite: 99.8,
    compteursMappés: 14,
    compteursTotal: 14,
    frequenceSynchro: 'Toutes les 15 min',
    version: 'v2.3.1',
  },
  {
    id: 'advizeo',
    nom: 'Advizeo',
    logoInitials: 'AV',
    logoColor: '#ffffff',
    logoBg: '#0066cc',
    category: 'osfi',
    description: 'Solution de suivi et d\'optimisation des consommations énergétiques et RSE.',
    features: ['Télérelevé compteurs', 'Alertes seuils', 'Tableaux de bord', 'Export OPERAT'],
    protocole: 'REST API v3',
    status: 'connecte',
    url: 'https://api.advizeo.com/v3',
    derniereSynchro: 'Il y a 15 min',
    mesuresImportees: 12200,
    tauxReussite: 98.4,
    compteursMappés: 9,
    compteursTotal: 10,
    frequenceSynchro: 'Toutes les 30 min',
    version: 'v3.1.0',
  },
  {
    id: 'ubigreen',
    nom: 'Ubigreen',
    logoInitials: 'UG',
    logoColor: '#ffffff',
    logoBg: '#2e7d32',
    category: 'osfi',
    description: 'IoT énergétique et suivi des fluides pour les bâtiments tertiaires.',
    features: ['IoT multi-protocoles', 'Sous-comptage', 'Maintenance prédictive', 'API REST'],
    protocole: 'REST API + MQTT',
    status: 'connecte',
    url: 'https://connect.ubigreen.com/api',
    derniereSynchro: 'Il y a 8 min',
    mesuresImportees: 8900,
    tauxReussite: 97.1,
    compteursMappés: 6,
    compteursTotal: 7,
    frequenceSynchro: 'Toutes les 10 min',
    version: 'v1.8.2',
  },
  {
    id: 'energisme',
    nom: 'Energisme',
    logoInitials: 'EN',
    logoColor: '#ffffff',
    logoBg: '#e65100',
    category: 'osfi',
    description: 'Plateforme data-driven pour l\'efficacité énergétique et le pilotage carbone.',
    features: ['Analytics avancés', 'IA détection anomalies', 'Rapports automatiques', 'API ouverte'],
    protocole: 'REST API v1',
    status: 'erreur',
    url: 'https://api.energisme.com/v1',
    derniereSynchro: 'Hier à 14h32',
    mesuresImportees: 8000,
    tauxReussite: 72.3,
    erreurs: ['Timeout connexion API après 30s', 'Token expiré — renouvellement requis'],
    compteursMappés: 5,
    compteursTotal: 8,
    frequenceSynchro: 'Toutes les heures',
    version: 'v1.4.0',
  },
  {
    id: 'citron',
    nom: 'Citron°',
    logoInitials: 'CI',
    logoColor: '#1a1a1a',
    logoBg: '#f9c80e',
    category: 'osfi',
    description: 'Solution de suivi énergétique clé-en-main pour les gestionnaires de patrimoine.',
    features: ['Tableau de bord intuitif', 'Alertes SMS/email', 'Module réglementaire', 'Sous-comptage'],
    protocole: 'REST API',
    status: 'non_configure',
    compteursMappés: 0,
    compteursTotal: 0,
    frequenceSynchro: '—',
  },
  {
    id: 'ecostruxure',
    nom: 'EcoStruxure',
    logoInitials: 'EC',
    logoColor: '#ffffff',
    logoBg: '#3dcd58',
    category: 'osfi',
    description: 'Plateforme IoT de Schneider Electric pour la gestion technique et énergétique des bâtiments.',
    features: ['SCADA bâtiment', 'GTB/GTC', 'Modbus / BACnet', 'Edge computing'],
    protocole: 'BACnet / Modbus / API',
    status: 'non_configure',
    compteursMappés: 0,
    compteursTotal: 0,
    frequenceSynchro: '—',
  },
  {
    id: 'smart_impulse',
    nom: 'Smart Impulse',
    logoInitials: 'SI',
    logoColor: '#ffffff',
    logoBg: '#6c3483',
    category: 'osfi',
    description: 'Analyse des usages électriques par désagrégation de courbe de charge.',
    features: ['Désagrégation électrique', 'Identification équipements', 'Économies identifiées', 'Sans capteur'],
    protocole: 'REST API',
    status: 'non_configure',
    compteursMappés: 0,
    compteursTotal: 0,
    frequenceSynchro: '—',
  },
  {
    id: 'siemens_navigator',
    nom: 'Siemens Navigator',
    logoInitials: 'SN',
    logoColor: '#ffffff',
    logoBg: '#009999',
    category: 'osfi',
    description: 'Logiciel de gestion de l\'énergie et des ressources de Siemens Building Technologies.',
    features: ['Suivi ISO 50001', 'Reporting automatique', 'Analyses comparatives', 'KPI personnalisables'],
    protocole: 'OPC-UA / REST',
    status: 'en_attente',
    derniereSynchro: 'Configuration en cours',
    mesuresImportees: 0,
    tauxReussite: 0,
    compteursMappés: 0,
    compteursTotal: 4,
    frequenceSynchro: 'Non configuré',
  },
  {
    id: 'operat',
    nom: 'OPERAT (ADEME)',
    logoInitials: 'OP',
    logoColor: '#ffffff',
    logoBg: '#1976d2',
    category: 'export',
    description: "Plateforme nationale de l'Observatoire de la Performance Energétique de la Rénovation et des Actions du Tertiaire.",
    features: ['Décret tertiaire', 'Export annuel', 'Attestation conformité', 'Suivi objectifs'],
    protocole: 'API ADEME',
    status: 'connecte',
    derniereSynchro: "Aujourd'hui",
    mesuresImportees: 0,
    tauxReussite: 100,
    compteursMappés: 17,
    compteursTotal: 17,
    frequenceSynchro: 'Annuelle',
    version: 'v2024',
  },
  {
    id: 'csv_sftp',
    nom: 'Import CSV / SFTP',
    logoInitials: 'FT',
    logoColor: '#1a1a1a',
    logoBg: '#e0e0e0',
    category: 'api',
    description: 'Import automatisé de fichiers de relevés depuis un serveur SFTP ou dépôt CSV planifié.',
    features: ['Import planifié', 'Format libre', 'Détection auto colonnes', 'Validation données'],
    protocole: 'SFTP / FTP / HTTP',
    status: 'connecte',
    derniereSynchro: 'Il y a 2h',
    mesuresImportees: 1200,
    tauxReussite: 95.0,
    compteursMappés: 3,
    compteursTotal: 3,
    frequenceSynchro: 'Quotidienne 6h00',
  },
];

// ─── Wizard steps ─────────────────────────────────────────────────────────────

const WIZARD_STEPS = ['Choix connecteur', 'URL & Identifiants', 'Test connexion', 'Mapping compteurs', 'Activation'];

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<ConnectorStatus, { label: string; icon: React.ReactNode; bg: string; text: string; border: string; dot: string }> = {
  connecte:      { label: 'Connecté',       icon: <CheckCircle2 className="w-3.5 h-3.5" />, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  erreur:        { label: 'Erreur',         icon: <XCircle className="w-3.5 h-3.5" />,      bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500'     },
  non_configure: { label: 'Non configuré',  icon: <Plus className="w-3.5 h-3.5" />,         bg: 'bg-slate-100',  text: 'text-slate-500',   border: 'border-slate-200',   dot: 'bg-slate-300'   },
  en_attente:    { label: 'En attente',     icon: <Clock className="w-3.5 h-3.5" />,        bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500'   },
};

// ─── Sync log data ────────────────────────────────────────────────────────────

const SYNC_LOG = [
  { id: 1, ts: '2026-05-29 09:47', source: 'Deepki',          ok: true,  mesures: 312, duree: '0.8s'  },
  { id: 2, ts: '2026-05-29 09:32', source: 'Advizeo',         ok: true,  mesures: 180, duree: '1.2s'  },
  { id: 3, ts: '2026-05-29 09:30', source: 'Ubigreen',        ok: true,  mesures: 94,  duree: '0.6s'  },
  { id: 4, ts: '2026-05-29 08:45', source: 'CSV / SFTP',      ok: true,  mesures: 48,  duree: '2.1s'  },
  { id: 5, ts: '2026-05-29 08:32', source: 'Deepki',          ok: true,  mesures: 310, duree: '0.9s'  },
  { id: 6, ts: '2026-05-29 08:00', source: 'Energisme',       ok: false, mesures: 0,   duree: '30s'   },
  { id: 7, ts: '2026-05-29 07:47', source: 'Deepki',          ok: true,  mesures: 298, duree: '0.8s'  },
  { id: 8, ts: '2026-05-29 07:32', source: 'Advizeo',         ok: true,  mesures: 176, duree: '1.3s'  },
  { id: 9, ts: '2026-05-28 23:00', source: 'Energisme',       ok: false, mesures: 0,   duree: '30s'   },
  { id: 10,ts: '2026-05-28 22:30', source: 'Siemens Navigator',ok: false,mesures: 0,   duree: '5s'    },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function FluidsOsfi() {
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
  const [showWizard, setShowWizard]               = useState(false);
  const [wizardStep, setWizardStep]               = useState(0);
  const [wizardConnector, setWizardConnector]     = useState<Connector | null>(null);
  const [testStatus, setTestStatus]               = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const [filterStatus, setFilterStatus]           = useState<ConnectorStatus | 'tous'>('tous');
  const [activeTab, setActiveTab]                 = useState<'catalogue' | 'journal' | 'mapping' | 'normalisation'>('catalogue');

  const connectors = CONNECTORS;

  const stats = useMemo(() => ({
    connectes: connectors.filter(c => c.status === 'connecte').length,
    erreurs:   connectors.filter(c => c.status === 'erreur').length,
    attente:   connectors.filter(c => c.status === 'en_attente').length,
    totalMesures: connectors.reduce((s, c) => s + (c.mesuresImportees ?? 0), 0),
    tauxGlobal: (() => {
      const actifs = connectors.filter(c => c.tauxReussite != null);
      if (!actifs.length) return 0;
      return Math.round(actifs.reduce((s, c) => s + (c.tauxReussite ?? 0), 0) / actifs.length * 10) / 10;
    })(),
  }), [connectors]);

  const filtered = useMemo(() => filterStatus === 'tous' ? connectors : connectors.filter(c => c.status === filterStatus), [connectors, filterStatus]);

  function startWizard(c?: Connector) {
    setWizardConnector(c ?? null);
    setWizardStep(0);
    setTestStatus('idle');
    setShowWizard(true);
  }

  function simulateTest() {
    setTestStatus('testing');
    setTimeout(() => setTestStatus(wizardConnector?.id === 'energisme' ? 'fail' : 'ok'), 2000);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Toolbar */}
      <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          {(['catalogue', 'journal', 'mapping', 'normalisation'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${activeTab === t ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {t === 'catalogue' ? 'Catalogue' : t === 'journal' ? 'Journal synchro' : t === 'mapping' ? 'Mapping compteurs' : 'Normalisation'}
            </button>
          ))}
        </div>
        <button onClick={() => startWizard()}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5" />Connecter un OSFI
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex">

        {/* Main content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard icon={<Activity className="w-5 h-5 text-emerald-600" />} label="OSFI connectés" value={String(stats.connectes)} sub={`/ ${connectors.length} configurables`} bg="bg-emerald-50" border="border-emerald-100" />
            <KpiCard icon={<BarChart3 className="w-5 h-5 text-blue-600" />} label="Mesures importées" value={`${(stats.totalMesures / 1000).toFixed(1)} k`} sub="depuis 30 jours" bg="bg-blue-50" border="border-blue-100" />
            <KpiCard icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} label="Taux de réussite" value={`${stats.tauxGlobal}%`} sub="global synchronisations" bg="bg-emerald-50" border="border-emerald-100" valueColor={stats.tauxGlobal >= 95 ? 'text-emerald-700' : 'text-amber-600'} />
            <KpiCard icon={stats.erreurs > 0 ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <Shield className="w-5 h-5 text-emerald-600" />} label="Erreurs actives" value={String(stats.erreurs)} sub={stats.erreurs > 0 ? 'action requise' : 'tout est opérationnel'} bg={stats.erreurs > 0 ? 'bg-red-50' : 'bg-emerald-50'} border={stats.erreurs > 0 ? 'border-red-100' : 'border-emerald-100'} valueColor={stats.erreurs > 0 ? 'text-red-600' : 'text-emerald-700'} />
          </div>

          {/* Catalogue */}
          {activeTab === 'catalogue' && (
            <>
              {/* Filter bar */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Filtrer :</span>
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                  {(['tous', 'connecte', 'erreur', 'en_attente', 'non_configure'] as const).map(s => {
                    const cfg = s !== 'tous' ? STATUS_CFG[s] : null;
                    return (
                      <button key={s} onClick={() => setFilterStatus(s)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${filterStatus === s ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        {cfg && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                        {s === 'tous' ? 'Tous' : cfg!.label}
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs text-slate-400 ml-auto">{filtered.length} connecteur{filtered.length > 1 ? 's' : ''}</span>
              </div>

              {/* Connector grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(c => (
                  <ConnectorCard key={c.id} connector={c}
                    onSelect={() => setSelectedConnector(c)}
                    onConfigure={() => startWizard(c)}
                    selected={selectedConnector?.id === c.id}
                  />
                ))}
              </div>
            </>
          )}

          {/* Journal */}
          {activeTab === 'journal' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-700">Journal des synchronisations</span>
                <span className="ml-auto text-xs text-slate-400">{SYNC_LOG.length} entrées récentes</span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Horodatage</th>
                    <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Source OSFI</th>
                    <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Statut</th>
                    <th className="text-right px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Mesures</th>
                    <th className="text-right px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Durée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {SYNC_LOG.map(entry => (
                    <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-slate-500">{entry.ts}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-700">{entry.source}</td>
                      <td className="px-4 py-2.5">
                        {entry.ok
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-2.5 h-2.5" />Succès</span>
                          : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200"><XCircle className="w-2.5 h-2.5" />Échec</span>
                        }
                      </td>
                      <td className={`px-4 py-2.5 text-right font-bold ${entry.ok ? 'text-slate-700' : 'text-slate-300'}`}>{entry.ok ? entry.mesures : '—'}</td>
                      <td className={`px-4 py-2.5 text-right font-mono ${entry.ok ? 'text-slate-500' : 'text-red-400'}`}>{entry.duree}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Mapping */}
          {activeTab === 'mapping' && <MappingView connectors={connectors.filter(c => c.status === 'connecte')} />}

          {/* Normalisation */}
          {activeTab === 'normalisation' && <NormalisationView />}
        </div>

        {/* Detail panel */}
        {selectedConnector && activeTab === 'catalogue' && (
          <ConnectorDetailPanel
            connector={selectedConnector}
            onClose={() => setSelectedConnector(null)}
            onConfigure={() => startWizard(selectedConnector)}
          />
        )}
      </div>

      {/* Configuration Wizard Modal */}
      {showWizard && (
        <ConfigWizard
          connector={wizardConnector}
          connectors={connectors}
          step={wizardStep}
          onStep={setWizardStep}
          testStatus={testStatus}
          onTest={simulateTest}
          onSelectConnector={setWizardConnector}
          onClose={() => setShowWizard(false)}
        />
      )}
    </div>
  );
}

// ─── Connector Card ───────────────────────────────────────────────────────────

function ConnectorCard({ connector: c, onSelect, onConfigure, selected }: {
  connector: Connector; onSelect: () => void; onConfigure: () => void; selected: boolean;
}) {
  const sCfg = STATUS_CFG[c.status];
  const isActive = c.status === 'connecte';
  const hasError = c.status === 'erreur';

  return (
    <div onClick={onSelect}
      className={`bg-white rounded-xl border-2 cursor-pointer transition-all ${selected ? 'border-blue-400 shadow-md' : hasError ? 'border-red-200 hover:border-red-300' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}>
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        {/* Logo */}
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black shadow-sm" style={{ background: c.logoBg, color: c.logoColor }}>
          {c.logoInitials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-black text-slate-800">{c.nom}</p>
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${sCfg.bg} ${sCfg.text} ${sCfg.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot} ${isActive ? 'animate-pulse' : ''}`} />
              {sCfg.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{c.protocole}</p>
        </div>
      </div>

      <div className="px-4 pb-3">
        <p className="text-xs text-slate-500 leading-relaxed mb-3">{c.description}</p>

        {/* Features */}
        <div className="flex flex-wrap gap-1 mb-3">
          {c.features.slice(0, 3).map(f => (
            <span key={f} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">{f}</span>
          ))}
          {c.features.length > 3 && <span className="text-[10px] text-slate-400">+{c.features.length - 3}</span>}
        </div>

        {/* Stats if connected */}
        {isActive && (
          <div className="grid grid-cols-3 gap-2 mb-3 bg-slate-50 rounded-lg p-2">
            <div className="text-center">
              <p className="text-[10px] text-slate-400">Synchro</p>
              <p className="text-xs font-bold text-slate-700">{c.derniereSynchro}</p>
            </div>
            <div className="text-center border-x border-slate-200">
              <p className="text-[10px] text-slate-400">Mesures</p>
              <p className="text-xs font-bold text-slate-700">{c.mesuresImportees?.toLocaleString('fr-FR')}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400">Réussite</p>
              <p className={`text-xs font-bold ${(c.tauxReussite ?? 0) >= 95 ? 'text-emerald-600' : 'text-amber-600'}`}>{c.tauxReussite}%</p>
            </div>
          </div>
        )}

        {/* Error */}
        {hasError && c.erreurs && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
            <p className="text-[10px] font-bold text-red-600 mb-1">Erreurs actives :</p>
            {c.erreurs.map((e, i) => (
              <p key={i} className="text-[10px] text-red-500">• {e}</p>
            ))}
          </div>
        )}

        {/* Waiting */}
        {c.status === 'en_attente' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
            <p className="text-[10px] text-amber-600">Configuration en cours — test de connexion requis</p>
          </div>
        )}

        <button onClick={e => { e.stopPropagation(); onConfigure(); }}
          className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            isActive ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' :
            hasError ? 'bg-red-600 text-white hover:bg-red-700' :
            'bg-blue-600 text-white hover:bg-blue-700'
          }`}>
          {isActive ? 'Configurer' : hasError ? 'Réparer connexion' : 'Connecter'}
        </button>
      </div>
    </div>
  );
}

// ─── Connector Detail Panel ───────────────────────────────────────────────────

function ConnectorDetailPanel({ connector: c, onClose, onConfigure }: {
  connector: Connector; onClose: () => void; onConfigure: () => void;
}) {
  const sCfg = STATUS_CFG[c.status];
  return (
    <div className="w-80 flex-shrink-0 border-l border-slate-200 bg-white flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: c.logoBg, color: c.logoColor }}>{c.logoInitials}</div>
        <p className="text-sm font-bold text-slate-700 flex-1">{c.nom}</p>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors"><X className="w-4 h-4 text-slate-400" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${sCfg.bg} ${sCfg.border}`}>
          <span className={`w-2 h-2 rounded-full ${sCfg.dot}`} />
          <span className={`text-xs font-bold ${sCfg.text}`}>{sCfg.label}</span>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-600">Informations</p>
          {[
            { label: 'Protocole',    value: c.protocole },
            { label: 'Version',      value: c.version ?? '—' },
            { label: 'Fréquence',    value: c.frequenceSynchro ?? '—' },
            { label: 'Dernière synchro', value: c.derniereSynchro ?? '—' },
          ].map(r => (
            <div key={r.label} className="flex justify-between">
              <span className="text-xs text-slate-400">{r.label}</span>
              <span className="text-xs font-semibold text-slate-700">{r.value}</span>
            </div>
          ))}
        </div>

        {(c.compteursMappés != null && c.compteursTotal != null && c.compteursTotal > 0) && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold text-slate-600">Compteurs mappés</p>
              <span className="text-xs font-bold text-slate-700">{c.compteursMappés}/{c.compteursTotal}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-blue-500" style={{ width: `${(c.compteursMappés / c.compteursTotal) * 100}%` }} />
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-bold text-slate-600 mb-2">Fonctionnalités</p>
          <div className="space-y-1">
            {c.features.map(f => (
              <div key={f} className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                <span className="text-xs text-slate-600">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {c.erreurs && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
            <p className="text-xs font-bold text-red-600">Erreurs</p>
            {c.erreurs.map((e, i) => (
              <p key={i} className="text-xs text-red-500">• {e}</p>
            ))}
          </div>
        )}

        {/* Flow: OSFI → Naofix */}
        <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Flux de données</p>
          {['Mesures brutes', 'Normalisation', 'Consommations Naofix', 'Détection anomalies', 'Alertes & tickets'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${i === 0 ? 'text-slate-600' : 'bg-blue-600 text-white'}`} style={i === 0 ? { background: c.logoBg, color: c.logoColor, fontSize: '8px' } : {}}>
                {i === 0 ? c.logoInitials : i}
              </div>
              <span className="text-[10px] text-slate-500">{step}</span>
              {i < 4 && <ArrowRight className="w-3 h-3 text-slate-300 ml-auto" />}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-slate-100">
        <button onClick={onConfigure} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors">
          {c.status === 'connecte' ? 'Modifier la configuration' : c.status === 'erreur' ? 'Réparer la connexion' : 'Configurer le connecteur'}
        </button>
      </div>
    </div>
  );
}

// ─── Configuration Wizard ─────────────────────────────────────────────────────

function ConfigWizard({ connector, connectors, step, onStep, testStatus, onTest, onSelectConnector, onClose }: {
  connector: Connector | null; connectors: Connector[]; step: number;
  onStep: (s: number) => void; testStatus: 'idle' | 'testing' | 'ok' | 'fail';
  onTest: () => void; onSelectConnector: (c: Connector) => void; onClose: () => void;
}) {
  const [apiUrl, setApiUrl] = useState(connector?.url ?? '');
  const [apiKey, setApiKey] = useState('');

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          {connector && (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0" style={{ background: connector.logoBg, color: connector.logoColor }}>
              {connector.logoInitials}
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800">Assistant de configuration OSFI</p>
            <p className="text-xs text-slate-400">{connector?.nom ?? 'Choisissez un connecteur'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Steps progress */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-1">
          {WIZARD_STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 ${i <= step ? 'text-blue-600' : 'text-slate-300'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {i < step ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                <span className="text-[10px] font-semibold whitespace-nowrap hidden sm:block">{s}</span>
              </div>
              {i < WIZARD_STEPS.length - 1 && <div className={`flex-1 h-px mx-1 ${i < step ? 'bg-emerald-300' : 'bg-slate-100'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="p-6 min-h-64">
          {/* Step 0 — Choose connector */}
          {step === 0 && (
            <div>
              <p className="text-sm font-bold text-slate-700 mb-3">Choisissez l'OSFI à connecter</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                {connectors.filter(c => c.status !== 'connecte').map(c => (
                  <button key={c.id} onClick={() => onSelectConnector(c)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${connector?.id === c.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: c.logoBg, color: c.logoColor }}>{c.logoInitials}</div>
                    <span className="text-[10px] font-semibold text-slate-600 text-center leading-tight">{c.nom}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1 — URL + credentials */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm font-bold text-slate-700 mb-1">Paramètres de connexion — {connector?.nom}</p>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">URL de l'API</label>
                <input type="url" value={apiUrl} onChange={e => setApiUrl(e.target.value)} placeholder="https://api.exemple.com/v1"
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Clé API / Token</label>
                <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="••••••••••••••••••••"
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">Les identifiants sont chiffrés (AES-256) et stockés de manière sécurisée. Ils ne sont jamais affichés en clair.</p>
              </div>
            </div>
          )}

          {/* Step 2 — Test */}
          {step === 2 && (
            <div className="flex flex-col items-center justify-center gap-4 py-4">
              <p className="text-sm font-bold text-slate-700">Test de connexion — {connector?.nom}</p>
              {testStatus === 'idle' && (
                <button onClick={onTest} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
                  <Wifi className="w-4 h-4" />Lancer le test
                </button>
              )}
              {testStatus === 'testing' && (
                <div className="flex items-center gap-3 text-blue-600">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <p className="text-sm font-semibold">Connexion en cours…</p>
                </div>
              )}
              {testStatus === 'ok' && (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  <p className="text-sm font-bold text-emerald-700">Connexion établie avec succès</p>
                  <p className="text-xs text-slate-400">Latence : 284 ms · Authentification : OK</p>
                </div>
              )}
              {testStatus === 'fail' && (
                <div className="flex flex-col items-center gap-2">
                  <XCircle className="w-12 h-12 text-red-500" />
                  <p className="text-sm font-bold text-red-600">Connexion échouée</p>
                  <p className="text-xs text-red-400">Timeout après 30s — vérifiez l'URL et le token</p>
                  <button onClick={onTest} className="text-xs text-blue-600 hover:underline mt-1">Réessayer</button>
                </div>
              )}
            </div>
          )}

          {/* Step 3 — Mapping */}
          {step === 3 && (
            <div>
              <p className="text-sm font-bold text-slate-700 mb-3">Associer les compteurs {connector?.nom} aux compteurs Naofix</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {[
                  { osfi: 'METER_ELC_001', naofix: 'ELC-CESAR-P01', fluide: 'Électricité' },
                  { osfi: 'METER_EAU_001', naofix: 'EAU-CESAR-P01', fluide: 'Eau' },
                  { osfi: 'METER_GAZ_001', naofix: 'GAZ-CESAR-P01', fluide: 'Gaz' },
                  { osfi: 'METER_ELC_002', naofix: '— Non mappé —',  fluide: 'Électricité' },
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                    <span className="text-xs font-mono text-slate-500 w-32 flex-shrink-0">{m.osfi}</span>
                    <ArrowRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
                    <span className={`text-xs font-semibold flex-1 ${m.naofix.includes('Non') ? 'text-slate-300 italic' : 'text-slate-700'}`}>{m.naofix}</span>
                    <span className="text-[10px] text-slate-400">{m.fluide}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4 — Activation */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center gap-4 py-4">
              <CheckCircle2 className="w-14 h-14 text-emerald-500" />
              <p className="text-base font-black text-slate-800">Connecteur prêt !</p>
              <p className="text-sm text-slate-500 text-center">La synchronisation avec <strong>{connector?.nom}</strong> est configurée et active.</p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 w-full space-y-1">
                <p className="text-xs font-semibold text-emerald-700">Prochaines étapes automatiques :</p>
                {['Première synchronisation dans 5 min', 'Données visibles dans le Tableau de bord', 'Alertes activées sur les anomalies'].map(s => (
                  <div key={s} className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /><span className="text-xs text-emerald-600">{s}</span></div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-2">
          {step > 0 && step < 4 && (
            <button onClick={() => onStep(step - 1)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Retour</button>
          )}
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Annuler</button>
          <div className="flex-1" />
          {step < 4 && (
            <button
              onClick={() => onStep(step + 1)}
              disabled={step === 0 && !connector || step === 2 && testStatus !== 'ok'}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition-colors ${
                (step === 0 && !connector) || (step === 2 && testStatus !== 'ok')
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}>
              {step === WIZARD_STEPS.length - 2 ? 'Activer' : 'Suivant'}
            </button>
          )}
          {step === 4 && (
            <button onClick={onClose} className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">Terminer</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Mapping view ─────────────────────────────────────────────────────────────

function MappingView({ connectors }: { connectors: Connector[] }) {
  const mappings = [
    { osfi: 'Deepki',  ref: 'METER_ELC_001', naofix: 'ELC-CESAR-P01',  fluide: 'Électricité', residence: 'Rés. Aimé Césaire', ok: true  },
    { osfi: 'Deepki',  ref: 'METER_EAU_002', naofix: 'EAU-CESAR-P01',  fluide: 'Eau',          residence: 'Rés. Aimé Césaire', ok: true  },
    { osfi: 'Advizeo', ref: 'CPT-GAZ-ALLIX', naofix: 'GAZ-ALLIX-P01',  fluide: 'Gaz',          residence: 'Rés. André Allix',  ok: true  },
    { osfi: 'Advizeo', ref: 'CPT-ELC-ALLIX', naofix: 'ELC-ALLIX-P01',  fluide: 'Électricité', residence: 'Rés. André Allix',  ok: true  },
    { osfi: 'Ubigreen', ref: 'UBG-CHU-004',  naofix: 'CHU-ALTHE-P01',  fluide: 'Chaleur',      residence: 'Rés. Althéa',       ok: true  },
    { osfi: 'Deepki',  ref: 'METER_ELC_003', naofix: '— Non mappé —',   fluide: 'Électricité', residence: '?',                 ok: false },
    { osfi: 'CSV/SFTP',ref: 'CSV_ROW_ELC_1', naofix: 'ELC-LIRON-P01',  fluide: 'Électricité', residence: 'Rés. A. Lirondelle',ok: true  },
  ];
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
        <Link className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-bold text-slate-700">Mapping compteurs OSFI → Naofix</span>
        <span className="ml-auto text-xs text-slate-400">{mappings.filter(m => m.ok).length}/{mappings.length} mappés</span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Source OSFI</th>
            <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Réf. externe</th>
            <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Compteur Naofix</th>
            <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Fluide</th>
            <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Résidence</th>
            <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Statut</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {mappings.map((m, i) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-2.5">
                {(() => {
                  const c = connectors.find(c => m.osfi.includes(c.nom.split(' ')[0]));
                  return c ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded text-[9px] font-black flex items-center justify-center flex-shrink-0" style={{ background: c.logoBg, color: c.logoColor }}>{c.logoInitials}</span>
                      <span className="font-medium text-slate-700">{m.osfi}</span>
                    </span>
                  ) : <span className="text-slate-500">{m.osfi}</span>;
                })()}
              </td>
              <td className="px-4 py-2.5 font-mono text-slate-500">{m.ref}</td>
              <td className="px-4 py-2.5 font-mono font-bold text-slate-700">{m.naofix}</td>
              <td className="px-4 py-2.5 text-slate-500">{m.fluide}</td>
              <td className="px-4 py-2.5 text-slate-500">{m.residence}</td>
              <td className="px-4 py-2.5">
                {m.ok
                  ? <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-2.5 h-2.5" />Mappé</span>
                  : <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"><AlertCircle className="w-2.5 h-2.5" />Non mappé</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Normalisation view ───────────────────────────────────────────────────────

function NormalisationView() {
  const rules = [
    { source: 'Deepki',   champ_in: 'energy_kwh',    unite_in: 'kWh',  champ_out: 'valeur_kwh',   unite_out: 'kWh',  transfo: 'Identité',              ok: true  },
    { source: 'Deepki',   champ_in: 'energy_cost',   unite_in: 'EUR',  champ_out: 'cout_euros',   unite_out: '€',    transfo: 'Identité',              ok: true  },
    { source: 'Advizeo',  champ_in: 'consumption',   unite_in: 'MWh',  champ_out: 'valeur_kwh',   unite_out: 'kWh',  transfo: '× 1 000',               ok: true  },
    { source: 'Advizeo',  champ_in: 'water_volume',  unite_in: 'L',    champ_out: 'valeur_m3',    unite_out: 'm³',   transfo: '÷ 1 000',               ok: true  },
    { source: 'Ubigreen', champ_in: 'heat_mwh',      unite_in: 'MWh',  champ_out: 'valeur_kwh',   unite_out: 'kWh',  transfo: '× 1 000',               ok: true  },
    { source: 'CSV/SFTP', champ_in: 'Col.3 (libre)', unite_in: '?',    champ_out: 'valeur_kwh',   unite_out: 'kWh',  transfo: 'Auto-détection',        ok: false },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-bold text-blue-700">Moteur de normalisation Naofix</p>
          <p className="text-xs text-blue-600 mt-0.5">Chaque OSFI utilise ses propres unités et structures. Naofix transforme automatiquement toutes les données vers un modèle unifié avant stockage et analyse.</p>
        </div>
      </div>

      {/* Flow diagram */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-xs font-bold text-slate-700 mb-4">Flux de normalisation</p>
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {[
            { label: 'Sources OSFI', items: ['Deepki', 'Advizeo', 'Ubigreen', 'CSV/SFTP'], color: 'bg-slate-100 text-slate-600' },
            null,
            { label: 'Normalisation', items: ['Conversion unités', 'Mapping champs', 'Validation', 'Déduplication'], color: 'bg-blue-50 text-blue-700' },
            null,
            { label: 'Modèle Naofix', items: ['consommations_fluides', 'valeur_kwh / m³', 'cout_euros', 'indice_base100'], color: 'bg-emerald-50 text-emerald-700' },
          ].map((node, i) => (
            node === null ? (
              <ArrowRight key={i} className="w-5 h-5 text-slate-300 flex-shrink-0" />
            ) : (
              <div key={i} className="flex-1 min-w-36">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">{node.label}</p>
                <div className="space-y-1">
                  {node.items.map(item => (
                    <div key={item} className={`text-xs px-2 py-1 rounded-lg font-medium ${node.color}`}>{item}</div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Rules table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-700">Règles de transformation actives</p>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Source</th>
              <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Champ entrant</th>
              <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Unité source</th>
              <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Transformation</th>
              <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Champ Naofix</th>
              <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Unité cible</th>
              <th className="text-left px-4 py-2.5 text-slate-400 font-semibold uppercase tracking-wide">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rules.map((r, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2.5 font-medium text-slate-700">{r.source}</td>
                <td className="px-4 py-2.5 font-mono text-slate-500">{r.champ_in}</td>
                <td className="px-4 py-2.5 text-slate-500">{r.unite_in}</td>
                <td className="px-4 py-2.5 font-mono text-blue-600 font-bold">{r.transfo}</td>
                <td className="px-4 py-2.5 font-mono text-slate-700">{r.champ_out}</td>
                <td className="px-4 py-2.5 text-slate-500">{r.unite_out}</td>
                <td className="px-4 py-2.5">
                  {r.ok
                    ? <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-2.5 h-2.5" />Active</span>
                    : <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"><AlertCircle className="w-2.5 h-2.5" />À configurer</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ icon, label, value, sub, bg, border, valueColor = 'text-slate-800' }: {
  icon: React.ReactNode; label: string; value: string; sub?: string;
  bg: string; border: string; valueColor?: string;
}) {
  return (
    <div className={`${bg} border ${border} rounded-xl p-3.5 flex flex-col gap-1.5`}>
      <div className="flex-shrink-0">{icon}</div>
      <p className="text-xs text-slate-500 font-medium leading-none">{label}</p>
      <p className={`text-xl font-black leading-none ${valueColor}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
