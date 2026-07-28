import React, { useState, useMemo, useRef } from 'react';
import { Brain, Zap, ChevronDown, MoreHorizontal, ArrowRight, X } from 'lucide-react';
import {
  Prediction, MOCK_PREDICTIONS,
  CRITICITE_PRED_CFG, STATUT_PRED_CFG, CATEGORIE_PRED_CFG,
  StatutPred, CriticitePred,
} from './predictifTypes';

// ─── Column definitions ───────────────────────────────────────────────────────

const KANBAN_COLUMNS: { id: StatutPred; label: string; color: string; dotColor: string }[] = [
  { id: 'detecte',       label: 'Détecté',      color: 'border-t-blue-400',   dotColor: 'bg-blue-400'    },
  { id: 'confirme',      label: 'Confirmé',      color: 'border-t-amber-400',  dotColor: 'bg-amber-400'   },
  { id: 'surveiller',    label: 'À surveiller',  color: 'border-t-sky-400',    dotColor: 'bg-sky-400'     },
  { id: 'en_traitement', label: 'En traitement', color: 'border-t-yellow-400', dotColor: 'bg-yellow-400'  },
  { id: 'resolu',        label: 'Résolu',        color: 'border-t-emerald-400',dotColor: 'bg-emerald-400' },
  { id: 'faux_positif',  label: 'Faux positif',  color: 'border-t-slate-300',  dotColor: 'bg-slate-400'   },
  { id: 'ignore',        label: 'Ignoré',        color: 'border-t-slate-200',  dotColor: 'bg-slate-300'   },
];

