import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Camera, ZoomIn, X,
  ClipboardCheck, ClipboardX, CalendarClock, PenLine, Plus, CheckCircle2,
} from 'lucide-react';
import { completenessColors } from '../interventions/completenessScore';

// ── Data model ────────────────────────────────────────────────────────────────

export type ObservationOption = string;

export interface ElementRow {
  id: string;
  label: string;
  options: ObservationOption[];
  hasNb?: boolean;
}

export interface Piece {
  id: string;
  label: string;
  elements: ElementRow[];
}

export interface EdlColumnData {
  edlId: string;
  type: 'entrant' | 'sortant' | 'pre_sortant';
  date: string;
  occupantNom: string;
  occupantPrenom: string;
  observations: Record<string, ObservationOption[]>;
  nb: Record<string, string>;
  photos: Record<string, string>;
  observations_text: Record<string, string>;
}

// ── Checklist structure ────────────────────────────────────────────────────────

const OPT_PORTE       = ['en état', 'à nettoyer', 'pb poignée', 'trou', 'à repeindre', 'pb joint', 'pb serrure'];
const OPT_PATERES     = ['en état', 'manquant', 'à changer', 'à refixer'];
const OPT_MUR         = ['en état', 'tâché/sale', 'abîmé/trous', 'à repeindre'];
const OPT_PLAFOND     = ['en état', 'tâché/sale', 'abîmé/trous', 'à repeindre'];
const OPT_SOL         = ['en état', 'accrocs/trous/brûlures', 'à remplacer'];
const OPT_INTERRUPTEUR= ['en état', 'à nettoyer', 'à refixer', 'ne fonctionne pas'];
const OPT_LUMIERE     = ['en état', 'à changer'];
const OPT_PRISE       = ['en état', 'à refixer'];
const OPT_DETECTEUR   = ['en place', 'absent'];
const OPT_FENETRE     = ['en état', 'à nettoyer', 'pb poignée'];
const OPT_VITRE       = ['en état', 'à nettoyer', 'vitre fissurée'];
const OPT_VOLET       = ['en état', 'dégradé', 'ne fonctionne pas'];
const OPT_REBORD      = ['en état', 'brûlures/cigarettes'];
const OPT_RADIATEUR   = ['en état', 'à nettoyer'];
const OPT_BARRE_SEUIL = ['en état', 'à refixer', 'manquantes'];
const OPT_CABINE      = ['en état', 'à nettoyer', 'trous', 'fissures/éclats', 'accrocs', 'rayures', 'brûlures', 'dégradé/tâché'];
const OPT_ECLAIRAGE   = ['en état', 'manquant', 'à refixer', 'ne fonctionne pas'];
const OPT_MITIGEUR    = ['en état', 'à nettoyer', 'à changer', 'fuite'];
const OPT_WC_CUVETTE  = ['en état', 'à nettoyer', 'abîmé', 'fuite'];
const OPT_WC_ABATTANT = ['en état', 'à changer', 'cassé'];
const OPT_MEUBLE      = ['en état', 'abîmé', 'manquant', 'à changer'];
const OPT_PLAN_TRAVAIL = ['en état', 'tâché', 'brûlures', 'abîmé'];
const OPT_EVIER       = ['en état', 'à nettoyer', 'fissures', 'à changer'];
const OPT_CREDENCE    = ['en état', 'décollée', 'tâchée', 'à changer'];
const OPT_ELECTRO     = ['en état', 'à nettoyer', 'ne fonctionne pas', 'à remplacer'];
const OPT_HOTTE       = ['en état', 'à nettoyer', 'filtre à changer', 'ne fonctionne pas'];

