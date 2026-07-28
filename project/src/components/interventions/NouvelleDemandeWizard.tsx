import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  X, ChevronRight, ChevronLeft, MapPin, FileText, AlertTriangle, CheckCircle2,
  Search, Loader2, List, GitBranch, Building2, Layers, Home, ChevronDown, Maximize2,
  PenLine, Sparkles, SplitSquareHorizontal, Mic, ShieldCheck, User, Paperclip, BookmarkPlus,
  Star, Clock, Key,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CRITICITE_CFG, CATEGORIES_DI, SOUS_CATEGORIES, type CriticiteDI, type CanalSource, type DemandeParsed } from './interventionsTypes';
import cartoCavalier    from '../../assets/Cartouche-Carto-OpenStreetMap-Residence-Jacques-Cavalier.png';
import planEvac         from '../../assets/Plan-Evac-Exemple.png';
import plan108          from '../../assets/Plan-Logement-108.png';
import photoMainLogement from '../../assets/Photo-Principale-Logement_CROUS_LYON-Cavalier.jpg';
import { DrawingModal } from './DrawingModal';
import DescriptionSidecar from './DescriptionSidecar';

// ─── Endroits pour salle de classe ────────────────────────────────────────────
const CLASSE_ENDROITS = [
  { key: 'luminaires',  label: 'Luminaires',    emoji: '💡', bg: 'bg-amber-50',    border: 'border-amber-200',    activeBorder: 'border-amber-500',    activeBg: 'bg-amber-50',    activeText: 'text-amber-700' },
  { key: 'electricite', label: 'Électricité',   emoji: '⚡', bg: 'bg-blue-50',     border: 'border-blue-200',     activeBorder: 'border-blue-500',     activeBg: 'bg-blue-50',     activeText: 'text-blue-700' },
  { key: 'equipements', label: 'Équipements',   emoji: '🔧', bg: 'bg-slate-50',    border: 'border-slate-200',    activeBorder: 'border-slate-500',    activeBg: 'bg-slate-50',    activeText: 'text-slate-700' },
  { key: 'mobilier',    label: 'Mobilier',      emoji: '🪑', bg: 'bg-emerald-50',  border: 'border-emerald-200',  activeBorder: 'border-emerald-500',  activeBg: 'bg-emerald-50',  activeText: 'text-emerald-700' },
] as const;

const CLASSE_ELEMENTS: Record<string, { key: string; label: string; emoji: string; icon: string; family: string }[]> = {
  luminaires: [
    { key: 'plafonnier',    label: 'Plafonnier',        emoji: '🔆', icon: 'ceiling_light',  family: 'luminaires' },
    { key: 'neon',          label: 'Néon',              emoji: '💡', icon: 'fluorescent',    family: 'luminaires' },
    { key: 'spot_led',      label: 'Spot LED',          emoji: '💡', icon: 'lightbulb',     family: 'luminaires' },
    { key: 'rampelle',      label: 'Rampe lumineuse',   emoji: '💡', icon: 'light_group',   family: 'luminaires' },
    { key: 'interrupteur',  label: 'Interrupteur',      emoji: '🔘', icon: 'toggle_on',     family: 'luminaires' },
    { key: 'variateur',     label: 'Variateur',         emoji: '🎚️', icon: 'tune',          family: 'luminaires' },
  ],
  electricite: [
    { key: 'tableau_elec',  label: 'Tableau électrique', emoji: '🔌', icon: 'dashboard',     family: 'electricite' },
    { key: 'prise',         label: 'Prise de courant',   emoji: '🔌', icon: 'power',         family: 'electricite' },
    { key: 'circuit',       label: 'Circuit',            emoji: '⚡', icon: 'cable',         family: 'electricite' },
    { key: 'disjoncteur',   label: 'Disjoncteur',        emoji: '⚡', icon: 'electrical_services', family: 'electricite' },
    { key: 'terre',         label: 'Mise à la terre',    emoji: '⚡', icon: 'bolt',          family: 'electricite' },
    { key: 'cable',         label: 'Câblage',            emoji: '🔌', icon: 'cable',         family: 'electricite' },
  ],
  equipements: [
    { key: 'vmc',           label: 'VMC',               emoji: '🌬️', icon: 'air',            family: 'equipements' },
    { key: 'radiateur',     label: 'Radiateur',         emoji: '🌡️', icon: 'thermostat',    family: 'equipements' },
    { key: 'clim',          label: 'Climatisation',     emoji: '❄️', icon: 'ac_unit',       family: 'equipements' },
    { key: 'detecteur',     label: 'Détecteur fumée',   emoji: '🚨', icon: 'smoke_free',    family: 'equipements' },
    { key: 'extincteur',    label: 'Extincteur',        emoji: '🧯', icon: 'fire_extinguisher', family: 'equipements' },
    { key: 'robinetterie',  label: 'Robinet/Évier',     emoji: '🚿', icon: 'water_drop',    family: 'equipements' },
  ],
  mobilier: [
    { key: 'table',         label: 'Table',             emoji: '🪑', icon: 'table',         family: 'mobilier' },
    { key: 'chaise',        label: 'Chaise',            emoji: '🪑', icon: 'chair',         family: 'mobilier' },
    { key: 'tableau',       label: 'Tableau blanc',     emoji: '📋', icon: 'whiteboard',    family: 'mobilier' },
    { key: 'armoire',       label: 'Armoire/Penderie',  emoji: '🗄️', icon: 'locker',        family: 'mobilier' },
    { key: 'etagere',       label: 'Étagère',           emoji: '📚', icon: 'menu_book',     family: 'mobilier' },
    { key: 'tapis',         label: 'Tapis/Moquette',    emoji: '🟫', icon: 'carpet',        family: 'mobilier' },
  ],
};

interface Props {
  onClose: () => void;
  onCreated: (ref: string, id?: string) => void;
  defaultSiteId?: string;
  defaultResidenceId?: string;
  editDemande?: DemandeParsed | null;
}

interface SiteOption    { id: string; nom: string; code: string; }
interface ResidenceOption { id: string; nom: string; site_id: string; }
interface BatimentOption  { id: string; nom: string; residence_id: string; }
interface EtageOption     { id: string; nom: string; batiment_id: string; numero: number; }
interface LogementOption  { id: string; numero: string; etage_id: string; }

// ─── Tree types (for arborescence mode) ──────────────────────────────────────

type NodeType = 'site' | 'residence' | 'batiment' | 'etage' | 'logement';

interface TreeNode {
  id: string;
  type: NodeType;
  nom: string;
  children?: TreeNode[];
}

// ─── Gallery modal ────────────────────────────────────────────────────────────

interface GalleryPhoto { src: string; alt: string; label?: string; }

function GalleryModal({ photos, initialIndex, onClose }: { photos: GalleryPhoto[]; initialIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(initialIndex);
  const photo = photos[idx];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft')  setIdx(i => (i - 1 + photos.length) % photos.length);
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % photos.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, photos.length]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90" onClick={onClose}>
      <div className="relative max-w-3xl w-full mx-4" onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute -top-9 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-1.5 text-sm">
          <X className="w-4 h-4" /> Fermer
        </button>
        <div className="relative bg-black rounded-xl overflow-hidden">
          <img src={photo.src} alt={photo.alt} className="w-full object-contain" style={{ maxHeight: '70vh' }} />
          {photo.label && (
            <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-sm text-white font-medium">{photo.label}</p>
            </div>
          )}
        </div>
        {photos.length > 1 && (
          <div className="flex items-center justify-between mt-3">
            <button onClick={() => setIdx(i => (i - 1 + photos.length) % photos.length)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1.5">
              {photos.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === idx ? 'bg-white' : 'bg-white/40'}`} />
              ))}
            </div>
            <button onClick={() => setIdx(i => (i + 1) % photos.length)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Localisation sidecar ─────────────────────────────────────────────────────

interface SidecarProps {
  showCarto: boolean;
  showPlanEtage: boolean;
  showPlanLogement: boolean;
  showPhotos: boolean;
  residenceName: string;
  etageName: string;
  logementNum: string;
  selectedPiece?: string | null;
  customCarto?: string | null;
  customPlanEtage?: string | null;
  customPlanLogement?: string | null;
  customPhotos?: string[];
}

function LocalisationSidecar({ showCarto, showPlanEtage, showPlanLogement, showPhotos, residenceName, etageName, logementNum, selectedPiece, customCarto, customPlanEtage, customPlanLogement, customPhotos }: SidecarProps) {
  const [gallery, setGallery]       = useState<{ photos: GalleryPhoto[]; idx: number } | null>(null);
  const [drawing, setDrawing]       = useState<{ src: string; label: string; key: string } | null>(null);
  const [annotations, setAnnotations] = useState<Record<string, string>>({});
  const [userPhotos, setUserPhotos]   = useState<{ src: string; alt: string }[]>([]);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const PLAN_KEY  = 'plan_logement';
  const PHOTO_KEY = 'photo_principale';

  const PIECE_PHOTOS: Record<string, { src: string; alt: string; label: string; key: string }> = {
    luminaires:  { src: customPhotos?.[0] ?? annotations[PHOTO_KEY] ?? photoMainLogement, alt: 'Luminaires',    label: 'Luminaires',    key: PHOTO_KEY },
    electricite: { src: customPhotos?.[0] ?? annotations[PHOTO_KEY] ?? photoMainLogement, alt: 'Électricité',   label: 'Électricité',   key: PHOTO_KEY },
    equipements: { src: customPhotos?.[0] ?? annotations[PHOTO_KEY] ?? photoMainLogement, alt: 'Équipements',   label: 'Équipements',   key: PHOTO_KEY },
    mobilier:    { src: customPhotos?.[0] ?? annotations[PHOTO_KEY] ?? photoMainLogement, alt: 'Mobilier',      label: 'Mobilier',      key: PHOTO_KEY },
  };

  const basePhotos: GalleryPhoto[] = customPhotos && customPhotos.length > 0
    ? customPhotos.map((src, i) => ({ src, alt: `Photo ${i + 1}`, label: `Photo ${i + 1}` }))
    : [
        { src: annotations[PHOTO_KEY] ?? photoMainLogement, alt: 'Vue principale', label: 'Vue principale' },
        { src: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Coin cuisine', label: 'Coin cuisine' },
        { src: 'https://images.pexels.com/photos/1910472/pexels-photo-1910472.jpeg?auto=compress&cs=tinysrgb&w=800', alt: 'Salle de bain', label: 'Salle de bain' },
      ];

  // All photos merged: base + user-added
  const allPhotos: GalleryPhoto[] = [
    ...basePhotos,
    ...userPhotos.map((p, i) => ({ src: p.src, alt: p.alt, label: `Photo ajoutée ${i + 1}` })),
  ];

  const clampedIdx = Math.min(activePhotoIdx, allPhotos.length - 1);

  function handleAddPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        const src = ev.target?.result as string;
        setUserPhotos(prev => [...prev, { src, alt: file.name }]);
        // Auto-select the newly added photo
        setActivePhotoIdx(allPhotos.length + userPhotos.length);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }

  const hasAnything = showCarto || showPlanEtage || showPlanLogement || showPhotos;

  if (!hasAnything) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 py-8 bg-slate-50">
        <MapPin className="w-7 h-7 text-slate-300" />
        <p className="text-xs text-center text-slate-400 leading-relaxed px-4">
          Les visuels de<br />localisation apparaîtront<br />ici
        </p>
      </div>
    );
  }

  function SideCard({
    children, label, visible, imgSrc, onExpand, onAnnotate,
  }: {
    children: React.ReactNode;
    label: string;
    visible: boolean;
    imgSrc?: string;
    onExpand?: () => void;
    onAnnotate?: () => void;
  }) {
    if (!visible) return null;
    return (
      <div className="overflow-hidden border-b border-slate-200 bg-white animate-[fadeIn_0.3s_ease-out] flex-shrink-0">
        <div className="relative group" onClick={onExpand} style={{ cursor: onExpand ? 'pointer' : 'default' }}>
          {children}
          {onExpand && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
          )}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 py-1.5 gap-1.5">
            <span className="text-[11px] font-semibold text-slate-900 bg-white/85 backdrop-blur-sm px-2 py-0.5 rounded truncate min-w-0">
              {label}
              {imgSrc && annotations[imgSrc === plan108 ? PLAN_KEY : PHOTO_KEY] && (
                <span className="ml-1.5 inline-flex items-center gap-0.5 text-red-600 font-bold">
                  <PenLine className="w-2.5 h-2.5" /> Annoté
                </span>
              )}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              {onAnnotate && (
                <button
                  onClick={e => { e.stopPropagation(); onAnnotate(); }}
                  className="flex items-center gap-1 text-[10px] text-slate-700 font-medium bg-white/85 backdrop-blur-sm hover:bg-white px-1.5 py-0.5 rounded transition-colors border border-slate-200/60"
                >
                  <PenLine className="w-2.5 h-2.5 text-red-500" />
                  Préciser
                </button>
              )}
              {onExpand && (
                <button
                  onClick={e => { e.stopPropagation(); onExpand(); }}
                  className="flex items-center gap-1 text-[10px] text-slate-700 font-medium bg-white/85 backdrop-blur-sm hover:bg-white px-1.5 py-0.5 rounded transition-colors border border-slate-200/60"
                >
                  <Maximize2 className="w-2.5 h-2.5" />
                  Agrandir
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const planDisplaySrc  = annotations[PLAN_KEY]  ?? customPlanLogement ?? plan108;
  const photoDisplaySrc = annotations[PHOTO_KEY] ?? (customPhotos?.[0] ?? photoMainLogement);

  return (
    <>
      <div className="flex flex-col overflow-y-auto h-full" style={{ scrollbarWidth: 'thin' }}>

        {/* Cartouche cartographique */}
        <SideCard
          visible={showCarto}
          label={residenceName ? `Localisation — ${residenceName}` : 'Localisation'}
          onExpand={() => window.open('https://www.openstreetmap.org/?mlat=45.7472&mlon=4.8612&zoom=17', '_blank')}
        >
          <img src={customCarto ?? cartoCavalier} alt="Cartouche cartographique" className="w-full object-cover" style={{ height: 140 }} />
        </SideCard>

        {/* Plan étage */}
        <SideCard
          visible={showPlanEtage}
          label={etageName ? `Plan étage — ${etageName}` : 'Plan étage'}
          onExpand={() => setGallery({ photos: [{ src: customPlanEtage ?? planEvac, alt: 'Plan étage', label: etageName ? `Plan étage — ${etageName}` : 'Plan étage' }], idx: 0 })}
        >
          <div className="w-full bg-white flex items-center justify-center" style={{ height: 130 }}>
            <img src={customPlanEtage ?? planEvac} alt="Plan étage" className="w-full h-full object-contain" />
          </div>
        </SideCard>

        {/* Plan logement */}
        <SideCard
          visible={showPlanLogement}
          label={logementNum ? `Plan ${logementNum}` : 'Plan'}
          imgSrc={customPlanLogement ?? plan108}
          onExpand={() => setGallery({ photos: [{ src: planDisplaySrc, alt: 'Plan', label: `Plan ${logementNum}` }], idx: 0 })}
          onAnnotate={() => setDrawing({ src: customPlanLogement ?? plan108, label: `Plan ${logementNum}`, key: PLAN_KEY })}
        >
          <div className="w-full bg-white flex items-center justify-center" style={{ height: 130 }}>
            <img src={planDisplaySrc} alt="Plan" className="w-full h-full object-contain" />
          </div>
        </SideCard>

        {/* ── Photos ──────────────────────────────────────────── */}
        {showPhotos && (() => {
          const piecePhoto = selectedPiece ? PIECE_PHOTOS[selectedPiece] : null;

          // In piece mode: single photo, no gallery
          if (piecePhoto) {
            const displaySrc = annotations[piecePhoto.key] ?? piecePhoto.src;
            const annotated = !!annotations[piecePhoto.key];
            return (
              <div className="overflow-hidden border-b border-slate-200 bg-white flex-shrink-0 animate-[fadeIn_0.3s_ease-out]">
                <div className="relative group">
                  <img
                    src={displaySrc}
                    alt={piecePhoto.label}
                    className="w-full object-cover transition-all duration-300"
                    style={{ height: 220 }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                  <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 py-1.5 gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-900 bg-white/85 backdrop-blur-sm px-2 py-0.5 rounded truncate min-w-0">
                      {piecePhoto.label}
                      {annotated && (
                        <span className="ml-1.5 inline-flex items-center gap-0.5 text-red-600 font-bold">
                          <PenLine className="w-2.5 h-2.5" /> Annoté
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => setDrawing({ src: piecePhoto.src, label: piecePhoto.label, key: piecePhoto.key })}
                        className="flex items-center gap-1 text-[10px] text-slate-700 font-medium bg-white/85 backdrop-blur-sm hover:bg-white px-1.5 py-0.5 rounded transition-colors border border-slate-200/60"
                      >
                        <PenLine className="w-2.5 h-2.5 text-red-500" />
                        Préciser
                      </button>
                      <button
                        onClick={() => setGallery({ photos: [{ src: displaySrc, alt: piecePhoto.label, label: piecePhoto.label }], idx: 0 })}
                        className="flex items-center gap-1 text-[10px] text-slate-700 font-medium bg-white/85 backdrop-blur-sm hover:bg-white px-1.5 py-0.5 rounded transition-colors border border-slate-200/60"
                      >
                        <Maximize2 className="w-2.5 h-2.5" />
                        Agrandir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          // Full gallery mode (no piece selected)
          const activePhoto = allPhotos[clampedIdx];
          const activeAnnotKey = clampedIdx === 0 ? PHOTO_KEY : null;
          const activeAnnotated = !!(activeAnnotKey && annotations[activeAnnotKey]);
          const activeSrcForDrawing = clampedIdx === 0 ? photoMainLogement : activePhoto.src;

          return (
            <div className="overflow-hidden border-b border-slate-200 bg-white flex-shrink-0 animate-[fadeIn_0.3s_ease-out]">

              {/* Main viewer — full width */}
              <div className="relative group">
                <img
                  src={activePhoto.src}
                  alt={activePhoto.alt}
                  className="w-full object-cover transition-all duration-300"
                  style={{ height: 220 }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />

                {/* Badge counter */}
                <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                  {clampedIdx + 1} / {allPhotos.length}
                </div>

                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 py-1.5 gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-900 bg-white/85 backdrop-blur-sm px-2 py-0.5 rounded truncate min-w-0">
                    {activePhoto.label ?? 'Photos du logement'}
                    {activeAnnotated && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 text-red-600 font-bold">
                        <PenLine className="w-2.5 h-2.5" /> Annoté
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setDrawing({ src: activeSrcForDrawing, label: activePhoto.label ?? 'Photo', key: activeAnnotKey ?? `photo_user_${clampedIdx}` })}
                      className="flex items-center gap-1 text-[10px] text-slate-700 font-medium bg-white/85 backdrop-blur-sm hover:bg-white px-1.5 py-0.5 rounded transition-colors border border-slate-200/60"
                    >
                      <PenLine className="w-2.5 h-2.5 text-red-500" />
                      Préciser
                    </button>
                    <button
                      onClick={() => setGallery({ photos: allPhotos, idx: clampedIdx })}
                      className="flex items-center gap-1 text-[10px] text-slate-700 font-medium bg-white/85 backdrop-blur-sm hover:bg-white px-1.5 py-0.5 rounded transition-colors border border-slate-200/60"
                    >
                      <Maximize2 className="w-2.5 h-2.5" />
                      Agrandir
                    </button>
                  </div>
                </div>
              </div>

              {/* Thumbnail strip */}
              <div className="flex border-t border-slate-100 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {allPhotos.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setActivePhotoIdx(i)}
                    className={`flex-shrink-0 overflow-hidden border-r border-slate-100 last:border-r-0 transition-all ${
                      i === clampedIdx
                        ? 'ring-2 ring-inset ring-blue-500 opacity-100'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ width: 56, height: 48 }}
                    title={p.label ?? p.alt}
                  >
                    <img src={p.src} alt={p.alt} className="w-full h-full object-cover" />
                  </button>
                ))}

                {/* Add photo button */}
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="flex-shrink-0 flex flex-col items-center justify-center gap-0.5 border-l border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
                  style={{ width: 48, height: 48 }}
                  title="Ajouter une photo"
                >
                  <span className="text-lg leading-none font-light">+</span>
                  <span className="text-[8px] font-medium uppercase tracking-wide leading-none">Photo</span>
                </button>
              </div>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleAddPhoto}
              />
            </div>
          );
        })()}
      </div>

      {gallery && (
        <GalleryModal
          photos={gallery.photos}
          initialIndex={gallery.idx}
          onClose={() => setGallery(null)}
        />
      )}

      {drawing && (
        <DrawingModal
          imageSrc={drawing.src}
          imageLabel={drawing.label}
          onSave={(dataUrl) => {
            setAnnotations(prev => ({ ...prev, [drawing.key]: dataUrl }));
            setDrawing(null);
          }}
          onClose={() => setDrawing(null)}
        />
      )}
    </>
  );
}

