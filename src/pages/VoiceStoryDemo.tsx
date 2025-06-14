
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { StoryGenerator } from '@/services/storyGenerator';
import InteractiveStoryPlayerEnhanced from '@/components/InteractiveStoryPlayerEnhanced';

const VoiceStoryDemo = () => {
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);

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
    setError(null);
    setGenerationTime(null);
    const startTime = Date.now();
    
    try {
      const storyId = await StoryGenerator.generateStory('demo-profile', 'adventure');
      if (storyId) {
        setCurrentStoryId(storyId);
        const endTime = Date.now();
        setGenerationTime(Math.round((endTime - startTime) / 1000));
      }
    } catch (error) {
      console.error('Error generating demo story:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate story. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (currentStoryId) {
    return (
      <InteractiveStoryPlayerEnhanced 
        storyId={currentStoryId} 
        onBack={() => setCurrentStoryId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kidGreen via-kidBlue to-kidPurple flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-bubblegum text-6xl font-bold text-white mb-8 drop-shadow-lg">
          Voice Story Demo 🎤
        </h1>
        
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md mx-auto">
          <div className="text-6xl mb-4">🎙️✨</div>
          <p className="font-fredoka text-xl text-gray-700 mb-6">
            Ready to hear a magical story where you can talk back? Answer questions with your voice!
          </p>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-fredoka text-sm">{error}</p>
            </div>
          )}
          
          {generationTime && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="font-fredoka text-sm">Voice story generated in {generationTime} seconds! ⚡</p>
            </div>
          )}
          
          <Button
            onClick={generateDemoStory}
            disabled={isGenerating}
            className="bg-gradient-to-r from-kidGreen to-kidBlue hover:from-green-400 hover:to-blue-400 text-white font-fredoka text-2xl py-6 px-8 rounded-full shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50"
          >
            {isGenerating ? 'AI is Creating Voice Story... 🎤' : 'Generate Voice Story! 🎙️✨'}
          </Button>
          
          <p className="font-fredoka text-sm text-gray-600 mt-4">
            {isGenerating ? 'Creating your interactive voice story...' : 'Stories with voice questions - answer by speaking!'}
          </p>
          
          <div className="mt-6 bg-kidYellow/20 rounded-2xl p-4">
            <h4 className="font-fredoka font-bold text-gray-800 mb-2">🎤 Voice Features:</h4>
            <ul className="font-fredoka text-sm text-gray-600 space-y-1">
              <li>• Answer questions by speaking</li>
              <li>• Get encouraging voice feedback</li>
              <li>• Educational and creative questions</li>
              <li>• Fallback to typing if needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceStoryDemo;
