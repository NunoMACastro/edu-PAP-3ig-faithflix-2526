/**
 * @file Ficheiro `real_dev/backend/src/modules/search/search.routes.js` da implementação real_dev.
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { getSearch } from "./search.controller.js";

export const searchRouter = Router();

searchRouter.get("/", asyncHandler(getSearch));
