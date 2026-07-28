import { useState } from 'react';
import { Search, Check, Users } from 'lucide-react';
import logoApave          from '../../assets/logo-Apave.jpg';
import logoSocotec        from '../../assets/logo-SOCOTEC.png';
import logoDekra          from '../../assets/logo-Dekra.jpg';
import logoBureauVeritas  from '../../assets/logo-Bureau-Veritas.jpg';
import logoQualiconsult   from '../../assets/logo-Qualiconsult.jpg';
import logoSGS            from '../../assets/logo-SGS.jpg';
import logoAlpesControles from '../../assets/logo-Alpes-Controles.jpg';
import logoThermocom      from '../../assets/logo-Thermocom.svg';
import logoSabeko         from '../../assets/sabeko-logo.png';
import logoMsi            from '../../assets/logo-msi-blanc.png';
import logoSauvignet      from '../../assets/electricien-lyon-sauvignet.jpg';

// ── Org config ────────────────────────────────────────────────────────────────

const ORG_CONFIG: Record<string, { logo?: string; bg: string; text: string; abbr: string; specialite: string }> = {
  // ── Maintenance curative ──────────────────────────────────────────────────
  'Atmeo':                     { logo: undefined,          bg: '#e65c00', text: '#fff', abbr: 'AT',  specialite: 'Plomberie · Chauffage' },
  'Thermocom':                 { logo: logoThermocom,      bg: '#ff2941', text: '#fff', abbr: 'TC',  specialite: 'Plomberie · Chauffage' },
  'Sabeko':                    { logo: logoSabeko,         bg: '#1e3a5f', text: '#fff', abbr: 'SBK', specialite: 'Plomberie · Chauffage' },
  'MSI':                       { logo: logoMsi,            bg: '#111827', text: '#fff', abbr: 'MSI', specialite: 'Électricité' },
  'Sauvignet':                 { logo: logoSauvignet,      bg: '#1d4ed8', text: '#fff', abbr: 'SVG', specialite: 'Électricité' },
  // ── Contrôle réglementaire ────────────────────────────────────────────────
  'APAVE':                     { logo: logoApave,          bg: '#4a9520', text: '#fff', abbr: 'AP',  specialite: 'Contrôle technique' },
  'SOCOTEC':                   { logo: logoSocotec,        bg: '#0099d8', text: '#fff', abbr: 'SO',  specialite: 'Inspection / Certification' },
  'DEKRA':                     { logo: logoDekra,          bg: '#1a6b30', text: '#fff', abbr: 'DE',  specialite: 'Contrôle & Essais' },
  'Bureau Veritas':             { logo: logoBureauVeritas,  bg: '#8b7355', text: '#fff', abbr: 'BV',  specialite: 'Certification / Essais' },
  'QUALICONSULT':               { logo: logoQualiconsult,   bg: '#3c3c3c', text: '#fff', abbr: 'QU',  specialite: 'Contrôle construction' },
  'SGS':                       { logo: logoSGS,            bg: '#888580', text: '#fff', abbr: 'SG',  specialite: 'Inspection & Tests' },
  'Alpes Contrôles':            { logo: logoAlpesControles, bg: '#cc0000', text: '#fff', abbr: 'AC',  specialite: 'Contrôle technique' },
  'SOCOTEC Diagnostic':         { logo: logoSocotec,        bg: '#0099d8', text: '#fff', abbr: 'SD',  specialite: 'Diagnostic immobilier' },
  'Bureau Alliance Contrôle':   { logo: undefined,          bg: '#2563eb', text: '#fff', abbr: 'BAC', specialite: 'Contrôle réglementaire' },
  'Acritec':                    { logo: undefined,          bg: '#6b21a8', text: '#fff', abbr: 'ACR', specialite: 'Contrôle technique' },
};

// ── Agent photos (Pexels) ─────────────────────────────────────────────────────

