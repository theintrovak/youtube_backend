import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema = new Schema({
    username : {
        type : String,
        required : true,
        unique :true,
        trim :true,
        lowercase : true,
    },
    email : {
       type : String,
       require : true,
       unique : true,
       trim : true,
       lowercase : true
    },
    fullName : {
         type : String,
       require : true,
       trim : true,
       lowercase : true
    },
    avatar : {
        type : String ,//cloudinary url
        required : true,
    },
    cover_image : {
        type : String , //cloudinary url
       
    },
    watch_history : {
        type : [Schema.Types.ObjectId],
        ref : "video"
    },
    password : {
        type : String,
        required : [true,"the password is required "]
    },
    refresh_token : {
        type : String,
    }
},
{
    timestamps : true
})
userSchema.pre("save", async function (next){
    console.log("DEBUG inside pre-save, password:", this.password);
    if(!this.isModified("password")) return  next();
   try {
     this.password = await bcrypt.hash(this.password , 10);
     next();
   } catch (error) {
    next(error);
    
   }
   if (!this.password) {
  return next(new Error("Password is missing, cannot hash"));
}
})
userSchema.methods.ispasswordCorrect = async function (password){
    return await bcrypt.compare(password , this.password);
}
userSchema.methods.generateAccessToken = function(){
    return jwt
        .sign({id : this._id,
            email : this.email,
            username : this.username,
            fullName : this.fullName
        } ,
         process.env.JWT_SECRET_KEY ,
         {expiresIn :process.env.JWT_EXPIRY })
}
userSchema.methods.generateRefreshToken = function(){
    return jwt
        .sign({id : this._id,
            
        } ,
         process.env.REFRESH_TOKEN_SECRET_KEY ,
         {expiresIn :process.env.REFRESH_TOKEN_EXPIRY })
}
export const user = mongoose.model("user",userSchema)