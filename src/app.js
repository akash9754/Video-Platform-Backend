import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

// mongoose.connect('mongodb://127.0.0.1:27017/test');

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials: true
}))


app.use(express.json({ limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit16kb}))
app.use(express.static("public"))
app.use(cookieParser());

const app = express();


export default app