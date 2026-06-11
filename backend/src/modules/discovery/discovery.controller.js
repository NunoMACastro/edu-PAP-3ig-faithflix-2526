import { getDiscoveryHome, getRelatedContent } from "./discovery.service.js";

export async function getHomeDiscovery(req, res) {
  res.status(200).json(await getDiscoveryHome());
}

export async function getRelatedDiscovery(req, res) {
  res.status(200).json(await getRelatedContent(req.params.contentId));
}