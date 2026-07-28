import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, Clock, AlertTriangle, MapPin, Tag, User, Calendar,
  MessageSquare, ChevronRight, ArrowLeft, Send, X, Package,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CRITICITE_CFG, type CriticiteDI, type StatutDI } from './interventionsTypes';

interface HistoriqueItem {
  id: string;
  type_evenement: string;
  description: string;
  auteur: string;
  created_at: string;
}

interface DemandeSuivi {
  id: string;
  reference: string;
  titre: string;
  description: string | null;
  statut_demande: StatutDI;
  criticite: CriticiteDI;
  sla_heures: number;
  categorie: string | null;
  localisation_detail: string | null;
  demandeur_nom: string | null;
  demandeur_email: string | null;
  created_at: string;
  date_qualification: string | null;
  date_affectation: string | null;
  date_resolution: string | null;
}

const WORKFLOW_STEPS: { key: StatutDI; label: string }[] = [
  { key: 'nouveau',              label: 'Demande créée'       },
  { key: 'a_qualifier',          label: 'En qualification'    },
  { key: 'qualifie',             label: 'Qualifiée'           },
  { key: 'affecte',              label: 'Affectée'            },
  { key: 'en_intervention',      label: 'Intervention en cours' },
  { key: 'resolu',               label: 'Résolue'             },
  { key: 'cloture',              label: 'Clôturée'            },
];

const WORKFLOW_ORDER: StatutDI[] = [
  'nouveau', 'a_qualifier', 'qualifie', 'affecte', 'en_intervention',
  'en_attente_validation', 'resolu', 'cloture',
];

function stepIndex(statut: StatutDI): number {
  const i = WORKFLOW_ORDER.indexOf(statut);
  return i === -1 ? 0 : i;
}

