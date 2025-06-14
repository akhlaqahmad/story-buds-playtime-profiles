
interface StoryContentProps {
  content: string
  words: string[]
  currentWordIndex: number
  isPlaying: boolean
}

const StoryContent = ({ content, words, currentWordIndex, isPlaying }: StoryContentProps) => {
  const renderHighlightedText = () => {
    if (words.length === 0) return content

    return words.map((word, index) => (
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

  return (
    <div className="bg-gradient-to-r from-kidYellow/20 to-kidPink/20 rounded-2xl p-6 mb-8 max-h-64 overflow-y-auto">
      <h3 className="font-fredoka text-xl font-bold text-gray-800 mb-4">Your AI Story:</h3>
      <div className="font-fredoka text-lg text-gray-700 leading-relaxed">
        {renderHighlightedText()}
      </div>
    </div>
  )
}

export default StoryContent
