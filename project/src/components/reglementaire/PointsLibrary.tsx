import { useState } from 'react';
import { X, Check, Plus, ChevronDown, ChevronUp } from 'lucide-react';

export interface PointLibelleGroup {
  etape: string;
  icon: string;
  items: string[];
}

export const POINTS_AMIANTE: PointLibelleGroup[] = [
  {
    etape: '1. Identification initiale du risque amiante',
    icon: '🏢',
    items: [
      'Présence ou absence d\'amiante dans le bâtiment',
      'Présence d\'un DTA à jour',
      'Date du dernier repérage amiante',
      'Présence d\'un plan de repérage amiante',
    ],
  },
  {
    etape: '2. Repérage et localisation des matériaux amiantés',
    icon: '🔎',
    items: [
      'Identification des matériaux contenant de l\'amiante',
      'Localisation précise des matériaux amiantés',
      'Présence de matériaux amiantés dans les gaines techniques',
      'Présence de matériaux amiantés dans les faux plafonds',
      'Présence de matériaux amiantés dans les calorifugeages',
      'Présence de matériaux amiantés dans les flocages',
      'Présence de matériaux amiantés dans les dalles de sol',
      'Présence de matériaux amiantés en toiture / fibrociment',
      'Présence de matériaux amiantés dans les conduits',
    ],
  },
  {
    etape: '3. Evaluation de l\'état de conservation et du risque',
    icon: '🧪',
    items: [
      'Etat de conservation des matériaux amiantés',
      'Niveau de dégradation des matériaux',
      'Présence de fissures ou détériorations visibles',
      'Risque de libération de fibres',
      'Etat des joints amiantés',
    ],
  },
  {
    etape: '4. Contrôles sanitaires et mesures réglementaires',
    icon: '📏',
    items: [
      'Réalisation des mesures d\'empoussièrement',
      'Respect des seuils réglementaires d\'empoussièrement',
      'Présence des rapports d\'analyses laboratoire',
    ],
  },
  {
    etape: '5. Sécurisation des zones amiantées',
    icon: '🛡️',
    items: [
      'Présence d\'un confinement des matériaux amiantés',
      'Présence d\'un encapsulage conforme',
      'Signalétique amiante présente et visible',
      'Accessibilité des zones amiantées',
      'Protection des occupants assurée',
      'Protection des intervenants techniques assurée',
    ],
  },
  {
    etape: '6. Préparation des travaux et interventions',
    icon: '👷',
    items: [
      'Présence d\'un repérage avant travaux (RAAT)',
      'Présence d\'un plan de prévention amiante',
      'Vérification des habilitations SS3 / SS4 des intervenants',
      'Présence des procédures de sécurité amiante',
      'Mise à disposition du DTA aux entreprises intervenantes',
    ],
  },
  {
    etape: '7. Réalisation des travaux / désamiantage',
    icon: '🛠️',
    items: [
      'Traçabilité des interventions sur matériaux amiantés',
      'Présence des rapports de désamiantage',
      'Contrôle visuel après désamiantage',
      'Absence de résidus après travaux',
    ],
  },
  {
    etape: '8. Mise à jour réglementaire et traçabilité',
    icon: '📚',
    items: [
      'Mise à disposition du DTA aux occupants si nécessaire',
      'Mise à jour documentaire après travaux',
      'Archivage des rapports réglementaires',
      'Levée des réserves réglementaires éventuelles',
    ],
  },
  {
    etape: '9. Suivi périodique dans le temps',
    icon: '🔄',
    items: [
      'Présence d\'un suivi périodique réglementaire',
      'Respect de la périodicité des contrôles',
    ],
  },
];

// Libellés qui déclenchent les champs Localisation + Photo (étape 2)
export const REPERAGE_ITEMS = new Set(POINTS_AMIANTE[1].items);

const GROUP_COLORS = [
  'bg-blue-50 text-blue-700 border-blue-200',
  'bg-cyan-50 text-cyan-700 border-cyan-200',
  'bg-teal-50 text-teal-700 border-teal-200',
  'bg-emerald-50 text-emerald-700 border-emerald-200',
  'bg-amber-50 text-amber-700 border-amber-200',
  'bg-orange-50 text-orange-700 border-orange-200',
  'bg-red-50 text-red-700 border-red-200',
  'bg-slate-50 text-slate-700 border-slate-200',
  'bg-sky-50 text-sky-700 border-sky-200',
];

