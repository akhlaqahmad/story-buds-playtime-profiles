
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Heart } from "lucide-react";
import { ChildProfile } from '../QuestionnaireWizard';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

interface QuestionnaireCompleteProps {
  profile: ChildProfile;
  setProfile: (profile: ChildProfile) => void;
  onProfileSaved?: (profileId: string) => void;
}

const QuestionnaireComplete = ({ profile, onProfileSaved }: QuestionnaireCompleteProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const interests = [
    { id: 'animals', label: 'Animals', emoji: '🦁' },
    { id: 'space', label: 'Space', emoji: '🚀' },
    { id: 'magic', label: 'Magic', emoji: '✨' },
    { id: 'dinosaurs', label: 'Dinosaurs', emoji: '🦕' },
    { id: 'ocean', label: 'Ocean', emoji: '🌊' },
    { id: 'forest', label: 'Forest', emoji: '🌲' }
  ];

  const personalities = [
    { id: 'adventurous', label: 'Adventurous', emoji: '🗺️' },
    { id: 'silly', label: 'Silly', emoji: '🤪' },
    { id: 'curious', label: 'Curious', emoji: '🔍' }
  ];

  const getPersonalityInfo = () => {
    return personalities.find(p => p.id === profile.personality);
  };

  const handleCreateStory = async () => {
    setIsLoading(true);
    try {
      // Store profile locally for demo (skip authentication)
      localStorage.setItem('childProfile', JSON.stringify(profile));
      
      toast({
        title: "Profile Saved! 🎉",
        description: "Ready to create your magical story!",
      });

      // Navigate to story demo page
      navigate('/story-demo');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again!",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center">
      <div className="mb-8 animate-bounce-gentle">
        <Sparkles className="w-16 h-16 text-kidYellow mx-auto mb-4" />
        <h2 className="font-bubblegum text-4xl text-gray-800 mb-4">
          Wow! You're Amazing!
        </h2>
        <p className="font-fredoka text-2xl text-gray-700">
          We learned so much about you! 🌟
        </p>
      </div>

      {/* Profile summary */}
      <div className="bg-gradient-to-r from-kidBlue/20 to-kidPurple/20 rounded-3xl p-8 mb-8">
        <h3 className="font-fredoka text-2xl font-bold text-gray-800 mb-6">Your Story Profile:</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div className="bg-white/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">🎂</span>
              <span className="font-fredoka text-xl font-bold text-gray-800">Age</span>
            </div>
            <p className="font-fredoka text-lg text-gray-700">{profile.age} years old</p>
          </div>

          <div className="bg-white/50 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{getPersonalityInfo()?.emoji}</span>
              <span className="font-fredoka text-xl font-bold text-gray-800">Personality</span>
            </div>
            <p className="font-fredoka text-lg text-gray-700">{getPersonalityInfo()?.label}</p>
          </div>

          <div className="bg-white/50 rounded-2xl p-6 md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">💝</span>
              <span className="font-fredoka text-xl font-bold text-gray-800">Favorite Things</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map(interestId => {
                const interest = interests.find(i => i.id === interestId);
                return interest && (
                  <span key={interestId} className="bg-kidYellow/30 rounded-full px-4 py-2 font-fredoka text-gray-700">
                    {interest.emoji} {interest.label}
                  </span>
                );
              })}
            </div>
          </div>

          {profile.dislikes && (
            <div className="bg-white/50 rounded-2xl p-6 md:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🚫</span>
                <span className="font-fredoka text-xl font-bold text-gray-800">Things to Avoid</span>
              </div>
              <p className="font-fredoka text-lg text-gray-700">{profile.dislikes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Call to action */}
      <Button
        onClick={handleCreateStory}
        disabled={isLoading}
        className="bg-gradient-to-r from-kidGreen to-kidBlue hover:from-green-400 hover:to-blue-400 text-white font-fredoka text-2xl py-8 px-12 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 animate-pulse-fun disabled:opacity-50"
      >
        <Heart className="mr-3 w-8 h-8" />
        {isLoading ? 'Creating Story...' : 'Create My Story!'}
        <Sparkles className="ml-3 w-8 h-8" />
      </Button>

      <p className="font-fredoka text-lg text-gray-600 mt-6">
        Get ready for magical adventures made just for you! ✨
      </p>
    </div>
  );
};

export default QuestionnaireComplete;
