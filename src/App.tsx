/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Image as ImageIcon,
  History,
  Clock,
  Home,
  Sparkles,
  ExternalLink,
  Calendar,
  Pill,
  ShieldCheck,
  AlertCircle,
  FileText,
  Volume2,
  ChevronLeft,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Download,
} from 'lucide-react';
import { Header } from './components/Header';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { ImagePreviewConfirm } from './components/ImagePreviewConfirm';
import { AnalysisLoading } from './components/AnalysisLoading';
import { ExplanationView } from './components/ExplanationView';
import { HistoryView } from './components/HistoryView';
import { ScheduleView } from './components/ScheduleView';
import { DisclaimerModal } from './components/DisclaimerModal';
import { SamplePickerModal } from './components/SamplePickerModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import {
  AppTab,
  PrescriptionAnalysis,
  SavedPrescription,
  MedicationReminder,
} from './types';
import {
  loadSavedPrescriptions,
  addPrescriptionToStorage,
  loadReminders,
  getSavedFontSize,
  saveFontSize,
  FontSizeOption,
} from './services/storage';
import { analyzePrescriptionImage } from './services/api';
import { SamplePrescriptionItem } from './data/samplePrescriptions';

export default function App() {
  // Navigation & View States
  const [currentTab, setCurrentTab] = useState<AppTab>('home');
  const [fontSize, setFontSize] = useState<FontSizeOption>(getSavedFontSize());

  // Image & Analysis States
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string>('image/jpeg');
  const [isPreviewingPhoto, setIsPreviewingPhoto] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<PrescriptionAnalysis | null>(null);

  // Stored Data
  const [savedPrescriptions, setSavedPrescriptions] = useState<SavedPrescription[]>([]);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);

  // Modals & Popups
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showSamplePicker, setShowSamplePicker] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize storage
  useEffect(() => {
    setSavedPrescriptions(loadSavedPrescriptions());
    setReminders(loadReminders());
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleFontSizeChange = (size: FontSizeOption) => {
    setFontSize(size);
    saveFontSize(size);
  };

  // Open native gallery file picker
  const handleOpenGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Handle image selected from gallery
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('يرجى اختيار ملف صورة صالح (JPG أو PNG).', 'error');
      return;
    }

    const mime = file.type || 'image/jpeg';
    setSelectedImageMime(mime);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setSelectedImage(result);
        setIsPreviewingPhoto(true);
        showToast('تم تحميل الصورة بنجاح. يرجى التأكد من وضوحها.', 'success');
      }
    };
    reader.onerror = () => {
      showToast('حدث خطأ أثناء قراءة الصورة من جهازك.', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Handle photo captured from camera
  const handleCameraCapture = (base64Image: string) => {
    setIsCameraOpen(false);
    setSelectedImage(base64Image);
    setSelectedImageMime('image/jpeg');
    setIsPreviewingPhoto(true);
    showToast('تم التقاط الصورة بنجاح. راجع وضوحها قبل التحليل.', 'success');
  };

  // Start real backend AI analysis
  const handleConfirmAndAnalyze = async () => {
    if (!selectedImage) return;

    setIsPreviewingPhoto(false);
    setIsAnalyzing(true);

    try {
      const response = await analyzePrescriptionImage(selectedImage, selectedImageMime);

      if (response.success && response.data) {
        setCurrentAnalysis(response.data);
        // Automatically save to local history
        const saved = addPrescriptionToStorage(response.data, selectedImage);
        setSavedPrescriptions((prev) => [saved, ...prev]);

        setIsAnalyzing(false);
        setCurrentTab('result');
        showToast('تم تحليل الوصفة الطبية وشرحها بنجاح!', 'success');
      } else {
        setIsAnalyzing(false);
        showToast(
          response.error || 'تعذر تحليل الوصفة. يرجى تجربة صورة أوضح أو التحقق من الاتصال.',
          'error'
        );
      }
    } catch (err: any) {
      setIsAnalyzing(false);
      showToast('حدث خطأ غير متوقع. يرجى إعادة المحاولة.', 'error');
    }
  };

  // Pick demo prescription for instant testing
  const handleSelectSample = (sample: SamplePrescriptionItem) => {
    setSelectedImage(sample.imageDataUri);
    setSelectedImageMime('image/svg+xml');
    setCurrentAnalysis(sample.previewData);
    // Auto-save sample view to history if not exists
    const saved = addPrescriptionToStorage(sample.previewData, sample.imageDataUri);
    setSavedPrescriptions((prev) => [saved, ...prev]);

    setCurrentTab('result');
    showToast(`تم فتح النموذج: ${sample.title}`, 'success');
  };

  // Open a saved prescription from history
  const handleOpenSavedPrescription = (item: SavedPrescription) => {
    setSelectedImage(item.imageThumbnail);
    setCurrentAnalysis(item.analysis);
    setCurrentTab('result');
  };

  // Latest prescription from history
  const latestPrescription = savedPrescriptions.length > 0 ? savedPrescriptions[0] : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#080e22] text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-['Tajawal',sans-serif]">
      {/* Hidden file input for native gallery selection */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Header */}
      <Header
        fontSize={fontSize}
        onChangeFontSize={handleFontSizeChange}
        onOpenDisclaimer={() => setShowDisclaimer(true)}
      />

      {/* PWA Install Guide Banner (iPhone Safari & Android) */}
      <PWAInstallBanner />

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 inset-x-4 z-50 max-w-md mx-auto animate-bounce">
          <div
            className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              toast.type === 'error'
                ? 'bg-rose-950 border-rose-500/60 text-rose-200'
                : toast.type === 'success'
                ? 'bg-emerald-950 border-emerald-500/60 text-emerald-200'
                : 'bg-blue-950 border-cyan-500/60 text-cyan-200'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
            )}
            <p className="text-sm font-bold flex-1 leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-xs opacity-70 hover:opacity-100 px-1 py-0.5"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto">
        {/* Loading / Analyzing State */}
        {isAnalyzing ? (
          <AnalysisLoading />
        ) : isPreviewingPhoto && selectedImage ? (
          /* Image Review & Confirmation */
          <ImagePreviewConfirm
            imageSrc={selectedImage}
            onRetake={() => {
              setIsPreviewingPhoto(false);
              setSelectedImage(null);
            }}
            onConfirm={handleConfirmAndAnalyze}
          />
        ) : currentTab === 'result' && currentAnalysis ? (
          /* Explanation View */
          <ExplanationView
            analysis={currentAnalysis}
            imageThumbnail={selectedImage || ''}
            fontSize={fontSize}
            onGoHome={() => setCurrentTab('home')}
            onNewScan={() => {
              setCurrentAnalysis(null);
              setSelectedImage(null);
              setIsCameraOpen(true);
            }}
            onViewSchedule={() => setCurrentTab('schedule')}
          />
        ) : currentTab === 'history' ? (
          /* Saved Prescriptions View */
          <HistoryView
            prescriptions={savedPrescriptions}
            onSelectPrescription={handleOpenSavedPrescription}
            onRefreshList={(updated) => setSavedPrescriptions(updated)}
            onNewScan={() => setIsCameraOpen(true)}
          />
        ) : currentTab === 'schedule' ? (
          /* Schedule / Daily Routine View */
          <ScheduleView
            reminders={reminders}
            onRefreshReminders={(updated) => setReminders(updated)}
            onNewScan={() => setIsCameraOpen(true)}
          />
        ) : (
          /* Home Page (الصفحة الرئيسية) */
          <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
            {/* Welcome Banner */}
            <div className="text-center bg-gradient-to-b from-[#11234c] to-[#0c1836] p-6 sm:p-8 rounded-3xl border border-cyan-500/30 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                مساعدك الطبي الذكي
              </span>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                مرحبًا بك في مساعدك الطبي الذكي
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-6 font-medium">
                صوّر وصفتك الطبية وسنقوم بقراءتها وتوضيح اسم الدواء والجرعة ومواعيد الاستخدام بلغة عربية مبسطة مع الشرح الصوتي المريح لكبار السن.
              </p>

              {/* Action Section: بدء تحليل جديد */}
              <div className="bg-[#081024]/70 p-4 sm:p-5 rounded-2xl border border-blue-800/60 shadow-inner">
                <h3 className="text-xs font-bold text-cyan-300 mb-3 tracking-wide text-right">
                  بدء تحليل جديد
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Button 1: تصوير الوصفة الطبية */}
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="py-4 px-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-base flex items-center justify-center gap-2.5 shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-950/20 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-slate-950" />
                    </div>
                    <span>تصوير الوصفة الطبية</span>
                  </button>

                  {/* Button 2: من المعرض */}
                  <button
                    type="button"
                    onClick={handleOpenGallery}
                    className="py-4 px-4 rounded-2xl bg-[#142347] hover:bg-[#1b2f5e] border border-blue-700/60 text-white font-black text-base flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all shadow-md"
                  >
                    <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <span>من المعرض</span>
                  </button>
                </div>

                {/* Instant Sample Prescriptions Test Link */}
                <div className="mt-4 pt-3 border-t border-blue-900/50 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    ليس لديك وصفة طبية الآن؟
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSamplePicker(true)}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline underline-offset-4"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>جرّب وصفة نموذجية فوراً</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section: آخر وصفة تم تحليلها (Recent Card) */}
            {latestPrescription && (
              <div className="bg-[#0f1e3f] p-5 rounded-3xl border border-blue-800/60 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                    <h3 className="text-sm font-bold text-cyan-300">آخر وصفة تم تحليلها</h3>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {latestPrescription.date}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 bg-[#14244c] p-3.5 rounded-2xl border border-blue-800/40">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-blue-700/60 shrink-0">
                      {latestPrescription.imageThumbnail ? (
                        <img
                          src={latestPrescription.imageThumbnail}
                          alt={latestPrescription.medicationName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Pill className="w-6 h-6 text-cyan-400 m-3" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white leading-tight">
                        {latestPrescription.medicationName}
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        الجرعة: {latestPrescription.analysis.dosage} •{' '}
                        {latestPrescription.analysis.frequency}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenSavedPrescription(latestPrescription)}
                    className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1 shrink-0 hover:from-cyan-300 hover:to-blue-400 transition-all shadow-md active:scale-95"
                  >
                    <span>عرض</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Quick Access to Previous Prescriptions (وصفاتي السابقة) */}
            <div className="bg-[#0f1d3c] p-5 rounded-3xl border border-blue-900/60 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">وصفاتي السابقة</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentTab('history')}
                  className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <span>عرض الكل ({savedPrescriptions.length})</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              {savedPrescriptions.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  لا توجد وصفات سابقة حتى الآن. ابدأ بتصوير أول وصفة!
                </p>
              ) : (
                <div className="space-y-2.5">
                  {savedPrescriptions.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleOpenSavedPrescription(item)}
                      className="p-3 rounded-xl bg-[#142347] hover:bg-[#1b2e5c] border border-blue-800/40 flex items-center justify-between gap-3 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <Pill className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div>
                          <span className="font-bold text-white text-xs sm:text-sm block">
                            {item.medicationName}
                          </span>
                          <span className="text-[11px] text-slate-400">{item.date}</span>
                        </div>
                      </div>
                      <span className="text-xs text-cyan-300 font-semibold flex items-center gap-1">
                        تفاصيل
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Senior Friendly Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-[#0c1833] border border-blue-900/40 text-center">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center mx-auto mb-2">
                  <Volume2 className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">قراءة صوتية واضحة</h4>
                <p className="text-[11px] text-slate-400">
                  استمع لشرح الأدوية بصوت نقي وبسرعة مريحة لكبار السن
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c1833] border border-blue-900/40 text-center">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">أمان وموثوقية طبية</h4>
                <p className="text-[11px] text-slate-400">
                  عدم تخمين أي جرعة غير واضحة وتوجيه للمراجعة مع الصيدلي
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c1833] border border-blue-900/40 text-center">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">جدول أوقات العلاج</h4>
                <p className="text-[11px] text-slate-400">
                  تنظيم أوقات تناول الأدوية اليومية لتفادي النسيان
                </p>
              </div>
            </div>

            {/* Direct Export Card for Render */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#0c1b3a] to-[#122650] border border-cyan-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    حزمة ملفات المشروع كاملة (ZIP)
                  </h4>
                  <p className="text-xs text-cyan-200/80">
                    ملف مضغوط يحتوي كامل المشروع جاهزاً للنشر المباشر على Render مجاناً
                  </p>
                </div>
              </div>
              <a
                href="/doctor-translator-render.zip"
                download="doctor-translator-render.zip"
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>تنزيل ملف ZIP الآن</span>
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation Bar (Mobile-first, Fixed with iOS Safe Area) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#09132c]/95 backdrop-blur-md border-t border-cyan-900/40 shadow-2xl py-2 px-4 pb-[max(0.6rem,env(safe-area-inset-bottom,0px))]">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {/* Home */}
          <button
            type="button"
            onClick={() => {
              setIsPreviewingPhoto(false);
              setCurrentTab('home');
            }}
            className={`flex flex-col items-center gap-1 transition-all ${
              currentTab === 'home' && !isPreviewingPhoto
                ? 'text-cyan-400 scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[11px] font-bold">الرئيسية</span>
          </button>

          {/* Quick Camera Action */}
          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            className="flex flex-col items-center gap-1 -mt-5"
          >
            <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/30 ring-4 ring-[#080e22] active:scale-95 transition-all">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-black text-cyan-300">تصوير</span>
          </button>

          {/* History */}
          <button
            type="button"
            onClick={() => {
              setIsPreviewingPhoto(false);
              setCurrentTab('history');
            }}
            className={`flex flex-col items-center gap-1 transition-all ${
              currentTab === 'history'
                ? 'text-cyan-400 scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-5 h-5" />
            <span className="text-[11px] font-bold">وصفاتي</span>
          </button>

          {/* Schedule */}
          <button
            type="button"
            onClick={() => {
              setIsPreviewingPhoto(false);
              setCurrentTab('schedule');
            }}
            className={`flex flex-col items-center gap-1 transition-all ${
              currentTab === 'schedule'
                ? 'text-cyan-400 scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-[11px] font-bold">أوقات علاجي</span>
          </button>
        </div>
      </nav>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        onSelectFromGallery={() => {
          setIsCameraOpen(false);
          handleOpenGallery();
        }}
      />

      {/* Sample Picker Modal */}
      <SamplePickerModal
        isOpen={showSamplePicker}
        onClose={() => setShowSamplePicker(false)}
        onSelectSample={handleSelectSample}
      />

      {/* Medical Disclaimer & Privacy Modal */}
      <DisclaimerModal
        isOpen={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
      />
    </div>
  );
}
