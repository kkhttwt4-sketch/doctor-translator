import React, { useState, useEffect } from 'react';
import { Sparkles, FileSearch, ShieldCheck, HeartPulse } from 'lucide-react';

const STEPS = [
  { text: 'تم رفع الصورة بأمان وجارٍ فحصها...', icon: ShieldCheck },
  { text: 'قراءة خط الطبيب والتعرف على اسم الدواء والتركيز...', icon: FileSearch },
  { text: 'استخراج الجرعات ومواعيد الاستخدام بعناية...', icon: HeartPulse },
  { text: 'صياغة الشرح المبسط لكبار السن وتجهيز الصوت...', icon: Sparkles },
];

export const AnalysisLoading: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2400);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-md mx-auto px-6 py-12 text-center flex flex-col items-center">
      {/* Animated Pulse & Scanning Rings */}
      <div className="relative mb-8 flex items-center justify-center">
        <div className="w-28 h-28 rounded-full bg-cyan-500/10 border-2 border-cyan-400/40 animate-ping absolute" />
        <div className="w-24 h-24 rounded-full bg-blue-600/20 border border-blue-400/30 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <HeartPulse className="w-12 h-12 text-cyan-400 animate-pulse" />
        </div>
      </div>

      <h3 className="text-2xl font-black text-white mb-2">
        جارٍ تحليل الوصفة الطبية بدقة...
      </h3>
      <p className="text-slate-300 text-sm mb-8 leading-relaxed">
        الرجاء الانتظار بضع ثوانٍ بينما يقوم الذكاء الاصطناعي بقراءة الخط واستخراج تعليمات الطبيب
      </p>

      {/* Progress Steps */}
      <div className="w-full space-y-3 bg-[#0d1833] p-5 rounded-2xl border border-blue-900/60 text-right shadow-inner">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-500 ${
                isActive
                  ? 'bg-cyan-950/70 border border-cyan-500/50 text-cyan-200'
                  : isDone
                  ? 'text-emerald-400 opacity-90'
                  : 'text-slate-500 opacity-40'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 animate-bounce'
                    : isDone
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {isActive ? (
                  <Icon className="w-4 h-4" />
                ) : isDone ? (
                  <span className="text-xs font-bold">✓</span>
                ) : (
                  <span className="text-xs">{idx + 1}</span>
                )}
              </div>
              <span className="text-sm font-semibold flex-1 leading-snug">
                {step.text}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>جميع بياناتك وصورك مشفرة ومحمية بالكامل</span>
      </div>
    </div>
  );
};
