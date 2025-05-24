
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import AgeSelection from './questionnaire/AgeSelection';
import PersonalitySelection from './questionnaire/PersonalitySelection';
import InterestSelection from './questionnaire/InterestSelection';
import DislikesInput from './questionnaire/DislikesInput';
import QuestionnaireComplete from './questionnaire/QuestionnaireComplete';

interface QuestionnaireWizardProps {
  onBack: () => void;
}

export interface ChildProfile {
  age: number | null;
  personality: string;
  interests: string[];
  dislikes: string;
}

const QuestionnaireWizard = ({ onBack }: QuestionnaireWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<ChildProfile>({
    age: null,
    personality: '',
    interests: [],
    dislikes: ''
  });

  const steps = [
    { component: AgeSelection, title: "How old are you?" },
    { component: PersonalitySelection, title: "What's your personality like?" },
    { component: InterestSelection, title: "What do you love?" },
    { component: DislikesInput, title: "Anything you don't like in stories?" },
    { component: QuestionnaireComplete, title: "All done!" }
  ];

  const currentStepComponent = steps[currentStep];
  const Component = currentStepComponent.component;

  const canProceed = () => {
    switch (currentStep) {
      case 0: return profile.age !== null;
      case 1: return profile.personality !== '';
      case 2: return profile.interests.length > 0;
      case 3: return true; // Dislikes is optional
      default: return true;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-kidGreen via-kidBlue to-kidPurple">
      {/* Header */}
      <div className="bg-white/20 backdrop-blur-sm py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            onClick={onBack}
            variant="ghost"
            className="text-white hover:bg-white/20 font-fredoka text-lg"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back to Home
          </Button>
          
          <div className="text-white font-fredoka text-lg">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white/30 h-2">
        <div 
          className="bg-kidYellow h-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <h1 className="font-bubblegum text-4xl md:text-6xl font-bold text-white text-center mb-8 drop-shadow-lg">
            {currentStepComponent.title}
          </h1>

          {/* Step component */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
            <Component profile={profile} setProfile={setProfile} />
          </div>

          {/* Navigation */}
          {currentStep < steps.length - 1 && (
            <div className="flex justify-between mt-8">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="bg-white/20 hover:bg-white/30 text-white font-fredoka text-xl py-6 px-8 rounded-full disabled:opacity-50"
              >
                <ArrowLeft className="mr-2 w-6 h-6" />
                Previous
              </Button>

              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-kidOrange hover:bg-orange-400 text-white font-fredoka text-xl py-6 px-8 rounded-full disabled:opacity-50 transform transition-all duration-300 hover:scale-105"
              >
                Next
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireWizard;
