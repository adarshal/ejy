"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentType = exports.BlogType = exports.UserType = void 0;
const graphql_1 = require("graphql");
const Blog_1 = __importDefault(require("../models/Blog"));
const Comment_1 = __importDefault(require("../models/Comment"));
const User_1 = __importDefault(require("../models/User"));
exports.UserType = new graphql_1.GraphQLObjectType({
    name: "UserType",
    fields: () => ({
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        name: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        email: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        password: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        blogs: {
            type: new graphql_1.GraphQLList(exports.BlogType),
            async resolve(parent) {
                return await Blog_1.default.find({ user: parent.id });
            }
        },
        comments: {
            type: new graphql_1.GraphQLList(exports.CommentType),
            async resolve(parent) {
                return await Comment_1.default.find({ user: parent.id });
            }
        },
    }),
});
exports.BlogType = new graphql_1.GraphQLObjectType({
    name: "BlogType",
    fields: () => ({
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        title: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        content: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        date: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        user: {
            type: exports.UserType,
            async resolve(parent) {
                return await User_1.default.findById(parent.user);
            }
        },
        comments: {
            type: new graphql_1.GraphQLList(exports.CommentType),
            async resolve(parent) {
                return await Comment_1.default.find({ blog: parent.id });
            }
        },
    }),
});
exports.CommentType = new graphql_1.GraphQLObjectType({
    name: "CommentType",
    fields: () => ({
        id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
        text: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        // user:{type:GraphQLNonNull(GraphQLString)},
        // blog:{type:GraphQLNonNull(GraphQLString)},
        blog: {
            type: exports.BlogType,
            async resolve(parent) {
                return await Blog_1.default.findById(parent.blog);
            }
        },
        user: {
            type: exports.UserType,
            async resolve(parent) {
                return await User_1.default.findById(parent.user);
            }
        },
    }),
});
//# sourceMappingURL=schema.js.map