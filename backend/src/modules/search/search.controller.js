import { searchContents } from "./search.service.js";

export async function getSearchResults(req, res) {
  res.status(200).json(await searchContents(req.query));
}