const AGENT_CONFIG: Record<string, { photo: string; service: string }> = {
  'Martin D.':  { photo: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1',  service: 'Patrimoine' },
  'Leroy P.':   { photo: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1',  service: 'Technique' },
  'Dupont A.':  { photo: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1',   service: 'Sécurité' },
  'Bernard C.': { photo: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1',  service: 'Technique' },
  'Moreau F.':  { photo: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1',  service: 'Patrimoine' },
  'Simon B.':   { photo: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1',    service: 'Administration' },
  'Laurent E.': { photo: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1', service: 'Technique' },
  'Michel G.':  { photo: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1',   service: 'Sécurité' },
};

// ── Dot colours per assignee (used as calendar colour indicator) ──────────────

const AGENT_DOTS = ['#3b82f6','#ec4899','#991b1b','#eab308','#0ea5e9','#10b981','#f97316','#8b5cf6'];
const ORG_DOTS   = ['#e65c00','#ff2941','#1e3a5f','#111827','#1d4ed8','#4a9520','#0099d8','#1a6b30','#8b7355','#3c3c3c','#888580','#cc0000','#0099d8','#2563eb','#6b21a8'];
const EQUIPE_DOTS = ['#0369a1','#0891b2','#15803d','#166534','#7c2d12','#92400e'];

// ── Equipes ──────────────────────────────────────────────────────────────────

export interface EquipeDef {
  key: string;
  label: string;
  specialite: string;
  zone: string;
  color: string;
  membres: string[];
}

export const EQUIPES: EquipeDef[] = [
  {
    key: 'elec-nord',
    label: 'Élec - Nord',
    specialite: 'Électricité',
    zone: 'Zone Nord',
    color: '#0369a1',
    membres: ['Martin D.', 'Simon B.'],
  },
  {
    key: 'elec-sud',
    label: 'Élec - Sud',
    specialite: 'Électricité',
    zone: 'Zone Sud',
    color: '#0891b2',
    membres: ['Leroy P.', 'Laurent E.'],
  },
  {
    key: 'plomb-nord',
    label: 'Plomberie - Nord',
    specialite: 'Plomberie / CVC',
    zone: 'Zone Nord',
    color: '#15803d',
    membres: ['Dupont A.', 'Bernard C.'],
  },
  {
    key: 'plomb-sud',
    label: 'Plomberie - Sud',
    specialite: 'Plomberie / CVC',
    zone: 'Zone Sud',
    color: '#166534',
    membres: ['Moreau F.', 'Michel G.'],
  },
];

export const EQUIPE_KEYS = EQUIPES.map(e => e.key);

// ── Types ─────────────────────────────────────────────────────────────────────

export const PRESTATAIRES = Object.keys(ORG_CONFIG);
export const AGENTS       = Object.keys(AGENT_CONFIG);

export interface AssigneeSelection {
  prestataires: Set<string>;
  agents: Set<string>;
  equipes: Set<string>;
}

export const EMPTY_ASSIGNEE_SELECTION: AssigneeSelection = {
  prestataires: new Set(),
  agents: new Set(),
  equipes: new Set(),
};

interface Props {
  selection: AssigneeSelection;
  onChange: (sel: AssigneeSelection) => void;
}

type Tab = 'prestataires' | 'agents' | 'equipes';

// ── Sub-components ────────────────────────────────────────────────────────────

function OrgLogo({ name, size = 36 }: { name: string; size?: number }) {
  const cfg = ORG_CONFIG[name];
  const [err, setErr] = useState(false);
  if (!cfg) return null;
  if (cfg.logo && !err) {
    return (
      <img src={cfg.logo} alt={name}
        className="rounded-lg object-contain flex-shrink-0 bg-white border border-slate-200"
        style={{ width: size, height: size, padding: 2 }}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center rounded-lg font-black flex-shrink-0 tracking-tight"
      style={{ width: size, height: size, background: cfg.bg, color: cfg.text, fontSize: Math.max(8, size * 0.28) }}
    >
      {cfg.abbr}
    </span>
  );
}

function AgentAvatar({ name, size = 36 }: { name: string; size?: number }) {
  const cfg = AGENT_CONFIG[name];
  const [err, setErr] = useState(false);
  if (cfg && !err) {
    return (
      <img
        src={cfg.photo}
        alt={name}
        className="rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm"
        style={{ width: size, height: size }}
        onError={() => setErr(true)}
      />
    );
  }
  const initials = name.split(/[\s.]+/).filter(Boolean).slice(0,2).map(w => w[0]).join('').toUpperCase();
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-slate-300 text-slate-700 font-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AssigneeFilterPanel({ selection, onChange }: Props) {
  const [tab, setTab]     = useState<Tab>('agents');
  const [search, setSearch] = useState('');

  const togglePrestataire = (name: string) => {
    const next = new Set(selection.prestataires);
    next.has(name) ? next.delete(name) : next.add(name);
    onChange({ ...selection, prestataires: next });
  };

  const toggleAgent = (name: string) => {
    const next = new Set(selection.agents);
    next.has(name) ? next.delete(name) : next.add(name);
    onChange({ ...selection, agents: next });
  };

  const toggleEquipe = (key: string) => {
    const next = new Set(selection.equipes);
    next.has(key) ? next.delete(key) : next.add(key);
    onChange({ ...selection, equipes: next });
  };

  const selectAllPrestataires = () => onChange({ ...selection, prestataires: new Set(PRESTATAIRES) });
  const clearPrestataires     = () => onChange({ ...selection, prestataires: new Set() });
  const selectAllAgents       = () => onChange({ ...selection, agents: new Set(AGENTS) });
  const clearAgents           = () => onChange({ ...selection, agents: new Set() });
  const selectAllEquipes      = () => onChange({ ...selection, equipes: new Set(EQUIPE_KEYS) });
  const clearEquipes          = () => onChange({ ...selection, equipes: new Set() });

  const filteredPrestataires = PRESTATAIRES.filter(p => p.toLowerCase().includes(search.toLowerCase()));
  const filteredAgents       = AGENTS.filter(a => a.toLowerCase().includes(search.toLowerCase()));
  const filteredEquipes      = EQUIPES.filter(e => e.label.toLowerCase().includes(search.toLowerCase()) || e.specialite.toLowerCase().includes(search.toLowerCase()));

  const selCountPrest  = selection.prestataires.size;
  const selCountAgent  = selection.agents.size;
  const selCountEquipe = selection.equipes.size;

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-100 w-64 flex-shrink-0">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Filtrer par</p>
        <p className="text-sm font-bold text-slate-800">Assigné à</p>
      </div>

      {/* Tabs */}
      <div className="px-3 flex-shrink-0">
        <div className="flex bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => { setTab('prestataires'); setSearch(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all
              ${tab === 'prestataires' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Presta.
            {selCountPrest > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                {selCountPrest}
              </span>
            )}
          </button>
          <button
            onClick={() => { setTab('agents'); setSearch(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all
              ${tab === 'agents' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Agents
            {selCountAgent > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                {selCountAgent}
              </span>
            )}
          </button>
          <button
            onClick={() => { setTab('equipes'); setSearch(''); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all
              ${tab === 'equipes' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Équipes
            {selCountEquipe > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                {selCountEquipe}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 mt-2.5 flex-shrink-0">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="flex-1 text-xs bg-transparent outline-none text-slate-700 placeholder:text-slate-400 min-w-0"
          />
        </div>
      </div>

      {/* Select all / Clear row */}
      <div className="px-3 mt-2 flex items-center justify-between flex-shrink-0">
        {tab === 'prestataires' ? (
          <>
            <button onClick={selectAllPrestataires} className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
              Tout cocher
            </button>
            {selCountPrest > 0 && (
              <button onClick={clearPrestataires} className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors">
                Effacer ({selCountPrest})
              </button>
            )}
          </>
        ) : tab === 'agents' ? (
          <>
            <button onClick={selectAllAgents} className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
              Tout cocher
            </button>
            {selCountAgent > 0 && (
              <button onClick={clearAgents} className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors">
                Effacer ({selCountAgent})
              </button>
            )}
          </>
        ) : (
          <>
            <button onClick={selectAllEquipes} className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
              Tout cocher
            </button>
            {selCountEquipe > 0 && (
              <button onClick={clearEquipes} className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors">
                Effacer ({selCountEquipe})
              </button>
            )}
          </>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto mt-2 pb-4 px-2">
        {tab === 'prestataires' && (() => {
          const MAINTENANCE_CURATIVE = ['Atmeo', 'Thermocom', 'Sabeko', 'MSI', 'Sauvignet'];
          const CONTROLE_REGL        = PRESTATAIRES.filter(p => !MAINTENANCE_CURATIVE.includes(p));
          const showMaintenance      = filteredPrestataires.some(p => MAINTENANCE_CURATIVE.includes(p));
          const showControle         = filteredPrestataires.some(p => CONTROLE_REGL.includes(p));

          function PrestatRow({ name, idx }: { name: string; idx: number }) {
            const checked = selection.prestataires.has(name);
            const dot = ORG_DOTS[idx % ORG_DOTS.length];
            return (
              <button
                key={name}
                type="button"
                onClick={() => togglePrestataire(name)}
                className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-xl text-left transition-all group
                  ${checked ? 'bg-slate-50 hover:bg-slate-100' : 'hover:bg-slate-50'}`}
              >
                <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
                  ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white group-hover:border-slate-400'}`}>
                  {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </span>
                <OrgLogo name={name} size={42} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-800 truncate">{name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{ORG_CONFIG[name]?.specialite}</div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: dot }} />
              </button>
            );
          }

          return (
            <div className="space-y-0.5">
              {showMaintenance && (
                <>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2 pt-1 pb-0.5">Maintenance curative</p>
                  {filteredPrestataires
                    .filter(p => MAINTENANCE_CURATIVE.includes(p))
                    .map((name, i) => <PrestatRow key={name} name={name} idx={PRESTATAIRES.indexOf(name)} />)
                  }
                </>
              )}
              {showMaintenance && showControle && (
                <div className="border-t border-slate-100 my-1.5" />
              )}
              {showControle && (
                <>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2 pt-1 pb-0.5">Contrôle réglementaire</p>
                  {filteredPrestataires
                    .filter(p => CONTROLE_REGL.includes(p))
                    .map((name) => <PrestatRow key={name} name={name} idx={PRESTATAIRES.indexOf(name)} />)
                  }
                </>
              )}
            </div>
          );
        })()}

        {tab === 'agents' && filteredAgents.map((name, idx) => {
          const checked = selection.agents.has(name);
          const dot = AGENT_DOTS[idx % AGENT_DOTS.length];
          return (
            <button
              key={name}
              type="button"
              onClick={() => toggleAgent(name)}
              className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-xl text-left transition-all group
                ${checked ? 'bg-slate-50 hover:bg-slate-100' : 'hover:bg-slate-50'}`}
            >
              {/* Checkbox */}
              <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
                ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white group-hover:border-slate-400'}`}>
                {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
              </span>

              {/* Avatar */}
              <AgentAvatar name={name} size={42} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-800 truncate">{name}</div>
                <div className="text-[10px] text-slate-400 truncate">{AGENT_CONFIG[name]?.service}</div>
              </div>

              {/* Calendar dot */}
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: dot }} />
            </button>
          );
        })}

        {tab === 'prestataires' && filteredPrestataires.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-400">Aucun résultat</div>
        )}
        {tab === 'agents' && filteredAgents.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-400">Aucun résultat</div>
        )}

        {tab === 'equipes' && filteredEquipes.map((equipe, idx) => {
          const checked = selection.equipes.has(equipe.key);
          const dot = EQUIPE_DOTS[idx % EQUIPE_DOTS.length];
          return (
            <button
              key={equipe.key}
              type="button"
              onClick={() => toggleEquipe(equipe.key)}
              className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-xl text-left transition-all group
                ${checked ? 'bg-slate-50 hover:bg-slate-100' : 'hover:bg-slate-50'}`}
            >
              <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
                ${checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white group-hover:border-slate-400'}`}>
                {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
              </span>
              <span
                className="w-[42px] h-[42px] rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: equipe.color }}
              >
                <Users className="w-5 h-5 text-white" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-800 truncate">{equipe.label}</div>
                <div className="text-[10px] text-slate-400 truncate">{equipe.specialite} · {equipe.zone}</div>
                <div className="text-[10px] text-slate-300 truncate">{equipe.membres.join(', ')}</div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: dot }} />
            </button>
          );
        })}

        {tab === 'equipes' && filteredEquipes.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-400">Aucun résultat</div>
        )}
      </div>

      {/* Footer total */}
      {(selCountPrest + selCountAgent + selCountEquipe) > 0 && (
        <div className="px-4 py-3 border-t border-slate-100 flex-shrink-0 bg-slate-50/60">
          <p className="text-[11px] text-slate-500 text-center">
            <span className="font-semibold text-slate-700">{selCountPrest + selCountAgent + selCountEquipe}</span> sélectionné(s)
          </p>
        </div>
      )}
    </div>
  );
}
