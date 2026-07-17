"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface SearchScannerProps {
  open: boolean;
  onClose: () => void;
  onBarcodeScanned: (code: string) => void;
}

export function SearchScanner({ open, onClose, onBarcodeScanned }: SearchScannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(true);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {}
      scannerRef.current.clear();
      scannerRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async () => {
    if (!containerRef.current) return;
    setError("");
    setScanning(true);

    try {
      const scanner = new Html5Qrcode("barcode-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 280, height: 160 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          onBarcodeScanned(decodedText);
          stopScanner();
          onClose();
        },
        () => {}
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("NotAllowedError") || msg.includes("Permission")) {
        setError("Camera access denied. Please allow camera permissions.");
      } else if (msg.includes("NotFound")) {
        setError("No camera found on this device.");
      } else {
        setError("Failed to start camera. Try again.");
      }
      setScanning(false);
    }
  }, [onBarcodeScanned, onClose, stopScanner]);

  useEffect(() => {
    if (open) startScanner();
    else stopScanner();
    return () => { void stopScanner(); };
  }, [open, startScanner, stopScanner]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-black/80">
        <button onClick={() => { stopScanner(); onClose(); }} className="text-white active:scale-95 transition-transform">
          <span className="material-symbols-outlined">close</span>
        </button>
        <p className="font-label-md text-white">Scan a barcode</p>
        <div className="w-8" />
      </div>
      <div className="flex-1 relative bg-black overflow-hidden">
        <div id="barcode-reader" ref={containerRef} className="w-full h-full" />
        {scanning && !error && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[75%] h-[30%] border-2 border-white/50 rounded-2xl" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8">
            <span className="material-symbols-outlined text-white/40 text-5xl">barcode_scanner</span>
            <p className="font-label-md text-white text-center">{error}</p>
            <button onClick={startScanner} className="px-6 py-2 bg-primary text-on-primary rounded-full font-label-md active:scale-95 transition-all">
              Try Again
            </button>
          </div>
        )}
      </div>
      <div className="flex justify-center py-6 bg-black">
        <p className="font-label-sm text-white/60">Point your camera at a product barcode</p>
      </div>
    </div>
  );
}
