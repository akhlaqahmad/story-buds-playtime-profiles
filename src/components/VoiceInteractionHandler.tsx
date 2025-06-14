
import { useState, useEffect } from 'react'
import VoiceQuestionModal from './VoiceQuestionModal'
import { InteractiveStoryService, StoryQuestion, InteractionResponse } from '@/services/interactiveStoryService'
import { ElevenLabsAudioService } from '@/services/elevenLabsAudioService'

interface VoiceInteractionHandlerProps {
  story: any
  currentTime: number
  isPlaying: boolean
  onPauseStory: () => void
  onResumeStory: () => void
  childProfileId?: string
}

const VoiceInteractionHandler = ({
  story,
  currentTime,
  isPlaying,
  onPauseStory,
  onResumeStory,
  childProfileId
}: VoiceInteractionHandlerProps) => {
  const [questions, setQuestions] = useState<StoryQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<StoryQuestion | null>(null)
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set())
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (story) {
      const storyQuestions = InteractiveStoryService.getQuestionsForStory(story)
      setQuestions(storyQuestions)
      console.log('Generated voice interaction questions:', storyQuestions)
    }
  }, [story])

  useEffect(() => {
    if (!isPlaying || !questions.length) return

    // Check if we should trigger a question
    const questionToTrigger = questions.find(q => 
      currentTime >= q.timestamp && 
      currentTime <= q.timestamp + 2 && // 2-second window
      !completedQuestions.has(q.timestamp)
    )

    if (questionToTrigger) {
      console.log('Triggering voice question at time:', currentTime, questionToTrigger)
      setCurrentQuestion(questionToTrigger)
      setShowModal(true)
      onPauseStory()
    }
  }, [currentTime, isPlaying, questions, completedQuestions, onPauseStory])

  const handleQuestionResponse = async (response: string, isCorrect?: boolean | null) => {
    if (!currentQuestion) return

    console.log('Voice response received:', { response, isCorrect })

    // Save the interaction
    if (story) {
      const interaction: InteractionResponse = {
        storyId: story.id,
        question: currentQuestion.question,
        response,
        correctness: isCorrect,
        childProfileId
      }
      
      await InteractiveStoryService.saveInteraction(interaction)
    }

    // Mark question as completed
    setCompletedQuestions(prev => new Set([...prev, currentQuestion.timestamp]))
    
    // Provide feedback based on response
    await provideFeedback(response, isCorrect, currentQuestion.type)
    
    // Close modal and resume story
    setShowModal(false)
    setCurrentQuestion(null)
    
    // Small delay before resuming
    setTimeout(() => {
      onResumeStory()
    }, 1000)
  }

  const provideFeedback = async (response: string, isCorrect: boolean | null, questionType: string) => {
    let feedbackMessage = ''

    if (questionType === 'open') {
      const openFeedbacks = [
        "What a wonderful answer! Let's continue our story!",
        "That's such a creative idea! I love it!",
        "Great thinking! You're so smart!",
        "What an amazing answer! You're doing great!"
      ]
      feedbackMessage = openFeedbacks[Math.floor(Math.random() * openFeedbacks.length)]
    } else {
      if (isCorrect) {
        const correctFeedbacks = [
          "Excellent! You got it right! You're so smart!",
          "Perfect! That's exactly right! Great job!",
          "Wonderful! You're amazing at this!",
          "Fantastic! You really know your stuff!"
        ]
        feedbackMessage = correctFeedbacks[Math.floor(Math.random() * correctFeedbacks.length)]
      } else {
        const encouragingFeedbacks = [
          "Good try! That was a great attempt! Let's keep going!",
          "Nice job thinking about it! You're learning so much!",
          "That's okay! You're doing wonderfully! Let's continue!",
          "Great effort! Keep up the fantastic work!"
        ]
        feedbackMessage = encouragingFeedbacks[Math.floor(Math.random() * encouragingFeedbacks.length)]
      }
    }

    try {
      await ElevenLabsAudioService.playTextToSpeech(feedbackMessage)
    } catch (error) {
      console.error('Error providing voice feedback:', error)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setCurrentQuestion(null)
    onResumeStory()
  }

  if (!currentQuestion) return null

  return (
    <VoiceQuestionModal
      isOpen={showModal}
      question={currentQuestion.question}
      questionType={currentQuestion.type}
      expectedAnswer={currentQuestion.expectedAnswer}
      onResponse={handleQuestionResponse}
      onClose={handleCloseModal}
    />
  )
}

export default VoiceInteractionHandler
