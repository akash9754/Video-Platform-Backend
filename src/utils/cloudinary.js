import { v2 as cloudinary }  from "cloudinary";
// import {v2} from "cloudinary"
import fs from "fs";

// cloudinary.config({ 
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//     api_key: process.env.CLOUDINARY_API_KEY, 
//     api_secret: process.env.CLOUDINARY_API_SECRET 
// });
cloudinary.config({ 
    cloud_name: 'avproject', 
    api_key: '573681414538165', 
    api_secret: 'UwrFNB7Lb3BhFQ7ps_icIRwo2Ms' // Click 'View API Keys' above to copy your API secret
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
            console.log("file is uploaded on cloudinary", response);
            console.log("response url path : ", response.url);
            return response;
        } catch (error) {
                
                //  fs.unlinkSync(localFilePath)
                 console.log("local file path :", localFilePath);
                 console.log("in error mode in cloudinery");
                 
                // remove the locally saved temporary file when upload operation got failed
                return null
        }
    }

export { uploadOnCloudinary }




  
    
    
      
    
   