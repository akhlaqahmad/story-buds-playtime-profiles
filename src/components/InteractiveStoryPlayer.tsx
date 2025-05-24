
import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Mic, MicOff } from "lucide-react"
import { GoogleAudioService } from '@/services/googleAudioService'
import { InteractiveStoryService, StoryQuestion, InteractionResponse } from '@/services/interactiveStoryService'
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
  const [questions, setQuestions] = useState<StoryQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<StoryQuestion | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  const [microphoneStream, setMicrophoneStream] = useState<MediaStream | null>(null)
  const [responseTimeout, setResponseTimeout] = useState<NodeJS.Timeout | null>(null)
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [askedQuestions, setAskedQuestions] = useState<Set<number>>(new Set())
  
  const storyStartTime = useRef<number>(0)
  const sentences = useRef<string[]>([])
  const words = useRef<string[]>([])
  const playbackController = useRef<{ shouldStop: boolean }>({ shouldStop: false })

  useEffect(() => {
    loadStory()
    initializeMicrophone()
    return () => {
      GoogleAudioService.stopAllAudio()
      if (microphoneStream) {
        microphoneStream.getTracks().forEach(track => track.stop())
      }
      if (responseTimeout) {
        clearTimeout(responseTimeout)
      }
    }
  }, [storyId])

  const loadStory = async () => {
    try {
      const storyData = await StoryGenerator.getStory(storyId)
      setStory(storyData)
      
      // Generate questions for this story
      const storyQuestions = InteractiveStoryService.getQuestionsForStory(storyData)
      setQuestions(storyQuestions)
      console.log('Generated questions:', storyQuestions)
      
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

  const initializeMicrophone = async () => {
    try {
      const stream = await GoogleAudioService.initializeMicrophone()
      setMicrophoneStream(stream)
    } catch (error) {
      console.error('Microphone initialization failed:', error)
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
        
        // Check if we should ask a question at this point
        const elapsedTime = (Date.now() - storyStartTime.current) / 1000
        const pendingQuestion = questions.find(q => 
          q.timestamp <= elapsedTime && !askedQuestions.has(q.timestamp)
        )
        
        if (pendingQuestion && !playbackController.current.shouldStop) {
          console.log('❓ Pausing story for question:', pendingQuestion)
          setAskedQuestions(prev => new Set([...prev, pendingQuestion.timestamp]))
          // PAUSE the story playback when asking question
          setIsPlaying(false)
          playbackController.current.shouldStop = true
          await askQuestion(pendingQuestion)
          // After question is handled, user needs to manually continue
          break
        }
        
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

  const askQuestion = async (question: StoryQuestion) => {
    console.log('❓ Asking question and stopping story:', question)
    
    // STOP all story audio immediately
    GoogleAudioService.stopAllAudio()
    playbackController.current.shouldStop = true
    setIsPlaying(false)
    
    setCurrentQuestion(question)
    setIsWaitingForResponse(true)
    
    try {
      // Play the question
      await GoogleAudioService.playTextToSpeech(question.question)
      
      // Set timeout for response (15 seconds)
      const timeout = setTimeout(async () => {
        if (isWaitingForResponse) {
          console.log('⏰ Question timeout, asking again')
          await GoogleAudioService.playTextToSpeech("Let me ask that again. " + question.question)
          // Give another 15 seconds
          const secondTimeout = setTimeout(() => {
            console.log('⏰ Second timeout, continuing story')
            setIsWaitingForResponse(false)
            setCurrentQuestion(null)
          }, 15000)
          setResponseTimeout(secondTimeout)
        }
      }, 15000)
      
      setResponseTimeout(timeout)
    } catch (error) {
      console.error('Error asking question:', error)
      setCurrentQuestion(null)
      setIsWaitingForResponse(false)
    }
  }

  const startRecording = async () => {
    if (!microphoneStream || isRecording) return
    
    console.log('🎤 Starting recording - stopping all audio')
    // STOP all audio when starting to record
    GoogleAudioService.stopAllAudio()
    playbackController.current.shouldStop = true
    setIsPlaying(false)
    
    try {
      await GoogleAudioService.startRecording(microphoneStream)
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = async () => {
    if (!isRecording) return
    
    console.log('🎤 Stopping recording')
    
    try {
      const transcript = await GoogleAudioService.stopRecording()
      setIsRecording(false)
      
      if (currentQuestion && transcript) {
        await handleResponse(transcript)
      }
    } catch (error) {
      console.error('Error stopping recording:', error)
      setIsRecording(false)
    }
  }

  const handleResponse = async (response: string) => {
    if (!currentQuestion) return
    
    console.log('📝 Handling response:', response)
    
    // Clear timeout
    if (responseTimeout) {
      clearTimeout(responseTimeout)
      setResponseTimeout(null)
    }
    
    // Evaluate response
    const correctness = InteractiveStoryService.evaluateResponse(currentQuestion, response)
    
    // Save interaction
    const interaction: InteractionResponse = {
      storyId,
      question: currentQuestion.question,
      response,
      correctness,
      childProfileId: story.child_profile_id
    }
    
    await InteractiveStoryService.saveInteraction(interaction)
    
    // Give feedback
    let feedback = "Thank you for your answer! "
    if (correctness === true) {
      feedback += "That's correct! Great job!"
    } else if (correctness === false) {
      feedback += "Good try! The answer was " + currentQuestion.expectedAnswer + ". Let's keep going!"
    } else {
      feedback += "I love hearing your thoughts!"
    }
    
    await GoogleAudioService.playTextToSpeech(feedback)
    
    // Clear question state
    setCurrentQuestion(null)
    setIsWaitingForResponse(false)
    
    console.log('✅ Response handled, ready to continue story')
  }

  const pauseStory = () => {
    console.log('⏸️ Pausing story')
    playbackController.current.shouldStop = true
    setIsPlaying(false)
    GoogleAudioService.stopAllAudio()
    
    // If recording, stop it
    if (isRecording) {
      stopRecording()
    }
  }

  const restartStory = () => {
    console.log('🔄 Restarting story')
    playbackController.current.shouldStop = true
    setIsPlaying(false)
    setCurrentPosition(0)
    setCurrentSentenceIndex(0)
    setCurrentWordIndex(0)
    setCurrentQuestion(null)
    setIsWaitingForResponse(false)
    setIsRecording(false)
    setAskedQuestions(new Set())
    GoogleAudioService.stopAllAudio()
    if (responseTimeout) {
      clearTimeout(responseTimeout)
      setResponseTimeout(null)
    }
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
            Interactive StoryTime
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Story Title */}
          <h1 className="font-bubblegum text-4xl md:text-6xl font-bold text-white text-center mb-8 drop-shadow-lg">
            {story.title}
          </h1>

          {/* Interactive Question Card */}
          {currentQuestion && (
            <div className="bg-kidYellow/90 backdrop-blur-sm rounded-3xl p-6 mb-6 border-4 border-white shadow-2xl">
              <div className="text-center">
                <h3 className="font-bubblegum text-2xl font-bold text-gray-800 mb-4">
                  Question Time! 🤔
                </h3>
                <p className="font-fredoka text-xl text-gray-700 mb-4">
                  {currentQuestion.question}
                </p>
                
                {isWaitingForResponse && (
                  <div className="flex flex-col items-center gap-4">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={!microphoneStream}
                      className={`${
                        isRecording 
                          ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                          : 'bg-kidGreen hover:bg-green-400'
                      } text-white font-fredoka text-xl py-6 px-8 rounded-full shadow-xl transform transition-all duration-300 hover:scale-105`}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="mr-3 w-6 h-6" />
                          Stop Speaking
                        </>
                      ) : (
                        <>
                          <Mic className="mr-3 w-6 h-6" />
                          Speak Now!
                        </>
                      )}
                    </Button>
                    
                    {isRecording && (
                      <p className="font-fredoka text-lg text-gray-600 animate-bounce">
                        🎤 Listening... Speak your answer!
                      </p>
                    )}
                    
                    {!isRecording && (
                      <p className="font-fredoka text-sm text-gray-600">
                        Press "Speak Now" to answer the question
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Story Player Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
            {/* Story Content Preview with Highlighting */}
            <div className="bg-gradient-to-r from-kidYellow/20 to-kidPink/20 rounded-2xl p-6 mb-8 max-h-64 overflow-y-auto">
              <h3 className="font-fredoka text-xl font-bold text-gray-800 mb-4">Story Preview:</h3>
              <div className="font-fredoka text-lg text-gray-700 leading-relaxed">
                {renderHighlightedText()}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p>Sentences parsed: {sentences.current.length}</p>
                <p>Current sentence: {currentSentenceIndex}/{sentences.current.length}</p>
                <p>Current word: {currentWordIndex}/{words.current.length}</p>
                <p>Questions asked: {askedQuestions.size}/{questions.length}</p>
                {currentQuestion && (
                  <p className="text-orange-600 font-semibold">⏸️ Story paused for question</p>
                )}
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
                disabled={isWaitingForResponse || isRecording}
                className="bg-kidOrange hover:bg-orange-400 text-white font-fredoka text-xl py-6 px-8 rounded-full shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50"
              >
                <RotateCcw className="w-6 h-6" />
              </Button>

              <Button
                onClick={isPlaying ? pauseStory : playStoryWithInteractions}
                disabled={isLoading || (isWaitingForResponse && !isRecording)}
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

            {/* Status Messages */}
            {currentQuestion && (
              <div className="mt-6 text-center">
                <p className="font-fredoka text-orange-600 bg-orange-100 rounded-lg p-3">
                  📢 Story is paused. Please answer the question above to continue!
                </p>
              </div>
            )}

            {/* Microphone Status */}
            {!microphoneStream && (
              <div className="mt-6 text-center">
                <p className="font-fredoka text-orange-600">
                  🎤 Microphone access needed for interactive features
                </p>
                <Button
                  onClick={initializeMicrophone}
                  className="mt-2 bg-kidOrange hover:bg-orange-400 text-white font-fredoka"
                >
                  Enable Microphone
                </Button>
              </div>
            )}

            {/* Story Info */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-kidBlue/20 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-2">⏱️</div>
                <div className="font-fredoka text-gray-700">Duration</div>
                <div className="font-fredoka font-bold text-gray-800">{Math.floor(story.duration / 60)} min</div>
              </div>
              
              <div className="bg-kidGreen/20 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-2">📚</div>
                <div className="font-fredoka text-gray-700">Category</div>
                <div className="font-fredoka font-bold text-gray-800 capitalize">{story.category}</div>
              </div>
              
              <div className="bg-kidYellow/20 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-2">🎙️</div>
                <div className="font-fredoka text-gray-700">Questions</div>
                <div className="font-fredoka font-bold text-gray-800">{questions.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InteractiveStoryPlayer
