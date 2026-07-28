import { useState } from 'react';
import {
  ArrowLeft, Mail, Bell, Smartphone, Bold, Italic, List, Link, Image,
  Plus, Eye, Send, Variable, ChevronDown, Check, X, Save, Zap,
} from 'lucide-react';
import type { ModeleComm } from './commTypes';
import { MODULE_LABELS, CANAL_LABELS } from './commTypes';

const VARIABLES = [
  { group: 'Demande d\'intervention', vars: ['{{ticket.reference}}','{{ticket.titre}}','{{ticket.description}}','{{ticket.criticite}}','{{ticket.statut}}','{{ticket.date_creation}}'] },
  { group: 'Équipement',             vars: ['{{equipement.nom}}','{{equipement.reference}}','{{equipement.categorie}}','{{equipement.localisation}}'] },
  { group: 'Demandeur',              vars: ['{{demandeur.nom}}','{{demandeur.prenom}}','{{demandeur.email}}','{{demandeur.telephone}}','{{demandeur.service}}'] },
  { group: 'Responsable',            vars: ['{{responsable.nom}}','{{responsable.email}}','{{responsable.telephone}}'] },
  { group: 'Intervention',           vars: ['{{intervention.date_prevue}}','{{intervention.date_realisee}}','{{intervention.duree}}'] },
  { group: 'Site',                   vars: ['{{site.campus}}','{{site.residence}}','{{site.batiment}}','{{site.local}}'] },
];

const TABS = ['Contenu','Déclenchement','Destinataires','Historique','Statistiques'] as const;
type TabId = typeof TABS[number];

interface Props { modele: ModeleComm; onBack: () => void; onSave: (m: ModeleComm) => void }

