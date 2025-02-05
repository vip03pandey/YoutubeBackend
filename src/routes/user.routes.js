import { Router } from "express";
import { registeredUsers } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middlewares.js"


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

export default router