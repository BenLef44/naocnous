import { useState, useRef, useCallback } from 'react';
import {
  Camera, Image as ImageIcon, X, Maximize2, ChevronLeft, ChevronRight,
  PenLine, Paperclip, FolderOpen, CheckCircle2, ChevronDown,
} from 'lucide-react';
import { DrawingModal } from './DrawingModal';

// ─── Logement picker data (exported for use in step 0) ───────────────────────

export const PIECES = [
  { key: 'principale', label: 'Pièce principale', emoji: '🛏️', bg: 'bg-blue-50',   border: 'border-blue-200',   activeBorder: 'border-blue-500',  activeBg: 'bg-blue-50',   activeText: 'text-blue-700'  },
  { key: 'sdb',        label: 'Salle de bain',    emoji: '🚿', bg: 'bg-cyan-50',    border: 'border-cyan-200',   activeBorder: 'border-cyan-500',  activeBg: 'bg-cyan-50',   activeText: 'text-cyan-700'  },
  { key: 'cuisine',    label: 'Cuisine',           emoji: '🍳', bg: 'bg-orange-50',  border: 'border-orange-200', activeBorder: 'border-orange-500',activeBg: 'bg-orange-50', activeText: 'text-orange-700'},
  { key: 'mobilier',   label: 'Mobilier',          emoji: '🪑', bg: 'bg-emerald-50', border: 'border-emerald-200',activeBorder: 'border-emerald-500',activeBg: 'bg-emerald-50',activeText: 'text-emerald-700'},
] as const;

export type PieceKey = typeof PIECES[number]['key'];

interface ElementDef { key: string; label: string; emoji: string; icon: string; family: 'bati' | 'technique' | 'sanitaire' | 'mobilier'; }

