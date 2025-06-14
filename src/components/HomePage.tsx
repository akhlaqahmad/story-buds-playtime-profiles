
import React from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Users, BookOpen, Rainbow } from "lucide-react";

const featureCards = [
  {
    icon: "🎭",
    title: "Choose Your Adventure",
    desc: "Pick what you love most!",
  },
  {
    icon: "🌈",
    title: "Made Just for You",
    desc: "Every story is special!",
  },
  {
    icon: "📚",
    title: "Read & Listen",
    desc: "Stories that talk to you!",
  },
];

const HomePage = ({ onStartQuestionnaire }: { onStartQuestionnaire: () => void }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kidGreen via-kidBlue to-kidPurple flex flex-col items-center justify-start relative overflow-x-hidden pb-20">
      {/* Optional top left corner sparkle */}
      <div className="absolute left-4 top-6 md:left-10 md:top-10 text-yellow-300 text-2xl drop-shadow-lg select-none pointer-events-none">
        <span role="img" aria-label="star">⭐</span>
      </div>

      {/* Logo */}
      <img
        src="/images/storytime-logo.png"
        alt="StoryTime Logo"
        className="mx-auto mt-12 w-28 h-28 rounded-full bg-white shadow-lg border-4 border-white object-contain"
        draggable={false}
      />

      {/* Title */}
      <h1 className="font-bubblegum text-white text-7xl md:text-8xl font-bold mt-2 drop-shadow-xl select-none relative">
        <span className="bg-[#efa5b2]/80 px-3 py-1 rounded-lg">StoryTime</span>
      </h1>

      {/* Headline */}
      <h2 className="mt-6 text-3xl md:text-4xl font-bubblegum font-bold text-yellow-400 drop-shadow-lg text-center">
        Magical Stories Just for You!
      </h2>

      {/* Small explainer */}
      <p className="font-fredoka text-lg md:text-xl text-white/90 text-center max-w-2xl mt-3 mb-8 drop-shadow">
        Let's create amazing adventures together! Tell us about yourself and we'll make stories that are perfect for YOU! <span role="img" aria-label="sparkle">🌟</span>
      </p>

      {/* Main CTA */}
      <Button
        onClick={onStartQuestionnaire}
        className="bg-yellow-400 hover:bg-yellow-300 transition-all font-bubblegum text-2xl md:text-3xl py-4 px-10 rounded-full shadow-xl border-2 border-yellow-300 flex items-center gap-3 mx-auto mb-6"
      >
        <Sparkles className="w-7 h-7 -ml-2 text-yellow-600" strokeWidth={2.5} />
        Let's Make Magic!
        <Sparkles className="w-7 h-7 -mr-2 text-yellow-600" strokeWidth={2.5} />
      </Button>

      {/* Links: Parental Dashboard & Meet the Team */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-base mb-12">
        <a
          href="/parental-dashboard"
          className="font-fredoka text-white/90 hover:text-yellow-300 transition-all flex items-center gap-2 underline-offset-2"
        >
          <span className="rounded-full border border-white p-1 mr-1" />
          Parental Dashboard
        </a>
        <a
          href="/team"
          className="font-fredoka text-white/90 hover:text-yellow-300 transition-all flex items-center gap-2"
        >
          <span role="img" aria-label="robot" className="text-lg">🤖</span>
          Meet the Team
        </a>
      </div>

      {/* Feature Cards */}
      <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 max-w-4xl px-4 mt-2">
        {featureCards.map((card) => (
          <div
            key={card.title}
            className="flex flex-col items-center justify-center bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl px-8 py-8 min-w-[240px] mb-2 hover:scale-[1.03] transition-all border-2 border-white/30"
          >
            <div className="text-5xl mb-2">{card.icon}</div>
            <div className="font-bubblegum text-xl md:text-2xl text-white font-bold mb-1 text-center">
              {card.title}
            </div>
            <div className="font-fredoka text-white text-sm md:text-base text-center opacity-90">
              {card.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Left Sparkle */}
      <div className="absolute left-6 bottom-6 text-yellow-300 text-2xl drop-shadow-lg select-none pointer-events-none">
        <Sparkles strokeWidth={2.5} className="w-7 h-7" />
      </div>

      {/* Bottom Right Heart */}
      <div className="absolute right-8 bottom-8 text-red-400 text-xl opacity-80 drop-shadow-sm select-none pointer-events-none">
        <span role="img" aria-label="heart">♡</span>
      </div>
    </div>
  );
};

export default HomePage;
