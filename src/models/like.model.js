import mongoose,{Schema} from "mongoose";

const likeSchema = new Schema({
    user : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    video : {
        type : Schema.Types.ObjectId,
        ref : "Video",
        required : true
    },
    likedby : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    tweet : {
        type : Schema.Types.ObjectId,
        ref : "Tweet",
        required : true
    }
} , {
    timestamps : true
})

export const Like = mongoose.model("Like" , likeSchema);