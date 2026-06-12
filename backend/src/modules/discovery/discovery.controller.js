import {
    getDiscoveryHome,
    getRelatedContent,
} from "./discovery.service.js";

export async function getDiscoveryHomeController(_req, res) {
    return res.status(200).json(await getDiscoveryHome());
}

export async function getRelatedContentController(req, res) {
    return res.status(200).json(await getRelatedContent(req.params.contentId));
}
