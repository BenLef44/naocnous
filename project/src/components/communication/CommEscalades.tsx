import { useState } from 'react';
import { AlertTriangle, Plus, ChevronRight, Pencil } from 'lucide-react';
import { MOCK_ESCALADES } from './commData';
import type { Escalade } from './commTypes';
import { MODULE_LABELS } from './commTypes';

const NIVEAU_COLORS = ['bg-amber-100 text-amber-700', 'bg-orange-100 text-orange-700', 'bg-red-100 text-red-700'];

export default function CommEscalades() {
  const [items, setItems] = useState<Escalade[]>(MOCK_ESCALADES);
  const toggle = (id: string) => setItems(prev => prev.map(e => e.id === id ? { ...e, actif: !e.actif } : e));

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 flex-shrink-0">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-bold text-slate-800">Gestion des escalades</h2>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{items.filter(e => e.actif).length} actives</span>
          </div>
          <p className="text-xs text-slate-400">Définissez les chaînes d'escalade automatique en cas de non-réponse</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nouvelle escalade
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4" style={{ scrollbarWidth: 'thin' }}>
        {items.map(esc => (
          <div key={esc.id} className={`rounded-2xl border overflow-hidden ${esc.actif ? 'border-slate-200' : 'border-slate-100'}`}>
            <div className={`px-5 py-4 flex items-center gap-4 ${esc.actif ? 'bg-white' : 'bg-slate-50'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${esc.actif ? 'bg-orange-50' : 'bg-slate-100'}`}>
                <AlertTriangle className={`w-4 h-4 ${esc.actif ? 'text-orange-500' : 'text-slate-300'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${esc.actif ? 'text-slate-800' : 'text-slate-400'}`}>{esc.nom}</p>
                <p className="text-xs text-slate-400 mt-0.5">{MODULE_LABELS[esc.module]} · {esc.evenement}</p>
              </div>
              <button type="button" onClick={() => toggle(esc.id)}
                className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${esc.actif ? 'bg-blue-500' : 'bg-slate-200'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${esc.actif ? 'left-4' : 'left-0.5'}`} />
              </button>
              <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0">
                <Pencil className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Niveaux */}
            <div className="px-5 pb-4 pt-2 bg-white border-t border-slate-50">
              <div className="flex items-start gap-0">
                {esc.niveaux.map((n, i) => (
                  <div key={n.niveau} className="flex items-center gap-0 flex-1 min-w-0">
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className={`text-[10px] font-bold px-3 py-2 rounded-xl text-center w-full ${NIVEAU_COLORS[i] ?? 'bg-slate-100 text-slate-600'}`}>
                        <p className="font-bold">Niveau {n.niveau}</p>
                        <p className="font-normal mt-0.5 truncate">{n.destinataire}</p>
                        <p className="text-[9px] opacity-70 mt-0.5">après {n.delai}</p>
                      </div>
                    </div>
                    {i < esc.niveaux.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mx-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
