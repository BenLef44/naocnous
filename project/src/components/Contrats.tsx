import { useState } from 'react';
import { ClipboardList, Plus, LayoutDashboard, TableProperties } from 'lucide-react';
import ContratsTableau, {
  ContratWithLocalisation,
  Residence,
  buildMockContrats,
} from './ContratsTableau';
import NouveauContratModal from './NouveauContratModal';
import ContratsDashboard from './ContratsDashboard';

// ─── Référentiel résidences (IDs vrais Supabase) ─────────────────────────────

export const ALL_RESIDENCES: Residence[] = [
  // Campus La Doua / Villeurbanne  (site a1000001-…-001)
  { id: 'b1000001-0000-0000-0000-000000000001', nom: 'Résidence Jussieu',          campus: 'Campus La Doua / Villeurbanne' },
  { id: 'b1000001-0000-0000-0000-000000000004', nom: 'Résidence Einstein',          campus: 'Campus La Doua / Villeurbanne' },
  { id: 'b1000001-0000-0000-0000-000000000006', nom: 'Résidence Archimède',         campus: 'Campus La Doua / Villeurbanne' },
  { id: 'b1000001-0000-0000-0000-000000000007', nom: 'Résidence Althéa',            campus: 'Campus La Doua / Villeurbanne' },
  // Campus de la Manufacture des Tabacs  (site a1000001-…-004)
  { id: 'b1000001-0000-0000-0000-000000000013', nom: 'Résidence La Madeleine',      campus: 'Campus Manufacture des Tabacs' },
  { id: 'b1000001-0000-0000-0000-000000000015', nom: 'Résidence Garibaldi',         campus: 'Campus Manufacture des Tabacs' },
  { id: 'b1000001-0000-0000-0000-000000000016', nom: 'Résidence Benjamin Delessert',campus: 'Campus Manufacture des Tabacs' },
  { id: 'b1000001-0000-0000-0000-000000000017', nom: 'Résidence André Lirondelle',  campus: 'Campus Manufacture des Tabacs' },
  // Campus Lyon 5 — Saint-Just  (site a1000001-…-007)
  { id: 'b1000001-0000-0000-0000-000000000020', nom: 'Résidence André Allix',       campus: 'Campus Lyon 5 — Saint-Just'   },
  { id: 'b1000001-0000-0000-0000-000000000021', nom: 'Résidence Philomène Magnin',  campus: 'Campus Lyon 5 — Saint-Just'   },
  { id: 'b1000001-0000-0000-0000-000000000022', nom: "Résidence Arches d'Agrippa",  campus: 'Campus Lyon 5 — Saint-Just'   },
  { id: 'b1000001-0000-0000-0000-000000000023', nom: 'Résidence Jean Meygret',      campus: 'Campus Lyon 5 — Saint-Just'   },
];

const CAMPUS_LIST = [...new Set(ALL_RESIDENCES.map(r => r.campus))];

// ─── Mapping type de contrat → catégories d'équipements Supabase ─────────────
// Chaque contrat mock est associé à des catégories précises cohérentes avec
// son objet : seuls les équipements de ces catégories sont comptabilisés.

export const CONTRAT_CATEGORIES: Record<string, string[]> = {
  // Maintenance ascenseurs (base[0])
  'g-c-001': ['Ascenseurs'],
  // Exploitation chaufferie gaz (base[1])
  'g-c-002': ['Chauffage', 'Gaz'],
  // Nettoyage parties communes (base[2])  — pas d'équipements techniques
  'g-c-003': [],
  // Gardiennage (base[3])  — pas d'équipements techniques
  'g-c-004': [],
  // Fourniture gaz (base[4])
  'g-c-005': ['Gaz', 'Chauffage'],
  // Désinsectisation (base[5])  — pas d'équipements
  'g-c-006': [],
  // Contrôle réglementaire électrique (base[6])
  'g-c-007': ['Électricité'],
  // Assurance multirisques (base[7])  — couvre tout le patrimoine
  'g-c-008': ['Ascenseurs', 'Chauffage', 'Électricité', 'Gaz', 'Sécurité incendie', 'Ventilation', 'Eau sanitaire'],
};

// ─── Mock data global avec localisations (vrais IDs) ─────────────────────────

function buildMockContratsGlobal(): ContratWithLocalisation[] {
  const base = buildMockContrats('site');
  const ladoua   = ALL_RESIDENCES.filter(r => r.campus === 'Campus La Doua / Villeurbanne').map(r => r.id);
  const manu     = ALL_RESIDENCES.filter(r => r.campus === 'Campus Manufacture des Tabacs').map(r => r.id);
  const saintjust= ALL_RESIDENCES.filter(r => r.campus === 'Campus Lyon 5 — Saint-Just').map(r => r.id);
  return [
    { ...base[0], id: 'g-c-001', residences: [ladoua[0], ladoua[1], manu[0]] },
    { ...base[1], id: 'g-c-002', residences: [ladoua[0], ladoua[1], ladoua[2], ladoua[3]] },
    { ...base[2], id: 'g-c-003', residences: [manu[0], manu[1]] },
    { ...base[3], id: 'g-c-004', residences: [...ladoua, ...manu] },
    { ...base[4], id: 'g-c-005', residences: [...saintjust] },
    { ...base[5], id: 'g-c-006', residences: [ladoua[3], manu[2]] },
    { ...base[6], id: 'g-c-007', residences: [saintjust[0], saintjust[1]] },
    { ...base[7], id: 'g-c-008', residences: ALL_RESIDENCES.map(r => r.id) },
  ];
}

const MOCK_CONTRATS = buildMockContratsGlobal();

// ─── Vue principale (entrée de menu "Contrats") ───────────────────────────────

export default function Contrats() {
  const [showModal, setShowModal] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'tableau'>('dashboard');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* En-tête de page */}
      <div className="px-5 py-3 bg-white border-b border-slate-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600" />
          <h1 className="text-base font-semibold text-slate-800">Gestion des contrats</h1>
          <span className="text-xs text-slate-400 font-normal">
            ({MOCK_CONTRATS.length} contrat{MOCK_CONTRATS.length > 1 ? 's' : ''})
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Onglets */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeView === 'dashboard'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Tableau de bord
            </button>
            <button
              onClick={() => setActiveView('tableau')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeView === 'tableau'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              Tableau
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouveau contrat
          </button>
        </div>
      </div>

      {/* Contenu */}
      {activeView === 'dashboard' ? (
        <ContratsDashboard contrats={MOCK_CONTRATS} />
      ) : (
        <ContratsTableau
          contrats={MOCK_CONTRATS}
          allResidences={ALL_RESIDENCES}
          contratCategories={CONTRAT_CATEGORIES}
          showLocalisation={true}
        />
      )}

      {showModal && <NouveauContratModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
