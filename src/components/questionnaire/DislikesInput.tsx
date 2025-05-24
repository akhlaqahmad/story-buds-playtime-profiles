
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChildProfile } from '../QuestionnaireWizard';

interface DislikesInputProps {
  profile: ChildProfile;
  setProfile: (profile: ChildProfile) => void;
}

const DislikesInput = ({ profile, setProfile }: DislikesInputProps) => {
  const [inputValue, setInputValue] = useState(profile.dislikes);

  const commonDislikes = [
    { text: "No scary monsters", emoji: "👹" },
    { text: "No spiders", emoji: "🕷️" },
    { text: "No loud noises", emoji: "🔊" },
    { text: "No dark places", emoji: "🌑" },
    { text: "No sad endings", emoji: "😢" }
  ];

  const handleQuickSelect = (dislike: string) => {
    const currentDislikes = inputValue ? inputValue.split(', ') : [];
    if (!currentDislikes.includes(dislike)) {
      const newDislikes = [...currentDislikes, dislike].join(', ');
      setInputValue(newDislikes);
      setProfile({ ...profile, dislikes: newDislikes });
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setProfile({ ...profile, dislikes: value });
  };

  return (
    <div className="text-center">
      <p className="font-fredoka text-2xl text-gray-700 mb-4">
        Is there anything you don't like in stories? 🤔
      </p>
      <p className="font-fredoka text-lg text-gray-600 mb-8">
        This helps us make stories that are just right for you! (You can skip this if you want)
      </p>
      
      {/* Quick select buttons */}
      <div className="mb-6">
        <p className="font-fredoka text-lg text-gray-700 mb-4">Quick picks:</p>
        <div className="flex flex-wrap justify-center gap-3">
          {commonDislikes.map((dislike, index) => (
            <Button
              key={index}
              onClick={() => handleQuickSelect(dislike.text)}
              className="bg-kidPink hover:bg-pink-400 text-white font-fredoka text-sm py-3 px-4 rounded-full transform transition-all duration-300 hover:scale-105"
            >
              <span className="mr-2">{dislike.emoji}</span>
              {dislike.text}
            </Button>
          ))}
        </div>
      </div>

      {/* Text input */}
      <div className="max-w-2xl mx-auto">
        <Textarea
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="Tell us anything you don't want in your stories... or leave this empty if everything is okay!"
          className="font-fredoka text-lg p-6 rounded-2xl border-4 border-kidBlue/30 focus:border-kidBlue resize-none"
          rows={4}
        />
      </div>

      <div className="mt-8 p-6 bg-kidGreen/20 rounded-2xl">
        <p className="font-fredoka text-xl text-gray-700">
          {profile.dislikes 
            ? "Thanks for telling us! We'll make sure to avoid those things. 😊" 
            : "No worries! We'll make amazing stories for you! 🌟"
          }
        </p>
      </div>
    </div>
  );
};

export default DislikesInput;
