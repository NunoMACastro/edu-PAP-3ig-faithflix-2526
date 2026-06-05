import { getPlayback, listContinueWatching, savePlaybackProgress } from "./playback.service.js";

export async function getPlaybackByContent(req, res) {
  res.status(200).json(await getPlayback(req.params.contentId, req.user.id));
}

export async function putPlaybackProgress(req, res) {
  res.status(200).json({ progress: await savePlaybackProgress(req.params.contentId, req.user.id, req.body) });
}

export async function getContinueWatching(req, res) {
  res.status(200).json({ items: await listContinueWatching(req.user.id) });
}