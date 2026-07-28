import { X, Phone, Mail, User, MapPin, Calendar, Clock, CheckCircle2, AlertTriangle, MessageSquare, Plus, UserPlus, PauseCircle, BellRing, MessageCircle, StickyNote, HelpCircle, ClipboardList, ExternalLink, ChevronRight, Building2, Wrench, Zap, Droplets, Flame, Lock, Star } from 'lucide-react';
import { STATUT_DI_CFG, type StatutDI } from './interventionsTypes';

// ─── Logo imports ─────────────────────────────────────────────────────────────
import logoSOCOTEC from '../../assets/logo-SOCOTEC.png';
import logoThermocom from '../../assets/logo-Thermocom.svg';
import logoDecra from '../../assets/logo-Dekra.jpg';
import logoApave from '../../assets/logo-Apave.jpg';
import logoCrous from '../../assets/logo-crous-lyon-resize.png';

// ─── Agent data ───────────────────────────────────────────────────────────────

export interface AgentInfo {
  nom: string;
  prenom: string;
  fonction: string;
  service: string;
  telephone: string;
  email: string;
  photo?: string;
  competences: string[];
  tickets_en_cours: number;
  interventions_today: number;
  retards: number;
  temps_moyen_jours: number;
  interventions_planifiees: { heure: string; lieu: string }[];
  tickets_recents: { ref: string; statut: StatutDI; titre: string }[];
}

export interface PrestataireInfo {
  nom: string;
  categorie: string;
  logo?: string;
  contact_nom: string;
  contact_prenom: string;
  service: string;
  telephone: string;
  email: string;
  tickets_en_cours: number;
  interventions_today: number;
  retards: number;
  temps_moyen_jours: number;
  interventions_planifiees: { heure: string; lieu: string }[];
  tickets_recents: { ref: string; statut: StatutDI; titre: string }[];
}

// ─── Static data ──────────────────────────────────────────────────────────────

const AGENT_PHOTOS: Record<string, string> = {
  'Martin D.':  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&dpr=1',
  'Leroy P.':   'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&dpr=1',
  'Bernard C.': 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&dpr=1',
  'Laurent E.': 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&dpr=1',
  'Michel G.':  'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&dpr=1',
};