export const ELEMENTS: Record<PieceKey, ElementDef[]> = {
  principale: [
    { key: 'porte',        label: 'Porte',               emoji: '🚪', icon: 'door_front',        family: 'bati'      },
    { key: 'pateres',      label: 'Patères',              emoji: '🪝', icon: 'hanger',            family: 'mobilier'  },
    { key: 'mur',          label: 'Mur',                  emoji: '🧱', icon: 'wall_art',          family: 'bati'      },
    { key: 'plafond',      label: 'Plafond',              emoji: '🔼', icon: 'roofing',           family: 'bati'      },
    { key: 'sol',          label: 'Sol',                  emoji: '⬛', icon: 'grid_view',         family: 'bati'      },
    { key: 'interrupteur', label: 'Interrupteur',         emoji: '🔘', icon: 'toggle_on',         family: 'technique' },
    { key: 'lum_couloir',  label: 'Lumière couloir',      emoji: '💡', icon: 'lightbulb',         family: 'technique' },
    { key: 'lum_bureau',   label: 'Lumière bureau',       emoji: '🔆', icon: 'desk_lamp',         family: 'technique' },
    { key: 'lampe_chevet', label: 'Lampe de chevet',      emoji: '🕯️', icon: 'bedside_lamp',      family: 'technique' },
    { key: 'prise_reseau', label: 'Prise réseau',         emoji: '🌐', icon: 'lan',               family: 'technique' },
    { key: 'prise_elec',   label: 'Prise électrique',     emoji: '🔌', icon: 'power',             family: 'technique' },
    { key: 'detecteur',    label: 'Détecteur de fumée',   emoji: '🔴', icon: 'detector_smoke',    family: 'technique' },
    { key: 'fenetre',      label: 'Fenêtre',              emoji: '🪟', icon: 'window',            family: 'bati'      },
    { key: 'vitre',        label: 'Vitre',                emoji: '🔭', icon: 'glass_cup',         family: 'bati'      },
    { key: 'volet',        label: 'Volet',                emoji: '🎚️', icon: 'blinds',            family: 'bati'      },
    { key: 'rebord_fen',   label: 'Rebord fenêtre ext.',  emoji: '🏠', icon: 'window',            family: 'bati'      },
    { key: 'radiateur',    label: 'Radiateurs',           emoji: '🌡️', icon: 'mode_heat',         family: 'technique' },
  ],
  sdb: [
    { key: 'porte',        label: 'Porte',                emoji: '🚪', icon: 'door_front',        family: 'bati'      },
    { key: 'barres_seuil', label: 'Barres de seuil',      emoji: '🔩', icon: 'horizontal_rule',   family: 'bati'      },
    { key: 'pateres',      label: 'Patères',              emoji: '🪝', icon: 'hanger',            family: 'mobilier'  },
    { key: 'cabine',       label: 'Cabine douche',        emoji: '🚿', icon: 'shower',            family: 'sanitaire' },
    { key: 'eclairage_dch',label: 'Éclairage douche',     emoji: '💡', icon: 'lightbulb',         family: 'technique' },
    { key: 'eclairage_lav',label: 'Éclairage lavabo',     emoji: '🔆', icon: 'lightbulb',         family: 'technique' },
    { key: 'vmc',          label: 'VMC / Aération',       emoji: '💨', icon: 'air',               family: 'technique' },
    { key: 'cuvette_wc',   label: 'Cuvette WC',           emoji: '🚽', icon: 'wc',                family: 'sanitaire' },
    { key: 'abattant_wc',  label: 'Abattant / Lunette',   emoji: '🪣', icon: 'wc',                family: 'sanitaire' },
    { key: 'chasse_eau',   label: "Chasse d'eau",         emoji: '💧', icon: 'water_drop',        family: 'sanitaire' },
    { key: 'porte_srv',    label: 'Porte-serviettes',     emoji: '🧺', icon: 'dry_cleaning',      family: 'mobilier'  },
    { key: 'miroir',       label: 'Miroir',               emoji: '🪞', icon: 'mirror',            family: 'sanitaire' },
    { key: 'robinetterie', label: 'Robinetterie lavabo',  emoji: '🚰', icon: 'water_faucet',      family: 'sanitaire' },
    { key: 'lavabo',       label: 'Lavabo',               emoji: '🫗', icon: 'sink',              family: 'sanitaire' },
    { key: 'rideau_douche',label: 'Rideau douche',        emoji: '🪢', icon: 'shower',            family: 'sanitaire' },
    { key: 'mitigeur_dch', label: 'Mitigeur douche',      emoji: '🔧', icon: 'water_faucet',      family: 'sanitaire' },
    { key: 'flexible',     label: 'Flexible',             emoji: '🌀', icon: 'pipe',              family: 'sanitaire' },
    { key: 'pomme_douche', label: 'Pomme de douche',      emoji: '💦', icon: 'shower',            family: 'sanitaire' },
    { key: 'barre_douche', label: 'Barre de douche',      emoji: '📏', icon: 'straighten',        family: 'sanitaire' },
    { key: 'vidange',      label: 'Vidange / Bonde',      emoji: '⭕', icon: 'drain',             family: 'sanitaire' },
  ],
  cuisine: [
    { key: 'mur',          label: 'Mur',                  emoji: '🧱', icon: 'wall_art',          family: 'bati'      },
    { key: 'credence',     label: 'Crédence',             emoji: '🟦', icon: 'tiles',             family: 'bati'      },
    { key: 'plafond',      label: 'Plafond',              emoji: '🔼', icon: 'roofing',           family: 'bati'      },
    { key: 'vmc',          label: 'VMC',                  emoji: '💨', icon: 'air',               family: 'technique' },
    { key: 'meuble_kit',   label: 'Meuble Kitchenette',   emoji: '🪵', icon: 'kitchen',           family: 'mobilier'  },
    { key: 'evier',        label: 'Évier',                emoji: '🚰', icon: 'sink',              family: 'sanitaire' },
    { key: 'mitigeur',     label: 'Mitigeur',             emoji: '🔧', icon: 'water_faucet',      family: 'sanitaire' },
    { key: 'plaque_vit',   label: 'Plaque vitrocéram.',   emoji: '🍳', icon: 'cooktop',           family: 'technique' },
    { key: 'frigo',        label: 'Réfrigérateur',        emoji: '🧊', icon: 'kitchen',           family: 'technique' },
  ],
  mobilier: [
    { key: 'bureau',       label: 'Bureau',               emoji: '🖥️', icon: 'desk',              family: 'mobilier'  },
    { key: 'placard',      label: 'Placard / Penderie',   emoji: '🚪', icon: 'wardrobe',          family: 'mobilier'  },
    { key: 'etagere',      label: 'Étagère',              emoji: '📚', icon: 'shelves',           family: 'mobilier'  },
    { key: 'chaise',       label: 'Chaise',               emoji: '🪑', icon: 'chair',             family: 'mobilier'  },
    { key: 'poubelle',     label: 'Poubelle',             emoji: '🗑️', icon: 'delete',            family: 'mobilier'  },
    { key: 'seau_dechets', label: 'Seau déchets alim.',   emoji: '♻️', icon: 'compost',           family: 'mobilier'  },
    { key: 'lit',          label: 'Lit',                  emoji: '🛏️', icon: 'bed',               family: 'mobilier'  },
    { key: 'matelas',      label: 'Matelas',              emoji: '🛋️', icon: 'bed',               family: 'mobilier'  },
    { key: 'housse_matelas',label: 'Housse matelas',      emoji: '🧶', icon: 'checkroom',         family: 'mobilier'  },
    { key: 'affichage_sec',label: 'Affichage sécurité',   emoji: '⚠️', icon: 'warning',           family: 'technique' },
  ],
};

