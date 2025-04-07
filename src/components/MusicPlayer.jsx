import {
  Play,
  Pause,
  Shuffle,
  SkipBack,
  SkipForward,
  ListMusic,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "../MusicPlayer.css";

export default function MusicPlayer() {
  const playerRef = useRef(null);
  const youtubePlayer = useRef(null);
  const [videoTitle, setVideoTitle] = useState("Loading...");
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState("");
  const progressInterval = useRef(null);

  // Cargar la API de YouTube
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      window.onYouTubeIframeAPIReady = loadPlayer;
      document.body.appendChild(tag);
    } else {
      loadPlayer();
    }
  }, []);

  const loadPlayer = () => {
    youtubePlayer.current = new window.YT.Player(playerRef.current, {
      height: "240",
      width: "400",
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        rel: 0,
        iv_load_policy: 3,
        fs: 0,
        cc_load_policy: 0,
        playsinline: 1,
        enablejsapi: 1,
      },
      events: {
        onReady: () => {},
        onStateChange: onPlayerStateChange,
      },
    });
  };

  const onPlayerStateChange = (event) => {
    const player = youtubePlayer.current;
    const videoData = player.getVideoData();
    setVideoTitle(videoData.title || "loading...");

    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      const totalTime = player.getDuration();
      setDuration(totalTime);

      progressInterval.current = setInterval(() => {
        const currentTime = player.getCurrentTime();
        setProgress((currentTime / totalTime) * 100);
      }, 1000);
    } else {
      setIsPlaying(false);
      clearInterval(progressInterval.current);
    }
  };

  const handlePlayPause = () => {
    const player = youtubePlayer.current;
    if (!player) return;

    const state = player.getPlayerState();
    if (state === window.YT.PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const handleSeek = (e) => {
    const newProgress = parseFloat(e.target.value);
    const newTime = (newProgress / 100) * duration;
    youtubePlayer.current?.seekTo(newTime, true);
    setProgress(newProgress);
  };

  const loadPlaylist = () => {
    if (playlistUrl && youtubePlayer.current) {
      const urlParams = new URLSearchParams(new URL(playlistUrl).search);
      const listId = urlParams.get("list");

      if (listId) {
        youtubePlayer.current.loadPlaylist({
          list: listId,
          listType: "playlist",
          index: 0,
        });
      }
    }
  };

  return (
    <div className="w-[400px] h-full p-4 flex flex-col items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-main)] border-2 rounded-sm border-[var(--border-black)] shadow-[var(--shadow-soft),var(--shadow-inset-deep),var(--shadow-inset)]">

      {/* Título */}
      <h2 className="w-full flex items-center justify-center py-2 text-2xl text-[var(--text-main)] font-[var(--font-main)] border-y-2 border-[var(--border-dark)]">
        {videoTitle}
      </h2>

      {/* Reproductor de YouTube */}
      <div
        ref={playerRef}
        id="player"
        className="w-full h-[280px] rounded-md mt-2 border-2 border-[var(--border-dark)]"
      ></div>

      {/* Barra de progreso */}
      <div
        className="w-full h-fit py-4 flex flex-col justify-center items-center"
        id="audio-medibar"
      >
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="w-full h-2 bg-[var(--bg-secondary)] rounded-md cursor-pointer"
          id="seek-bar"
          style={{ "--value": `${progress}%` }}
        />
      </div>

      {/* Controles */}
      <div
        className="w-full h-20 flex justify-evenly items-center gap-2"
        id="controls"
      >
        <ControlButton
          icon={Shuffle}
          onClick={() => {
            const player = youtubePlayer.current;
            if (!player || !player.getPlaylist) return;
          
            const playlist = player.getPlaylist();
            if (!playlist || playlist.length === 0) return;
          
            const randomIndex = Math.floor(Math.random() * playlist.length);
            player.playVideoAt(randomIndex);
          }}
        />
        <ControlButton
          icon={SkipBack}
          onClick={() => youtubePlayer.current?.previousVideo()}
        />
        <button
          onClick={handlePlayPause}
          className="w-16 h-16 p-4 bg-[var(--btn-bg)] rounded-md border-2 border-[var(--btn-border)] hover:bg-[var(--btn-hover)] text-[var(--text-main)] hover:shadow-md transition-all duration-300 ease-in-out"
        >
          {isPlaying ? (
            <Pause className="w-full h-full" />
          ) : (
            <Play className="w-full h-full" />
          )}
        </button>
        <ControlButton
          icon={SkipForward}
          onClick={() => youtubePlayer.current?.nextVideo()}
        />
        <ControlButton
          className="bg-transparent border-full"
          icon={ListMusic}
          onClick={() => alert("Aquí podrías mostrar tu lista personalizada")}
        />
      </div>
      {/* Input para URL */}
      <div
        className="flex items-center justify-center flex-col gap-2 py-2"
        id="contianer-input-list"
      >
        <input
          type="text"
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
          placeholder="Pega aquí la URL de la playlist"
          size="60"
          className="flex w-full h-6 items-center justify-center text-center"
        />
        <button
          onClick={loadPlaylist}
          className="flex px-4 py-0.5 bg-[var(--btn-bg)] rounded-md border-2 border-[var(--btn-border)] text-[var(--btn-text)] hover:bg-[var(--btn-hover)] hover:shadow-md transition-all duration-300 ease-in-out"
        >
          Cargar Playlist
        </button>
      </div>
    </div>
  );
}

function ControlButton({ icon: Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-12 h-12 p-2 bg-[var(--btn-bg)] rounded-md border-2 border-[var(--btn-border)] text-[var(--btn-text)] hover:bg-[var(--btn-hover)] hover:shadow-md transition-all duration-300 ease-in-out"
    >
      <Icon className="w-full h-full" />
    </button>
  );
}
