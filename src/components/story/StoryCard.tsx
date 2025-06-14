
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StoredStory } from "@/types/story";

const friendlyCategoryMap: Record<string, string> = {
  bedtime: "Bedtime",
  adventure: "Adventure",
  ABCs: "ABCs",
  math: "Math",
  science: "Science",
  educational: "Educational",
};

interface StoryCardProps {
  story: StoredStory;
}
const StoryCard = ({ story }: StoryCardProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 pb-4 flex flex-col h-full border-2 border-kidBlue/10">
      <div className="flex-1">
        <h3 className="font-bubblegum text-2xl font-bold text-kidBlue mb-2">
          {story.title}
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="capitalize">
            {friendlyCategoryMap[story.category] || story.category}
          </Badge>
          <span className="font-fredoka text-sm text-gray-500">
            {story.duration ? `${story.duration} min` : ""}
          </span>
        </div>
        <p className="font-fredoka text-gray-700 line-clamp-3 mb-2">{story.content}</p>
      </div>
      <a href={`/story/${story.id}`}>
        <Button className="w-full font-fredoka mt-2">Read Story</Button>
      </a>
    </div>
  );
};
export default StoryCard;
