
import { supabase } from "@/integrations/supabase/client";
import type { GeneratedStory, StoredStory } from "@/types/story";

export class StoryDbService {
  static async saveStory(profileId: string, generatedStory: GeneratedStory): Promise<string> {
    if (profileId === 'demo-profile') {
      return this.saveDemoStory(generatedStory);
    }

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
  }

  static async getStory(storyId: string): Promise<StoredStory | null> {
    if (storyId.startsWith('demo-story-')) {
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
