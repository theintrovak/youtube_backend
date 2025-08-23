import express from "express";
import { healthcheck } from "./controller/healthcheck.controller.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/user.router.js";
const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN ,
    credentials : true
}));

app.use(express.json());
app.use(express.urlencoded({extended : true , }));
app.use(express.static("Public"))
app.use(cookieParser());


app.use("/api/v1/healthcheck" , healthcheck);
app.use("/api/v1/users" , router);
export { app } 