// ─── AI Chat Panel (step 1 — Assistance IA mode) ─────────────────────────────

export interface AiFieldSuggestion {
  typeProblem: string;   // A
  titre: string;         // B
  description: string;   // C
  categorie: string;     // D — key matching CATEGORIES_DI
  quickSolutions: string[];
}

interface AiChatPanelProps {
  aiMessages: { role: 'user' | 'assistant'; text: string }[];
  aiThinking: boolean;
  aiInput: string;
  isListening: boolean;
  categorie: string;
  titre: string;
  description: string;
  locSummary: string;
  pieceLabel: string;
  elementLabel: string;
  aiSuggestion: AiFieldSuggestion | null;
  acceptedFields: Set<keyof Omit<AiFieldSuggestion, 'quickSolutions'>>;
  onInputChange: (v: string) => void;
  onSend: (text: string) => void;
  onToggleMic: () => void;
  onAcceptField: (field: keyof Omit<AiFieldSuggestion, 'quickSolutions'>) => void;
  onRejectField: (field: keyof Omit<AiFieldSuggestion, 'quickSolutions'>) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}

function AiChatPanel({
  aiMessages, aiThinking, aiInput, isListening,
  categorie, titre, description,
  locSummary, pieceLabel, elementLabel,
  aiSuggestion, acceptedFields,
  onInputChange, onSend, onToggleMic,
  onAcceptField, onRejectField, onAcceptAll, onRejectAll,
}: AiChatPanelProps) {
  const chatRef = useRef<HTMLDivElement>(null);
  const [quickOpen, setQuickOpen] = useState(false);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [aiMessages, aiThinking]);

  const SUGGESTION_FIELDS: { key: keyof Omit<AiFieldSuggestion, 'quickSolutions'>; label: string; icon: string }[] = [
    { key: 'typeProblem', label: 'Type de problème', icon: '🔍' },
    { key: 'titre',       label: 'Titre personnalisé', icon: '✏️' },
    { key: 'description', label: 'Description',        icon: '📝' },
    { key: 'categorie',   label: 'Catégorie',          icon: '🏷️' },
  ];

  return (
    <div className="flex flex-col gap-3">

      {/* ── Localisation context banner ── */}
      {locSummary && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 animate-[fadeIn_0.25s_ease-out]">
          <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-0.5">Contexte localisation</p>
            <p className="text-xs text-blue-800 font-medium leading-relaxed truncate">{locSummary}</p>
            {(pieceLabel || elementLabel) && (
              <p className="text-[11px] text-blue-600 mt-0.5">
                {[pieceLabel, elementLabel].filter(Boolean).join(' › ')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Chat window */}
      <div ref={chatRef} className="border border-slate-200 rounded-xl overflow-y-auto bg-slate-50 flex flex-col gap-2 p-3" style={{ minHeight: 180, maxHeight: 240 }}>
        {aiMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm'
            }`}>
              {msg.role === 'assistant' && <span className="text-blue-500 font-bold mr-1">✨</span>}
              {msg.text}
            </div>
          </div>
        ))}
        {aiThinking && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-xl rounded-bl-sm px-3 py-2 flex gap-1">
              {[0,1,2].map(i => (
                <span key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input + mic */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            value={aiInput}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && onSend(aiInput)}
            placeholder="Décrivez le problème…"
            className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 placeholder:text-slate-300 pr-10 ${
              isListening ? 'border-red-300 bg-red-50 animate-pulse' : 'border-slate-200'
            }`}
          />
          <button onClick={onToggleMic}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
              isListening ? 'text-red-500 bg-red-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`} title="Dicter">
            <Mic className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => onSend(aiInput)}
          disabled={!aiInput.trim() || aiThinking}
          className="px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-40">
          Envoyer
        </button>
      </div>

      {/* ── AI Suggestions panel ── */}
      {aiSuggestion && (
        <div className="border border-blue-200 rounded-xl overflow-hidden animate-[fadeIn_0.3s_ease-out]">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-500">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-bold text-white">Suggestions IA — à valider</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onAcceptAll}
                className="flex items-center gap-1 text-[10px] font-semibold bg-white text-blue-700 px-2 py-0.5 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <CheckCircle2 className="w-3 h-3" /> Tout accepter
              </button>
              <button
                onClick={onRejectAll}
                className="flex items-center gap-1 text-[10px] font-semibold bg-white/20 text-white px-2 py-0.5 rounded-lg hover:bg-white/30 transition-colors"
              >
                <X className="w-3 h-3" /> Tout refuser
              </button>
            </div>
          </div>

          {/* Suggestion rows */}
          <div className="divide-y divide-slate-100 bg-white">
            {SUGGESTION_FIELDS.map(({ key, label, icon }) => {
              const value = key === 'categorie'
                ? (CATEGORIES_DI.find(c => c.key === aiSuggestion.categorie)?.label ?? aiSuggestion.categorie)
                : aiSuggestion[key];
              const accepted = acceptedFields.has(key);
              return (
                <div key={key} className={`flex items-start gap-2.5 px-3 py-2.5 transition-colors ${accepted ? 'bg-emerald-50' : ''}`}>
                  <span className="text-sm flex-shrink-0 mt-0.5">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
                    <p className={`text-xs mt-0.5 leading-relaxed ${accepted ? 'text-emerald-700 font-medium' : 'text-slate-700'}`}>{value}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 mt-0.5">
                    {accepted ? (
                      <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-lg">
                        <CheckCircle2 className="w-3 h-3" /> Accepté
                      </span>
                    ) : (
                      <>
                        <button onClick={() => onAcceptField(key)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors" title="Accepter">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => onRejectField(key)}
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Refuser">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick solutions accordion */}
          {aiSuggestion.quickSolutions.length > 0 && (
            <div className="border-t border-slate-100">
              <button
                onClick={() => setQuickOpen(o => !o)}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🔧</span>
                  <span className="text-xs font-semibold text-slate-700">Solutions rapides en attendant</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${quickOpen ? 'rotate-180' : ''}`} />
              </button>
              {quickOpen && (
                <div className="px-3 pb-3 space-y-1.5 animate-[fadeIn_0.2s_ease-out]">
                  {aiSuggestion.quickSolutions.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-100 rounded-lg">
                      <span className="text-xs font-bold text-amber-600 flex-shrink-0">{i + 1}.</span>
                      <p className="text-xs text-amber-800 leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filled fields recap (when no suggestions yet) */}
      {!aiSuggestion && (categorie || titre) && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
          <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide mb-1">Champs remplis automatiquement</p>
          {categorie && <p className="text-slate-700"><span className="font-medium text-slate-500">Catégorie :</span> {CATEGORIES_DI.find(c => c.key === categorie)?.icon} {CATEGORIES_DI.find(c => c.key === categorie)?.label}</p>}
          {titre     && <p className="text-slate-700"><span className="font-medium text-slate-500">Titre :</span> {titre}</p>}
          {description && <p className="text-slate-700 line-clamp-2"><span className="font-medium text-slate-500">Description :</span> {description}</p>}
        </div>
      )}

    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

// ─── Wizard quality bar ───────────────────────────────────────────────────────

import { completenessColors } from './completenessScore';

// ─── Wizard quality bar ───────────────────────────────────────────────────────

type WizardCriterionKey = 'localisation' | 'categorie' | 'description' | 'criticite' | 'photo' | 'demandeur' | 'batiment';

interface WizardCriterion {
  key: WizardCriterionKey;
  label: string;
  Icon: React.ElementType;
  weight: number;
  filled: boolean;
}

interface WizardQuality {
  siteId: string;
  residenceId: string;
  batimentId: string;
  arboSelectedId: string;
  categorie: string;
  titre: string;
  description: string;
  criticite: CriticiteDI;
  criticiteChosen: boolean;
  demandeurNom: string;
  hasPhoto: boolean;
}

function useWizardScore(q: WizardQuality) {
  return useMemo(() => {
    const criteria: WizardCriterion[] = [
      { key: 'localisation', label: 'Localisation', Icon: MapPin,        weight: 20, filled: !!q.siteId || !!q.residenceId || !!q.arboSelectedId },
      { key: 'categorie',    label: 'Catégorie',    Icon: List,           weight: 15, filled: !!q.categorie },
      { key: 'description',  label: 'Description',  Icon: FileText,       weight: 20, filled: !!q.description.trim() },
      { key: 'criticite',    label: 'Criticité',    Icon: AlertTriangle,  weight: 15, filled: q.criticiteChosen },
      { key: 'photo',        label: 'Photo',        Icon: Paperclip,      weight: 10, filled: q.hasPhoto },
      { key: 'demandeur',    label: 'Demandeur',    Icon: User,           weight: 10, filled: !!q.demandeurNom.trim() },
      { key: 'batiment',     label: 'Bâtiment',     Icon: Building2,      weight: 10, filled: !!q.batimentId },
    ];
    const score = criteria.reduce((s, c) => s + (c.filled ? c.weight : 0), 0);
    const status = score === 100 ? 'complete' : score >= 50 ? 'good' : 'low';
    return { score, criteria, status } as const;
  }, [q.siteId, q.residenceId, q.batimentId, q.arboSelectedId, q.categorie, q.description, q.criticiteChosen, q.demandeurNom, q.hasPhoto]);
}

function WizardQualityBar({ quality }: { quality: WizardQuality }) {
  const { score, criteria } = useWizardScore(quality);
  const colors = completenessColors(score);
  const status = score === 100 ? 'complete' : score >= 50 ? 'good' : 'low';
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollChips(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -140 : 140, behavior: 'smooth' });
  }

  return (
    <div className={`flex-shrink-0 px-6 py-2 border-b ${colors.banner} flex items-center gap-3`}>
      {/* Circle-check icon */}
      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${colors.icon}`} />
      <span className={`text-xs font-bold flex-shrink-0 ${colors.text}`}>{score}%</span>

      {/* Progress bar */}
      <div className={`w-20 h-1.5 rounded-full flex-shrink-0 overflow-hidden ${colors.track}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Status label */}
      <span className={`text-[11px] font-semibold flex-shrink-0 ${colors.text}`}>
        {status === 'complete' && 'Dossier complet'}
        {status === 'good'     && <>Qualification requise <span className="text-red-500 font-bold">*</span></>}
        {status === 'low'      && <>Qualification requise <span className="text-red-500 font-bold">*</span></>}
      </span>

      {/* Chips with scroll arrows */}
      <div className="flex items-center flex-1 min-w-0 relative">
        {/* Left arrow */}
        <button
          type="button"
          onClick={() => scrollChips('left')}
          className="flex-shrink-0 p-0.5 rounded hover:bg-black/10 transition-colors z-10"
        >
          <ChevronLeft className={`w-3.5 h-3.5 ${colors.text} opacity-60`} />
        </button>

        {/* Scrollable chips */}
        <div
          ref={scrollRef}
          className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0"
          style={{ scrollbarWidth: 'none' }}
        >
          {criteria.map(c => {
            const Icon = c.Icon;
            if (c.filled) {
              return (
                <span
                  key={c.key}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-300 bg-emerald-100 text-emerald-700 text-[10px] font-semibold whitespace-nowrap flex-shrink-0"
                >
                  <Icon className="w-3 h-3" />
                  {c.label}
                </span>
              );
            }
            return (
              <span
                key={c.key}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-white text-slate-600 text-[10px] font-semibold whitespace-nowrap flex-shrink-0"
              >
                <Icon className="w-3 h-3" />
                {c.label}
              </span>
            );
          })}
        </div>

        {/* Right arrow */}
        <button
          type="button"
          onClick={() => scrollChips('right')}
          className="flex-shrink-0 p-0.5 rounded hover:bg-black/10 transition-colors z-10"
        >
          <ChevronRight className={`w-3.5 h-3.5 ${colors.text} opacity-60`} />
        </button>
      </div>
    </div>
  );
}

const STEPS = ['Localisation', 'Description', 'Criticité', 'Demandeur'];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 px-6 py-4 border-b border-slate-100">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < current ? 'bg-blue-600 text-white' :
              i === current ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
              'bg-slate-100 text-slate-400'
            }`}>
              {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-[10px] font-medium whitespace-nowrap ${i === current ? 'text-blue-600' : i < current ? 'text-slate-600' : 'text-slate-400'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mb-4 mx-1 ${i < current ? 'bg-blue-600' : 'bg-slate-100'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Tree node icon ───────────────────────────────────────────────────────────

function TreeNodeIcon({ type }: { type: NodeType }) {
  const cls = 'w-3.5 h-3.5 flex-shrink-0';
  if (type === 'site')      return <MapPin    className={`${cls} text-blue-500`}   />;
  if (type === 'residence') return <Building2 className={`${cls} text-teal-600`}   />;
  if (type === 'batiment')  return <Layers    className={`${cls} text-slate-500`}  />;
  if (type === 'etage')     return <Layers    className={`${cls} text-slate-400`}  />;
  return <Home className={`${cls} text-slate-400`} />;
}

// ─── Arborescence picker ──────────────────────────────────────────────────────

interface ArborescencePickerProps {
  tree: TreeNode[];
  selectedId: string;
  selectedType: NodeType | '';
  onSelect: (id: string, type: NodeType, path: string) => void;
  loading: boolean;
}

function ArborescencePicker({ tree, selectedId, selectedType, onSelect, loading }: ArborescencePickerProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  // Auto-expand ancestors of selectedId so the selection stays visible on remount
  useEffect(() => {
    if (!selectedId || !tree.length) return;
    const toExpand: Record<string, boolean> = {};
    function findAndCollect(node: TreeNode, target: string): boolean {
      if (node.id === target) return true;
      for (const child of node.children ?? []) {
        if (findAndCollect(child, target)) {
          toExpand[node.id] = true;
          return true;
        }
      }
      return false;
    }
    tree.forEach(root => findAndCollect(root, selectedId));
    if (Object.keys(toExpand).length) {
      setExpanded(prev => ({ ...prev, ...toExpand }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, tree]);

  function buildPath(node: TreeNode, all: TreeNode[]): string {
    return node.nom;
  }

  function matches(node: TreeNode, q: string): boolean {
    return node.nom.toLowerCase().includes(q.toLowerCase());
  }

  function deepFilter(node: TreeNode, q: string): TreeNode | null {
    if (!q) return node;
    const selfMatch = matches(node, q);
    const filteredChildren = (node.children ?? []).map(c => deepFilter(c, q)).filter(Boolean) as TreeNode[];
    if (selfMatch || filteredChildren.length > 0) {
      return { ...node, children: filteredChildren.length > 0 ? filteredChildren : node.children };
    }
    return null;
  }

  const visibleTree = search
    ? tree.map(n => deepFilter(n, search)).filter(Boolean) as TreeNode[]
    : tree;

  function NodeRow({ node, depth, ancestors }: { node: TreeNode; depth: number; ancestors: string[] }) {
    const hasChildren = (node.children?.length ?? 0) > 0;
    const isExpanded  = expanded[node.id] ?? (search.length > 0);
    const isSelected  = selectedId === node.id;
    const path = [...ancestors, node.nom].join(' › ');

    return (
      <div>
        <div
          className={`flex items-center gap-1.5 py-1.5 rounded-lg cursor-pointer transition-all group
            ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
          style={{ paddingLeft: `${8 + depth * 16}px`, paddingRight: 8 }}
        >
          {/* Expand/collapse */}
          <span
            className="w-4 h-4 flex items-center justify-center text-slate-300 flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); if (hasChildren) toggle(node.id); }}
          >
            {hasChildren
              ? isExpanded
                ? <ChevronDown  className="w-3 h-3" />
                : <ChevronRight className="w-3 h-3" />
              : null}
          </span>

          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(isSelected ? '' : node.id, node.type, isSelected ? '' : path)}
            className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 cursor-pointer flex-shrink-0
              accent-blue-600"
            onClick={e => e.stopPropagation()}
          />

          {/* Icon + label */}
          <span
            className="flex items-center gap-1.5 flex-1 min-w-0"
            onClick={() => {
              onSelect(isSelected ? '' : node.id, node.type, isSelected ? '' : path);
              if (hasChildren) toggle(node.id);
            }}
          >
            <TreeNodeIcon type={node.type} />
            <span className={`text-xs truncate ${isSelected ? 'text-blue-700 font-semibold' : 'text-slate-700'}`}>
              {node.nom}
            </span>
          </span>
        </div>

        {(isExpanded || (search.length > 0)) && hasChildren && (
          <div>
            {node.children!.map(child => (
              <NodeRow key={child.id} node={child} depth={depth + 1} ancestors={[...ancestors, node.nom]} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      {/* Search */}
      <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher dans l'arborescence..."
            className="w-full pl-6 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="overflow-y-auto max-h-56 py-1 px-1">
        {visibleTree.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">Aucun résultat</p>
        ) : (
          visibleTree.map(node => (
            <NodeRow key={node.id} node={node} depth={0} ancestors={[]} />
          ))
        )}
      </div>

      {/* Selection summary */}
      {selectedId && (
        <div className="px-3 py-2 border-t border-blue-100 bg-blue-50 flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span className="text-xs text-blue-700 font-medium truncate">
            {selectedType && <TreeNodeIcon type={selectedType} />}
            {' '}Sélection confirmée
          </span>
          <button
            onClick={() => onSelect('', 'site', '')}
            className="ml-auto text-[10px] text-blue-500 hover:text-blue-700 transition-colors whitespace-nowrap"
          >
            Effacer
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Form helpers ─────────────────────────────────────────────────────────────

function Req() {
  return <span className="text-red-500 ml-0.5">*</span>;
}

function RequiredLegend() {
  return (
    <p className="text-[11px] text-slate-400 mb-3">
      Les champs marqués d'un <span className="text-red-500 font-bold">*</span> sont obligatoires.
    </p>
  );
}

function FieldErrorMsg({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-[11px] text-red-500 font-medium mt-1">
      <span className="w-3 h-3 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] font-black flex-shrink-0">!</span>
      {msg}
    </p>
  );
}

function fieldInputClass(error: string | null, extra = '') {
  return `w-full border rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 placeholder:text-slate-300 transition-colors ${
    error
      ? 'border-red-300 bg-red-50/30 focus:ring-red-300/40 focus:border-red-400'
      : 'border-slate-200 focus:ring-blue-500/30 focus:border-blue-400'
  } ${extra}`;
}

// ─── AI Qualification Assistant ──────────────────────────────────────────────

type AiQualifStatus = 'idle' | 'loading' | 'done';

interface AiQualifResult {
  criticite: CriticiteDI;
  confidence: number;
  raisons: string[];
}

function AiQualificationAssistant({
  titre, description, categorie, elementChoisi, locSummary, onApply,
}: {
  titre: string; description: string; categorie: string;
  elementChoisi: string; locSummary: string;
  onApply: (c: CriticiteDI, justif: string) => void;
}) {
  const [status, setStatus] = useState<AiQualifStatus>('idle');
  const [result, setResult] = useState<AiQualifResult | null>(null);

  function analyse() {
    setStatus('loading');
    setResult(null);

    setTimeout(() => {
      const text = `${titre} ${description} ${categorie} ${elementChoisi}`.toLowerCase();

      const raisons: string[] = [];
      let score: CriticiteDI = 'moyenne';
      let confidence = 72;

      // Signals that push toward critique
      if (/fuite|inondation|dégât des eaux|eau qui coule/.test(text)) {
        raisons.push('Fuite ou présence d\'eau détectée');
        score = 'haute'; confidence = 85;
        if (/importante|partout|plafond|effondrement/.test(text)) { score = 'critique'; confidence = 94; }
      }
      if (/gaz|odeur.*gaz|fuite.*gaz/.test(text)) {
        raisons.push('Risque gaz identifié'); score = 'critique'; confidence = 97;
      }
      if (/électricité|court-circuit|odeur brûlé|feu|fumée/.test(text)) {
        raisons.push('Risque électrique ou incendie'); score = 'critique'; confidence = 96;
      }
      if (/ascenseur.*bloqué|personne.*coinc/.test(text)) {
        raisons.push('Personne potentiellement bloquée'); score = 'critique'; confidence = 98;
      }
      if (/chauffage|sans eau chaude|pas de chauffage/.test(text)) {
        raisons.push('Confort essentiel impacté');
        if (score !== 'critique') { score = 'haute'; confidence = 83; }
      }
      if (/wc|toilette|canalisation|bouchée|bouché/.test(text)) {
        raisons.push('Sanitaires hors service');
        if (score === 'moyenne') { score = 'haute'; confidence = 81; }
      }
      if (/porte.*bloquée|serrure.*cassée|impossible d\'entrer/.test(text)) {
        raisons.push('Accès au logement compromis');
        if (score !== 'critique') { score = 'haute'; confidence = 88; }
      }
      if (/ampoule|vitre.*fissure|robinet.*goutte/.test(text)) {
        raisons.push('Problème mineur sans urgence'); score = 'faible'; confidence = 79;
      }

      // Location signals
      if (/salle de bain|sdb|douche/.test(text)) raisons.push('Localisation : Salle de bain');
      else if (/cuisine/.test(text)) raisons.push('Localisation : Cuisine');
      else if (locSummary) raisons.push(`Localisation : ${locSummary.split(' › ').slice(-2).join(' › ')}`);

      // Element signals
      if (elementChoisi) raisons.push(`Élément concerné : ${elementChoisi}`);

      // Risk of worsening
      if (['critique', 'haute'].includes(score)) raisons.push('Risque d\'aggravation rapide');

      if (raisons.length === 0) {
        raisons.push('Aucun signal de risque élevé détecté');
        raisons.push('Type de maintenance courante');
        score = 'moyenne'; confidence = 68;
      }

      setResult({ criticite: score, confidence, raisons });
      setStatus('done');
    }, 1600);
  }

  const cfg = result ? CRITICITE_CFG[result.criticite] : null;

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      {/* Header / trigger */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-base">🤖</span>
          <div>
            <p className="text-xs font-bold text-slate-700">Assistant IA de qualification</p>
            <p className="text-[10px] text-slate-400">Analyse automatique et recommandation de criticité</p>
          </div>
        </div>
        {status === 'idle' && (
          <button
            type="button"
            onClick={analyse}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            <Sparkles className="w-3.5 h-3.5" />
            Analyser
          </button>
        )}
        {status === 'loading' && (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="text-xs font-medium">Analyse en cours…</span>
          </div>
        )}
        {status === 'done' && (
          <button
            type="button"
            onClick={() => { setStatus('idle'); setResult(null); }}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            Relancer
          </button>
        )}
      </div>

      {/* Loading animation */}
      {status === 'loading' && (
        <div className="px-4 py-5 space-y-2">
          {['Lecture du titre et de la description…', 'Détection des signaux de risque…', 'Calcul du niveau recommandé…'].map((t, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 border-2 border-blue-300 border-t-transparent rounded-full animate-spin flex-shrink-0"
                style={{ animationDelay: `${i * 0.2}s` }} />
              <span className="text-xs text-slate-500">{t}</span>
            </div>
          ))}
        </div>
      )}

      {/* Result card */}
      {status === 'done' && result && cfg && (
        <div className="px-4 py-4 space-y-3 animate-[fadeIn_0.3s_ease-out]">
          {/* Confidence + criticité */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                {cfg.icon} {cfg.label}
              </span>
              <span className="text-xs text-slate-500">Délai recommandé : <span className="font-semibold text-slate-700">{cfg.sla}</span></span>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 font-medium">Confiance</p>
              <p className="text-lg font-bold text-slate-800 leading-none">{result.confidence}%</p>
            </div>
          </div>

          {/* Confidence bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                result.confidence >= 90 ? 'bg-emerald-500' :
                result.confidence >= 75 ? 'bg-blue-500' : 'bg-amber-500'
              }`}
              style={{ width: `${result.confidence}%` }}
            />
          </div>

          {/* Reasons */}
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Raisons identifiées</p>
            <ul className="space-y-1">
              {result.raisons.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                  <span className="text-emerald-500 flex-shrink-0 mt-0.5">•</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Apply button */}
          <button
            type="button"
            onClick={() => onApply(result.criticite, `Suggestion IA (confiance ${result.confidence}%) — ${result.raisons.join(', ')}`)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors border-2 ${cfg.bg} ${cfg.text} border-current hover:opacity-90`}>
            <CheckCircle2 className="w-4 h-4" />
            Appliquer cette recommandation
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Criticité historique (edit mode) ────────────────────────────────────────

interface HistoriqueEntry {
  id: string;
  description: string;
  auteur: string;
  created_at: string;
  type_evenement: string;
}

function CriticiteHistorique({ interventionId }: { interventionId: string }) {
  const [rows, setRows] = useState<HistoriqueEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('historique_intervention')
      .select('id, description, auteur, created_at, type_evenement')
      .eq('intervention_id', interventionId)
      .in('type_evenement', ['creation', 'qualification'])
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setRows(data ?? []);
        setLoading(false);
      });
  }, [interventionId]);

  function parseCriticite(desc: string): string {
    const m = desc.match(/Criticité.*?: (.+?)(?:\s—|$)/);
    return m ? m[1] : '—';
  }

  function parseJustification(desc: string): string {
    const m = desc.match(/Justification : (.+)$/);
    return m ? m[1] : '—';
  }

  function fmtDateTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="mt-2">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Historique de criticité</p>
      {loading ? (
        <div className="flex items-center gap-2 py-3 text-slate-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="text-xs">Chargement…</span>
        </div>
      ) : rows.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-2">Aucun historique disponible</p>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wide">Criticité</th>
                <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wide">Utilisateur</th>
                <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wide">Date et heure</th>
                <th className="text-left px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wide">Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(row => {
                const isCrea = row.type_evenement === 'creation';
                const critLabel = isCrea ? '—' : parseCriticite(row.description);
                const justif = isCrea ? 'Création initiale' : parseJustification(row.description);
                return (
                  <tr key={row.id} className="bg-white">
                    <td className="px-3 py-2 font-medium text-slate-700">{critLabel}</td>
                    <td className="px-3 py-2 text-slate-600">{row.auteur}</td>
                    <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{fmtDateTime(row.created_at)}</td>
                    <td className="px-3 py-2 text-slate-500">{justif}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Favoris & Récents (localStorage) ────────────────────────────────────────

const FAV_SITES_KEY    = 'naofix_fav_sites';
const RECENT_LOCS_KEY  = 'naofix_recent_locs';

interface RecentLoc {
  siteId: string; siteNom: string; siteCode: string;
  residenceId?: string; residenceNom?: string;
  batimentId?: string; batimentNom?: string;
  etageId?: string; etageNom?: string;
  logementId?: string; logementNum?: string;
  label: string;
}

function getFavSites(): string[] {
  try { return JSON.parse(localStorage.getItem(FAV_SITES_KEY) ?? '[]'); } catch { return []; }
}
function toggleFavSite(siteId: string): string[] {
  const favs = getFavSites();
  const next = favs.includes(siteId) ? favs.filter(id => id !== siteId) : [siteId, ...favs];
  localStorage.setItem(FAV_SITES_KEY, JSON.stringify(next));
  return next;
}
function getRecentLocs(): RecentLoc[] {
  try { return JSON.parse(localStorage.getItem(RECENT_LOCS_KEY) ?? '[]'); } catch { return []; }
}
function addRecentLoc(loc: RecentLoc) {
  const recents = getRecentLocs().filter(r => r.label !== loc.label);
  const next = [loc, ...recents].slice(0, 5);
  localStorage.setItem(RECENT_LOCS_KEY, JSON.stringify(next));
}

// ─── Pre-fill map: problem type label → { categorie, description } ─────────────

const PREFILL_BY_TYPE: Record<string, { categorie: string; description: string }> = {
  // ── Plomberie ──────────────────────────────────────────────────────────────
  'Fuite au plafond':                   { categorie: 'plomberie',   description: "Présence d'une infiltration ou d'une fuite d'eau visible au plafond. À localiser et traiter en urgence pour éviter la dégradation de la structure." },
  'Fuite évacuation WC':                { categorie: 'plomberie',   description: "Fuite constatée au niveau de l'évacuation des WC. Odeurs possibles. Intervention nécessaire sur le raccordement ou le joint de cuvette." },
  'Fuite sous le lavabo':               { categorie: 'plomberie',   description: "Fuite d'eau sous le lavabo, au niveau du siphon ou des raccords. À réparer pour éviter les dégâts sur le meuble ou le sol." },
  'Robinet douche coule':               { categorie: 'plomberie',   description: "Le robinet ou le mitigeur de la douche coule en permanence, même fermé. Remplacement du joint ou de la cartouche nécessaire." },
  'WC bouché':                          { categorie: 'plomberie',   description: "Les WC ne s'évacuent plus correctement. Débouchage à réaliser en urgence. Vérifier l'absence de corps étrangers dans la canalisation." },
  'Lavabo bouché':                      { categorie: 'plomberie',   description: "Le lavabo se vidange très lentement ou est complètement bouché. Intervention sur le siphon ou la canalisation d'évacuation." },
  'Bac douche bouché':                  { categorie: 'plomberie',   description: "Le bac de douche ne se vide plus correctement. La bonde est probablement obstruée. Nettoyage ou débouchage nécessaire." },
  'Bac douche fissuré':                 { categorie: 'plomberie',   description: "Le bac de douche présente une fissure ou une fracture visible. Risque de fuite. Remplacement ou réparation avec résine époxy selon l'importance de la fissure." },
  'Flexible douche HS':                 { categorie: 'plomberie',   description: "Le flexible de la douche est percé, cassé ou présente une fuite. Remplacement du flexible à prévoir." },
  'Joint silicone à refaire':           { categorie: 'plomberie',   description: "Les joints silicone (tour de baignoire, bac douche, lavabo) sont décollés, noircis ou dégradés. Refaire les joints pour éviter les infiltrations." },
  'Robinet coule':                      { categorie: 'plomberie',   description: "Le robinet goutte ou coule en permanence. Changement du joint ou de la cartouche mitigeur à effectuer." },
  'Robinet bloqué':                     { categorie: 'plomberie',   description: "Le robinet est dur à manœuvrer ou bloqué. Intervention sur la cartouche ou le mécanisme de commande." },
  'Chasse d\'eau ne fonctionne pas':    { categorie: 'plomberie',   description: "La chasse d'eau ne se déclenche pas ou ne se remplit plus. Mécanisme de chasse à vérifier et remplacer si nécessaire." },
  'Chasse d\'eau coule en permanence':  { categorie: 'plomberie',   description: "La chasse d'eau coule en continu, ce qui génère une consommation d'eau anormale. Flotteur ou clapet à régler ou remplacer." },
  'Chasse d\'eau bruyante':             { categorie: 'plomberie',   description: "La chasse d'eau produit un bruit important lors de la chasse ou du remplissage. Vérification du mécanisme de remplissage." },
  'Lavabo fissuré':                     { categorie: 'plomberie',   description: "Le lavabo présente une fissure ou un éclat. Risque de casse complète. Remplacement préventif à envisager." },
  'Siphon qui coule':                   { categorie: 'plomberie',   description: "Le siphon sous le lavabo ou l'évier présente une fuite. Resserrage ou remplacement du siphon nécessaire." },
  'Évier bouché':                       { categorie: 'plomberie',   description: "L'évier de cuisine ne s'évacue plus. Débouchage du siphon ou de la canalisation à réaliser." },
  'Fuite sous l\'évier':                { categorie: 'plomberie',   description: "Fuite d'eau visible sous l'évier au niveau du siphon ou des raccords. Intervention rapide pour éviter les dommages au meuble." },
  'Mitigeur qui coule':                 { categorie: 'plomberie',   description: "Le mitigeur de l'évier coule goutte à goutte. Remplacement de la cartouche à prévoir." },
  'Bac de douche bouché':               { categorie: 'plomberie',   description: "La bonde du bac de douche est obstruée. Évacuation à déboucher." },
  'Bac de douche fissuré':              { categorie: 'plomberie',   description: "Fissure sur le bac de douche. Risque d'infiltration. Réparation ou remplacement selon gravité." },
  'Flexible percé / qui fuit':          { categorie: 'plomberie',   description: "Le flexible de douche est percé ou présente une fuite au niveau des raccords. Remplacement nécessaire." },
  'Pomme de douche défectueuse':        { categorie: 'plomberie',   description: "La pomme de douche est partiellement obstruée ou défectueuse. Détartrage ou remplacement à prévoir." },
  'Bonde bouchée':                      { categorie: 'plomberie',   description: "La bonde de vidange est obstruée. Nettoyage ou remplacement nécessaire." },
  'Trace d\'humidité':                  { categorie: 'plomberie',   description: "Traces d'humidité constatées sur le plafond ou les murs. Origine de la fuite à identifier et traiter." },
  'Tache de fuite':                     { categorie: 'plomberie',   description: "Tache de fuite visible, probablement liée à une infiltration depuis l'appartement supérieur ou une canalisation." },
  // ── Électricité ────────────────────────────────────────────────────────────
  'Prise défaillante':                  { categorie: 'electricite', description: "Une prise électrique ne fonctionne plus ou présente des signes de surchauffe. Vérification et remplacement de la prise à effectuer par un électricien." },
  'Interrupteur cassé':                 { categorie: 'electricite', description: "L'interrupteur est cassé, fissuré ou ne fonctionne plus. Remplacement de l'interrupteur à prévoir." },
  'Interrupteur ne fonctionne pas':     { categorie: 'electricite', description: "L'interrupteur est inopérant. Vérification du circuit et remplacement si nécessaire." },
  'Néon défectueux':                    { categorie: 'electricite', description: "Le tube fluorescent ou le néon ne s'allume plus ou scintille. Remplacement du tube ou du starter à prévoir." },
  'Panne tableau':                      { categorie: 'electricite', description: "Panne générale ou partielle du tableau électrique. Plusieurs circuits peuvent être hors service. Intervention urgente d'un électricien qualifié." },
  'Disjoncteur déclenché':              { categorie: 'electricite', description: "Un ou plusieurs disjoncteurs ont sauté. Vérification de la cause (surcharge, court-circuit) avant réarmement. Intervention à prévoir si récidive." },
  'Ampoule grillée':                    { categorie: 'electricite', description: "L'ampoule du luminaire est hors service. Remplacement par une ampoule de même culot et puissance." },
  'Lumière scintille':                  { categorie: 'electricite', description: "L'éclairage scintille ou papillote. Peut indiquer une mauvaise connexion ou un starter défaillant. Vérification à effectuer." },
  'Luminaire cassé':                    { categorie: 'electricite', description: "Le luminaire est cassé ou endommagé. Remplacement du luminaire à prévoir." },
  'Prise brûlée':                       { categorie: 'electricite', description: "La prise présente des traces de brûlure ou de surchauffe. Coupure du circuit et remplacement en urgence." },
  'Prise desserrée':                    { categorie: 'electricite', description: "La prise est mal fixée au mur ou sort de son boîtier. Fixation ou remplacement à effectuer." },
  'Prise réseau HS':                    { categorie: 'electricite', description: "La prise réseau (RJ45) ne fonctionne plus. Vérification du câblage et du patch panel." },
  'Détecteur déclenché sans raison':    { categorie: 'securite_incendie', description: "Le détecteur de fumée se déclenche sans cause apparente. Vérification de la pile, du capteur et des sources de fausses alarmes (cuisine, vapeur)." },
  'Détecteur ne fonctionne plus':       { categorie: 'securite_incendie', description: "Le détecteur de fumée est inactif. Remplacement de la pile ou du détecteur à effectuer rapidement pour maintenir la sécurité incendie." },
  'Pile à remplacer':                   { categorie: 'securite_incendie', description: "Le détecteur de fumée signale une pile faible (bip régulier). Remplacement de la pile à effectuer." },
  // ── Chauffage / VMC ────────────────────────────────────────────────────────
  'Radiateur froid':                    { categorie: 'chauffage',   description: "Le radiateur ne chauffe pas ou chauffe insuffisamment. Purge ou vérification de la vanne thermostatique à effectuer." },
  'Radiateur bruyant':                  { categorie: 'chauffage',   description: "Le radiateur émet des bruits (gargouillis, claquements). Purge d'air à réaliser, vérification des vannes." },
  'Fuite sur radiateur':                { categorie: 'chauffage',   description: "Fuite d'eau au niveau du radiateur ou de ses raccords. Intervention urgente pour éviter des dégâts des eaux." },
  'Thermostat cassé':                   { categorie: 'chauffage',   description: "La tête thermostatique est cassée ou bloquée. Remplacement de la tête de vanne thermostatique." },
  'VMC bruyante':                       { categorie: 'chauffage',   description: "La VMC émet un bruit anormal (bourdonnement fort, vibrations). Vérification du moteur et des fixations, nettoyage des filtres." },
  'VMC ne fonctionne pas':              { categorie: 'chauffage',   description: "La VMC ne tourne plus. Absence de ventilation dans le logement. Vérification électrique et mécanique à réaliser." },
  'Mauvaises odeurs':                   { categorie: 'chauffage',   description: "Des mauvaises odeurs proviennent de la VMC ou des bouches de ventilation. Nettoyage des conduits et des grilles à effectuer." },
  // ── Menuiserie / Vitrerie ──────────────────────────────────────────────────
  'Vitre brisée':                       { categorie: 'menuiserie',  description: "La vitre est brisée ou très fissurée. Remplacement en urgence pour des raisons de sécurité et d'isolation thermique." },
  'Vitre fissurée':                     { categorie: 'menuiserie',  description: "La vitre présente une fissure. Risque de casse. Remplacement préventif à programmer." },
  'Fenêtre ne ferme pas':               { categorie: 'menuiserie',  description: "La fenêtre ne se ferme plus correctement, ce qui génère des infiltrations d'air. Réglage des gonds ou remplacement de la crémone." },
  'Joint défectueux':                   { categorie: 'menuiserie',  description: "Le joint périphérique de la fenêtre est décollé ou dégradé. Remplacement du joint pour améliorer l'isolation." },
  'Store défaillant':                   { categorie: 'menuiserie',  description: "Le store est bloqué, cassé ou ne s'enroule plus correctement. Intervention sur le mécanisme ou remplacement du store." },
  'Porte bloquée / coincée':            { categorie: 'menuiserie',  description: "La porte est difficile à ouvrir ou bloquée. Réglage des gonds, ponçage du chant ou remplacement des charnières à prévoir." },
  'Porte bloquée':                      { categorie: 'menuiserie',  description: "La porte est bloquée et ne s'ouvre plus normalement. Vérification des gonds, du cadre et du mécanisme." },
  'Porte ne ferme pas':                 { categorie: 'menuiserie',  description: "La porte ne se ferme plus correctement, laissant un jeu important. Réglage ou remplacement des charnières." },
  'Gonds abîmés':                       { categorie: 'menuiserie',  description: "Les gonds ou charnières sont abîmés ou arrachés. Remplacement des gonds et réglage de la porte." },
  'Volet bloqué':                       { categorie: 'menuiserie',  description: "Le volet roulant est bloqué en position haute ou basse. Vérification de la sangle, du mécanisme ou du moteur." },
  'Lame cassée':                        { categorie: 'menuiserie',  description: "Une lame du volet roulant est cassée. Remplacement de la lame défectueuse." },
  'Fissure au mur':                     { categorie: 'menuiserie',  description: "Fissure visible sur le mur. Selon l'importance, traitement par enduit ou analyse structurelle à effectuer." },
  'Peinture qui s\'écaille':            { categorie: 'menuiserie',  description: "La peinture se décolle ou s'écaille sur le mur. Préparation du support et reprise de peinture nécessaires." },
  'Moisissures':                        { categorie: 'menuiserie',  description: "Des moisissures sont visibles sur les murs ou le plafond. Traitement antifongique et vérification de la ventilation à effectuer." },
  'Lame de parquet cassée':             { categorie: 'menuiserie',  description: "Une lame de parquet est cassée ou soulevée. Remplacement de la lame à prévoir." },
  'Carrelage décollé':                  { categorie: 'menuiserie',  description: "Un ou plusieurs carreaux sont décollés ou fêlés. Repose avec colle adaptée ou remplacement." },
  'Sol décollé':                        { categorie: 'menuiserie',  description: "Le revêtement de sol (lino, stratifié) se décolle. Recoller ou remplacer la zone concernée." },
  'Fissure au plafond':                 { categorie: 'menuiserie',  description: "Fissure sur le plafond. À surveiller et traiter selon l'origine (mouvement de structure ou simple retrait)." },
  // ── Serrurerie ─────────────────────────────────────────────────────────────
  'Serrure défaillante':                { categorie: 'serrurerie',  description: "La serrure est difficile à manœuvrer, grippée ou ne ferme plus correctement. Remplacement ou dépannage de la serrure à effectuer." },
  'Verrou forcé':                       { categorie: 'serrurerie',  description: "Le verrou a été forcé ou endommagé. Remplacement en urgence pour assurer la sécurité du logement." },
  'Badge non reconnu':                  { categorie: 'serrurerie',  description: "Le badge d'accès n'est plus reconnu par le lecteur. Reprogrammation ou remplacement du badge à effectuer." },
  'Digicode HS':                        { categorie: 'serrurerie',  description: "Le digicode ne fonctionne plus (pas d'affichage, code refusé). Vérification de l'alimentation et du câblage du système." },
  'Porte de placard bloquée':           { categorie: 'serrurerie',  description: "La porte de placard est bloquée ou les rails sont défaillants. Réglage ou remplacement des coulisses." },
  'Charnière cassée':                   { categorie: 'menuiserie',  description: "La charnière est cassée ou arrachée. Remplacement à effectuer pour assurer la bonne tenue de la porte." },
  'Étagère placard effondrée':          { categorie: 'menuiserie',  description: "Une étagère du placard s'est effondrée. Remise en place des chevilles et repositionnement ou remplacement de l'étagère." },
  // ── Électroménager ─────────────────────────────────────────────────────────
  'Plaque cuisson HS':                  { categorie: 'electromenager', description: "La plaque de cuisson vitrocéramique ne fonctionne plus (foyer en panne ou plaque complètement HS). Diagnostic et remplacement à prévoir." },
  'Plaque vitrocéramique cassée':       { categorie: 'electromenager', description: "La plaque vitrocéramique est fissurée ou brisée. Remplacement obligatoire pour des raisons de sécurité." },
  'Plaque ne chauffe plus':             { categorie: 'electromenager', description: "La plaque de cuisson ne chauffe plus. Vérification de l'alimentation électrique et du composant défaillant." },
  'Foyer en panne':                     { categorie: 'electromenager', description: "Un foyer de la plaque de cuisson est en panne. Diagnostic et remplacement du foyer défaillant." },
  'Réfrigérateur HS':                   { categorie: 'electromenager', description: "Le réfrigérateur ne fonctionne plus ou ne refroidit plus correctement. Diagnostic à effectuer (compresseur, thermostat, fuite de gaz)." },
  'Réfrigérateur ne refroidit plus':    { categorie: 'electromenager', description: "Le réfrigérateur ne maintient plus la température. Vérification du compresseur et du circuit frigorifique." },
  'Réfrigérateur bruyant':              { categorie: 'electromenager', description: "Le réfrigérateur émet un bruit anormal. Vérification du compresseur et du ventilateur." },
  'Fuite d\'eau frigo':                 { categorie: 'electromenager', description: "Le réfrigérateur présente une fuite d'eau. Vérification du bac de dégivrage et de l'évacuation." },
  'Lave-linge HS':                      { categorie: 'electromenager', description: "Le lave-linge ne fonctionne plus (ne démarre pas, reste bloqué en cycle). Diagnostic et réparation ou remplacement à prévoir." },
  'Four HS':                            { categorie: 'electromenager', description: "Le four ne chauffe plus ou ne s'allume pas. Vérification de l'alimentation et des résistances." },
  'Lampe de chevet HS':                 { categorie: 'electricite',    description: "La lampe de chevet ne fonctionne plus. Vérification de l'ampoule et du câblage." },
  // ── Mobilier ───────────────────────────────────────────────────────────────
  'Lit cassé / barre de soutien':       { categorie: 'menuiserie',  description: "Le lit est cassé ou une barre de soutien est défaillante. Réparation ou remplacement du mobilier à prévoir." },
  'Lit bruyant':                        { categorie: 'menuiserie',  description: "Le lit craque ou émet des bruits. Resserrage des visseries et vérification de l'assemblage." },
  'Matelas en mauvais état':            { categorie: 'menuiserie',  description: "Le matelas est dégradé (déformé, taché, déchiré). Remplacement à prévoir selon le protocole de renouvellement." },
  'Bureau cassé':                       { categorie: 'menuiserie',  description: "Le bureau est endommagé ou instable. Réparation ou remplacement du mobilier." },
  'Chaise cassée':                      { categorie: 'menuiserie',  description: "La chaise est cassée ou instable. Remplacement à prévoir pour la sécurité de l'occupant." },
  'Étagère décrochée':                  { categorie: 'menuiserie',  description: "Une étagère s'est décrochée du mur. Repositionnement avec chevilles adaptées au support." },
};

// ─── Visual resolver: maps site/node names to actual images from public/images/site ───
const SITE_VISUALS: Record<string, {
  carto: string;
  plan_bati?: string;
  photos: string[];
  pieces?: Record<string, { planPiece?: string; photos: string[]; carto?: string; planEtage?: string }>;
}> = {
  'angele vannier': {
    carto: '/images/site/Ecole-Angèle-Vannier/Localisation-Groupe_Scolaire_Angèle_Vannier-OSM copy copy.png',
    photos: [
      '/images/site/Ecole-Angele-Vannier/Ecole-Angele-Vannier_Saint-Malo.png',
      '/images/site/Ecole-Angèle-Vannier/Classe-Maternelle-Grande-Section.jpg',
    ],
    pieces: {
      'Classe GS': {
        photos: ['/images/site/Ecole-Angèle-Vannier/Classe-Maternelle-Grande-Section.jpg'],
        planPiece: '/images/site/Ecole-Angele-Vannier/Ecole-Angele-Vannier_Saint-Malo.png',
        carto: '/images/site/Ecole-Angèle-Vannier/Localisation-Groupe_Scolaire_Angèle_Vannier-OSM copy copy.png',
      },
    },
  },
  'jules ferry': {
    carto: '/images/site/Ferry-Jules/Classe-CM1/Ecole-Elementaire-Jules-Ferry-Carte.png',
    plan_bati: '/images/site/Ferry-Jules/Classe-CM1/Plan-Bati-Ecole-Elementaire-Jules-Ferry.png',
    photos: [
      '/images/site/Ferry-Jules/Classe-CM1/Classe-CM1.png',
      '/images/site/Ferry-Jules/Classe-CM1/image.png',
    ],
    pieces: {
      'Classe CM1': {
        photos: ['/images/site/Ferry-Jules/Classe-CM1/Classe-CM1.png'],
        planPiece: '/images/site/Ferry-Jules/Classe-CM1/Plan-Classe-Ecole-Elementaire-Jules-Ferry.png',
        carto: '/images/site/Ferry-Jules/Classe-CM1/Ecole-Elementaire-Jules-Ferry-Carte.png',
        planEtage: '/images/site/Ferry-Jules/Classe-CM1/Plan-Bati-Ecole-Elementaire-Jules-Ferry.png',
      },
    },
  },
};

function resolveSiteVisuals(siteName: string): typeof SITE_VISUALS[string] | null {
  const key = siteName.toLowerCase();
  for (const [k, v] of Object.entries(SITE_VISUALS)) {
    if (key.includes(k)) return v;
  }
  return null;
}

function resolvePieceVisuals(siteName: string, logementNum: string): { carto?: string; planEtage?: string; planPiece?: string; photos: string[] } | null {
  const siteV = resolveSiteVisuals(siteName);
  if (!siteV) return null;
  const pieceV = siteV.pieces?.[logementNum];
  if (pieceV) return pieceV;
  return { carto: siteV.carto, photos: siteV.photos };
}

export default function NouvelleDemandeWizard({ onClose, onCreated, defaultSiteId, defaultResidenceId, editDemande }: Props) {
  const isEditMode = !!editDemande;
  const isDraftEdit = editDemande?.statut_demande === 'brouillon';
  const [step, setStep]       = useState(
    isDraftEdit ? (editDemande.draft_step ?? 0) : isEditMode ? 2 : 0
  );
  const [submitting, setSubmitting] = useState(false);
  const [createdRef, setCreatedRef] = useState<string | null>(null);
  const [createdEmailSent, setCreatedEmailSent] = useState(false);
  const [trackingLinkCopied, setTrackingLinkCopied] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // Localisation mode
  const [locMode, setLocMode] = useState<'niveaux' | 'arborescence'>('niveaux');

  // Niveau par niveau
  const [sites, setSites]         = useState<SiteOption[]>([]);
  const [residences, setResidences] = useState<ResidenceOption[]>([]);
  const [batiments, setBatiments] = useState<BatimentOption[]>([]);
  const [etages, setEtages]       = useState<EtageOption[]>([]);
  const [logements, setLogements] = useState<LogementOption[]>([]);
  const [siteSearch, setSiteSearch] = useState('');
  const [favSites, setFavSites]     = useState<string[]>(() => getFavSites());
  const [recentLocs, setRecentLocs] = useState<RecentLoc[]>(() => getRecentLocs());
  const [siteId, setSiteId]       = useState(isDraftEdit ? (editDemande?.site_id ?? defaultSiteId ?? '') : (defaultSiteId ?? ''));
  const [residenceId, setResidenceId] = useState(isDraftEdit ? (editDemande?.residence_id ?? defaultResidenceId ?? '') : (defaultResidenceId ?? ''));
  const [batimentId, setBatimentId]   = useState('');
  const [etageId, setEtageId]         = useState('');
  const [logementId, setLogementId]   = useState('');
  const [locDetail, setLocDetail]     = useState('');

  // Accordion: collapses the location dropdowns once a selection is made
  const [locSectionOpen, setLocSectionOpen] = useState(true);
  const [showFavPanel, setShowFavPanel] = useState(false);
  const [showRecentPanel, setShowRecentPanel] = useState(false);

  // Piece/element picker (step 0, shown when in residence context)
  const [pieceType, setPieceType]           = useState<string | null>(null);
  const [elementChoisi, setElementChoisi]   = useState('');
  const [elementsOpen, setElementsOpen]     = useState(false);
  const [elementStates, setElementStates]   = useState<Record<string, string>>({});
  const [tree, setTree]               = useState<TreeNode[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [arboSelectedId, setArboSelectedId]     = useState('');
  const [arboSelectedType, setArboSelectedType] = useState<NodeType | ''>('');
  const [arboPath, setArboPath]                 = useState('');

  // Step 1 — Description
  const [descMethode, setDescMethode]   = useState<'ia' | 'manuelle' | ''>(isDraftEdit && editDemande?.titre ? 'manuelle' : '');
  const [aiMessages, setAiMessages]     = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: 'Bonjour ! Décrivez le problème rencontré. Vous pouvez aussi utiliser le micro pour dicter votre message.' }
  ]);
  const [aiInput, setAiInput]           = useState('');
  const [aiThinking, setAiThinking]     = useState(false);
  const [isListening, setIsListening]   = useState(false);
  const [aiFieldSuggestion, setAiFieldSuggestion] = useState<AiFieldSuggestion | null>(null);
  const [aiAcceptedFields, setAiAcceptedFields]   = useState<Set<keyof Omit<AiFieldSuggestion, 'quickSolutions'>>>(new Set());
  const [categorie, setCategorie]       = useState(isDraftEdit ? (editDemande?.type_intervention ?? '') : '');
  const [sousCategorie, setSousCategorie] = useState('');
  const [titre, setTitre]               = useState(isDraftEdit ? (editDemande?.titre !== 'Brouillon sans titre' ? (editDemande?.titre ?? '') : '') : '');
  const [description, setDescription]   = useState(isDraftEdit ? (editDemande?.description ?? '') : '');
  const [canal, setCanal]               = useState<CanalSource>(isDraftEdit ? (editDemande?.canal_source ?? 'interne') : 'interne');
  const [demandeurNom, setDemandeurNom] = useState(isDraftEdit ? (editDemande?.demandeur_nom ?? '') : '');
  const [demandeurEmail, setDemandeurEmail] = useState(isDraftEdit ? (editDemande?.demandeur_email ?? '') : '');
  const [catSearch, setCatSearch]       = useState('');

  type DemandeurMode = 'moi' | 'agent_interne' | 'externe';
  interface AgentInterne { id: string; nom: string; prenom: string; poste: string; service: string; email: string; }
  const MOCK_USER: AgentInterne = { id: '__me__', nom: 'Dubois', prenom: 'Marc', poste: 'Responsable patrimoine', service: 'Direction du Patrimoine', email: 'marc.dubois@crous-lyon.fr' };
  const [demandeurMode, setDemandeurMode] = useState<DemandeurMode>('moi');
  const [demandeurPrenom, setDemandeurPrenom] = useState('');
  const [demandeurTelephone, setDemandeurTelephone] = useState('');
  const [agentSearch, setAgentSearch]   = useState('');
  const [agentResults, setAgentResults] = useState<AgentInterne[]>([]);
  const [agentSelected, setAgentSelected] = useState<AgentInterne | null>(null);
  const [agentSearching, setAgentSearching] = useState(false);

  // Step 2 — Criticité
  const [criticite, setCriticite] = useState<CriticiteDI>(editDemande?.criticite ?? 'moyenne');
  const [criticiteChosen, setCriticiteChosen] = useState(!!editDemande);
  const [justificationCriticite, setJustificationCriticite] = useState('');

  // ── Validation: track touched fields per step ─────────────────────────────────
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  function touch(field: string) {
    setTouched(prev => ({ ...prev, [field]: true }));
  }
  function fieldError(field: string, invalid: boolean): string | null {
    return (touched[field] && invalid) ? 'Ce champ est obligatoire' : null;
  }

  // ── Load sites once ──────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.from('sites').select('id, nom, code').order('nom').then(({ data }) => setSites(data ?? []));
  }, []);

  useEffect(() => {
    if (!siteId) { setResidences([]); setResidenceId(''); return; }
    supabase.from('residences').select('id, nom, site_id').eq('site_id', siteId).order('nom')
      .then(({ data }) => setResidences(data ?? []));
  }, [siteId]);

  useEffect(() => {
    if (!residenceId) { setBatiments([]); setBatimentId(''); return; }
    supabase.from('batiments').select('id, nom, residence_id').eq('residence_id', residenceId).order('nom')
      .then(({ data }) => setBatiments(data ?? []));
  }, [residenceId]);

  useEffect(() => {
    if (!batimentId) { setEtages([]); setEtageId(''); return; }
    supabase.from('etages').select('id, nom, batiment_id, numero').eq('batiment_id', batimentId).order('numero')
      .then(({ data }) => setEtages(data ?? []));
  }, [batimentId]);

  useEffect(() => {
    if (!etageId) { setLogements([]); setLogementId(''); return; }
    supabase.from('logements').select('id, numero, etage_id').eq('etage_id', etageId).order('numero')
      .then(({ data }) => setLogements(data ?? []));
  }, [etageId]);

  // ── Build arborescence tree ──────────────────────────────────────────────────
  const buildTree = useCallback(async () => {
    setTreeLoading(true);
    const [
      { data: sitesData },
      { data: residencesData },
      { data: batimentsData },
      { data: etagesData },
      { data: logementsData },
    ] = await Promise.all([
      supabase.from('sites').select('id, nom').order('nom'),
      supabase.from('residences').select('id, nom, site_id').order('nom'),
      supabase.from('batiments').select('id, nom, residence_id').order('nom'),
      supabase.from('etages').select('id, nom, batiment_id, numero').order('numero'),
      supabase.from('logements').select('id, numero, etage_id').order('numero'),
    ]);

    const logementsMap: Record<string, LogementOption[]> = {};
    for (const l of (logementsData ?? []) as LogementOption[]) {
      (logementsMap[l.etage_id] ??= []).push(l);
    }
    const etagesMap: Record<string, EtageOption[]> = {};
    for (const e of (etagesData ?? []) as EtageOption[]) {
      (etagesMap[e.batiment_id] ??= []).push(e);
    }
    const batimentsMap: Record<string, BatimentOption[]> = {};
    for (const b of (batimentsData ?? []) as BatimentOption[]) {
      (batimentsMap[b.residence_id] ??= []).push(b);
    }
    const residencesMap: Record<string, ResidenceOption[]> = {};
    for (const r of (residencesData ?? []) as ResidenceOption[]) {
      (residencesMap[r.site_id] ??= []).push(r);
    }

    const nodes: TreeNode[] = (sitesData ?? []).map((site: SiteOption) => ({
      id: site.id, type: 'site' as const, nom: site.nom,
      children: (residencesMap[site.id] ?? []).map((res: ResidenceOption) => ({
        id: res.id, type: 'residence' as const, nom: res.nom,
        children: (batimentsMap[res.id] ?? []).map((bat: BatimentOption) => ({
          id: bat.id, type: 'batiment' as const, nom: bat.nom,
          children: (etagesMap[bat.id] ?? []).map((etage: EtageOption) => ({
            id: etage.id, type: 'etage' as const, nom: etage.nom,
            children: (logementsMap[etage.id] ?? []).map((log: LogementOption) => ({
              id: log.id, type: 'logement' as const, nom: log.numero,
            })),
          })),
        })),
      })),
    }));

    setTree(nodes);
    setTreeLoading(false);
  }, []);

  useEffect(() => {
    if (locMode === 'arborescence' && tree.length === 0) {
      buildTree();
    }
  }, [locMode, tree.length, buildTree]);

  // ── Resolve IDs from arborescence selection ──────────────────────────────────
  function resolveArboIds(): { sId: string; rId: string; bId: string; lId: string } {
    if (!arboSelectedId || !arboSelectedType) return { sId: '', rId: '', bId: '', lId: '' };

    function findNode(nodes: TreeNode[], id: string): TreeNode | null {
      for (const n of nodes) {
        if (n.id === id) return n;
        const found = findNode(n.children ?? [], id);
        if (found) return found;
      }
      return null;
    }

    function findParent(nodes: TreeNode[], id: string, parent: TreeNode | null = null): TreeNode | null {
      for (const n of nodes) {
        if (n.id === id) return parent;
        const found = findParent(n.children ?? [], id, n);
        if (found !== undefined) return found;
      }
      return null;
    }

    // Walk up to collect all ancestor IDs by type
    function collectAncestors(id: string): Record<NodeType, string> {
      const result: Record<NodeType, string> = { site: '', residence: '', batiment: '', etage: '', logement: '' };
      result[arboSelectedType as NodeType] = id;

      function walkUp(nodeId: string) {
        const parent = findParentInTree(tree, nodeId);
        if (!parent) return;
        result[parent.type] = parent.id;
        walkUp(parent.id);
      }
      walkUp(id);
      return result;
    }

    function findParentInTree(nodes: TreeNode[], targetId: string, parent: TreeNode | null = null): TreeNode | null {
      for (const n of nodes) {
        if (n.id === targetId) return parent;
        const found = findParentInTree(n.children ?? [], targetId, n);
        if (found !== null) return found;
      }
      return null;
    }

    const ancestors = collectAncestors(arboSelectedId);
    return {
      sId: ancestors.site,
      rId: ancestors.residence,
      bId: ancestors.batiment,
      lId: ancestors.logement,
    };
  }

  // ── Derived display names ────────────────────────────────────────────────────
  const siteName     = siteId     ? (sites.find(s => s.id === siteId)?.nom ?? '') : '';
  const residenceName = residenceId ? (residences.find(r => r.id === residenceId)?.nom ?? '') : '';
  const batimentName  = batimentId  ? (batiments.find(b => b.id === batimentId)?.nom ?? '') : '';
  const etageNom      = etageId     ? (etages.find(e => e.id === etageId)?.nom ?? '') : '';
  const logementNum   = logementId  ? (logements.find(l => l.id === logementId)?.numero ?? '') : '';

  const q = siteSearch.trim().toLowerCase();
  const filteredSites = q
    ? sites.filter(s => s.nom.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))
    : sites;
  const favSiteObjects = sites.filter(s => favSites.includes(s.id));

  const locSummary = locMode === 'arborescence'
    ? arboPath
    : [siteName, residenceName, batimentName, etageNom, logementNum ?? '', locDetail]
        .filter(Boolean).join(' › ');

  const step1Valid = locMode === 'niveaux'
    ? !!siteId
      && (!residences.length || !!residenceId)
      && (!batiments.length || !residenceId || !!batimentId)
      && (!etages.length || !batimentId || !!etageId)
      && (!logements.length || !etageId || !!logementId)
    : !!arboSelectedId;
  const step2Valid = !!categorie && !!titre.trim();
  const step3Valid = !!criticite && (criticite !== 'critique' || !!justificationCriticite.trim());

  // True only when a logement is selected (either mode) — controls "Équipements ou endroit"
  const inResidenceContext =
    locMode === 'niveaux'
      ? !!logementId
      : arboSelectedType === 'logement';

  const categorieLabel = CATEGORIES_DI.find(c => c.key === categorie)?.label ?? '';
  const categorieIcon  = CATEGORIES_DI.find(c => c.key === categorie)?.icon ?? '';
  const critCfg        = CRITICITE_CFG[criticite];
  const filteredCats   = CATEGORIES_DI.filter(c => c.label.toLowerCase().includes(catSearch.toLowerCase()));

  // ── Demandeur mode sync ──────────────────────────────────────────────────────
  useEffect(() => {
    if (demandeurMode === 'moi') {
      setCanal('interne');
      setDemandeurNom(`${MOCK_USER.prenom} ${MOCK_USER.nom}`);
      setDemandeurEmail(MOCK_USER.email);
    } else if (demandeurMode === 'agent_interne') {
      setCanal('interne');
      if (agentSelected) {
        setDemandeurNom(`${agentSelected.prenom} ${agentSelected.nom}`);
        setDemandeurEmail(agentSelected.email);
      } else {
        setDemandeurNom('');
        setDemandeurEmail('');
      }
    } else {
      setDemandeurNom('');
      setDemandeurEmail('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demandeurMode, agentSelected]);

  useEffect(() => {
    if (demandeurMode !== 'agent_interne' || agentSearch.trim().length < 2) {
      setAgentResults([]);
      return;
    }
    setAgentSearching(true);
    const t = setTimeout(async () => {
      const q = agentSearch.toLowerCase();
      const { data } = await supabase
        .from('agents_internes')
        .select('id, nom, prenom, poste, service, email')
        .or(`nom.ilike.%${q}%,prenom.ilike.%${q}%,email.ilike.%${q}%`)
        .limit(8);
      setAgentResults((data ?? []) as AgentInterne[]);
      setAgentSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [agentSearch, demandeurMode]);

  // ── Submit ───────────────────────────────────────────────────────────────────
  async function submit() {
    setSubmitting(true);
    try {
      const { count } = await supabase.from('interventions').select('*', { count: 'exact', head: true });
      const num       = String((count ?? 0) + 1).padStart(5, '0');
      const reference = `DI-${new Date().getFullYear()}-${num}`;

      const slaMap: Record<CriticiteDI, number> = { critique: 4, haute: 8, moyenne: 48, faible: 72 };

      let fSiteId = siteId, fResId = residenceId, fBatId = batimentId, fLogId = logementId;
      if (locMode === 'arborescence') {
        const ids = resolveArboIds();
        fSiteId = ids.sId; fResId = ids.rId; fBatId = ids.bId; fLogId = ids.lId;
      }

      const { data: inserted, error } = await supabase
        .from('interventions')
        .insert([{
          reference,
          titre: titre.trim(),
          description: description.trim() || null,
          type_intervention: 'maintenance_corrective',
          priorite: criticite === 'critique' ? 'haute' : criticite === 'haute' ? 'haute' : criticite === 'moyenne' ? 'moyenne' : 'basse',
          statut: 'planifiee',
          statut_demande: 'nouveau',
          criticite,
          sla_heures: slaMap[criticite],
          canal_source: canal,
          categorie,
          sous_categorie: sousCategorie || null,
          demandeur_nom: demandeurNom.trim() || null,
          demandeur_email: demandeurEmail.trim() || null,
          demandeur_type: demandeurMode === 'externe' ? 'externe' : canal === 'my_residence' ? 'etudiant' : 'interne',
          site_id: fSiteId || null,
          residence_id: fResId || null,
          batiment_id: fBatId || null,
          localisation_detail: [
            logementId && locMode === 'niveaux' ? logementNum : '',
            locMode === 'arborescence' && arboSelectedType === 'logement' ? arboPath.split(' › ').pop() ?? '' : '',
            locDetail.trim(),
          ].filter(Boolean).join(' — ') || null,
          tickets_count: 0,
        }])
        .select('id')
        .single();

      if (error) throw error;

      await supabase.from('historique_intervention').insert([{
        intervention_id: inserted.id,
        type_evenement: 'creation',
        description: `Demande créée via ${canal === 'interne' ? 'interface interne' : canal === 'email' ? 'email' : canal === 'my_residence' ? 'My Résidence' : 'téléphone'}`,
        auteur: demandeurNom.trim() || 'Système',
      }]);

      setCreatedRef(reference);
      onCreated(reference, inserted.id);

      // Send email notification if demandeur has an email address
      if (demandeurEmail.trim()) {
        const trackingUrl = `${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(reference)}`;
        supabase.functions.invoke('send-notification-email', {
          body: {
            to: demandeurEmail.trim(),
            demandeurNom: demandeurNom.trim(),
            reference,
            titre: titre.trim(),
            locSummary,
            categorie: categorieLabel,
            criticite,
            sla_heures: slaMap[criticite],
            trackingUrl,
            createdAt: new Date().toISOString(),
          },
        }).then(({ error }) => {
          if (!error) setCreatedEmailSent(true);
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Save as draft ─────────────────────────────────────────────────────────────
  async function saveDraft() {
    setSubmitting(true);
    try {
      let fSiteId = siteId, fResId = residenceId, fBatId = batimentId, fLogId = logementId;
      if (locMode === 'arborescence') {
        const ids = resolveArboIds();
        fSiteId = ids.sId; fResId = ids.rId; fBatId = ids.bId; fLogId = ids.lId;
      }

      const slaMap: Record<CriticiteDI, number> = { critique: 4, haute: 8, moyenne: 48, faible: 72 };

      const payload = {
        statut_demande: 'brouillon' as const,
        draft_step: step,
        titre: titre.trim() || 'Brouillon sans titre',
        description: description.trim() || null,
        type_intervention: 'maintenance_corrective',
        priorite: criticite ? (criticite === 'critique' ? 'haute' : criticite === 'haute' ? 'haute' : criticite === 'moyenne' ? 'moyenne' : 'basse') : 'moyenne',
        statut: 'planifiee',
        criticite: criticite || 'moyenne',
        sla_heures: criticite ? slaMap[criticite] : 48,
        canal_source: canal || 'interne',
        categorie: categorie || null,
        sous_categorie: sousCategorie || null,
        demandeur_nom: demandeurNom.trim() || null,
        demandeur_email: demandeurEmail.trim() || null,
        demandeur_type: 'interne' as const,
        site_id: fSiteId || null,
        residence_id: fResId || null,
        batiment_id: fBatId || null,
        localisation_detail: [
          logementId && locMode === 'niveaux' ? `Logement ${logementNum}` : '',
          locMode === 'arborescence' && arboSelectedType === 'logement' ? arboPath.split(' › ').pop() ?? '' : '',
          locDetail.trim(),
        ].filter(Boolean).join(' — ') || null,
        tickets_count: 0,
        updated_at: new Date().toISOString(),
      };

      if (isDraftEdit && editDemande) {
        // Update existing draft
        const { error } = await supabase.from('interventions').update(payload).eq('id', editDemande.id);
        if (error) throw error;
      } else {
        // Create new draft
        const { count } = await supabase.from('interventions').select('*', { count: 'exact', head: true });
        const num       = String((count ?? 0) + 1).padStart(5, '0');
        const reference = `DI-${new Date().getFullYear()}-${num}`;
        const { error } = await supabase.from('interventions').insert([{ ...payload, reference }]);
        if (error) throw error;
      }

      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000);
      onCreated(''); // triggers list refresh without closing
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Edit submit (criticité only) ─────────────────────────────────────────────
  async function submitEdit() {
    if (!editDemande) return;
    setSubmitting(true);
    try {
      const slaMap: Record<CriticiteDI, number> = { critique: 4, haute: 8, moyenne: 48, faible: 72 };
      await supabase.from('interventions').update({
        criticite,
        sla_heures: slaMap[criticite],
        updated_at: new Date().toISOString(),
      }).eq('id', editDemande.id);

      await supabase.from('historique_intervention').insert([{
        intervention_id: editDemande.id,
        type_evenement: 'qualification',
        description: [
          `Criticité modifiée : ${CRITICITE_CFG[criticite].label}`,
          justificationCriticite.trim() ? `Justification : ${justificationCriticite.trim()}` : '',
        ].filter(Boolean).join(' — '),
        auteur: 'Agent',
      }]);

      onCreated(editDemande.reference);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Sidecar visibility logic ─────────────────────────────────────────────────
  const showCarto    = locMode === 'niveaux' ? !!residenceId : (arboSelectedType === 'residence' || arboSelectedType === 'batiment' || arboSelectedType === 'etage' || arboSelectedType === 'logement');
  const showPlanEtage = locMode === 'niveaux' ? !!etageId : (arboSelectedType === 'etage' || arboSelectedType === 'logement');
  const showPlanLog  = locMode === 'niveaux' ? !!logementId : arboSelectedType === 'logement';
  const showPhotos   = showPlanLog;

  // ── AI chat simulation ────────────────────────────────────────────────────────
  function sendAiMessage(text: string) {
    if (!text.trim()) return;
    const userMsg = { role: 'user' as const, text: text.trim() };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setAiThinking(true);
    setTimeout(() => {
      const lc = text.toLowerCase();
      let reply = '';
      if (lc.includes('fuite') || lc.includes('eau') || lc.includes('robinet')) {
        reply = 'Compris. Il s\'agit d\'un problème de plomberie avec une fuite. Quelle est la localisation précise ? (lavabo, douche, WC ?)';
        setCategorie('plomberie');
        if (!titre) setTitre('Fuite eau — ' + (locDetail || 'logement'));
      } else if (lc.includes('électri') || lc.includes('prise') || lc.includes('lumière') || lc.includes('courant')) {
        reply = 'D\'accord. Problème électrique détecté. L\'installation est-elle hors service complètement ou partiellement ?';
        setCategorie('electricite');
        if (!titre) setTitre('Problème électrique — ' + (locDetail || 'logement'));
      } else if (lc.includes('chauffage') || lc.includes('radiateur') || lc.includes('froid')) {
        reply = 'Je note un problème de chauffage. Est-ce que le radiateur est complètement froid ou chauffe-t-il insuffisamment ?';
        setCategorie('chauffage');
        if (!titre) setTitre('Problème chauffage — ' + (locDetail || 'logement'));
      } else {
        reply = `Merci pour cette information. J'ai bien noté : "${text.trim()}". Pouvez-vous préciser depuis quand ce problème existe et s'il y a des risques immédiats pour la sécurité ?`;
        if (!titre) setTitre(text.slice(0, 60));
      }
      if (!description) setDescription(text.trim());
      setAiMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setAiThinking(false);
    }, 1200);
  }

  function toggleMic() {
    setIsListening(prev => {
      if (!prev) {
        // Simulate a 3s dictation
        setTimeout(() => {
          setAiInput(cur => cur + (cur ? ' ' : '') + 'Le robinet de la salle de bain coule en permanence');
          setIsListening(false);
        }, 3000);
      }
      return !prev;
    });
  }

  function toggleMicDescription() {
    setIsListening(prev => {
      if (!prev) {
        setTimeout(() => {
          setDescription(cur => (cur ? cur + ' ' : '') + 'Le bac de douche présente une fissure visible sur le côté gauche.');
          setIsListening(false);
        }, 3000);
      }
      return !prev;
    });
  }

  // ── Photo analysis callback (triggered from DescriptionSidecar on photo upload) ──
  function handlePhotoAnalyzed(photoLabel: string) {
    const loc = locSummary || 'logement';
    const piece = pieceLabel || '';
    const elem = elementLabel || '';
    const context = [piece, elem].filter(Boolean).join(', ');

    setAiMessages(prev => [...prev, {
      role: 'assistant',
      text: `Photo analysée${photoLabel ? ` (${photoLabel})` : ''}. Je détecte un problème sur ${context || 'cet équipement'} en ${loc}. Voici mon analyse et mes suggestions ci-dessous.`,
    }]);

    // Generate suggestion after short delay (simulating real analysis)
    setTimeout(() => {
      const lc = (photoLabel + ' ' + context).toLowerCase();
      let cat = 'plomberie';
      let typePb = 'Bac de douche fissuré';
      let titreSug = `Fissure ${context || 'douche'}`;
      let descSug = `Fissure visible sur le bac de douche en ${loc}. Risque de fuite et d'infiltration.`;
      let quick = [
        'Placer un seau sous la fissure pour éviter les dégâts des eaux',
        'Éviter d\'utiliser la douche jusqu\'à réparation',
        'Signaler immédiatement au service de maintenance',
      ];

      if (lc.includes('élec') || lc.includes('prise') || lc.includes('interrupteur')) {
        cat = 'electricite';
        typePb = 'Prise électrique défaillante';
        titreSug = `Problème électrique — ${context || 'logement'}`;
        descSug = `Dysfonctionnement électrique observé sur ${context || 'l\'installation'} en ${loc}.`;
        quick = ['Ne pas utiliser la prise concernée', 'Couper le disjoncteur si risque de court-circuit'];
      } else if (lc.includes('robinet') || lc.includes('fuite') || lc.includes('eau')) {
        cat = 'plomberie';
        typePb = 'Fuite robinetterie';
        titreSug = `Fuite ${context || 'robinet'}`;
        descSug = `Fuite détectée au niveau de ${context || 'la robinetterie'} en ${loc}.`;
        quick = ['Fermer le robinet d\'arrêt sous l\'évier', 'Poser une serviette pour absorber l\'eau'];
      } else if (lc.includes('porte') || lc.includes('serrure') || lc.includes('fenetre')) {
        cat = 'menuiserie';
        typePb = 'Menuiserie défaillante';
        titreSug = `Problème menuiserie — ${context || 'logement'}`;
        descSug = `Problème de menuiserie constaté sur ${context || 'l\'équipement'} en ${loc}.`;
        quick = ['Utiliser une entrée alternative si disponible', 'Ne pas forcer pour éviter d\'aggraver'];
      }

      setAiFieldSuggestion({
        typeProblem: typePb,
        titre: titreSug,
        description: descSug,
        categorie: cat,
        quickSolutions: quick,
      });
    }, 800);
  }

  function handleAcceptSuggestionField(field: keyof Omit<AiFieldSuggestion, 'quickSolutions'>) {
    if (!aiFieldSuggestion) return;
    setAiAcceptedFields(prev => new Set([...prev, field]));
    if (field === 'typeProblem') setTitre(aiFieldSuggestion.typeProblem);
    if (field === 'titre') setTitre(aiFieldSuggestion.titre);
    if (field === 'description') setDescription(aiFieldSuggestion.description);
    if (field === 'categorie') setCategorie(aiFieldSuggestion.categorie);
  }

  function handleRejectSuggestionField(field: keyof Omit<AiFieldSuggestion, 'quickSolutions'>) {
    setAiAcceptedFields(prev => { const n = new Set(prev); n.delete(field); return n; });
  }

  function handleAcceptAllSuggestions() {
    if (!aiFieldSuggestion) return;
    setTitre(aiFieldSuggestion.typeProblem);
    setDescription(aiFieldSuggestion.description);
    setCategorie(aiFieldSuggestion.categorie);
    setAiAcceptedFields(new Set(['typeProblem', 'titre', 'description', 'categorie']));
  }

  function handleRejectAllSuggestions() {
    setAiFieldSuggestion(null);
    setAiAcceptedFields(new Set());
  }

  // ── Derived piece/element labels ─────────────────────────────────────────────
  const pieceLabel    = pieceType ? (CLASSE_ENDROITS.find(p => p.key === pieceType)?.label ?? '') : '';
  const elementLabel  = elementChoisi
    ? (() => {
        for (const pk of Object.keys(CLASSE_ELEMENTS)) {
          const found = CLASSE_ELEMENTS[pk]?.find(e => e.key === elementChoisi);
          if (found) return found.label;
        }
        return '';
      })()
    : '';
  const isStep0 = step === 0;
  const isStep1 = step === 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden max-w-4xl"
        style={{ maxHeight: '90vh' }}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {isEditMode ? `Modifier — ${editDemande!.titre}` : "Nouvelle demande d'intervention"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEditMode ? 'Ajustement de la criticité' : `Étape ${step + 1} sur ${STEPS.length}`}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {!isEditMode && <StepIndicator current={step} />}

        <WizardQualityBar quality={{
          siteId,
          residenceId,
          batimentId,
          arboSelectedId,
          categorie,
          titre,
          description,
          criticite,
          criticiteChosen,
          demandeurNom,
          hasPhoto: false,
        }} />

        {/* Body — two-column on step 0 and step 1, centered single column otherwise */}
        <div className={`flex-1 min-h-0 flex overflow-hidden ${(isStep0 || isStep1) ? 'flex-row' : 'justify-center'}`}>

        {/* Left / main form area */}
        <div className={`overflow-y-auto px-6 py-5 min-h-0 ${(isStep0 || isStep1) ? 'flex-1 min-w-0' : 'w-full max-w-lg'}`}>

          {/* ── Step 0: Localisation ─────────────────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">Localisation du problème</p>
                  <p className="text-xs text-slate-400">Indiquez où se situe le problème</p>
                </div>
                {favSiteObjects.length > 0 && (
                  <button
                    type="button"
                    onClick={() => { setShowFavPanel(v => !v); setShowRecentPanel(false); }}
                    title="Sites favoris"
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      showFavPanel ? 'bg-amber-100' : 'hover:bg-amber-50'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${showFavPanel ? 'text-amber-500 fill-amber-400' : 'text-amber-400'}`} />
                  </button>
                )}
                {recentLocs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => { setShowRecentPanel(v => !v); setShowFavPanel(false); }}
                    title="Sites récents"
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      showRecentPanel ? 'bg-slate-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <Clock className={`w-4 h-4 ${showRecentPanel ? 'text-slate-700' : 'text-slate-400'}`} />
                  </button>
                )}
              </div>

              {/* Favoris panel */}
              {locMode === 'niveaux' && showFavPanel && favSiteObjects.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap px-1 py-1.5 bg-amber-50 rounded-xl border border-amber-100 animate-[fadeIn_0.15s_ease-out]">
                  {favSiteObjects.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSiteId(s.id);
                        setResidenceId(''); setBatimentId(''); setEtageId(''); setLogementId('');
                        touch('siteId');
                        setShowFavPanel(false);
                      }}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold transition-colors ${
                        siteId === s.id
                          ? 'bg-amber-100 border-amber-300 text-amber-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-700'
                      }`}
                    >
                      <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                      <span>{s.code}</span>
                      <span className="text-slate-400 font-normal hidden sm:inline">— {s.nom}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Récents panel */}
              {locMode === 'niveaux' && showRecentPanel && recentLocs.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap px-1 py-1.5 bg-slate-50 rounded-xl border border-slate-100 animate-[fadeIn_0.15s_ease-out]">
                  {recentLocs.map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSiteId(r.siteId);
                        setResidenceId(''); setBatimentId(''); setEtageId(''); setLogementId('');
                        touch('siteId');
                        setShowRecentPanel(false);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-white text-[10px] font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-700 transition-colors"
                      title={r.label}
                    >
                      <Clock className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
                      <span className="max-w-[120px] truncate">{r.label}</span>
                    </button>
                  ))}
                </div>
              )}

              <RequiredLegend />

              {/* Mode selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setLocMode('niveaux'); setLocSectionOpen(true); }}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                    locMode === 'niveaux'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    locMode === 'niveaux' ? 'bg-blue-100' : 'bg-slate-100'
                  }`}>
                    <List className={`w-3.5 h-3.5 ${locMode === 'niveaux' ? 'text-blue-600' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${locMode === 'niveaux' ? 'text-blue-700' : 'text-slate-700'}`}>
                      Niveau par niveau
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Sélection guidée</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => { setLocMode('arborescence'); setLocSectionOpen(true); setShowFavPanel(false); setShowRecentPanel(false); }}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all ${
                    locMode === 'arborescence'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    locMode === 'arborescence' ? 'bg-blue-100' : 'bg-slate-100'
                  }`}>
                    <GitBranch className={`w-3.5 h-3.5 ${locMode === 'arborescence' ? 'text-blue-600' : 'text-slate-400'}`} />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${locMode === 'arborescence' ? 'text-blue-700' : 'text-slate-700'}`}>
                      Arborescence
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Vue hiérarchique</p>
                  </div>
                </button>
              </div>

              {/* ── Niveau par niveau ────────────────────────────────────────── */}
              {locMode === 'niveaux' && (
                <div className="space-y-3">

                  {/* Accordion header — always visible */}
                  <button
                    type="button"
                    onClick={() => setLocSectionOpen(o => !o)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left ${
                      locSectionOpen
                        ? 'border-slate-200 bg-slate-50'
                        : siteId ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${siteId && !locSectionOpen ? 'text-blue-600' : 'text-slate-400'}`} />
                      {siteId && !locSectionOpen ? (
                        <span className="text-xs font-semibold text-blue-700 truncate">{locSummary || siteName}</span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-700">Sélection du lieu <span className="text-red-500">*</span></span>
                      )}
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform ${locSectionOpen ? '' : '-rotate-90'}`} />
                  </button>

                  {/* Collapsible dropdowns */}
                  {locSectionOpen && (
                    <div className="space-y-3 animate-[fadeIn_0.15s_ease-out]">

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            Site <Req />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const next = toggleFavSite(siteId || '');
                              setFavSites(next);
                            }}
                            disabled={!siteId}
                            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-amber-500 transition-colors disabled:opacity-30"
                            title={siteId ? (favSites.includes(siteId) ? 'Retirer des favoris' : 'Ajouter aux favoris') : 'Sélectionnez un site'}
                          >
                            <Star className={`w-3.5 h-3.5 transition-colors ${siteId && favSites.includes(siteId) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                            <span className="hidden sm:inline">{siteId && favSites.includes(siteId) ? 'Favori' : 'Favori'}</span>
                          </button>
                        </div>

                        {/* Site search */}
                        <div className="relative mb-1.5">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                          <input
                            value={siteSearch}
                            onChange={e => setSiteSearch(e.target.value)}
                            placeholder="Rechercher par nom ou code (ex: L1920)..."
                            className="w-full pl-6 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                          />
                        </div>

                        <select
                          value={siteId}
                          onBlur={() => touch('siteId')}
                          onChange={e => {
                            setSiteId(e.target.value);
                            setSiteSearch('');
                            setResidenceId(''); setBatimentId(''); setEtageId(''); setLogementId('');
                            touch('siteId');
                          }}
                          className={fieldInputClass(fieldError('siteId', !siteId), 'bg-white')}
                          size={filteredSites.length > 0 && siteSearch && !siteId ? Math.min(filteredSites.length + 1, 6) : 1}
                        >
                          <option value="">Sélectionner un site...</option>
                          {filteredSites.map(s => (
                            <option key={s.id} value={s.id}>{s.code} — {s.nom}</option>
                          ))}
                        </select>
                        <FieldErrorMsg msg={fieldError('siteId', !siteId)} />
                      </div>

                      {siteId && residences.length > 0 && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Résidence <Req />
                          </label>
                          <select
                            value={residenceId}
                            onBlur={() => touch('residenceId')}
                            onChange={e => {
                              setResidenceId(e.target.value);
                              setBatimentId(''); setEtageId(''); setLogementId('');
                              touch('residenceId');
                            }}
                            className={fieldInputClass(fieldError('residenceId', !residenceId), 'bg-white')}
                          >
                            <option value="">Sélectionner une résidence...</option>
                            {residences.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
                          </select>
                          <FieldErrorMsg msg={fieldError('residenceId', !residenceId)} />
                        </div>
                      )}

                      {residenceId && batiments.length > 0 && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Bâtiment <Req />
                          </label>
                          <select
                            value={batimentId}
                            onBlur={() => touch('batimentId')}
                            onChange={e => {
                              setBatimentId(e.target.value);
                              setEtageId(''); setLogementId('');
                              touch('batimentId');
                            }}
                            className={fieldInputClass(fieldError('batimentId', !batimentId), 'bg-white')}
                          >
                            <option value="">Sélectionner un bâtiment...</option>
                            {batiments.map(b => <option key={b.id} value={b.id}>{b.nom}</option>)}
                          </select>
                          <FieldErrorMsg msg={fieldError('batimentId', !batimentId)} />
                        </div>
                      )}

                      {batimentId && etages.length > 0 && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Étage <Req />
                          </label>
                          <select
                            value={etageId}
                            onBlur={() => touch('etageId')}
                            onChange={e => {
                              setEtageId(e.target.value);
                              setLogementId('');
                              touch('etageId');
                            }}
                            className={fieldInputClass(fieldError('etageId', !etageId), 'bg-white')}
                          >
                            <option value="">Sélectionner un étage...</option>
                            {etages.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
                          </select>
                          <FieldErrorMsg msg={fieldError('etageId', !etageId)} />
                        </div>
                      )}

                      {etageId && logements.length > 0 && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Logement <Req />
                          </label>
                          <select
                            value={logementId}
                            onBlur={() => touch('logementId')}
                            onChange={e => {
                              const newLogId = e.target.value;
                              setLogementId(newLogId);
                              touch('logementId');
                              if (newLogId) {
                                setLocSectionOpen(false);
                                const site = sites.find(s => s.id === siteId);
                                const res  = residences.find(r => r.id === residenceId);
                                const bat  = batiments.find(b => b.id === batimentId);
                                const eta  = etages.find(et => et.id === etageId);
                                const log  = logements.find(l => l.id === newLogId);
                                const parts = [site?.code, res?.nom, bat?.nom, eta?.nom, log?.numero ?? ''].filter(Boolean);
                                const rec: RecentLoc = {
                                  siteId, siteNom: site?.nom ?? '', siteCode: site?.code ?? '',
                                  residenceId, residenceNom: res?.nom,
                                  batimentId, batimentNom: bat?.nom,
                                  etageId, etageNom: eta?.nom,
                                  logementId: newLogId, logementNum: log?.numero,
                                  label: parts.join(' › '),
                                };
                                addRecentLoc(rec);
                                setRecentLocs(getRecentLocs());
                              }
                            }}
                            className={fieldInputClass(fieldError('logementId', !logementId), 'bg-white')}
                          >
                            <option value="">Sélectionner un logement...</option>
                            {logements.map(l => <option key={l.id} value={l.id}>Logement {l.numero}</option>)}
                          </select>
                          <FieldErrorMsg msg={fieldError('logementId', !logementId)} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Piece / element picker — only shown in residence context */}
                  {inResidenceContext && (
                    <div className="space-y-2 pt-1">
                      <label className="block text-xs font-semibold text-slate-700">Équipements ou endroit</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {CLASSE_ENDROITS.map(p => {
                          const active = pieceType === p.key;
                          return (
                            <button
                              key={p.key}
                              type="button"
                              onClick={() => {
                                if (active) { setPieceType(null); setElementChoisi(''); setElementsOpen(false); }
                                else { setPieceType(p.key as string); setElementChoisi(''); setElementsOpen(true); }
                              }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all ${
                                active
                                  ? `${p.activeBorder} ${p.activeBg} border-2`
                                  : `${p.border} ${p.bg} border hover:border-slate-300`
                              }`}
                            >
                              <span className="text-base flex-shrink-0">{p.emoji}</span>
                              <span className={`text-[11px] font-semibold leading-tight ${active ? p.activeText : 'text-slate-700'}`}>
                                {p.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Element picker — rich cards grouped by family */}
                      {pieceType && elementsOpen && (() => {
                        const FAMILY_CFG = {
                          luminaires:  { label: 'Luminaires',    icon: 'lightbulb',             bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700'   },
                          electricite: { label: 'Électricité',   icon: 'electrical_services',   bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700'    },
                          equipements: { label: 'Équipements',   icon: 'settings_input_composite', bg: 'bg-slate-100', border: 'border-slate-200',  text: 'text-slate-600'   },
                          mobilier:    { label: 'Mobilier',      icon: 'chair',                 bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
                        } as const;

                        const families = ['luminaires', 'electricite', 'equipements', 'mobilier'] as const;
                        const elems = CLASSE_ELEMENTS[pieceType];

                        if (!elems) return null;

                        return (
                          <div className="space-y-3 animate-[fadeIn_0.2s_ease-out] mt-1">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                              Éléments dans {CLASSE_ENDROITS.find(p => p.key === pieceType)?.label}
                            </p>
                            {families.map(fam => {
                              const items = elems.filter(e => e.family === fam);
                              if (!items.length) return null;
                              const cfg = FAMILY_CFG[fam];
                              return (
                                <div key={fam}>
                                  {/* Family header */}
                                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-t-lg ${cfg.bg} ${cfg.border} border border-b-0`}>
                                    <span className={`material-symbols-rounded text-[16px] ${cfg.text}`} style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}>{cfg.icon}</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.text}`}>{cfg.label}</span>
                                  </div>
                                  {/* Cards grid */}
                                  <div className={`grid grid-cols-3 gap-px border ${cfg.border} rounded-b-lg overflow-hidden bg-slate-100`}>
                                    {items.map(el => {
                                      const isSelected = elementChoisi === el.key;
                                      return (
                                        <div
                                          key={el.key}
                                          className={`flex flex-col items-center gap-1.5 p-2.5 cursor-pointer transition-all select-none bg-white ${
                                            isSelected ? `ring-2 ring-inset ${
                                              fam === 'luminaires'  ? 'ring-amber-500'   :
                                              fam === 'electricite' ? 'ring-blue-500'    :
                                              fam === 'equipements' ? 'ring-slate-500'   :
                                                                        'ring-emerald-500'
                                            }` : 'hover:bg-slate-50'
                                          }`}
                                          onClick={() => setElementChoisi(isSelected ? '' : el.key)}
                                        >
                                          <span
                                            className={`material-symbols-rounded text-[24px] transition-colors ${
                                              isSelected ? cfg.text : 'text-slate-400'
                                            }`}
                                            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                                          >
                                            {el.icon}
                                          </span>
                                          <span className={`text-[9px] font-semibold text-center leading-tight ${isSelected ? cfg.text : 'text-slate-600'}`}>
                                            {el.label}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Précision de localisation — always at the bottom */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Précision de localisation</label>
                    <input
                      value={locDetail}
                      onChange={e => setLocDetail(e.target.value)}
                      placeholder="Ex: Chambre 204, couloir 2e étage, local technique..."
                      className={fieldInputClass(null)}
                    />
                  </div>
                </div>
              )}

              {/* ── Arborescence ─────────────────────────────────────────────── */}
              {locMode === 'arborescence' && (
                <div className="space-y-3">

                  {/* Accordion header */}
                  {/* Favoris & Récents — arborescence mode */}
                  {(favSiteObjects.length > 0 || recentLocs.length > 0) && (
                    <div className="space-y-1.5">
                      {favSiteObjects.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide flex-shrink-0">★</span>
                          {favSiteObjects.map(s => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setLocMode('niveaux');
                                setSiteId(s.id);
                                setResidenceId(''); setBatimentId(''); setEtageId(''); setLogementId('');
                                touch('siteId');
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-white text-[10px] font-semibold text-slate-600 hover:border-amber-300 hover:text-amber-700 transition-colors"
                            >
                              <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                              <span>{s.code}</span>
                              <span className="text-slate-400 font-normal hidden sm:inline">— {s.nom}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {recentLocs.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide flex-shrink-0">
                            <Clock className="w-3 h-3 inline" />
                          </span>
                          {recentLocs.map((r, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setLocMode('niveaux');
                                setSiteId(r.siteId);
                                setResidenceId(''); setBatimentId(''); setEtageId(''); setLogementId('');
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-200 bg-white text-[10px] font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-700 transition-colors"
                              title={r.label}
                            >
                              <Clock className="w-2.5 h-2.5 text-slate-400 flex-shrink-0" />
                              <span className="max-w-[120px] truncate">{r.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setLocSectionOpen(o => !o)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left ${
                      locSectionOpen
                        ? 'border-slate-200 bg-slate-50'
                        : arboSelectedId ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <GitBranch className={`w-3.5 h-3.5 flex-shrink-0 ${arboSelectedId && !locSectionOpen ? 'text-blue-600' : 'text-slate-400'}`} />
                      {arboSelectedId && !locSectionOpen ? (
                        <span className="text-xs font-semibold text-blue-700 truncate">{arboPath}</span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-700">Sélection dans l'arborescence <span className="text-red-500">*</span></span>
                      )}
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform ${locSectionOpen ? '' : '-rotate-90'}`} />
                  </button>

                  {/* Collapsible tree */}
                  {locSectionOpen && (
                    <div className="animate-[fadeIn_0.15s_ease-out]">
                      <ArborescencePicker
                        tree={tree}
                        selectedId={arboSelectedId}
                        selectedType={arboSelectedType}
                        loading={treeLoading}
                        onSelect={(id, type, path) => {
                          setArboSelectedId(id);
                          setArboSelectedType(id ? type : '');
                          setArboPath(path);
                          if (id) {
                            setLocSectionOpen(false);
                            // Persist to recents (use path as label; extract site info from first segment)
                            const pathParts = path.split(' › ');
                            const siteNameFromPath = pathParts[0] ?? '';
                            const site = sites.find(s => s.nom === siteNameFromPath) ?? sites[0];
                            if (site) {
                              const rec: RecentLoc = {
                                siteId: site.id, siteNom: site.nom, siteCode: site.code,
                                label: path,
                              };
                              addRecentLoc(rec);
                              setRecentLocs(getRecentLocs());
                            }
                          }
                        }}
                      />
                    </div>
                  )}

                  {/* Piece / element picker — only shown in residence context */}
                  {inResidenceContext && (
                    <div className="space-y-2 pt-1">
                      <label className="block text-xs font-semibold text-slate-700">Équipements ou endroit</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {CLASSE_ENDROITS.map(p => {
                          const active = pieceType === p.key;
                          return (
                            <button
                              key={p.key}
                              type="button"
                              onClick={() => {
                                if (active) { setPieceType(null); setElementChoisi(''); setElementsOpen(false); }
                                else { setPieceType(p.key as string); setElementChoisi(''); setElementsOpen(true); }
                              }}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all ${
                                active
                                  ? `${p.activeBorder} ${p.activeBg} border-2`
                                  : `${p.border} ${p.bg} border hover:border-slate-300`
                              }`}
                            >
                              <span className="text-base flex-shrink-0">{p.emoji}</span>
                              <span className={`text-[11px] font-semibold leading-tight ${active ? p.activeText : 'text-slate-700'}`}>
                                {p.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Element picker — rich cards grouped by family */}
                      {pieceType && elementsOpen && (() => {
                        const FAMILY_CFG = {
                          luminaires:  { label: 'Luminaires',    icon: 'lightbulb',             bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700'   },
                          electricite: { label: 'Électricité',   icon: 'electrical_services',   bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700'    },
                          equipements: { label: 'Équipements',   icon: 'settings_input_composite', bg: 'bg-slate-100', border: 'border-slate-200',  text: 'text-slate-600'   },
                          mobilier:    { label: 'Mobilier',      icon: 'chair',                 bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
                        } as const;

                        const families = ['luminaires', 'electricite', 'equipements', 'mobilier'] as const;
                        const elems = CLASSE_ELEMENTS[pieceType];

                        if (!elems) return null;

                        return (
                          <div className="space-y-3 animate-[fadeIn_0.2s_ease-out] mt-1">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                              Éléments dans {CLASSE_ENDROITS.find(p => p.key === pieceType)?.label}
                            </p>
                            {families.map(fam => {
                              const items = elems.filter(e => e.family === fam);
                              if (!items.length) return null;
                              const cfg = FAMILY_CFG[fam];
                              return (
                                <div key={fam}>
                                  {/* Family header */}
                                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-t-lg ${cfg.bg} ${cfg.border} border border-b-0`}>
                                    <span className={`material-symbols-rounded text-[16px] ${cfg.text}`} style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}>{cfg.icon}</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.text}`}>{cfg.label}</span>
                                  </div>
                                  {/* Cards grid */}
                                  <div className={`grid grid-cols-3 gap-px border ${cfg.border} rounded-b-lg overflow-hidden bg-slate-100`}>
                                    {items.map(el => {
                                      const isSelected = elementChoisi === el.key;
                                      return (
                                        <div
                                          key={el.key}
                                          className={`flex flex-col items-center gap-1.5 p-2.5 cursor-pointer transition-all select-none bg-white ${
                                            isSelected ? `ring-2 ring-inset ${
                                              fam === 'luminaires'  ? 'ring-amber-500'   :
                                              fam === 'electricite' ? 'ring-blue-500'    :
                                              fam === 'equipements' ? 'ring-slate-500'   :
                                                                        'ring-emerald-500'
                                            }` : 'hover:bg-slate-50'
                                          }`}
                                          onClick={() => setElementChoisi(isSelected ? '' : el.key)}
                                        >
                                          <span
                                            className={`material-symbols-rounded text-[24px] transition-colors ${
                                              isSelected ? cfg.text : 'text-slate-400'
                                            }`}
                                            style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                                          >
                                            {el.icon}
                                          </span>
                                          <span className={`text-[9px] font-semibold text-center leading-tight ${isSelected ? cfg.text : 'text-slate-600'}`}>
                                            {el.label}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Précision de localisation — always at the bottom */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Précision de localisation</label>
                    <input
                      value={locDetail}
                      onChange={e => setLocDetail(e.target.value)}
                      placeholder="Ex: Chambre 204, couloir 2e étage, local technique..."
                      className={fieldInputClass(null)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 1: Description ──────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Description du problème</p>
                  <p className="text-xs text-slate-400">Choisissez votre méthode de saisie</p>
                </div>
              </div>

              {descMethode === 'manuelle' && <RequiredLegend />}

              {/* ── Méthode selector ── */}
              {!descMethode && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button type="button" onClick={() => setDescMethode('ia')}
                    className="flex flex-col items-center gap-2.5 p-5 rounded-xl border-2 border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-800">Assistance IA</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Décrivez le problème en langage naturel ou par dictée vocale</p>
                    </div>
                  </button>
                  <button type="button" onClick={() => setDescMethode('manuelle')}
                    className="flex flex-col items-center gap-2.5 p-5 rounded-xl border-2 border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                      <SplitSquareHorizontal className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-800">Manuelle par étape</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Remplissez les champs catégorie, équipement et problème</p>
                    </div>
                  </button>
                </div>
              )}

              {/* ── Méthode badge (already chosen) ── */}
              {descMethode && (
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    descMethode === 'ia'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    {descMethode === 'ia' ? <Sparkles className="w-3 h-3" /> : <SplitSquareHorizontal className="w-3 h-3" />}
                    {descMethode === 'ia' ? 'Assistance IA' : 'Manuelle par étape'}
                  </div>
                  <button onClick={() => setDescMethode('')} className="text-xs text-slate-400 hover:text-slate-600 underline">Changer</button>
                </div>
              )}

              {/* ═══ ASSISTANCE IA ═══ */}
              {descMethode === 'ia' && (
                  <AiChatPanel
                    aiMessages={aiMessages}
                    aiThinking={aiThinking}
                    aiInput={aiInput}
                    isListening={isListening}
                    categorie={categorie}
                    titre={titre}
                    description={description}
                    locSummary={locSummary}
                    pieceLabel={pieceLabel}
                    elementLabel={elementLabel}
                    aiSuggestion={aiFieldSuggestion}
                    acceptedFields={aiAcceptedFields}
                    onInputChange={setAiInput}
                    onSend={sendAiMessage}
                    onToggleMic={toggleMic}
                    onAcceptField={handleAcceptSuggestionField}
                    onRejectField={handleRejectSuggestionField}
                    onAcceptAll={handleAcceptAllSuggestions}
                    onRejectAll={handleRejectAllSuggestions}
                  />
              )}

              {/* ═══ MANUELLE PAR ÉTAPE ═══ */}
              {descMethode === 'manuelle' && (
                <div className="space-y-4">

                  {/* Type de problème — en premier, adapté à l'élément choisi en étape 1 */}
                  {(() => {
                    // Per-element problem types (keyed by CLASSE_ELEMENTS[piece].key)
                    const TYPES_PAR_ELEMENT: Record<string, { label: string; icon: string }[]> = {
                      // ── Luminaires ──
                      plafonnier:    [{ label: 'Ampoule grillée', icon: '💡' }, { label: 'Luminaire ne s\'allume plus', icon: '🔆' }, { label: 'Diffuseur cassé/fissuré', icon: '🔆' }, { label: 'Clips de fixation cassés', icon: '🔩' }, { label: 'Lumière scintille', icon: '⚡' }],
                      neon:          [{ label: 'Tube néon grillé', icon: '💡' }, { label: 'Néon scintille', icon: '⚡' }, { label: 'Starter défectueux', icon: '🔌' }, { label: 'Néon ne s\'allume plus', icon: '💡' }, { label: 'Ballast HS', icon: '⚡' }],
                      spot_led:      [{ label: 'Spot LED grillé', icon: '💡' }, { label: 'Spot scintille', icon: '⚡' }, { label: 'Spot en panne totale', icon: '💡' }, { label: 'Driver défectueux', icon: '🔌' }, { label: 'Spot décroché', icon: '🔆' }],
                      rampelle:      [{ label: 'Rampe LED en panne', icon: '💡' }, { label: 'Sections éteintes', icon: '💡' }, { label: 'Rampe scintille', icon: '⚡' }, { label: 'Alimentation défectueuse', icon: '🔌' }, { label: 'Profilé endommagé', icon: '🔆' }],
                      interrupteur:  [{ label: 'Interrupteur cassé', icon: '🔘' }, { label: 'Interrupteur ne fonctionne pas', icon: '💡' }, { label: 'Interrupteur bloqué', icon: '🔘' }, { label: 'Faux contact', icon: '⚡' }],
                      variateur:     [{ label: 'Variateur ne fonctionne plus', icon: '🎚️' }, { label: 'Variateur bloqué sur une position', icon: '🎚️' }, { label: 'Réglage impossible', icon: '🎚️' }, { label: 'Grésillement / buzz', icon: '🔊' }],
                      // ── Électricité ──
                      tableau_elec:  [{ label: 'Disjoncteur déclenché', icon: '⚡' }, { label: 'Panne tableau électrique', icon: '🔌' }, { label: 'Tableau endommagé', icon: '🔧' }, { label: 'Surcharge circuit', icon: '⚡' }, { label: 'Différentiel déclenche sans arrêt', icon: '⚡' }],
                      prise:         [{ label: 'Prise défaillante', icon: '🔌' }, { label: 'Prise brûlée/noircie', icon: '⚡' }, { label: 'Prise desserrée', icon: '🔌' }, { label: 'Prise ne fonctionne plus', icon: '🔌' }, { label: 'Prise endommagée', icon: '🔧' }],
                      circuit:       [{ label: 'Court-circuit', icon: '⚡' }, { label: 'Circuit en panne', icon: '🔌' }, { label: 'Surcharge électrique', icon: '⚡' }, { label: 'Câblage défectueux', icon: '🔌' }, { label: 'Perte d\'alimentation', icon: '🔌' }],
                      disjoncteur:   [{ label: 'Disjoncteur déclenche sans raison', icon: '⚡' }, { label: 'Disjoncteur bloqué', icon: '🔘' }, { label: 'Disjoncteur en panne', icon: '⚡' }, { label: 'Disjoncteur ne tient pas en charge', icon: '⚡' }],
                      terre:         [{ label: 'Mise à la terre défectueuse', icon: '⚡' }, { label: 'Défaut d\'isolement', icon: '⚡' }, { label: 'Prise de terre corrodée', icon: '🔧' }, { label: 'Contrôle de terre non conforme', icon: '⚡' }],
                      cable:         [{ label: 'Câble abîmé', icon: '🔌' }, { label: 'Câble dénudé', icon: '🔌' }, { label: 'Faux contact', icon: '⚡' }, { label: 'Câble à remplacer', icon: '🔌' }, { label: 'Câble sectionné', icon: '🔧' }],
                      // ── Équipements ──
                      vmc:           [{ label: 'VMC bruyante', icon: '💨' }, { label: 'VMC ne fonctionne pas', icon: '💨' }, { label: 'Mauvaises odeurs', icon: '💨' }, { label: 'VMC vibrations', icon: '🔊' }, { label: 'Filtres à nettoyer', icon: '🔧' }],
                      radiateur:     [{ label: 'Radiateur froid', icon: '🌡️' }, { label: 'Radiateur bruyant', icon: '🔊' }, { label: 'Fuite sur radiateur', icon: '💧' }, { label: 'Thermostat cassé', icon: '🌡️' }, { label: 'Radiateur ne chauffe plus', icon: '🌡️' }],
                      clim:          [{ label: 'Climatisation ne refroidit plus', icon: '❄️' }, { label: 'Climatisation bruyante', icon: '🔊' }, { label: 'Fuite eau climatisation', icon: '💧' }, { label: 'Télécommande HS', icon: '🎛️' }, { label: 'Clim ne s\'allume plus', icon: '❄️' }],
                      detecteur:     [{ label: 'Détecteur déclenché sans raison', icon: '🚨' }, { label: 'Détecteur ne fonctionne plus', icon: '🚨' }, { label: 'Pile à remplacer', icon: '🔋' }, { label: 'Détecteur qui sonne en boucle', icon: '🚨' }],
                      extincteur:    [{ label: 'Extincteur périmé', icon: '🧯' }, { label: 'Extincteur manquant', icon: '🧯' }, { label: 'Support cassé', icon: '🔩' }, { label: 'Pression insuffisante', icon: '🧯' }, { label: 'Scellé brisé', icon: '🧯' }],
                      robinetterie:  [{ label: 'Robinet coule', icon: '🚿' }, { label: 'Robinet bloqué', icon: '🔧' }, { label: 'Fuite sous le lavabo', icon: '💧' }, { label: 'Mitigeur dur à tourner', icon: '🔧' }],
                      // ── Mobilier ──
                      table:         [{ label: 'Table cassée', icon: '🪑' }, { label: 'Pied de table instable', icon: '🪑' }, { label: 'Plateau rayé/abîmé', icon: '🪑' }, { label: 'Table qui bascule', icon: '🪑' }, { label: 'Charnière table cassée', icon: '🔩' }],
                      chaise:        [{ label: 'Chaise cassée', icon: '🪑' }, { label: 'Pied de chaise instable', icon: '🪑' }, { label: 'Assise déchirée', icon: '🪑' }, { label: 'Chaise qui grince', icon: '🔊' }],
                      tableau:       [{ label: 'Tableau blanc rayé', icon: '📋' }, { label: 'Tableau ne s\'efface plus', icon: '📋' }, { label: 'Tableau décollé du mur', icon: '📋' }, { label: 'Support cassé', icon: '🔩' }, { label: 'Surface marquée permanent', icon: '📋' }],
                      armoire:       [{ label: 'Porte d\'armoire bloquée', icon: '🗄️' }, { label: 'Charnière cassée', icon: '🔩' }, { label: 'Étagère effondrée', icon: '📚' }, { label: 'Serrure armoire HS', icon: '🔑' }, { label: 'Porte d\'armoire bancale', icon: '🗄️' }],
                      etagere:       [{ label: 'Étagère décrochée', icon: '📚' }, { label: 'Étagère pliée / cassée', icon: '📚' }, { label: 'Fixation desserrée', icon: '🔩' }, { label: 'Étagère qui penche', icon: '📚' }],
                      tapis:         [{ label: 'Tapis décollé / bord relevé', icon: '🟫' }, { label: 'Tapis usé / effiloché', icon: '🟫' }, { label: 'Tapis gondolé', icon: '🟫' }, { label: 'Tapis taché', icon: '🟫' }, { label: 'Risque de trébuchement', icon: '⚠️' }],
                    };

                    // Per-category fallback types (existing logic)
                    const TYPES_PAR_CAT: Record<string, { label: string; icon: string }[]> = {
                      plomberie: [
                        { label: 'Fuite au plafond', icon: '💧' }, { label: 'Fuite évacuation WC', icon: '🚽' },
                        { label: 'Fuite sous le lavabo', icon: '🪣' }, { label: 'Robinet douche coule', icon: '🚿' },
                        { label: 'WC bouché', icon: '🚽' }, { label: 'Lavabo bouché', icon: '🪠' },
                        { label: 'Bac douche bouché', icon: '🚿' }, { label: 'Bac douche fissuré', icon: '🪟' },
                        { label: 'Flexible douche HS', icon: '🚿' }, { label: 'Joint silicone à refaire', icon: '🔧' },
                      ],
                      electricite: [
                        { label: 'Prise défaillante', icon: '🔌' }, { label: 'Interrupteur cassé', icon: '💡' },
                        { label: 'Néon défectueux', icon: '💡' }, { label: 'Panne tableau', icon: '⚡' },
                        { label: 'Disjoncteur déclenché', icon: '⚡' },
                      ],
                      chauffage: [
                        { label: 'Radiateur froid', icon: '🌡️' }, { label: 'Radiateur bruyant', icon: '🔊' },
                        { label: 'VMC bruyante', icon: '💨' }, { label: 'VMC ne fonctionne pas', icon: '💨' },
                      ],
                      electromenager: [
                        { label: 'Plaque cuisson HS', icon: '🍳' }, { label: 'Réfrigérateur HS', icon: '❄️' },
                        { label: 'Lave-linge HS', icon: '🧺' }, { label: 'Four HS', icon: '📦' },
                      ],
                      menuiserie: [
                        { label: 'Vitre brisée', icon: '🪟' }, { label: 'Porte bloquée', icon: '🚪' },
                        { label: 'Store défaillant', icon: '🪟' }, { label: 'Fenêtre ne ferme pas', icon: '🪟' },
                      ],
                      serrurerie: [
                        { label: 'Serrure défaillante', icon: '🔑' }, { label: 'Verrou forcé', icon: '🔒' },
                        { label: 'Badge non reconnu', icon: '💳' }, { label: 'Digicode HS', icon: '🔢' },
                      ],
                    };

                    // Choose types: element-specific first, then category fallback
                    const types: { label: string; icon: string }[] | undefined =
                      (elementChoisi ? TYPES_PAR_ELEMENT[elementChoisi] : undefined) ??
                      (categorie    ? TYPES_PAR_CAT[categorie]          : undefined);
                    const contextLabel = elementChoisi
                      ? (() => {
                          for (const pk of Object.keys(CLASSE_ELEMENTS)) {
                            const found = CLASSE_ELEMENTS[pk]?.find(e => e.key === elementChoisi);
                            if (found) return found.label;
                          }
                          return '';
                        })()
                      : '';

                    return (
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-700">
                          Type de problème <Req />
                          {contextLabel && <span className="ml-1.5 font-normal text-slate-400">— {contextLabel}</span>}
                        </label>
                        {types ? (
                          <div className="grid grid-cols-2 gap-1 max-h-52 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
                            {types.map(t => (
                              <button key={t.label} type="button"
                                onClick={() => {
                                  const pf = PREFILL_BY_TYPE[t.label];
                                  setTitre(t.label);
                                  touch('titre');
                                  if (pf) {
                                    if (!categorie) { setCategorie(pf.categorie); touch('categorie'); }
                                    if (!description) { setDescription(pf.description); touch('description'); }
                                  }
                                }}
                                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-all ${
                                  titre === t.label ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                }`}>
                                <span className="text-sm flex-shrink-0">{t.icon}</span>
                                <span className={`text-[10px] font-medium leading-tight ${titre === t.label ? 'text-blue-700' : 'text-slate-600'}`}>{t.label}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">Sélectionnez un élément (étape 1) ou une catégorie ci-dessous pour afficher les types de problèmes.</p>
                        )}
                        <input
                          value={types?.some(t => t.label === titre) ? '' : titre}
                          onChange={e => { setTitre(e.target.value); touch('titre'); }}
                          onBlur={() => touch('titre')}
                          placeholder="Ou saisir un titre personnalisé…"
                          className={fieldInputClass(fieldError('titre', !titre.trim()))}
                        />
                        <FieldErrorMsg msg={fieldError('titre', !titre.trim())} />
                      </div>
                    );
                  })()}

                  {/* Description du problème */}
                  <div className="animate-[fadeIn_0.2s_ease-out]">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description du problème</label>
                    <div className="relative">
                      <textarea value={description} onChange={e => setDescription(e.target.value)}
                        rows={3} placeholder="Décrivez le problème, depuis quand, les symptômes observés…"
                        className={fieldInputClass(null, 'resize-none pr-8')} />
                      <button
                        type="button"
                        onClick={toggleMicDescription}
                        className={`absolute right-2 top-2 p-1 rounded-lg transition-colors ${
                          isListening ? 'text-red-500 bg-red-100 animate-pulse' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        }`}
                        title={isListening ? 'Arrêter la dictée' : 'Dicter oralement'}
                      >
                        <Mic className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {isListening && (
                      <p className="text-[10px] text-red-500 font-medium mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block" />
                        Dictée en cours… parlez maintenant
                      </p>
                    )}
                  </div>

                  {/* Catégorie — en bas */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Catégorie <Req />
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {CATEGORIES_DI.map(c => (
                        <button key={c.key} type="button"
                          onClick={() => { setCategorie(c.key); setSousCategorie(''); touch('categorie'); }}
                          className={`flex items-center gap-1.5 p-2 rounded-lg border text-left transition-all ${
                            categorie === c.key ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                          } ${touched['categorie'] && !categorie && categorie !== c.key ? 'border-red-200' : ''}`}>
                          <span className="text-sm flex-shrink-0">{c.icon}</span>
                          <span className={`text-[10px] font-medium leading-tight ${categorie === c.key ? 'text-blue-700' : 'text-slate-600'}`}>{c.label}</span>
                        </button>
                      ))}
                    </div>
                    <FieldErrorMsg msg={fieldError('categorie', !categorie)} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Criticité ────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">

              {/* Header */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Niveau de criticité</p>
                  <p className="text-xs text-slate-400">Évaluez l'urgence et l'impact de ce problème <span className="text-red-500 font-bold">*</span></p>
                </div>
              </div>

              {/* AI qualification assistant — full width */}
              <AiQualificationAssistant
                titre={titre}
                description={description}
                categorie={categorie}
                elementChoisi={elementChoisi}
                locSummary={locSummary}
                onApply={(c, justif) => {
                  setCriticite(c);
                  setCriticiteChosen(true);
                  setJustificationCriticite(justif);
                }}
              />

              {/* 4 criticité levels — full width, 4 columns */}
              <div className="grid grid-cols-4 gap-2">
                {(['critique', 'haute', 'moyenne', 'faible'] as const).map(c => {
                  const cfg = CRITICITE_CFG[c];
                  const selected = criticite === c;
                  return (
                    <button key={c} type="button" onClick={() => { setCriticite(c); setCriticiteChosen(true); }}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-center transition-all ${
                        selected ? `${cfg.bg} ${cfg.border}` : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}>
                      <span className="text-2xl leading-none">{cfg.icon}</span>
                      <p className={`text-xs font-bold leading-tight ${selected ? cfg.text : 'text-slate-700'}`}>{cfg.label}</p>
                      <p className={`text-[10px] leading-snug ${selected ? `${cfg.text} opacity-80` : 'text-slate-400'}`}>
                        {c === 'critique' && 'Danger immédiat, risque sécurité ou service coupé'}
                        {c === 'haute'    && 'Impact fort sur les occupants, résolution rapide nécessaire'}
                        {c === 'moyenne'  && 'Gêne notable, peut attendre la prochaine tournée'}
                        {c === 'faible'   && 'Impact mineur, à traiter lors de la maintenance habituelle'}
                      </p>
                      <div className={`mt-auto pt-1.5 border-t w-full ${selected ? cfg.border : 'border-slate-100'}`}>
                        <p className={`text-[9px] font-semibold uppercase tracking-wide ${selected ? cfg.text : 'text-slate-300'}`}>Délai</p>
                        <p className={`text-xs font-bold ${selected ? cfg.text : 'text-slate-400'}`}>{cfg.sla}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Justification — required when critique */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Justification{' '}
                  {criticite === 'critique'
                    ? <span className="text-red-500 font-bold">*</span>
                    : <span className="text-slate-400 font-normal">(optionnel)</span>
                  }
                </label>
                {criticite === 'critique' && (
                  <p className="text-[10px] text-red-600 font-medium mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    Obligatoire pour la criticité Critique — précisez la nature du danger
                  </p>
                )}
                <textarea
                  value={justificationCriticite}
                  onChange={e => { setJustificationCriticite(e.target.value); if (criticite === 'critique') touch('justificationCriticite'); }}
                  onBlur={() => { if (criticite === 'critique') touch('justificationCriticite'); }}
                  placeholder={criticite === 'critique'
                    ? 'Décrivez le danger immédiat (risque sécurité, service coupé, urgence)…'
                    : 'Précisez si nécessaire la raison du niveau de criticité choisi…'
                  }
                  rows={3}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 placeholder:text-slate-300 resize-none transition-colors ${
                    criticite === 'critique' && touched['justificationCriticite'] && !justificationCriticite.trim()
                      ? 'border-red-300 bg-red-50'
                      : 'border-slate-200'
                  }`}
                />
                {criticite === 'critique' && touched['justificationCriticite'] && !justificationCriticite.trim() && (
                  <p className="text-[10px] text-red-500 font-medium mt-1">Ce champ est obligatoire pour la criticité Critique</p>
                )}
              </div>

              {/* Historique (edit mode only) */}
              {isEditMode && <CriticiteHistorique interventionId={editDemande.id} />}
            </div>
          )}

          {/* ── Step 3: Demandeur ────────────────────────────────────────────── */}
          {step === 3 && !createdRef && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Demandeur &amp; Récapitulatif</p>
                  <p className="text-xs text-slate-400">Renseignez le demandeur puis vérifiez avant création</p>
                </div>
              </div>

              <RequiredLegend />

              {/* ── Qui est le demandeur ? ─────────────────────────────────── */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Qui est le demandeur ? <Req />
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { key: 'moi',           icon: '👤', label: "C'est moi",        sub: 'Utiliser mon profil' },
                    { key: 'agent_interne', icon: '🏢', label: 'Agent interne',    sub: "Rechercher dans l'annuaire" },
                    { key: 'externe',       icon: '👥', label: 'Personne externe', sub: 'Saisie manuelle' },
                  ] as const).map(m => (
                    <button key={m.key} type="button"
                      onClick={() => { setDemandeurMode(m.key); setAgentSearch(''); setAgentSelected(null); setDemandeurPrenom(''); setDemandeurTelephone(''); touch('demandeurNom'); }}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        demandeurMode === m.key ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}>
                      <span className="text-xl leading-none mt-0.5 flex-shrink-0">{m.icon}</span>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold leading-tight ${demandeurMode === m.key ? 'text-blue-700' : 'text-slate-700'}`}>{m.label}</p>
                        <p className={`text-[10px] mt-0.5 leading-tight ${demandeurMode === m.key ? 'text-blue-500' : 'text-slate-400'}`}>{m.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Profil affiché selon le mode ───────────────────────────── */}
              {demandeurMode === 'moi' && (
                <div className="rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border-b border-blue-100">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-xs font-bold text-blue-700">Demandeur — profil connecté</p>
                  </div>
                  <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-1.5">
                    {[
                      { l: 'Nom',       v: MOCK_USER.nom },
                      { l: 'Prénom',    v: MOCK_USER.prenom },
                      { l: 'Fonction',  v: MOCK_USER.poste },
                      { l: 'Service',   v: MOCK_USER.service },
                      { l: 'Email',     v: MOCK_USER.email },
                    ].map(r => (
                      <div key={r.l} className="flex items-baseline gap-1.5">
                        <span className="text-[10px] font-semibold text-slate-400 w-16 flex-shrink-0">{r.l}</span>
                        <span className="text-xs text-slate-700 font-medium truncate">{r.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {demandeurMode === 'agent_interne' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Rechercher un agent <Req />
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <input
                      value={agentSearch}
                      onChange={e => { setAgentSearch(e.target.value); setAgentSelected(null); }}
                      placeholder="Nom, prénom ou email…"
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                    />
                    {agentSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 animate-spin" />}
                  </div>
                  {agentResults.length > 0 && !agentSelected && (
                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-50">
                      {agentResults.map(a => (
                        <button key={a.id} type="button"
                          onClick={() => { setAgentSelected(a); setAgentSearch(`${a.prenom} ${a.nom}`); setAgentResults([]); touch('demandeurNom'); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 text-left transition-colors">
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800">{a.prenom} {a.nom}</p>
                            <p className="text-[10px] text-slate-400 truncate">{a.poste} · {a.service}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {agentSelected && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-100 border-b border-emerald-200">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-white" />
                          </div>
                          <p className="text-xs font-bold text-emerald-800">Agent sélectionné</p>
                        </div>
                        <button type="button" onClick={() => { setAgentSelected(null); setAgentSearch(''); }}
                          className="text-[10px] text-emerald-600 hover:text-emerald-800 font-medium transition-colors">
                          Modifier
                        </button>
                      </div>
                      <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-1.5">
                        {[
                          { l: 'Nom',      v: agentSelected.nom },
                          { l: 'Prénom',   v: agentSelected.prenom },
                          { l: 'Fonction', v: agentSelected.poste },
                          { l: 'Service',  v: agentSelected.service },
                          { l: 'Email',    v: agentSelected.email },
                        ].map(r => (
                          <div key={r.l} className="flex items-baseline gap-1.5">
                            <span className="text-[10px] font-semibold text-slate-400 w-16 flex-shrink-0">{r.l}</span>
                            <span className="text-xs text-slate-700 font-medium truncate">{r.v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {agentSearch.length >= 2 && !agentSearching && agentResults.length === 0 && !agentSelected && (
                    <p className="text-xs text-slate-400 italic pl-1">Aucun agent trouvé</p>
                  )}
                </div>
              )}

              {demandeurMode === 'externe' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Prénom <Req /></label>
                      <input
                        value={demandeurPrenom}
                        onChange={e => { setDemandeurPrenom(e.target.value); setDemandeurNom(`${e.target.value} ${demandeurNom.split(' ').slice(1).join(' ')}`.trim()); touch('demandeurNom'); }}
                        placeholder="Prénom"
                        className={fieldInputClass(fieldError('demandeurNom', !demandeurPrenom.trim()))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nom <Req /></label>
                      <input
                        value={demandeurNom.split(' ').slice(1).join(' ') || (demandeurPrenom ? '' : demandeurNom)}
                        onChange={e => { const n = e.target.value; setDemandeurNom(`${demandeurPrenom} ${n}`.trim()); touch('demandeurNom'); }}
                        onBlur={() => touch('demandeurNom')}
                        placeholder="NOM"
                        className={fieldInputClass(fieldError('demandeurNom', !demandeurNom.replace(demandeurPrenom, '').trim()))}
                      />
                      <FieldErrorMsg msg={fieldError('demandeurNom', !demandeurNom.trim())} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Téléphone</label>
                      <input
                        value={demandeurTelephone}
                        onChange={e => setDemandeurTelephone(e.target.value)}
                        placeholder="06 00 00 00 00"
                        type="tel"
                        className={fieldInputClass(null)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
                      <input
                        value={demandeurEmail}
                        onChange={e => setDemandeurEmail(e.target.value)}
                        onBlur={() => { if (demandeurEmail) touch('demandeurEmail'); }}
                        placeholder="email@exemple.fr"
                        type="email"
                        className={fieldInputClass(fieldError('demandeurEmail', !!demandeurEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(demandeurEmail)))}
                      />
                      <FieldErrorMsg msg={fieldError('demandeurEmail', !!demandeurEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(demandeurEmail))} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Canal de réception ─────────────────────────────────────── */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Canal de réception <Req />
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { key: 'interne' as CanalSource,      label: 'Interne\nOpenGST', renderIcon: () => <span className="text-xl">🏢</span> },
                    { key: 'email' as CanalSource,        label: 'Email',             renderIcon: () => <span className="text-xl">📧</span> },
                    { key: 'telephone' as CanalSource,    label: 'Téléphone',         renderIcon: () => <span className="text-xl">📞</span> },
                    { key: 'my_residence' as CanalSource, label: 'My Résidence',      renderIcon: () => <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-600 flex-shrink-0"><Key className="w-4 h-4 text-white" /></span> },
                  ]).map(c => (
                    <button key={c.key} type="button"
                      onClick={() => setCanal(c.key)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all ${
                        canal === c.key ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}>
                      {c.renderIcon()}
                      <span className={`text-[10px] font-medium leading-tight whitespace-pre-line ${canal === c.key ? 'text-blue-700' : 'text-slate-500'}`}>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Récapitulatif ──────────────────────────────────────────── */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Récapitulatif</p>
                <div className="rounded-xl border border-slate-100 divide-y divide-slate-50 overflow-hidden">
                  <div className="flex items-start gap-3 px-4 py-3">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 w-24 flex-shrink-0 mt-0.5">Localisation</span>
                    <span className="text-xs text-slate-700 font-medium">{locSummary || '—'}</span>
                  </div>
                  <div className="flex items-start gap-3 px-4 py-3">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 w-24 flex-shrink-0 mt-0.5">Catégorie</span>
                    <span className="text-xs text-slate-700">{categorieIcon} {categorieLabel}{sousCategorie ? ` › ${sousCategorie}` : ''}</span>
                  </div>
                  <div className="flex items-start gap-3 px-4 py-3">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 w-24 flex-shrink-0 mt-0.5">Titre</span>
                    <span className="text-xs font-semibold text-slate-800">{titre}</span>
                  </div>
                  {description && (
                    <div className="flex items-start gap-3 px-4 py-3">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 w-24 flex-shrink-0 mt-0.5">Description</span>
                      <span className="text-xs text-slate-600 line-clamp-3">{description}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-3 px-4 py-3">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 w-24 flex-shrink-0 mt-0.5">Criticité</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${critCfg.bg} ${critCfg.text}`}>
                      {critCfg.icon} {critCfg.label} — Délai {critCfg.sla}
                    </span>
                  </div>
                  <div className="flex items-start gap-3 px-4 py-3">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 w-24 flex-shrink-0 mt-0.5">Canal</span>
                    <span className="text-xs text-slate-700">{
                      canal === 'interne' ? '🏢 Interne - OpenGST' :
                      canal === 'email' ? '📧 Email' :
                      canal === 'my_residence' ? '📱 My Résidence' : '📞 Téléphone'
                    }</span>
                  </div>
                  {demandeurNom && (
                    <div className="flex items-start gap-3 px-4 py-3">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 w-24 flex-shrink-0 mt-0.5">Demandeur</span>
                      <span className="text-xs text-slate-700">{demandeurNom}{demandeurEmail ? ` · ${demandeurEmail}` : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Success ──────────────────────────────────────────────────────── */}
          {createdRef && (() => {
            const trackingUrl = `${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(createdRef)}`;
            return (
              <div className="flex flex-col items-center justify-center py-6 gap-5 w-full">
                {/* Badge */}
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>

                {/* Main message */}
                <div className="text-center space-y-1">
                  <p className="text-base font-bold text-slate-800">Demande créée avec succès</p>
                  <p className="text-xl font-black text-blue-600 font-mono tracking-wider">{createdRef}</p>
                  <p className="text-xs text-slate-400">Enregistrée et traitée selon le niveau de criticité défini.</p>
                </div>

                {/* Email sent notice */}
                {createdEmailSent && demandeurEmail && (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl w-full max-w-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-800">Email de confirmation envoyé</p>
                      <p className="text-[10px] text-emerald-600 truncate">{demandeurEmail}</p>
                    </div>
                  </div>
                )}

                {/* Tracking link card */}
                <div className="w-full max-w-sm space-y-2">
                  <p className="text-xs font-semibold text-slate-500 text-center">Lien de suivi demandeur</p>
                  <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="flex-1 text-[10px] text-slate-500 font-mono truncate">{trackingUrl}</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(trackingUrl).then(() => { setTrackingLinkCopied(true); setTimeout(() => setTrackingLinkCopied(false), 2000); })}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all flex-shrink-0 ${
                        trackingLinkCopied ? 'bg-emerald-100 text-emerald-700' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}>
                      {trackingLinkCopied ? <CheckCircle2 className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                      {trackingLinkCopied ? 'Copié !' : 'Copier'}
                    </button>
                  </div>
                  <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                    <Clock className="w-4 h-4" />
                    Voir le portail de suivi
                  </a>
                </div>
              </div>
            );
          })()}
        </div>{/* end left column */}

        {/* ── Right sidecar — step 0: localisation, step 1: description visuals ── */}
        {(isStep0 || isStep1) && (
          <div className="w-1/2 flex-shrink-0 border-l border-slate-200 overflow-hidden flex flex-col">
            {isStep0 && (
              <LocalisationSidecar
                showCarto={showCarto}
                showPlanEtage={showPlanEtage}
                showPlanLogement={showPlanLog}
                showPhotos={showPhotos}
                residenceName={locMode === 'niveaux' ? residenceName : arboPath.split(' › ').slice(0, 2).join(' › ')}
                etageName={locMode === 'niveaux' ? etageNom : (arboSelectedType === 'etage' ? arboPath.split(' › ').pop() ?? '' : '')}
                logementNum={locMode === 'niveaux' ? logementNum : (arboSelectedType === 'logement' ? arboPath.split(' › ').pop() ?? '' : '')}
                selectedPiece={pieceType}
                customCarto={(() => {
                  const sn = locMode === 'niveaux' ? siteName : arboPath.split(' › ')[0] ?? '';
                  const ln = locMode === 'niveaux' ? logementNum : (arboSelectedType === 'logement' ? arboPath.split(' › ').pop() ?? '' : '');
                  const pv = resolvePieceVisuals(sn, ln);
                  const sv = resolveSiteVisuals(sn);
                  return pv?.carto ?? sv?.carto ?? null;
                })()}
                customPlanEtage={(() => {
                  const sn = locMode === 'niveaux' ? siteName : arboPath.split(' › ')[0] ?? '';
                  const ln = locMode === 'niveaux' ? logementNum : (arboSelectedType === 'logement' ? arboPath.split(' › ').pop() ?? '' : '');
                  const pv = resolvePieceVisuals(sn, ln);
                  const sv = resolveSiteVisuals(sn);
                  return pv?.planEtage ?? sv?.plan_bati ?? null;
                })()}
                customPlanLogement={(() => {
                  const sn = locMode === 'niveaux' ? siteName : arboPath.split(' › ')[0] ?? '';
                  const ln = locMode === 'niveaux' ? logementNum : (arboSelectedType === 'logement' ? arboPath.split(' › ').pop() ?? '' : '');
                  const pv = resolvePieceVisuals(sn, ln);
                  return pv?.planPiece ?? null;
                })()}
                customPhotos={(() => {
                  const sn = locMode === 'niveaux' ? siteName : arboPath.split(' › ')[0] ?? '';
                  const ln = locMode === 'niveaux' ? logementNum : (arboSelectedType === 'logement' ? arboPath.split(' › ').pop() ?? '' : '');
                  const pv = resolvePieceVisuals(sn, ln);
                  const sv = resolveSiteVisuals(sn);
                  return pv?.photos ?? sv?.photos;
                })()}
              />
            )}
            {isStep1 && (
              <DescriptionSidecar
                methode={descMethode}
                categorie={categorie}
                locDetail={locDetail}
                locSummary={locSummary}
                pieceLabel={pieceLabel}
                elementLabel={elementLabel}
                onAiSuggestionAccepted={(desc) => setDescription(desc)}
                onPhotoAnalyzed={handlePhotoAnalyzed}
              />
            )}
          </div>
        )}

        </div>{/* end body two-column wrapper */}

        {/* Footer */}
        {!createdRef && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 flex-shrink-0">
            <button
              onClick={() => step === 0 ? onClose() : setStep(s => s - 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4" />
              {step === 0 ? 'Annuler' : 'Précédent'}
            </button>

            <div className="flex items-center gap-2">
              {/* Draft button — available on all steps, hidden in pure edit mode */}
              {!isEditMode || isDraftEdit ? (
                <button
                  disabled={submitting || !siteId}
                  onClick={() => saveDraft()}
                  title={!siteId ? 'Sélectionnez au moins un site pour sauvegarder' : undefined}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                  {draftSaved ? 'Sauvegardé !' : 'Brouillon'}
                </button>
              ) : null}

              {isEditMode && !isDraftEdit ? (
                <button
                  disabled={submitting}
                  onClick={() => submitEdit()}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Enregistrer
                </button>
              ) : step < 3 ? (
                <button
                  onClick={() => {
                    // Touch required fields for current step to show errors
                    if (step === 0) {
                      touch('siteId');
                      if (siteId && residences.length > 0) touch('residenceId');
                      if (residenceId && batiments.length > 0) touch('batimentId');
                      if (batimentId && etages.length > 0) touch('etageId');
                      if (etageId && logements.length > 0) touch('logementId');
                    } else if (step === 1 && descMethode === 'manuelle') {
                      touch('categorie');
                      touch('titre');
                    } else if (step === 2 && criticite === 'critique') {
                      touch('justificationCriticite');
                    } else if (step === 3) {
                      touch('demandeurNom');
                    }
                    const valid = step === 0 ? step1Valid : step === 1 ? step2Valid : step3Valid;
                    if (valid) setStep(s => s + 1);
                  }}
                  className={`flex items-center gap-1.5 px-5 py-2 text-white text-sm font-semibold rounded-lg transition-colors ${
                    (step === 0 ? step1Valid : step === 1 ? step2Valid : step3Valid)
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-blue-600/50 cursor-not-allowed'
                  }`}>
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  disabled={submitting || !demandeurNom.trim()}
                  onClick={() => {
                    touch('demandeurNom');
                    if (demandeurNom.trim()) submit();
                  }}
                  className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {isDraftEdit ? 'Finaliser la demande' : 'Créer la demande'}
                </button>
              )}
            </div>
          </div>
        )}

        {createdRef && (
          <div className="flex justify-center px-6 py-4 border-t border-slate-100 flex-shrink-0">
            <button onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
