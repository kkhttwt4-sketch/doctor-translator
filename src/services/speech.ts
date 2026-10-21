import { requestArabicSpeech } from './api';

export type SpeechStatus = 'idle' | 'loading' | 'playing' | 'paused';

class SpeechManager {
  private audioPlayer: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isUsingNativeTTS = false;
  private onStatusChangeCallback: ((status: SpeechStatus) => void) | null = null;
  private speechRate = 0.9; // Slightly slower, clear pace ideal for elderly

  public setStatusListener(cb: (status: SpeechStatus) => void) {
    this.onStatusChangeCallback = cb;
  }

  public setRate(rate: number) {
    this.speechRate = rate;
    if (this.audioPlayer) {
      this.audioPlayer.playbackRate = rate;
    }
  }

  private updateStatus(status: SpeechStatus) {
    if (this.onStatusChangeCallback) {
      this.onStatusChangeCallback(status);
    }
  }

  public async speakText(text: string): Promise<void> {
    this.stop();
    this.updateStatus('loading');

    // 1. Try server-side Gemini TTS first
    try {
      const serverRes = await requestArabicSpeech(text);
      if (serverRes.success && serverRes.audioBase64) {
        const audioSrc = `data:${serverRes.mimeType || 'audio/wav'};base64,${serverRes.audioBase64}`;
        this.audioPlayer = new Audio(audioSrc);
        this.audioPlayer.playbackRate = this.speechRate;

        this.audioPlayer.onplay = () => this.updateStatus('playing');
        this.audioPlayer.onpause = () => this.updateStatus('paused');
        this.audioPlayer.onended = () => this.updateStatus('idle');
        this.audioPlayer.onerror = () => {
          console.warn('Audio element error, falling back to Web Speech API');
          this.fallbackToBrowserSpeech(text);
        };

        await this.audioPlayer.play();
        this.isUsingNativeTTS = false;
        return;
      }
    } catch (e) {
      console.warn('Server TTS failed, falling back to browser speech:', e);
    }

    // 2. Fallback to browser SpeechSynthesis
    this.fallbackToBrowserSpeech(text);
  }

  private fallbackToBrowserSpeech(text: string) {
    if (!('speechSynthesis' in window)) {
      this.updateStatus('idle');
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = this.speechRate;
    utterance.pitch = 1.0;

    // Try finding Arabic voice
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(
      (v) => v.lang.startsWith('ar') || v.name.toLowerCase().includes('arabic')
    );
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    utterance.onstart = () => this.updateStatus('playing');
    utterance.onpause = () => this.updateStatus('paused');
    utterance.onresume = () => this.updateStatus('playing');
    utterance.onend = () => this.updateStatus('idle');
    utterance.onerror = () => this.updateStatus('idle');

    this.currentUtterance = utterance;
    this.isUsingNativeTTS = true;
    window.speechSynthesis.speak(utterance);
  }

  public pause() {
    if (!this.isUsingNativeTTS && this.audioPlayer) {
      this.audioPlayer.pause();
      this.updateStatus('paused');
    } else if (this.isUsingNativeTTS && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
      this.updateStatus('paused');
    }
  }

  public resume() {
    if (!this.isUsingNativeTTS && this.audioPlayer) {
      this.audioPlayer.play();
      this.updateStatus('playing');
    } else if (this.isUsingNativeTTS && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      this.updateStatus('playing');
    }
  }

  public stop() {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer.currentTime = 0;
      this.audioPlayer = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.updateStatus('idle');
  }
}

export const speechService = new SpeechManager();