export const PIECES: Piece[] = [
  {
    id: 'piece_principale',
    label: 'Pièce Principale',
    elements: [
      { id: 'pp_porte',       label: 'Porte',                    options: OPT_PORTE,       hasNb: false },
      { id: 'pp_pateres',     label: 'Patères',                  options: OPT_PATERES,     hasNb: true  },
      { id: 'pp_mur',         label: 'Mur',                      options: OPT_MUR,         hasNb: false },
      { id: 'pp_plafond',     label: 'Plafond',                  options: OPT_PLAFOND,     hasNb: false },
      { id: 'pp_sol',         label: 'Sol',                      options: OPT_SOL,         hasNb: false },
      { id: 'pp_interrupteur',label: 'Interrupteur',             options: OPT_INTERRUPTEUR,hasNb: false },
      { id: 'pp_lum_couloir', label: 'Lumière couloir',          options: OPT_LUMIERE,     hasNb: false },
      { id: 'pp_lum_bureau',  label: 'Lumière bureau',           options: OPT_LUMIERE,     hasNb: false },
      { id: 'pp_lum_chevet',  label: 'Lampe de chevet',          options: OPT_LUMIERE,     hasNb: false },
      { id: 'pp_prise_reseau',label: 'Prise réseau',             options: OPT_PRISE,       hasNb: false },
      { id: 'pp_prise_elec',  label: 'Prise électrique',        options: OPT_PRISE,       hasNb: false },
      { id: 'pp_detecteur',   label: 'Détecteur de fumée',       options: OPT_DETECTEUR,   hasNb: false },
      { id: 'pp_fenetre',     label: 'Fenêtre (bloc/cadre)',     options: OPT_FENETRE,     hasNb: false },
      { id: 'pp_vitre',       label: 'Vitre',                    options: OPT_VITRE,       hasNb: false },
      { id: 'pp_volet',       label: 'Volet',                    options: OPT_VOLET,       hasNb: false },
      { id: 'pp_rebord',      label: 'Rebord de fenêtre ext.',  options: OPT_REBORD,      hasNb: false },
      { id: 'pp_radiateur',   label: 'Radiateurs',               options: OPT_RADIATEUR,   hasNb: false },
    ],
  },
  {
    id: 'salle_de_bain',
    label: 'Salle de Bain',
    elements: [
      { id: 'sdb_porte',       label: 'Porte',            options: OPT_PORTE,       hasNb: false },
      { id: 'sdb_barre_seuil', label: 'Barres de seuil',  options: OPT_BARRE_SEUIL, hasNb: false },
      { id: 'sdb_pateres',     label: 'Patères',           options: OPT_PATERES,     hasNb: true  },
      { id: 'sdb_cabine',      label: 'Cabine / Baignoire',options: OPT_CABINE,      hasNb: false },
      { id: 'sdb_eclairage',   label: 'Éclairage douche', options: OPT_ECLAIRAGE,   hasNb: false },
      { id: 'sdb_mur',         label: 'Mur / Carrelage',   options: OPT_MUR,         hasNb: false },
      { id: 'sdb_sol',         label: 'Sol',                options: OPT_SOL,         hasNb: false },
      { id: 'sdb_mitigeur',    label: 'Mitigeur douche',   options: OPT_MITIGEUR,    hasNb: false },
      { id: 'sdb_miroir',      label: 'Miroir',             options: OPT_VITRE,       hasNb: false },
      { id: 'sdb_meuble',      label: 'Meuble vasque',     options: OPT_MEUBLE,      hasNb: false },
      { id: 'sdb_radiateur',   label: 'Sèche-serviettes', options: OPT_RADIATEUR,   hasNb: false },
    ],
  },
  {
    id: 'wc',
    label: 'WC / Toilettes',
    elements: [
      { id: 'wc_porte',    label: 'Porte',             options: OPT_PORTE,       hasNb: false },
      { id: 'wc_cuvette',  label: 'Cuvette',           options: OPT_WC_CUVETTE,  hasNb: false },
      { id: 'wc_abattant', label: 'Abattant',          options: OPT_WC_ABATTANT, hasNb: false },
      { id: 'wc_chasse',   label: "Chasse d'eau",      options: OPT_MITIGEUR,    hasNb: false },
      { id: 'wc_mur',      label: 'Mur / Carrelage',  options: OPT_MUR,         hasNb: false },
      { id: 'wc_sol',      label: 'Sol',               options: OPT_SOL,         hasNb: false },
      { id: 'wc_eclairage',label: 'Éclairage',        options: OPT_ECLAIRAGE,   hasNb: false },
      { id: 'wc_prise',    label: 'Prise électrique', options: OPT_PRISE,       hasNb: false },
    ],
  },
  {
    id: 'cuisine',
    label: 'Cuisine / Kitchenette',
    elements: [
      { id: 'cui_porte',        label: 'Porte',              options: OPT_PORTE,        hasNb: false },
      { id: 'cui_mur',          label: 'Mur',                options: OPT_MUR,          hasNb: false },
      { id: 'cui_sol',          label: 'Sol',                options: OPT_SOL,          hasNb: false },
      { id: 'cui_plan_travail', label: 'Plan de travail',    options: OPT_PLAN_TRAVAIL, hasNb: false },
      { id: 'cui_credence',     label: 'Crédence',          options: OPT_CREDENCE,     hasNb: false },
      { id: 'cui_evier',        label: 'Évier',             options: OPT_EVIER,        hasNb: false },
      { id: 'cui_mitigeur',     label: 'Mitigeur',          options: OPT_MITIGEUR,     hasNb: false },
      { id: 'cui_meubles',      label: 'Meubles',           options: OPT_MEUBLE,       hasNb: false },
      { id: 'cui_plaques',      label: 'Plaques de cuisson',options: OPT_ELECTRO,      hasNb: false },
      { id: 'cui_four',         label: 'Four / Micro-ondes',options: OPT_ELECTRO,      hasNb: false },
      { id: 'cui_frigo',        label: 'Réfrigérateur',    options: OPT_ELECTRO,      hasNb: false },
      { id: 'cui_hotte',        label: 'Hotte',             options: OPT_HOTTE,        hasNb: false },
      { id: 'cui_eclairage',    label: 'Éclairage',        options: OPT_ECLAIRAGE,    hasNb: false },
      { id: 'cui_prise',        label: 'Prise électrique', options: OPT_PRISE,        hasNb: false },
    ],
  },
  {
    id: 'entree',
    label: 'Entrée / Couloir',
    elements: [
      { id: 'ent_porte',      label: "Porte d'entrée",  options: OPT_PORTE,       hasNb: false },
      { id: 'ent_pateres',    label: 'Patères',           options: OPT_PATERES,     hasNb: true  },
      { id: 'ent_mur',        label: 'Mur',               options: OPT_MUR,         hasNb: false },
      { id: 'ent_sol',        label: 'Sol',               options: OPT_SOL,         hasNb: false },
      { id: 'ent_interrupteur', label: 'Interrupteur',  options: OPT_INTERRUPTEUR,  hasNb: false },
      { id: 'ent_lumiere',    label: 'Éclairage',        options: OPT_LUMIERE,     hasNb: false },
      { id: 'ent_boite_aux_lettres', label: 'Boîte aux lettres', options: OPT_MEUBLE, hasNb: false },
    ],
  },
];

// ── Demo data ─────────────────────────────────────────────────────────────────

