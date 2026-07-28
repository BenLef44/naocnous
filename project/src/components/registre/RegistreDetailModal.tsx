import { useState, useEffect, useCallback } from 'react';
import {
  X, Download, Building2, Map, Wrench, AlertTriangle, Paperclip,
  PenLine, CheckCircle2, Clock, Calendar, FileText, User, Phone,
  MapPin, Flame, ShieldAlert, Users, Layers, QrCode,
  ArrowRightCircle, Archive, RotateCcw, History,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../../lib/supabase';
import type { RegistreSecuriteRecord, PointRassemblement, EquipementSecurite } from './registreTypes';
import { STATUT_REGISTRE_CFG, CATEGORIE_ERP_LABELS, TYPE_ERP_LABELS, fmtDate, fmtDateTime } from './registreTypes';
import type { ERP } from './registreTypes';
import PlanViewer from './PlanViewer';
import { generateRegistrePDF } from './generateRegistrePDF';

// ─── Tab definition ────────────────────────────────────────────────────────────

type TabId = 'identification' | 'consignes' | 'equipements' | 'incidents' | 'documents';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'identification', label: 'Identification',          icon: Building2    },
  { id: 'consignes',      label: 'Consignes et plans',      icon: Map          },
  { id: 'equipements',    label: 'Équipements',             icon: Wrench       },
  { id: 'incidents',      label: 'Incidents & exercices',   icon: AlertTriangle },
  { id: 'documents',      label: 'Documents & signatures',  icon: Paperclip    },
];

// ─── Helpers ────────────────────────────────────────────────────────────────────

function InfoRow({ label, value, icon: Icon }: { label: string; value?: string | number | null; icon?: React.ElementType }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-b-0">
      {Icon && <Icon className="w-3.5 h-3.5 text-slate-300 mt-0.5 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-xs text-slate-700 mt-0.5 font-medium">{value ?? '—'}</p>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, iconBg, children }: {
  title: string; icon: React.ElementType; iconBg: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white overflow-hidden mb-4">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
        <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <p className="text-xs font-black text-slate-700">{title}</p>
      </div>
      <div className="px-4 py-1">{children}</div>
    </div>
  );
}

// ─── Tab: Identification ────────────────────────────────────────────────────────

