import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { StoryGenerator } from '@/services/storyGenerator'
import StoryContent from '@/components/story/StoryContent'
import StoryControls from '@/components/story/StoryControls'
import StoryInfo from '@/components/story/StoryInfo'
import StoryProgressBar from '@/components/story/StoryProgressBar'
import { useFullStoryPlayback } from "@/hooks/useFullStoryPlayback"

interface InteractiveStoryPlayerProps {
  storyId: string
  onBack?: () => void
}

const InteractiveStoryPlayer = ({ storyId, onBack }: InteractiveStoryPlayerProps) => {
  const [story, setStory] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const {
    audioLoading,
    isPlaying,
    audioErrored,
    currentWordIndex,
    words,
    generateAndPlayFullStory,
    pauseStory,
    restartStory
  } = useFullStoryPlayback()

  useEffect(() => {
    loadStory()
    // Stop audio on unmount
    return () => {
      restartStory()
    }
    // eslint-disable-next-line
  }, [storyId])

  const loadStory = async () => {
    setIsLoading(true)
    try {
      const storyData = await StoryGenerator.getStory(storyId)
      setStory(storyData)
    } catch (error) {
      console.error('Error loading story:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // UI for loading whole story audio
  if (isLoading || !story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kidGreen via-kidBlue to-kidPurple flex items-center justify-center">
        <div className="text-white font-fredoka text-2xl">{isLoading ? "Loading your magical story... ✨" : "Story not found 😔"}</div>
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
            AI StoryTime with ElevenLabs! 🎤
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

            {/* Show a loading spinner during TTS generation */}
            {audioLoading ? (
              <div className="flex flex-col items-center text-center mt-4 mb-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-kidBlue mb-4" />
                <p className="font-fredoka text-lg text-kidBlue font-semibold mb-2">
                  AI is creating your magical story narration...
                </p>
                <p className="font-fredoka text-gray-500 text-sm">This may take 8–20 seconds for the full story audio.</p>
              </div>
            ) : null}

            {audioErrored && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p className="font-fredoka text-sm">{audioErrored}</p>
              </div>
            )}

            <StoryProgressBar currentPosition={words.length > 0 ? ((currentWordIndex + 1) / words.length) * 100 : 0} />

            <StoryControls
              isPlaying={isPlaying}
              isLoading={audioLoading}
              currentPosition={words.length > 0 ? ((currentWordIndex + 1) / words.length) * 100 : 0}
              onPlay={() => generateAndPlayFullStory(story)}
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
