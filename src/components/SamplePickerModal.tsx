import React from 'react';
import { SAMPLE_PRESCRIPTIONS, SamplePrescriptionItem } from '../data/samplePrescriptions';
import { Sparkles, X, Stethoscope, ChevronLeft } from 'lucide-react';

interface SamplePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: SamplePrescriptionItem) => void;
}

export const SamplePickerModal: React.FC<SamplePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0e1b38] border-2 border-cyan-500/50 rounded-3xl max-w-lg w-full p-6 text-right shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">اختر وصفة طبية تجريبية</h3>
            <p className="text-xs text-cyan-300">
              لتجربة قراءة الوصفات وشرحها الصوتي دون الحاجة لتصوير ورقة الآن
            </p>
          </div>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {SAMPLE_PRESCRIPTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectSample(item);
                onClose();
              }}
              className="w-full text-right p-3.5 rounded-2xl bg-[#142347] hover:bg-[#1b2f5e] border border-blue-800/60 hover:border-cyan-400/60 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-blue-700/60 shrink-0 bg-white">
                  <img
                    src={item.imageDataUri}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-cyan-400 block mb-0.5">
                    {item.category}
                  </span>
                  <h4 className="font-black text-white text-sm group-hover:text-cyan-200 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    {item.doctorName} • {item.clinic}
                  </p>
                </div>
              </div>

              <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 group-hover:-translate-x-1 transition-all shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
