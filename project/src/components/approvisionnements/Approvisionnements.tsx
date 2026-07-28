import { useState, useMemo } from 'react';
import {
  LayoutDashboard, Table2, Warehouse, Calendar, KanbanSquare,
  AlertTriangle, PackageX, ShoppingCart, Truck, Plus,
} from 'lucide-react';
import { computeApproKpis, MOCK_DEMANDES } from './approTypes';
import ApproDashboard from './ApproDashboard';
import ApproTableau   from './ApproTableau';
import ApproStock     from './ApproStock';
import ApproPlanning  from './ApproPlanning';
import ApproKanban    from './ApproKanban';
import NouvelleDemandeModal from './NouvelleDemandeModal';

type SubView = 'dashboard' | 'tableau' | 'stock' | 'planning' | 'kanban';

interface NavItem { id: SubView; label: string; icon: React.ElementType; badge?: number; badgeColor?: string }

export default function Approvisionnements() {
  const [view, setView] = useState<SubView>('dashboard');
  const [showNewDemande, setShowNewDemande] = useState(false);

  const kpis = useMemo(() => computeApproKpis(), []);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'tableau',   label: 'Tableau',          icon: Table2 },
    {
      id: 'stock', label: 'Vue Stock', icon: Warehouse,
      badge: kpis.ruptures > 0 ? kpis.ruptures : kpis.stocks_faibles > 0 ? kpis.stocks_faibles : undefined,
      badgeColor: kpis.ruptures > 0 ? 'bg-red-500' : 'bg-amber-500',
    },
    {
      id: 'planning', label: 'Planning', icon: Calendar,
      badge: MOCK_DEMANDES.filter(d => d.date_livraison_prevue).length || undefined,
      badgeColor: 'bg-blue-500',
    },
    {
      id: 'kanban', label: 'Kanban', icon: KanbanSquare,
      badge: kpis.demandes_en_attente > 0 ? kpis.demandes_en_attente : undefined,
      badgeColor: 'bg-amber-500',
    },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Sub-nav */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-white px-4">
        <div className="flex items-center gap-0.5">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setView(item.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all
                ${view === item.id ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
              <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
              {item.label}
              {item.badge != null && (
                <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold ${item.badgeColor ?? 'bg-slate-400'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          {/* Right side: API indicator + CTA */}
          <div className="ml-auto flex items-center gap-2 py-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-400 hidden sm:inline">dev.lescrous.fr</span>
            </div>
            <button
              onClick={() => setShowNewDemande(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm whitespace-nowrap">
              <Plus className="w-3.5 h-3.5" />
              Demande d'achat
            </button>
          </div>
        </div>
      </div>

      {/* Critical alert strip */}
      {(kpis.ruptures > 0 || kpis.interventions_bloquees > 0) && (
        <div className="flex-shrink-0 bg-red-50 border-b border-red-200 px-4 py-2 flex items-center gap-3 flex-wrap">
          <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
          <div className="flex items-center gap-4 text-xs flex-wrap">
            {kpis.ruptures > 0 && (
              <button onClick={() => setView('stock')} className="flex items-center gap-1.5 text-red-700 font-semibold hover:underline">
                <PackageX className="w-3.5 h-3.5" />{kpis.ruptures} rupture{kpis.ruptures > 1 ? 's' : ''} de stock
              </button>
            )}
            {kpis.interventions_bloquees > 0 && (
              <button onClick={() => setView('kanban')} className="flex items-center gap-1.5 text-red-700 font-semibold hover:underline">
                <ShoppingCart className="w-3.5 h-3.5" />{kpis.interventions_bloquees} intervention{kpis.interventions_bloquees > 1 ? 's' : ''} à risque
              </button>
            )}
            {kpis.commandes_en_cours > 0 && (
              <button onClick={() => setView('planning')} className="flex items-center gap-1.5 text-blue-700 font-medium hover:underline">
                <Truck className="w-3.5 h-3.5" />{kpis.commandes_en_cours} commande{kpis.commandes_en_cours > 1 ? 's' : ''} en cours
              </button>
            )}
          </div>
        </div>
      )}

      {/* View */}
      <div className="flex-1 overflow-hidden">
        {view === 'dashboard' && <ApproDashboard onNavigate={v => setView(v as SubView)} />}
        {view === 'tableau'   && <ApproTableau />}
        {view === 'stock'     && <ApproStock />}
        {view === 'planning'  && <ApproPlanning />}
        {view === 'kanban'    && <ApproKanban />}
      </div>

      {/* New demande modal */}
      {showNewDemande && (
        <NouvelleDemandeModal
          onClose={() => setShowNewDemande(false)}
          onSubmit={(_data) => {
            // In a real app: insert into Supabase appro_demandes table
            setShowNewDemande(false);
          }}
        />
      )}
    </div>
  );
}
