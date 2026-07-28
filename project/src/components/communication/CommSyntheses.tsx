import { useState } from 'react';
import { FileText, Plus, Pencil, Calendar, Users } from 'lucide-react';
import { MOCK_SYNTHESES } from './commData';
import type { Synthese, ModuleSource } from './commTypes';
import { MODULE_LABELS } from './commTypes';

const FREQ_COLORS: Record<string, string> = {
  quotidienne: 'bg-blue-100 text-blue-700',
  hebdomadaire: 'bg-violet-100 text-violet-700',
  mensuelle: 'bg-emerald-100 text-emerald-700',
};

export default function CommSyntheses() {
  const [items, setItems] = useState<Synthese[]>(MOCK_SYNTHESES);
  const toggle = (id: string) => setItems(prev => prev.map(s => s.id === id ? { ...s, actif: !s.actif } : s));

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 flex-shrink-0">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-800">Synthèses automatiques</h2>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{items.filter(s => s.actif).length} actives</span>
          </div>
          <p className="text-xs text-slate-400">Générez et envoyez automatiquement des rapports de synthèse</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-3.5 h-3.5" /> Nouvelle synthèse
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4" style={{ scrollbarWidth: 'thin' }}>
        {items.map(s => (
          <div key={s.id} className={`rounded-2xl border p-5 ${s.actif ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50'}`}>
            <div className="flex items-start gap-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.actif ? 'bg-emerald-50' : 'bg-slate-100'}`}>
                <FileText className={`w-4 h-4 ${s.actif ? 'text-emerald-600' : 'text-slate-300'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className={`text-sm font-bold ${s.actif ? 'text-slate-800' : 'text-slate-400'}`}>{s.nom}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${FREQ_COLORS[s.frequence]}`}>{s.frequence.charAt(0).toUpperCase() + s.frequence.slice(1)}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap mt-2">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{s.destinataires.join(', ')}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Prochain envoi : {s.prochainEnvoi}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {s.modules.map(m => (
                    <span key={m} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{MODULE_LABELS[m as ModuleSource]}</span>
                  ))}
                </div>

                {/* Preview contenu */}
                {s.actif && (
                  <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Aperçu du contenu</p>
                    {['12 interventions réalisées','3 interventions en retard','2 contrôles à échéance','4 ruptures de stock','1 contrat à renouveler'].map((l, i) => (
                      <p key={i} className="text-[11px] text-slate-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />{l}
                      </p>
                    ))}
                    <button className="mt-2 w-full py-1.5 bg-blue-600 text-white text-[11px] font-semibold rounded-lg">
                      Accéder au tableau de bord →
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button type="button" onClick={() => toggle(s.id)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${s.actif ? 'bg-blue-500' : 'bg-slate-200'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${s.actif ? 'left-4' : 'left-0.5'}`} />
                </button>
                <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <Pencil className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
