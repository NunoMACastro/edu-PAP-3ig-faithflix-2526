import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { getSearchResults } from "./search.controller.js";

export const searchRouter = Router();

searchRouter.get("/", asyncHandler(getSearchResults));