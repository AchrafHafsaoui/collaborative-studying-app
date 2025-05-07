import express from 'express';
import { getPaths, getBubbles, getLock } from '../controllers/whiteboardController.js';

var router = express.Router();

router.post('/paths', getPaths); 
router.post('/bubbles', getBubbles); 
router.post('/lock', getLock); 
export default router;
