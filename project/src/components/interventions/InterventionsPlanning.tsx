import { useState, useMemo, useEffect, useRef, useCallback, type ReactNode } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, CalendarDays, CalendarRange,
  LayoutGrid, Filter, ChevronDown, ChevronUp, SlidersHorizontal,
  MapPin, Wrench, Tag, Building2, Folder, Search, X, Settings2,
  User, ClipboardList, CheckCircle2, ShieldAlert, Phone, Mail,
  Clock, FileText, Send, CheckSquare, Plus, AlertCircle, Loader2,
} from 'lucide-react';
import { ALL_SITES, ALL_RESIDENCES, EQUIP_CATS } from '../GedFilterBar';
import {
  CATEGORIES_DI, CRITICITE_CFG, STATUT_DI_CFG,
  type CriticiteDI, type StatutDI, fmtDateTimeFR,
} from './interventionsTypes';
import { supabase } from '../../lib/supabase';
import AssigneeFilterPanel, { type AssigneeSelection, EQUIPES } from '../reglementaire/AssigneeFilterPanel';
import logoApave          from '../../assets/logo-Apave.jpg';
import logoSocotec        from '../../assets/logo-SOCOTEC.png';
import logoDekra          from '../../assets/logo-Dekra.jpg';
import logoBureauVeritas  from '../../assets/logo-Bureau-Veritas.jpg';
import logoQualiconsult   from '../../assets/logo-Qualiconsult.jpg';
import logoSGS            from '../../assets/logo-SGS.jpg';
import logoAlpesControles from '../../assets/logo-Alpes-Controles.jpg';
import logoThermocom      from '../../assets/logo-Thermocom.svg';
import logoSabeko         from '../../assets/sabeko-logo.png';
import logoMsi            from '../../assets/logo-msi-blanc.png';
import logoSauvignet      from '../../assets/electricien-lyon-sauvignet.jpg';

// ── Org / Agent data (same as planning) ───────────────────────────────────────

const ORG_COLORS: Record<string, { logo?: string; bg: string; text: string; abbr: string }> = {
  'Atmeo':                    { logo: undefined,          bg: '#e65c00', text: '#fff', abbr: 'AT'  },
  'Thermocom':                { logo: logoThermocom,      bg: '#ff2941', text: '#fff', abbr: 'TC'  },
  'Sabeko':                   { logo: logoSabeko,         bg: '#1e3a5f', text: '#fff', abbr: 'SBK' },
  'MSI':                      { logo: logoMsi,            bg: '#111827', text: '#fff', abbr: 'MSI' },
  'Sauvignet':                { logo: logoSauvignet,      bg: '#1d4ed8', text: '#fff', abbr: 'SVG' },
  'APAVE':                    { logo: logoApave,          bg: '#4a9520', text: '#fff', abbr: 'AP'  },
  'SOCOTEC':                  { logo: logoSocotec,        bg: '#0099d8', text: '#fff', abbr: 'SO'  },
  'DEKRA':                    { logo: logoDekra,          bg: '#1a6b30', text: '#fff', abbr: 'DE'  },
  'Bureau Veritas':            { logo: logoBureauVeritas,  bg: '#8b7355', text: '#fff', abbr: 'BV'  },
  'QUALICONSULT':              { logo: logoQualiconsult,   bg: '#3c3c3c', text: '#fff', abbr: 'QU'  },
  'SGS':                      { logo: logoSGS,            bg: '#888580', text: '#fff', abbr: 'SG'  },
  'Alpes Contrôles':           { logo: logoAlpesControles, bg: '#cc0000', text: '#fff', abbr: 'AC'  },
  'SOCOTEC Diagnostic':        { logo: logoSocotec,        bg: '#0099d8', text: '#fff', abbr: 'SD'  },
  'Bureau Alliance Contrôle':  { logo: undefined,          bg: '#2563eb', text: '#fff', abbr: 'BAC' },
  'Acritec':                   { logo: undefined,          bg: '#7c3aed', text: '#fff', abbr: 'ACR' },
};

const AGENT_PHOTOS: Record<string, string> = {
  'Martin D.':  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'Leroy P.':   'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'Dupont A.':  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'Bernard C.': 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'Moreau F.':  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'Simon B.':   'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'Laurent E.': 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
  'Michel G.':  'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=1',
};

const ORGANISMES_LIST = Object.keys(ORG_COLORS);
const AGENTS_LIST     = Object.keys(AGENT_PHOTOS);

// ── Date fields ───────────────────────────────────────────────────────────────

const DATE_FIELDS = [
  { key: 'date_planifiee',   label: 'Date planifiée'     },
  { key: 'date_affectation', label: "Date d'affectation" },
  { key: 'date_resolution',  label: 'Date de résolution' },
  { key: 'created_at',       label: 'Date de création'   },
  { key: 'updated_at',       label: 'Date de modification' },
];

// ── Types ─────────────────────────────────────────────────────────────────────

type CalendarMode = 'month' | 'week' | 'year' | 'scheduler';

const STATUTS_KEYS  = Object.keys(STATUT_DI_CFG) as StatutDI[];
const CRITICITE_KEYS = Object.keys(CRITICITE_CFG) as CriticiteDI[];

interface PlanningEvent {
  id: string;
  date: Date;
  catIcon: string;
  catLabel: string;
  titre: string;
  statut: StatutDI;
  criticite: CriticiteDI;
  site: string;
  equipement: string;
  duree_estimee: number;      // minutes
  vehicule: string;
  temps_deplacement: number;  // minutes
  assignee: string;
  assigneeIsOrg: boolean;
  source_type?: 'intervention' | 'maintenance';
  source_id?: string;
  plan_nom?: string;
  plan_checklist?: { id: number; label: string; done: boolean }[];
}

// ── HSE rules by category ─────────────────────────────────────────────────────
type HseLevel = 'danger' | 'warning' | 'info';
interface HseRule { icon: string; text: string; level: HseLevel }
const HSE_RULES: Record<string, HseRule[]> = {
  'Électricité': [
    { icon: '⚡', text: 'Consignation obligatoire avant toute intervention', level: 'danger' },
    { icon: '🦺', text: 'Port de gants isolants classe 2 minimum obligatoire', level: 'danger' },
    { icon: '⚡', text: 'Vérification d\'absence de tension (VAT) requise avant tout contact', level: 'danger' },
    { icon: '⚠️', text: 'Balisage de la zone d\'intervention obligatoire', level: 'warning' },
    { icon: 'ℹ️', text: 'Consulter le DUER en cas de doute', level: 'info' },
  ],
  'Chauffage / CVC': [
    { icon: '🔥', text: 'Couper l\'alimentation gaz avant toute intervention', level: 'danger' },
    { icon: '🦺', text: 'Port d\'EPI thermiques obligatoire (gants, lunettes)', level: 'danger' },
    { icon: '⚠️', text: 'Vérifier l\'absence de fuite de gaz avant allumage', level: 'warning' },
    { icon: '⚠️', text: 'Balisage de la zone d\'intervention', level: 'warning' },
  ],
  'Plomberie': [
    { icon: '💧', text: 'Couper l\'alimentation en eau avant intervention', level: 'danger' },
    { icon: '🦺', text: 'Port d\'EPI étanchéité (gants imperméables)', level: 'warning' },
    { icon: '⚠️', text: 'Risque légionellose sur circuits eau chaude sanitaire', level: 'warning' },
    { icon: 'ℹ️', text: 'Purger le circuit après intervention', level: 'info' },
  ],
  'Sécurité incendie': [
    { icon: '🔥', text: 'Ne jamais neutraliser un détecteur sans autorisation', level: 'danger' },
    { icon: '🦺', text: 'Informer le gestionnaire avant toute intervention sur SSI', level: 'danger' },
    { icon: '⚠️', text: 'Vérifier la remise en service complète après intervention', level: 'warning' },
    { icon: 'ℹ️', text: 'Consigner l\'intervention dans le registre de sécurité', level: 'info' },
  ],
  'Ascenseur': [
    { icon: '⚡', text: 'Consignation électrique obligatoire', level: 'danger' },
    { icon: '🦺', text: 'Harnais anti-chute obligatoire en gaine', level: 'danger' },
    { icon: '⚠️', text: 'Signalisation hors service visible côté usagers', level: 'warning' },
    { icon: 'ℹ️', text: 'Tester la remontée de cabine avant remise en service', level: 'info' },
  ],
  'VMC / Ventilation': [
    { icon: '⚡', text: 'Consignation électrique du groupe moto-ventilateur', level: 'danger' },
    { icon: '🦺', text: 'Port de masque FFP2 lors du nettoyage de filtres', level: 'warning' },
    { icon: '⚠️', text: 'Risque chute en toiture — harnais obligatoire', level: 'warning' },
  ],
  'Serrurerie': [
    { icon: '⚠️', text: 'Vérifier l\'identité avant remplacement de serrure en logement', level: 'warning' },
    { icon: '🦺', text: 'Port de gants anti-coupures lors du meulage', level: 'warning' },
    { icon: 'ℹ️', text: 'Traçabilité des clés obligatoire', level: 'info' },
  ],
  'Menuiserie / Vitrerie': [
    { icon: '🦺', text: 'Port de gants anti-coupures obligatoire', level: 'danger' },
    { icon: '⚠️', text: 'Balisage zone de travail en hauteur', level: 'warning' },
    { icon: 'ℹ️', text: 'Éliminer les éclats de verre dans un conteneur rigide', level: 'info' },
  ],
  'Froid / Réfrigération': [
    { icon: '❄️', text: 'Risque de brûlure par le froid — EPI adaptés', level: 'danger' },
    { icon: '🦺', text: 'Travaux sur fluides frigorigènes : attestation obligatoire', level: 'danger' },
    { icon: '⚠️', text: 'Ventiler la zone en cas de fuite de frigorigène', level: 'warning' },
  ],
  'Nuisibles': [
    { icon: '🦺', text: 'Port de combinaison, gants et masque obligatoire', level: 'danger' },
    { icon: '⚠️', text: 'Conserver les fiches de données de sécurité des produits', level: 'warning' },
    { icon: 'ℹ️', text: 'Informer les occupants 48h avant traitement', level: 'info' },
  ],
  'Toiture / Étanchéité': [
    { icon: '⚠️', text: 'Harnais anti-chute obligatoire dès 2m de hauteur', level: 'danger' },
    { icon: '🦺', text: 'Accès toiture interdit par vents > 60 km/h', level: 'danger' },
    { icon: '⚠️', text: 'Balisage périmètre au sol obligatoire', level: 'warning' },
  ],
};
const HSE_DEFAULT: HseRule[] = [
  { icon: '🦺', text: 'Port des EPI adaptés obligatoire', level: 'warning' },
  { icon: '⚠️', text: 'Balisage de la zone d\'intervention', level: 'warning' },
  { icon: 'ℹ️', text: 'Consulter le DUER en cas de doute', level: 'info' },
];

