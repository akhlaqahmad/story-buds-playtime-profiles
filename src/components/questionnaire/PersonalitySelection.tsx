
import { Button } from "@/components/ui/button";
import { ChildProfile } from '../QuestionnaireWizard';

interface PersonalitySelectionProps {
  profile: ChildProfile;
  setProfile: (profile: ChildProfile) => void;
}

const PersonalitySelection = ({ profile, setProfile }: PersonalitySelectionProps) => {
  const personalities = [
    { 
      id: 'adventurous', 
      label: 'Adventurous', 
      emoji: '🗺️', 
      description: 'I love exploring!',
      color: 'bg-kidOrange'
    },
    { 
      id: 'silly', 
      label: 'Silly', 
      emoji: '🤪', 
      description: 'I love to laugh!',
      color: 'bg-kidPink'
    },
    { 
      id: 'curious', 
      label: 'Curious', 
      emoji: '🔍', 
      description: 'I love learning!',
      color: 'bg-kidPurple'
    }
  ];

  const handlePersonalitySelect = (personality: string) => {
    setProfile({ ...profile, personality });
  };

  return (
    <div className="text-center">
      <p className="font-fredoka text-2xl text-gray-700 mb-8">
        Which one sounds like you? Pick your favorite! 🌟
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {personalities.map((p) => (
          <Button
            key={p.id}
            onClick={() => handlePersonalitySelect(p.id)}
            className={`
              font-fredoka text-xl py-12 px-6 rounded-3xl h-auto
              transform transition-all duration-300 hover:scale-110 active:scale-95
              ${profile.personality === p.id 
                ? `${p.color} text-white shadow-2xl scale-105` 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800 shadow-xl'
              }
            `}
          >
            <div className="flex flex-col items-center gap-4">
              <span className="text-6xl animate-pulse-fun">{p.emoji}</span>
              <span className="text-2xl font-bold">{p.label}</span>
              <span className="text-lg opacity-90">{p.description}</span>
            </div>
          </Button>
        ))}
      </div>

      {profile.personality && (
        <div className="mt-8 p-6 bg-kidGreen/20 rounded-2xl animate-bounce-gentle">
          <p className="font-fredoka text-2xl text-gray-700">
            Perfect! You're {personalities.find(p => p.id === profile.personality)?.label.toLowerCase()}! 
            {personalities.find(p => p.id === profile.personality)?.emoji}
          </p>
        </div>
      )}
    </div>
  );
};

export default PersonalitySelection;
