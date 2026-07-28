// ─── Shared types & config for the Interventions module ───────────────────────

export type CriticiteDI = 'faible' | 'moyenne' | 'haute' | 'critique';
export type StatutDI =
  | 'brouillon'
  | 'nouveau' | 'a_qualifier' | 'qualifie' | 'affecte'
  | 'en_intervention' | 'en_attente_validation' | 'resolu' | 'cloture' | 'rejete';

// ─── Temps passés ─────────────────────────────────────────────────────────────

export interface TempsSaisi {
  id: string;
  type: 'deplacement' | 'preparation' | 'intervention' | 'attente' | 'administratif';
  debut: string;   // ISO
  fin: string | null;
  duree_min: number;
  note?: string;
}

// ─── Consommable utilisé ──────────────────────────────────────────────────────

export interface ConsommableUtilise {
  id: string;
  reference: string;
  designation: string;
  quantite: number;
  unite: string;
  stock_restant: number;
  prix_unitaire: number;
}

// ─── Photo terrain ────────────────────────────────────────────────────────────

export type PhotoCategorie = 'avant' | 'pendant' | 'apres' | 'document';

export interface PhotoTerrain {
  id: string;
  categorie: PhotoCategorie;
  url: string;
  caption: string;
  created_at: string;
}

// ─── Note vocale ─────────────────────────────────────────────────────────────

export interface NoteVocale {
  id: string;
  duree_sec: number;
  auteur: string;
  created_at: string;
  transcription?: string;
  resume_ia?: string;
}

// ─── Rapport d'intervention ───────────────────────────────────────────────────

export type ConclusionRapport = 'terminee' | 'terminee_reserves' | 'a_completer' | 'a_reprogrammer';

export interface RapportIntervention {
  travaux_realises: string;
  conclusion: ConclusionRapport | null;
  commentaire_conclusion: string;
  signature_technicien: boolean;
  signature_occupant: boolean;
  signature_demandeur: boolean;
  date_rapport: string | null;
}

// ─── Événement audit ─────────────────────────────────────────────────────────

export type AuditEventType =
  | 'creation' | 'affectation' | 'planification'
  | 'debut_intervention' | 'pause' | 'reprise' | 'fin_intervention'
  | 'en_attente_validation' | 'validation' | 'refus' | 'cloture'
  | 'commentaire' | 'qualification' | 'ticket_cree' | 'intervention_demarree' | 'resolution';
export type CanalSource = 'interne' | 'email' | 'my_residence' | 'telephone';
export type DemandeurType = 'interne' | 'etudiant' | 'externe';

export interface DemandeParsed {
  id: string;
  reference: string;
  titre: string;
  description: string | null;
  type_intervention: string;
  categorie: string | null;
  priorite: string;
  statut: string;
  statut_demande: StatutDI;
  criticite: CriticiteDI;
  sla_heures: number;
  canal_source: CanalSource;
  demandeur_nom: string | null;
  demandeur_email: string | null;
  demandeur_telephone: string | null;
  demandeur_type: DemandeurType;
  site_id: string | null;
  residence_id: string | null;
  batiment_id: string | null;
  localisation_detail: string | null;
  agent: string | null;
  prestataire: string | null;
  date_planifiee: string | null;
  cout: number | null;
  compte_rendu: string | null;
  date_qualification: string | null;
  date_affectation: string | null;
  date_resolution: string | null;
  tickets_count: number;
  draft_step: number | null;
  created_at: string;
  updated_at: string;
  // joined
  site_nom?: string;
  residence_nom?: string;
  batiment_nom?: string;
}

export interface TicketIntervention {
  id: string;
  intervention_id: string;
  reference: string;
  titre: string;
  description: string | null;
  categorie: string | null;
  statut: string;
  priorite: string;
  assigne_a: string | null;
  prestataire: string | null;
  date_prevue: string | null;
  date_realisation: string | null;
  duree_estimee_min: number | null;
  duree_reelle_min: number | null;
  cout: number | null;
  compte_rendu: string | null;
  created_at: string;
}

