import { useState } from 'react';
import {
  DoorOpen, MapPin, Wrench, ClipboardList, ShieldCheck,
  ChevronRight, X, FileText, Calendar, Tag,
  Maximize2, BarChart3, Building2, Layers, Grid2x2,
} from 'lucide-react';
import { usePatrimoineStore } from '../store/patrimoineStore';
import QRCodeButton from './QRCodeButton';
import EquipementsTableau from './EquipementsTableau';
import type { Equipement } from '../types/patrimoine';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'details' | 'equipements' | 'interventions' | 'controles' | 'documents';

const TAB_LIST: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'details',       label: 'Détails',       icon: DoorOpen },
  { id: 'equipements',   label: 'Équipements',   icon: Wrench },
  { id: 'interventions', label: 'Interventions', icon: ClipboardList },
  { id: 'controles',     label: 'Contrôles',     icon: ShieldCheck },
  { id: 'documents',     label: 'Documents',     icon: FileText },
];

// ─── Mock data ────────────────────────────────────────────────────────────────

function buildPieceEquipements(pieceNom: string): Equipement[] {
  const base = [
    { id: 'e1', identifiant: 'EL-001', designation: 'Luminaire LED encastré',    categorie: 'eclairage',     marque: 'Philips',   modele: 'CorePro 30W', etat: 'fonctionnel',   date_mise_en_service: '2022-09-01' },
    { id: 'e2', identifiant: 'VM-001', designation: "Bouche d'extraction VMC",    categorie: 'cvc',           marque: 'Aldes',     modele: 'Hygrostat',  etat: 'fonctionnel',   date_mise_en_service: '2021-06-01' },
    { id: 'e3', identifiant: 'CH-001', designation: 'Radiateur électrique',       categorie: 'cvc',           marque: 'Atlantic',  modele: 'Galéo 1500W',etat: 'en_maintenance',date_mise_en_service: '2020-10-01' },
    { id: 'e4', identifiant: 'IN-001', designation: 'Détecteur de fumée',         categorie: 'incendie',      marque: 'Kidde',     modele: '10Y29',      etat: 'fonctionnel',   date_mise_en_service: '2023-01-15' },
    { id: 'e5', identifiant: 'MO-001', designation: 'Tableau + chaises (x25)',    categorie: 'mobilier',      marque: 'Moblibre',  modele: 'École+',     etat: 'moyen',         date_mise_en_service: '2019-09-01' },
    { id: 'e6', identifiant: 'EL-002', designation: 'Interrupteur variateur',     categorie: 'electricite',   marque: 'Legrand',   modele: 'Céliane',    etat: 'fonctionnel',   date_mise_en_service: '2022-09-01' },
  ];
  return base.map(e => ({
    ...e,
    logement_id: null,
    numero_serie: null,
    caracteristiques: { quantite: 1, statut: e.etat === 'en_maintenance' ? 'en_maintenance' : 'en_service', garantie: false },
    created_at: `${e.date_mise_en_service}T00:00:00Z`,
    updated_at: '2024-01-01T00:00:00Z',
  })) as Equipement[];
}

const MOCK_INTERVENTIONS = [
  { id: 'i1', titre: 'Remplacement luminaire défectueux', statut: 'planifiee', date_planifiee: '2026-07-15', priorite: 'normale', agent_nom: 'Dupont A.' },
  { id: 'i2', titre: 'Vérification bouche VMC', statut: 'terminee', date_planifiee: '2026-05-10', priorite: 'basse', agent_nom: 'Martin D.' },
];

const MOCK_CONTROLES = [
  { id: 'c1', type: 'Électricité', organisme: 'Bureau Veritas', statut: 'conforme', date: '2025-11-14', echeance: '2026-11-14' },
  { id: 'c2', type: 'Incendie',    organisme: 'SOCOTEC',        statut: 'a_venir',  date: null,          echeance: '2026-09-01' },
];

