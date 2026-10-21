import React, { useState, useEffect } from 'react';
import {
  Pill,
  Clock,
  Calendar,
  AlertTriangle,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Home,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Info,
  ShieldAlert,
  BellPlus,
  BookmarkCheck,
  Eye,
} from 'lucide-react';
import { PrescriptionAnalysis } from '../types';
import { speechService, SpeechStatus } from '../services/speech';
import { FontSizeOption, addReminder } from '../services/storage';

interface ExplanationViewProps {
  analysis: PrescriptionAnalysis;
  imageThumbnail: string;
  fontSize: FontSizeOption;
  onGoHome: () => void;
  onNewScan: () => void;
  onViewSchedule?: () => void;
}

export const ExplanationView: React.FC<ExplanationViewProps> = ({
  analysis,
  imageThumbnail,
  fontSize,
  onGoHome,
  onNewScan,
  onViewSchedule,
}) => {
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>('idle');
  const [speechSpeed, setSpeechSpeed] = useState<number>(0.85); // Gentle speed for seniors
  const [showOriginalModal, setShowOriginalModal] = useState(false);
  const [addedReminderMessage, setAddedReminderMessage] = useState(false);

  useEffect(() => {
    speechService.setStatusListener((st) => setSpeechStatus(st));
    return () => {
      speechService.stop();
    };
  }, []);

  // Prepare clear, comprehensive Arabic speech script
  const getSpeechScript = () => {
    let script = `شرح الدواء: ${analysis.medicationName}. `;
    if (analysis.concentration && !analysis.concentration.includes('غير واضحة')) {
      script += `التركيز: ${analysis.concentration}. `;
    }
    script += `الجرعة المقررة: ${analysis.dosage}. `;
    script += `عدد المرات: ${analysis.frequency}. `;
    script += `وقت الاستخدام: ${analysis.timing}. `;
    if (analysis.duration && !analysis.duration.includes('غير واضحة')) {
      script += `مدة العلاج: ${analysis.duration}. `;
    }
    script += `الشرح المبسط: ${analysis.simplifiedExplanation}. `;
    if (analysis.importantWarnings && analysis.importantWarnings.length > 0) {
      script += `تنبيهات هامة: ${analysis.importantWarnings.join('. ')}. `;
    }
    if (analysis.clarityStatus !== 'clear') {
      script += `تنبيه: نرجو التأكد من الصيدلي من أي تفاصيل غير مقروءة بدقة. حفظكم الله ورعاكم.`;
    }
    return script;
  };

  const handlePlayVoice = () => {
    if (speechStatus === 'playing') {
      speechService.pause();
    } else if (speechStatus === 'paused') {
      speechService.resume();
    } else {
      speechService.setRate(speechSpeed);
      speechService.speakText(getSpeechScript());
    }
  };

  const handleToggleSpeed = () => {
    const newSpeed = speechSpeed === 0.85 ? 1.0 : 0.85;
    setSpeechSpeed(newSpeed);
    speechService.setRate(newSpeed);
  };

  const handleCreateReminder = () => {
    let slot: 'morning' | 'noon' | 'evening' | 'bedtime' = 'morning';
    const timingLower = (analysis.timing || '').toLowerCase();
    if (timingLower.includes('ظهر') || timingLower.includes('غداء')) {
      slot = 'noon';
    } else if (timingLower.includes('مساء') || timingLower.includes('عشاء')) {
      slot = 'evening';
    } else if (timingLower.includes('نوم')) {
      slot = 'bedtime';
    }

    addReminder({
      prescriptionId: 'temp',
      medicationName: analysis.medicationName,
      dosage: analysis.dosage,
      timeSlot: slot,
      timeLabel: analysis.timing || 'الموعد المحدد',
      frequency: analysis.frequency,
    });

    setAddedReminderMessage(true);
    setTimeout(() => setAddedReminderMessage(false), 3500);
  };

  // Font size multiplier classes
  const textClass =
    fontSize === 'xlarge'
      ? 'text-lg leading-relaxed'
      : fontSize === 'large'
      ? 'text-base leading-relaxed'
      : 'text-sm leading-normal';

  const headingClass =
    fontSize === 'xlarge' ? 'text-3xl' : fontSize === 'large' ? 'text-2xl' : 'text-xl';

  const isUnclearInfo =
    analysis.clarityStatus === 'unclear' ||
    analysis.medicationName.includes('غير واضحة') ||
    analysis.dosage.includes('غير واضحة');

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Top Breadcrumb & Status */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#122044] border border-blue-800/60 text-cyan-300 hover:text-white text-xs font-bold transition-all"
        >
          <Home className="w-4 h-4" />
          <span>الرئيسية</span>
        </button>

        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
          <BookmarkCheck className="w-3.5 h-3.5 text-cyan-400" />
          تم حفظ الوصفة تلقائياً
        </span>
      </div>

      {/* Main Title */}
      <div className="text-center mb-6">
        <h2 className={`${headingClass} font-black text-white tracking-tight mb-1`}>
          شرح الدواء
        </h2>
        <p className="text-slate-300 text-sm">
          استخراج وتفسير تعليمات الوصفة الطبية بلغة عربية ميسرة
        </p>
      </div>

      {/* Safety Warning Banner if handwritten text was partially unclear */}
      {isUnclearInfo && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-950/40 border-2 border-amber-500/60 flex items-start gap-3.5 text-amber-200">
          <ShieldAlert className="w-7 h-7 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="text-right">
            <h4 className="text-base font-bold text-amber-300 mb-1">
              تنبيه أمان وحرص على صحتك
            </h4>
            <p className="text-xs sm:text-sm text-amber-100 leading-relaxed font-medium">
              {analysis.unclearNotice ||
                'بعض أجزاء خط الطبيب غير مقروءة بوضوح تام. حفاظاً على سلامتك، تم تمييزها بعبارة (المعلومة غير واضحة)، ويرجى الاستفسار من الصيدلي قبل تناول الجرعة.'}
            </p>
          </div>
        </div>
      )}

      {/* Text-to-Speech Player Bar: Big & Accessible */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#112450] to-[#152e67] border-2 border-cyan-400/50 shadow-xl shadow-cyan-950/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
            <Volume2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              الاستماع إلى الشرح بالصوت
              {speechStatus === 'playing' && (
                <span className="flex items-center gap-0.5">
                  <span className="w-1.5 h-3 bg-cyan-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-4 bg-cyan-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-2.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </span>
              )}
            </h4>
            <p className="text-xs text-cyan-200/80 font-medium">
              قراءة واضحة وهادئة باللغة العربية
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Speed Toggle */}
          <button
            type="button"
            onClick={handleToggleSpeed}
            className="px-3 py-2 rounded-xl bg-[#0a1530] border border-blue-700/60 text-xs font-bold text-cyan-300 hover:text-white transition-all"
            title="تبديل سرعة القراءة"
          >
            {speechSpeed === 0.85 ? 'سرعة هادئة (0.85x)' : 'سرعة عادية (1x)'}
          </button>

          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={handlePlayVoice}
            disabled={speechStatus === 'loading'}
            className="py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {speechStatus === 'loading' ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>جاري التحضير...</span>
              </>
            ) : speechStatus === 'playing' ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>تشغيل الصوت</span>
              </>
            )}
          </button>

          {/* Reset Speech */}
          {speechStatus !== 'idle' && (
            <button
              type="button"
              onClick={() => speechService.stop()}
              className="p-3 rounded-xl bg-[#0a1530] border border-blue-700/60 text-slate-300 hover:text-white transition-all"
              title="إيقاف"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Medication Details Card */}
      <div className="bg-[#0f1d3d] rounded-3xl border border-blue-900/60 p-5 sm:p-6 shadow-xl mb-6">
        {/* Medication Name Header */}
        <div className="border-b border-blue-900/60 pb-5 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0 shadow-md">
              <Pill className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold text-cyan-300 tracking-wide block mb-0.5">
                اسم الدواء
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {analysis.medicationName}
              </h3>
              {analysis.concentration && (
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-lg bg-blue-950 border border-blue-700/50 text-cyan-200 text-xs font-bold">
                  التركيز: {analysis.concentration}
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail preview with zoom */}
          {imageThumbnail && (
            <button
              type="button"
              onClick={() => setShowOriginalModal(true)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl bg-[#0a1329] border border-blue-800/60 hover:border-cyan-500/50 transition-all self-end sm:self-auto group"
              title="عرض ورقة الوصفة الأصلية"
            >
              <span className="text-xs font-semibold text-slate-300 group-hover:text-cyan-300">
                الوصفة الأصلية
              </span>
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-blue-700/60 shrink-0 bg-black">
                <img
                  src={imageThumbnail}
                  alt="مصغرة الوصفة"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
            </button>
          )}
        </div>

        {/* Prescription Parameters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Dosage */}
          <div className="bg-[#142347] p-3.5 rounded-2xl border border-blue-800/40">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold mb-1">
              <Pill className="w-4 h-4" />
              <span>الجرعة المكتوبة</span>
            </div>
            <p className={`font-black text-white ${textClass}`}>
              {analysis.dosage || 'المعلومة غير واضحة، يرجى التأكد من الطبيب أو الصيدلي'}
            </p>
          </div>

          {/* Frequency */}
          <div className="bg-[#142347] p-3.5 rounded-2xl border border-blue-800/40">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold mb-1">
              <Clock className="w-4 h-4" />
              <span>عدد مرات الاستخدام</span>
            </div>
            <p className={`font-black text-white ${textClass}`}>
              {analysis.frequency || 'المعلومة غير واضحة، يرجى التأكد من الطبيب أو الصيدلي'}
            </p>
          </div>

          {/* Timing */}
          <div className="bg-[#142347] p-3.5 rounded-2xl border border-blue-800/40">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold mb-1">
              <Clock className="w-4 h-4" />
              <span>توقيت الاستخدام</span>
            </div>
            <p className={`font-black text-white ${textClass}`}>
              {analysis.timing || 'المعلومة غير واضحة، يرجى التأكد من الطبيب أو الصيدلي'}
            </p>
          </div>

          {/* Duration */}
          <div className="bg-[#142347] p-3.5 rounded-2xl border border-blue-800/40">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold mb-1">
              <Calendar className="w-4 h-4" />
              <span>مدة العلاج</span>
            </div>
            <p className={`font-black text-white ${textClass}`}>
              {analysis.duration || 'المعلومة غير واضحة، يرجى التأكد من الطبيب أو الصيدلي'}
            </p>
          </div>
        </div>

        {/* Doctor's Written Instructions (if provided) */}
        {analysis.doctorInstructions && (
          <div className="mb-6 p-4 rounded-2xl bg-[#122040] border border-blue-800/50">
            <h4 className="text-xs font-bold text-cyan-300 mb-1">
              تعليمات إضافية من الطبيب:
            </h4>
            <p className={`text-slate-200 font-semibold ${textClass}`}>
              {analysis.doctorInstructions}
            </p>
          </div>
        )}

        {/* Section: Simplified Explanation for Seniors */}
        <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-[#102452] to-[#121f42] border-2 border-cyan-500/40 shadow-inner">
          <div className="flex items-center gap-2.5 text-cyan-300 font-black text-base sm:text-lg mb-2">
            <CheckCircle2 className="w-6 h-6 text-cyan-400 shrink-0" />
            <span>شرح مبسط لكبار السن وللمريض</span>
          </div>
          <p
            className={`text-slate-100 font-medium ${textClass} leading-relaxed bg-[#0b1735]/60 p-4 rounded-xl border border-blue-800/40`}
          >
            {analysis.simplifiedExplanation}
          </p>
        </div>

        {/* Section: Important Warnings */}
        {analysis.importantWarnings && analysis.importantWarnings.length > 0 && (
          <div className="mb-5 p-5 rounded-2xl bg-amber-950/20 border border-amber-600/40">
            <div className="flex items-center gap-2 text-amber-300 font-black text-base mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>تنبيهات مهمة</span>
            </div>
            <ul className="space-y-2.5">
              {analysis.importantWarnings.map((warn, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-slate-200 text-xs sm:text-sm font-semibold leading-relaxed"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0" />
                  <span>{warn}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Additional Medications in Prescription (if any) */}
        {analysis.allMedications && analysis.allMedications.length > 1 && (
          <div className="mt-6 pt-5 border-t border-blue-900/60">
            <h4 className="text-sm font-bold text-cyan-300 mb-3 flex items-center gap-2">
              <Pill className="w-4 h-4" />
              أدوية أخرى مذكورة في نفس الوصفة ({analysis.allMedications.length - 1}):
            </h4>
            <div className="space-y-2">
              {analysis.allMedications.slice(1).map((med, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#142347] border border-blue-800/50 flex items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-bold text-white text-sm block">
                      {med.name} {med.concentration ? `(${med.concentration})` : ''}
                    </span>
                    <span className="text-xs text-slate-300">
                      الجرعة: {med.dosage || 'غير محددة'} • {med.frequency || ''} •{' '}
                      {med.timing || ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Daily Reminder Button */}
        <div className="mt-5 pt-4 border-t border-blue-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCreateReminder}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-[#14244c] hover:bg-[#1a2e60] border border-cyan-500/40 text-cyan-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
          >
            <BellPlus className="w-4 h-4 text-cyan-400" />
            <span>إضافة تذكير يومي لموعد هذا الدواء</span>
          </button>

          {addedReminderMessage && (
            <span className="text-xs font-bold text-emerald-400 animate-fade-in">
              ✓ تم إضافة التذكير إلى قائمة «أوقات علاجي» بنجاح!
            </span>
          )}
        </div>
      </div>

      {/* Navigation Buttons: Big, Clear, High-Contrast */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Return to Home */}
        <button
          type="button"
          onClick={onGoHome}
          className="flex-1 py-4 px-5 rounded-2xl bg-[#142347] hover:bg-[#1b2e5c] border border-blue-700/60 text-slate-200 font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Home className="w-5 h-5 text-cyan-400" />
          <span>العودة للرئيسية</span>
        </button>

        {/* Analyze Another Prescription */}
        <button
          type="button"
          onClick={onNewScan}
          className="flex-[1.4] py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-lg flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/20 transition-all active:scale-[0.98]"
        >
          <Camera className="w-6 h-6 text-slate-950" />
          <span>تحليل وصفة أخرى</span>
        </button>
      </div>

      {/* Modal for full original prescription inspection */}
      {showOriginalModal && imageThumbnail && (
        <div className="fixed inset-0 z-50 bg-black/90 p-4 flex flex-col justify-center items-center">
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-3xl overflow-hidden border border-cyan-500/40 p-2 shadow-2xl">
            <div className="flex justify-between items-center p-3 text-white border-b border-slate-800">
              <span className="font-bold text-sm text-cyan-300">
                صورة الوصفة الطبية الأصلية
              </span>
              <button
                type="button"
                onClick={() => setShowOriginalModal(false)}
                className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-bold hover:bg-slate-700 text-white"
              >
                إغلاق (✕)
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto p-2 flex items-center justify-center">
              <img
                src={imageThumbnail}
                alt="الوصفة الأصلية"
                className="max-h-[70vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
