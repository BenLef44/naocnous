import { useState, useRef, useCallback } from 'react';
import { MapPin, Trash2, Plus, Users } from 'lucide-react';
import type { PointRassemblement, EquipementSecurite } from './registreTypes';

interface Props {
  planUrl: string;
  points: PointRassemblement[];
  onPointsChange: (points: PointRassemblement[]) => void;
  equipements?: EquipementSecurite[];
  showEquipementLayers?: boolean;
  selectedEquipementId?: string | null;
  onSelectEquipement?: (id: string | null) => void;
  height?: string;
}

export default function PlanViewer({
  planUrl,
  points,
  onPointsChange,
  equipements = [],
  showEquipementLayers = false,
  selectedEquipementId = null,
  onSelectEquipement,
  height = 'h-72',
}: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [addingPoint, setAddingPoint] = useState(false);
  const [layers, setLayers] = useState<Set<string>>(new Set([
    'extincteur', 'baes', 'ssi', 'ria', 'issue', 'declencheur', 'desenfumage', 'dae', 'coupure_energie',
  ]));

  const getRelativePos = useCallback((e: React.MouseEvent | MouseEvent): { x: number; y: number } | null => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  }, []);

  const handleContainerClick = (e: React.MouseEvent) => {
    if (!addingPoint) return;
    const pos = getRelativePos(e);
    if (!pos) return;
    const newPoint: PointRassemblement = {
      id: `pt-${Date.now()}`,
      nom: `Point ${points.length + 1}`,
      description: '',
      capacite: null,
      commentaire: '',
      x: pos.x,
      y: pos.y,
    };
    onPointsChange([...points, newPoint]);
    setAddingPoint(false);
  };

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDraggingId(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId) return;
    const pos = getRelativePos(e);
    if (!pos) return;
    onPointsChange(points.map(p => p.id === draggingId ? { ...p, x: pos.x, y: pos.y } : p));
  };

  const handleMouseUp = () => setDraggingId(null);

  const updatePoint = (id: string, field: keyof PointRassemblement, value: string | number | null) => {
    onPointsChange(points.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePoint = (id: string) => {
    onPointsChange(points.filter(p => p.id !== id));
  };

  const equipementIcon: Record<string, string> = {
    extincteur: '🧯', baes: '💡', ssi: '🔴', ria: '🚒', issue: '🚪',
    declencheur: '⏸', desenfumage: '💨', dae: '❤', coupure_energie: '⚡',
  };

  const equipementColor: Record<string, string> = {
    extincteur: 'bg-red-500', baes: 'bg-yellow-500', ssi: 'bg-red-600',
    ria: 'bg-orange-500', issue: 'bg-green-500', declencheur: 'bg-blue-500',
    desenfumage: 'bg-cyan-500', dae: 'bg-pink-500', coupure_energie: 'bg-amber-600',
  };

  const layerLabels: Record<string, string> = {
    extincteur: 'Extincteurs', baes: 'BAES', ssi: 'SSI', ria: 'RIA',
    issue: 'Issues de secours', declencheur: 'Déclencheurs manuels',
    desenfumage: 'Désenfumage', dae: 'DAE', coupure_energie: 'Coupures énergie',
  };

  const filteredEquipements = equipements.filter(eq => {
    if (!eq.x || !eq.y) return false;
    const cat = eq.categorie.toLowerCase();
    if (cat.includes('extinct')) return layers.has('extincteur');
    if (cat.includes('baes') || cat.includes('eclair')) return layers.has('baes');
    if (cat.includes('ssi')) return layers.has('ssi');
    if (cat.includes('ria')) return layers.has('ria');
    if (cat.includes('issue') || cat.includes('porte')) return layers.has('issue');
    if (cat.includes('declencheur')) return layers.has('declencheur');
    if (cat.includes('desenfum')) return layers.has('desenfumage');
    if (cat.includes('dae') || cat.includes('defibrill')) return layers.has('dae');
    if (cat.includes('coupure') || cat.includes('energie')) return layers.has('coupure_energie');
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAddingPoint(a => !a)}
            className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
              addingPoint ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'border border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
            }`}
          >
            <Plus className="w-3 h-3" /> {addingPoint ? 'Cliquer sur le plan…' : 'Ajouter point'}
          </button>
          {points.length > 0 && (
            <span className="text-[10px] text-slate-400">{points.length} point{points.length > 1 ? 's' : ''}</span>
          )}
        </div>
        {showEquipementLayers && equipements.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {Object.entries(layerLabels).map(([key, label]) => {
              const visible = layers.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setLayers(prev => {
                    const n = new Set(prev);
                    n.has(key) ? n.delete(key) : n.add(key);
                    return n;
                  })}
                  className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-md font-medium transition-colors ${
                    visible ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <span className={visible ? '' : 'opacity-40'}>{equipementIcon[key]}</span>
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Plan canvas */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full ${height} rounded-xl border-2 ${addingPoint ? 'border-emerald-400 border-dashed cursor-crosshair' : 'border-slate-200'} bg-slate-50 overflow-hidden select-none`}
      >
        {planUrl ? (
          <img
            ref={imgRef}
            src={planUrl}
            alt="Plan interactif"
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-300 text-xs">
            Aucun plan — ajoutez une URL dans le champ ci-dessus
          </div>
        )}

        {/* Equipment markers */}
        {filteredEquipements.map(eq => (
          <div
            key={eq.id}
            onClick={e => { e.stopPropagation(); onSelectEquipement?.(eq.id); }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform cursor-pointer ${
              selectedEquipementId === eq.id ? 'scale-125 z-30' : 'z-20 hover:scale-110'
            }`}
            style={{ left: `${eq.x}%`, top: `${eq.y}%` }}
          >
            <div className={`w-5 h-5 rounded-full ${equipementColor[Object.keys(equipementColor).find(k => eq.categorie.toLowerCase().includes(k)) ?? 'bg-slate-500']} border-2 border-white shadow-md flex items-center justify-center text-[8px]`}>
              {equipementIcon[Object.keys(equipementIcon).find(k => eq.categorie.toLowerCase().includes(k)) ?? '']}
            </div>
            {selectedEquipementId === eq.id && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 px-2 py-1 whitespace-nowrap z-40">
                <p className="text-[10px] font-bold text-slate-700">{eq.designation}</p>
                <p className="text-[9px] text-slate-400">{eq.localisation}</p>
              </div>
            )}
          </div>
        ))}

        {/* Gathering points */}
        {points.map(pt => (
          <div
            key={pt.id}
            onMouseDown={e => handleMouseDown(e, pt.id)}
            onClick={e => e.stopPropagation()}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-move group"
            style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
          >
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center transition-transform group-hover:scale-110">
                <Users className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="mt-0.5 bg-white/90 backdrop-blur-sm rounded px-1.5 py-0.5 shadow-sm border border-emerald-100">
                <p className="text-[9px] font-bold text-emerald-700 whitespace-nowrap">{pt.nom}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Point details list */}
      {points.length > 0 && (
        <div className="space-y-2">
          {points.map(pt => (
            <div key={pt.id} className="rounded-lg border border-slate-200 bg-white p-3 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-600" />
              </div>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  value={pt.nom}
                  onChange={e => updatePoint(pt.id, 'nom', e.target.value)}
                  placeholder="Nom du point"
                  className="text-xs font-semibold text-slate-700 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                />
                <input
                  type="number"
                  value={pt.capacite ?? ''}
                  onChange={e => updatePoint(pt.id, 'capacite', e.target.value ? parseInt(e.target.value) : null)}
                  placeholder="Capacité max"
                  className="text-xs text-slate-600 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                />
                <input
                  value={pt.description}
                  onChange={e => updatePoint(pt.id, 'description', e.target.value)}
                  placeholder="Description"
                  className="col-span-2 text-xs text-slate-600 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                />
                <input
                  value={pt.commentaire}
                  onChange={e => updatePoint(pt.id, 'commentaire', e.target.value)}
                  placeholder="Commentaire"
                  className="col-span-2 text-xs text-slate-600 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>
              <button
                type="button"
                onClick={() => removePoint(pt.id)}
                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
