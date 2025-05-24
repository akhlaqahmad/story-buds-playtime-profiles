import { supabase } from "@/integrations/supabase/client";

export interface StoryRequest {
  age: number;
  personality: string;
  interests: string[];
  dislikes?: string;
  category?: 'bedtime' | 'ABCs' | 'math' | 'science' | 'adventure';
}

export interface GeneratedStory {
  title: string;
  content: string;
  ssmlContent: string;
  category: string;
  duration: number;
}

export class StoryGenerator {
  private static async generateStoryWithAI(request: StoryRequest): Promise<GeneratedStory> {
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
        options: {
          headers: {
            'Content-Type': 'application/json',
          }
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

      // Parse the AI response
      const response = data.generatedText;
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

      // Estimate duration for shorter stories (faster reading)
      // const wordCount = content.split(/\s+/).length;
      // const duration = Math.max(120, Math.min(300, wordCount * 0.6)); // 0.6 seconds per word
      const duration = 120; // Set to 2 minutes

      console.log('Successfully generated optimized story:', { title, wordCount: content.length, duration });

      return {
        title,
        content,
        ssmlContent,
        category: category || 'adventure',
        duration: Math.round(duration)
      };
    } catch (error) {
      console.error('Error calling AI story generation:', error);
      
      // Add retry logic for timeout errors
      if (error.message.includes('timeout') || error.message.includes('fetch')) {
        console.log('Retrying story generation due to timeout...');
        // Simple retry once
        try {
          const { data, error: retryError } = await supabase.functions.invoke('generate-story-ai', {
            body: { prompt },
            options: {
              headers: {
                'Content-Type': 'application/json',
              }
            }
          });
          
          if (!retryError && data && data.generatedText) {
            const response = data.generatedText;
            const titleMatch = response.match(/TITLE:\s*(.*?)(?:\n|STORY:)/i);
            const storyMatch = response.match(/STORY:\s*([\s\S]*)/i);
            const title = titleMatch ? titleMatch[1].trim() : `The ${personality.charAt(0).toUpperCase() + personality.slice(1)} Adventure`;
            let content = storyMatch ? storyMatch[1].trim() : response.replace(/^TITLE:\s*.*?\n/i, '').trim();
            
            if (!content || content.length < 100) content = response;
            content = content.replace(/^STORY:\s*/i, '').trim();
            
            const wordCount = content.split(/\s+/).length;
            const duration = Math.max(120, Math.min(300, wordCount * 0.6));
            
            return {
              title,
              content,
              ssmlContent: content,
              category: category || 'adventure',
              duration: Math.round(duration)
            };
          }
        } catch (retryError) {
          console.error('Retry also failed:', retryError);
        }
      }
      
      throw new Error(`Story generation failed: ${error.message}. Please try again.`);
    }
  }

  static async generateStory(profileId: string, category?: string): Promise<string | null> {
    try {
      // Get the child profile
      let profile;
      if (profileId === 'demo-profile') {
        // Get from localStorage for demo
        const stored = localStorage.getItem('childProfile');
        profile = stored ? JSON.parse(stored) : null;
      } else {
        const { data, error } = await supabase
          .from('child_profiles')
          .select('*')
          .eq('id', profileId)
          .single();
        
        if (error) throw error;
        profile = data;
      }

      if (!profile) throw new Error('Profile not found');

      // Generate story content using AI with optimized settings
      const storyRequest: StoryRequest = {
        age: profile.age,
        personality: profile.personality,
        interests: profile.interests,
        dislikes: profile.dislikes,
        category: category as any || 'adventure'
      };

      console.log('Generating optimized AI story with request:', storyRequest);
      const generatedStory = await this.generateStoryWithAI(storyRequest);
      console.log('Generated optimized story:', generatedStory);

      // Save story to database (skip for demo profile)
      if (profileId !== 'demo-profile') {
        const { data: storyData, error: storyError } = await supabase
          .from('stories')
          .insert({
            child_profile_id: profileId,
            title: generatedStory.title,
            content: generatedStory.content,
            category: generatedStory.category,
            duration: generatedStory.duration
          })
          .select()
          .single();

        if (storyError) throw storyError;
        return storyData.id;
      } else {
        // Store in localStorage for demo
        const demoStory = {
          id: 'demo-story-' + Date.now(),
          ...generatedStory,
          child_profile_id: profileId
        };
        localStorage.setItem('currentStory', JSON.stringify(demoStory));
        return demoStory.id;
      }
    } catch (error) {
      console.error('Error generating story:', error);
      throw error; // Re-throw so the UI can show the actual error
    }
  }

  static async getStory(storyId: string) {
    if (storyId.startsWith('demo-story-')) {
      // Get from localStorage for demo
      const stored = localStorage.getItem('currentStory');
      return stored ? JSON.parse(stored) : null;
    }

    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single();
    
    if (error) throw error;
    return data;
  }
}
