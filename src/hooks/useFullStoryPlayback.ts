
import { useRef, useState } from "react";
import { ElevenLabsAudioService } from "@/services/elevenLabsAudioService";

export const useFullStoryPlayback = () => {
  const [audioLoading, setAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioErrored, setAudioErrored] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const words = useRef<string[]>([]);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const highlightInterval = useRef<NodeJS.Timeout | null>(null);

  // Called by component to generate entire story TTS
  const generateAndPlayFullStory = async (storyContent: string) => {
    setAudioErrored(null);
    setAudioLoading(true);
    setCurrentWordIndex(0);
    setIsPlaying(false);

    // Split story into words for highlighting
    words.current = storyContent
      .replace(/[.!?]+/g, " .")
      .split(/\s+/)
      .filter((w) => w.length > 0);

    try {
      // 1. Get TTS for full story (returns a Blob URL)
      const audioUrl = await ElevenLabsAudioService.generateFullStoryAudio(storyContent);
      if (!audioUrl) throw new Error("No audio generated!");

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
        // Estimate duration per word
        const duration = audio.duration || Math.max(6, storyContent.length / 20); // fallback estimate for unknown duration
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
      // Re-sync highlighting (basic: resume from current time)
      // For simplicity, we do not re-sync word highlighting after pause/resume
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
