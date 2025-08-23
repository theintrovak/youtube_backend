import mongoose,{ Schema} from "mongoose";

const playlistSchema = new Schema({
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    thumbnail : {
        type : String,
        required : true
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    videos : {
        type : [Schema.Types.ObjectId],
        ref : "Video",
        required : true
    }
},{
    timestamps : true
})

export const Playlist = mongoose.model("Playlist" , playlistSchema);