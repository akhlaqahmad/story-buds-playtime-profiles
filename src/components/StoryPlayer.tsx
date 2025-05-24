
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";
import { AudioService } from '@/services/audioService';
import { StoryGenerator } from '@/services/storyGenerator';

interface StoryPlayerProps {
  storyId: string;
  onBack?: () => void;
}

const StoryPlayer = ({ storyId, onBack }: StoryPlayerProps) => {
  const [story, setStory] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStory();
  }, [storyId]);

  const loadStory = async () => {
    try {
      const storyData = await StoryGenerator.getStory(storyId);
      setStory(storyData);
    } catch (error) {
      console.error('Error loading story:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const playStory = async () => {
    if (!story) return;
    
    setIsPlaying(true);
    try {
      await AudioService.initializeAudio();
      
      // Split story into sentences for better pacing
      const sentences = story.content.split(/[.!?]+/).filter(s => s.trim());
      
      for (let i = 0; i < sentences.length; i++) {
        if (!isPlaying) break; // Stop if user paused
        
        const sentence = sentences[i].trim();
        if (!sentence) continue;
        
        // Play sound effects for certain words
        if (sentence.toLowerCase().includes('moo')) {
          await AudioService.playSoundEffect('animal-moo');
        } else if (sentence.toLowerCase().includes('woof') || sentence.toLowerCase().includes('bark')) {
          await AudioService.playSoundEffect('animal-woof');
        } else if (sentence.toLowerCase().includes('meow')) {
          await AudioService.playSoundEffect('animal-meow');
        } else if (sentence.toLowerCase().includes('magic') || sentence.toLowerCase().includes('sparkle')) {
          await AudioService.playSoundEffect('magic-sparkle');
        } else if (sentence.toLowerCase().includes('zoom') || sentence.toLowerCase().includes('rocket')) {
          await AudioService.playSoundEffect('rocket-zoom');
        }
        
        // Speak the sentence
        await AudioService.playTextToSpeech(sentence + '.');
        
        // Update progress
        setCurrentPosition((i + 1) / sentences.length * 100);
        
        // Small pause between sentences
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setIsPlaying(false);
      setCurrentPosition(100);
    } catch (error) {
      console.error('Error playing story:', error);
      setIsPlaying(false);
    }
  };

  const pauseStory = () => {
    setIsPlaying(false);
    AudioService.stopAllAudio();
  };

  const restartStory = () => {
    setIsPlaying(false);
    setCurrentPosition(0);
    AudioService.stopAllAudio();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kidGreen via-kidBlue to-kidPurple flex items-center justify-center">
        <div className="text-white font-fredoka text-2xl">Loading your magical story... ✨</div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-kidGreen via-kidBlue to-kidPurple flex items-center justify-center">
        <div className="text-white font-fredoka text-2xl">Story not found 😔</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kidGreen via-kidBlue to-kidPurple">
      {/* Header */}
      <div className="bg-white/20 backdrop-blur-sm py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          {onBack && (
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-white hover:bg-white/20 font-fredoka text-lg"
            >
              ← Back
            </Button>
          )}
          <div className="text-white font-fredoka text-lg">
            StoryTime Player
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Story Title */}
          <h1 className="font-bubblegum text-4xl md:text-6xl font-bold text-white text-center mb-8 drop-shadow-lg">
            {story.title}
          </h1>

          {/* Story Player Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
            {/* Story Content Preview */}
            <div className="bg-gradient-to-r from-kidYellow/20 to-kidPink/20 rounded-2xl p-6 mb-8 max-h-64 overflow-y-auto">
              <h3 className="font-fredoka text-xl font-bold text-gray-800 mb-4">Story Preview:</h3>
              <p className="font-fredoka text-lg text-gray-700 leading-relaxed">
                {story.content.substring(0, 200)}...
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="font-fredoka text-gray-600">Progress</span>
                <span className="font-fredoka text-gray-600">{Math.round(currentPosition)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-kidGreen to-kidBlue h-4 rounded-full transition-all duration-300"
                  style={{ width: `${currentPosition}%` }}
                />
              </div>
            </div>

            {/* Audio Controls */}
            <div className="flex justify-center gap-6">
              <Button
                onClick={restartStory}
                className="bg-kidOrange hover:bg-orange-400 text-white font-fredoka text-xl py-6 px-8 rounded-full shadow-xl transform transition-all duration-300 hover:scale-105"
              >
                <RotateCcw className="w-6 h-6" />
              </Button>

              <Button
                onClick={isPlaying ? pauseStory : playStory}
                disabled={isLoading}
                className="bg-gradient-to-r from-kidGreen to-kidBlue hover:from-green-400 hover:to-blue-400 text-white font-fredoka text-2xl py-8 px-12 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110"
              >
                {isPlaying ? (
                  <>
                    <Pause className="mr-3 w-8 h-8" />
                    Pause Story
                  </>
                ) : (
                  <>
                    <Play className="mr-3 w-8 h-8" />
                    Play Story
                  </>
                )}
              </Button>

              <Button
                onClick={() => AudioService.playSoundEffect('magic-sparkle')}
                className="bg-kidPink hover:bg-pink-400 text-white font-fredoka text-xl py-6 px-8 rounded-full shadow-xl transform transition-all duration-300 hover:scale-105"
              >
                <Volume2 className="w-6 h-6" />
              </Button>
            </div>

            {/* Story Info */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-kidBlue/20 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-2">⏱️</div>
                <div className="font-fredoka text-gray-700">Duration</div>
                <div className="font-fredoka font-bold text-gray-800">{Math.floor(story.duration / 60)} min</div>
              </div>
              
              <div className="bg-kidGreen/20 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-2">📚</div>
                <div className="font-fredoka text-gray-700">Category</div>
                <div className="font-fredoka font-bold text-gray-800 capitalize">{story.category}</div>
              </div>
              
              <div className="bg-kidYellow/20 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-2">🎭</div>
                <div className="font-fredoka text-gray-700">Style</div>
                <div className="font-fredoka font-bold text-gray-800">Interactive</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryPlayer;
