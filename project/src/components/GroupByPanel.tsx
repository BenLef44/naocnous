import { useState } from 'react';
import {
  Layers, FolderOpen, Tag, Wrench, Settings2,
  ChevronUp, ChevronDown, X, Plus, GripVertical,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type GroupKey = 'physical' | 'site_cat1' | 'site_cat2' | 'equip_cat1' | 'equip_cat2';

export interface GroupDef {
  key: GroupKey;
  label: string;
  labelShort: string;
  description: string;
  icon: React.ElementType;
  chipCls: string;
  badgeCls: string;
}

export const GROUP_DEFS: GroupDef[] = [
  {
    key: 'physical',
    label: 'Regroupement physique',
    labelShort: 'Physique',
    description: 'Site > Bâtiment > Étage > Pièce / Logement',
    icon: Layers,
    chipCls: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeCls: 'bg-blue-100 text-blue-700',
  },
  {
    key: 'site_cat2',
    label: 'Catégorie de site (N2)',
    labelShort: 'Site N2',
    description: 'Culture, Enseignement, Restaurants scolaires...',
    icon: FolderOpen,
    chipCls: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeCls: 'bg-amber-100 text-amber-700',
  },
  {
    key: 'site_cat1',
    label: 'Catégorie de site (N1)',
    labelShort: 'Site N1',
    description: 'Bâti, Non-bâti...',
    icon: Tag,
    chipCls: 'bg-violet-50 text-violet-700 border-violet-200',
    badgeCls: 'bg-violet-100 text-violet-700',
  },
  {
    key: 'equip_cat1',
    label: 'Équipements catégorie (N1)',
    labelShort: 'Équip. N1',
    description: 'Chaudières, Ascenseurs, Luminaires...',
    icon: Wrench,
    chipCls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeCls: 'bg-emerald-100 text-emerald-700',
  },
  {
    key: 'equip_cat2',
    label: 'Équipements catégorie (N2)',
    labelShort: 'Équip. N2',
    description: 'Chaudières Gaz, Chaudières Fioul, Ascenseurs 8 places...',
    icon: Settings2,
    chipCls: 'bg-teal-50 text-teal-700 border-teal-200',
    badgeCls: 'bg-teal-100 text-teal-700',
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface GroupByPanelProps {
  activeGroups: GroupKey[];
  onChange: (groups: GroupKey[]) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GroupByPanel({ activeGroups, onChange }: GroupByPanelProps) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const availableDefs = GROUP_DEFS.filter(d => !activeGroups.includes(d.key));

  function removeGroup(key: GroupKey) {
    onChange(activeGroups.filter(k => k !== key));
  }

  function addGroup(key: GroupKey) {
    onChange([...activeGroups, key]);
    setAddMenuOpen(false);
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...activeGroups];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  }

  function moveDown(index: number) {
    if (index === activeGroups.length - 1) return;
    const next = [...activeGroups];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-1.5">

      {/* Active groups */}
      {activeGroups.length === 0 ? (
        <p className="text-[11px] text-slate-400 italic px-0.5">Aucun regroupement actif</p>
      ) : (
        <div className="space-y-1">
          {activeGroups.map((key, idx) => {
            const def = GROUP_DEFS.find(d => d.key === key)!;
            const Icon = def.icon;
            const isFirst = idx === 0;
            const isLast  = idx === activeGroups.length - 1;
            return (
              <div
                key={key}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-medium transition-all group ${def.chipCls}`}
              >
                {/* Drag handle indicator */}
                <GripVertical className="w-3 h-3 opacity-30 flex-shrink-0" />

                {/* Position badge */}
                <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${def.badgeCls}`}>
                  {idx + 1}
                </span>

                {/* Icon + label */}
                <Icon className="w-3 h-3 flex-shrink-0" />
                <span className="flex-1 truncate">{def.labelShort}</span>

                {/* Reorder arrows (visible on hover) */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => moveUp(idx)}
                    disabled={isFirst}
                    className="p-0.5 hover:bg-black/10 rounded transition-colors disabled:opacity-20"
                    title="Monter"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveDown(idx)}
                    disabled={isLast}
                    className="p-0.5 hover:bg-black/10 rounded transition-colors disabled:opacity-20"
                    title="Descendre"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeGroup(key)}
                  className="p-0.5 hover:bg-black/10 rounded transition-colors opacity-50 hover:opacity-100 flex-shrink-0"
                  title="Supprimer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Connector line between levels */}
      {activeGroups.length > 1 && (
        <div className="flex items-center gap-1.5 px-2">
          <div className="w-px h-2 bg-slate-200 ml-3.5" />
          <span className="text-[10px] text-slate-300">puis</span>
        </div>
      )}

      {/* Add level button */}
      {availableDefs.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setAddMenuOpen(v => !v)}
            className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-dashed text-xs transition-all
              ${addMenuOpen
                ? 'border-blue-300 text-blue-600 bg-blue-50'
                : 'border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'}`}
          >
            <Plus className="w-3 h-3 flex-shrink-0" />
            <span>Ajouter un niveau</span>
          </button>

          {addMenuOpen && (
            <>
              <div className="fixed inset-0 z-[100]" onClick={() => setAddMenuOpen(false)} />
              <div className="absolute left-0 top-full mt-1 w-60 bg-white rounded-xl border border-slate-200 shadow-xl z-[101] py-1.5 overflow-hidden">
                <p className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Niveaux disponibles
                </p>
                {availableDefs.map(def => {
                  const Icon = def.icon;
                  return (
                    <button
                      key={def.key}
                      onClick={() => addGroup(def.key)}
                      className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 border ${def.chipCls}`}>
                        <Icon className="w-3 h-3" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-700 leading-tight">{def.label}</p>
                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">{def.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
