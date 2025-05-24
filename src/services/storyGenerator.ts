
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
  category: string;
  duration: number;
}

export class StoryGenerator {
  private static async generateStoryWithAI(request: StoryRequest): Promise<GeneratedStory> {
    const { age, personality, interests, dislikes, category } = request;
    
    // Create a detailed prompt for the AI
    const prompt = `Create a children's story for a ${age}-year-old child with the following characteristics:
    
Personality: ${personality}
Interests: ${interests.join(', ')}
${dislikes ? `Dislikes: ${dislikes}` : ''}
Category: ${category || 'adventure'}

Requirements:
- Age-appropriate language for a ${age}-year-old
- Story should be engaging and match their ${personality} personality
- Include elements related to their interests: ${interests.join(', ')}
${dislikes ? `- Avoid mentioning: ${dislikes}` : ''}
- Keep the story between 150-300 words for a 3-5 minute reading time
- Include dialogue to make it interactive
- End with a positive, educational message
- Use simple sentences and vocabulary appropriate for the age group
- Make the story unique and creative each time

Please provide:
1. A creative title
2. The complete story content

Format your response as:
TITLE: [Story Title]
STORY: [Story Content]`;

    try {
      console.log('Calling AI story generation with prompt:', prompt.substring(0, 200) + '...');
      
      const { data, error } = await supabase.functions.invoke('generate-story-ai', {
        body: { prompt }
      });

      if (error) {
        console.error('AI story generation error:', error);
        throw new Error(`AI generation failed: ${error.message}`);
      }

      if (!data || !data.generatedText) {
        console.error('No generated text received from AI');
        throw new Error('No story content generated');
      }

      // Parse the AI response
      const response = data.generatedText;
      console.log('AI generated response:', response.substring(0, 200) + '...');
      
      const titleMatch = response.match(/TITLE:\s*(.*?)(?:\n|STORY:)/i);
      const storyMatch = response.match(/STORY:\s*([\s\S]*)/i);

      const title = titleMatch ? titleMatch[1].trim() : `The ${personality.charAt(0).toUpperCase() + personality.slice(1)} Adventure`;
      let content = storyMatch ? storyMatch[1].trim() : response;
      
      // Clean up the content - remove any trailing formatting
      content = content.replace(/^STORY:\s*/i, '').trim();

      // Estimate duration based on word count (average reading speed for children's stories)
      const wordCount = content.split(/\s+/).length;
      const duration = Math.max(120, Math.min(300, wordCount * 0.8)); // 0.8 seconds per word

      console.log('Successfully generated AI story:', { title, wordCount, duration });

      return {
        title,
        content,
        category: category || 'adventure',
        duration: Math.round(duration)
      };
    } catch (error) {
      console.error('Error calling AI story generation:', error);
      // Fallback to template if AI service is unavailable
      console.log('Falling back to template-based generation');
      return this.generateFallbackStory(request);
    }
  }

  private static generateFallbackStory(request: StoryRequest): GeneratedStory {
    // Fallback to original template-based generation
    const { age, personality, interests, dislikes } = request;
    
    const mainInterest = interests[0] || 'animals';
    const personalityTrait = personality === 'adventurous' ? 'brave' : 
                           personality === 'silly' ? 'funny' : 'smart';
    
    const storyTemplates = {
      animals: {
        title: `The ${personalityTrait.charAt(0).toUpperCase() + personalityTrait.slice(1)} Animal Adventure`,
        content: `Once upon a time, there was a ${personalityTrait} ${age}-year-old named Alex who loved ${mainInterest}! 

One sunny morning, Alex discovered a magical forest where all the animals could talk! "Hello there!" said a friendly rabbit. "Hop hop!" 

The rabbit showed Alex around the forest, where they met a wise old owl who said "Hoo hoo! Welcome to our magical home!" 

Together, they went on an amazing adventure, helping a lost baby deer find its way back to its family. The deer said "Thank you so much!" with the sweetest little voice.

As the sun began to set, Alex knew it was time to go home. "Come back soon!" called all the animal friends. "We'll have more adventures waiting for you!"

And from that day on, Alex knew that kindness and ${personalityTrait}ness could make any adventure magical.

The End! 🌟`,
        duration: 180
      },
      space: {
        title: `The ${personalityTrait.charAt(0).toUpperCase() + personalityTrait.slice(1)} Space Explorer`,
        content: `Zoom! Zoom! Alex the ${personalityTrait} space explorer was flying through the stars in a shiny rocket ship! 

"Beep beep!" went the rocket as it landed on a colorful planet covered in rainbow clouds. 

"Hello, Earth friend!" said a friendly alien with three eyes and a big smile. "Welcome to Planet Giggleopolis!"

Alex and the alien friend explored crystal caves that sparkled like diamonds and found flowers that sang beautiful songs when the wind blew through them.

Together, they built a friendship bridge made of stardust that connected their worlds forever.

When it was time to go home, the alien friend gave Alex a special star that would always remind them of their cosmic adventure.

The End! 🚀✨`,
        duration: 165
      }
    };

    const template = storyTemplates[mainInterest as keyof typeof storyTemplates] || storyTemplates.animals;
    
    return {
      title: template.title,
      content: template.content,
      category: request.category || 'adventure',
      duration: template.duration
    };
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

      // Generate story content using AI
      const storyRequest: StoryRequest = {
        age: profile.age,
        personality: profile.personality,
        interests: profile.interests,
        dislikes: profile.dislikes,
        category: category as any || 'adventure'
      };

      console.log('Generating AI story with request:', storyRequest);
      const generatedStory = await this.generateStoryWithAI(storyRequest);
      console.log('Generated story:', generatedStory);

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
      return null;
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
