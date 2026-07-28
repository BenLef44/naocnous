import { useState } from 'react';
import { Zap, Plus, Pencil } from 'lucide-react';
import { MOCK_REGLES } from './commData';
import type { RegleDeclenchement, ModuleSource } from './commTypes';
import { MODULE_LABELS } from './commTypes';
import NouvelleRegleModal from './NouvelleRegleModal';

export default function CommRegles() {
  const [items, setItems] = useState<RegleDeclenchement[]>(MOCK_REGLES);
  const [showModal, setShowModal] = useState(false);
  const [editRule, setEditRule] = useState<RegleDeclenchement | null>(null);

  const toggle = (id: string) => setItems(prev => prev.map(r => r.id === id ? { ...r, actif: !r.actif } : r));

  const handleSave = (rule: Omit<RegleDeclenchement, 'id'>) => {
    if (editRule) {
      setItems(prev => prev.map(r => r.id === editRule.id ? { ...r, ...rule } : r));
      setEditRule(null);
    } else {
      setItems(prev => [...prev, { id: `r${Date.now()}`, ...rule }]);
    }
  };

  const grouped = items.reduce<Record<string, RegleDeclenchement[]>>((acc, r) => {
    (acc[r.module] = acc[r.module] ?? []).push(r);
    return acc;
  }, {});

  return (
    <>
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 flex-shrink-0">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-800">Règles de déclenchement</h2>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{items.filter(r => r.actif).length} actives</span>
          </div>
          <p className="text-xs text-slate-400">Associez des événements métier à des modèles de communication</p>
        </div>
        <button
            onClick={() => { setEditRule(null); setShowModal(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nouvelle règle
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6" style={{ scrollbarWidth: 'thin' }}>
        {Object.entries(grouped).map(([mod, rules]) => (
          <div key={mod}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">{MODULE_LABELS[mod as ModuleSource]}</p>
            <div className="space-y-2">
              {rules.map(r => (
                <div key={r.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${r.actif ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${r.actif ? 'bg-amber-50' : 'bg-slate-100'}`}>
                    <Zap className={`w-4 h-4 ${r.actif ? 'text-amber-500' : 'text-slate-300'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${r.actif ? 'text-slate-800' : 'text-slate-400'}`}>{r.modeleNom}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{r.evenement}</span>
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{r.delai}</span>
                      <span className="text-[10px] bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full">{r.frequence}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => toggle(r.id)}
                    className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${r.actif ? 'bg-blue-500' : 'bg-slate-200'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${r.actif ? 'left-4' : 'left-0.5'}`} />
                  </button>
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
                    onClick={() => { setEditRule(r); setShowModal(true); }}>
                    <Pencil className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
    {showModal && (
      <NouvelleRegleModal
        onClose={() => { setShowModal(false); setEditRule(null); }}
        onSave={handleSave}
      />
    )}
    </>
  );
}
