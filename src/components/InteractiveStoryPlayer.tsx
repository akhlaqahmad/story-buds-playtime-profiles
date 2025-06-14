
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { GoogleAudioService } from '@/services/googleAudioService'
import { StoryGenerator } from '@/services/storyGenerator'
import { useStoryPlayback } from '@/hooks/useStoryPlayback'
import StoryContent from '@/components/story/StoryContent'
import StoryControls from '@/components/story/StoryControls'
import StoryInfo from '@/components/story/StoryInfo'
import StoryProgressBar from '@/components/story/StoryProgressBar'

interface InteractiveStoryPlayerProps {
  storyId: string
  onBack?: () => void
}

const InteractiveStoryPlayer = ({ storyId, onBack }: InteractiveStoryPlayerProps) => {
  const [story, setStory] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const {
    isPlaying,
    currentPosition,
    currentWordIndex,
    words,
    parseSentencesAndWords,
    playStoryWithInteractions,
    pauseStory,
    restartStory
  } = useStoryPlayback()

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
      
      const content = storyData.content || ''
      parseSentencesAndWords(content)
    } catch (error) {
      console.error('Error loading story:', error)
    } finally {
      setIsLoading(false)
    }
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
            <StoryContent
              content={story.content}
              words={words}
              currentWordIndex={currentWordIndex}
              isPlaying={isPlaying}
            />

            <StoryProgressBar currentPosition={currentPosition} />

            <StoryControls
              isPlaying={isPlaying}
              isLoading={isLoading}
              currentPosition={currentPosition}
              onPlay={playStoryWithInteractions}
              onPause={pauseStory}
              onRestart={restartStory}
            />

            <StoryInfo category={story.category} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default InteractiveStoryPlayer
