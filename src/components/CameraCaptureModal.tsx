import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
  onSelectFromGallery: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  onSelectFromGallery,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCameraError, setHasCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize or switch camera
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    let isMounted = true;
    startCamera(facingMode, isMounted);

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async (mode: 'environment' | 'user', isMounted: boolean) => {
    setIsInitializing(true);
    setHasCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('متصفحك لا يدعم فتح الكاميرا المباشرة، يرجى اختيار صورة من المعرض.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (!isMounted) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsInitializing(false);
    } catch (err: any) {
      console.warn('Camera error:', err);
      if (isMounted) {
        setIsInitializing(false);
        setHasCameraError(
          'تعذر فتح الكاميرا المباشرة (يرجى السماح بالوصول للكاميرا في إعدادات المتصفح)، أو يمكنك اختيار صورة من المعرض مباشرة.'
        );
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const switchCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    stopCamera();
    onCapture(dataUrl);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between">
      {/* Hidden canvas for snapshot rendering */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top action bar */}
      <div className="p-4 flex items-center justify-between text-white bg-gradient-to-b from-black/80 to-transparent z-10">
        <button
          type="button"
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white transition-all flex items-center gap-1.5"
          aria-label="إغلاق الكاميرا"
        >
          <X className="w-6 h-6" />
          <span className="text-sm font-bold">إلغاء</span>
        </button>

        <span className="text-base font-bold text-cyan-200">
          وجّه الكاميرا نحو الوصفة الطبية
        </span>

        <button
          type="button"
          onClick={switchCameraFacing}
          className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white transition-all"
          title="تبديل الكاميرا"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Camera Viewfinder with overlay guide */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black">
        {hasCameraError ? (
          <div className="p-6 max-w-sm text-center bg-slate-900/90 rounded-2xl border border-red-500/40 mx-4">
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <p className="text-white text-base font-bold mb-2">تنبيه الكاميرا</p>
            <p className="text-slate-300 text-sm mb-5 leading-relaxed">{hasCameraError}</p>
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
                onSelectFromGallery();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 shadow-lg"
            >
              <ImageIcon className="w-5 h-5" />
              اختيار صورة من المعرض
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover"
            />

            {/* Guide overlay box */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
              <div className="camera-guide-box w-full max-w-xs md:max-w-md aspect-[3/4] border-2 border-cyan-400/80 rounded-2xl relative flex flex-col justify-between p-4 bg-cyan-950/10">
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-t-4 border-r-4 border-cyan-300 rounded-tr" />
                  <div className="w-6 h-6 border-t-4 border-l-4 border-cyan-300 rounded-tl" />
                </div>
                <div className="text-center bg-black/60 backdrop-blur-sm py-2 px-3 rounded-lg border border-cyan-500/30">
                  <p className="text-cyan-100 text-xs md:text-sm font-semibold">
                    ضع ورقة الوصفة أو علبة الدواء داخل الإطار وتأكد من وضوح الإضاءة
                  </p>
                </div>
                <div className="flex justify-between">
                  <div className="w-6 h-6 border-b-4 border-r-4 border-cyan-300 rounded-br" />
                  <div className="w-6 h-6 border-b-4 border-l-4 border-cyan-300 rounded-bl" />
                </div>
              </div>
            </div>

            {isInitializing && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-white text-sm font-bold">جاري تشغيل الكاميرا...</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Shutter & Gallery Controls */}
      <div className="p-6 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-around z-10">
        {/* Choose from gallery button */}
        <button
          type="button"
          onClick={() => {
            stopCamera();
            onClose();
            onSelectFromGallery();
          }}
          className="flex flex-col items-center gap-1.5 text-slate-300 hover:text-white transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-cyan-400" />
          </div>
          <span className="text-xs font-bold">من المعرض</span>
        </button>

        {/* Big Shutter button */}
        <button
          type="button"
          onClick={capturePhoto}
          disabled={Boolean(hasCameraError) || isInitializing}
          className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 active:scale-95 transition-all shadow-xl hover:bg-white/30 disabled:opacity-40"
          aria-label="التقاط الصورة الآن"
        >
          <div className="w-16 h-16 rounded-full bg-cyan-400 border-2 border-white flex items-center justify-center shadow-inner">
            <Camera className="w-8 h-8 text-slate-950" />
          </div>
        </button>

        <div className="w-12" />
      </div>
    </div>
  );
};
