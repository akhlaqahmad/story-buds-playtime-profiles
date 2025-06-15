
import { useRef, useState } from "react";
import { ElevenLabsAudioService } from "@/services/elevenLabsAudioService";
import { StoryGenerator } from "@/services/storyGenerator";

export const useFullStoryPlayback = () => {
  const [audioLoading, setAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioErrored, setAudioErrored] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const words = useRef<string[]>([]);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const highlightInterval = useRef<NodeJS.Timeout | null>(null);

  // Modify this API so the component provides { id, content, audio_url }
  const generateAndPlayFullStory = async (story: { id: string, content: string, audio_url?: string }) => {
    setAudioErrored(null);
    setAudioLoading(true);
    setCurrentWordIndex(0);
    setIsPlaying(false);

    // Split story into words for highlighting
    words.current = story.content
      .replace(/[.!?]+/g, " .")
      .split(/\s+/)
      .filter((w) => w.length > 0);

    try {
      // 1. Try to get or create the story audio (uses cache if present)
      const audioUrl = await ElevenLabsAudioService.getOrCreateCachedStoryAudio(story);
      if (!audioUrl) throw new Error("No audio available!");

      console.log('🎵 Audio URL received:', audioUrl);

      // 2. Prepare and play audio with better error handling
      if (audioElement.current) {
        audioElement.current.pause();
        audioElement.current = null;
      }

      const audio = new Audio();
      audioElement.current = audio;
      
      // Set up error handling before setting the source
      audio.onerror = (error) => {
        console.error('❌ Audio error:', error);
        setAudioErrored("Failed to load audio. The audio file may be corrupted or inaccessible.");
        setIsPlaying(false);
        setAudioLoading(false);
        clearInterval(highlightInterval.current!);
      };

      audio.onloadstart = () => {
        console.log('🔄 Audio loading started');
      };

      audio.oncanplay = () => {
        console.log('✅ Audio can play');
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentWordIndex(words.current.length - 1);
        clearInterval(highlightInterval.current!);
        audioElement.current = null;
      };

      audio.onplay = () => {
        console.log('▶️ Audio started playing');
        const duration = audio.duration || Math.max(6, story.content.length / 20);
        const highlightMs = (duration * 1000) / words.current.length;
        let index = 0;

        highlightInterval.current = setInterval(() => {
          setCurrentWordIndex(index);
          index++;
          if (index >= words.current.length) {
            clearInterval(highlightInterval.current!);
          }
        }, highlightMs);
      };

      // Add CORS headers for Supabase storage if needed
      if (audioUrl.includes('supabase.co/storage')) {
        audio.crossOrigin = 'anonymous';
      }

      // Set the source and preload
      audio.src = audioUrl;
      audio.preload = "auto";

      // 3. Wait for the audio to be ready and then play
      await new Promise((resolve, reject) => {
        const handleCanPlay = () => {
          audio.removeEventListener('canplay', handleCanPlay);
          audio.removeEventListener('error', handleError);
          resolve(void 0);
        };

        const handleError = (error: Event) => {
          audio.removeEventListener('canplay', handleCanPlay);
          audio.removeEventListener('error', handleError);
          reject(new Error('Audio failed to load'));
        };

        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);

        // Force load the audio
        audio.load();
      });

      setIsPlaying(true);
      await audio.play();
      
    } catch (error: any) {
      console.error('❌ Error in generateAndPlayFullStory:', error);
      setAudioErrored(error?.message || "Unknown error occurred while loading audio");
      setIsPlaying(false);
      clearInterval(highlightInterval.current!);
    } finally {
      setAudioLoading(false);
    }
  };

  const pauseStory = () => {
    audioElement.current?.pause();
    setIsPlaying(false);
    if (highlightInterval.current) clearInterval(highlightInterval.current);
  };

  const resumeStory = () => {
    if (audioElement.current && !isPlaying) {
      audioElement.current.play();
      setIsPlaying(true);
    }
  };

  const restartStory = () => {
    if (audioElement.current) {
      audioElement.current.pause();
      audioElement.current.currentTime = 0;
      audioElement.current = null;
    }
    setCurrentWordIndex(0);
    setIsPlaying(false);
    setAudioErrored(null);
    if (highlightInterval.current) clearInterval(highlightInterval.current);
  };

  return {
    audioLoading,
    isPlaying,
    audioErrored,
    currentWordIndex,
    words: words.current,
    generateAndPlayFullStory,
    pauseStory,
    resumeStory,
    restartStory,
  };
};
