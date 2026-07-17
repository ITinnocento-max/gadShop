"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface SearchScannerProps {
  open: boolean;
  onClose: () => void;
  onTextExtracted: (text: string) => void;
}

export function SearchScanner({ open, onClose, onTextExtracted }: SearchScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");

  const startCamera = useCallback(async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setError("Camera access denied. Please allow camera permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (open) startCamera();
    else stopCamera();
    return stopCamera;
  }, [open, startCamera, stopCamera]);

  const captureAndScan = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setScanning(true);
    setError("");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) { setScanning(false); return; }

    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/png");

    try {
      const Tesseract = await import("tesseract.js");
      const { data } = await Tesseract.recognize(imageData, "eng", {});
      const text = data.text.replace(/\n+/g, " ").trim();
      if (text) {
        onTextExtracted(text);
        onClose();
      } else {
        setError("No text found. Try a clearer image.");
        setScanning(false);
      }
    } catch {
      setError("Failed to scan. Try again.");
      setScanning(false);
    }
  }, [onTextExtracted, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-black/80">
        <button onClick={onClose} className="text-white active:scale-95 transition-transform">
          <span className="material-symbols-outlined">close</span>
        </button>
        <p className="font-label-md text-white">Point camera at text</p>
        <div className="w-8" />
      </div>
      <div className="flex-1 relative bg-black overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[80%] h-[40%] border-2 border-white/60 rounded-2xl" />
        </div>
        {scanning && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-white text-4xl animate-spin">progress_activity</span>
            <p className="font-label-md text-white">Scanning text...</p>
          </div>
        )}
        {error && (
          <div className="absolute bottom-24 left-4 right-4 bg-error/90 text-white p-3 rounded-xl text-center font-label-md">
            {error}
          </div>
        )}
      </div>
      <div className="flex justify-center py-8 bg-black">
        <button
          onClick={captureAndScan}
          disabled={scanning}
          className="w-16 h-16 rounded-full bg-white border-4 border-white/40 active:scale-90 transition-all disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-primary text-3xl">photo_camera</span>
        </button>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
