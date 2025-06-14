
import { supabase } from "@/integrations/supabase/client";
import type { GeneratedStory, StoredStory } from "@/types/story";

export class StoryDbService {
  static async saveStory(profileId: string, generatedStory: GeneratedStory): Promise<string> {
    try {
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
      return storyData?.id || 'unknown-id';
    } catch (error) {
      console.error('Error saving story to database:', error);
      // Fallback to localStorage only if database fails
      return this.saveDemoStory(generatedStory);
    }
  }

  static async getStory(storyId: string): Promise<StoredStory | null> {
    // First try to get from database
    try {
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
      child_profile_id: 'demo-profile'
    };
    localStorage.setItem('currentStory', JSON.stringify(demoStory));
    return demoStory.id;
  }
}
