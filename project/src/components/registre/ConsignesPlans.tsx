import { FileText, Upload, Plus, Download, Eye } from 'lucide-react';
import planEvac from '../../assets/Plan-Evac-Exemple.png';
import type { ERP } from './registreTypes';

interface Props { erp: ERP }

// Pre-built consignes template for any ERP
const CONSIGNES_INCENDIE = (erp: ERP) => `En cas d'incendie — ${erp.nom}

1. ALERTER
   • Composer le 18 (pompiers) ou le 112 (urgences européennes)
   • Déclencher l'alarme incendie (boutons rouges près des sorties)
   • Prévenir le responsable sécurité : ${erp.responsable_securite ?? 'Voir affichage'}

2. ÉVACUER
   • Quitter immédiatement les locaux SANS prendre ses affaires
   • Suivre les flèches vertes (éclairage de sécurité)
   • NE PAS utiliser les ascenseurs
   • Fermer les portes derrière soi sans les verrouiller

3. POINT DE RASSEMBLEMENT
   • Se regrouper à l'extérieur, à 50 mètres de l'entrée principale
   • Ne pas retourner dans le bâtiment avant autorisation des secours

CONSIGNES PMR
   • Les personnes à mobilité réduite se dirigent vers la zone de mise en sûreté (RDC)
   • Un référent PMR est désigné pour les accompagner

COORDONNÉES D'URGENCE
${erp.coordonnees_secours ?? 'Pompiers : 18 | SAMU : 15 | Police : 17'}`;

export default function ConsignesPlans({ erp }: Props) {
  return (
    <div className="space-y-5 p-0 pb-8">

      {/* Consignes incendie */}
      <div className="rounded-xl border border-slate-100 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
              <span className="text-sm">🔥</span>
            </div>
            <p className="text-xs font-black text-slate-700">Consignes de sécurité incendie</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
              <Download className="w-3 h-3" /> Exporter PDF
            </button>
            <button className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors font-semibold">
              Modifier
            </button>
          </div>
        </div>
        <div className="p-4">
          <pre className="text-xs text-slate-700 font-mono leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-lg p-4 border border-slate-100">
            {CONSIGNES_INCENDIE(erp)}
          </pre>
        </div>
      </div>

      {/* Plans d'évacuation */}
      <div className="rounded-xl border border-slate-100 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <span className="text-sm">🗺️</span>
            </div>
            <p className="text-xs font-black text-slate-700">Plans d'évacuation</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold">
            <Plus className="w-3.5 h-3.5" /> Ajouter un plan
          </button>
        </div>
        <div className="p-4 grid grid-cols-3 gap-4">
          {/* Sample plan */}
          <div className="rounded-xl border border-slate-200 overflow-hidden group hover:border-blue-300 transition-colors">
            <div className="relative bg-slate-100 h-36 overflow-hidden">
              <img src={planEvac} alt="Plan évacuation RDC" className="w-full h-full object-cover object-top" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button className="p-2 bg-white rounded-lg shadow-md hover:bg-slate-50 transition-colors">
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                </button>
                <button className="p-2 bg-white rounded-lg shadow-md hover:bg-slate-50 transition-colors">
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                </button>
              </div>
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold text-slate-700">Plan évacuation — RDC</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Ajouté le 15/01/2026</p>
            </div>
          </div>

          {/* Upload card */}
          <label className="rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer flex flex-col items-center justify-center h-48 gap-2">
            <Upload className="w-6 h-6 text-slate-300" />
            <p className="text-xs font-medium text-slate-400">Ajouter un plan</p>
            <p className="text-[10px] text-slate-300">PDF, PNG, JPG</p>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" />
          </label>
        </div>
      </div>

      {/* Consignes PMR */}
      <div className="rounded-xl border border-slate-100 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center">
            <span className="text-sm">♿</span>
          </div>
          <p className="text-xs font-black text-slate-700">Consignes spécifiques PMR</p>
        </div>
        <div className="p-4">
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 text-xs text-sky-800 leading-relaxed">
            <p className="font-bold mb-2">Personnes à Mobilité Réduite (PMR)</p>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>En cas d'alarme, les PMR se dirigent vers la <strong>zone de mise en sûreté</strong> au RDC (salle désignée).</li>
              <li>Un <strong>référent PMR désigné</strong> les accompagne et reste avec eux jusqu'à l'arrivée des secours.</li>
              <li>Les ascenseurs ne doivent <strong>pas</strong> être utilisés.</li>
              <li>Les pompiers disposent d'un plan indiquant les zones de mise en sûreté.</li>
              <li>Référent PMR : <strong>{erp.responsable_securite ?? 'Voir affichage en entrée'}</strong></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Documents GED */}
      <div className="rounded-xl border border-slate-100 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <p className="text-xs font-black text-slate-700">Documents joints au registre</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            <Upload className="w-3.5 h-3.5" /> Ajouter un document
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          {[
            { nom: 'Rapport SSI SOCOTEC — Mai 2026', type: 'Sécurité incendie', date: '15/05/2026', taille: '2,4 Mo' },
            { nom: 'PV Contrôle extincteurs — Janv. 2026', type: 'Extincteurs', date: '10/01/2026', taille: '1,1 Mo' },
            { nom: 'Compte-rendu exercice évacuation — Oct. 2025', type: 'Exercice', date: '15/10/2025', taille: '0,8 Mo' },
          ].map((doc, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">{doc.nom}</p>
                <p className="text-[10px] text-slate-400">{doc.type} · {doc.date} · {doc.taille}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
