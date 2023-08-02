import { Schema, model } from "mongoose";

const commentSchema: Schema = new Schema({
  text: {
    type: String,
    required: true,
  },
  //   user: {
  //     type: Schema.Types.ObjectId,
  //     ref: "User",
  //   },
  //   post: {
  //     type: Schema.Types.ObjectId,
  //     ref: "Post",
  //   },
  date: {
    type: Date,
    default: Date.now,
  },
  blog: {
    type: Schema.Types.ObjectId,
    ref: "Blog",
  },
  user: {
     type: Schema.Types.ObjectId, ref: "User" 
    },
});

export default model("Comment", commentSchema);
