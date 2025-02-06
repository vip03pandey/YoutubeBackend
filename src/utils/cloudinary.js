import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import dotenv from "dotenv"
dotenv.config()
// configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary=async(localFilePath)=>{
    try{
        if(!localFilePath)return null
        const response=await cloudinary.uploader.upload(localFilePath,{
            resource_type:"image"
        }
        
    )
    console.log("File uploaded successfully",response.url)
    fs.unlinkSync(localFilePath)
    return response
    }
    catch(err){
        fs.unlinkSync(localFilePath)
        return null
    }
}

const deleteFromCloudinary=async(publicId)=>{
    try{
        const response=await cloudinary.uploader.destroy(publicId)
        console.log("File deleted successfully",response.url)
    }
    catch(err){
        console.error("Error deleting from cloudinary",err)
        return null
    }
}

export {uploadOnCloudinary,deleteFromCloudinary}