export interface HistoriqueItem {
  id: string;
  intervention_id: string;
  type_evenement: string;
  description: string;
  auteur: string;
  created_at: string;
}

// ─── Criticité config ─────────────────────────────────────────────────────────

export const CRITICITE_CFG: Record<CriticiteDI, {
  label: string; bg: string; text: string; border: string; dot: string;
  badgeBg: string; sla: string; icon: string;
}> = {
  faible:   { label: 'Aucune',   bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', badgeBg: 'bg-emerald-100', sla: '> 72h',  icon: '✅' },
  moyenne:  { label: 'Mineure',  bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500',    badgeBg: 'bg-blue-100',    sla: '< 48h',  icon: '🔎' },
  haute:    { label: 'Majeure',  bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-500',  badgeBg: 'bg-orange-100',  sla: '< 8h',   icon: '⚠️' },
  critique: { label: 'Critique', bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500',     badgeBg: 'bg-red-100',     sla: '< 4h',   icon: '🚨' },
};

// ─── Statut demande config ────────────────────────────────────────────────────

export const STATUT_DI_CFG: Record<StatutDI, {
  label: string; bg: string; text: string; border: string; dot: string; order: number;
}> = {
  brouillon:               { label: 'Brouillon',            bg: 'bg-slate-50',   text: 'text-slate-500',   border: 'border-slate-300',   dot: 'bg-slate-400',   order: -1 },
  nouveau:                 { label: 'Nouveau',              bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500',    order: 0 },
  a_qualifier:             { label: 'À qualifier',          bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-500',  order: 1 },
  qualifie:                { label: 'Qualifié',             bg: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200',     dot: 'bg-sky-500',     order: 2 },
  affecte:                 { label: 'Planifiée',            bg: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200',    dot: 'bg-cyan-500',    order: 3 },
  en_intervention:         { label: 'En intervention',      bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200',  dot: 'bg-yellow-500',  order: 4 },
  en_attente_validation:   { label: 'En attente valid.',   bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  dot: 'bg-violet-500',  order: 5 },
  resolu:                  { label: 'Résolu',               bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', order: 6 },
  cloture:                 { label: 'Clôturé',              bg: 'bg-slate-100',  text: 'text-slate-600',   border: 'border-slate-200',   dot: 'bg-slate-400',   order: 7 },
  rejete:                  { label: 'Rejeté',               bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500',     order: 8 },
};

// ─── Canal source config ──────────────────────────────────────────────────────

export const CANAL_CFG: Record<CanalSource, { label: string; icon: string; bg: string; text: string }> = {
  interne:      { label: 'Interne',          icon: '🏢', bg: 'bg-slate-100',  text: 'text-slate-700'  },
  email:        { label: 'Email',            icon: '📧', bg: 'bg-blue-50',    text: 'text-blue-700'   },
  my_residence: { label: 'My Résidence',     icon: '📱', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  telephone:    { label: 'Téléphone',        icon: '📞', bg: 'bg-amber-50',   text: 'text-amber-700'  },
};

// ─── Catégories d'intervention ────────────────────────────────────────────────

export const CATEGORIES_DI = [
  { key: 'plomberie',        label: 'Plomberie',              icon: '🔧' },
  { key: 'electricite',      label: 'Électricité',            icon: '⚡' },
  { key: 'chauffage',        label: 'Chauffage / CVC',        icon: '🌡️' },
  { key: 'serrurerie',       label: 'Serrurerie',             icon: '🔑' },
  { key: 'menuiserie',       label: 'Menuiserie / Vitrerie',  icon: '🪟' },
  { key: 'electromenager',   label: 'Électroménager',         icon: '🍳' },
  { key: 'nettoyage',        label: 'Nettoyage / Hygiène',    icon: '🧹' },
  { key: 'securite_incendie',label: 'Sécurité incendie',      icon: '🔥' },
  { key: 'ascenseur',        label: 'Ascenseur',              icon: '🛗' },
  { key: 'nuisibles',        label: 'Nuisibles',              icon: '🐭' },
  { key: 'froid',            label: 'Froid / Réfrigération',  icon: '❄️' },
  { key: 'vmc',              label: 'VMC / Ventilation',      icon: '💨' },
  { key: 'toiture',          label: 'Toiture / Étanchéité',   icon: '🏚️' },
  { key: 'peinture',         label: 'Peinture / Revêtements', icon: '🎨' },
  { key: 'autre',            label: 'Autre',                  icon: '📋' },
];

export const SOUS_CATEGORIES: Record<string, string[]> = {
  plomberie:   ['Fuite canalisation', 'WC bouché', 'Robinetterie défaillante', 'Coup de bélier', 'Chauffe-eau'],
  electricite: ['Panne tableau', 'Prise défaillante', 'Éclairage HS', 'Disjoncteur', 'Court-circuit'],
  chauffage:   ['Radiateur froid', 'Chaudière en panne', 'Thermostat défaillant', 'Fuite chauffage'],
  serrurerie:  ['Serrure défaillante', 'Verrou forcé', 'Badge non reconnu', 'Digicode HS'],
  menuiserie:  ['Vitre brisée', 'Porte bloquée', 'Store défaillant', 'Fenêtre cassée'],
  electromenager: ['Plaque cuisson HS', 'Réfrigérateur HS', 'Machine à laver HS', 'Joint défaillant'],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function fmtDateRelative(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = diffMs / 3600000;
  if (diffH < 1) return 'Il y a < 1h';
  if (diffH < 24) return `Il y a ${Math.round(diffH)}h`;
  const diffD = Math.round(diffH / 24);
  if (diffD === 1) return 'Hier';
  if (diffD < 7) return `Il y a ${diffD}j`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

export function fmtDateFR(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function fmtDateTimeFR(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function isSlaBreached(demande: DemandeParsed): boolean {
  if (['resolu', 'cloture', 'rejete'].includes(demande.statut_demande)) return false;
  const created = new Date(demande.created_at).getTime();
  const deadline = created + demande.sla_heures * 3600000;
  return Date.now() > deadline;
}

export function slaRemainingLabel(demande: DemandeParsed): string {
  const created = new Date(demande.created_at).getTime();
  const deadline = created + demande.sla_heures * 3600000;
  const diffMs = deadline - Date.now();
  if (diffMs < 0) {
    const h = Math.abs(Math.round(diffMs / 3600000));
    return h >= 24 ? `${Math.round(h / 24)}j de retard` : `${h}h de retard`;
  }
  const h = Math.round(diffMs / 3600000);
  return h >= 24 ? `${Math.round(h / 24)}j restants` : `${h}h restants`;
}

export function historiqueIcon(type: string): { icon: string; color: string } {
  const map: Record<string, { icon: string; color: string }> = {
    creation:               { icon: '✦',  color: 'text-blue-500'    },
    qualification:          { icon: '🔍', color: 'text-orange-500'  },
    affectation:            { icon: '👤', color: 'text-cyan-600'    },
    planification:          { icon: '📅', color: 'text-cyan-600'    },
    ticket_cree:            { icon: '🎫', color: 'text-slate-600'   },
    intervention_demarree:  { icon: '▶',  color: 'text-yellow-600'  },
    debut_intervention:     { icon: '▶',  color: 'text-yellow-600'  },
    pause:                  { icon: '⏸',  color: 'text-amber-500'   },
    reprise:                { icon: '▶',  color: 'text-yellow-600'  },
    fin_intervention:       { icon: '⏹',  color: 'text-blue-600'    },
    en_attente_validation:  { icon: '⏳', color: 'text-violet-600'  },
    validation:             { icon: '✓',  color: 'text-emerald-600' },
    refus:                  { icon: '✗',  color: 'text-red-600'     },
    cloture:                { icon: '🔒', color: 'text-slate-500'   },
    resolution:             { icon: '✓',  color: 'text-emerald-600' },
    commentaire:            { icon: '💬', color: 'text-slate-500'   },
  };
  return map[type] ?? { icon: '•', color: 'text-slate-400' };
}

// ─── Photo categories ─────────────────────────────────────────────────────────

export const PHOTO_CAT_CFG: Record<PhotoCategorie, { label: string; bg: string; text: string }> = {
  avant:    { label: 'Avant',    bg: 'bg-blue-100',    text: 'text-blue-700'    },
  pendant:  { label: 'Pendant',  bg: 'bg-amber-100',   text: 'text-amber-700'   },
  apres:    { label: 'Après',   bg: 'bg-emerald-100', text: 'text-emerald-700' },
  document: { label: 'Document', bg: 'bg-slate-100',   text: 'text-slate-700'   },
};

export const CONCLUSION_CFG: Record<ConclusionRapport, { label: string; bg: string; text: string; border: string }> = {
  terminee:          { label: 'Terminée',               bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-300' },
  terminee_reserves: { label: 'Terminée avec réserves', bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-300'   },
  a_completer:       { label: 'À compléter',            bg: 'bg-blue-50',     text: 'text-blue-700',    border: 'border-blue-300'    },
  a_reprogrammer:    { label: 'À reprogrammer',         bg: 'bg-red-50',      text: 'text-red-700',     border: 'border-red-300'     },
};

// ─── Demo temps passés ────────────────────────────────────────────────────────

export const DEMO_TEMPS: TempsSaisi[] = [
  { id: 't1', type: 'deplacement',    debut: '2026-05-12T08:00:00', fin: '2026-05-12T08:25:00', duree_min: 25  },
  { id: 't2', type: 'preparation',    debut: '2026-05-12T08:25:00', fin: '2026-05-12T08:40:00', duree_min: 15  },
  { id: 't3', type: 'intervention',   debut: '2026-05-12T08:40:00', fin: '2026-05-12T10:10:00', duree_min: 90  },
];

export const DEMO_CONSOMMABLES: ConsommableUtilise[] = [
  { id: 'c1', reference: 'PLB-0023', designation: 'Joint torique 20mm',    quantite: 3,  unite: 'pièce', stock_restant: 47, prix_unitaire: 0.85 },
  { id: 'c2', reference: 'PLB-0105', designation: 'Tuyau PER flexible 15', quantite: 1,  unite: 'm',     stock_restant: 18, prix_unitaire: 4.20 },
  { id: 'c3', reference: 'ELC-0044', designation: 'Domino de connexion',   quantite: 2,  unite: 'pièce', stock_restant: 120, prix_unitaire: 0.40 },
];

export const DEMO_PHOTOS: PhotoTerrain[] = [
  { id: 'p1', categorie: 'avant',  url: 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?w=400&h=300&fit=crop', caption: 'Fuite visible sous évier', created_at: '2026-05-12T08:42:00' },
  { id: 'p2', categorie: 'avant',  url: 'https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg?w=400&h=300&fit=crop', caption: 'Joint décollé côté droit', created_at: '2026-05-12T08:43:00' },
  { id: 'p3', categorie: 'apres',  url: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?w=400&h=300&fit=crop',  caption: 'Réparation terminée',   created_at: '2026-05-12T10:08:00' },
];

export const DEMO_NOTES_VOCALES: NoteVocale[] = [
  {
    id: 'nv1', duree_sec: 42, auteur: 'Martin D.', created_at: '2026-05-12T09:15:00',
    transcription: 'Le joint sous l\'évier était complètement décollé, probablement suite à une dilatation. J\'ai remplacé les deux joints toriques et rincé la vanne. Pas de dégât structurel visible.',
    resume_ia: 'Remplacement de joints toriques sous évier. Cause : dilatation thermique. Aucun dégât structurel.',
  },
];

export const DEMO_RAPPORT: RapportIntervention = {
  travaux_realises: 'Remplacement des joints toriques (×3) et du tuyau PER flexible. Vérification de l\'étanchéité après remise en service. Test de pression OK.',
  conclusion: 'terminee',
  commentaire_conclusion: 'Intervention complète. Aucune réserve.',
  signature_technicien: true,
  signature_occupant: false,
  signature_demandeur: false,
  date_rapport: '2026-05-12T10:15:00',
};
