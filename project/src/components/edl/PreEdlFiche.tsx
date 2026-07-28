import React, { useState } from 'react';
import {
  X, CalendarClock, MapPin, User, Euro, Camera, ChevronRight,
  CheckCircle2, ChevronDown, Wrench, PenLine, Save,
  ArrowRight, Download, Printer, GitCompare,
} from 'lucide-react';
import {
  CATEGORIES_DI, CRITICITE_CFG, FORFAITS,
  type ReparationDetail, makeBlankDetail,
} from './reparationTypes';
import {
  PreEdlRecord, PRE_EDL_CFG, PRE_EDL_WORKFLOW,
  preEdlTotal,
} from './edlTypes';
import EdlComparaison, { DEMO_EDL_HISTORY, CURRENT_PRE_EDL, PIECES } from './EdlComparaison';
import LogementPickerWithOccupants from './LogementPickerWithOccupants';
import { supabase } from '../../lib/supabase';
import SignatureModal from './SignatureModal';

interface Props {
  record?: PreEdlRecord;
  onClose: () => void;
  onUpdateStatut?: (id: string, statut: PreEdlRecord['statut']) => void;
}

const BLANK_RECORD: PreEdlRecord = {
  id: '',
  occupant_id: '',
  logement_id: '',
  nom: '',
  prenom: '',
  logement_numero: '',
  residence_nom: '',
  statut: 'cree',
  date_creation: new Date().toISOString().slice(0, 10),
  date_inspection: null,
  date_restitution: null,
  date_cloture: null,
  estimation_peinture: 0,
  estimation_mobilier: 0,
  estimation_sols: 0,
  estimation_nettoyage: 0,
  estimation_autre: 0,
  observations: '',
  anomalies: [],
  date_sortie_prevue: null,
};

type MainTab = 'comparaison' | 'checklist' | 'reparations' | 'estimation' | 'infos' | 'document';

const GRAVITE_CFG = {
  mineure:  { label: 'Mineure',  bg: 'bg-blue-50',   text: 'text-blue-700',  border: 'border-blue-200'  },
  moderee:  { label: 'Modérée', bg: 'bg-amber-50',  text: 'text-amber-700', border: 'border-amber-200' },
  majeure:  { label: 'Majeure', bg: 'bg-red-50',    text: 'text-red-700',   border: 'border-red-200'   },
};

const DEGRADED = new Set([
  'à nettoyer','pb poignée','trou','à repeindre','pb joint','pb serrure',
  'manquant','manquantes','à changer','à refixer','tâché/sale','abîmé/trous',
  'accrocs/trous/brûlures','à remplacer','absent','vitre fissurée','dégradé',
  'ne fonctionne pas','brûlures/cigarettes','fuite','cassé','abîmé','décollée',
  'tâchée','accrocs','rayures','brûlures','dégradé/tâché',
  'fissures/éclats','trous','fissures','filtre à changer','tâché',
]);

