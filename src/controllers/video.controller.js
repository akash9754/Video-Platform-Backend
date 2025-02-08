import { Video } from "../models/video.model";
import { User } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { uploadOnCloudinary } from "../utils/cloudinary";

const getAllVideos = asyncHandler ( async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    
})