const DEMO_PHOTOS: Record<string, string> = {
  pp_porte:    'https://images.pexels.com/photos/277559/pexels-photo-277559.jpeg?w=160&h=120&fit=crop',
  pp_mur:      'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?w=160&h=120&fit=crop',
  pp_sol:      'https://images.pexels.com/photos/1080696/pexels-photo-1080696.jpeg?w=160&h=120&fit=crop',
  pp_fenetre:  'https://images.pexels.com/photos/276724/pexels-photo-276724.jpeg?w=160&h=120&fit=crop',
  sdb_cabine:  'https://images.pexels.com/photos/1358900/pexels-photo-1358900.jpeg?w=160&h=120&fit=crop',
  sdb_mur:     'https://images.pexels.com/photos/2631746/pexels-photo-2631746.jpeg?w=160&h=120&fit=crop',
  cui_plaques: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?w=160&h=120&fit=crop',
  cui_frigo:   'https://images.pexels.com/photos/3935326/pexels-photo-3935326.jpeg?w=160&h=120&fit=crop',
};

export const DEMO_EDL_HISTORY: EdlColumnData[] = [
  {
    edlId: 'hist-1', type: 'entrant', date: '2024-09-01',
    occupantNom: 'Bertrand', occupantPrenom: 'Camille',
    observations: {
      pp_porte: ['en état'], pp_pateres: ['en état'], pp_mur: ['en état'],
      pp_plafond: ['en état'], pp_sol: ['en état'], pp_interrupteur: ['en état'],
      pp_lum_couloir: ['en état'], pp_lum_bureau: ['en état'], pp_lum_chevet: ['en état'],
      pp_prise_reseau: ['en état'], pp_prise_elec: ['en état'], pp_detecteur: ['en place'],
      pp_fenetre: ['en état'], pp_vitre: ['en état'], pp_volet: ['en état'],
      pp_rebord: ['en état'], pp_radiateur: ['en état'], sdb_porte: ['en état'],
      sdb_barre_seuil: ['en état'], sdb_cabine: ['en état'], sdb_mur: ['en état'],
      sdb_sol: ['en état'], cui_plaques: ['en état'], cui_frigo: ['en état'],
      cui_four: ['en état'], cui_evier: ['en état'], cui_plan_travail: ['en état'],
    },
    nb: { pp_pateres: '2' },
    photos: { pp_porte: DEMO_PHOTOS.pp_porte, pp_mur: DEMO_PHOTOS.pp_mur, sdb_cabine: DEMO_PHOTOS.sdb_cabine, cui_plaques: DEMO_PHOTOS.cui_plaques },
    observations_text: {},
  },
  {
    edlId: 'hist-2', type: 'sortant', date: '2025-06-30',
    occupantNom: 'Bertrand', occupantPrenom: 'Camille',
    observations: {
      pp_porte: ['en état'], pp_pateres: ['en état'], pp_mur: ['tâché/sale', 'à repeindre'],
      pp_plafond: ['en état'], pp_sol: ['accrocs/trous/brûlures'], pp_interrupteur: ['en état'],
      pp_lum_couloir: ['en état'], pp_lum_bureau: ['à changer'], pp_lum_chevet: ['en état'],
      pp_prise_reseau: ['en état'], pp_prise_elec: ['à refixer'], pp_detecteur: ['en place'],
      pp_fenetre: ['en état'], pp_vitre: ['en état'], pp_volet: ['dégradé'],
      pp_rebord: ['brûlures/cigarettes'], pp_radiateur: ['en état'], sdb_porte: ['en état'],
      sdb_barre_seuil: ['manquantes'], sdb_cabine: ['accrocs', 'rayures'],
      sdb_mur: ['tâché/sale'], sdb_sol: ['en état'], cui_plaques: ['à nettoyer'],
      cui_frigo: ['à nettoyer'], cui_four: ['ne fonctionne pas'], cui_evier: ['en état'],
      cui_plan_travail: ['tâché', 'brûlures'],
    },
    nb: { pp_pateres: '2' },
    photos: { pp_mur: DEMO_PHOTOS.pp_mur, pp_sol: DEMO_PHOTOS.pp_sol, sdb_cabine: DEMO_PHOTOS.sdb_cabine, sdb_mur: DEMO_PHOTOS.sdb_mur, cui_plaques: DEMO_PHOTOS.cui_plaques },
    observations_text: { pp_mur: 'Tâches importantes côté fenêtre', pp_sol: 'Brûlure de cigarette près du bureau' },
  },
  {
    edlId: 'hist-3', type: 'entrant', date: '2025-09-02',
    occupantNom: 'Martin', occupantPrenom: 'Emma',
    observations: {
      pp_porte: ['en état'], pp_pateres: ['en état'], pp_mur: ['en état'],
      pp_plafond: ['en état'], pp_sol: ['en état'], pp_interrupteur: ['en état'],
      pp_lum_couloir: ['en état'], pp_lum_bureau: ['en état'], pp_lum_chevet: ['à changer'],
      pp_prise_reseau: ['en état'], pp_prise_elec: ['en état'], pp_detecteur: ['en place'],
      pp_fenetre: ['en état'], pp_vitre: ['en état'], pp_volet: ['en état'],
      pp_rebord: ['en état'], pp_radiateur: ['en état'], sdb_porte: ['en état'],
      sdb_barre_seuil: ['en état'], sdb_cabine: ['en état'], sdb_mur: ['en état'],
      sdb_sol: ['en état'], cui_plaques: ['en état'], cui_frigo: ['en état'],
      cui_four: ['en état'], cui_evier: ['en état'], cui_plan_travail: ['en état'],
    },
    nb: { pp_pateres: '2' },
    photos: { pp_porte: DEMO_PHOTOS.pp_porte, pp_mur: DEMO_PHOTOS.pp_mur, pp_fenetre: DEMO_PHOTOS.pp_fenetre, sdb_cabine: DEMO_PHOTOS.sdb_cabine, cui_frigo: DEMO_PHOTOS.cui_frigo },
    observations_text: { pp_lum_chevet: "Ampoule grillée notée à l'entrée" },
  },
];

