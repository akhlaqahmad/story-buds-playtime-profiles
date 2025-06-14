
import { supabase } from "@/integrations/supabase/client";
import type { GeneratedStory, StoredStory } from "@/types/story";

export class StoryDbService {
  static async saveStory(profileId: string, generatedStory: GeneratedStory): Promise<string> {
    try {
      // Only set child_profile_id if it is a valid UUID (quick/naive check for UUID format)
      let child_profile_id: string | null = null;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (profileId && uuidRegex.test(profileId)) {
        child_profile_id = profileId;
      } else {
        child_profile_id = null; // For "public-demo", "demo-profile", etc.
      }

      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .insert({
          child_profile_id,
          title: generatedStory.title,
          content: generatedStory.content,
          category: generatedStory.category,
          duration: generatedStory.duration
        })
        .select()
        .single();

      if (storyError) throw storyError;
      return storyData?.id || 'unknown-id';
    } catch (error) {
      console.error('Error saving story to database:', error);
      // Fallback to localStorage only if database fails
      return this.saveDemoStory(generatedStory);
    }
  }

  static async getStory(storyId: string): Promise<StoredStory | null> {
    // Only try database if the storyId looks like a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    try {
      if (!uuidRegex.test(storyId)) throw new Error("Not a UUID");
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('id', storyId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching story from database:', error);

      // Fallback to localStorage for demo stories
      if (storyId.startsWith('demo-story-')) {
        const stored = localStorage.getItem('currentStory');
        return stored ? JSON.parse(stored) : null;
      }
      return null;
    }
  }

  static async getAllPublicStories(): Promise<StoredStory[]> {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching public stories:', error);
      return [];
    }
  }

  private static saveDemoStory(generatedStory: GeneratedStory): string {
    const demoStory = {
      id: 'demo-story-' + Date.now(),
      ...generatedStory,
      child_profile_id: null
    };
    localStorage.setItem('currentStory', JSON.stringify(demoStory));
    return demoStory.id;
  }
}
