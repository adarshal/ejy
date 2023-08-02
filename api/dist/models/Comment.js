"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Blog",
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId, ref: "User"
    },
});
exports.default = (0, mongoose_1.model)("Comment", commentSchema);
//# sourceMappingURL=Comment.js.map