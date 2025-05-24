
import { Button } from "@/components/ui/button";
import { ChildProfile } from '../QuestionnaireWizard';

interface AgeSelectionProps {
  profile: ChildProfile;
  setProfile: (profile: ChildProfile) => void;
}

const AgeSelection = ({ profile, setProfile }: AgeSelectionProps) => {
  const ages = [4, 5, 6, 7];
  
  const ageEmojis = {
    4: "🌟",
    5: "⭐",
    6: "✨",
    7: "🌈"
  };

  const handleAgeSelect = (age: number) => {
    setProfile({ ...profile, age });
  };

  return (
    <div className="text-center">
      <p className="font-fredoka text-2xl text-gray-700 mb-8">
        Click on your age! 🎂
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {ages.map((age) => (
          <Button
            key={age}
            onClick={() => handleAgeSelect(age)}
            className={`
              font-bubblegum text-4xl md:text-6xl py-12 md:py-16 px-8 rounded-3xl
              transform transition-all duration-300 hover:scale-110 active:scale-95
              ${profile.age === age 
                ? 'bg-kidYellow text-gray-800 shadow-2xl scale-105' 
                : 'bg-kidBlue hover:bg-blue-400 text-white shadow-xl'
              }
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-5xl md:text-7xl">{ageEmojis[age as keyof typeof ageEmojis]}</span>
              <span>{age}</span>
            </div>
          </Button>
        ))}
      </div>

      {profile.age && (
        <div className="mt-8 p-6 bg-kidGreen/20 rounded-2xl animate-bounce-gentle">
          <p className="font-fredoka text-2xl text-gray-700">
            Awesome! You're {profile.age} years old! 🎉
          </p>
        </div>
      )}
    </div>
  );
};

export default AgeSelection;
