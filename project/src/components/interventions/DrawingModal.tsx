import { useState, useEffect, useRef } from 'react';
import { X, PenLine, Square, Circle, RotateCcw, Save, Loader2 } from 'lucide-react';

type DrawShape = 'rect' | 'circle';

interface DrawnShape {
  shape: DrawShape;
  x: number; y: number;
  w: number; h: number;
  thickness: number;
}

export interface DrawingModalProps {
  imageSrc: string;
  imageLabel: string;
  onSave: (annotatedDataUrl: string) => void;
  onClose: () => void;
}

export function DrawingModal({ imageSrc, imageLabel, onSave, onClose }: DrawingModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef    = useRef<HTMLImageElement | null>(null);

  const [tool, setTool]           = useState<DrawShape>('rect');
  const [thickness, setThickness] = useState(3);
  const [shapes, setShapes]       = useState<DrawnShape[]>([]);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [preview, setPreview]     = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { imgRef.current = img; setImgLoaded(true); };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#ef4444';

    function paintShape(s: DrawnShape | { shape: DrawShape; x: number; y: number; w: number; h: number; thickness: number }) {
      if (!ctx) return;
      ctx.lineWidth = s.thickness;
      ctx.strokeStyle = '#ef4444';
      if (s.shape === 'rect') {
        ctx.strokeRect(s.x, s.y, s.w, s.h);
      } else {
        const rx = Math.abs(s.w) / 2;
        const ry = Math.abs(s.h) / 2;
        ctx.beginPath();
        ctx.ellipse(s.x + s.w / 2, s.y + s.h / 2, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    for (const s of shapes) paintShape(s);
    if (preview) paintShape({ ...preview, shape: tool, thickness });
  }, [shapes, preview, tool, thickness, imgLoaded]);

  function getPos(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect   = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left)  * (canvas.width  / rect.width),
      y: (e.clientY - rect.top)   * (canvas.height / rect.height),
    };
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) { setDrawStart(getPos(e)); }
  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawStart) return;
    const pos = getPos(e);
    setPreview({ x: drawStart.x, y: drawStart.y, w: pos.x - drawStart.x, h: pos.y - drawStart.y });
  }
  function handleMouseUp(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!drawStart) return;
    const pos = getPos(e);
    const w = pos.x - drawStart.x;
    const h = pos.y - drawStart.y;
    if (Math.abs(w) > 4 || Math.abs(h) > 4) {
      setShapes(prev => [...prev, { shape: tool, x: drawStart.x, y: drawStart.y, w, h, thickness }]);
    }
    setDrawStart(null);
    setPreview(null);
  }

  const naturalW = imgRef.current?.naturalWidth  ?? 1200;
  const naturalH = imgRef.current?.naturalHeight ?? 800;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full max-w-3xl" style={{ maxHeight: '92vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
              <PenLine className="w-3.5 h-3.5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Annoter — {imageLabel}</p>
              <p className="text-xs text-slate-400">Dessinez des formes rouges pour délimiter la zone concernée</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-2.5 border-b border-slate-100 bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
            <button onClick={() => setTool('rect')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${tool === 'rect' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Square className="w-3.5 h-3.5" /> Rectangle
            </button>
            <button onClick={() => setTool('circle')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${tool === 'circle' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Circle className="w-3.5 h-3.5" /> Ellipse
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Épaisseur</span>
            <input type="range" min={1} max={8} value={thickness}
              onChange={e => setThickness(Number(e.target.value))}
              className="w-20 accent-red-500" />
            <span className="text-xs font-semibold text-slate-700 w-3 text-center">{thickness}</span>
            <div className="flex items-center justify-center w-8">
              <div className="rounded-full bg-red-500" style={{ width: thickness * 4, height: thickness * 4, maxWidth: 28, maxHeight: 28 }} />
            </div>
          </div>

          <div className="flex-1" />

          <button onClick={() => setShapes(prev => prev.slice(0, -1))} disabled={shapes.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-30">
            <RotateCcw className="w-3.5 h-3.5" /> Annuler
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden flex items-center justify-center bg-slate-100 min-h-0">
          {!imgLoaded ? (
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          ) : (
            <canvas
              ref={canvasRef}
              width={naturalW}
              height={naturalH}
              style={{ maxWidth: '100%', maxHeight: '100%', cursor: 'crosshair', display: 'block' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 flex-shrink-0">
          <p className="text-xs text-slate-400">
            {shapes.length === 0 ? 'Dessinez sur l\'image pour délimiter la zone concernée'
              : `${shapes.length} forme${shapes.length > 1 ? 's' : ''} ajoutée${shapes.length > 1 ? 's' : ''}`}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Annuler
            </button>
            <button onClick={() => canvasRef.current && onSave(canvasRef.current.toDataURL('image/png'))}
              disabled={shapes.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <Save className="w-3.5 h-3.5" /> Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
