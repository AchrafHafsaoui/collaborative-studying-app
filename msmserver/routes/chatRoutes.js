import express from "express";
import { getChatHistory } from "../controllers/chatController.js";

var router = express.Router();

router.post("/history", getChatHistory);

export default router;