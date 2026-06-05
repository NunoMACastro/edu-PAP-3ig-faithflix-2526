import { addToList, listHistory, listSavedContent, removeFromList } from "./library.service.js";

export async function getFavorites(req, res) {
  res.status(200).json({ items: await listSavedContent(req.user.id, "favorite") });
}

export async function putFavorite(req, res) {
  res.status(200).json(await addToList(req.user.id, req.params.contentId, "favorite"));
}

export async function deleteFavorite(req, res) {
  res.status(200).json(await removeFromList(req.user.id, req.params.contentId, "favorite"));
}

export async function getWatchlist(req, res) {
  res.status(200).json({ items: await listSavedContent(req.user.id, "watchlist") });
}

export async function putWatchlist(req, res) {
  res.status(200).json(await addToList(req.user.id, req.params.contentId, "watchlist"));
}

export async function deleteWatchlist(req, res) {
  res.status(200).json(await removeFromList(req.user.id, req.params.contentId, "watchlist"));
}

export async function getHistory(req, res) {
  res.status(200).json({ items: await listHistory(req.user.id) });
}