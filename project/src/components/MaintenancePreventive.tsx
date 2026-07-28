import { useState, useEffect } from 'react';
import { ShieldCheck, Wrench, CalendarDays, Zap, Bell, History, ChevronDown, ChevronUp, Plus, CreditCard as Edit2, Copy, PauseCircle, CheckCircle2, Clock, AlertTriangle, User, Building2, Sparkles, Bot, ArrowRight, TrendingUp, BarChart3, X, LayoutGrid, LayoutList, Handshake, Filter, ExternalLink, Calendar, Package, Activity, AlertCircle, Layers } from 'lucide-react';
import CreerPlanModal from './CreerPlanModal';
import ChoixTypePlanModal from './ChoixTypePlanModal';
import MaintenancePrevTableau from './MaintenancePrevTableau';
import { EmailsModal } from './interventions/AttachmentsModals';
import { supabase } from '../lib/supabase';
import MaintenancePrevPlanning from './MaintenancePrevPlanning';
import type { PlanRow, Origine } from './MaintenancePrevTableau';

// ─── Aggregated plans mock data ────────────────────────────────────────────────

// PlanRow and Origine are imported from MaintenancePrevTableau

const PLANS_ALL: PlanRow[] = [
  // Alternated: Interne → Réglementaire → Interne → Contrat → Interne → Réglementaire → Interne → Réglementaire
  { id: 'P1', nom: '🧹 Nettoyage condenseurs et évaporateurs',     origine: 'interne',        responsable: 'Equipe Electro.',      frequence: 'Trimestrielle', prochaine_echeance: '01/07/2026', statut: 'planifiée' },
  { id: 'P6', nom: '❄️ Contrôle F-Gas (étanchéité circuit R-290)', origine: 'reglementaire',  responsable: 'APAVE',                frequence: 'Annuelle',      prochaine_echeance: '05/10/2026', statut: 'planifiée', source_ref: 'CTRL-2026-045', source_label: 'Vérification F-Gas — Règlement UE 517/2014' },
  { id: 'P2', nom: '🚪 Vérification joints de porte',              origine: 'interne',        responsable: 'Equipe Electro.',      frequence: 'Mensuelle',     prochaine_echeance: '15/07/2026', statut: 'à venir'   },
  { id: 'P5', nom: '🤝 Contrat entretien froid industriel Liebherr',origine: 'contrat',       responsable: 'Thermique Atlantique', frequence: 'Semestrielle',  prochaine_echeance: '20/09/2026', statut: 'planifiée', source_ref: 'CTR-2026-018', source_label: 'Contrat entretien froid industriel' },
  { id: 'P3', nom: '🌀 Contrôle ventilateurs (bruits/vibrations)',  origine: 'interne',        responsable: 'Equipe Electro.',      frequence: 'Semestrielle',  prochaine_echeance: '15/09/2026', statut: 'planifiée' },
  { id: 'P7', nom: '🌡️ Audit température HACCP',                   origine: 'reglementaire',  responsable: 'SOCOTEC',              frequence: 'Annuelle',      prochaine_echeance: '15/11/2026', statut: 'à venir',   source_ref: 'CTRL-2026-061', source_label: 'Contrôle hygiène alimentaire — CE 852/2004' },
  { id: 'P4', nom: '🔔 Test alarmes température et porte ouverte',  origine: 'interne',        responsable: 'Equipe Electro.',      frequence: 'Mensuelle',     prochaine_echeance: '15/07/2026', statut: 'à venir'   },
  { id: 'P8', nom: '⚡ Vérification électrique NF C 15-100',        origine: 'reglementaire',  responsable: 'Bureau Veritas',       frequence: 'Quinquennale',  prochaine_echeance: '01/03/2028', statut: 'à venir',   source_ref: 'CTRL-2023-012', source_label: 'Vérification installations électriques' },
];

// ─── Approvisionnement mock data ───────────────────────────────────────────────

