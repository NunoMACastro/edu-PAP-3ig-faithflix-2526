import { searchContents } from "./search.service.js";

export async function getSearch(req, res) {
    return res.status(200).json(await searchContents(req.query));
}