const MOCK_DOCUMENTS = [
  { id: 'd1', nom: 'Plan de la pièce — RdC', type: 'plan',  date: '2024-03-01' },
  { id: 'd2', nom: 'Rapport de contrôle électrique', type: 'rapport', date: '2025-11-14' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR');
}

function StatutBadge({ statut }: { statut: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    fonctionnel:    { label: 'Fonctionnel',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    en_maintenance: { label: 'En maintenance', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    hors_service:   { label: 'Hors service',   cls: 'bg-red-50 text-red-700 border-red-200' },
    disponible:     { label: 'Disponible',     cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    indisponible:   { label: 'Indisponible',   cls: 'bg-red-50 text-red-700 border-red-200' },
    planifiee:      { label: 'Planifiée',      cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    terminee:       { label: 'Terminée',       cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    conforme:       { label: 'Conforme',       cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    non_conforme:   { label: 'Non conforme',   cls: 'bg-red-50 text-red-700 border-red-200' },
    a_venir:        { label: 'À venir',        cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  };
  const cfg = map[statut] ?? { label: statut, cls: 'bg-slate-50 text-slate-600 border-slate-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── Technical characteristics per piece name ────────────────────────────────

interface PieceData {
  fonction?: string;
  surface?: number;
  etage?: string;
  batiment?: string;
  domaine?: string;
  adresse?: string;
  [key: string]: unknown;
}

interface CaractTechnique {
  label: string;
  value: string;
  col?: 'left' | 'right';
}

const PIECE_CARACT: Record<string, CaractTechnique[]> = {
  'Classe CM1': [
    { label: 'Type de murs porteurs',                value: 'Brique pleine, béton banché' },
    { label: 'Type de plancher',                     value: 'Dalle pleine en béton' },
    { label: 'Type de menuiseries extérieures',      value: 'PVC double battant ; fenêtres et porte-fenêtre' },
    { label: 'Type de vitrage',                      value: 'Double vitrage — isolation phonique et thermique' },
    { label: "Type d'isolation",                     value: 'Laine de roche (murs), polystyrène (sol)' },
    { label: "Épaisseur d'isolation",                value: '80 mm murs / 60 mm sol' },
    { label: 'Type de revêtement de façade',         value: 'Enduit ciment peint' },
    { label: 'Type de revêtement de sol',            value: 'Carrelage céramique 30×30' },
    { label: 'Type de cloison intérieure',           value: 'Placo BA13 sur ossature métal' },
    { label: 'Type de chauffage',                    value: 'Collectif — radiateurs eau chaude' },
    { label: "Type de production d'eau chaude sanitaire", value: 'Électrique — chauffe-eau collectif' },
    { label: 'Type de ventilation',                  value: 'Mécanique contrôlée (VMC simple flux)' },
    { label: "Type d'éclairage",                     value: 'Artificiel LED — 24 luminaires encastrés' },
    { label: "Type d'énergie renouvelable utilisée", value: 'Aucune (prévu : panneaux solaires 2027)' },
  ],
};

// ─── Tab details (2-column layout) ────────────────────────────────────────────

function TabDetails({ data, nom, gallery }: { data: PieceData; nom: string; gallery: React.ReactNode }) {
  const caract = PIECE_CARACT[nom] ?? [];

  return (
    <div>
      {/* Gallery inside details tab, matching Logement 108 pattern */}
      {gallery && (
        <div className="px-6 pt-4 pb-2">
          {gallery}
        </div>
      )}

      <div className="px-6 py-5">
        {/* Two-column grid for main info */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-0 mb-2">
          {/* Left column */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Identification</h3>
            <ColDetailRow label="Désignation"  value={nom} />
            <ColDetailRow label="Fonction"     value={data.fonction ?? '—'} />
            <ColDetailRow label="Surface"      value={data.surface ? `${data.surface} m²` : '—'} />
          </div>
          {/* Right column */}
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Localisation</h3>
            <ColDetailRow label="Domaine"   value={data.domaine ?? '—'} />
            <ColDetailRow label="Bâtiment"  value={data.batiment ?? '—'} />
            <ColDetailRow label="Niveau"    value={data.etage ?? '—'} />
            <ColDetailRow label="Adresse"   value={data.adresse ?? '—'} />
          </div>
        </div>

        {/* État — full width row */}
        <div className="border-t border-slate-100 pt-3 mb-5">
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide w-32 flex-shrink-0">Statut</span>
            <StatutBadge statut="fonctionnel" />
          </div>
        </div>

        {/* Technical characteristics — only when defined */}
        {caract.length > 0 && (
          <>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
              Caractéristiques techniques
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-0">
              {/* Split into two equal columns */}
              <div>
                {caract.slice(0, Math.ceil(caract.length / 2)).map(c => (
                  <ColDetailRow key={c.label} label={c.label} value={c.value} />
                ))}
              </div>
              <div>
                {caract.slice(Math.ceil(caract.length / 2)).map(c => (
                  <ColDetailRow key={c.label} label={c.label} value={c.value} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ColDetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col py-2 border-b border-slate-50 last:border-0">
      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</span>
      <span className="text-sm text-slate-700">{value ?? '—'}</span>
    </div>
  );
}

function TabEquipements({ pieceNom }: { pieceNom: string }) {
  const equipements = buildPieceEquipements(pieceNom);
  return (
    <div className="flex flex-col" style={{ height: '100%' }}>
      <EquipementsTableau equipements={equipements} />
    </div>
  );
}

function TabInterventions() {
  return (
    <div className="p-4 space-y-2">
      <p className="text-xs text-slate-500 mb-3">{MOCK_INTERVENTIONS.length} intervention(s)</p>
      {MOCK_INTERVENTIONS.map(it => (
        <div key={it.id} className="p-3 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <span className="font-medium text-sm text-slate-800">{it.titre}</span>
            <StatutBadge statut={it.statut} />
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(it.date_planifiee)}</span>
            <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {it.priorite}</span>
            {it.agent_nom && <span>{it.agent_nom}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function TabControles() {
  return (
    <div className="p-4 space-y-2">
      <p className="text-xs text-slate-500 mb-3">{MOCK_CONTROLES.length} contrôle(s) réglementaire(s)</p>
      {MOCK_CONTROLES.map(ctrl => (
        <div key={ctrl.id} className="p-3 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <span className="font-medium text-sm text-slate-800">{ctrl.type}</span>
            <StatutBadge statut={ctrl.statut} />
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>{ctrl.organisme}</span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Échéance : {formatDate(ctrl.echeance)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TabDocuments() {
  return (
    <div className="p-4 space-y-2">
      <p className="text-xs text-slate-500 mb-3">{MOCK_DOCUMENTS.length} document(s)</p>
      {MOCK_DOCUMENTS.map(doc => (
        <div key={doc.id} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:border-slate-200 transition-colors cursor-pointer group">
          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <FileText className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-700 transition-colors">{doc.nom}</p>
            <p className="text-xs text-slate-400">{doc.type} · {formatDate(doc.date)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

// Per-piece media configs: keyed by node name for specific overrides
interface GalleryMedia {
  photos: string[];
  planPiece: string;
  planEtage: string | null;
  localisation: string;
}

const PIECE_MEDIA: Record<string, GalleryMedia> = {
  'Classe CM1': {
    photos: [
      '/images/site/Ferry-Jules/Classe-CM1/Classe-CM1.png',
    ],
    planPiece:    '/images/site/Ferry-Jules/Classe-CM1/Plan-Classe-Ecole-Elementaire-Jules-Ferry.png',
    planEtage:    '/images/site/Ferry-Jules/Classe-CM1/Plan-Bati-Ecole-Elementaire-Jules-Ferry.png',
    localisation: '/images/site/Ferry-Jules/Classe-CM1/Ecole-Elementaire-Jules-Ferry-Carte.png',
  },
  'Classe GS': {
    photos: [
      '/images/site/Ecole-Angèle-Vannier/Classe-Maternelle-Grande-Section.jpg',
      '/images/site/Ecole-Angele-Vannier/Ecole-Angele-Vannier_Saint-Malo.png',
    ],
    planPiece:    '/images/site/Ecole-Angele-Vannier/Ecole-Angele-Vannier_Saint-Malo.png',
    planEtage:    '/images/site/Ferry-Jules/Classe-CM1/Plan-Bati-Ecole-Elementaire-Jules-Ferry copy copy.png',
    localisation: '/images/site/Ecole-Angèle-Vannier/Localisation-Groupe_Scolaire_Angèle_Vannier-OSM copy copy.png',
  },
};

const DEFAULT_MEDIA: GalleryMedia = {
  photos: ['https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800'],
  planPiece: 'https://images.pexels.com/photos/3990359/pexels-photo-3990359.jpeg?auto=compress&cs=tinysrgb&w=800',
  planEtage: null,
  localisation: 'https://images.pexels.com/photos/1738985/pexels-photo-1738985.jpeg?auto=compress&cs=tinysrgb&w=800',
};

type LightboxSlot = 'photos' | 'planPiece' | 'planEtage' | 'localisation';

function PieceGallery({ nom, batiment, etage }: { nom: string; batiment: string; etage: string }) {
  const media = PIECE_MEDIA[nom] ?? DEFAULT_MEDIA;
  const [lightbox, setLightbox] = useState<LightboxSlot | null>(null);
  const [photoIdx, setPhotoIdx] = useState(0);

  const lightboxSrc =
    lightbox === 'photos'      ? media.photos[photoIdx] :
    lightbox === 'planPiece'   ? media.planPiece :
    lightbox === 'planEtage'   ? (media.planEtage ?? '') :
    lightbox === 'localisation'? media.localisation : '';

  const lightboxLabel =
    lightbox === 'photos'       ? nom :
    lightbox === 'planPiece'    ? `Plan pièce — ${nom}` :
    lightbox === 'planEtage'    ? `Plan bâtiment — ${etage} · ${batiment}` :
    'Localisation';

  return (
    <>
      {/* 4-panel gallery matching Logement 108 layout */}
      <div className="flex gap-1.5" style={{ height: 220 }}>

        {/* Panel 1 — Photos (wide left) */}
        <div
          className="relative overflow-hidden rounded-l-xl cursor-pointer group bg-slate-100"
          style={{ flex: '0 0 45%' }}
          onClick={() => setLightbox('photos')}
        >
          <img
            src={media.photos[photoIdx]}
            alt={nom}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          {/* Multi-photo indicator */}
          {media.photos.length > 1 && (
            <div className="absolute top-3 right-3 flex gap-1">
              {media.photos.map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setPhotoIdx(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === photoIdx ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          )}
          <button className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors">
            <Grid2x2 className="w-3.5 h-3.5" />
            Toutes les photos
          </button>
        </div>

        {/* Panel 2 — Plan pièce */}
        <div
          className="relative overflow-hidden cursor-pointer group bg-white border border-slate-100"
          style={{ flex: '0 0 18%' }}
          onClick={() => setLightbox('planPiece')}
        >
          <img
            src={media.planPiece}
            alt="Plan de la pièce"
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <button className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-2 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors whitespace-nowrap">
            <Maximize2 className="w-3 h-3 flex-shrink-0" />
            Plan pièce
          </button>
        </div>

        {/* Panel 3 — Plan bâtiment / étage */}
        <div
          className="relative overflow-hidden cursor-pointer group bg-white border border-slate-100"
          style={{ flex: '0 0 18%' }}
          onClick={() => setLightbox('planEtage')}
        >
          {media.planEtage ? (
            <img
              src={media.planEtage}
              alt="Plan du bâtiment"
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-50">
              <BarChart3 className="w-8 h-8 text-slate-200" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <button className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-2 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors whitespace-nowrap">
            <Maximize2 className="w-3 h-3 flex-shrink-0" />
            Plan étage
          </button>
        </div>

        {/* Panel 4 — Localisation */}
        <div
          className="relative flex-1 overflow-hidden rounded-r-xl cursor-pointer group"
          onClick={() => setLightbox('localisation')}
        >
          <img
            src={media.localisation}
            alt="Localisation"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <button className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors whitespace-nowrap">
            <MapPin className="w-3 h-3" />
            Localisation
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-6"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
          <img
            src={lightboxSrc}
            alt={lightboxLabel}
            className="max-w-full max-h-full rounded-xl object-contain"
            onClick={e => e.stopPropagation()}
          />
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-xs">
            {lightboxLabel}
          </p>
        </div>
      )}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface FichePieceProps {
  node: {
    id: string;
    type: string;
    nom: string;
    statut?: string;
    data?: PieceData;
    ancestors?: { type: string; nom: string; id: string }[];
  };
}

export default function FichePiece({ node }: FichePieceProps) {
  const { setSelectedNode } = usePatrimoineStore();
  const [activeTab, setActiveTab] = useState<Tab>('details');

  const data       = (node.data ?? {}) as PieceData;
  const ancestors  = node.ancestors ?? [];
  const batiment   = data.batiment ?? '—';
  const etage      = data.etage ?? '—';
  const adresse    = data.adresse ?? '';

  const letter = node.nom.trim()[0]?.toUpperCase() ?? 'P';
  const digits  = node.id.replace(/-/g, '').replace(/\D/g, '').slice(0, 4);
  const codeCourt = `${letter}${digits}`;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
              <DoorOpen className="w-5 h-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Pièce</span>
                <span className="text-xs font-mono font-semibold text-white bg-amber-500 px-1.5 py-0.5 rounded-md">{codeCourt}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight truncate">{node.nom}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <StatutBadge statut={node.statut ?? 'fonctionnel'} />
            <QRCodeButton value={`piece:${node.id}`} label={node.nom} />
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 flex-wrap mb-3">
          {ancestors.map((anc, i) => (
            <span key={anc.id} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />}
              <span className="text-xs text-slate-400 truncate max-w-[120px]" title={anc.nom}>{anc.nom}</span>
            </span>
          ))}
          {ancestors.length > 0 && <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />}
          <span className="text-xs font-semibold text-slate-700">{node.nom}</span>
        </div>

        {/* Meta pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {adresse && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="w-3 h-3" /> {adresse}
            </span>
          )}
          {batiment !== '—' && (
            <span className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              <Building2 className="w-3 h-3" /> {batiment}
            </span>
          )}
          {etage !== '—' && (
            <span className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              <Layers className="w-3 h-3" /> {etage}
            </span>
          )}
          {data.surface && (
            <span className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              {data.surface} m²
            </span>
          )}
        </div>
      </div>

      {/* Tabs — directly after header, matching Logement 108 layout */}
      <div className="flex-shrink-0 border-b border-slate-100 px-6">
        <div className="flex gap-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {TAB_LIST.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap flex-shrink-0
                  ${active
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content — gallery lives inside Détails tab */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'details' && (
          <TabDetails
            data={data}
            nom={node.nom}
            gallery={<PieceGallery nom={node.nom} batiment={batiment} etage={etage} />}
          />
        )}
        {activeTab === 'equipements'   && <TabEquipements pieceNom={node.nom} />}
        {activeTab === 'interventions' && <TabInterventions />}
        {activeTab === 'controles'     && <TabControles />}
        {activeTab === 'documents'     && <TabDocuments />}
      </div>
    </div>
  );
}