export default function PreEdlFiche({ record: recordProp, onClose, onUpdateStatut }: Props) {
  const isNew = !recordProp;
  const record = recordProp ?? BLANK_RECORD;
  const [activeTab, setActiveTab] = useState<MainTab>(isNew ? 'infos' : 'comparaison');
  const [couts,      setCouts]      = useState<Record<string, boolean>>({});
  const [reparations, setReparations] = useState<Record<string, boolean>>({});
  const [coutsValeurs, setCoutsValeurs] = useState<Record<string, number>>({});
  const [checklistObs, setChecklistObs] = useState<Record<string, string>>({});
  const [signatureAgent, setSignatureAgent] = useState<string | null>(null);
  const [signatureOccupant, setSignatureOccupant] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [savedDraft, setSavedDraft] = useState(false);
  const [selectedLogement, setSelectedLogement] = useState<import('./LogementPickerWithOccupants').LogementSelection | null>(null);

  const cfg   = PRE_EDL_CFG[record.statut];
  const total = preEdlTotal(record);

  const currentIdx = PRE_EDL_WORKFLOW.indexOf(record.statut);

  const reparationsCount = Object.values(reparations).filter(Boolean).length;

  async function handleSave(asDraft = false) {
    if (asDraft) { setSavingDraft(true); } else { setSaving(true); }
    const payload = {
      occupant_id: record.occupant_id || null,
      logement_id: selectedLogement?.logementId || record.logement_id || null,
      logement_numero: selectedLogement?.logementNumero || record.logement_numero || null,
      residence_nom: selectedLogement?.residenceNom || record.residence_nom || null,
      occupant_nom: record.nom || null,
      occupant_prenom: record.prenom || null,
      date_inspection: record.date_inspection || null,
      date_sortie_prevue: record.date_sortie_prevue || null,
      statut: asDraft ? 'brouillon' : record.statut,
      observations: record.observations || null,
      couts,
      reparations,
      couts_valeurs: coutsValeurs,
      checklist_obs: checklistObs,
      signature_agent: signatureAgent || null,
      signature_occupant: signatureOccupant || null,
    };
    const isExisting = record.id && !record.id.startsWith('pre-');
    if (isExisting) {
      await supabase.from('pre_edl_fiches').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', record.id);
    } else {
      await supabase.from('pre_edl_fiches').insert({ ...payload, date_creation: record.date_creation });
    }
    if (asDraft) {
      setSavingDraft(false);
      setSavedDraft(true);
      setTimeout(() => setSavedDraft(false), 3000);
    } else {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  const TABS: { id: MainTab; label: string; icon?: React.ReactNode }[] = [
    { id: 'infos',       label: 'Informations' },
    { id: 'comparaison', label: 'Checklist avec comparaison', icon: <GitCompare className="w-3.5 h-3.5" /> },
    { id: 'checklist',   label: 'Checklist sans comparaison' },
    { id: 'reparations', label: 'Réparations' },
    { id: 'estimation',  label: 'Estimation des coûts', icon: <Euro className="w-3.5 h-3.5" /> },
    { id: 'document',    label: 'Document récapitulatif' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto py-6">
      <div className={`bg-white rounded-2xl shadow-2xl w-full mx-4 flex flex-col overflow-hidden ${activeTab === 'comparaison' ? 'max-w-7xl max-h-[94vh]' : 'max-w-5xl max-h-[90vh]'}`}>

        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <CalendarClock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Pré-EDL de sortie</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1`} />{cfg.label}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-800 mt-0.5">
              {isNew ? 'Nouveau Pré-EDL' : `${record.prenom} ${record.nom} — ${record.logement_numero}`}
            </h2>
          </div>

          {/* Workflow progress */}
          <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
            {PRE_EDL_WORKFLOW.map((s, i) => {
              const sCfg = PRE_EDL_CFG[s];
              const isDone = PRE_EDL_WORKFLOW.indexOf(record.statut) >= i;
              return (
                <React.Fragment key={s}>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${isDone ? `${sCfg.bg} ${sCfg.text} border ${sCfg.border}` : 'text-slate-300'}`}>
                    {isDone && <span className={`w-1.5 h-1.5 rounded-full ${sCfg.dot}`} />}
                    {sCfg.label}
                  </div>
                  {i < PRE_EDL_WORKFLOW.length - 1 && <ChevronRight className="w-3 h-3 text-slate-200 flex-shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <Printer className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-6 text-xs flex-shrink-0 flex-wrap gap-y-1.5">
          {!isNew && <InfoPill icon={<MapPin className="w-3 h-3" />} label={`${record.logement_numero} — ${record.residence_nom}`} />}
          {!isNew && <InfoPill icon={<User className="w-3 h-3" />} label={`${record.prenom} ${record.nom}`} />}
          <InfoPill icon={<CalendarClock className="w-3 h-3" />} label={`Créé le ${new Date(record.date_creation).toLocaleDateString('fr-FR')}`} />
          {record.date_sortie_prevue && (
            <InfoPill icon={<ArrowRight className="w-3 h-3" />} label={`Sortie prévue ${new Date(record.date_sortie_prevue).toLocaleDateString('fr-FR')}`} />
          )}
        </div>

        {/* Tabs */}
        <div className="px-4 border-b border-slate-100 flex items-center gap-0 flex-shrink-0 bg-white overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-all -mb-px whitespace-nowrap ${
                activeTab === t.id ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}>
              {t.icon}
              {t.id === 'reparations' && reparationsCount > 0 && (
                <span className="text-[9px] font-bold bg-orange-500 text-white rounded-full px-1.5 py-0.5 min-w-[16px] text-center">
                  {reparationsCount}
                </span>
              )}
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className={`flex-1 overflow-hidden ${activeTab === 'comparaison' ? 'flex flex-col' : 'overflow-y-auto'}`}>
          {activeTab === 'comparaison' && (
            <div className="flex-1 overflow-hidden flex flex-col px-4 py-2">
              <EdlComparaison
                history={DEMO_EDL_HISTORY}
                currentEdl={CURRENT_PRE_EDL}
                onCurrentChange={() => {}}
                couts={couts}
                reparations={reparations}
                onCoutsChange={setCouts}
                onReparationsChange={setReparations}
              />
            </div>
          )}
          <div className={activeTab !== 'comparaison' ? 'p-6 space-y-6' : 'hidden'}>
            {activeTab === 'checklist'   && <ChecklistTab   couts={couts} reparations={reparations} setCouts={setCouts} setReparations={setReparations} observations={checklistObs} setObservationsExt={setChecklistObs} />}
            {activeTab === 'reparations' && <ReparationsTab reparations={reparations} observations={checklistObs} />}
            {activeTab === 'estimation'  && <EstimationTab  record={record} total={total} couts={couts} coutsValeurs={coutsValeurs} setCoutsValeurs={setCoutsValeurs} observations={checklistObs} />}
            {activeTab === 'document'    && <DocumentTab record={record} total={total} couts={couts} coutsValeurs={coutsValeurs} checklistObs={checklistObs} reparations={reparations} signatureAgent={signatureAgent} setSignatureAgent={setSignatureAgent} signatureOccupant={signatureOccupant} setSignatureOccupant={setSignatureOccupant} />}

            {/* LogementPickerWithOccupants always mounted to preserve state across tab switches */}
            <div className={activeTab === 'infos' ? 'space-y-6' : 'hidden'}>
              <LogementPickerWithOccupants
                initialLogementId={record.logement_id || null}
                initialLabel={record.logement_numero && record.residence_nom
                  ? `Logement ${record.logement_numero} — ${record.residence_nom}`
                  : undefined}
                onSelect={sel => setSelectedLogement(sel)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date de sortie prévue</label>
                  <p className="text-sm text-slate-800 font-medium">
                    {record.date_sortie_prevue
                      ? new Date(record.date_sortie_prevue).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                      : '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date de création du Pré-EDL</label>
                  <p className="text-sm text-slate-800 font-medium">
                    {new Date(record.date_creation).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              {record.observations && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Observations générales</label>
                  <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                    {record.observations}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between flex-shrink-0">
          {/* Left: Brouillon */}
          <div>
            {savedDraft ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Brouillon sauvegardé
              </div>
            ) : (
              <button onClick={() => handleSave(true)} disabled={savingDraft || saving}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60 text-slate-600 text-xs font-semibold rounded-lg transition-colors">
                {savingDraft ? <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {savingDraft ? 'Sauvegarde…' : 'Brouillon'}
              </button>
            )}
          </div>
          {/* Right: Enregistrer */}
          <div>
            {saved ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enregistré
              </div>
            ) : (
              <button onClick={() => handleSave(false)} disabled={saving || savingDraft}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors">
                {saving ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ChecklistTab ──────────────────────────────────────────────────────────────

function ChecklistTab({ couts, reparations, setCouts, setReparations, observations: observationsExt, setObservationsExt }: {
  couts: Record<string, boolean>;
  reparations: Record<string, boolean>;
  setCouts: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setReparations: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  observations?: Record<string, string>;
  setObservationsExt?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  const [observations, setObservationsLocal] = useState<Record<string, string>>(observationsExt ?? {});

  function updateObs(id: string, opt: string) {
    const cur = observations[id] ? observations[id].split(',').map(s => s.trim()).filter(Boolean) : [];
    const next = cur.includes(opt) ? cur.filter(o => o !== opt) : [...cur, opt];
    const val = next.join(', ');
    setObservationsLocal(prev => ({ ...prev, [id]: val }));
    setObservationsExt?.(prev => ({ ...prev, [id]: val }));
  }
  const [activePiece, setActivePiece] = useState('all');
  const visiblePieces = activePiece === 'all' ? PIECES : PIECES.filter(p => p.id === activePiece);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 flex-wrap">
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

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-xs border-collapse">
          <colgroup>
            <col style={{ width: '180px' }} />
            <col />
            <col style={{ width: '52px' }} />
            <col style={{ width: '72px' }} />
          </colgroup>
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-100 border-b border-slate-300">
              <th className="text-left px-3 py-2.5 font-bold text-slate-700 uppercase tracking-wide">Élément</th>
              <th className="text-left px-3 py-2.5 font-bold text-slate-700 uppercase tracking-wide">Observations</th>
              <th className="text-center px-2 py-2.5 font-bold text-amber-700 uppercase tracking-wide bg-amber-50">Coût</th>
              <th className="text-center px-2 py-2.5 font-bold text-red-700 uppercase tracking-wide bg-red-50">Réparation</th>
            </tr>
          </thead>
          <tbody>
            {visiblePieces.map(piece => (
              <React.Fragment key={piece.id}>
                <tr>
                  <td colSpan={4} className="bg-slate-700 text-white font-bold text-xs px-4 py-2 tracking-wide uppercase border border-slate-600">
                    {piece.label}
                  </td>
                </tr>
                {piece.elements.map((el, idx) => {
                  const val = observations[el.id] ?? '';
                  const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40';
                  return (
                    <tr key={el.id} className={rowBg}>
                      <td className="border border-slate-200 px-3 py-2.5 font-semibold text-black align-top">{el.label}</td>
                      <td className="border border-slate-200 px-3 py-2.5 align-top">
                        <div className="flex flex-wrap gap-1.5">
                          {el.options.map(opt => {
                            const isSel = val.split(',').map(s => s.trim()).includes(opt);
                            const isBad = isSel && DEGRADED.has(opt);
                            const isGood = isSel && !DEGRADED.has(opt);
                            return (
                              <button key={opt}
                                onClick={() => updateObs(el.id, opt)}
                                className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border transition-all font-medium ${
                                  isBad  ? 'bg-orange-100 text-orange-800 border-orange-300 shadow-sm' :
                                  isGood ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm' :
                                  'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}>
                                <span className={`w-2.5 h-2.5 rounded border flex-shrink-0 ${
                                  isBad  ? 'bg-orange-500 border-orange-500' :
                                  isGood ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'
                                }`} />
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="border border-slate-200 px-2 py-2.5 text-center align-middle bg-amber-50/30">
                        <input type="checkbox"
                          checked={!!couts[el.id]}
                          onChange={e => setCouts(prev => ({ ...prev, [el.id]: e.target.checked }))}
                          className="w-4 h-4 accent-amber-500 cursor-pointer" />
                      </td>
                      <td className="border border-slate-200 px-2 py-2.5 text-center align-middle bg-red-50/30">
                        <input type="checkbox"
                          checked={!!reparations[el.id]}
                          onChange={e => setReparations(prev => ({ ...prev, [el.id]: e.target.checked }))}
                          className="w-4 h-4 accent-red-500 cursor-pointer" />
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-50">
                  <td className="border border-slate-200 px-3 py-2 text-xs text-slate-500 italic font-medium" colSpan={4}>
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

function ReparationsTab({ reparations, observations }: {
  reparations: Record<string, boolean>;
  observations?: Record<string, string>;
}) {
  const items = PIECES.flatMap(piece =>
    piece.elements
      .filter(el => reparations[el.id])
      .map(el => {
        const raw = observations?.[el.id] ?? '';
        const opts = raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : [];
        return { id: el.id, piece: piece.label, element: el.label, opts };
      })
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
    <div className="space-y-4">
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
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</div>
                        <p className="text-xs font-bold text-slate-700">Description</p>
                      </div>

                      {/* Type de problème */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-2">Type de problème</label>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {badOpts.map(opt => (
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
                          className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-slate-300 text-slate-700" />
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description du problème</label>
                        <textarea
                          value={d.description}
                          onChange={e => setDetail(item.id, { description: e.target.value })}
                          rows={3}
                          placeholder="Décrivez le problème, depuis quand, les symptômes observés…"
                          className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-slate-300 text-slate-700" />
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
                                  ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50'
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
                          className="text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-700" />
                      </div>

                      {/* Photo zone */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-2">Photo(s) ou pièce-jointe</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center gap-2 bg-slate-50 hover:border-amber-300 hover:bg-amber-50 transition-colors cursor-pointer">
                          <Camera className="w-6 h-6 text-slate-300" />
                          <p className="text-xs text-slate-400 text-center">Ajoutez une photo pour aider l'équipe technique à comprendre le problème plus rapidement.</p>
                        </div>
                      </div>
                    </section>

                    {/* ── Étape Criticité ────────────────────────────────────── */}
                    <section className="space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</div>
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
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition-colors">
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
                          className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-slate-300 text-slate-700" />
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

function EstimationTab({ record, total, couts, coutsValeurs, setCoutsValeurs, observations }: {
  record: PreEdlRecord;
  total: number;
  couts: Record<string, boolean>;
  coutsValeurs: Record<string, number>;
  setCoutsValeurs: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  observations?: Record<string, string>;
}) {
  const coutsItems = PIECES.flatMap(piece =>
    piece.elements
      .filter(el => couts[el.id])
      .map(el => {
        const raw = observations?.[el.id] ?? '';
        const opts = raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : [];
        return { id: el.id, piece: piece.label, element: el.label, opts };
      })
  );

  const [descs, setDescs] = useState<Record<string, string>>({});
  const [forfaits, setForfaits] = useState<Record<string, string>>({});

  function handleForfaitChange(id: string, value: string) {
    setForfaits(prev => ({ ...prev, [id]: value }));
    const prix = FORFAITS[id]?.find(f => f.label === value)?.prix;
    if (prix !== undefined) {
      setCoutsValeurs(prev => ({ ...prev, [id]: prix }));
    }
  }

  const coutsTotal = coutsItems.reduce((s, item) => s + (coutsValeurs[item.id] ?? 0), 0);
  const grandTotal = total + coutsTotal;

  return (
    <div className="space-y-6">
      <div className={`rounded-xl border-2 p-6 text-center ${grandTotal > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Montant estimatif total</p>
        <p className={`text-5xl font-bold ${grandTotal > 0 ? 'text-red-600' : 'text-slate-300'}`}>
          {grandTotal > 0 ? `${grandTotal.toLocaleString('fr-FR')} €` : '—'}
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
                        className="w-full text-[11px] border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder-slate-300 text-slate-700" />
                    </td>
                    <td className="px-3 py-2.5 align-top">
                      {forfaitList.length > 0 ? (
                        <select
                          value={forfaits[item.id] ?? ''}
                          onChange={e => handleForfaitChange(item.id, e.target.value)}
                          className="w-full text-[11px] border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-400 text-slate-700 bg-white">
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
                          value={coutsValeurs[item.id] ?? ''}
                          placeholder="—"
                          onChange={e => setCoutsValeurs(prev => ({ ...prev, [item.id]: +e.target.value || 0 }))}
                          className="w-20 text-right text-[11px] border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder-slate-300"
                        />
                        <span className="text-[11px] text-slate-500">€</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-slate-50 border-t-2 border-slate-200">
                <td className="px-3 py-3 text-sm font-bold text-slate-800" colSpan={4}>Total prévisionnel</td>
                <td className={`px-3 py-3 text-right text-sm font-bold ${coutsTotal > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                  {coutsTotal > 0 ? `${coutsTotal.toLocaleString('fr-FR')} €` : '—'}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── DocumentTab ───────────────────────────────────────────────────────────────

function DocumentTab({ record, total, couts, coutsValeurs, checklistObs, reparations, signatureAgent, setSignatureAgent, signatureOccupant, setSignatureOccupant }: {
  record: PreEdlRecord;
  total: number;
  couts: Record<string, boolean>;
  coutsValeurs: Record<string, number>;
  checklistObs: Record<string, string>;
  reparations: Record<string, boolean>;
  signatureAgent: string | null;
  setSignatureAgent: (v: string | null) => void;
  signatureOccupant: string | null;
  setSignatureOccupant: (v: string | null) => void;
}) {
  const [sigTarget, setSigTarget] = useState<'agent' | 'occupant' | null>(null);

  const checklistItems: { piece: string; element: string; opts: string[] }[] = [];
  for (const piece of PIECES) {
    for (const el of piece.elements) {
      const raw = checklistObs[el.id] ?? '';
      const opts = raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : [];
      if (opts.length > 0) checklistItems.push({ piece: piece.label, element: el.label, opts });
    }
  }

  const reparationsItems = PIECES.flatMap(p =>
    p.elements.filter(el => reparations[el.id]).map(el => ({ piece: p.label, element: el.label }))
  );

  const coutsItems = PIECES.flatMap(p =>
    p.elements.filter(el => couts[el.id]).map(el => ({
      piece: p.label, element: el.label, valeur: coutsValeurs[el.id] ?? 0
    }))
  );
  const coutsTotal = coutsItems.reduce((s, i) => s + i.valeur, 0);
  const grandTotal = total + coutsTotal;

  function handleDownloadPdf() {
    const docEl = document.getElementById('pre-edl-document-content');
    if (!docEl) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head>
      <title>Pré-EDL - ${record.prenom} ${record.nom}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #1e293b; margin: 0; padding: 24px; }
        h2 { font-size: 18px; } h4 { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 16px 0 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th { background: #f1f5f9; font-size: 10px; text-transform: uppercase; padding: 6px 8px; text-align: left; }
        td { border-bottom: 1px solid #f1f5f9; padding: 6px 8px; }
        .header { background: #1e293b; color: white; padding: 24px; margin: -24px -24px 24px; }
        .sig-box { border: 1px solid #e2e8f0; height: 80px; border-radius: 8px; margin-top: 4px; overflow: hidden; }
        .sig-box img { width: 100%; height: 100%; object-fit: contain; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 24px; padding-top: 24px; border-top: 2px dashed #e2e8f0; }
        .field label { font-size: 10px; color: #94a3b8; display: block; margin-bottom: 2px; }
        .field p { font-weight: 600; margin: 0; }
        hr { border: none; border-top: 1px solid #f1f5f9; margin: 16px 0; }
        .badge-bad { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; padding: 1px 4px; border-radius: 4px; font-size: 10px; }
      </style>
    </head><body>${docEl.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 500);
  }

  return (
    <div className="space-y-4">
      {sigTarget && (
        <SignatureModal
          title={sigTarget === 'agent' ? "Signature de l'agent" : "Signature de l'étudiant"}
          suggestName={sigTarget === 'agent' ? 'Agent CROUS' : `${record.prenom} ${record.nom}`.trim() || undefined}
          onConfirm={url => {
            if (sigTarget === 'agent') setSignatureAgent(url);
            else setSignatureOccupant(url);
            setSigTarget(null);
          }}
          onClose={() => setSigTarget(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">Document récapitulatif — Vue étudiant</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">
            <Printer className="w-3.5 h-3.5" />Imprimer
          </button>
          <button onClick={handleDownloadPdf} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
            <Download className="w-3.5 h-3.5" />Exporter PDF
          </button>
        </div>
      </div>

      <div id="pre-edl-document-content" className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden">
        <div className="bg-slate-800 text-white px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">CROUS de Lyon</p>
              <h2 className="text-lg font-bold">Pré-État des Lieux de Sortie</h2>
              <p className="text-sm text-slate-300 mt-0.5">Document indicatif — Non contractuel</p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>Créé le {new Date(record.date_creation).toLocaleDateString('fr-FR')}</p>
              {record.date_inspection && <p>Inspection : {new Date(record.date_inspection).toLocaleDateString('fr-FR')}</p>}
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Logement */}
          <section>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Informations logement</h4>
            <div className="grid grid-cols-3 gap-x-8 gap-y-2 text-sm">
              <DocField label="Résidence"  value={record.residence_nom || '—'} />
              <DocField label="Logement"   value={record.logement_numero || '—'} />
              {record.date_sortie_prevue && (
                <DocField label="Sortie prévue" value={new Date(record.date_sortie_prevue).toLocaleDateString('fr-FR')} />
              )}
            </div>
          </section>
          <hr className="border-slate-100" />

          {/* Occupant */}
          <section>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Occupant</h4>
            <div className="grid grid-cols-3 gap-x-8 gap-y-2 text-sm">
              <DocField label="Nom"    value={record.nom || '—'} />
              <DocField label="Prénom" value={record.prenom || '—'} />
            </div>
          </section>
          <hr className="border-slate-100" />

          {/* Checklist observations */}
          {checklistItems.length > 0 && (
            <>
              <section>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">État des éléments (checklist)</h4>
                <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-3 py-2 text-slate-500 font-semibold w-28">Pièce</th>
                      <th className="text-left px-3 py-2 text-slate-500 font-semibold w-36">Élément</th>
                      <th className="text-left px-3 py-2 text-slate-500 font-semibold">État constaté</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {checklistItems.map((item, i) => (
                      <tr key={i} className={item.opts.some(o => DEGRADED.has(o)) ? 'bg-orange-50/40' : ''}>
                        <td className="px-3 py-2 text-slate-500">{item.piece}</td>
                        <td className="px-3 py-2 font-medium text-slate-700">{item.element}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {item.opts.map(opt => (
                              <span key={opt} className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${DEGRADED.has(opt) ? 'bg-orange-100 text-orange-800 border-orange-300' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{opt}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
              <hr className="border-slate-100" />
            </>
          )}

          {/* Anomalies from record */}
          {record.anomalies.length > 0 && (
            <>
              <section>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Anomalies constatées</h4>
                <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-3 py-2 text-slate-500">Pièce</th>
                      <th className="text-left px-3 py-2 text-slate-500">Constat</th>
                      <th className="text-left px-3 py-2 text-slate-500">Gravité</th>
                      <th className="text-right px-3 py-2 text-slate-500">Estimation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {record.anomalies.map(a => (
                      <tr key={a.id}>
                        <td className="px-3 py-2 font-medium text-slate-700">{a.piece}</td>
                        <td className="px-3 py-2 text-slate-600">{a.description}</td>
                        <td className="px-3 py-2 capitalize text-slate-600">{GRAVITE_CFG[a.gravite].label}</td>
                        <td className="px-3 py-2 text-right font-semibold text-slate-700">{a.cout_estime > 0 ? `${a.cout_estime} €` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
              <hr className="border-slate-100" />
            </>
          )}

          {/* Réparations */}
          {reparationsItems.length > 0 && (
            <>
              <section>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Réparations à effectuer ({reparationsItems.length})</h4>
                <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-3 py-2 text-slate-500 font-semibold">Pièce</th>
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
              <hr className="border-slate-100" />
            </>
          )}

          {/* Estimation */}
          {(grandTotal > 0 || coutsItems.length > 0) && (
            <>
              <section>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Estimation des coûts</h4>
                {coutsItems.length > 0 && (
                  <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden mb-3">
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
                          <td className="px-3 py-2 text-right font-semibold">{item.valeur > 0 ? `${item.valeur.toLocaleString('fr-FR')} €` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Montant estimatif total</p>
                  <p className="text-2xl font-bold text-red-600">{grandTotal > 0 ? `${grandTotal.toLocaleString('fr-FR')} €` : '—'}</p>
                </div>
                <p className="text-xs text-slate-400 mt-2">Estimation indicative, non contractuelle. Pourra être révisée lors de l'EDL définitif.</p>
              </section>
              <hr className="border-slate-100" />
            </>
          )}

          {/* Observations */}
          {record.observations && (
            <>
              <section>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Observations</h4>
                <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-200">{record.observations}</p>
              </section>
              <hr className="border-slate-100" />
            </>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8">
            {(['agent', 'occupant'] as const).map(who => {
              const sig = who === 'agent' ? signatureAgent : signatureOccupant;
              const label = who === 'agent' ? "Signature de l'agent" : "Signature de l'étudiant";
              const name = who === 'agent' ? 'Agent CROUS' : `${record.prenom} ${record.nom}`.trim();
              return (
                <div key={who} className="space-y-1.5">
                  <p className="text-xs font-semibold text-slate-500">{label}</p>
                  <button
                    onClick={() => setSigTarget(who)}
                    className={`w-full h-20 rounded-xl border-2 transition-all group overflow-hidden ${
                      sig ? 'border-emerald-300 bg-emerald-50' : 'border-dashed border-slate-200 bg-slate-50 hover:border-amber-300 hover:bg-amber-50'
                    }`}
                  >
                    {sig ? (
                      <img src={sig} alt="signature" className="w-full h-full object-contain p-1" />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-300 group-hover:text-amber-500 transition-colors">
                        <PenLine className="w-5 h-5" />
                        <span className="text-[10px] font-semibold">Cliquer pour signer</span>
                      </div>
                    )}
                  </button>
                  <p className="text-xs text-slate-400">{name} — {new Date().toLocaleDateString('fr-FR')}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function InfoPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-slate-600">
      <span className="text-slate-400">{icon}</span>
      <span>{label}</span>
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
