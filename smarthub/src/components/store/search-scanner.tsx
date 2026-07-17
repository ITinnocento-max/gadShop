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
  const [phase, setPhase] = useState<"loading" | "scanning" | "found" | "error">("loading");
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
          fps: 10,
          qrbox: { width: 280, height: 120 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          setScannedCode(decodedText);
          setPhase("found");
          void scanner.stop().catch(() => {});
          setTimeout(() => {
            onBarcodeScanned(decodedText);
            onClose();
          }, 1500);
        },
        () => {}
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
      startScanner();
    } else {
      void stopScanner();
    }
    return () => { void stopScanner(); };
  }, [open, startScanner, stopScanner]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 z-10 relative">
        <button onClick={() => { void stopScanner(); onClose(); }} className="text-white active:scale-95 transition-transform">
          <span className="material-symbols-outlined">close</span>
        </button>
        <p className="font-label-md text-white">
          {phase === "loading" && "Starting camera..."}
          {phase === "scanning" && "Scanning barcode..."}
          {phase === "found" && "Barcode found!"}
          {phase === "error" && "Scanner error"}
        </p>
        <div className="w-8" />
      </div>

      <div className="flex-1 relative bg-black">
        <div id="barcode-reader" ref={containerRef} className="absolute inset-0" />

        {phase === "loading" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black">
            <span className="material-symbols-outlined text-white text-5xl animate-pulse">barcode_scanner</span>
            <p className="font-label-md text-white/70">Initializing camera...</p>
          </div>
        )}

        {phase === "found" && scannedCode && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 gap-3">
            <span className="material-symbols-outlined text-secondary text-5xl">check_circle</span>
            <p className="font-headline-md text-white">{scannedCode}</p>
            <p className="font-label-sm text-white/60">Searching for products...</p>
          </div>
        )}

        {phase === "error" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 px-8 bg-black">
            <span className="material-symbols-outlined text-white/30 text-6xl">barcode_scanner</span>
            <p className="font-label-md text-white text-center">{error}</p>
            <button onClick={startScanner} className="px-8 py-3 bg-primary text-on-primary rounded-full font-label-md active:scale-95 transition-all">
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-center py-5 bg-black z-10 relative">
        {phase === "scanning" && (
          <p className="font-label-sm text-white/50">Hold steady over a barcode</p>
        )}
      </div>
    </div>
  );
}
