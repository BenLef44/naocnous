import { useState } from 'react';
import {
  Users, Shield, Key, Map, LayoutDashboard, MessageSquare, Settings, BookOpen, ChevronRight, Library,
} from 'lucide-react';
import type { ConfigSection } from './configTypes';
import ConfigUtilisateurs from './ConfigUtilisateurs';
import ConfigProfils from './ConfigProfils';
import ConfigBibliotheque from './ConfigBibliotheque';
import ConfigHabilitations from './ConfigHabilitations';
import ConfigPerimetres from './ConfigPerimetres';
import ConfigDashboards from './ConfigDashboards';
import ConfigJournal from './ConfigJournal';
import ConfigParametres from './ConfigParametres';

interface NavItem {
  id: ConfigSection;
  label: string;
  icon: React.ElementType;
  description: string;
}

const NAV: NavItem[] = [
  { id: 'utilisateurs',  label: 'Utilisateurs',           icon: Users,          description: 'Gérer les comptes et accès' },
  { id: 'profils',       label: 'Profils & rôles',        icon: Shield,         description: 'Rôles métiers et permissions' },
  { id: 'bibliotheque',  label: 'Bibliothèque de rôles',  icon: Library,        description: 'Modèles de rôles standardisés' },
  { id: 'habilitations', label: 'Habilitations',          icon: Key,            description: 'Droits fins par module' },
  { id: 'perimetres',    label: 'Périmètres',             icon: Map,            description: 'Territoire et organisation' },
  { id: 'dashboards',    label: 'Tableaux de bord',       icon: LayoutDashboard,description: 'Dashboards et widgets' },
  { id: 'communication', label: 'Centre de communication',icon: MessageSquare,  description: 'Modèles et règles de notif.' },
  { id: 'parametres',    label: 'Paramètres généraux',    icon: Settings,       description: 'Configuration de la plateforme' },
  { id: 'journal',       label: "Journal d'admin",        icon: BookOpen,       description: 'Traçabilité des modifications' },
];

export default function Configuration() {
  const [section, setSection] = useState<ConfigSection>('utilisateurs');

  const current = NAV.find(n => n.id === section)!;

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden">

      {/* Left sub-nav */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col">
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
              <Settings className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 leading-none">Configuration</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Administration</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all group ${
                section === item.id
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${section === item.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className="text-sm font-medium truncate">{item.label}</span>
              {section === item.id && <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-300" />}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sub-header */}
        <div className="flex-shrink-0 bg-white border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <current.icon className="w-5 h-5 text-slate-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">{current.label}</h2>
              <p className="text-xs text-slate-400">{current.description}</p>
            </div>
          </div>
        </div>

        {/* Module content */}
        <div className="flex-1 overflow-auto">
          {section === 'utilisateurs'  && <ConfigUtilisateurs />}
          {section === 'profils'       && <ConfigProfils />}
          {section === 'bibliotheque'  && <ConfigBibliotheque />}
          {section === 'habilitations' && <ConfigHabilitations />}
          {section === 'perimetres'    && <ConfigPerimetres />}
          {section === 'dashboards'    && <ConfigDashboards />}
          {section === 'communication' && <ConfigCommunicationRedirect />}
          {section === 'parametres'    && <ConfigParametres />}
          {section === 'journal'       && <ConfigJournal />}
        </div>
      </div>
    </div>
  );
}

function ConfigCommunicationRedirect() {
  return (
    <div className="p-6">
      <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 flex items-start gap-3">
        <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Centre de communication</p>
          <p className="text-xs text-blue-600 mt-1">
            Configurez les modèles de messages, règles d'escalade et notifications depuis le module Centre de communication dans la barre latérale principale.
          </p>
        </div>
      </div>
    </div>
  );
}
