
import { supabase } from '@/integrations/supabase/client'

export interface StoryQuestion {
  timestamp: number // When in the story (in seconds)
  question: string
  type: 'open' | 'educational' // Open-ended or educational quiz
  expectedAnswer?: string // For educational questions
  options?: string[] // Multiple choice options
}

export interface InteractionResponse {
  storyId: string
  question: string
  response: string
  correctness?: boolean
  childProfileId?: string
}

export class InteractiveStoryService {
  private static generateQuestionsForStory(story: any): StoryQuestion[] {
    const questions: StoryQuestion[] = []
    const storyLength = story.duration || 180 // Default 3 minutes
    
    // Calculate better question timing based on story length
    const questionIntervals = Math.floor(storyLength / 4) // Questions every quarter of the story
    
    // Generate questions based on story category
    if (story.category === 'math') {
      questions.push({
        timestamp: questionIntervals,
        question: "What is 2 plus 2? Say the number!",
        type: 'educational',
        expectedAnswer: '4'
      })
      questions.push({
        timestamp: questionIntervals * 2,
        question: "How many fingers do you have on one hand?",
        type: 'educational',
        expectedAnswer: '5'
      })
      questions.push({
        timestamp: questionIntervals * 3,
        question: "What comes after the number 9?",
        type: 'educational',
        expectedAnswer: '10'
      })
    } else if (story.category === 'ABCs') {
      questions.push({
        timestamp: questionIntervals,
        question: "What letter comes after B? Say the letter!",
        type: 'educational',
        expectedAnswer: 'C'
      })
      questions.push({
        timestamp: questionIntervals * 2,
        question: "Can you say the letter that starts your name?",
        type: 'open'
      })
      questions.push({
        timestamp: questionIntervals * 3,
        question: "What letter makes the 'mmm' sound?",
        type: 'educational',
        expectedAnswer: 'M'
      })
    } else {
      // Adventure/general stories
      questions.push({
        timestamp: questionIntervals,
        question: "What do you think the main character should do next?",
        type: 'open'
      })
      questions.push({
        timestamp: questionIntervals * 2,
        question: "What is your favorite part of the story so far?",
        type: 'open'
      })
      questions.push({
        timestamp: questionIntervals * 3,
        question: "If you were in this story, what would you do?",
        type: 'open'
      })
    }

    console.log('Generated questions with timing:', questions)
    return questions
  }

  static getQuestionsForStory(story: any): StoryQuestion[] {
    return this.generateQuestionsForStory(story)
  }

  static async saveInteraction(interaction: InteractionResponse): Promise<void> {
    try {
      // For demo stories, save to localStorage
      if (interaction.storyId.startsWith('demo-story-')) {
        const interactions = JSON.parse(localStorage.getItem('storyInteractions') || '[]')
        interactions.push({
          ...interaction,
          id: 'demo-interaction-' + Date.now(),
          created_at: new Date().toISOString()
        })
        localStorage.setItem('storyInteractions', JSON.stringify(interactions))
        return
      }

      // For real stories, save to database
      const { error } = await supabase
        .from('interactions')
        .insert({
          story_id: interaction.storyId,
          question: interaction.question,
          response: interaction.response,
          correctness: interaction.correctness,
          child_profile_id: interaction.childProfileId
        })

      if (error) throw error
    } catch (error) {
      console.error('Error saving interaction:', error)
    }
  }

  static evaluateResponse(question: StoryQuestion, response: string): boolean | null {
    if (question.type === 'open') {
      return null // Open questions don't have right/wrong answers
    }

    if (!question.expectedAnswer) {
      return null
    }

    // Normalize both strings for comparison
    const normalizedResponse = response.toLowerCase().trim()
    const normalizedExpected = question.expectedAnswer.toLowerCase().trim()

    // Handle various ways children might respond
    if (normalizedExpected === '4') {
      return ['4', 'four'].includes(normalizedResponse)
    }
    if (normalizedExpected === '5') {
      return ['5', 'five'].includes(normalizedResponse)
    }
    if (normalizedExpected === '10') {
      return ['10', 'ten'].includes(normalizedResponse)
    }
    if (normalizedExpected === 'c') {
      return ['c', 'see', 'sea'].includes(normalizedResponse)
    }
    if (normalizedExpected === 'm') {
      return ['m', 'em'].includes(normalizedResponse)
    }

    return normalizedResponse === normalizedExpected
  }
}
