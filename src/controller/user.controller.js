import {asyncHandler }from "../utils/AsyncHandler.js";
import {user} from "../models/user.model.js";
import {apierror} from "../utils/api_error.js";
import { uploadOnCloudinary , deleteFromCloudinary } from "../utils/cloudinary.js";
import { Apiresponse } from "../utils/api_response.js";

const GenerateAccessAndRefreshToken = (userId) =>{
    try {
        const User = user.findById(userId);
        if(!User) throw new apierror(404 , "User not found")
        const accessToken = User.generateAccessToken();
        const refreshToken = User.generateRefreshToken();
        User.accessToken = accessToken;
        User.refreshToken = refreshToken;
        refreshToken.save(validationBeforeSave = false);
        accessToken.save(validationBeforeSave = false);
        return {accessToken , refreshToken};
    } catch (error) {
        console.log("error in generating access and refresh token" , error);
        throw new apierror(500 , "Server error")
        
    }


} 
const userLogin = asyncHandler( async (req , res ) =>{
const {email , username , password} = req.body;
if ([email , username ,password].some((fields) => fields = "")) {
    throw new apierror(400 , "All fields are required")
}

const User = await user.findOne({
    $or : [{username} , {email}]
})
 if(!User) throw new apierror(404 , "User not found")
 const isPasswordCorrect = await User.ispasswordCorrect(password);
 if(!isPasswordCorrect) throw new apierror(401 , "Password is incorrect")
 const {accessToken , refreshToken} = GenerateAccessAndRefreshToken(User._id);
const loggedInUser = await User.findById(User._id).select("-password -refreshToken");
if(!loggedInUser) throw new apierror(500 , "something went wrong while logging in the user")
const options = {
    httpOnly : true,
    secure : process.env.NODE_ENV === "production",
}  
return res 
     .status(200)
     .cookie("accessToken" , accessToken , options)
     .cookie("refreshToken" , refreshToken , options)
     .json(new Apiresponse(200 , { User : loggedInUser , accessToken , refreshToken} , "User logged in successfully"))
 
});

const registerUser = asyncHandler( async (req , res ) =>{
    const { fullName , username , email , password} = req.body
    
    
    if([ fullName ,username , email , password].some((fields) => fields==="")) throw new apierror(400 , "All fields are required")
   const isUserExist = await user.findOne({
    $or: [{username},{email}]
   });
   console.log("REQ BODY:", req.body);
   

   if(isUserExist) throw new apierror(409 , "User already exist")
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverLocalPath = req.files?.cover_image?.[0]?.path;

    if(!avatarLocalPath) throw new apierror(400 , "Avatar is required")

    let avatar , cover;    
  try {
     avatar = await uploadOnCloudinary(avatarLocalPath);
     console.log("file uploaded on cloudinary successfully  ", avatar);
  } catch (error) {
        console.log("error in uploading avatar" , error);
        throw new apierror(500 , "Avatar upload failed")
  }
  
  try {
       if(coverLocalPath){
           cover = await uploadOnCloudinary(coverLocalPath);
          console.log("file uploaded on cloudinary successfully : file source = "+ cover);
          
         }          
  } catch (error) {
        console.log("error in uploading cover image" , error);
        throw new apierror(500 , "cover upload failed")
    
  }
  console.log("BODY:", req.body);
console.log("FILES:", req.files);
       

    try {
        const newUser = await user.create({
            fullName : fullName,
            username : username.toLowerCase(),
            email : email,
            password : password,
            avatar : avatar?.url,
            cover_image : cover?.url || ""
        })
        const createdUser = await user.findById(newUser._id).select("-password -refreshToken");
        
        if(!createdUser) throw new apierror(500 , "something went wrong while registering the user")
         return res
        .status(201)
        .json(new Apiresponse(201 , createdUser , "User registered successfully"))
    } catch (error) {
        console.log("user connection error" , error);
        if(avatar) await deleteFromCloudinary(avatar.public_id);
        if(cover) await deleteFromCloudinary(cover.public_id);
        throw new apierror(500 , "something went wrong while registering the user and images were deleted from cloudinary")
        
    }
})
export {
    registerUser,
    userLogin
}