import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Trash2, FileText, Search, ExternalLink, Link2,
  Paperclip, Calendar, Filter,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { DocumentLiaison } from './registreTypes';

interface Props {
  documents: DocumentLiaison[];
  onChange: (d: DocumentLiaison[]) => void;
}

interface GedDoc {
  id: string;
  nom: string;
  type: string;
  taille: string | null;
  date_ajout: string | null;
}

const DOC_TYPES = [
  'Arrêté d\'ouverture',
  'PV de commission',
  'Rapport de contrôle',
  'Notice de sécurité',
  'Plan d\'évacuation',
  'Consignes de sécurité',
  'Attestation',
  'Autre',
];

export default function SectionDocuments({ documents, onChange }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [manualNom, setManualNom] = useState('');
  const [manualType, setManualType] = useState(DOC_TYPES[0]);
  const [manualUrl, setManualUrl] = useState('');
  const [gedSearch, setGedSearch] = useState('');
  const [gedDocs, setGedDocs] = useState<GedDoc[]>([]);
  const [gedLoading, setGedLoading] = useState(false);
  const [filter, setFilter] = useState('');

  // Load GED documents
  useEffect(() => {
    (async () => {
      setGedLoading(true);
      // Try ged_documents table first
      const { data } = await supabase
        .from('ged_documents')
        .select('id, nom, type, taille, date_ajout')
        .order('nom')
        .limit(50);
      setGedDocs((data ?? []) as GedDoc[]);
      setGedLoading(false);
    })();
  }, []);

  const filteredGed = useMemo(() => {
    let docs = gedDocs;
    if (gedSearch) {
      const s = gedSearch.toLowerCase();
      docs = docs.filter(d => d.nom.toLowerCase().includes(s) || (d.type ?? '').toLowerCase().includes(s));
    }
    if (filter) {
      docs = docs.filter(d => d.type === filter);
    }
    return docs;
  }, [gedDocs, gedSearch, filter]);

  const addManual = () => {
    if (!manualNom) return;
    const doc: DocumentLiaison = {
      id: `doc-${Date.now()}`,
      nom: manualNom,
      type: manualType,
      source: 'manuel',
      ged_ref: null,
      url: manualUrl || null,
      date_ajout: new Date().toISOString(),
    };
    onChange([doc, ...documents]);
    setManualNom(''); setManualType(DOC_TYPES[0]); setManualUrl('');
    setShowAdd(false);
  };

  const addFromGed = (ged: GedDoc) => {
    const doc: DocumentLiaison = {
      id: `doc-${Date.now()}`,
      nom: ged.nom,
      type: ged.type || DOC_TYPES[0],
      source: 'ged',
      ged_ref: ged.id,
      url: null,
      date_ajout: ged.date_ajout ?? new Date().toISOString(),
    };
    // Avoid duplicates
    if (documents.some(d => d.ged_ref === ged.id)) return;
    onChange([doc, ...documents]);
  };

  const remove = (id: string) => onChange(documents.filter(d => d.id !== id));

  const uniqueTypes = [...new Set(gedDocs.map(d => d.type).filter(Boolean))];

  return (
    <div className="space-y-4">
      {/* Linked documents list */}
      <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
        {documents.length === 0 ? (
          <div className="py-8 text-center">
            <Paperclip className="w-5 h-5 text-slate-300 mx-auto mb-1" />
            <p className="text-xs text-slate-400 font-medium">Aucun document lié</p>
            <p className="text-[10px] text-slate-300 mt-0.5">Ajoutez manuellement ou depuis la GED</p>
          </div>
        ) : documents.map(doc => (
          <div key={doc.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              doc.source === 'ged' ? 'bg-blue-50' : 'bg-slate-100'
            }`}>
              {doc.source === 'ged' ? <Link2 className="w-4 h-4 text-blue-500" /> : <FileText className="w-4 h-4 text-slate-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">{doc.nom}</p>
              <p className="text-[10px] text-slate-400">
                {doc.type}
                <span className={`ml-1.5 px-1 py-0.5 rounded text-[9px] font-bold ${
                  doc.source === 'ged' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {doc.source === 'ged' ? 'GED' : 'MANUEL'}
                </span>
              </p>
            </div>
            {doc.url && (
              <a href={doc.url} target="_blank" rel="noreferrer"
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            )}
            <button type="button" onClick={() => remove(doc.id)}
              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        ))}
      </div>

      {/* Add toggle */}
      <button type="button" onClick={() => setShowAdd(s => !s)}
        className="flex items-center gap-1.5 text-xs px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold">
        <Plus className="w-3.5 h-3.5" /> {showAdd ? 'Fermer' : 'Ajouter un document'}
      </button>

      {showAdd && (
        <div className="space-y-4">
          {/* Manual add */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2">
            <p className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Ajout manuel
            </p>
            <div className="grid grid-cols-2 gap-2">
              <input value={manualNom} onChange={e => setManualNom(e.target.value)}
                placeholder="Nom du document *"
                className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40 bg-white" />
              <select value={manualType} onChange={e => setManualType(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40 bg-white">
                {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <input value={manualUrl} onChange={e => setManualUrl(e.target.value)}
              placeholder="URL ou référence (facultatif)"
              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40 bg-white" />
            <button type="button" onClick={addManual} disabled={!manualNom}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-semibold">
              <Plus className="w-3.5 h-3.5" /> Lier ce document
            </button>
          </div>

          {/* GED search */}
          <div className="bg-blue-50/40 rounded-xl border border-blue-100 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-blue-700 flex items-center gap-1">
                <Link2 className="w-3 h-3" /> Depuis la GED
              </p>
              {uniqueTypes.length > 0 && (
                <select value={filter} onChange={e => setFilter(e.target.value)}
                  className="text-[10px] border border-blue-200 rounded-md px-2 py-1 bg-white text-blue-700 focus:outline-none">
                  <option value="">Tous les types</option>
                  {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input value={gedSearch} onChange={e => setGedSearch(e.target.value)}
                placeholder="Rechercher dans la GED…"
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/40 bg-white" />
            </div>

            {gedLoading ? (
              <p className="text-[10px] text-slate-400 text-center py-3">Chargement des documents GED…</p>
            ) : filteredGed.length === 0 ? (
              <p className="text-[10px] text-slate-400 text-center py-3">
                {gedDocs.length === 0 ? 'Aucun document dans la GED' : 'Aucun résultat'}
              </p>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {filteredGed.map(ged => {
                  const alreadyLinked = documents.some(d => d.ged_ref === ged.id);
                  return (
                    <button key={ged.id} type="button" disabled={alreadyLinked}
                      onClick={() => addFromGed(ged)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                        alreadyLinked ? 'bg-slate-50 opacity-50 cursor-not-allowed' : 'hover:bg-white border border-transparent hover:border-blue-200'
                      }`}>
                      <FileText className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">{ged.nom}</p>
                        <p className="text-[9px] text-slate-400">{ged.type} {ged.taille ? `· ${ged.taille}` : ''}</p>
                      </div>
                      {alreadyLinked ? (
                        <span className="text-[9px] font-bold text-emerald-500">Lié</span>
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
