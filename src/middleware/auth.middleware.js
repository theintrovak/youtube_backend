import jwt from "jsonwebtoken";
import { apierror } from "../utils/api_error";
import { user } from "../models/user.model";
import { asyncHandler } from "../utils/AsyncHandler";

export const verifyJwt = asyncHandler(async (req , _ , next)=> {
    const accessToken = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ","")
    if(!accessToken) throw new apierror(401 , "Access token is required")
    try {
        const decoded = jwt.verify(accessToken , process.env.JWT_SECRET_KEY)
        const User = await user.findById(decoded.id).select("-password -refreshToken");
    if(!User) throw new apierror(401 , "Access token is invalid")
    req.user = User;
    next();

    } catch (error) {
    if(error.name === "TokenExpiredError"){
        throw new apierror(401 , "Access token is expired")
    }
        throw new apierror(401 , "Access token is invalid")
        
    }

})