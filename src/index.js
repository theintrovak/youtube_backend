import { app } from "./app.js";
import dotenv from "dotenv";
import dbconnect from "./db/index.js";

dotenv.config({path: "./.env"});

const Port = process.env.SERVER_PORT || 3000;
app.listen(Port , () => {
    console.log(`server is running on port ${Port}`);
    
})
dbconnect()
.then(()=> {console.log("db connected")})
.catch((err) => console.log(`error on connecting to db ${err}`));
