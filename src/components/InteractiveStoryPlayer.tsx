import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"
import { GoogleAudioService } from '@/services/googleAudioService'
import { StoryGenerator } from '@/services/storyGenerator'

interface InteractiveStoryPlayerProps {
  storyId: string
  onBack?: () => void
}

const InteractiveStoryPlayer = ({ storyId, onBack }: InteractiveStoryPlayerProps) => {
  const [story, setStory] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPosition, setCurrentPosition] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  
  const storyStartTime = useRef<number>(0)
  const sentences = useRef<string[]>([])
  const words = useRef<string[]>([])
  const playbackController = useRef<{ shouldStop: boolean }>({ shouldStop: false })

  useEffect(() => {
    loadStory()
    return () => {
      GoogleAudioService.stopAllAudio()
    }
  }, [storyId])

  const loadStory = async () => {
    try {
      const storyData = await StoryGenerator.getStory(storyId)
      setStory(storyData)
      
      // Split story into sentences and words
      const content = storyData.content || ''
      const splitSentences = content
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0)
        .map(s => s + '.')
      
      sentences.current = splitSentences
      
      // Split entire content into words for highlighting
      const allWords = content
        .replace(/[.!?]+/g, ' .')
        .split(/\s+/)
        .filter(w => w.length > 0)
      
      words.current = allWords
      console.log('Parsed sentences:', sentences.current.length)
      console.log('Parsed words:', words.current.length)
    } catch (error) {
      console.error('Error loading story:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const playStoryWithInteractions = async () => {
    if (!story) {
      console.error('No story loaded')
      return
    }
    
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
        // Check if we should stop playback
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
        
        // Speak the sentence with word highlighting
        if (!playbackController.current.shouldStop) {
          try {
            await speakSentenceWithHighlighting(sentence, i)
            console.log(`✅ Finished playing sentence ${i + 1}`)
          } catch (error) {
            console.error(`❌ Error playing sentence ${i + 1}:`, error)
            // Continue with next sentence even if one fails
          }
        }
        
        // Update progress only if we're still playing
        if (!playbackController.current.shouldStop) {
          setCurrentSentenceIndex(i + 1)
          setCurrentPosition((i + 1) / sentences.current.length * 100)
          
          // Small pause between sentences
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

  const speakSentenceWithHighlighting = async (sentence: string, sentenceIndex: number) => {
    const sentenceWords = sentence.split(/\s+/).filter(w => w.length > 0)
    const wordsPerSecond = 2.5 // Approximate speaking rate
    const wordDuration = 1000 / wordsPerSecond // ms per word
    
    // Find the starting word index for this sentence
    let wordStartIndex = 0
    for (let i = 0; i < sentenceIndex; i++) {
      const prevSentence = sentences.current[i]
      const prevWords = prevSentence.split(/\s+/).filter(w => w.length > 0)
      wordStartIndex += prevWords.length
    }
    
    // Start playing the audio
    const audioPromise = GoogleAudioService.playTextToSpeech(sentence)
    
    // Highlight words progressively
    const highlightPromise = (async () => {
      for (let i = 0; i < sentenceWords.length; i++) {
        if (playbackController.current.shouldStop) break
        
        setCurrentWordIndex(wordStartIndex + i)
        await new Promise(resolve => setTimeout(resolve, wordDuration))
      }
    })()
    
    // Wait for both audio and highlighting to complete
    await Promise.all([audioPromise, highlightPromise])
  }

  const pauseStory = () => {
    console.log('⏸️ Pausing story')
    playbackController.current.shouldStop = true
    setIsPlaying(false)
    GoogleAudioService.stopAllAudio()
  }

  const restartStory = () => {
    console.log('🔄 Restarting story')
    playbackController.current.shouldStop = true
    setIsPlaying(false)
    setCurrentPosition(0)
    setCurrentSentenceIndex(0)
    setCurrentWordIndex(0)
    GoogleAudioService.stopAllAudio()
  }

  const renderHighlightedText = () => {
    if (words.current.length === 0) return story.content

    return words.current.map((word, index) => (
      <span
        key={index}
        className={`${
          index === currentWordIndex && isPlaying
            ? 'bg-yellow-300 text-gray-900 font-bold'
            : ''
        } transition-all duration-200`}
      >
        {word}{' '}
      </span>
    ))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kidGreen via-kidBlue to-kidPurple flex items-center justify-center">
        <div className="text-white font-fredoka text-2xl">Loading your magical story... ✨</div>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kidGreen via-kidBlue to-kidPurple flex items-center justify-center">
        <div className="text-white font-fredoka text-2xl">Story not found 😔</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kidGreen via-kidBlue to-kidPurple">
      {/* Header */}
      <div className="bg-white/20 backdrop-blur-sm py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          {onBack && (
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-white hover:bg-white/20 font-fredoka text-lg"
            >
              ← Back
            </Button>
          )}
          <div className="text-white font-fredoka text-lg">
            AI StoryTime
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Story Title */}
          <h1 className="font-bubblegum text-4xl md:text-6xl font-bold text-white text-center mb-8 drop-shadow-lg">
            {story.title}
          </h1>

          {/* Story Player Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
            {/* Story Content Preview with Highlighting */}
            <div className="bg-gradient-to-r from-kidYellow/20 to-kidPink/20 rounded-2xl p-6 mb-8 max-h-64 overflow-y-auto">
              <h3 className="font-fredoka text-xl font-bold text-gray-800 mb-4">Your AI Story:</h3>
              <div className="font-fredoka text-lg text-gray-700 leading-relaxed">
                {renderHighlightedText()}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="font-fredoka text-gray-600">Progress</span>
                <span className="font-fredoka text-gray-600">{Math.round(currentPosition)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-kidGreen to-kidBlue h-4 rounded-full transition-all duration-300"
                  style={{ width: `${currentPosition}%` }}
                />
              </div>
            </div>

            {/* Audio Controls */}
            <div className="flex justify-center gap-6">
              <Button
                onClick={restartStory}
                className="bg-kidOrange hover:bg-orange-400 text-white font-fredoka text-xl py-6 px-8 rounded-full shadow-xl transform transition-all duration-300 hover:scale-105"
              >
                <RotateCcw className="w-6 h-6" />
              </Button>

              <Button
                onClick={isPlaying ? pauseStory : playStoryWithInteractions}
                disabled={isLoading}
                className="bg-gradient-to-r from-kidGreen to-kidBlue hover:from-green-400 hover:to-blue-400 text-white font-fredoka text-2xl py-8 px-12 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 disabled:opacity-50"
              >
                {isPlaying ? (
                  <>
                    <Pause className="mr-3 w-8 h-8" />
                    Pause Story
                  </>
                ) : (
                  <>
                    <Play className="mr-3 w-8 h-8" />
                    {currentPosition > 0 ? 'Continue' : 'Start'} Story
                  </>
                )}
              </Button>
            </div>

            {/* Story Info */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-kidBlue/20 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-2">⏱️</div>
                <div className="font-fredoka text-gray-700">Duration</div>
                <div className="font-fredoka font-bold text-gray-800">2 min</div>
              </div>
              
              <div className="bg-kidGreen/20 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-2">📚</div>
                <div className="font-fredoka text-gray-700">Category</div>
                <div className="font-fredoka font-bold text-gray-800 capitalize">{story.category}</div>
              </div>
              
              <div className="bg-kidYellow/20 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-2">🤖</div>
                <div className="font-fredoka text-gray-700">Generated by</div>
                <div className="font-fredoka font-bold text-gray-800">AI</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InteractiveStoryPlayer
