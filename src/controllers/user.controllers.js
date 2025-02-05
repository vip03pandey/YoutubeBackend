import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const registeredUsers=asyncHandler(async(req,res)=>{
    const {fullName,email,password,username}=req.body
    // validation
    if([fullName,email,username,password].some((field)=>
        field?.trim()==="")
    ){
        throw new ApiError(400,"Full name is required")
    }
    const existingUser=await User.findOne({
        $or:[{username},{email}]
    })
    if(existingUser){
        throw new ApiError(400,"User already exists")
    }
    const avatarLocation=req.files?.avatar[0]?.path
    const coverLocalPath=req.files?.coverImage[0]?.path

    if(!avatarLocation&&!coverLocalPath){
        throw new ApiError(400,"Avatar and cover image are required")
    }
    const avatar=await uploadOnCloudinary(avatarLocation)
    const coverImage=await uploadOnCloudinary(coverLocalPath)

    const user=await User.create({
        fullName,
        email,
        password,
        username,
        avatar:avatar.url,
        coverImage:coverImage?.url  || ""
    })

    const createdUser=await User.findById(user._id).select
    ("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500,"Error creating user")
    }
    return res.status(201).json(new ApiResponse(201,"User created successfully",createdUser))
})


export {registeredUsers}