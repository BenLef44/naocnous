import { useState, useEffect, useMemo } from 'react';
import InterventionsTableau, { buildMockInterventions } from './InterventionsTableau';
import ConsommationsTableau, { buildMockRelevesEquipement } from './ConsommationsTableau';
import ControlesOnglet from './ControlesOnglet';
import DocumentsArborescence from './DocumentsArborescence';
import ContratsTableau from './ContratsTableau';
import OngletRenouvellement from './OngletRenouvellement';
import OngletFinanceEquipement from './finance/OngletFinanceEquipement';
import MaintenancePreventive from './MaintenancePreventive';
import {
  X, ChevronRight, Maximize2, MapPin, Thermometer, Wind, Grid2x2 as Grid2X2,
  Tag, CheckCircle2, Clock, AlertTriangle, Calendar, Ruler,
  ShieldCheck, ShieldOff, Wrench, Activity, Hash, Package, ClipboardList, BarChart3, RefreshCw, Euro,
} from 'lucide-react';
import QRCodeButton from './QRCodeButton';
import photoArmoire   from '../assets/liebherr-armoire-refrigeree-positive-1430-litres-gkpv1470.png';
import planCuisine    from '../assets/Plan-Cuisine-RU.webp';
import localisationRU from '../assets/Localisation-RU-Manu-Tabacs.png';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface EquipementFiche {
  id: string;
  identifiant: string;
  designation: string;
  categorie: string;
  sous_categorie?: string | null;
  marque?: string | null;
  modele?: string | null;
  numero_serie?: string | null;
  etat?: string | null;
  localisation_detail?: string | null;
  date_mise_en_service?: string | null;
  garantie_fin?: string | null;
  caracteristiques?: Record<string, unknown> | null;
  ancestors?: { type: string; nom: string; id: string }[];
  site_label?: string;
  sous_niveau_label?: string;
  logement_id?: string | null;
  batiment_id?: string | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR');
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide w-44 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-slate-700 min-w-0 flex-1">{value ?? '—'}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-5 mb-1 first:mt-0">{children}</h3>
  );
}

function GridCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-slate-50">
      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide leading-tight">{label}</span>
      <span className="text-xs text-slate-700 font-medium leading-snug">{value ?? '—'}</span>
    </div>
  );
}

// ─── Statut badge ──────────────────────────────────────────────────────────────

