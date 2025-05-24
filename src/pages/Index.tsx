
import { useState } from 'react';
import HomePage from '../components/HomePage';
import QuestionnaireWizard from '../components/QuestionnaireWizard';

const Index = () => {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  if (showQuestionnaire) {
    return <QuestionnaireWizard onBack={() => setShowQuestionnaire(false)} />;
  }

  return <HomePage onStartQuestionnaire={() => setShowQuestionnaire(true)} />;
};

export default Index;
