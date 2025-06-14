
import { supabase } from "@/integrations/supabase/client";

export interface ChildProfile {
  id?: string;
  age: number;
  personality: string;
  interests: string[];
  dislikes?: string;
}

export class ProfileService {
  static async getProfile(profileId: string): Promise<ChildProfile | null> {
    if (profileId === 'demo-profile') {
      const stored = localStorage.getItem('childProfile');
      return stored ? JSON.parse(stored) : null;
    }

    try {
      const { data, error } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('id', profileId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }
}
