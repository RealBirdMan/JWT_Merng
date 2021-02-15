import { Middleware } from "type-graphql/dist/interfaces/Middleware"
import {verify} from "jsonwebtoken"

import { MyContext } from "./MyContext"

export const isAuth: Middleware<MyContext> = ({context}, next) => {
    const authorization = context.req.headers["authorization"];

    if(!authorization){
        throw new Error("not authenticated");
    }

    try{
        const token = authorization.split(" ")[1];
        const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);
        context.payload = payload as any;
    }catch(err){
         throw new Error("not authenticated");
    }
    return next()
}