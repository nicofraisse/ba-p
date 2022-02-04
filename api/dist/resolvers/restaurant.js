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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantResolver = void 0;
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Restaurant_1 = require("../entities/Restaurant");
const Review_1 = require("../entities/Review");
const isAuth_1 = require("./../middleware/isAuth");
let PaginatedRestaurants = class PaginatedRestaurants {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Restaurant_1.Restaurant]),
    __metadata("design:type", Array)
], PaginatedRestaurants.prototype, "restaurants", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PaginatedRestaurants.prototype, "hasMore", void 0);
PaginatedRestaurants = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedRestaurants);
let RestaurantResolver = class RestaurantResolver {
    async restaurants(limit, cursor) {
        const realLimit = Math.min(limit, 50);
        const realLimitPlusOne = realLimit + 1;
        const query = (0, typeorm_1.getConnection)()
            .getRepository(Restaurant_1.Restaurant)
            .createQueryBuilder('r')
            .orderBy('"createdAt"', 'DESC')
            .take(realLimitPlusOne);
        if (cursor) {
            query.where('"createdAt" < :cursor', {
                cursor: new Date(parseInt(cursor)),
            });
        }
        const restaurants = await query.getMany();
        return {
            hasMore: restaurants.length === realLimitPlusOne,
            restaurants: restaurants.slice(0, realLimit),
        };
    }
    restaurant(id) {
        return Restaurant_1.Restaurant.findOne({ id });
    }
    async createRestaurant(name) {
        const restaurant = Restaurant_1.Restaurant.create({ name }).save();
        return restaurant;
    }
    async reviewCount(restaurant) {
        const restaurantReviews = await Review_1.Review.find({
            where: { restaurantId: restaurant.id },
        });
        if (!restaurantReviews) {
            return 0;
        }
        return restaurantReviews.length;
    }
    async averageRating(restaurant) {
        let { avg } = await (0, typeorm_1.getConnection)()
            .getRepository(Review_1.Review)
            .createQueryBuilder('r')
            .select('AVG(r.rating)', 'avg')
            .where('"restaurantId" = :id', { id: `${restaurant.id}` })
            .getRawOne();
        return avg || 0;
    }
    async alreadyRated({ req }, restaurant) {
        console.log('there is', req.session);
        if (!req.session.userId) {
            return false;
        }
        const review = await Review_1.Review.findOne({
            where: {
                userId: req.session.userId,
                restaurantId: restaurant.id,
            },
        });
        console.log('yoo', review);
        return !!review;
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => PaginatedRestaurants),
    __param(0, (0, type_graphql_1.Arg)('limit', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('cursor', () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "restaurants", null);
__decorate([
    (0, type_graphql_1.Query)(() => Restaurant_1.Restaurant, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "restaurant", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Restaurant_1.Restaurant),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "createRestaurant", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => type_graphql_1.Int, { nullable: true }),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Restaurant_1.Restaurant]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "reviewCount", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => type_graphql_1.Float, { nullable: true }),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Restaurant_1.Restaurant]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "averageRating", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Restaurant_1.Restaurant]),
    __metadata("design:returntype", Promise)
], RestaurantResolver.prototype, "alreadyRated", null);
RestaurantResolver = __decorate([
    (0, type_graphql_1.Resolver)(Restaurant_1.Restaurant)
], RestaurantResolver);
exports.RestaurantResolver = RestaurantResolver;
//# sourceMappingURL=restaurant.js.map