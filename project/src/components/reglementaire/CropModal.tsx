import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Check, RotateCcw } from 'lucide-react';

interface CropModalProps {
  imageDataUrl: string;
  onConfirm: (croppedDataUrl: string) => void;
  onClose: () => void;
}

interface Rect { x: number; y: number; w: number; h: number; }

const MIN_SIZE = 20;

export default function CropModal({ imageDataUrl, onConfirm, onClose }: CropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  // crop rect in canvas-pixel coordinates
  const [crop, setCrop] = useState<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const dragging = useRef<{ type: 'move' | 'new' | 'resize'; startX: number; startY: number; startCrop: Rect } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });

  // ── Load image and set canvas size ────────────────────────────────────────
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      // Fit to container: max 780x500
      const maxW = 780;
      const maxH = 500;
      const ratio = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1);
      const w = Math.round(img.naturalWidth * ratio);
      const h = Math.round(img.naturalHeight * ratio);
      setCanvasSize({ w, h });
      // default crop = full image
      setCrop({ x: 0, y: 0, w, h });
      setImgLoaded(true);
    };
    img.src = imageDataUrl;
  }, [imageDataUrl]);

  // ── Draw ──────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Darken outside crop
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop area
    ctx.clearRect(crop.x, crop.y, crop.w, crop.h);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    // Re-draw the inside brighter
    ctx.clearRect(crop.x, crop.y, crop.w, crop.h);
    ctx.drawImage(
      img,
      (crop.x / canvas.width) * img.naturalWidth,
      (crop.y / canvas.height) * img.naturalHeight,
      (crop.w / canvas.width) * img.naturalWidth,
      (crop.h / canvas.height) * img.naturalHeight,
      crop.x, crop.y, crop.w, crop.h
    );

    // Border
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(crop.x + 1, crop.y + 1, crop.w - 2, crop.h - 2);
    ctx.setLineDash([]);

    // Corner handles
    const hs = 8;
    ctx.fillStyle = '#10b981';
    [[crop.x, crop.y], [crop.x + crop.w - hs, crop.y],
     [crop.x, crop.y + crop.h - hs], [crop.x + crop.w - hs, crop.y + crop.h - hs]]
      .forEach(([hx, hy]) => ctx.fillRect(hx, hy, hs, hs));
  }, [crop, imgLoaded]);

  useEffect(() => { draw(); }, [draw]);

  // ── Mouse helpers ──────────────────────────────────────────────────────────
  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const inHandle = (px: number, py: number) => {
    const hs = 10;
    return (
      (px >= crop.x && px <= crop.x + hs && py >= crop.y && py <= crop.y + hs) ||
      (px >= crop.x + crop.w - hs && px <= crop.x + crop.w && py >= crop.y && py <= crop.y + hs) ||
      (px >= crop.x && px <= crop.x + hs && py >= crop.y + crop.h - hs && py <= crop.y + crop.h) ||
      (px >= crop.x + crop.w - hs && px <= crop.x + crop.w && py >= crop.y + crop.h - hs && py <= crop.y + crop.h)
    );
  };

  const inCrop = (px: number, py: number) =>
    px >= crop.x && px <= crop.x + crop.w && py >= crop.y && py <= crop.y + crop.h;

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getPos(e);
    if (inHandle(x, y)) {
      dragging.current = { type: 'resize', startX: x, startY: y, startCrop: { ...crop } };
    } else if (inCrop(x, y)) {
      dragging.current = { type: 'move', startX: x, startY: y, startCrop: { ...crop } };
    } else {
      dragging.current = { type: 'new', startX: x, startY: y, startCrop: { x, y, w: 0, h: 0 } };
      setCrop({ x, y, w: 0, h: 0 });
    }
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragging.current || !canvasRef.current) return;
    const { x, y } = getPos(e);
    const d = dragging.current;
    const cw = canvasRef.current.width;
    const ch = canvasRef.current.height;

    if (d.type === 'new') {
      const nx = Math.max(0, Math.min(d.startX, x));
      const ny = Math.max(0, Math.min(d.startY, y));
      const nw = Math.min(Math.abs(x - d.startX), cw - nx);
      const nh = Math.min(Math.abs(y - d.startY), ch - ny);
      setCrop({ x: nx, y: ny, w: nw, h: nh });
    } else if (d.type === 'move') {
      const dx = x - d.startX;
      const dy = y - d.startY;
      const nx = Math.max(0, Math.min(cw - d.startCrop.w, d.startCrop.x + dx));
      const ny = Math.max(0, Math.min(ch - d.startCrop.h, d.startCrop.y + dy));
      setCrop({ ...d.startCrop, x: nx, y: ny });
    } else {
      // resize from nearest corner
      const sc = d.startCrop;
      const cx = x < sc.x + sc.w / 2 ? x : sc.x;
      const cy = y < sc.y + sc.h / 2 ? y : sc.y;
      const nw = Math.max(MIN_SIZE, Math.abs(x - (x < sc.x + sc.w / 2 ? sc.x + sc.w : sc.x)));
      const nh = Math.max(MIN_SIZE, Math.abs(y - (y < sc.y + sc.h / 2 ? sc.y + sc.h : sc.y)));
      setCrop({
        x: Math.max(0, Math.min(cx, cw - nw)),
        y: Math.max(0, Math.min(cy, ch - nh)),
        w: Math.min(nw, cw),
        h: Math.min(nh, ch),
      });
    }
  };

  const onMouseUp = () => { dragging.current = null; };

  // ── Confirm: export cropped region at native resolution ───────────────────
  const handleConfirm = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || crop.w < MIN_SIZE || crop.h < MIN_SIZE) return;

    const scaleX = img.naturalWidth / canvas.width;
    const scaleY = img.naturalHeight / canvas.height;

    const out = document.createElement('canvas');
    out.width = Math.round(crop.w * scaleX);
    out.height = Math.round(crop.h * scaleY);
    const ctx = out.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(
      img,
      crop.x * scaleX, crop.y * scaleY,
      crop.w * scaleX, crop.h * scaleY,
      0, 0, out.width, out.height
    );
    onConfirm(out.toDataURL('image/png'));
  };

  const resetCrop = () => {
    if (canvasRef.current) {
      setCrop({ x: 0, y: 0, w: canvasRef.current.width, h: canvasRef.current.height });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ maxWidth: '860px', width: '96vw' }}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="text-sm font-semibold text-slate-800">Recadrer la capture</p>
            <p className="text-xs text-slate-400 mt-0.5">Dessinez ou déplacez le cadre vert pour sélectionner la zone à conserver</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Canvas */}
        <div ref={containerRef} className="bg-slate-100 flex items-center justify-center p-4 overflow-auto">
          {imgLoaded ? (
            <canvas
              ref={canvasRef}
              width={canvasSize.w}
              height={canvasSize.h}
              className="rounded-lg shadow-lg cursor-crosshair select-none"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              style={{ touchAction: 'none' }}
            />
          ) : (
            <div className="w-16 h-16 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/60 flex-shrink-0">
          <button
            type="button"
            onClick={resetCrop}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={crop.w < MIN_SIZE || crop.h < MIN_SIZE}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              Confirmer le crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
