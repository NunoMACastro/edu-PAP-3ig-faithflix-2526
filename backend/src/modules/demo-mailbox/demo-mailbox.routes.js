/**
 * @file Router demo-only para a caixa de email local.
 */

import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler.js";
import { postDemoMailbox } from "./demo-mailbox.controller.js";

export const demoMailboxRouter = Router();

demoMailboxRouter.post("/mailbox", asyncHandler(postDemoMailbox));
