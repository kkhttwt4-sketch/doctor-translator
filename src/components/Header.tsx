import React from 'react';
import { Stethoscope, ShieldAlert, Download, Type, Volume2, Info } from 'lucide-react';
import { FontSizeOption } from '../services/storage';

interface HeaderProps {
  fontSize: FontSizeOption;
  onChangeFontSize: (size: FontSizeOption) => void;
  onOpenDisclaimer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  fontSize,
  onChangeFontSize,
  onOpenDisclaimer,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0a132c]/95 backdrop-blur-md border-b border-cyan-900/40 shadow-lg px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 ring-2 ring-cyan-400/30 shrink-0">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                ترجمان الطبيب
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-500/30">
                ذكي
              </span>
            </div>
            <p className="text-xs text-cyan-200/70 font-medium tracking-wide">
              Doctor Translator — لمساعدة المرضى وكبار السن
            </p>
          </div>
        </div>

        {/* Accessibility & Info Actions */}
        <div className="flex items-center gap-1.5">
          {/* Font Size Selector for Seniors */}
          <div className="flex items-center bg-[#132347] p-1 rounded-xl border border-blue-800/60">
            <button
              type="button"
              onClick={() => onChangeFontSize('normal')}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                fontSize === 'normal'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="خط عادي"
            >
              أ
            </button>
            <button
              type="button"
              onClick={() => onChangeFontSize('large')}
              className={`px-2 py-1 text-sm font-bold rounded-lg transition-all ${
                fontSize === 'large'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="خط كبير"
            >
              أ+
            </button>
            <button
              type="button"
              onClick={() => onChangeFontSize('xlarge')}
              className={`px-2 py-1 text-base font-extrabold rounded-lg transition-all ${
                fontSize === 'xlarge'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="خط كبير جداً"
            >
              أ++
            </button>
          </div>

          {/* Download ZIP Package for Render */}
          <a
            href="/doctor-translator-render.zip"
            download="doctor-translator-render.zip"
            className="p-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:from-cyan-300 hover:to-blue-400 transition-all flex items-center justify-center shrink-0 shadow-md"
            title="تنزيل ملف المشروع (ZIP) للنشر على Render"
            aria-label="تنزيل ZIP"
          >
            <Download className="w-5 h-5" />
          </a>

          {/* Medical Disclaimer Modal trigger */}
          <button
            type="button"
            onClick={onOpenDisclaimer}
            className="p-2 rounded-xl bg-[#132347] border border-blue-800/60 text-amber-300 hover:text-amber-200 hover:bg-blue-900/40 transition-all flex items-center justify-center shrink-0"
            title="إخلاء مسؤولية طبي وتعليمات"
            aria-label="تنبيه طبي"
          >
            <ShieldAlert className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