function TabIdentification({ r, erp }: { r: RegistreSecuriteRecord; erp?: ERP | null }) {
  const cfg = STATUT_REGISTRE_CFG[r.statut] ?? STATUT_REGISTRE_CFG['brouillon'];
  return (
    <div className="space-y-4">
      {erp && (
        <SectionCard title="Établissement recevant le public" icon={Building2} iconBg="bg-emerald-500">
          <InfoRow label="Nom" value={erp.nom} icon={Building2} />
          <InfoRow label="Catégorie" value={CATEGORIE_ERP_LABELS[erp.categorie_erp] ?? erp.categorie_erp} icon={ShieldAlert} />
          <InfoRow label="Type" value={TYPE_ERP_LABELS[erp.type_erp] ?? `Type ${erp.type_erp}`} />
          <InfoRow label="Capacité d'accueil" value={`${erp.capacite} personnes`} />
          {erp.adresse && <InfoRow label="Adresse" value={erp.adresse} icon={MapPin} />}
          {erp.responsable_securite && <InfoRow label="Responsable sécurité" value={erp.responsable_securite} icon={User} />}
          {erp.coordonnees_secours && <InfoRow label="Coordonnées secours" value={erp.coordonnees_secours} icon={Phone} />}
        </SectionCard>
      )}
      <SectionCard title="Registre" icon={FileText} iconBg="bg-blue-500">
        <InfoRow label="Référence" value={r.reference} icon={FileText} />
        <InfoRow label="Année" value={r.annee} icon={Calendar} />
        <InfoRow label="Date d'ouverture" value={fmtDate(r.date_ouverture)} icon={Calendar} />
        <InfoRow label="Responsable du registre" value={r.responsable_registre} icon={User} />
        <InfoRow label="Responsable légal" value={r.responsable_legal} icon={User} />
        <div className="py-2.5 border-b border-slate-50">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Organisme(s) de contrôle</p>
          {(r.organismes_controle ?? []).length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {(r.organismes_controle ?? []).map((org, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md px-2 py-0.5">{org}</span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Aucun organisme</p>
          )}
        </div>
        <div className="py-2.5 flex items-center justify-between">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Statut</p>
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>
        <div className="py-2.5 border-t border-slate-50">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Complétude</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${r.completude_pct >= 80 ? 'bg-emerald-500' : r.completude_pct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${r.completude_pct}%` }} />
            </div>
            <span className="text-xs font-bold text-slate-700 tabular-nums w-10 text-right">{r.completude_pct}%</span>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Consignes ─────────────────────────────────────────────────────────────

function TabConsignes({ r }: { r: RegistreSecuriteRecord }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Consignes de sécurité incendie" icon={Flame} iconBg="bg-red-500">
        {r.consignes_incendie ? (
          <pre className="text-xs text-slate-700 font-mono leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-lg p-3 my-3 border border-slate-100">
            {r.consignes_incendie}
          </pre>
        ) : (
          <p className="text-xs text-slate-400 py-3 italic">Non renseigné</p>
        )}
      </SectionCard>
      <SectionCard title="Point de rassemblement et plans" icon={Map} iconBg="bg-blue-500">
        <InfoRow label="Point de rassemblement" value={r.point_rassemblement} icon={MapPin} />
        <InfoRow label="URL plan d'évacuation" value={r.plan_evac_url} />
        {(r.points_rassemblement ?? []).length > 0 && (
          <div className="py-2.5 border-t border-slate-50">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Points sur le plan ({(r.points_rassemblement ?? []).length})</p>
            <div className="space-y-1.5">
              {(r.points_rassemblement ?? []).map((pt, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                  <Users className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                  <span className="font-medium">{pt.nom}</span>
                  {pt.capacite != null && <span className="text-[10px] text-slate-400">({pt.capacite} pers.)</span>}
                  {pt.description && <span className="text-[10px] text-slate-400 truncate">— {pt.description}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>
      {r.consignes_pmr && (
        <SectionCard title="Consignes PMR" icon={User} iconBg="bg-sky-500">
          <p className="text-xs text-slate-700 leading-relaxed py-3">{r.consignes_pmr}</p>
        </SectionCard>
      )}
    </div>
  );
}

// ─── Tab: Equipements ──────────────────────────────────────────────────────────

function VerifRow({ label, date }: { label: string; date?: string | null }) {
  const ok = !!date;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-b-0">
      <p className="text-xs text-slate-600">{label}</p>
      <span className={`flex items-center gap-1.5 text-xs font-semibold ${ok ? 'text-emerald-600' : 'text-slate-400'}`}>
        {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
        {fmtDate(date)}
      </span>
    </div>
  );
}

const STATUT_EQ_CFG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  conforme: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Conforme' },
  non_conforme: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', label: 'Non conforme' },
  en_retard: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'En retard' },
  a_venir: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'À venir' },
};

function TabEquipements({ r }: { r: RegistreSecuriteRecord }) {
  const eqs = r.equipements_securite ?? [];
  const [selectedEq, setSelectedEq] = useState<EquipementSecurite | null>(null);
  return (
    <div className="space-y-4">
      <SectionCard title="Équipements de sécurité" icon={Wrench} iconBg="bg-slate-500">
        <InfoRow label="Nombre d'extincteurs" value={r.nb_extincteurs != null ? `${r.nb_extincteurs} extincteur${r.nb_extincteurs !== 1 ? 's' : ''}` : null} />
        <InfoRow label="Organisme de contrôle" value={r.organisme_controle} />
      </SectionCard>
      <SectionCard title="Dernières vérifications réglementaires" icon={ShieldAlert} iconBg="bg-emerald-500">
        <VerifRow label="SSI — Système de Sécurité Incendie" date={r.derniere_verif_ssi} />
        <VerifRow label="Extincteurs" date={r.derniere_verif_extincteurs} />
        <VerifRow label="Éclairage de sécurité (BAES)" date={r.derniere_verif_eclairage} />
        <VerifRow label="Désenfumage" date={r.derniere_verif_desenfumage} />
      </SectionCard>
      {eqs.length > 0 && (
        <SectionCard title={`Équipements du patrimoine (${eqs.length})`} icon={Layers} iconBg="bg-indigo-500">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left font-bold text-slate-500 px-2 py-1.5 uppercase tracking-wide text-[9px]">Équipement</th>
                  <th className="text-left font-bold text-slate-500 px-2 py-1.5 uppercase tracking-wide text-[9px] hidden sm:table-cell">Localisation</th>
                  <th className="text-left font-bold text-slate-500 px-2 py-1.5 uppercase tracking-wide text-[9px] hidden md:table-cell">Échéance</th>
                  <th className="text-left font-bold text-slate-500 px-2 py-1.5 uppercase tracking-wide text-[9px]">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {eqs.map(eq => {
                  const cfg = STATUT_EQ_CFG[eq.statut] ?? STATUT_EQ_CFG.a_venir;
                  return (
                    <tr key={eq.id} onClick={() => setSelectedEq(eq)} className="hover:bg-slate-50 cursor-pointer">
                      <td className="px-2 py-2 font-medium text-slate-700">{eq.designation}</td>
                      <td className="px-2 py-2 text-slate-600 hidden sm:table-cell">{eq.localisation}</td>
                      <td className="px-2 py-2 text-slate-600 hidden md:table-cell">{fmtDate(eq.date_prochain_controle)}</td>
                      <td className="px-2 py-2">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-1 h-1 rounded-full ${cfg.dot}`} /> {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
      {selectedEq && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedEq(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between px-4 py-3 border-b border-slate-100">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 truncate">{selectedEq.designation}</h3>
                    <p className="text-[11px] text-slate-400 truncate">{selectedEq.categorie} · {selectedEq.localisation}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedEq(null)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${(STATUT_EQ_CFG[selectedEq.statut] ?? STATUT_EQ_CFG.a_venir).bg} ${(STATUT_EQ_CFG[selectedEq.statut] ?? STATUT_EQ_CFG.a_venir).text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${(STATUT_EQ_CFG[selectedEq.statut] ?? STATUT_EQ_CFG.a_venir).dot}`} />
                  {(STATUT_EQ_CFG[selectedEq.statut] ?? STATUT_EQ_CFG.a_venir).label}
                </span>
                <div className="flex-1" />
                <div className="bg-white border border-slate-200 rounded-lg p-1.5">
                  <QRCodeSVG value={`EQUIP:${selectedEq.id}|${selectedEq.designation}`} size={48} level="M" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                <div className="rounded-lg border border-slate-100 divide-y divide-slate-50">
                  <DetailRow label="Désignation" value={selectedEq.designation} />
                  <DetailRow label="Catégorie" value={selectedEq.categorie} />
                  <DetailRow label="Localisation" value={selectedEq.localisation} />
                  <DetailRow label="Prochain contrôle" value={fmtDate(selectedEq.date_prochain_controle)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3">
      <p className="text-[10px] font-semibold text-slate-400 uppercase">{label}</p>
      <p className="text-xs text-slate-700 font-medium">{value}</p>
    </div>
  );
}

// ─── Tab: Incidents ─────────────────────────────────────────────────────────────

function TabIncidents({ r }: { r: RegistreSecuriteRecord }) {
  const exercices = r.exercices ?? [];
  return (
    <div className="space-y-4">
      <SectionCard title="Exercices d'évacuation" icon={AlertTriangle} iconBg="bg-amber-500">
        <InfoRow label="Exercices réalisés (année)" value={r.nb_exercices_annee != null ? `${r.nb_exercices_annee} exercice${(r.nb_exercices_annee ?? 0) !== 1 ? 's' : ''}` : null} icon={Calendar} />
        <InfoRow label="Date du dernier exercice" value={fmtDate(r.date_dernier_exercice)} icon={Calendar} />
        {exercices.length > 0 && (
          <div className="py-2.5 border-t border-slate-50">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Détail des exercices ({exercices.length})</p>
            <div className="space-y-2">
              {exercices.map((ex, i) => (
                <div key={i} className="rounded-lg border border-slate-100 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-700">{fmtDate(ex.date)} — {ex.type}</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${ex.satisfaisant ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {ex.satisfaisant ? 'Satisfaisant' : 'Non satisfaisant'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                    {ex.effectif_participants != null && <span>{ex.effectif_participants} participants</span>}
                    {ex.duree_evacuation != null && <span>Durée: {ex.duree_evacuation} min</span>}
                  </div>
                  {ex.observations && <p className="text-[10px] text-slate-500 mt-1">{ex.observations}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>
      <SectionCard title="Incidents déclarés" icon={ShieldAlert} iconBg="bg-red-500">
        <InfoRow label="Incidents déclarés (année)" value={r.nb_incidents_annee != null ? `${r.nb_incidents_annee} incident${(r.nb_incidents_annee ?? 0) !== 1 ? 's' : ''}` : null} />
        {r.observations && (
          <div className="py-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Observations</p>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-100">{r.observations}</p>
          </div>
        )}
      </SectionCard>
      {(r.commissions ?? []).length > 0 && (
        <SectionCard title={`Commissions de sécurité (${(r.commissions ?? []).length})`} icon={Users} iconBg="bg-indigo-500">
          <div className="space-y-2 py-2">
            {(r.commissions ?? []).map((comm, i) => (
              <div key={i} className="rounded-lg border border-slate-100 px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-700">{comm.type}</p>
                  <span className="text-[10px] text-slate-400">{fmtDate(comm.date_visite)}</span>
                </div>
                {comm.prescriptions && <p className="text-[10px] text-slate-500 mt-1"><span className="font-semibold">Prescriptions:</span> {comm.prescriptions}</p>}
                {comm.reserves && (
                  <p className="text-[10px] mt-1">
                    <span className="font-semibold text-orange-600">Réserves:</span> <span className="text-slate-600">{comm.reserves}</span>
                    {comm.levee_reserves && <span className="text-emerald-600 ml-2 font-semibold">— Levées: {comm.levee_reserves}</span>}
                    {!comm.levee_reserves && <span className="text-orange-500 ml-2 font-semibold">— Non levées</span>}
                  </p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// ─── Tab: Documents & Signatures ───────────────────────────────────────────────

function TabDocuments({ r }: { r: RegistreSecuriteRecord }) {
  const docs = r.documents ?? [];
  const sigs = r.signatures ?? [];
  const nbSigned = sigs.filter(s => s.valide).length;

  return (
    <div className="space-y-4">
      <SectionCard title={`Documents annexes (${docs.length})`} icon={Paperclip} iconBg="bg-slate-500">
        {docs.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 italic">Aucun document joint</p>
        ) : (
          <div className="divide-y divide-slate-50 py-1">
            {docs.map((doc, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-3.5 h-3.5 text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{doc.nom}</p>
                  {doc.type && <p className="text-[10px] text-slate-400">{doc.type}</p>}
                </div>
                {doc.url && (
                  <a href={doc.url} target="_blank" rel="noreferrer"
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title={`Signatures électroniques (${nbSigned}/${sigs.length})`} icon={PenLine} iconBg="bg-emerald-600">
        {sigs.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 italic">Aucun signataire</p>
        ) : (
          <div className="divide-y divide-slate-50 py-1">
            {sigs.map((sig, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5">
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                  ${sig.valide ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'}`}>
                  {sig.valide && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold ${sig.valide ? 'text-emerald-800' : 'text-slate-600'}`}>{sig.acteur}</p>
                  <p className="text-[10px] text-slate-400">
                    {sig.role}{sig.email ? ` · ${sig.email}` : ''}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  {sig.valide ? (
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600">Signé</p>
                      <p className="text-[10px] text-slate-400">{fmtDate(sig.date)}</p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400">En attente</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {sigs.length > 0 && (
          <div className="py-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${sigs.length > 0 ? (nbSigned / sigs.length) * 100 : 0}%` }} />
              </div>
              <span className="text-[10px] font-bold text-emerald-600">{nbSigned}/{sigs.length} validé{nbSigned !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Props / Main ──────────────────────────────────────────────────────────────

interface Props {
  registre: RegistreSecuriteRecord;
  erp?: ERP | null;
  onClose: () => void;
  onEdit: (registre: RegistreSecuriteRecord) => void;
}

interface HistoryEntry {
  id: string;
  ancien_statut: string;
  nouveau_statut: string;
  date_changement: string;
  auteur: string;
  commentaire: string | null;
}

const TRANSITIONS: Record<string, { to: string; label: string; icon: React.ElementType; color: string }[]> = {
  brouillon: [{ to: 'en_cours', label: 'Mettre en cours', icon: ArrowRightCircle, color: 'bg-amber-500 hover:bg-amber-600' }],
  en_cours: [
    { to: 'valide', label: 'Valider', icon: CheckCircle2, color: 'bg-emerald-600 hover:bg-emerald-700' },
    { to: 'brouillon', label: 'Remettre en brouillon', icon: RotateCcw, color: 'bg-slate-400 hover:bg-slate-500' },
  ],
  valide: [
    { to: 'archive', label: 'Archiver', icon: Archive, color: 'bg-blue-500 hover:bg-blue-600' },
    { to: 'en_cours', label: 'Rouvrir', icon: RotateCcw, color: 'bg-amber-500 hover:bg-amber-600' },
  ],
  archive: [{ to: 'valide', label: 'Désarchiver', icon: RotateCcw, color: 'bg-emerald-500 hover:bg-emerald-600' }],
};

export default function RegistreDetailModal({ registre: r, erp, onClose, onEdit }: Props) {
  const [tab, setTab] = useState<TabId>('identification');
  const [currentStatut, setCurrentStatut] = useState(r.statut);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const loadHistory = useCallback(async () => {
    const { data } = await supabase
      .from('registre_securite_historique')
      .select('*')
      .eq('registre_id', r.id)
      .order('date_changement', { ascending: false })
      .limit(20);
    setHistory((data ?? []) as HistoryEntry[]);
  }, [r.id]);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleExportPDF = () => {
    generateRegistrePDF(r, erp);
  };

  const handleTransition = async (newStatut: string) => {
    setTransitioning(true);
    const oldStatut = currentStatut;
    await supabase.from('registres_securite').update({ statut: newStatut }).eq('id', r.id);
    await supabase.from('registre_securite_historique').insert({
      registre_id: r.id,
      ancien_statut: oldStatut,
      nouveau_statut: newStatut,
      auteur: 'Système',
      commentaire: null,
    });
    setCurrentStatut(newStatut as typeof currentStatut);
    setTransitioning(false);
    loadHistory();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">{r.reference}</h2>
              <p className="text-[11px] text-slate-400">{erp?.nom ?? '—'} · {r.annee}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportPDF}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
              <Download className="w-3.5 h-3.5" /> Exporter PDF
            </button>
            <button onClick={() => onEdit(r)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors font-semibold">
              Modifier
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors ml-1">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5 px-4 py-2.5 border-b border-slate-100 flex-shrink-0 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-colors
                ${tab === id ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {tab === 'identification' && <TabIdentification r={r} erp={erp} />}
          {tab === 'consignes'      && <TabConsignes r={r} />}
          {tab === 'equipements'    && <TabEquipements r={r} />}
          {tab === 'incidents'      && <TabIncidents r={r} />}
          {tab === 'documents'      && <TabDocuments r={r} />}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between flex-shrink-0 bg-slate-50/50 rounded-b-2xl">
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${STATUT_REGISTRE_CFG[currentStatut]?.bg} ${STATUT_REGISTRE_CFG[currentStatut]?.text} border ${STATUT_REGISTRE_CFG[currentStatut]?.border}`}>
              {STATUT_REGISTRE_CFG[currentStatut]?.label}
            </span>
            <p className="text-[10px] text-slate-400">
              Créé le {fmtDate(r.created_at)} · Modifié le {fmtDate(r.updated_at)}
            </p>
            <button onClick={() => { setShowHistory(s => !s); }}
              className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md transition-colors ${showHistory ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}>
              <History className="w-3 h-3" /> Historique
            </button>
          </div>
          <div className="flex items-center gap-2">
            {(TRANSITIONS[currentStatut] ?? []).map(tr => {
              const TrIcon = tr.icon;
              return (
                <button key={tr.to} onClick={() => handleTransition(tr.to)} disabled={transitioning}
                  className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg text-white transition-colors disabled:opacity-40 ${tr.color}`}>
                  <TrIcon className="w-3.5 h-3.5" /> {tr.label}
                </button>
              );
            })}
            <button onClick={onClose} className="text-xs px-4 py-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
              Fermer
            </button>
          </div>
        </div>

        {/* History panel */}
        {showHistory && (
          <div className="border-t border-slate-100 px-6 py-3 bg-white max-h-40 overflow-y-auto rounded-b-2xl">
            {history.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center py-2">Aucun changement de statut enregistré</p>
            ) : (
              <div className="space-y-1.5">
                {history.map(h => (
                  <div key={h.id} className="flex items-center gap-3 text-[11px]">
                    <span className={`font-bold px-1.5 py-0.5 rounded ${STATUT_REGISTRE_CFG[h.ancien_statut]?.bg ?? 'bg-slate-100'} ${STATUT_REGISTRE_CFG[h.ancien_statut]?.text ?? 'text-slate-500'}`}>
                      {STATUT_REGISTRE_CFG[h.ancien_statut]?.label ?? h.ancien_statut}
                    </span>
                    <span className="text-slate-300">→</span>
                    <span className={`font-bold px-1.5 py-0.5 rounded ${STATUT_REGISTRE_CFG[h.nouveau_statut]?.bg ?? 'bg-slate-100'} ${STATUT_REGISTRE_CFG[h.nouveau_statut]?.text ?? 'text-slate-500'}`}>
                      {STATUT_REGISTRE_CFG[h.nouveau_statut]?.label ?? h.nouveau_statut}
                    </span>
                    <span className="text-slate-400 ml-auto">{fmtDateTime(h.date_changement)}</span>
                    <span className="text-slate-400">{h.auteur}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
