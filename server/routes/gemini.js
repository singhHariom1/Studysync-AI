import express from 'express';
import { getModels, askGemini } from '../controllers/geminiController.js';

const router = express.Router();

router.get('/models', getModels);
router.post('/ask', askGemini);

export default router;
