import {
    getMediaPreferences,
    saveMediaPreferences,
} from "./media-preferences.service.js";
import {
    getPlayback,
    listContinueWatching,
    savePlaybackProgress,
} from "./playback.service.js";

export async function getPlaybackByContent(req, res) {
    return res
        .status(200)
        .json(await getPlayback(req.params.contentId, req.user.id));
}

export async function putPlaybackProgress(req, res) {
    return res.status(200).json({
        progress: await savePlaybackProgress(
            req.params.contentId,
            req.user.id,
            req.body,
        ),
    });
}

export async function getContinueWatching(req, res) {
    return res
        .status(200)
        .json({ items: await listContinueWatching(req.user.id) });
}

export async function getPlaybackPreferences(req, res) {
    return res
        .status(200)
        .json({ preferences: await getMediaPreferences(req.user.id) });
}

export async function putPlaybackPreferences(req, res) {
    return res.status(200).json({
        preferences: await saveMediaPreferences(req.user.id, req.body),
    });
}
