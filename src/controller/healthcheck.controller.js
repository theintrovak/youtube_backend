import {asyncHandler }from "../utils/AsyncHandler.js";
import {Apiresponse} from "../utils/api_response.js";

 const healthcheck = asyncHandler(async (req , res) => {
    res
    .status(200)
    .json(new Apiresponse(200 , "ok" , "healthcheck passed"))})
    export  {healthcheck}