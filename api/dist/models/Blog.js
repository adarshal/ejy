"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const blogSchema = new mongoose_1.Schema({
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
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" } //make array of it if need multiple authers
    ,
    comments: [
        { type: mongoose_1.Schema.Types.ObjectId, ref: "Comment" }
    ]
});
exports.default = (0, mongoose_1.model)("Blog", blogSchema);
//# sourceMappingURL=Blog.js.map