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
 const {accessToken , refreshToken} = await GenerateAccessAndRefreshToken(User._id);
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
});
const logoutUser = asyncHandler( async (req , res ) =>{
const User = await user.findByIdAndUpdate(req.user._id ,
    {
        $unset :{
            refreshToken : 1 
            
        }
    },{
        new : true
    }
 )
 if(!User) throw new apierror(500 , "something went wrong while logging out the user")
    const options = {
        httpOnly : true,
        secure : true
    } 
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new Apiresponse(200 ,  "user logged out successfully"))
 
   
})
const changeCurrentPassword = asyncHandler( async (req , res ) =>{
  const {oldPassword , newPassword } = req.body;
  if([oldPassword , newPassword].some((fields) => fields==="")) throw new apierror(400 , "All fields are required")  
    const User = await user.findById(req.user?._id);
if (!User) throw new apierror(404 , "User Not Found")
    const isPasswordCorrect = await User.isPasswordCorrect(oldPassword);
if(!isPasswordCorrect) throw new apierror(401, "old passoword is incorrect")
    User.password = newPassword;
await User.save({validateBeforeSave : false});
return res
.status(200)
.json(new Apiresponse(200,{}, "password changed successfully"))

})
const getCurrentUser = asyncHandler( async (req , res ) =>{
return res.status(200).json(new Apiresponse(200 , req.user , 'user found Successfully'))
})
const updateAccountDetails = asyncHandler( async (req , res ) =>{
    const {fullName , username , email} = req.body;
    if([fullName , username , email].some((fields) => fields === "")) throw new apierror(400 , "All fields are required")
        const User = await user.findByIdAndUpdate(req.user?._id ,   {
                $set :{
                    fullName : fullName,
                    username : username.toLowerCase(),
                    email : email
                }    
    },
    {
         new : true,
          select: "-password -refreshToken",
        })
        if(!User) throw new apierror(500 , "something went wrong while updating the user")
            return res
        .status(200)
        .json(new Apiresponse(200 , User , "user updated successfully"))

})
const updateUserAvatar = asyncHandler( async (req , res ) =>{
    const newAvatar = req.file?.path;
    if(!newAvatar) throw new apierror(400 , "avatar is required")
        const avatar = await uploadOnCloudinary(newAvatar);
    if(!avatar.url) throw new apierror(500 , "something went wrong in uploading the avatar")
        const User = await user.findByIdAndUpdate(req.user?._id , {
    
             $set : {
                avatar : avatar.url 
             }  
              },
            {new : true, select: "-password -refreshToken"}
        )
        if(!User) throw new apierror(500 , "something went wrong while updating the user")
        return res.status(200).json(new Apiresponse(200 , User , "avatar updated successfully"))

})
const updateCoverImage = asyncHandler( async (req , res ) =>{
     const newCoverImage = req.file?.path;
    if(!newCoverImage) throw new apierror(400 , "avatar is required")
        const coverImage = await uploadOnCloudinary(newCoverImage);
    if(!coverImage.url) throw new apierror(500 , "something went wrong in uploading the cover image")
        const User = await user.findByIdAndUpdate(req.user?._id , {
    
             $set : {
                cover_image : coverImage.url 
             }  
              },
            {new : true , select: "-password -refreshToken"}
        )
        if(!User) throw new apierror(500 , "something went wrong while updating the user")
        return res.status(200).json(new Apiresponse(200 , User , "cover image updated successfully"))
    
})
const getUserChannelProfile = asyncHandler( async (req , res ) =>{
    const{username} = req.params;
    if(!username) throw new apierror(400 , "username is required")
        const channel = await user.aggregate([
            {
                $match : {
                    username : username.toLowerCase().trim()
                }
            },{
                $lookup : {
                    from : "subscriptions",
                    localField : "_id",
                    foreignField : "channel",
                    as : "subscribers"
                }
            },{
                $lookup : {
                    from : "subscriptions",
                    localField : "_id",
                    foreignField : "subscriber",
                    as : "subscribedTo"
                }
            },{
                $addFields : {
                    subscribersCount : {
                        $size : "$subscribers"
                    },
                    subscribedToCount : {
                        $size : "$subscribedTo"
                    }
                }
            },{ $addFields : {
                     isSubscribed : {
                           $cond : {
                              if : {$ : [req.user?._id , "subscribers.subscriber"]},
                                   then : true,
                                   else : false
                            }
                        }
                    }
            },{
                $project :{
                    fullName : 1,
                    username : 1,
                    avatar : 1,
                    cover_image : 1,
                    subscribersCount : 1,
                    subscribedToCount : 1,
                    isSubscribed : 1
                }
            }
        ])
        if(!channel || channel.length === 0) throw new apierror(404 , "channel not found")
        return res.status(200).json(new Apiresponse(200 , channel[0] , "channel fetched successfully"))
    

})
const GetWatchHistory = asyncHandler( async (req , res ) => {
    const User = await user.aggregate([
        {
            $match : {
                _id : new mongoose.Types.objectId(req.user?.id)
            }
        },{
            $lookup : {
                from : "videos",
                localField : "watchHistory",
                foreignField : "_id",
                as : "watchHistory",
                pipeline : [
                    {
                    $lookup : {
                        from : "users",
                        localField : "owner",
                        foreignField : "_id",
                        as : "owner",
                        pipeline : [{
                            $project : {
                                fullName : 1,
                                username : 1,
                                avatar : 1
                            }
                            
                        }]
                    },
                },
                {
                $addFields : {
                    owner : {
                        $first : "$owner"
                    }
                }
            }
            ]
            },
            
        }
    ])
    if(!User || User.length === 0) throw new apierror(404 , "user not found ")
        return res
    .status(200)
    .json(new Apiresponse(200 , User[0]?.watchHistory , "watch history fetched successfully"))

})
const refreshAccessToken = (req , res) =>{
const  incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
} 
if(!incomingRefreshToken) throw new apierror(401 , "Refresh token is required") 

try {
    const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET_KEY);
    const User =await User.findById(decodedToken?.id)
    if(!User) throw new apierror(404 , "invalid refresh token")
        if(User.refreshToken !== incomingRefreshToken){
            throw new apierror(401 , "invalid refresh token");  
        }
        const options ={
            httpOnly : true,
            secure : process.env.NODE_ENV === "production"
        }
    const {accessToken , refreshToken: newRefreshToken} =   await  GenerateAccessAndRefreshToken(User._id);
        return res
        .status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" , newRefreshToken , options)
        .json(new Apiresponse(200  
            , {accessToken , refreshToken : newRefreshToken}
                 , "Refresh token is valid"))
} catch (error) {
throw new apierror(500 , "something went wrong while refreshing access token"
)
}
export {
    registerUser,
    userLogin,
    refreshAccessToken,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateCoverImage,
    getUserChannelProfile,
    GetWatchHistory
}