import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { getHomeDiscovery, getRelatedDiscovery } from "./discovery.controller.js";

export const discoveryRouter = Router();

discoveryRouter.get("/home", asyncHandler(getHomeDiscovery));
discoveryRouter.get("/related/:contentId", asyncHandler(getRelatedDiscovery));