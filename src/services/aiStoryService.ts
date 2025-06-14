
import { supabase } from "@/integrations/supabase/client";
import type { StoryRequest, GeneratedStory } from "@/types/story";

export class AIStoryService {
  static async generateStoryWithAI(request: StoryRequest): Promise<GeneratedStory> {
    const { age, personality, interests, dislikes, category } = request;
    
    // Create a streamlined prompt for faster generation
    const prompt = `Create a children's story for a ${age}-year-old child:

CHILD PROFILE:
- Age: ${age} years old
- Personality: ${personality}
- Interests: ${interests.join(', ')}
${dislikes ? `- Avoid: ${dislikes}` : ''}
- Category: ${category || 'adventure'}

STORY REQUIREMENTS:
- Length: 200-300 words (quick reading)
- Include the child's interests: ${interests.join(', ')}
- Match their ${personality} personality
- Use age-appropriate vocabulary
- Include dialogue and action
- Clear beginning, middle, end
- Positive lesson or message

Format as:
TITLE: [Story Title]
STORY: [Complete Story]`;

    try {
      console.log('Calling AI story generation with optimized prompt');
      
      const { data, error } = await supabase.functions.invoke('generate-story-ai', {
        body: { prompt },
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (error) {
        console.error('AI story generation error:', error);
        throw new Error(`AI generation failed: ${error.message}`);
      }

      if (!data || !data.generatedText) {
        console.error('No generated text received from AI');
        throw new Error('No story content generated. Please try again.');
      }

      return this.parseAIResponse(data.generatedText, category);
    } catch (error) {
      console.error('Error calling AI story generation:', error);
      
      // Add retry logic for timeout errors
      if (error.message.includes('timeout') || error.message.includes('fetch')) {
        console.log('Retrying story generation due to timeout...');
        return this.retryStoryGeneration(prompt, category);
      }
      
      throw new Error(`Story generation failed: ${error.message}. Please try again.`);
    }
  }

  private static parseAIResponse(response: string, category?: string): GeneratedStory {
    console.log('AI generated response length:', response.length);

    // Try to extract title and story
    let title = '';
    let content = '';

    // Try to match the expected format
    const titleMatch = response.match(/TITLE:\s*(.*?)(?:\n|STORY:)/i);
    const storyMatch = response.match(/STORY:\s*([\s\S]*)/i);

    if (titleMatch && storyMatch) {
      title = titleMatch[1].trim();
      content = storyMatch[1].trim();
    } else {
      // Fallback: Use the first line as title, rest as content
      const lines = response.split('\n');
      title = lines[0].replace(/^TITLE:\s*/i, '').trim();
      content = lines.slice(1).join('\n').replace(/^STORY:\s*/i, '').trim();
      // If still too short, use the whole response as content
      if (!content || content.length < 50) {
        content = response.trim();
      }
    }

    // Final fallback: If content is still too short, log and show the full response
    if (!content || content.length < 50) {
      console.warn('Story parsing failed, using full AI response as content. Full response:', response);
      content = response.trim();
    }

    // If still too short, show a user-friendly error but include the full response for debugging
    if (!content || content.length < 50) {
      throw new Error('Generated story is too short. Please try again. Full AI response: ' + response);
    }

    // Create SSML version
    const ssmlContent = content;
    const duration = 120; // Set to 2 minutes

    console.log('Successfully generated optimized story:', { title, wordCount: content.length, duration });

    return {
      title,
      content,
      ssmlContent,
      category: category || 'adventure',
      duration: Math.round(duration)
    };
  }

  private static async retryStoryGeneration(prompt: string, category?: string): Promise<GeneratedStory> {
    try {
      const { data, error: retryError } = await supabase.functions.invoke('generate-story-ai', {
        body: { prompt },
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!retryError && data && data.generatedText) {
        return this.parseAIResponse(data.generatedText, category);
      }
    } catch (retryError) {
      console.error('Retry also failed:', retryError);
    }
    
    throw new Error('Story generation failed after retry. Please try again.');
  }
}