function buildGrouped(preds: Prediction[], filter: CriticitePred | ''): Record<StatutPred, Prediction[]> {
  const map: Record<StatutPred, Prediction[]> = {
    detecte: [], confirme: [], surveiller: [], en_traitement: [], resolu: [], faux_positif: [], ignore: [],
  };
  for (const p of preds) {
    if (filter && p.criticite !== filter) continue;
    map[p.statut].push(p);
  }
  return map;
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function KanbanCard({
  pred, onClick, onDragStart,
}: {
  pred: Prediction;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}) {
  const critCfg = CRITICITE_PRED_CFG[pred.criticite];
  const catCfg = CATEGORIE_PRED_CFG[pred.categorie];
  const daysUntil = Math.ceil((new Date(pred.date_estimee).getTime() - Date.now()) / 86400000);
  const urgent = daysUntil <= 14;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing group select-none"
    >
      {/* Criticité stripe */}
      <div className={`h-1 -mx-3 -mt-3 mb-2.5 rounded-t-lg ${critCfg.dot}`} />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-mono text-slate-400">{pred.reference}</span>
        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${critCfg.badgeBg} ${critCfg.text}`}>
          {critCfg.icon}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-slate-800 leading-tight mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
        {pred.titre}
      </p>

      {/* Category */}
      <div className="flex items-center gap-1 mb-2.5">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${catCfg.bg} ${catCfg.color}`}>
          {catCfg.icon} {catCfg.label}
        </span>
      </div>

      {/* AI suggestion */}
      <div className="flex items-start gap-1.5 p-2 bg-blue-50 rounded-md mb-2.5 border border-blue-100">
        <Brain className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700 leading-relaxed line-clamp-2">{pred.action_recommandee}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className={urgent ? 'text-red-500 font-medium' : ''}>
          {urgent ? '⚠ ' : ''}J-{daysUntil > 0 ? daysUntil : '?'}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">{pred.responsable}</span>
          <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-semibold ${
            pred.score_ia >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}>
            <Brain className="w-2.5 h-2.5" />{pred.score_ia}
          </span>
        </div>
      </div>

      {/* Action row (visible on hover) */}
      <div className="mt-2 pt-2 border-t border-slate-100 hidden group-hover:flex items-center gap-2">
        <button
          className="flex-1 flex items-center justify-center gap-1 text-xs py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={e => e.stopPropagation()}
        >
          <Zap className="w-3 h-3" /> Créer intervention
        </button>
        <button
          className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
          onClick={e => e.stopPropagation()}
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────

function KanbanColumn({
  col, cards, onCardClick, onCardDragStart, onDrop, dragOverCol, onDragOver, onDragLeave,
}: {
  col: typeof KANBAN_COLUMNS[0];
  cards: Prediction[];
  onCardClick: (pred: Prediction) => void;
  onCardDragStart: (e: React.DragEvent, pred: Prediction) => void;
  onDrop: (e: React.DragEvent, targetCol: StatutPred) => void;
  dragOverCol: StatutPred | null;
  onDragOver: (e: React.DragEvent, colId: StatutPred) => void;
  onDragLeave: () => void;
}) {
  const [collapsed, setCollapsed] = useState(col.id === 'ignore' || col.id === 'faux_positif');
  const isOver = dragOverCol === col.id;

  return (
    <div
      className={`flex flex-col shrink-0 rounded-xl border border-t-4 transition-all ${col.color} ${
        collapsed ? 'w-12 bg-slate-50 border-slate-200' : `w-64 ${isOver ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`
      }`}
      onDragOver={e => { e.preventDefault(); onDragOver(e, col.id); }}
      onDragLeave={onDragLeave}
      onDrop={e => onDrop(e, col.id)}
    >
      {/* Column header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none"
        onClick={() => setCollapsed(v => !v)}
      >
        {collapsed ? (
          <div className="flex flex-col items-center gap-1 w-full">
            <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
            <span className="text-xs font-semibold text-slate-500 [writing-mode:vertical-rl] rotate-180 whitespace-nowrap mt-1">{col.label}</span>
            <span className="text-xs text-slate-400 font-medium">{cards.length}</span>
          </div>
        ) : (
          <>
            <span className={`w-2 h-2 rounded-full ${col.dotColor} shrink-0`} />
            <span className="text-sm font-semibold text-slate-700 flex-1">{col.label}</span>
            <span className="text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-semibold">{cards.length}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </>
        )}
      </div>

      {/* Cards */}
      {!collapsed && (
        <div className={`flex-1 overflow-y-auto px-2 pb-2 space-y-2 min-h-[200px] transition-colors rounded-b-xl ${isOver ? 'bg-blue-50/60' : ''}`}>
          {cards.map(pred => (
            <KanbanCard
              key={pred.id}
              pred={pred}
              onClick={() => onCardClick(pred)}
              onDragStart={e => onCardDragStart(e, pred)}
            />
          ))}
          {cards.length === 0 && (
            <div className={`flex items-center justify-center h-24 text-xs rounded-lg border-2 border-dashed transition-colors ${
              isOver ? 'border-blue-300 text-blue-400 bg-blue-50' : 'border-slate-200 text-slate-400'
            }`}>
              {isOver ? 'Déposer ici' : 'Aucune prédiction'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Detail modal ─────────────────────────────────────────────────────────────

function DetailModal({ pred, onClose }: { pred: Prediction; onClose: () => void }) {
  const critCfg = CRITICITE_PRED_CFG[pred.criticite];
  const statCfg = STATUT_PRED_CFG[pred.statut];
  const catCfg = CATEGORIE_PRED_CFG[pred.categorie];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 ${critCfg.bg} border-b ${critCfg.border}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-slate-500">{pred.reference}</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${critCfg.badgeBg} ${critCfg.text}`}>
                  {critCfg.icon} {critCfg.label}
                </span>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${statCfg.bg} ${statCfg.text} ${statCfg.border}`}>
                  {statCfg.label}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{pred.titre}</h3>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/10 transition-colors">
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <p className="text-sm text-slate-700 leading-relaxed">{pred.description}</p>

          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <Brain className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-600 mb-1">Justification IA</p>
              <p className="text-sm text-blue-800">{pred.justification_ia}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              ['Probabilité', `${pred.probabilite}%`],
              ['Score IA', `${pred.score_ia} / 100`],
              ['Confiance', `${pred.confiance_ia}%`],
              ['Source', pred.source],
              ['Équipement', pred.equipement],
              ['Bâtiment', pred.batiment],
              ['Résidence', pred.residence],
              ['Responsable', pred.responsable],
              ['Échéance estimée', new Date(pred.date_estimee).toLocaleDateString('fr-FR')],
              ['Coût estimé', pred.cout_estime !== null ? `${pred.cout_estime.toLocaleString('fr-FR')} €` : '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between bg-slate-50 px-3 py-2 rounded-lg">
                <span className="text-slate-500">{label}</span>
                <span className="font-semibold text-slate-700 text-right max-w-[180px]">{value}</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <p className="text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1">
              <ArrowRight className="w-3.5 h-3.5" /> Action recommandée
            </p>
            <p className="text-sm text-emerald-800">{pred.action_recommandee}</p>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 flex gap-3">
          <button className="flex-1 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Créer une intervention
          </button>
          <button className="px-4 py-2 bg-white text-slate-700 text-sm font-semibold border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            Ignorer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PredictifKanban() {
  const [filterCriticite, setFilterCriticite] = useState<CriticitePred | ''>('');
  const [selected, setSelected] = useState<Prediction | null>(null);
  const [allPreds, setAllPreds] = useState<Prediction[]>(MOCK_PREDICTIONS);
  const [dragOverCol, setDragOverCol] = useState<StatutPred | null>(null);
  const draggingId = useRef<string | null>(null);

  const grouped = useMemo(() => buildGrouped(allPreds, filterCriticite), [allPreds, filterCriticite]);

  const handleDragStart = (e: React.DragEvent, pred: Prediction) => {
    draggingId.current = pred.id;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: StatutPred) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetCol: StatutPred) => {
    e.preventDefault();
    setDragOverCol(null);
    const id = draggingId.current;
    if (!id) return;
    setAllPreds(prev => prev.map(p => p.id === id ? { ...p, statut: targetCol } : p));
    draggingId.current = null;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-200 bg-slate-50 shrink-0">
        <span className="text-sm font-semibold text-slate-700">Vue Kanban</span>
        <div className="flex items-center gap-1 ml-4">
          {([''] as (CriticitePred | '')[]).concat(Object.keys(CRITICITE_PRED_CFG) as CriticitePred[]).map(k => {
            const cfg = k ? CRITICITE_PRED_CFG[k] : null;
            const active = filterCriticite === k;
            return (
              <button
                key={k || 'all'}
                onClick={() => setFilterCriticite(k)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  active ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cfg ? `${cfg.icon} ${cfg.label}` : 'Toutes'}
              </button>
            );
          })}
        </div>
        <div className="ml-auto text-xs text-slate-500">
          {allPreds.length} prédictions
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-3 p-4 h-full min-w-max">
          {KANBAN_COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              col={col}
              cards={grouped[col.id]}
              onCardClick={setSelected}
              onCardDragStart={handleDragStart}
              onDrop={handleDrop}
              dragOverCol={dragOverCol}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            />
          ))}
        </div>
      </div>

      {selected && <DetailModal pred={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
