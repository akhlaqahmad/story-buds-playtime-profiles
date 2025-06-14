
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

export interface StoredStory {
  id: string;
  title: string;
  content: string;
  ssmlContent?: string;
  category: string;
  duration: number;
  child_profile_id: string;
}
