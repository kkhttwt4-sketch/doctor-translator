import React, { useState } from 'react';
import {
  FileText,
  Trash2,
  ExternalLink,
  Search,
  PlusCircle,
  Calendar,
  Pill,
  Clock,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { SavedPrescription } from '../types';
import { deletePrescriptionFromStorage } from '../services/storage';

interface HistoryViewProps {
  prescriptions: SavedPrescription[];
  onSelectPrescription: (prescription: SavedPrescription) => void;
  onRefreshList: (updated: SavedPrescription[]) => void;
  onNewScan: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  prescriptions,
  onSelectPrescription,
  onRefreshList,
  onNewScan,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filtered = prescriptions.filter((item) =>
    (item.medicationName || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleDelete = (id: string) => {
    const updated = deletePrescriptionFromStorage(id);
    onRefreshList(updated);
    setDeleteConfirmId(null);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-black text-white">وصفاتي السابقة</h2>
          <p className="text-slate-300 text-sm">
            سجل الوصفات التي قمت بتحليلها مسبقاً للرجوع إليها في أي وقت
          </p>
        </div>

        <button
          type="button"
          onClick={onNewScan}
          className="self-start sm:self-auto py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>تحليل وصفة جديدة</span>
        </button>
      </div>

      {/* Search Input */}
      {prescriptions.length > 0 && (
        <div className="relative mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الدواء..."
            className="w-full py-3.5 pr-11 pl-4 rounded-2xl bg-[#0e1b38] border border-blue-800/60 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 text-sm font-medium shadow-inner"
          />
          <Search className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1"
            >
              مسح
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {prescriptions.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#0d1833] rounded-3xl border border-blue-900/60 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">لا توجد وصفات محفوظة بعد</h3>
          <p className="text-slate-300 text-sm max-w-sm mx-auto mb-6">
            عندما تقوم بتصوير وتحليل وصفتك الطبية، سيتم حفظ نتائجها هنا لتتمكن من الرجوع إليها والاستماع لشرحها في أي وقت.
          </p>
          <button
            type="button"
            onClick={onNewScan}
            className="py-3 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-base inline-flex items-center gap-2 shadow-lg hover:from-cyan-300 hover:to-blue-400"
          >
            <PlusCircle className="w-5 h-5" />
            بدء تحليل أول وصفة
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 px-4 bg-[#0d1833] rounded-2xl border border-blue-900/60">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
          <p className="text-white font-bold text-base mb-1">لم يتم العثور على نتائج</p>
          <p className="text-slate-400 text-xs">لا يوجد دواء يطابق: «{searchQuery}»</p>
        </div>
      ) : (
        /* Prescriptions List */
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#0f1e3f] border border-blue-800/60 hover:border-cyan-500/40 transition-all shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5 flex-1">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 border border-blue-700/60 shrink-0 relative">
                  {item.imageThumbnail ? (
                    <img
                      src={item.imageThumbnail}
                      alt={item.medicationName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-cyan-950 text-cyan-400">
                      <Pill className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.date}
                    </span>
                    {item.analysis.clarityStatus === 'clear' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-bold">
                        واضحة
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/30 font-bold">
                        تتطلب تأكيد الصيدلي
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors leading-tight mb-1">
                    {item.medicationName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-medium">
                    {item.analysis.dosage && (
                      <span className="bg-[#15274e] px-2 py-0.5 rounded-md border border-blue-800/40">
                        {item.analysis.dosage}
                      </span>
                    )}
                    {item.analysis.frequency && (
                      <span className="bg-[#15274e] px-2 py-0.5 rounded-md border border-blue-800/40">
                        {item.analysis.frequency}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-blue-900/40">
                {/* View Details */}
                <button
                  type="button"
                  onClick={() => onSelectPrescription(item)}
                  className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>عرض التفاصيل</span>
                </button>

                {/* Delete button or confirmation */}
                {deleteConfirmId === item.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all"
                    >
                      تأكيد الحذف
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="py-2.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(item.id)}
                    className="p-2.5 rounded-xl bg-[#142347] border border-blue-800/50 text-slate-400 hover:text-red-400 hover:border-red-500/40 transition-all"
                    title="حذف الوصفة"
                    aria-label="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Medical Privacy Note */}
      <div className="mt-8 p-4 rounded-2xl bg-[#0a1329] border border-blue-900/40 text-center flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>جميع الوصفات والمعلومات محفوظة بأمان وخصوصية تامة على جهازك فقط.</span>
      </div>
    </div>
  );
};
