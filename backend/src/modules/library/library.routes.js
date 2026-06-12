import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { requireAuth } from "../auth/auth.middleware.js";
import {
    deleteFavorite,
    deleteWatchlist,
    getFavorites,
    getHistory,
    getWatchlist,
    putFavorite,
    putWatchlist,
} from "./library.controller.js";

export const libraryRouter = Router();

libraryRouter.use(requireAuth);
libraryRouter.get("/favorites", asyncHandler(getFavorites));
libraryRouter.put("/favorites/:contentId", asyncHandler(putFavorite));
libraryRouter.delete("/favorites/:contentId", asyncHandler(deleteFavorite));
libraryRouter.get("/watchlist", asyncHandler(getWatchlist));
libraryRouter.put("/watchlist/:contentId", asyncHandler(putWatchlist));
libraryRouter.delete("/watchlist/:contentId", asyncHandler(deleteWatchlist));
libraryRouter.get("/history", asyncHandler(getHistory));
