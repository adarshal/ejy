import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLNonNull,
  GraphQLID,
} from "graphql";
import { BlogType, CommentType, UserType } from "../schema/schema";
import User from "../models/User";
import Blog from "../models/Blog";
import Comment from "../models/Comment";
import { Document, startSession } from "mongoose";
import { compareSync, hashSync } from "bcryptjs";
import { sign } from "crypto";
const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    //get all user
    users: {
      type: new GraphQLList(UserType),
      async resolve() {
        return await User.find();
      },
    },
    //get all blogs
    blogs: {
      type: new GraphQLList(BlogType),
      async resolve(parent, args) {
        return await Blog.find();
      },
    },
    //get all comments
    comments: {
      type: new GraphQLList(CommentType),
      async resolve(parent, args) {
        return await Comment.find();
      },
    },
    // get user by ID
    user:{
      type: UserType,
      args:{
        id :{type:new GraphQLNonNull(GraphQLID)}
      },
      async resolve(parent,{id}){
        return User.findById(id).populate("blogs")
      }
    },
    blogsByUserId: {
      type: new GraphQLList(BlogType),
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(parent, { id }) {
        return Blog.find({ user: id });
      },
    },
    //get blog by iD 
    blog:{
      type: BlogType,
      args:{
        id :{type:new GraphQLNonNull(GraphQLID)}
      },
      async resolve(parent,{id}) {
        return await Blog.findById(id).populate("comments").populate("user")
      }
    },

  },
});

//mutations
const mutations = new GraphQLObjectType({
  name: "mutations",
  fields: {
    // user signup
    signup: {
      type: UserType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, { name, email, password }) {
        let existingUser: Document<any, any, any>;
        try {
          existingUser = await User.findOne({ email });
          if (existingUser) {
            return new Error("USer Already Exits");
          }
          const encryptPassword = hashSync(password);
          const user = new User({ name, email, password: encryptPassword });
          const savedUser = await user.save();
          return savedUser;
        } catch (err) {
          return new Error("User signup failed");
        }
      },
    },
    //user login
    login: {
      type: UserType,
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, { email, password }) {
        try {
          const user = await User.findOne({ email });
          if (!user) {
            return new Error("User not found");
          }
          const isValidPassword = compareSync(password, user.password);
          if (!isValidPassword) {
            return new Error("Password Incorrect");
          } else {
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
        } catch {
          return new Error("err in signin");
        }
      },
    },
    // create blog
    addBlog: {
      type: BlogType,
      args: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: new GraphQLNonNull(GraphQLString) },
        // author: { type: new GraphQLNonNull(GraphQLString) },
        date: { type: new GraphQLNonNull(GraphQLString) },
        user: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(parent, { title, content, date, user }) {
        //async resolve(parent, args, { user })
        // if (!user) {
        //   return new Error("You must be logged in to create a blog");
        // }
        const session = await startSession();
        try {
          session.startTransaction({ session });
          const blog = new Blog({
            title,
            content,
            date,
            user,
          });
          const existingUser = await User.findById(user);
          if (!existingUser) {
            return new Error("User not found, exiting");
          }
          // session.startTransaction({session}); //moved up
          existingUser.blogs.push(blog);
          await existingUser.save({ session });
          const newBlog = await blog.save({ session });
          return newBlog;
        } catch {
          return new Error("err in creating blog");
        } finally {
          await session.commitTransaction();
        }
      },
    },
    //update Blog
    updateBlog: {
      type: BlogType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        date: { type: GraphQLString },
      },
      async resolve(parent, args) {
        //async resolve(parent, args, { user })
        // if (!user) {
        //     return new Error("You must be logged in to update a blog");
        //     }
        try {
          const blog = await Blog.findById(args.id);
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
        } catch (err) {
          return new Error("err in updating Blog");
        }
      },
    },
    // delete blog
    deleteBlog: {
      type: BlogType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
      },
      async resolve(parent, args) {
        // async resolve(parent, args, { user })
        // if (!user) {
        //     return new Error("You must be logged in to delete a blog");
        //     }
        const session = await startSession();
        try {
          session.startTransaction({ session });
          const existingBlog = await Blog.findById(args.id).populate("user");
          if (!existingBlog) {
            return new Error("Blog not found");
          }
          const existingUser = await existingBlog.user;
          if (!existingUser) {
            return new Error("User not found");
          }
          existingUser.blogs.pull(existingBlog);
          await existingUser.save({ session });
          return await Blog.findByIdAndDelete(args.id).session(session);
        } catch (err) {
          return new Error(err);
        } finally {
          await session.commitTransaction();
        }
      },
    },
    // add comments
    addComment: {
      type: CommentType,
      args: {
        text: { type: new GraphQLNonNull(GraphQLString) },
        blog: { type: new GraphQLNonNull(GraphQLID) },
        user: { type: new GraphQLNonNull(GraphQLID) },
        date: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, { text, blog, user, date }) {
        const session = await startSession();
        try {
          session.startTransaction({ session });
          const existingUser = await User.findById(user);
          if (!existingUser) {
            return new Error("User not found, exiting");
          }
          const newComment = new Comment({
            text: text,
            blog: blog,
            user: user,
            date: date,
          });

          const existingBlog = await Blog.findById(blog);
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
            { $push: { comments: savedComment._id } },
            { session }
          );
          const updatedUser = await existingBlog.updateOne(
            // {_id:user},
            { $push: { comments: savedComment._id } },
            { session }
          );

          return savedComment;
        } catch (err) {
          return new Error(err);
        } finally {
          await session.commitTransaction();
        }
      },
    },
    //delete comment
    deleteComment: {
      type: CommentType,
      args: {
        id: { type: GraphQLID },
      },
      resolve: async (parent, { id }) => {
        const session = await startSession();
        try {
          session.startTransaction({ session });
          const comment = await Comment.findById(id);
          if (!comment) {
            return new Error("Comment not found, exiting");
          }
          const existingUser = await User.findById(comment?.user);
          if (!existingUser) {
            return new Error("user not found, exiting");
          }
          const existingBlog = await Blog.findById(comment?.blog);
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
          const deletedComment = await Comment.findByIdAndDelete(id).session(
            session
          );
          return deletedComment;
        } catch (err) {
          return new Error(err);
        } finally {
          await session.commitTransaction();
        }
      },
    },
  },
});

export default new GraphQLSchema({ query: RootQuery, mutation: mutations });
