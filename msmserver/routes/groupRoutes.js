import express from "express";
import { createGroup, getGroups, joinGroup, removeMember, getMemberDetails, getPublic, addRating, getGroupall, changeAdmin, updateImage  } from '../controllers/groupController.js';

var router = express.Router();

router.get("/getGroups", getGroups);
router.get("/getGroupall", getGroupall);
router.post("/createGroup", createGroup);
router.post("/joinGroup", joinGroup);
router.post("/changeAdmin", changeAdmin);
router.post("/removeMember", removeMember);
router.get("/creategroup", getMemberDetails);
router.get("/addRating", addRating);
router.post("/getPublic", getPublic);
router.patch("/updateImage", updateImage);

export default router;