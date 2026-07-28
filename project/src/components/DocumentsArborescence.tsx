import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  Folder, FolderOpen, FileText, FileImage, FileSpreadsheet, File,
  ChevronRight, ChevronDown, Search, Upload, Tag, X, Eye,
  Download, Paperclip, Calendar, User, Hash, Plus,
  Filter, Check, Info, FolderPlus, GripVertical,
  ZoomIn, ZoomOut, ChevronLeft as ChevronLeftIcon,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

import type { GedFilters } from './GedFilterBar';

type RootCategory = 'technique' | 'administratif' | 'reglementaire';
type Context = 'site' | 'logement' | 'equipement' | 'ged';

interface DocFile {
  id: string;
  name: string;
  ext: string;
  size: string;
  date: string;
  author: string;
  tags: string[];
  rootCategories: RootCategory[];
  subfolder: string;
  description?: string;
  previewPdf?: string;
  // GED-specific optional metadata
  specialCategories?: string[];
  siteId?: string;
  residenceId?: string;
  equipementCat?: string;
}

interface FolderNode {
  id: string;
  label: string;
  root: RootCategory;
  subfolders?: FolderNode[];
  files: string[];
  isUserCreated?: boolean;
}

// ─── Static config ─────────────────────────────────────────────────────────────

const ROOT_LABELS: Record<RootCategory, { label: string; color: string; bg: string; border: string }> = {
  technique:      { label: 'Technique',      color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200'    },
  administratif:  { label: 'Administratif',  color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200'   },
  reglementaire:  { label: 'Réglementaire',  color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
};

// ─── SITE / LOGEMENT mock data ─────────────────────────────────────────────────

const SITE_FILES: DocFile[] = [
  {
    id: 'f-001', name: 'Permis de construire — Résidence Cavalier', ext: 'pdf',
    size: '2.4 Mo', date: '2018-06-15', author: 'Service urbanisme',
    tags: ['#réglementaire', '#urbanisme', '#obligatoire', '#bâtiment-Cavalier', '#année-2018'],
    rootCategories: ['reglementaire'], subfolder: 'Permis de construire',
    previewPdf: '/Amiante-exemple-dta.pdf',
    description: 'Permis de construire original délivré par la Mairie de Lyon 3e.'
  },
  {
    id: 'f-002', name: 'DPE — Résidence Cavalier 2024', ext: 'pdf',
    size: '1.1 Mo', date: '2024-03-10', author: 'Alpes Contrôles',
    tags: ['#réglementaire', '#diagnostic-DPE', '#obligatoire', '#validité-2034'],
    rootCategories: ['reglementaire'], subfolder: 'Diagnostics techniques',
    previewPdf: '/Amiante-exemple-dta.pdf',
  },
  {
    id: 'f-003', name: 'Diagnostic électrique — Résidence Cavalier', ext: 'pdf',
    size: '0.8 Mo', date: '2023-11-22', author: 'DEKRA',
    tags: ['#réglementaire', '#diagnostic-électrique', '#obligatoire', '#validité-2026'],
    rootCategories: ['reglementaire', 'technique'], subfolder: 'Diagnostics techniques',
    previewPdf: '/Amiante-exemple-dta.pdf',
    description: 'Diagnostic de l\'installation électrique — validité 3 ans.'
  },
  {
    id: 'f-004', name: 'DTA — Dossier Technique Amiante 2023', ext: 'pdf',
    size: '4.7 Mo', date: '2023-05-08', author: 'APAVE',
    tags: ['#réglementaire', '#amiante', '#DTA', '#obligatoire', '#échéance-2026-05'],
    rootCategories: ['reglementaire'], subfolder: 'Dossier Technique Amiante',
    previewPdf: '/Amiante-exemple-dta.pdf',
    description: 'DTA complet incluant RAAT et BSDA.'
  },
  {
    id: 'f-005', name: 'RAAT — Rapport Annuel Amiante 2024', ext: 'pdf',
    size: '1.3 Mo', date: '2024-01-15', author: 'APAVE',
    tags: ['#réglementaire', '#amiante', '#DTA', '#obligatoire'],
    rootCategories: ['reglementaire'], subfolder: 'Dossier Technique Amiante',
    previewPdf: '/Amiante-exemple-dta.pdf',
  },
  {
    id: 'f-006', name: 'Rapport contrôle incendie — Jan 2026', ext: 'pdf',
    size: '1.8 Mo', date: '2026-01-21', author: 'SOCOTEC',
    tags: ['#réglementaire', '#contrôle-incendie', '#périodique', '#prestataire-SOCOTEC'],
    rootCategories: ['reglementaire'], subfolder: 'Rapports de contrôle',
    previewPdf: '/Amiante-exemple-dta.pdf',
  },
  {
    id: 'f-007', name: 'Rapport contrôle ascenseur — T1 2026', ext: 'pdf',
    size: '0.9 Mo', date: '2026-03-05', author: 'Bureau Veritas',
    tags: ['#réglementaire', '#contrôle-ascenseur', '#périodique'],
    rootCategories: ['reglementaire'], subfolder: 'Rapports de contrôle',
    previewPdf: '/Amiante-exemple-dta.pdf',
  },
  {
    id: 'f-008', name: 'Plan d\'évacuation — Bât. A', ext: 'pdf',
    size: '0.6 Mo', date: '2024-09-01', author: 'Service sécurité',
    tags: ['#réglementaire', '#prévention-risques', '#obligatoire', '#plan'],
    rootCategories: ['reglementaire', 'technique'], subfolder: 'Plans de prévention des risques',
    previewPdf: '/Plan-Armoire-Positive.pdf',
    description: 'Plan d\'évacuation incendie affiché dans les parties communes.'
  },
  {
    id: 'f-009', name: 'Consignes de sécurité incendie', ext: 'pdf',
    size: '0.2 Mo', date: '2025-01-10', author: 'Service sécurité',
    tags: ['#réglementaire', '#prévention-risques', '#obligatoire'],
    rootCategories: ['reglementaire'], subfolder: 'Plans de prévention des risques',
  },
  {
    id: 'f-010', name: 'Convention d\'hébergement type 2025-2026', ext: 'pdf',
    size: '0.4 Mo', date: '2025-09-01', author: 'Service juridique CROUS',
    tags: ['#administratif', '#contrat', '#type-bail'],
    rootCategories: ['administratif'], subfolder: 'Baux et conventions',
    description: 'Convention d\'hébergement standard pour l\'année universitaire 2025-2026.'
  },
  {
    id: 'f-011', name: 'AOT — Autorisation d\'Occupation Temporaire', ext: 'pdf',
    size: '1.2 Mo', date: '2020-06-01', author: 'Préfecture du Rhône',
    tags: ['#administratif', '#contrat', '#type-AOT'],
    rootCategories: ['administratif'], subfolder: 'Baux et conventions',
  },
  {
    id: 'f-012', name: 'Contrat de construction — Maçonnerie 2018', ext: 'pdf',
    size: '2.8 Mo', date: '2018-03-20', author: 'Service construction CROUS',
    tags: ['#administratif', '#construction', '#garantie-2028'],
    rootCategories: ['administratif'], subfolder: 'Marchés et construction',
  },
  {
    id: 'f-013', name: 'PV de réception — Rénovation 2022', ext: 'pdf',
    size: '1.5 Mo', date: '2022-11-30', author: 'Maîtrise d\'ouvrage CROUS',
    tags: ['#administratif', '#construction'],
    rootCategories: ['administratif'], subfolder: 'Marchés et construction',
  },
  {
    id: 'f-014', name: 'Contrat maintenance ascenseurs — Schindler', ext: 'pdf',
    size: '0.7 Mo', date: '2024-01-01', author: 'Service achat CROUS',
    tags: ['#administratif', '#contrat', '#prestataire-Schindler', '#périodicité-mensuel'],
    rootCategories: ['administratif'], subfolder: 'Contrats de maintenance',
  },
  {
    id: 'f-015', name: 'Facture — Rénovation toiture déc. 2025', ext: 'pdf',
    size: '0.3 Mo', date: '2025-12-15', author: 'Comptabilité CROUS',
    tags: ['#administratif', '#financier', '#montant-24500€', '#payé'],
    rootCategories: ['administratif'], subfolder: 'Finances et achats',
  },
  {
    id: 'f-016', name: 'Devis — Remplacement chaudière 2026', ext: 'pdf',
    size: '0.5 Mo', date: '2026-02-10', author: 'Service maintenance',
    tags: ['#administratif', '#financier', '#montant-42000€', '#à-payer'],
    rootCategories: ['administratif'], subfolder: 'Finances et achats',
  },
  {
    id: 'f-017', name: 'État des lieux — Chambre 108 — Oct. 2025', ext: 'pdf',
    size: '1.1 Mo', date: '2025-10-01', author: 'Gestionnaire résidence',
    tags: ['#administratif', '#logement-108', '#état-des-lieux'],
    rootCategories: ['administratif'], subfolder: 'États des lieux',
  },
  {
    id: 'f-018', name: 'Plans architecturaux — Résidence Cavalier v3', ext: 'pdf',
    size: '12.4 Mo', date: '2022-06-20', author: 'Cabinet Moreau Architectes',
    tags: ['#technique', '#plan', '#version-3', '#échelle-1:100'],
    rootCategories: ['technique'], subfolder: 'Plans et relevés',
    previewPdf: '/Plan-Armoire-Positive.pdf',
    description: 'Plans R+0 à R+5, façades et coupes — version post-rénovation 2022.'
  },
  {
    id: 'f-019', name: 'Schémas électriques — Tableau principal', ext: 'pdf',
    size: '3.2 Mo', date: '2023-02-14', author: 'DEKRA',
    tags: ['#technique', '#plan', '#version-2'],
    rootCategories: ['technique'], subfolder: 'Plans et relevés',
    previewPdf: '/Plan-Armoire-Positive.pdf',
  },
  {
    id: 'f-020', name: 'Relevé géomètre — Parcelle cadastrale', ext: 'pdf',
    size: '1.7 Mo', date: '2021-04-05', author: 'Géomètres du Rhône',
    tags: ['#technique', '#plan', '#cadastre'],
    rootCategories: ['technique'], subfolder: 'Plans et relevés',
  },
  {
    id: 'f-021', name: 'Fiche technique — Armoire réfrigérée Liebherr', ext: 'pdf',
    size: '0.8 Mo', date: '2020-09-15', author: 'Liebherr',
    tags: ['#technique', '#équipement-Armoire', '#marque-Liebherr', '#modèle-GKPV1470'],
    rootCategories: ['technique'], subfolder: 'Fiches et manuels',
    previewPdf: '/Plan-Armoire-Positive.pdf',
  },
  {
    id: 'f-022', name: 'Manuel utilisation — Chaudière Viessmann', ext: 'pdf',
    size: '4.1 Mo', date: '2019-03-01', author: 'Viessmann',
    tags: ['#technique', '#équipement-Chaudière', '#marque-Viessmann'],
    rootCategories: ['technique'], subfolder: 'Fiches et manuels',
  },
  {
    id: 'f-023', name: 'Rapport intervention — Plomberie Jan 2026', ext: 'pdf',
    size: '0.6 Mo', date: '2026-01-18', author: 'Martin D.',
    tags: ['#technique', '#intervention-INT-2026-042', '#type-curative', '#statut-terminée'],
    rootCategories: ['technique'], subfolder: 'Interventions et maintenance',
  },
  {
    id: 'f-024', name: 'Photos avant-après — Rénovation toiture 2025', ext: 'jpg',
    size: '18.3 Mo', date: '2025-12-20', author: 'Service technique',
    tags: ['#technique', '#avant-après', '#date-2025-12-20'],
    rootCategories: ['technique'], subfolder: 'Interventions et maintenance',
  },
  {
    id: 'f-025', name: 'Inventaire équipements — Résidence Cavalier', ext: 'xlsx',
    size: '0.4 Mo', date: '2025-11-30', author: 'Service patrimoine',
    tags: ['#technique', '#patrimoine'],
    rootCategories: ['technique'], subfolder: 'Inventaires et pilotage',
  },
  {
    id: 'f-026', name: 'Tableau de bord consommations — 2025', ext: 'xlsx',
    size: '1.2 Mo', date: '2026-01-05', author: 'Service pilotage',
    tags: ['#technique', '#pilotage', '#consommation-électricité'],
    rootCategories: ['technique'], subfolder: 'Inventaires et pilotage',
  },
  {
    id: 'f-027', name: 'Plan maintenance préventive 2026', ext: 'xlsx',
    size: '0.5 Mo', date: '2025-12-01', author: 'Responsable maintenance',
    tags: ['#technique', '#maintenance-préventive'],
    rootCategories: ['technique'], subfolder: 'Inventaires et pilotage',
  },
];

const SITE_TREE: FolderNode[] = [
  {
    id: 'root-reglementaire', label: 'Réglementaire', root: 'reglementaire', files: [],
    subfolders: [
      { id: 'regl-pc',       label: 'Permis de construire',            root: 'reglementaire', files: ['f-001'] },
      { id: 'regl-diag',     label: 'Diagnostics techniques',          root: 'reglementaire', files: ['f-002', 'f-003'] },
      { id: 'regl-dta',      label: 'Dossier Technique Amiante',       root: 'reglementaire', files: ['f-004', 'f-005'] },
      { id: 'regl-prev',     label: 'Plans de prévention des risques', root: 'reglementaire', files: ['f-008', 'f-009'] },
      { id: 'regl-rapports', label: 'Rapports de contrôle',            root: 'reglementaire', files: ['f-006', 'f-007'] },
    ],
  },
  {
    id: 'root-administratif', label: 'Administratif', root: 'administratif', files: [],
    subfolders: [
      { id: 'admin-baux',          label: 'Baux et conventions',      root: 'administratif', files: ['f-010', 'f-011'] },
      { id: 'admin-construction',  label: 'Marchés et construction',  root: 'administratif', files: ['f-012', 'f-013'] },
      { id: 'admin-maintenance',   label: 'Contrats de maintenance',  root: 'administratif', files: ['f-014'] },
      { id: 'admin-finances',      label: 'Finances et achats',       root: 'administratif', files: ['f-015', 'f-016'] },
      { id: 'admin-edl',           label: 'États des lieux',          root: 'administratif', files: ['f-017'] },
    ],
  },
  {
    id: 'root-technique', label: 'Technique', root: 'technique', files: [],
    subfolders: [
      { id: 'tech-plans',      label: 'Plans et relevés',             root: 'technique', files: ['f-018', 'f-019', 'f-020'] },
      { id: 'tech-fiches',     label: 'Fiches et manuels',            root: 'technique', files: ['f-021', 'f-022'] },
      { id: 'tech-interv',     label: 'Interventions et maintenance', root: 'technique', files: ['f-023', 'f-024'] },
      { id: 'tech-inventaire', label: 'Inventaires et pilotage',      root: 'technique', files: ['f-025', 'f-026', 'f-027'] },
    ],
  },
];

// ─── EQUIPEMENT (Armoire positive) mock data ───────────────────────────────────

const EQUIP_FILES: DocFile[] = [
  // Réglementaire
  {
    id: 'eq-001', name: 'Rapport contrôle température HACCP — Jan 2026', ext: 'pdf',
    size: '0.4 Mo', date: '2026-01-15', author: 'Responsable cuisine',
    tags: ['#réglementaire', '#HACCP', '#contrôle-température', '#obligatoire', '#périodique'],
    rootCategories: ['reglementaire'], subfolder: 'Contrôles réglementaires',
    previewPdf: '/Amiante-exemple-dta.pdf',
    description: 'Relevé mensuel HACCP — températures positives vérifiées conformes (3°C–7°C).'
  },
  {
    id: 'eq-002', name: 'Rapport contrôle température HACCP — Déc 2025', ext: 'pdf',
    size: '0.3 Mo', date: '2025-12-15', author: 'Responsable cuisine',
    tags: ['#réglementaire', '#HACCP', '#contrôle-température', '#obligatoire'],
    rootCategories: ['reglementaire'], subfolder: 'Contrôles réglementaires',
    previewPdf: '/Amiante-exemple-dta.pdf',
  },
  {
    id: 'eq-003', name: 'Contrôle F-Gaz — Taux de fuite annuel 2025', ext: 'pdf',
    size: '0.6 Mo', date: '2025-09-10', author: 'SOCOTEC',
    tags: ['#réglementaire', '#F-Gaz', '#fluide-frigorigène', '#obligatoire', '#prestataire-SOCOTEC'],
    rootCategories: ['reglementaire'], subfolder: 'Contrôles réglementaires',
    previewPdf: '/Amiante-exemple-dta.pdf',
    description: 'Contrôle d\'étanchéité réglementaire — aucune fuite détectée.'
  },
  {
    id: 'eq-004', name: 'Vérification métro sondes température — 2025', ext: 'pdf',
    size: '0.2 Mo', date: '2025-06-01', author: 'Service métrologie',
    tags: ['#réglementaire', '#métrologie', '#étalonnage', '#obligatoire'],
    rootCategories: ['reglementaire'], subfolder: 'Contrôles réglementaires',
  },
  // Technique
  {
    id: 'eq-005', name: 'Fiche technique — Liebherr GKPV 1470', ext: 'pdf',
    size: '2.1 Mo', date: '2020-09-15', author: 'Liebherr',
    tags: ['#technique', '#fiche-technique', '#marque-Liebherr', '#modèle-GKPV1470'],
    rootCategories: ['technique'], subfolder: 'Fiche technique et manuel',
    previewPdf: '/Plan-Armoire-Positive.pdf',
    description: 'Documentation constructeur complète : caractéristiques, installation, maintenance.'
  },
  {
    id: 'eq-006', name: 'Manuel d\'utilisation — Liebherr GKPV 1470', ext: 'pdf',
    size: '4.8 Mo', date: '2020-09-15', author: 'Liebherr',
    tags: ['#technique', '#manuel', '#marque-Liebherr', '#modèle-GKPV1470'],
    rootCategories: ['technique'], subfolder: 'Fiche technique et manuel',
    previewPdf: '/Plan-Armoire-Positive.pdf',
  },
  {
    id: 'eq-007', name: 'Plan technique — Schéma frigorifique', ext: 'pdf',
    size: '1.1 Mo', date: '2020-09-15', author: 'Liebherr',
    tags: ['#technique', '#plan', '#schéma-frigorifique', '#circuit-frigorigène'],
    rootCategories: ['technique'], subfolder: 'Fiche technique et manuel',
    previewPdf: '/Plan-Armoire-Positive.pdf',
  },
  {
    id: 'eq-008', name: 'Rapport intervention — Panne compresseur mars 2024', ext: 'pdf',
    size: '0.5 Mo', date: '2024-03-22', author: 'ThermoService Lyon',
    tags: ['#technique', '#intervention', '#type-curative', '#panne-compresseur', '#statut-terminée'],
    rootCategories: ['technique'], subfolder: 'Interventions et maintenances',
    description: 'Remplacement joint d\'étanchéité compresseur. Durée intervention : 3h.'
  },
  {
    id: 'eq-009', name: 'Rapport maintenance préventive — Mars 2026', ext: 'pdf',
    size: '0.3 Mo', date: '2026-03-10', author: 'ThermoService Lyon',
    tags: ['#technique', '#maintenance-préventive', '#périodique', '#statut-terminée'],
    rootCategories: ['technique'], subfolder: 'Interventions et maintenances',
  },
  {
    id: 'eq-010', name: 'Rapport maintenance préventive — Sep 2025', ext: 'pdf',
    size: '0.3 Mo', date: '2025-09-12', author: 'ThermoService Lyon',
    tags: ['#technique', '#maintenance-préventive', '#périodique', '#statut-terminée'],
    rootCategories: ['technique'], subfolder: 'Interventions et maintenances',
  },
  {
    id: 'eq-011', name: 'Photos état — Armoire positive cuisine mars 2026', ext: 'jpg',
    size: '3.2 Mo', date: '2026-03-10', author: 'ThermoService Lyon',
    tags: ['#technique', '#photo', '#état-équipement', '#date-2026-03-10'],
    rootCategories: ['technique'], subfolder: 'Interventions et maintenances',
  },
  {
    id: 'eq-012', name: 'Tableau de bord — Températures janv–mars 2026', ext: 'xlsx',
    size: '0.2 Mo', date: '2026-03-31', author: 'Service pilotage',
    tags: ['#technique', '#pilotage', '#températures', '#consommation-électricité'],
    rootCategories: ['technique'], subfolder: 'Suivi et pilotage',
  },
  {
    id: 'eq-013', name: 'Historique alarmes — 2025', ext: 'xlsx',
    size: '0.1 Mo', date: '2025-12-31', author: 'Service technique',
    tags: ['#technique', '#pilotage', '#alarmes', '#historique'],
    rootCategories: ['technique'], subfolder: 'Suivi et pilotage',
  },
  // Administratif
  {
    id: 'eq-014', name: 'Contrat maintenance — ThermoService Lyon 2024–2026', ext: 'pdf',
    size: '0.8 Mo', date: '2024-01-01', author: 'Service achats CROUS',
    tags: ['#administratif', '#contrat', '#prestataire-ThermoService', '#périodicité-semestriel'],
    rootCategories: ['administratif'], subfolder: 'Contrats et garantie',
    description: 'Contrat de maintenance préventive semestrielle + curative sous 24h.'
  },
  {
    id: 'eq-015', name: 'Certificat garantie constructeur — Liebherr', ext: 'pdf',
    size: '0.2 Mo', date: '2020-09-15', author: 'Liebherr',
    tags: ['#administratif', '#garantie', '#marque-Liebherr', '#garantie-2023'],
    rootCategories: ['administratif'], subfolder: 'Contrats et garantie',
  },
  {
    id: 'eq-016', name: 'Bon de commande — Achat armoire 2020', ext: 'pdf',
    size: '0.3 Mo', date: '2020-07-10', author: 'Service achats CROUS',
    tags: ['#administratif', '#financier', '#montant-8900€', '#payé'],
    rootCategories: ['administratif'], subfolder: 'Finances',
  },
  {
    id: 'eq-017', name: 'Facture — Remplacement compresseur 2024', ext: 'pdf',
    size: '0.2 Mo', date: '2024-04-05', author: 'Comptabilité CROUS',
    tags: ['#administratif', '#financier', '#montant-1240€', '#payé'],
    rootCategories: ['administratif'], subfolder: 'Finances',
  },
];

const EQUIP_TREE: FolderNode[] = [
  {
    id: 'eq-root-reglementaire', label: 'Réglementaire', root: 'reglementaire', files: [],
    subfolders: [
      { id: 'eq-regl-ctrl', label: 'Contrôles réglementaires', root: 'reglementaire', files: ['eq-001', 'eq-002', 'eq-003', 'eq-004'] },
    ],
  },
  {
    id: 'eq-root-technique', label: 'Technique', root: 'technique', files: [],
    subfolders: [
      { id: 'eq-tech-fiche',  label: 'Fiche technique et manuel',   root: 'technique', files: ['eq-005', 'eq-006', 'eq-007'] },
      { id: 'eq-tech-interv', label: 'Interventions et maintenances', root: 'technique', files: ['eq-008', 'eq-009', 'eq-010', 'eq-011'] },
      { id: 'eq-tech-pilotage', label: 'Suivi et pilotage',          root: 'technique', files: ['eq-012', 'eq-013'] },
    ],
  },
  {
    id: 'eq-root-administratif', label: 'Administratif', root: 'administratif', files: [],
    subfolders: [
      { id: 'eq-admin-contrats', label: 'Contrats et garantie', root: 'administratif', files: ['eq-014', 'eq-015'] },
      { id: 'eq-admin-finances', label: 'Finances',              root: 'administratif', files: ['eq-016', 'eq-017'] },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const EXT_ICONS: Record<string, React.ReactNode> = {
  pdf:  <FileText       className="w-4 h-4 text-red-500 flex-shrink-0" />,
  jpg:  <FileImage      className="w-4 h-4 text-blue-400 flex-shrink-0" />,
  png:  <FileImage      className="w-4 h-4 text-blue-400 flex-shrink-0" />,
  xlsx: <FileSpreadsheet className="w-4 h-4 text-emerald-600 flex-shrink-0" />,
  dwg:  <File           className="w-4 h-4 text-slate-500 flex-shrink-0" />,
};
function ExtIcon({ ext }: { ext: string }) {
  return <>{EXT_ICONS[ext.toLowerCase()] ?? <File className="w-4 h-4 text-slate-400 flex-shrink-0" />}</>;
}
function formatDate(d: string) { return new Date(d).toLocaleDateString('fr-FR'); }
function countFilesInNode(node: FolderNode): number {
  return node.files.length + (node.subfolders ?? []).reduce((s, f) => s + countFilesInNode(f), 0);
}
function allFileIdsInNode(node: FolderNode): string[] {
  return [...node.files, ...(node.subfolders ?? []).flatMap(allFileIdsInNode)];
}

// ─── PDF Preview panel ────────────────────────────────────────────────────────

function PdfPreviewPanel({ file, fileMap }: { file: DocFile; fileMap: Record<string, DocFile> }) {
  const [pdfDoc, setPdfDoc]       = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(0);
  const [zoom, setZoom]               = useState(100);
  const [rendering, setRendering]     = useState(false);
  const [loadError, setLoadError]     = useState(false);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const renderTask   = useRef<any>(null);

  const renderPage = useCallback(async (doc: any, pageNum: number, scale: number) => {
    if (!canvasRef.current || !doc) return;
    if (renderTask.current) renderTask.current.cancel();
    setRendering(true);
    try {
      const page     = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: scale / 100 });
      const canvas   = canvasRef.current;
      const ctx      = canvas.getContext('2d');
      if (!ctx) return;
      canvas.height  = viewport.height;
      canvas.width   = viewport.width;
      const task = page.render({ canvasContext: ctx, viewport });
      renderTask.current = task;
      await task.promise;
    } catch (e: any) {
      if (e?.name !== 'RenderingCancelledException') setLoadError(true);
    } finally {
      setRendering(false);
    }
  }, []);

  useEffect(() => {
    if (!file.previewPdf) return;
    setLoadError(false);
    setPdfDoc(null);
    setCurrentPage(1);
    setTotalPages(0);
    (async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url,
        ).toString();
        const doc = await pdfjsLib.getDocument(file.previewPdf!).promise;
        setPdfDoc(doc);
        setTotalPages(doc.numPages);
        renderPage(doc, 1, zoom);
      } catch {
        setLoadError(true);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file.id]);

  useEffect(() => {
    if (pdfDoc) renderPage(pdfDoc, currentPage, zoom);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, zoom]);

  const changePage = (d: number) => setCurrentPage(p => Math.min(Math.max(1, p + d), totalPages));
  const changeZoom = (d: number) => setZoom(z => Math.min(Math.max(50, z + d), 200));

  void fileMap; // suppress unused warning

  // Non-PDF or no preview source: show metadata card
  if (!file.previewPdf || file.ext !== 'pdf') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-slate-400 gap-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
          <ExtIcon ext={file.ext} />
        </div>
        <p className="text-sm font-medium text-slate-600 text-center">{file.name}</p>
        <p className="text-xs text-slate-400">{file.ext.toUpperCase()} · {file.size}</p>
        <button className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
          <Download className="w-3.5 h-3.5" /> Télécharger
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* PDF toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span className="text-xs text-slate-300 truncate max-w-[180px]">{file.name}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => changePage(-1)} disabled={currentPage <= 1}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 transition-colors">
            <ChevronLeftIcon className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-slate-300 px-1 tabular-nums">
            {currentPage} / {totalPages || '…'}
          </span>
          <button onClick={() => changePage(1)} disabled={currentPage >= totalPages}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-slate-600 mx-1" />
          <button onClick={() => changeZoom(-25)} disabled={zoom <= 50}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 transition-colors">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-slate-300 tabular-nums w-10 text-center">{zoom}%</span>
          <button onClick={() => changeZoom(25)} disabled={zoom >= 200}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 transition-colors">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-slate-600 mx-1" />
          <button className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors" title="Télécharger">
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {/* Canvas */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-3 bg-slate-800">
        {loadError ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <FileText className="w-10 h-10 opacity-20" />
            <p className="text-sm">Aperçu non disponible</p>
          </div>
        ) : (
          <div className="relative">
            {rendering && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800/60 z-10 rounded">
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <canvas ref={canvasRef} className="rounded shadow-2xl max-w-full block" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── File detail sidebar ──────────────────────────────────────────────────────

function FileDetailSidebar({ file, onClose }: { file: DocFile; onClose: () => void }) {
  return (
    <div className="w-64 flex-shrink-0 border-l border-slate-100 bg-white flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" /> Informations
        </span>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
            <ExtIcon ext={file.ext} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 leading-snug break-words">{file.name}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-medium">.{file.ext} · {file.size}</p>
          </div>
        </div>

        {file.rootCategories.length > 1 && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
            <p className="text-[10px] text-amber-700 font-medium flex items-center gap-1 mb-1.5">
              <Tag className="w-3 h-3" /> Multi-catégorie
            </p>
            <div className="flex flex-wrap gap-1">
              {file.rootCategories.map(r => {
                const cfg = ROOT_LABELS[r];
                return (
                  <span key={r} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                    {cfg.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {file.description && (
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Description</p>
            <p className="text-xs text-slate-600 leading-relaxed">{file.description}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Métadonnées</p>
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="text-slate-400">Ajouté</span>
            <span className="font-medium ml-auto">{formatDate(file.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="text-slate-400">Par</span>
            <span className="font-medium ml-auto truncate max-w-28">{file.author}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Paperclip className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="text-slate-400">Taille</span>
            <span className="font-medium ml-auto">{file.size}</span>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Tags</p>
          <div className="flex flex-wrap gap-1">
            {file.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                <Hash className="w-2 h-2 opacity-60" />{tag.replace(/^#/, '')}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="px-3 py-2.5 border-t border-slate-100 flex gap-2 flex-shrink-0">
        <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
          <Eye className="w-3.5 h-3.5" /> Ouvrir
        </button>
        <button className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors">
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── New folder modal ─────────────────────────────────────────────────────────

function NewFolderModal({ parentLabel, onConfirm, onClose }: {
  parentLabel: string;
  onConfirm: (name: string, root: RootCategory) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [root, setRoot] = useState<RootCategory>('technique');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-[400px] mx-4 pointer-events-auto overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-slate-400" /> Nouveau dossier
            </h3>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-5 space-y-4">
            <div className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 flex items-center gap-2">
              <Folder className="w-3.5 h-3.5 text-amber-500" />
              Sous-dossier de : <span className="font-semibold text-slate-700">{parentLabel}</span>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Nom du dossier</label>
              <input ref={inputRef} type="text" value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onConfirm(name.trim(), root); }}
                placeholder="Ex : Études de sols"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300/40" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-2">Catégorie</label>
              <div className="flex gap-2">
                {(Object.keys(ROOT_LABELS) as RootCategory[]).map(r => {
                  const cfg = ROOT_LABELS[r];
                  return (
                    <button key={r} onClick={() => setRoot(r)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all
                        ${root === r ? `${cfg.bg} ${cfg.color} ${cfg.border}` : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
              <button disabled={!name.trim()} onClick={() => name.trim() && onConfirm(name.trim(), root)}
                className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-lg flex items-center gap-1.5 transition-colors">
                <Check className="w-3.5 h-3.5" /> Créer
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Tree folder node ─────────────────────────────────────────────────────────

function TreeFolderNode({ node, depth, selectedFileId, onSelectFile, searchQuery, onAddFolder, fileMap }: {
  node: FolderNode; depth: number;
  selectedFileId: string | null;
  onSelectFile: (id: string) => void;
  searchQuery: string;
  onAddFolder: (parentNode: FolderNode) => void;
  fileMap: Record<string, DocFile>;
}) {
  const [open, setOpen]             = useState(depth === 0);
  const [hovering, setHovering]     = useState(false);
  const cfg = ROOT_LABELS[node.root];

  const matchedFiles = useMemo(() => {
    if (!searchQuery) return node.files;
    const q = searchQuery.toLowerCase();
    return node.files.filter(id => {
      const f = fileMap[id]; if (!f) return false;
      return f.name.toLowerCase().includes(q) || f.tags.some(t => t.toLowerCase().includes(q));
    });
  }, [node.files, searchQuery, fileMap]);

  const hasMatchingDescendants = useMemo(() => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return allFileIdsInNode(node).some(id => {
      const f = fileMap[id]; if (!f) return false;
      return f.name.toLowerCase().includes(q) || f.tags.some(t => t.toLowerCase().includes(q));
    });
  }, [node, searchQuery, fileMap]);

  if (searchQuery && !hasMatchingDescendants) return null;
  const isOpen = searchQuery ? true : open;
  const totalCount = countFilesInNode(node);
  const isRoot = depth === 0;

  return (
    <div className="select-none">
      <div
        style={{ paddingLeft: `${depth * 14 + 4}px` }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className={`group flex items-center gap-1.5 py-1.5 pr-2 rounded-lg transition-all
          ${isRoot ? `${cfg.bg} border ${cfg.border} mb-0.5 cursor-default` : 'cursor-pointer hover:bg-slate-50'}`}
      >
        <span onClick={() => !isRoot && !searchQuery && setOpen(o => !o)}
          className={`flex-shrink-0 transition-transform ${isOpen ? 'text-slate-500' : 'text-slate-400'}`}>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </span>
        <span onClick={() => !isRoot && !searchQuery && setOpen(o => !o)}>
          {isOpen
            ? <FolderOpen className={`w-4 h-4 flex-shrink-0 ${isRoot ? cfg.color : 'text-amber-400'}`} />
            : <Folder     className={`w-4 h-4 flex-shrink-0 ${isRoot ? cfg.color : 'text-amber-500'}`} />}
        </span>
        <span onClick={() => !isRoot && !searchQuery && setOpen(o => !o)}
          className={`text-xs font-semibold flex-1 min-w-0 truncate ${isRoot ? cfg.color : 'text-slate-700'}`}>
          {node.label}
          {node.isUserCreated && <span className="ml-1 text-[9px] text-slate-400 font-normal">(nouveau)</span>}
        </span>
        {totalCount > 0 && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0
            ${isRoot ? `${cfg.bg} ${cfg.color} border ${cfg.border}` : 'bg-slate-100 text-slate-500'}`}>
            {totalCount}
          </span>
        )}
        {/* Add subfolder button — shown on hover */}
        {hovering && (
          <button onClick={e => { e.stopPropagation(); onAddFolder(node); }}
            className="flex-shrink-0 p-0.5 rounded hover:bg-white/60 text-slate-400 hover:text-blue-600 transition-colors ml-0.5"
            title="Nouveau sous-dossier">
            <FolderPlus className="w-3 h-3" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className={isRoot ? 'mt-0.5 mb-1.5' : ''}>
          {(node.subfolders ?? []).map(sub => (
            <TreeFolderNode key={sub.id} node={sub} depth={depth + 1}
              selectedFileId={selectedFileId} onSelectFile={onSelectFile}
              searchQuery={searchQuery} onAddFolder={onAddFolder} fileMap={fileMap} />
          ))}
          {matchedFiles.length > 0 && (
            <div>
              {matchedFiles.map(id => {
                const f = fileMap[id]; if (!f) return null;
                const isSelected = selectedFileId === id;
                return (
                  <div key={id} onClick={() => onSelectFile(isSelected ? '' : id)}
                    style={{ paddingLeft: `${(depth + 1) * 14 + 4}px` }}
                    className={`flex items-center gap-2 py-1.5 pr-3 rounded-lg cursor-pointer transition-all group/file
                      ${isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'}`}>
                    <ExtIcon ext={f.ext} />
                    <span className={`text-xs flex-1 min-w-0 truncate ${isSelected ? 'text-blue-800 font-medium' : 'text-slate-700'}`}>
                      {f.name}
                    </span>
                    {f.rootCategories.length > 1 && (
                      <span title="Multi-catégorie" className="w-3.5 h-3.5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Tag className="w-2 h-2 text-amber-600" />
                      </span>
                    )}
                    <span className={`text-[10px] font-mono flex-shrink-0 ${isSelected ? 'text-blue-500' : 'text-slate-400'}`}>
                      {f.size}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Upload modal ─────────────────────────────────────────────────────────────

function UploadModal({ folderOptions, onClose }: { folderOptions: string[]; onClose: () => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-[480px] mx-4 pointer-events-auto overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Upload className="w-4 h-4 text-slate-400" /> Ajouter un document
            </h3>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-5 space-y-4">
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); }}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                ${dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-300'}`}>
              <Upload className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium text-slate-600 mb-1">Glissez vos fichiers ici</p>
              <p className="text-xs text-slate-400">PDF, Office, Images, DWG…</p>
              <input ref={inputRef} type="file" className="sr-only" multiple />
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Dossier de destination</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/40">
                  {folderOptions.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Tags (séparés par virgule)</label>
                <input type="text" placeholder="#réglementaire, #obligatoire, …"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300/40" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
              <button className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Ajouter
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

// ─── GED multi-site data ──────────────────────────────────────────────────────
// Documents issus de plusieurs résidences du patrimoine CROUS Lyon

const GED_FILES: DocFile[] = [
  // ── Résidence Cavalier (Centre / Lyon 6) ────────────────────────────────
  {
    id: 'ged-001', name: 'DTA — Résidence Jacques Cavalier 2023', ext: 'pdf',
    size: '4.7 Mo', date: '2023-05-08', author: 'APAVE',
    tags: ['#réglementaire', '#amiante', '#DTA', '#obligatoire', '#résidence-Cavalier'],
    rootCategories: ['reglementaire'], subfolder: 'DTA',
    specialCategories: ['DTA'],
    siteId: 'a1000001-0000-0000-0000-000000000003',
    residenceId: 'b1000001-0000-0000-0000-000000000011',
    previewPdf: '/Amiante-exemple-dta.pdf',
    description: 'DTA complet — Résidence Jacques Cavalier, Campus Centre Lyon 6.'
  },
  {
    id: 'ged-002', name: 'DTA — Résidence Jussieu 2024', ext: 'pdf',
    size: '3.9 Mo', date: '2024-02-14', author: 'SOCOTEC',
    tags: ['#réglementaire', '#amiante', '#DTA', '#obligatoire', '#résidence-Jussieu'],
    rootCategories: ['reglementaire'], subfolder: 'DTA',
    specialCategories: ['DTA'],
    siteId: 'a1000001-0000-0000-0000-000000000001',
    residenceId: 'b1000001-0000-0000-0000-000000000001',
    previewPdf: '/Amiante-exemple-dta.pdf',
    description: 'Mise à jour DTA post-travaux isolation — Résidence Jussieu, Campus La Doua.'
  },
  {
    id: 'ged-003', name: 'DTA — Résidence Paradin 2022', ext: 'pdf',
    size: '5.1 Mo', date: '2022-09-20', author: 'Bureau Veritas',
    tags: ['#réglementaire', '#amiante', '#DTA', '#obligatoire', '#résidence-Paradin'],
    rootCategories: ['reglementaire'], subfolder: 'DTA',
    specialCategories: ['DTA'],
    siteId: 'a1000001-0000-0000-0000-000000000002',
    residenceId: 'b1000001-0000-0000-0000-000000000008',
    previewPdf: '/Amiante-exemple-dta.pdf',
  },
  {
    id: 'ged-004', name: 'DTA — Résidence La Madeleine 2024', ext: 'pdf',
    size: '4.2 Mo', date: '2024-04-10', author: 'APAVE',
    tags: ['#réglementaire', '#amiante', '#DTA', '#obligatoire'],
    rootCategories: ['reglementaire'], subfolder: 'DTA',
    specialCategories: ['DTA'],
    siteId: 'a1000001-0000-0000-0000-000000000004',
    residenceId: 'b1000001-0000-0000-0000-000000000013',
    previewPdf: '/Amiante-exemple-dta.pdf',
  },
  {
    id: 'ged-005', name: 'DTA — Résidence Alice Guy 2023', ext: 'pdf',
    size: '3.3 Mo', date: '2023-11-05', author: 'DEKRA',
    tags: ['#réglementaire', '#amiante', '#DTA', '#obligatoire'],
    rootCategories: ['reglementaire'], subfolder: 'DTA',
    specialCategories: ['DTA'],
    siteId: 'a1000001-0000-0000-0000-000000000005',
    residenceId: 'b1000001-0000-0000-0000-000000000018',
    previewPdf: '/Amiante-exemple-dta.pdf',
  },
  // ── Charges Bailleur-Preneur ─────────────────────────────────────────────
  {
    id: 'ged-006', name: 'Annexe 4 — Répartition des charges — Cavalier 2025', ext: 'pdf',
    size: '1.2 Mo', date: '2025-09-01', author: 'Service juridique CROUS',
    tags: ['#administratif', '#charges', '#bailleur-preneur', '#résidence-Cavalier'],
    rootCategories: ['administratif'], subfolder: 'Charges Bailleur-Preneur',
    specialCategories: ['charges_bailleur'],
    siteId: 'a1000001-0000-0000-0000-000000000003',
    residenceId: 'b1000001-0000-0000-0000-000000000011',
    previewPdf: '/Annexe_4_-_Tableau_standard_de_repartition_des_charges_annexe_aux_baux.pdf',
    description: 'Tableau standard de répartition des charges annexé aux baux — année universitaire 2025-2026.'
  },
  {
    id: 'ged-007', name: 'Annexe 4 — Répartition des charges — Jussieu 2025', ext: 'pdf',
    size: '1.1 Mo', date: '2025-09-01', author: 'Service juridique CROUS',
    tags: ['#administratif', '#charges', '#bailleur-preneur', '#résidence-Jussieu'],
    rootCategories: ['administratif'], subfolder: 'Charges Bailleur-Preneur',
    specialCategories: ['charges_bailleur'],
    siteId: 'a1000001-0000-0000-0000-000000000001',
    residenceId: 'b1000001-0000-0000-0000-000000000001',
    previewPdf: '/Annexe_4_-_Tableau_standard_de_repartition_des_charges_annexe_aux_baux.pdf',
  },
  {
    id: 'ged-008', name: 'Annexe 3 — Répartition travaux Propriétaire/Gestionnaire 2026', ext: 'pdf',
    size: '0.9 Mo', date: '2026-01-15', author: 'Direction patrimoine CROUS',
    tags: ['#administratif', '#charges', '#bailleur-preneur', '#travaux', '#propriétaire-gestionnaire'],
    rootCategories: ['administratif'], subfolder: 'Charges Bailleur-Preneur',
    specialCategories: ['charges_bailleur'],
    previewPdf: '/Annexe_4_-_Tableau_standard_de_repartition_des_charges_annexe_aux_baux.pdf',
    description: 'Document de référence CROUS : répartition des travaux entre propriétaire et gestionnaire.'
  },
  {
    id: 'ged-009', name: 'Annexe 4 — Répartition charges — Garibaldi 2025', ext: 'pdf',
    size: '1.0 Mo', date: '2025-09-01', author: 'Service juridique CROUS',
    tags: ['#administratif', '#charges', '#bailleur-preneur', '#résidence-Garibaldi'],
    rootCategories: ['administratif'], subfolder: 'Charges Bailleur-Preneur',
    specialCategories: ['charges_bailleur'],
    siteId: 'a1000001-0000-0000-0000-000000000004',
    residenceId: 'b1000001-0000-0000-0000-000000000015',
    previewPdf: '/Annexe_4_-_Tableau_standard_de_repartition_des_charges_annexe_aux_baux.pdf',
  },
  // ── Rapports réglementaires multi-sites ──────────────────────────────────
  {
    id: 'ged-010', name: 'Rapport incendie — Résidence Jussieu T1 2026', ext: 'pdf',
    size: '1.8 Mo', date: '2026-01-21', author: 'SOCOTEC',
    tags: ['#réglementaire', '#contrôle-incendie', '#périodique', '#résidence-Jussieu'],
    rootCategories: ['reglementaire'], subfolder: 'Rapports de contrôle',
    siteId: 'a1000001-0000-0000-0000-000000000001',
    residenceId: 'b1000001-0000-0000-0000-000000000001',
    previewPdf: '/Amiante-exemple-dta.pdf',
  },
  {
    id: 'ged-011', name: 'Rapport incendie — Résidence Garibaldi T1 2026', ext: 'pdf',
    size: '1.5 Mo', date: '2026-02-10', author: 'SOCOTEC',
    tags: ['#réglementaire', '#contrôle-incendie', '#périodique', '#résidence-Garibaldi'],
    rootCategories: ['reglementaire'], subfolder: 'Rapports de contrôle',
    siteId: 'a1000001-0000-0000-0000-000000000004',
    residenceId: 'b1000001-0000-0000-0000-000000000015',
    previewPdf: '/Amiante-exemple-dta.pdf',
  },
  {
    id: 'ged-012', name: 'Rapport contrôle ascenseurs — Campus La Doua 2025', ext: 'pdf',
    size: '2.4 Mo', date: '2025-10-15', author: 'Bureau Veritas',
    tags: ['#réglementaire', '#contrôle-ascenseur', '#périodique', '#campus-Doua'],
    rootCategories: ['reglementaire'], subfolder: 'Rapports de contrôle',
    specialCategories: undefined,
    equipementCat: 'Ascenseurs',
    siteId: 'a1000001-0000-0000-0000-000000000001',
    previewPdf: '/Amiante-exemple-dta.pdf',
    description: 'Contrôle périodique annuel de tous les ascenseurs du Campus La Doua.'
  },
  {
    id: 'ged-013', name: 'Rapport légionellose — Résidences Manufacture 2025', ext: 'pdf',
    size: '1.2 Mo', date: '2025-11-20', author: 'Alpes Contrôles',
    tags: ['#réglementaire', '#légionellose', '#eau-sanitaire', '#Manufacture'],
    rootCategories: ['reglementaire'], subfolder: 'Rapports de contrôle',
    equipementCat: 'Eau sanitaire',
    siteId: 'a1000001-0000-0000-0000-000000000004',
    previewPdf: '/Amiante-exemple-dta.pdf',
  },
  // ── Diagnostics multi-sites ──────────────────────────────────────────────
  {
    id: 'ged-014', name: 'DPE collectif — Campus La Doua 2024', ext: 'pdf',
    size: '3.2 Mo', date: '2024-06-15', author: 'Alpes Contrôles',
    tags: ['#réglementaire', '#DPE', '#diagnostic', '#campus-Doua', '#obligatoire'],
    rootCategories: ['reglementaire'], subfolder: 'Diagnostics',
    siteId: 'a1000001-0000-0000-0000-000000000001',
    previewPdf: '/Amiante-exemple-dta.pdf',
  },
  {
    id: 'ged-015', name: 'Diagnostic électrique — Manufacture des Tabacs 2023', ext: 'pdf',
    size: '2.1 Mo', date: '2023-09-10', author: 'DEKRA',
    tags: ['#réglementaire', '#diagnostic-électrique', '#Manufacture', '#obligatoire'],
    rootCategories: ['reglementaire', 'technique'], subfolder: 'Diagnostics',
    equipementCat: 'Électricité',
    siteId: 'a1000001-0000-0000-0000-000000000004',
    previewPdf: '/Amiante-exemple-dta.pdf',
  },
  // ── Contrats et finances ─────────────────────────────────────────────────
  {
    id: 'ged-016', name: 'Contrat maintenance chaufferies — Campus Doua 2024-2026', ext: 'pdf',
    size: '1.4 Mo', date: '2024-01-01', author: 'Service achats CROUS',
    tags: ['#administratif', '#contrat', '#chauffage', '#prestataire-ViessmannService'],
    rootCategories: ['administratif'], subfolder: 'Contrats de maintenance',
    equipementCat: 'Chauffage',
    siteId: 'a1000001-0000-0000-0000-000000000001',
    previewPdf: '/Annexe_4_-_Tableau_standard_de_repartition_des_charges_annexe_aux_baux.pdf',
  },
  {
    id: 'ged-017', name: 'Contrat maintenance ascenseurs — Multi-sites 2025-2027', ext: 'pdf',
    size: '2.0 Mo', date: '2025-01-01', author: 'Service achats CROUS',
    tags: ['#administratif', '#contrat', '#ascenseurs', '#prestataire-Schindler', '#multi-sites'],
    rootCategories: ['administratif'], subfolder: 'Contrats de maintenance',
    equipementCat: 'Ascenseurs',
    previewPdf: '/Annexe_4_-_Tableau_standard_de_repartition_des_charges_annexe_aux_baux.pdf',
    description: 'Marché pluriannuel Schindler — maintenance préventive et curative, 12 sites CROUS.'
  },
  {
    id: 'ged-018', name: 'Budget prévisionnel entretien 2026 — Tous sites', ext: 'xlsx',
    size: '0.8 Mo', date: '2025-12-01', author: 'Direction patrimoine',
    tags: ['#administratif', '#financier', '#budget', '#2026', '#multi-sites'],
    rootCategories: ['administratif'], subfolder: 'Finances',
  },
  // ── Plans et technique ───────────────────────────────────────────────────
  {
    id: 'ged-019', name: 'Plans architecturaux — Résidence Confluence 2022', ext: 'pdf',
    size: '14.2 Mo', date: '2022-06-20', author: 'Cabinet Moreau Architectes',
    tags: ['#technique', '#plan', '#résidence-Confluence', '#version-finale'],
    rootCategories: ['technique'], subfolder: 'Plans et relevés',
    siteId: 'a1000001-0000-0000-0000-000000000008',
    residenceId: 'b1000001-0000-0000-0000-000000000024',
    previewPdf: '/Plan-Armoire-Positive.pdf',
  },
  {
    id: 'ged-020', name: 'Inventaire équipements — Patrimoine CROUS 2025', ext: 'xlsx',
    size: '1.6 Mo', date: '2025-11-30', author: 'Service patrimoine',
    tags: ['#technique', '#patrimoine', '#inventaire', '#multi-sites'],
    rootCategories: ['technique'], subfolder: 'Inventaires',
  },
  {
    id: 'ged-021', name: 'Tableau de bord consommations énergie — 2025', ext: 'xlsx',
    size: '2.1 Mo', date: '2026-01-05', author: 'Service pilotage',
    tags: ['#technique', '#pilotage', '#énergie', '#multi-sites', '#2025'],
    rootCategories: ['technique'], subfolder: 'Pilotage',
  },
  {
    id: 'ged-022', name: 'Rapport HACCP cuisine — RU Manufacture janv. 2026', ext: 'pdf',
    size: '0.6 Mo', date: '2026-01-15', author: 'Responsable cuisine',
    tags: ['#réglementaire', '#HACCP', '#cuisine', '#Manufacture'],
    rootCategories: ['reglementaire'], subfolder: 'Rapports de contrôle',
    equipementCat: 'Électroménager',
    siteId: 'a1000001-0000-0000-0000-000000000004',
    previewPdf: '/Amiante-exemple-dta.pdf',
  },
];

const GED_TREE: FolderNode[] = [
  {
    id: 'ged-root-reglementaire', label: 'Réglementaire', root: 'reglementaire', files: [],
    subfolders: [
      { id: 'ged-regl-dta',      label: 'DTA (Amiante)',           root: 'reglementaire', files: ['ged-001', 'ged-002', 'ged-003', 'ged-004', 'ged-005'] },
      { id: 'ged-regl-rapports', label: 'Rapports de contrôle',    root: 'reglementaire', files: ['ged-010', 'ged-011', 'ged-012', 'ged-013', 'ged-022'] },
      { id: 'ged-regl-diag',     label: 'Diagnostics',             root: 'reglementaire', files: ['ged-014', 'ged-015'] },
    ],
  },
  {
    id: 'ged-root-administratif', label: 'Administratif', root: 'administratif', files: [],
    subfolders: [
      { id: 'ged-admin-charges',    label: 'Charges Bailleur-Preneur', root: 'administratif', files: ['ged-006', 'ged-007', 'ged-008', 'ged-009'] },
      { id: 'ged-admin-contrats',   label: 'Contrats de maintenance',  root: 'administratif', files: ['ged-016', 'ged-017'] },
      { id: 'ged-admin-finances',   label: 'Finances',                  root: 'administratif', files: ['ged-018'] },
    ],
  },
  {
    id: 'ged-root-technique', label: 'Technique', root: 'technique', files: [],
    subfolders: [
      { id: 'ged-tech-plans',      label: 'Plans et relevés',   root: 'technique', files: ['ged-019'] },
      { id: 'ged-tech-inventaire', label: 'Inventaires',         root: 'technique', files: ['ged-020'] },
      { id: 'ged-tech-pilotage',   label: 'Pilotage',            root: 'technique', files: ['ged-021'] },
    ],
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  context?: Context;
  gedFilters?: GedFilters;
}

const MIN_TREE_WIDTH = 180;
const MAX_TREE_WIDTH = 600;
const DEFAULT_TREE_WIDTH = 280;

export default function DocumentsArborescence({ context = 'site', gedFilters }: Props) {
  const isEquipement = context === 'equipement';
  const isGed        = context === 'ged';

  const rawSourceFiles = isGed ? GED_FILES : isEquipement ? EQUIP_FILES : SITE_FILES;
  const rawSourceTree  = isGed ? GED_TREE  : isEquipement ? EQUIP_TREE  : SITE_TREE;

  // Apply GED filters to file list
  const sourceFiles = useMemo(() => {
    if (!isGed || !gedFilters) return rawSourceFiles;
    const f = gedFilters;
    return rawSourceFiles.filter(doc => {
      // Root categories
      if (f.rootCategories.length > 0 && !doc.rootCategories.some(r => f.rootCategories.includes(r))) return false;
      // Special categories
      if (f.specialCategories.length > 0 && !f.specialCategories.some(sc => doc.specialCategories?.includes(sc))) return false;
      // Sites
      if (f.siteIds.length > 0 && doc.siteId && !f.siteIds.includes(doc.siteId)) return false;
      // Residences
      if (f.residenceIds.length > 0 && doc.residenceId && !f.residenceIds.includes(doc.residenceId)) return false;
      // Equipement categories
      if (f.equipementCats.length > 0 && doc.equipementCat && !f.equipementCats.includes(doc.equipementCat)) return false;
      // Period filter
      if (f.periodPreset || f.dateFrom || f.dateTo) {
        const docDate = new Date(doc.date);
        if (f.periodPreset) {
          const now = new Date();
          if (f.periodPreset === 'last30' && docDate < new Date(now.getTime() - 30 * 86400000)) return false;
          if (f.periodPreset === 'last90' && docDate < new Date(now.getTime() - 90 * 86400000)) return false;
          if (f.periodPreset === 'older'  && docDate >= new Date('2023-01-01')) return false;
          if (/^\d{4}$/.test(f.periodPreset)) {
            const y = parseInt(f.periodPreset);
            if (docDate.getFullYear() !== y) return false;
          }
        }
        if (f.dateFrom && docDate < new Date(f.dateFrom)) return false;
        if (f.dateTo   && docDate > new Date(f.dateTo))   return false;
      }
      return true;
    });
  }, [isGed, gedFilters, rawSourceFiles]);

  // Build a filtered tree that only shows file IDs present in sourceFiles
  const sourceTree = useMemo(() => {
    if (!isGed || !gedFilters) return rawSourceTree;
    const allowedIds = new Set(sourceFiles.map(f => f.id));
    const filterNode = (node: FolderNode): FolderNode => ({
      ...node,
      files: node.files.filter(id => allowedIds.has(id)),
      subfolders: node.subfolders?.map(filterNode),
    });
    return rawSourceTree.map(filterNode);
  }, [isGed, gedFilters, rawSourceTree, sourceFiles]);

  const fileMap = useMemo(
    () => Object.fromEntries(rawSourceFiles.map(f => [f.id, f])),
    [rawSourceFiles]
  );

  const [tree, setTree]                   = useState<FolderNode[]>(sourceTree);
  const [search, setSearch]               = useState('');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [activeRootFilter, setActiveRootFilter] = useState<RootCategory | null>(null);

  // Sync tree when filtered source changes (GED mode)
  useEffect(() => {
    if (isGed) setTree(sourceTree);
  }, [isGed, sourceTree]);
  const [showUpload, setShowUpload]         = useState(false);
  const [newFolderParent, setNewFolderParent] = useState<FolderNode | null>(null);
  const [treeWidth, setTreeWidth]           = useState(DEFAULT_TREE_WIDTH);
  const draggingRef  = useRef(false);
  const startXRef    = useRef(0);
  const startWRef    = useRef(0);

  // Reset selected file when context changes (non-GED)
  useEffect(() => {
    if (!isGed) { setSelectedFileId(null); setTree(isEquipement ? EQUIP_TREE : SITE_TREE); }
  }, [isEquipement, isGed]);

  const selectedFile = selectedFileId ? fileMap[selectedFileId] : null;

  const stats = useMemo(() => {
    const counts: Record<RootCategory, number> = { technique: 0, administratif: 0, reglementaire: 0 };
    sourceFiles.forEach(f => f.rootCategories.forEach(r => counts[r]++));
    return counts;
  }, [sourceFiles]);

  const visibleTree = useMemo(() =>
    activeRootFilter ? tree.filter(n => n.root === activeRootFilter) : tree,
    [tree, activeRootFilter]
  );

  // Resizable column
  const onDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    startXRef.current   = e.clientX;
    startWRef.current   = treeWidth;
    const onMove = (ev: MouseEvent) => {
      if (!draggingRef.current) return;
      const delta = ev.clientX - startXRef.current;
      setTreeWidth(Math.min(MAX_TREE_WIDTH, Math.max(MIN_TREE_WIDTH, startWRef.current + delta)));
    };
    const onUp = () => { draggingRef.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [treeWidth]);

  // Add folder
  const handleAddFolderConfirm = useCallback((name: string, root: RootCategory) => {
    if (!newFolderParent) return;
    const newNode: FolderNode = {
      id: `user-${Date.now()}`,
      label: name,
      root,
      files: [],
      isUserCreated: true,
    };
    const insertInto = (nodes: FolderNode[]): FolderNode[] =>
      nodes.map(n => n.id === newFolderParent.id
        ? { ...n, subfolders: [...(n.subfolders ?? []), newNode] }
        : { ...n, subfolders: n.subfolders ? insertInto(n.subfolders) : n.subfolders }
      );
    setTree(prev => insertInto(prev));
    setNewFolderParent(null);
  }, [newFolderParent]);

  // Build flat folder option list for upload modal
  const folderOptions = useMemo(() => {
    const opts: string[] = [];
    const walk = (nodes: FolderNode[], prefix: string) =>
      nodes.forEach(n => { opts.push(`${prefix}${n.label}`); walk(n.subfolders ?? [], `${prefix}${n.label} / `); });
    walk(tree, '');
    return opts;
  }, [tree]);

  const totalCount = sourceFiles.length;
  const multiTagCount = sourceFiles.filter(f => f.rootCategories.length > 1).length;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 bg-white flex-shrink-0 flex-wrap">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher nom, tag…"
            className="w-full pl-8 pr-7 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/40 text-slate-700" />
          {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"><X className="w-3 h-3" /></button>}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          {(Object.keys(ROOT_LABELS) as RootCategory[]).map(root => {
            const cfg = ROOT_LABELS[root];
            const isActive = activeRootFilter === root;
            return (
              <button key={root} onClick={() => setActiveRootFilter(isActive ? null : root)}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium transition-all
                  ${isActive ? `${cfg.bg} ${cfg.color} ${cfg.border}` : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                <Folder className="w-3 h-3" />
                {cfg.label}
                <span className={`text-[9px] px-1 rounded-full ${isActive ? cfg.bg : 'bg-slate-100 text-slate-400'}`}>{stats[root]}</span>
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-slate-400">
            {totalCount} doc{totalCount > 1 ? 's' : ''}
            {multiTagCount > 0 && <span className="ml-1 text-amber-600">· {multiTagCount} multi-cat.</span>}
          </span>
          <button onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
            <Plus className="w-3.5 h-3.5" /> Ajouter
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Tree column (resizable) */}
        <div
          className="flex-shrink-0 overflow-y-auto overflow-x-hidden border-r border-slate-100 p-2 space-y-0.5"
          style={{ width: treeWidth }}
        >
          {visibleTree.map(node => (
            <TreeFolderNode key={node.id} node={node} depth={0}
              selectedFileId={selectedFileId}
              onSelectFile={id => setSelectedFileId(id === selectedFileId ? null : id)}
              searchQuery={search}
              onAddFolder={n => setNewFolderParent(n)}
              fileMap={fileMap}
            />
          ))}
          {visibleTree.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Folder className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-xs">Aucun dossier</p>
            </div>
          )}
        </div>

        {/* Resize divider */}
        <div
          onMouseDown={onDividerMouseDown}
          className="w-1.5 flex-shrink-0 cursor-col-resize relative group hover:bg-blue-50 transition-colors"
          title="Redimensionner"
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-slate-200 group-hover:bg-blue-400 transition-colors" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-3 h-3 text-blue-400" />
          </div>
        </div>

        {/* Preview / detail column */}
        <div className="flex-1 min-w-0 flex overflow-hidden">
          {selectedFile ? (
            <>
              {/* PDF preview */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <PdfPreviewPanel file={selectedFile} fileMap={fileMap} />
              </div>
              {/* File info sidebar */}
              <FileDetailSidebar file={selectedFile} onClose={() => setSelectedFileId(null)} />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/40">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-3">
                <FileText className="w-7 h-7 opacity-20" />
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">Sélectionnez un fichier</p>
              <p className="text-xs text-slate-400">Cliquez sur un fichier dans l'arborescence pour l'afficher</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-1.5 border-t border-slate-100 bg-slate-50/60 flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <Tag className="w-3 h-3 text-amber-500" />
          Un fichier peut apparaître dans plusieurs catégories (multi-tag)
        </div>
        <div className="ml-auto flex items-center gap-1 text-[10px] text-slate-400">
          <GripVertical className="w-3 h-3" />
          Glissez le séparateur pour redimensionner l'arborescence
        </div>
      </div>

      {newFolderParent && (
        <NewFolderModal
          parentLabel={newFolderParent.label}
          onConfirm={handleAddFolderConfirm}
          onClose={() => setNewFolderParent(null)}
        />
      )}
      {showUpload && <UploadModal folderOptions={folderOptions} onClose={() => setShowUpload(false)} />}
    </div>
  );
}
