import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

// mongoose.connect('mongodb://127.0.0.1:27017/test');
const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials: true
}))


app.use(express.json({ limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser());

// import routes

import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/videos", videoRouter)

// http://localhost:4000//api/v1/users/register
export default app