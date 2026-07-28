import { useState } from 'react';
import { LayoutDashboard, Plus, Share2, Eye, CreditCard as Edit2, Wrench, Shield, Package, FileText, Building2, BarChart2, Zap } from 'lucide-react';

interface DashboardCard {
  id: string;
  nom: string;
  description: string;
  categorie: 'mes' | 'partages' | 'metiers' | 'modeles';
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  widgets: string[];
  profil?: string;
}

const DASHBOARDS: DashboardCard[] = [
  {
    id: 'maintenance',
    nom: 'Dashboard Maintenance',
    description: 'Suivi opérationnel des interventions et équipes',
    categorie: 'metiers',
    icon: Wrench,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    widgets: ['Interventions en cours', 'Interventions en retard', 'Maintenance préventive', 'Disponibilité équipes'],
    profil: 'Agent maintenance · Responsable maintenance',
  },
  {
    id: 'reglementaire',
    nom: 'Dashboard Réglementaire',
    description: 'Contrôles, conformités et actions correctives',
    categorie: 'metiers',
    icon: Shield,
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    widgets: ['Contrôles à venir', 'Contrôles échus', 'Non-conformités', 'Actions correctives'],
    profil: 'Responsable réglementaire',
  },
  {
    id: 'approvisionnements',
    nom: 'Dashboard Approvisionnements',
    description: 'Stocks, commandes et ruptures',
    categorie: 'metiers',
    icon: Package,
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    widgets: ['Stocks critiques', 'Demandes d\'achat', 'Commandes en attente', 'Ruptures'],
    profil: 'Gestionnaire approvisionnements',
  },
  {
    id: 'contrats',
    nom: 'Dashboard Contrats',
    description: 'Contrats actifs, renouvellements et montants',
    categorie: 'metiers',
    icon: FileText,
    iconColor: 'text-violet-600',
    bgColor: 'bg-violet-50',
    widgets: ['Contrats actifs', 'Contrats à renouveler', 'Contrats expirants', 'Montants engagés'],
    profil: 'Direction · Gestionnaire patrimoine',
  },
  {
    id: 'direction',
    nom: 'Dashboard Direction',
    description: 'Vue stratégique du patrimoine et des risques',
    categorie: 'metiers',
    icon: Building2,
    iconColor: 'text-slate-600',
    bgColor: 'bg-slate-50',
    widgets: ['État du patrimoine', 'Budget consommé', 'Coûts maintenance', 'Conformité', 'Risques majeurs'],
    profil: 'Direction · Gestionnaire patrimoine',
  },
];

const WIDGET_CATEGORIES = [
  {
    label: 'KPI',
    icon: Zap,
    items: ['Alertes actives', 'Contrats à échéance', 'Interventions en cours', 'Non-conformités ouvertes'],
  },
  {
    label: 'Graphiques',
    icon: BarChart2,
    items: ['Courbe d\'évolution', 'Barres par catégorie', 'Camembert par statut', 'Heatmap planning'],
  },
  {
    label: 'Listes',
    icon: LayoutDashboard,
    items: ['Actions en retard', 'Contrats à échéance', 'Équipements critiques', 'Interventions récentes'],
  },
  {
    label: 'IA',
    icon: Zap,
    items: ['Suggestions IA', 'Risques détectés', 'Prévisions maintenance'],
  },
];

const CATEGORIES = [
  { id: 'mes',      label: 'Mes tableaux de bord',  desc: 'Créés par vous' },
  { id: 'partages', label: 'Tableaux partagés',      desc: 'Partagés avec vous' },
  { id: 'metiers',  label: 'Tableaux métiers',       desc: 'Fournis par défaut' },
  { id: 'modeles',  label: 'Modèles',                desc: 'Bibliothèque de modèles' },
] as const;

export default function ConfigDashboards() {
  const [activeCategory, setActiveCategory] = useState<'mes' | 'partages' | 'metiers' | 'modeles'>('metiers');
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [previewDash, setPreviewDash] = useState<DashboardCard | null>(null);

  const filtered = DASHBOARDS.filter(d => d.categorie === activeCategory);

  return (
    <div className="p-6 space-y-5">

      {/* Category tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === c.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {CATEGORIES.find(c => c.id === activeCategory)?.desc}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWidgetLibrary(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Bibliothèque de widgets
          </button>
          {activeCategory === 'mes' && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Nouveau tableau de bord
            </button>
          )}
        </div>
      </div>

      {/* Widget library */}
      {showWidgetLibrary && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-xs font-bold text-slate-700 mb-4">Bibliothèque de widgets</p>
          <div className="grid grid-cols-4 gap-4">
            {WIDGET_CATEGORIES.map(wc => (
              <div key={wc.label}>
                <div className="flex items-center gap-1.5 mb-2">
                  <wc.icon className="w-3.5 h-3.5 text-slate-500" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{wc.label}</p>
                </div>
                <div className="space-y-1.5">
                  {wc.items.map(item => (
                    <div key={item} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-300 cursor-grab transition-colors group">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-slate-600 flex-shrink-0" />
                      <span className="text-[11px] text-slate-600 group-hover:text-slate-800">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center">
          <LayoutDashboard className="w-8 h-8 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400 font-medium">Aucun tableau de bord dans cette catégorie</p>
          {activeCategory === 'mes' && (
            <button className="mt-3 text-xs text-blue-600 font-semibold hover:underline">+ Créer mon premier tableau de bord</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(d => (
            <div key={d.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden hover:border-slate-300 transition-colors group">
              {/* Header */}
              <div className={`${d.bgColor} px-4 py-4 flex items-start gap-3`}>
                <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center flex-shrink-0">
                  <d.icon className={`w-4.5 h-4.5 ${d.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">{d.nom}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{d.description}</p>
                </div>
              </div>

              {/* Widgets list */}
              <div className="px-4 py-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Widgets</p>
                <div className="space-y-1">
                  {d.widgets.map(w => (
                    <div key={w} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <span className="w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" />
                      {w}
                    </div>
                  ))}
                </div>
                {d.profil && (
                  <div className="mt-3 pt-2 border-t border-slate-50">
                    <p className="text-[10px] text-slate-400">
                      <span className="font-semibold">Profils :</span> {d.profil}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-4 pb-3 flex items-center gap-2">
                <button
                  onClick={() => setPreviewDash(previewDash?.id === d.id ? null : d)}
                  className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  Aperçu
                </button>
                <button className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700 transition-colors">
                  <Edit2 className="w-3 h-3" />
                  Personnaliser
                </button>
                <button className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-600 transition-colors ml-auto">
                  <Share2 className="w-3 h-3" />
                  Partager
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview panel */}
      {previewDash && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-slate-800">Aperçu — {previewDash.nom}</p>
            <button onClick={() => setPreviewDash(null)} className="text-[11px] text-slate-400 hover:text-slate-600">Fermer</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {previewDash.widgets.map((w, i) => (
              <div key={w} className={`rounded-xl border border-slate-100 p-3 ${i === 0 ? 'col-span-2' : ''}`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">{w}</p>
                <div className="h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                  <BarChart2 className="w-5 h-5 text-slate-200" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
              Personnaliser
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Share2 className="w-3.5 h-3.5" />
              Partager
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
