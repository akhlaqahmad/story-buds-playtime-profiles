
import { useState } from "react";
import { AudioServiceManager } from "@/services/audioServiceManager";
import { useAudioPlayback } from "./useAudioPlayback";
import { useWordHighlighting } from "./useWordHighlighting";

export const useFullStoryPlayback = () => {
  const { isPlaying, audioLoading, audioErrored, playAudio, pauseAudio, stopAudio } = useAudioPlayback();
  const { currentWordIndex, words, startHighlighting, stopHighlighting, resetHighlighting } = useWordHighlighting();

  const generateAndPlayFullStory = async (story: { id: string, content: string, audio_url?: string }) => {
    resetHighlighting();

    try {
      console.log('🎵 Generating and playing full story with fallback support...');
      
      // Generate audio with fallback support
      const audioUrl = await AudioServiceManager.generateStoryAudio(story);
      
      if (!audioUrl) {
        throw new Error("No audio URL received from any service!");
      }

      console.log('🎵 Audio URL received, starting playback:', audioUrl);

      // Estimate duration for highlighting (6 seconds base + content length factor)
      const estimatedDuration = Math.max(6000, story.content.length * 50);
      
      // Start word highlighting
      startHighlighting(story.content, estimatedDuration);
      
      // Play the audio
      await playAudio(audioUrl);
      
    } catch (error: any) {
      console.error('❌ Error in generateAndPlayFullStory:', error);
      stopHighlighting();
      throw error;
    }
  };

  const pauseStory = () => {
    pauseAudio();
    stopHighlighting();
  };

  const resumeStory = () => {
    // Note: This is a simplified resume - in a full implementation,
    // we'd need to track position and resume highlighting accordingly
    if (!isPlaying) {
      // For now, just resume audio playback
      // Word highlighting would need more complex state management to resume properly
    }
  };

  const restartStory = () => {
    stopAudio();
    resetHighlighting();
  };

  return {
    audioLoading,
    isPlaying,
    audioErrored,
    currentWordIndex,
    words,
    generateAndPlayFullStory,
    pauseStory,
    resumeStory,
    restartStory,
  };
};
