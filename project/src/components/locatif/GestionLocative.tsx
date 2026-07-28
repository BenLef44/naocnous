import { useState, useEffect, useCallback } from 'react';
import { Home, LayoutDashboard, List, Plus, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Bail } from './locatifTypes';
import BauxDashboard from './BauxDashboard';
import BauxTableau from './BauxTableau';
import BailDetail from './BailDetail';

type LocView = 'dashboard' | 'tableau' | 'detail' | 'create';

interface GestionLocativeProps {
  onNavigateToLogement?: (logementId: string) => void;
  onNavigateToEDL?: (bailId: string) => void;
}

export default function GestionLocative({ onNavigateToLogement, onNavigateToEDL }: GestionLocativeProps = {}) {
  const [view, setView]             = useState<LocView>('dashboard');
  const [baux, setBaux]             = useState<Bail[]>([]);
  const [loading, setLoading]       = useState(true);
  const [selectedBail, setSelected] = useState<Bail | null>(null);
  const [detailMode, setDetailMode] = useState<'view' | 'edit' | 'create'>('view');

  const fetchBaux = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('baux')
      .select('*')
      .order('reference', { ascending: true });
    if (!error && data) setBaux(data as Bail[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBaux(); }, [fetchBaux]);

  function openView(bail: Bail) {
    setSelected(bail);
    setDetailMode('view');
    setView('detail');
  }

  function openEdit(bail: Bail) {
    setSelected(bail);
    setDetailMode('edit');
    setView('detail');
  }

  function openCreate() {
    setSelected(null);
    setDetailMode('create');
    setView('create');
  }

  function closeDetail() {
    setView('tableau');
    setSelected(null);
  }

  const TABS: { id: LocView; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'tableau',   label: 'Baux',             icon: List            },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      {view !== 'detail' && view !== 'create' && (
        <div className="flex-shrink-0 px-5 py-3 bg-white border-b border-slate-100 flex items-center gap-3">
          <Home className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <h1 className="text-base font-semibold text-slate-800">Gestion locative</h1>
          <span className="text-xs text-slate-400 font-normal">
            {!loading && `(${baux.length} bail${baux.length > 1 ? 'x' : ''})`}
          </span>
          <div className="flex-1" />

          {/* Tabs */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setView(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  view === t.id
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchBaux()}
            disabled={loading}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouveau bail
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && view !== 'detail' && view !== 'create' && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-sm">Chargement des baux...</p>
          </div>
        </div>
      )}

      {/* Views */}
      {!loading && view === 'dashboard' && (
        <BauxDashboard
          baux={baux}
          onCreateBail={openCreate}
          onViewBail={openView}
        />
      )}

      {!loading && view === 'tableau' && (
        <BauxTableau
          baux={baux}
          onViewBail={openView}
          onEditBail={openEdit}
          onCreateBail={openCreate}
        />
      )}

      {(view === 'detail' || view === 'create') && (
        <BailDetail
          bail={selectedBail}
          mode={detailMode}
          onClose={closeDetail}
          onSaved={() => { fetchBaux(); closeDetail(); }}
          onNavigateToLogement={onNavigateToLogement}
          onNavigateToEDL={onNavigateToEDL}
        />
      )}
    </div>
  );
}
