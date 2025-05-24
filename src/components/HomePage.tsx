import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Star, Shield } from "lucide-react";
import { Link } from "react-router-dom";

interface HomePageProps {
  onStartQuestionnaire: () => void;
}

const HomePage = ({ onStartQuestionnaire }: HomePageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kidBlue via-kidPurple to-kidPink overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Star className="absolute top-20 left-10 text-kidYellow w-8 h-8 animate-pulse-fun" />
        <Heart className="absolute top-32 right-20 text-kidPink w-6 h-6 animate-bounce-gentle" />
        <Sparkles className="absolute bottom-40 left-20 text-kidYellow w-10 h-10 animate-pulse-fun" />
        <Star className="absolute bottom-20 right-32 text-white w-7 h-7 animate-pulse-fun" />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen text-center">
        {/* Logo/Title */}
        <div className="mb-8 animate-bounce-gentle flex flex-col items-center">
          <img src="/images/storytime-logo.png" alt="StoryTime Logo" className="w-32 h-32 mb-4 drop-shadow-xl rounded-full bg-white/80 p-2" />
          <h1 className="font-bubblegum text-6xl md:text-8xl font-bold text-white drop-shadow-lg mb-4">
            StoryTime
          </h1>
          <h2 className="font-fredoka text-3xl md:text-4xl font-semibold text-kidYellow drop-shadow-md">
            Magical Stories Just for You!
          </h2>
        </div>

        {/* Subtitle */}
        <p className="font-fredoka text-xl md:text-2xl text-white mb-12 max-w-2xl leading-relaxed drop-shadow-sm">
          Let's create amazing adventures together! 
          Tell us about yourself and we'll make stories that are perfect for YOU! 🌟
        </p>

        {/* Main CTA Button */}
        <Button
          onClick={onStartQuestionnaire}
          className="bg-kidYellow hover:bg-yellow-400 text-gray-800 font-fredoka text-2xl md:text-3xl font-bold py-8 px-12 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 hover:rotate-1 active:scale-95 mb-8"
        >
          <Sparkles className="mr-4 w-8 h-8" />
          Let's Make Magic!
          <Sparkles className="ml-4 w-8 h-8" />
        </Button>

        {/* Parental Dashboard Button */}
        <Link to="/parental-dashboard">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 font-fredoka text-xl py-4 px-8 rounded-full transition-all duration-300 hover:scale-105"
          >
            <Shield className="mr-2 w-6 h-6" />
            Parental Dashboard
          </Button>
        </Link>

        {/* Team Members Button */}
        <Link to="/team">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 font-fredoka text-xl py-4 px-8 rounded-full transition-all duration-300 hover:scale-105 mt-2"
          >
            👨‍💻 Meet the Team
          </Button>
        </Link>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl">
          <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 text-center transform transition-all duration-300 hover:scale-105">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="font-fredoka text-xl font-semibold text-white mb-2">Choose Your Adventure</h3>
            <p className="font-fredoka text-white/90">Pick what you love most!</p>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 text-center transform transition-all duration-300 hover:scale-105">
            <div className="text-6xl mb-4">🌈</div>
            <h3 className="font-fredoka text-xl font-semibold text-white mb-2">Made Just for You</h3>
            <p className="font-fredoka text-white/90">Every story is special!</p>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 text-center transform transition-all duration-300 hover:scale-105">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="font-fredoka text-xl font-semibold text-white mb-2">Read & Listen</h3>
            <p className="font-fredoka text-white/90">Stories that talk to you!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
