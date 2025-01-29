import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

 const connectDb = async () => {

    try {
         const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
         console.log(`connwction successfull : ${connectionInstance.connection.host}`);
         
    } catch (error) {
        console.error("connection error", error);
        process.exit(1)
    }
 }

 export default connectDb