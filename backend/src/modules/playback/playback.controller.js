import { getPlayback, listContinueWatching, savePlaybackProgress } from "./playback.service.js";
import { getMediaPreferences, saveMediaPreferences } from "./media-preferences.service.js";

export async function getPlaybackByContent(req, res) {
  res.status(200).json(await getPlayback(req.params.contentId, req.user.id));
}

export async function putPlaybackProgress(req, res) {
  res.status(200).json({ progress: await savePlaybackProgress(req.params.contentId, req.user.id, req.body) });
}

export async function getContinueWatching(req, res) {
  res.status(200).json({ items: await listContinueWatching(req.user.id) });
}

export async function getPlaybackPreferences(req, res) {
  res.status(200).json({ preferences: await getMediaPreferences(req.user.id) });
}

export async function putPlaybackPreferences(req, res) {
  res.status(200).json({ preferences: await saveMediaPreferences(req.user.id, req.body) });
}
