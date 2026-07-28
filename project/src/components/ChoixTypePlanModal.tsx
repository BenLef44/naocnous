import { X, Wrench, Handshake, ShieldCheck, ArrowRight } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSelectInterne: () => void;
  onSelectContrat: () => void;
  onSelectReglementaire: () => void;
}

export default function ChoixTypePlanModal({ onClose, onSelectInterne, onSelectContrat, onSelectReglementaire }: Props) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ width: '100%', maxWidth: 720 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Étape 1 sur 2</span>
                <div className="flex items-center gap-1">
                  <div className="w-12 h-1.5 rounded-full bg-blue-500" />
                  <div className="w-12 h-1.5 rounded-full bg-slate-200" />
                </div>
              </div>
              <h2 className="text-lg font-bold text-slate-800">Créer un plan de maintenance</h2>
              <p className="text-sm text-slate-400 mt-0.5">Choisissez l'origine du plan de maintenance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Cards */}
        <div className="p-6 grid grid-cols-3 gap-4">

          {/* Carte 1 — Interne */}
          <div className="flex flex-col rounded-2xl border-2 border-slate-100 hover:border-blue-200 hover:shadow-md transition-all overflow-hidden group">
            <div className="px-5 pt-5 pb-4 flex-1">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                <Wrench className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1.5">Maintenance préventive interne</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Créer un plan géré directement par vos équipes ou prestataires.
              </p>
              <div className="space-y-1 mb-4">
                {['Nettoyage VMC', 'Remplacement filtres', 'Entretien chaudière'].map(ex => (
                  <div key={ex} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <div className="w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />
                    {ex}
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 pb-5">
              <button
                onClick={onSelectInterne}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Créer un plan <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Carte 2 — Contrat */}
          <div className="flex flex-col rounded-2xl border-2 border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all overflow-hidden group">
            <div className="px-5 pt-5 pb-4 flex-1">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition-colors">
                <Handshake className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-sm font-bold text-slate-800">Contrat d'entretien</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 flex-shrink-0">Module Contrats</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Les opérations préventives sont générées automatiquement à partir du contrat.
              </p>
              <div className="space-y-1 mb-4">
                {['Contrat P2', 'Contrat ascenseurs', 'Contrat multitechnique'].map(ex => (
                  <div key={ex} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <div className="w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />
                    {ex}
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 pb-5">
              <button
                onClick={onSelectContrat}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-emerald-600 text-white py-2.5 rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Créer un contrat <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Carte 3 — Réglementaire */}
          <div className="flex flex-col rounded-2xl border-2 border-slate-100 hover:border-amber-200 hover:shadow-md transition-all overflow-hidden group">
            <div className="px-5 pt-5 pb-4 flex-1">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-sm font-bold text-slate-800">Contrôle réglementaire</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 flex-shrink-0">Module Réglementaire</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Les échéances réglementaires alimentent automatiquement la maintenance préventive.
              </p>
              <div className="space-y-1 mb-4">
                {['Contrôle F-Gaz', 'Contrôle électrique', 'SSI / Ascenseur'].map(ex => (
                  <div key={ex} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <div className="w-1 h-1 rounded-full bg-slate-300 flex-shrink-0" />
                    {ex}
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 pb-5">
              <button
                onClick={onSelectReglementaire}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold bg-amber-500 text-white py-2.5 rounded-xl hover:bg-amber-600 transition-colors"
              >
                Créer un contrôle <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
