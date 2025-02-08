import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import  jwt  from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
        try {
            const user = await User.findById(userId);
            // console.log("userId :", userId);
            // console.log("user :", user);

            
            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();
            user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false })

            return {accessToken, refreshToken}

        } catch (error) {
            throw new ApiError(500,"Something went wrong while generating Access token and refresh token");
        }
}

const registerUser = asyncHandler ( async (req, res) =>{
    //  res.status(200).json({
    //     message : "all fine no error left - askashhhhhhhh "
    // })
            const {username, fullName, email, password} = req.body
            console.log("username :", username);
            console.log("fullName :", fullName);
            console.log("email :", email);
            console.log("password :", password);
            
            
            if ([username, fullName, email, password].some( (feild) => feild?.trim() === ""))
            {
               throw new ApiError(400, "all feilds are required");
            }

           const existedUser = await User.findOne({
                $or : [{ username }, { email }]
            })

            if (existedUser) {
                throw new ApiError(409, "User name or email already exists" )
            }

            console.log("req.files :", req.files[0]);
            
            const avatarLocalPath = req.files?.avatar[0]?.path
            // const coverImageLocalPath = req.files?.coverImage[0]?.path

            let coverImageLocalPath;
            if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
                coverImageLocalPath = req.files.coverImage[0].path
            }

            // console.log("req.files : ", req.files);

            if (!avatarLocalPath) {
                throw new ApiError(400, "Avatar Files is required 1");
            }
            console.log("avtar : local path : ", avatarLocalPath);
            const avatar = await uploadOnCloudinary(avatarLocalPath);
            const coverImage = await uploadOnCloudinary(coverImageLocalPath);
            // console.log("avtar : pr : ", avatar);
            // console.log("avtar : url : ", avatar.url);
            if (!avatar) {
                throw new ApiError(400, "Avatar file is required2")
            }
            
            const user = await User.create({
                fullName,
                avatar : avatar.url,
                coverImage : coverImage?.url || "",
                 password,
                 email,
                username: username.toLowerCase()
            }) ;
            
                const createdUser = await User.findById(user._id).select(
                    "-password -refreshToken"
                )

                if (!createdUser) {
                    throw new ApiError(500, " something went wrong while createing User")
                }

                res.status(201)
                .json(
                    new ApiResponse(200, createdUser, "User Register Successfully")
                )

})

const loginUser = asyncHandler( async (req, res) => {

        const { username, email, password} = req.body
       
        if(!(username || email)) {
            throw new ApiError(401, "email or username required")
        }

        const user = await User.findOne({
           $or : [{username}, {email}] 
        })

        // const isUser = await user.isPasswordCorrect(password)
        if (!user) {
            throw new ApiError(404, "User does not exist") 
        }

        const passwordCorrect = await user.isPasswordCorrect(password);
        if (!passwordCorrect) {
            throw new ApiError(401, "wrong Password") 
        }
        console.log("userId in before to generate token ", user._id);
        
        const { accessToken, refreshToken }= await generateAccessAndRefreshToken(user._id);

        const option = {
            httpOnly : true,
            secure: true
        }

        // user = User.findById(user._id).select("-password")
        
        return res.status(200)
        .cookie('accessToken', accessToken)
        .cookie('refreshToken', refreshToken)
        .json(
            new ApiResponse(200, {
                user, accessToken, refreshToken  //optional
            }, "User Register Successfully")
        )
        
})

const logoutUser = asyncHandler( async(req, res) => {
   await User.findByIdAndUpdate(
        req.user._id,
        {
            refreshToken : undefined
        },
        {
            new: true
        }
    )

    const option = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(
        new ApiResponse(200, {}, "User Logout Succesfully")
    )
})

const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(400, "Unauthoriesed Request")
    }
    // console.log("incomingRefreshToken : ",incomingRefreshToken);
    
try {
    
       const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET );
    //    console.log("decodedToken : ",decodedToken);
       const user = await User.findById(decodedToken?._id)
    //    console.log("user : ",user);
       if (!user) {
        throw new ApiError(401,"Invailid refresh token");
        
       }
    
       if (! user?.refreshToken === incomingRefreshToken) {
            throw new ApiError(401,"Refresh Token is expired or used");
       }
    
       const option ={
        httpOnly: true,
        secure: true
       }
    
      const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
    
      return res.status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", refreshToken, option)
      .json(
        new ApiResponse(
            200,
            {accessToken, refreshToken},
            "Access Token and Refresh Token refreshed"
        )
      )
} catch (error) {
    throw new Error(401, error?.message || "Invailid refresh token");
    
}
    
})

const changeCurrentPassword = asyncHandler( async (req, res) => {
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordCorrect) {
        throw new ApiError(402, "entered Wrong Password");
    }

    user.password = newPassword
    await user.save({validateBeforeSave : false})

    return res.status(200)
    .json(
        new ApiResponse(200, {}, "Password changed Succesfully")
    )
})

const getCurrentUser = asyncHandler( async (req, res) => {
        return res.status(200)
        .json (
            new ApiResponse(200, res.user , "Current User feched Successfully" )
        )
})

const updateUserDetails = asyncHandler( async (req, res) => {
        const {fullName, email} =  req.body

        if ([fullName, email].some((feild) => feild?.trim() === "")) {
            throw new ApiError(401,"All feilds Are required");
        }

        const user = await findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    fullName,
                    email
                }
            },
            {
                new: true
            }
        ).select("-password")

        return res.status(200)
        .json(
            new ApiResponse(200, user, "User deatails updated Succesfully" )
        )

})

const updateUserAvatar = asyncHandler( async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new ApiError(400, "Avatar file is missing"); 
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar : avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res.status(200)
    .json(
        new ApiResponse(200, user, "Avatar is changed successfully")
    )

})

const updateUserCoverImage = asyncHandler( async (req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400,"Cover image file is missing");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400,"Cover image file is missing");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            coverImage : coverImage.url
        },
        {
            new: true
        }
    ).select("-password")

    return res.status(200)
    .json(
        new ApiResponse(200, user, "Cover image is changed successfully")
    )

})

const getUserChannelProfile = asyncHandler( async (req, res) => {
    const {username} = req.params

    if (!username?.trim()) {
        throw new ApiError(400, "Username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username : username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers" 
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo" 
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscriberibedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                        $cond : {
                            if: {$in : [req.user?._id, "$subscribers.subscriber"]},
                            then: true,
                            else: false
                        }
                    }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscriberibedToCount: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404,"channel does not exits");
    }

    return res.status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})


const getWatchHistory = asyncHandler( async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200)
    .json(
        new ApiResponse(200, user[0].watchHistory, "Watch History fetched succesfully")
    )
})

export { registerUser, 
        loginUser, 
        logoutUser,
        refreshAccessToken,
        changeCurrentPassword,
        getCurrentUser,
        updateUserDetails,
        updateUserAvatar,
        updateUserCoverImage,
        getUserChannelProfile,
        getWatchHistory
     }