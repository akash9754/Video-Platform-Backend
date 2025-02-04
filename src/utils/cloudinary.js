import { v2 as cloudinary }  from "cloudinary";
import dotenv from "dotenv/config";
// import {v2} from "cloudinary"
import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});


    const uploadOnCloudinary = async (localFilePath) => {
        try {
            if (!localFilePath) return null;
            // upload file on cloudinary
            const response = await cloudinary.uploader
            .upload(localFilePath, {
                resource_type : "auto"
            }) .catch((error) => {
                console.log(error);
            });  
            fs.unlinkSync(localFilePath)
            console.log("file is uploaded on cloudinary", response);
            console.log("response url path : ", response.url);
            return response;
        } catch (error) {
                
                 fs.unlinkSync(localFilePath)
                //  console.log("local file path :", localFilePath);
                //  console.log("in error mode in cloudinery");
                 
                // remove the locally saved temporary file when upload operation got failed
                return null
        }
    }

export { uploadOnCloudinary }




  
    
    
      
    
   