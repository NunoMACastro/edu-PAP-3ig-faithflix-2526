import { Router } from 'express';
import { getApiInfo } from './system.controller.js';

const router = Router();
router.get('/', getApiInfo);
export default router;