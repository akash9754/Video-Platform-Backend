import app from "./app.js";
import dotenv from "dotenv/config"

const Port = process.env.PORT || 3000

app.listen(Port, () => {
    console.log("hi i am listening on ", Port);
    
})