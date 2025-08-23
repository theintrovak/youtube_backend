import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";
const dbconnect = async () =>{
    try {
        await mongoose.connect (`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log("database connected");
        
        
    } catch (error) {
        console.log(`error in db connection ${error}`);
        process.exit(1);
    }
}
export default dbconnect;
