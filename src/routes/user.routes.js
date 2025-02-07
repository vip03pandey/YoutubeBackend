import { Router } from "express";
import { registeredUsers,logoutUser } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middlewares.js"
import { JWTverify } from "../middlewares/auth.middlewares.js";


const router=Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxcount:1
        },{
            name:"coverImage",
            maxcount:1
        }
    ]),
    registeredUsers
);

router.route("/logout").post(verifyJWT,logoutUser)

export default router