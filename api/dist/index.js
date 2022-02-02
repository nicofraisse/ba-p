"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const main = async () => {
    const conn = await (0, typeorm_1.createConnection)({
        type: 'postgres',
        database: 'poutineworld2',
        username: 'postgres',
        password: 'postgres',
        logging: true,
        synchronize: true,
        entities: [Post_1.Post, User_1.User, Review_1.Review, Restaurant_1.Restaurant],
    });
    const app = (0, express_1.default)();
    const RedisStore = (0, connect_redis_1.default)(express_session_1.default);
    const redis = new ioredis_1.default();
    app.use((0, cors_1.default)({
        origin: 'http://localhost:3000',
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
        secret: 'qls3sdu93m4cyt09wqy0lq4us0ql9rs08qy34097qxy8ae',
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
    app.listen(4000, () => {
        console.log('Server started on localhost:4000');
    });
};
main().catch((e) => console.log(e));
//# sourceMappingURL=index.js.map