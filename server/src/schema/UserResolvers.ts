import {Resolver, Query, Mutation, Arg, ObjectType, Field, Ctx, UseMiddleware} from 'type-graphql';
import {hash, compare} from 'bcryptjs';

import {User} from '../entity/User'
import { MyContext } from 'src/MyContext';
import { createAccessToken, createRefreshToken } from '../auth';
import { isAuth } from '../isAuthMiddleware';

@ObjectType()
class LoginResponse{
    @Field()
    accessToken: string;
}

@Resolver()
export class UserResolvers {
    @Query(() => String)
    @UseMiddleware(isAuth)
    protectedRoute(
        @Ctx() {payload}: MyContext
    ){
        return `Im a protected Route, your userId: ${payload!.userId}`
    }

    @Query(() => [User])
    users() {
        return User.find();
    }

    @Mutation(() => Boolean)
    async register(
        @Arg("email") email: string,
        @Arg("password") password: string,
    ){

        const hashedPw = await hash(password, 12);
        try {
            await User.insert({email, password: hashedPw})
        }catch(err){
            return false;
        }
        return true;
    }

    @Mutation(() => LoginResponse)
    async login(
        @Arg("email") email: string,
        @Arg("password") password: string,
        @Ctx() {res}: MyContext
    ): Promise<LoginResponse> {
        const user = await User.findOne({where: {email}});
        if(!user){
            throw new Error("could not find user")
        }

        const valid = await compare(password, user.password);
        if(!valid){
            throw new Error("bad Password")
        }

        //refresh
        res.cookie(
            "jid",
            createRefreshToken(user),
        {
            httpOnly: true
        }
        )

        return createAccessToken(user);
    }
}