// ── Default checklists by category ────────────────────────────────────────────
const DEFAULT_CHECKLISTS: Record<string, string[]> = {
  'Électricité': ['Consigner l\'installation', 'Vérifier absence de tension (VAT)', 'Réaliser le diagnostic', 'Effectuer la réparation', 'Tester le circuit', 'Lever la consignation'],
  'Chauffage / CVC': ['Couper alimentation gaz', 'Vérifier pression circuit (1,5 bar)', 'Diagnostiquer le problème', 'Réaliser la réparation', 'Tester l\'allumage', 'Contrôler l\'étanchéité'],
  'Plomberie': ['Couper alimentation eau', 'Protéger la zone', 'Diagnostiquer la fuite', 'Réaliser la réparation', 'Tester l\'étanchéité', 'Remettre en eau'],
  'Sécurité incendie': ['Informer le gestionnaire', 'Neutraliser le point concerné', 'Réaliser l\'intervention', 'Tester le fonctionnement', 'Remettre en service', 'Consigner dans le registre'],
  'VMC / Ventilation': ['Consigner le groupe VMC', 'Nettoyer / remplacer les filtres', 'Vérifier les gaines', 'Remettre sous tension', 'Contrôler les débits'],
  'Ascenseur': ['Consigner l\'ascenseur', 'Signaler hors service', 'Réaliser l\'intervention', 'Tester la remontée cabine', 'Remise en service'],
  'Serrurerie': ['Vérifier identité occupant', 'Déposer l\'ancienne serrure', 'Poser la nouvelle serrure', 'Tester le verrouillage', 'Remettre les clés'],
  'Menuiserie / Vitrerie': ['Sécuriser la zone', 'Déposer l\'élément défaillant', 'Poser le nouvel élément', 'Vérifier étanchéité', 'Nettoyer la zone'],
  'Froid / Réfrigération': ['Vérifier température', 'Contrôler le compresseur', 'Vérifier le niveau de frigorigène', 'Réaliser la réparation', 'Tester le refroidissement'],
  'Nuisibles': ['Préparer le traitement', 'Informer les occupants', 'Appliquer le traitement', 'Poser les pièges / appâts', 'Consigner l\'intervention'],
  'Toiture / Étanchéité': ['Baliser le périmètre', 'Accéder à la toiture (EPI)', 'Diagnostiquer l\'étanchéité', 'Réaliser les travaux', 'Tester l\'étanchéité', 'Nettoyer la zone'],
  'Nettoyage / Hygiène': ['Préparer les produits', 'Baliser la zone', 'Réaliser le nettoyage', 'Vérifier le résultat', 'Ranger le matériel'],
};

// ── Compte-rendu templates ─────────────────────────────────────────────────────
const CR_TEMPLATES = [
  'Intervention réalisée',
  'Problème constaté – non résolu',
  'Attente pièce / prestataire',
  'Travaux en 2 phases',
  'Demande d\'expertise',
  'Intervention reportée',
];

// ── Block field config ────────────────────────────────────────────────────────

export type BlockFieldKey = 'site' | 'equipement' | 'duree_estimee' | 'catLabel' | 'vehicule' | 'temps_deplacement' | 'titre';

export interface BlockFieldDef {
  key: BlockFieldKey;
  label: string;
  icon: string;
}

export const BLOCK_FIELDS: BlockFieldDef[] = [
  { key: 'site',              label: 'Site',                      icon: '📍' },
  { key: 'titre',             label: 'Libellé de l\'intervention', icon: '📝' },
  { key: 'equipement',        label: 'Équipement',                icon: '🔧' },
  { key: 'duree_estimee',     label: 'Durée estimée',             icon: '⏱' },
  { key: 'catLabel',          label: 'Catégorie',                 icon: '🏷' },
  { key: 'vehicule',          label: 'Véhicule utilisé',          icon: '🚗' },
  { key: 'temps_deplacement', label: 'Tps déplacement (aller)',   icon: '🛣' },
];

export const DEFAULT_BLOCK_FIELDS: BlockFieldKey[] = ['site', 'titre'];

// ── Deterministic helpers ─────────────────────────────────────────────────────

function detInt(seed: number, max: number) {
  const x = Math.sin(seed + 1) * 10000;
  return Math.floor((x - Math.floor(x)) * max);
}
function pickFrom<T>(arr: T[], seed: number): T { return arr[detInt(seed, arr.length)]; }

const SITES_MOCK = [
  'Campus Lyon Manufacture', 'Résidence Cavalier', 'Résidence Berlioz',
  'Résidence Albert Thomas', 'Résidence Bron', 'Résidence Mermoz',
];

const EQUIPEMENTS_MOCK = [
  'Chaudière gaz GAZ-003', 'CTA-B2-01', 'Ascenseur ASC-CES-01',
  'Tableau élec TGBT-A1', 'VMC double-flux VMC-03', 'Groupe froid GF-MANU-01',
  'Compteur EAU-04', 'SSI Central SSI-VOLT-01', 'Pompe PAC-02',
];

const VEHICULES_MOCK = [
  'VU Lyon-01', 'VU Lyon-02', 'Berline B-01', 'Vélo cargo', '—',
];

const TITRES_MOCK = [
  'Maintenance préventive annuelle', 'Remplacement filtre G4/F7',
  'Vérification réglementaire', 'Dépannage urgent',
  'Contrôle périodique', 'Mise en conformité',
  'Inspection de routine', 'Relevé de compteur',
  'Réglage et optimisation', 'Travaux de remplacement',
];

// Realistic targets: agents 10–25/week, prestataires 2–10/week
// A month has ~4.3 weeks → agents: 43–107, prestataires: 9–43 per org per month
// We generate per-assignee pools then merge.

