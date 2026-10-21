import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// High payload limit for high-resolution prescription images (up to 30mb)
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Helper to get GoogleGenAI client safely
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: 'ok',
    hasGeminiKey: hasKey,
    time: new Date().toISOString(),
  });
});

// Analyze Prescription API
app.post('/api/analyze-prescription', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        error: 'لم يتم استلام أي صورة. يرجى التقاط أو اختيار صورة الوصفة الطبية.',
      });
    }

    const ai = getGenAIClient();
    if (!ai) {
      return res.status(500).json({
        error: 'مفتاح الذكاء الاصطناعي (GEMINI_API_KEY) غير مهيأ في الخادم.',
      });
    }

    // Clean base64 string if it contains data URI prefix
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

    const systemInstruction = `
أنت "ترجمان الطبيب" (Doctor Translator)، مساعد طبي ذكي ودقيق جداً وموجه خصيصاً لمساعدة المرضى وكبار السن في قراءة وشرح الروشتات والوصفات الطبية المكتوبة بخط اليد أو المطبوعة باللغتين العربية والإنجليزية.

قواعد الأمان والمسؤولية الطبية القصوى:
1. سلامة المريض أولاً: يمنع منعاً باتاً اختراع جرعة أو تخمين اسم دواء غير مؤكد أو تقديم أي تشخيص بديل.
2. إذا كان أي حقل (اسم الدواء، التركيز، الجرعة، التوقيت، أو المدة) غير واضح أو غير مقروء بسبب سوء خط الطبيب، يجب كتابة العبارة التالية بدقة في ذلك الحقل:
"المعلومة غير واضحة، يرجى التأكد من الطبيب أو الصيدلي"
3. الشرح المبسط لكبار السن: اشرح بلغة عربية فصحى مبسطة وواضحة جداً وبكلمات هادئة تشرح وظيفة الدواء الأساسية (مثلاً: دواء لخفض ضغط الدم المرتفع وحماية القلب) وكيف يؤخذ بأمان.
4. التنبيهات المهمة: اذكر التنبيهات الموثوقة فقط والضرورية (مثل: يؤخذ مع كوب ماء وفير، لا تتوقف عن تناوله فجأة، تجنب قيادة السيارة في حال حدوث دوخة، التخزين بعيداً عن الحرارة ورطوبة الحمام).
5. إخلاء مسؤولية دائم: هذا التحليل استرشادي لمساعدتك على فهم الخط، ويجب مراجعة الصيدلي عند استلام الدواء.
`.trim();

    const promptText = `
يرجى قراءة هذه الوصفة الطبية بعناية واستخراج جميع الأدوية المذكورة فيها.
إذا كانت الوصفة تحتوي على أكثر من دواء، استخرج قائمة الأدوية، مع إبراز الدواء الرئيسي الأول بكل تفاصيله.
تأكد من تطبيق قاعدة الأمان: أي معلومة غير مقروءة بوضوح لا تخمنها واكتب: "المعلومة غير واضحة، يرجى التأكد من الطبيب أو الصيدلي".
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        systemInstruction,
        temperature: 0.1, // Low temperature for high OCR accuracy and strictly factual response
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            medicationName: {
              type: Type.STRING,
              description: 'اسم الدواء التجاري والعلمي كما يظهر في الوصفة',
            },
            concentration: {
              type: Type.STRING,
              description: 'تركيز الدواء (مثل 500 ملغ، 10 مغ)',
            },
            dosage: {
              type: Type.STRING,
              description: 'الجرعة المكتوبة كما كتبها الطبيب (قرص واحد، ملعقة، كبسولة)',
            },
            frequency: {
              type: Type.STRING,
              description: 'عدد مرات الاستخدام في اليوم (مرة يومياً، مرتين...)',
            },
            timing: {
              type: Type.STRING,
              description: 'توقيت الاستخدام (قبل الأكل، بعد الإفطار، قبل النوم...)',
            },
            duration: {
              type: Type.STRING,
              description: 'مدة العلاج (لمدة 5 أيام، حتى انتهاء العبوة، علاج دائم...)',
            },
            doctorInstructions: {
              type: Type.STRING,
              description: 'أي تعليمات أو ملاحظات خاصة كتبها الطبيب',
            },
            simplifiedExplanation: {
              type: Type.STRING,
              description: 'شرح مبسط وسهل لكبار السن باللغة العربية يشرح وظيفة الدواء وكيف يؤخذ',
            },
            importantWarnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'قائمة بأهم التنبيهات الموثوقة للمريض',
            },
            clarityStatus: {
              type: Type.STRING,
              description: 'مستوى وضوح الوصفة: واضحة (clear)، واضحة جزئياً (partially_clear)، غير واضحة (unclear)',
            },
            unclearNotice: {
              type: Type.STRING,
              description: 'تنبيه خاص بالمعلومات غير المقروءة أو توجيه للمستخدم لمراجعة الصيدلي',
            },
            allMedications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  concentration: { type: Type.STRING },
                  dosage: { type: Type.STRING },
                  frequency: { type: Type.STRING },
                  timing: { type: Type.STRING },
                  instructions: { type: Type.STRING },
                },
              },
              description: 'قائمة بجميع الأدوية الموجودة في الوصفة إن كانت تتضمن أكثر من دواء',
            },
          },
          required: [
            'medicationName',
            'concentration',
            'dosage',
            'frequency',
            'timing',
            'duration',
            'simplifiedExplanation',
            'importantWarnings',
            'clarityStatus',
          ],
        },
      },
    });

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText.trim());
    } catch {
      return res.status(500).json({
        error: 'تعذر معالجة نتيجة التحليل بتنسيق سليم. يرجى إعادة المحاولة بصورة أوضح.',
      });
    }

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Prescription Analysis Error:', error);
    return res.status(500).json({
      error: error?.message || 'حدث خطأ غير متوقع أثناء تحليل الوصفة الطبية.',
    });
  }
});

// High quality Arabic Text-to-Speech API
app.post('/api/text-to-speech', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'النص المطلوب قراءته غير موجود.' });
    }

    const ai = getGenAIClient();
    if (!ai) {
      return res.status(503).json({
        error: 'خدمة الصوت عالية الجودة غير متاحة حالياً.',
        useClientFallback: true,
      });
    }

    // Limit text to avoid overly long audio buffer
    const sanitizedText = text.slice(0, 1000);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `تحدث بصوت عربي هادئ وواضح ولطيف لكبار السن: ${sanitizedText}`,
              speechMetadata: {
                style: 'Gentle, clear Arabic voice suitable for healthcare and elderly patients',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(502).json({
        error: 'لم يتمكن النموذج من توليد الصوت.',
        useClientFallback: true,
      });
    }

    return res.json({
      success: true,
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: any) {
    console.warn('TTS error (falling back to client synthesis):', error?.message);
    return res.status(200).json({
      success: false,
      useClientFallback: true,
      error: error?.message,
    });
  }
});

// Serve public assets (manifest.json, sw.js, icons)
app.use((req, res, next) => {
  if (req.path === '/sw.js') {
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  next();
});
app.use(express.static(path.resolve(__dirname, 'public')));

// Vite dev server mounting or static production build serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const httpServer = http.createServer(app);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ترجمان الطبيب server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
