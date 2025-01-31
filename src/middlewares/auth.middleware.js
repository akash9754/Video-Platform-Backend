import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken";


export const verifyJWT = asyncHandler( async ( req, _, next) => {
    try {
        const Token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if(!Token){
            throw new ApiError( 401, "Unauthorised Request");
        }
        const decodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET )
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        if (!user) {
            throw new ApiError(401, "Invailid Access Token")
        }
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invailid Access Token");
        
    }
})