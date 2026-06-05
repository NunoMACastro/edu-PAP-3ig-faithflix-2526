import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { playbackApi } from "../services/api/playbackApi.js";

const SAVE_INTERVAL_SECONDS = 15;

export function PlaybackPage() {
  const { contentId } = useParams();
  const videoRef = useRef(null);
  const lastSavedRef = useRef(0);
  const [playback, setPlayback] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    playbackApi.getPlayback(contentId)
      .then((response) => setPlayback(response))
      .catch((requestError) => setError(requestError.message));
  }, [contentId]);

  function handleLoadedMetadata() {
    if (!videoRef.current || !playback?.progress.currentTimeSeconds) return;
    videoRef.current.currentTime = playback.progress.currentTimeSeconds;
  }

  function handleTimeUpdate() {
    const video = videoRef.current;
    if (!video) return;

    if (Math.abs(video.currentTime - lastSavedRef.current) < SAVE_INTERVAL_SECONDS) {
      return;
    }

    lastSavedRef.current = video.currentTime;
    playbackApi.saveProgress(contentId, video.currentTime).catch(() => {});
  }

  async function handlePause() {
    const video = videoRef.current;
    if (video) await playbackApi.saveProgress(contentId, video.currentTime);
  }

  if (error) {
    return <main className="page-shell"><p role="alert">{error}</p></main>;
  }

  if (!playback) {
    return <main className="page-shell"><p>A carregar player...</p></main>;
  }

  return (
    <main className="page-shell">
      <h1>{playback.content.title}</h1>
      <video
        ref={videoRef}
        controls
        data-testid="faithflix-player"
        src={playback.content.media.playbackUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPause={handlePause}
      >
        O teu browser nao suporta video HTML5.
      </video>
    </main>
  );
}