import { useState, useEffect } from 'react';
import {
  X, MapPin, FileText, AlertTriangle, User, Mail, Phone,
  Calendar, MessageSquare, Tag, History, Wrench, Clock, CheckCircle2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import {
  CRITICITE_CFG, STATUT_DI_CFG, CANAL_CFG, CATEGORIES_DI,
  type DemandeParsed, type HistoriqueItem, fmtDateFR, fmtDateTimeFR, isSlaBreached, slaRemainingLabel,
} from './interventionsTypes';
import logoCrous from '../../assets/logo-crous-lyon-resize.png';
/* @vite-ignore */
const logoMaResidence = new URL('../../assets/Logo-Ma-Résidence copy copy.png', import.meta.url).href;

// ─── Tâche créée depuis Prise en charge ───────────────────────────────────────

interface TacheCreee {
  id: string;
  index: number;
  titre: string;
  assignee: string | null;
  date_heure: string | null;
  instructions: string | null;
  duree_min: number | null;
  created_at: string;
}

function parseTacheFromHistorique(h: HistoriqueItem, index: number): TacheCreee {
  // Format: "Tâche N : {titre} — {assignee} — {date} — {duree} min"
  const raw = h.description;
  let titre = raw;
  let assignee: string | null = null;
  let date_heure: string | null = null;
  let duree_min: number | null = null;
  let instructions: string | null = null;

  // Try JSON parse first (future-proof)
  try {
    const data = JSON.parse(raw);
    titre       = data.titre ?? raw;
    assignee    = data.assignee ?? null;
    date_heure  = data.dateHeure ?? null;
    instructions = data.instructions ?? null;
    duree_min   = data.dureeMin ? parseInt(data.dureeMin) : null;
    return { id: h.id, index, titre, assignee, date_heure, instructions, duree_min, created_at: h.created_at };
  } catch { /* fall through to text parsing */ }

  // Strip leading "Tâche N : " prefix
  const prefixMatch = raw.match(/^Tâche\s+\d+\s*:\s*/);
  if (prefixMatch) titre = raw.slice(prefixMatch[0].length);

  // Split by " — " separator
  const parts = titre.split(/\s+—\s+/);
  if (parts.length >= 1) titre    = parts[0].trim();
  if (parts.length >= 2) assignee = parts[1].trim() || null;
  if (parts.length >= 3) {
    const datePart = parts[2].trim();
    // Parse "dd/mm/yyyy" back to ISO for display
    const dm = datePart.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dm) date_heure = `${dm[3]}-${dm[2]}-${dm[1]}`;
    else date_heure = datePart || null;
  }
  if (parts.length >= 4) {
    const durPart = parts[3].trim();
    const dm2 = durPart.match(/^(\d+)\s*min$/);
    if (dm2) duree_min = parseInt(dm2[1]);
  }

  return { id: h.id, index, titre, assignee, date_heure, instructions, duree_min, created_at: h.created_at };
}

// ─── Derive task status from demande statut ──────────────────────────────────

