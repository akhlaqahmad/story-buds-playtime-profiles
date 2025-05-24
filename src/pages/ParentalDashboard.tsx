
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ParentalDashboard = () => {
  const navigate = useNavigate();

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
          
          {/* Add your parental dashboard content here */}
          <div className="space-y-6">
            <div className="bg-white/50 rounded-2xl p-6">
              <h2 className="font-fredoka text-2xl font-bold text-gray-800 mb-4">
                Child Profiles
              </h2>
              <p className="font-fredoka text-lg text-gray-700">
                Manage your children's profiles and preferences
              </p>
            </div>

            <div className="bg-white/50 rounded-2xl p-6">
              <h2 className="font-fredoka text-2xl font-bold text-gray-800 mb-4">
                Story History
              </h2>
              <p className="font-fredoka text-lg text-gray-700">
                View and manage story history
              </p>
            </div>

            <div className="bg-white/50 rounded-2xl p-6">
              <h2 className="font-fredoka text-2xl font-bold text-gray-800 mb-4">
                Settings
              </h2>
              <p className="font-fredoka text-lg text-gray-700">
                Adjust parental controls and preferences
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentalDashboard;