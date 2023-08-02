"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_1 = require("graphql");
const schema_1 = require("../schema/schema");
const User_1 = __importDefault(require("../models/User"));
const Blog_1 = __importDefault(require("../models/Blog"));
const Comment_1 = __importDefault(require("../models/Comment"));
const mongoose_1 = require("mongoose");
const bcryptjs_1 = require("bcryptjs");
const RootQuery = new graphql_1.GraphQLObjectType({
    name: "RootQuery",
    fields: {
        //get all user
        users: {
            type: new graphql_1.GraphQLList(schema_1.UserType),
            async resolve() {
                return await User_1.default.find();
            },
        },
        //get all blogs
        blogs: {
            type: new graphql_1.GraphQLList(schema_1.BlogType),
            async resolve(parent, args) {
                return await Blog_1.default.find();
            },
        },
        //get all comments
        comments: {
            type: new graphql_1.GraphQLList(schema_1.CommentType),
            async resolve(parent, args) {
                return await Comment_1.default.find();
            },
        },
        // get user by ID
        user: {
            type: schema_1.UserType,
            args: {
                id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) }
            },
            async resolve(parent, { id }) {
                return User_1.default.findById(id).populate("blogs");
            }
        },
        blogsByUserId: {
            type: new graphql_1.GraphQLList(schema_1.BlogType),
            args: {
                id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
            },
            async resolve(parent, { id }) {
                return Blog_1.default.find({ user: id });
            },
        },
        //get blog by iD 
        blog: {
            type: schema_1.BlogType,
            args: {
                id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) }
            },
            async resolve(parent, { id }) {
                return await Blog_1.default.findById(id).populate("comments").populate("user");
            }
        },
    },
});
//mutations
const mutations = new graphql_1.GraphQLObjectType({
    name: "mutations",
    fields: {
        // user signup
        signup: {
            type: schema_1.UserType,
            args: {
                name: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                email: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                password: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
            },
            async resolve(parent, { name, email, password }) {
                let existingUser;
                try {
                    existingUser = await User_1.default.findOne({ email });
                    if (existingUser) {
                        return new Error("USer Already Exits");
                    }
                    const encryptPassword = (0, bcryptjs_1.hashSync)(password);
                    const user = new User_1.default({ name, email, password: encryptPassword });
                    const savedUser = await user.save();
                    return savedUser;
                }
                catch (err) {
                    return new Error("User signup failed");
                }
            },
        },
        //user login
        login: {
            type: schema_1.UserType,
            args: {
                email: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                password: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
            },
            async resolve(parent, { email, password }) {
                try {
                    const user = await User_1.default.findOne({ email });
                    if (!user) {
                        return new Error("User not found");
                    }
                    const isValidPassword = (0, bcryptjs_1.compareSync)(password, user.password);
                    if (!isValidPassword) {
                        return new Error("Password Incorrect");
                    }
                    else {
                        // const token=sign({_id:user._id},process.env.TOKEN_SECRET,{
                        //     expiresIn:"1d"
                        //     });
                        //     return {
                        //         token,
                        //         user:{
                        //             _id:user._id,
                        //             name:user.name,
                        //             email:user.email
                        //             }
                        //             }
                        return user;
                    }
                }
                catch {
                    return new Error("err in signin");
                }
            },
        },
        // create blog
        addBlog: {
            type: schema_1.BlogType,
            args: {
                title: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                content: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                // author: { type: new GraphQLNonNull(GraphQLString) },
                date: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                user: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
            },
            async resolve(parent, { title, content, date, user }) {
                //async resolve(parent, args, { user })
                // if (!user) {
                //   return new Error("You must be logged in to create a blog");
                // }
                const session = await (0, mongoose_1.startSession)();
                try {
                    session.startTransaction({ session });
                    const blog = new Blog_1.default({
                        title,
                        content,
                        date,
                        user,
                    });
                    const existingUser = await User_1.default.findById(user);
                    if (!existingUser) {
                        return new Error("User not found, exiting");
                    }
                    // session.startTransaction({session}); //moved up
                    existingUser.blogs.push(blog);
                    await existingUser.save({ session });
                    const newBlog = await blog.save({ session });
                    return newBlog;
                }
                catch {
                    return new Error("err in creating blog");
                }
                finally {
                    await session.commitTransaction();
                }
            },
        },
        //update Blog
        updateBlog: {
            type: schema_1.BlogType,
            args: {
                id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
                title: { type: graphql_1.GraphQLString },
                content: { type: graphql_1.GraphQLString },
                date: { type: graphql_1.GraphQLString },
            },
            async resolve(parent, args) {
                //async resolve(parent, args, { user })
                // if (!user) {
                //     return new Error("You must be logged in to update a blog");
                //     }
                try {
                    const blog = await Blog_1.default.findById(args.id);
                    if (!blog) {
                        return new Error("Blog not found");
                    }
                    if (args.title) {
                        blog.title = args.title;
                    }
                    if (args.content) {
                        blog.content = args.content;
                    }
                    if (args.date) {
                        blog.date = args.date;
                    }
                    const updatedBlog = await blog.save();
                    return updatedBlog;
                }
                catch (err) {
                    return new Error("err in updating Blog");
                }
            },
        },
        // delete blog
        deleteBlog: {
            type: schema_1.BlogType,
            args: {
                id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
            },
            async resolve(parent, args) {
                // async resolve(parent, args, { user })
                // if (!user) {
                //     return new Error("You must be logged in to delete a blog");
                //     }
                const session = await (0, mongoose_1.startSession)();
                try {
                    session.startTransaction({ session });
                    const existingBlog = await Blog_1.default.findById(args.id).populate("user");
                    if (!existingBlog) {
                        return new Error("Blog not found");
                    }
                    const existingUser = await existingBlog.user;
                    if (!existingUser) {
                        return new Error("User not found");
                    }
                    existingUser.blogs.pull(existingBlog);
                    await existingUser.save({ session });
                    return await Blog_1.default.findByIdAndDelete(args.id).session(session);
                }
                catch (err) {
                    return new Error(err);
                }
                finally {
                    await session.commitTransaction();
                }
            },
        },
        // add comments
        addComment: {
            type: schema_1.CommentType,
            args: {
                text: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
                blog: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
                user: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID) },
                date: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
            },
            async resolve(parent, { text, blog, user, date }) {
                const session = await (0, mongoose_1.startSession)();
                try {
                    session.startTransaction({ session });
                    const existingUser = await User_1.default.findById(user);
                    if (!existingUser) {
                        return new Error("User not found, exiting");
                    }
                    const newComment = new Comment_1.default({
                        text: text,
                        blog: blog,
                        user: user,
                        date: date,
                    });
                    const existingBlog = await Blog_1.default.findById(blog);
                    if (!existingBlog) {
                        return new Error("Blog not found, exiting");
                    }
                    // existingUser.comments.push(newComment)
                    // blog.comments.push(newComment)
                    // await blog.save({session});
                    // await existingUser.save({session})
                    // return await newComment.save({session})
                    const savedComment = await newComment.save();
                    const updatedBlog = await existingBlog.updateOne(
                    // { _id: blog }, //not needed if we found one and not using Blog.updtateOne
                    { $push: { comments: savedComment._id } }, { session });
                    const updatedUser = await existingBlog.updateOne(
                    // {_id:user},
                    { $push: { comments: savedComment._id } }, { session });
                    return savedComment;
                }
                catch (err) {
                    return new Error(err);
                }
                finally {
                    await session.commitTransaction();
                }
            },
        },
        //delete comment
        deleteComment: {
            type: schema_1.CommentType,
            args: {
                id: { type: graphql_1.GraphQLID },
            },
            resolve: async (parent, { id }) => {
                const session = await (0, mongoose_1.startSession)();
                try {
                    session.startTransaction({ session });
                    const comment = await Comment_1.default.findById(id);
                    if (!comment) {
                        return new Error("Comment not found, exiting");
                    }
                    const existingUser = await User_1.default.findById(comment?.user);
                    if (!existingUser) {
                        return new Error("user not found, exiting");
                    }
                    const existingBlog = await Blog_1.default.findById(comment?.blog);
                    if (!existingBlog) {
                        return new Error("uBlogser not found, exiting");
                    }
                    existingUser.comments.pull(comment);
                    existingBlog.comments.pull(comment);
                    await existingUser.save({ session });
                    await existingBlog.save({ session });
                    // const deletedComment = (await Comment.findByIdAndDelete(id)).$session(
                    //   session
                    // );
                    // return deletedComment;
                    const deletedComment = await Comment_1.default.findByIdAndDelete(id).session(session);
                    return deletedComment;
                }
                catch (err) {
                    return new Error(err);
                }
                finally {
                    await session.commitTransaction();
                }
            },
        },
    },
});
exports.default = new graphql_1.GraphQLSchema({ query: RootQuery, mutation: mutations });
//# sourceMappingURL=handlers.js.map