interface PointsLibraryProps {
  onSelect: (labels: string[]) => void;
  onClose: () => void;
}

export default function PointsLibrary({ onSelect, onClose }: PointsLibraryProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openGroups, setOpenGroups] = useState<Set<number>>(new Set([0, 1]));

  const toggle = (label: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  const toggleGroup = (idx: number) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const selectAll = (items: string[]) => {
    setSelected(prev => {
      const next = new Set(prev);
      items.forEach(i => next.add(i));
      return next;
    });
  };

  const deselectAll = (items: string[]) => {
    setSelected(prev => {
      const next = new Set(prev);
      items.forEach(i => next.delete(i));
      return next;
    });
  };

  const handleAdd = () => {
    if (selected.size === 0) return;
    // preserve order from library
    const ordered: string[] = [];
    POINTS_AMIANTE.forEach(g => g.items.forEach(it => { if (selected.has(it)) ordered.push(it); }));
    onSelect(ordered);
    onClose();
  };

  return (
    <div className="absolute right-0 top-0 h-full w-80 bg-white border-l border-slate-200 shadow-2xl z-30 flex flex-col rounded-r-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-slate-50">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Amiante / DTA</p>
          <p className="text-sm font-semibold text-slate-800">Libellés de points de contrôle</p>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <p className="px-4 pt-3 pb-2 text-xs text-slate-400 flex-shrink-0">
        Cocher les points puis cliquer sur <strong className="text-slate-600">Ajouter</strong>.
      </p>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
        {POINTS_AMIANTE.map((group, idx) => {
          const isOpen = openGroups.has(idx);
          const colorCls = GROUP_COLORS[idx % GROUP_COLORS.length];
          const allChecked = group.items.every(i => selected.has(i));
          const someChecked = group.items.some(i => selected.has(i));

          return (
            <div key={idx} className="border border-slate-100 rounded-xl overflow-hidden">
              {/* Group header */}
              <div className={`flex items-center gap-2 px-3 py-2.5 ${isOpen ? 'bg-slate-50' : 'bg-white hover:bg-slate-50/60'} cursor-pointer`}>
                {/* Select-all checkbox */}
                <span
                  onClick={(e) => { e.stopPropagation(); allChecked ? deselectAll(group.items) : selectAll(group.items); }}
                  className={`w-4 h-4 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors
                    ${allChecked ? 'bg-emerald-500 border-emerald-500' : someChecked ? 'bg-emerald-200 border-emerald-400' : 'border-slate-300 bg-white'}`}
                >
                  {(allChecked || someChecked) && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </span>
                <button
                  type="button"
                  className="flex-1 flex items-center gap-1.5 text-left min-w-0"
                  onClick={() => toggleGroup(idx)}
                >
                  <span className="text-base leading-none flex-shrink-0">{group.icon}</span>
                  <span className="text-xs font-semibold text-slate-700 truncate">{group.etape}</span>
                  <span className="ml-auto text-xs text-slate-400 flex-shrink-0 mr-1">{group.items.length}</span>
                  {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
                </button>
              </div>

              {/* Items */}
              {isOpen && (
                <div className="border-t border-slate-100 px-3 py-2 space-y-1.5">
                  {group.items.map((item) => {
                    const checked = selected.has(item);
                    return (
                      <label
                        key={item}
                        className={`flex items-start gap-2.5 w-full px-2.5 py-2 rounded-lg border text-xs cursor-pointer transition-all hover:shadow-sm
                          ${checked ? colorCls + ' ring-1 ring-inset ring-current/10' : colorCls + ' opacity-60 hover:opacity-90'}`}
                      >
                        <span className={`mt-0.5 w-4 h-4 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors
                          ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'}`}>
                          {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                        </span>
                        <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggle(item)} />
                        <span className="leading-snug">{item}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-100 flex-shrink-0 bg-slate-50/80">
        <button
          type="button"
          disabled={selected.size === 0}
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Ajouter {selected.size > 0 ? `${selected.size} point${selected.size > 1 ? 's' : ''}` : ''}
        </button>
      </div>
    </div>
  );
}
