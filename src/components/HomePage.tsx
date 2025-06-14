
import React from 'react';
import { Button } from "@/components/ui/button";

const HomePage = ({ onStartQuestionnaire }: { onStartQuestionnaire: () => void }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kidGreen via-kidBlue to-kidPurple flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="font-bubblegum text-6xl font-bold text-white mb-8 drop-shadow-lg">
          StoryTime Kids
        </h1>
        <p className="font-fredoka text-2xl text-white mb-12 drop-shadow-md">
          Magical stories created just for you!
        </p>
        <Button onClick={onStartQuestionnaire} className="font-fredoka text-xl py-4 px-7 rounded-full shadow-lg hover-scale mb-6">
          Let's Make Magic!
        </Button>
        <a href="/stories">
          <Button variant="secondary" className="font-fredoka text-xl py-4 px-7 rounded-full shadow-lg hover-scale mt-2">
            Browse Story Library
          </Button>
        </a>
      </div>
    </div>
  );
};

export default HomePage;
