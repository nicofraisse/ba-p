"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Upvote_1 = require("./entities/Upvote");
const review_1 = require("./resolvers/review");
const Review_1 = require("./entities/Review");
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
const user_1 = require("./resolvers/user");
const restaurant_1 = require("./resolvers/restaurant");
const post_1 = require("./resolvers/post");
const apollo_server_express_1 = require("apollo-server-express");
const express_1 = __importDefault(require("express"));
const type_graphql_1 = require("type-graphql");
require("reflect-metadata");
const cors_1 = __importDefault(require("cors"));
const ioredis_1 = __importDefault(require("ioredis"));
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const constants_1 = require("./constants");
const apollo_server_core_1 = require("apollo-server-core");
const typeorm_1 = require("typeorm");
const Restaurant_1 = require("./entities/Restaurant");
require("dotenv-safe/config");
const main = async () => {
    const conn = await (0, typeorm_1.createConnection)({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        logging: true,
        entities: [Post_1.Post, User_1.User, Review_1.Review, Restaurant_1.Restaurant, Upvote_1.Upvote],
    });
    await conn.runMigrations();
    const app = (0, express_1.default)();
    const RedisStore = (0, connect_redis_1.default)(express_session_1.default);
    const redis = new ioredis_1.default(process.env.REDIS_URL);
    app.set('proxy', 1);
    app.use((0, cors_1.default)({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }));
    app.use((0, express_session_1.default)({
        name: 'qid',
        store: new RedisStore({ client: redis, disableTouch: true }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            secure: constants_1.__prod__,
            sameSite: 'lax',
        },
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET,
        resave: false,
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [
                post_1.PostResolver,
                restaurant_1.RestaurantResolver,
                user_1.UserResolver,
                review_1.ReviewResolver,
            ],
            validate: false,
        }),
        context: ({ req, res }) => ({ req, res, redis }),
        plugins: [(0, apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground)()],
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });
    app.listen(parseInt(process.env.PORT), () => {
        console.log(`Server started on localhost:${process.env.PORT}`);
    });
};
main().catch((e) => console.log(e));
//# sourceMappingURL=index.js.map