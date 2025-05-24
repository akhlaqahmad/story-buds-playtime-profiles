
export class AudioService {
  private static audioContext: AudioContext | null = null;
  private static soundEffects: { [key: string]: AudioBuffer } = {};

  static async initializeAudio() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  static async playTextToSpeech(text: string): Promise<void> {
    // Check if browser supports Speech Synthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice for child-friendly narration
      utterance.rate = 0.8; // Slightly slower for clarity
      utterance.pitch = 1.2; // Higher pitch for friendliness
      utterance.volume = 0.9;
      
      // Try to find a child-friendly voice
      const voices = speechSynthesis.getVoices();
      const preferredVoices = voices.filter(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Alex') || 
        voice.name.includes('Samantha') ||
        voice.lang.startsWith('en-')
      );
      
      if (preferredVoices.length > 0) {
        utterance.voice = preferredVoices[0];
      }

      return new Promise((resolve) => {
        utterance.onend = () => resolve();
        speechSynthesis.speak(utterance);
      });
    } else {
      throw new Error('Speech synthesis not supported');
    }
  }

  static async playSoundEffect(effectName: string): Promise<void> {
    await this.initializeAudio();
    
    if (!this.audioContext) return;

    // Generate simple sound effects using Web Audio API
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Configure different sounds
    switch (effectName) {
      case 'animal-moo':
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.5);
        break;
      case 'animal-woof':
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.2);
        break;
      case 'animal-meow':
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.3);
        break;
      case 'magic-sparkle':
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(2000, this.audioContext.currentTime + 0.2);
        break;
      case 'rocket-zoom':
        oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 1);
        break;
      default:
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
    }
    
    // Envelope for natural sound
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
  }

  static stopAllAudio() {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
  }
}
