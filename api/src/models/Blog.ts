import { Schema, model } from "mongoose";

const blogSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
//   author: {
//     type: Schema.Types.ObjectId,
//     ref: "User",
//   },
  date: {
    type: Date,
    required: true, //or default Date.now()
  },
  user:
    {type :Schema.Types.ObjectId, ref:"User"} //make array of it if need multiple authers
  ,
  comments:[
    {type :Schema.Types.ObjectId, ref:"Comment"}
]
});

export default model("Blog", blogSchema);
