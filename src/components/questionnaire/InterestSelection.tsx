
import { Button } from "@/components/ui/button";
import { ChildProfile } from '../QuestionnaireWizard';

interface InterestSelectionProps {
  profile: ChildProfile;
  setProfile: (profile: ChildProfile) => void;
}

const InterestSelection = ({ profile, setProfile }: InterestSelectionProps) => {
  const interests = [
    { id: 'animals', label: 'Animals', emoji: '🦁', color: 'bg-kidGreen' },
    { id: 'space', label: 'Space', emoji: '🚀', color: 'bg-kidPurple' },
    { id: 'magic', label: 'Magic', emoji: '✨', color: 'bg-kidPink' },
    { id: 'dinosaurs', label: 'Dinosaurs', emoji: '🦕', color: 'bg-kidOrange' },
    { id: 'ocean', label: 'Ocean', emoji: '🌊', color: 'bg-kidBlue' },
    { id: 'forest', label: 'Forest', emoji: '🌲', color: 'bg-kidGreen' }
  ];

  const handleInterestToggle = (interest: string) => {
    const newInterests = profile.interests.includes(interest)
      ? profile.interests.filter(i => i !== interest)
      : [...profile.interests, interest];
    
    setProfile({ ...profile, interests: newInterests });
  };

  return (
    <div className="text-center">
      <p className="font-fredoka text-2xl text-gray-700 mb-4">
        Pick all the things you love! You can choose more than one! 💝
      </p>
      <p className="font-fredoka text-lg text-gray-600 mb-8">
        Tap to select, tap again to unselect
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {interests.map((interest) => {
          const isSelected = profile.interests.includes(interest.id);
          
          return (
            <Button
              key={interest.id}
              onClick={() => handleInterestToggle(interest.id)}
              className={`
                font-fredoka text-lg py-8 px-4 rounded-3xl h-auto
                transform transition-all duration-300 hover:scale-110 active:scale-95
                ${isSelected 
                  ? `${interest.color} text-white shadow-2xl scale-105 animate-pulse-fun` 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800 shadow-xl'
                }
              `}
            >
              <div className="flex flex-col items-center gap-3">
                <span className="text-4xl">{interest.emoji}</span>
                <span className="font-bold">{interest.label}</span>
                {isSelected && (
                  <span className="text-2xl">✓</span>
                )}
              </div>
            </Button>
          );
        })}
      </div>

      {profile.interests.length > 0 && (
        <div className="mt-8 p-6 bg-kidYellow/20 rounded-2xl animate-bounce-gentle">
          <p className="font-fredoka text-2xl text-gray-700">
            Great choices! You picked {profile.interests.length} thing{profile.interests.length > 1 ? 's' : ''} you love! 🎉
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {profile.interests.map(interestId => {
              const interest = interests.find(i => i.id === interestId);
              return interest && (
                <span key={interestId} className="text-2xl">
                  {interest.emoji}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterestSelection;