export const CURRENT_PRE_EDL: EdlColumnData = {
  edlId: 'current', type: 'pre_sortant', date: '2026-05-12',
  occupantNom: 'Martin', occupantPrenom: 'Emma',
  observations: {
    pp_porte: ['en état'], pp_pateres: ['en état'], pp_mur: ['tâché/sale'],
    pp_plafond: ['en état'], pp_sol: ['en état'], pp_interrupteur: ['en état'],
    pp_lum_couloir: ['en état'], pp_lum_bureau: ['en état'], pp_lum_chevet: ['à changer'],
    pp_prise_reseau: ['en état'], pp_prise_elec: ['en état'], pp_detecteur: ['en place'],
    pp_fenetre: ['en état'], pp_vitre: ['vitre fissurée'], pp_volet: ['en état'],
    pp_rebord: ['en état'], pp_radiateur: ['en état'], sdb_porte: ['en état'],
    sdb_barre_seuil: ['en état'], sdb_cabine: ['trous', 'fissures/éclats'],
    sdb_mur: ['tâché/sale'], sdb_sol: ['en état'], cui_plaques: ['à nettoyer'],
    cui_frigo: ['en état'], cui_four: ['en état'], cui_evier: ['en état'],
    cui_plan_travail: ['brûlures'],
  },
  nb: { pp_pateres: '2' },
  photos: { pp_mur: DEMO_PHOTOS.pp_mur, sdb_cabine: DEMO_PHOTOS.sdb_cabine, cui_plaques: DEMO_PHOTOS.cui_plaques },
  observations_text: { pp_vitre: 'Fissure constatée lors du Pré-EDL', sdb_cabine: 'Trou et fissure bord gauche' },
};

// ── Types ─────────────────────────────────────────────────────────────────────

const TYPE_CFG = {
  entrant:     { label: 'Entrée',   bg: 'bg-blue-600',   text: 'text-white',      icon: <ClipboardCheck className="w-3 h-3" /> },
  sortant:     { label: 'Sortie',   bg: 'bg-orange-500', text: 'text-white',      icon: <ClipboardX className="w-3 h-3" /> },
  pre_sortant: { label: 'Pré-EDL', bg: 'bg-amber-400',  text: 'text-amber-900', icon: <CalendarClock className="w-3 h-3" /> },
};

const DEGRADED_OPTIONS = new Set([
  'à nettoyer', 'pb poignée', 'trou', 'à repeindre', 'pb joint', 'pb serrure',
  'manquant', 'manquantes', 'à changer', 'à refixer',
  'tâché/sale', 'abîmé/trous', 'accrocs/trous/brûlures', 'à remplacer',
  'absent', 'vitre fissurée', 'dégradé', 'ne fonctionne pas',
  'brûlures/cigarettes', 'fuite', 'cassé', 'abîmé',
  'décollée', 'tâchée', 'accrocs', 'rayures', 'brûlures', 'dégradé/tâché',
  'fissures/éclats', 'trous', 'fissures', 'filtre à changer', 'tâché',
]);

// ── Draw modal ────────────────────────────────────────────────────────────────

