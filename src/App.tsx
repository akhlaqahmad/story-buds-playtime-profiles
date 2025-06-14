console.log("ParentalDashboard.tsx is loading");

import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Index from "./pages/Index";
import StoryDemo from "./pages/StoryDemo";
import NotFound from "./pages/NotFound";
import ParentalDashboard from "./pages/ParentalDashboard";
import Team from "./pages/Team";
import StoryLibrary from "./pages/StoryLibrary";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/story-demo" element={<StoryDemo />} />
          <Route path="/parental-dashboard" element={<ParentalDashboard />} />
          <Route path="/team" element={<Team />} />
          <Route path="/stories" element={<StoryLibrary />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
