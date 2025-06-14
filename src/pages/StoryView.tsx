
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { StoryGenerator } from "@/services/storyGenerator";
import InteractiveStoryPlayer from "@/components/InteractiveStoryPlayer";
import { Button } from "@/components/ui/button";

const StoryView = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStory = async () => {
      if (!storyId) {
        setError("No story ID provided.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Try to load the story by id; error if not found
        const story = await StoryGenerator.getStory(storyId);
        if (!story) {
          setError("Story not found.");
        } else {
          setCurrentStoryId(storyId);
        }
      } catch (err) {
        setError("Could not load the story.");
      } finally {
        setLoading(false);
      }
    };
    loadStory();
  }, [storyId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-kidGreen via-kidBlue to-kidPurple text-white font-fredoka text-3xl">
        Loading Story…
      </div>
    );
  }

  if (error || !currentStoryId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-kidGreen via-kidBlue to-kidPurple text-white font-fredoka">
        <h2 className="text-3xl mb-4">Story Not Found</h2>
        <p className="mb-8">{error || "Sorry, that story does not exist."}</p>
        <Button onClick={() => navigate("/stories")} className="bg-white text-kidBlue font-bold py-4 px-7 text-lg rounded-full">Go Back to Story Library</Button>
      </div>
    );
  }

  return (
    <InteractiveStoryPlayer
      storyId={currentStoryId}
      onBack={() => navigate("/stories")}
    />
  );
};

export default StoryView;