// ─── Equipment plan data per category ────────────────────────────────────────

const EQUIPMENT_PLANS: Record<string, { label: string; src: string }[]> = {
  plomberie: [
    { label: 'Robinetterie lavabo', src: 'https://images.pexels.com/photos/5490343/pexels-photo-5490343.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { label: "WC / Chasse d'eau",   src: 'https://images.pexels.com/photos/7045536/pexels-photo-7045536.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { label: 'Douche / Bac',         src: 'https://images.pexels.com/photos/6444262/pexels-photo-6444262.jpeg?auto=compress&cs=tinysrgb&w=400' },
  ],
  electricite: [
    { label: 'Tableau électrique',  src: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { label: 'Prise de courant',    src: 'https://images.pexels.com/photos/4219654/pexels-photo-4219654.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { label: 'Interrupteur',        src: 'https://images.pexels.com/photos/4792729/pexels-photo-4792729.jpeg?auto=compress&cs=tinysrgb&w=400' },
  ],
  chauffage: [
    { label: 'Radiateur',          src: 'https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { label: 'Thermostat',         src: 'https://images.pexels.com/photos/4489794/pexels-photo-4489794.jpeg?auto=compress&cs=tinysrgb&w=400' },
  ],
  electromenager: [
    { label: 'Plaque de cuisson',  src: 'https://images.pexels.com/photos/4397923/pexels-photo-4397923.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { label: 'Réfrigérateur',      src: 'https://images.pexels.com/photos/2062426/pexels-photo-2062426.jpeg?auto=compress&cs=tinysrgb&w=400' },
  ],
  menuiserie: [
    { label: "Porte d'entrée",     src: 'https://images.pexels.com/photos/277559/pexels-photo-277559.jpeg?auto=compress&cs=tinysrgb&w=400' },
    { label: 'Fenêtre / Store',    src: 'https://images.pexels.com/photos/1741279/pexels-photo-1741279.jpeg?auto=compress&cs=tinysrgb&w=400' },
  ],
};

const GENERIC_GALLERY = [
  { label: 'Salle de bain',      src: 'https://images.pexels.com/photos/6444262/pexels-photo-6444262.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { label: 'Cuisine',             src: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { label: 'Chambre',             src: 'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { label: 'Porte / Serrure',    src: 'https://images.pexels.com/photos/277559/pexels-photo-277559.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { label: 'Électricité',        src: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { label: 'Plomberie',           src: 'https://images.pexels.com/photos/5490343/pexels-photo-5490343.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

// ─── Lightbox ─────────────────────────────────────────────────────────────────

interface LightboxPhoto { src: string; label: string; }

function Lightbox({ photos, idx: initIdx, onClose }: { photos: LightboxPhoto[]; idx: number; onClose: () => void }) {
  const [idx, setIdx] = useState(initIdx);
  const p = photos[idx];
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90" onClick={onClose}>
      <div className="relative max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-9 right-0 text-white/70 hover:text-white text-sm flex items-center gap-1.5">
          <X className="w-4 h-4" /> Fermer
        </button>
        <img src={p.src} alt={p.label} className="w-full rounded-xl object-contain" style={{ maxHeight: '70vh' }} />
        <div className="absolute bottom-3 left-3 text-xs font-semibold text-white bg-black/50 px-2 py-1 rounded">{p.label}</div>
        {photos.length > 1 && (
          <div className="flex items-center justify-between mt-3">
            <button onClick={() => setIdx(i => (i - 1 + photos.length) % photos.length)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"><ChevronLeft className="w-4 h-4" /></button>
            <div className="flex gap-1.5">{photos.map((_, i) => <button key={i} onClick={() => setIdx(i)} className={`w-2 h-2 rounded-full ${i === idx ? 'bg-white' : 'bg-white/40'}`} />)}</div>
            <button onClick={() => setIdx(i => (i + 1) % photos.length)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"><ChevronRight className="w-4 h-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Photo viewer (main + thumbnails) ────────────────────────────────────────

function PhotoViewer({ photos, onRemove, onAnnotate, onExpand }: {
  photos: PhotoItem[];
  onRemove: (id: string) => void;
  onAnnotate: (p: PhotoItem) => void;
  onExpand: (p: PhotoItem, all: { src: string; label: string }[]) => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const clampedIdx = Math.min(activeIdx, photos.length - 1);
  const active = photos[clampedIdx];
  const displaySrc = active.annotated ?? active.src;
  const allForLightbox = photos.map(p => ({ src: p.annotated ?? p.src, label: p.label }));

  return (
    <div className="border-b border-slate-100">
      {/* Main viewer */}
      <div className="relative group overflow-hidden bg-slate-900" style={{ height: 220 }}>
        <img
          src={displaySrc}
          alt={active.label}
          className="w-full h-full object-cover transition-all duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />

        {/* Counter badge */}
        {photos.length > 1 && (
          <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
            {clampedIdx + 1} / {photos.length}
          </div>
        )}

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 py-1.5 gap-1.5 bg-gradient-to-t from-black/40 to-transparent">
          <span className="text-[10px] font-semibold text-white bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded truncate max-w-[55%]">
            {active.label}
            {active.annotated && <span className="ml-1 text-red-300"><PenLine className="inline w-2.5 h-2.5" /></span>}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onAnnotate(active)}
              className="flex items-center gap-1 text-[10px] text-white font-medium bg-black/40 backdrop-blur-sm hover:bg-black/60 px-1.5 py-0.5 rounded transition-colors border border-white/20"
              title="Préciser"
            >
              <PenLine className="w-2.5 h-2.5 text-red-400" />
              Préciser
            </button>
            <button
              onClick={() => onExpand(active, allForLightbox)}
              className="flex items-center gap-1 text-[10px] text-white font-medium bg-black/40 backdrop-blur-sm hover:bg-black/60 px-1.5 py-0.5 rounded transition-colors border border-white/20"
              title="Agrandir"
            >
              <Maximize2 className="w-2.5 h-2.5" />
              Agrandir
            </button>
            <button
              onClick={() => { onRemove(active.id); setActiveIdx(i => Math.max(0, i - 1)); }}
              className="flex items-center justify-center w-5 h-5 bg-black/40 backdrop-blur-sm hover:bg-red-500/80 rounded transition-colors border border-white/20 text-white"
              title="Supprimer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="flex overflow-x-auto border-t border-slate-100" style={{ scrollbarWidth: 'none' }}>
          {photos.map((p, i) => {
            const src = p.annotated ?? p.src;
            return (
              <button
                key={p.id}
                onClick={() => setActiveIdx(i)}
                className={`flex-shrink-0 overflow-hidden border-r border-slate-100 last:border-r-0 transition-all ${
                  i === clampedIdx ? 'ring-2 ring-inset ring-blue-500' : 'opacity-60 hover:opacity-100'
                }`}
                style={{ width: 56, height: 48 }}
                title={p.label}
              >
                <img src={src} alt={p.label} className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Photo chip ───────────────────────────────────────────────────────────────

interface PhotoItem {
  id: string;
  src: string;           // original
  annotated?: string;    // post-drawing
  label: string;
  fromGallery?: boolean;
}

function PhotoChip({ photo, onRemove, onAnnotate, onExpand }: {
  photo: PhotoItem;
  onRemove: () => void;
  onAnnotate: () => void;
  onExpand: () => void;
}) {
  const displaySrc = photo.annotated ?? photo.src;
  return (
    <div className="relative group overflow-hidden border border-slate-200 bg-white" style={{ height: 90 }}>
      <img src={displaySrc} alt={photo.label} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1">
        <span className="text-[10px] font-semibold text-slate-900 bg-white/85 backdrop-blur-sm px-1.5 py-0.5 rounded truncate block">
          {photo.label}
          {photo.annotated && <span className="ml-1 text-red-600"><PenLine className="inline w-2.5 h-2.5" /></span>}
        </span>
      </div>
      {/* Actions on hover */}
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={e => { e.stopPropagation(); onAnnotate(); }}
          className="w-5 h-5 flex items-center justify-center bg-white/90 hover:bg-white rounded shadow text-red-500 transition-colors" title="Préciser">
          <PenLine className="w-3 h-3" />
        </button>
        <button onClick={e => { e.stopPropagation(); onExpand(); }}
          className="w-5 h-5 flex items-center justify-center bg-white/90 hover:bg-white rounded shadow text-slate-600 transition-colors" title="Agrandir">
          <Maximize2 className="w-3 h-3" />
        </button>
        <button onClick={e => { e.stopPropagation(); onRemove(); }}
          className="w-5 h-5 flex items-center justify-center bg-white/90 hover:bg-red-50 rounded shadow text-slate-400 hover:text-red-500 transition-colors" title="Supprimer">
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ─── AI Suggestion bubble ─────────────────────────────────────────────────────

interface AiSuggestion {
  description: string;
  equipement: string;
  resolutions: string[];
}

function AiSuggestionCard({ suggestion, onAccept }: { suggestion: AiSuggestion; onAccept: (desc: string) => void }) {
  return (
    <div className="border border-blue-200 bg-blue-50 rounded-lg p-3 space-y-2 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm">✨</span>
        <span className="text-xs font-bold text-blue-700">Suggestions IA</span>
      </div>
      <div>
        <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-0.5">Équipement détecté</p>
        <p className="text-xs text-slate-700 font-medium">{suggestion.equipement}</p>
      </div>
      <div>
        <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-0.5">Description suggérée</p>
        <p className="text-xs text-slate-700 leading-relaxed">{suggestion.description}</p>
      </div>
      <div>
        <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-1">Pistes de résolution</p>
        <ul className="space-y-0.5">
          {suggestion.resolutions.map((r, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
              <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />{r}
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={() => onAccept(suggestion.description)}
        className="w-full mt-1 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
        Utiliser cette description
      </button>
    </div>
  );
}

// ─── Attached file chip ───────────────────────────────────────────────────────

interface AttachedFile { id: string; name: string; size: number; }

function FileBadge({ file, onRemove }: { file: AttachedFile; onRemove: () => void }) {
  const ext = file.name.split('.').pop()?.toUpperCase() ?? 'FILE';
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 group">
      <Paperclip className="w-3 h-3 text-slate-400 flex-shrink-0" />
      <span className="truncate max-w-[100px]">{file.name}</span>
      <span className="text-[10px] text-slate-400 flex-shrink-0">{ext}</span>
      <button onClick={onRemove} className="ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface DescriptionSidecarProps {
  methode: 'ia' | 'manuelle' | '';
  categorie: string;
  locDetail: string;
  locSummary?: string;
  pieceLabel?: string;
  elementLabel?: string;
  onAiSuggestionAccepted?: (description: string) => void;
  onPhotoAnalyzed?: (photoLabel: string) => void;
}

export default function DescriptionSidecar({ methode, categorie, locDetail, onAiSuggestionAccepted, onPhotoAnalyzed }: DescriptionSidecarProps) {
  const [photos, setPhotos]         = useState<PhotoItem[]>([]);
  const [drawing, setDrawing]       = useState<PhotoItem | null>(null);
  const [lightbox, setLightbox]     = useState<{ photos: LightboxPhoto[]; idx: number } | null>(null);
  const [galleryTab, setGalleryTab] = useState<'logement' | 'type'>('logement');
  const [gallerieOpen, setGallerieOpen] = useState(false);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
  const [aiLoading, setAiLoading]   = useState(false);
  const [equipmentPlan, setEquipmentPlan] = useState<PhotoItem | null>(null);

  const fileInputRef    = useRef<HTMLInputElement>(null);
  const attachInputRef  = useRef<HTMLInputElement>(null);

  // ── Equipment plan: show when category has plans ─────────────────────────────
  const catPlans = EQUIPMENT_PLANS[categorie] ?? [];
  const [selectedPlanIdx, setSelectedPlanIdx] = useState(0);

  // ── Simulate AI analysis ──────────────────────────────────────────────────────
  function simulateAiAnalysis(photoLabel: string, isOcr: boolean) {
    setAiLoading(true);
    setAiSuggestion(null);
    setTimeout(() => {
      const suggestions: Record<string, AiSuggestion> = {
        default: {
          equipement: 'Robinet de lavabo',
          description: `Fuite détectée au niveau du joint du robinet de lavabo. L'eau s'écoule en permanence même robinet fermé. Visible depuis ${locDetail || 'la salle de bain'}.`,
          resolutions: [
            'Remplacer le joint torique du robinet',
            'Vérifier le serrage du presse-étoupe',
            'Contrôler la pression d\'eau du réseau',
          ],
        },
      };
      const key = photoLabel.toLowerCase().includes('cuisine') ? 'default'
        : photoLabel.toLowerCase().includes('élec') ? 'default'
        : 'default';
      const suggestion = suggestions[key] ?? suggestions.default;
      if (isOcr) suggestion.equipement = `Équipement détecté sur photo : ${suggestion.equipement}`;
      setAiSuggestion(suggestion);
      setAiLoading(false);
    }, 1400);
  }

  // ── Photo handling ────────────────────────────────────────────────────────────
  function addPhotosFromFiles(files: File[]) {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const src = e.target?.result as string;
        const item: PhotoItem = { id: crypto.randomUUID(), src, label: file.name };
        setPhotos(prev => [...prev, item]);
        if (methode === 'ia') {
          if (onPhotoAnalyzed) {
            onPhotoAnalyzed(file.name);
          } else {
            simulateAiAnalysis(file.name, true);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    // Check if it's an attachment or a photo based on file type
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const otherFiles = files.filter(f => !f.type.startsWith('image/'));
    if (imageFiles.length) addPhotosFromFiles(imageFiles);
    if (otherFiles.length) {
      setAttachments(prev => [
        ...prev,
        ...otherFiles.map(f => ({ id: crypto.randomUUID(), name: f.name, size: f.size }))
      ]);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addPhotosFromFiles(Array.from(e.target.files));
    e.target.value = '';
  }

  function handleAttachInput(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...files.map(f => ({ id: crypto.randomUUID(), name: f.name, size: f.size }))]);
    }
    e.target.value = '';
  }

  function removePhoto(id: string) { setPhotos(prev => prev.filter(p => p.id !== id)); }
  function removeAttachment(id: string) { setAttachments(prev => prev.filter(a => a.id !== id)); }

  function addFromGallery(item: { label: string; src: string }) {
    const photo: PhotoItem = { id: crypto.randomUUID(), src: item.src, label: item.label, fromGallery: true };
    setPhotos(prev => [...prev, photo]);
    if (methode === 'ia') simulateAiAnalysis(item.label, false);
  }

  function saveAnnotation(photoId: string, dataUrl: string) {
    if (equipmentPlan && equipmentPlan.id === photoId) {
      setEquipmentPlan(prev => prev ? { ...prev, annotated: dataUrl } : null);
    } else {
      setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, annotated: dataUrl } : p));
    }
    setDrawing(null);
  }

  const galleryItems = catPlans.length > 0 && galleryTab === 'logement' ? catPlans : GENERIC_GALLERY;

  // When category changes, pick first equipment plan
  const handleCatPlan = useCallback((idx: number) => {
    setSelectedPlanIdx(idx);
    if (catPlans[idx]) {
      setEquipmentPlan({
        id: `plan-${catPlans[idx].label}`,
        src: catPlans[idx].src,
        label: catPlans[idx].label,
      });
    }
  }, [catPlans]);

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">

        {/* ── Header tabs ── */}
        <div className="flex-shrink-0 border-b border-slate-100 px-3 pt-3 pb-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Photo(s) ou pièce-jointe</p>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: 'thin' }}>

          {/* ── Drop zone ── */}
          <div
            className={`mx-0 mt-0 border-b border-dashed border-slate-200 transition-colors cursor-pointer ${isDragOver ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 hover:bg-slate-100'}`}
            style={{ minHeight: 170 }}
            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center py-8 gap-2.5">
              <Camera className={`w-8 h-8 ${isDragOver ? 'text-blue-500' : 'text-slate-300'}`} />
              <p className={`text-xs font-medium text-center leading-relaxed px-4 ${isDragOver ? 'text-blue-600' : 'text-slate-800'}`}>
                🙏 Ajoutez svp une photo pour aider l'équipe technique à comprendre le problème plus rapidement.
              </p>
              {methode === 'ia' && (
                <p className="text-[10px] text-blue-500 font-medium">L'IA analysera la photo automatiquement</p>
              )}
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />

          {/* ── AI loading / suggestion ── */}
          {aiLoading && (
            <div className="px-3 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium">Analyse IA en cours…</span>
              </div>
            </div>
          )}
          {aiSuggestion && !aiLoading && onAiSuggestionAccepted && (
            <div className="px-3 py-3 border-b border-slate-100">
              <AiSuggestionCard suggestion={aiSuggestion} onAccept={onAiSuggestionAccepted} />
            </div>
          )}

          {/* ── Photos added ── */}
          {photos.length > 0 && (
            <PhotoViewer
              photos={photos}
              onRemove={id => removePhoto(id)}
              onAnnotate={photo => setDrawing(photo)}
              onExpand={(photo, allPhotos) => setLightbox({ photos: allPhotos, idx: allPhotos.findIndex(p => p.src === (photo.annotated ?? photo.src)) })}
            />
          )}

          {/* ── Gallery (accordion, closed by default) ── */}
          <div className="border-b border-slate-100">
            <button
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors"
              onClick={() => setGallerieOpen(o => !o)}
            >
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Galerie</p>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${gallerieOpen ? 'rotate-180' : ''}`} />
            </button>
            {gallerieOpen && (
              <>
                <div className="flex items-center justify-between px-3 pb-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setGalleryTab('logement')}
                      className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors ${galleryTab === 'logement' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      Logement
                    </button>
                    <button
                      onClick={() => setGalleryTab('type')}
                      className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors ${galleryTab === 'type' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      Type
                    </button>
                  </div>
                </div>
                {locDetail && galleryTab === 'logement' && (
                  <p className="text-[10px] text-slate-400 px-3 pb-1">Filtre : {locDetail}</p>
                )}
                <div className="grid grid-cols-2">
                  {galleryItems.map((item, i) => {
                    const alreadyAdded = photos.some(p => p.src === item.src);
                    return (
                      <div key={i} className="relative group overflow-hidden border-b border-r border-slate-100 cursor-pointer"
                        style={{ height: 72 }}
                        onClick={() => !alreadyAdded && addFromGallery(item)}
                      >
                        <img src={item.src} alt={item.label} className="w-full h-full object-cover" />
                        <div className={`absolute inset-0 transition-colors ${alreadyAdded ? 'bg-emerald-500/20' : 'bg-black/0 group-hover:bg-black/25'}`} />
                        <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1">
                          <span className="text-[10px] font-semibold text-white bg-black/50 px-1.5 py-0.5 rounded truncate block">{item.label}</span>
                        </div>
                        {alreadyAdded && (
                          <div className="absolute top-1 right-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* ── Equipment plan (when category known) ── */}
          {catPlans.length > 0 && (
            <div className="border-b border-slate-100">
              <div className="px-3 py-2 flex items-center justify-between">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Plan équipement</p>
                {catPlans.length > 1 && (
                  <div className="flex gap-1">
                    {catPlans.map((p, i) => (
                      <button key={i} onClick={() => handleCatPlan(i)}
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium transition-colors truncate max-w-[64px] ${selectedPlanIdx === i ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                        title={p.label}>
                        {p.label.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative group overflow-hidden" style={{ height: 130 }}>
                <img
                  src={equipmentPlan?.annotated ?? catPlans[selectedPlanIdx]?.src}
                  alt={catPlans[selectedPlanIdx]?.label}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 py-1.5">
                  <span className="text-[11px] font-semibold text-slate-900 bg-white/85 backdrop-blur-sm px-2 py-0.5 rounded truncate">
                    {catPlans[selectedPlanIdx]?.label}
                    {equipmentPlan?.annotated && <span className="ml-1 text-red-600"><PenLine className="inline w-2.5 h-2.5" /></span>}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const ep = equipmentPlan ?? { id: `plan-${catPlans[selectedPlanIdx].label}`, src: catPlans[selectedPlanIdx].src, label: catPlans[selectedPlanIdx].label };
                        setEquipmentPlan(ep);
                        setDrawing(ep);
                      }}
                      className="flex items-center gap-1 text-[10px] text-slate-700 font-medium bg-white/85 backdrop-blur-sm hover:bg-white px-1.5 py-0.5 rounded border border-slate-200/60">
                      <PenLine className="w-2.5 h-2.5 text-red-500" /> Préciser
                    </button>
                    <button
                      onClick={() => setLightbox({ photos: [{ src: equipmentPlan?.annotated ?? catPlans[selectedPlanIdx]?.src, label: catPlans[selectedPlanIdx]?.label }], idx: 0 })}
                      className="flex items-center gap-1 text-[10px] text-slate-700 font-medium bg-white/85 backdrop-blur-sm hover:bg-white px-1.5 py-0.5 rounded border border-slate-200/60">
                      <Maximize2 className="w-2.5 h-2.5" /> Agrandir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>{/* end scrollable */}

        {/* ── Attachments drop zone ── */}
        <div className="flex-shrink-0 border-t border-slate-100">
          <div
            className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => attachInputRef.current?.click()}
          >
            <FolderOpen className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-xs text-slate-500 font-medium">Joindre des fichiers utiles aux intervenants</span>
          </div>
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-1 px-3 pb-2">
              {attachments.map(f => <FileBadge key={f.id} file={f} onRemove={() => removeAttachment(f.id)} />)}
            </div>
          )}
          <input ref={attachInputRef} type="file" multiple className="hidden" onChange={handleAttachInput} />
        </div>

      </div>

      {/* Lightbox */}
      {lightbox && <Lightbox photos={lightbox.photos} idx={lightbox.idx} onClose={() => setLightbox(null)} />}

      {/* Drawing modal */}
      {drawing && (
        <DrawingModal
          imageSrc={drawing.src}
          imageLabel={drawing.label}
          onSave={dataUrl => saveAnnotation(drawing.id, dataUrl)}
          onClose={() => setDrawing(null)}
        />
      )}
    </>
  );
}
