import React, { useEffect, useState } from 'react';
import { LayoutDashboard, List, CalendarDays, CalendarClock, Plus, ClipboardCheck, ClipboardX } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { EdlRecord, PreEdlRecord, EdlType, DEMO_PRE_EDL } from './edlTypes';
import EdlDashboard from './EdlDashboard';
import EdlListe from './EdlListe';
import EdlPlanning from './EdlPlanning';
import PreEdlFiche from './PreEdlFiche';
import EdlFiche from './EdlFiche';

type EdlView = 'dashboard' | 'liste' | 'planning';

export default function EtatsDesLieux() {
  const [view, setView]           = useState<EdlView>('dashboard');
  const [records, setRecords]     = useState<EdlRecord[]>([]);
  const [loading, setLoading]     = useState(true);

  // Pré-EDL state (demo data — no DB table yet)
  const [preEdlRecords, setPreEdlRecords] = useState<PreEdlRecord[]>(DEMO_PRE_EDL);
  const [openPreEdl, setOpenPreEdl]       = useState<PreEdlRecord | null | 'new'>(null);

  // EDL Fiche (create / view)
  const [openEdlFiche, setOpenEdlFiche]     = useState<{ record: EdlRecord | null; type: EdlType } | null>(null);

  useEffect(() => { loadEdl(); }, []);

  async function loadEdl() {
    setLoading(true);
    const { data, error } = await supabase
      .from('occupants')
      .select(`
        id,
        logement_id,
        nom,
        prenom,
        photo_url,
        etablissement,
        type_contrat,
        date_entree,
        date_sortie_prevue,
        statut_edl_entrant,
        date_edl_entrant,
        lien_edl_entrant,
        agent_edl_entrant,
        statut_edl_sortant,
        date_edl_sortant,
        lien_edl_sortant,
        agent_edl_sortant,
        logements (
          numero,
          type_logement,
          surface,
          etages ( numero, nom, batiments ( nom, residences ( nom ) ) )
        )
      `)
      .order('nom');

    if (!error && data) {
      const rows: EdlRecord[] = [];
      for (const occ of data) {
        const logement = occ.logements as any;
        const logement_numero = logement?.numero ?? '—';
        const etage           = logement?.etages;
        const batiment        = etage?.batiments;
        const residence       = batiment?.residences;
        const residence_nom   = residence?.nom ?? '—';
        const batiment_nom    = batiment?.nom ?? null;
        const etage_numero    = etage?.numero ?? null;
        const type_logement   = logement?.type_logement ?? null;
        const surface_m2      = logement?.surface ?? null;

        if (occ.statut_edl_entrant && occ.statut_edl_entrant !== 'non_applicable') {
          rows.push({
            id: `${occ.id}-entrant`,
            occupant_id: occ.id,
            logement_id: occ.logement_id,
            nom: occ.nom,
            prenom: occ.prenom,
            logement_numero,
            residence_nom,
            type: 'entrant',
            statut: occ.statut_edl_entrant,
            date: occ.date_edl_entrant ?? occ.date_entree ?? null,
            lien: occ.lien_edl_entrant ?? null,
            date_entree: occ.date_entree ?? null,
            date_sortie_prevue: occ.date_sortie_prevue ?? null,
            etablissement: occ.etablissement ?? null,
            type_contrat: occ.type_contrat ?? null,
            batiment_nom,
            etage_numero,
            type_logement,
            surface_m2,
            photo_url: occ.photo_url ?? null,
            agent_edl: occ.agent_edl_entrant ?? null,
          });
        }

        if (occ.statut_edl_sortant && occ.statut_edl_sortant !== 'non_applicable') {
          rows.push({
            id: `${occ.id}-sortant`,
            occupant_id: occ.id,
            logement_id: occ.logement_id,
            nom: occ.nom,
            prenom: occ.prenom,
            logement_numero,
            residence_nom,
            type: 'sortant',
            statut: occ.statut_edl_sortant,
            date: occ.date_edl_sortant ?? occ.date_sortie_prevue ?? null,
            lien: occ.lien_edl_sortant ?? null,
            date_entree: occ.date_entree ?? null,
            date_sortie_prevue: occ.date_sortie_prevue ?? null,
            etablissement: occ.etablissement ?? null,
            type_contrat: occ.type_contrat ?? null,
            batiment_nom,
            etage_numero,
            type_logement,
            surface_m2,
            photo_url: occ.photo_url ?? null,
            agent_edl: occ.agent_edl_sortant ?? null,
          });
        }
      }
      setRecords(rows);
    }
    setLoading(false);
  }

  function handleUpdatePreEdlStatut(id: string, statut: PreEdlRecord['statut']) {
    setPreEdlRecords(prev => prev.map(r => r.id === id ? { ...r, statut } : r));
    if (openPreEdl?.id === id) setOpenPreEdl(prev => prev ? { ...prev, statut } : null);
  }

  const activePreEdlCount = preEdlRecords.filter(r => r.statut !== 'clos').length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Sub-header with tabs */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          <TabBtn active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<LayoutDashboard className="w-3.5 h-3.5" />} label="Tableau de bord" />
          <TabBtn active={view === 'liste'}     onClick={() => setView('liste')}     icon={<List            className="w-3.5 h-3.5" />} label="Liste" />
          <TabBtn active={view === 'planning'}  onClick={() => setView('planning')}  icon={<CalendarDays    className="w-3.5 h-3.5" />} label="Planning" />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpenEdlFiche({ record: null, type: 'entrant' })}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <ClipboardCheck className="w-3.5 h-3.5" />
            Créer un EDL
          </button>
          <button
            onClick={() => setOpenPreEdl('new')}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
          >
            <CalendarClock className="w-3.5 h-3.5" />
            Créer un Pré-EDL
            {activePreEdlCount > 0 && (
              <span className="bg-amber-400 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{activePreEdlCount}</span>
            )}
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-600">{records.length}</span> états des lieux
        </div>
      </div>

      {view === 'dashboard' && (
        <EdlDashboard
          records={records}
          preEdlRecords={preEdlRecords}
          loading={loading}
          onOpenPreEdl={setOpenPreEdl}
          onCreatePreEdl={() => setOpenPreEdl('new')}
        />
      )}
      {view === 'liste' && (
        <EdlListe
          records={records}
          preEdlRecords={preEdlRecords}
          loading={loading}
          onOpenPreEdl={setOpenPreEdl}
          onCreatePreEdl={() => setOpenPreEdl('new')}
          onOpenEdl={r => setOpenEdlFiche({ record: r, type: r.type })}
        />
      )}
      {view === 'planning' && (
        <EdlPlanning
          records={records}
          preEdlRecords={preEdlRecords}
          onOpenPreEdl={setOpenPreEdl}
          onOpenEdlFiche={r => setOpenEdlFiche({ record: r, type: r.type })}
        />
      )}

      {/* Pre-EDL fiche modal */}
      {openPreEdl && (
        <PreEdlFiche
          record={openPreEdl === 'new' ? undefined : openPreEdl}
          onClose={() => setOpenPreEdl(null)}
          onUpdateStatut={handleUpdatePreEdlStatut}
        />
      )}

      {/* EDL Fiche modal */}
      {openEdlFiche && (
        <EdlFiche
          record={openEdlFiche.record}
          defaultType={openEdlFiche.type}
          onClose={() => setOpenEdlFiche(null)}
          onSaved={() => { setOpenEdlFiche(null); loadEdl(); }}
        />
      )}
    </div>
  );
}

function TabBtn({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${active ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
    >
      {icon}{label}
    </button>
  );
}
