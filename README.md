# ترجمان الطبيب — Doctor Translator

تطبيق ذكي يساعد المرضى وكبار السن على قراءة وفهم الوصفات الطبية المكتوبة بخط اليد أو المصطلحات الطبية المعقدة، مع شرح مبسط باللغة العربية ودعم القراءة الصوتية (TTS)، ويعمل كتطبيق ويب تقدمي (PWA) قابل للإضافة إلى الشاشة الرئيسية على هواتف iPhone و Android.

---

## 🚀 طريقة النشر المجاني على Render.com

هذا المشروع مهيأ بالكامل بملف `render.yaml` ليعمل بنقرة واحدة كخدمة ويب مجانية (Free Web Service) تدعم الواجهة والخادم معاً.

### الخطوة 1: رفع المشروع إلى GitHub
1. فك ضغط هذا الملف على جهازك.
2. أنشئ مستودعاً جديداً (New Repository) في حسابك على [GitHub.com](https://github.com).
3. ارفع كافة الملفات إلى المستودع.

### الخطوة 2: إنشاء الخدمة على Render
1. ادخل إلى [Render.com](https://render.com) وسجل الدخول مجاناً بحساب GitHub.
2. اضغط على **New +** ثم اختر **Web Service**.
3. اختر مستودع `doctor-translator` الذي قمت برفعه.
4. سيقرأ Render الإعدادات تلقائياً من ملف `render.yaml`:
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

### الخطوة 3: إضافة مفتاح الذكاء الاصطناعي (أمان تام)
في إعدادات الخدمة على Render، أضف متغيراً بيئياً في قسم **Environment Variables**:
- **Key:** `GEMINI_API_KEY`
- **Value:** مفتاحك الخاص من [Google AI Studio](https://aistudio.google.com).

اضغط **Deploy Web Service**، وخلال دقيقة واحدة ستحصل على رابط HTTPS دائم ومجاني.

---

## 💻 التشغيل المحلي (Local Development)

```bash
# تثبيت الحزم
npm install

# إعداد مفتاح البيئة
cp .env.example .env
# ثم اكتب مفتاح GEMINI_API_KEY داخل ملف .env

# تشغيل الخادم والواجهة
npm run dev
```

افتح المتصفح على: `http://localhost:3000`

---

## 📱 التثبيت كـ PWA على iPhone

1. افتح رابط التطبيق المنشور في متصفح **Safari**.
2. اضغط على زر المشاركة (Share ⎋) في الأسفل.
3. اختر **«إضافة إلى الصفحة الرئيسية» (Add to Home Screen)** ثم اضغط **«إضافة»**.
