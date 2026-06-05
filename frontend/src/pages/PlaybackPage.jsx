import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { playbackApi } from "../services/api/playbackApi.js";

const SAVE_INTERVAL_SECONDS = 15;

export function PlaybackPage() {
  const { contentId } = useParams();
  const videoRef = useRef(null);
  const lastSavedRef = useRef(0);
  const resumeAtRef = useRef(0);
  const [playback, setPlayback] = useState(null);
  const [preferences, setPreferences] = useState({ subtitleLanguage: "", audioLanguage: "pt", quality: "" });
  const [videoSrc, setVideoSrc] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    playbackApi.getPlayback(contentId)
      .then((response) => {
        setPlayback(response);
        setPreferences(response.content.preferences);
        setVideoSrc(response.content.media.playbackUrl);
      })
      .catch((requestError) => setError(requestError.message));
  }, [contentId]);

  function applySubtitlePreference(video, language) {
    Array.from(video.textTracks).forEach((track) => {
      track.mode = language && track.language === language ? "showing" : "disabled";
    });
  }

  function resolveVideoSource(nextPreferences) {
    if (!playback) {
      return videoSrc;
    }

    const selectedAudio = playback.content.tracks.audio.find(
      (track) => track.language === nextPreferences.audioLanguage,
    );
    const selectedQuality = playback.content.qualityOptions.find(
      (option) => option.value === nextPreferences.quality,
    );

    return selectedAudio?.src ?? selectedQuality?.playbackUrl ?? playback.content.media.playbackUrl;
  }

  function handleLoadedMetadata() {
    const video = videoRef.current;
    if (!video) return;

    applySubtitlePreference(video, preferences.subtitleLanguage);

    const startAt = resumeAtRef.current || playback?.progress.currentTimeSeconds || 0;
    if (startAt > 0) video.currentTime = startAt;
    resumeAtRef.current = 0;
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

  async function updatePreference(name, value) {
    const nextPreferences = { ...preferences, [name]: value };
    setPreferences(nextPreferences);
    await playbackApi.savePreferences(nextPreferences);

    if (name === "subtitleLanguage" && videoRef.current) {
      applySubtitlePreference(videoRef.current, value);
      return;
    }

    if ((name === "audioLanguage" || name === "quality") && playback && videoRef.current) {
      resumeAtRef.current = videoRef.current.currentTime;
      setVideoSrc(resolveVideoSource(nextPreferences));
    }
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
      <div className="player-controls" aria-label="Opcoes de media">
        <label>
          Legendas
          <select value={preferences.subtitleLanguage} onChange={(event) => updatePreference("subtitleLanguage", event.target.value)}>
            <option value="">Sem legendas</option>
            {playback.content.tracks.subtitles.map((track) => (
              <option key={track.language} value={track.language}>{track.label}</option>
            ))}
          </select>
        </label>
        <label>
          Audio
          <select value={preferences.audioLanguage} onChange={(event) => updatePreference("audioLanguage", event.target.value)}>
            {playback.content.tracks.audio.map((track) => (
              <option key={track.language} value={track.language}>{track.label}</option>
            ))}
          </select>
        </label>
        <label>
          Qualidade
          <select value={preferences.quality} onChange={(event) => updatePreference("quality", event.target.value)}>
            <option value="">Automatica</option>
            {playback.content.qualityOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>
      <video
        ref={videoRef}
        controls
        data-testid="faithflix-player"
        src={videoSrc}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPause={handlePause}
      >
        {playback.content.tracks.subtitles.map((track) => (
          <track key={track.language} kind="subtitles" srcLang={track.language} label={track.label} src={track.src} />
        ))}
        O teu browser nao suporta video HTML5.
      </video>
    </main>
  );
}