import { PrescriptionAnalysis } from '../types';

export interface AnalysisResponse {
  success: boolean;
  data?: PrescriptionAnalysis;
  error?: string;
}

export interface TTSResponse {
  success: boolean;
  audioBase64?: string;
  mimeType?: string;
  useClientFallback?: boolean;
  error?: string;
}

/**
 * Sends base64 prescription image to backend Gemini OCR analysis
 */
export async function analyzePrescriptionImage(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<AnalysisResponse> {
  try {
    const response = await fetch('/api/analyze-prescription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64,
        mimeType,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'تعذر تحليل الوصفة الطبية. يرجى التأكد من جودة الصورة والمحاولة مجدداً.',
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (err: any) {
    console.error('Fetch error during prescription analysis:', err);
    return {
      success: false,
      error:
        'حدث انقطاع في الاتصال بالخادم. يرجى التأكد من اتصال الإنترنت والمحاولة مرة أخرى.',
    };
  }
}

/**
 * Request server-side Gemini Arabic speech audio (WAV)
 */
export async function requestArabicSpeech(text: string): Promise<TTSResponse> {
  try {
    const response = await fetch('/api/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('Speech API request failed, fallback to browser synthesis:', err);
    return {
      success: false,
      useClientFallback: true,
    };
  }
}
