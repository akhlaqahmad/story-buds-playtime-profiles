
import { useState, useRef } from 'react'
import { ElevenLabsAudioService } from '@/services/elevenLabsAudioService'

export const useStoryPlayback = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(0)
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  
  const storyStartTime = useRef<number>(0)
  const sentences = useRef<string[]>([])
  const words = useRef<string[]>([])
  const playbackController = useRef<{ shouldStop: boolean }>({ shouldStop: false })

  const parseSentencesAndWords = (content: string) => {
    const splitSentences = content
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => s + '.')
    
    sentences.current = splitSentences
    
    const allWords = content
      .replace(/[.!?]+/g, ' .')
      .split(/\s+/)
      .filter(w => w.length > 0)
    
    words.current = allWords
    console.log('Parsed sentences:', sentences.current.length)
    console.log('Parsed words:', words.current.length)
  }

  const speakSentenceWithHighlighting = async (sentence: string, sentenceIndex: number) => {
    const sentenceWords = sentence.split(/\s+/).filter(w => w.length > 0)
    const wordsPerSecond = 2.5
    const wordDuration = 1000 / wordsPerSecond
    
    let wordStartIndex = 0
    for (let i = 0; i < sentenceIndex; i++) {
      const prevSentence = sentences.current[i]
      const prevWords = prevSentence.split(/\s+/).filter(w => w.length > 0)
      wordStartIndex += prevWords.length
    }
    
    const audioPromise = ElevenLabsAudioService.playTextToSpeech(sentence)
    
    const highlightPromise = (async () => {
      for (let i = 0; i < sentenceWords.length; i++) {
        if (playbackController.current.shouldStop) break
        
        setCurrentWordIndex(wordStartIndex + i)
        await new Promise(resolve => setTimeout(resolve, wordDuration))
      }
    })()
    
    await Promise.all([audioPromise, highlightPromise])
  }

  const playStoryWithInteractions = async () => {
    if (sentences.current.length === 0) {
      console.error('No sentences to play')
      return
    }
    
    console.log('🎬 Starting story playback from sentence:', currentSentenceIndex)
    setIsPlaying(true)
    playbackController.current.shouldStop = false
    storyStartTime.current = Date.now()
    
    try {
      for (let i = currentSentenceIndex; i < sentences.current.length; i++) {
        if (playbackController.current.shouldStop) {
          console.log('⏹️ Playback stopped by user')
          break
        }
        
        const sentence = sentences.current[i]
        if (!sentence || sentence.trim().length === 0) {
          console.log('⏭️ Skipping empty sentence at index:', i)
          continue
        }
        
        console.log(`🎵 Playing sentence ${i + 1}/${sentences.current.length}:`, sentence)
        
        if (!playbackController.current.shouldStop) {
          try {
            await speakSentenceWithHighlighting(sentence, i)
            console.log(`✅ Finished playing sentence ${i + 1}`)
          } catch (error) {
            console.error(`❌ Error playing sentence ${i + 1}:`, error)
          }
        }
        
        if (!playbackController.current.shouldStop) {
          setCurrentSentenceIndex(i + 1)
          setCurrentPosition((i + 1) / sentences.current.length * 100)
          await new Promise(resolve => setTimeout(resolve, 800))
        }
      }
      
      console.log('🎬 Story playback completed')
      setIsPlaying(false)
      if (!playbackController.current.shouldStop) {
        setCurrentPosition(100)
      }
    } catch (error) {
      console.error('❌ Error during story playback:', error)
      setIsPlaying(false)
    }
  }

  const pauseStory = () => {
    console.log('⏸️ Pausing story')
    playbackController.current.shouldStop = true
    setIsPlaying(false)
    ElevenLabsAudioService.stopAllAudio()
  }

  const restartStory = () => {
    console.log('🔄 Restarting story')
    playbackController.current.shouldStop = true
    setIsPlaying(false)
    setCurrentPosition(0)
    setCurrentSentenceIndex(0)
    setCurrentWordIndex(0)
    ElevenLabsAudioService.stopAllAudio()
  }

  return {
    isPlaying,
    currentPosition,
    currentSentenceIndex,
    currentWordIndex,
    sentences: sentences.current,
    words: words.current,
    parseSentencesAndWords,
    playStoryWithInteractions,
    pauseStory,
    restartStory
  }
}