function slaLabel(sla: number): string {
  if (sla <= 4)  return 'Moins de 4 heures';
  if (sla <= 8)  return 'Sous 8 heures ouvrées';
  if (sla <= 24) return 'Sous 24 heures ouvrées';
  if (sla <= 48) return 'Sous 2 jours ouvrés';
  if (sla <= 72) return 'Sous 3 jours ouvrés';
  return `Sous ${Math.round(sla / 24)} jours ouvrés`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

interface Props {
  reference: string;
  onBack?: () => void;
}

export default function SuiviDemande({ reference, onBack }: Props) {
  const [demande, setDemande]     = useState<DemandeSuivi | null>(null);
  const [history, setHistory]     = useState<HistoriqueItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [notFound, setNotFound]   = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentAuteur, setCommentAuteur] = useState('');
  const [sending, setSending]     = useState(false);
  const [copied, setCopied]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('interventions')
      .select('id, reference, titre, description, statut_demande, criticite, sla_heures, categorie, localisation_detail, demandeur_nom, demandeur_email, created_at, date_qualification, date_affectation, date_resolution')
      .eq('reference', reference)
      .maybeSingle();

    if (error || !data) { setNotFound(true); setLoading(false); return; }
    setDemande(data as DemandeSuivi);

    const { data: hist } = await supabase
      .from('historique_intervention')
      .select('id, type_evenement, description, auteur, created_at')
      .eq('intervention_id', data.id)
      .order('created_at', { ascending: false });

    setHistory((hist ?? []) as HistoriqueItem[]);
    setLoading(false);
  }, [reference]);

  useEffect(() => { load(); }, [load]);

  async function sendComment() {
    if (!demande || !commentText.trim()) return;
    setSending(true);
    await supabase.from('historique_intervention').insert([{
      intervention_id: demande.id,
      type_evenement: 'commentaire_demandeur',
      description: commentText.trim(),
      auteur: commentAuteur.trim() || demande.demandeur_nom || 'Demandeur',
    }]);
    setCommentText('');
    setShowComment(false);
    setSending(false);
    load();
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
          <p className="text-sm text-slate-500">Chargement de votre demande…</p>
        </div>
      </div>
    );
  }

  if (notFound || !demande) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-base font-bold text-slate-800">Demande introuvable</p>
          <p className="text-sm text-slate-500">La référence <span className="font-mono font-semibold">{reference}</span> n'existe pas.</p>
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-1.5 mx-auto mt-4 text-sm text-blue-600 hover:text-blue-800 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
          )}
        </div>
      </div>
    );
  }

  const critCfg  = CRITICITE_CFG[demande.criticite];
  const curStep  = stepIndex(demande.statut_demande);
  const isClosed = demande.statut_demande === 'cloture' || demande.statut_demande === 'rejete';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Portail de suivi</p>
              <p className="text-sm font-bold text-slate-800 font-mono">{demande.reference}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={copyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Package className="w-3.5 h-3.5" />}
              {copied ? 'Lien copié !' : 'Partager'}
            </button>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${critCfg.bg} ${critCfg.text}`}>
              <span>{critCfg.icon}</span> {critCfg.label}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Confirmation banner */}
        {!isClosed && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-emerald-800">Votre demande a bien été enregistrée</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Vous pouvez suivre l'avancement ici à tout moment, sans avoir besoin de contacter un service.
              </p>
            </div>
          </div>
        )}

        {/* Info card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-base font-bold text-slate-800 leading-tight">{demande.titre}</p>
              {demande.description && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{demande.description}</p>
              )}
            </div>
          </div>
          <div className="px-5 py-4 grid grid-cols-2 gap-4">
            <InfoRow icon={<Tag className="w-3.5 h-3.5" />}     label="Numéro"    value={demande.reference} mono />
            <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="Créée le"  value={fmtDate(demande.created_at)} />
            {demande.categorie && (
              <InfoRow icon={<Tag className="w-3.5 h-3.5" />} label="Catégorie" value={demande.categorie} />
            )}
            {demande.localisation_detail && (
              <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Lieu" value={demande.localisation_detail} />
            )}
            {demande.demandeur_nom && (
              <InfoRow icon={<User className="w-3.5 h-3.5" />} label="Demandeur" value={demande.demandeur_nom} />
            )}
            <div className="flex items-start gap-2">
              <div className="mt-0.5 text-slate-400"><Clock className="w-3.5 h-3.5" /></div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Délai estimé</p>
                <p className="text-xs font-semibold text-slate-700">{slaLabel(demande.sla_heures)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-800">Avancement</p>
          </div>
          <div className="px-5 py-5">
            <div className="space-y-0">
              {WORKFLOW_STEPS.map((step, idx) => {
                const done    = idx < curStep;
                const current = idx === curStep;
                const future  = idx > curStep;
                return (
                  <div key={step.key} className="flex items-start gap-3">
                    {/* Line + dot */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        done    ? 'bg-emerald-500 border-emerald-500' :
                        current ? 'bg-blue-600 border-blue-600 ring-4 ring-blue-100' :
                                  'bg-white border-slate-200'
                      }`}>
                        {done ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        ) : current ? (
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-200" />
                        )}
                      </div>
                      {idx < WORKFLOW_STEPS.length - 1 && (
                        <div className={`w-0.5 h-7 mt-1 ${done ? 'bg-emerald-300' : 'bg-slate-150'}`} />
                      )}
                    </div>
                    {/* Label */}
                    <div className="pb-7 min-w-0">
                      <p className={`text-xs font-semibold leading-tight transition-colors ${
                        done ? 'text-emerald-700' : current ? 'text-blue-700' : 'text-slate-400'
                      }`}>
                        {step.label}
                      </p>
                      {current && (
                        <p className="text-[10px] text-blue-500 mt-0.5">En cours…</p>
                      )}
                    </div>
                    {/* Right side: chevron for current */}
                    {current && (
                      <div className="ml-auto flex-shrink-0 mt-0.5">
                        <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-800">Journal d'activité</p>
            </div>
            <div className="divide-y divide-slate-50">
              {history.map(h => (
                <div key={h.id} className="px-5 py-3 flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    h.type_evenement === 'commentaire_demandeur' ? 'bg-blue-100' :
                    h.type_evenement === 'creation'             ? 'bg-emerald-100' :
                    'bg-slate-100'
                  }`}>
                    {h.type_evenement === 'commentaire_demandeur' ? (
                      <MessageSquare className="w-3 h-3 text-blue-600" />
                    ) : (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-700">{h.description}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{fmtDate(h.created_at)} · {h.auteur}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {!isClosed && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowComment(v => !v)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-blue-300 transition-all shadow-sm">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              Ajouter un commentaire
            </button>
          </div>
        )}

        {/* Comment form */}
        {showComment && (
          <div className="bg-white rounded-2xl border border-blue-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-800">Nouveau commentaire</p>
              <button onClick={() => setShowComment(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Votre nom</label>
                <input
                  value={commentAuteur}
                  onChange={e => setCommentAuteur(e.target.value)}
                  placeholder={demande.demandeur_nom ?? 'Votre nom'}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Message</label>
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  rows={3}
                  placeholder="Précisez votre demande, ajoutez une information complémentaire…"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  disabled={!commentText.trim() || sending}
                  onClick={sendComment}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <Send className="w-3.5 h-3.5" />
                  {sending ? 'Envoi…' : 'Envoyer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pb-8">
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <p className="text-xs">En cas d'urgence, contactez directement le service technique.</p>
          </div>
          <p className="text-[10px] text-slate-300 mt-2">CROUS Lyon · OpenGST</p>
        </div>

      </main>
    </div>
  );
}

function InfoRow({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 text-slate-400">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
        <p className={`text-xs font-semibold text-slate-700 truncate ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
    </div>
  );
}
