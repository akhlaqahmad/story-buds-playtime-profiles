import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { StoryGenerator } from '@/services/storyGenerator';
import InteractiveStoryPlayer from '@/components/InteractiveStoryPlayer';

const StoryDemo = () => {
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Check if there's a saved profile
    const profile = localStorage.getItem('childProfile');
    if (profile) {
      // Auto-generate a demo story
      generateDemoStory();
    }
  }, []);

  const generateDemoStory = async () => {
    setIsGenerating(true);
    try {
      const storyId = await StoryGenerator.generateStory('demo-profile', 'adventure');
      if (storyId) {
        setCurrentStoryId(storyId);
      }
    } catch (error) {
      console.error('Error generating demo story:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (currentStoryId) {
    return (
      <InteractiveStoryPlayer 
        storyId={currentStoryId} 
        onBack={() => setCurrentStoryId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kidGreen via-kidBlue to-kidPurple flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-bubblegum text-6xl font-bold text-white mb-8 drop-shadow-lg">
          Story Demo
        </h1>
        
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md mx-auto">
          <p className="font-fredoka text-xl text-gray-700 mb-6">
            Ready to hear a magical story created just for you?
          </p>
          
          <Button
            onClick={generateDemoStory}
            disabled={isGenerating}
            className="bg-gradient-to-r from-kidGreen to-kidBlue hover:from-green-400 hover:to-blue-400 text-white font-fredoka text-2xl py-6 px-8 rounded-full shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50"
          >
            {isGenerating ? 'Creating Your Story...' : 'Generate Story! ✨'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StoryDemo;
