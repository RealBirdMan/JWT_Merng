"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolvers = void 0;
const type_graphql_1 = require("type-graphql");
const bcryptjs_1 = require("bcryptjs");
const User_1 = require("../entity/User");
const auth_1 = require("../auth");
const isAuthMiddleware_1 = require("../isAuthMiddleware");
const sendRefreshToken_1 = require("../sendRefreshToken");
let LoginResponse = class LoginResponse {
};
__decorate([
    type_graphql_1.Field(),
    __metadata("design:type", String)
], LoginResponse.prototype, "accessToken", void 0);
LoginResponse = __decorate([
    type_graphql_1.ObjectType()
], LoginResponse);
let UserResolvers = class UserResolvers {
    protectedRoute({ payload }) {
        return `Im a protected Route, your userId: ${payload.userId}`;
    }
    users() {
        return User_1.User.find();
    }
    register(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashedPw = yield bcryptjs_1.hash(password, 12);
            try {
                yield User_1.User.insert({ email, password: hashedPw });
            }
            catch (err) {
                return false;
            }
            return true;
        });
    }
    login(email, password, { res }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({ where: { email } });
            if (!user) {
                throw new Error("could not find user");
            }
            const valid = yield bcryptjs_1.compare(password, user.password);
            if (!valid) {
                throw new Error("bad Password");
            }
            sendRefreshToken_1.sendRefreshToken(res, auth_1.createRefreshToken(user));
            return auth_1.createAccessToken(user);
        });
    }
};
__decorate([
    type_graphql_1.Query(() => String),
    type_graphql_1.UseMiddleware(isAuthMiddleware_1.isAuth),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolvers.prototype, "protectedRoute", null);
__decorate([
    type_graphql_1.Query(() => [User_1.User]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserResolvers.prototype, "users", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Arg("email")),
    __param(1, type_graphql_1.Arg("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserResolvers.prototype, "register", null);
__decorate([
    type_graphql_1.Mutation(() => LoginResponse),
    __param(0, type_graphql_1.Arg("email")),
    __param(1, type_graphql_1.Arg("password")),
    __param(2, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolvers.prototype, "login", null);
UserResolvers = __decorate([
    type_graphql_1.Resolver()
], UserResolvers);
exports.UserResolvers = UserResolvers;
//# sourceMappingURL=UserResolvers.js.map