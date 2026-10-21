import React from 'react';
import { ArrowRight, RotateCcw, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImagePreviewConfirmProps {
  imageSrc: string;
  onRetake: () => void;
  onConfirm: () => void;
}

export const ImagePreviewConfirm: React.FC<ImagePreviewConfirmProps> = ({
  imageSrc,
  onRetake,
  onConfirm,
}) => {
  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      {/* Title */}
      <div className="text-center mb-5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold mb-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          الخطوة ١ من ٢: معاينة الصورة
        </span>
        <h2 className="text-2xl font-black text-white mb-1">
          تأكد من وضوح الوصفة الطبية
        </h2>
        <p className="text-slate-300 text-sm">
          تأكد أن خط الطبيب أو اسم الدواء ظاهر بوضوح ودون اهتزاز قبل بدء التحليل
        </p>
      </div>

      {/* Image Preview Box */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/50 bg-[#0d1730] shadow-2xl mb-5 max-h-[58vh] flex items-center justify-center">
        <img
          src={imageSrc}
          alt="معاينة الوصفة الطبية"
          className="w-full h-full object-contain max-h-[55vh]"
        />

        {/* Tip overlay at bottom */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent p-3 text-center">
          <p className="text-xs text-cyan-200 font-medium flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            نصيحة: إذا كانت هناك كلمة باهتة يمكنك إعادة التصوير بإضاءة أقوى
          </p>
        </div>
      </div>

      {/* Action Buttons: Big & Friendly */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Retake Button */}
        <button
          type="button"
          onClick={onRetake}
          className="flex-1 py-4 px-5 rounded-2xl bg-[#142347] hover:bg-[#1a2e5c] border border-blue-700/60 text-slate-200 font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <RotateCcw className="w-5 h-5 text-cyan-400" />
          إعادة التصوير
        </button>

        {/* Confirm & Start Analysis Button */}
        <button
          type="button"
          onClick={onConfirm}
          className="flex-[1.5] py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-lg flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/20 transition-all active:scale-[0.98]"
        >
          <Sparkles className="w-6 h-6 text-slate-950 fill-current" />
          نعم، ابدأ تحليل الوصفة
        </button>
      </div>
    </div>
  );
};