function DrawModal({ imageSrc, onClose, onSave }: {
  imageSrc: string;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const drawing    = useRef(false);
  const lastPos    = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState('#ef4444');
  const [size,  setSize]  = useState(3);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const onDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    lastPos.current = getPos(e);
  };

  const onMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth   = size;
    ctx.lineCap     = 'round';
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const onUp = () => { drawing.current = false; lastPos.current = null; };

  const handleSave = () => {
    if (!canvasRef.current) return;
    onSave(canvasRef.current.toDataURL('image/png'));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <PenLine className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-bold text-slate-700">Annoter la photo</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {['#ef4444','#f97316','#3b82f6','#10b981','#000000'].map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-slate-800 scale-110' : 'border-white shadow'}`}
                  style={{ background: c }} />
              ))}
            </div>
            <input type="range" min={1} max={10} value={size} onChange={e => setSize(+e.target.value)} className="w-20 accent-blue-500" />
            <span className="text-xs text-slate-500">{size}px</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <div className="relative bg-black/5 flex items-center justify-center p-2">
          <img src={imageSrc} alt="" className="max-h-80 max-w-full rounded object-contain opacity-0 absolute pointer-events-none" id="draw-base" />
          <canvas
            ref={canvasRef}
            width={600} height={400}
            className="rounded cursor-crosshair border border-slate-200 max-w-full"
            style={{ backgroundImage: `url(${imageSrc})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}
            onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
            onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
          />
        </div>
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-100">
          <button onClick={onClose} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Annuler</button>
          <button onClick={handleSave} className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  currentEdl?: EdlColumnData;
  history?: EdlColumnData[];
  /** If provided, the current column becomes editable */
  onCurrentChange?: (updated: EdlColumnData) => void;
  couts?: Record<string, boolean>;
  reparations?: Record<string, boolean>;
  onCoutsChange?: (c: Record<string, boolean>) => void;
  onReparationsChange?: (r: Record<string, boolean>) => void;
}

export default function EdlComparaison({ currentEdl = CURRENT_PRE_EDL, history = DEMO_EDL_HISTORY, onCurrentChange, couts = {}, reparations = {}, onCoutsChange, onReparationsChange }: Props) {
  // Merge current edl with local editable state
  const [localCurrent, setLocalCurrent] = useState<EdlColumnData>(() => ({ ...currentEdl }));
  const current = onCurrentChange ? localCurrent : currentEdl;

  const updateCurrent = useCallback((updater: (prev: EdlColumnData) => EdlColumnData) => {
    setLocalCurrent(prev => {
      const next = updater(prev);
      onCurrentChange?.(next);
      return next;
    });
  }, [onCurrentChange]);

  const toggleObs = (elId: string, opt: ObservationOption) => {
    if (!onCurrentChange) return;
    updateCurrent(prev => {
      const sel = prev.observations[elId] ?? [];
      const next = sel.includes(opt) ? sel.filter(o => o !== opt) : [...sel, opt];
      return { ...prev, observations: { ...prev.observations, [elId]: next } };
    });
  };

  const setPhoto = (elId: string, url: string) => {
    if (!onCurrentChange) return;
    updateCurrent(prev => ({ ...prev, photos: { ...prev.photos, [elId]: url } }));
  };

  const allColumns: EdlColumnData[] = [...history].sort((a, b) => a.date.localeCompare(b.date)).concat([current]);

  // Completeness score: % of ALL elements that have at least one observation in the current EDL
  const completeness = useMemo(() => {
    const allElements = PIECES.flatMap(p => p.elements);
    const filled = allElements.filter(el => (current.observations[el.id] ?? []).length > 0).length;
    return Math.round((filled / allElements.length) * 100);
  }, [current.observations]);

  const [rightIdx, setRightIdx] = useState(allColumns.length - 1);
  const leftIdx = rightIdx - 1;
  const leftCol = leftIdx >= 0 ? allColumns[leftIdx] : null;
  const rightCol = allColumns[rightIdx];
  const isCurrentRight = rightIdx === allColumns.length - 1;

  const canGoLeft  = rightIdx > 1 || (leftIdx >= 0 && rightIdx > 0);
  const canGoRight = rightIdx < allColumns.length - 1;

  const [activePiece, setActivePiece] = useState('all');
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [drawTarget, setDrawTarget]   = useState<{ elId: string; src: string } | null>(null);

  const visiblePieces = activePiece === 'all' ? PIECES : PIECES.filter(p => p.id === activePiece);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUploadId = useRef<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !pendingUploadId.current) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (pendingUploadId.current) {
        setPhoto(pendingUploadId.current, ev.target!.result as string);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Piece filter bar */}
      <div className="flex items-center gap-3 px-1 py-2.5 border-b border-slate-100 flex-shrink-0 flex-wrap gap-y-2">
        <div className="flex items-center gap-1 flex-wrap">
          <button onClick={() => setActivePiece('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${activePiece === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
            Toutes les pièces
          </button>
          {PIECES.map(p => (
            <button key={p.id} onClick={() => setActivePiece(p.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${activePiece === p.id ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-400">{allColumns.length} EDL au total</span>
          <button onClick={() => setRightIdx(i => i - 1)} disabled={!canGoLeft}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-600 font-semibold min-w-20 text-center">
            {leftCol ? `EDL ${leftIdx + 1}` : '—'} / EDL {rightIdx + 1}
          </span>
          <button onClick={() => setRightIdx(i => i + 1)} disabled={!canGoRight}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Completeness banner */}
      <EdlCompletenessBar score={completeness} current={current} />

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-xs" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '160px' }} />
            <col style={{ width: '40px' }} />
            <col />
            <col style={{ width: '120px' }} />
            <col style={{ width: '120px' }} />
            <col />
            <col style={{ width: '40px' }} />
            <col style={{ width: '52px' }} />
            <col style={{ width: '72px' }} />
          </colgroup>

          <thead className="sticky top-0 z-20">
            <tr>
              <th className="bg-slate-100 border border-slate-300 px-3 py-2 text-center text-xs font-bold text-slate-700 align-middle" rowSpan={2}>
                Éléments
              </th>
              <th className="bg-slate-100 border border-slate-300 px-1 py-1 text-center text-[10px] font-semibold text-slate-500 align-middle">NB</th>
              <th colSpan={2} className={`border border-slate-300 px-3 py-2 text-center align-middle ${leftCol ? TYPE_CFG[leftCol.type].bg : 'bg-slate-200'} ${leftCol ? TYPE_CFG[leftCol.type].text : 'text-slate-400'}`}>
                {leftCol ? (
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-center gap-1.5 font-bold text-xs">
                      {TYPE_CFG[leftCol.type].icon}
                      <span>EDL {TYPE_CFG[leftCol.type].label}</span>
                    </div>
                    <div className="text-[11px] opacity-90 font-semibold">
                      {new Date(leftCol.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="text-[10px] opacity-80">{leftCol.occupantPrenom} {leftCol.occupantNom}</div>
                  </div>
                ) : <span className="text-slate-400 text-xs">—</span>}
              </th>
              <th colSpan={2} className={`border border-slate-300 px-3 py-2 text-center align-middle ${TYPE_CFG[rightCol.type].bg} ${TYPE_CFG[rightCol.type].text}`}>
                <div className="space-y-0.5">
                  <div className="flex items-center justify-center gap-1.5 font-bold text-xs">
                    {TYPE_CFG[rightCol.type].icon}
                    <span>EDL {TYPE_CFG[rightCol.type].label}</span>
                    {isCurrentRight && (
                      <span className="text-[9px] bg-white/30 px-1 py-0.5 rounded font-semibold">En cours</span>
                    )}
                  </div>
                  <div className="text-[11px] opacity-90 font-semibold">
                    {new Date(rightCol.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="text-[10px] opacity-80">{rightCol.occupantPrenom} {rightCol.occupantNom}</div>
                </div>
              </th>
              <th className="bg-slate-100 border border-slate-300 px-1 py-1 text-center text-[10px] font-semibold text-slate-500 align-middle">NB</th>
              <th className="bg-amber-50 border border-slate-300 px-1 py-1 text-center text-[10px] font-bold text-amber-700 align-middle" rowSpan={2}>Coût</th>
              <th className="bg-red-50 border border-slate-300 px-1 py-1 text-center text-[10px] font-bold text-red-700 align-middle" rowSpan={2}>Réparation</th>
            </tr>
            <tr>
              <th className="bg-slate-50 border border-slate-200 px-1 py-1 text-center text-[9px] text-slate-400"> </th>
              {/* Left observations subheader */}
              <th className="bg-slate-50 border border-slate-200 px-2 py-1 text-center text-[10px] font-semibold text-slate-500">
                {leftIdx >= 0 && leftIdx < allColumns.length - 1 ? 'État à cette date' : 'État actuel'}
              </th>
              <th className="bg-slate-50 border border-slate-200 px-1 py-1 text-center text-[10px] font-semibold text-slate-500">
                <Camera className="w-3 h-3 mx-auto text-slate-400" />
              </th>
              <th className="bg-slate-50 border border-slate-200 px-1 py-1 text-center text-[10px] font-semibold text-slate-500">
                <Camera className="w-3 h-3 mx-auto text-slate-400" />
              </th>
              {/* Right observations subheader */}
              <th className="bg-slate-50 border border-slate-200 px-2 py-1 text-center text-[10px] font-semibold text-slate-500">
                {isCurrentRight ? 'État actuel' : 'État à cette date'}
              </th>
              <th className="bg-slate-50 border border-slate-200 px-1 py-1 text-center text-[9px] text-slate-400"> </th>
            </tr>
          </thead>

          <tbody>
            {visiblePieces.map(piece => (
              <React.Fragment key={piece.id}>
                <tr>
                  <td colSpan={9} className="bg-slate-700 text-white font-bold text-xs px-4 py-2 tracking-wide uppercase border border-slate-600">
                    {piece.label}
                  </td>
                </tr>

                {piece.elements.map((el, elIdx) => {
                  const leftObs  = leftCol?.observations[el.id] ?? [];
                  const rightObs = (isCurrentRight ? current : rightCol).observations[el.id] ?? [];
                  const leftPhoto  = leftCol?.photos[el.id] ?? null;
                  const rightPhoto = (isCurrentRight ? current : rightCol).photos[el.id] ?? null;
                  const leftNb  = el.hasNb ? (leftCol?.nb[el.id] ?? '') : null;
                  const rightNb = el.hasNb ? ((isCurrentRight ? current : rightCol).nb[el.id] ?? '') : null;
                  const leftNote  = leftCol?.observations_text[el.id] ?? '';
                  const rightNote = (isCurrentRight ? current : rightCol).observations_text[el.id] ?? '';

                  const isDegraded = rightObs.some(o => DEGRADED_OPTIONS.has(o)) && !leftObs.every(o => DEGRADED_OPTIONS.has(o));
                  const rowBg = elIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';

                  return (
                    <tr key={el.id} className={`${rowBg} ${isDegraded ? 'ring-inset ring-1 ring-orange-200' : ''} transition-colors`}>
                      <td className={`border border-slate-200 px-3 py-2 font-semibold text-slate-900 align-top ${isDegraded ? 'bg-orange-50/60' : ''}`}>
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-black">{el.label}</span>
                          {isDegraded && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1 flex-shrink-0" />}
                        </div>
                      </td>

                      {/* NB left */}
                      <td className="border border-slate-200 px-1 py-2 text-center text-slate-500 align-top">
                        {leftNb !== null ? <span className="text-xs">{leftNb}</span> : null}
                      </td>

                      {/* Left observations */}
                      <td className="border border-slate-200 px-2 py-2 align-top">
                        {leftCol ? (
                          <ObservationCell opts={el.options} selected={leftObs} note={leftNote} readonly />
                        ) : (
                          <span className="text-slate-300 text-xs italic">—</span>
                        )}
                      </td>

                      {/* Left photo */}
                      <td className="border border-slate-200 px-1.5 py-1.5 align-top">
                        {leftPhoto ? (
                          <PhotoThumb src={leftPhoto} alt={el.label} onExpand={() => setLightboxSrc(leftPhoto)} />
                        ) : <EmptyPhotoReadonly />}
                      </td>

                      {/* Right photo — editable if current */}
                      <td className="border border-slate-200 px-1.5 py-1.5 align-top">
                        {isCurrentRight ? (
                          <EditablePhoto
                            src={rightPhoto}
                            alt={el.label}
                            onExpand={() => rightPhoto && setLightboxSrc(rightPhoto)}
                            onAdd={() => {
                              pendingUploadId.current = el.id;
                              fileInputRef.current?.click();
                            }}
                            onDraw={() => rightPhoto && setDrawTarget({ elId: el.id, src: rightPhoto })}
                          />
                        ) : rightPhoto ? (
                          <PhotoThumb src={rightPhoto} alt={el.label} onExpand={() => setLightboxSrc(rightPhoto)} />
                        ) : <EmptyPhotoReadonly />}
                      </td>

                      {/* Right observations — editable if current */}
                      <td className={`border border-slate-200 px-2 py-2 align-top ${isDegraded ? 'bg-orange-50/40' : ''}`}>
                        {isCurrentRight && onCurrentChange ? (
                          <EditableObsCell
                            opts={el.options}
                            selected={rightObs}
                            note={rightNote}
                            onToggle={opt => toggleObs(el.id, opt)}
                          />
                        ) : (
                          <ObservationCell opts={el.options} selected={rightObs} note={rightNote} readonly highlight />
                        )}
                      </td>

                      {/* NB right */}
                      <td className="border border-slate-200 px-1 py-2 text-center text-slate-500 align-top">
                        {rightNb !== null ? (
                          isCurrentRight && onCurrentChange ? (
                            <input
                              type="number"
                              min={0}
                              value={rightNb}
                              onChange={e => updateCurrent(prev => ({ ...prev, nb: { ...prev.nb, [el.id]: e.target.value } }))}
                              className="w-10 text-xs text-center border border-slate-200 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 bg-white"
                            />
                          ) : (
                            <span className="text-xs">{rightNb}</span>
                          )
                        ) : null}
                      </td>

                      {/* Coût checkbox */}
                      <td className="border border-slate-200 px-1 py-2 text-center align-middle bg-amber-50/30">
                        {isCurrentRight && onCurrentChange ? (
                          <input type="checkbox"
                            checked={!!couts[el.id]}
                            onChange={e => onCoutsChange?.({ ...couts, [el.id]: e.target.checked })}
                            className="w-4 h-4 accent-amber-500 cursor-pointer" />
                        ) : (
                          couts[el.id] ? <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> : null
                        )}
                      </td>

                      {/* Réparation checkbox */}
                      <td className="border border-slate-200 px-1 py-2 text-center align-middle bg-red-50/30">
                        {isCurrentRight && onCurrentChange ? (
                          <input type="checkbox"
                            checked={!!reparations[el.id]}
                            onChange={e => onReparationsChange?.({ ...reparations, [el.id]: e.target.checked })}
                            className="w-4 h-4 accent-red-500 cursor-pointer" />
                        ) : (
                          reparations[el.id] ? <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> : null
                        )}
                      </td>
                    </tr>
                  );
                })}

                <tr>
                  <td className="border border-slate-200 px-3 py-2 text-xs text-slate-500 italic bg-slate-50 font-medium">Observations</td>
                  <td className="border border-slate-200" />
                  <td colSpan={2} className="border border-slate-200 px-3 py-2 text-xs text-slate-500 italic bg-slate-50" />
                  <td colSpan={2} className="border border-slate-200 px-3 py-2 text-xs text-slate-500 italic bg-slate-50" />
                  <td className="border border-slate-200" />
                  <td className="border border-slate-200 bg-amber-50/20" />
                  <td className="border border-slate-200 bg-red-50/20" />
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Timeline */}
      <div className="flex-shrink-0 border-t border-slate-100 bg-white px-4 py-2 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs text-slate-400 font-semibold flex-shrink-0">Chronologie :</span>
        {allColumns.map((col, i) => {
          const cfg = TYPE_CFG[col.type];
          const isLeft  = i === leftIdx;
          const isRight = i === rightIdx;
          return (
            <button key={col.edlId}
              onClick={() => setRightIdx(i === 0 ? 1 : i)}
              className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg border transition-all text-[10px] font-semibold ${
                isRight ? `${cfg.bg} ${cfg.text} border-transparent shadow-sm` :
                isLeft  ? 'bg-slate-100 text-slate-700 border-slate-200' :
                'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
              }`}>
              <span className="flex items-center gap-1">{cfg.icon}{cfg.label}</span>
              <span className="opacity-80">{new Date(col.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
              <span className="opacity-70 font-normal">{col.occupantPrenom} {col.occupantNom}</span>
            </button>
          );
        })}
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Draw modal */}
      {drawTarget && (
        <DrawModal
          imageSrc={drawTarget.src}
          onClose={() => setDrawTarget(null)}
          onSave={url => { setPhoto(drawTarget.elId, url); setDrawTarget(null); }}
        />
      )}

      {/* Lightbox */}
      {lightboxSrc && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setLightboxSrc(null)}>
          <button className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors" onClick={() => setLightboxSrc(null)}>
            <X className="w-5 h-5" />
          </button>
          <img src={lightboxSrc} alt="Photo EDL" className="max-w-3xl max-h-[80vh] rounded-xl shadow-2xl object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}

