import {Resolver, Query, Mutation, Arg} from 'type-graphql';
import {hash} from 'bcryptjs';

import {User} from '../entity/User'

@Resolver()
export class UserResolvers {
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
}