import { useState } from 'react';
import {
  LayoutDashboard, Bell, MessageSquare, Zap, Users, AlertTriangle,
  FileText, History, BarChart3,
} from 'lucide-react';
import type { CommView } from './commTypes';
import CommDashboard     from './CommDashboard';
import CommNotifications from './CommNotifications';
import CommModeles       from './CommModeles';
import CommRegles        from './CommRegles';
import CommEscalades     from './CommEscalades';
import CommSyntheses     from './CommSyntheses';
import CommHistorique    from './CommHistorique';
import CommStats         from './CommStats';

const NAV: { id: CommView; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: 'dashboard',      label: 'Tableau de bord',          icon: LayoutDashboard },
  { id: 'notifications',  label: 'Notifications',            icon: Bell,            badge: 5 },
  { id: 'modeles',        label: 'Modèles',                  icon: MessageSquare   },
  { id: 'regles',         label: 'Règles de déclenchement',  icon: Zap             },
  { id: 'destinataires',  label: 'Destinataires',            icon: Users           },
  { id: 'escalades',      label: 'Escalades',                icon: AlertTriangle   },
  { id: 'syntheses',      label: 'Synthèses',                icon: FileText        },
  { id: 'historique',     label: 'Historique',               icon: History         },
  { id: 'statistiques',   label: 'Statistiques',             icon: BarChart3       },
];

export default function CommCenter() {
  const [view, setView] = useState<CommView>('dashboard');

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
      {/* Module header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800">Centre de communication</h1>
            <p className="text-xs text-slate-400">Moteur transversal de notifications, emails et escalades</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar nav */}
        <div className="w-52 bg-white border-r border-slate-200 flex-shrink-0 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          <nav className="px-2 py-3 space-y-0.5">
            {NAV.map(item => {
              const active = view === item.id;
              // Destinataires has no dedicated screen yet
              if (item.id === 'destinataires') {
                return (
                  <button key={item.id} disabled
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-slate-400 cursor-not-allowed">
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                    <span className="ml-auto text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">Bientôt</span>
                  </button>
                );
              }
              return (
                <button key={item.id} onClick={() => setView(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl transition-colors ${active ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100 font-medium'}`}>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                  {item.badge && !active && (
                    <span className="ml-auto text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col bg-white">
          {view === 'dashboard'     && <CommDashboard />}
          {view === 'notifications' && <CommNotifications />}
          {view === 'modeles'       && <CommModeles />}
          {view === 'regles'        && <CommRegles />}
          {view === 'escalades'     && <CommEscalades />}
          {view === 'syntheses'     && <CommSyntheses />}
          {view === 'historique'    && <CommHistorique />}
          {view === 'statistiques'  && <CommStats />}
        </div>
      </div>
    </div>
  );
}
