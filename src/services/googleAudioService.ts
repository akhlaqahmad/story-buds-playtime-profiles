import { supabase } from '@/integrations/supabase/client'

export class GoogleAudioService {
  private static mediaRecorder: MediaRecorder | null = null
  private static audioChunks: Blob[] = []
  private static currentAudio: HTMLAudioElement | null = null

  static async initializeMicrophone(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      })
      return stream
    } catch (error) {
      console.error('Error accessing microphone:', error)
      throw new Error('Microphone access denied. Please allow microphone access to use voice features.')
    }
  }

  static async playTextToSpeech(text: string): Promise<void> {
    console.log('🎵 Starting TTS for text:', text.substring(0, 50) + '...')
    
    try {
      console.log('📞 Calling Google TTS API...')
      const { data, error } = await supabase.functions.invoke('google-text-to-speech', {
        body: { 
          text,
          voiceName: 'en-US-Neural2-F', // Child-friendly female voice
          speakingRate: 0.9 
        }
      })

      console.log('📞 TTS API Response:', { data: !!data, error })

      if (error) {
        console.error('❌ TTS API Error:', error)
        throw error
      }

      if (!data || !data.audioContent) {
        console.error('❌ No audio content received from TTS API')
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
      console.error('❌ Error in playTextToSpeech:', error)
      throw error
    }
  }

  static async startRecording(stream: MediaStream): Promise<void> {
    this.audioChunks = []
    
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    })

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data)
      }
    }

    this.mediaRecorder.start()
  }

  static async stopRecording(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'))
        return
      }

      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm;codecs=opus' })
          
          // Convert to base64
          const reader = new FileReader()
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1]
            
            // Send to Google Speech-to-Text
            const { data, error } = await supabase.functions.invoke('google-speech-to-text', {
              body: { audio: base64Audio }
            })

            if (error) throw error
            resolve(data.transcript || '')
          }
          reader.onerror = reject
          reader.readAsDataURL(audioBlob)
        } catch (error) {
          reject(error)
        }
      }

      this.mediaRecorder.stop()
    })
  }

  static stopAllAudio() {
    console.log('🛑 Stopping all audio')
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio = null
    }
  }

  static isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }
}
