/**
 * @file Rotas Express do modulo notifications.
 */

/**
 * Módulo de rotas de notificações.
 *
 * Protege todos os rotas com autenticação porque notificações e preferências
 * são dados privados associados ao utilizador da sessão.
 */
import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { asyncHandler } from "../../utils/async-handler.js";
import {
  getMyNotifications,
  getMyPreferences,
  patchReadNotification,
  putMyPreferences,
} from "./notifications.controller.js";

/**
 * Router de notificações internas.
 * Todas as rotas usam `requireAuth` porque preferências e mensagens pertencem a um utilizador.
 */
export const notificationsRouter = Router();

notificationsRouter.get("/", requireAuth, asyncHandler(getMyNotifications));
notificationsRouter.patch("/:id/read", requireAuth, asyncHandler(patchReadNotification));
notificationsRouter.get("/preferences/me", requireAuth, asyncHandler(getMyPreferences));
notificationsRouter.put("/preferences/me", requireAuth, asyncHandler(putMyPreferences));