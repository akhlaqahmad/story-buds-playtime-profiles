
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Mic, MicOff, RotateCcw, MessageSquare, Volume2, CheckCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ElevenLabsAudioService } from '@/services/elevenLabsAudioService'
import { GoogleAudioService } from '@/services/googleAudioService'

interface VoiceQuestionModalProps {
  isOpen: boolean
  question: string
  questionType: 'open' | 'educational'
  expectedAnswer?: string
  onResponse: (response: string, isCorrect?: boolean) => void
  onClose: () => void
}

const VoiceQuestionModal = ({ 
  isOpen, 
  question, 
  questionType, 
  expectedAnswer, 
  onResponse, 
  onClose 
}: VoiceQuestionModalProps) => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showTextInput, setShowTextInput] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [hasSpokenQuestion, setHasSpokenQuestion] = useState(false)

  useEffect(() => {
    if (isOpen && !hasSpokenQuestion) {
      speakQuestion()
      setHasSpokenQuestion(true)
    }
    
    if (!isOpen) {
      // Reset state when modal closes
      setTranscript('')
      setTextInput('')
      setShowTextInput(false)
      setHasSpokenQuestion(false)
      setIsRecording(false)
      setIsProcessing(false)
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        setStream(null)
      }
    }
  }, [isOpen])

  const speakQuestion = async () => {
    try {
      await ElevenLabsAudioService.playTextToSpeech(question)
    } catch (error) {
      console.error('Error speaking question:', error)
    }
  }

  const startRecording = async () => {
    try {
      const mediaStream = await GoogleAudioService.initializeMicrophone()
      setStream(mediaStream)
      await GoogleAudioService.startRecording(mediaStream)
      setIsRecording(true)
      setTranscript('')
    } catch (error) {
      console.error('Error starting recording:', error)
      // Fallback to text input if microphone fails
      setShowTextInput(true)
    }
  }

  const stopRecording = async () => {
    try {
      setIsRecording(false)
      setIsProcessing(true)
      
      const transcription = await GoogleAudioService.stopRecording()
      setTranscript(transcription)
      setIsProcessing(false)
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        setStream(null)
      }
    } catch (error) {
      console.error('Error stopping recording:', error)
      setIsProcessing(false)
      setShowTextInput(true)
    }
  }

  const handleSubmitResponse = (response: string) => {
    if (!response.trim()) return
    
    let isCorrect = null
    if (questionType === 'educational' && expectedAnswer) {
      const normalizedResponse = response.toLowerCase().trim()
      const normalizedExpected = expectedAnswer.toLowerCase().trim()
      
      // Handle common variations
      if (normalizedExpected === '4') {
        isCorrect = ['4', 'four'].includes(normalizedResponse)
      } else if (normalizedExpected === '5') {
        isCorrect = ['5', 'five'].includes(normalizedResponse)
      } else if (normalizedExpected === '10') {
        isCorrect = ['10', 'ten'].includes(normalizedResponse)
      } else if (normalizedExpected === 'c') {
        isCorrect = ['c', 'see', 'sea'].includes(normalizedResponse)
      } else if (normalizedExpected === 'm') {
        isCorrect = ['m', 'em'].includes(normalizedResponse)
      } else {
        isCorrect = normalizedResponse === normalizedExpected
      }
    }
    
    onResponse(response, isCorrect)
  }

  const handleSkip = () => {
    onResponse('', null)
  }

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-md mx-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-fredoka text-2xl text-center text-gray-800 mb-4">
            Story Question! 🎤
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-6">
          {/* Question Display */}
          <div className="bg-gradient-to-r from-kidBlue/20 to-kidPurple/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Volume2 className="w-6 h-6 text-kidBlue mt-1 flex-shrink-0" />
              <p className="font-fredoka text-lg text-gray-700 leading-relaxed">
                {question}
              </p>
            </div>
            <Button
              onClick={speakQuestion}
              variant="ghost"
              className="w-full mt-2 text-kidBlue hover:bg-kidBlue/10"
            >
              🔊 Hear Question Again
            </Button>
          </div>

          {/* Voice Recording Section */}
          {!showTextInput && (
            <div className="text-center space-y-4">
              <div className="relative">
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  className={`w-24 h-24 rounded-full text-white font-fredoka text-lg shadow-2xl transform transition-all duration-300 ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110' 
                      : 'bg-gradient-to-r from-kidGreen to-kidBlue hover:from-green-400 hover:to-blue-400 hover:scale-105'
                  }`}
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                  ) : isRecording ? (
                    <MicOff className="w-10 h-10" />
                  ) : (
                    <Mic className="w-10 h-10" />
                  )}
                </Button>
                
                {isRecording && (
                  <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
                )}
              </div>
              
              <p className="font-fredoka text-gray-600">
                {isProcessing ? 'Processing your answer...' : 
                 isRecording ? 'Listening... Tap to stop!' : 
                 'Tap the microphone to answer!'}
              </p>
            </div>
          )}

          {/* Transcript Display */}
          {transcript && (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-fredoka font-bold text-green-700">You said:</span>
              </div>
              <p className="font-fredoka text-lg text-gray-700 italic">"{transcript}"</p>
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={() => handleSubmitResponse(transcript)}
                  className="bg-green-500 hover:bg-green-600 text-white font-fredoka flex-1"
                >
                  That's Right! ✨
                </Button>
                <Button
                  onClick={() => {
                    setTranscript('')
                    startRecording()
                  }}
                  variant="outline"
                  className="font-fredoka"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Text Input Fallback */}
          {showTextInput && (
            <div className="space-y-3">
              <div className="bg-kidYellow/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-5 h-5 text-kidOrange" />
                  <span className="font-fredoka font-bold text-gray-700">Type your answer:</span>
                </div>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg font-fredoka text-lg"
                  placeholder="Type here..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitResponse(textInput)}
                />
              </div>
              <Button
                onClick={() => handleSubmitResponse(textInput)}
                disabled={!textInput.trim()}
                className="w-full bg-kidOrange hover:bg-orange-400 text-white font-fredoka text-lg py-3"
              >
                Submit Answer! 🚀
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!showTextInput && !transcript && (
              <Button
                onClick={() => setShowTextInput(true)}
                variant="outline"
                className="flex-1 font-fredoka border-2 border-gray-300 hover:bg-gray-50"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Type Instead
              </Button>
            )}
            
            <Button
              onClick={handleSkip}
              variant="outline"
              className="flex-1 font-fredoka border-2 border-gray-300 hover:bg-gray-50"
            >
              Skip Question
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default VoiceQuestionModal
