import "reflect-metadata";
import "dotenv/config";
import express from "express";
import {ApolloServer} from "apollo-server-express";
import {buildSchema} from "type-graphql";
import {createConnection} from "typeorm";
import cookieParser from "cookie-parser";
import { verify } from "jsonwebtoken";

import {User} from "./entity/User"
import {UserResolvers} from "./schema/UserResolvers"
import { createAccessToken, createRefreshToken} from "./auth";
import {sendRefreshToken} from "./sendRefreshToken"




(async () => {
    //initialize express
    const app = express();

    //Middlewares
    app.use(cookieParser())
    app.post("/refresh_token", async (req, res) => {
        const token = req.cookies.jid;
        if(!token){
            return res.send({ok: false, accessToken: ""})
        }
        
        let payload: any;
        try {
             payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
        } catch (err) {
            return res.send({ok: false, accessToken: ""})
        }
        const user = await User.findOne({id: payload.userId})
        if(!user){
            return res.send({ok: false, accessToken: ""})
        }

        if(user.tokenVersion !== payload.tokenVersion) {
            return res.send({ok: false, accessToken: ""})
        }

        //refresh Token
        sendRefreshToken(res, createRefreshToken(user))

        return res.send({ok: true, accessToken: createAccessToken(user)})
    })

    // //setup TypeOrm Connection
    await createConnection();


    //setup graphQl apollo
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolvers],
            validate: false,
        }),
        context: ({req, res}) => ({req, res}) 
    });
    apolloServer.applyMiddleware({app});

    //listen to port
    app.listen(8080, () => {
        console.log("server started");
    })
})()

//createConnection().then(async connection => {
//
//    console.log("Inserting a new user into the database...");
//    const user = new User();
//    user.email = "Timber";
//    user.password = "Saw";
//    await connection.manager.save(user);
//    console.log("Saved a new user with id: " + user.id);
//
//    console.log("Loading users from the database...");
//    const users = await connection.manager.find(User);
//    console.log("Loaded users: ", users);
//
//    console.log("Here you can setup and run express/koa/any other framework.");
//
//}).catch(error => console.log(error));
