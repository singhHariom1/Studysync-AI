import express from 'express';
import { suggestResources, resourcesHealth } from '../controllers/resourcesController.js';

const router = express.Router();

router.post('/suggest', suggestResources);
router.get('/health', resourcesHealth);

export default router; 