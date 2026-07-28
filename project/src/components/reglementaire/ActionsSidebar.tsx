import { useState } from 'react';
import { X, Check, Plus } from 'lucide-react';

export interface ActionLibelle {
  label: string;
  urgence: 'immediate' | 'planification' | 'suivi' | 'corrective';
}

export const ACTIONS_AMIANTE: ActionLibelle[] = [
  // Immédiates
  { label: "Afficher les informations sur la présence d'amiante dans les zones concernées", urgence: 'immediate' },
  { label: 'Transmettre le DTA aux occupants, prestataires et autorités', urgence: 'immediate' },
  { label: "Mettre à jour le registre des matériaux amiantés dans le système de gestion", urgence: 'immediate' },
  { label: "Déclencher une alerte pour les matériaux dégradés (si identifiés)", urgence: 'immediate' },
  { label: "Vérifier l'état de conservation des matériaux (si non déjà évalué)", urgence: 'immediate' },
  // Planification
  { label: 'Planifier la première surveillance périodique (tous les 3 ans ou moins si dégradation)', urgence: 'planification' },
  { label: 'Programmer un RAAT avant tout travail sur le bâtiment', urgence: 'planification' },
  { label: 'Identifier les zones à risque et les intégrer dans le plan de prévention', urgence: 'planification' },
  { label: "Former le personnel aux risques liés à l'amiante et aux procédures du DTA", urgence: 'planification' },
  // Suivi
  { label: "Mettre en place des alertes automatiques pour les échéances de surveillance", urgence: 'suivi' },
  { label: "Vérifier la conformité des prestataires (certification, assurance)", urgence: 'suivi' },
  { label: "Intégrer le DTA dans les procédures d'urgence", urgence: 'suivi' },
  { label: "Archiver les versions précédentes du DTA et les rapports associés", urgence: 'suivi' },
  // Correctives
  { label: 'Déclencher des mesures conservatoires (confinement, signalisation)', urgence: 'corrective' },
  { label: "Planifier des travaux de mise en sécurité (désamiantage, encapsulation)", urgence: 'corrective' },
  { label: "Réaliser une mesure d'empoussièrement (si dégradation constatée)", urgence: 'corrective' },
  { label: 'Mettre à jour le DTA après toute intervention', urgence: 'corrective' },
];

const URGENCE_CONFIG = {
  immediate:    { label: 'Actions immédiates (0–7 jours)',      dot: 'bg-red-500',    badge: 'bg-red-50 text-red-700 border-red-200',     check: 'border-red-400 bg-red-500' },
  planification:{ label: 'Actions de planification (1–3 mois)', dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700 border-amber-200', check: 'border-amber-400 bg-amber-500' },
  suivi:        { label: 'Actions de suivi (3–12 mois)',         dot: 'bg-emerald-500',badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', check: 'border-emerald-400 bg-emerald-500' },
  corrective:   { label: 'Actions correctives',                  dot: 'bg-orange-500', badge: 'bg-orange-50 text-orange-700 border-orange-200', check: 'border-orange-400 bg-orange-500' },
};

interface ActionsSidebarProps {
  onSelect: (labels: string[]) => void;
  onClose: () => void;
}

export default function ActionsSidebar({ onSelect, onClose }: ActionsSidebarProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (label: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  const handleAdd = () => {
    if (selected.size === 0) return;
    onSelect([...selected]);
    onClose();
  };

  const groups = (['immediate', 'planification', 'suivi', 'corrective'] as const).map(u => ({
    urgence: u,
    cfg: URGENCE_CONFIG[u],
    items: ACTIONS_AMIANTE.filter(a => a.urgence === u),
  }));

  return (
    <div className="absolute right-0 top-0 h-full w-80 bg-white border-l border-slate-200 shadow-2xl z-30 flex flex-col rounded-r-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-slate-50">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Amiante / DTA</p>
          <p className="text-sm font-semibold text-slate-800">Libellés d'actions</p>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors">
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <p className="px-4 pt-3 pb-2 text-xs text-slate-400 flex-shrink-0">
        Cocher les actions puis cliquer sur <strong className="text-slate-600">Ajouter</strong>.
      </p>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-4">
        {groups.map(({ urgence, cfg, items }) => (
          <div key={urgence}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{cfg.label}</span>
            </div>
            <div className="space-y-1.5">
              {items.map((action) => {
                const checked = selected.has(action.label);
                return (
                  <label
                    key={action.label}
                    className={`flex items-start gap-2.5 w-full px-3 py-2 rounded-lg border text-xs cursor-pointer transition-all hover:shadow-sm
                      ${checked ? `${cfg.badge} border-opacity-80 ring-1 ring-inset ring-current/20` : `${cfg.badge} opacity-70 hover:opacity-100`}`}
                  >
                    <span className={`mt-0.5 w-4 h-4 flex-shrink-0 rounded border-2 flex items-center justify-center transition-colors
                      ${checked ? cfg.check + ' border-transparent' : 'border-slate-300 bg-white'}`}>
                      {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                    </span>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggle(action.label)}
                    />
                    <span className="leading-snug">{action.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
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
          Ajouter {selected.size > 0 ? `${selected.size} action${selected.size > 1 ? 's' : ''}` : ''}
        </button>
      </div>
    </div>
  );
}
