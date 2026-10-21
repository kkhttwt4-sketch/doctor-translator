# حزمة مشروع Doctor Translator — ترجمان الطبيب للنشر على Render

تم تجهيز هذا المشروع ليتم نشره كخدمة ويب كاملة (Full-Stack Web Service) مجاناً على منصة Render.

## 📁 محتويات الحزمة المضغوطة (doctor-translator-render.zip)
- `server.ts`: خادم Express متكامل يستمع للمنفذ `PORT` ديناميكياً ويرتبط بـ `0.0.0.0`.
- `render.yaml`: ملف التهيئة التلقائية لمنصة Render (Blueprint).
- `package.json`: يحتوي على كافة الاعتماديات بما فيها `tsx` في قسم الإنتاج.
- `index.html` & `src/`: واجهة التطبيق المتكاملة (React + TypeScript + Tailwind CSS).
- `public/`: أيقونات الـ PWA للآيفون والأندرويد وملفات `manifest.json` و `sw.js`.
- `.env.example`: نموذج للمتغير البيئي المطلوب `GEMINI_API_KEY`.
- `README.md`: إرشادات التشغيل المحلي والنشر.

## ⚙️ أوامر البناء والتشغيل
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Port:** يستمع تلقائياً لمنفذ البيئة `process.env.PORT`
- **API Key:** يتم قراءته من `process.env.GEMINI_API_KEY` دون كشفه في الواجهة

## 🚀 خطوات النشر على Render
1. فك ضغط ملف `doctor-translator-render.zip`.
2. ارفع الملفات إلى مستودع جديد في حسابك على GitHub.
3. ادخل إلى Render.com واختر **New Web Service** واربط المستودع.
4. أضف المتغير البيئي `GEMINI_API_KEY` بقيمة مفتاحك المجاني من Google AI Studio.
5. اضغط **Deploy** وستحصل على رابط HTTPS ثابت يعمل على الآيفون كـ PWA.
