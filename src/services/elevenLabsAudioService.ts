
import { supabase } from '@/integrations/supabase/client'
import { StoryDbService } from './storyDbService'

export class ElevenLabsAudioService {
  private static currentAudio: HTMLAudioElement | null = null

  // Given a story object (with id/audio_url/content), return a public audio URL, generating/uploading if missing.
  static async getOrCreateCachedStoryAudio(story: { id: string, content: string, audio_url?: string }) : Promise<string> {
    // If the story already has audio_url, validate and return it.
    if (story.audio_url) {
      console.log('🎵 Using existing audio URL:', story.audio_url);
      
      // Quick validation - check if URL is accessible
      try {
        const response = await fetch(story.audio_url, { method: 'HEAD' });
        if (response.ok) {
          return story.audio_url;
        } else {
          console.warn('⚠️ Existing audio URL not accessible, regenerating...');
        }
      } catch (error) {
        console.warn('⚠️ Error checking existing audio URL, regenerating...', error);
      }
    }

    console.log('🎵 Generating new audio for story:', story.id);
    
    // 1. Generate audio via ElevenLabs (using existing code)
    const audioUrl = await this.generateFullStoryAudio(story.content);

    // 2. Download the audio blob from the returned URL (objectURL) to upload to Supabase Storage
    const blob = await fetch(audioUrl).then(r => r.blob());

    // 3. Upload audio to Supabase Storage under bucket 'story-audio', key: story-[id].mp3
    const filePath = `story-${story.id}.mp3`;
    console.log('📤 Uploading audio to Supabase Storage:', filePath);
    
    const { data, error } = await supabase.storage
      .from('story-audio')
      .upload(filePath, blob, { upsert: true, contentType: 'audio/mpeg' });

    if (error) {
      console.error('❌ Failed to upload story audio to Supabase:', error);
      throw error;
    }

    console.log('✅ Audio uploaded successfully:', data);

    // 4. Get public URL to the uploaded audio file
    const { data: publicUrl } = supabase.storage.from('story-audio').getPublicUrl(filePath);

    if (!publicUrl?.publicUrl) {
      throw new Error('Failed to obtain a public audio URL');
    }

    console.log('🔗 Public audio URL created:', publicUrl.publicUrl);

    // 5. Save audio_url into the story record
    await StoryDbService.updateStoryAudioUrl(story.id, publicUrl.publicUrl);

    // 6. Clean up the temporary object URL
    URL.revokeObjectURL(audioUrl);

    // 7. Return the supabase file's public URL
    return publicUrl.publicUrl;
  }

  static async playTextToSpeech(text: string): Promise<void> {
    console.log('🎵 Starting ElevenLabs TTS for text:', text.substring(0, 50) + '...')
    
    try {
      console.log('📞 Calling ElevenLabs TTS API...')
      const { data, error } = await supabase.functions.invoke('elevenlabs-text-to-speech', {
        body: { 
          text,
          voice_id: 'XB0fDUnXU5powFXDhCwa', // Charlotte - child-friendly female voice
          model_id: 'eleven_turbo_v2_5' // Fast, high-quality model
        }
      })

      console.log('📞 ElevenLabs TTS API Response:', { data: !!data, error })

      if (error) {
        console.error('❌ ElevenLabs TTS API Error:', error)
        throw error
      }

      if (!data || !data.audioContent) {
        console.error('❌ No audio content received from ElevenLabs TTS API')
        throw new Error('No audio content received')
      }

      console.log('🔄 Converting audio data to blob...')
      // Convert base64 audio to blob and play
      const audioBytes = atob(data.audioContent)
      const audioArray = new Uint8Array(audioBytes.length)
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i)
      }

      const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      
      console.log('🔇 Stopping any current audio...')
      // Stop any currently playing audio
      if (this.currentAudio) {
        this.currentAudio.pause()
        this.currentAudio = null
      }

      console.log('🎵 Creating and playing audio element...')
      const audio = new Audio(audioUrl)
      this.currentAudio = audio
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          console.log('✅ Audio playback completed')
          URL.revokeObjectURL(audioUrl)
          this.currentAudio = null
          resolve()
        }
        audio.onerror = (error) => {
          console.error('❌ Audio playback error:', error)
          URL.revokeObjectURL(audioUrl)
          this.currentAudio = null
          reject(error)
        }
        audio.onloadstart = () => console.log('🔄 Audio loading started')
        audio.oncanplay = () => console.log('✅ Audio can play')
        audio.onplay = () => console.log('▶️ Audio started playing')
        
        console.log('🎵 Starting audio play...')
        audio.play().catch(error => {
          console.error('❌ Failed to start audio playback:', error)
          reject(error)
        })
      })
    } catch (error) {
      console.error('❌ Error in ElevenLabs playTextToSpeech:', error)
      throw error
    }
  }

  static async generateFullStoryAudio(fullText: string): Promise<string> {
    console.log('🎵 Starting ElevenLabs TTS for full story:', fullText.substring(0, 100) + '...');

    try {
      console.log('📞 Calling ElevenLabs TTS API (full story)...');
      const { data, error } = await supabase.functions.invoke('elevenlabs-text-to-speech', {
        body: {
          text: fullText,
          voice_id: 'XB0fDUnXU5powFXDhCwa',
          model_id: 'eleven_turbo_v2_5'
        }
      });

      if (error) {
        console.error('❌ ElevenLabs TTS API Error (full story):', error);
        throw error;
      }

      if (!data || !data.audioContent) {
        throw new Error('No audio content received (full story)');
      }

      console.log('🔄 Converting audio data to blob...');
      // Convert base64 audio to blob and make object URL
      const audioBytes = atob(data.audioContent);
      const audioArray = new Uint8Array(audioBytes.length);
      for (let i = 0; i < audioBytes.length; i++) {
        audioArray[i] = audioBytes.charCodeAt(i);
      }

      const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      console.log('✅ Audio blob created successfully');
      return audioUrl;
    } catch (error) {
      console.error('❌ Error in ElevenLabs generateFullStoryAudio:', error);
      throw error;
    }
  }

  static stopAllAudio() {
    console.log('🛑 Stopping all ElevenLabs audio')
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio = null
    }
  }
}
