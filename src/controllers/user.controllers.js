import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registeredUsers = asyncHandler(async (req, res) => {
    const {fullname, email, username, password } = req.body
    // console.log("email: ", email);

    if (
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    try {
        const user = await User.create({
            fullname,
            avatar: avatar.secure_url,
            coverImage: coverImage?.url || "",
            email, 
            password,
            username: username.toLowerCase()
        })
    
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
    
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user")
        }
    
        return res.status(201).json(
            new ApiResponse(200, createdUser, "User registered Successfully")
        )
    } catch (error) {
        console.error("Error creating user", error);

        // Cleanup on failure
        if (avatar?.public_id) {
          await deleteFromCloudinary(avatar.public_id);
        }
        if (coverImage?.public_id) {
          await deleteFromCloudinary(coverImage.public_id);
        }
    
        throw new ApiError(500, "Error creating user and images cleaned up");
    }
});

const generateAccessAndRefreshToken = async (userId) => {
   try {
     const user = await User.findById(userId);
     if(!user){
         throw new ApiError(404,"User not found")
     }
     const AccessToken=user.generateAccessToken()
     const RefreshToken=user.generateRefreshToken()
 
     user.refreshToken=RefreshToken
     await user.save({validateBeforeSave:false})
     return {AccessToken,RefreshToken}
   } catch (error) {
    throw new ApiError(500,"Error generating access and refresh token")
   }
}

const loginUser = asyncHandler(async (req, res) => {
    const {email, password,username } = req.body
    // console.log("email: ", email);
    if (!email || !password || !username) {
        throw new ApiError(400, "Email,Username and password are required")
    }
    try{
        const user = await User.findOne({email},{username})
        if(!user){
            throw new ApiError(404,"User not found")
        }
        if(!await user.isPasswordCorrect(password)){
            throw new ApiError(401,"Invalid email or password")
        }
        const {AccessToken,RefreshToken}=await generateAccessAndRefreshToken(user._id)
        const loggedInUser=await User.findById(user._id).select(
            "-password -refreshToken"
        )
        if(!loggedInUser){
            throw new ApiError(500,"Error logging in user")
        }
        const options={
            httpOnly:true,
            secure:process.env.NODE_ENV==="production",
        }
        return res.status(200).json(
            new ApiResponse(200,{user:loggedInUser,AccessToken,RefreshToken},"User logged in successfully")
        )
    }
    catch(error){
        throw new ApiError(500,"Error logging in user")
    }
})

export { registeredUsers,generateAccessAndRefreshToken,loginUser };
