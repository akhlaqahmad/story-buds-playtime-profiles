
import { supabase } from '@/integrations/supabase/client'

export class ElevenLabsAudioService {
  private static currentAudio: HTMLAudioElement | null = null

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

  static stopAllAudio() {
    console.log('🛑 Stopping all ElevenLabs audio')
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio = null
    }
  }
}
