import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Trash2, Check, PenLine, Type } from 'lucide-react';

interface Props {
  title: string;
  suggestName?: string;
  onConfirm: (dataUrl: string) => void;
  onClose: () => void;
}

const CURSIVE_FONTS = [
  '"Dancing Script", cursive',
  '"Pacifico", cursive',
  '"Great Vibes", cursive',
  'cursive',
];

export default function SignatureModal({ title, suggestName, onConfirm, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<'draw' | 'suggest'>('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [fontIdx, setFontIdx] = useState(0);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
  }, []);

  const renderSuggest = useCallback((idx: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !suggestName) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const font = CURSIVE_FONTS[idx];
    ctx.font = `48px ${font}`;
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(suggestName, canvas.width / 2, canvas.height / 2);
    setHasContent(true);
  }, [suggestName]);

  useEffect(() => {
    if (mode === 'suggest') {
      renderSuggest(fontIdx);
    } else {
      clearCanvas();
    }
  }, [mode, fontIdx, renderSuggest, clearCanvas]);

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    if (mode !== 'draw') return;
    e.preventDefault();
    setIsDrawing(true);
    lastPos.current = getPos(e);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing || mode !== 'draw') return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
    setHasContent(true);
  }

  function endDraw() {
    setIsDrawing(false);
    lastPos.current = null;
  }

  function handleConfirm() {
    const canvas = canvasRef.current;
    if (!canvas || !hasContent) return;
    onConfirm(canvas.toDataURL('image/png'));
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <PenLine className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800">{title}</p>
            <p className="text-xs text-slate-400">Signez dans la zone ci-dessous</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="px-5 pt-4 flex items-center gap-2">
          <button
            onClick={() => setMode('draw')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              mode === 'draw' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            <PenLine className="w-3.5 h-3.5" /> Signature manuelle
          </button>
          {suggestName && (
            <button
              onClick={() => setMode('suggest')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                mode === 'suggest' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <Type className="w-3.5 h-3.5" /> Suggéré ({suggestName})
            </button>
          )}
        </div>

        {/* Canvas */}
        <div className="px-5 pt-3 pb-1">
          <div className={`rounded-xl border-2 overflow-hidden ${mode === 'draw' ? 'border-slate-300 cursor-crosshair' : 'border-slate-200'}`}>
            <canvas
              ref={canvasRef}
              width={480}
              height={180}
              className="w-full block bg-slate-50 touch-none"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
          </div>
          {mode === 'draw' && !hasContent && (
            <p className="text-[11px] text-slate-400 text-center mt-1.5">Signez ici avec votre souris ou votre doigt</p>
          )}
        </div>

        {/* Style switcher for suggest mode */}
        {mode === 'suggest' && suggestName && (
          <div className="px-5 pb-1 flex items-center gap-2">
            <span className="text-xs text-slate-500">Style :</span>
            {CURSIVE_FONTS.map((_, i) => (
              <button key={i} onClick={() => setFontIdx(i)}
                className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                  fontIdx === i ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}>
                Style {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-4 flex items-center justify-between border-t border-slate-100 mt-3">
          <button
            onClick={clearCanvas}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:border-slate-300 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Effacer
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors">
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={!hasContent}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Check className="w-3.5 h-3.5" /> Valider la signature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
