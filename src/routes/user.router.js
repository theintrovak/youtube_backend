import { Router } from "express";
import { registerUser } from "../controller/user.controller.js";
import {upload} from "../middleware/multer.middleware.js"
const router = Router();


router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "cover_image",
            maxCount : 1
        }
    ]),
    
    registerUser);


export default router;