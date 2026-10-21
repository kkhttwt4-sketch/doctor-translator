import React, { useState } from 'react';
import {
  Clock,
  Sun,
  Sunset,
  Moon,
  Coffee,
  CheckCircle2,
  Trash2,
  Plus,
  Volume2,
  Bell,
  Sparkles,
} from 'lucide-react';
import { MedicationReminder } from '../types';
import { deleteReminder, addReminder } from '../services/storage';
import { speechService } from '../services/speech';

interface ScheduleViewProps {
  reminders: MedicationReminder[];
  onRefreshReminders: (updated: MedicationReminder[]) => void;
  onNewScan: () => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  reminders,
  onRefreshReminders,
  onNewScan,
}) => {
  const [takenIds, setTakenIds] = useState<Record<string, boolean>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newDose, setNewDose] = useState('قرص واحد');
  const [newSlot, setNewSlot] = useState<'morning' | 'noon' | 'evening' | 'bedtime'>('morning');
  const [newTimeLabel, setNewTimeLabel] = useState('٨:٠٠ صباحاً (بعد الإفطار)');

  const toggleTaken = (id: string) => {
    setTakenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDeleteReminder = (id: string) => {
    const updated = deleteReminder(id);
    onRefreshReminders(updated);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const added = addReminder({
      prescriptionId: 'manual',
      medicationName: newMedName.trim(),
      dosage: newDose,
      timeSlot: newSlot,
      timeLabel: newTimeLabel,
      frequency: 'يومياً',
    });

    onRefreshReminders([...reminders, added]);
    setNewMedName('');
    setShowAddForm(false);
  };

  const handleSpeakSchedule = () => {
    if (reminders.length === 0) {
      speechService.speakText('لا توجد مواعيد علاج مضافة حالياً.');
      return;
    }
    const text =
      'جدول أدويتك اليومي: ' +
      reminders
        .map((r) => `موعد ${r.timeLabel}: دواء ${r.medicationName}، الجرعة ${r.dosage}.`)
        .join(' ');
    speechService.speakText(text);
  };

  const slots = [
    { key: 'morning', label: 'الصباح (الإفطار)', icon: Sun, color: 'text-amber-400' },
    { key: 'noon', label: 'الظهر (الغداء)', icon: Coffee, color: 'text-yellow-400' },
    { key: 'evening', label: 'المساء (العشاء)', icon: Sunset, color: 'text-orange-400' },
    { key: 'bedtime', label: 'قبل النوم', icon: Moon, color: 'text-indigo-400' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Title & Speech Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-black text-white">أوقات علاجي اليومية</h2>
          <p className="text-slate-300 text-sm">
            تنظيم مواعيد تناول أدويتك بسهولة لتفادي نسيان أي جرعة
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSpeakSchedule}
            className="py-2 px-3 rounded-xl bg-[#142347] border border-blue-700/60 text-cyan-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
          >
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>قراءة الجدول</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md hover:from-cyan-300 hover:to-blue-400 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة موعد</span>
          </button>
        </div>
      </div>

      {/* Manual Add Form (Collapsible) */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="p-5 rounded-2xl bg-[#0f1d3c] border-2 border-cyan-500/40 mb-6 shadow-xl space-y-4"
        >
          <h3 className="font-bold text-white text-base">إضافة دواء جديد إلى الجدول</h3>

          <div>
            <label className="block text-xs font-semibold text-cyan-200 mb-1">
              اسم الدواء:
            </label>
            <input
              type="text"
              required
              value={newMedName}
              onChange={(e) => setNewMedName(e.target.value)}
              placeholder="مثال: كونكور، أو فيتامين د"
              className="w-full py-2.5 px-3 rounded-xl bg-[#081024] border border-blue-800 text-white text-sm focus:border-cyan-400 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-cyan-200 mb-1">
                الجرعة:
              </label>
              <input
                type="text"
                value={newDose}
                onChange={(e) => setNewDose(e.target.value)}
                placeholder="قرص واحد، ملعقة..."
                className="w-full py-2.5 px-3 rounded-xl bg-[#081024] border border-blue-800 text-white text-sm focus:border-cyan-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-cyan-200 mb-1">
                الفترة اليومية:
              </label>
              <select
                value={newSlot}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setNewSlot(val);
                  if (val === 'morning') setNewTimeLabel('٨:٠٠ صباحاً (بعد الإفطار)');
                  if (val === 'noon') setNewTimeLabel('٢:٠٠ ظهراً (بعد الغداء)');
                  if (val === 'evening') setNewTimeLabel('٨:٠٠ مساءً (بعد العشاء)');
                  if (val === 'bedtime') setNewTimeLabel('١٠:٣٠ مساءً (قبل النوم)');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#081024] border border-blue-800 text-white text-sm focus:border-cyan-400 outline-none"
              >
                <option value="morning">الصباح (الإفطار)</option>
                <option value="noon">الظهر (الغداء)</option>
                <option value="evening">المساء (العشاء)</option>
                <option value="bedtime">قبل النوم</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300"
            >
              حفظ الموعد
            </button>
          </div>
        </form>
      )}

      {/* Slots List */}
      <div className="space-y-5">
        {slots.map((slot) => {
          const slotReminders = reminders.filter((r) => r.timeSlot === slot.key);
          const Icon = slot.icon;

          return (
            <div
              key={slot.key}
              className="bg-[#0f1d3c] rounded-2xl border border-blue-900/60 overflow-hidden shadow-lg"
            >
              {/* Slot Header */}
              <div className="p-4 bg-[#142347] border-b border-blue-900/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-5 h-5 ${slot.color}`} />
                  <span className="font-bold text-white text-base">{slot.label}</span>
                </div>
                <span className="text-xs text-cyan-300 font-semibold bg-[#0a1329] px-2.5 py-1 rounded-lg border border-blue-800/40">
                  {slotReminders.length} جرعات
                </span>
              </div>

              {/* Slot Items */}
              <div className="p-4 space-y-3">
                {slotReminders.length === 0 ? (
                  <p className="text-xs text-slate-500 py-1">لا توجد أدوية مخصصة لهذا الوقت.</p>
                ) : (
                  slotReminders.map((rem) => {
                    const isTaken = Boolean(takenIds[rem.id]);

                    return (
                      <div
                        key={rem.id}
                        className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isTaken
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200 opacity-80'
                            : 'bg-[#122040] border-blue-800/60 text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleTaken(rem.id)}
                            className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                              isTaken
                                ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                : 'border-slate-500 hover:border-cyan-400'
                            }`}
                            aria-label="تحديد كتم التناول"
                          >
                            {isTaken && <CheckCircle2 className="w-5 h-5" />}
                          </button>

                          <div>
                            <span
                              className={`font-black text-sm block ${
                                isTaken ? 'line-through text-slate-400' : 'text-white'
                              }`}
                            >
                              {rem.medicationName}
                            </span>
                            <span className="text-xs text-cyan-300 font-medium">
                              الجرعة: {rem.dosage} • {rem.timeLabel}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteReminder(rem.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-all"
                          title="حذف هذا الموعد"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
