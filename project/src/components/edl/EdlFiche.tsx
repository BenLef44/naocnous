import React, { useState } from 'react';
import {
  X, ClipboardCheck, ClipboardX, MapPin, Calendar, Building2,
  AlertTriangle, CheckCircle2,
  Download, Printer, GitCompare, Euro,
  Save, ChevronDown, Camera, Wrench, PenLine,
} from 'lucide-react';
import { EdlRecord, EdlType } from './edlTypes';
import EdlComparaison, {
  DEMO_EDL_HISTORY, CURRENT_PRE_EDL, PIECES, ObservationOption, EdlColumnData,
} from './EdlComparaison';
import { supabase } from '../../lib/supabase';
import LogementPickerWithOccupants, { type LogementSelection, type OccupantRow } from './LogementPickerWithOccupants';
import {
  CATEGORIES_DI, CRITICITE_CFG, FORFAITS,
  type ReparationDetail, makeBlankDetail,
} from './reparationTypes';
import SignatureModal from './SignatureModal';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EdlFicheData {
  id: string;
  type: EdlType;
  occupantId: string | null;
  occupantNom: string;
  occupantPrenom: string;
  occupantEmail: string;
  occupantTel: string;
  logementId: string | null;
  logementNumero: string;
  residenceNom: string;
  dateEdl: string;
  dateEntree: string;
  dateSortie: string;
  etablissement: string;
  agentNom: string;
  observations: Record<string, ObservationOption[]>;
  nb: Record<string, string>;
  notes: Record<string, string>;
  statut: 'brouillon' | 'signe' | 'valide';
  observations_generales: string;
  couts: Record<string, boolean>;
  reparations: Record<string, boolean>;
  coutsValeurs: Record<string, number>;
  signatureAgent: string | null;
  signatureOccupant: string | null;
}

interface Props {
  record?: EdlRecord | null;
  defaultType?: EdlType;
  onClose: () => void;
  onSaved?: () => void;
}

type ActiveTab = 'comparaison' | 'checklist' | 'reparations' | 'estimation' | 'infos' | 'document';

// ── Config ────────────────────────────────────────────────────────────────────

const TYPE_CFG_EDL = {
  entrant:     { label: 'Entrée',   icon: ClipboardCheck, bg: 'bg-blue-600',   headerBg: 'bg-blue-600',   accent: 'text-blue-600 border-blue-600' },
  sortant:     { label: 'Sortie',   icon: ClipboardX,     bg: 'bg-orange-500', headerBg: 'bg-orange-500', accent: 'text-orange-600 border-orange-600' },
  pre_sortant: { label: 'Pré-EDL', icon: ClipboardX,     bg: 'bg-amber-500',  headerBg: 'bg-amber-500',  accent: 'text-amber-600 border-amber-600' },
};

const STATUT_CFG = {
  brouillon: { label: 'Brouillon', bg: 'bg-slate-100',   text: 'text-slate-600'   },
  signe:     { label: 'Signé',     bg: 'bg-blue-50',     text: 'text-blue-700'    },
  valide:    { label: 'Validé',   bg: 'bg-emerald-50',  text: 'text-emerald-700' },
};

const DEGRADED = new Set([
  'à nettoyer','pb poignée','trou','à repeindre','pb joint','pb serrure',
  'manquant','manquantes','à changer','à refixer','tâché/sale','abîmé/trous',
  'accrocs/trous/brûlures','à remplacer','absent','vitre fissurée','dégradé',
  'ne fonctionne pas','brûlures/cigarettes','fuite','cassé','abîmé','décollée',
  'tâchée','accrocs','rayures','brûlures','dégradé/tâché',
  'fissures/éclats','trous','fissures','filtre à changer','tâché',
]);

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeBlankFiche(type: EdlType): EdlFicheData {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: `new-${Date.now()}`, type,
    occupantId: null, occupantNom: '', occupantPrenom: '', occupantEmail: '', occupantTel: '',
    logementId: null, logementNumero: '', residenceNom: '',
    dateEdl: today, dateEntree: '', dateSortie: '',
    etablissement: '', agentNom: 'Agent CROUS',
    observations: {}, nb: {}, notes: {},
    statut: 'brouillon', observations_generales: '',
    couts: {}, reparations: {}, coutsValeurs: {},
    signatureAgent: null, signatureOccupant: null,
  };
}

function ficheFromRecord(r: EdlRecord): EdlFicheData {
  return {
    id: r.id, type: r.type,
    occupantId: r.occupant_id, occupantNom: r.nom, occupantPrenom: r.prenom,
    occupantEmail: '', occupantTel: '',
    logementId: r.logement_id, logementNumero: r.logement_numero, residenceNom: r.residence_nom,
    dateEdl: r.date ?? new Date().toISOString().slice(0, 10),
    dateEntree: r.date_entree ?? '', dateSortie: r.date_sortie_prevue ?? '',
    etablissement: r.etablissement ?? '', agentNom: 'Agent CROUS',
    observations: {}, nb: {}, notes: {},
    statut: r.statut === 'realise' ? 'valide' : 'brouillon', observations_generales: '',
    couts: {}, reparations: {}, coutsValeurs: {},
    signatureAgent: null, signatureOccupant: null,
  };
}

