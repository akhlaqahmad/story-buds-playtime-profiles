
import { ElevenLabsAudioService } from './elevenLabsAudioService'
import { GoogleAudioService } from './googleAudioService'
import { supabase } from '@/integrations/supabase/client'
import { StoryDbService } from './storyDbService'

export class AudioServiceManager {
  static async generateStoryAudio(story: { id: string, content: string, audio_url?: string }): Promise<string> {
    console.log('🎵 AudioServiceManager: Starting story audio generation...');

    // Check if we already have cached audio for this story
    if (story.audio_url) {
      console.log('✅ Using cached audio URL:', story.audio_url);
      return story.audio_url;
    }

    // Try ElevenLabs first
    try {
      console.log('🎵 Attempting ElevenLabs TTS...');
      return await ElevenLabsAudioService.getOrCreateCachedStoryAudio(story);
    } catch (elevenLabsError: any) {
      console.warn('⚠️ ElevenLabs failed, falling back to Google TTS:', elevenLabsError.message);
      
      // Fallback to Google TTS with caching
      try {
        console.log('🎵 Attempting Google TTS fallback with caching...');
        return await this.getOrCreateCachedGoogleTTSAudio(story);
      } catch (googleError: any) {
        console.error('❌ Both ElevenLabs and Google TTS failed');
        throw new Error(`Audio generation failed: ElevenLabs (${elevenLabsError.message}), Google (${googleError.message})`);
      }
    }
  }

  private static async getOrCreateCachedGoogleTTSAudio(story: { id: string, content: string, audio_url?: string }): Promise<string> {
    console.log('🎵 Google TTS: Checking for cached audio...');

    // Check if audio already exists in storage
    const fileName = `google-story-audio-${story.id}.mp3`;
    
    try {
      // Try to get the file from storage first
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('story-audio')
        .download(fileName);

      if (!downloadError && fileData) {
        console.log('✅ Found cached Google TTS audio in storage');
        const { data: urlData } = supabase.storage
          .from('story-audio')
          .getPublicUrl(fileName);
        
        const cachedUrl = urlData.publicUrl;
        
        // Update the story record with the cached URL if it doesn't have one
        if (!story.audio_url) {
          await StoryDbService.updateStoryAudioUrl(story.id, cachedUrl);
        }
        
        return cachedUrl;
      }
    } catch (error) {
      console.log('ℹ️ No cached audio found, will generate new one');
    }

    // Generate new audio via Google TTS
    console.log('🎵 Generating new Google TTS audio...');
    const audioBlob = await this.generateGoogleTTSAudioBlob(story.content);

    // Upload to storage
    console.log('☁️ Uploading Google TTS audio to storage...');
    const { error: uploadError } = await supabase.storage
      .from('story-audio')
      .upload(fileName, audioBlob, {
        contentType: 'audio/mpeg',
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Failed to upload Google TTS audio to storage:', uploadError);
      // Return temporary blob URL as fallback
      return URL.createObjectURL(audioBlob);
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('story-audio')
      .getPublicUrl(fileName);

    const audioUrl = urlData.publicUrl;
    console.log('✅ Google TTS audio uploaded successfully:', audioUrl);

    // Update the story record with the new audio URL
    await StoryDbService.updateStoryAudioUrl(story.id, audioUrl);

    return audioUrl;
  }

  private static async generateGoogleTTSAudioBlob(content: string): Promise<Blob> {
    console.log('🎵 Calling Google TTS API...');
    
    const { data, error } = await supabase.functions.invoke('google-text-to-speech', {
      body: { 
        text: content,
        voiceName: 'en-US-Neural2-F',
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
    const audioBytes = atob(data.audioContent);
    const audioArray = new Uint8Array(audioBytes.length);
    for (let i = 0; i < audioBytes.length; i++) {
      audioArray[i] = audioBytes.charCodeAt(i);
    }

    return new Blob([audioArray], { type: 'audio/mpeg' });
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
