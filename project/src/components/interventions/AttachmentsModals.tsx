import { useState, useEffect, useCallback } from 'react';
import {
  X, FileText, FileImage, FileSpreadsheet, FileCode, File,
  Download, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw,
  Mail, Reply, ReplyAll, Forward, Paperclip, Star, Archive,
  Clock, ChevronDown, Search, Inbox, CheckCircle2, MapPin, Tag, ExternalLink,
} from 'lucide-react';
import type { CriticiteDI } from './interventionsTypes';
import { CRITICITE_CFG } from './interventionsTypes';

// ─── Fake data generators ──────────────────────────────────────────────────────

interface FakeFile {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'png' | 'jpg' | 'jpeg' | 'csv';
  size: string;
  date: string;
  preview?: string; // URL for image files
}

interface FakePhoto {
  id: string;
  url: string;
  caption: string;
  date: string;
  category: 'avant' | 'pendant' | 'apres' | 'document';
}

interface FakeEmail {
  id: string;
  from: string;
  fromAvatar: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  isRead: boolean;
  hasAttachment: boolean;
  isStarred: boolean;
  direction: 'in' | 'out';
  type: 'confirmation' | 'regular';
}

const FILE_NAMES = [
  ['rapport-intervention', 'pdf'],
  ['devis-prestataire', 'pdf'],
  ['photo-degat', 'jpg'],
  ['bon-commande', 'xlsx'],
  ['contrat-maintenance', 'docx'],
  ['plan-localisation', 'pdf'],
  ['facture-pieces', 'xlsx'],
  ['note-interne', 'docx'],
  ['photo-reparation', 'jpg'],
  ['bon-travaux', 'pdf'],
];

const PHOTO_CAPTIONS = [
  'Vue générale du problème',
  'Détail de la zone touchée',
  'État avant intervention',
  'Pendant les travaux',
  'Résultat après réparation',
  'Photo de contrôle',
];