const AGENT_DATA: Record<string, AgentInfo> = {
  'Martin D.': {
    nom: 'DUPONT', prenom: 'Martin', fonction: 'Plombier', service: 'Maintenance technique – Résidences Nord',
    telephone: '+33 6 12 34 56 78', email: 'martin.dupont@crous-lyon.fr',
    photo: AGENT_PHOTOS['Martin D.'],
    competences: ['🚰 Plomberie', '🏢 Bâtiment'],
    tickets_en_cours: 12, interventions_today: 3, retards: 1, temps_moyen_jours: 1.4,
    interventions_planifiees: [{ heure: '09h00', lieu: 'Chambre B102' }, { heure: '11h30', lieu: 'Cuisine collective' }, { heure: '14h00', lieu: 'WC 3e étage' }],
    tickets_recents: [
      { ref: 'Ti.260512-1567', statut: 'resolu', titre: 'Fuite lavabo' },
      { ref: 'Ti.260512-1558', statut: 'en_intervention', titre: 'WC bouché B204' },
      { ref: 'Ti.260512-1543', statut: 'resolu', titre: 'Robinetterie douche' },
    ],
  },
  'Leroy P.': {
    nom: 'LEROY', prenom: 'Paul', fonction: 'Électricien', service: 'Maintenance technique – Campus Sud',
    telephone: '+33 6 23 45 67 89', email: 'paul.leroy@crous-lyon.fr',
    photo: AGENT_PHOTOS['Leroy P.'],
    competences: ['⚡ Électricité', '🏢 Bâtiment', '❄️ CVC'],
    tickets_en_cours: 8, interventions_today: 5, retards: 0, temps_moyen_jours: 0.9,
    interventions_planifiees: [{ heure: '08h30', lieu: 'Tableau TGBT-A1' }, { heure: '10h00', lieu: 'Chambre C315' }, { heure: '15h30', lieu: 'Local technique' }],
    tickets_recents: [
      { ref: 'Ti.260512-1571', statut: 'affecte', titre: 'Disjoncteur déclenché' },
      { ref: 'Ti.260512-1562', statut: 'resolu', titre: 'Éclairage couloir HS' },
      { ref: 'Ti.260512-1548', statut: 'cloture', titre: 'Prise défaillante' },
    ],
  },
  'Bernard C.': {
    nom: 'CHAPRON', prenom: 'Claude', fonction: 'Chauffagiste', service: 'Maintenance technique – CVC',
    telephone: '+33 6 34 56 78 90', email: 'claude.chapron@crous-lyon.fr',
    photo: AGENT_PHOTOS['Bernard C.'],
    competences: ['🔥 Chauffage', '❄️ CVC', '🏢 Bâtiment'],
    tickets_en_cours: 15, interventions_today: 4, retards: 3, temps_moyen_jours: 2.1,
    interventions_planifiees: [{ heure: '07h30', lieu: 'Chaufferie principale' }, { heure: '11h00', lieu: 'Résidence Cavalier – Salle' }, { heure: '16h00', lieu: 'Contrôle chaudière' }],
    tickets_recents: [
      { ref: 'Ti.260512-1575', statut: 'en_intervention', titre: 'Chaudière en panne' },
      { ref: 'Ti.260512-1560', statut: 'resolu', titre: 'Radiateur froid B3' },
      { ref: 'Ti.260512-1552', statut: 'en_attente_validation', titre: 'Fuite circuit chauffage' },
    ],
  },
  'Laurent E.': {
    nom: 'EVRARD', prenom: 'Luc', fonction: 'Serruriste', service: 'Maintenance technique – Sécurité',
    telephone: '+33 6 45 67 89 01', email: 'luc.evrard@crous-lyon.fr',
    photo: AGENT_PHOTOS['Laurent E.'],
    competences: ['🔒 Serrurerie', '🏢 Bâtiment'],
    tickets_en_cours: 6, interventions_today: 2, retards: 0, temps_moyen_jours: 0.6,
    interventions_planifiees: [{ heure: '10h30', lieu: 'Entrée Bât. B' }, { heure: '14h00', lieu: 'Chambre A108' }],
    tickets_recents: [
      { ref: 'Ti.260512-1569', statut: 'resolu', titre: 'Serrure bloquée' },
      { ref: 'Ti.260512-1555', statut: 'affecte', titre: 'Badge non reconnu' },
    ],
  },
  'Michel G.': {
    nom: 'GARNIER', prenom: 'Michel', fonction: 'Agent polyvalent', service: 'Maintenance technique – Polyvalent',
    telephone: '+33 6 56 78 90 12', email: 'michel.garnier@crous-lyon.fr',
    photo: AGENT_PHOTOS['Michel G.'],
    competences: ['🏢 Bâtiment', '🔧 Plomberie', '🔒 Serrurerie', '⚡ Électricité'],
    tickets_en_cours: 20, interventions_today: 7, retards: 2, temps_moyen_jours: 1.8,
    interventions_planifiees: [{ heure: '08h00', lieu: 'Résidence Manu' }, { heure: '10h30', lieu: 'Cuisine collective' }, { heure: '13h30', lieu: 'Chambre F210' }, { heure: '16h30', lieu: 'Local vélos' }],
    tickets_recents: [
      { ref: 'Ti.260512-1580', statut: 'en_intervention', titre: 'Divers – Bâtiment A' },
      { ref: 'Ti.260512-1564', statut: 'resolu', titre: 'Joint défaillant' },
      { ref: 'Ti.260512-1550', statut: 'cloture', titre: 'Serrure cassée' },
    ],
  },
};

