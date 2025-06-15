
import { ElevenLabsAudioService } from './elevenLabsAudioService'
import { GoogleAudioService } from './googleAudioService'
import { supabase } from '@/integrations/supabase/client'

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
    console.log('🎵 Generating Google TTS audio...');
    
    try {
      console.log('📞 Calling Google TTS API...');
      const { data, error } = await supabase.functions.invoke('google-text-to-speech', {
        body: { 
          text: content,
          voiceName: 'en-US-Neural2-F', // Child-friendly female voice
          speakingRate: 0.9 
        }
      });

      if (error) {
        console.error('❌ Google TTS API Error:', error);
        throw error;
      }

      if (!data || !data.audioContent) {
        console.error('❌ No audio content received from Google TTS API');
        throw new Error('No audio content received from Google TTS');
      }

      console.log('🔄 Converting Google TTS audio data to blob...');
      // Convert base64 audio to blob and create object URL
      const audioBytes = atob(data.audioContent);
      const audioArray = new Uint8Array(audioBytes.length);
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i);
      }

      const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      console.log('✅ Google TTS audio URL created successfully');
      return audioUrl;
    } catch (error) {
      console.error('❌ Error in Google TTS audio generation:', error);
      throw error;
    }
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
