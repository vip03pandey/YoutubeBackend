import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const errorHandler=async(err,req,res,next)=>{
    let error=err

    if(!(err instanceof ApiError)){
        const statusCode=err.statusCode || error instanceof mongoose.Error ? 400 : 500
    
    const message=err.message || "Something went wrong"
    error=new ApiError(statusCode,message,error?.errors || [],err.stack)
    }
    const response={
        ...error,
        message:error.message,
        ...error(process.env.NODE_ENV==="development"?{stack:error.stack}:{})
    }
    return res.status(response.statusCode).json(response)
}

export {errorHandler}