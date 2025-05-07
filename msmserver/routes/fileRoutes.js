import express from "express";
import { uploadFile, downloadFile, getFileList} from "../controllers/fileController.js";
import multer from 'multer';

const upload = multer({ dest: 'uploads/' })
var router = express.Router();

router.post("/upload", upload.single('data'), uploadFile);
router.get("/download", downloadFile);
router.get("/list", getFileList);

export default router;