/** Build EdlColumnData from current fiche observations, pre-seeded from last history entry */
function buildCurrentColumn(fiche: EdlFicheData, history: EdlColumnData[]): EdlColumnData {
  const lastHistory = history[history.length - 1];
  const observations: Record<string, ObservationOption[]> = {};
  // Pre-fill from last history if no local observations
  for (const piece of PIECES) {
    for (const el of piece.elements) {
      if (fiche.observations[el.id]?.length) {
        observations[el.id] = fiche.observations[el.id];
      } else if (lastHistory?.observations[el.id]?.length) {
        observations[el.id] = lastHistory.observations[el.id];
      }
    }
  }
  const typeMap: Record<EdlType, EdlColumnData['type']> = {
    entrant: 'entrant', sortant: 'sortant', pre_sortant: 'pre_sortant',
  };
  return {
    edlId: fiche.id,
    type: typeMap[fiche.type] ?? 'entrant',
    date: fiche.dateEdl,
    occupantNom: fiche.occupantNom,
    occupantPrenom: fiche.occupantPrenom,
    observations,
    nb: fiche.nb,
    photos: {},
    observations_text: fiche.notes,
  };
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EdlFiche({ record, defaultType = 'entrant', onClose, onSaved }: Props) {
  const isNew = !record;
  const [fiche, setFiche]         = useState<EdlFicheData>(record ? ficheFromRecord(record) : makeBlankFiche(defaultType));
  const [activeTab, setActiveTab] = useState<ActiveTab>('infos');
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [activePiece, setActivePiece] = useState('all');

  function setObs(elementId: string, opt: ObservationOption) {
    setFiche(f => {
      const current = f.observations[elementId] ?? [];
      const next = current.includes(opt) ? current.filter(o => o !== opt) : [...current, opt];
      return { ...f, observations: { ...f.observations, [elementId]: next } };
    });
  }

  function handleCurrentEdlChange(updated: EdlColumnData) {
    setFiche(f => ({ ...f, observations: updated.observations, nb: updated.nb, notes: updated.observations_text }));
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      type: fiche.type,
      occupant_id: fiche.occupantId || null,
      logement_id: fiche.logementId || null,
      logement_numero: fiche.logementNumero || null,
      residence_nom: fiche.residenceNom || null,
      occupant_nom: fiche.occupantNom || null,
      occupant_prenom: fiche.occupantPrenom || null,
      occupant_email: fiche.occupantEmail || null,
      occupant_tel: fiche.occupantTel || null,
      etablissement: fiche.etablissement || null,
      date_edl: fiche.dateEdl || null,
      date_entree: fiche.dateEntree || null,
      date_sortie: fiche.dateSortie || null,
      agent_nom: fiche.agentNom || null,
      statut: 'valide',
      observations: fiche.observations,
      nb: fiche.nb,
      notes: fiche.notes,
      couts: fiche.couts,
      reparations: fiche.reparations,
      couts_valeurs: fiche.coutsValeurs,
      observations_generales: fiche.observations_generales || null,
      signature_agent: fiche.signatureAgent || null,
      signature_occupant: fiche.signatureOccupant || null,
    };
    const isExisting = fiche.id && !fiche.id.startsWith('new-');
    if (isExisting) {
      await supabase.from('edl_fiches').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', fiche.id);
    } else {
      const { data } = await supabase.from('edl_fiches').insert(payload).select('id').single();
      if (data?.id) setFiche(f => ({ ...f, id: data.id }));
    }
    if (fiche.occupantId) {
      const field = fiche.type === 'entrant'
        ? { statut_edl_entrant: 'realise', date_edl_entrant: fiche.dateEdl }
        : { statut_edl_sortant: 'realise', date_edl_sortant: fiche.dateEdl };
      await supabase.from('occupants').update(field).eq('id', fiche.occupantId);
    }
    setSaving(false);
    setSaved(true);
    setFiche(f => ({ ...f, statut: 'valide' }));
    setTimeout(() => { onSaved?.(); }, 1200);
  }

  const cfg = TYPE_CFG_EDL[fiche.type];
  const TypeIcon = cfg.icon;
  const statutCfg = STATUT_CFG[fiche.statut];
  const anomaliesCount = Object.values(fiche.observations).flat().filter(o => DEGRADED.has(o)).length;

  const TABS: { id: ActiveTab; label: string; icon?: React.ReactNode }[] = [
    { id: 'infos',        label: 'Informations' },
    { id: 'comparaison',  label: 'Checklist avec comparaison', icon: <GitCompare className="w-3.5 h-3.5" /> },
    { id: 'checklist',    label: 'Checklist sans comparaison' },
    { id: 'reparations',  label: 'Réparations' },
    { id: 'estimation',   label: 'Estimation des coûts', icon: <Euro className="w-3.5 h-3.5" /> },
    { id: 'document',     label: 'Document' },
  ];

  const isWide = activeTab === 'comparaison';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full mx-4 flex flex-col overflow-hidden transition-all ${isWide ? 'max-w-7xl max-h-[95vh]' : 'max-w-5xl max-h-[92vh]'}`}>

        {/* Header */}
        <div className={`${cfg.headerBg} px-6 py-4 flex items-center gap-4 flex-shrink-0`}>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <TypeIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white/80 uppercase tracking-widest">
                État des Lieux {cfg.label}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-1" />
                {statutCfg.label}
              </span>
            </div>
            <h2 className="text-base font-bold text-white mt-0.5">
              {fiche.occupantPrenom || fiche.occupantNom
                ? `${fiche.occupantPrenom} ${fiche.occupantNom}`
                : isNew ? 'Nouvel état des lieux' : '—'}
              {fiche.logementNumero && <span className="font-normal opacity-80"> — {fiche.logementNumero}</span>}
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!saved ? (
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60">
                {saving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white bg-white/20 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enregistré
              </div>
            )}
            <button className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors">
              <Printer className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-6 text-xs flex-wrap gap-y-1 flex-shrink-0">
          {fiche.residenceNom && <span className="flex items-center gap-1.5 text-slate-600"><MapPin className="w-3 h-3 text-slate-400" />{fiche.residenceNom}</span>}
          {fiche.logementNumero && <span className="flex items-center gap-1.5 text-slate-600"><Building2 className="w-3 h-3 text-slate-400" />{fiche.logementNumero}</span>}
          {fiche.dateEdl && <span className="flex items-center gap-1.5 text-slate-600"><Calendar className="w-3 h-3 text-slate-400" />{new Date(fiche.dateEdl).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>}
          {anomaliesCount > 0 && (
            <span className="flex items-center gap-1.5 text-orange-700 font-semibold bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full ml-auto">
              <AlertTriangle className="w-3 h-3" />{anomaliesCount} observation{anomaliesCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="px-4 border-b border-slate-100 flex items-center gap-0 flex-shrink-0 bg-white overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-all -mb-px whitespace-nowrap ${
                activeTab === t.id ? `border-current ${cfg.accent}` : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}>
              {t.icon}
              {t.id === 'checklist' && anomaliesCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
              {t.id === 'reparations' && Object.values(fiche.reparations).filter(Boolean).length > 0 && (
                <span className="text-[9px] font-bold bg-orange-500 text-white rounded-full px-1.5 py-0.5 min-w-[16px] text-center">
                  {Object.values(fiche.reparations).filter(Boolean).length}
                </span>
              )}
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-hidden ${activeTab === 'comparaison' || activeTab === 'checklist' ? 'flex flex-col' : 'overflow-y-auto'}`}>
          {activeTab === 'comparaison' && (
            <div className="flex-1 overflow-hidden flex flex-col px-4 py-2">
              <EdlComparaison
                history={DEMO_EDL_HISTORY}
                currentEdl={buildCurrentColumn(fiche, DEMO_EDL_HISTORY)}
                onCurrentChange={handleCurrentEdlChange}
                couts={fiche.couts}
                reparations={fiche.reparations}
                onCoutsChange={c => setFiche(f => ({ ...f, couts: c }))}
                onReparationsChange={r => setFiche(f => ({ ...f, reparations: r }))}
              />
            </div>
          )}
          {activeTab === 'checklist' && (
            <ChecklistTab fiche={fiche} setObs={setObs} setFiche={setFiche} activePiece={activePiece} setActivePiece={setActivePiece} />
          )}
          {activeTab === 'reparations' && <ReparationsTab fiche={fiche} />}
          {activeTab === 'estimation'  && <EstimationTab  fiche={fiche} setFiche={setFiche} />}
          {/* InfosTab always mounted to preserve LogementPickerWithOccupants state */}
          <div className={activeTab === 'infos' ? '' : 'hidden'}>
            <InfosTab fiche={fiche} setFiche={setFiche} isNew={isNew} />
          </div>
          {activeTab === 'document'   && <DocumentTab fiche={fiche} setFiche={setFiche} anomaliesCount={anomaliesCount} />}
        </div>
      </div>
    </div>
  );
}

