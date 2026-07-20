"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface SearchScannerProps {
  open: boolean;
  onClose: () => void;
  onBarcodeScanned: (code: string) => void;
}

export function SearchScanner({ open, onClose, onBarcodeScanned }: SearchScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null);
  const [phase, setPhase] = useState<"loading" | "scanning" | "detecting" | "found" | "error">("loading");
  const [error, setError] = useState("");
  const [scannedCode, setScannedCode] = useState("");

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      try { scannerRef.current.clear(); } catch {}
      scannerRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async () => {
    if (!containerRef.current) return;
    setError("");
    setPhase("loading");
    setScannedCode("");

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const container = containerRef.current;
      container.innerHTML = "";

      const scanner = new Html5Qrcode(container.id);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: { width: 300, height: 150 },
          aspectRatio: 1.333,
          disableFlip: false,
        },
        (decodedText, decodedResult) => {
          const formatName = decodedResult?.result?.format?.formatName || "BARCODE";
          setScannedCode(`${formatName}: ${decodedText}`);
          setPhase("found");
          void scanner.stop().catch(() => {});
          setTimeout(() => {
            onBarcodeScanned(decodedText);
            onClose();
          }, 1500);
        },
        () => {
          setPhase("scanning");
        }
      );

      setPhase("scanning");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("NotAllowed") || msg.includes("Permission")) {
        setError("Camera access denied. Please allow camera permissions in your browser settings.");
      } else if (msg.includes("NotFound")) {
        setError("No camera found on this device.");
      } else {
        setError("Failed to start camera. Tap below to retry.");
      }
      setPhase("error");
    }
  }, [onBarcodeScanned, onClose]);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      startScanner();
    } else {
      void stopScanner();
    }
    return () => { void stopScanner(); };
  }, [open, startScanner, stopScanner]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center">
      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-black/80 z-30">
        <button onClick={() => { void stopScanner(); onClose(); }} className="w-10 h-10 flex items-center justify-center text-white active:scale-95 transition-transform">
          <span className="material-symbols-outlined">close</span>
        </button>
        <p className="font-label-md text-white">
          {phase === "loading" && "Starting camera..."}
          {phase === "scanning" && "Scanning for barcode..."}
          {phase === "detecting" && "Barcode detected!"}
          {phase === "found" && "Match found!"}
          {phase === "error" && "Scanner error"}
        </p>
        <div className="w-10" />
      </div>

      {/* Camera card */}
      <div className="relative w-[92vw] max-w-[400px] aspect-[4/3] rounded-3xl overflow-hidden bg-neutral-900 shadow-2xl">
        {/* Camera feed */}
        <div id="barcode-reader" ref={containerRef} className="absolute inset-0 [&>div]:!absolute [&>div]:!inset-0 [&>video]:!rounded-3xl [&>video]:!object-cover" />

        {/* Detection frame overlay — only during scanning */}
        {(phase === "scanning" || phase === "detecting") && (
          <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
            {/* Darkened edges */}
            <div className="absolute inset-0 bg-black/30" />
            {/* Clear cutout for scan region */}
            <div className={`relative w-[80%] h-[40%] rounded-xl transition-all duration-200 ${phase === "detecting" ? "shadow-[0_0_30px_rgba(0,200,100,0.5)]" : ""}`}>
              {/* Corner brackets */}
              <div className={`absolute -top-0.5 -left-0.5 w-8 h-8 border-t-[3px] border-l-[3px] rounded-tl-xl transition-colors ${phase === "detecting" ? "border-green-400" : "border-white"}`} />
              <div className={`absolute -top-0.5 -right-0.5 w-8 h-8 border-t-[3px] border-r-[3px] rounded-tr-xl transition-colors ${phase === "detecting" ? "border-green-400" : "border-white"}`} />
              <div className={`absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-[3px] border-l-[3px] rounded-bl-xl transition-colors ${phase === "detecting" ? "border-green-400" : "border-white"}`} />
              <div className={`absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-[3px] border-r-[3px] rounded-br-xl transition-colors ${phase === "detecting" ? "border-green-400" : "border-white"}`} />
              {/* Scan line */}
              <div className={`absolute left-2 right-2 h-0.5 rounded-full animate-scan ${phase === "detecting" ? "bg-green-400" : "bg-white/60"}`} />
            </div>
          </div>
        )}

        {/* Loading state */}
        {phase === "loading" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-neutral-900">
            <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-primary animate-spin" />
            <p className="font-label-md text-white/60">Initializing camera...</p>
          </div>
        )}

        {/* Found state */}
        {phase === "found" && scannedCode && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm gap-4">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-400 text-4xl">barcode</span>
            </div>
            <div className="text-center px-6">
              <p className="font-headline-md text-white mb-1">{scannedCode}</p>
              <p className="font-label-sm text-white/50">Searching for products...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {phase === "error" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 px-8 bg-neutral-900">
            <span className="material-symbols-outlined text-white/20 text-6xl">barcode_scanner</span>
            <p className="font-label-md text-white/70 text-center">{error}</p>
            <button onClick={startScanner} className="px-8 py-3 bg-primary text-on-primary rounded-full font-label-md active:scale-95 transition-all">
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-2 pb-8 pt-4 bg-gradient-to-t from-black/80 to-transparent z-30">
        {phase === "scanning" && (
          <>
            <div className="flex items-center gap-2 text-white/40">
              <span className="material-symbols-outlined text-lg">center_focus_strong</span>
              <p className="font-label-sm">Center the barcode in the frame</p>
            </div>
            <div className="flex gap-4 mt-1">
              {["EAN", "UPC", "QR"].map((fmt) => (
                <span key={fmt} className="text-[10px] text-white/25 font-label-sm bg-white/5 px-2 py-0.5 rounded-full">{fmt}</span>
              ))}
            </div>
          </>
        )}
        {phase === "detecting" && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <p className="font-label-sm text-green-400">Barcode detected!</p>
          </div>
        )}
      </div>
    </div>
  );
}
