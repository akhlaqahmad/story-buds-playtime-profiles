
import { useState, useRef } from 'react'

export const useAudioPlayback = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioLoading, setAudioLoading] = useState(false)
  const [audioErrored, setAudioErrored] = useState<string | null>(null)
  
  const audioElement = useRef<HTMLAudioElement | null>(null)

  const playAudio = async (audioUrl: string): Promise<void> => {
    setAudioErrored(null)
    setAudioLoading(true)

    try {
      console.log('🎵 Starting audio playback:', audioUrl)

      // Clean up previous audio
      if (audioElement.current) {
        audioElement.current.pause()
        audioElement.current = null
      }

      const audio = new Audio()
      audioElement.current = audio
      
      // Set up error handling
      audio.onerror = (error) => {
        console.error('❌ Audio playback error:', error)
        setAudioErrored("Failed to play audio. The audio file may be corrupted or inaccessible.")
        setIsPlaying(false)
        setAudioLoading(false)
      }

      audio.onended = () => {
        setIsPlaying(false)
        audioElement.current = null
      }

      // Add CORS headers for Supabase storage if needed
      if (audioUrl.includes('supabase.co/storage')) {
        audio.crossOrigin = 'anonymous'
      }

      // Set source and load
      audio.src = audioUrl
      audio.preload = "auto"

      // Wait for audio to be ready
      await new Promise((resolve, reject) => {
        const handleCanPlay = () => {
          audio.removeEventListener('canplay', handleCanPlay)
          audio.removeEventListener('error', handleError)
          resolve(void 0)
        }

        const handleError = (error: Event) => {
          audio.removeEventListener('canplay', handleCanPlay)
          audio.removeEventListener('error', handleError)
          reject(new Error('Audio failed to load'))
        }

        audio.addEventListener('canplay', handleCanPlay)
        audio.addEventListener('error', handleError)
        audio.load()
      })

      setIsPlaying(true)
      await audio.play()
      
    } catch (error: any) {
      console.error('❌ Error in audio playback:', error)
      setAudioErrored(error?.message || "Unknown error occurred while playing audio")
      setIsPlaying(false)
    } finally {
      setAudioLoading(false)
    }
  }

  const pauseAudio = () => {
    audioElement.current?.pause()
    setIsPlaying(false)
  }

  const stopAudio = () => {
    if (audioElement.current) {
      audioElement.current.pause()
      audioElement.current.currentTime = 0
      audioElement.current = null
    }
    setIsPlaying(false)
    setAudioErrored(null)
  }

  return {
    isPlaying,
    audioLoading,
    audioErrored,
    playAudio,
    pauseAudio,
    stopAudio
  }
}