export default function CommModeleDetail({ modele, onBack, onSave }: Props) {
  const [tab,        setTab]       = useState<TabId>('Contenu');
  const [form,       setForm]      = useState<ModeleComm>({ ...modele });
  const [showVars,   setShowVars]  = useState(false);
  const [testEmail,  setTestEmail] = useState('');
  const [showTest,   setShowTest]  = useState(false);
  const [sent,       setSent]      = useState(false);

  const set = <K extends keyof ModeleComm>(k: K, v: ModeleComm[K]) => setForm(prev => ({ ...prev, [k]: v }));

  const insertVar = (v: string) => set('corps', form.corps + ' ' + v);

  const sendTest = () => { setSent(true); setTimeout(() => { setSent(false); setShowTest(false); }, 1500); };

  const EVENEMENTS = ['Demande créée','Demande affectée','Intervention planifiée','Intervention réalisée','Intervention en retard','Contrôle à échéance','Contrat expirant','Rupture de stock','Devis validé','EDL créé'];
  const DELAIS     = ['Immédiat','1h avant','24h avant','48h avant','7j avant','30j avant','48h après'];
  const FREQUENCES = ['Une seule fois','Chaque occurrence','Rappel quotidien','Rappel hebdomadaire'];

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4 flex-shrink-0">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>
        <div className="w-px h-5 bg-slate-200" />
        <div className="flex-1">
          <h2 className="text-sm font-bold text-slate-800">{form.nom}</h2>
          <p className="text-xs text-slate-400">{MODULE_LABELS[form.module]} · {CANAL_LABELS[form.type]}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowTest(true)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
            <Send className="w-3.5 h-3.5" /> Test
          </button>
          <button onClick={() => onSave(form)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            <Save className="w-3.5 h-3.5" /> Enregistrer
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-slate-100 flex-shrink-0">
        <div className="flex gap-0">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${tab === t ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">

        {/* ── Contenu ── */}
        {tab === 'Contenu' && (
          <div className="flex-1 h-full flex overflow-hidden">
            {/* Editor */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5" style={{ scrollbarWidth: 'thin' }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Nom du modèle</label>
                  <input value={form.nom} onChange={e => set('nom', e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Type</label>
                  <div className="flex gap-2">
                    {(['email','notif','email_notif'] as const).map(t => (
                      <button key={t} type="button" onClick={() => set('type', t)}
                        className={`flex-1 py-2 text-[11px] font-semibold rounded-xl border-2 transition-colors ${form.type === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}>
                        {CANAL_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Sujet</label>
                <input value={form.sujet} onChange={e => set('sujet', e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>

              {/* Toolbar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-600">Corps du message</label>
                  <button onClick={() => setShowVars(!showVars)}
                    className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold hover:underline">
                    <Variable className="w-3 h-3" /> Variables dynamiques
                    <ChevronDown className={`w-3 h-3 transition-transform ${showVars ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                {showVars && (
                  <div className="mb-2 border border-slate-100 rounded-xl bg-slate-50 p-3 grid grid-cols-3 gap-3 max-h-48 overflow-y-auto text-xs">
                    {VARIABLES.map(g => (
                      <div key={g.group}>
                        <p className="font-bold text-slate-500 mb-1.5">{g.group}</p>
                        <div className="space-y-1">
                          {g.vars.map(v => (
                            <button key={v} type="button" onClick={() => insertVar(v)}
                              className="w-full text-left px-2 py-1 bg-white border border-slate-200 rounded text-blue-600 font-mono text-[10px] hover:bg-blue-50 hover:border-blue-200 transition-colors truncate">
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1 px-2 py-1.5 border border-b-0 border-slate-200 rounded-t-lg bg-slate-50">
                  {[Bold, Italic, List, Link, Image].map((Icon, i) => (
                    <button key={i} className="p-1.5 hover:bg-white rounded transition-colors">
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  ))}
                  <div className="w-px h-4 bg-slate-200 mx-1" />
                  <button className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-white rounded transition-colors border border-slate-200">
                    <Plus className="w-3 h-3" /> Bouton d'action
                  </button>
                </div>
                <textarea value={form.corps} onChange={e => set('corps', e.target.value)} rows={10}
                  className="w-full text-sm border border-slate-200 rounded-b-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 font-mono" />
              </div>
            </div>

            {/* Preview */}
            <div className="w-72 border-l border-slate-100 flex-shrink-0 flex flex-col">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-600">Aperçu du message</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin' }}>
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-blue-600 px-4 py-3">
                    <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider">CROUS Lyon</p>
                    <p className="text-sm font-bold text-white mt-0.5">{form.sujet.replace(/\{\{[^}]+\}\}/g, '[valeur]')}</p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {form.corps.replace(/\{\{[^}]+\}\}/g, '[valeur]')}
                    </p>
                    <button className="mt-3 w-full py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">
                      Voir la demande →
                    </button>
                  </div>
                  <div className="px-4 py-2 bg-slate-50 border-t border-slate-100">
                    <p className="text-[9px] text-slate-400">CROUS Lyon · 59 rue de la Madeleine · 69007 Lyon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Déclenchement ── */}
        {tab === 'Déclenchement' && (
          <div className="p-6 max-w-2xl space-y-5 overflow-y-auto h-full" style={{ scrollbarWidth: 'thin' }}>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Module</label>
              <select value={form.module} onChange={e => set('module', e.target.value as typeof form.module)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-200">
                {Object.entries(MODULE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Événement déclencheur</label>
              <div className="grid grid-cols-2 gap-2">
                {EVENEMENTS.map(e => (
                  <button key={e} type="button" onClick={() => set('evenement', e)}
                    className={`text-xs px-3 py-2 rounded-xl border-2 text-left transition-colors ${form.evenement === e ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    <Zap className={`w-3 h-3 inline mr-1.5 ${form.evenement === e ? 'text-blue-500' : 'text-slate-400'}`} />{e}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Délai</label>
                <div className="space-y-1">
                  {DELAIS.map(d => (
                    <button key={d} type="button"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 text-left text-slate-600 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Fréquence</label>
                <div className="space-y-1">
                  {FREQUENCES.map(f => (
                    <button key={f} type="button"
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 text-left text-slate-600 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Destinataires ── */}
        {tab === 'Destinataires' && (
          <div className="p-6 max-w-2xl space-y-6 overflow-y-auto h-full" style={{ scrollbarWidth: 'thin' }}>
            <div>
              <p className="text-xs font-bold text-slate-600 mb-3">Destinataires standards</p>
              <div className="space-y-2">
                {['Demandeur','Responsable','Gestionnaire','Prestataire','Équipe','Groupe personnalisé'].map((d, i) => (
                  <label key={d} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${i < 3 ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>
                      {i < 3 && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className="text-xs font-medium text-slate-700">{d}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-600 mb-3">Canaux</p>
              <div className="space-y-2">
                {[{label:'Notification applicative', icon: Bell}, {label:'Email', icon: Mail}, {label:'SMS', icon: Smartphone}].map((c, i) => (
                  <label key={c.label} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${i < 2 ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>
                      {i < 2 && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <c.icon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-medium text-slate-700">{c.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="border border-slate-100 rounded-xl p-4">
              <p className="text-xs font-bold text-slate-600 mb-3">Destinataires conditionnels</p>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-700">SI</span>
                  <select className="text-xs border border-blue-200 rounded px-2 py-1 bg-white">
                    <option>Criticité</option>
                    <option>Statut</option>
                    <option>Module</option>
                  </select>
                  <span className="text-slate-500">=</span>
                  <select className="text-xs border border-blue-200 rounded px-2 py-1 bg-white">
                    <option>Critique</option>
                    <option>Haute</option>
                    <option>Normale</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-700">ALORS ajouter</span>
                  <input defaultValue="Direction technique" className="text-xs border border-blue-200 rounded px-2 py-1 bg-white flex-1" />
                </div>
              </div>
              <button className="mt-2 flex items-center gap-1 text-[11px] text-blue-600 font-semibold hover:underline">
                <Plus className="w-3 h-3" /> Ajouter une condition
              </button>
            </div>
          </div>
        )}

        {/* ── Historique / Statistiques ── */}
        {(tab === 'Historique' || tab === 'Statistiques') && (
          <div className="p-6 flex items-center justify-center h-full">
            <div className="text-center text-slate-400">
              <Eye className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">{tab === 'Historique' ? 'Historique des envois' : 'Statistiques détaillées'}</p>
              <p className="text-xs mt-1">Disponible après le premier envoi</p>
            </div>
          </div>
        )}
      </div>

      {/* Test modal */}
      {showTest && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTest(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Send className="w-4 h-4 text-blue-500" /> Envoyer un test</h3>
              <button onClick={() => setShowTest(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Adresse email de test</label>
              <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="vous@crous-lyon.fr"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            </div>
            <button onClick={sendTest} disabled={!testEmail || sent}
              className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-colors ${sent ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'}`}>
              {sent ? <><Check className="w-4 h-4" /> Email envoyé !</> : <><Send className="w-4 h-4" /> Envoyer</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