function generateMockEvents(
  year: number, month: number,
  selectedDateFields: string[],
  selectedStatuts: Set<StatutDI>,
  selectedCriticites: Set<CriticiteDI>,
): PlanningEvent[] {
  if (selectedDateFields.length === 0) return [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const events: PlanningEvent[] = [];
  let evIdx = 0;

  const baseSeed = year * 100000 + (month + 1) * 500;

  // Generate events for agents (10–25 per week ≈ 43–107/month)
  AGENTS_LIST.forEach((agent, ai) => {
    const agentSeed = baseSeed + ai * 1000;
    // Target: 43–107 events, pick a count deterministically
    const count = 43 + detInt(agentSeed + 99, 65); // 43..107
    for (let i = 0; i < count; i++) {
      const seed      = agentSeed + i * 7;
      const cat       = pickFrom(CATEGORIES_DI, seed);
      const day       = 1 + detInt(seed + 2, daysInMonth);
      const statut    = pickFrom(STATUTS_KEYS, seed + 3);
      const criticite = pickFrom(CRITICITE_KEYS, seed + 6);
      const site      = pickFrom(SITES_MOCK, seed + 8);
      if (!selectedStatuts.has(statut)) continue;
      if (!selectedCriticites.has(criticite)) continue;
      events.push({
        id:                 `ag-${ai}-${evIdx++}`,
        date:               new Date(year, month, day),
        catIcon:            cat.icon,
        catLabel:           cat.label,
        titre:              pickFrom(TITRES_MOCK, seed + 9),
        statut,
        criticite,
        site,
        equipement:         pickFrom(EQUIPEMENTS_MOCK, seed + 10),
        duree_estimee:      [30, 60, 90, 120, 180, 240][detInt(seed + 11, 6)],
        vehicule:           pickFrom(VEHICULES_MOCK, seed + 12),
        temps_deplacement:  [0, 10, 15, 20, 30, 45][detInt(seed + 13, 6)],
        assignee:           agent,
        assigneeIsOrg:      false,
      });
    }
  });

  // Generate events for prestataires (2–10 per week ≈ 9–43/month)
  ORGANISMES_LIST.forEach((org, oi) => {
    const orgSeed = baseSeed + 800 + oi * 300;
    const count   = 9 + detInt(orgSeed + 77, 35); // 9..43
    for (let i = 0; i < count; i++) {
      const seed      = orgSeed + i * 11;
      const cat       = pickFrom(CATEGORIES_DI, seed);
      const day       = 1 + detInt(seed + 2, daysInMonth);
      const statut    = pickFrom(STATUTS_KEYS, seed + 3);
      const criticite = pickFrom(CRITICITE_KEYS, seed + 6);
      const site      = pickFrom(SITES_MOCK, seed + 8);
      if (!selectedStatuts.has(statut)) continue;
      if (!selectedCriticites.has(criticite)) continue;
      events.push({
        id:                 `org-${oi}-${evIdx++}`,
        date:               new Date(year, month, day),
        catIcon:            cat.icon,
        catLabel:           cat.label,
        titre:              pickFrom(TITRES_MOCK, seed + 9),
        statut,
        criticite,
        site,
        equipement:         pickFrom(EQUIPEMENTS_MOCK, seed + 10),
        duree_estimee:      [30, 60, 90, 120, 180, 240][detInt(seed + 11, 6)],
        vehicule:           pickFrom(VEHICULES_MOCK, seed + 12),
        temps_deplacement:  [0, 10, 15, 20, 30, 45][detInt(seed + 13, 6)],
        assignee:           org,
        assigneeIsOrg:      true,
      });
    }
  });

  return events;
}

// ── CSS colour helper (border class → hex) ────────────────────────────────────

function borderToHex(cls: string): string {
  const map: Record<string, string> = {
    'border-blue-50':    '#eff6ff',
    'border-blue-200':   '#bfdbfe',
    'border-orange-200': '#fed7aa',
    'border-sky-200':    '#bae6fd',
    'border-cyan-200':   '#a5f3fc',
    'border-yellow-200': '#fef08a',
    'border-emerald-200':'#a7f3d0',
    'border-slate-200':  '#e2e8f0',
    'border-red-200':    '#fecaca',
  };
  return map[cls] ?? '#94a3b8';
}

// ── AssigneeBadge ─────────────────────────────────────────────────────────────

function AssigneeBadge({ name, isOrg, size = 20 }: { name: string; isOrg: boolean; size?: number }) {
  const [err, setErr] = useState(false);
  if (isOrg) {
    const cfg  = ORG_COLORS[name];
    if (cfg?.logo && !err) {
      return (
        <img src={cfg.logo} alt={name}
          className="rounded object-contain flex-shrink-0 bg-white border border-slate-200"
          style={{ width: size, height: size, padding: 1 }}
          onError={() => setErr(true)} />
      );
    }
    const bg   = cfg?.bg   ?? '#64748b';
    const col  = cfg?.text ?? '#fff';
    const abbr = cfg?.abbr ?? name.slice(0, 2).toUpperCase();
    return (
      <span className="inline-flex items-center justify-center rounded flex-shrink-0 font-bold leading-none"
        style={{ width: size, height: size, background: bg, color: col, fontSize: Math.max(7, size * 0.32) }}>
        {abbr}
      </span>
    );
  }
  const photo = AGENT_PHOTOS[name];
  if (photo && !err) {
    return (
      <img src={photo} alt={name}
        className="rounded-full object-cover flex-shrink-0 border border-slate-200"
        style={{ width: size, height: size }}
        onError={() => setErr(true)} />
    );
  }
  const initials = name.split(/[\s.]+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <span className="inline-flex items-center justify-center rounded-full bg-slate-300 text-slate-700 font-bold leading-none flex-shrink-0"
      style={{ width: size, height: size, fontSize: Math.max(7, size * 0.38) }}>
      {initials}
    </span>
  );
}

// ── EventBlock ────────────────────────────────────────────────────────────────

function renderBlockField(ev: PlanningEvent, key: BlockFieldKey): string {
  switch (key) {
    case 'site':              return ev.site;
    case 'titre':             return ev.titre;
    case 'equipement':        return ev.equipement;
    case 'duree_estimee':     return ev.duree_estimee >= 60 ? `${Math.floor(ev.duree_estimee / 60)}h${ev.duree_estimee % 60 ? (ev.duree_estimee % 60) + 'min' : ''}` : `${ev.duree_estimee}min`;
    case 'catLabel':          return ev.catLabel;
    case 'vehicule':          return ev.vehicule;
    case 'temps_deplacement': return ev.temps_deplacement === 0 ? 'Sur place' : `${ev.temps_deplacement}min`;
    default:                  return '';
  }
}

function EventBlock({ ev, blockFields, onClick }: { ev: PlanningEvent; blockFields: BlockFieldKey[]; onClick?: (ev: PlanningEvent) => void }) {
  const statCfg = STATUT_DI_CFG[ev.statut];
  const critCfg = CRITICITE_CFG[ev.criticite];
  const isMaintenance = ev.source_type === 'maintenance';
  return (
    <div
      onClick={() => onClick?.(ev)}
      className={`rounded-md border-l-[3px] px-2 py-1 text-xs mb-0.5 overflow-hidden cursor-pointer hover:brightness-95 transition-all ${isMaintenance ? 'bg-emerald-50' : statCfg.bg}`}
      style={{ borderLeftColor: isMaintenance ? '#10b981' : borderToHex(statCfg.border) }}
    >
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-sm leading-none flex-shrink-0">{ev.catIcon}</span>
          <AssigneeBadge name={ev.assignee} isOrg={ev.assigneeIsOrg} size={18} />
        </div>
        {isMaintenance
          ? <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1 rounded flex-shrink-0">PM</span>
          : <span className="text-xs leading-none flex-shrink-0" title={critCfg.label}>{critCfg.icon}</span>
        }
      </div>
      <div className={`font-semibold truncate leading-tight ${isMaintenance ? 'text-emerald-700' : statCfg.text}`}>{ev.assignee || ev.titre}</div>
      {blockFields.map(key => (
        <div key={key} className="text-slate-500 truncate leading-tight text-[10px]">
          {renderBlockField(ev, key)}
        </div>
      ))}
    </div>
  );
}

// ── BlockFieldsPanel ──────────────────────────────────────────────────────────

function BlockFieldsPanel({ selected, onChange, onClose }: {
  selected: BlockFieldKey[];
  onChange: (keys: BlockFieldKey[]) => void;
  onClose: () => void;
}) {
  const toggle = (key: BlockFieldKey) => {
    const next = selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key];
    onChange(next);
  };

  return (
    <div className="absolute right-0 top-full mt-1 z-[200] bg-white rounded-xl shadow-xl border border-slate-200 w-64 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100 bg-slate-50">
        <span className="text-xs font-semibold text-slate-700">Champs affichés dans les blocs</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="py-1">
        {BLOCK_FIELDS.map(f => {
          const active = selected.includes(f.key);
          return (
            <label key={f.key}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors">
              <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
                ${active ? 'bg-blue-500 border-blue-500' : 'border-slate-300 bg-white'}`}>
                {active && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10">
                    <path d="M1 5l3 3 5-5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              <input type="checkbox" className="sr-only" checked={active} onChange={() => toggle(f.key)} />
              <span className="text-sm mr-1">{f.icon}</span>
              <span className="text-xs text-slate-700 flex-1">{f.label}</span>
            </label>
          );
        })}
      </div>
      {selected.length > 0 && (
        <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">{selected.length} champ{selected.length > 1 ? 's' : ''} sélectionné{selected.length > 1 ? 's' : ''}</span>
          <button onClick={() => onChange([])} className="text-[11px] text-red-500 hover:text-red-600">Effacer</button>
        </div>
      )}
    </div>
  );
}

// ── Calendar constants ────────────────────────────────────────────────────────

const MONTH_NAMES = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAY_LABELS  = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

// ── MonthGrid ─────────────────────────────────────────────────────────────────

function MonthGrid({ year, month, events, onNavigate, onEventClick, onSlotClick, blockFields }: {
  year: number; month: number; events: PlanningEvent[];
  onNavigate: (delta: number) => void;
  onEventClick?: (ev: PlanningEvent) => void;
  onSlotClick?: (date: Date) => void;
  blockFields?: BlockFieldKey[];
}) {
  const today     = new Date();
  const firstDay  = new Date(year, month, 1);
  const startDow  = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsByDay = useMemo(() => {
    const map = new Map<number, PlanningEvent[]>();
    events.forEach(ev => {
      const d = ev.date.getDate();
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(ev);
    });
    return map;
  }, [events]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0 border-b border-slate-100">
        <button onClick={() => onNavigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <span className="text-sm font-semibold text-slate-700">{MONTH_NAMES[month]} {year}</span>
        <button onClick={() => onNavigate(1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>
      <div className="grid grid-cols-7 border-b border-slate-100 flex-shrink-0">
        {DAY_LABELS.map(d => (
          <div key={d} className="px-2 py-1.5 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 overflow-auto"
        style={{ gridTemplateRows: `repeat(${cells.length / 7}, minmax(110px, 1fr))` }}>
        {cells.map((day, idx) => {
          const isToday   = day !== null && new Date(year, month, day).toDateString() === today.toDateString();
          const dayEvents = day ? (eventsByDay.get(day) ?? []) : [];
          const MAX_VISIBLE = 3;
          const overflow    = dayEvents.length - MAX_VISIBLE;
          return (
            <div key={idx}
              onClick={() => day && onSlotClick?.(new Date(year, month, day, 9, 0))}
              className={`border-r border-b border-slate-100 p-1 min-h-0 overflow-hidden
                ${!day ? 'bg-slate-50/40' : 'bg-white hover:bg-blue-50/30 transition-colors cursor-pointer'}`}>
              {day && (
                <>
                  <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0
                    ${isToday ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>
                    {day}
                  </div>
                  {dayEvents.slice(0, MAX_VISIBLE).map(ev => <EventBlock key={ev.id} ev={ev} blockFields={blockFields ?? []} onClick={onEventClick} />)}
                  {overflow > 0 && (
                    <div className="text-[10px] text-slate-400 font-medium pl-1">+{overflow} de plus</div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── WeekGrid ──────────────────────────────────────────────────────────────────

// Hour slots: 7h–20h. Lunch break 12h30–13h30 greyed out.
const WEEK_HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7..20
const HOUR_H = 64; // px per hour slot
const LUNCH_START = 12.5; // 12h30
const LUNCH_END   = 13.5; // 13h30

// AM: 8h–12h (slots at 8, 9, 10, 11, 12), PM: 14h–17h (slots at 14, 15, 16, 17)
const AM_SLOTS = [8, 9, 10, 11, 12];
const PM_SLOTS = [14, 15, 16, 17];
const ALL_SLOTS = [...AM_SLOTS, ...PM_SLOTS]; // 9 distinct slots

// Assign a deterministic hour based on the event's own id hash, NOT its index in the day.
// This ensures the hour is stable across re-renders and evenly distributed.
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function assignHour(evId: string): number {
  return ALL_SLOTS[hashStr(evId) % ALL_SLOTS.length];
}

function WeekGrid({ year, month, week, events, onNavigate, blockFields, onBlockFieldsChange, onEventClick, onSlotClick }: {
  year: number; month: number; week: number; events: PlanningEvent[];
  onNavigate: (delta: number) => void;
  blockFields: BlockFieldKey[];
  onBlockFieldsChange: (keys: BlockFieldKey[]) => void;
  onEventClick?: (ev: PlanningEvent) => void;
  onSlotClick?: (date: Date) => void;
}) {
  const [showFieldsPanel, setShowFieldsPanel] = useState(false);
  const [showWeekends, setShowWeekends] = useState(false);
  const fieldsPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (fieldsPanelRef.current && !fieldsPanelRef.current.contains(e.target as Node)) {
        setShowFieldsPanel(false);
      }
    };
    if (showFieldsPanel) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showFieldsPanel]);
  const firstDay = new Date(year, month, 1);
  const firstMon = new Date(firstDay);
  const dow = (firstDay.getDay() + 6) % 7;
  firstMon.setDate(1 - dow + week * 7);

  const allDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(firstMon);
    d.setDate(firstMon.getDate() + i);
    return d;
  });
  const days = showWeekends ? allDays : allDays.filter(d => d.getDay() !== 0 && d.getDay() !== 6);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, PlanningEvent[]>();
    events.forEach(ev => {
      const k = ev.date.toDateString();
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(ev);
    });
    return map;
  }, [events]);

  const today = new Date();
  const weekLabel = `${days[0].getDate()} ${MONTH_NAMES[days[0].getMonth()].slice(0,3)} – ${days[days.length - 1].getDate()} ${MONTH_NAMES[days[days.length - 1].getMonth()].slice(0,3)} ${year}`;

  const totalH = WEEK_HOURS.length * HOUR_H;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Nav header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 flex-shrink-0 gap-2">
        <button onClick={() => onNavigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <span className="text-sm font-semibold text-slate-700 flex-1 text-center">{weekLabel}</span>
        <button onClick={() => onNavigate(1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
        {/* Block fields config */}
        <div className="relative" ref={fieldsPanelRef}>
          <button
            onClick={() => setShowFieldsPanel(v => !v)}
            title="Configurer les champs affichés dans les blocs"
            className={`p-1.5 rounded-lg transition-colors ${showFieldsPanel ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-100 text-slate-500'}`}
          >
            <Settings2 className="w-4 h-4" />
          </button>
          {showFieldsPanel && (
            <BlockFieldsPanel
              selected={blockFields}
              onChange={onBlockFieldsChange}
              onClose={() => setShowFieldsPanel(false)}
            />
          )}
        </div>
        {/* Weekend toggle */}
        <button
          onClick={() => setShowWeekends(v => !v)}
          title={showWeekends ? 'Masquer les week-ends' : 'Afficher les week-ends'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${showWeekends ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600'}`}>
          <CalendarDays className="w-3.5 h-3.5" />
          {showWeekends ? 'Sam/Dim' : 'Sam/Dim'}
        </button>
      </div>

      {/* Day headers */}
      <div className="flex border-b border-slate-100 flex-shrink-0">
        <div className="w-12 flex-shrink-0 border-r border-slate-100" /> {/* gutter */}
        {days.map(d => {
          const isToday = d.toDateString() === today.toDateString();
          const isCurrentMonth = d.getMonth() === month;
          return (
            <div key={d.toISOString()} className="flex-1 text-center py-2 border-r border-slate-100 last:border-r-0">
              <div className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-400'}`}>
                {DAY_LABELS[(d.getDay() + 6) % 7]}
              </div>
              <div className={`text-base font-bold w-8 h-8 flex items-center justify-center rounded-full mx-auto
                ${isToday ? 'bg-blue-600 text-white' : !isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}`}>
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex flex-1 overflow-auto">
        {/* Hour labels */}
        <div className="w-12 flex-shrink-0 relative border-r border-slate-100" style={{ height: totalH }}>
          {WEEK_HOURS.map(h => (
            <div key={h} className="absolute w-full flex items-start justify-end pr-1.5" style={{ top: (h - 7) * HOUR_H, height: HOUR_H }}>
              <span className="text-[10px] text-slate-400 mt-0.5 leading-none">{h}h</span>
            </div>
          ))}
          {/* Lunch band label */}
          <div className="absolute left-0 right-0 flex items-center justify-center"
            style={{ top: (LUNCH_START - 7) * HOUR_H, height: (LUNCH_END - LUNCH_START) * HOUR_H }}>
            <span className="text-[9px] text-slate-400 rotate-[-90deg] whitespace-nowrap">Repas</span>
          </div>
        </div>

        {/* Day columns */}
        {days.map(d => {
          const isCurrentMonth = d.getMonth() === month;
          const dayEvs = eventsByDay.get(d.toDateString()) ?? [];
          // Group events by assigned hour slot
          const byHour = new Map<number, PlanningEvent[]>();
          dayEvs.forEach(ev => {
            const h = assignHour(ev.id);
            if (!byHour.has(h)) byHour.set(h, []);
            byHour.get(h)!.push(ev);
          });

          return (
            <div key={d.toISOString()}
              className={`flex-1 relative border-r border-slate-100 last:border-r-0 ${!isCurrentMonth ? 'bg-slate-50/30' : ''} group`}
              style={{ height: totalH }}
              onClick={e => {
                if (!onSlotClick) return;
                const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                const y = e.clientY - rect.top;
                const totalMinutes = (y / totalH) * WEEK_HOURS.length * 60;
                const baseMinutes = WEEK_HOURS[0] * 60;
                const absoluteMin = baseMinutes + totalMinutes;
                const hour = Math.floor(absoluteMin / 60);
                const min  = Math.floor((absoluteMin % 60) / 30) * 30;
                const slot = new Date(d);
                slot.setHours(hour, min, 0, 0);
                onSlotClick(slot);
              }}>

              {/* Hour lines */}
              {WEEK_HOURS.map(h => {
                const isLunch = h >= LUNCH_START && h < LUNCH_END;
                return (
                  <div key={h}
                    className={`absolute left-0 right-0 border-t border-slate-100 ${isLunch ? 'bg-slate-100/70' : ''}`}
                    style={{ top: (h - 7) * HOUR_H, height: HOUR_H }} />
                );
              })}

              {/* Hover hint line */}
              <div className="absolute left-0 right-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ top: 0, height: '100%' }}>
                <div className="absolute inset-0 bg-blue-50/20" />
              </div>

              {/* Lunch band overlay */}
              <div className="absolute left-0 right-0 bg-slate-200/40 border-t border-b border-slate-200/60 pointer-events-none"
                style={{ top: (LUNCH_START - 7) * HOUR_H, height: (LUNCH_END - LUNCH_START) * HOUR_H }} />

              {/* Events */}
              {Array.from(byHour.entries()).map(([h, evs]) => (
                <div key={h} className="absolute left-0.5 right-0.5 space-y-0.5 overflow-hidden"
                  style={{ top: (h - 7) * HOUR_H + 2, maxHeight: HOUR_H - 4 }}
                  onClick={e => e.stopPropagation()}>
                  {evs.map(ev => <EventBlock key={ev.id} ev={ev} blockFields={blockFields} onClick={onEventClick} />)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── YearGrid ──────────────────────────────────────────────────────────────────

function YearGrid({ year, events, onNavigate, onMonthClick }: {
  year: number; events: PlanningEvent[];
  onNavigate: (delta: number) => void;
  onMonthClick: (month: number) => void;
}) {
  const today = new Date();
  const countsByMonth = useMemo(() => {
    const map: Record<number, { statuts: Record<string, number>; total: number }> = {};
    for (let m = 0; m < 12; m++) map[m] = { statuts: {}, total: 0 };
    events.forEach(ev => {
      if (ev.date.getFullYear() !== year) return;
      const m = ev.date.getMonth();
      map[m].total++;
      map[m].statuts[ev.statut] = (map[m].statuts[ev.statut] ?? 0) + 1;
    });
    return map;
  }, [events, year]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 flex-shrink-0">
        <button onClick={() => onNavigate(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <span className="text-sm font-semibold text-slate-700">{year}</span>
        <button onClick={() => onNavigate(1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-3 gap-4 md:grid-cols-4">
          {MONTH_NAMES.map((name, mi) => {
            const data = countsByMonth[mi];
            const isCurrentMonth = mi === today.getMonth() && year === today.getFullYear();
            return (
              <button key={mi} onClick={() => onMonthClick(mi)}
                className={`rounded-xl border p-3 text-left hover:border-blue-300 hover:shadow-sm transition-all
                  ${isCurrentMonth ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                <div className={`text-xs font-semibold mb-2 ${isCurrentMonth ? 'text-blue-700' : 'text-slate-600'}`}>{name}</div>
                {data.total === 0 ? (
                  <div className="text-xs text-slate-300">—</div>
                ) : (
                  <div className="space-y-1">
                    {Object.entries(data.statuts).slice(0, 3).map(([s, n]) => {
                      const cfg = STATUT_DI_CFG[s as StatutDI];
                      if (!cfg) return null;
                      return (
                        <div key={s} className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                          <span className="text-xs text-slate-500 truncate">{n} {cfg.label}</span>
                        </div>
                      );
                    })}
                    <div className="text-xs font-semibold text-slate-600 mt-1">{data.total} total</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── SchedulerView ─────────────────────────────────────────────────────────────

type SchedulerPeriod = 'month' | 'week' | 'day';

function SchedulerView({ year, month, events, onNavigate }: {
  year: number; month: number; events: PlanningEvent[];
  onNavigate: (delta: number) => void;
}) {
  const [period, setPeriod] = useState<SchedulerPeriod>('month');
  const [weekOffset, setWeekOffset] = useState(0);  // weeks relative to month start
  const [dayDate, setDayDate] = useState(() => new Date());

  const today = new Date();

  // Build the days array depending on period
  const days = useMemo(() => {
    if (period === 'month') {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
    }
    if (period === 'week') {
      const firstDay = new Date(year, month, 1);
      const dow = (firstDay.getDay() + 6) % 7;
      const firstMon = new Date(year, month, 1 - dow + weekOffset * 7);
      return Array.from({ length: 7 }, (_, i) => { const d = new Date(firstMon); d.setDate(firstMon.getDate() + i); return d; });
    }
    // day
    return [dayDate];
  }, [period, year, month, weekOffset, dayDate]);

  const periodLabel = () => {
    if (period === 'month') return `${MONTH_NAMES[month]} ${year}`;
    if (period === 'week') {
      const d0 = days[0], d1 = days[days.length - 1];
      return `${d0.getDate()} ${MONTH_NAMES[d0.getMonth()].slice(0,3)} – ${d1.getDate()} ${MONTH_NAMES[d1.getMonth()].slice(0,3)} ${d1.getFullYear()}`;
    }
    return dayDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const navigatePeriod = (delta: number) => {
    if (period === 'month') { onNavigate(delta); setWeekOffset(0); }
    else if (period === 'week') setWeekOffset(w => w + delta);
    else setDayDate(d => { const nd = new Date(d); nd.setDate(nd.getDate() + delta); return nd; });
  };

  const rows = useMemo(() => {
    const relevantEvs = events.filter(ev => days.some(d => d.toDateString() === ev.date.toDateString()));
    const map = new Map<string, { isOrg: boolean; events: PlanningEvent[] }>();
    relevantEvs.forEach(ev => {
      if (!map.has(ev.assignee)) map.set(ev.assignee, { isOrg: ev.assigneeIsOrg, events: [] });
      map.get(ev.assignee)!.events.push(ev);
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(0, 20);
  }, [events, days]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 flex-shrink-0 gap-3">
        <button onClick={() => navigatePeriod(-1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <span className="text-sm font-semibold text-slate-700 capitalize flex-1 text-center">Planificateur — {periodLabel()}</span>
        <button onClick={() => navigatePeriod(1)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0">
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
        {/* Period toggle */}
        <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5 flex-shrink-0">
          {([['month','Mois'],['week','Semaine'],['day','Jour']] as [SchedulerPeriod,string][]).map(([k, l]) => (
            <button key={k} onClick={() => { setPeriod(k); setWeekOffset(0); }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${period === k ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse" style={{ minWidth: `${180 + days.length * 36}px` }}>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white border-b border-r border-slate-100 px-3 py-2 text-left text-xs font-semibold text-slate-500 w-44">
                Assigné
              </th>
              {days.map(d => {
                const isToday   = d.toDateString() === today.toDateString();
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <th key={d.toISOString()}
                    className={`border-b border-r border-slate-100 px-1 py-2 text-center text-xs font-medium min-w-[36px]
                      ${isToday ? 'bg-blue-50 text-blue-700' : isWeekend ? 'bg-slate-50 text-slate-400' : 'text-slate-500'}`}>
                    <div>{d.getDate()}</div>
                    <div className="text-[9px] opacity-60">{DAY_LABELS[(d.getDay() + 6) % 7].slice(0,1)}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map(([assignee, { isOrg, events: evs }]) => {
              const evByDay = new Map<string, PlanningEvent[]>();
              evs.forEach(ev => {
                const k = ev.date.toDateString();
                if (!evByDay.has(k)) evByDay.set(k, []);
                evByDay.get(k)!.push(ev);
              });
              return (
                <tr key={assignee} className="hover:bg-slate-50/50 transition-colors">
                  <td className="sticky left-0 z-10 bg-white border-b border-r border-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <AssigneeBadge name={assignee} isOrg={isOrg} size={22} />
                      <span className="truncate max-w-[110px]">{assignee}</span>
                    </div>
                  </td>
                  {days.map(d => {
                    const dayEvs    = evByDay.get(d.toDateString()) ?? [];
                    const isToday   = d.toDateString() === today.toDateString();
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    return (
                      <td key={d.toISOString()}
                        className={`border-b border-r border-slate-100 px-0.5 py-0.5 text-center align-middle
                          ${isToday ? 'bg-blue-50/40' : isWeekend ? 'bg-slate-50/40' : ''}`}>
                        <div className="flex flex-wrap gap-0.5 justify-center">
                          {dayEvs.map(ev => {
                            const cfg = STATUT_DI_CFG[ev.statut];
                            return (
                              <div key={ev.id}
                                className={`w-6 h-6 rounded flex items-center justify-center text-xs cursor-pointer
                                  hover:scale-110 transition-transform ${cfg.bg} border`}
                                style={{ borderColor: borderToHex(cfg.border) }}
                                title={`${ev.catLabel} — ${ev.site}\n${ev.assignee}\n${CRITICITE_CFG[ev.criticite].label}`}>
                                {ev.catIcon}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={days.length + 1} className="py-12 text-center text-sm text-slate-400">
                  Aucune intervention. Sélectionnez au moins un champ date.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Dropdown wrapper ──────────────────────────────────────────────────────────

function PlanningDropdown({ trigger, children, width = 300 }: {
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
        <div className="absolute left-0 top-full mt-1 z-[100] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
          style={{ width }}>
          {children}
        </div>
      )}
    </div>
  );
}

function PlanningFilterBtn({ icon, label, count, active }: {
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

// ── SitePicker ────────────────────────────────────────────────────────────────

function SitePicker({ selectedSiteIds, selectedResIds, onChange }: {
  selectedSiteIds: string[];
  selectedResIds:  string[];
  onChange: (siteIds: string[], resIds: string[]) => void;
}) {
  const [search, setSearch]   = useState('');
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
    const removing = selectedSiteIds.includes(id);
    const nextSite = removing ? selectedSiteIds.filter(x => x !== id) : [...selectedSiteIds, id];
    const siteResIds = ALL_RESIDENCES.filter(r => r.siteId === id).map(r => r.id);
    const nextRes  = removing ? selectedResIds.filter(r => !siteResIds.includes(r)) : selectedResIds;
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
          const residences  = ALL_RESIDENCES.filter(r => r.siteId === site.id);
          const isExpanded  = expanded.has(site.id) || !!search;
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
      {total > 0 && (
        <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">{total} sélectionné{total > 1 ? 's' : ''}</span>
          <button onClick={() => onChange([], [])} className="text-[11px] text-red-500 hover:text-red-600">Effacer</button>
        </div>
      )}
    </div>
  );
}

// ── EquipPicker ───────────────────────────────────────────────────────────────

function EquipPicker({ selectedCats, selectedSubCats, onChange }: {
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
          const isExpanded   = expanded.has(categorie) || !!search;
          const catSelected  = selectedCats.includes(categorie);
          const someSubSel   = sousCats.some(s => selectedSubCats.includes(s));
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

// ── CatDIPicker (CATEGORIES_DI) ───────────────────────────────────────────────

function CatDIPicker({ selected, onChange }: {
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
            <div key={cat.key} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
              onClick={() => toggle(cat.key)}>
              <input type="checkbox" checked={active} onChange={() => toggle(cat.key)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 cursor-pointer flex-shrink-0" />
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

// ── DateFieldsPicker ──────────────────────────────────────────────────────────

function DateFieldsPicker({ selected, onChange }: {
  selected: string[]; onChange: (f: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const toggle = (key: string) =>
    onChange(selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key]);

  const label = selected.length === 0
    ? 'Choisir les champs dates...'
    : selected.length === 1 ? DATE_FIELDS.find(f => f.key === selected[0])?.label
    : `${selected.length} champs sélectionnés`;

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg bg-white text-sm hover:border-blue-300 transition-all min-w-[220px]">
        <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span className="flex-1 text-left text-slate-600 truncate text-xs">{label}</span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 min-w-[260px]">
          {DATE_FIELDS.map(f => (
            <label key={f.key} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors">
              <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
                ${selected.includes(f.key) ? 'bg-blue-500 border-blue-500' : 'border-slate-300 bg-white'}`}>
                {selected.includes(f.key) && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10">
                    <path d="M1 5l3 3 5-5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              <input type="checkbox" className="sr-only" checked={selected.includes(f.key)} onChange={() => toggle(f.key)} />
              <span className="text-sm text-slate-700">{f.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ── FilterBar (statut + criticité) ────────────────────────────────────────────

function FilterBar({ activeStatuts, onToggleStatut, activeCriticites, onToggleCriticite }: {
  activeStatuts: Set<StatutDI>; onToggleStatut: (s: StatutDI) => void;
  activeCriticites: Set<CriticiteDI>; onToggleCriticite: (c: CriticiteDI) => void;
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1 text-xs text-slate-400 font-medium flex-shrink-0">
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Filtrer :
      </div>

      {/* Statuts */}
      <div className="flex items-center gap-1 flex-wrap">
        {STATUTS_KEYS.map(key => {
          const cfg    = STATUT_DI_CFG[key];
          const active = activeStatuts.has(key);
          return (
            <button key={key} type="button" onClick={() => onToggleStatut(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all
                ${active ? `${cfg.bg} ${cfg.text} border-current opacity-100` : 'bg-white text-slate-400 border-slate-200 opacity-60 hover:opacity-80'}`}>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
              {cfg.label}
            </button>
          );
        })}
      </div>

      <div className="w-px h-4 bg-slate-200 flex-shrink-0" />

      {/* Criticités */}
      <div className="flex items-center gap-1 flex-wrap">
        {CRITICITE_KEYS.map(key => {
          const cfg    = CRITICITE_CFG[key];
          const active = activeCriticites.has(key);
          return (
            <button key={key} type="button" onClick={() => onToggleCriticite(key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all
                ${active ? `${cfg.bg} ${cfg.text} border-current opacity-100` : 'bg-white text-slate-400 border-slate-200 opacity-60 hover:opacity-80'}`}>
              <span className="leading-none">{cfg.icon}</span>
              {cfg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Calendar mode config ──────────────────────────────────────────────────────

const CAL_MODES: { key: CalendarMode; label: string; Icon: React.ElementType }[] = [
  { key: 'month',     label: 'Mois',         Icon: Calendar      },
  { key: 'week',      label: 'Semaine',       Icon: CalendarDays  },
  { key: 'year',      label: 'Année',         Icon: CalendarRange },
  { key: 'scheduler', label: 'Planificateur', Icon: LayoutGrid    },
];

// ── QuickCreateModal ──────────────────────────────────────────────────────────

function fmt2(n: number) { return String(n).padStart(2, '0'); }
function toDateInput(d: Date) { return `${d.getFullYear()}-${fmt2(d.getMonth()+1)}-${fmt2(d.getDate())}`; }
function toTimeInput(d: Date) { return `${fmt2(d.getHours())}:${fmt2(d.getMinutes())}`; }

const CATS_QUICK = [
  'Plomberie', 'Électricité', 'Chauffage / CVC', 'Serrurerie',
  'Menuiserie', 'Peinture', 'Nettoyage', 'Informatique', 'Autre',
];

interface QuickCreateModalProps {
  initialDate: Date;
  onClose: () => void;
  onCreated: () => void;
}

function QuickCreateModal({ initialDate, onClose, onCreated }: QuickCreateModalProps) {
  const [titre,      setTitre]      = useState('');
  const [dateVal,    setDateVal]    = useState(toDateInput(initialDate));
  const [timeVal,    setTimeVal]    = useState(toTimeInput(initialDate));
  const [categorie,  setCategorie]  = useState('');
  const [criticite,  setCriticite]  = useState<'faible'|'moyenne'|'haute'|'critique'>('moyenne');
  const [siteId,     setSiteId]     = useState('');
  const [residenceId,setResidenceId]= useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  const filteredResidences = ALL_RESIDENCES.filter(r => !siteId || r.siteId === siteId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titre.trim()) { setError('Le titre est obligatoire.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const { count } = await supabase.from('interventions').select('*', { count: 'exact', head: true });
      const num = String((count ?? 0) + 1).padStart(5, '0');
      const reference = `DI-${new Date().getFullYear()}-${num}`;

      const datePlanifiee = dateVal && timeVal ? new Date(`${dateVal}T${timeVal}`).toISOString() : null;
      const slaMap = { critique: 4, haute: 8, moyenne: 48, faible: 72 };

      const { data: inserted, error: err } = await supabase.from('interventions').insert([{
        reference,
        titre: titre.trim(),
        type_intervention: 'maintenance_corrective',
        categorie:  categorie || null,
        criticite,
        sla_heures: slaMap[criticite],
        statut: 'en_cours',
        statut_demande: 'nouveau',
        canal_source: 'interne',
        demandeur_type: 'interne',
        site_id: siteId || null,
        residence_id: residenceId || null,
        date_planifiee: datePlanifiee,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]).select('id').single();

      if (err) throw err;

      await supabase.from('historique_intervention').insert([{
        intervention_id: inserted.id,
        type_evenement: 'creation',
        description: `Demande créée depuis le planning pour le ${dateVal} à ${timeVal}`,
        auteur: 'Planning',
      }]);

      onCreated();
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'Erreur lors de la création.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Nouvelle intervention</p>
              <p className="text-blue-200 text-[11px]">Création rapide depuis le planning</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Date + Heure */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
              <input type="date" value={dateVal} onChange={e => setDateVal(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Heure</label>
              <input type="time" value={timeVal} onChange={e => setTimeVal(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Titre <span className="text-red-400">*</span></label>
            <input
              type="text"
              placeholder="Ex: Fuite robinet, Panne électrique..."
              value={titre}
              onChange={e => setTitre(e.target.value)}
              autoFocus
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Catégorie + Criticité */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Catégorie</label>
              <select value={categorie} onChange={e => setCategorie(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">— Choisir —</option>
                {CATS_QUICK.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Criticité</label>
              <select value={criticite} onChange={e => setCriticite(e.target.value as any)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="faible">Faible</option>
                <option value="moyenne">Moyenne</option>
                <option value="haute">Haute</option>
                <option value="critique">Critique</option>
              </select>
            </div>
          </div>

          {/* Site + Résidence */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Site</label>
              <select value={siteId} onChange={e => { setSiteId(e.target.value); setResidenceId(''); }}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">— Optionnel —</option>
                {ALL_SITES.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Résidence</label>
              <select value={residenceId} onChange={e => setResidenceId(e.target.value)}
                disabled={!siteId}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-40">
                <option value="">— Optionnel —</option>
                {filteredResidences.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Créer l'intervention
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function InterventionsPlanning() {
  const today = new Date();
  // Default to the week of 8–14 June 2026
  const defaultWeekYear  = 2026;
  const defaultWeekMonth = 5; // June (0-indexed)
  // Week index: first Monday of June 2026 is June 1, so June 8 is week index 1
  const defaultWeekIdx   = 1;

  const [calMode, setCalMode]         = useState<CalendarMode>('week');
  const [year,    setYear]            = useState(defaultWeekYear);
  const [month,   setMonth]           = useState(defaultWeekMonth);
  const [week,    setWeek]            = useState(defaultWeekIdx);
  const [selectedDateFields, setSelectedDateFields] = useState<string[]>(['date_planifiee']);
  const [showAssigneePanel,  setShowAssigneePanel]  = useState(true);
  const [assigneeSelection,  setAssigneeSelection]  = useState<AssigneeSelection>({
    prestataires: new Set(),
    agents: new Set(),
    equipes: new Set(),
  });

  const [activeStatuts, setActiveStatuts]       = useState<Set<StatutDI>>(new Set(STATUTS_KEYS));
  const [activeCriticites, setActiveCriticites] = useState<Set<CriticiteDI>>(new Set(CRITICITE_KEYS));
  const [weekBlockFields, setWeekBlockFields]   = useState<BlockFieldKey[]>(DEFAULT_BLOCK_FIELDS);

  // New filters: site, équipements, catégories DI
  const [filterSiteIds,    setFilterSiteIds]    = useState<string[]>([]);
  const [filterResIds,     setFilterResIds]     = useState<string[]>([]);
  const [filterEquipCats,  setFilterEquipCats]  = useState<string[]>([]);
  const [filterEquipSubs,  setFilterEquipSubs]  = useState<string[]>([]);
  const [filterCatsDI,     setFilterCatsDI]     = useState<string[]>([]);

  // ── Tâches planifiées depuis "Prise en charge" ────────────────────────────
  interface PlanningTask {
    id: string;
    titre: string;
    assignee: string | null;
    date_heure: string | null;
    intervention_ref: string | null;
    intervention_titre: string | null;
  }
  const [planningTasks, setPlanningTasks]   = useState<PlanningTask[]>([]);
  const [showTasksPanel, setShowTasksPanel] = useState(false);
  const [maintenanceTasks, setMaintenanceTasks] = useState<PlanningEvent[]>([]);
  const [selectedEvent, setSelectedEvent]   = useState<PlanningEvent | null>(null);
  const [quickCreate,   setQuickCreate]     = useState<Date | null>(null);

  // ── Unified event modal state ─────────────────────────────────────────────
  type ModalTab = 'site' | 'checklist' | 'hse' | 'demandeur';
  const [modalTab,         setModalTab]         = useState<ModalTab>('site');
  const [modalChecklist,   setModalChecklist]   = useState<{ id: number; label: string; done: boolean }[]>([]);
  const [clotureOpen,      setClotureOpen]      = useState(false);
  const [clotureTimeH,     setClotureTimeH]     = useState(1);
  const [clotureTimeMin,   setClotureTimeMin]   = useState(0);
  const [clotureNote,      setClotureNote]      = useState('');
  const [showCrTemplates,  setShowCrTemplates]  = useState(false);
  const [clotureSaving,    setClotureSaving]    = useState(false);

  const handleEventClick = (ev: PlanningEvent) => {
    setSelectedEvent(ev);
    setModalTab('site');
    setClotureOpen(false);
    setClotureTimeH(Math.floor((ev.duree_estimee ?? 60) / 60));
    setClotureTimeMin((ev.duree_estimee ?? 60) % 60);
    setClotureNote('');
    setShowCrTemplates(false);
    // Init checklist state from event data or defaults
    const rawList = ev.plan_checklist?.length
      ? ev.plan_checklist.map((c, i) => ({ id: i, label: c.label, done: c.done }))
      : (DEFAULT_CHECKLISTS[ev.catLabel] ?? DEFAULT_CHECKLISTS['Plomberie'] ?? []).map((label, i) => ({ id: i, label, done: false }));
    setModalChecklist(rawList);
  };

  useEffect(() => {
    supabase
      .from('historique_intervention')
      .select('id, description, created_at, interventions(reference, titre)')
      .eq('type_evenement', 'tache_creee')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (!data) return;
        const tasks: PlanningTask[] = data.map((row: any) => {
          let titre = row.description;
          let assignee: string | null = null;
          let date_heure: string | null = null;
          try {
            const parsed = JSON.parse(row.description);
            titre = parsed.titre ?? row.description;
            assignee = parsed.assignee ?? null;
            date_heure = parsed.dateHeure ?? null;
          } catch { /* description is plain text */ }
          return {
            id: row.id,
            titre,
            assignee,
            date_heure,
            intervention_ref: row.interventions?.reference ?? null,
            intervention_titre: row.interventions?.titre ?? null,
          };
        });
        setPlanningTasks(tasks);
      });
  }, []);

  useEffect(() => {
    supabase
      .from('maintenance_tasks')
      .select('id, label, date_planifiee, assignee, equipement, duree, checklist, plan_id, maintenance_plans!plan_id(nom, frequence)')
      .order('date_planifiee', { ascending: true })
      .limit(200)
      .then(({ data }) => {
        if (!data) return;
        const evs: PlanningEvent[] = (data as any[]).map(t => {
          const date = new Date(t.date_planifiee + 'T09:00:00');
          let checklist: { id: number; label: string; done: boolean }[] = [];
          try { checklist = JSON.parse(t.checklist ?? '[]'); } catch { /* noop */ }
          return {
            id: t.id,
            date,
            catIcon: '🔧',
            catLabel: 'Maintenance préventive',
            titre: t.label,
            statut: 'planifiee' as StatutDI,
            criticite: 'normale' as CriticiteDI,
            site: t.equipement ?? '',
            equipement: t.equipement ?? '',
            duree_estimee: 60,
            vehicule: '—',
            temps_deplacement: 0,
            assignee: t.assignee ?? 'Non assigné',
            assigneeIsOrg: false,
            source_type: 'maintenance' as const,
            source_id: t.plan_id,
            plan_nom: (t.maintenance_plans as any)?.nom ?? '',
            plan_checklist: checklist,
          };
        });
        setMaintenanceTasks(evs);
      });
  }, []);

  const toggleStatut = (s: StatutDI) =>
    setActiveStatuts(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });
  const toggleCriticite = (c: CriticiteDI) =>
    setActiveCriticites(prev => { const n = new Set(prev); n.has(c) ? n.delete(c) : n.add(c); return n; });

  const navigateMonth = (delta: number) => {
    let m = month + delta, y = year;
    if (m < 0)  { m = 11; y--; }
    if (m > 11) { m = 0;  y++; }
    setMonth(m); setYear(y); setWeek(0);
  };

  const navigateWeek = (delta: number) => {
    const firstDay = new Date(year, month, 1);
    const dow      = (firstDay.getDay() + 6) % 7;
    const firstMon = new Date(year, month, 1 - dow + week * 7);
    firstMon.setDate(firstMon.getDate() + delta * 7);
    setYear(firstMon.getFullYear());
    setMonth(firstMon.getMonth());
    const newFirst = new Date(firstMon.getFullYear(), firstMon.getMonth(), 1);
    const newDow   = (newFirst.getDay() + 6) % 7;
    setWeek(Math.floor((firstMon.getDate() - 1 + newDow) / 7));
  };

  const navigateYear = (delta: number) => setYear(y => y + delta);

  const rawEvents = useMemo(() =>
    generateMockEvents(year, month, selectedDateFields, activeStatuts, activeCriticites),
    [year, month, selectedDateFields, activeStatuts, activeCriticites]
  );

  const yearEvents = useMemo(() => {
    if (calMode !== 'year') return [];
    const evs: PlanningEvent[] = [];
    for (let m = 0; m < 12; m++)
      evs.push(...generateMockEvents(year, m, selectedDateFields, activeStatuts, activeCriticites));
    return evs;
  }, [calMode, year, selectedDateFields, activeStatuts, activeCriticites]);

  const hasAssigneeFilter = assigneeSelection.prestataires.size > 0 || assigneeSelection.agents.size > 0 || assigneeSelection.equipes.size > 0;

  // Convert planning tasks (from PriseEnChargeModal) into calendar events
  const planningTaskEvents = useMemo<PlanningEvent[]>(() => {
    return planningTasks
      .filter(t => !!t.date_heure)
      .map(t => {
        const date = new Date(t.date_heure!);
        const cat = CATEGORIES_DI.find(c => c.label === t.categorie) ?? CATEGORIES_DI[0];
        return {
          id: t.id,
          date,
          catIcon: cat.icon,
          catLabel: t.categorie ?? 'Intervention',
          titre: t.titre,
          statut: 'affecte' as StatutDI,
          criticite: 'normale' as CriticiteDI,
          site: t.site ?? '',
          equipement: '',
          duree_estimee: t.dureeMin ?? 60,
          vehicule: '—',
          temps_deplacement: 0,
          assignee: t.assignee ?? 'Non assigné',
          assigneeIsOrg: false,
          source_type: 'intervention' as const,
          source_id: t.id,
          plan_nom: t.intervention_ref ? `${t.intervention_ref}${t.intervention_titre ? ` — ${t.intervention_titre}` : ''}` : undefined,
        };
      });
  }, [planningTasks]);

  const activeEvents = useMemo(() => {
    const evs = calMode === 'year' ? yearEvents : rawEvents;
    let filtered = hasAssigneeFilter
      ? evs.filter(ev => {
          if (assigneeSelection.equipes.size > 0) {
            const inEquipe = !ev.assigneeIsOrg && EQUIPES.some(eq =>
              assigneeSelection.equipes.has(eq.key) && eq.membres.includes(ev.assignee)
            );
            if (inEquipe) return true;
          }
          return ev.assigneeIsOrg
            ? assigneeSelection.prestataires.has(ev.assignee)
            : assigneeSelection.agents.has(ev.assignee);
        })
      : evs;

    // Merge maintenance tasks (filter to the displayed period)
    const periodStart = calMode === 'year'
      ? new Date(year, 0, 1)
      : new Date(year, month, 1);
    const periodEnd = calMode === 'year'
      ? new Date(year, 11, 31)
      : new Date(year, month + 1, 0);

    const maintInPeriod = maintenanceTasks.filter(t => t.date >= periodStart && t.date <= periodEnd);
    const planningInPeriod = planningTaskEvents.filter(t => t.date >= periodStart && t.date <= periodEnd);
    return [...filtered, ...maintInPeriod, ...planningInPeriod];
  }, [rawEvents, yearEvents, calMode, hasAssigneeFilter, assigneeSelection, maintenanceTasks, planningTaskEvents, year, month]);

  const totalSelected = assigneeSelection.prestataires.size + assigneeSelection.agents.size;

  // ── Build unified event modal ─────────────────────────────────────────────
  const eventModal = (() => {
    if (!selectedEvent) return null;
    const hseRules = HSE_RULES[selectedEvent.catLabel] ?? HSE_DEFAULT;
    const checkedCount = modalChecklist.filter(c => c.done).length;
    const totalCount   = modalChecklist.length;
    const pct = totalCount ? Math.round((checkedCount / totalCount) * 100) : 0;
    const MODAL_TABS: { key: typeof modalTab; icon: ReactNode; label: string }[] = [
      { key: 'site',       icon: <MapPin className="w-3.5 h-3.5" />,    label: 'Site' },
      { key: 'checklist',  icon: <CheckSquare className="w-3.5 h-3.5" />, label: 'Checklist' },
      { key: 'hse',        icon: <ShieldAlert className="w-3.5 h-3.5" />, label: 'Sécurité HSE' },
      { key: 'demandeur',  icon: <User className="w-3.5 h-3.5" />,      label: 'Demandeur' },
    ];
    const statCfg  = STATUT_DI_CFG[selectedEvent.statut];
    const critCfg  = CRITICITE_CFG[selectedEvent.criticite];
    const fmtDuree = (min: number) => min >= 60 ? `${Math.floor(min / 60)}h${min % 60 ? min % 60 + 'min' : ''}` : `${min}min`;

    const handleCloture = async () => {
      setClotureSaving(true);
      try {
        const totalMin = clotureTimeH * 60 + clotureTimeMin;
        if (selectedEvent.source_type === 'intervention') {
          await supabase.from('interventions').update({
            statut_demande: 'resolu',
            compte_rendu: clotureNote,
            date_resolution: new Date().toISOString(),
            cout: totalMin,
          }).eq('id', selectedEvent.source_id ?? '');
        }
        setSelectedEvent(null);
      } catch (e) { console.error(e); } finally { setClotureSaving(false); }
    };

    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" onClick={() => setSelectedEvent(null)}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div
          className="relative bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          style={{ width: 520, maxHeight: '88vh' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-slate-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 text-2xl shadow-sm">
                  {selectedEvent.catIcon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 font-medium">{selectedEvent.catLabel}</p>
                  <h2 className="text-base font-bold text-slate-800 leading-tight truncate">{selectedEvent.titre}</h2>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statCfg?.bg} ${statCfg?.text}`}>
                  {statCfg?.label ?? selectedEvent.statut}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${critCfg?.bg ?? 'bg-slate-50'} ${critCfg?.text ?? 'text-slate-600'}`}>
                  {critCfg?.label ?? selectedEvent.criticite}
                </span>
                <button onClick={() => setSelectedEvent(null)} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
            {/* Tabs */}
            <div className="flex gap-1.5 mt-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {MODAL_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setModalTab(tab.key); setClotureOpen(false); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    modalTab === tab.key ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.key === 'checklist' && totalCount > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5 ${modalTab === tab.key ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                      {checkedCount}/{totalCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {/* Site tab */}
            {modalTab === 'site' && (
              <div className="px-5 py-4 space-y-3">
                {selectedEvent.plan_nom && (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
                    <ClipboardList className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span className="text-xs font-semibold text-blue-700 truncate">{selectedEvent.plan_nom}</span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: 'Site / Résidence', value: selectedEvent.site || '—' },
                    { label: 'Assigné à',        value: selectedEvent.assignee || '—' },
                    { label: 'Date planifiée',   value: selectedEvent.date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' }) },
                    { label: 'Heure',            value: selectedEvent.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) },
                    { label: 'Durée estimée',    value: fmtDuree(selectedEvent.duree_estimee) },
                    { label: 'Équipement',       value: selectedEvent.equipement || '—' },
                    { label: 'Déplacement',      value: selectedEvent.temps_deplacement === 0 ? 'Sur place' : `${selectedEvent.temps_deplacement} min` },
                    { label: 'Véhicule',         value: selectedEvent.vehicule || '—' },
                  ].map(f => (
                    <div key={f.label} className="bg-slate-50 rounded-xl px-3 py-2.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{f.label}</p>
                      <p className="text-sm font-semibold text-slate-700 truncate">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Checklist tab */}
            {modalTab === 'checklist' && (
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-slate-500">{checkedCount}/{totalCount} tâches effectuées</p>
                  <p className="text-sm font-bold text-slate-600">{pct}%</p>
                </div>
                <div className="h-2 bg-slate-100 rounded-full mb-4 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                {modalChecklist.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">Aucune check-list définie</div>
                ) : (
                  <div className="space-y-2">
                    {modalChecklist.map(item => (
                      <button
                        key={item.id}
                        onClick={() => setModalChecklist(prev => prev.map(c => c.id === item.id ? { ...c, done: !c.done } : c))}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${item.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                          {item.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-sm ${item.done ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* HSE tab */}
            {modalTab === 'hse' && (
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Consignes HSE — {selectedEvent.catLabel}</p>
                </div>
                {hseRules.map((rule, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
                    rule.level === 'danger'  ? 'bg-red-50 border-red-100' :
                    rule.level === 'warning' ? 'bg-amber-50 border-amber-100' :
                    'bg-slate-50 border-slate-100'
                  }`}>
                    <span className="text-lg flex-shrink-0 leading-none mt-0.5">{rule.icon}</span>
                    <p className={`text-sm font-semibold leading-snug ${
                      rule.level === 'danger'  ? 'text-red-700' :
                      rule.level === 'warning' ? 'text-amber-700' :
                      'text-slate-600'
                    }`}>{rule.text}</p>
                  </div>
                ))}
                <p className="text-[11px] text-slate-400 italic text-center pt-1">
                  Consignes définies par le gestionnaire. Consulter le DUER en cas de doute.
                </p>
              </div>
            )}

            {/* Demandeur tab */}
            {modalTab === 'demandeur' && (
              <div className="px-5 py-4 space-y-4">
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-4 h-4 text-slate-500" />
                    <p className="text-sm font-bold text-slate-700">Demandeur</p>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Occupant / Gestionnaire</p>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {selectedEvent.source_type === 'maintenance' ? 'Maintenance' : 'Demande'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-sm text-slate-500 font-medium flex-1">—</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm text-slate-500 font-medium flex-1">—</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <p className="text-sm font-bold text-slate-700">Messages</p>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-full hover:bg-emerald-700 transition-colors">
                      <Send className="w-3 h-3" />
                      Envoyer un message
                    </button>
                  </div>
                  <p className="text-sm text-slate-400 italic text-center py-3">Aucun message</p>
                </div>
              </div>
            )}
          </div>

          {/* Clôture panel */}
          {clotureOpen && (
            <div className="flex-shrink-0 border-t border-slate-100 bg-slate-50 px-5 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-700">Clôturer l'intervention</p>
                <button onClick={() => setClotureOpen(false)} className="p-1 hover:bg-slate-200 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <p className="text-sm font-bold text-slate-700">Temps passé</p>
                </div>
                <div className="flex items-center gap-3">
                  <input type="number" min={0} max={23} value={clotureTimeH}
                    onChange={e => setClotureTimeH(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-16 text-center text-lg font-bold border-2 border-emerald-200 rounded-xl py-2 focus:outline-none focus:border-emerald-500" />
                  <span className="text-slate-400 font-bold">h</span>
                  <span className="text-slate-300">:</span>
                  <input type="number" min={0} max={59} value={clotureTimeMin}
                    onChange={e => setClotureTimeMin(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-16 text-center text-lg font-bold border-2 border-emerald-200 rounded-xl py-2 focus:outline-none focus:border-emerald-500" />
                  <span className="text-slate-400 font-bold">min</span>
                </div>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <p className="text-sm font-bold text-slate-700">Compte-rendu</p>
                </div>
                <div className="relative">
                  <button onClick={() => setShowCrTemplates(p => !p)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
                    Utiliser un modèle <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {showCrTemplates && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
                      {CR_TEMPLATES.map(t => (
                        <button key={t} onClick={() => { setClotureNote(t); setShowCrTemplates(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <textarea value={clotureNote} onChange={e => setClotureNote(e.target.value)}
                  placeholder="Décrivez les travaux réalisés, observations, recommandations..."
                  rows={3}
                  className="w-full text-sm border-2 border-slate-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-blue-400 placeholder-slate-300" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setClotureOpen(false)}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  Annuler
                </button>
                <button onClick={handleCloture} disabled={clotureSaving}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  <CheckCircle2 className="w-4 h-4" />
                  {clotureSaving ? 'Enregistrement...' : "Clôturer l'intervention"}
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          {!clotureOpen && (
            <div className="flex-shrink-0 px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button onClick={() => setClotureOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors">
                <CheckCircle2 className="w-4 h-4" />
                Clôturer
              </button>
              <button onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors">
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    );
  })();

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-b border-slate-100 bg-white flex-shrink-0 space-y-2.5">
        {/* Row 1: contextual filters + calendar mode */}
        <div className="flex items-center gap-2 flex-wrap">

          {/* Sites */}
          <PlanningDropdown width={360}
            trigger={
              <PlanningFilterBtn
                icon={<MapPin className="w-3 h-3" />}
                label="Sites"
                count={filterSiteIds.length + filterResIds.length}
                active={filterSiteIds.length + filterResIds.length > 0}
              />
            }
          >
            <SitePicker
              selectedSiteIds={filterSiteIds}
              selectedResIds={filterResIds}
              onChange={(s, r) => { setFilterSiteIds(s); setFilterResIds(r); }}
            />
          </PlanningDropdown>

          {/* Équipements */}
          <PlanningDropdown width={320}
            trigger={
              <PlanningFilterBtn
                icon={<Wrench className="w-3 h-3" />}
                label="Équipements"
                count={filterEquipCats.length + filterEquipSubs.length}
                active={filterEquipCats.length + filterEquipSubs.length > 0}
              />
            }
          >
            <EquipPicker
              selectedCats={filterEquipCats}
              selectedSubCats={filterEquipSubs}
              onChange={(c, s) => { setFilterEquipCats(c); setFilterEquipSubs(s); }}
            />
          </PlanningDropdown>

          {/* Catégories DI */}
          <PlanningDropdown width={280}
            trigger={
              <PlanningFilterBtn
                icon={<Tag className="w-3 h-3" />}
                label="Catégories"
                count={filterCatsDI.length}
                active={filterCatsDI.length > 0}
              />
            }
          >
            <CatDIPicker selected={filterCatsDI} onChange={setFilterCatsDI} />
          </PlanningDropdown>

          {/* Reset filters */}
          {(filterSiteIds.length + filterResIds.length + filterEquipCats.length + filterEquipSubs.length + filterCatsDI.length) > 0 && (
            <button onClick={() => { setFilterSiteIds([]); setFilterResIds([]); setFilterEquipCats([]); setFilterEquipSubs([]); setFilterCatsDI([]); }}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium transition-colors">
              <X className="w-3 h-3" /> Réinitialiser
            </button>
          )}

          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <DateFieldsPicker selected={selectedDateFields} onChange={setSelectedDateFields} />

            {/* Assigné à button */}
            <button
              type="button"
              onClick={() => setShowAssigneePanel(v => !v)}
              className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-xs font-medium transition-all ${
                showAssigneePanel || totalSelected > 0
                  ? 'border-blue-400 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <span>Assigné à</span>
              {totalSelected > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                  {totalSelected}
                </span>
              )}
              {showAssigneePanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
              {CAL_MODES.map(m => (
                <button key={m.key} onClick={() => setCalMode(m.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                    ${calMode === m.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  <m.Icon className="w-3.5 h-3.5" />{m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: statut + criticité filter chips */}
        <FilterBar
          activeStatuts={activeStatuts}       onToggleStatut={toggleStatut}
          activeCriticites={activeCriticites} onToggleCriticite={toggleCriticite}
        />
      </div>

      {/* ── Body: optional assignee panel + calendar ─────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Assignee filter panel (collapsible) */}
        {showAssigneePanel && (
          <AssigneeFilterPanel
            selection={assigneeSelection}
            onChange={setAssigneeSelection}
          />
        )}

        {/* Calendar */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden bg-white">
          {calMode === 'month' && (
            <MonthGrid year={year} month={month} events={activeEvents} onNavigate={navigateMonth}
              onEventClick={handleEventClick} onSlotClick={setQuickCreate} blockFields={weekBlockFields} />
          )}
          {calMode === 'week' && (
            <WeekGrid year={year} month={month} week={week} events={activeEvents} onNavigate={navigateWeek}
              blockFields={weekBlockFields} onBlockFieldsChange={setWeekBlockFields}
              onEventClick={handleEventClick} onSlotClick={setQuickCreate} />
          )}
          {calMode === 'year' && (
            <YearGrid year={year} events={activeEvents}
              onNavigate={navigateYear}
              onMonthClick={m => { setMonth(m); setCalMode('month'); }} />
          )}
          {calMode === 'scheduler' && (
            <SchedulerView year={year} month={month} events={activeEvents} onNavigate={navigateMonth} />
          )}
        </div>
      </div>

      {/* ── Tâches planifiées (depuis Prise en charge) ────────────────────────── */}
      {planningTasks.length > 0 && (
        <div className="flex-shrink-0 border-t border-slate-100 bg-white">
          <button
            onClick={() => setShowTasksPanel(p => !p)}
            className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700 font-bold uppercase tracking-wider text-[11px]">Tâches planifiées</span>
              <span className="bg-blue-100 text-blue-700 font-bold text-[10px] rounded-full px-2 py-0.5">{planningTasks.length}</span>
            </div>
            {showTasksPanel ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          {showTasksPanel && (
            <div className="overflow-x-auto border-t border-slate-50">
              <table className="w-full text-xs min-w-[700px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tâche</th>
                    <th className="text-left px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demande</th>
                    <th className="text-left px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigné à</th>
                    <th className="text-left px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date prévue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {planningTasks.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                          <span className="font-medium text-slate-700 truncate max-w-[220px]">{t.titre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        {t.intervention_ref ? (
                          <div>
                            <span className="font-mono text-[10px] text-slate-400">{t.intervention_ref}</span>
                            {t.intervention_titre && (
                              <p className="text-slate-600 truncate max-w-[180px]">{t.intervention_titre}</p>
                            )}
                          </div>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        {t.assignee ? (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3 text-slate-400" />
                            <span className="text-slate-600">{t.assignee}</span>
                          </div>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">
                        {t.date_heure ? fmtDateTimeFR(t.date_heure) : <span className="text-slate-300">Non planifiée</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}


      {/* ── Unified event modal ── */}
      {eventModal}

      {/* ── Quick create modal ── */}
      {quickCreate && (
        <QuickCreateModal
          initialDate={quickCreate}
          onClose={() => setQuickCreate(null)}
          onCreated={() => setQuickCreate(null)}
        />
      )}
    </div>
  );
}
