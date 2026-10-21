import React from 'react';
import { ShieldAlert, CheckCircle2, HeartHandshake, X } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0e1b38] border-2 border-cyan-500/50 rounded-3xl max-w-lg w-full p-6 text-right shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">إخلاء مسؤولية طبي وإرشادات</h3>
            <p className="text-xs text-cyan-300">ترجمان الطبيب — Doctor Translator</p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              <strong>مساعد استرشادي:</strong> هذا التطبيق مبني بالذكاء الاصطناعي للمساعدة في قراءة وتوضيح خط اليد والمصطلحات الصعبة، وهو <span className="text-amber-300 font-bold">ليس بديلاً إطلاقاً</span> عن استشارة الطبيب المعالج أو الصيدلي المرخص.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              <strong>عدم تخمين الجرعات:</strong> نحن نتبع معايير أمان صارمة؛ أي معلومة غير واضحة في الوصفة نقوم بتمييزها صراحة ولا نقوم بتخمينها، لتجنب أي خطر دوائي.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <p>
              <strong>خصوصية بياناتك:</strong> صور الوصفات الطبية وبياناتك لا تُشارك مع أي طرف ثالث ويتم معالجتها بأمان تام لحمايتك.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-start gap-2.5">
            <HeartHandshake className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              <strong>نصيحة لصحتك:</strong> عند استلام الدواء من الصيدلية، اطلب من الصيدلي كتابة الجرعة على العلبة بخط كبير وواضح وراجعها معه.
            </p>
          </div>
        </div>

        {/* Export / Download Project ZIP */}
        <div className="mt-4 pt-3 border-t border-blue-900/40 flex items-center justify-between">
          <span className="text-xs text-slate-400">ملفات المشروع الجاهزة لـ Render:</span>
          <a
            href="/doctor-translator-render.zip"
            download="doctor-translator-render.zip"
            className="py-1.5 px-3 rounded-xl bg-[#142347] border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>⬇ تنزيل ZIP للنشر</span>
          </a>
        </div>

        <div className="mt-6 pt-4 border-t border-blue-900/60">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm shadow-lg transition-all"
          >
            فهمت وموافق، تابع
          </button>
        </div>
      </div>
    </div>
  );
};
