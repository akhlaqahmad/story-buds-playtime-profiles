
import type { StoryRequest } from "@/types/story";
import { AIStoryService } from "./aiStoryService";
import { StoryDbService } from "./storyDbService";
import { ProfileService } from "./profileService";

export class StoryGenerator {
  static async generateStory(profileId: string, category?: string): Promise<string | null> {
    try {
      // Get the child profile
      const profile = await ProfileService.getProfile(profileId);
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
      const generatedStory = await AIStoryService.generateStoryWithAI(storyRequest);
      console.log('Generated optimized story:', generatedStory);

      // Save story to database
      return await StoryDbService.saveStory(profileId, generatedStory);
    } catch (error) {
      console.error('Error generating story:', error);
      throw error; // Re-throw so the UI can show the actual error
    }
  }

  static async getStory(storyId: string) {
    return await StoryDbService.getStory(storyId);
  }
}

// Re-export types for backward compatibility
export type { StoryRequest, GeneratedStory } from "@/types/story";