const PHOTO_URLS = [
  'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&w=800&h=600&fit=crop',
  'https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg?auto=compress&w=800&h=600&fit=crop',
  'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&w=800&h=600&fit=crop',
  'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&w=800&h=600&fit=crop',
  'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&w=800&h=600&fit=crop',
  'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&w=800&h=600&fit=crop',
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function generateFiles(ref: string, count: number): FakeFile[] {
  const h = hashStr(ref);
  return Array.from({ length: count }, (_, i) => {
    const idx = (h + i * 7) % FILE_NAMES.length;
    const [base, ext] = FILE_NAMES[idx] as [string, string];
    const isImage = ext === 'jpg' || ext === 'png' || ext === 'jpeg';
    const sizes = ['42 Ko', '128 Ko', '256 Ko', '1.2 Mo', '380 Ko', '87 Ko'];
    return {
      id: `f-${ref}-${i}`,
      name: `${base}-${ref.slice(-4)}.${ext}`,
      type: ext as FakeFile['type'],
      size: sizes[(h + i * 3) % sizes.length],
      date: '12/05/2026',
      preview: isImage ? PHOTO_URLS[(h + i) % PHOTO_URLS.length] : undefined,
    };
  });
}

export function generatePhotos(ref: string, count: number): FakePhoto[] {
  const h = hashStr(ref);
  const cats: FakePhoto['category'][] = ['avant', 'avant', 'pendant', 'apres', 'apres', 'document'];
  return Array.from({ length: count }, (_, i) => ({
    id: `ph-${ref}-${i}`,
    url: PHOTO_URLS[(h + i * 3) % PHOTO_URLS.length],
    caption: PHOTO_CAPTIONS[(h + i * 2) % PHOTO_CAPTIONS.length],
    date: `${12 + (i % 3)}/05/2026 ${8 + i}h${i % 2 === 0 ? '00' : '30'}`,
    category: cats[(h + i) % cats.length],
  }));
}

const EMAIL_BODIES = [
  `Bonjour,\n\nJe vous contacte au sujet de l'intervention signalée. Pourriez-vous me confirmer la disponibilité d'un technicien pour la semaine prochaine ?\n\nCordialement,`,
  `Bonjour,\n\nSuite à votre demande, je vous confirme la prise en charge de ce ticket. Un technicien sera présent le mardi matin.\n\nBien cordialement,`,
  `Bonjour,\n\nL'intervention a bien été réalisée ce jour. Le rapport est joint en pièce jointe.\n\nCordialement,`,
  `Bonjour,\n\nNous avons besoin de précisions supplémentaires sur la localisation exacte du problème. Pouvez-vous nous fournir le numéro de chambre ?\n\nCordialement,`,
];

const SENDER_NAMES = ['Marie Dupont', 'Jean-Paul Martin', 'Sophie Renard', 'Lucas Bernard', 'Emma Leroy'];
const SENDER_AVATARS = [
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=1',
];

const EMAIL_SUBJECTS = [
  'Demande d\'intervention – Confirmation',
  'RE: Suivi intervention',
  'Rapport d\'intervention',
  'Information complémentaire requise',
];

export function generateEmails(ref: string, count: number, demande?: {
  reference: string; titre?: string | null; demandeur_nom?: string | null;
  localisation_detail?: string | null; criticite?: CriticiteDI; sla_heures?: number; created_at?: string;
}): FakeEmail[] {
  const h = hashStr(ref);
  const trackingUrl = `${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(ref)}`;

  // First email is always the confirmation notification
  const confirmationEmail: FakeEmail = {
    id: `em-${ref}-conf`,
    from: 'Équipe CROUS Lyon',
    fromAvatar: SENDER_AVATARS[h % SENDER_AVATARS.length],
    to: demande?.demandeur_nom ? `${demande.demandeur_nom.toLowerCase().replace(' ', '.')}@example.fr` : 'demandeur@example.fr',
    subject: `Votre demande d'intervention a bien été enregistrée — ${ref}`,
    body: `confirmation:${JSON.stringify({ trackingUrl, demande })}`,
    date: demande?.created_at
      ? (() => { const d = new Date(demande.created_at); return `${d.toLocaleDateString('fr-FR')} ${d.getHours()}h${String(d.getMinutes()).padStart(2, '0')}`; })()
      : '12/06/2026 14h23',
    isRead: true,
    hasAttachment: false,
    isStarred: false,
    direction: 'out',
    type: 'confirmation',
  };

  const rest = Array.from({ length: count - 1 }, (_, i) => {
    const j = i + 1;
    const isOut = j % 3 === 1;
    return {
      id: `em-${ref}-${j}`,
      from: isOut ? 'Équipe CROUS Lyon' : SENDER_NAMES[(h + j) % SENDER_NAMES.length],
      fromAvatar: SENDER_AVATARS[(h + j) % SENDER_AVATARS.length],
      to: isOut ? SENDER_NAMES[(h + j + 1) % SENDER_NAMES.length] : 'maintenance@crous-lyon.fr',
      subject: `${EMAIL_SUBJECTS[(h + j) % EMAIL_SUBJECTS.length]} – Réf. ${ref.slice(-6)}`,
      body: EMAIL_BODIES[(h + j) % EMAIL_BODIES.length],
      date: `${10 + j}/05/2026 ${9 + j}h${j % 2 === 0 ? '14' : '47'}`,
      isRead: true,
      hasAttachment: j % 3 === 0,
      isStarred: false,
      direction: isOut ? 'out' as const : 'in' as const,
      type: 'regular' as const,
    };
  });

  return [confirmationEmail, ...rest];
}

// ─── File type icon & color ────────────────────────────────────────────────────

function FileIcon({ type, size = 5 }: { type: FakeFile['type']; size?: number }) {
  const cfg: Record<FakeFile['type'], { icon: React.ElementType; color: string; bg: string }> = {
    pdf:  { icon: FileText,       color: 'text-red-600',    bg: 'bg-red-50'    },
    docx: { icon: FileText,       color: 'text-blue-600',   bg: 'bg-blue-50'   },
    xlsx: { icon: FileSpreadsheet,color: 'text-emerald-600',bg: 'bg-emerald-50'},
    csv:  { icon: FileCode,       color: 'text-teal-600',   bg: 'bg-teal-50'   },
    png:  { icon: FileImage,      color: 'text-violet-600', bg: 'bg-violet-50' },
    jpg:  { icon: FileImage,      color: 'text-amber-600',  bg: 'bg-amber-50'  },
    jpeg: { icon: FileImage,      color: 'text-amber-600',  bg: 'bg-amber-50'  },
  };
  const c = cfg[type] ?? { icon: File, color: 'text-slate-500', bg: 'bg-slate-50' };
  const Icon = c.icon;
  return (
    <div className={`flex items-center justify-center rounded-lg ${c.bg} flex-shrink-0`} style={{ width: size * 4 + 8, height: size * 4 + 8 }}>
      <Icon className={`${c.color}`} style={{ width: size * 4, height: size * 4 }} />
    </div>
  );
}

// ─── Photo category badge ──────────────────────────────────────────────────────

const CAT_CFG: Record<FakePhoto['category'], { label: string; bg: string; text: string }> = {
  avant:    { label: 'Avant',    bg: 'bg-blue-100',    text: 'text-blue-700'    },
  pendant:  { label: 'Pendant',  bg: 'bg-amber-100',   text: 'text-amber-700'   },
  apres:    { label: 'Après',    bg: 'bg-emerald-100', text: 'text-emerald-700' },
  document: { label: 'Document', bg: 'bg-slate-100',   text: 'text-slate-600'   },
};

// ─── Base modal wrapper ────────────────────────────────────────────────────────

function ModalWrapper({ title, subtitle, onClose, children }: {
  title: string; subtitle?: string; onClose: () => void; children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ width: 900, maxWidth: '95vw', height: '82vh' }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-800">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Attachments Modal ─────────────────────────────────────────────────────────

export function AttachmentsModal({ ticketRef, count, onClose }: {
  ticketRef: string; count: number; onClose: () => void;
}) {
  const files = generateFiles(ticketRef, count);
  const [selected, setSelected] = useState<FakeFile>(files[0]);

  return (
    <ModalWrapper title="Pièces jointes" subtitle={`${count} fichier${count > 1 ? 's' : ''} attaché${count > 1 ? 's' : ''}`} onClose={onClose}>
      <div className="flex flex-1 overflow-hidden">
        {/* Left: file list */}
        <div className="w-64 flex-shrink-0 border-r border-slate-100 flex flex-col overflow-hidden bg-slate-50/50">
          <div className="px-4 py-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-300" placeholder="Rechercher..." readOnly />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {files.map(f => (
              <button
                key={f.id}
                onClick={() => setSelected(f)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white ${selected.id === f.id ? 'bg-white shadow-sm border-l-2 border-blue-500' : ''}`}>
                <FileIcon type={f.type} size={4} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-700 truncate">{f.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{f.size} · {f.date}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: preview */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          {/* Preview toolbar */}
          <div className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <FileIcon type={selected.type} size={4} />
              <div>
                <p className="text-sm font-semibold text-slate-700">{selected.name}</p>
                <p className="text-[11px] text-slate-400">{selected.size} · Modifié le {selected.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Télécharger">
                <Download className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Zoom +">
                <ZoomIn className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Zoom -">
                <ZoomOut className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Rotation">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Preview area */}
          <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
            {selected.preview ? (
              <img
                src={selected.preview}
                alt={selected.name}
                className="max-w-full max-h-full rounded-xl shadow-lg object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-6 text-center max-w-sm">
                <div className="w-24 h-24 rounded-2xl bg-white shadow-md flex items-center justify-center">
                  <FileIcon type={selected.type} size={10} />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-700">{selected.name}</p>
                  <p className="text-sm text-slate-400 mt-1">Aperçu non disponible</p>
                  <p className="text-xs text-slate-300 mt-0.5">{selected.size}</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ─── Photos Modal ──────────────────────────────────────────────────────────────

export function PhotosModal({ ticketRef, count, onClose }: {
  ticketRef: string; count: number; onClose: () => void;
}) {
  const photos = generatePhotos(ticketRef, Math.max(count, 3));
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(1);

  const prev = useCallback(() => setSelected(i => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setSelected(i => (i + 1) % photos.length), [photos.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next]);

  const current = photos[selected];

  return (
    <ModalWrapper title="Photos terrain" subtitle={`${photos.length} photo${photos.length > 1 ? 's' : ''}`} onClose={onClose}>
      <div className="flex flex-1 overflow-hidden">
        {/* Left: thumbnails */}
        <div className="w-56 flex-shrink-0 border-r border-slate-100 flex flex-col overflow-hidden bg-slate-50/50">
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {photos.map((p, i) => {
              const cat = CAT_CFG[p.category];
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(i)}
                  className={`w-full rounded-xl overflow-hidden border-2 transition-all ${selected === i ? 'border-blue-500 shadow-md' : 'border-transparent hover:border-slate-300'}`}>
                  <div className="relative">
                    <img src={p.url} alt={p.caption} className="w-full h-24 object-cover" />
                    <span className={`absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cat.bg} ${cat.text}`}>
                      {cat.label}
                    </span>
                    {selected === i && (
                      <div className="absolute inset-0 bg-blue-500/10" />
                    )}
                  </div>
                  <div className="px-2 py-1.5 bg-white">
                    <p className="text-[10px] text-slate-600 font-medium truncate">{p.caption}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{p.date}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: main viewer */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-900">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-2 bg-slate-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CAT_CFG[current.category].bg} ${CAT_CFG[current.category].text}`}>
                {CAT_CFG[current.category].label}
              </span>
              <p className="text-sm font-medium text-white">{current.caption}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs text-slate-400">{selected + 1} / {photos.length}</p>
              <div className="flex items-center gap-1">
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors">
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] text-slate-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors">
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setZoom(1)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            <img
              key={current.id}
              src={current.url}
              alt={current.caption}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            />
            {/* Nav arrows */}
            {photos.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Footer: date */}
          <div className="flex items-center justify-center px-5 py-2 bg-slate-800 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              Prise le {current.date}
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}

// ─── Emails Modal ──────────────────────────────────────────────────────────────

function slaLabel(sla: number): string {
  if (sla <= 4)  return 'Moins de 4 heures';
  if (sla <= 8)  return 'Sous 8 heures ouvrées';
  if (sla <= 24) return 'Sous 24 heures ouvrées';
  if (sla <= 48) return 'Sous 2 jours ouvrés';
  if (sla <= 72) return 'Sous 3 jours ouvrés';
  return `Sous ${Math.round(sla / 24)} jours ouvrés`;
}

function ConfirmationEmailBody({ body, ticketRef }: { body: string; ticketRef: string }) {
  let payload: { trackingUrl: string; demande?: { reference?: string; titre?: string | null; demandeur_nom?: string | null; localisation_detail?: string | null; criticite?: CriticiteDI; sla_heures?: number } } | null = null;
  try { payload = JSON.parse(body.replace('confirmation:', '')); } catch { /* noop */ }

  const d = payload?.demande;
  const trackingUrl = payload?.trackingUrl ?? `${window.location.origin}?ref=${ticketRef}`;
  const criticite: CriticiteDI = d?.criticite ?? 'moyenne';
  const critCfg = CRITICITE_CFG[criticite];
  const sla = d?.sla_heures ?? 48;

  return (
    <div className="space-y-5">
      {/* Confirmation banner */}
      <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-emerald-800">Votre demande d'intervention a bien été enregistrée</p>
          <p className="text-xs text-emerald-600 mt-0.5">Référence : <span className="font-mono font-bold">{ticketRef}</span></p>
        </div>
      </div>

      <p className="text-sm text-slate-700">Bonjour {d?.demandeur_nom ?? ''},</p>
      <p className="text-sm text-slate-600 leading-relaxed">
        Votre demande d'intervention a bien été enregistrée dans notre système de gestion. Voici un récapitulatif :
      </p>

      {/* Info table — 2 colonnes */}
      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-slate-100">
          {/* Col 1 */}
          <div className="divide-y divide-slate-100">
            <div className="flex items-start gap-2.5 px-4 py-3 bg-slate-50">
              <Tag className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Numéro</p>
                <p className="text-xs font-bold text-blue-700 font-mono truncate">{ticketRef}</p>
              </div>
            </div>
            {d?.titre && (
              <div className="flex items-start gap-2.5 px-4 py-3">
                <Mail className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Objet</p>
                  <p className="text-xs font-semibold text-slate-700 line-clamp-2">{d.titre}</p>
                </div>
              </div>
            )}
            {d?.localisation_detail && (
              <div className="flex items-start gap-2.5 px-4 py-3 bg-slate-50">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Lieu</p>
                  <p className="text-xs text-slate-700 line-clamp-2">{d.localisation_detail}</p>
                </div>
              </div>
            )}
          </div>
          {/* Col 2 */}
          <div className="divide-y divide-slate-100">
            <div className="flex items-start gap-2.5 px-4 py-3 bg-slate-50">
              <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Délai estimé</p>
                <p className="text-xs font-semibold text-slate-700">⏱ {slaLabel(sla)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 px-4 py-3">
              <div className="w-3.5 h-3.5 flex items-center justify-center mt-0.5 flex-shrink-0">
                <span className="text-xs">{critCfg.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Priorité</p>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${critCfg.bg} ${critCfg.text}`}>
                  {critCfg.icon} {critCfg.label}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <a
          href={trackingUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
          <ExternalLink className="w-4 h-4" />
          Suivre ma demande
        </a>
        <p className="text-[10px] text-slate-400 mt-2 break-all">{trackingUrl}</p>
      </div>

      <p className="text-xs text-slate-400 border-t border-slate-100 pt-4">
        Cet email a été envoyé automatiquement par OpenGST — CROUS Lyon.<br/>
        En cas d'urgence, contactez directement le service technique.
      </p>
    </div>
  );
}

export function EmailsModal({ ticketRef, count, onClose, demande }: {
  ticketRef: string; count: number; onClose: () => void;
  demande?: { reference: string; titre?: string | null; demandeur_nom?: string | null; localisation_detail?: string | null; criticite?: CriticiteDI; sla_heures?: number; created_at?: string };
}) {
  const emails = generateEmails(ticketRef, Math.max(count, 2), demande);
  const [selected, setSelected] = useState<FakeEmail>(emails[0]);
  const [expandBody, setExpandBody] = useState(true);

  return (
    <ModalWrapper title="Échanges email" subtitle={`${emails.length} message${emails.length > 1 ? 's' : ''} échangé${emails.length > 1 ? 's' : ''}`} onClose={onClose}>
      <div className="flex flex-1 overflow-hidden">
        {/* Left: email list */}
        <div className="w-72 flex-shrink-0 border-r border-slate-100 flex flex-col overflow-hidden bg-slate-50/50">
          <div className="px-3 py-2 bg-white border-b border-slate-100 flex items-center gap-2">
            <Inbox className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600">Conversations</span>
            <span className="ml-auto text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{emails.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {emails.map(em => (
              <button
                key={em.id}
                onClick={() => setSelected(em)}
                className={`w-full flex items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-white ${selected.id === em.id ? 'bg-white border-l-2 border-blue-500' : ''}`}>
                {/* Avatar */}
                <div className="relative flex-shrink-0 mt-0.5">
                  <img src={em.fromAvatar} alt={em.from} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                  {em.direction === 'out' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Forward className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs truncate ${em.isRead ? 'text-slate-600' : 'font-bold text-slate-800'}`}>{em.from}</p>
                    <p className="text-[9px] text-slate-400 flex-shrink-0">{em.date.split(' ')[1]}</p>
                  </div>
                  <p className={`text-[11px] truncate mt-0.5 ${em.isRead ? 'text-slate-500' : 'font-semibold text-slate-700'}`}>{em.subject}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5 leading-tight">{em.body.split('\n')[2]?.trim()}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {em.hasAttachment && <Paperclip className="w-3 h-3 text-slate-400" />}
                    {em.isStarred && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                    {!em.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: email detail */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Email header */}
          <div className="px-6 py-4 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-bold text-slate-800 leading-tight">{selected.subject}</h3>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors" title="Marquer comme important">
                  <Star className={`w-4 h-4 ${selected.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Archiver">
                  <Archive className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* From / to */}
            <div className="flex items-center gap-3 mt-3">
              <img src={selected.fromAvatar} alt={selected.from} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-700">{selected.from}</span>
                  {selected.direction === 'out' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">Envoyé</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-slate-400">À :</span>
                  <span className="text-xs text-slate-500">{selected.to}</span>
                  <button className="ml-auto flex items-center gap-0.5 text-[10px] text-slate-400 hover:text-slate-600">
                    {selected.date}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Email body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="max-w-2xl">
              {selected.type === 'confirmation' ? (
                <ConfirmationEmailBody body={selected.body} ticketRef={ticketRef} />
              ) : (
                <>
                  {selected.body.split('\n').map((line, i) => (
                    <p key={i} className={`${line === '' ? 'mt-3' : ''} text-sm text-slate-700 leading-relaxed`}>
                      {line}
                    </p>
                  ))}
                  {selected.hasAttachment && (
                    <div className="mt-6 p-4 border border-slate-200 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-2 mb-3">
                        <Paperclip className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-semibold text-slate-600">1 pièce jointe</span>
                      </div>
                      <div className="flex items-center gap-3 px-3 py-2.5 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                        <FileIcon type="pdf" size={4} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700">rapport-intervention.pdf</p>
                          <p className="text-[10px] text-slate-400">128 Ko</p>
                        </div>
                        <Download className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Reply bar */}
          <div className="flex-shrink-0 px-6 py-3 border-t border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                <Reply className="w-3.5 h-3.5" /> Répondre
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-white transition-colors">
                <ReplyAll className="w-3.5 h-3.5" /> Répondre à tous
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-white transition-colors">
                <Forward className="w-3.5 h-3.5" /> Transférer
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
