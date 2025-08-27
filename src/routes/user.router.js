import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, GetWatchHistory, logoutUser, registerUser, updateAccountDetails, updateCoverImage, updateUserAvatar, userLogin } from "../controller/user.controller.js";
import {upload} from "../middleware/multer.middleware.js"
import { verifyJwt } from "../middleware/auth.middleware.js";
const router = Router();
// unsecured routes
router.route("/login").post(userLogin);
router.route("/refresh").post(  logoutUser)



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
//secured routes
router.route("/logout").post( verifyJwt ,logoutUser);
router.route("/change-password").post( verifyJwt ,changeCurrentPassword);
router.route("/get-user").post( verifyJwt ,getCurrentUser);
router.route("/profile").post( verifyJwt ,getUserChannelProfile);
router.route("/update-profile").patch( verifyJwt ,updateAccountDetails);
router.route("/update-avatar").patch( verifyJwt ,upload.single("avatar"),updateUserAvatar);
router.route("/update-cover").patch( verifyJwt ,upload.single("cover_image"),updateCoverImage);
router.route("/history").post( verifyJwt ,GetWatchHistory);


export default router;