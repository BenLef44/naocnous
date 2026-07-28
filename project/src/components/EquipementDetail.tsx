import { useState, useEffect } from 'react';
import {
  X, ChevronRight, Maximize2, MapPin, Thermometer, Wind, Grid2x2 as Grid2X2,
  Tag, CheckCircle2, Clock, AlertTriangle, Calendar, Ruler,
  Package, ShieldCheck, ShieldOff, Wrench, Activity, Building2,
  Hash, Info,
} from 'lucide-react';
import photoArmoire   from '../assets/liebherr-armoire-refrigeree-positive-1430-litres-gkpv1470.png';
import planTechnique  from '../assets/plan-technique-armoire.jpeg';
import planCuisine    from '../assets/Plan-Cuisine-RU.webp';
import localisationRU from '../assets/Localisation-RU-Manu-Tabacs.png';
import { type EquipementGlobal } from '../lib/generateEquipements';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR');
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide w-52 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-slate-700 min-w-0 flex-1">{value ?? '—'}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-6 mb-2 first:mt-0">{children}</h3>
  );
}

// ─── Statut badges ─────────────────────────────────────────────────────────────

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

// ─── Garantie statut ───────────────────────────────────────────────────────────

function garantieStatut(fin?: string | null): { label: string; cls: string; icon: React.ReactNode } {
  if (!fin) return { label: 'Non renseignée', cls: 'bg-slate-50 text-slate-500 border-slate-200', icon: <ShieldOff className="w-3.5 h-3.5" /> };
  const diffDays = (new Date(fin).getTime() - Date.now()) / 86400000;
  if (diffDays < 0)  return { label: 'Expirée',        cls: 'bg-red-50 text-red-700 border-red-200',             icon: <AlertTriangle className="w-3.5 h-3.5" /> };
  if (diffDays < 90) return { label: 'Expire bientôt', cls: 'bg-amber-50 text-amber-700 border-amber-200',       icon: <Clock         className="w-3.5 h-3.5" /> };
  return                    { label: 'En cours',        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2  className="w-3.5 h-3.5" /> };
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90" onClick={onClose}>
      <div className="relative max-w-5xl w-full mx-4" onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white flex items-center gap-1.5 text-sm transition-colors">
          <X className="w-5 h-5" /> Fermer
        </button>
        <div className="relative bg-black rounded-xl overflow-hidden" style={{ maxHeight: '82vh' }}>
          <img src={photo.src} alt={photo.alt} className="w-full object-contain" style={{ maxHeight: '74vh' }} />
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/70 to-transparent">
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

// ─── Galerie générique (autres équipements) ────────────────────────────────────

function GenericGallery({ eq, onOpen }: { eq: EquipementGlobal; onOpen: (idx: number) => void }) {
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
  const key = eq.categorie?.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '') as string;
  const photoUrl = pexelsMap[key] ?? pexelsMap['electricite'];
  const siteName = eq.site_label ?? '—';
  const subNom   = eq.sous_niveau_label ?? '';

  return (
    <div className="flex gap-1.5 px-4 pt-4" style={{ height: 220 }}>
      {/* Photo principale */}
      <div className="relative w-1/2 rounded-l-xl overflow-hidden cursor-pointer group bg-slate-100"
        onClick={() => onOpen(0)}>
        <img src={photoUrl} alt={eq.designation}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        <button onClick={e => { e.stopPropagation(); onOpen(0); }}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors">
          <Grid2X2 className="w-3.5 h-3.5" />
          Photo principale
        </button>
      </div>
      {/* Localisation textuelle */}
      <div className="flex-1 rounded-r-xl bg-slate-50 border border-slate-100 flex flex-col justify-center px-6 gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="font-medium">{siteName}</span>
        </div>
        {subNom && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>{subNom}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Tag className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span>{eq.categorie}{eq.sous_categorie ? ` — ${eq.sous_categorie}` : ''}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 italic">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          Plans et localisation à venir
        </div>
      </div>
    </div>
  );
}

// ─── Armoire gallery (specific) ────────────────────────────────────────────────

function ArmoireGallery({ onOpen }: { onOpen: (photos: GalleryPhoto[], idx: number) => void }) {
  const allPhotos: GalleryPhoto[] = [
    { src: photoArmoire,   alt: 'Armoire froide Liebherr GKPV 1470', label: 'Armoire positive 5°C ± 2°C — Liebherr GKPV 1470' },
    { src: planTechnique,  alt: 'Plan technique armoire réfrigérée',  label: 'Plan technique — Armoire réfrigérée Liebherr' },
    { src: planCuisine,    alt: 'Plan cuisine R.U Manufacture',       label: 'Plan cuisine — R.U Manufacture des Tabacs' },
    { src: localisationRU, alt: 'Localisation R.U Manufacture',       label: 'Localisation — R.U Manufacture des Tabacs' },
  ];

  return (
    <div className="flex gap-1.5 px-4 pt-4" style={{ height: 240 }}>
      {/* Photo principale — moitié gauche */}
      <div className="relative w-1/2 rounded-l-xl overflow-hidden cursor-pointer group bg-white border border-slate-100"
        onClick={() => onOpen(allPhotos, 0)}>
        <img src={photoArmoire} alt="Armoire froide"
          className="w-full h-full object-contain bg-white transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        <button onClick={e => { e.stopPropagation(); onOpen(allPhotos, 0); }}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors">
          <Grid2X2 className="w-3.5 h-3.5" />
          Afficher toutes les photos
        </button>
      </div>
      {/* 3 vignettes droite */}
      <div className="flex gap-1.5 w-1/2 flex-shrink-0">
        <div className="relative flex-1 overflow-hidden cursor-pointer group bg-white border border-slate-100"
          onClick={() => onOpen([allPhotos[1]], 0)}>
          <img src={planTechnique} alt="Plan technique"
            className="w-full h-full object-contain bg-white transition-transform duration-300 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <button onClick={e => { e.stopPropagation(); onOpen([allPhotos[1]], 0); }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors whitespace-nowrap">
            <Maximize2 className="w-3 h-3" /> Plan technique
          </button>
        </div>
        <div className="relative flex-1 overflow-hidden cursor-pointer group bg-white border border-slate-100"
          onClick={() => onOpen([allPhotos[2]], 0)}>
          <img src={planCuisine} alt="Plan cuisine"
            className="w-full h-full object-contain bg-white transition-transform duration-300 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <button onClick={e => { e.stopPropagation(); onOpen([allPhotos[2]], 0); }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors whitespace-nowrap">
            <Maximize2 className="w-3 h-3" /> Plan pièce
          </button>
        </div>
        <div className="relative flex-1 rounded-r-xl overflow-hidden cursor-pointer group"
          onClick={() => onOpen([allPhotos[3]], 0)}>
          <img src={localisationRU} alt="Localisation"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <button onClick={e => { e.stopPropagation(); onOpen([allPhotos[3]], 0); }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-semibold text-slate-800 bg-white/90 backdrop-blur-sm hover:bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors whitespace-nowrap">
            <MapPin className="w-3 h-3" /> Localisation
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main modal ────────────────────────────────────────────────────────────────

export default function EquipementDetail({ eq, onClose }: { eq: EquipementGlobal; onClose: () => void }) {
  const [activeTab,    setActiveTab]    = useState<'details' | 'interventions' | 'documents' | 'controles'>('details');
  const [modalOpen,    setModalOpen]    = useState(false);
  const [modalPhotos,  setModalPhotos]  = useState<GalleryPhoto[]>([]);
  const [modalIdx,     setModalIdx]     = useState(0);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  // Detect if this is the specific Armoire positive
  const isArmoirePositive =
    eq.identifiant === 'EQ-MANU-CUIS-001' ||
    (eq.designation?.toLowerCase().includes('armoire positive') &&
     eq.categorie?.toLowerCase().includes('électroménager'));

  const inventaireCode   = eq.numero_serie ?? `CROUS-EQ-${eq.identifiant.slice(-6).toUpperCase()}`;
  const statutEquip      = (eq.caracteristiques?.statut as string) ?? 'en_service';
  const dateAchat        = eq.date_mise_en_service;
  const finGarantie      = (eq.caracteristiques?.date_fin_garantie as string | null) ?? null;
  const dureeGarantie    = (eq.caracteristiques?.duree_garantie_mois as number | null) ?? null;
  const hasGarantie      = !!(eq.caracteristiques?.garantie);
  const garStatut        = garantieStatut(hasGarantie ? finGarantie : null);

  // Breadcrumb — use real site data for armoire, generic for others
  const breadcrumb: string[] = isArmoirePositive
    ? ['Campus de la Manufacture des Tabacs', "Resto'U Manufacture des Tabacs", 'Niv. -1', 'Cuisine']
    : [eq.site_label, ...(eq.sous_niveau_label ? [eq.sous_niveau_label] : [])];

  function openModal(photos: GalleryPhoto[], idx: number) {
    setModalPhotos(photos); setModalIdx(idx); setModalOpen(true);
  }

  // Generic photo for non-armoire
  const genericPhoto: GalleryPhoto = {
    src: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: eq.designation,
    label: eq.designation,
  };

  const TABS = [
    { id: 'details'       as const, label: 'Détails',         icon: Package    },
    { id: 'interventions' as const, label: 'Interventions',   icon: Wrench     },
    { id: 'controles'     as const, label: 'Contrôles régl.', icon: ShieldCheck},
    { id: 'documents'     as const, label: 'Documents',       icon: Tag        },
  ];

  // Caractéristiques techniques à afficher dynamiquement (depuis caracteristiques JSON)
  const caractTechLabels: Record<string, string> = {
    volume_brut_l:              'Volume brut (L)',
    volume_utile_l:             'Volume utile (L)',
    homogeneite_temperature:    'Homogénéité température',
    temperature_reglage:        'Température (°C)',
    hygrometrie:                'Hygrométrie',
    refroidissement:            'Refroidissement',
    degivrage:                  'Dégivrage',
    evaporateur:                'Évaporateur',
    condenseur:                 'Condenseur',
    carrosserie:                'Carrosserie',
    cuve:                       'Cuve',
    epaisseur_isolation_mm:     "Épaisseur d'isolation (mm)",
    porte:                      'Porte',
    inversion_ouverture_porte:  "Inversion sens d'ouverture",
    rappel_porte_automatique:   'Rappel de porte automatique',
    serrure:                    'Serrure',
    roulettes:                  'Roulettes',
    fluide:                     'Fluide',
    charge_gaz_g:               'Charge de gaz (g)',
    niveau_sonore_dba:          'Niveau sonore dB(A)',
    contact_sec:                'Contact sec',
    thermostat_anti_congelation:'Thermostat anti-congélation',
    grilles_acier_plastifie_nb: 'Grille acier plastifié (nb)',
    passage_cuve_mm:            'Passage de cuve (mm)',
    dimensions_lxpxh_mm:       'Dimensions L×P×H (mm)',
    poids_net_kg:               'Poids net (kg)',
    tension_v:                  'Tension (V)',
    puissance_w:                'Puissance (W)',
  };

  const techFields = Object.entries(caractTechLabels).filter(([key]) => {
    const v = eq.caracteristiques?.[key];
    return v !== undefined && v !== null && !['statut', 'garantie', 'date_fin_garantie', 'duree_garantie_mois', 'date_achat', 'quantite'].includes(key);
  });

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Full-width panel */}
      <div
        className="fixed inset-0 z-50 bg-white flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-8 py-4 border-b border-slate-100 flex-shrink-0 bg-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
                <Thermometer className="w-5 h-5 text-cyan-600" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{eq.categorie}</span>
                  <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                    {inventaireCode}
                  </span>
                </div>
                <h1 className="text-lg font-semibold text-slate-800 leading-tight">{eq.designation}</h1>
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {breadcrumb.map((seg, i) => (
                    <span key={i} className="flex items-center gap-1 text-[11px] text-slate-400">
                      {i > 0 && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
                      <span className="truncate max-w-[140px]" title={seg}>{seg}</span>
                    </span>
                  ))}
                  <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
                  <span className="text-[11px] font-semibold text-slate-700">{eq.designation}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0">
              <X className="w-5 h-5 text-slate-500" />
            </button>
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
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' && (
            <div className="max-w-6xl mx-auto">

              {/* Galerie */}
              {isArmoirePositive
                ? <ArmoireGallery onOpen={openModal} />
                : <GenericGallery eq={eq} onOpen={idx => openModal([genericPhoto], idx)} />
              }

              {/* Corps — deux colonnes */}
              <div className="px-8 py-6 grid grid-cols-2 gap-x-12 gap-y-0">

                {/* Colonne gauche */}
                <div>
                  {/* Dates clés */}
                  <SectionTitle>Dates clés</SectionTitle>
                  <div className="space-y-0">
                    <DetailRow label="Date d'achat / mise en service" value={
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(dateAchat)}
                      </span>
                    } />
                    <DetailRow label="Statut garantie" value={
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${garStatut.cls}`}>
                        {garStatut.icon} {garStatut.label}
                      </span>
                    } />
                    {hasGarantie && finGarantie && (
                      <DetailRow label="Fin de garantie" value={
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(finGarantie)}
                        </span>
                      } />
                    )}
                    {dureeGarantie && (
                      <DetailRow label="Durée de garantie" value={`${dureeGarantie} mois`} />
                    )}
                  </div>

                  {/* Points clés — armoire uniquement */}
                  {isArmoirePositive && (
                    <>
                      <SectionTitle>Points clés</SectionTitle>
                      <div className="grid grid-cols-1 gap-y-2.5">
                        {[
                          { icon: <Thermometer className="w-4 h-4" />, label: 'Température',          value: '+2°C à +16°C'     },
                          { icon: <Activity    className="w-4 h-4" />, label: 'Réglage température',  value: 'Au 1/10 de degré' },
                          { icon: <Wind        className="w-4 h-4" />, label: 'Double ventilation',   value: 'Axiale'           },
                          { icon: <Grid2X2     className="w-4 h-4" />, label: 'Grille acier plastifié', value: '8'              },
                          { icon: <Ruler       className="w-4 h-4" />, label: 'Passage de cuve',      value: '15 mm'           },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-sm">
                            <span className="text-cyan-600 flex-shrink-0">{item.icon}</span>
                            <span className="text-slate-500 text-xs w-40 flex-shrink-0">{item.label}</span>
                            <span className="text-slate-800 font-medium text-xs">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Identification */}
                  <SectionTitle>Identification</SectionTitle>
                  <div className="space-y-0">
                    <DetailRow label="Code équipement" value={
                      <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-sm">
                        {inventaireCode}
                      </span>
                    } />
                    <DetailRow label="Statut" value={<StatutBadge statut={statutEquip} />} />
                    {eq.categorie && <DetailRow label="Type" value={eq.sous_categorie ?? eq.categorie} />}
                    {eq.marque && <DetailRow label="Marque" value={
                      <span className="flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-slate-400" />
                        {eq.marque}{eq.modele ? ` — ${eq.modele}` : ''}
                      </span>
                    } />}
                    {eq.numero_serie && <DetailRow label="N° de série" value={
                      <span className="font-mono text-xs text-slate-600">{eq.numero_serie}</span>
                    } />}
                    {isArmoirePositive && <>
                      <DetailRow label="Surface au sol" value={
                        <span className="flex items-center gap-1.5">
                          <Ruler className="w-3.5 h-3.5 text-slate-400" />
                          1,43 m × 0,83 m
                        </span>
                      } />
                      <DetailRow label="Capacité" value="1 361 L brut / 1 230 L utile" />
                    </>}
                  </div>

                  {/* Structure hiérarchique */}
                  <SectionTitle>Structure hiérarchique</SectionTitle>
                  <div className="space-y-0">
                    <DetailRow label="Fil d'ariane" value={
                      <div className="flex items-center gap-1 flex-wrap">
                        {breadcrumb.map((seg, i) => (
                          <span key={i} className="flex items-center gap-1 text-xs">
                            {i > 0 && <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />}
                            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-medium max-w-[120px] truncate" title={seg}>{seg}</span>
                          </span>
                        ))}
                        <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
                        <span className="px-1.5 py-0.5 bg-blue-100 rounded text-blue-700 font-bold text-xs">{eq.designation}</span>
                      </div>
                    } />
                  </div>
                </div>

                {/* Colonne droite — Caractéristiques techniques */}
                <div>
                  {techFields.length > 0 && (
                    <>
                      <SectionTitle>Caractéristiques techniques</SectionTitle>
                      <div className="space-y-0">
                        {techFields.map(([key, label]) => {
                          const raw = eq.caracteristiques![key];
                          const display = typeof raw === 'boolean' ? (raw ? 'Oui' : 'Non') : String(raw);
                          return <DetailRow key={key} label={label} value={display} />;
                        })}
                      </div>
                    </>
                  )}

                  {/* État */}
                  {eq.etat && (
                    <>
                      <SectionTitle>État</SectionTitle>
                      <div className="space-y-0">
                        <DetailRow label="État général" value={eq.etat} />
                        {eq.date_mise_en_service && (
                          <DetailRow label="Date mise en service" value={formatDate(eq.date_mise_en_service)} />
                        )}
                      </div>
                    </>
                  )}
                </div>

              </div>
            </div>
          )}

          {activeTab === 'interventions' && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Wrench className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">Aucune intervention enregistrée</p>
            </div>
          )}
          {activeTab === 'controles' && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <ShieldCheck className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">Aucun contrôle réglementaire associé</p>
            </div>
          )}
          {activeTab === 'documents' && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Tag className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">Aucun document associé</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <GalleryModal photos={modalPhotos} initialIndex={modalIdx} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
