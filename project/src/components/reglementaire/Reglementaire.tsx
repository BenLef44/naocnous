import { useState, useRef, useEffect } from 'react';
import { ShieldCheck, LayoutDashboard, Table2, CalendarDays, Plus, X, Check, ChevronRight, BookOpen, ChevronDown, FileText } from 'lucide-react';
import RegistreSecurite from '../registre/RegistreSecurite';
import { RegleView, RegleFilters, EMPTY_FILTERS } from './types';
import { useControles } from './useControles';
import ReglementaireDashboard from './ReglementaireDashboard';
import ReglementaireTableau from './ReglementaireTableau';
import ReglementairePlanning from './ReglementairePlanning';
import ReglementaireSidebar, { TYPE_CONTROLES } from './ReglementaireSidebar';
import NouveauControleStep2 from './NouveauControleStep2';

import { supabase } from '../../lib/supabase';

const AMIANTE_KEY = 'Amiante / DTA';

interface ReglementaireProps {
  selectedTypes: string[];
  onChangeTypes: (types: string[]) => void;
  onViewChange?: (view: RegleView) => void;
  assigneeSelection?: { prestataires: Set<string>; agents: Set<string> };
}

type ModalStep = 'type' | 'detail';

export default function Reglementaire({ selectedTypes, onChangeTypes: setSelectedTypes, onViewChange, assigneeSelection }: ReglementaireProps) {
  const [view, setView] = useState<RegleView>('dashboard');
  const [filters, setFilters] = useState<RegleFilters>(EMPTY_FILTERS);
  const [selectedSiteNames, setSelectedSiteNames] = useState<string[]>([]);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [registreRequest, setRegistreRequest] = useState(0);
  const createMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!createMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setCreateMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [createMenuOpen]);

  const handleNewControle = () => {
    setCreateMenuOpen(false);
    if (view !== 'tableau') setView('tableau');
    openNewForm();
  };

  const handleNewRegistre = () => {
    setCreateMenuOpen(false);
    setView('registre');
    setRegistreRequest(r => r + 1);
  };

  const handleSetView = (v: RegleView) => {
    setView(v);
    onViewChange?.(v);
  };
  const { controles, loading, reload } = useControles(filters);

  // Modal state
  const [modalStep, setModalStep] = useState<ModalStep>('type');
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedTypeKey, setSelectedTypeKey] = useState<string>('');
  const [newForm, setNewForm] = useState({ type_controle_id: '', organisme: '', date_prochain_controle: '', statut: 'a_venir' });
  const [typeControles, setTypeControles] = useState<{ id: string; nom: string; categorie: string }[]>([]);
  const [batiments, setBatiments] = useState<{ id: string; nom: string }[]>([]);
  const [selectedBatId, setSelectedBatId] = useState('');

  const openNewForm = async () => {
    const [{ data: tc }, { data: bats }] = await Promise.all([
      supabase.from('types_controle').select('id, nom, categorie').order('categorie').order('nom'),
      supabase.from('batiments').select('id, nom').order('nom'),
    ]);
    setTypeControles(tc || []);
    setBatiments(bats || []);
    setSelectedTypeKey('');
    setNewForm({ type_controle_id: '', organisme: '', date_prochain_controle: '', statut: 'a_venir' });
    setSelectedBatId('');
    setModalStep('type');
    setShowNewForm(true);
  };

  const closeModal = () => {
    setShowNewForm(false);
    setSelectedTypeKey('');
    setNewForm({ type_controle_id: '', organisme: '', date_prochain_controle: '', statut: 'a_venir' });
    setSelectedBatId('');
  };

  const handleSelectType = (key: string) => {
    setSelectedTypeKey(key);
    // Auto-match with supabase type_controle if available
    const match = typeControles.find(tc => tc.nom.includes(key) || key.includes(tc.nom));
    setNewForm(f => ({ ...f, type_controle_id: match?.id || '' }));
  };

  const handleCreate = async () => {
    await supabase.from('controles_reglementaires').insert([{
      ...newForm,
      batiment_id: selectedBatId || null,
      date_prochain_controle: newForm.date_prochain_controle || null,
    }]);
    closeModal();
    reload();
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Module Header */}
      <div className="px-6 py-4 bg-white border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Suivi Réglementaire</h1>
              {selectedTypes.length === 0 ? (
                <p className="text-xs text-slate-400">Contrôles périodiques obligatoires — {controles.length} contrôle{controles.length !== 1 ? 's' : ''}</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedTypes.map(key => {
                    const type = TYPE_CONTROLES.find(t => t.key === key);
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-sm font-medium text-emerald-700"
                      >
                        <span className="text-base leading-none">{type?.icon}</span>
                        <span>{key}</span>
                        <button
                          onClick={() => setSelectedTypes(selectedTypes.filter(t => t !== key))}
                          className="ml-0.5 hover:text-emerald-900 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Vue toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
              <button
                onClick={() => handleSetView('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'dashboard' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Tableau de bord
              </button>
              <button
                onClick={() => handleSetView('tableau')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'tableau' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Table2 className="w-3.5 h-3.5" />
                Vue tableau
              </button>
              <button
                onClick={() => handleSetView('planning')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'planning' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                Vue planning
              </button>
              <button
                onClick={() => handleSetView('registre')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'registre' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Registre de sécurité
              </button>
            </div>

            {/* Split-button: always visible, offers both actions */}
            <div ref={createMenuRef} className="relative">
              <div className="flex items-stretch rounded-lg overflow-hidden shadow-sm">
                <button
                  onClick={handleNewControle}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau contrôle
                </button>
                <button
                  onClick={() => setCreateMenuOpen(o => !o)}
                  className={`flex items-center px-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors border-l border-emerald-500/30 ${createMenuOpen ? 'bg-emerald-700' : ''}`}
                  aria-label="Plus d'options de création"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${createMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>
              {createMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Créer</span>
                  </div>
                  <button
                    onClick={handleNewControle}
                    className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-emerald-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Nouveau contrôle</p>
                      <p className="text-[11px] text-slate-400">Point de contrôle réglementaire</p>
                    </div>
                  </button>
                  <button
                    onClick={handleNewRegistre}
                    className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-blue-50 transition-colors text-left border-t border-slate-50"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Nouveau registre de sécurité</p>
                      <p className="text-[11px] text-slate-400">Registre ERP avec signatures</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main area: sidebar + content */}
      {view === 'registre' ? (
        <div className="flex-1 overflow-hidden">
          <RegistreSecurite requestNewRegistre={registreRequest} />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <ReglementaireSidebar
            selectedSiteIds={filters.siteIds}
            onChangeSelectedSiteIds={(ids) => setFilters((f) => ({ ...f, siteIds: ids }))}
            onChangeSelectedSiteNames={setSelectedSiteNames}
          />

          {/* Content */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
                <p className="text-sm">Chargement des contrôles...</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {view === 'dashboard' && <div className="flex-1 overflow-auto"><ReglementaireDashboard controles={controles} selectedTypes={selectedTypes} selectedSiteIds={filters.siteIds} /></div>}
              {view === 'tableau'   && <ReglementaireTableau controles={controles} onUpdate={reload} selectedTypes={selectedTypes} selectedSiteNames={selectedSiteNames} />}
              {view === 'planning'  && <ReglementairePlanning controles={controles} selectedTypes={selectedTypes} selectedSiteNames={selectedSiteNames} selectedAssignees={assigneeSelection ?? { prestataires: new Set(), agents: new Set() }} />}
            </div>
          )}
        </div>
      )}

      {/* New controle modal */}
      {showNewForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">

          {/* ── Step 1: Choose type ─────────────────────────────────────────── */}
          {modalStep === 'type' && (
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Nouveau contrôle — Étape 1/2</span>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-800">Choisir le type de contrôle</h2>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Grid of type cards */}
              <div className="overflow-y-auto flex-1 px-6 py-5">
                <div className="grid grid-cols-4 gap-3">
                  {TYPE_CONTROLES.map((t) => {
                    const isSelected = selectedTypeKey === t.key;
                    return (
                      <button
                        key={t.key}
                        onClick={() => handleSelectType(t.key)}
                        className={`flex flex-col items-center justify-center gap-3 px-3 py-5 rounded-2xl border-2 transition-all duration-150 text-center group ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100'
                            : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-sm'
                        }`}
                      >
                        <span className={`text-4xl leading-none transition-transform duration-150 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                          {t.icon}
                        </span>
                        <span className={`text-xs font-semibold leading-tight ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>
                          {t.key}
                        </span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-white" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="px-7 py-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
                <button onClick={closeModal} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  Annuler
                </button>
                <button
                  onClick={() => selectedTypeKey && setModalStep('detail')}
                  disabled={!selectedTypeKey}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Suivant
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Detail form ─────────────────────────────────────────── */}
          {modalStep === 'detail' && (() => {
            const typeInfo = TYPE_CONTROLES.find(t => t.key === selectedTypeKey);

            // Dedicated DTA form for Amiante / DTA
            if (selectedTypeKey === AMIANTE_KEY) {
              return (
                <NouveauControleStep2
                  typeLabel={selectedTypeKey}
                  typeIcon={typeInfo?.icon ?? '😷'}
                  onClose={closeModal}
                  onSaved={() => { closeModal(); reload(); }}
                />
              );
            }

            // Generic form for all other types
            return (
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex-shrink-0">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Nouveau contrôle — Étape 2/2</span>
                    <button onClick={closeModal} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                    <span className="text-3xl leading-none">{typeInfo?.icon}</span>
                    <div>
                      <p className="text-xs text-emerald-600 font-medium">Type sélectionné</p>
                      <p className="text-sm font-semibold text-emerald-800">{selectedTypeKey}</p>
                    </div>
                    <button
                      onClick={() => setModalStep('type')}
                      className="ml-auto text-xs text-emerald-600 hover:text-emerald-800 underline underline-offset-2 transition-colors"
                    >
                      Modifier
                    </button>
                  </div>
                </div>

                {/* Form */}
                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
                  {typeControles.length > 0 && (
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Sous-type (optionnel)</label>
                      <select
                        value={newForm.type_controle_id}
                        onChange={(e) => setNewForm({ ...newForm, type_controle_id: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      >
                        <option value="">Sélectionner un sous-type...</option>
                        {typeControles
                          .filter(tc => tc.nom.toLowerCase().includes(selectedTypeKey.toLowerCase().split('/')[0].trim()) || selectedTypeKey.toLowerCase().includes(tc.categorie?.toLowerCase() || ''))
                          .map((tc) => (
                            <option key={tc.id} value={tc.id}>{tc.nom}</option>
                          ))
                        }
                        <optgroup label="Tous les types">
                          {typeControles.map((tc) => (
                            <option key={`all-${tc.id}`} value={tc.id}>{tc.categorie} — {tc.nom}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Bâtiment</label>
                    <select
                      value={selectedBatId}
                      onChange={(e) => setSelectedBatId(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    >
                      <option value="">Sélectionner...</option>
                      {batiments.map((b) => <option key={b.id} value={b.id}>{b.nom}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Organisme de contrôle</label>
                    <input
                      value={newForm.organisme}
                      onChange={(e) => setNewForm({ ...newForm, organisme: e.target.value })}
                      placeholder="APAVE, SOCOTEC, DEKRA..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Prochain contrôle</label>
                      <input
                        type="date"
                        value={newForm.date_prochain_controle}
                        onChange={(e) => setNewForm({ ...newForm, date_prochain_controle: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Statut</label>
                      <select
                        value={newForm.statut}
                        onChange={(e) => setNewForm({ ...newForm, statut: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      >
                        <option value="manquant">Manquant</option>
                        <option value="a_venir">À venir</option>
                        <option value="en_retard">En retard</option>
                        <option value="realise">Réalisé</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0">
                  <button
                    onClick={() => setModalStep('type')}
                    className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    <Check className="w-4 h-4" /> Créer le contrôle
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
