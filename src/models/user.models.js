import moongoose,{Schema} from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema=new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        fullname:{
            type:String,
            required:true,
            trim:true,
            index:true
        },
        avatar:{
            type:String,
            required:true,
        },
        coverImage:{
            type:String,
        },
        watchHistory:[
            {
               type:Schema.Types.ObjectId,
               ref:"Video" 
            }
        ],
        password:{
            type:String,
            required:[true,"password is required"]
        },
        refreshToken:{
            type:String
        }
    },
    {timestamps:true}
)

// hashing the password before saving in the database
userSchema.pre("save",async function(next){
    if(!this.isModified("password"))return next()

    this.password=await bcrypt.hash(this.password,10)
})

// comparing the password with the saved password in the database
userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function(){
   return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    }
    ,process.env.ACCESS_TOKEN_SECRET,
    {expiresIn:process.env.ACCESS_TOKEN_EXPIRES}
    )
}
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign({
         _id:this._id,
     }
     ,process.env.REFRESH_TOKEN_SECRET,
     {expiresIn:process.env.REFRESH_TOKEN_EXPIRES}
     )
 }
export const User=moongoose.model("User",userSchema)