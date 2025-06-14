
import { Button } from "@/components/ui/button";

interface StoryFiltersProps {
  value: string;
  onChange: (cat: string) => void;
  categories: string[];
  friendlyCategoryMap: Record<string, string>;
}

const categoryIconMap: Record<string, string> = {
  bedtime: "🌙",
  adventure: "🚀",
  ABCs: "🔤",
  math: "➗",
  science: "🔬",
  educational: "📚",
  all: "✨",
};

export default function StoryFilters({
  value,
  onChange,
  categories,
  friendlyCategoryMap,
}: StoryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
      {categories.map((cat) => (
        <Button
          key={cat}
          variant={cat === value ? "default" : "secondary"}
          className="capitalize font-fredoka flex items-center gap-2"
          onClick={() => onChange(cat)}
          aria-pressed={cat === value}
        >
          <span className="text-lg">
            {categoryIconMap[cat] || "📖"}
          </span>
          {friendlyCategoryMap[cat] || cat}
        </Button>
      ))}
    </div>
  );
}