// ── Completeness banner ───────────────────────────────────────────────────────

function EdlCompletenessBar({ score, current }: { score: number; current: EdlColumnData }) {
  const colors = completenessColors(score);
  const allElements = PIECES.flatMap(p => p.elements);
  const filledCount = allElements.filter(el => (current.observations[el.id] ?? []).length > 0).length;
  const totalCount  = allElements.length;

  const chips = allElements.map(el => {
    const filled = (current.observations[el.id] ?? []).length > 0;
    return { id: el.id, label: el.label, filled };
  });

  const chipsRef = useRef<HTMLDivElement>(null);
  const scrollChips = (dir: 'left' | 'right') => {
    if (chipsRef.current) chipsRef.current.scrollBy({ left: dir === 'left' ? -120 : 120, behavior: 'smooth' });
  };

  return (
    <div className={`flex-shrink-0 px-4 py-2 border-b border-t ${colors.banner} flex items-center gap-3`}>
      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${colors.icon}`} />
      <span className={`text-xs font-bold flex-shrink-0 ${colors.text}`}>{score}%</span>
      <div className={`w-20 h-1.5 rounded-full flex-shrink-0 overflow-hidden ${colors.track}`}>
        <div className={`h-full rounded-full transition-all duration-500 ${colors.bar}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-[11px] font-semibold flex-shrink-0 ${colors.text}`}>
        {score === 100 ? 'Checklist complète' : `${filledCount} / ${totalCount} éléments renseignés`}
      </span>
      <button onClick={() => scrollChips('left')} className={`flex-shrink-0 p-0.5 rounded hover:bg-black/10 transition-colors ${colors.icon}`}>
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      <div ref={chipsRef} className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1" style={{ scrollbarWidth: 'none' }}>
        {chips.map(chip => (
          <span key={chip.id} className={`flex-shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${
            chip.filled
              ? `${colors.track} ${colors.text} border-transparent`
              : 'bg-white/70 text-slate-400 border-slate-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${chip.filled ? colors.bar : 'bg-slate-300'}`} />
            {chip.label}
          </span>
        ))}
      </div>
      <button onClick={() => scrollChips('right')} className={`flex-shrink-0 p-0.5 rounded hover:bg-black/10 transition-colors ${colors.icon}`}>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** Read-only observation badges displayed in past EDL columns */
