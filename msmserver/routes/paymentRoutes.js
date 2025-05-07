import express from "express";
import { getPaymentSheet} from "../controllers/paymentController.js";

var router = express.Router();

router.post("/paymentSheet", getPaymentSheet);

export default router;