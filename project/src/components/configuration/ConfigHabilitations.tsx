import { useState, useEffect } from 'react';
import { Key, Loader2, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ConfigProfil, ConfigProfilModule } from './configTypes';
import { ALL_MODULES, PERMISSION_ACTIONS } from './configTypes';

export default function ConfigHabilitations() {
  const [profils, setProfils] = useState<ConfigProfil[]>([]);
  const [selectedProfil, setSelectedProfil] = useState<ConfigProfil | null>(null);
  const [modules, setModules] = useState<ConfigProfilModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['Opérations']));

  useEffect(() => {
    supabase.from('config_profils').select('*').eq('actif', true).order('nom').then(({ data }) => {
      if (data) { setProfils(data); if (data[0]) handleSelectProfil(data[0]); }
      setLoading(false);
    });
  }, []);

  async function handleSelectProfil(p: ConfigProfil) {
    setSelectedProfil(p);
    const { data } = await supabase.from('config_profil_modules').select('*').eq('profil_id', p.id);
    setModules(data ?? []);
  }

  function getModule(moduleId: string) { return modules.find(m => m.module_id === moduleId); }
  function hasModule(moduleId: string) { return !!getModule(moduleId); }

  async function togglePerm(moduleId: string, perm: string, current: boolean) {
    if (!selectedProfil) return;
    const mod = getModule(moduleId);
    if (!mod) return;
    await supabase.from('config_profil_modules').update({ [perm]: !current }).eq('id', mod.id);
    const { data } = await supabase.from('config_profil_modules').select('*').eq('profil_id', selectedProfil.id);
    setModules(data ?? []);
  }

  const groupes = [...new Set(ALL_MODULES.map(m => m.groupe))];

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>;

  return (
    <div className="p-6 space-y-5">
      <p className="text-xs text-slate-500">Gérez les actions autorisées pour chaque profil et chaque module.</p>

      {/* Profil selector */}
      <div className="flex flex-wrap gap-2">
        {profils.map(p => (
          <button key={p.id} onClick={() => handleSelectProfil(p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              selectedProfil?.id === p.id
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
            }`}>
            <span className="text-[11px]">{p.emoji ?? '?'}</span>
            {p.nom}
          </button>
        ))}
      </div>

      {selectedProfil && (
        <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
          {/* Header row */}
          <div className="flex items-center border-b border-slate-100 bg-slate-50/50 px-4 py-2.5">
            <div className="w-52 flex-shrink-0">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Module</p>
            </div>
            {PERMISSION_ACTIONS.map(a => (
              <div key={a.key} className="w-20 text-center flex-shrink-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{a.label}</p>
              </div>
            ))}
          </div>

          {groupes.map(groupe => {
            const isOpen = expanded.has(groupe);
            const groupModules = ALL_MODULES.filter(m => m.groupe === groupe);
            const activeInGroup = groupModules.filter(m => hasModule(m.id)).length;
            return (
              <div key={groupe} className="border-b border-slate-50 last:border-0">
                <button
                  onClick={() => setExpanded(s => { const n = new Set(s); n.has(groupe) ? n.delete(groupe) : n.add(groupe); return n; })}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-slate-50 transition-colors"
                >
                  {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{groupe}</span>
                  <span className="text-[10px] text-slate-400 ml-1">({activeInGroup}/{groupModules.length} actifs)</span>
                </button>

                {isOpen && groupModules.map(mod => {
                  const modPerm = getModule(mod.id);
                  const active = !!modPerm;
                  return (
                    <div key={mod.id} className={`flex items-center px-4 py-2 border-t border-slate-50 ${!active ? 'opacity-40' : 'hover:bg-slate-50/60'} transition-all`}>
                      <div className="w-52 flex-shrink-0 flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                        <span className="text-xs font-medium text-slate-700">{mod.label}</span>
                      </div>
                      {PERMISSION_ACTIONS.map(a => {
                        const val = modPerm ? (modPerm[a.key as keyof ConfigProfilModule] as boolean) : false;
                        return (
                          <div key={a.key} className="w-20 flex justify-center flex-shrink-0">
                            <button
                              onClick={() => active && togglePerm(mod.id, a.key, val)}
                              disabled={!active}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                val ? 'bg-slate-800 border-slate-800' : 'border-slate-300 bg-white hover:border-slate-400'
                              } ${!active ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              {val && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {!selectedProfil && (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <div className="text-center">
            <Key className="w-8 h-8 mx-auto mb-2 text-slate-200" />
            <p className="text-sm">Sélectionnez un profil</p>
          </div>
        </div>
      )}
    </div>
  );
}