const APPRO_ROWS = [
  { plan: '🧹 Nettoyage condenseurs',   origine: 'interne'       as Origine, piece: 'Filtre G4 600×400mm',         qty_besoin: 4, qty_stock: 8,  statut: 'couvert',     da_ref: null,           date_intervention: '01/07/2026' },
  { plan: '🧹 Nettoyage condenseurs',   origine: 'interne'       as Origine, piece: 'Spray nettoyant condenseur',   qty_besoin: 2, qty_stock: 1,  statut: 'sous_seuil',  da_ref: 'DA-2026-018',  date_intervention: '01/07/2026' },
  { plan: '🌀 Contrôle ventilateurs',   origine: 'interne'       as Origine, piece: 'Courroie B42',                 qty_besoin: 2, qty_stock: 0,  statut: 'rupture',     da_ref: null,           date_intervention: '15/09/2026' },
  { plan: '🌀 Contrôle ventilateurs',   origine: 'interne'       as Origine, piece: 'Roulement SKF 6205',           qty_besoin: 2, qty_stock: 4,  statut: 'couvert',     da_ref: null,           date_intervention: '15/09/2026' },
  { plan: '❄️ Contrôle F-Gas',          origine: 'reglementaire' as Origine, piece: 'Kit détecteur fuite R-290',    qty_besoin: 1, qty_stock: 0,  statut: 'rupture',     da_ref: null,           date_intervention: '05/10/2026' },
  { plan: '🤝 Contrat entretien Liebherr',origine:'contrat'      as Origine, piece: 'Joint de porte silicone',      qty_besoin: 3, qty_stock: 2,  statut: 'sous_seuil',  da_ref: 'DA-2026-021',  date_intervention: '20/09/2026' },
  { plan: '🤝 Contrat entretien Liebherr',origine:'contrat'      as Origine, piece: 'Thermostat NTC 10k',           qty_besoin: 1, qty_stock: 3,  statut: 'couvert',     da_ref: null,           date_intervention: '20/09/2026' },
  { plan: '🌡️ Audit température HACCP', origine: 'reglementaire' as Origine, piece: 'Sonde température calibrée',  qty_besoin: 2, qty_stock: 2,  statut: 'couvert',     da_ref: null,           date_intervention: '15/11/2026' },
];