// ── ChecklistTab ──────────────────────────────────────────────────────────────

function ChecklistTab({ fiche, setObs, setFiche, activePiece, setActivePiece }: {
  fiche: EdlFicheData;
  setObs: (elementId: string, opt: ObservationOption) => void;
  setFiche: React.Dispatch<React.SetStateAction<EdlFicheData>>;
  activePiece: string;
  setActivePiece: (p: string) => void;
}) {
  const visiblePieces = activePiece === 'all' ? PIECES : PIECES.filter(p => p.id === activePiece);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-1.5 flex-wrap flex-shrink-0">
        <button onClick={() => setActivePiece('all')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${activePiece === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-200'}`}>
          Toutes
        </button>
        {PIECES.map(p => (
          <button key={p.id} onClick={() => setActivePiece(p.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${activePiece === p.id ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-200'}`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-xs">
          <colgroup>
            <col style={{ width: '180px' }} />
            <col style={{ width: '48px' }} />
            <col />
            <col style={{ width: '120px' }} />
            <col style={{ width: '52px' }} />
            <col style={{ width: '72px' }} />
          </colgroup>
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-100 border-b border-slate-300">
              <th className="text-left px-3 py-2.5 text-xs font-bold text-slate-700 uppercase tracking-wide">Élément</th>
              <th className="text-center px-2 py-2.5 text-xs font-bold text-slate-700">NB</th>
              <th className="text-left px-3 py-2.5 text-xs font-bold text-slate-700 uppercase tracking-wide">Observations</th>
              <th className="text-left px-3 py-2.5 text-xs font-bold text-slate-700 uppercase tracking-wide">Note</th>
              <th className="text-center px-2 py-2.5 text-xs font-bold text-amber-700 uppercase tracking-wide bg-amber-50">Coût</th>
              <th className="text-center px-2 py-2.5 text-xs font-bold text-red-700 uppercase tracking-wide bg-red-50">Réparation</th>
            </tr>
          </thead>
          <tbody>
            {visiblePieces.map(piece => (
              <React.Fragment key={piece.id}>
                <tr>
                  <td colSpan={6} className="bg-slate-700 text-white font-bold text-xs px-4 py-2 tracking-wide uppercase border border-slate-600">
                    {piece.label}
                  </td>
                </tr>
                {piece.elements.map((el, idx) => {
                  const selected = fiche.observations[el.id] ?? [];
                  const hasBad   = selected.some(o => DEGRADED.has(o));
                  const rowBg    = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40';
                  return (
                    <tr key={el.id} className={`${rowBg} ${hasBad ? 'ring-inset ring-1 ring-orange-200' : ''}`}>
                      <td className={`border border-slate-200 px-3 py-2.5 font-semibold text-black align-top ${hasBad ? 'bg-orange-50/60' : ''}`}>
                        <div className="flex items-start justify-between gap-1">
                          <span>{el.label}</span>
                          {hasBad && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1 flex-shrink-0" />}
                        </div>
                      </td>
                      <td className="border border-slate-200 px-2 py-2.5 text-center align-top">
                        {el.hasNb && (
                          <input type="number" min={0} max={99}
                            value={fiche.nb[el.id] ?? ''}
                            onChange={e => setFiche(f => ({ ...f, nb: { ...f.nb, [el.id]: e.target.value } }))}
                            className="w-10 text-center border border-slate-200 rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
                        )}
                      </td>
                      <td className={`border border-slate-200 px-3 py-2.5 align-top ${hasBad ? 'bg-orange-50/30' : ''}`}>
                        <div className="flex flex-wrap gap-1.5">
                          {el.options.map(opt => {
                            const isSel  = selected.includes(opt);
                            const isBad  = isSel && DEGRADED.has(opt);
                            const isGood = isSel && !DEGRADED.has(opt);
                            return (
                              <button key={opt} onClick={() => setObs(el.id, opt)}
                                className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border transition-all font-medium ${
                                  isBad  ? 'bg-orange-100 text-orange-800 border-orange-300 shadow-sm' :
                                  isGood ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm' :
                                  'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}>
                                <span className={`w-2.5 h-2.5 rounded border flex-shrink-0 transition-all ${
                                  isBad  ? 'bg-orange-500 border-orange-500' :
                                  isGood ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'
                                }`} />
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="border border-slate-200 px-2 py-2.5 align-top">
                        <input type="text" value={fiche.notes[el.id] ?? ''}
                          onChange={e => setFiche(f => ({ ...f, notes: { ...f.notes, [el.id]: e.target.value } }))}
                          placeholder="Note…"
                          className="w-full text-[10px] border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder-slate-300" />
                      </td>
                      <td className="border border-slate-200 px-2 py-2.5 text-center align-middle bg-amber-50/30">
                        <input type="checkbox"
                          checked={!!fiche.couts[el.id]}
                          onChange={e => setFiche(f => ({ ...f, couts: { ...f.couts, [el.id]: e.target.checked } }))}
                          className="w-4 h-4 accent-amber-500 cursor-pointer" />
                      </td>
                      <td className="border border-slate-200 px-2 py-2.5 text-center align-middle bg-red-50/30">
                        <input type="checkbox"
                          checked={!!fiche.reparations[el.id]}
                          onChange={e => setFiche(f => ({ ...f, reparations: { ...f.reparations, [el.id]: e.target.checked } }))}
                          className="w-4 h-4 accent-red-500 cursor-pointer" />
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-50">
                  <td className="border border-slate-200 px-3 py-2 text-xs text-slate-500 italic font-medium" colSpan={6}>
                    Observations {piece.label}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── ReparationsTab ─────────────────────────────────────────────────────────────

function ReparationsTab({ fiche }: { fiche: EdlFicheData }) {
  const items = PIECES.flatMap(piece =>
    piece.elements
      .filter(el => fiche.reparations[el.id])
      .map(el => ({ id: el.id, piece: piece.label, element: el.label, opts: fiche.observations[el.id] ?? [] }))
  );

  const [details, setDetails] = useState<Record<string, ReparationDetail>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  function getDetail(id: string): ReparationDetail {
    return details[id] ?? makeBlankDetail();
  }

  function setDetail(id: string, patch: Partial<ReparationDetail>) {
    setDetails(prev => ({ ...prev, [id]: { ...getDetail(id), ...patch } }));
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">Réparations à effectuer</h3>
        <span className="text-xs text-slate-400">
          {items.length} élément{items.length !== 1 ? 's' : ''} coché{items.length !== 1 ? 's' : ''} en réparation
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
          <CheckCircle2 className="w-8 h-8 text-emerald-300 mb-2" />
          <p className="text-sm text-slate-400">Aucune réparation cochée</p>
          <p className="text-xs text-slate-300 mt-1">Cochez la colonne "Réparation" dans la checklist pour faire apparaître les éléments ici</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const isOpen = openId === item.id;
            const d = getDetail(item.id);
            const criticCfg = CRITICITE_CFG[d.criticite];
            const badOpts = item.opts.filter(o => DEGRADED.has(o));
            return (
              <div key={item.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {/* Accordion header */}
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-700">{item.piece}</span>
                      <span className="text-slate-300 text-xs">›</span>
                      <span className="text-xs font-semibold text-slate-600">{item.element}</span>
                      {badOpts.length > 0 && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                          {badOpts.join(', ')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {d.titre && <p className="text-[10px] text-slate-400 truncate max-w-xs">{d.titre}</p>}
                      {d.criticite && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${criticCfg.bg} ${criticCfg.text} ${criticCfg.border}`}>
                          {criticCfg.icon} {criticCfg.label}
                        </span>
                      )}
                      {d.dateButoir && (
                        <span className="text-[10px] text-slate-400">Butoir : {new Date(d.dateButoir).toLocaleDateString('fr-FR')}</span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Accordion body */}
                {isOpen && (
                  <div className="border-t border-slate-100 px-5 py-5 space-y-6">
                    {/* ── Étape Description ──────────────────────────────────── */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</div>
                        <p className="text-xs font-bold text-slate-700">Description</p>
                      </div>

                      {/* Type de problème */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-2">Type de problème</label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {item.opts.filter(o => DEGRADED.has(o)).map(opt => (
                            <button key={opt} type="button"
                              onClick={() => setDetail(item.id, { titre: `${item.element} — ${opt}` })}
                              className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-1.5 rounded-lg border font-semibold transition-all ${
                                d.titre === `${item.element} — ${opt}`
                                  ? 'bg-orange-100 border-orange-300 text-orange-800'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-orange-200 hover:bg-orange-50'
                              }`}>
                              <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                              {opt}
                            </button>
                          ))}
                        </div>
                        <input type="text"
                          value={d.titre}
                          onChange={e => setDetail(item.id, { titre: e.target.value })}
                          placeholder="Ou saisir un titre personnalisé…"
                          className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-slate-300 text-slate-700" />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description du problème</label>
                        <textarea
                          value={d.description}
                          onChange={e => setDetail(item.id, { description: e.target.value })}
                          rows={3}
                          placeholder="Décrivez le problème, depuis quand, les symptômes observés…"
                          className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-slate-300 text-slate-700" />
                      </div>

                      {/* Catégorie */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-2">Catégorie <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {CATEGORIES_DI.map(cat => (
                            <button key={cat.key} type="button"
                              onClick={() => setDetail(item.id, { categorie: cat.key })}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                                d.categorie === cat.key
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                              }`}>
                              <span>{cat.icon}</span>
                              <span className="truncate">{cat.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Date butoir */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date butoir de réparation souhaitée</label>
                        <input type="date"
                          value={d.dateButoir}
                          onChange={e => setDetail(item.id, { dateButoir: e.target.value })}
                          className="text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700" />
                      </div>

                      {/* Photo zone */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-2">Photo(s) ou pièce-jointe</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center gap-2 bg-slate-50 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer">
                          <Camera className="w-6 h-6 text-slate-300" />
                          <p className="text-xs text-slate-400 text-center">Ajoutez une photo pour aider l'équipe technique à comprendre le problème plus rapidement.</p>
                        </div>
                      </div>
                    </section>

                    {/* ── Étape Criticité ────────────────────────────────────── */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">Niveau de criticité</p>
                          <p className="text-[10px] text-slate-400">Évaluez l'urgence et l'impact de ce problème <span className="text-red-500">*</span></p>
                        </div>
                      </div>

                      {/* IA assistant strip */}
                      <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🤖</span>
                          <div>
                            <p className="text-xs font-bold text-slate-700">Assistant IA de qualification</p>
                            <p className="text-[10px] text-slate-400">Analyse automatique et recommandation de criticité</p>
                          </div>
                        </div>
                        <button type="button"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                          <Wrench className="w-3 h-3" />Analyser
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {(['critique', 'haute', 'moyenne', 'faible'] as const).map(level => {
                          const cfg = CRITICITE_CFG[level];
                          const isSelected = d.criticite === level;
                          return (
                            <button key={level} type="button"
                              onClick={() => setDetail(item.id, { criticite: level })}
                              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${
                                isSelected
                                  ? `${cfg.bg} ${cfg.border} ${cfg.text} shadow-sm`
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                              }`}>
                              <span className="text-xl">{cfg.icon}</span>
                              <span className={`text-xs font-bold ${isSelected ? cfg.text : 'text-slate-700'}`}>{cfg.label}</span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isSelected ? cfg.text : 'text-slate-400'}`}>
                                DÉLAI <span className="font-extrabold">{cfg.sla}</span>
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Justification (optionnel)</label>
                        <textarea
                          value={d.justification}
                          onChange={e => setDetail(item.id, { justification: e.target.value })}
                          rows={2}
                          placeholder="Précisez si nécessaire la raison du niveau de criticité choisi…"
                          className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-slate-300 text-slate-700" />
                      </div>
                    </section>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── EstimationTab ─────────────────────────────────────────────────────────────

function EstimationTab({ fiche, setFiche }: { fiche: EdlFicheData; setFiche: React.Dispatch<React.SetStateAction<EdlFicheData>> }) {
  const coutsItems = PIECES.flatMap(piece =>
    piece.elements
      .filter(el => fiche.couts[el.id])
      .map(el => ({ id: el.id, piece: piece.label, element: el.label, opts: fiche.observations[el.id] ?? [] }))
  );

  const [descs, setDescs] = useState<Record<string, string>>({});
  const [forfaits, setForfaits] = useState<Record<string, string>>({});

  function handleForfaitChange(id: string, value: string) {
    setForfaits(prev => ({ ...prev, [id]: value }));
    const prix = FORFAITS[id]?.find(f => f.label === value)?.prix;
    if (prix !== undefined) {
      setFiche(f => ({ ...f, coutsValeurs: { ...f.coutsValeurs, [id]: prix } }));
    }
  }

  const total = coutsItems.reduce((s, item) => s + (fiche.coutsValeurs[item.id] ?? 0), 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Total banner */}
      <div className={`rounded-xl border-2 p-6 text-center ${total > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Montant estimatif total</p>
        <p className={`text-5xl font-bold ${total > 0 ? 'text-red-600' : 'text-slate-300'}`}>
          {total > 0 ? `${total.toLocaleString('fr-FR')} €` : '—'}
        </p>
        <p className="text-xs text-slate-400 mt-2">Estimation indicative, non contractuelle</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <Euro className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-bold text-slate-700">Éléments cochés pour estimation</span>
        </div>
        {coutsItems.length === 0 ? (
          <div className="px-4 py-8 flex flex-col items-center gap-2 text-center">
            <Euro className="w-6 h-6 text-slate-200" />
            <p className="text-sm text-slate-400">Aucun élément coché pour le coût</p>
            <p className="text-xs text-slate-300">Cochez la colonne "Coût" dans la checklist pour faire apparaître les éléments ici</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wide" style={{ width: '200px' }}>Élément / Pièce</th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wide" style={{ width: '120px' }}>Valeur constatée</th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                <th className="text-left px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wide" style={{ width: '220px' }}>Forfait</th>
                <th className="text-right px-3 py-2.5 font-semibold text-slate-500 uppercase tracking-wide" style={{ width: '110px' }}>Coût estimé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {coutsItems.map(item => {
                const badOpts = item.opts.filter(o => DEGRADED.has(o));
                const forfaitList = FORFAITS[item.id] ?? [];
                return (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="px-3 py-2.5 align-top">
                      <p className="font-semibold text-slate-800">{item.element}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.piece}</p>
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <div className="flex flex-wrap gap-1">
                        {badOpts.length > 0
                          ? badOpts.map(opt => (
                              <span key={opt} className="text-[10px] px-1.5 py-0.5 rounded border bg-orange-100 text-orange-800 border-orange-300 font-semibold">{opt}</span>
                            ))
                          : item.opts.map(opt => (
                              <span key={opt} className="text-[10px] px-1.5 py-0.5 rounded border bg-slate-50 text-slate-500 border-slate-200">{opt}</span>
                            ))
                        }
                        {item.opts.length === 0 && <span className="text-slate-300 italic">—</span>}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      <input type="text"
                        value={descs[item.id] ?? ''}
                        onChange={e => setDescs(prev => ({ ...prev, [item.id]: e.target.value }))}
                        placeholder="Description…"
                        className="w-full text-[11px] border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder-slate-300 text-slate-700" />
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      {forfaitList.length > 0 ? (
                        <select
                          value={forfaits[item.id] ?? ''}
                          onChange={e => handleForfaitChange(item.id, e.target.value)}
                          className="w-full text-[11px] border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 text-slate-700 bg-white">
                          <option value="">— Choisir un forfait —</option>
                          {forfaitList.map(f => (
                            <option key={f.label} value={f.label}>{f.label} ({f.prix} €)</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-[11px] text-slate-300 italic">Aucun forfait</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 align-top text-right">
                      <div className="flex items-center justify-end gap-1">
                        <input
                          type="number" min={0}
                          value={fiche.coutsValeurs[item.id] ?? ''}
                          placeholder="—"
                          onChange={e => setFiche(f => ({ ...f, coutsValeurs: { ...f.coutsValeurs, [item.id]: +e.target.value || 0 } }))}
                          className="w-20 text-right text-[11px] border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder-slate-300"
                        />
                        <span className="text-[11px] text-slate-500">€</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-slate-50 border-t-2 border-slate-200">
                <td className="px-3 py-3 text-sm font-bold text-slate-800" colSpan={4}>Total prévisionnel</td>
                <td className={`px-3 py-3 text-right text-sm font-bold ${total > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                  {total > 0 ? `${total.toLocaleString('fr-FR')} €` : '—'}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── InfosTab ──────────────────────────────────────────────────────────────────

function InfosTab({ fiche, setFiche, isNew }: {
  fiche: EdlFicheData;
  setFiche: React.Dispatch<React.SetStateAction<EdlFicheData>>;
  isNew: boolean;
}) {
  function handleLogementSelect(sel: LogementSelection | null) {
    if (!sel) return;
    setFiche(f => ({
      ...f,
      logementId: sel.logementId,
      logementNumero: sel.logementNumero,
      residenceNom: sel.residenceNom,
    }));
  }

  function handleOccupantsLoaded(occs: OccupantRow[]) {
    const occ = occs.find(o => o.statut === 'occupant_actuel') ?? occs[0];
    if (!occ) return;
    setFiche(f => ({
      ...f,
      occupantId: occ.id,
      occupantNom: occ.nom,
      occupantPrenom: occ.prenom,
      occupantEmail: occ.email ?? '',
      occupantTel: occ.telephone ?? '',
      etablissement: occ.etablissement ?? '',
      dateEntree: occ.date_entree ?? '',
      dateSortie: occ.date_sortie_prevue ?? '',
    }));
  }

  const initialLabel = fiche.logementNumero && fiche.residenceNom
    ? `Logement ${fiche.logementNumero} — ${fiche.residenceNom}`
    : undefined;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {isNew && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Type d'état des lieux</h3>
          <div className="flex gap-3">
            {(['entrant', 'sortant'] as const).map(t => {
              const c = TYPE_CFG_EDL[t];
              const Icon = c.icon;
              return (
                <button key={t} onClick={() => setFiche(f => ({ ...f, type: t }))}
                  className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${fiche.type === t ? `${c.bg} border-transparent text-white shadow-md` : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-bold">EDL {c.label}</p>
                    <p className={`text-xs ${fiche.type === t ? 'text-white/70' : 'text-slate-400'}`}>
                      {t === 'entrant' ? "Réalisé à l'arrivée de l'occupant" : "Réalisé au départ de l'occupant"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <LogementPickerWithOccupants
        initialLogementId={fiche.logementId}
        initialLabel={initialLabel}
        onSelect={handleLogementSelect}
        onOccupantsLoaded={handleOccupantsLoaded}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Date de l'EDL"     type="date" value={fiche.dateEdl}  onChange={v => setFiche(f => ({ ...f, dateEdl: v }))} />
        <Field label="Agent réalisateur" value={fiche.agentNom}             onChange={v => setFiche(f => ({ ...f, agentNom: v }))} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Observations générales</label>
        <textarea value={fiche.observations_generales}
          onChange={e => setFiche(f => ({ ...f, observations_generales: e.target.value }))}
          rows={3} placeholder="Observations générales sur l'état du logement…"
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 placeholder-slate-300" />
      </div>
    </div>
  );
}

// ── DocumentTab ───────────────────────────────────────────────────────────────

function DocumentTab({ fiche, setFiche, anomaliesCount }: {
  fiche: EdlFicheData;
  setFiche: React.Dispatch<React.SetStateAction<EdlFicheData>>;
  anomaliesCount: number;
}) {
  const cfg = TYPE_CFG_EDL[fiche.type];
  const TypeIcon = cfg.icon;
  const [sigTarget, setSigTarget] = useState<'agent' | 'occupant' | null>(null);

  const allObservations: { piece: string; element: string; opts: string[] }[] = [];
  for (const piece of PIECES) {
    for (const el of piece.elements) {
      const selected = fiche.observations[el.id] ?? [];
      if (selected.length > 0) {
        allObservations.push({ piece: piece.label, element: el.label, opts: selected });
      }
    }
  }

  const reparationsItems = PIECES.flatMap(piece =>
    piece.elements.filter(el => fiche.reparations[el.id]).map(el => ({ piece: piece.label, element: el.label }))
  );

  const coutsItems = PIECES.flatMap(piece =>
    piece.elements.filter(el => fiche.couts[el.id]).map(el => ({
      element: el.label, piece: piece.label, valeur: fiche.coutsValeurs[el.id] ?? 0
    }))
  );
  const coutsTotal = coutsItems.reduce((s, i) => s + i.valeur, 0);

  function handlePrint() {
    window.print();
  }

  function handleDownloadPdf() {
    const docEl = document.getElementById('edl-document-content');
    if (!docEl) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head>
      <title>EDL - ${fiche.occupantPrenom} ${fiche.occupantNom}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #1e293b; margin: 0; padding: 24px; }
        h1 { font-size: 18px; margin-bottom: 4px; }
        h2 { font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 16px 0 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th { background: #f1f5f9; font-size: 10px; text-transform: uppercase; padding: 6px 8px; text-align: left; }
        td { border-bottom: 1px solid #f1f5f9; padding: 6px 8px; }
        .header { background: #1e40af; color: white; padding: 24px; margin: -24px -24px 24px; }
        .header p { margin: 0; opacity: 0.7; font-size: 10px; text-transform: uppercase; }
        .badge-bad { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; padding: 1px 4px; border-radius: 4px; font-size: 10px; }
        .badge-ok { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; padding: 1px 4px; border-radius: 4px; font-size: 10px; }
        .sig-box { border: 1px solid #e2e8f0; height: 80px; border-radius: 8px; margin-top: 4px; overflow: hidden; }
        .sig-box img { width: 100%; height: 100%; object-fit: contain; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .field label { font-size: 10px; color: #94a3b8; display: block; margin-bottom: 2px; }
        .field p { font-weight: 600; margin: 0; }
        hr { border: none; border-top: 1px solid #f1f5f9; margin: 16px 0; }
        .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 24px; padding-top: 24px; border-top: 2px dashed #e2e8f0; }
        .total-row { background: #fef2f2; font-weight: bold; }
      </style>
    </head><body>
    ${docEl.innerHTML}
    </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 500);
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {sigTarget && (
        <SignatureModal
          title={sigTarget === 'agent' ? "Signature de l'agent" : "Signature de l'occupant"}
          suggestName={sigTarget === 'agent' ? fiche.agentNom : `${fiche.occupantPrenom} ${fiche.occupantNom}`.trim() || undefined}
          onConfirm={url => {
            setFiche(f => sigTarget === 'agent'
              ? { ...f, signatureAgent: url }
              : { ...f, signatureOccupant: url }
            );
            setSigTarget(null);
          }}
          onClose={() => setSigTarget(null)}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-700">Document État des Lieux — Vue officielle</h3>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">
            <Printer className="w-3.5 h-3.5" />Imprimer
          </button>
          <button onClick={handleDownloadPdf} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
            <Download className="w-3.5 h-3.5" />Exporter PDF
          </button>
        </div>
      </div>

      <div id="edl-document-content" className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden">
        <div className={`${cfg.headerBg} text-white px-8 py-6`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-white/60 uppercase tracking-widest mb-1">CROUS de Lyon</p>
              <div className="flex items-center gap-3">
                <TypeIcon className="w-5 h-5" />
                <h2 className="text-lg font-bold">État des Lieux {cfg.label}</h2>
              </div>
              {fiche.statut === 'valide' && <p className="text-xs text-white/70 mt-0.5">Document validé et signé</p>}
            </div>
            <div className="text-right text-xs text-white/70">
              <p>{fiche.dateEdl ? new Date(fiche.dateEdl).toLocaleDateString('fr-FR') : '—'}</p>
              <p className="mt-0.5">Réf. {fiche.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Logement */}
          <section>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Informations logement</h4>
            <div className="grid grid-cols-3 gap-x-8 gap-y-2">
              <DocField label="Résidence"       value={fiche.residenceNom || '—'} />
              <DocField label="Logement"        value={fiche.logementNumero || '—'} />
              <DocField label="Date EDL"        value={fiche.dateEdl ? new Date(fiche.dateEdl).toLocaleDateString('fr-FR') : '—'} />
              {fiche.dateEntree && <DocField label="Date d'entrée" value={new Date(fiche.dateEntree).toLocaleDateString('fr-FR')} />}
              {fiche.dateSortie && <DocField label="Date de sortie" value={new Date(fiche.dateSortie).toLocaleDateString('fr-FR')} />}
              {fiche.agentNom && <DocField label="Agent réalisateur" value={fiche.agentNom} />}
            </div>
          </section>
          <hr className="border-slate-100" />

          {/* Occupant */}
          <section>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Occupant</h4>
            <div className="grid grid-cols-3 gap-x-8 gap-y-2">
              <DocField label="Nom"           value={fiche.occupantNom || '—'} />
              <DocField label="Prénom"        value={fiche.occupantPrenom || '—'} />
              {fiche.etablissement && <DocField label="Établissement" value={fiche.etablissement} />}
              {fiche.occupantEmail && <DocField label="Email"         value={fiche.occupantEmail} />}
              {fiche.occupantTel   && <DocField label="Téléphone"     value={fiche.occupantTel} />}
            </div>
          </section>
          <hr className="border-slate-100" />

          {/* Observations checklist */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">État des éléments</h4>
              {anomaliesCount > 0 && (
                <span className="text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                  {anomaliesCount} point{anomaliesCount > 1 ? 's' : ''} signalé{anomaliesCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {allObservations.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Checklist non complétée.</p>
            ) : (
              <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-3 py-2 text-slate-500 font-semibold w-32">Pièce</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-semibold w-40">Élément</th>
                    <th className="text-left px-3 py-2 text-slate-500 font-semibold">État constaté</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {allObservations.map((o, i) => (
                    <tr key={i} className={o.opts.some(opt => DEGRADED.has(opt)) ? 'bg-orange-50/40' : ''}>
                      <td className="px-3 py-2 text-slate-500">{o.piece}</td>
                      <td className="px-3 py-2 font-medium text-slate-700">{o.element}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          {o.opts.map(opt => (
                            <span key={opt} className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${DEGRADED.has(opt) ? 'bg-orange-100 text-orange-800 border-orange-300' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{opt}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Réparations */}
          {reparationsItems.length > 0 && (
            <>
              <hr className="border-slate-100" />
              <section>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Réparations à effectuer ({reparationsItems.length})
                </h4>
                <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-3 py-2 text-slate-500 font-semibold w-32">Pièce</th>
                      <th className="text-left px-3 py-2 text-slate-500 font-semibold">Élément</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {reparationsItems.map((r, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-slate-500">{r.piece}</td>
                        <td className="px-3 py-2 font-medium text-slate-700">{r.element}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </>
          )}

          {/* Estimation */}
          {coutsItems.length > 0 && (
            <>
              <hr className="border-slate-100" />
              <section>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Estimation des coûts</h4>
                <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-3 py-2 text-slate-500 font-semibold">Élément</th>
                      <th className="text-left px-3 py-2 text-slate-500 font-semibold w-24">Pièce</th>
                      <th className="text-right px-3 py-2 text-slate-500 font-semibold w-24">Coût estimé</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {coutsItems.map((item, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-medium text-slate-700">{item.element}</td>
                        <td className="px-3 py-2 text-slate-500">{item.piece}</td>
                        <td className="px-3 py-2 text-right font-semibold text-slate-800">{item.valeur > 0 ? `${item.valeur.toLocaleString('fr-FR')} €` : '—'}</td>
                      </tr>
                    ))}
                    <tr className="bg-red-50 border-t-2 border-red-100">
                      <td className="px-3 py-2.5 font-bold text-slate-800" colSpan={2}>Total estimatif</td>
                      <td className="px-3 py-2.5 text-right font-bold text-red-600">{coutsTotal > 0 ? `${coutsTotal.toLocaleString('fr-FR')} €` : '—'}</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            </>
          )}

          {/* Observations générales */}
          {fiche.observations_generales && (
            <>
              <hr className="border-slate-100" />
              <section>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Observations générales</h4>
                <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-200">{fiche.observations_generales}</p>
              </section>
            </>
          )}

          {/* Signatures */}
          <hr className="border-slate-100" />
          <div className="grid grid-cols-2 gap-8">
            {(['agent', 'occupant'] as const).map(who => {
              const sig = who === 'agent' ? fiche.signatureAgent : fiche.signatureOccupant;
              const label = who === 'agent' ? "Signature de l'agent" : "Signature de l'occupant";
              const name = who === 'agent' ? fiche.agentNom : `${fiche.occupantPrenom} ${fiche.occupantNom}`.trim();
              return (
                <div key={who} className="space-y-1.5">
                  <p className="text-xs font-semibold text-slate-500">{label}</p>
                  <button
                    onClick={() => setSigTarget(who)}
                    className={`w-full h-20 rounded-xl border-2 transition-all group overflow-hidden ${
                      sig ? 'border-emerald-300 bg-emerald-50' : 'border-dashed border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {sig ? (
                      <img src={sig} alt="signature" className="w-full h-full object-contain p-1" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-300 group-hover:text-blue-400 transition-colors">
                        <PenLine className="w-5 h-5" />
                        <span className="text-[10px] font-semibold">Cliquer pour signer</span>
                      </div>
                    )}
                  </button>
                  <p className="text-xs text-slate-400">{name || '—'} — {new Date().toLocaleDateString('fr-FR')}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Field helpers ─────────────────────────────────────────────────────────────

function Field({ label, value, onChange, type = 'text', readonly }: {
  label: string; value: string; onChange?: (v: string) => void; type?: string; readonly?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      {readonly ? (
        <p className="text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">{value || '—'}</p>
      ) : (
        <input type={type} value={value} onChange={e => onChange?.(e.target.value)}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-700" />
      )}
    </div>
  );
}

function DocField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