function ObservationCell({ opts, selected, note, highlight }: {
  opts: ObservationOption[];
  selected: ObservationOption[];
  note?: string;
  readonly?: boolean;
  highlight?: boolean;
}) {
  // Display in 3-column grid
  const cols = 3;
  return (
    <div className="space-y-1">
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
        {opts.map(opt => {
          const isSelected = selected.includes(opt);
          const isBad  = isSelected && DEGRADED_OPTIONS.has(opt);
          const isGood = isSelected && !DEGRADED_OPTIONS.has(opt);
          return (
            <span key={opt} className={`inline-flex items-center gap-1 text-xs px-1 py-0.5 rounded border leading-tight ${
              isBad  ? 'bg-orange-100 text-orange-800 border-orange-300 font-bold' :
              isGood ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold' :
              'text-slate-300 border-transparent font-normal'
            }`}>
              <span className={`w-3 h-3 rounded-sm border flex-shrink-0 ${
                isSelected ? (isBad ? 'bg-orange-500 border-orange-500' : 'bg-emerald-500 border-emerald-500') : 'bg-white border-slate-300'
              }`} />
              <span className="text-black leading-tight">{opt}</span>
            </span>
          );
        })}
      </div>
      {note && (
        <p className="text-[10px] italic text-slate-500 mt-0.5 leading-tight border-l-2 border-amber-300 pl-1.5">{note}</p>
      )}
    </div>
  );
}

