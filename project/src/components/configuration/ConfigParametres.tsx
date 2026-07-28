import React, { useState } from 'react';
import { Save, Check, Globe, Bell, Shield, Palette, Database } from 'lucide-react';

export default function ConfigParametres() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    nom_plateforme: 'Naofix',
    organisme: 'CROUS de Lyon',
    fuseau_horaire: 'Europe/Paris',
    langue: 'fr',
    sla_critique: '4',
    sla_haute: '8',
    sla_moyenne: '48',
    sla_faible: '120',
    notif_email: true,
    notif_retard: true,
    notif_creation: false,
    session_duree: '8',
    mfa_obligatoire: false,
    export_format: 'xlsx',
    retention_journal: '365',
  });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const toggle = (key: keyof typeof form) =>
    setForm(f => ({ ...f, [key]: !f[key] }));
  const set = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));

  const section = (label: string, icon: React.ElementType, children: React.ReactNode) => (
    <div className="bg-white rounded-xl border border-slate-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        {React.createElement(icon, { className: 'w-4 h-4 text-slate-500' })}
        <p className="text-sm font-bold text-slate-700">{label}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );

  const fieldText = (label: string, key: keyof typeof form) => (
    <div className="flex items-center justify-between">
      <label className="text-xs text-slate-600 w-48 flex-shrink-0">{label}</label>
      <input value={form[key] as string} onChange={set(key)}
        className="flex-1 max-w-xs px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300" />
    </div>
  );

  const fieldToggle = (label: string, sub: string, key: keyof typeof form) => (
    <div className="flex items-center gap-3">
      <button onClick={() => toggle(key)}
        className={`relative inline-flex w-9 h-5 rounded-full transition-colors flex-shrink-0 ${form[key] ? 'bg-slate-800' : 'bg-slate-200'}`}>
        <span className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform mt-0.5 ${form[key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
      <div>
        <p className="text-xs font-medium text-slate-700">{label}</p>
        {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-4 max-w-2xl">

      {section('Identité de la plateforme', Globe, <>
        {fieldText('Nom de la plateforme', 'nom_plateforme')}
        {fieldText('Organisme', 'organisme')}
        <div className="flex items-center justify-between">
          <label className="text-xs text-slate-600 w-48 flex-shrink-0">Langue par défaut</label>
          <select value={form.langue} onChange={set('langue')}
            className="flex-1 max-w-xs px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300">
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-xs text-slate-600 w-48 flex-shrink-0">Fuseau horaire</label>
          <select value={form.fuseau_horaire} onChange={set('fuseau_horaire')}
            className="flex-1 max-w-xs px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300">
            <option value="Europe/Paris">Europe/Paris (UTC+1/+2)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
      </>)}

      {section('SLA par criticité (heures)', Database, <>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Critique', key: 'sla_critique' as const },
            { label: 'Haute',    key: 'sla_haute' as const },
            { label: 'Moyenne',  key: 'sla_moyenne' as const },
            { label: 'Faible',   key: 'sla_faible' as const },
          ].map(s => (
            <div key={s.key}>
              <label className="block text-xs text-slate-500 mb-1">{s.label}</label>
              <div className="flex items-center gap-1.5">
                <input type="number" value={form[s.key]} onChange={set(s.key)}
                  className="w-20 px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300" />
                <span className="text-xs text-slate-400">heures</span>
              </div>
            </div>
          ))}
        </div>
      </>)}

      {section('Notifications', Bell, <>
        {fieldToggle('Notifier par email', 'Envoyer les alertes importantes par email', 'notif_email')}
        {fieldToggle('Alerte retard', 'Notifier quand une intervention est en retard', 'notif_retard')}
        {fieldToggle('Notification création', 'Notifier à chaque création de demande', 'notif_creation')}
      </>)}

      {section('Sécurité', Shield, <>
        <div className="flex items-center justify-between">
          <label className="text-xs text-slate-600 w-48 flex-shrink-0">Durée de session (heures)</label>
          <input type="number" value={form.session_duree} onChange={set('session_duree')}
            className="w-24 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300" />
        </div>
        {fieldToggle('MFA obligatoire', 'Double authentification requise pour tous les utilisateurs', 'mfa_obligatoire')}
        <div className="flex items-center justify-between">
          <label className="text-xs text-slate-600 w-48 flex-shrink-0">Rétention journal (jours)</label>
          <input type="number" value={form.retention_journal} onChange={set('retention_journal')}
            className="w-24 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300" />
        </div>
      </>)}

      {section('Export & données', Palette, <>
        <div className="flex items-center justify-between">
          <label className="text-xs text-slate-600 w-48 flex-shrink-0">Format d'export par défaut</label>
          <select value={form.export_format} onChange={set('export_format')}
            className="flex-1 max-w-xs px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300">
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="csv">CSV (.csv)</option>
            <option value="pdf">PDF (.pdf)</option>
          </select>
        </div>
      </>)}

      <button onClick={handleSave}
        className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
          saved ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-white hover:bg-slate-700'
        }`}>
        {saved ? <><Check className="w-4 h-4" />Enregistré</> : <><Save className="w-4 h-4" />Enregistrer les paramètres</>}
      </button>
    </div>
  );
}
