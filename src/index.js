import app from "./app.js";
import dotenv from "dotenv/config"
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDb from "./db/dbConnection.js";
import { error } from "console";

const Port = process.env.PORT || 3000


connectDb()
.then(
    app.listen(Port, () =>{
        console.log(`server is available on port : ${Port}`);
    })
)
.catch(
    (error) => {
        console.error("database connection error", error);
    }
)





// connect database using try catch

 /*
;(async () => {
    try {
       const connection = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on('error', (error) => {
            console.log("error", error);
            throw error
        })

        app.listen(Port, () => {
            console.log("hi i am listening on ", Port);    
        })

        
    } catch (error) {
        console.error("Database Connection Error :", error.message);
        throw error
        
    }
})()
 */
