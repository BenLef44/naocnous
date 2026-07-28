import { useState, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Upload, FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X } from 'lucide-react';

export interface PdfViewerHandle {
  captureCurrentPage: () => string | null; // returns dataURL or null
}

interface PdfViewerProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  uploadLabel?: string;
}

const PdfViewer = forwardRef<PdfViewerHandle, PdfViewerProps>(function PdfViewer(
  { file, onFileChange, uploadLabel = 'Déposer le DTA (PDF)' },
  ref
) {
  const [isDragging, setIsDragging] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [rendering, setRendering] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const renderTaskRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    captureCurrentPage: () => {
      if (!canvasRef.current) return null;
      return canvasRef.current.toDataURL('image/png');
    },
  }));

  const loadPdf = useCallback(async (f: File) => {
    const url = URL.createObjectURL(f);
    setPdfUrl(url);
    setCurrentPage(1);

    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString();

    const doc = await pdfjsLib.getDocument({ url }).promise;
    setPdfDoc(doc);
    setTotalPages(doc.numPages);
    renderPage(doc, 1, zoom);
  }, [zoom]);

  const renderPage = useCallback(async (doc: any, pageNum: number, scale: number) => {
    if (!canvasRef.current || !doc) return;
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }
    setRendering(true);
    try {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: scale / 100 });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const task = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;
      await task.promise;
    } catch (e: any) {
      if (e?.name !== 'RenderingCancelledException') console.error(e);
    } finally {
      setRendering(false);
    }
  }, []);

  const changePage = (delta: number) => {
    const next = Math.min(Math.max(1, currentPage + delta), totalPages);
    setCurrentPage(next);
    if (pdfDoc) renderPage(pdfDoc, next, zoom);
  };

  const changeZoom = (delta: number) => {
    const next = Math.min(Math.max(50, zoom + delta), 200);
    setZoom(next);
    if (pdfDoc) renderPage(pdfDoc, currentPage, next);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') {
      onFileChange(f);
      loadPdf(f);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      onFileChange(f);
      loadPdf(f);
    }
  };

  const removeFile = () => {
    onFileChange(null);
    setPdfUrl(null);
    setPdfDoc(null);
    setTotalPages(0);
    setCurrentPage(1);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
  };

  if (!file) {
    return (
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all cursor-pointer
          ${isDragging ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/40'}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileInput}
        />
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors
          ${isDragging ? 'bg-emerald-100' : 'bg-white shadow-sm border border-slate-100'}`}>
          <Upload className={`w-7 h-7 ${isDragging ? 'text-emerald-500' : 'text-slate-400'}`} />
        </div>
        <p className="text-sm font-semibold text-slate-700 mb-1">
          {isDragging ? 'Déposez le fichier ici' : uploadLabel}
        </p>
        <p className="text-xs text-slate-400 mb-4">ou cliquer pour parcourir</p>
        <button
          type="button"
          className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
        >
          Parcourir...
        </button>
        <p className="text-xs text-slate-300 mt-3">Fichier PDF uniquement</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs text-slate-300 truncate max-w-[160px]">{file.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => changePage(-1)}
            disabled={currentPage <= 1}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-slate-300 px-1 tabular-nums">
            {currentPage} / {totalPages || '…'}
          </span>
          <button
            onClick={() => changePage(1)}
            disabled={currentPage >= totalPages}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-slate-600 mx-1" />

          <button
            onClick={() => changeZoom(-25)}
            disabled={zoom <= 50}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-slate-300 px-1 tabular-nums w-10 text-center">{zoom}%</span>
          <button
            onClick={() => changeZoom(25)}
            disabled={zoom >= 200}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-slate-600 mx-1" />

          <button
            onClick={removeFile}
            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-3 bg-slate-800">
        <div className="relative">
          {rendering && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 z-10 rounded">
              <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <canvas
            ref={canvasRef}
            className="rounded shadow-2xl max-w-full"
            style={{ display: 'block' }}
          />
        </div>
      </div>
    </div>
  );
});

export default PdfViewer;