function tacheStatutCfg(demandeStatut: string): { label: string; bg: string; text: string; dot: string } {
  if (['resolu', 'cloture'].includes(demandeStatut))
    return { label: 'Terminée', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' };
  if (demandeStatut === 'en_intervention')
    return { label: 'En cours', bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' };
  if (['affecte', 'qualifie'].includes(demandeStatut))
    return { label: 'Planifiée', bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500' };
  return { label: 'À faire', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' };
}


// ─── Historique modal ─────────────────────────────────────────────────────────

function HistoriqueModal({ items, onClose }: { items: HistoriqueItem[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ width: 680, maxWidth: '95vw', maxHeight: '80vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-600" />
            <h3 className="text-base font-bold text-slate-800">Historique de la demande</h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
              Aucun historique disponible
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Action</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date et heure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-slate-700 max-w-[280px]">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">{item.type_evenement.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-slate-700 line-clamp-2">{item.description}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{item.auteur}</td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap text-xs">{fmtDateTimeFR(item.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ icon: Icon, title, color = 'text-slate-500', bg = 'bg-slate-50', children }: {
  icon: React.ElementType; title: string; color?: string; bg?: string; children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-t-xl ${bg} border-b border-slate-100`}>
        <Icon className={`w-4 h-4 ${color}`} />
        <span className={`text-xs font-bold uppercase tracking-widest ${color}`}>{title}</span>
      </div>
      <div className="border border-t-0 border-slate-100 rounded-b-xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-b border-slate-50 last:border-b-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      <div className="text-sm text-slate-700">{value}</div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function DemandeDetailModal({ d, onClose }: { d: DemandeParsed; onClose: () => void }) {
  const [historique, setHistorique] = useState<HistoriqueItem[]>([]);
  const [photos, setPhotos] = useState<{ url: string; categorie: string }[]>([]);
  const [showHistorique, setShowHistorique] = useState(false);

  useEffect(() => {
    supabase
      .from('historique_intervention')
      .select('id, intervention_id, type_evenement, description, auteur, created_at')
      .eq('intervention_id', d.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setHistorique(data as HistoriqueItem[]);
      });

    supabase
      .from('photos_terrain')
      .select('url, categorie')
      .eq('intervention_id', d.id)
      .limit(4)
      .then(({ data }) => {
        if (data && data.length > 0) setPhotos(data);
      });
  }, [d.id]);

  const cat = CATEGORIES_DI.find(c => c.key === (d.categorie ?? d.type_intervention));
  const critCfg = CRITICITE_CFG[d.criticite];
  const statutCfg = STATUT_DI_CFG[d.statut_demande];
  const canalCfg = CANAL_CFG[d.canal_source];
  const breached = isSlaBreached(d);
  const isMaRes = d.canal_source === 'my_residence';

  const locBreadcrumb = [d.site_nom, d.residence_nom, d.batiment_nom, d.localisation_detail].filter(Boolean).join(' › ');
  const locShort = [d.site_nom, d.residence_nom, d.batiment_nom].filter(Boolean).join(' › ');

  const taches = historique
    .filter(h => h.type_evenement === 'tache_creee')
    .map((h, i) => parseTacheFromHistorique(h, i + 1));

  const firstPhoto = photos[0]?.url;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div
          className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ width: 920, maxWidth: '95vw', maxHeight: '92vh' }}
          onClick={e => e.stopPropagation()}
        >

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {cat && <span className="text-2xl flex-shrink-0">{cat.icon}</span>}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-400">{d.reference}</span>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statutCfg.bg} ${statutCfg.text} ${statutCfg.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statutCfg.dot}`} />
                    {statutCfg.label}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${critCfg.bg} ${critCfg.text} ${critCfg.border}`}>
                    {critCfg.icon} {critCfg.label}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-800 mt-0.5 truncate">{d.titre}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              <button
                onClick={() => setShowHistorique(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <History className="w-3.5 h-3.5" />
                Historique
              </button>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body — 2 columns + bottom tasks */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-0 divide-x divide-slate-100">

              {/* Left column */}
              <div className="px-6 py-5">

                {/* 1. Localisation — en premier */}
                <Section icon={MapPin} title="Localisation" color="text-emerald-600" bg="bg-emerald-50">
                  <Row
                    label="Adresse complète"
                    value={
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-700 leading-relaxed">{locBreadcrumb || '—'}</span>
                      </div>
                    }
                  />
                </Section>

                {/* 2. Description / catégorie */}
                <Section icon={FileText} title="Description" color="text-blue-600" bg="bg-blue-50">
                  <Row label="Titre" value={<span className="font-semibold">{d.titre}</span>} />
                  <Row
                    label="Description"
                    value={
                      d.description
                        ? <span className="text-slate-600 leading-relaxed">{d.description}</span>
                        : <span className="text-slate-300 italic">Aucune description</span>
                    }
                  />
                  <Row
                    label="Catégorie"
                    value={
                      cat
                        ? <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                            <span className="text-base">{cat.icon}</span>{cat.label}
                          </span>
                        : <span className="text-slate-400">—</span>
                    }
                  />
                </Section>

                {/* 3. Dates */}
                <Section icon={Calendar} title="Dates & Suivi" color="text-amber-600" bg="bg-amber-50">
                  <Row label="Signalement" value={fmtDateTimeFR(d.created_at)} />
                  {d.date_qualification && <Row label="Qualification" value={fmtDateFR(d.date_qualification)} />}
                  {d.date_affectation && <Row label="Affectation" value={fmtDateFR(d.date_affectation)} />}
                  {d.date_planifiee && <Row label="Date planifiée" value={fmtDateFR(d.date_planifiee)} />}
                  {d.date_resolution && <Row label="Résolution" value={fmtDateFR(d.date_resolution)} />}
                </Section>

                {/* Compte-rendu */}
                {d.compte_rendu && (
                  <Section icon={MessageSquare} title="Compte rendu" color="text-slate-500" bg="bg-slate-50">
                    <div className="px-4 py-3">
                      <p className="text-sm text-slate-600 leading-relaxed">{d.compte_rendu}</p>
                    </div>
                  </Section>
                )}

              </div>

              {/* Right column */}
              <div className="px-6 py-5 space-y-5">

                {/* Plans / cartographie */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Plans & Cartographie</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Cartographie', icon: '🗺️', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                      { label: 'Plan étage', icon: '🏢', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                      { label: 'Plan logement', icon: '🏠', color: 'bg-amber-50 border-amber-200 text-amber-700' },
                    ].map(plan => (
                      <div key={plan.label} className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 ${plan.color} cursor-default`}>
                        <span className="text-2xl">{plan.icon}</span>
                        <span className="text-[10px] font-semibold text-center leading-tight">{plan.label}</span>
                      </div>
                    ))}
                  </div>
                  {locShort && (
                    <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{locShort}
                    </p>
                  )}
                </div>

                {/* Photo de la demande */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Photo de la demande</span>
                  </div>
                  {firstPhoto ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                      <img src={firstPhoto} alt="Photo demande" className="w-full h-36 object-cover" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-24 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 text-xs">
                      Aucune photo jointe
                    </div>
                  )}
                </div>

                {/* Criticité */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Niveau de criticité</span>
                  </div>
                  <div className={`rounded-xl p-4 border-2 ${critCfg.bg} ${critCfg.border}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{critCfg.icon}</span>
                      <div>
                        <p className={`text-lg font-black ${critCfg.text}`}>{critCfg.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">SLA : {critCfg.sla}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span>Délai de traitement</span>
                        <span className={`font-bold ${breached ? 'text-red-600' : 'text-emerald-600'}`}>{slaRemainingLabel(d)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${breached ? 'bg-red-500 w-full' : 'bg-emerald-500 w-2/3'}`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fiche demandeur avec canal + téléphone */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-cyan-500" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fiche demandeur</span>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0 border border-cyan-200">
                        <span className="text-sm font-black text-cyan-700">
                          {d.demandeur_nom ? d.demandeur_nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">{d.demandeur_nom ?? <span className="text-slate-400 italic font-normal">Non renseigné</span>}</p>
                        <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100">
                          {d.demandeur_type === 'etudiant' ? '🎓 Étudiant' : d.demandeur_type === 'interne' ? '🏢 Interne' : '🌐 Externe'}
                        </span>
                      </div>
                    </div>
                    {d.demandeur_email && (
                      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <a href={`mailto:${d.demandeur_email}`} className="text-xs text-blue-600 hover:underline truncate">
                          {d.demandeur_email}
                        </a>
                      </div>
                    )}
                    {d.demandeur_telephone && (
                      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100">
                        <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <a href={`tel:${d.demandeur_telephone}`} className="text-xs text-blue-600 hover:underline">
                          {d.demandeur_telephone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2 px-4 py-2">
                      <span className="text-slate-400 text-sm">{canalCfg.icon}</span>
                      <div className="flex items-center gap-1.5">
                        {isMaRes ? (
                          <img src={logoMaResidence} alt="Ma Résidence" className="w-4 h-4 rounded object-cover" />
                        ) : (
                          <img src={logoCrous} alt="CROUS" className="w-4 h-4 rounded object-contain" />
                        )}
                        <span className={`text-xs font-semibold ${canalCfg.text}`}>{canalCfg.label}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assigné */}
                {(d.agent || d.prestataire) && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigné à</span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-100">
                      <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-blue-700" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-blue-800">{d.agent ?? d.prestataire}</p>
                        <p className="text-xs text-blue-600 mt-0.5">{d.agent ? 'Agent interne' : 'Prestataire'}</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Bottom — Tâches liées */}
            {taches.length > 0 && (
              <div className="border-t border-slate-100 px-6 py-5">
                <div className="flex items-center gap-2 mb-4">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-widest">Tâches liées</span>
                  <span className="ml-1 text-[10px] bg-blue-100 text-blue-700 font-bold rounded-full px-2 py-0.5">{taches.length}</span>
                </div>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {taches.map((t) => {
                    const statut = tacheStatutCfg(d.statut_demande);
                    return (
                      <div key={t.id} className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                        {/* Task header */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-black text-blue-700">{t.index}</span>
                          </div>
                          <p className="text-sm font-bold text-slate-800 flex-1 truncate">{t.titre}</p>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statut.bg} ${statut.text} border-current/20`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statut.dot}`} />
                            {statut.label}
                          </span>
                        </div>
                        {/* Task details grid */}
                        <div className="grid grid-cols-2 gap-0 divide-x divide-slate-100">
                          {/* Left: assignation + planning */}
                          <div className="px-4 py-3 space-y-2.5">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Assigné à</p>
                              {t.assignee ? (
                                <div className="flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                  <span className="text-sm text-slate-700 font-medium">{t.assignee}</span>
                                </div>
                              ) : (
                                <span className="text-slate-300 text-sm italic">Non assignée</span>
                              )}
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Date planifiée</p>
                              {t.date_heure ? (
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                  <span className="text-sm text-slate-700">{fmtDateFR(t.date_heure)}</span>
                                </div>
                              ) : (
                                <span className="text-slate-300 text-sm italic">Non planifiée</span>
                              )}
                            </div>
                            {t.duree_min && (
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Durée estimée</p>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                  <span className="text-sm text-slate-700">{t.duree_min} min</span>
                                </div>
                              </div>
                            )}
                          </div>
                          {/* Right: instructions */}
                          <div className="px-4 py-3">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Instructions</p>
                            {t.instructions ? (
                              <p className="text-sm text-slate-600 leading-relaxed">{t.instructions}</p>
                            ) : (
                              <span className="text-slate-300 text-sm italic">Aucune instruction</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Créée le {fmtDateTimeFR(d.created_at)}
              {d.updated_at !== d.created_at && ` · Mise à jour le ${fmtDateFR(d.updated_at)}`}
            </p>
            <button onClick={onClose} className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors">
              Fermer
            </button>
          </div>
        </div>
      </div>

      {showHistorique && (
        <HistoriqueModal items={historique} onClose={() => setShowHistorique(false)} />
      )}
    </>
  );
}
