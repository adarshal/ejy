import express from "express"
import {config } from "dotenv"
import { connectToDB } from "./utils/connection";
import schema from "./handlers/handlers";
import cors from 'cors'

const { graphqlHTTP }=require('express-graphql');
//dotnet config
config();


const app=express()
app.use(cors())
app.use("/graphql", graphqlHTTP({schema:schema, graphiql:true}))

connectToDB()
  .then(()=>{
    app.listen(process.env.PORT,()=>  
        console.log("Server running on port " + process.env.PORT)  
    );
})
.catch((err) => console.log(err));





  