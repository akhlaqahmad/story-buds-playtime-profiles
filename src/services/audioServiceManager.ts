
import { ElevenLabsAudioService } from './elevenLabsAudioService'
import { GoogleAudioService } from './googleAudioService'

export class AudioServiceManager {
  static async generateStoryAudio(story: { id: string, content: string, audio_url?: string }): Promise<string> {
    console.log('🎵 AudioServiceManager: Starting story audio generation...');

    // Try ElevenLabs first
    try {
      console.log('🎵 Attempting ElevenLabs TTS...');
      return await ElevenLabsAudioService.getOrCreateCachedStoryAudio(story);
    } catch (elevenLabsError: any) {
      console.warn('⚠️ ElevenLabs failed, falling back to Google TTS:', elevenLabsError.message);
      
      // Fallback to Google TTS
      try {
        console.log('🎵 Attempting Google TTS fallback...');
        return await this.generateGoogleTTSAudio(story.content);
      } catch (googleError: any) {
        console.error('❌ Both ElevenLabs and Google TTS failed');
        throw new Error(`Audio generation failed: ElevenLabs (${elevenLabsError.message}), Google (${googleError.message})`);
      }
    }
  }

  private static async generateGoogleTTSAudio(content: string): Promise<string> {
    // For now, we'll use Google's direct playback since it doesn't have caching
    // This creates a temporary object URL for immediate playback
    console.log('🎵 Generating Google TTS audio...');
    
    // Note: Google TTS service currently doesn't return a URL but plays directly
    // We'll need to modify it to return an audio URL instead
    throw new Error('Google TTS fallback not yet implemented for URL generation');
  }

  static async playTextToSpeech(text: string): Promise<void> {
    try {
      console.log('🎵 Playing text with ElevenLabs...');
      await ElevenLabsAudioService.playTextToSpeech(text);
    } catch (error: any) {
      console.warn('⚠️ ElevenLabs playback failed, using Google TTS:', error.message);
      await GoogleAudioService.playTextToSpeech(text);
    }
  }
}
