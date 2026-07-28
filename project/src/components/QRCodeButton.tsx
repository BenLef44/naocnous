import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode } from 'lucide-react';

interface Props {
  value: string;
  label?: string;
}

export default function QRCodeButton({ value, label }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <button
        onClick={() => setExpanded(true)}
        title="Afficher le QR code"
        className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-100 transition-colors group"
      >
        <QRCodeSVG
          value={value}
          size={28}
          bgColor="transparent"
          fgColor="#64748b"
          level="M"
          className="group-hover:opacity-80 transition-opacity"
        />
      </button>

      {expanded && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          onClick={() => setExpanded(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl p-6 flex flex-col items-center gap-4"
            style={{ minWidth: 280 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-700">QR Code</span>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-100 shadow-inner">
              <QRCodeSVG
                value={value}
                size={200}
                bgColor="#ffffff"
                fgColor="#1e293b"
                level="M"
                includeMargin
              />
            </div>

            {label && (
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-800 truncate max-w-[240px]">{label}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-[240px]">{value}</p>
              </div>
            )}

            <p className="text-[10px] text-slate-400 text-center">
              Scannez pour accéder à la fiche
            </p>
          </div>
        </div>
      )}
    </>
  );
}
