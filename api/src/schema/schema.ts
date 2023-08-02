import {
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList
} from "graphql";
import { resolve } from "path";
import Blog from "../models/Blog";
import Comment from "../models/Comment";
import User from "../models/User";

export const UserType = new GraphQLObjectType({
  name: "UserType",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    blogs: { 
      type: new GraphQLList(BlogType),
      async resolve(parent){
        return await Blog.find({user:parent.id});
      }
     },
     comments: {  //maybe not needed
      type: new GraphQLList(CommentType),
      async resolve(parent){
        return await Comment.find({user:parent.id});
      }
     },
  }),
});

export const BlogType = new GraphQLObjectType({
  name: "BlogType",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    date: { type: new GraphQLNonNull(GraphQLString) },
    user: { 
      type: UserType,
      async resolve(parent){
        return await User.findById(parent.user);
      }
     },
     comments: { 
      type: new GraphQLList(CommentType),
      async resolve(parent){
        return await Comment.find({blog:parent.id});
      }
     },
  }),
});
export const CommentType = new GraphQLObjectType({
  name: "CommentType",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    text: { type: new GraphQLNonNull(GraphQLString) },
    // user:{type:GraphQLNonNull(GraphQLString)},
    // blog:{type:GraphQLNonNull(GraphQLString)},
    blog: { 
      type: BlogType,
      async resolve(parent){
        return await Blog.findById(parent.blog);
      }
     },
     user: { 
      type: UserType,
      async resolve(parent){
        return await User.findById(parent.user);
      }
     },
  }),
});