const PRESTATAIRE_LOGOS: Record<string, string | undefined> = {
  'SOCOTEC': logoSOCOTEC,
  'Thermocom': logoThermocom,
  'Dekra': logoDecra,
  'Apave': logoApave,
};

const PRESTATAIRE_DATA: Record<string, PrestataireInfo> = {
  'Plomberie Martin': {
    nom: 'Plomberie Martin', categorie: 'Plomberie', logo: undefined,
    contact_nom: 'MARTIN', contact_prenom: 'Sébastien', service: 'Intervention & dépannage',
    telephone: '+33 4 72 00 11 22', email: 'contact@plomberie-martin.fr',
    tickets_en_cours: 5, interventions_today: 2, retards: 0, temps_moyen_jours: 1.2,
    interventions_planifiees: [{ heure: '09h00', lieu: 'Résidence Cavalier – Chambre B102' }, { heure: '14h00', lieu: 'Cuisine collective' }],
    tickets_recents: [
      { ref: 'Ti.260512-1567', statut: 'resolu', titre: 'Fuite lavabo' },
      { ref: 'Ti.260512-1564', statut: 'resolu', titre: 'Changement robinetterie' },
      { ref: 'Ti.260512-1552', statut: 'en_intervention', titre: 'WC bouché' },
    ],
  },
  'Électricité Dupont': {
    nom: 'Électricité Dupont', categorie: 'Électricité', logo: undefined,
    contact_nom: 'DUPONT', contact_prenom: 'Franck', service: 'Électricité tertiaire',
    telephone: '+33 4 72 11 22 33', email: 'fdupont@electricite-dupont.fr',
    tickets_en_cours: 3, interventions_today: 1, retards: 1, temps_moyen_jours: 0.8,
    interventions_planifiees: [{ heure: '11h30', lieu: 'Tableau TGBT – Cavalier' }],
    tickets_recents: [
      { ref: 'Ti.260512-1571', statut: 'affecte', titre: 'Disjoncteur tableau' },
      { ref: 'Ti.260512-1560', statut: 'resolu', titre: 'Éclairage parking' },
    ],
  },
  'SOCOTEC': {
    nom: 'SOCOTEC', categorie: 'Bureau de contrôle', logo: logoSOCOTEC,
    contact_nom: 'RENARD', contact_prenom: 'Philippe', service: 'Contrôle réglementaire',
    telephone: '+33 4 78 00 33 44', email: 'p.renard@socotec.fr',
    tickets_en_cours: 2, interventions_today: 1, retards: 0, temps_moyen_jours: 3.5,
    interventions_planifiees: [{ heure: '10h00', lieu: 'Contrôle annuel – Cavalier' }],
    tickets_recents: [
      { ref: 'Ti.260512-1545', statut: 'cloture', titre: 'Vérification SSI' },
    ],
  },
  'Otis Ascenseurs': {
    nom: 'Otis Ascenseurs', categorie: 'Ascenseurs', logo: undefined,
    contact_nom: 'BLANC', contact_prenom: 'Thomas', service: 'Maintenance ascenseurs',
    telephone: '+33 4 78 44 55 66', email: 't.blanc@otis.com',
    tickets_en_cours: 4, interventions_today: 2, retards: 1, temps_moyen_jours: 1.6,
    interventions_planifiees: [{ heure: '08h30', lieu: 'Ascenseur Bât. B' }, { heure: '11h00', lieu: 'Ascenseur Bât. C' }],
    tickets_recents: [
      { ref: 'Ti.260512-1573', statut: 'en_intervention', titre: 'Panne ascenseur' },
      { ref: 'Ti.260512-1540', statut: 'resolu', titre: 'Maintenance préventive' },
    ],
  },
  'Thermidor CVC': {
    nom: 'Thermidor CVC', categorie: 'Chauffage / CVC', logo: undefined,
    contact_nom: 'LEMAIRE', contact_prenom: 'Denis', service: 'CVC & Froid',
    telephone: '+33 4 72 55 66 77', email: 'd.lemaire@thermidor-cvc.fr',
    tickets_en_cours: 7, interventions_today: 3, retards: 2, temps_moyen_jours: 2.3,
    interventions_planifiees: [{ heure: '09h00', lieu: 'Chaufferie Cavalier' }, { heure: '13h30', lieu: 'Armoire froide RU' }, { heure: '16h00', lieu: 'CTA-B2-01' }],
    tickets_recents: [
      { ref: 'Ti.260512-1575', statut: 'en_intervention', titre: 'Chaudière en panne' },
      { ref: 'Ti.260512-1559', statut: 'resolu', titre: 'Fuite circuit CVC' },
    ],
  },
  'Thermocom': {
    nom: 'Thermocom', categorie: 'Chauffage / CVC', logo: logoThermocom,
    contact_nom: 'PERRET', contact_prenom: 'Alain', service: 'Chauffage & régulation',
    telephone: '+33 4 72 88 99 00', email: 'a.perret@thermocom.fr',
    tickets_en_cours: 9, interventions_today: 4, retards: 1, temps_moyen_jours: 1.9,
    interventions_planifiees: [{ heure: '08h00', lieu: 'Résidence Manu – chaufferie' }, { heure: '11h30', lieu: 'Contrôle chaudière' }, { heure: '15h00', lieu: 'Vanne 3 voies' }],
    tickets_recents: [
      { ref: 'Ti.260512-1577', statut: 'affecte', titre: 'Thermostat défaillant' },
      { ref: 'Ti.260512-1562', statut: 'resolu', titre: 'Radiateur froid' },
    ],
  },
  'Sauvignet Élec.': {
    nom: 'Sauvignet Électricité', categorie: 'Électricité', logo: undefined,
    contact_nom: 'SAUVIGNET', contact_prenom: 'Marc', service: 'Électricité générale',
    telephone: '+33 4 78 22 33 44', email: 'm.sauvignet@sauvignet-elec.fr',
    tickets_en_cours: 4, interventions_today: 2, retards: 0, temps_moyen_jours: 1.1,
    interventions_planifiees: [{ heure: '09h30', lieu: 'Local TGBT – Cavalier' }, { heure: '14h30', lieu: 'Chambre E102' }],
    tickets_recents: [
      { ref: 'Ti.260512-1570', statut: 'en_intervention', titre: 'Court-circuit tableau' },
      { ref: 'Ti.260512-1555', statut: 'cloture', titre: 'Prise murale HS' },
    ],
  },
};