const STATUT_CFG: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  en_service:     { label: 'En service',     bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  en_panne:       { label: 'En panne',       bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500'     },
  en_maintenance: { label: 'En maintenance', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-400'   },
  hors_service:   { label: 'Hors service',   bg: 'bg-slate-100',  text: 'text-slate-600',   border: 'border-slate-300',   dot: 'bg-slate-400'   },
  neutralise:     { label: 'Neutralisé',     bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-500'  },
  remplace:       { label: 'Remplacé',       bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-400'    },
  reforme:        { label: 'Réformé',        bg: 'bg-slate-100',  text: 'text-slate-600',   border: 'border-slate-300',   dot: 'bg-slate-500'   },
};

function StatutBadge({ statut }: { statut: string }) {
  const key = statut in STATUT_CFG ? statut : 'en_service';
  const cfg = STATUT_CFG[key];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Garantie ─────────────────────────────────────────────────────────────────

function garantieStatut(fin?: string | null): { label: string; cls: string; icon: React.ReactNode } {
  if (!fin) return { label: 'Non renseignée', cls: 'bg-slate-50 text-slate-500 border-slate-200', icon: <ShieldOff className="w-3.5 h-3.5" /> };
  const diff = (new Date(fin).getTime() - Date.now()) / 86400000;
  if (diff < 0)  return { label: 'Expirée',        cls: 'bg-red-50 text-red-700 border-red-200',             icon: <AlertTriangle className="w-3.5 h-3.5" /> };
  if (diff < 90) return { label: 'Expire bientôt', cls: 'bg-amber-50 text-amber-700 border-amber-200',       icon: <Clock         className="w-3.5 h-3.5" /> };
  return               { label: 'En cours',         cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2  className="w-3.5 h-3.5" /> };
}

// ─── Gallery modal ─────────────────────────────────────────────────────────────

interface GalleryPhoto { src: string; alt: string; label: string; }

function GalleryModal({ photos, initialIndex, onClose }: { photos: GalleryPhoto[]; initialIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(initialIndex);
  const photo = photos[idx];

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowLeft')  setIdx(i => (i - 1 + photos.length) % photos.length);
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % photos.length);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, photos.length]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90" onClick={onClose}>
      <div className="relative max-w-4xl w-full mx-4" onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white flex items-center gap-1.5 text-sm transition-colors">
          <X className="w-5 h-5" /> Fermer
        </button>
        <div className="relative bg-black rounded-xl overflow-hidden" style={{ maxHeight: '80vh' }}>
          <img src={photo.src} alt={photo.alt} className="w-full object-contain" style={{ maxHeight: '70vh' }} />
          <div className="absolute bottom-0 left-0 right-0 px-4 py-2.5 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-sm text-white font-medium">{photo.label}</p>
          </div>
        </div>
        {photos.length > 1 && (
          <div className="flex items-center justify-between mt-3">
            <button onClick={() => setIdx(i => (i - 1 + photos.length) % photos.length)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <div className="flex gap-1.5">
              {photos.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === idx ? 'bg-white' : 'bg-white/40'}`} />
              ))}
            </div>
            <button onClick={() => setIdx(i => (i + 1) % photos.length)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Plan technique SVG (Liebherr GKPV 1470 — inline, no file dependency) ──────

function PlanTechniqueSVG({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 500 540" className={className} xmlns="http://www.w3.org/2000/svg"
      style={{ background: '#fff' }} aria-label="Plan technique Liebherr GKPV 1470">
      {/* Cabinet body — isometric perspective */}
      {/* Top face */}
      <polygon points="180,60 360,60 430,110 250,110" fill="#f5f5f5" stroke="#222" strokeWidth="1.8"/>
      {/* Left face */}
      <polygon points="180,60 180,420 250,470 250,110" fill="#e8e8e8" stroke="#222" strokeWidth="1.8"/>
      {/* Front face */}
      <polygon points="250,110 430,110 430,470 250,470" fill="#f0f0f0" stroke="#222" strokeWidth="1.8"/>

      {/* Compressor bump on top */}
      <polygon points="280,52 360,52 400,72 320,72" fill="#e0e0e0" stroke="#222" strokeWidth="1.4"/>
      <polygon points="280,52 280,62 320,82 320,72" fill="#d8d8d8" stroke="#222" strokeWidth="1.4"/>
      <polygon points="320,72 400,72 400,82 320,82" fill="#e8e8e8" stroke="#222" strokeWidth="1.4"/>

      {/* Door panel on front — right half opens */}
      {/* Left door */}
      <rect x="256" y="116" width="82" height="346" fill="#ececec" stroke="#555" strokeWidth="1.2"/>
      {/* Right door — open, rotated 60° out */}
      <polygon points="340,116 428,116 510,160 422,160" fill="#e4e4e4" stroke="#555" strokeWidth="1.2"/>
      <polygon points="340,116 340,462 422,506 422,160" fill="#dcdcdc" stroke="#555" strokeWidth="1.2"/>
      {/* Door inner panel (shelves visible) */}
      <rect x="256" y="116" width="82" height="346" fill="none" stroke="#aaa" strokeWidth="0.6" strokeDasharray="4,3"/>

      {/* Door handle left */}
      <rect x="334" y="220" width="6" height="80" rx="3" fill="#bbb" stroke="#888" strokeWidth="1"/>
      {/* Door handle right (open door) */}
      <line x1="342" y1="240" x2="418" y2="278" stroke="#bbb" strokeWidth="4" strokeLinecap="round"/>

      {/* Vertical panel seam */}
      <line x1="340" y1="116" x2="340" y2="462" stroke="#666" strokeWidth="1.2"/>

      {/* Wheels — 5 total */}
      {/* Front left */}
      <ellipse cx="278" cy="468" rx="12" ry="8" fill="#ccc" stroke="#555" strokeWidth="1.2"/>
      <ellipse cx="278" cy="468" rx="5" ry="3.5" fill="#aaa"/>
      {/* Front right */}
      <ellipse cx="390" cy="468" rx="12" ry="8" fill="#ccc" stroke="#555" strokeWidth="1.2"/>
      <ellipse cx="390" cy="468" rx="5" ry="3.5" fill="#aaa"/>
      {/* Back left */}
      <ellipse cx="255" cy="455" rx="9" ry="6" fill="#bbb" stroke="#555" strokeWidth="1"/>
      {/* Back right */}
      <ellipse cx="420" cy="455" rx="9" ry="6" fill="#bbb" stroke="#555" strokeWidth="1"/>
      {/* Center */}
      <ellipse cx="335" cy="472" rx="9" ry="6" fill="#bbb" stroke="#555" strokeWidth="1"/>

      {/* Base frame */}
      <polygon points="250,455 430,455 430,470 250,470" fill="#ddd" stroke="#444" strokeWidth="1.2"/>
      <polygon points="180,410 250,455 250,470 180,425" fill="#ccc" stroke="#444" strokeWidth="1.2"/>

      {/* ── Dimension lines ── */}
      {/* Width top: 1430 mm */}
      <line x1="180" y1="38" x2="360" y2="38" stroke="#333" strokeWidth="1" markerEnd="url(#arr)" markerStart="url(#arr)"/>
      <text x="270" y="33" textAnchor="middle" fontSize="11" fontFamily="Arial" fill="#333">1430 mm</text>
      <line x1="180" y1="38" x2="180" y2="60" stroke="#555" strokeWidth="0.7" strokeDasharray="3,2"/>
      <line x1="360" y1="38" x2="360" y2="60" stroke="#555" strokeWidth="0.7" strokeDasharray="3,2"/>

      {/* Depth top: 830 mm */}
      <line x1="360" y1="44" x2="430" y2="88" stroke="#333" strokeWidth="1"/>
      <text x="412" y="63" textAnchor="middle" fontSize="11" fontFamily="Arial" fill="#333" transform="rotate(27,412,63)">830 mm</text>

      {/* Total width top: 1473 mm */}
      <line x1="180" y1="24" x2="430" y2="24" stroke="#333" strokeWidth="1" markerEnd="url(#arr)" markerStart="url(#arr)"/>
      <text x="305" y="19" textAnchor="middle" fontSize="11" fontFamily="Arial" fill="#333">1473 mm</text>
      <line x1="430" y1="24" x2="430" y2="110" stroke="#555" strokeWidth="0.7" strokeDasharray="3,2"/>

      {/* Height: 2160 mm */}
      <line x1="158" y1="60" x2="158" y2="420" stroke="#333" strokeWidth="1" markerEnd="url(#arr)" markerStart="url(#arr)"/>
      <text x="150" y="250" textAnchor="middle" fontSize="11" fontFamily="Arial" fill="#333" transform="rotate(-90,150,250)">2160 mm</text>
      <line x1="158" y1="60" x2="180" y2="60" stroke="#555" strokeWidth="0.7" strokeDasharray="3,2"/>
      <line x1="158" y1="420" x2="180" y2="420" stroke="#555" strokeWidth="0.7" strokeDasharray="3,2"/>

      {/* Base height: 155 mm */}
      <line x1="162" y1="420" x2="162" y2="455" stroke="#333" strokeWidth="1" markerEnd="url(#arr)" markerStart="url(#arr)"/>
      <text x="140" y="442" textAnchor="middle" fontSize="10" fontFamily="Arial" fill="#333">155 mm</text>
      <line x1="162" y1="455" x2="180" y2="455" stroke="#555" strokeWidth="0.7" strokeDasharray="3,2"/>

      {/* Arrow markers */}
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#333"/>
        </marker>
      </defs>
    </svg>
  );
}

// ─── Armoire gallery ───────────────────────────────────────────────────────────

const ARMOIRE_PHOTOS: GalleryPhoto[] = [
  { src: photoArmoire,   alt: 'Armoire froide Liebherr GKPV 1470', label: 'Armoire positive 5°C ± 2°C — Liebherr GKPV 1470' },
  { src: '',             alt: 'Plan technique armoire réfrigérée',  label: 'Plan technique — Armoire réfrigérée Liebherr' },
  { src: planCuisine,    alt: 'Plan cuisine R.U Manufacture',       label: 'Plan cuisine — R.U Manufacture des Tabacs' },
  { src: localisationRU, alt: 'Localisation R.U Manufacture',       label: 'Localisation — R.U Manufacture des Tabacs' },
];

// Caractéristiques techniques Liebherr GKPV 1470
const CARACT_ARMOIRE = [
  { label: 'Volume brut (L)',                 value: '1 361' },
  { label: 'Volume utile (L)',                value: '1 230' },
  { label: 'Homogénéité de la température',  value: '5°C ± 2°C' },
  { label: 'Température (°C)',               value: '+2°C à +16°C' },
  { label: 'Hygrométrie',                    value: '65-75 %' },
  { label: 'Refroidissement',                value: 'Ventilé' },
  { label: 'Dégivrage',                      value: 'Automatique par gaz chaud' },
  { label: 'Évaporateur',                    value: 'Batterie' },
  { label: 'Condenseur',                     value: 'Batterie fil ventilé (avec filtre)' },
  { label: 'Carrosserie',                    value: 'Epoxy blanc' },
  { label: 'Cuve',                           value: 'Inox' },
  { label: "Épaisseur d'isolation",          value: '83 mm' },
  { label: 'Porte',                          value: 'Époxy blanc' },
  { label: "Inversion sens d'ouverture porte", value: 'Oui' },
  { label: 'Rappel de porte automatique',    value: 'Oui' },
  { label: 'Serrure',                        value: 'Oui' },
  { label: 'Roulettes',                      value: '3 pivotantes avec frein + 2 fixes Ø 100 mm' },
  { label: 'Fluide',                         value: 'R-290' },
  { label: 'Charge de gaz (g)',              value: '99' },
  { label: 'Niveau sonore dB(A)',            value: '58' },
  { label: 'Contact sec',                    value: 'Oui' },
  { label: 'Thermostat de sécurité anti-congélation', value: 'Non' },
];

// ─── Main component ────────────────────────────────────────────────────────────

type TabId = 'details' | 'interventions' | 'controles' | 'contrats' | 'etat_lieux' | 'consommations' | 'documents' | 'renouvellement' | 'finance' | 'maintenance';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'details',         label: 'Détails',                icon: Package       },
  { id: 'interventions',   label: 'Interventions',          icon: Wrench        },
  { id: 'controles',       label: 'Contrôles régl.',        icon: ShieldCheck   },
  { id: 'contrats',        label: 'Contrats',               icon: ClipboardList },
  { id: 'maintenance',     label: 'Maintenance préventive', icon: ShieldCheck   },
  { id: 'etat_lieux',      label: 'État des lieux',         icon: ClipboardList },
  { id: 'consommations',   label: 'Consommations',          icon: BarChart3     },
  { id: 'renouvellement',  label: 'Renouvellement',         icon: RefreshCw     },
  { id: 'finance',         label: 'Finances',               icon: Euro          },
  { id: 'documents',       label: 'Documents',              icon: Tag           },
];

export default function FicheEquipement({
  eq,
  onClose,
}: {
  eq: EquipementFiche;
  onClose: () => void;
}) {
  const [activeTab,          setActiveTab]          = useState<TabId>('details');
  const [modalOpen,          setModalOpen]          = useState(false);
  const [modalPhotos,        setModalPhotos]        = useState<GalleryPhoto[]>([]);
  const [modalIdx,           setModalIdx]           = useState(0);
  const [modalPlanTechnique, setModalPlanTechnique] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const isArmoirePositive =
    eq.identifiant === 'EQ-MANU-CUIS-001' ||
    eq.identifiant === 'EQ-FERRY-CUIS-001' ||
    (eq.designation?.toLowerCase().includes('armoire positive') &&
     eq.categorie?.toLowerCase().includes('lectrom'));

  // Logement context: equipment has a logement_id, or ancestors contain a 'logement' node
  const isLogement = !!(eq.logement_id) ||
    (eq.ancestors ?? []).some(a => a.type === 'logement');

  const caract = (eq.caracteristiques ?? {}) as Record<string, unknown>;

  const inventaireCode  = eq.numero_serie ?? `CROUS-EQ-${eq.identifiant?.slice(-6).toUpperCase() ?? '------'}`;
  const statutEquip     = (caract.statut as string) ?? 'en_service';
  // Armoire positive: hardcoded real dates
  const dateAchat       = isArmoirePositive ? '2018-04-03' : eq.date_mise_en_service;
  const finGarantie     = isArmoirePositive ? '2028-04-02' : ((caract.date_fin_garantie as string | null) ?? eq.garantie_fin ?? null);
  const dureeGarantieAns = isArmoirePositive ? 10 : null;
  const dureeGarantie   = isArmoirePositive ? null : ((caract.duree_garantie_mois as number | null) ?? null);
  const garStatut       = garantieStatut(finGarantie);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mockInterventions = useMemo(() => buildMockInterventions(isLogement), [eq.id, isLogement]);

  // Breadcrumb
  const ancestors = (eq.ancestors ?? []) as { type: string; nom: string }[];
  const breadcrumb: string[] = isArmoirePositive
    ? ['Campus de la Manufacture des Tabacs', "R.U Manufacture des Tabacs", 'Niv. -1', 'Cuisine']
    : ancestors.map(a => a.nom);

  function openModal(photos: GalleryPhoto[], idx: number) {
    setModalPhotos(photos); setModalIdx(idx); setModalOpen(true);
  }

  // Pexels fallback photo per category
  const pexelsMap: Record<string, string> = {
    cvc:            'https://images.pexels.com/photos/3846022/pexels-photo-3846022.jpeg?auto=compress&cs=tinysrgb&w=800',
    eclairage:      'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg?auto=compress&cs=tinysrgb&w=800',
    incendie:       'https://images.pexels.com/photos/280221/pexels-photo-280221.jpeg?auto=compress&cs=tinysrgb&w=800',
    electromenager: 'https://images.pexels.com/photos/2343465/pexels-photo-2343465.jpeg?auto=compress&cs=tinysrgb&w=800',
    electricite:    'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=800',
    reseau:         'https://images.pexels.com/photos/325229/pexels-photo-325229.jpeg?auto=compress&cs=tinysrgb&w=800',
    mobilier:       'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=800',
    sanitaires:     'https://images.pexels.com/photos/1827234/pexels-photo-1827234.jpeg?auto=compress&cs=tinysrgb&w=800',
    serrure:        'https://images.pexels.com/photos/279810/pexels-photo-279810.jpeg?auto=compress&cs=tinysrgb&w=800',
  };
  const catKey = (eq.categorie ?? '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');
  const genericPhotoUrl = pexelsMap[catKey] ?? pexelsMap['electricite'];
  const genericPhotos: GalleryPhoto[] = [{ src: genericPhotoUrl, alt: eq.designation, label: eq.designation }];

  return (
    <>
      {/* Panel slide-over (same width as logement 108 fiche — right panel inside main layout) */}
      <div className="flex flex-col h-full bg-white">

        {/* ── Header ── */}
        <div className="px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0">
                <Thermometer className="w-5 h-5 text-cyan-600" />
              </div>
              <div className="min-w-0">
                {/* Type d'équipement + inventaire */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{eq.categorie}</span>
                  <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                    {inventaireCode}
                  </span>
                </div>
                <h1 className="text-base font-semibold text-slate-800 leading-tight mt-0.5">{eq.designation}</h1>
                {/* Fil d'ariane dans le header */}
                {breadcrumb.length > 0 && (
                  <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                    {breadcrumb.map((seg, i) => (
                      <span key={i} className="flex items-center gap-1 text-[11px] text-slate-400">
                        {i > 0 && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
                        <span className="truncate max-w-[110px]" title={seg}>{seg}</span>
                      </span>
                    ))}
                    <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
                    <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[110px]">{eq.designation}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              <StatutBadge statut={statutEquip} />
              <QRCodeButton value={inventaireCode} label={eq.designation} />
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex-shrink-0
                  ${activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className={`flex-1 min-h-0 flex flex-col ${activeTab === 'consommations' || activeTab === 'controles' || activeTab === 'documents' || activeTab === 'contrats' ? 'overflow-hidden' : 'overflow-y-auto'}`}
          style={activeTab === 'renouvellement' || activeTab === 'finance' ? { overflowY: 'auto', padding: '0' } : undefined}>

          {/* ── Onglet Détails ── */}
          {activeTab === 'details' && (
            <div>
              {/* Galerie style logement 108 */}
              <div className="px-4 pt-4">
                {isArmoirePositive ? (
                  <div className="flex gap-1.5" style={{ height: 240 }}>
                    {/* Photo principale — moitié gauche */}
                    <div className="relative w-1/2 rounded-l-xl overflow-hidden cursor-pointer group bg-white border border-slate-100"
                      onClick={() => openModal(ARMOIRE_PHOTOS, 0)}>
                      <img src={photoArmoire} alt="Armoire froide"
                        className="w-full h-full object-contain bg-white transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      <button onClick={e => { e.stopPropagation(); openModal(ARMOIRE_PHOTOS, 0); }}
                        className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors">
                        <Grid2X2 className="w-3.5 h-3.5" />
                        Toutes les photos
                      </button>
                    </div>
                    {/* 3 vignettes droite */}
                    <div className="flex gap-1.5 w-1/2 flex-shrink-0">
                      {/* Plan technique — inline SVG */}
                      <div className="relative flex-1 overflow-hidden cursor-pointer group bg-white border border-slate-100"
                        onClick={() => setModalPlanTechnique(true)}>
                        <PlanTechniqueSVG className="w-full h-full" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        <button onClick={e => { e.stopPropagation(); setModalPlanTechnique(true); }}
                          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors whitespace-nowrap">
                          <Maximize2 className="w-3 h-3" /> Plan technique
                        </button>
                      </div>
                      {/* Plan pièce */}
                      <div className="relative flex-1 overflow-hidden cursor-pointer group bg-white border border-slate-100"
                        onClick={() => openModal([ARMOIRE_PHOTOS[2]], 0)}>
                        <img src={planCuisine} alt="Plan cuisine"
                          className="w-full h-full object-contain bg-white transition-transform duration-300 group-hover:scale-[1.03]" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        <button onClick={e => { e.stopPropagation(); openModal([ARMOIRE_PHOTOS[2]], 0); }}
                          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors whitespace-nowrap">
                          <Maximize2 className="w-3 h-3" /> Plan pièce
                        </button>
                      </div>
                      {/* Localisation */}
                      <div className="relative flex-1 rounded-r-xl overflow-hidden cursor-pointer group"
                        onClick={() => openModal([ARMOIRE_PHOTOS[3]], 0)}>
                        <img src={localisationRU} alt="Localisation"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        <button onClick={e => { e.stopPropagation(); openModal([ARMOIRE_PHOTOS[3]], 0); }}
                          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors whitespace-nowrap">
                          <MapPin className="w-3 h-3" /> Localisation
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Galerie générique — photo + placeholder */
                  <div className="flex gap-1.5" style={{ height: 200 }}>
                    <div className="relative w-1/2 rounded-l-xl overflow-hidden cursor-pointer group"
                      onClick={() => openModal(genericPhotos, 0)}>
                      <img src={genericPhotoUrl} alt={eq.designation}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      <button onClick={e => { e.stopPropagation(); openModal(genericPhotos, 0); }}
                        className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors whitespace-nowrap">
                        <Grid2X2 className="w-3.5 h-3.5" /> Photo
                      </button>
                    </div>
                    <div className="flex-1 rounded-r-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <span className="text-xs text-slate-400 italic">Plans à venir</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Corps */}
              <div className="px-6 py-4">

                {/* Adresse / localisation */}
                {eq.localisation_detail && (
                  <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <p className="text-sm font-medium text-slate-700">{eq.localisation_detail}</p>
                  </div>
                )}

                {/* Dates clés + Points clés — armoire positive seulement */}
                {isArmoirePositive && (
                  <>
                    <SectionTitle>Dates clés</SectionTitle>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0">
                      <GridCell label="Date d'achat" value={
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatDate(dateAchat)}
                        </span>
                      } />
                      <GridCell label="Statut garantie" value={
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${garStatut.cls}`}>
                          {garStatut.icon} {garStatut.label}
                        </span>
                      } />
                      <GridCell label="Fin de garantie" value={
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatDate(finGarantie)}
                        </span>
                      } />
                      <GridCell label="Durée de garantie" value={
                        dureeGarantieAns ? `${dureeGarantieAns} ans` : dureeGarantie ? `${dureeGarantie} mois` : '—'
                      } />
                    </div>

                    <SectionTitle>Points clés</SectionTitle>
                    <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-2 mb-2">
                      {[
                        { icon: <Thermometer className="w-3.5 h-3.5" />, label: 'Température', value: '+2°C à +16°C' },
                        { icon: <Activity    className="w-3.5 h-3.5" />, label: 'Réglage temp.', value: 'Au 1/10°' },
                        { icon: <Wind        className="w-3.5 h-3.5" />, label: 'Double ventilation axiale', value: 'Oui' },
                        { icon: <Grid2X2     className="w-3.5 h-3.5" />, label: 'Grilles plastifiées', value: '8' },
                        { icon: <Ruler       className="w-3.5 h-3.5" />, label: 'Passage de cuve', value: '15 mm' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-100">
                          <span className="text-cyan-600 flex-shrink-0">{item.icon}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-slate-400 leading-tight truncate">{item.label}</p>
                            <p className="text-xs font-semibold text-slate-800 leading-tight">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Identification — 2 colonnes */}
                <SectionTitle>Identification</SectionTitle>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0">
                  <GridCell label="Code équipement" value={
                    <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 text-[11px]">
                      {inventaireCode}
                    </span>
                  } />
                  <GridCell label="Statut" value={<StatutBadge statut={statutEquip} />} />
                  <GridCell label="Type" value={isArmoirePositive ? 'Armoire positive' : (eq.sous_categorie ?? eq.categorie ?? '—')} />
                  {isArmoirePositive && (
                    <>
                      <GridCell label="Surface au sol" value="1,43 m × 0,83 m" />
                      <GridCell label="Volume brut" value="1 361 L" />
                      <GridCell label="Volume utile" value="1 230 L" />
                    </>
                  )}
                  {eq.marque && <GridCell label="Marque" value={eq.marque} />}
                  {eq.modele && <GridCell label="Modèle" value={eq.modele} />}
                  {eq.numero_serie && <GridCell label="N° de série" value={<span className="font-mono text-xs">{eq.numero_serie}</span>} />}
                </div>

                {/* Structure hiérarchique — fil d'ariane uniquement */}
                {breadcrumb.length > 0 && (
                  <>
                    <SectionTitle>Structure hiérarchique</SectionTitle>
                    <div className="space-y-0">
                      <DetailRow
                        label="Fil d'ariane"
                        value={
                          <div className="flex items-center gap-1 flex-wrap">
                            {breadcrumb.map((seg, i) => (
                              <span key={i} className="flex items-center gap-1 text-xs">
                                {i > 0 && <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />}
                                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-medium truncate max-w-[100px]" title={seg}>
                                  {seg}
                                </span>
                              </span>
                            ))}
                            <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
                            <span className="px-1.5 py-0.5 bg-blue-100 rounded text-blue-700 font-bold text-xs">{eq.designation}</span>
                          </div>
                        }
                      />
                    </div>
                  </>
                )}

                {/* Caractéristiques techniques — 2 colonnes */}
                {isArmoirePositive && (
                  <>
                    <SectionTitle>Caractéristiques techniques</SectionTitle>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0">
                      {CARACT_ARMOIRE.map((item, i) => (
                        <GridCell key={i} label={item.label} value={item.value} />
                      ))}
                    </div>
                  </>
                )}

              </div>
            </div>
          )}

          {activeTab === 'interventions' && (
            <div className="flex flex-col h-full" style={{ minHeight: 400 }}>
              <InterventionsTableau interventions={mockInterventions} isLogement={isLogement} />
            </div>
          )}
          {activeTab === 'controles' && (
            <ControlesOnglet hideLocalisation />
          )}
          {activeTab === 'etat_lieux' && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <ClipboardList className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">Aucun état des lieux enregistré</p>
            </div>
          )}
          {activeTab === 'consommations' && (
            <div className="flex flex-col flex-1 min-h-0">
              <ConsommationsTableau
                releves={buildMockRelevesEquipement()}
                lockFluide={isArmoirePositive ? 'electricite' : undefined}
              />
            </div>
          )}
          {activeTab === 'contrats' && (
            <ContratsTableau context="equipement" />
          )}
          {activeTab === 'documents' && (
            <DocumentsArborescence context="equipement" />
          )}
          {activeTab === 'renouvellement' && (
            <OngletRenouvellement
              equipement_id={eq.id}
              date_mise_en_service={isArmoirePositive ? '2014-04-03' : eq.date_mise_en_service ?? null}
              designation={eq.designation}
            />
          )}

          {activeTab === 'finance' && (
            <OngletFinanceEquipement equipement_id={eq.id} />
          )}

          {activeTab === 'maintenance' && (
            <MaintenancePreventive />
          )}

        </div>
      </div>

      {modalOpen && (
        <GalleryModal photos={modalPhotos} initialIndex={modalIdx} onClose={() => setModalOpen(false)} />
      )}

      {modalPlanTechnique && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
          onClick={() => setModalPlanTechnique(false)}>
          <div className="relative max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
            <button onClick={() => setModalPlanTechnique(false)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white flex items-center gap-1.5 text-sm transition-colors">
              <X className="w-5 h-5" /> Fermer
            </button>
            <div className="bg-white rounded-xl overflow-hidden p-4">
              <PlanTechniqueSVG className="w-full h-auto" />
              <p className="text-xs text-center text-slate-500 mt-2 font-medium">
                Plan technique — Armoire réfrigérée Liebherr GKPV 1470
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