const APPRO_STATUT_CFG: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  couvert:    { label: 'Couvert',       dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50'  },
  sous_seuil: { label: 'Sous seuil',    dot: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50'    },
  rupture:    { label: 'Rupture prévue',dot: 'bg-red-500',     text: 'text-red-700',     bg: 'bg-red-50'      },
};

// ─── Origin helpers ────────────────────────────────────────────────────────────

const ORIGINE_CONFIG: Record<Origine, { label: string; icon: React.ElementType; color: string; dot: string }> = {
  interne:        { label: 'Interne',        icon: Wrench,      color: 'bg-blue-50 text-blue-700 border-blue-200',    dot: 'bg-blue-400'   },
  contrat:        { label: 'Contrat',        icon: Handshake,   color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  reglementaire:  { label: 'Réglementaire',  icon: ShieldCheck, color: 'bg-amber-50 text-amber-700 border-amber-200',  dot: 'bg-amber-400'  },
};

function OrigBadge({ origine }: { origine: Origine }) {
  const cfg = ORIGINE_CONFIG[origine];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

const PLAN = {
  nom: 'Nettoyage condenseurs et évaporateurs',
  type: 'Préventive',
  frequence: 'Trimestrielle',
  duree_estimee: '1 h',
  competence: 'Frigoriste',
  responsable: 'Thermique Atlantique',
  created_at: '15/03/2026',
  updated_at: '15/03/2026',
  taux_realisation: 100,
  prochaine_echeance: '01/07/2026',
  nb_plans_actifs: 8,
};

const CHECKLIST = [
  { id: 1, label: 'Dépoussiérage grille et ailettes du condenseur',  done: true  },
  { id: 2, label: 'Nettoyage bac de récupération des condensats',     done: true  },
  { id: 3, label: 'Vérification état et propreté de l\'évaporateur', done: true  },
  { id: 4, label: 'Contrôle débit d\'air — ventilateurs condenseur', done: false },
  { id: 5, label: 'Mesure de la température de soufflage',            done: false },
  { id: 6, label: 'Rapport d\'intervention signé',                    done: false },
];

const REGLES = [
  { type: 'Calendaire',  valeur: 'Tous les 3 mois',            echeance: '01/07/2026', statut: 'actif',  color: 'bg-cyan-50 text-cyan-700 border-cyan-200'    },
  { type: 'Conditionnel', valeur: 'T° condenseur > 55°C',      echeance: 'À surveiller', statut: 'veille', color: 'bg-slate-100 text-slate-600 border-slate-200' },
];

const CALENDRIER = [
  { date: '01/07/2026', label: 'Nettoyage condenseurs', statut: 'planifiée', type: 'preventive' },
  { date: '01/10/2026', label: 'Nettoyage condenseurs', statut: 'à venir',   type: 'preventive' },
  { date: '01/01/2027', label: 'Nettoyage condenseurs', statut: 'à venir',   type: 'preventive' },
  { date: '01/04/2026', label: 'Nettoyage condenseurs', statut: 'réalisée',  type: 'preventive' },
  { date: '01/01/2026', label: 'Nettoyage condenseurs', statut: 'réalisée',  type: 'preventive' },
];

const INTERVENTIONS = [
  { num: 'INT-5491', generee: '01/07/2026', responsable: 'Thermique Atlantique', statut: 'Planifiée', statut_color: 'bg-cyan-50 text-cyan-700 border-cyan-200'         },
  { num: 'INT-5102', generee: '01/04/2026', responsable: 'Thermique Atlantique', statut: 'Réalisée',  statut_color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { num: 'INT-4781', generee: '01/01/2026', responsable: 'Thermique Atlantique', statut: 'Réalisée',  statut_color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { num: 'INT-4402', generee: '01/10/2025', responsable: 'Thermique Atlantique', statut: 'Réalisée',  statut_color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
];

const AFFECTATION = {
  prestataire: 'Thermique Atlantique',
  motifs: [
    'Contrat actif (2024-2027)',
    'Compétence frigoriste certifiée',
    'Résidence couverte par le contrat',
    'Disponibilité confirmée',
  ],
};

const NOTIFICATIONS = [
  { date: '15/09/2026 08:00', canal: 'Email', destinataire: 'contact@thermique-atlantique.fr', statut: 'Distribué',  role: 'Prestataire' },
  { date: '15/09/2026 08:00', canal: 'Email', destinataire: 'maintenance@crous-lyon.fr',       statut: 'Distribué',  role: 'Gestionnaire' },
  { date: '14/09/2026 17:00', canal: 'Notif. app', destinataire: 'M. Dupont',                  statut: 'Distribué',  role: 'Responsable technique' },
];

const HISTORIQUE = [
  { date: '15/09/2026', action: 'Intervention générée automatiquement', auteur: null,          type: 'auto'     },
  { date: '15/09/2026', action: 'Notification envoyée — Thermique Atlantique', auteur: null,   type: 'notif'    },
  { date: '20/03/2026', action: 'Fréquence modifiée : 6 mois → inchangé (confirmation)', auteur: 'Sophie Martin', type: 'modif' },
  { date: '15/03/2026', action: 'Plan de maintenance créé',              auteur: 'Martin Dupont', type: 'create' },
];

// ─── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  icon: Icon, title, accent = 'blue', children, actions,
}: {
  icon: React.ElementType; title: string; accent?: string; children: React.ReactNode; actions?: React.ReactNode;
}) {
  const colors: Record<string, string> = {
    blue:   'text-blue-600 bg-blue-50',
    amber:  'text-amber-600 bg-amber-50',
    emerald:'text-emerald-600 bg-emerald-50',
    cyan:   'text-cyan-600 bg-cyan-50',
    violet: 'text-violet-600 bg-violet-50',
    slate:  'text-slate-600 bg-slate-100',
  };
  const col = colors[accent] ?? colors.blue;
  const [icon_col, bg_col] = col.split(' ');
  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${bg_col}`}>
            <Icon className={`w-4 h-4 ${icon_col}`} />
          </div>
          <span className="text-sm font-bold text-slate-800">{title}</span>
        </div>
        {actions && <div className="flex items-center gap-1.5">{actions}</div>}
      </div>
      <div className="bg-white px-4 py-4">{children}</div>
    </div>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex-1 min-w-0 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{label}</p>
      <p className="text-sm font-bold text-slate-800 mt-0.5 truncate">{value}</p>
      {sub && <p className="text-[11px] text-slate-400 truncate">{sub}</p>}
    </div>
  );
}

// ─── Statut badge ──────────────────────────────────────────────────────────────

function CalBadge({ statut }: { statut: string }) {
  const map: Record<string, string> = {
    'planifiée': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'à venir':   'bg-slate-100 text-slate-600 border-slate-200',
    'réalisée':  'bg-emerald-50 text-emerald-700 border-emerald-200',
    'en retard': 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${map[statut] ?? map['à venir']}`}>
      {statut.charAt(0).toUpperCase() + statut.slice(1)}
    </span>
  );
}

// ─── AI suggestion modal ───────────────────────────────────────────────────────

function IASuggestionModal({ onClose }: { onClose: () => void }) {
  const [accepted, setAccepted] = useState(false);
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ width: 540, maxWidth: '95vw', maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-blue-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Suggestion IA</p>
              <p className="text-[11px] text-slate-500">Plan de maintenance préventive généré</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/60 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-3">
          <p className="text-xs text-slate-500 bg-violet-50 rounded-lg px-3 py-2 border border-violet-100">
            Analyse basée sur : catégorie <strong>Électroménager</strong>, historique des interventions, réglementations HACCP et plans existants sur équipements similaires.
          </p>

          {[
            { label: 'Fréquence recommandée', value: 'Tous les 6 mois', reason: 'Conforme HACCP et usage intensif restauration collective' },
            { label: 'Durée estimée', value: '2 h', reason: 'Moyenne constatée sur 12 équipements similaires' },
            { label: 'Compétences requises', value: 'Frigoriste certifié (R-290)', reason: 'Fluide inflammable — habilitation obligatoire' },
            { label: 'Responsable suggéré', value: 'Thermique Atlantique', reason: 'Contrat actif, compétence validée, résidence couverte' },
          ].map(item => (
            <div key={item.label} className="flex gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-700">{item.label}</p>
                <p className="text-sm font-semibold text-slate-800">{item.value}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 italic">{item.reason}</p>
              </div>
            </div>
          ))}

          <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <p className="text-xs font-bold text-slate-700">Checklist suggérée (8 points)</p>
            </div>
            <ul className="space-y-1">
              {CHECKLIST.map(t => (
                <li key={t.id} className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                  {t.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/60">
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            Refuser
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="text-sm font-medium text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
              Modifier d'abord
            </button>
            <button
              onClick={() => { setAccepted(true); setTimeout(onClose, 800); }}
              className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors ${accepted ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {accepted ? <><CheckCircle2 className="w-3.5 h-3.5" /> Accepté</> : <>Accepter le plan <ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function MaintenancePreventive() {
  const [checkItems, setCheckItems]   = useState(CHECKLIST);
  const [showIA,     setShowIA]       = useState(false);
  const [calFilter,  setCalFilter]    = useState<string>('all');
  const [newItem,    setNewItem]      = useState('');
  const [showChoix,  setShowChoix]    = useState(false);
  const [showCreer,  setShowCreer]    = useState(false);
  const [showIASidebar, setShowIASidebar] = useState(false);
  const [activeView, setActiveView]   = useState<'tableau' | 'echeances' | 'planning' | 'appro'>('tableau');
  const [selectedPlan, setSelectedPlan]   = useState<PlanRow | null>(PLANS_ALL[0]);
  const [dbPlans, setDbPlans]         = useState<PlanRow[]>([]);
  const [emailPlan, setEmailPlan]     = useState<PlanRow | null>(null);
  const [newPlanId, setNewPlanId]     = useState<string | undefined>(undefined);

  const loadDbPlans = async () => {
    const { data } = await supabase
      .from('maintenance_plans')
      .select('id, nom, origine, responsable, frequence, premiere_echeance, statut')
      .order('created_at', { ascending: false });
    if (data) {
      setDbPlans(data.map(p => ({
        id: p.id,
        nom: p.nom,
        origine: (p.origine as Origine) ?? 'interne',
        responsable: p.responsable ?? 'Non assigné',
        frequence: p.frequence ?? 'N/A',
        prochaine_echeance: p.premiere_echeance
          ? new Date(p.premiere_echeance).toLocaleDateString('fr-FR')
          : 'N/A',
        statut: (p.statut as PlanRow['statut']) ?? 'planifiée',
      })));
    }
  };

  useEffect(() => { loadDbPlans(); }, []);

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('Supprimer ce plan de maintenance ?')) return;
    await supabase.from('maintenance_plans').delete().eq('id', id);
    setDbPlans(prev => prev.filter(p => p.id !== id));
  };

  const toggleCheck = (id: number) =>
    setCheckItems(prev => prev.map(c => c.id === id ? { ...c, done: !c.done } : c));

  const addCheckItem = () => {
    if (!newItem.trim()) return;
    setCheckItems(prev => [...prev, { id: Date.now(), label: newItem.trim(), done: false }]);
    setNewItem('');
  };

  const doneCount  = checkItems.filter(c => c.done).length;
  const totalCheck = checkItems.length;

  const allPlans = [...PLANS_ALL, ...dbPlans];

  const filteredCal = calFilter === 'all'
    ? CALENDRIER
    : CALENDRIER.filter(e => e.statut === calFilter);

  const countInterne       = allPlans.filter(p => p.origine === 'interne').length;
  const countContrat       = allPlans.filter(p => p.origine === 'contrat').length;
  const countReglementaire = allPlans.filter(p => p.origine === 'reglementaire').length;

  return (
    <div className="p-4 space-y-4">

      {/* ── KPI Bar ── */}
      <div className="grid grid-cols-7 gap-2">
        {[
          { label: 'Plans actifs',            value: allPlans.length,                                          icon: Activity,      color: 'text-blue-600',    bg: 'bg-blue-50'    },
          { label: 'Interventions générées',   value: 34,                                                        icon: CheckCircle2,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Plans regroupés',          value: 3,                                                         icon: Layers,        color: 'text-violet-600',  bg: 'bg-violet-50'  },
          { label: 'Échéances en retard',      value: allPlans.filter(p => p.statut === 'en retard').length,    icon: AlertCircle,   color: 'text-red-600',     bg: 'bg-red-50'     },
          { label: 'Risques appro.',           value: APPRO_ROWS.filter(r => r.statut !== 'couvert').length,    icon: Package,       color: 'text-amber-600',   bg: 'bg-amber-50'   },
          { label: 'Issus de contrats',        value: countContrat,                                              icon: Handshake,     color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Réglementaires',           value: countReglementaire,                                        icon: ShieldCheck,   color: 'text-amber-600',   bg: 'bg-amber-50'   },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-slate-100 px-3 py-2.5 flex items-center gap-2.5 hover:border-slate-200 transition-colors">
            <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center flex-shrink-0`}>
              <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-black text-slate-800 leading-none">{kpi.value}</p>
              <p className="text-[10px] text-slate-400 font-medium leading-tight truncate">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Action bar ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* View toggle */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          <button onClick={() => setActiveView('tableau')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${activeView === 'tableau' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <LayoutList className="w-3.5 h-3.5" /> Tableau
          </button>
          <button onClick={() => setActiveView('echeances')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${activeView === 'echeances' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <CalendarDays className="w-3.5 h-3.5" /> Echéances
          </button>
          <button onClick={() => setActiveView('planning')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${activeView === 'planning' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <LayoutGrid className="w-3.5 h-3.5" /> Planning
          </button>
          <button onClick={() => setActiveView('appro')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${activeView === 'appro' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Package className="w-3.5 h-3.5" /> Approvisionnement
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIASidebar(s => !s)}
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${showIASidebar ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-violet-600 border-violet-200 hover:bg-violet-50'}`}
          >
            <Bot className="w-3.5 h-3.5" />
            Agent IA
          </button>
          <button
            onClick={() => setShowChoix(true)}
            className="flex items-center gap-2 text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nouveau plan de maintenance
          </button>
        </div>
      </div>

      {/* ── KPI Répartition ── */}
      <div className="border border-slate-100 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-sm font-bold text-slate-800">Répartition des plans</span>
          <span className="ml-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{allPlans.length} plans actifs</span>
        </div>
        <div className="bg-white px-4 py-3 flex flex-wrap gap-3">
          {([
            { origine: 'interne'       as Origine, count: countInterne       },
            { origine: 'contrat'       as Origine, count: countContrat       },
            { origine: 'reglementaire' as Origine, count: countReglementaire },
          ]).map(({ origine, count }) => {
            const cfg = ORIGINE_CONFIG[origine];
            const Icon = cfg.icon;
            return (
              <div key={origine}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border-2 border-slate-100 bg-slate-50`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.color.split(' ').find(c => c.startsWith('bg-')) ?? 'bg-slate-100'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-black text-slate-800 leading-none">{count}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{cfg.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Vue Tableau ── */}
      {activeView === 'tableau' && (
        <div className="border border-slate-100 rounded-xl overflow-hidden" style={{ minHeight: 320 }}>
          <MaintenancePrevTableau
            plans={allPlans}
            selectedId={selectedPlan?.id}
            onSelect={setSelectedPlan}
            onEmailClick={p => setEmailPlan(p)}
            newPlanId={newPlanId}
            onDelete={handleDeletePlan}
          />
        </div>
      )}

      {/* ── Vue Echéances ── */}
      {activeView === 'echeances' && (
        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-bold text-slate-800">Echéances prévisionnelles</span>
            </div>
            <div className="flex gap-1.5">
              {([['all', 'Tous'], ['interne', 'Interne'], ['contrat', 'Contrat'], ['reglementaire', 'Réglementaire']] as [Origine | 'all', string][]).map(([val, lbl]) => (
                <button key={val} onClick={() => setPlanningFilter(val)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${planningFilter === val ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white px-4 py-4">
            {/* Legend */}
            <div className="flex items-center gap-4 mb-4">
              {(Object.entries(ORIGINE_CONFIG) as [Origine, typeof ORIGINE_CONFIG[Origine]][]).map(([k, cfg]) => (
                <div key={k} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </div>
              ))}
            </div>
            {/* Events list */}
            <div className="space-y-2">
              {filteredPlanning.map((ev, i) => {
                const cfg = ORIGINE_CONFIG[ev.origine];
                const Icon = cfg.icon;
                return (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${cfg.color} bg-opacity-30`}>
                    <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0 bg-white border ${cfg.color.split(' ').find(c => c.startsWith('border-')) ?? 'border-slate-100'} shadow-sm`}>
                      <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">{ev.date.slice(3, 6).replace('/', '')}</span>
                      <span className="text-sm font-black text-slate-800 leading-tight">{ev.date.slice(0, 2)}</span>
                    </div>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{ev.label}</p>
                      <p className="text-[11px] text-slate-500">{ev.date}</p>
                    </div>
                    <OrigBadge origine={ev.origine} />
                  </div>
                );
              })}
              {filteredPlanning.length === 0 && (
                <p className="text-center text-sm text-slate-400 py-6">Aucun événement pour ce filtre.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Vue Planning ── */}
      {activeView === 'planning' && (
        <div className="border border-slate-100 rounded-xl overflow-hidden" style={{ minHeight: 480 }}>
          <MaintenancePrevPlanning plans={allPlans} />
        </div>
      )}

      {/* ── Vue Approvisionnement ── */}
      {activeView === 'appro' && (
        <div className="border border-slate-100 rounded-xl overflow-hidden bg-white">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-bold text-slate-800">Approvisionnement préventif</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{APPRO_ROWS.length} lignes</span>
            </div>
            <div className="flex items-center gap-2">
              {(['couvert','sous_seuil','rupture'] as const).map(s => {
                const cfg = APPRO_STATUT_CFG[s];
                return (
                  <span key={s} className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Plan','Origine','Pièce / article','Qté nécessaire','Stock disponible','Statut','Demande d\'achat','Date intervention'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {APPRO_ROWS.map((row, i) => {
                  const cfg = APPRO_STATUT_CFG[row.statut];
                  const origCfg = ORIGINE_CONFIG[row.origine];
                  const OrigIcon = origCfg.icon;
                  return (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-slate-800 max-w-[200px] truncate" title={row.plan}>{row.plan}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${origCfg.color}`}>
                          <OrigIcon className="w-3 h-3" />{origCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-700">{row.piece}</td>
                      <td className="px-4 py-2.5 text-center font-semibold text-slate-700">{row.qty_besoin}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`font-bold ${row.qty_stock === 0 ? 'text-red-600' : row.qty_stock < row.qty_besoin ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {row.qty_stock}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        {row.da_ref ? (
                          <button className="flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                            {row.da_ref} <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          row.statut !== 'couvert' ? (
                            <button className="flex items-center gap-1 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg px-2 py-0.5 hover:bg-blue-50 transition-colors">
                              <Plus className="w-3 h-3" /> Créer DA
                            </button>
                          ) : <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">{row.date_intervention}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── AI Agent sidebar ── */}
      {showIASidebar && (
        <div className="border border-violet-100 rounded-xl overflow-hidden bg-white">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-50 to-blue-50 border-b border-violet-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                <Bot className="w-4 h-4 text-violet-600" />
              </div>
              <span className="text-sm font-bold text-slate-800">Agent IA Maintenance</span>
            </div>
            <button onClick={() => setShowIASidebar(false)} className="p-1.5 hover:bg-white/60 rounded-lg transition-colors">
              <X className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
          <div className="px-4 py-4 space-y-3">
            <button className="w-full flex items-center justify-center gap-2 text-sm font-bold bg-violet-600 text-white py-2.5 rounded-xl hover:bg-violet-700 transition-colors">
              <Zap className="w-4 h-4" /> Analyser et optimiser
            </button>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-3 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-violet-600" />
                <span className="text-xs font-bold text-slate-700">Génération groupée intelligente</span>
              </div>
              <div className="px-3 py-3 space-y-2">
                <p className="text-xs text-slate-500 leading-relaxed">Analyse : localisation, compétences, prestataires, planning.</p>
                <div className="bg-violet-50 border border-violet-100 rounded-lg p-2.5 space-y-1">
                  <p className="text-xs font-semibold text-violet-800">Regrouper 18 interventions</p>
                  <p className="text-[11px] text-violet-600">Gain estimé : −32 % de déplacements</p>
                </div>
                <button className="w-full text-xs font-semibold text-violet-600 border border-violet-200 rounded-lg py-1.5 hover:bg-violet-50 transition-colors">
                  Appliquer le regroupement
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 overflow-hidden">
              <div className="px-3 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-bold text-slate-700">Approvisionnement intelligent</span>
              </div>
              <div className="px-3 py-3 space-y-2">
                <p className="text-xs text-slate-500 leading-relaxed">Analyse : stocks, plans futurs, historique, délais fournisseurs.</p>
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 space-y-1">
                  <p className="text-xs font-semibold text-emerald-800">Commander 5 filtres G4</p>
                  <p className="text-[11px] text-emerald-600">Avant le 10 septembre — délai 3 semaines</p>
                </div>
                <button className="w-full text-xs font-semibold text-emerald-600 border border-emerald-200 rounded-lg py-1.5 hover:bg-emerald-50 transition-colors">
                  Créer la demande d'achat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Séparateur plan sélectionné ── */}
      {activeView !== 'planning' && activeView !== 'appro' && selectedPlan && (
        <div className="flex items-center gap-3 pt-2">
          <div className="flex-1 h-px bg-slate-100" />
          <div className="flex items-center gap-2">
            <OrigBadge origine={selectedPlan.origine} />
            <span className="text-xs font-bold text-slate-600 max-w-[260px] truncate">{selectedPlan.nom}</span>
          </div>
          <div className="flex-1 h-px bg-slate-100" />
        </div>
      )}

      {/* ── Source du plan ── */}
      {activeView !== 'planning' && activeView !== 'appro' && selectedPlan?.source_ref && (
        <div className="border border-slate-100 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-slate-100">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${selectedPlan.origine === 'contrat' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
              {selectedPlan.origine === 'contrat' ? <Handshake className="w-4 h-4 text-emerald-600" /> : <ShieldCheck className="w-4 h-4 text-amber-600" />}
            </div>
            <span className="text-sm font-bold text-slate-800">Source du plan</span>
          </div>
          <div className="bg-white px-4 py-4 flex items-center gap-3">
            <OrigBadge origine={selectedPlan.origine} />
            <div>
              <p className="text-xs font-mono font-bold text-slate-700">{selectedPlan.source_ref}</p>
              <p className="text-sm text-slate-600">{selectedPlan.source_label}</p>
            </div>
            <button className="ml-auto flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
              <ExternalLink className="w-3.5 h-3.5" />
              {selectedPlan.origine === 'contrat' ? 'Module Contrats' : 'Module Réglementaire'}
            </button>
          </div>
        </div>
      )}

      {/* ── Carte 1 : Synthèse ── */}
      {activeView !== 'planning' && activeView !== 'appro' && <>
      <Section icon={BarChart3} title="Synthèse maintenance préventive" accent="blue">
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {PLAN.nb_plans_actifs} plan actif
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
            <CalendarDays className="w-3.5 h-3.5" />
            Prochaine échéance : {PLAN.prochaine_echeance}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <KpiCard label="Fréquence" value={PLAN.frequence} />
          <KpiCard label="Responsable" value={PLAN.responsable} />
          <KpiCard label="Durée estimée" value={PLAN.duree_estimee} />
          <KpiCard label="Taux de réalisation" value={`${PLAN.taux_realisation} %`} sub="sur les 12 derniers mois" />
        </div>
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Taux de réalisation</span>
            <span className="text-xs font-bold text-emerald-600">{PLAN.taux_realisation} %</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-2 bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${PLAN.taux_realisation}%` }}
            />
          </div>
        </div>
      </Section>

      {/* ── Carte 2 : Plan de maintenance ── */}
      <Section
        icon={Wrench}
        title="Plan de maintenance"
        accent="amber"
        actions={
          <>
            <button
              onClick={() => setShowIA(true)}
              className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Générer avec l'IA
            </button>
            <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title="Modifier">
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title="Dupliquer">
              <Copy className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title="Suspendre">
              <PauseCircle className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
          {[
            { label: 'Nom du plan',      value: PLAN.nom           },
            { label: 'Type',             value: PLAN.type          },
            { label: 'Fréquence',        value: PLAN.frequence     },
            { label: 'Durée estimée',    value: PLAN.duree_estimee },
            { label: 'Compétence',       value: PLAN.competence    },
            { label: 'Responsable',      value: PLAN.responsable   },
            { label: 'Créé le',          value: PLAN.created_at    },
            { label: 'Modifié le',       value: PLAN.updated_at    },
          ].map(row => (
            <div key={row.label} className="flex flex-col gap-0.5 border-b border-slate-50 pb-2 last:border-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{row.label}</span>
              <span className="text-sm text-slate-700 font-medium">{row.value}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Carte 3 : Checklist ── */}
      <Section icon={CheckCircle2} title="Checklist d'intervention" accent="emerald"
        actions={
          <span className="text-[11px] font-semibold text-slate-500">
            {doneCount} / {totalCheck}
          </span>
        }
      >
        {/* Progress mini */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full mb-3 overflow-hidden">
          <div className="h-1.5 bg-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${Math.round((doneCount / totalCheck) * 100)}%` }} />
        </div>
        <ul className="space-y-1.5 mb-3">
          {checkItems.map(item => (
            <li key={item.id}
              className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer select-none transition-colors ${item.done ? 'bg-emerald-50/60' : 'hover:bg-slate-50'}`}
              onClick={() => toggleCheck(item.id)}
            >
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${item.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                {item.done && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
              </div>
              <span className={`text-sm flex-1 ${item.done ? 'text-emerald-700 line-through' : 'text-slate-700'}`}>{item.label}</span>
            </li>
          ))}
        </ul>
        {/* Add item */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ajouter une tâche..."
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCheckItem()}
            className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
          />
          <button
            onClick={addCheckItem}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Ajouter
          </button>
        </div>
      </Section>

      {/* ── Carte 4 : Règles de déclenchement ── */}
      <Section icon={Zap} title="Règles de déclenchement" accent="amber">
        <div className="space-y-2.5">
          {REGLES.map((r, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${r.color}`}>{r.type}</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${r.statut === 'actif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    {r.statut === 'actif' ? 'Actif' : 'Veille'}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-700">{r.valeur}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Prochaine échéance</p>
                <p className="text-sm font-semibold text-slate-700">{r.echeance}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Carte 5 : Calendrier prévisionnel ── */}
      <Section icon={CalendarDays} title="Calendrier prévisionnel" accent="cyan">
        {/* Filter pills */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {[['all', 'Toutes'], ['à venir', 'À venir'], ['planifiée', 'Planifiées'], ['réalisée', 'Réalisées']].map(([val, lbl]) => (
            <button key={val} onClick={() => setCalFilter(val)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${calFilter === val ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
              {lbl}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {filteredCal.map((ev, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:border-slate-200 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-100 flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-[9px] font-bold text-slate-400 uppercase">{ev.date.slice(3, 6).replace('/', '')}</span>
                <span className="text-sm font-black text-slate-800 leading-tight">{ev.date.slice(0, 2)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{ev.label}</p>
                <p className="text-[11px] text-slate-400">{ev.date}</p>
              </div>
              <CalBadge statut={ev.statut} />
            </div>
          ))}
        </div>
      </Section>

      {/* ── Carte 6 : Interventions générées ── */}
      <Section icon={Bot} title="Interventions générées automatiquement" accent="slate">
        <div className="space-y-2">
          {INTERVENTIONS.map((int, i) => (
            <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50 hover:border-slate-200 transition-colors">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-800">{int.num}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 border border-violet-100 flex items-center gap-1">
                    <Bot className="w-2.5 h-2.5" /> Auto
                  </span>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${int.statut_color}`}>{int.statut}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
                <div className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Générée le {int.generee}</div>
                <div className="flex items-center gap-1"><User className="w-3 h-3" />{int.responsable}</div>
                <div className="flex items-center gap-1 col-span-2">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-600 border border-cyan-100">
                    Issue du plan préventif
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Carte 7 : Affectation automatique ── */}
      <Section icon={User} title="Affectation automatique" accent="emerald">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 mb-4">
          <div className="w-10 h-10 rounded-lg bg-white border border-emerald-200 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Prestataire affecté</p>
            <p className="text-sm font-bold text-slate-800">{AFFECTATION.prestataire}</p>
          </div>
        </div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Motifs de décision</p>
        <ul className="space-y-1.5">
          {AFFECTATION.motifs.map((m, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              {m}
            </li>
          ))}
        </ul>
      </Section>

      {/* ── Carte 8 : Notifications ── */}
      <Section icon={Bell} title="Notifications envoyées" accent="cyan">
        <div className="space-y-2">
          {NOTIFICATIONS.map((n, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
              <div className="w-7 h-7 rounded-lg bg-cyan-50 border border-cyan-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bell className="w-3.5 h-3.5 text-cyan-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-xs font-bold text-slate-700">{n.role}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">{n.canal}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> {n.statut}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{n.destinataire}</p>
                <p className="text-[11px] text-slate-400">{n.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Carte 9 : Historique ── */}
      <Section icon={History} title="Historique du plan" accent="slate">
        <div className="relative pl-4">
          {/* Timeline line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200" />
          <div className="space-y-4">
            {HISTORIQUE.map((h, i) => {
              const dotColor =
                h.type === 'create'  ? 'bg-emerald-400' :
                h.type === 'auto'    ? 'bg-violet-400'  :
                h.type === 'notif'   ? 'bg-cyan-400'    : 'bg-amber-400';
              return (
                <div key={i} className="relative flex gap-3">
                  <div className={`absolute -left-4 top-1.5 w-3 h-3 rounded-full border-2 border-white ${dotColor} shadow-sm flex-shrink-0 z-10`} />
                  <div className="flex-1 min-w-0 pl-1">
                    <p className="text-sm font-medium text-slate-700">{h.action}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span>{h.date}</span>
                      {h.auteur && <><span>·</span><span>par <strong className="text-slate-600">{h.auteur}</strong></span></>}
                      {!h.auteur && (
                        <span className="flex items-center gap-0.5 text-violet-500">
                          <Bot className="w-3 h-3" /> Automatique
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>
      </>}

      {showIA && <IASuggestionModal onClose={() => setShowIA(false)} />}

      {showChoix && (
        <ChoixTypePlanModal
          onClose={() => setShowChoix(false)}
          onSelectInterne={() => { setShowChoix(false); setShowCreer(true); }}
          onSelectContrat={() => setShowChoix(false)}
          onSelectReglementaire={() => setShowChoix(false)}
        />
      )}

      {showCreer && (
        <CreerPlanModal
          onClose={() => setShowCreer(false)}
          onCreated={(id) => { setShowCreer(false); setNewPlanId(id); loadDbPlans(); }}
          equipementNom="Armoire positive 5°C ± 2°C 1361 L"
          equipementCategories={['ÉLECTROMÉNAGER', 'Armoire positive']}
        />
      )}

      {emailPlan && (
        <EmailsModal
          ticketRef={emailPlan.id}
          count={3}
          onClose={() => setEmailPlan(null)}
          demande={{ reference: emailPlan.id, titre: emailPlan.nom }}
        />
      )}
    </div>
  );
}
