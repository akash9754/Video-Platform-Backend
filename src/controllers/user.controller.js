import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccessAndRefreshToken = async (userId) => {
        try {
            const user = User.findById(userId);
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

        const passwordCorrect = await user.isPasswordCorrect(user);
        if (!passwordCorrect) {
            throw new ApiError(401, "wrong Password") 
        }

        const { accessToken, refreshToken }= await generateAccessAndRefreshToken(user._id);

        const option = {
            httpOnly : true,
            secure: true
        }


        return res.status(200)
        .cookie('accessToken', accessToken)
        .cookie('refreshToken', refreshToken)
        .json(
            new ApiResponse(200, {
                username, accessToken, refreshToken  //optional
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

    const option {
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

export { registerUser, loginUser, logoutUser }