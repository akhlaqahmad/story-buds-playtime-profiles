
interface StoryProgressBarProps {
  currentPosition: number
}

const StoryProgressBar = ({ currentPosition }: StoryProgressBarProps) => {
  return (
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
  )
}

export default StoryProgressBar
