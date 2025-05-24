import { Button } from "@/components/ui/button";
import { ArrowLeft, Castle, Zap, Smile, Dog, Sparkles, Shield, BarChart3, Clock, ThumbsUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const ParentalDashboard = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("Overall");

  // Sample story data for each category
  const storyData = {
    Overall: {
      stories: [
        { id: 1, title: "The Magic Dragon", readTime: "12 min", category: "Fantasy", date: "2024-05-20" },
        { id: 2, title: "Space Adventure", readTime: "8 min", category: "Adventure", date: "2024-05-19" },
        { id: 3, title: "Funny Farm Animals", readTime: "6 min", category: "Comedy", date: "2024-05-18" },
        { id: 4, title: "Super Cat Saves the Day", readTime: "10 min", category: "Superhero", date: "2024-05-17" },
        { id: 5, title: "Cinderella's New Friend", readTime: "9 min", category: "Fairy Tales", date: "2024-05-16" }
      ],
      totalScreenTime: "45 min"
    },
    Fantasy: {
      stories: [
        { id: 1, title: "The Magic Dragon", readTime: "12 min", date: "2024-05-20" },
        { id: 6, title: "Wizard's Apprentice", readTime: "15 min", date: "2024-05-15" },
        { id: 7, title: "Enchanted Forest", readTime: "11 min", date: "2024-05-14" },
        { id: 8, title: "Crystal Castle", readTime: "13 min", date: "2024-05-13" }
      ],
      totalScreenTime: "51 min"
    },
    Adventure: {
      stories: [
        { id: 2, title: "Space Adventure", readTime: "8 min", date: "2024-05-19" },
        { id: 9, title: "Pirate Treasure Hunt", readTime: "14 min", date: "2024-05-12" },
        { id: 10, title: "Mountain Climbing Hero", readTime: "10 min", date: "2024-05-11" }
      ],
      totalScreenTime: "32 min"
    },
    Comedy: {
      stories: [
        { id: 3, title: "Funny Farm Animals", readTime: "6 min", date: "2024-05-18" },
        { id: 11, title: "Silly Robot Chef", readTime: "7 min", date: "2024-05-10" },
        { id: 12, title: "Dancing Dinosaurs", readTime: "5 min", date: "2024-05-09" }
      ],
      totalScreenTime: "18 min"
    },
    "Animal Stories": {
      stories: [
        { id: 13, title: "Bear Family Picnic", readTime: "9 min", date: "2024-05-08" },
        { id: 14, title: "Ocean Friends", readTime: "8 min", date: "2024-05-07" }
      ],
      totalScreenTime: "17 min"
    },
    "Fairy Tales": {
      stories: [
        { id: 5, title: "Cinderella's New Friend", readTime: "9 min", date: "2024-05-16" },
        { id: 15, title: "Three Little Pigs 2.0", readTime: "11 min", date: "2024-05-06" },
        { id: 16, title: "Goldilocks and the Tech Bears", readTime: "12 min", date: "2024-05-05" }
      ],
      totalScreenTime: "32 min"
    },
    Superhero: {
      stories: [
        { id: 4, title: "Super Cat Saves the Day", readTime: "10 min", date: "2024-05-17" },
        { id: 17, title: "Captain Recycling", readTime: "13 min", date: "2024-05-04" },
        { id: 18, title: "Wonder Kid's First Day", readTime: "9 min", date: "2024-05-03" }
      ],
      totalScreenTime: "32 min"
    }
  };

  // Story counts for each category
  const storyCounts = {
    fantasy: storyData.Fantasy.stories.length,
    adventure: storyData.Adventure.stories.length,
    comedy: storyData.Comedy.stories.length,
    animalStories: storyData["Animal Stories"].stories.length,
    fairyTales: storyData["Fairy Tales"].stories.length,
    superhero: storyData.Superhero.stories.length
  };

  // Calculate total stories
  const totalStories = Object.values(storyCounts).reduce((sum, count) => sum + count, 0);

  // Define categories with counts
  const categoriesWithCounts = [
    { name: "Fantasy", icon: Castle, color: "from-purple-500 to-pink-500", count: storyCounts.fantasy },
    { name: "Adventure", icon: Zap, color: "from-orange-500 to-red-500", count: storyCounts.adventure },
    { name: "Comedy", icon: Smile, color: "from-yellow-500 to-orange-500", count: storyCounts.comedy },
    { name: "Animal Stories", icon: Dog, color: "from-green-500 to-blue-500", count: storyCounts.animalStories },
    { name: "Fairy Tales", icon: Sparkles, color: "from-pink-500 to-purple-500", count: storyCounts.fairyTales },
    { name: "Superhero", icon: Shield, color: "from-blue-500 to-indigo-500", count: storyCounts.superhero }
  ];

  // Sort categories by count (descending) and add Overall at the top
  const sortedCategories = [
    { name: "Overall", icon: BarChart3, color: "from-gray-600 to-gray-800", count: totalStories },
    ...categoriesWithCounts.sort((a, b) => b.count - a.count)
  ];

  const currentStoryData = storyData[selectedCategory] || storyData.Overall;

  return (
    <div className="min-h-screen bg-gradient-to-br from-kidGreen via-kidBlue to-kidPurple">
      {/* Header */}
      <div className="bg-white/20 backdrop-blur-sm py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="text-white hover:bg-white/20 font-fredoka text-lg"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back to Home
          </Button>
          <div className="text-white font-fredoka text-lg">
            Parental Dashboard
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
          <h1 className="font-bubblegum text-4xl text-gray-800 mb-6">
            Parental Dashboard
          </h1>
          
          <div className="flex gap-8">
            {/* Left-hand menu categories */}
            <div className="w-80">
              <h2 className="font-fredoka text-2xl font-bold text-gray-800 mb-6">
                Story Categories
              </h2>
              <div className="space-y-4">
                {sortedCategories.map((category, index) => {
                  const IconComponent = category.icon;
                  const isSelected = selectedCategory === category.name;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedCategory(category.name)}
                      className={`w-full p-4 rounded-2xl bg-gradient-to-r ${category.color} text-white font-fredoka text-lg font-semibold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 flex items-center justify-between ${
                        isSelected ? 'ring-4 ring-white/50 scale-105' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-6 h-6" />
                        {category.name}
                      </div>
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                        {category.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right content area */}
            <div className="flex-1 bg-white/50 rounded-2xl p-6">
              {/* Header with screen time and recommend button */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-fredoka text-lg font-semibold text-blue-800">
                    Total Screen Time: {currentStoryData.totalScreenTime}
                  </span>
                </div>
                <Button className="bg-green-500 hover:bg-green-600 text-white font-fredoka text-lg px-6 py-2">
                  <ThumbsUp className="w-5 h-5 mr-2" />
                  Recommend Stories
                </Button>
              </div>

              {/* Category title */}
              <h3 className="font-fredoka text-2xl font-bold text-gray-800 mb-4">
                {selectedCategory} Stories
              </h3>

              {/* Stories list */}
              <div className="space-y-3">
                {currentStoryData.stories.map((story) => (
                  <div
                    key={story.id}
                    className="bg-white/70 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-fredoka text-lg font-semibold text-gray-800 mb-1">
                          {story.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {story.readTime}
                          </span>
                          <span>{story.date}</span>
                          {story.category && (
                            <span className="bg-gray-200 px-2 py-1 rounded-md text-xs">
                              {story.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-fredoka"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {currentStoryData.stories.length === 0 && (
                <div className="text-center py-8 text-gray-500 font-fredoka text-lg">
                  No stories found in this category yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentalDashboard;