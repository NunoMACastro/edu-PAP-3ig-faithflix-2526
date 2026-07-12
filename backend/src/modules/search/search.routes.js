/**
 * @file Ficheiro `real_dev/backend/src/modules/search/search.routes.js` da implementação real_dev.
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import {
    rateLimit,
    rateLimitKeys,
} from "../../middlewares/rate-limit.middleware.js";
import { getSearch } from "./search.controller.js";

export const searchRouter = Router();

const searchLimit = rateLimit({
    scope: "search:ip",
    limit: 120,
    windowMs: 60_000,
    key: rateLimitKeys.ip,
});

searchRouter.get("/", searchLimit, asyncHandler(getSearch));