/** Editable observation checkboxes for the current EDL column */
function EditableObsCell({ opts, selected, note, onToggle }: {
  opts: ObservationOption[];
  selected: ObservationOption[];
  note?: string;
  onToggle: (opt: ObservationOption) => void;
}) {
  const cols = 3;
  return (
    <div className="space-y-1">
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
        {opts.map(opt => {
          const isSelected = selected.includes(opt);
          const isBad  = isSelected && DEGRADED_OPTIONS.has(opt);
          const isGood = isSelected && !DEGRADED_OPTIONS.has(opt);
          return (
            <button key={opt} type="button" onClick={() => onToggle(opt)}
              className={`inline-flex items-center gap-1 text-xs px-1 py-0.5 rounded border leading-tight text-left transition-all hover:opacity-80 active:scale-95 ${
                isBad  ? 'bg-orange-100 text-orange-800 border-orange-300 font-bold' :
                isGood ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold' :
                'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}>
              <span className={`w-3 h-3 rounded-sm border flex-shrink-0 transition-all ${
                isSelected ? (isBad ? 'bg-orange-500 border-orange-500' : 'bg-emerald-500 border-emerald-500') : 'bg-white border-slate-300'
              }`} />
              <span className="text-black leading-tight">{opt}</span>
            </button>
          );
        })}
      </div>
      {note && (
        <p className="text-[10px] italic text-slate-500 mt-0.5 leading-tight border-l-2 border-amber-300 pl-1.5">{note}</p>
      )}
    </div>
  );
}

function PhotoThumb({ src, alt, onExpand }: { src: string; alt: string; onExpand: () => void }) {
  return (
    <button
      className="group relative w-full aspect-video rounded overflow-hidden border border-slate-200 hover:border-blue-400 transition-all block"
      onClick={onExpand}
      title="Agrandir la photo"
    >
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
        <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
      </div>
    </button>
  );
}

function EmptyPhotoReadonly() {
  return (
    <div className="w-full aspect-video rounded border-2 border-dashed border-slate-100 flex items-center justify-center">
      <Camera className="w-3.5 h-3.5 text-slate-200" />
    </div>
  );
}

/** Editable photo cell for the current EDL column */
function EditablePhoto({ src, alt, onExpand, onAdd, onDraw }: {
  src: string | null;
  alt: string;
  onExpand: () => void;
  onAdd: () => void;
  onDraw: () => void;
}) {
  if (src) {
    return (
      <div className="flex flex-col gap-1">
        <button
          className="group relative w-full aspect-video rounded overflow-hidden border border-slate-200 hover:border-blue-400 transition-all block"
          onClick={onExpand}
          title="Agrandir"
        >
          <img src={src} alt={alt} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
            <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
          </div>
        </button>
        <div className="flex gap-1">
          <button onClick={onAdd} title="Changer photo"
            className="flex-1 flex items-center justify-center gap-1 text-[9px] font-semibold py-0.5 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
            <Plus className="w-2.5 h-2.5" />Changer
          </button>
          <button onClick={onDraw} title="Annoter"
            className="flex-1 flex items-center justify-center gap-1 text-[9px] font-semibold py-0.5 rounded border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
            <PenLine className="w-2.5 h-2.5" />Préciser
          </button>
        </div>
      </div>
    );
  }
  return (
    <button onClick={onAdd}
      className="w-full aspect-video rounded border-2 border-dashed border-blue-200 flex flex-col items-center justify-center gap-1 hover:bg-blue-50 hover:border-blue-400 transition-colors cursor-pointer">
      <Plus className="w-4 h-4 text-blue-400" />
      <span className="text-[9px] text-blue-500 font-medium">Ajouter</span>
    </button>
  );
}
