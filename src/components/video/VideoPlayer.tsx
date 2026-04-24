'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize,
  Minimize,
  Settings,
  PictureInPicture2,
  Loader2,
} from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  className?: string;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

export function VideoPlayer({
  src,
  poster,
  title,
  autoPlay = false,
  loop = false,
  muted: initialMuted = false,
  className,
  onEnded,
  onTimeUpdate,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  
  const hideControlsTimer = useRef<NodeJS.Timeout>();

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  // Handle volume change
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const value = parseFloat(e.target.value);
    video.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      await container.requestFullscreen();
      setIsFullscreen(true);
    }
  }, []);

  // Picture in Picture
  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await video.requestPictureInPicture();
    }
  }, []);

  // Handle progress bar click
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progress = progressRef.current;
    if (!video || !progress) return;

    const rect = progress.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * duration;
  }, [duration]);

  // Show/hide controls
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onTimeUpdate?.(video.currentTime, video.duration);
    };
    const handleDurationChange = () => setDuration(video.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('progress', handleProgress);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('progress', handleProgress);
    };
  }, [onEnded, onTimeUpdate]);

  // Fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-black rounded-lg overflow-hidden group',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={initialMuted}
        playsInline
        className="w-full h-full object-contain"
        onClick={togglePlay}
      />

      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      )}

      {/* Big Play Button */}
      {!isPlaying && !isLoading && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
        >
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center transition-transform hover:scale-110">
            <Play className="w-8 h-8 text-black ml-1" />
          </div>
        </button>
      )}

      {/* Controls */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Title */}
        {title && (
          <p className="text-white text-sm font-medium mb-2 truncate">{title}</p>
        )}

        {/* Progress */}
        <div
          ref={progressRef}
          className="relative h-1 bg-white/30 rounded-full cursor-pointer mb-3 group/progress"
          onClick={handleProgressClick}
        >
          {/* Buffered */}
          <div
            className="absolute h-full bg-white/50 rounded-full"
            style={{ width: `${(buffered / duration) * 100}%` }}
          />
          {/* Played */}
          <div
            className="absolute h-full bg-primary rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
            style={{ left: `calc(${(currentTime / duration) * 100}% - 6px)` }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1 group/volume">
              <button
                onClick={toggleMute}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-20 transition-all duration-200 accent-primary"
              />
            </div>

            {/* Time */}
            <span className="text-white text-sm ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* PiP */}
            <button
              onClick={togglePiP}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
              title="画中画"
            >
              <PictureInPicture2 className="w-5 h-5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Video Card (for video lists)
interface VideoCardProps {
  video: {
    id: number;
    title: string;
    cover?: string;
    src?: string;
    duration: number;
    views: number;
    author?: string;
  };
  onClick?: () => void;
}

export function VideoCard({ video, onClick }: VideoCardProps) {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number): string => {
    if (views >= 10000) {
      return (views / 10000).toFixed(1) + '万';
    }
    return views.toString();
  };

  return (
    <div
      className="group cursor-pointer"
      onClick={onClick}
    >
      {/* Cover */}
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden mb-2">
        {video.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.cover}
            alt={video.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        )}
        {/* Duration */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 rounded text-white text-xs">
          {formatDuration(video.duration)}
        </div>
        {/* Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-6 h-6 text-black ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div>
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          {video.author && <span>{video.author}</span>}
          <span>{formatViews(video.views)}播放</span>
        </div>
      </div>
    </div>
  );
}
