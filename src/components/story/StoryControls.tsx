
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw } from "lucide-react"

interface StoryControlsProps {
  isPlaying: boolean
  isLoading: boolean
  currentPosition: number
  onPlay: () => void
  onPause: () => void
  onRestart: () => void
}

const StoryControls = ({ 
  isPlaying, 
  isLoading, 
  currentPosition, 
  onPlay, 
  onPause, 
  onRestart 
}: StoryControlsProps) => {
  return (
    <div className="flex justify-center gap-6">
      <Button
        onClick={onRestart}
        className="bg-kidOrange hover:bg-orange-400 text-white font-fredoka text-xl py-6 px-8 rounded-full shadow-xl transform transition-all duration-300 hover:scale-105"
      >
        <RotateCcw className="w-6 h-6" />
      </Button>

      <Button
        onClick={isPlaying ? onPause : onPlay}
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
  )
}

export default StoryControls
