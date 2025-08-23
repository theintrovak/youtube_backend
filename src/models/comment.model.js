import mongoose,{ Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const commentSchema = new Schema({
    user : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    content : {
        type : String,
        required : true

    },
    video : {
        type : Schema.Types.ObjectId,
        ref : "Video",
        required : true
    },
    comment : {
        type : String,
        required : true
    },
    replies : {
        type : [Schema.Types.ObjectId],
        ref : "Comment",
        required : true
    },
    tweet : {
        type : Schema.Types.ObjectId,
        ref : "Tweet",
        required : true
    },

} , {
    timestamps : true
})

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment" , commentSchema);