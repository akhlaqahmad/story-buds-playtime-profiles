
import { useEffect, useState } from "react";
import { StoryDbService } from "@/services/storyDbService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StoryCard from "@/components/story/StoryCard";
import StoryFilters from "@/components/story/StoryFilters";
import type { StoredStory } from "@/types/story";

const allCategories = [
  "all",
  "bedtime",
  "adventure",
  "ABCs",
  "math",
  "science",
  "educational",
];

const friendlyCategoryMap: Record<string, string> = {
  bedtime: "Bedtime",
  adventure: "Adventure",
  ABCs: "ABCs",
  math: "Math",
  science: "Science",
  educational: "Educational",
};

export default function StoryLibrary() {
  const [stories, setStories] = useState<StoredStory[]>([]);
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStories() {
      setLoading(true);
      let allStories = await StoryDbService.getAllPublicStories();
      if (category && category !== "all") {
        allStories = allStories.filter(
          (s) => s.category?.toLowerCase() === category
        );
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        allStories = allStories.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            (s.content && s.content.toLowerCase().includes(q))
        );
      }
      setStories(allStories);
      setLoading(false);
    }
    fetchStories();
  }, [category, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-kidGreen via-kidBlue to-kidPurple px-2 py-8">
      <div className="mx-auto max-w-5xl bg-white/90 backdrop-blur-sm rounded-xl p-5 md:p-10 shadow-2xl">
        <h1 className="font-bubblegum text-4xl md:text-5xl text-center font-bold mb-5 text-kidBlue">
          Story Library
        </h1>
        <p className="font-fredoka text-gray-700 mb-6 text-center text-lg">
          Browse and filter magical stories by category or search by keyword.
        </p>
        <StoryFilters
          value={category}
          onChange={setCategory}
          categories={allCategories}
          friendlyCategoryMap={friendlyCategoryMap}
        />
        <div className="flex justify-center mb-4">
          <Input
            placeholder="Search stories…"
            className="max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search stories"
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-20">Loading…</div>
        ) : stories.length === 0 ? (
          <div className="flex justify-center py-20 font-fredoka text-gray-600">
            No stories found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
