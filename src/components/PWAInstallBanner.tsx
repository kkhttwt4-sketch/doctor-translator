import React, { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, X, CheckCircle2, Smartphone, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already running in standalone / installed mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS devices (iPhone, iPad, iPod)
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowGuideModal(true);
      return;
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  // If already installed or dismissed, do not show banner
  if (isInstalled || isDismissed) {
    return null;
  }

  return (
    <>
      {/* Friendly Top / Inline Install Banner */}
      <div className="mx-4 my-2 p-3 rounded-2xl bg-gradient-to-r from-[#0d2250] to-[#122c68] border border-cyan-400/40 shadow-lg flex items-center justify-between gap-3 text-right">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <span>تثبيت التطبيق على الشاشة الرئيسية</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 font-extrabold">
                {isIOS ? 'iPhone' : 'موبايل'}
              </span>
            </h4>
            <p className="text-[11px] text-cyan-200/80">
              لتشغيل «ترجمان الطبيب» كأيقونة تطبيق سريعة بملء الشاشة وبدون متصفح
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md hover:from-cyan-300 hover:to-blue-400 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تثبيت الآن</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            aria-label="إغلاق التنبيه"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step-by-Step Installation Modal for iPhone / Safari */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0e1b38] border-2 border-cyan-400/50 rounded-3xl max-w-md w-full p-6 text-right shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  إضافة التطبيق إلى شاشة الآيفون
                </h3>
                <p className="text-xs text-cyan-300">
                  خطوات بسيطة في متصفح Safari لإضافة الأيقونة
                </p>
              </div>
            </div>

            {/* Visual Steps for iOS Safari */}
            <div className="space-y-3.5 mb-6 text-slate-200 text-sm">
              {/* Step 1 */}
              <div className="p-3.5 rounded-2xl bg-[#142347] border border-blue-800/60 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  ١
                </div>
                <div>
                  <p className="font-bold text-white text-xs sm:text-sm">
                    اضغط على زر المشاركة <Share2 className="w-4 h-4 inline-block text-cyan-400 mx-1 align-sub" /> (Share)
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    ستجده في الشريط السفلي لمتصفح Safari (أو العلوي في أجهزة iPad).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-2xl bg-[#142347] border border-blue-800/60 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  ٢
                </div>
                <div>
                  <p className="font-bold text-white text-xs sm:text-sm">
                    مرر للأسفل واختر <PlusSquare className="w-4 h-4 inline-block text-cyan-400 mx-1 align-sub" /> «إضافة إلى الصفحة الرئيسية»
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    (Add to Home Screen) بجانب أيقونة المربع والزائد.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-2xl bg-[#142347] border border-blue-800/60 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  ٣
                </div>
                <div>
                  <p className="font-bold text-white text-xs sm:text-sm">
                    اضغط على كلمة «إضافة» (Add) في الزاوية العلوية
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    ستظهر أيقونة «ترجمان الطبيب» فوراً على شاشتك الرئيسية بجانب تطبيقاتك الأخرى!
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-center mb-4">
              <span className="text-xs text-cyan-200 font-semibold flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                يعمل كتطبيق كامل وسريع بدون شريط العناوين وحافظ لبياناتك
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-sm shadow-lg hover:from-cyan-300 hover:to-blue-400 transition-all"
            >
              فهمت الخطوات، شكرًا
            </button>
          </div>
        </div>
      )}
    </>
  );
};
