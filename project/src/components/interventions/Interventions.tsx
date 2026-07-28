import { useState, useEffect, useCallback } from 'react';
import { Plus, LayoutDashboard, List, CalendarDays, GanttChartSquare, RefreshCw, Loader2, CheckCircle2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { type DemandeParsed, type StatutDI, type CriticiteDI } from './interventionsTypes';
import InterventionsDashboard from './InterventionsDashboard';
import DemandesListe from './DemandesListe';
import DemandeDetail from './DemandeDetail';
import NouvelleDemandeWizard from './NouvelleDemandeWizard';
import InterventionsPlanning from './InterventionsPlanning';
import InterventionsGantt from './InterventionsGantt';

type IntView = 'dashboard' | 'liste' | 'planning' | 'gantt';

// ─── Success Toast ────────────────────────────────────────────────────────────

function SuccessToast({ reference, onClose }: { reference: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-start gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl shadow-lg animate-[slideDown_0.3s_ease-out]"
      style={{ minWidth: 360, maxWidth: 560 }}
      role="status"
      aria-live="polite"
    >
      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-emerald-800">
          Demande d'intervention bien enregistrée
        </p>
        {reference && (
          <p className="text-xs text-emerald-600 font-mono mt-0.5">{reference}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-0.5 rounded-md text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 transition-colors"
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface Props {
  contextSiteId?: string;
  contextResidenceId?: string;
  contextBatimentId?: string;
}

export default function Interventions({ contextSiteId, contextResidenceId, contextBatimentId }: Props) {
  const [view, setView] = useState<IntView>('dashboard');
  const [demandes, setDemandes] = useState<DemandeParsed[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DemandeParsed | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [editDemande, setEditDemande] = useState<DemandeParsed | null>(null);
  const [prefilterStatuts, setPrefilterStatuts] = useState<StatutDI[]>([]);
  const [prefilterCriticite, setPrefilterCriticite] = useState<CriticiteDI[]>([]);
  const [prefilterRetard, setPrefilterRetard] = useState(false);
  const [toastRef, setToastRef] = useState<string | null>(null);
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('interventions')
      .select(`
        id, reference, titre, description, type_intervention, categorie, priorite, statut,
        statut_demande, criticite, sla_heures, canal_source,
        demandeur_nom, demandeur_email, demandeur_telephone, demandeur_type,
        site_id, residence_id, batiment_id, localisation_detail,
        agent_nom, prestataire, date_planifiee, cout, compte_rendu,
        date_qualification, date_affectation, date_resolution,
        tickets_count, draft_step, created_at, updated_at,
        sites(nom), residences(nom), batiments(nom)
      `)
      .not('reference', 'is', null)
      .order('created_at', { ascending: false });

    if (contextBatimentId) query = query.eq('batiment_id', contextBatimentId);
    else if (contextResidenceId) query = query.eq('residence_id', contextResidenceId);
    else if (contextSiteId) query = query.eq('site_id', contextSiteId);

    const { data, error } = await query;
    if (!error && data) {
      const parsed: DemandeParsed[] = data.map((row: any) => ({
        ...row,
        agent: row.agent_nom ?? null,
        statut_demande: row.statut_demande ?? 'nouveau',
        categorie: row.categorie ?? null,
        criticite: row.criticite ?? 'moyenne',
        sla_heures: row.sla_heures ?? 48,
        canal_source: row.canal_source ?? 'interne',
        demandeur_type: row.demandeur_type ?? 'interne',
        demandeur_telephone: row.demandeur_telephone ?? null,
        tickets_count: row.tickets_count ?? 0,
        draft_step: row.draft_step ?? null,
        site_nom: row.sites?.nom ?? null,
        residence_nom: row.residences?.nom ?? null,
        batiment_nom: row.batiments?.nom ?? null,
      }));
      setDemandes(parsed);
    } else if (error) {
      console.error('interventions load error:', error.message);
    }
    setLoading(false);
  }, [contextSiteId, contextResidenceId, contextBatimentId]);

  useEffect(() => { load(); }, [load]);

  function handleSelectDemande(d: DemandeParsed) {
    setSelected(d);
  }

  function handleBack() {
    setSelected(null);
  }

  function handleUpdated() {
    load().then(() => {
      // refresh selected from new data
      setDemandes(prev => {
        const refreshed = prev.find(d => d.id === selected?.id);
        if (refreshed) setSelected(refreshed);
        return prev;
      });
    });
  }

  function handleCreated(ref: string, id?: string) {
    load();
    if (ref) {
      setToastRef(ref);
      if (id) setNewlyCreatedId(id);
    }
  }

  async function handleSupprimerBrouillon(d: DemandeParsed) {
    if (!window.confirm(`Supprimer le brouillon "${d.titre}" ?`)) return;
    await supabase.from('interventions').delete().eq('id', d.id);
    load();
  }

  function goToListeWithStatut(statuts: StatutDI[]) {
    setPrefilterStatuts(statuts);
    setPrefilterCriticite([]);
    setPrefilterRetard(false);
    setView('liste');
  }

  function goToListeWithCriticite(criticites: CriticiteDI[]) {
    setPrefilterCriticite(criticites);
    setPrefilterStatuts([]);
    setPrefilterRetard(false);
    setView('liste');
  }

  function goToListeWithRetard() {
    setPrefilterRetard(true);
    setPrefilterStatuts([]);
    setPrefilterCriticite([]);
    setView('liste');
  }

  const isContextual = !!(contextSiteId || contextResidenceId || contextBatimentId);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Header */}
      {!selected && (
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-white border-b border-slate-100">
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            <button onClick={() => setView('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                view === 'dashboard' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              <LayoutDashboard className="w-3.5 h-3.5" />
              {!isContextual && 'Tableau de bord'}
            </button>
            <button onClick={() => setView('liste')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                view === 'liste' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              <List className="w-3.5 h-3.5" />
              {!isContextual && 'Liste'}
              {isContextual && <span className="ml-1 text-[10px] bg-slate-200 text-slate-600 rounded-full px-1.5 py-0.5">{demandes.length}</span>}
            </button>
            <button onClick={() => setView('planning')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                view === 'planning' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              <CalendarDays className="w-3.5 h-3.5" />
              {!isContextual && 'Planning'}
            </button>
            <button onClick={() => setView('gantt')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                view === 'gantt' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              <GanttChartSquare className="w-3.5 h-3.5" />
              {!isContextual && 'Gantt'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={load} disabled={loading}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setShowWizard(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Nouvelle demande
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading && demandes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
          </div>
        ) : selected ? (
          <div className="h-full bg-white">
            <DemandeDetail
              demande={selected}
              onBack={handleBack}
              onUpdated={handleUpdated}
            />
          </div>
        ) : view === 'dashboard' ? (
          <InterventionsDashboard
            demandes={demandes}
            onSelectDemande={(d) => { setSelected(d); }}
            onFilterByStatut={goToListeWithStatut}
            onFilterByCriticite={goToListeWithCriticite}
            onFilterByRetard={goToListeWithRetard}
          />
        ) : view === 'planning' ? (
          <div className="h-full">
            <InterventionsPlanning />
          </div>
        ) : view === 'gantt' ? (
          <div className="h-full">
            <InterventionsGantt />
          </div>
        ) : (
          <div className="h-full bg-white">
            <DemandesListe
              demandes={demandes}
              onSelectDemande={handleSelectDemande}
              onModifier={(d) => { setEditDemande(d); setShowWizard(true); }}
              onSupprimerBrouillon={handleSupprimerBrouillon}
              initialStatuts={prefilterStatuts}
              initialCriticite={prefilterCriticite}
              initialRetard={prefilterRetard}
              newlyCreatedId={newlyCreatedId}
              onRefresh={load}
            />
          </div>
        )}
      </div>

      {showWizard && (
        <NouvelleDemandeWizard
          onClose={() => { setShowWizard(false); setEditDemande(null); }}
          onCreated={(ref, id) => {
            handleCreated(ref, id);
            setShowWizard(false);
            setEditDemande(null);
            if (!editDemande) setView('liste');
          }}
          defaultSiteId={contextSiteId}
          defaultResidenceId={contextResidenceId}
          editDemande={editDemande}
        />
      )}

      {toastRef && (
        <SuccessToast reference={toastRef} onClose={() => setToastRef(null)} />
      )}
    </div>
  );
}
