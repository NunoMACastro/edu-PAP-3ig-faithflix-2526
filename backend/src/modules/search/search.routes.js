import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { getSearch } from "./search.controller.js";

export const searchRouter = Router();

searchRouter.get("/", asyncHandler(getSearch));