function getFallbackPrestataire(nom: string): PrestataireInfo {
  return {
    nom, categorie: 'Prestataire', logo: undefined,
    contact_nom: '', contact_prenom: 'Responsable',
    service: 'Service prestataire', telephone: '—', email: '—',
    tickets_en_cours: 2, interventions_today: 1, retards: 0, temps_moyen_jours: 1.5,
    interventions_planifiees: [],
    tickets_recents: [],
  };
}

function getFallbackAgent(nom: string): AgentInfo {
  return {
    nom: nom.split(' ')[1] ?? nom, prenom: nom.split(' ')[0] ?? '',
    fonction: 'Agent technique', service: 'Maintenance',
    telephone: '—', email: '—',
    competences: ['🏢 Bâtiment'],
    tickets_en_cours: 0, interventions_today: 0, retards: 0, temps_moyen_jours: 0,
    interventions_planifiees: [],
    tickets_recents: [],
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className={`flex flex-col items-center justify-center px-3 py-2.5 rounded-xl border ${color} text-center`}>
      <p className="text-lg font-black">{value}</p>
      <p className="text-[9px] font-bold uppercase tracking-wide opacity-70 leading-tight mt-0.5">{label}</p>
    </div>
  );
}

function TicketBadge({ statut }: { statut: StatutDI }) {
  const cfg = STATUT_DI_CFG[statut];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

const AGENT_ACTIONS = [
  { icon: UserPlus,     label: 'Affecter un co-intervenant',     color: 'text-blue-600 bg-blue-50 hover:bg-blue-100'       },
  { icon: PauseCircle,  label: 'Suspendre affectation',          color: 'text-amber-600 bg-amber-50 hover:bg-amber-100'    },
  { icon: Mail,         label: 'Envoyer un email',               color: 'text-slate-600 bg-slate-50 hover:bg-slate-100'    },
  { icon: BellRing,     label: 'Notifier "Urgence"',             color: 'text-red-600 bg-red-50 hover:bg-red-100'          },
  { icon: MessageCircle,label: 'Ouvrir chat interne',            color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
  { icon: StickyNote,   label: 'Lui ajouter une note',           color: 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' },
  { icon: HelpCircle,   label: 'Demander son avis',              color: 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100'       },
  { icon: ClipboardList,label: 'Créer nouvelle tâche',           color: 'text-teal-600 bg-teal-50 hover:bg-teal-100'       },
  { icon: ExternalLink, label: 'Voir fiche agent',               color: 'text-slate-600 bg-slate-50 hover:bg-slate-100'    },
];

const PRESTA_ACTIONS = [
  { icon: UserPlus,     label: 'Affecter un co-intervenant',     color: 'text-blue-600 bg-blue-50 hover:bg-blue-100'       },
  { icon: PauseCircle,  label: 'Suspendre affectation',          color: 'text-amber-600 bg-amber-50 hover:bg-amber-100'    },
  { icon: Mail,         label: 'Envoyer un email',               color: 'text-slate-600 bg-slate-50 hover:bg-slate-100'    },
  { icon: BellRing,     label: 'Notifier "Urgence"',             color: 'text-red-600 bg-red-50 hover:bg-red-100'          },
  { icon: StickyNote,   label: 'Lui ajouter une note',           color: 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' },
  { icon: HelpCircle,   label: 'Demander son avis',              color: 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100'       },
  { icon: ClipboardList,label: 'Créer nouvelle tâche',           color: 'text-teal-600 bg-teal-50 hover:bg-teal-100'       },
  { icon: ExternalLink, label: 'Voir fiche prestataire',         color: 'text-slate-600 bg-slate-50 hover:bg-slate-100'    },
];

// ─── Main sidecar ─────────────────────────────────────────────────────────────

export function AssigneSidecar({ assigneLabel, isAgent, onClose }: {
  assigneLabel: string;
  isAgent: boolean;
  onClose: () => void;
}) {
  const agent = isAgent ? (AGENT_DATA[assigneLabel] ?? getFallbackAgent(assigneLabel)) : null;
  const presta = !isAgent ? (PRESTATAIRE_DATA[assigneLabel] ?? getFallbackPrestataire(assigneLabel)) : null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-white shadow-2xl border-l border-slate-200 overflow-hidden"
        style={{ width: 380 }}
        onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-slate-100 bg-white">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              {isAgent && agent ? (
                agent.photo ? (
                  <img src={agent.photo} alt={assigneLabel} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 border-2 border-white shadow-md">
                    <User className="w-6 h-6 text-slate-500" />
                  </div>
                )
              ) : presta?.logo ? (
                <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-center flex-shrink-0 p-1">
                  <img src={presta.logo} alt={presta?.nom} className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200">
                  <Building2 className="w-7 h-7 text-slate-400" />
                </div>
              )}
              <div>
                {isAgent && agent ? (
                  <>
                    <p className="text-base font-black text-slate-800 leading-tight">
                      {agent.prenom} <span className="uppercase">{agent.nom}</span>
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{agent.fonction}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{agent.service}</p>
                  </>
                ) : (
                  <>
                    <p className="text-base font-black text-slate-800 leading-tight">{presta?.nom}</p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 mt-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {presta?.categorie}
                    </span>
                  </>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0 mt-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Contact info */}
          <div className="mt-3 space-y-1.5">
            {isAgent && agent ? (
              <>
                <a href={`tel:${agent.telephone}`} className="flex items-center gap-2 text-xs text-slate-600 hover:text-blue-600 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {agent.telephone}
                </a>
                <a href={`mailto:${agent.email}`} className="flex items-center gap-2 text-xs text-slate-600 hover:text-blue-600 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {agent.email}
                </a>
              </>
            ) : (
              <>
                <p className="flex items-center gap-2 text-xs text-slate-600">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold">{presta?.contact_prenom} {presta?.contact_nom}</span>
                  <span className="text-slate-400">– {presta?.service}</span>
                </p>
                <a href={`tel:${presta?.telephone}`} className="flex items-center gap-2 text-xs text-slate-600 hover:text-blue-600 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {presta?.telephone}
                </a>
                <a href={`mailto:${presta?.email}`} className="flex items-center gap-2 text-xs text-slate-600 hover:text-blue-600 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {presta?.email}
                </a>
              </>
            )}
          </div>

          {/* Competences (agent only) */}
          {isAgent && agent && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {agent.competences.map(c => (
                <span key={c} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Charge actuelle ── */}
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Charge actuelle</p>
            <div className="grid grid-cols-4 gap-2">
              <StatCard label="Tickets en cours" value={isAgent ? agent!.tickets_en_cours : presta!.tickets_en_cours}
                color="bg-blue-50 border-blue-100 text-blue-700" />
              <StatCard label="Aujourd'hui" value={isAgent ? agent!.interventions_today : presta!.interventions_today}
                color="bg-emerald-50 border-emerald-100 text-emerald-700" />
              <StatCard label="Retards" value={isAgent ? agent!.retards : presta!.retards}
                color={(isAgent ? agent!.retards : presta!.retards) > 0 ? 'bg-red-50 border-red-100 text-red-700' : 'bg-slate-50 border-slate-100 text-slate-500'} />
              <StatCard label="Moy. résol." value={`${isAgent ? agent!.temps_moyen_jours : presta!.temps_moyen_jours}j`}
                color="bg-amber-50 border-amber-100 text-amber-700" />
            </div>
          </div>

          {/* ── Interventions planifiées ── */}
          {(() => {
            const items = isAgent ? agent!.interventions_planifiees : presta!.interventions_planifiees;
            if (items.length === 0) return null;
            return (
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interventions planifiées</p>
                  <button className="text-[10px] text-blue-500 hover:text-blue-700 font-semibold flex items-center gap-0.5 transition-colors">
                    Voir planning <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-500 mb-1">Aujourd'hui</p>
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-[11px] font-bold text-slate-600 flex-shrink-0 w-12">{item.heure}</span>
                      <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="text-[11px] text-slate-600 truncate">{item.lieu}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ── Tickets récents ── */}
          {(() => {
            const tickets = isAgent ? agent!.tickets_recents : presta!.tickets_recents;
            if (tickets.length === 0) return null;
            return (
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Derniers tickets</p>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">{tickets.length}</span>
                  </div>
                  <button className="text-[10px] text-blue-500 hover:text-blue-700 font-semibold flex items-center gap-0.5 transition-colors">
                    Voir tous <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-2">
                  {tickets.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 py-2 px-2.5 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 cursor-pointer transition-colors group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-[10px] text-slate-400 font-bold">{t.ref}</span>
                          <TicketBadge statut={t.statut} />
                        </div>
                        <p className="text-xs font-semibold text-slate-700 truncate">{t.titre}</p>
                      </div>
                      <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-slate-500 flex-shrink-0 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ── Actions rapides ── */}
          <div className="px-5 py-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Actions rapides</p>
            <div className="space-y-1.5">
              {(isAgent ? AGENT_ACTIONS : PRESTA_ACTIONS).map((a, i) => {
                const Icon = a.icon;
                return (
                  <button key={i}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${a.color}`}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
