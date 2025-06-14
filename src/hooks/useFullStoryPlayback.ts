
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

      // 2. Prepare and play audio
      if (audioElement.current) {
        audioElement.current.pause();
        audioElement.current = null;
      }
      const audio = new Audio(audioUrl);
      audioElement.current = audio;
      audio.preload = "auto";

      // 3. Play and synchronize highlighting
      setIsPlaying(true);

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentWordIndex(words.current.length - 1);
        clearInterval(highlightInterval.current!);
        audioElement.current = null;
      };
      audio.onerror = () => {
        setAudioErrored("Audio playback error.");
        setIsPlaying(false);
        clearInterval(highlightInterval.current!);
      };

      audio.onplay = () => {
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

      await audio.play();
    } catch (error: any) {
      setAudioErrored(error?.message || "Unknown error");
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
