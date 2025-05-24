
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
  private static generateStoryContent(request: StoryRequest): GeneratedStory {
    // Demo story generation - in production this would use AI
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
        duration: 180 // 3 minutes
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

      // Generate story content
      const storyRequest: StoryRequest = {
        age: profile.age,
        personality: profile.personality,
        interests: profile.interests,
        dislikes: profile.dislikes,
        category: category as any || 'adventure'
      };

      const generatedStory = this.generateStoryContent(storyRequest);

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
